// Payment Checkout API - Payrexx Integration
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPaymentGateway, chfToCents } from '@/lib/payrexx';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { service, contractId, email } = body;

    // Validate service type
    if (!['analyze', 'generate'].includes(service)) {
      return NextResponse.json(
        { error: 'Ungültiger Service-Typ' },
        { status: 400 }
      );
    }

    // Define service details
    const serviceDetails = {
      analyze: {
        name: 'Service 1: Mietvertrag-Analyse',
        description: 'KI-Analyse mit Ersparnis-Berechnung',
        price: 9, // CHF
      },
      generate: {
        name: 'Service 2: Brief-Generierung',
        description: 'Rechtssicheres Herabsetzungsbegehren als PDF',
        price: 49, // CHF
      },
    };

    const selectedService = serviceDetails[service as keyof typeof serviceDetails];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Check if Payrexx is configured
    const payrexxInstance = process.env.PAYREXX_INSTANCE;
    const payrexxSecret = process.env.PAYREXX_API_SECRET;

    if (!payrexxInstance || !payrexxSecret) {
      console.warn('⚠️ Payrexx not configured, returning test mode URL');

      // Return test/demo URL when Payrexx is not configured
      return NextResponse.json({
        url: `${baseUrl}/payment/success?session_id=TEST_MODE&service=${service}`,
        sessionId: 'TEST_MODE',
        testMode: true,
        message: 'Payrexx not configured. Using test mode.',
      });
    }

    // Create Payrexx payment gateway
    const gateway = await createPaymentGateway({
      amount: chfToCents(selectedService.price), // Convert CHF to cents
      currency: 'CHF',
      purpose: selectedService.name,
      successRedirectUrl: `${baseUrl}/payment/success?service=${service}${contractId ? `&contractId=${contractId}` : ''}`,
      failedRedirectUrl: `${baseUrl}/payment/cancel?service=${service}`,
      cancelRedirectUrl: `${baseUrl}/payment/cancel?service=${service}`,
      referenceId: contractId ? `contract_${contractId}` : `${service}_${Date.now()}`,
      preAuthorization: false, // Immediate capture
      fields: email ? [
        {
          title: 'E-Mail',
          value: email,
          mandatory: true,
        },
      ] : undefined,
    });

    console.log('✅ Payrexx gateway created:', {
      id: gateway.id,
      hash: gateway.hash,
      service,
      amount: selectedService.price,
    });

    return NextResponse.json({
      url: gateway.link,
      sessionId: gateway.hash,
      gatewayId: gateway.id,
    });

  } catch (error: any) {
    console.error('❌ Checkout error:', error);

    return NextResponse.json(
      {
        error: 'Fehler beim Erstellen der Checkout-Session: ' + error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
