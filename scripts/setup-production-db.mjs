// Setup database tables in PRODUCTION (Neon)
// Run this once to create tables in production database
// Usage: node scripts/setup-production-db.mjs

// Set production database URL before importing
// IMPORTANT: Never commit actual credentials to git!
// Get this from: console.neon.tech → your project → Connection Details
process.env.POSTGRES_URL = process.env.POSTGRES_URL || 'YOUR_POSTGRES_URL_HERE';

import { sql } from '@vercel/postgres';

async function setupProductionDatabase() {
  try {
    console.log('🚀 Setting up PRODUCTION database tables in Neon...');
    console.log('📍 Database:', 'ep-divine-wind-ab1u32a5');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Users table created/verified');

    // Create contracts table with extended fields
    await sql`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        address VARCHAR(500),
        net_rent DECIMAL(10,2),
        reference_rate DECIMAL(4,2),
        contract_date DATE,
        landlord_name VARCHAR(255),
        landlord_address VARCHAR(500),
        tenant_name VARCHAR(255),
        tenant_address VARCHAR(500),
        new_rent DECIMAL(10,2),
        monthly_reduction DECIMAL(10,2),
        yearly_savings DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Contracts table created/verified');

    // Migration: Add new columns if they don't exist
    try {
      await sql`
        ALTER TABLE contracts
        ADD COLUMN IF NOT EXISTS tenant_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS tenant_address VARCHAR(500),
        ADD COLUMN IF NOT EXISTS new_rent DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS monthly_reduction DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS yearly_savings DECIMAL(10,2);
      `;
      console.log('✅ Contracts table columns verified');
    } catch (e) {
      // Columns might already exist, that's OK
      console.log('ℹ️  Columns already exist (expected)');
    }

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
        service_type VARCHAR(50),
        amount DECIMAL(10,2),
        stripe_session_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Transactions table created/verified');

    // Check existing data
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const contractCount = await sql`SELECT COUNT(*) as count FROM contracts`;
    const transactionCount = await sql`SELECT COUNT(*) as count FROM transactions`;

    console.log('\n📊 Current data in production:');
    console.log(`   👥 Users: ${userCount.rows[0].count}`);
    console.log(`   📋 Contracts: ${contractCount.rows[0].count}`);
    console.log(`   💳 Transactions: ${transactionCount.rows[0].count}`);

    console.log('\n✅ Production database setup complete!');
    console.log('🚀 Your app is ready to use on Vercel!');
  } catch (error) {
    console.error('\n❌ Error setting up production database:', error);
    console.error('\nPossible issues:');
    console.error('1. Wrong connection string');
    console.error('2. Network/firewall blocking connection');
    console.error('3. Database credentials expired');
    throw error;
  }
}

async function main() {
  try {
    await setupProductionDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Production database setup failed');
    process.exit(1);
  }
}

main();
