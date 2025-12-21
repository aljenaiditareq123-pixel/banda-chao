import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL before creating PrismaClient
// Note: In Next.js, environment variables from .env.local are loaded automatically
// But we validate here to provide clear error messages
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  const errorMsg = 'DATABASE_URL environment variable is required. Please check your .env.local or .env file, or ensure it is set in your deployment environment (e.g., Render).';
  console.error('[Prisma] ❌', errorMsg);
  
  // In production, throw error to fail fast
  // In development, log warning but allow PrismaClient to be created (it will fail with clearer error later)
  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMsg);
  } else {
    console.warn('[Prisma] ⚠️ Continuing without DATABASE_URL (development mode). Prisma operations will fail.');
  }
} else {
  // Log masked connection info in development
  if (process.env.NODE_ENV === 'development') {
    try {
      const url = new URL(dbUrl);
      console.log('[Prisma] ✅ DATABASE_URL loaded:', {
        host: url.hostname,
        port: url.port || '5432 (default)',
        database: url.pathname.replace('/', ''),
      });
    } catch (e) {
      // Invalid URL format, but don't fail - let Prisma handle it
      console.warn('[Prisma] ⚠️ DATABASE_URL format may be invalid');
    }
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
