const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

const before = c.includes('async function(next)');

c = c.replace(
  /UserSchema\.pre\('save',\s*async function\(next\)\s*\{[\s\S]*?\}\);/,
  "UserSchema.pre('save', async function() {\n  if (!this.isModified('password')) return;\n  this.password = await bcrypt.hash(this.password, 12);\n});"
);

fs.writeFileSync('server.js', c);
console.log('Had next param:', before);
console.log('Fixed:', !c.includes('async function(next)'));