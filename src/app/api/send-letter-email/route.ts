// src/app/api/send-letter-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendLetterWithAttachmentEmail } from '@/lib/email-service';
import { generateHerabsetzungsbegehren } from '@/lib/document-generator';
import { calculateRentReduction, getCurrentReferenceRate } from '@/lib/calculator';

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Please log in'
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      tenantName,
      tenantAddress,
      tenantCity,
      propertyAddress,
      netRent,
      referenceRate,
      contractDate,
      landlordName,
      landlordAddress,
      landlordCity,
    } = body;

    // Validation
    if (!tenantName || !propertyAddress || !netRent || !landlordName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alle Pflichtfelder müssen ausgefüllt werden',
        },
        { status: 400 }
      );
    }

    // Calculate rent reduction
    const calculation = calculateRentReduction({
      currentRent: parseFloat(netRent),
      currentReferenceRate: parseFloat(referenceRate),
      newReferenceRate: getCurrentReferenceRate(),
      contractDate: new Date(contractDate),
    });

    // Calculate next termination date (next quarter end)
    const nextTerminationDate = getNextTerminationDate();

    // Generate PDF
    const documentData = {
      tenant: {
        name: tenantName,
        address: tenantAddress,
        city: tenantCity,
      },
      landlord: {
        name: landlordName,
        address: landlordAddress,
        city: landlordCity,
      },
      contract: {
        address: propertyAddress,
        contractDate,
        currentRent: parseFloat(netRent),
        referenceRate: parseFloat(referenceRate),
      },
      calculation: {
        newRent: calculation.newRent,
        netReduction: calculation.netReduction,
        yearlySavings: calculation.yearlySavings,
      },
      nextTerminationDate,
    };

    console.log('📄 Generating PDF for email...');
    const pdfBuffer = generateHerabsetzungsbegehren(documentData);

    // Send email with PDF attachment
    console.log('📧 Sending email to:', session.user.email);
    const result = await sendLetterWithAttachmentEmail({
      to: session.user.email,
      userName: session.user.name || tenantName,
      address: propertyAddress,
      monthlyReduction: calculation.netReduction,
      pdfBuffer: Buffer.from(pdfBuffer),
      pdfFilename: `herabsetzungsbegehren_${propertyAddress.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send email',
        },
        { status: 500 }
      );
    }

    console.log('✅ Letter email sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Brief wurde erfolgreich per E-Mail versendet',
    });

  } catch (error: any) {
    console.error('❌ Send letter email error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send email',
      },
      { status: 500 }
    );
  }
}

function getNextTerminationDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Swiss rental law: termination dates are usually end of quarter (Mar 31, Jun 30, Sep 30, Dec 31)
  // Plus 3 months notice period
  const terminationDates = [
    new Date(year, 2, 31), // March 31
    new Date(year, 5, 30), // June 30
    new Date(year, 8, 30), // September 30
    new Date(year, 11, 31), // December 31
  ];

  // Add 3 months notice period
  const deadline = new Date(now);
  deadline.setMonth(deadline.getMonth() + 3);

  // Find next termination date after deadline
  for (const date of terminationDates) {
    if (date > deadline) {
      return date.toLocaleDateString('de-CH', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }

  // If all dates this year have passed, return March 31 next year
  return new Date(year + 1, 2, 31).toLocaleDateString('de-CH', { year: 'numeric', month: 'long', day: 'numeric' });
}
