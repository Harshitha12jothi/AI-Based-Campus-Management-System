const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ── MongoDB Connection ───────────────────────────────────────
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// ── Models ───────────────────────────────────────────────────
const User = require('./models/User');

const StudentSchema = new mongoose.Schema({
  rollNumber: String, firstName: String, lastName: String,
  email: String, phone: String, department: String,
  year: String, dob: String, gender: String, city: String,
  parentName: String, parentPhone: String, bloodGroup: String,
}, { timestamps: true });

const FacultySchema = new mongoose.Schema({
  employeeId: String, firstName: String, lastName: String,
  email: String, phone: String, department: String,
  designation: String, joiningDate: String, gender: String,
  qualification: String, subjectsTaught: String, city: String,
}, { timestamps: true });

const AttendanceSchema = new mongoose.Schema({
  rollNumber: String, studentName: String, department: String,
  year: String, subject: String, date: String,
  status: String, facultyId: String, remarks: String,
}, { timestamps: true });

const MarksSchema = new mongoose.Schema({
  rollNumber: String, studentName: String, department: String,
  year: String, subject: String, examType: String,
  maxMarks: String, marksObtained: String, grade: String,
  facultyId: String, date: String,
}, { timestamps: true });

const FeesSchema = new mongoose.Schema({
  rollNumber: String, studentName: String, department: String,
  year: String, feeType: String, amount: String,
  paid: String, balance: String, paymentDate: String,
  paymentMode: String, receiptNo: String, status: String,
}, { timestamps: true });

const TimetableSchema = new mongoose.Schema({
  department: String, year: String, day: String,
  period1: String, period2: String, period3: String,
  period4: String, period5: String, period6: String, period7: String,
}, { timestamps: true });

const ParentSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: String,
  phone: String, relation: String, childRollNo: String,
  childName: String, department: String, city: String,
}, { timestamps: true });

const Student    = mongoose.models.Student    || mongoose.model('Student',    StudentSchema);
const Faculty    = mongoose.models.Faculty    || mongoose.model('Faculty',    FacultySchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
const Marks      = mongoose.models.Marks      || mongoose.model('Marks',      MarksSchema);
const Fees       = mongoose.models.Fees       || mongoose.model('Fees',       FeesSchema);
const Timetable  = mongoose.models.Timetable  || mongoose.model('Timetable',  TimetableSchema);
const Parent     = mongoose.models.Parent     || mongoose.model('Parent',     ParentSchema);

// ── Read Excel ───────────────────────────────────────────────
const FILE_PATH = path.join(__dirname, 'AI_Campus_Full_Data.xlsx');

function readSheet(wb, sheetName) {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) { console.log(`⚠️  Sheet "${sheetName}" not found`); return []; }
  return xlsx.utils.sheet_to_json(sheet);
}

