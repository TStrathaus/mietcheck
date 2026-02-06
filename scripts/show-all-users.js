// Show all registered users
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function showAllUsers() {
  try {
    console.log('🔍 Loading all users...\n');

    const result = await sql`
      SELECT id, email, name, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    console.log(`📋 Total users: ${result.rows.length}\n`);

    if (result.rows.length === 0) {
      console.log('ℹ️ No users registered yet.\n');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Registered: ${new Date(user.created_at).toLocaleString('de-CH')}`);
        console.log('');
      });
    }

    console.log('✅ Done\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showAllUsers();
