import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint for Render
 * GET /health
 * Returns simple OK response for deployment health checks
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'banda-chao-frontend',
    },
    { status: 200 }
  );
}
