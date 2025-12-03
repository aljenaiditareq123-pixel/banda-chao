/**
 * Database Connection Test Utility
 * Helps diagnose database connection issues
 */

import { PrismaClient } from '@prisma/client';

export async function testDatabaseConnection(): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    // Test 1: Basic connection
    await prisma.$connect();
    console.log('[DB TEST] ✅ Prisma client connected');

    // Test 2: Simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('[DB TEST] ✅ Query test successful:', result);

    // Test 3: Check if users table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists;
    `;
    console.log('[DB TEST] ✅ Users table exists:', tableCheck);

    await prisma.$disconnect();
    
    return {
      success: true,
      details: {
        connection: 'successful',
        query: 'successful',
        tableCheck: tableCheck,
      },
    };
  } catch (error: any) {
    console.error('[DB TEST] ❌ Connection failed:', error);
    
    await prisma.$disconnect().catch(() => {});

    // Analyze error type
    let errorType = 'unknown';
    let errorMessage = error.message || 'Unknown error';

    if (error.code === 'P1001') {
      errorType = 'connection_refused';
      errorMessage = 'Cannot reach database server. Check DATABASE_URL host and port.';
    } else if (error.code === 'P1000') {
      errorType = 'authentication_failed';
      errorMessage = 'Database authentication failed. Check username and password in DATABASE_URL.';
    } else if (error.code === 'P1003') {
      errorType = 'database_not_found';
      errorMessage = 'Database does not exist. Check database name in DATABASE_URL.';
    } else if (error.message?.includes('SSL')) {
      errorType = 'ssl_required';
      errorMessage = 'SSL connection required. Add ?ssl=true to DATABASE_URL.';
    } else if (error.message?.includes('timeout')) {
      errorType = 'connection_timeout';
      errorMessage = 'Connection timeout. Check network and database server status.';
    }

    return {
      success: false,
      error: errorMessage,
      details: {
        errorType,
        code: error.code,
        message: error.message,
        meta: error.meta,
      },
    };
  }
}

