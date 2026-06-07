const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/chat', require('./routes/chat'));
app.use('/api/students', require('./routes/students'));

// ── Register all Mongoose Models ─────────────────────────────
const StudentSchema = new mongoose.Schema({
  rollNumber: String, firstName: String, lastName: String,
  email: String, phone: String, department: String,
  year: String, dob: String, gender: String, city: String,
  parentName: String, parentPhone: String, bloodGroup: String,
}, { timestamps: true });

const FacultySchema = new mongoose.Schema({
  employeeId: String, firstName: String, lastName: String,
  email: String, phone: String, department: String,
  designation: String, joiningDate: String, gender: String,
  qualification: String, subjectsTaught: String, city: String,
}, { timestamps: true });

const AttendanceSchema = new mongoose.Schema({
  rollNumber: String, studentName: String, department: String,
  year: String, subject: String, date: String,
  status: String, facultyId: String, remarks: String,
}, { timestamps: true });

const MarksSchema = new mongoose.Schema({
  rollNumber: String, studentName: String, department: String,
  year: String, subject: String, examType: String,
  maxMarks: String, marksObtained: String, grade: String,
  facultyId: String, date: String,
}, { timestamps: true });

const FeesSchema = new mongoose.Schema({
  rollNumber: String, studentName: String, department: String,
  year: String, feeType: String, amount: String,
  paid: String, balance: String, paymentDate: String,
  paymentMode: String, receiptNo: String, status: String,
}, { timestamps: true });

const TimetableSchema = new mongoose.Schema({
  department: String, year: String, day: String,
  period1: String, period2: String, period3: String,
  period4: String, period5: String, period6: String, period7: String,
}, { timestamps: true });

const ParentSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: String,
  phone: String, relation: String, childRollNo: String,
  childName: String, department: String, city: String,
}, { timestamps: true });

mongoose.model('Student',    StudentSchema);
mongoose.model('Faculty',    FacultySchema);
mongoose.model('Attendance', AttendanceSchema);
mongoose.model('Marks',      MarksSchema);
mongoose.model('Fees',       FeesSchema);
mongoose.model('Timetable',  TimetableSchema);
mongoose.model('Parent',     ParentSchema);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/dashboard',       require('./routes/dashboard'));
app.use('/api/attendance',      require('./routes/attendance'));
app.use('/api/marks',           require('./routes/marks'));
app.use('/api/fees',            require('./routes/fees'));
app.use('/api/notices',         require('./routes/notices'));
app.use('/api/ai/placement',    require('./routes/placement'));
app.use('/api/timetable',       require('./routes/timetable'));
app.use('/api/parent',          require('./routes/parent'));

// ── MongoDB Connection ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));
  })
  .catch(err => console.error('❌ MongoDB error:', err.message));