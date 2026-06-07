require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');

const ParentSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: String,
  phone: String, relation: String, childRollNo: String,
  childName: String, department: String, city: String,
});

const Parent = mongoose.models.Parent || mongoose.model('Parent', ParentSchema);

mongoose.connect(process.env.MONGO_URL).then(async () => {
  console.log('✅ MongoDB connected');

  const parents = await Parent.find({});
  console.log(`Found ${parents.length} parents`);

  let created = 0;
  let skipped = 0;

  for (const p of parents) {
    const exists = await User.findOne({ email: p.email });
    if (!exists) {
      const hashed = await bcrypt.hash('parent123', 10);
      await User.create({
        firstName:  p.firstName,
        lastName:   p.lastName,
        email:      p.email,
        password:   hashed,
        role:       'parent',
        department: p.department,
        phone:      p.phone,
        childRollNo: p.childRollNo,
      });
      console.log(`✅ Created: ${p.email}`);
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`\n🎉 Done! Created: ${created} | Skipped: ${skipped}`);
  console.log('📌 Parents can now login with password: parent123');
  process.exit();
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});