/**
 * Stripe Client for Frontend
 * Initializes and loads Stripe.js for client-side payment processing
 * The Backup Plan: Graceful degradation with retry logic
 */

import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js';
import { maintenanceLogger } from './maintenance-logger';

// Get publishable key from environment variables
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Singleton instance to prevent multiple initializations
let stripePromise: Promise<StripeType | null> | null = null;

/**
 * Initialize and load Stripe.js
 * Returns a promise that resolves to the Stripe instance
 * 
 * @returns Promise<StripeType | null> - Stripe instance or null if key is missing
 */
export function getStripe(): Promise<StripeType | null> {
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
 * Redirect to Stripe Checkout with retry logic
 * The Backup Plan: Graceful degradation if Stripe is down
 * @param sessionId - Stripe Checkout Session ID
 * @param retries - Number of retry attempts (default: 3)
 */
export async function redirectToCheckout(sessionId: string, retries: number = 3): Promise<void> {
  const maxRetries = retries;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe is not initialized. Please check your environment variables.');
      }

      // redirectToCheckout is available on Stripe instance from @stripe/stripe-js
      const { error } = await (stripe as any).redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw new Error(error.message || 'Failed to redirect to checkout');
      }

      // Success
      if (attempt > 1) {
        maintenanceLogger.log('stripe_recovery', {
          message: `Stripe checkout recovered after ${attempt - 1} retries`,
          sessionId,
          status: 'stable',
        }, 'info');
      }

      return;
    } catch (error: any) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) {
        maintenanceLogger.log('stripe_error', {
          message: `Stripe checkout failed after ${maxRetries} attempts`,
          error: error.message,
          sessionId,
          status: 'critical',
        }, 'error');
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * Math.pow(2, attempt - 1);
      
      maintenanceLogger.log('stripe_retry', {
        message: `Stripe API slow/down. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`,
        attempt,
        maxRetries,
        delay: `${delay}ms`,
        sessionId,
      }, 'warning');

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Failed to redirect to Stripe checkout');
}

/**
 * Save order as draft locally (The Backup Plan)
 */
export function saveOrderDraft(orderData: {
  productId: string;
  quantity: number;
  shippingAddress: any;
  total: number;
}): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bandaChao_orderDraft', JSON.stringify({
        ...orderData,
        timestamp: new Date().toISOString(),
      }));
      
      maintenanceLogger.log('order_draft_saved', {
        message: 'Order saved as draft due to Stripe failure',
        productId: orderData.productId,
      }, 'info');
    }
  } catch (error) {
    // Silently fail
  }
}

/**
 * Get saved order draft
 */
export function getOrderDraft(): any | null {
  try {
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem('bandaChao_orderDraft');
      return draft ? JSON.parse(draft) : null;
    }
  } catch (error) {
    return null;
  }
  return null;
}

/**
 * Clear saved order draft
 */
export function clearOrderDraft(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bandaChao_orderDraft');
    }
  } catch (error) {
    // Silently fail
  }
}

