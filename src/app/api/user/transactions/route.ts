// src/app/api/user/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sql } from '@vercel/postgres';

/**
 * GET /api/user/transactions
 * Fetches all transactions for the authenticated user
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

    // Fetch user's transactions from database
    const result = await sql`
      SELECT 
        id,
        service_type,
        amount,
        status,
        stripe_session_id,
        created_at
      FROM transactions
      WHERE user_id = ${parseInt(session.user.id)}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      transactions: result.rows,
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Transaktionen' },
      { status: 500 }
    );
  }
}
