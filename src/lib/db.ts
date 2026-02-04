import { sql } from '@vercel/postgres';

export async function setupDatabase() {
  try {
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

    // Create contracts table
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

    // Add new columns if they don't exist (for existing databases)
    try {
      await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tenant_name VARCHAR(255)`;
      await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tenant_address VARCHAR(500)`;
      await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS new_rent DECIMAL(10,2)`;
      await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS monthly_reduction DECIMAL(10,2)`;
      await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS yearly_savings DECIMAL(10,2)`;
    } catch (e) {
      // Columns might already exist, ignore error
      console.log('Columns already exist or migration not needed');
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

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

export async function getUser(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1;
  `;
  return result.rows[0] || null;
}

export async function createUser(email: string, passwordHash: string, name?: string) {
  const result = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name || ''})
    RETURNING id, email, name, created_at;
  `;
  return result.rows[0];
}

export async function createContract(userId: number, data: any) {
  const result = await sql`
    INSERT INTO contracts (
      user_id, address, net_rent, reference_rate, contract_date,
      landlord_name, landlord_address
    )
    VALUES (
      ${userId}, ${data.address}, ${data.netRent}, ${data.referenceRate},
      ${data.contractDate}, ${data.landlordName}, ${data.landlordAddress}
    )
    RETURNING *;
  `;
  return result.rows[0];
}

export async function createTransaction(userId: number, contractId: number, serviceType: string, amount: number) {
  const result = await sql`
    INSERT INTO transactions (user_id, contract_id, service_type, amount, status)
    VALUES (${userId}, ${contractId}, ${serviceType}, ${amount}, 'completed')
    RETURNING *;
  `;
  return result.rows[0];
}

export async function getUserContracts(userId: number) {
  const result = await sql`
    SELECT * FROM contracts WHERE user_id = ${userId} ORDER BY created_at DESC;
  `;
  return result.rows;
}
