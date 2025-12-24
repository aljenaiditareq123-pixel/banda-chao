import Stripe from 'stripe';

// Check if Stripe is configured
export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;

// Warn if Stripe is not configured in production
if (!isStripeConfigured && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ [WARNING] STRIPE_SECRET_KEY is not set. Payment features will be disabled.');
  console.warn('⚠️ To enable payments, set STRIPE_SECRET_KEY in environment variables.');
}

// Initialize Stripe client conditionally
// Only create instance if key is provided to avoid invalid API calls
let stripeInstance: Stripe | null = null;

if (isStripeConfigured) {
  try {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
    console.log('[Stripe] ✅ Stripe client initialized successfully');
  } catch (error: any) {
    console.error('[Stripe] ❌ Failed to initialize Stripe client:', error.message);
    stripeInstance = null;
  }
}

// Helper to check if Stripe operations are available
function ensureStripeConfigured(): Stripe {
  if (!stripeInstance || !isStripeConfigured) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
  }
  return stripeInstance;
}

// Export stripe for backward compatibility (will throw if used without configuration check)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = ensureStripeConfigured();
    return (client as any)[prop];
  }
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
  const stripeClient = ensureStripeConfigured();

  const { orderId, productName, amount, currency, quantity, successUrl, cancelUrl, customerEmail } = params;

  const session = await stripeClient.checkout.sessions.create({
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
  const stripeClient = ensureStripeConfigured();
  return stripeClient.webhooks.constructEvent(payload, signature, secret);
}

