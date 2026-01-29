// Run this script once after deployment to set up database tables
// Usage: node scripts/setup-db.js

const { setupDatabase } = require('../src/lib/db');

async function main() {
  console.log('🚀 Setting up database tables...');
  
  try {
    await setupDatabase();
    console.log('✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

main();
