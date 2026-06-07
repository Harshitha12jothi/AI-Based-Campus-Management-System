// ============================================================
// ATTENDANCE FIXES FOR server.js
// Copy these 3 routes into your server.js, replacing the old ones
// ============================================================

// ─────────────────────────────────────────────────────────────
// FIX 1: GET /api/students  — Case-insensitive department filter
// REPLACE your existing GET /api/students with this
// ─────────────────────────────────────────────────────────────
app.get('/api/students', protect, async (req, res) => {
  try {
    const { department, semester, search } = req.query;
    const q = {};

    if (department) {
      // ✅ FIX: case-insensitive regex so "Computer Science" matches "computer science"
      q.department = { $regex: new RegExp(`^${department.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    }
    if (semester) {
      q.semester = { $regex: new RegExp(`^${semester.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    }
    if (search) {
      q.$or = [
        { firstName:  { $regex: search, $options: 'i' } },
        { lastName:   { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(q).sort({ rollNumber: 1 });
    res.json(students);
  } catch (e) { res.status(500).json({ message: e.message }); }
});


// ─────────────────────────────────────────────────────────────
// FIX 2: POST /api/attendance  — Upsert + recalculate percentage
// REPLACE your existing POST /api/attendance with this
// ─────────────────────────────────────────────────────────────
app.post('/api/attendance', protect, async (req, res) => {
  try {
    // Accept both array and single object
    const records = Array.isArray(req.body) ? req.body : [req.body];

    if (!records.length) {
      return res.status(400).json({ message: 'No attendance records provided.' });
    }

    // Validate all records have studentId
    const missing = records.filter(r => !r.studentId);
    if (missing.length > 0) {
      return res.status(400).json({ message: `${missing.length} records missing studentId.` });
    }

    const updatedStudentIds = new Set();

    for (const r of records) {
      // ✅ FIX: upsert so duplicate submissions don't create duplicate records
      await Attendance.findOneAndUpdate(
        {
          student: r.studentId,
          subject: r.subject,
          date:    new Date(r.date),
        },
        {
          $set: {
            student:    r.studentId,
            subject:    r.subject,
            date:       new Date(r.date),
            status:     r.status || 'present',
            department: r.department,
            semester:   r.semester,
            markedBy:   req.user._id,
          },
        },
        { upsert: true, new: true }
      );
      updatedStudentIds.add(r.studentId.toString());
    }

    // ✅ FIX: recalculate attendance % for every affected student
    for (const studentId of updatedStudentIds) {
      const total   = await Attendance.countDocuments({ student: studentId });
      const present = await Attendance.countDocuments({ student: studentId, status: 'present' });
      const pct     = total > 0 ? Math.round((present / total) * 100) : 0;
      await Student.findByIdAndUpdate(studentId, { attendance: pct });
    }

    res.status(201).json({
      message:  `Attendance saved for ${records.length} students.`,
      students: updatedStudentIds.size,
    });
  } catch (e) {
    console.error('Attendance POST error:', e);
    res.status(400).json({ message: e.message });
  }
});


// ─────────────────────────────────────────────────────────────
// FIX 3: GET /api/attendance/student/:rollNumber  — NEW ROUTE
// ADD this route (it didn't exist, causing 404 on student dashboard)
// IMPORTANT: place this BEFORE any existing /api/attendance routes
// ─────────────────────────────────────────────────────────────
app.get('/api/attendance/student/:rollNumber', protect, async (req, res) => {
  try {
    const { rollNumber } = req.params;

    // Find the student by rollNumber
    const student = await Student.findOne({
      rollNumber: { $regex: new RegExp(`^${rollNumber}$`, 'i') }
    });

    if (!student) {
      return res.status(404).json({ message: `Student with roll number "${rollNumber}" not found.` });
    }

    const records = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .limit(200);

    const total   = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent  = records.filter(r => r.status === 'absent').length;
    const late    = records.filter(r => r.status === 'late').length;
    const pct     = total > 0 ? Math.round((present / total) * 100) : 0;

    // Update student attendance field while we're here
    await Student.findByIdAndUpdate(student._id, { attendance: pct });

    res.json({
      summary: {
        total,
        present,
        absent,
        late,
        percentage: pct,
      },
      records: records.map(r => ({
        date:    r.date ? r.date.toISOString().split('T')[0] : '',
        subject: r.subject,
        status:  r.status,
        remarks: r.remarks || '',
      })),
    });
  } catch (e) {
    console.error('Attendance GET student error:', e);
    res.status(500).json({ message: e.message });
  }
});


// ─────────────────────────────────────────────────────────────
// FIX 4: GET /api/dashboard/student/:rollNumber — NEW ROUTE
// ADD this if it doesn't exist (student dashboard overview tab)
// ─────────────────────────────────────────────────────────────
app.get('/api/dashboard/student/:rollNumber', protect, async (req, res) => {
  try {
    const student = await Student.findOne({
      rollNumber: { $regex: new RegExp(`^${req.params.rollNumber}$`, 'i') }
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Attendance
    const attTotal   = await Attendance.countDocuments({ student: student._id });
    const attPresent = await Attendance.countDocuments({ student: student._id, status: 'present' });
    const attendancePct = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

    // Marks
    const marksRecords = await Marks.find({ student: student._id });
    let avgMarks = 0;
    if (marksRecords.length > 0) {
      const total = marksRecords.reduce((sum, m) => sum + (m.marks / (m.maxMarks || 100)) * 100, 0);
      avgMarks = Math.round(total / marksRecords.length);
    }
    const grade = avgMarks >= 90 ? 'O' : avgMarks >= 80 ? 'A+' : avgMarks >= 70 ? 'A' : avgMarks >= 60 ? 'B+' : avgMarks >= 50 ? 'B' : 'F';

    // Fees
    const feeRecords = await Fees.find({ student: student._id });
    const paidFees    = feeRecords.reduce((s, f) => s + (f.paid    || 0), 0);
    const pendingFees = feeRecords.reduce((s, f) => s + (f.balance || f.due || 0), 0);

    res.json({ attendancePct, avgMarks, grade, paidFees, pendingFees });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});


// ─────────────────────────────────────────────────────────────
// FIX 5: GET /api/marks/student/:rollNumber — NEW ROUTE
// ADD this if it doesn't exist (student marks tab)
// ─────────────────────────────────────────────────────────────
app.get('/api/marks/student/:rollNumber', protect, async (req, res) => {
  try {
    const student = await Student.findOne({
      rollNumber: { $regex: new RegExp(`^${req.params.rollNumber}$`, 'i') }
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const records = await Marks.find({ student: student._id }).sort({ subject: 1 });

    let average = 0;
    if (records.length > 0) {
      const total = records.reduce((s, r) => s + (r.marks / (r.maxMarks || 100)) * 100, 0);
      average = Math.round(total / records.length);
    }
    const grade = average >= 90 ? 'O' : average >= 80 ? 'A+' : average >= 70 ? 'A' : average >= 60 ? 'B+' : average >= 50 ? 'B' : 'F';

    res.json({
      average,
      grade,
      records: records.map(r => ({
        subject:  r.subject,
        examType: r.examType,
        marks:    r.marks,
        maxMarks: r.maxMarks || 100,
        grade:    r.grade || grade,
      })),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});


// ─────────────────────────────────────────────────────────────
// FIX 6: GET /api/fees/student/:rollNumber — NEW ROUTE
// ADD this if it doesn't exist (student fees tab)
// ─────────────────────────────────────────────────────────────
app.get('/api/fees/student/:rollNumber', protect, async (req, res) => {
  try {
    const student = await Student.findOne({
      rollNumber: { $regex: new RegExp(`^${req.params.rollNumber}$`, 'i') }
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const fees = await Fees.find({ student: student._id });

    const total   = fees.reduce((s, f) => s + (f.amount  || 0), 0);
    const paid    = fees.reduce((s, f) => s + (f.paid    || 0), 0);
    const pending = fees.reduce((s, f) => s + (f.balance || f.due || (f.amount - f.paid) || 0), 0);

    res.json({
      summary: { total, paid, pending },
      fees: fees.map(f => ({
        receiptNo:   f.receiptNo || '',
        feeType:     f.feeType || f.academicYear || 'Tuition',
        amount:      f.amount  || 0,
        paid:        f.paid    || 0,
        balance:     f.balance || f.due || (f.amount - f.paid) || 0,
        status:      f.status  || 'unpaid',
        paymentDate: f.paymentDate ? new Date(f.paymentDate).toLocaleDateString() : '',
      })),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});


// ─────────────────────────────────────────────────────────────
// FIX 7: GET /api/ai/placement/:rollNumber — NEW ROUTE
// ADD this if it doesn't exist (student placement tab)
// ─────────────────────────────────────────────────────────────
app.get('/api/ai/placement/:rollNumber', protect, async (req, res) => {
  try {
    const student = await Student.findOne({
      rollNumber: { $regex: new RegExp(`^${req.params.rollNumber}$`, 'i') }
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const marksRecords = await Marks.find({ student: student._id });
    let average = 0;
    if (marksRecords.length > 0) {
      const total = marksRecords.reduce((s, r) => s + (r.marks / (r.maxMarks || 100)) * 100, 0);
      average = Math.round(total / marksRecords.length);
    }

    const grade = average >= 90 ? 'O' : average >= 80 ? 'A+' : average >= 70 ? 'A' : average >= 60 ? 'B+' : average >= 50 ? 'B' : 'F';
    const eligibleForCampus = average >= 60 && (student.attendance || 0) >= 75;

    // AI-based role suggestions
    const dept = (student.department || '').toLowerCase();
    let recommendedRoles = ['Software Developer', 'Data Analyst', 'System Engineer'];
    if (dept.includes('computer') || dept.includes('information')) {
      recommendedRoles = ['Full Stack Developer', 'Backend Engineer', 'ML Engineer', 'DevOps Engineer', 'Data Scientist'];
    } else if (dept.includes('electrical') || dept.includes('electronics')) {
      recommendedRoles = ['Embedded Systems Engineer', 'VLSI Design Engineer', 'IoT Developer'];
    } else if (dept.includes('mechanical')) {
      recommendedRoles = ['Product Design Engineer', 'CAD/CAM Specialist', 'Manufacturing Engineer'];
    } else if (dept.includes('civil')) {
      recommendedRoles = ['Site Engineer', 'Structural Designer', 'Project Manager'];
    }

    res.json({ average, grade, eligibleForCampus, recommendedRoles });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Also add this Marks schema if not already present in server.js
// ─────────────────────────────────────────────────────────────
/*
const marksSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // alias
  subject:   { type: String, required: true },
  examType:  { type: String, default: 'internal1' },
  marks:     { type: Number, required: true },
  maxMarks:  { type: Number, default: 100 },
  grade:     String,
  semester:  String,
  department:String,
  createdAt: { type: Date, default: Date.now },
});
const Marks = mongoose.model('Marks', marksSchema);
*/

// POST /api/marks — used by faculty
app.post('/api/marks', protect, async (req, res) => {
  try {
    const { studentId, subject, examType, marks, maxMarks, semester, department } = req.body;

    if (!studentId || !subject || marks === undefined) {
      return res.status(400).json({ message: 'studentId, subject and marks are required.' });
    }

    const pct   = Math.round((Number(marks) / Number(maxMarks || 100)) * 100);
    const grade = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B+' : pct >= 50 ? 'B' : 'F';

    // ✅ Upsert so re-entering marks for same student/subject/examType updates instead of duplicating
    const record = await Marks.findOneAndUpdate(
      { student: studentId, subject, examType },
      { $set: { student: studentId, subject, examType, marks: Number(marks), maxMarks: Number(maxMarks || 100), grade, semester, department } },
      { upsert: true, new: true }
    );

    res.status(201).json(record);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});