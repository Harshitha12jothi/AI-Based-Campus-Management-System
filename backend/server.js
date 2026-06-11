// ╔══════════════════════════════════════════════════════════════╗
// ║         EduAI Campus — COMPLETE server.js                    ║
// ║         Fixed: MongoDB Atlas, all routes, GROQ AI            ║
// ╚══════════════════════════════════════════════════════════════╝

const express  = require('express');
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');
const fs       = require('fs');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;


// ── Ensure DB connected on every request ─────────────────────
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      });
    } catch (err) {
      console.error('DB connect error:', err.message);
    }
  }
  next();
});
// ── MIDDLEWARE ────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'uploads');
try {
 try { if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true }); } catch(e) { console.log('uploads skipped'); }
} catch (e) {
  console.log('uploads dir skipped (read-only fs)');
}
app.use('/uploads', express.static(uploadDir));

// ══════════════════════════════════════════════════════════════
//  SECTION 1 — MONGOOSE SCHEMAS & MODELS
// ══════════════════════════════════════════════════════════════

// ── User ──────────────────────────────────────────────────────
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName:  { type: String, trim: true },
  lastName:   { type: String, trim: true },
  name:       { type: String, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['admin','faculty','student','parent'], default: 'student' },
  phone:      String,
  department: String,
  rollNumber: String,
  year:       String,
  semester:   String,
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
UserSchema.methods.matchPassword = function(pw) {
  return bcrypt.compare(pw, this.password);
};

