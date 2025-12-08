import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api-utils';

/**
 * Next.js API Route: Create Stripe Checkout Session
 * This route proxies the request to the backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.productId || !body.quantity || !body.amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: productId, quantity, amount' },
        { status: 400 }
      );
    }

    // Get API URL
    const API_URL = getApiUrl();
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    
    // Get locale from request or default to 'ar'
    const locale = body.locale || 'ar';
    
    // Use test endpoint if productId starts with 'test-' (for testing without auth)
    const isTestMode = body.productId?.startsWith('test-');
    const endpoint = isTestMode ? '/payments/checkout/test' : '/payments/checkout';
    
    // Prepare request body based on endpoint
    const requestBody = isTestMode
      ? {
          productName: body.productName || body.productId,
          amount: body.amount,
          quantity: body.quantity,
          currency: body.currency || 'USD',
          successUrl: `${frontendUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${frontendUrl}/${locale}/checkout/cancel`,
          customerEmail: body.customerEmail,
        }
      : {
          productId: body.productId,
          quantity: body.quantity,
          currency: body.currency || 'USD',
        };

    // Call backend API to create checkout session
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(isTestMode ? {} : { 'Authorization': request.headers.get('Authorization') || '' }),
      },
      body: JSON.stringify(requestBody),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to create checkout session' },
        { status: response.status }
      );
    }

    // Return checkout URL from backend
    return NextResponse.json({
      success: true,
      checkoutUrl: data.checkoutUrl,
      sessionId: data.sessionId,
    });
  } catch (error: any) {
    console.error('[Checkout API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

