// src/app/api/user/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { createContract } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/user/contracts - Start');
    const session = await getServerSession(authOptions);

    console.log('Session:', {
      exists: !!session,
      userId: session?.user?.id,
      userIdType: typeof session?.user?.id,
    });

    if (!session?.user?.id) {
      console.warn('⚠️ No session or user ID');
      return NextResponse.json(
        { error: 'Nicht authentifiziert', success: false, contracts: [] },
        { status: 401 }
      );
    }

    const userId = typeof session.user.id === 'string'
      ? parseInt(session.user.id, 10)
      : session.user.id;

    console.log('📊 Querying contracts for user:', userId);

    const result = await sql`
      SELECT
        id,
        address,
        net_rent,
        new_rent,
        monthly_reduction,
        yearly_savings,
        reference_rate,
        contract_date,
        landlord_name,
        landlord_address,
        tenant_name,
        tenant_address,
        created_at
      FROM contracts
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    console.log('✅ Found contracts:', result.rows.length);

    return NextResponse.json({
      success: true,
      contracts: result.rows,
    });

  } catch (error) {
    console.error('❌ Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Verträge', success: false, contracts: [], details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('📝 POST /api/user/contracts - Session:', session ? 'exists' : 'missing');
    console.log('👤 User ID:', session?.user?.id);

    if (!session?.user?.id) {
      console.warn('⚠️ Unauthorized request - no session');
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('📦 Contract data received:', {
      address: data.address,
      netRent: data.netRent,
      newRent: data.newRent,
    });

    // Create contract in database
    const contract = await createContract(parseInt(session.user.id), {
      address: data.address,
      netRent: data.netRent,
      referenceRate: data.referenceRate,
      contractDate: data.contractDate,
      landlordName: data.landlordName,
      landlordAddress: data.landlordAddress,
      tenantName: data.tenantName,
      tenantAddress: data.tenantAddress,
      newRent: data.newRent,
      monthlyReduction: data.monthlyReduction,
      yearlySavings: data.yearlySavings,
    });

    console.log('✅ Contract created with ID:', contract.id);

    return NextResponse.json({
      success: true,
      contractId: contract.id,
      contract,
    });

  } catch (error) {
    console.error('❌ Error creating contract:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Vertrags', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
