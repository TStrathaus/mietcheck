// Create test user with known password
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    const email = 'test@mietcheck.ch';
    const password = 'test123';
    const name = 'Test User';

    console.log('🔐 Creating test user...\n');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${name}\n`);

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.rows.length > 0) {
      console.log('⚠️ User already exists! Updating password...\n');
      await sql`
        UPDATE users
        SET password_hash = ${hashedPassword}, name = ${name}
        WHERE email = ${email}
      `;
      console.log('✅ Password updated!\n');
    } else {
      await sql`
        INSERT INTO users (email, password_hash, name, created_at)
        VALUES (${email}, ${hashedPassword}, ${name}, NOW())
      `;
      console.log('✅ User created!\n');
    }

    console.log('📝 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
