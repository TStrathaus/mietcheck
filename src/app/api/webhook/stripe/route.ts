// src/app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('✅ Payment successful:', session.id);

      try {
        // Update transaction status in database
        await sql`
          UPDATE transactions
          SET status = 'completed',
              stripe_session_id = ${session.id},
              paid_at = CURRENT_TIMESTAMP
          WHERE stripe_session_id = ${session.id}
        `;

        // If no existing transaction, create one based on metadata
        const metadata = session.metadata || {};
        if (metadata.email) {
          // Check if user exists
          const userResult = await sql`
            SELECT id FROM users WHERE email = ${metadata.email} LIMIT 1
          `;

          if (userResult.rows.length > 0) {
            const userId = userResult.rows[0].id;

            // Create transaction record if not exists
            await sql`
              INSERT INTO transactions (
                user_id,
                service_type,
                amount,
                stripe_session_id,
                status,
                paid_at,
                metadata
              )
              VALUES (
                ${userId},
                ${metadata.service || 'generate'},
                ${(session.amount_total || 5000) / 100},
                ${session.id},
                'completed',
                CURRENT_TIMESTAMP,
                ${JSON.stringify(metadata)}
              )
              ON CONFLICT (stripe_session_id) DO UPDATE SET
                status = 'completed',
                paid_at = CURRENT_TIMESTAMP
            `;
          }
        }

        console.log('✅ Transaction recorded for session:', session.id);
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        // Don't fail the webhook - Stripe will retry
      }

      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('⏰ Checkout session expired:', session.id);

      try {
        await sql`
          UPDATE transactions
          SET status = 'expired'
          WHERE stripe_session_id = ${session.id}
        `;
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
      }

      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('❌ Payment failed:', paymentIntent.id);
      console.log('Failure reason:', paymentIntent.last_payment_error?.message);

      // Log the failure for analytics
      try {
        await sql`
          INSERT INTO payment_failures (
            stripe_payment_intent_id,
            error_message,
            created_at
          )
          VALUES (
            ${paymentIntent.id},
            ${paymentIntent.last_payment_error?.message || 'Unknown error'},
            CURRENT_TIMESTAMP
          )
        `;
      } catch (dbError) {
        // Table might not exist, that's OK
        console.log('Note: payment_failures table not found');
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
