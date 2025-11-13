#!/usr/bin/env tsx

/**
 * Script to verify all required environment variables are set
 * Run: npx tsx scripts/verify-env.ts
 */

const REQUIRED_ENV_VARS = {
  // Frontend (Next.js)
  NEXT_PUBLIC_API_URL: {
    required: true,
    description: 'Backend API URL (e.g., https://banda-chao-backend.onrender.com)',
    example: 'https://banda-chao-backend.onrender.com',
  },
  NEXT_PUBLIC_SOCKET_URL: {
    required: false,
    description: 'WebSocket URL for real-time chat',
    example: 'wss://banda-chao-backend.onrender.com',
  },
  // AI
  GEMINI_API_KEY: {
    required: true,
    description: 'Google Gemini API Key for AI chat',
    example: 'AIzaSy...',
  },
  // Payment
  STRIPE_SECRET_KEY: {
    required: true,
    description: 'Stripe Secret Key for payment processing',
    example: 'sk_test_...',
  },
  STRIPE_PUBLISHABLE_KEY: {
    required: false,
    description: 'Stripe Publishable Key (if needed on frontend)',
    example: 'pk_test_...',
  },
  // Database (Backend)
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL Database URL',
    example: 'postgresql://user:password@host:5432/dbname',
  },
  // JWT
  JWT_SECRET: {
    required: true,
    description: 'JWT Secret for token signing',
    example: 'your-secret-key',
  },
};

interface EnvCheckResult {
  name: string;
  exists: boolean;
  value: string | undefined;
  masked: string;
  status: '✅' | '⚠️' | '❌';
  message: string;
}

function maskValue(value: string | undefined): string {
  if (!value) return 'NOT SET';
  if (value.length <= 8) return '***';
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
}

function checkEnvVar(name: string, config: typeof REQUIRED_ENV_VARS[string]): EnvCheckResult {
  const value = process.env[name];
  const exists = !!value;
  const masked = maskValue(value);

  let status: '✅' | '⚠️' | '❌';
  let message: string;

  if (!exists) {
    status = config.required ? '❌' : '⚠️';
    message = config.required
      ? `❌ REQUIRED but NOT SET - ${config.description}`
      : `⚠️ OPTIONAL but NOT SET - ${config.description}`;
  } else {
    status = '✅';
    message = `✅ SET - ${config.description}`;
  }

  return {
    name,
    exists,
    value,
    masked,
    status,
    message,
  };
}

function validateEnvVar(name: string, value: string | undefined): { valid: boolean; error?: string } {
  if (!value) {
    return { valid: false, error: 'Value is not set' };
  }

  switch (name) {
    case 'GEMINI_API_KEY':
      if (!value.startsWith('AIzaSy')) {
        return { valid: false, error: 'Invalid format - should start with "AIzaSy"' };
      }
      break;

    case 'STRIPE_SECRET_KEY':
      if (!value.startsWith('sk_')) {
        return { valid: false, error: 'Invalid format - should start with "sk_"' };
      }
      break;

    case 'STRIPE_PUBLISHABLE_KEY':
      if (!value.startsWith('pk_')) {
        return { valid: false, error: 'Invalid format - should start with "pk_"' };
      }
      break;

    case 'DATABASE_URL':
      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        return { valid: false, error: 'Invalid format - should start with "postgresql://" or "postgres://"' };
      }
      break;

    case 'NEXT_PUBLIC_API_URL':
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return { valid: false, error: 'Invalid format - should start with "http://" or "https://"' };
      }
      break;
  }

  return { valid: true };
}

function main() {
  console.log('🔍 Environment Variables Verification\n');
  console.log('=' .repeat(60));

  const results: EnvCheckResult[] = [];
  let hasErrors = false;
  let hasWarnings = false;

  for (const [name, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const result = checkEnvVar(name, config);
    results.push(result);

    if (result.status === '❌') {
      hasErrors = true;
    } else if (result.status === '⚠️') {
      hasWarnings = true;
    }

    // Validate format if exists
    if (result.exists) {
      const validation = validateEnvVar(name, result.value);
      if (!validation.valid) {
        result.status = '❌';
        result.message += ` - ${validation.error}`;
        hasErrors = true;
      }
    }
  }

  // Print results
  console.log('\n📋 Results:\n');
  for (const result of results) {
    console.log(`${result.status} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.exists) {
      console.log(`   Value: ${result.masked}`);
    }
    console.log();
  }

  // Summary
  console.log('=' .repeat(60));
  console.log('\n📊 Summary:\n');

  const requiredCount = Object.values(REQUIRED_ENV_VARS).filter((v) => v.required).length;
  const optionalCount = Object.values(REQUIRED_ENV_VARS).filter((v) => !v.required).length;
  const setCount = results.filter((r) => r.exists).length;
  const requiredSetCount = results.filter((r) => r.exists && REQUIRED_ENV_VARS[r.name as keyof typeof REQUIRED_ENV_VARS].required).length;

  console.log(`✅ Required variables set: ${requiredSetCount}/${requiredCount}`);
  console.log(`⚠️  Optional variables set: ${setCount - requiredSetCount}/${optionalCount}`);
  console.log(`📦 Total variables set: ${setCount}/${results.length}`);

  if (hasErrors) {
    console.log('\n❌ ERRORS FOUND: Some required environment variables are missing or invalid!');
    console.log('\n💡 Action Required:');
    console.log('   1. Check your .env.local file (for local development)');
    console.log('   2. Check Vercel Environment Variables (for production)');
    console.log('   3. Check Render Environment Variables (for backend)');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  WARNINGS: Some optional environment variables are not set.');
    console.log('   These are not required but may be useful.');
    process.exit(0);
  } else {
    console.log('\n✅ ALL CHECKS PASSED! Environment is properly configured.');
    process.exit(0);
  }
}

main();

