// Create notification_list table
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function createNotificationTable() {
  try {
    console.log('📋 Creating notification_list table...\n');

    await sql`
      CREATE TABLE IF NOT EXISTS notification_list (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        last_notified_at TIMESTAMP,
        active BOOLEAN DEFAULT TRUE
      )
    `;

    console.log('✅ Table created successfully!\n');

    // Check if table has data
    const result = await sql`SELECT COUNT(*) as count FROM notification_list`;
    console.log(`📊 Current entries: ${result.rows[0].count}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createNotificationTable();
