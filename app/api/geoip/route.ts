/**
 * Geo-IP API Route
 * Returns country code based on client IP
 * 
 * Uses external Geo-IP service (ip-api.com) for reliable country detection
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Extract IP address from request headers
 */
function extractIPFromHeaders(headers: Headers): string | null {
  // Try X-Forwarded-For first (contains client IP in proxy chain)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
    // The first one is usually the client IP
    const firstIP = forwardedFor.split(',')[0].trim();
    if (firstIP) {
      return firstIP;
    }
  }
  
  // Try X-Real-IP (set by some proxies)
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  // Try CF-Connecting-IP (Cloudflare)
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP.trim();
  }
  
  return null;
}

/**
 * Get country code from IP using ip-api.com (free, no API key required)
 * Fallback to ipapi.co if needed
 */
async function getCountryFromIP(ip: string): Promise<string | null> {
  try {
    // Skip local/private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return null;
    }

    // Try ip-api.com first (free, no API key, 45 requests/min)
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.countryCode) {
          return data.countryCode;
        }
      }
    } catch (err) {
      console.warn('[GeoIP] ip-api.com failed, trying fallback:', err);
    }

    // Fallback to ipapi.co (free tier: 1000 requests/day)
    try {
      const response = await fetch(`https://ipapi.co/${ip}/country_code/`, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      });

      if (response.ok) {
        const countryCode = (await response.text()).trim();
        if (countryCode && countryCode.length === 2) {
          return countryCode;
        }
      }
    } catch (err) {
      console.warn('[GeoIP] ipapi.co fallback also failed:', err);
    }

    return null;
  } catch (error) {
    console.error('[GeoIP] Error looking up IP:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract IP from headers
    const ip = extractIPFromHeaders(request.headers);
    
    // If no IP from headers, try query parameter (fallback)
    const ipFromQuery = request.nextUrl.searchParams.get('ip');
    const clientIP = ip || ipFromQuery;
    
    if (!clientIP) {
      return NextResponse.json(
        { error: 'Could not determine IP address' },
        { status: 400 }
      );
    }
    
    // Get country from IP using external API
    const country = await getCountryFromIP(clientIP);
    
    return NextResponse.json({
      ip: clientIP,
      country: country || null,
    });
  } catch (error: any) {
    console.error('[GeoIP API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to determine location', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}
