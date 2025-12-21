import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client Singleton
 * Ensures only one instance is created and reused across the application
 * Critical for Next.js Server Actions and API Routes
 */
function getPrismaClient(): PrismaClient {
  // Return existing instance if available
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Validate DATABASE_URL before creating PrismaClient
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    const errorMsg = 'DATABASE_URL environment variable is required. Please check your .env.local or .env file, or ensure it is set in your deployment environment (e.g., Render Dashboard > Environment Variables).';
    console.error('[Prisma] ❌', errorMsg);
    console.error('[Prisma] Current NODE_ENV:', process.env.NODE_ENV);
    console.error('[Prisma] Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DB')).join(', ') || 'none');
    
    // In production, throw error to fail fast
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    } else {
      console.warn('[Prisma] ⚠️ Continuing without DATABASE_URL (development mode). Prisma operations will fail.');
    }
  } else {
    // Log masked connection info (only in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        const url = new URL(dbUrl);
        console.log('[Prisma] ✅ DATABASE_URL loaded:', {
          host: url.hostname,
          port: url.port || '5432 (default)',
          database: url.pathname.replace('/', ''),
        });
      } catch (e) {
        console.warn('[Prisma] ⚠️ DATABASE_URL format may be invalid');
      }
    } else {
      // In production, just confirm it exists (don't log full URL for security)
      console.log('[Prisma] ✅ DATABASE_URL is set (production mode)');
    }
  }

  // Create new PrismaClient instance
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Store in global for reuse (critical for Next.js)
  globalForPrisma.prisma = client;

  return client;
}

// Export singleton instance
export const prisma = getPrismaClient();
