const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['student', 'faculty', 'parent', 'admin'], default: 'student' },
  department:{ type: String, default: '' },
  phone:     { type: String, default: '' },

  // Student specific
  rollNumber: { type: String, default: '' },

  // Parent specific
  childRollNo: { type: String, default: '' },
  relation:    { type: String, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);