import { PrismaClient } from '@prisma/client';
import { maintenanceLogger } from '../lib/maintenance-logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * The Mechanic: Database Auto-Recovery with Retry Logic
 * Implements exponential backoff retry mechanism for database connections
 */
async function createPrismaClientWithRetry(): Promise<PrismaClient> {
  const maxRetries = 5;
  const baseDelay = 1000; // 1 second
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      // Test connection
      await client.$connect();
      
      if (attempt > 1) {
        const recoveryTime = (attempt - 1) * baseDelay;
        maintenanceLogger.log('database_recovery', {
          message: `Database connection restored after ${attempt - 1} retries`,
          recoveryTime: `${recoveryTime}ms`,
          status: 'stable',
        });
      }

      return client;
    } catch (error: any) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries;
      
      if (isLastAttempt) {
        maintenanceLogger.log('database_error', {
          message: `Database connection failed after ${maxRetries} attempts`,
          error: error.message,
          status: 'critical',
        });
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s
      const delay = baseDelay * Math.pow(2, attempt - 1);
      
      maintenanceLogger.log('database_retry', {
        message: `Database connection lost. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`,
        attempt,
        maxRetries,
        delay: `${delay}ms`,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Failed to create Prisma client');
}

// Create Prisma client with retry wrapper
const baseClient = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Wrap Prisma client methods with retry logic
const prismaWithRetry = new Proxy(baseClient, {
  get(target: PrismaClient, prop: string | symbol) {
    const original = (target as any)[prop];
    
    // Only wrap async methods that interact with database
    if (typeof original === 'function' && ['$connect', '$queryRaw', '$queryRawUnsafe', '$executeRaw', '$executeRawUnsafe'].includes(prop as string)) {
      return async (...args: any[]): Promise<any> => {
        const maxRetries = 5;
        const baseDelay = 1000;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await original.apply(target, args);
          } catch (error: any) {
            lastError = error;
            const isLastAttempt = attempt === maxRetries;
            
            if (isLastAttempt) {
              maintenanceLogger.log('database_error', {
                message: `Database operation failed after ${maxRetries} attempts`,
                error: error.message,
                operation: prop as string,
                status: 'critical',
              });
              throw error;
            }

            // Exponential backoff
            const delay = baseDelay * Math.pow(2, attempt - 1);
            
            maintenanceLogger.log('database_retry', {
              message: `Database operation retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`,
              attempt,
              maxRetries,
              delay: `${delay}ms`,
              operation: prop as string,
            });

            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }

        throw lastError || new Error('Database operation failed');
      };
    }
    
    return original;
  },
}) as PrismaClient;

export const prisma = globalForPrisma.prisma ?? prismaWithRetry;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Note: Prisma $on is for query/error logging, not connection errors
// Connection errors are handled by the retry wrapper above
