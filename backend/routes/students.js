// ╔══════════════════════════════════════════════════════════════╗
// ║  BACKEND FIX — Add these routes to your server.js            ║
// ║  These routes are called by the fixed StudentDashboard.js    ║
// ╚══════════════════════════════════════════════════════════════╝

// ── ADD THESE 4 ROUTES TO YOUR server.js ────────────────────────
// Place them BEFORE the app.listen() line at the bottom


// ─── 1. GET /api/students/by-user/:userId ─────────────────────
// Called when student logs in but roll number not in localStorage
app.get('/api/students/by-user/:userId', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.params.userId })
      .populate('user', 'name email phone')
      .populate('department', 'name code');
    if (!student) return res.status(404).json({ message: 'Student not found for this user.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── 2. GET /api/students/my-profile ─────────────────────────
// Called to get logged-in student's full profile using JWT token
app.get('/api/students/my-profile', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('user', 'name email phone department')
      .populate('department', 'name code');
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    // Return a merged object with user fields + student fields
    const result = {
      ...student.toObject(),
      name:       student.user?.name,
      email:      student.user?.email,
      phone:      student.user?.phone,
      department: student.department?.code || student.departmentCode,
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── 3. FIX /api/attendance/student/:roll ─────────────────────
// Now accepts ROLL NUMBER (not ObjectId) — matches what frontend sends
// REPLACE the existing attendance student route with this one

app.get('/api/attendance/student/:roll', protect, async (req, res) => {
  try {
    const roll = req.params.roll;

    // Find student by roll number
    const student = await Student.findOne({ rollNumber: roll });

    // If not found by roll, try as ObjectId (backward compat)
    let studentId = student?._id;
    if (!studentId && roll.match(/^[a-f\d]{24}$/i)) {
      studentId = roll; // it's already an ObjectId
    }
    if (!studentId) {
      return res.json({ records: [], total: 0, present: 0, absent: 0, late: 0, percentage: 0 });
    }

    const records = await Attendance.find({ student: studentId })
      .populate('subject', 'name code')
      .sort('-date');

    const total   = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent  = records.filter(r => r.status === 'Absent').length;
    const late    = records.filter(r => r.status === 'Late').length;
    const pct     = total ? ((present / total) * 100).toFixed(1) : 0;

    res.json({
      records: records.map(r => ({
        date:    r.date,
        subject: r.subject?.name || r.subjectCode || '—',
        status:  r.status,
        remarks: r.remarks || '',
      })),
      summary: {
        total,
        present,
        absent,
        late,
        percentage: parseFloat(pct),
      },
      // also send flat fields for backward compat
      total, present, absent, late, percentage: parseFloat(pct),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── 4. FIX /api/marks/student/:roll ─────────────────────────
// Now accepts ROLL NUMBER — matches what frontend sends

app.get('/api/marks/student/:roll', protect, async (req, res) => {
  try {
    const roll = req.params.roll;

    // Find student by roll number
    const student = await Student.findOne({ rollNumber: roll });
    let studentId = student?._id;
    if (!studentId && roll.match(/^[a-f\d]{24}$/i)) {
      studentId = roll;
    }
    if (!studentId) {
      return res.json({ marks: [], records: [], average: 0, grade: 'F', count: 0 });
    }

    const marksData = await Marks.find({ student: studentId })
      .populate({ path: 'exam', populate: { path: 'subject', select: 'name code' } })
      .populate('subject', 'name code')
      .sort('-createdAt');

    const records = marksData.map(m => ({
      subject:  m.exam?.subject?.name || m.subject?.name || '—',
      examType: m.exam?.type || 'Exam',
      marks:    m.marks,
      maxMarks: m.maxMarks || 100,
      grade:    m.grade,
      percentage: m.percentage,
    }));

    const avg = records.length
      ? Math.round(records.reduce((s, r) => s + (r.marks / r.maxMarks) * 100, 0) / records.length)
      : 0;

    const getGrade = (p) => {
      if (p >= 90) return 'O'; if (p >= 80) return 'A+'; if (p >= 70) return 'A';
      if (p >= 60) return 'B+'; if (p >= 50) return 'B'; if (p >= 40) return 'C'; return 'F';
    };

    res.json({ marks: records, records, average: avg, grade: getGrade(avg), count: records.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── 5. FIX /api/fees/student/:roll ──────────────────────────
// Now accepts ROLL NUMBER — matches what frontend sends

app.get('/api/fees/student/:roll', protect, async (req, res) => {
  try {
    const roll = req.params.roll;

    const student = await Student.findOne({ rollNumber: roll });
    let studentId = student?._id;
    if (!studentId && roll.match(/^[a-f\d]{24}$/i)) {
      studentId = roll;
    }
    if (!studentId) {
      return res.json({ fees: [], summary: { total: 0, paid: 0, pending: 0 } });
    }

    const feeData = await Fee.find({ student: studentId }).sort('-createdAt');

    const fees = feeData.map(f => ({
      receiptNo:   f.receiptNo || '—',
      feeType:     f.feeType || 'Fee',
      amount:      f.amount,
      paid:        f.status === 'Paid' ? f.amount : 0,
      balance:     f.status === 'Paid' ? 0 : f.amount,
      status:      f.status?.toLowerCase() || 'pending',
      paymentDate: f.paidDate ? new Date(f.paidDate).toLocaleDateString() : '—',
    }));

    const paid    = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
    const pending = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + f.amount, 0);

    res.json({
      fees,
      count: fees.length,
      summary: { total: paid + pending, paid, pending },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── 6. FIX /api/placements/recommend/:roll ──────────────────
// Now accepts ROLL NUMBER

app.post('/api/placements/recommend/:roll', protect, async (req, res) => {
  try {
    const roll = req.params.roll;

    const student = await Student.findOne({ rollNumber: roll }).populate('user', 'name email');
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const placements = await Placement.find({ status: 'Open' });

    const scored = placements.map(p => {
      let score = 0;
      if (student.cgpa >= p.eligibilityCGPA) score += 40;
      const studentSkills = (student.skills || []).map(s => s.toLowerCase());
      const overlap = (p.requiredSkills || []).filter(s =>
        studentSkills.includes(s.toLowerCase())
      ).length;
      score += overlap * 15;
      if (!p.eligibleDepts?.length || p.eligibleDepts.includes(student.departmentCode)) score += 10;
      return { ...p.toObject(), score, matchPercent: Math.min(score, 100) };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

    res.json({
      student: {
        name:       student.user?.name,
        rollNumber: student.rollNumber,
        cgpa:       student.cgpa,
        skills:     student.skills,
      },
      recommendations: scored,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── 7. ALSO FIX AUTH /api/auth/me ────────────────────────────
// Make sure it returns rollNumber for students
// REPLACE your existing /api/auth/me with this:

app.get('/api/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // For students, attach roll number from Student collection
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id })
        .populate('department', 'name code');
      if (student) {
        return res.json({
          ...user.toObject(),
          rollNumber:  student.rollNumber,
          roll:        student.rollNumber,
          studentId:   student._id,
          cgpa:        student.cgpa,
          skills:      student.skills,
          year:        student.year,
          section:     student.section,
          semester:    student.semester,
          department:  student.department?.code || user.department,
        });
      }
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});