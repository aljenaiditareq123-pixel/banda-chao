/**
 * Analytics / Tracking Helper
 * 
 * This module provides a simple way to track events in the application.
 * Currently, events are sent to the backend API, but the structure allows
 * for future integration with external analytics services (Google Analytics,
 * Plausible, etc.).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE_URL}/api/v1`;

// Event types
export const EventType = {
  PAGE_VIEW: 'PAGE_VIEW',
  CLICK: 'CLICK',
  CHECKOUT_STARTED: 'CHECKOUT_STARTED',
  CHECKOUT_COMPLETED: 'CHECKOUT_COMPLETED',
  CHECKOUT_CANCELLED: 'CHECKOUT_CANCELLED',
  AI_MESSAGE_SENT: 'AI_MESSAGE_SENT',
  PRODUCT_VIEWED: 'PRODUCT_VIEWED',
  MAKER_VIEWED: 'MAKER_VIEWED',
  VIDEO_VIEWED: 'VIDEO_VIEWED',
} as const;

export type EventType = typeof EventType[keyof typeof EventType];

interface TrackEventOptions {
  eventType: EventType | string;
  metadata?: Record<string, any>;
  userId?: string;
}

/**
 * Track an analytics event
 * 
 * @param options - Event tracking options
 * @returns Promise that resolves when event is tracked
 */
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  const { eventType, metadata = {} } = options;

  // Get auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  try {
    // Send to backend API
    const response = await fetch(`${API_URL}/analytics/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        eventType,
        metadata,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to track event:', eventType);
    }
  } catch (error) {
    // Silently fail in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracking event:', error);
    }
  }

  // TODO: Future integration with external analytics services
  // Example:
  // if (window.gtag) {
  //   window.gtag('event', eventType, metadata);
  // }
  // if (window.plausible) {
  //   window.plausible(eventType, { props: metadata });
  // }
}

/**
 * Track page view
 */
export function trackPageView(page: string, metadata?: Record<string, any>): void {
  trackEvent({
    eventType: EventType.PAGE_VIEW,
    metadata: {
      page,
      ...metadata,
    },
  });
}

/**
 * Track checkout started
 */
export function trackCheckoutStarted(productId: string, quantity: number, amount: number): void {
  trackEvent({
    eventType: EventType.CHECKOUT_STARTED,
    metadata: {
      productId,
      quantity,
      amount,
    },
  });
}

/**
 * Track checkout completed
 */
export function trackCheckoutCompleted(orderId: string, sessionId?: string): void {
  trackEvent({
    eventType: EventType.CHECKOUT_COMPLETED,
    metadata: {
      orderId,
      sessionId,
    },
  });
}

/**
 * Track checkout cancelled
 */
export function trackCheckoutCancelled(orderId?: string): void {
  trackEvent({
    eventType: EventType.CHECKOUT_CANCELLED,
    metadata: {
      orderId,
    },
  });
}


