import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'test') {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize Stripe client (use dummy key in test mode)
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
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

