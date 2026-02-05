import { NextRequest, NextResponse } from 'next/server';
import { createUser, createContract, getUser } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email-service';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, address, netRent, referenceRate, contractDate } = body;

    // Validation
    if (!email || !address || !netRent || !referenceRate || !contractDate) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt werden' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await getUser(email);
    
    let userId: number;
    
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with random password (they can reset it later)
      const randomPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const newUser = await createUser(email, passwordHash, name);
      userId = newUser.id;
    }

    // Create contract
    await createContract(userId, {
      address,
      netRent: parseFloat(netRent),
      referenceRate: parseFloat(referenceRate),
      contractDate,
      landlordName: '',
      landlordAddress: '',
    });

    // Send welcome email (async, don't block registration)
    if (!existingUser) {
      sendWelcomeEmail({
        to: email,
        userName: name,
        userEmail: email,
      }).catch((error) => {
        console.error('Failed to send welcome email:', error);
        // Don't fail registration if email fails
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Registrierung erfolgreich! Du erhältst eine E-Mail sobald der Referenzzinssatz sinkt.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Registrierung: ' + error.message },
      { status: 500 }
    );
  }
}
