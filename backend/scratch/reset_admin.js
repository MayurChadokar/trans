const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const iterations = 120000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('base64');
  return { salt, hash, iterations };
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const h = hashPassword('admin123');
    const res = await mongoose.connection.db.collection('admins').updateOne(
      { email: 'panchalajay717@gmail.com' },
      { 
        $set: { 
          passwordSalt: h.salt, 
          passwordHash: h.hash, 
          passwordIterations: h.iterations,
          disabled: false 
        } 
      }
    );
    console.log('Update Result:', JSON.stringify(res));
    process.exit(0);
  } catch (err) {
    console.error('Reset Failed:', err);
    process.exit(1);
  }
}

run();
