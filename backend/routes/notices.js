const express = require('express');
const router = express.Router();

// GET /api/notices
router.get('/', async (req, res) => {
  try {
    const notices = [
      { title: 'Internal Exam Schedule Released',   content: 'Internal Exam 2 will be held from May 10 to May 15. Check your timetable for subject-wise schedule.', date: new Date('2026-05-01'), targetRole: 'student' },
      { title: 'Campus Placement Drive - TCS',      content: 'TCS will conduct campus recruitment on May 20. Eligible students must register before May 10.', date: new Date('2026-04-28'), targetRole: 'student' },
      { title: 'Fee Payment Deadline',              content: 'Last date for semester fee payment is May 31. Late fees of ₹500 will be charged after the deadline.', date: new Date('2026-04-25'), targetRole: 'student' },
      { title: 'Sports Day Announcement',           content: 'Annual Sports Day will be held on June 5. Register your events at the Sports Department before May 25.', date: new Date('2026-04-20'), targetRole: 'all' },
      { title: 'Library Book Return Reminder',      content: 'All issued books must be returned by May 30. Fine of ₹5 per day will be charged for late returns.', date: new Date('2026-04-18'), targetRole: 'student' },
      { title: 'Project Submission Deadline',       content: 'Final year project reports must be submitted to the department by May 15. Late submissions will not be accepted.', date: new Date('2026-04-15'), targetRole: 'student' },
      { title: 'Scholarship Applications Open',     content: 'Merit scholarship applications for academic year 2026-27 are now open. Apply at the admin office before June 1.', date: new Date('2026-04-10'), targetRole: 'student' },
    ];
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;