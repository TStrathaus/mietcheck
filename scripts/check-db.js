// Quick database check script
// Run with: node scripts/check-db.js

const { sql } = require('@vercel/postgres');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');

    // Check users
    const users = await sql`SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 5`;
    console.log('👥 Users in database:', users.rows.length);
    users.rows.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email}, Name: ${u.name || 'N/A'}, Created: ${u.created_at}`);
    });

    console.log('\n📋 Contracts in database:');
    const contracts = await sql`
      SELECT
        c.id,
        c.user_id,
        c.address,
        c.net_rent,
        c.new_rent,
        c.created_at,
        u.email as user_email
      FROM contracts c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 10
    `;

    console.log(`Total contracts: ${contracts.rows.length}\n`);

    if (contracts.rows.length === 0) {
      console.log('❌ NO CONTRACTS FOUND IN DATABASE!\n');
      console.log('Possible reasons:');
      console.log('1. Contracts were never saved (save operation failed silently)');
      console.log('2. Database was reset or migrated');
      console.log('3. Wrong database connection (development vs production)');
    } else {
      contracts.rows.forEach(c => {
        console.log(`Contract ID: ${c.id}`);
        console.log(`  User: ${c.user_email} (ID: ${c.user_id})`);
        console.log(`  Address: ${c.address}`);
        console.log(`  Rent: CHF ${c.net_rent} → CHF ${c.new_rent || 'N/A'}`);
        console.log(`  Created: ${c.created_at}`);
        console.log('---');
      });
    }

    // Check transactions
    const transactions = await sql`SELECT COUNT(*) as count FROM transactions`;
    console.log(`\n💳 Transactions: ${transactions.rows[0].count}`);

    // Check for orphaned contracts (contracts with no user)
    const orphaned = await sql`
      SELECT COUNT(*) as count
      FROM contracts c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE u.id IS NULL
    `;

    if (orphaned.rows[0].count > 0) {
      console.log(`\n⚠️ WARNING: ${orphaned.rows[0].count} orphaned contracts (user deleted)`);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Database not initialized - run: npm run db:setup');
    console.error('2. Missing .env.local with POSTGRES_URL');
    console.error('3. Wrong database credentials');
  }
}

checkDatabase().then(() => {
  console.log('\n✅ Database check complete');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
