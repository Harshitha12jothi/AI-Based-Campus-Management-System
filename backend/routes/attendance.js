const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

const getModels = () => ({
  Student:    mongoose.model('Student'),
  Attendance: mongoose.model('Attendance'),
});

router.get('/', async (req, res) => {
  try {
    const { Attendance } = getModels();
    const { department, year, date, rollNumber } = req.query;
    const q = {};
    if (department) q.department = { $regex: new RegExp(`^${department}$`, 'i') };
    if (year)       q.year       = { $regex: new RegExp(`^${year}$`, 'i') };
    if (date)       q.date       = date;
    if (rollNumber) q.rollNumber = { $regex: new RegExp(`^${rollNumber}$`, 'i') };
    const records = await Attendance.find(q).sort({ date: -1 });
    res.json(records);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/student/:rollNumber', async (req, res) => {
  try {
    const { Attendance, Student } = getModels();
    const roll = req.params.rollNumber;
    const student = await Student.findOne({
      rollNumber: { $regex: new RegExp(`^${roll}$`, 'i') }
    });
    if (!student) {
      return res.status(404).json({ message: `Student "${roll}" not found.` });
    }
    const records = await Attendance.find({
      rollNumber: { $regex: new RegExp(`^${roll}$`, 'i') }
    }).sort({ date: -1 }).limit(200);
    const total   = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent  = records.filter(r => r.status === 'Absent').length;
    const late    = records.filter(r => r.status === 'Late').length;
    const pct     = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;
    res.json({
      summary: { total, present, absent, late, percentage: pct },
      records: records.map(r => ({
        date:    r.date    || '',
        subject: r.subject || '',
        status:  r.status  || '',
        remarks: r.remarks || '',
      })),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { Attendance, Student } = getModels();
    const records = Array.isArray(req.body) ? req.body : [req.body];
    if (!records.length) {
      return res.status(400).json({ message: 'No attendance records provided.' });
    }
    const updatedRolls = new Set();
    for (const r of records) {
      await Attendance.findOneAndUpdate(
        { rollNumber: r.rollNumber, subject: r.subject, date: r.date },
        { $set: { ...r } },
        { upsert: true, new: true }
      );
      if (r.rollNumber) updatedRolls.add(r.rollNumber);
    }
    for (const roll of updatedRolls) {
      const total   = await Attendance.countDocuments({ rollNumber: roll });
      const present = await Attendance.countDocuments({ rollNumber: roll, status: 'Present' });
      const pct     = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;
      await Student.findOneAndUpdate(
        { rollNumber: { $regex: new RegExp(`^${roll}$`, 'i') } },
        { attendance: pct }
      );
    }
    res.status(201).json({ message: `Attendance saved for ${records.length} students.` });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { Attendance } = getModels();
    const updated = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Record not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { Attendance } = getModels();
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;