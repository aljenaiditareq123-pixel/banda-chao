import Stripe from 'stripe';

// Check if Stripe is configured
export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;

// Warn if Stripe is not configured in production
if (!isStripeConfigured && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ [WARNING] STRIPE_SECRET_KEY is not set. Payment features will be disabled.');
  console.warn('⚠️ To enable payments, set STRIPE_SECRET_KEY in environment variables.');
}

// Initialize Stripe client (use dummy key if not configured, but won't work for real payments)
// We create the instance to avoid type errors, but check isStripeConfigured before using it
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_testing';
export const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
});

// Check if we're in test mode
export const isTestMode = process.env.STRIPE_MODE === 'test' || process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(params: {
  orderId: string;
  productName: string;
  amount: number;
  currency: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}): Promise<Stripe.Checkout.Session> {
  if (!isStripeConfigured) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
  }

  const { orderId, productName, amount, currency, quantity, successUrl, cancelUrl, customerEmail } = params;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: productName,
            description: isTestMode ? `[TEST MODE] ${productName}` : productName,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: quantity,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId: orderId,
    },
    customer_email: customerEmail,
    // Add test mode indicator in description
    payment_intent_data: isTestMode
      ? {
          description: `[TEST MODE] Order ${orderId}`,
        }
      : undefined,
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  if (!isStripeConfigured) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
  }
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

