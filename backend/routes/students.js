const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Get models only when needed
const getModels = () => ({
  Student: mongoose.model('Student'),   // ✅ correct
  Attendance: mongoose.model('Attendance'),
  Marks: mongoose.model('Marks'),
  Fees: mongoose.model('Fees'),
});

// Authentication middleware
const protect = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all students
router.get('/', async (req, res) => {
  try {
    const { Student } = getModels();

    const query = {};
    if (req.query.department) {
      query.department = req.query.department;
    }

    const students = await Student.find(query).sort({ rollNumber: 1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by roll number
router.get('/by-roll/:roll', async (req, res) => {
  try {
    const { Student } = getModels();

    const student = await Student.findOne({
      rollNumber: req.params.roll,
    });

    if (!student) {
      return res.status(404).json({
        message: 'Student not found',
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logged-in student profile
router.get('/my-profile', protect, async (req, res) => {
  try {
    const { Student } = getModels();

    const student = await Student.findOne({
      $or: [
        { rollNumber: req.user.rollNumber },
        { email: req.user.email },
      ],
    });

    if (!student) {
      return res.status(404).json({
        message: 'Student profile not found',
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Attendance
router.get('/:roll/attendance', async (req, res) => {
  try {
    const { Attendance } = getModels();

    const records = await Attendance.find({
      rollNumber: req.params.roll,
    }).sort({ date: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const late = records.filter(r => r.status === 'Late').length;

    const percentage = total
      ? Number(((present / total) * 100).toFixed(1))
      : 0;

    res.json({
      records,
      summary: {
        total,
        present,
        absent,
        late,
        percentage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Marks
router.get('/:roll/marks', async (req, res) => {
  try {
    const { Marks } = getModels();

    const records = await Marks.find({
      rollNumber: req.params.roll,
    }).sort({ date: -1 });

    const average = records.length
      ? Math.round(
          records.reduce((sum, item) => {
            return (
              sum +
              (Number(item.marksObtained) /
                Number(item.maxMarks)) *
                100
            );
          }, 0) / records.length
        )
      : 0;

    const getGrade = avg => {
      if (avg >= 90) return 'O';
      if (avg >= 80) return 'A+';
      if (avg >= 70) return 'A';
      if (avg >= 60) return 'B+';
      if (avg >= 50) return 'B';
      if (avg >= 40) return 'C';
      return 'F';
    };

    res.json({
      records,
      average,
      grade: getGrade(average),
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fees
router.get('/:roll/fees', async (req, res) => {
  try {
    const { Fees } = getModels();

    const fees = await Fees.find({
      rollNumber: req.params.roll,
    }).sort({ createdAt: -1 });

    const paid = fees
      .filter(f => f.status === 'Paid')
      .reduce((sum, f) => sum + Number(f.amount || 0), 0);

    const pending = fees
      .filter(f => f.status !== 'Paid')
      .reduce((sum, f) => sum + Number(f.amount || 0), 0);

    res.json({
      fees,
      count: fees.length,
      summary: {
        total: paid + pending,
        paid,
        pending,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student
router.post('/', async (req, res) => {
  try {
    const { Student } = getModels();

    const student = new Student(req.body);
    const savedStudent = await student.save();

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/:roll', async (req, res) => {
  try {
    const { Student } = getModels();

    const updatedStudent = await Student.findOneAndUpdate(
      { rollNumber: req.params.roll },
      req.body,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: 'Student not found',
      });
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete('/:roll', async (req, res) => {
  try {
    const { Student } = getModels();

    const deletedStudent = await Student.findOneAndDelete({
      rollNumber: req.params.roll,
    });

    if (!deletedStudent) {
      return res.status(404).json({
        message: 'Student not found',
      });
    }

    res.json({
      message: 'Student deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;