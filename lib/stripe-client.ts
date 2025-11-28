/**
 * Stripe Client for Frontend
 * Initializes and loads Stripe.js for client-side payment processing
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get publishable key from environment variables
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Singleton instance to prevent multiple initializations
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Initialize and load Stripe.js
 * Returns a promise that resolves to the Stripe instance
 * 
 * @returns Promise<Stripe | null> - Stripe instance or null if key is missing
 */
export function getStripe(): Promise<Stripe | null> {
  // Return existing promise if already initialized
  if (stripePromise) {
    return stripePromise;
  }

  // Check if publishable key is available
  if (!stripePublishableKey) {
    console.warn('[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
    stripePromise = Promise.resolve(null);
    return stripePromise;
  }

  // Initialize Stripe
  stripePromise = loadStripe(stripePublishableKey);
  return stripePromise;
}

/**
 * Check if Stripe is available
 * @returns boolean - true if Stripe can be initialized
 */
export function isStripeAvailable(): boolean {
  return !!stripePublishableKey && stripePublishableKey.startsWith('pk_');
}

/**
 * Redirect to Stripe Checkout
 * @param sessionId - Stripe Checkout Session ID
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  
  if (!stripe) {
    throw new Error('Stripe is not initialized. Please check your environment variables.');
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });

  if (error) {
    throw new Error(error.message || 'Failed to redirect to checkout');
  }
}