// ── Main Import ──────────────────────────────────────────────
async function importAll() {
  try {
    await mongoose.connection.once('open', () => {});
    await new Promise(r => setTimeout(r, 1000));

    const wb = xlsx.readFile(FILE_PATH);
    console.log('\n📂 Reading Excel file:', FILE_PATH);
    console.log('📋 Sheets found:', wb.SheetNames.join(', '), '\n');

    // 1. Students
    const studentRows = readSheet(wb, 'Students');
    await Student.deleteMany({});
    const studentDocs = studentRows.map(r => ({
      rollNumber: r['Roll Number'],   firstName: r['First Name'],
      lastName:   r['Last Name'],     email:     r['Email'],
      phone:      r['Phone'],         department:r['Department'],
      year:       r['Year/Semester'], dob:       r['Date of Birth'],
      gender:     r['Gender'],        city:      r['City'],
      parentName: r['Parent Name'],   parentPhone:r['Parent Phone'],
      bloodGroup: r['Blood Group'],
    }));
    await Student.insertMany(studentDocs);
    console.log(`✅ Students imported: ${studentDocs.length}`);

    // 2. Faculty
    const facultyRows = readSheet(wb, 'Faculty');
    await Faculty.deleteMany({});
    const facultyDocs = facultyRows.map(r => ({
      employeeId:    r['Employee ID'],   firstName:     r['First Name'],
      lastName:      r['Last Name'],     email:         r['Email'],
      phone:         r['Phone'],         department:    r['Department'],
      designation:   r['Designation'],   joiningDate:   r['Joining Date'],
      gender:        r['Gender'],        qualification: r['Qualification'],
      subjectsTaught:r['Subjects Taught'], city:        r['City'],
    }));
    await Faculty.insertMany(facultyDocs);
    console.log(`✅ Faculty imported: ${facultyDocs.length}`);

    // 3. Attendance
    const attRows = readSheet(wb, 'Attendance');
    await Attendance.deleteMany({});
    const attDocs = attRows.map(r => ({
      rollNumber:  r['Roll Number'],  studentName: r['Student Name'],
      department:  r['Department'],   year:        r['Year'],
      subject:     r['Subject'],      date:        r['Date'],
      status:      r['Status'],       facultyId:   r['Faculty ID'],
      remarks:     r['Remarks'] || '',
    }));
    await Attendance.insertMany(attDocs);
    console.log(`✅ Attendance imported: ${attDocs.length}`);

    // 4. Marks
    const marksRows = readSheet(wb, 'Marks');
    await Marks.deleteMany({});
    const marksDocs = marksRows.map(r => ({
      rollNumber:    r['Roll Number'],    studentName:  r['Student Name'],
      department:    r['Department'],     year:         r['Year'],
      subject:       r['Subject'],        examType:     r['Exam Type'],
      maxMarks:      String(r['Max Marks']), marksObtained: String(r['Marks Obtained']),
      grade:         r['Grade'],          facultyId:    r['Faculty ID'],
      date:          r['Date'],
    }));
    await Marks.insertMany(marksDocs);
    console.log(`✅ Marks imported: ${marksDocs.length}`);

    // 5. Fees
    const feesRows = readSheet(wb, 'Fees');
    await Fees.deleteMany({});
    const feesDocs = feesRows.map(r => ({
      rollNumber:  r['Roll Number'],   studentName: r['Student Name'],
      department:  r['Department'],    year:        r['Year'],
      feeType:     r['Fee Type'],      amount:      String(r['Amount (₹)'] || r['Amount']),
      paid:        String(r['Paid (₹)'] || r['Paid']),
      balance:     String(r['Balance (₹)'] || r['Balance']),
      paymentDate: r['Payment Date'] || '', paymentMode: r['Payment Mode'] || '',
      receiptNo:   r['Receipt No'] || '',   status:      r['Status'],
    }));
    await Fees.insertMany(feesDocs);
    console.log(`✅ Fees imported: ${feesDocs.length}`);

    // 6. Timetable
    const ttRows = readSheet(wb, 'Timetable');
    await Timetable.deleteMany({});
    const ttDocs = ttRows.map(r => ({
      department: r['Department'], year: r['Year'], day: r['Day'],
      period1: r['Period 1\n9-10AM']  || r['Period 1'] || '',
      period2: r['Period 2\n10-11AM'] || r['Period 2'] || '',
      period3: r['Period 3\n11-12PM'] || r['Period 3'] || '',
      period4: r['Period 4\n12-1PM']  || r['Period 4'] || '',
      period5: r['Period 5\n2-3PM']   || r['Period 5'] || '',
      period6: r['Period 6\n3-4PM']   || r['Period 6'] || '',
      period7: r['Period 7\n4-5PM']   || r['Period 7'] || '',
    }));
    await Timetable.insertMany(ttDocs);
    console.log(`✅ Timetable imported: ${ttDocs.length}`);

    // 7. Parents
    const parentRows = readSheet(wb, 'Parents');
    await Parent.deleteMany({});
    const parentDocs = parentRows.map(r => ({
      firstName:  r['Parent First Name'], lastName:   r['Parent Last Name'],
      email:      r['Email'],             phone:      r['Phone'],
      relation:   r['Relation'],          childRollNo:r['Child Roll No'],
      childName:  r['Child Name'],        department: r['Department'],
      city:       r['City'],
    }));
    await Parent.insertMany(parentDocs);
    console.log(`✅ Parents imported: ${parentDocs.length}`);

    // 8. Create User accounts for all students
    console.log('\n⏳ Creating student login accounts...');
    const studentUsers = await Promise.all(studentDocs.map(async s => ({
      firstName:  s.firstName,
      lastName:   s.lastName,
      email:      s.email,
      password:   await bcrypt.hash('student123', 10),
      role:       'student',
      department: s.department,
      phone:      s.phone,
      rollNumber: s.rollNumber,
    })));
    for (const u of studentUsers) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true });
    }
    console.log(`✅ Student accounts created: ${studentUsers.length}`);

    // 9. Create User accounts for all faculty
    console.log('⏳ Creating faculty login accounts...');
    const facultyUsers = await Promise.all(facultyDocs.map(async f => ({
      firstName:  f.firstName,
      lastName:   f.lastName,
      email:      f.email,
      password:   await bcrypt.hash('faculty123', 10),
      role:       'faculty',
      department: f.department,
      phone:      f.phone,
    })));
    for (const u of facultyUsers) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true });
    }
    console.log(`✅ Faculty accounts created: ${facultyUsers.length}`);

    console.log('\n🎉 All data imported successfully into MongoDB!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Default Passwords:');
    console.log('   Students : student123');
    console.log('   Faculty  : faculty123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Import error:', err.message);
    mongoose.connection.close();
  }
}

importAll();