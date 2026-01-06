import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api-utils';

/**
 * Next.js API Route: Create Stripe Checkout Session
 * This route proxies the request to the backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log request for debugging
    console.log('[Checkout API] Received request:', {
      productId: body.productId,
      productName: body.productName,
      quantity: body.quantity,
      amount: body.amount,
      currency: body.currency,
      locale: body.locale,
    });
    
    // Validate required fields
    if (!body.productId || body.quantity === undefined || body.amount === undefined) {
      console.error('[Checkout API] Missing required fields:', {
        hasProductId: !!body.productId,
        hasQuantity: body.quantity !== undefined,
        hasAmount: body.amount !== undefined,
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields: productId, quantity, amount' },
        { status: 400 }
      );
    }
    
    // Validate data types
    const quantity = Number(body.quantity);
    const amount = Number(body.amount);
    
    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid quantity: must be a number >= 1' },
        { status: 400 }
      );
    }
    
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount: must be a number > 0' },
        { status: 400 }
      );
    }

    // Get API URL
    const API_URL = getApiUrl();
    // Get frontend URL - use dynamic function to handle SSR correctly
    const frontendUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_FRONTEND_URL || 
         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
         'https://bandachao.com');
    
    // Get locale from request or default to 'ar'
    const locale = body.locale || 'ar';
    
    // Use test endpoint if productId starts with 'test-' (for testing without auth)
    const isTestMode = body.productId?.startsWith('test-');
    const endpoint = isTestMode ? '/payments/checkout/test' : '/payments/checkout';
    
    // Prepare request body based on endpoint
    const requestBody = isTestMode
      ? {
          productName: body.productName || body.productId || 'Test Product',
          amount: amount, // Use validated number
          quantity: quantity, // Use validated number
          currency: body.currency || 'USD',
          successUrl: `${frontendUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${frontendUrl}/${locale}/checkout/cancel`,
          customerEmail: body.customerEmail,
        }
      : {
          productId: body.productId,
          quantity: quantity, // Use validated number
          currency: body.currency || 'USD',
        };

    // Log backend request
    console.log('[Checkout API] Calling backend:', {
      endpoint: `${API_URL}${endpoint}`,
      isTestMode,
      requestBody,
    });
    
    // Get auth token from request headers (passed from frontend)
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if not in test mode and token exists
    if (!isTestMode && authToken) {
      headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    }
    
    // Get CSRF token from cookie (passed from frontend via request)
    const csrfToken = request.headers.get('X-CSRF-Token') || 
                      request.cookies?.get('csrf-token')?.value ||
                      null;
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    console.log('[Checkout API] Request details:', {
      endpoint: `${API_URL}${endpoint}`,
      isTestMode,
      hasAuth: !!headers['Authorization'],
      hasCsrf: !!headers['X-CSRF-Token'],
      productId: body.productId,
    });
    
    // Call backend API to create checkout session
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      credentials: 'include',
    });

    const data = await response.json();
    
    console.log('[Checkout API] Backend response:', {
      status: response.status,
      ok: response.ok,
      data: data,
    });

    if (!response.ok) {
      console.error('[Checkout API] Backend error:', {
        status: response.status,
        error: data.error || data.message,
        data: data,
      });
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Failed to create checkout session' },
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

