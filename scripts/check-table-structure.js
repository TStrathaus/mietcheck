require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkColumns() {
  try {
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name='users'
      ORDER BY ordinal_position
    `;
    console.log('Users table columns:');
    result.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
checkColumns();
