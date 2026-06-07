const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/fees/student/:roll
router.get('/student/:roll', async (req, res) => {
  try {
    const Fees    = mongoose.model('Fees');
    const records = await Fees.find({ rollNumber: req.params.roll });

    const total   = records.reduce((acc, f) => acc + Number(f.amount  || 0), 0);
    const paid    = records.reduce((acc, f) => acc + Number(f.paid    || 0), 0);
    const pending = records.reduce((acc, f) => acc + Number(f.balance || 0), 0);

    const formatted = records.map(f => ({
      feeType:     f.feeType,
      amount:      Number(f.amount),
      paid:        Number(f.paid),
      balance:     Number(f.balance),
      status:      f.status.toLowerCase(),
      paymentDate: f.paymentDate,
      paymentMode: f.paymentMode,
      receiptNo:   f.receiptNo,
      semester:    f.year,
      paidDate:    f.paymentDate,
    }));

    res.json({ summary: { total, paid, pending }, fees: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;