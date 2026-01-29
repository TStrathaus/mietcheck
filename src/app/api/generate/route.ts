import { NextRequest, NextResponse } from 'next/server';
import { generateHerabsetzungsbegehren } from '@/lib/document-generator';
import { calculateRentReduction, getCurrentReferenceRate } from '@/lib/calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
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
    if (!email || !tenantName || !propertyAddress || !netRent || !landlordName) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt werden' },
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

    const pdfBuffer = generateHerabsetzungsbegehren(documentData);

    // Return PDF
   return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="herabsetzungsbegehren.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Document generation error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Dokument-Generierung: ' + error.message },
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
