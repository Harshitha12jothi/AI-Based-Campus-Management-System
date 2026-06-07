const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/students?department=Computer Science
router.get('/', async (req, res) => {
  try {
    const Student = mongoose.model('Student');
    const { department } = req.query;
    const query = department ? { department } : {};
    const students = await Student.find(query).sort({ rollNumber: 1 });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/students/:roll
router.get('/:roll', async (req, res) => {
  try {
    const Student = mongoose.model('Student');
    const student = await Student.findOne({ rollNumber: req.params.roll });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;