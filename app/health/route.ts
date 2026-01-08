import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint for Render
 * GET /health
 * Returns simple OK response for deployment health checks
 * 
 * CRITICAL: This endpoint must respond INSTANTLY (under 5 seconds) for Render health checks.
 * - Uses force-dynamic to prevent caching
 * - Minimal response body for fastest possible response
 * - Bypasses all middleware (handled in middleware.ts shouldExcludePath)
 * - No database queries, no auth checks, no processing - just return OK immediately
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export async function GET() {
  // Return minimal instant response - no processing, no checks, just OK
  return NextResponse.json({ status: 'ok' }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
