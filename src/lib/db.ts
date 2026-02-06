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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create transactions table with Stripe support
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
        service_type VARCHAR(50),
        amount DECIMAL(10,2),
        stripe_session_id VARCHAR(255) UNIQUE,
        status VARCHAR(50) DEFAULT 'pending',
        paid_at TIMESTAMP,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create payment_failures table for analytics
    await sql`
      CREATE TABLE IF NOT EXISTS payment_failures (
        id SERIAL PRIMARY KEY,
        stripe_payment_intent_id VARCHAR(255),
        error_message TEXT,
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

export async function createTransaction(
  userId: number,
  contractId: number | null,
  serviceType: string,
  amount: number,
  stripeSessionId?: string
) {
  const result = await sql`
    INSERT INTO transactions (user_id, contract_id, service_type, amount, stripe_session_id, status)
    VALUES (${userId}, ${contractId}, ${serviceType}, ${amount}, ${stripeSessionId || null}, 'pending')
    RETURNING *;
  `;
  return result.rows[0];
}

export async function updateTransactionStatus(
  stripeSessionId: string,
  status: string,
  paidAt?: Date
) {
  const paidAtISO = paidAt ? paidAt.toISOString() : null;
  const result = await sql`
    UPDATE transactions
    SET status = ${status},
        paid_at = ${paidAtISO}
    WHERE stripe_session_id = ${stripeSessionId}
    RETURNING *;
  `;
  return result.rows[0];
}

export async function getTransactionBySessionId(stripeSessionId: string) {
  const result = await sql`
    SELECT * FROM transactions WHERE stripe_session_id = ${stripeSessionId} LIMIT 1;
  `;
  return result.rows[0] || null;
}

export async function getUserContracts(userId: number) {
  const result = await sql`
    SELECT * FROM contracts WHERE user_id = ${userId} ORDER BY created_at DESC;
  `;
  return result.rows;
}

export async function getUserTransactions(userId: number) {
  const result = await sql`
    SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC;
  `;
  return result.rows;
}
