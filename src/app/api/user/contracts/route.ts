// src/app/api/user/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
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

// POST: Neuen Vertrag speichern
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      address,
      netRent,
      referenceRate,
      contractDate,
      landlordName,
      landlordAddress,
      tenantName,
      tenantAddress,
      newRent,
      monthlyReduction,
      yearlySavings,
    } = body;

    // Validierung
    if (!address || !netRent || !referenceRate) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder (Adresse, Miete, Referenzzins)' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);

    // Vertrag speichern
    const result = await sql`
      INSERT INTO contracts (
        user_id,
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
        yearly_savings
      )
      VALUES (
        ${userId},
        ${address},
        ${netRent},
        ${referenceRate},
        ${contractDate || null},
        ${landlordName || null},
        ${landlordAddress || null},
        ${tenantName || null},
        ${tenantAddress || null},
        ${newRent || null},
        ${monthlyReduction || null},
        ${yearlySavings || null}
      )
      RETURNING *
    `;

    console.log('✅ Contract saved:', result.rows[0]);

    return NextResponse.json({
      success: true,
      contract: result.rows[0],
    });

  } catch (error: any) {
    console.error('Error saving contract:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Vertrags: ' + error.message },
      { status: 500 }
    );
  }
}
