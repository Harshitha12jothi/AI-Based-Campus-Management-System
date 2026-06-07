const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    console.log('✅ MongoDB connected');

    const collections = ['students', 'faculty', 'attendances', 'marks', 'fees', 'timetables', 'parents'];

    for (const col of collections) {
      try {
        await mongoose.connection.db.collection(col).dropIndexes();
        console.log(`✅ Indexes dropped for: ${col}`);
      } catch (err) {
        console.log(`⚠️  ${col}: ${err.message}`);
      }
    }

    console.log('\n🎉 Done! Now run: node importData.js');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });