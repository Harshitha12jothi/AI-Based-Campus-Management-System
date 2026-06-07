const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/timetable/:department/:year
router.get('/:department/:year', async (req, res) => {
  try {
    const Timetable = mongoose.model('Timetable');
    const records = await Timetable.find({
      department: decodeURIComponent(req.params.department),
      year:       decodeURIComponent(req.params.year),
    });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;