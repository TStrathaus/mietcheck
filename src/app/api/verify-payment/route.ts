// Payment Verification API - Payrexx Integration
import { NextRequest, NextResponse } from 'next/server';
import { getTransaction } from '@/lib/payrexx';

export async function POST(request: NextRequest) {
  try {
    const { transactionId, sessionId } = await request.json();

    // Handle test mode
    if (sessionId === 'TEST_MODE' || !process.env.PAYREXX_INSTANCE) {
      return NextResponse.json({
        verified: true,
        testMode: true,
        message: 'Payment verified in test mode',
      });
    }

    if (!transactionId) {
      return NextResponse.json(
        { verified: false, error: 'Transaction ID required' },
        { status: 400 }
      );
    }

    // Get transaction details from Payrexx
    const transaction = await getTransaction(parseInt(transactionId));

    if (transaction.status === 'confirmed') {
      return NextResponse.json({
        verified: true,
        transaction: {
          id: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          referenceId: transaction.referenceId,
          contact: transaction.contact,
        },
      });
    }

    return NextResponse.json({
      verified: false,
      error: 'Payment not confirmed',
      status: transaction.status,
    });

  } catch (error: any) {
    console.error('❌ Payment verification error:', error);

    return NextResponse.json(
      { verified: false, error: error.message },
      { status: 500 }
    );
  }
}
