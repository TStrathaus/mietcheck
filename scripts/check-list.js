require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function check() {
  const result = await sql`SELECT COUNT(*) as count FROM notification_list`;
  console.log('✅ Datenbank verbunden');
  console.log('📊 Einträge in notification_list:', result.rows[0].count);
  process.exit(0);
}
check().catch(e => { console.error('❌', e.message); process.exit(1); });
