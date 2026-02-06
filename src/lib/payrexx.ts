// Payrexx Payment Integration for Swiss Market
// Docs: https://docs.payrexx.com

export interface PayrexxConfig {
  instance: string; // Your Payrexx instance name (e.g., 'mietcheck')
  apiSecret: string; // API Secret from Payrexx Dashboard
}

export interface PayrexxGateway {
  id: number;
  hash: string;
  link: string;
}

export interface CreateGatewayParams {
  amount: number; // Amount in cents (e.g., 2000 for CHF 20.00)
  currency: string; // 'CHF'
  purpose: string; // Description
  successRedirectUrl: string;
  failedRedirectUrl: string;
  cancelRedirectUrl: string;
  referenceId?: string; // Your internal reference (e.g., contract ID)
  preAuthorization?: boolean; // Set to false for immediate capture
  vatRate?: number; // VAT rate in percent (e.g., 8.1 for Swiss VAT)
  fields?: {
    title: string;
    value: string;
    mandatory?: boolean;
  }[];
}

export interface PayrexxTransaction {
  id: number;
  status: string; // 'confirmed', 'cancelled', 'waiting', 'declined'
  amount: number;
  currency: string;
  referenceId?: string;
  invoice?: {
    paymentRequestId: number;
    number: string;
  };
  contact?: {
    email?: string;
    firstname?: string;
    lastname?: string;
  };
}

/**
 * Get Payrexx configuration from environment variables
 */
export function getPayrexxConfig(): PayrexxConfig {
  const instance = process.env.PAYREXX_INSTANCE;
  const apiSecret = process.env.PAYREXX_API_SECRET;

  if (!instance || !apiSecret) {
    throw new Error('Payrexx configuration missing. Set PAYREXX_INSTANCE and PAYREXX_API_SECRET in environment variables.');
  }

  return { instance, apiSecret };
}

/**
 * Generate API signature for Payrexx requests
 */
function generateSignature(queryString: string, apiSecret: string): string {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('base64');
}

/**
 * Create a payment gateway (checkout page)
 */
export async function createPaymentGateway(
  params: CreateGatewayParams
): Promise<PayrexxGateway> {
  const config = getPayrexxConfig();

  // Prepare query parameters
  const queryParams: Record<string, any> = {
    amount: params.amount,
    currency: params.currency,
    purpose: params.purpose,
    successRedirectUrl: params.successRedirectUrl,
    failedRedirectUrl: params.failedRedirectUrl,
    cancelRedirectUrl: params.cancelRedirectUrl,
    preAuthorization: params.preAuthorization || false,
  };

  if (params.referenceId) {
    queryParams.referenceId = params.referenceId;
  }

  if (params.vatRate) {
    queryParams.vatRate = params.vatRate;
  }

  if (params.fields && params.fields.length > 0) {
    queryParams.fields = params.fields;
  }

  // Build query string
  const queryString = Object.keys(queryParams)
    .sort()
    .map(key => {
      const value = queryParams[key];
      if (typeof value === 'object') {
        return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');

  // Generate signature
  const signature = generateSignature(queryString, config.apiSecret);

  // API Request
  const url = `https://api.payrexx.com/v1.0/Gateway/?instance=${config.instance}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'API-KEY': signature,
    },
    body: queryString,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Payrexx API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.status !== 'success') {
    throw new Error(`Payrexx Error: ${data.message || 'Unknown error'}`);
  }

  return {
    id: data.data[0].id,
    hash: data.data[0].hash,
    link: data.data[0].link,
  };
}

/**
 * Get transaction details
 */
export async function getTransaction(transactionId: number): Promise<PayrexxTransaction> {
  const config = getPayrexxConfig();

  const queryString = `transactionId=${transactionId}`;
  const signature = generateSignature(queryString, config.apiSecret);

  const url = `https://api.payrexx.com/v1.0/Transaction/${transactionId}/?instance=${config.instance}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'API-KEY': signature,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Payrexx API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.status !== 'success') {
    throw new Error(`Payrexx Error: ${data.message || 'Unknown error'}`);
  }

  return data.data[0];
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  receivedSignature: string,
  apiSecret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', apiSecret)
    .update(payload)
    .digest('base64');

  return receivedSignature === expectedSignature;
}

/**
 * Helper: Convert CHF amount to cents
 */
export function chfToCents(chf: number): number {
  return Math.round(chf * 100);
}

/**
 * Helper: Convert cents to CHF
 */
export function centsToChf(cents: number): number {
  return cents / 100;
}
