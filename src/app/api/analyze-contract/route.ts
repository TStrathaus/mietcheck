// src/app/api/analyze-contract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeContract } from '@/lib/contract-analyzer';

/**
 * POST /api/analyze-contract
 * Analyzes rental contract text using GPT-4
 * 
 * Request body:
 * {
 *   "extractedText": "full contract text..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": { ContractData },
 *   "error": "error message" (if failed)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { extractedText } = body;

    // Validate input
    if (!extractedText || typeof extractedText !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Kein Text zur Analyse bereitgestellt.',
        },
        { status: 400 }
      );
    }

    // Check text length
    if (extractedText.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Text zu kurz. Bitte laden Sie einen vollständigen Mietvertrag hoch.',
        },
        { status: 400 }
      );
    }

    // Analyze contract using GPT-4
    console.log('🔍 Analyzing contract with GPT-4...');
    const result = await analyzeContract(extractedText);

    if (!result.success) {
      console.error('❌ Analysis failed:', result.error);
      return NextResponse.json(result, { status: 422 });
    }

    console.log('✅ Contract analysis successful');
    console.log('📊 Extracted data:', result.data);

    // Return successful result
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('❌ API Error in /api/analyze-contract:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Serverfehler bei der Vertragsanalyse.',
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
