// Quick script to check notification list (Service 0 users)
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkNotificationList() {
  try {
    console.log('🔍 Checking notification list (Service 0 users)...\n');

    const result = await sql`
      SELECT id, email, name, created_at
      FROM users
      WHERE service_level = 0
      ORDER BY created_at DESC
    `;

    console.log(`📋 Total users on notification list: ${result.rows.length}\n`);

    if (result.rows.length === 0) {
      console.log('ℹ️ No users on notification list yet.\n');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email || user.name}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Registered: ${new Date(user.created_at).toLocaleString('de-CH')}`);
        console.log('');
      });
    }

    console.log('✅ Check complete\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkNotificationList();
