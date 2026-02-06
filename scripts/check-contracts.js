// Check contracts in database
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.POSTGRES_URL);

(async () => {
  try {
    // Count all contracts
    const contractsCount = await sql`SELECT COUNT(*) as count FROM contracts`;
    console.log('📄 Total Contracts:', contractsCount[0].count);

    if (contractsCount[0].count > 0) {
      // Show recent contracts
      const contracts = await sql`
        SELECT id, user_id, address, current_rent, created_at
        FROM contracts
        ORDER BY created_at DESC
        LIMIT 5
      `;
      console.log('\n🔍 Recent Contracts:');
      contracts.forEach(c => {
        console.log(`  ID: ${c.id}, User: ${c.user_id}, Adresse: ${c.address}, Miete: CHF ${c.current_rent}, Datum: ${new Date(c.created_at).toLocaleDateString('de-CH')}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
