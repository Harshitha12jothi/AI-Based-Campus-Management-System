const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/dashboard/student/:roll
router.get('/student/:roll', async (req, res) => {
  try {
    const roll       = req.params.roll;
    const Attendance = mongoose.model('Attendance');
    const Marks      = mongoose.model('Marks');
    const Fees       = mongoose.model('Fees');

    // Attendance
    const attRecords    = await Attendance.find({ rollNumber: roll });
    const present       = attRecords.filter(a => a.status === 'Present').length;
    const total         = attRecords.length;
    const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

    // Marks
    const marksRecords = await Marks.find({ rollNumber: roll });
    let avgMarks = 0;
    if (marksRecords.length > 0) {
      const sum = marksRecords.reduce((acc, m) =>
        acc + (Number(m.marksObtained) / Number(m.maxMarks)) * 100, 0);
      avgMarks = Math.round(sum / marksRecords.length);
    }
    const grade = avgMarks >= 90 ? 'O' : avgMarks >= 80 ? 'A+' : avgMarks >= 70 ? 'A'
                : avgMarks >= 60 ? 'B+' : avgMarks >= 50 ? 'B' : avgMarks >= 40 ? 'C' : 'F';

    // Fees
    const feesRecords = await Fees.find({ rollNumber: roll });
    const totalFees   = feesRecords.reduce((acc, f) => acc + Number(f.amount  || 0), 0);
    const paidFees    = feesRecords.reduce((acc, f) => acc + Number(f.paid    || 0), 0);
    const pendingFees = feesRecords.reduce((acc, f) => acc + Number(f.balance || 0), 0);

    res.json({ attendancePct, avgMarks, grade, totalFees, paidFees, pendingFees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;