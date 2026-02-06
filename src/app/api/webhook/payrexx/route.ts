// Payrexx Webhook Handler
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyWebhookSignature, getTransaction, centsToChf } from '@/lib/payrexx';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('X-Payrexx-Signature') || '';
    const apiSecret = process.env.PAYREXX_API_SECRET || '';

    console.log('📨 Payrexx webhook received');

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature, apiSecret)) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    console.log('✅ Webhook verified:', payload);

    // Extract transaction data
    const { transaction } = payload;

    if (!transaction || !transaction.id) {
      console.error('❌ No transaction data in webhook');
      return NextResponse.json(
        { error: 'No transaction data' },
        { status: 400 }
      );
    }

    // Get full transaction details from Payrexx API
    const transactionDetails = await getTransaction(transaction.id);

    console.log('📊 Transaction details:', {
      id: transactionDetails.id,
      status: transactionDetails.status,
      amount: transactionDetails.amount,
      referenceId: transactionDetails.referenceId,
    });

    // Only process confirmed transactions
    if (transactionDetails.status !== 'confirmed') {
      console.log('⏳ Transaction not confirmed yet:', transactionDetails.status);
      return NextResponse.json({ received: true, status: transactionDetails.status });
    }

    // Extract contract ID from referenceId (format: "contract_123")
    let contractId: number | null = null;
    if (transactionDetails.referenceId && transactionDetails.referenceId.startsWith('contract_')) {
      contractId = parseInt(transactionDetails.referenceId.replace('contract_', ''));
    }

    // Determine service type from amount
    const amountChf = centsToChf(transactionDetails.amount);
    let serviceType = 'unknown';
    if (amountChf === 9) {
      serviceType = 'analyze';
    } else if (amountChf === 49) {
      serviceType = 'generate';
    }

    // Try to find user_id from contract_id if available
    let userId: number | null = null;
    if (contractId) {
      try {
        const contractResult = await sql`
          SELECT user_id FROM contracts WHERE id = ${contractId}
        `;
        if (contractResult.rows.length > 0) {
          userId = contractResult.rows[0].user_id;
        }
      } catch (err) {
        console.error('Error fetching contract:', err);
      }
    }

    // Check if transaction already exists
    const existing = await sql`
      SELECT id FROM transactions
      WHERE payrexx_transaction_id = ${transactionDetails.id.toString()}
    `;

    if (existing.rows.length > 0) {
      console.log('ℹ️ Transaction already processed:', transactionDetails.id);
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    // Store transaction in database
    await sql`
      INSERT INTO transactions (
        user_id,
        contract_id,
        service_type,
        amount,
        payrexx_transaction_id,
        status,
        created_at
      )
      VALUES (
        ${userId},
        ${contractId},
        ${serviceType},
        ${amountChf},
        ${transactionDetails.id.toString()},
        'completed',
        NOW()
      )
    `;

    console.log('✅ Transaction stored in database');

    // TODO: Send confirmation email to user
    // TODO: Unlock document download

    return NextResponse.json({
      received: true,
      transactionId: transactionDetails.id,
      status: 'processed',
    });

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
