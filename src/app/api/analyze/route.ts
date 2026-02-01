// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      address, 
      currentRent, 
      currentReferenceRate, 
      newReferenceRate, 
      contractDate 
    } = body;

    // Validate inputs
    if (!address || !currentRent || !currentReferenceRate || !newReferenceRate) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder' },
        { status: 400 }
      );
    }

    // Calculate rent reduction based on reference rate change
    // Formula: New Rent = Current Rent * (1 + (New Rate - Current Rate) / 100 * 0.03)
    // Swiss rent law allows 3% change per 0.25% reference rate change
    
    const rateDifference = newReferenceRate - currentReferenceRate;
    const percentageChange = (rateDifference / 0.25) * 3; // 3% per 0.25% rate change
    const newRent = currentRent * (1 + percentageChange / 100);
    const monthlyReduction = currentRent - newRent;
    const yearlySavings = monthlyReduction * 12;

    console.log('📊 Rent calculation:', {
      currentRent,
      currentReferenceRate,
      newReferenceRate,
      rateDifference,
      percentageChange: percentageChange.toFixed(2) + '%',
      newRent: newRent.toFixed(2),
      monthlyReduction: monthlyReduction.toFixed(2),
    });

    return NextResponse.json({
      currentRent,
      newRent,
      monthlyReduction,
      yearlySavings,
      rateDifference,
      percentageChange,
    });

  } catch (error: any) {
    console.error('❌ Analyze error:', error);
    return NextResponse.json(
      { error: 'Berechnung fehlgeschlagen: ' + error.message },
      { status: 500 }
    );
  }
}
