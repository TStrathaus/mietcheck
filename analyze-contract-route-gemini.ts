// src/app/api/analyze-contract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeContract } from '@/lib/contract-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { extractedText } = body;

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Text zu kurz für Analyse' 
        },
        { status: 400 }
      );
    }

    console.log('📝 Starting contract analysis...');
    console.log('📄 Text length:', extractedText.length);

    // Analyze with Gemini
    const result = await analyzeContract(extractedText);

    console.log('✅ Analysis complete:', {
      address: result.address,
      netRent: result.netRent,
      confidence: result.confidence
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('❌ Analysis error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Analyse fehlgeschlagen',
      },
      { status: 500 }
    );
  }
}