// ── Student ───────────────────────────────────────────────────
const StudentSchema = new mongoose.Schema({
  rollNumber:  { type: String, unique: true, sparse: true },
  firstName:   String,
  lastName:    String,
  email:       { type: String, lowercase: true },
  phone:       String,
  department:  String,
  year:        String,
  semester:    String,
  section:     String,
  dob:         String,
  gender:      String,
  city:        String,
  parentName:  String,
  parentPhone: String,
  bloodGroup:  String,
  cgpa:        { type: Number, default: 0 },
  skills:      [String],
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ── Faculty ───────────────────────────────────────────────────
const FacultySchema = new mongoose.Schema({
  employeeId:    { type: String, unique: true, sparse: true },
  firstName:     String,
  lastName:      String,
  email:         { type: String, lowercase: true },
  phone:         String,
  department:    String,
  designation:   String,
  joiningDate:   String,
  gender:        String,
  qualification: String,
  subjectsTaught:String,
  city:          String,
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ── Attendance ────────────────────────────────────────────────
const AttendanceSchema = new mongoose.Schema({
  rollNumber:   String,
  studentName:  String,
  department:   String,
  year:         String,
  subject:      String,
  date:         String,
  status:       { type: String, enum: ['present','absent','Present','Absent','Late'], default: 'present' },
  facultyId:    String,
  remarks:      String,
}, { timestamps: true });

// ── Marks ─────────────────────────────────────────────────────
const MarksSchema = new mongoose.Schema({
  rollNumber:    String,
  studentName:   String,
  department:    String,
  year:          String,
  subject:       String,
  examType:      String,
  maxMarks:      { type: Number, default: 100 },
  marksObtained: { type: Number, default: 0 },
  grade:         String,
  facultyId:     String,
  date:          String,
}, { timestamps: true });

// ── Fees ──────────────────────────────────────────────────────
const FeesSchema = new mongoose.Schema({
  rollNumber:   String,
  studentName:  String,
  department:   String,
  year:         String,
  feeType:      String,
  amount:       { type: Number, default: 0 },
  paid:         { type: Number, default: 0 },
  balance:      { type: Number, default: 0 },
  paymentDate:  String,
  paymentMode:  String,
  receiptNo:    String,
  status:       { type: String, enum: ['paid','pending','partial','Paid','Pending'], default: 'pending' },
}, { timestamps: true });

// ── Timetable ─────────────────────────────────────────────────
const TimetableSchema = new mongoose.Schema({
  department: String,
  year:       String,
  day:        String,
  period1:    String, period2: String, period3: String,
  period4:    String, period5: String, period6: String, period7: String,
}, { timestamps: true });

// ── Notice ────────────────────────────────────────────────────
const NoticeSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  content:    String,
  message:    String,
  type:       { type: String, default: 'General' },
  targetRole: { type: String, default: 'all' },
  postedBy:   String,
  date:       { type: Date, default: Date.now },
}, { timestamps: true });

// ── Parent ────────────────────────────────────────────────────
const ParentSchema = new mongoose.Schema({
  firstName:   String,
  lastName:    String,
  email:       { type: String, lowercase: true },
  phone:       String,
  relation:    String,
  childRollNo: String,
  childName:   String,
  department:  String,
  city:        String,
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ── Placement ─────────────────────────────────────────────────
const PlacementSchema = new mongoose.Schema({
  title:           String,
  company:         String,
  type:            { type: String, default: 'Job' },
  description:     String,
  location:        String,
  salary:          String,
  eligibilityCGPA: { type: Number, default: 6.0 },
  eligibleDepts:   [String],
  requiredSkills:  [String],
  applyLink:       String,
  deadline:        Date,
  status:          { type: String, default: 'Open' },
}, { timestamps: true });

// ── Chat Log ──────────────────────────────────────────────────
const ChatSchema = new mongoose.Schema({
  userId:   String,
  messages: [{
    role:    String,
    content: String,
    time:    { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// ── REGISTER ALL MODELS SAFELY ────────────────────────────────
const User       = mongoose.models.User       || mongoose.model('User',       UserSchema);
const Student    = mongoose.models.Student    || mongoose.model('Student',    StudentSchema);
const Faculty    = mongoose.models.Faculty    || mongoose.model('Faculty',    FacultySchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
const Marks      = mongoose.models.Marks      || mongoose.model('Marks',      MarksSchema);
const Fees       = mongoose.models.Fees       || mongoose.model('Fees',       FeesSchema);
const Timetable  = mongoose.models.Timetable  || mongoose.model('Timetable',  TimetableSchema);
const Notice     = mongoose.models.Notice     || mongoose.model('Notice',     NoticeSchema);
const Parent     = mongoose.models.Parent     || mongoose.model('Parent',     ParentSchema);
const Placement  = mongoose.models.Placement  || mongoose.model('Placement',  PlacementSchema);
const Chat       = mongoose.models.Chat       || mongoose.model('Chat',       ChatSchema);

// ══════════════════════════════════════════════════════════════
//  SECTION 2 — HELPERS & MIDDLEWARE
// ══════════════════════════════════════════════════════════════

const JWT_SECRET = process.env.JWT_SECRET || 'eduai_campus_secret_2025';

const generateToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role,
    name: user.name || `${user.firstName} ${user.lastName}`.trim(),
    rollNumber: user.rollNumber },
  JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || '7d' }
);

const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized — no token' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token expired or invalid — please login again' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Access denied. Required: ${roles.join(' or ')}` });
  next();
};

const calcGrade = (marks, max = 100) => {
  const p = (marks / max) * 100;
  if (p >= 90) return 'O';  if (p >= 80) return 'A+'; if (p >= 70) return 'A';
  if (p >= 60) return 'B+'; if (p >= 50) return 'B';  if (p >= 40) return 'C';
  return 'F';
};

// ══════════════════════════════════════════════════════════════
//  SECTION 3 — ALL ROUTES (inline — no separate files needed)
// ══════════════════════════════════════════════════════════════

// ── HEALTH ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 EduAI Campus Backend is Running',
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()) + 's',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ══════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      firstName, lastName, name, email, password, role,
      phone, department, rollNumber, year, semester,
      // faculty
      employeeId, designation, qualification,
      // parent
      childRollNo, relation,
      // admin
      adminCode,
    } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered. Please login.' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    if (role === 'admin') {
      const secret = process.env.ADMIN_SECRET || 'ADMIN-SECRET-2025';
      if (adminCode !== secret)
        return res.status(403).json({ message: 'Invalid admin secret code.' });
    }

    const displayName = name || `${firstName || ''} ${lastName || ''}`.trim();

    const user = await User.create({
      firstName, lastName, name: displayName,
      email, password, role: role || 'student',
      phone, department, rollNumber, year, semester,
    });

    // Create role-specific profile
    if (role === 'student' || !role) {
      if (rollNumber) {
        const rollExists = await Student.findOne({ rollNumber });
        if (!rollExists) {
          await Student.create({
            rollNumber, firstName, lastName,
            email, phone, department, year, semester,
            userId: user._id,
          });
        }
      }
    } else if (role === 'faculty') {
      if (employeeId) {
        const empExists = await Faculty.findOne({ employeeId });
        if (!empExists) {
          await Faculty.create({
            employeeId, firstName, lastName,
            email, phone, department, designation, qualification,
            userId: user._id,
          });
        }
      }
    } else if (role === 'parent') {
      await Parent.create({
        firstName, lastName, email, phone,
        relation, childRollNo, department,
        userId: user._id,
      });
    }

    const token = generateToken(user);
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id, name: displayName,
        email: user.email, role: user.role,
        rollNumber: user.rollNumber,
        department: user.department,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'No account found with this email.' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated. Contact admin.' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Incorrect password.' });

    // For students — get roll number from Student collection
    let rollNumber = user.rollNumber;
    if (user.role === 'student' && !rollNumber) {
      const student = await Student.findOne({ userId: user._id });
      if (student) rollNumber = student.rollNumber;
    }

    const token = generateToken({ ...user.toObject(), rollNumber });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id:         user._id,
        name:       user.name || `${user.firstName} ${user.lastName}`.trim(),
        firstName:  user.firstName,
        lastName:   user.lastName,
        email:      user.email,
        role:       user.role,
        rollNumber: rollNumber || '',
        department: user.department || '',
        year:       user.year || '',
        semester:   user.semester || '',
        phone:      user.phone || '',
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let extra = {};
    if (user.role === 'student') {
      const stu = await Student.findOne({ $or: [{ userId: user._id }, { email: user.email }] });
      if (stu) extra = {
        rollNumber: stu.rollNumber, cgpa: stu.cgpa,
        skills: stu.skills, section: stu.section,
      };
    }
    res.json({ ...user.toObject(), ...extra });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
//  STUDENT ROUTES
// ══════════════════════════════════════════════════════════════

// GET /api/students
app.get('/api/students', protect, async (req, res) => {
  try {
    const { dept, year, search } = req.query;
    const filter = {};
    if (dept)   filter.department = dept;
    if (year)   filter.year = year;

    let students = await Student.find(filter).sort('rollNumber');

    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s =>
        s.firstName?.toLowerCase().includes(q) ||
        s.lastName?.toLowerCase().includes(q)  ||
        s.rollNumber?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    }
    res.json({ students, count: students.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/students
app.post('/api/students', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/students/by-user/:userId
app.get('/api/students/by-user/:userId', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.params.userId });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/students/my-profile
app.get('/api/students/my-profile', protect, async (req, res) => {
  try {
    const student = await Student.findOne({
      $or: [
        { userId: req.user.id },
        { email: req.user.email },
        { rollNumber: req.user.rollNumber },
      ]
    });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/students/:id
app.get('/api/students/:id', protect, async (req, res) => {
  try {
    const s = await Student.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Student not found' });
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/students/:id
app.put('/api/students/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const s = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/students/:id
app.delete('/api/students/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  ATTENDANCE ROUTES
// ══════════════════════════════════════════════════════════════

// POST /api/attendance/mark
app.post('/api/attendance/mark', protect, async (req, res) => {
  try {
    const { records, subject, date } = req.body;
    if (!records?.length) return res.status(400).json({ message: 'Records array required.' });

    let saved = 0;
    for (const r of records) {
      await Attendance.create({
        rollNumber:  r.rollNumber,
        studentName: r.studentName || '',
        department:  r.department  || '',
        year:        r.year        || '',
        subject:     subject       || r.subject || '',
        date:        date          || new Date().toISOString().split('T')[0],
        status:      r.status      || 'present',
        facultyId:   req.user.id,
        remarks:     r.remarks     || '',
      });
      saved++;
    }
    res.status(201).json({ message: `Attendance saved for ${saved} students`, count: saved });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/attendance/student/:roll  — accepts roll number OR ObjectId
app.get('/api/attendance/student/:roll', protect, async (req, res) => {
  try {
    const roll = req.params.roll;
    const records = await Attendance.find({ rollNumber: roll }).sort('-date');

    const total   = records.length;
    const present = records.filter(r => ['present','Present'].includes(r.status)).length;
    const absent  = records.filter(r => ['absent','Absent'].includes(r.status)).length;
    const late    = records.filter(r => r.status === 'Late').length;
    const pct     = total ? parseFloat(((present / total) * 100).toFixed(1)) : 0;

    res.json({
      records: records.map(r => ({
        date:    r.date,
        subject: r.subject || '—',
        status:  r.status?.toLowerCase() || 'present',
        remarks: r.remarks || '',
      })),
      summary: { total, present, absent, late, percentage: pct },
      total, present, absent, late, percentage: pct,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/attendance — all records (admin/faculty)
app.get('/api/attendance', protect, authorize('admin','faculty'), async (req, res) => {
  try {
    const { dept, date, roll } = req.query;
    const filter = {};
    if (dept) filter.department = dept;
    if (date) filter.date = date;
    if (roll) filter.rollNumber = roll;
    const records = await Attendance.find(filter).sort('-date').limit(200);
    res.json({ records, count: records.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/attendance/predict — AI: at-risk students
app.get('/api/attendance/predict', protect, authorize('admin','faculty'), async (req, res) => {
  try {
    const pipeline = [
      { $group: {
          _id:     '$rollNumber',
          total:   { $sum: 1 },
          present: { $sum: { $cond: [{ $in: ['$status', ['present','Present']] }, 1, 0] } }
      }},
      { $addFields: {
          percentage: { $cond: [{ $eq: ['$total', 0] }, 0,
            { $multiply: [{ $divide: ['$present','$total'] }, 100] }] }
      }},
      { $match: { percentage: { $lt: 80 } } },
      { $lookup: { from: 'students', localField: '_id', foreignField: 'rollNumber', as: 'student' } },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      { $project: {
          rollNumber: '$_id', total: 1, present: 1,
          percentage: { $round: ['$percentage', 1] },
          name:     { $concat: [{ $ifNull: ['$student.firstName','?'] }, ' ', { $ifNull: ['$student.lastName',''] }] },
          dept:     '$student.department',
          risk:     { $cond: [{ $lt: ['$percentage', 65] }, 'High',
                     { $cond: [{ $lt: ['$percentage', 75] }, 'Medium', 'Low'] }] }
      }},
      { $sort: { percentage: 1 } },
    ];
    const atRisk = await Attendance.aggregate(pipeline);
    res.json({ atRisk, count: atRisk.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  MARKS ROUTES
// ══════════════════════════════════════════════════════════════

// POST /api/marks
app.post('/api/marks', protect, authorize('admin','faculty'), async (req, res) => {
  try {
    const { entries } = req.body;
    if (!entries?.length) return res.status(400).json({ message: 'Entries array required.' });

    let saved = 0;
    for (const e of entries) {
      const grade = calcGrade(Number(e.marksObtained), Number(e.maxMarks) || 100);
      await Marks.create({
        rollNumber:    e.rollNumber,
        studentName:   e.studentName || '',
        department:    e.department  || '',
        year:          e.year        || '',
        subject:       e.subject     || '',
        examType:      e.examType    || 'Internal',
        maxMarks:      Number(e.maxMarks)      || 100,
        marksObtained: Number(e.marksObtained) || 0,
        grade,
        facultyId:     req.user.id,
        date:          e.date || new Date().toISOString().split('T')[0],
      });
      saved++;
    }
    res.status(201).json({ message: `Marks saved for ${saved} students`, count: saved });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/marks/student/:roll
app.get('/api/marks/student/:roll', protect, async (req, res) => {
  try {
    const records = await Marks.find({ rollNumber: req.params.roll }).sort('-date');
    const avg = records.length
      ? Math.round(records.reduce((s, r) => s + (Number(r.marksObtained) / Number(r.maxMarks || 100)) * 100, 0) / records.length)
      : 0;
    const grade = calcGrade(avg, 100);
    res.json({
      records: records.map(r => ({
        subject:  r.subject   || '—',
        examType: r.examType  || 'Exam',
        marks:    Number(r.marksObtained),
        maxMarks: Number(r.maxMarks) || 100,
        grade:    r.grade || calcGrade(Number(r.marksObtained), Number(r.maxMarks) || 100),
        date:     r.date,
      })),
      marks:   records,
      average: avg,
      grade,
      count:   records.length,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/marks/predict
app.get('/api/marks/predict', protect, authorize('admin','faculty'), async (req, res) => {
  try {
    const pipeline = [
      { $addFields: { marksNum: { $toDouble: '$marksObtained' }, maxNum: { $toDouble: '$maxMarks' } } },
      { $group: {
          _id:        '$rollNumber',
          avgMarks:   { $avg: { $multiply: [{ $divide: ['$marksNum', { $ifNull: ['$maxNum', 100] }] }, 100] } },
          examsCount: { $sum: 1 }
      }},
      { $match: { avgMarks: { $lt: 55 } } },
      { $lookup: { from: 'students', localField: '_id', foreignField: 'rollNumber', as: 'student' } },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      { $project: {
          rollNumber: '$_id', avgMarks: { $round: ['$avgMarks', 1] }, examsCount: 1,
          name: { $concat: [{ $ifNull: ['$student.firstName','?'] }, ' ', { $ifNull: ['$student.lastName',''] }] },
          dept: '$student.department',
          risk: { $cond: [{ $lt: ['$avgMarks', 40] }, 'High',
                 { $cond: [{ $lt: ['$avgMarks', 50] }, 'Medium', 'Low'] }] }
      }},
      { $sort: { avgMarks: 1 } },
    ];
    const atRisk = await Marks.aggregate(pipeline);
    res.json({ atRisk, count: atRisk.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/marks — all (admin/faculty)
app.get('/api/marks', protect, authorize('admin','faculty'), async (req, res) => {
  try {
    const { dept, subject, examType } = req.query;
    const filter = {};
    if (dept)     filter.department = dept;
    if (subject)  filter.subject    = subject;
    if (examType) filter.examType   = examType;
    const marks = await Marks.find(filter).sort('-date').limit(500);
    res.json({ marks, count: marks.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  FEES ROUTES
// ══════════════════════════════════════════════════════════════

// GET /api/fees
app.get('/api/fees', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const fees = await Fees.find(filter).sort('-createdAt');
    const paid    = fees.filter(f => ['paid','Paid'].includes(f.status)).reduce((s,f) => s + Number(f.amount), 0);
    const pending = fees.filter(f => !['paid','Paid'].includes(f.status)).reduce((s,f) => s + Number(f.amount), 0);
    res.json({ fees, count: fees.length, totalCollected: paid, totalPending: pending });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/fees/student/:roll
app.get('/api/fees/student/:roll', protect, async (req, res) => {
  try {
    const feeData = await Fees.find({ rollNumber: req.params.roll }).sort('-createdAt');
    const fees = feeData.map(f => ({
      receiptNo:   f.receiptNo   || '—',
      feeType:     f.feeType     || 'Fee',
      amount:      Number(f.amount)  || 0,
      paid:        Number(f.paid)    || 0,
      balance:     Number(f.balance) || 0,
      status:      f.status?.toLowerCase() || 'pending',
      paymentDate: f.paymentDate || '—',
    }));
    const totalPaid    = fees.filter(f => f.status === 'paid').reduce((s,f) => s + f.amount, 0);
    const totalPending = fees.filter(f => f.status !== 'paid').reduce((s,f) => s + f.balance, 0);
    res.json({
      fees,
      count: fees.length,
      summary: { total: totalPaid + totalPending, paid: totalPaid, pending: totalPending },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/fees
app.post('/api/fees', protect, authorize('admin'), async (req, res) => {
  try {
    const receiptNo = 'RCP-' + Date.now();
    const fee = await Fees.create({ ...req.body, receiptNo });
    res.status(201).json(fee);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/fees/:id/pay
app.put('/api/fees/:id/pay', protect, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fees.findByIdAndUpdate(req.params.id, {
      status: 'paid', paid: req.body.amount, balance: 0,
      paymentDate: new Date().toLocaleDateString(),
      paymentMode: req.body.paymentMode || 'Cash',
    }, { new: true });
    res.json({ message: 'Fee marked as paid.', fee });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  NOTICES ROUTES
// ══════════════════════════════════════════════════════════════

// GET /api/notices
app.get('/api/notices', async (req, res) => {
  try {
    const notices = await Notice.find().sort('-date').limit(20);
    res.json(notices);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/notifications (alias)
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const query = { $or: [{ targetRole: 'all' }, { targetRole: req.user.role }] };
    const notices = await Notice.find(query).sort('-date').limit(20);
    res.json({ notifications: notices, unreadCount: notices.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/notices
app.post('/api/notices', protect, authorize('admin','faculty'), async (req, res) => {
  try {
    const n = await Notice.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json(n);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/notifications (alias)
app.post('/api/notifications', protect, authorize('admin','faculty'), async (req, res) => {
  try {
    const n = await Notice.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json(n);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  PLACEMENT ROUTES
// ══════════════════════════════════════════════════════════════

// GET /api/placements
app.get('/api/placements', protect, async (req, res) => {
  try {
    const placements = await Placement.find({ status: 'Open' }).sort('-createdAt');
    res.json({ placements, count: placements.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/placements
app.post('/api/placements', protect, authorize('admin'), async (req, res) => {
  try {
    const p = await Placement.create(req.body);
    res.status(201).json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/ai/placement/:roll  (AI placement recommendation)
app.post('/api/ai/placement/:roll', protect, async (req, res) => {
  try {
    const roll     = req.params.roll;
    const student  = await Student.findOne({ rollNumber: roll });
    const placements = await Placement.find({ status: 'Open' });

    const cgpa      = student?.cgpa || 6.5;
    const skills    = (student?.skills || []).map(s => s.toLowerCase());
    const dept      = student?.department || '';

    const scored = placements.map(p => {
      let score = 0;
      if (cgpa >= p.eligibilityCGPA) score += 40;
      const overlap = (p.requiredSkills || []).filter(s => skills.includes(s.toLowerCase())).length;
      score += overlap * 15;
      if (!p.eligibleDepts?.length || p.eligibleDepts.includes(dept)) score += 10;
      return { ...p.toObject(), score, matchPercent: Math.min(score, 100) };
    }).filter(p => p.score > 0).sort((a,b) => b.score - a.score).slice(0, 5);

    // Determine career roles based on skills & dept
    const roleMap = {
      python:     'Data Analyst / ML Engineer',
      react:      'Frontend Developer',
      'node.js':  'Full Stack Developer',
      java:       'Backend Engineer',
      sql:        'Database Administrator',
      ml:         'Machine Learning Engineer',
      embedded:   'Embedded Systems Engineer',
      autocad:    'CAD Designer',
      flutter:    'Mobile App Developer',
    };
    const recommendedRoles = [...new Set(
      skills.map(s => roleMap[s]).filter(Boolean)
    )].slice(0, 5);

    if (recommendedRoles.length < 3) {
      const deptRoles = {
        CSE:  ['Software Engineer','Web Developer','Cloud Engineer'],
        ECE:  ['VLSI Engineer','Network Engineer','IoT Developer'],
        MECH: ['Mechanical Design Engineer','CAD Specialist','Project Manager'],
        IT:   ['IT Consultant','System Analyst','DevOps Engineer'],
        CIVIL:['Civil Site Engineer','Structural Analyst','Urban Planner'],
      };
      const extras = deptRoles[dept] || ['Software Engineer','Data Analyst','Project Manager'];
      extras.forEach(r => { if (!recommendedRoles.includes(r)) recommendedRoles.push(r); });
    }

    res.json({
      eligibleForCampus: cgpa >= 6.0,
      average:           Math.round(cgpa * 10),
      grade:             calcGrade(cgpa * 10, 100),
      recommendedRoles:  recommendedRoles.slice(0, 5),
      recommendations:   scored,
      student: { rollNumber: roll, cgpa, skills, department: dept },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/placements/recommend/:roll (alias used by some frontends)
app.post('/api/placements/recommend/:roll', protect, async (req, res) => {
  req.params.roll = req.params.roll;
  // Reuse above logic
  try {
    const roll       = req.params.roll;
    const student    = await Student.findOne({ rollNumber: roll });
    const placements = await Placement.find({ status: 'Open' });
    const cgpa   = student?.cgpa || 6.5;
    const skills = (student?.skills || []).map(s => s.toLowerCase());
    const dept   = student?.department || '';

    const scored = placements.map(p => {
      let score = 0;
      if (cgpa >= p.eligibilityCGPA) score += 40;
      const overlap = (p.requiredSkills || []).filter(s => skills.includes(s.toLowerCase())).length;
      score += overlap * 15;
      if (!p.eligibleDepts?.length || p.eligibleDepts.includes(dept)) score += 10;
      return { ...p.toObject(), score, matchPercent: Math.min(score, 100) };
    }).filter(p => p.score > 0).sort((a,b) => b.score - a.score).slice(0, 5);

    res.json({
      eligibleForCampus: cgpa >= 6.0,
      average:    Math.round(cgpa * 10),
      grade:      calcGrade(cgpa * 10, 100),
      recommendations: scored,
      student: { rollNumber: roll, cgpa, skills },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  TIMETABLE ROUTES
// ══════════════════════════════════════════════════════════════

// GET /api/timetable
app.get('/api/timetable', protect, async (req, res) => {
  try {
    const { dept, year } = req.query;
    const filter = {};
    if (dept) filter.department = dept;
    if (year) filter.year = year;
    const tt = await Timetable.find(filter).sort('day');
    res.json(tt);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/timetable
app.post('/api/timetable', protect, authorize('admin'), async (req, res) => {
  try {
    const entry = await Timetable.create(req.body);
    res.status(201).json(entry);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  FACULTY ROUTES
// ══════════════════════════════════════════════════════════════

app.get('/api/faculty', protect, async (req, res) => {
  try {
    const faculty = await Faculty.find().sort('employeeId');
    res.json({ faculty, count: faculty.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/faculty', protect, authorize('admin'), async (req, res) => {
  try {
    const f = await Faculty.create(req.body);
    res.status(201).json(f);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  DASHBOARD ROUTES
// ══════════════════════════════════════════════════════════════

// GET /api/dashboard  (admin overview)
app.get('/api/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const [students, faculty, placements, paidFees, pendingFees, notices] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Placement.countDocuments(),
      Fees.aggregate([{ $match: { status: { $in: ['paid','Paid'] } } }, { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }]),
      Fees.aggregate([{ $match: { status: { $in: ['pending','Pending'] } } }, { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }]),
      Notice.countDocuments(),
    ]);
    res.json({
      students, faculty, placements, notices,
      totalFeeCollected: paidFees[0]?.total   || 0,
      pendingFees:       pendingFees[0]?.total || 0,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/stats (alias)
app.get('/api/dashboard/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [students, faculty, placements, paidFees, pendingFees, notices] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Placement.countDocuments(),
      Fees.aggregate([{ $match: { status: { $in: ['paid','Paid'] } } }, { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }]),
      Fees.aggregate([{ $match: { status: { $in: ['pending','Pending'] } } }, { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }]),
      Notice.countDocuments(),
    ]);
    res.json({
      students, faculty, placements, notices,
      totalFeeCollected: paidFees[0]?.total   || 0,
      pendingFees:       pendingFees[0]?.total || 0,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/student/:roll  (student overview stats)
app.get('/api/dashboard/student/:roll', protect, async (req, res) => {
  try {
    const roll = req.params.roll;

    // Attendance
    const attRecords = await Attendance.find({ rollNumber: roll });
    const attTotal   = attRecords.length;
    const attPresent = attRecords.filter(r => ['present','Present'].includes(r.status)).length;
    const attPct     = attTotal ? parseFloat(((attPresent / attTotal) * 100).toFixed(1)) : 0;

    // Marks
    const marksData = await Marks.find({ rollNumber: roll });
    const avgMarks  = marksData.length
      ? Math.round(marksData.reduce((s,m) => s + (Number(m.marksObtained) / Number(m.maxMarks || 100)) * 100, 0) / marksData.length)
      : 0;

    // Fees
    const feesData   = await Fees.find({ rollNumber: roll });
    const paidFees   = feesData.filter(f => ['paid','Paid'].includes(f.status)).reduce((s,f) => s + Number(f.amount), 0);
    const pendingFees= feesData.filter(f => !['paid','Paid'].includes(f.status)).reduce((s,f) => s + Number(f.amount), 0);

    res.json({
      attendancePct: attPct,
      avgMarks,
      grade:        calcGrade(avgMarks, 100),
      paidFees,
      pendingFees,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  AI CHAT — GROQ
// ══════════════════════════════════════════════════════════════

app.post('/api/chat', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const userName = req.user.name || 'Student';
    const userRole = req.user.role || 'student';
    const roll     = req.user.rollNumber || '';

    // Build context
    let context = `User: ${userName}, Role: ${userRole}`;
    if (roll) {
      const attRecs = await Attendance.find({ rollNumber: roll });
      const total   = attRecs.length;
      const present = attRecs.filter(r => ['present','Present'].includes(r.status)).length;
      const pct     = total ? ((present/total)*100).toFixed(1) : 0;
      context += `, Roll: ${roll}, Attendance: ${pct}%`;

      const marksRecs = await Marks.find({ rollNumber: roll });
      if (marksRecs.length) {
        const avg = Math.round(marksRecs.reduce((s,m) => s + (Number(m.marksObtained)/Number(m.maxMarks||100))*100, 0) / marksRecs.length);
        context += `, Avg Marks: ${avg}%`;
      }
    }

    const GROQ_KEY = process.env.GROQ_API_KEY;

    if (GROQ_KEY) {
      try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: GROQ_KEY });

        const completion = await groq.chat.completions.create({
          model: 'llama3-8b-8192',
          max_tokens: 500,
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: `You are EduBot, the friendly AI assistant for EduAI Campus Management System.
${context}
Help students and staff with: attendance queries, timetable, exam schedules, fee status, placement opportunities, and campus news.
Be concise, friendly and helpful. Use simple language. Keep answers under 4 sentences unless explaining steps.`,
            },
            ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message },
          ],
        });

        const reply = completion.choices[0]?.message?.content || 'Sorry, I could not process that.';

        // Save to chat log
        await Chat.findOneAndUpdate(
          { userId: req.user.id },
          { $push: { messages: [
              { role: 'user',      content: message },
              { role: 'assistant', content: reply   },
          ]}, updatedAt: new Date() },
          { upsert: true }
        );

        return res.json({ reply, source: 'groq' });
      } catch (groqErr) {
        console.warn('GROQ error:', groqErr.message);
      }
    }

    // Fallback rule-based responses
    const msg = message.toLowerCase();
    let reply = `Hi ${userName}! 👋 I'm EduBot. Ask me about your attendance, timetable, exams, fees or placement opportunities!`;
    if (msg.includes('attendance'))
      reply = `📅 Check your **Attendance** tab for your current percentage and records. If below 75%, you'll see an alert.`;
    else if (msg.includes('timetable') || msg.includes('schedule') || msg.includes('class'))
      reply = `🗓️ Your class timetable is in the **Timetable** section. You can filter by department, year and day.`;
    else if (msg.includes('exam') || msg.includes('test') || msg.includes('internal'))
      reply = `📝 Upcoming exams are in the **Marks** section. Check the notice board for exam schedule announcements.`;
    else if (msg.includes('fee') || msg.includes('payment') || msg.includes('due'))
      reply = `💳 Your fee status and payment history are in the **Fees** tab. Pending dues show the due date.`;
    else if (msg.includes('placement') || msg.includes('job') || msg.includes('intern') || msg.includes('career'))
      reply = `💼 Check the **Placement** section for AI-matched job opportunities based on your CGPA and skills!`;
    else if (msg.includes('marks') || msg.includes('grade') || msg.includes('result'))
      reply = `📊 Your subject-wise marks and grades are in the **Marks** tab with performance charts.`;
    else if (msg.includes('notice') || msg.includes('announcement') || msg.includes('news'))
      reply = `📢 Latest campus notices are on your **Overview** page and in the **Notices** section.`;
    else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey'))
      reply = `Hello ${userName}! 😊 I'm EduBot. I can help with attendance, marks, fees, timetable and placements. What do you need?`;

    res.json({ reply, source: 'rule-based' });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/history
app.get('/api/chat/history', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user.id });
    res.json({ messages: chat?.messages || [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  PARENT ROUTES
// ══════════════════════════════════════════════════════════════

app.get('/api/parent', protect, async (req, res) => {
  try {
    const parents = await Parent.find().sort('createdAt');
    res.json({ parents, count: parents.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/parent', protect, authorize('admin'), async (req, res) => {
  try {
    const p = await Parent.create(req.body);
    res.status(201).json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
//  ERROR HANDLER
// ══════════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

// ══════════════════════════════════════════════════════════════
//  MONGODB CONNECTION  — supports both MONGO_URI and MONGO_URL
// ══════════════════════════════════════════════════════════════

const MONGO_URI = process.env.MONGO_URI
               || process.env.MONGO_URL
               || 'mongodb://localhost:27017/campusai';

// Use mongodb+srv if old format detected
const fixedURI = MONGO_URI.startsWith('mongodb://')
  && MONGO_URI.includes('pe2ndiu.mongodb.net')
  ? `mongodb+srv://harshithajothi2005_db_user:Test1234@cluster0.pe2ndiu.mongodb.net/campus?retryWrites=true&w=majority`
  : MONGO_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log('♻️ Reusing existing MongoDB connection');
    return;
  }
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(fixedURI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS:         30000,
      socketTimeoutMS:          45000,
      maxPoolSize:              10,
      bufferCommands:           false,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
  }
};

connectDB();

// ══════════════════════════════════════════════════════════════
//  START SERVER
// ══════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log(`║  🚀 EduAI Campus Server Started              ║`);
  console.log(`║  Local:   http://localhost:${PORT}               ║`);
  console.log(`║  API:     http://localhost:${PORT}/api           ║`);
  console.log(`║  Health:  http://localhost:${PORT}/api/health    ║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log('📌 All Routes Ready:');
  console.log('   POST /api/auth/register   POST /api/auth/login');
  console.log('   GET  /api/students        GET  /api/attendance/student/:roll');
  console.log('   GET  /api/marks/student/:roll  GET  /api/fees/student/:roll');
  console.log('   POST /api/chat            GET  /api/notices');
  console.log('   GET  /api/dashboard/student/:roll');
  console.log('');
});

module.exports = app;