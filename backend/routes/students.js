const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');

// ── Get models registered in server.js ──────────────────────
const Student    = mongoose.model('Student');
const Attendance = mongoose.model('Attendance');
const Marks      = mongoose.model('Marks');
const Fees       = mongoose.model('Fees');

// ── Simple auth middleware (reads JWT from header) ───────────
const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });
  try {
    const jwt  = require('jsonwebtoken');
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};


// ─── GET /api/students ────────────────────────────────────────
// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── GET /api/students/by-roll/:roll ─────────────────────────
// Get single student by roll number
router.get('/by-roll/:roll', async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.roll });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── GET /api/students/my-profile ────────────────────────────
// Get logged-in student profile using JWT
router.get('/my-profile', protect, async (req, res) => {
  try {
    // Try to find by user id or roll number stored in token
    const student = await Student.findOne({
      $or: [
        { rollNumber: req.user.rollNumber },
        { email: req.user.email }
      ]
    });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── GET /api/students/:roll/attendance ──────────────────────
// Get attendance for a student by roll number
router.get('/:roll/attendance', async (req, res) => {
  try {
    const roll = req.params.roll;
    const records = await Attendance.find({ rollNumber: roll }).sort({ date: -1 });

    const total   = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent  = records.filter(r => r.status === 'Absent').length;
    const late    = records.filter(r => r.status === 'Late').length;
    const pct     = total ? ((present / total) * 100).toFixed(1) : 0;

    res.json({
      records,
      summary: { total, present, absent, late, percentage: parseFloat(pct) },
      total, present, absent, late, percentage: parseFloat(pct),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── GET /api/students/:roll/marks ───────────────────────────
// Get marks for a student by roll number
router.get('/:roll/marks', async (req, res) => {
  try {
    const records = await Marks.find({ rollNumber: req.params.roll }).sort({ date: -1 });

    const avg = records.length
      ? Math.round(
          records.reduce((s, r) => s + (parseFloat(r.marksObtained) / parseFloat(r.maxMarks)) * 100, 0)
          / records.length
        )
      : 0;

    const getGrade = (p) => {
      if (p >= 90) return 'O';  if (p >= 80) return 'A+'; if (p >= 70) return 'A';
      if (p >= 60) return 'B+'; if (p >= 50) return 'B';  if (p >= 40) return 'C';
      return 'F';
    };

    res.json({ records, average: avg, grade: getGrade(avg), count: records.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── GET /api/students/:roll/fees ────────────────────────────
// Get fees for a student by roll number
router.get('/:roll/fees', async (req, res) => {
  try {
    const fees = await Fees.find({ rollNumber: req.params.roll }).sort({ createdAt: -1 });

    const paid    = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + parseFloat(f.amount || 0), 0);
    const pending = fees.filter(f => f.status !== 'Paid').reduce((s, f) => s + parseFloat(f.amount || 0), 0);

    res.json({
      fees,
      count: fees.length,
      summary: { total: paid + pending, paid, pending },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ─── POST /api/students ───────────────────────────────────────
// Add a new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    const saved   = await student.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// ─── PUT /api/students/:roll ──────────────────────────────────
// Update student by roll number
router.put('/:roll', async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { rollNumber: req.params.roll },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// ─── DELETE /api/students/:roll ───────────────────────────────
// Delete student by roll number
router.delete('/:roll', async (req, res) => {
  try {
    const deleted = await Student.findOneAndDelete({ rollNumber: req.params.roll });
    if (!deleted) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;