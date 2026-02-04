// src/app/api/user/contracts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@vercel/postgres';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const contractId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    if (isNaN(contractId)) {
      return NextResponse.json(
        { error: 'Ungültige Vertrags-ID' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT
        id,
        address,
        net_rent,
        reference_rate,
        contract_date,
        landlord_name,
        landlord_address,
        tenant_name,
        tenant_address,
        new_rent,
        monthly_reduction,
        yearly_savings,
        created_at
      FROM contracts
      WHERE id = ${contractId} AND user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Vertrag nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contract: result.rows[0],
    });

  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Vertrags' },
      { status: 500 }
    );
  }
}
