const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/parent/:parentId/children
router.get('/:parentId/children', async (req, res) => {
  try {
    const User    = require('../models/User');
    const Student = mongoose.model('Student');

    // Find the parent user
    const parent = await User.findById(req.params.parentId);
    if (!parent) return res.status(404).json({ message: 'Parent not found' });

    // Find child by childRollNo stored in parent's profile
    const childRoll = parent.childRollNo || parent.childRoll;
    if (!childRoll) return res.json([]);

    const child = await Student.findOne({ rollNumber: childRoll });
    if (!child) return res.json([]);

    res.json([{
      rollNumber: child.rollNumber,
      firstName:  child.firstName,
      lastName:   child.lastName,
      department: child.department,
      semester:   child.year,
      email:      child.email,
    }]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;