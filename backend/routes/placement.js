const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/ai/placement/:roll
router.get('/:roll', async (req, res) => {
  try {
    const Marks   = mongoose.model('Marks');
    const Student = mongoose.model('Student');

    const records = await Marks.find({ rollNumber: req.params.roll });
    const student = await Student.findOne({ rollNumber: req.params.roll });

    let average = 0;
    if (records.length > 0) {
      const sum = records.reduce((acc, m) =>
        acc + (Number(m.marksObtained) / Number(m.maxMarks)) * 100, 0);
      average = Math.round(sum / records.length);
    }

    const grade = average >= 90 ? 'O' : average >= 80 ? 'A+' : average >= 70 ? 'A'
                : average >= 60 ? 'B+' : average >= 50 ? 'B' : 'C';
    const eligibleForCampus = average >= 60;

    const rolesMap = {
      'Computer Science':            ['Software Engineer','Full Stack Developer','Data Analyst','DevOps Engineer','AI/ML Engineer'],
      'Electronics & Communication': ['Embedded Systems Engineer','VLSI Design Engineer','IoT Developer','Signal Processing Engineer','Hardware Engineer'],
      'Mechanical Engineering':      ['Design Engineer','Manufacturing Engineer','CAD Specialist','Quality Engineer','Production Manager'],
      'Civil Engineering':           ['Structural Engineer','Site Engineer','Urban Planner','Environmental Engineer','Project Manager'],
      'Information Technology':      ['Web Developer','Cloud Engineer','Cybersecurity Analyst','Database Administrator','IT Consultant'],
      'Business Administration':     ['Business Analyst','Marketing Manager','Financial Analyst','HR Manager','Operations Manager'],
    };

    const dept  = student?.department || 'Computer Science';
    const roles = rolesMap[dept] || rolesMap['Computer Science'];
    const recommendedRoles = average >= 70 ? roles.slice(0, 3) : roles.slice(2, 5);

    res.json({ average, grade, eligibleForCampus, recommendedRoles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;