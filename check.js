const mongoose = require('./backend/node_modules/mongoose');
mongoose.connect('mongodb+srv://harshithajothi2005_db_user:IwxfM6bzN6M1YHH5@cluster0.pe2ndiu.mongodb.net/campus?appName=Cluster0').then(async () => {
  const Student = mongoose.model('Student', new mongoose.Schema({}, {strict: false}));
  const students = await Student.find({}, {rollNumber: 1}).limit(5);
  console.log(students);
  process.exit();
});