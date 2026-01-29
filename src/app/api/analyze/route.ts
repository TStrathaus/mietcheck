import { NextRequest, NextResponse } from 'next/server';
import { calculateRentReduction, getCurrentReferenceRate } from '@/lib/calculator';
import { generateAnalysisReport } from '@/lib/document-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, address, netRent, referenceRate, contractDate } = body;

    // Validation
    if (!email || !address || !netRent || !referenceRate || !contractDate) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
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

    // Check if there is any reduction
    if (calculation.netReduction <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Leider hast du aktuell keinen Anspruch auf Mietminderung.',
        calculation,
      });
    }

    // Generate PDF report
    const reportData = {
      address,
      currentRent: parseFloat(netRent),
      referenceRate: parseFloat(referenceRate),
      contractDate,
      calculation,
    };

    // In production, this would save to DB and create transaction
    // For MVP, we return the calculation directly

    return NextResponse.json({
      success: true,
      calculation,
      message: 'Analyse erfolgreich abgeschlossen!',
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Analyse: ' + error.message },
      { status: 500 }
    );
  }
}
