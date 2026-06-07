const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/marks/student/:roll
router.get('/student/:roll', async (req, res) => {
  try {
    const Marks   = mongoose.model('Marks');
    const records = await Marks.find({ rollNumber: req.params.roll }).sort({ date: -1 });

    let average = 0;
    if (records.length > 0) {
      const sum = records.reduce((acc, m) =>
        acc + (Number(m.marksObtained) / Number(m.maxMarks)) * 100, 0);
      average = Math.round(sum / records.length);
    }
    const grade = average >= 90 ? 'O' : average >= 80 ? 'A+' : average >= 70 ? 'A'
                : average >= 60 ? 'B+' : average >= 50 ? 'B' : average >= 40 ? 'C' : 'F';

    const formatted = records.map(r => ({
      subject:      r.subject,
      examType:     r.examType,
      marks:        Number(r.marksObtained),
      maxMarks:     Number(r.maxMarks),
      grade:        r.grade,
      date:         r.date,
      facultyId:    r.facultyId,
    }));

    res.json({ average, grade, records: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;