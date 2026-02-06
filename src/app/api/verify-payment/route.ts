// src/app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { verified: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return NextResponse.json({
        verified: true,
        session: {
          id: session.id,
          customerEmail: session.customer_email,
          amountTotal: session.amount_total,
          metadata: session.metadata,
          paymentStatus: session.payment_status,
        },
      });
    }

    return NextResponse.json({
      verified: false,
      error: 'Payment not completed',
      paymentStatus: session.payment_status,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { verified: false, error: error.message },
      { status: 500 }
    );
  }
}
