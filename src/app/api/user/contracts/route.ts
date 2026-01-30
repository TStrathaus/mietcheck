// src/app/api/user/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sql } from '@vercel/postgres';

/**
 * GET /api/user/contracts
 * Fetches all contracts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Fetch user's contracts from database
    const result = await sql`
      SELECT 
        id,
        address,
        net_rent,
        reference_rate,
        contract_date,
        landlord_name,
        landlord_address,
        created_at
      FROM contracts
      WHERE user_id = ${parseInt(session.user.id)}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      contracts: result.rows,
    });

  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Verträge' },
      { status: 500 }
    );
  }
}
