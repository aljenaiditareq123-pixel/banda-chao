/**
 * Backend Environment Variable Checks
 * Runtime verification of critical environment variables
 */

/**
 * Check backend environment variables
 * CRITICAL: In production, exits immediately if required variables are missing
 * This prevents the app from starting with invalid configuration
 */
export function checkBackendEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  const requiredVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL,
  };

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables with strict validation
  if (!requiredVars.DATABASE_URL || typeof requiredVars.DATABASE_URL !== 'string' || requiredVars.DATABASE_URL.trim() === '') {
    missing.push('DATABASE_URL');
  }

  if (!requiredVars.JWT_SECRET || typeof requiredVars.JWT_SECRET !== 'string' || requiredVars.JWT_SECRET.trim() === '') {
    missing.push('JWT_SECRET');
  }

  if (!requiredVars.GEMINI_API_KEY) {
    warnings.push('GEMINI_API_KEY (AI features will not work)');
  }

  if (!requiredVars.FRONTEND_URL) {
    warnings.push('FRONTEND_URL (CORS may not work correctly - using default)');
  }

  // CRITICAL: In production, fail fast if required variables are missing
  if (missing.length > 0) {
    const errorMessage = `[ENV CHECK] ❌ FATAL: Missing required environment variables: ${missing.join(', ')}`;
    console.error(errorMessage);
    console.error('[ENV CHECK] Server cannot start without these variables.');
    console.error('[ENV CHECK] Please set them in Render Dashboard → Environment → Environment Variables');
    console.error('[ENV CHECK] Required variables:');
    missing.forEach((varName) => {
      console.error(`  - ${varName}`);
    });
    
    // In production, exit immediately to prevent running with invalid config
    if (isProduction) {
      console.error('[ENV CHECK] ❌ Server exiting to prevent insecure/invalid operation.');
      process.exit(1); // Kill Switch - fail fast in production
    } else {
      // In development, warn but allow startup (for local testing)
      console.warn('[ENV CHECK] ⚠️ Development mode: Allowing startup despite missing variables (NOT RECOMMENDED)');
    }
  }

  // Log warnings for optional variables
  if (warnings.length > 0) {
    console.warn('[ENV CHECK] ⚠️ Missing optional environment variables:', warnings.join(', '));
  }

  // Log success (both development and production)
  if (missing.length === 0) {
    console.log('[ENV CHECK] ✅ All required environment variables are set');
    if (warnings.length === 0) {
      console.log('[ENV CHECK] ✅ All optional environment variables are set');
    }
  }

  // Log values (masked) in development and production
  if (requiredVars.DATABASE_URL) {
    try {
      const dbUrl = new URL(requiredVars.DATABASE_URL);
      console.log('[ENV CHECK] DATABASE_URL Analysis:');
      console.log(`  Host: ${dbUrl.hostname}`);
      console.log(`  Port: ${dbUrl.port || '5432 (default)'}`);
      console.log(`  Database: ${dbUrl.pathname.replace('/', '')}`);
      console.log(`  User: ${dbUrl.username || 'not set'}`);
      console.log(`  Contains 'render.com': ${requiredVars.DATABASE_URL.includes('render.com') ? '✅ Yes' : '❌ No'}`);
      console.log(`  Contains 'ssl=': ${requiredVars.DATABASE_URL.includes('ssl=') ? '✅ Yes' : '❌ No'}`);
      
      // Warning if Render URL but no SSL
      if (requiredVars.DATABASE_URL.includes('render.com') && !requiredVars.DATABASE_URL.includes('ssl=')) {
        console.warn('[ENV CHECK] ⚠️ WARNING: Render PostgreSQL URL detected but SSL not configured!');
        console.warn('[ENV CHECK] ⚠️ The code will auto-add ssl=true, but it\'s better to add it manually.');
      }
    } catch (e) {
      console.error('[ENV CHECK] ❌ Invalid DATABASE_URL format:', e);
    }
  }
  
  // Log environment variables status (both development and production)
  console.log('[ENV CHECK] Environment variables status:');
  console.log('  DATABASE_URL:', requiredVars.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('  JWT_SECRET:', requiredVars.JWT_SECRET ? `✅ Set (length: ${requiredVars.JWT_SECRET?.length || 0})` : '❌ Missing');
  console.log('  GEMINI_API_KEY:', requiredVars.GEMINI_API_KEY ? '✅ Set' : '⚠️ Missing');
  console.log('  FRONTEND_URL:', requiredVars.FRONTEND_URL || '⚠️ Using default');
}



