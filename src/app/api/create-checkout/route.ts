import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, amount, email, metadata } = body;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: service === 'analyze' ? 'Service 1: Anspruchsanalyse' : 'Service 2: Dokument-Erstellung',
              description: service === 'analyze'
                ? 'KI-Analyse deines Mietvertrags mit Ersparnis-Berechnung'
                : 'Rechtssicheres Herabsetzungsbegehren als PDF',
            },
            unit_amount: amount, // in Rappen
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      // Include session_id in the success URL for verification
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&service=${service}`,
      cancel_url: `${baseUrl}/payment/cancel?service=${service}`,
      metadata: {
        service,
        email,
        ...metadata,
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Checkout-Session: ' + error.message },
      { status: 500 }
    );
  }
}
