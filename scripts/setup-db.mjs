// Run this script once after deployment to set up database tables
// Usage: node scripts/setup-db.mjs

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../.env.local') });

import { sql } from '@vercel/postgres';

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database tables...');

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
    console.log('✅ Users table created');

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
    console.log('✅ Contracts table created');

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
      console.log('✅ Contracts table migrated');
    } catch (e) {
      // Columns might already exist, that's OK
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
    console.log('✅ Transactions table created');

    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

async function main() {
  try {
    await setupDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

main();
