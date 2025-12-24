import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint for Render
 * GET /health
 * Returns simple OK response for deployment health checks
 * 
 * This endpoint is optimized for fast response times required by Render's health checks.
 * - Uses force-dynamic to prevent caching
 * - Minimal response body for fastest possible response
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Return minimal response for fastest health check
  return new NextResponse('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
