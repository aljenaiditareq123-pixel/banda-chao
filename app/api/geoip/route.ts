/**
 * Geo-IP API Route
 * Returns country code based on client IP
 * 
 * This route works in Node.js runtime and can use geoip-lite
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractIPFromHeaders, getCountryFromIP } from '@/lib/geoip';

export const runtime = 'nodejs'; // Use Node.js runtime for geoip-lite

export async function GET(request: NextRequest) {
  try {
    // Extract IP from headers (from lib/geoip utility)
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
    
    // Get country from IP using geoip-lite
    const country = getCountryFromIP(clientIP);
    
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
