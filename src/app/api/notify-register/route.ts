// API Route: Register email for notifications (Service 0)
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await sql`
      SELECT id FROM notification_list WHERE email = ${email}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse ist bereits eingetragen' },
        { status: 400 }
      );
    }

    // Insert into notification list
    await sql`
      INSERT INTO notification_list (email, created_at)
      VALUES (${email}, NOW())
    `;

    console.log('✅ Email added to notification list:', email);

    // TODO: Send confirmation email via Resend

    return NextResponse.json({
      success: true,
      message: 'E-Mail erfolgreich eingetragen',
    });

  } catch (error) {
    console.error('❌ Error registering notification email:', error);
    return NextResponse.json(
      { error: 'Eintragung fehlgeschlagen. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    );
  }
}
