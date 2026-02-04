// src/app/api/analyze/route.ts (Updated with validation and MietHistorie)
import { NextRequest, NextResponse } from 'next/server';
import {
  MietHistorie,
  validateMietHistorie,
  berechneMiete,
  berechneEinsparung,
} from '@/lib/miet-calculator';
import {
  validateContractInput,
  validateDataConsistency,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address,
      currentRent,
      currentReferenceRate,
      newReferenceRate,
      contractDate,
      mietHistorie,
    } = body;

    // Basic required fields check
    if (!address || !currentRent || !currentReferenceRate || !newReferenceRate) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder' },
        { status: 400 }
      );
    }

    // Comprehensive validation with sanity checks
    const inputValidation = validateContractInput({
      address,
      netRent: currentRent,
      referenceRate: currentReferenceRate,
      contractDate,
    });

    if (!inputValidation.valid) {
      return NextResponse.json(
        {
          error: inputValidation.errors[0],
          validationErrors: inputValidation.errors,
        },
        { status: 400 }
      );
    }

    // Consistency checks
    const consistencyValidation = validateDataConsistency({
      address,
      netRent: currentRent,
      referenceRate: currentReferenceRate,
      contractDate,
    });

    // Collect all warnings
    const allWarnings = [
      ...inputValidation.warnings,
      ...consistencyValidation.warnings,
    ];

    // If MietHistorie is provided, use it for more accurate calculation
    if (mietHistorie) {
      console.log('📊 Calculating with MietHistorie:', mietHistorie);

      // Validate history
      const validation = validateMietHistorie(mietHistorie as MietHistorie);

      if (!validation.isValid) {
        return NextResponse.json({
          error: 'Miethistorie enthält Fehler',
          validationErrors: validation.errors,
        }, { status: 400 });
      }

      // Use validated data from history
      const aktuelleAnpassung = mietHistorie.aktuell;
      const sollMiete = berechneMiete(
        aktuelleAnpassung.miete,
        aktuelleAnpassung.referenzzinssatz,
        newReferenceRate
      );

      const monthlyReduction = aktuelleAnpassung.miete - sollMiete;
      const yearlySavings = monthlyReduction * 12;

      // Calculate total savings since reference rate dropped
      let einsparungDetails = null;
      if (validation.sollMiete && validation.istMiete) {
        einsparungDetails = berechneEinsparung(
          validation.sollMiete,
          validation.istMiete,
          aktuelleAnpassung.datum
        );
      }

      return NextResponse.json({
        currentRent: aktuelleAnpassung.miete,
        newRent: sollMiete,
        monthlyReduction,
        yearlySavings,
        validation: {
          warnings: [...allWarnings, ...validation.warnings],
          errors: validation.errors,
        },
        einsparungDetails,
        hasHistory: true,
      });
    }

    // Fallback: Simple calculation without history
    console.log('📊 Simple calculation without history');

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
      hasHistory: false,
      validation: {
        warnings: allWarnings,
        errors: [],
      },
    });

  } catch (error: any) {
    console.error('❌ Analyze error:', error);
    return NextResponse.json(
      { error: 'Berechnung fehlgeschlagen: ' + error.message },
      { status: 500 }
    );
  }
}
