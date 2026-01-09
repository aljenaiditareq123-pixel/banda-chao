#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates required environment variables for production deployment
 */

const requiredBackendVars = {
  DATABASE_URL: {
    description: 'PostgreSQL connection string',
    validate: (val) => val && val.startsWith('postgresql://'),
    error: 'Must start with postgresql://',
  },
  JWT_SECRET: {
    description: 'JWT token signing secret',
    validate: (val) => val && val.length >= 32,
    error: 'Must be at least 32 characters',
  },
  FRONTEND_URL: {
    description: 'Frontend URL for CORS',
    validate: (val) => val && (val.startsWith('http://') || val.startsWith('https://')),
    error: 'Must be a valid HTTP/HTTPS URL',
  },
  NODE_ENV: {
    description: 'Node environment',
    validate: (val) => ['development', 'production', 'test'].includes(val),
    error: 'Must be development, production, or test',
  },
};

const optionalBackendVars = {
  STRIPE_SECRET_KEY: {
    description: 'Stripe secret key',
    validate: (val) => !val || val.startsWith('sk_'),
  },
  STRIPE_PUBLISHABLE_KEY: {
    description: 'Stripe publishable key',
    validate: (val) => !val || val.startsWith('pk_'),
  },
  GEMINI_API_KEY: {
    description: 'Google Gemini API key',
    validate: (val) => true, // Any value is valid
  },
  GCLOUD_PROJECT_ID: {
    description: 'Google Cloud Project ID',
    validate: (val) => true,
  },
  GCS_BUCKET_NAME: {
    description: 'Google Cloud Storage bucket name',
    validate: (val) => true,
  },
  SENTRY_DSN: {
    description: 'Sentry DSN for error tracking',
    validate: (val) => !val || val.startsWith('https://'),
  },
};

const requiredFrontendVars = {
  NEXT_PUBLIC_API_URL: {
    description: 'Backend API URL',
    validate: (val) => val && (val.startsWith('http://') || val.startsWith('https://')),
    error: 'Must be a valid HTTP/HTTPS URL',
  },
  NODE_ENV: {
    description: 'Node environment',
    validate: (val) => ['development', 'production', 'test'].includes(val),
    error: 'Must be development, production, or test',
  },
};

const optionalFrontendVars = {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    description: 'Stripe publishable key',
    validate: (val) => !val || val.startsWith('pk_'),
  },
  AUTH_URL: {
    description: 'NextAuth URL',
    validate: (val) => !val || val.startsWith('http'),
  },
  AUTH_SECRET: {
    description: 'NextAuth secret',
    validate: (val) => true,
  },
  DATABASE_URL: {
    description: 'Database URL (if frontend uses Prisma)',
    validate: (val) => !val || val.startsWith('postgresql://'),
  },
};

function validateVars(vars, env, serviceName) {
  const missing = [];
  const invalid = [];
  const warnings = [];

  console.log(`\n📋 Validating ${serviceName} environment variables...\n`);

  for (const [key, config] of Object.entries(vars)) {
    const value = env[key];
    
    if (!value) {
      missing.push({ key, description: config.description });
      continue;
    }

    if (config.validate && !config.validate(value)) {
      invalid.push({
        key,
        description: config.description,
        error: config.error || 'Invalid value',
        value: maskSensitiveValue(key, value),
      });
    } else {
      console.log(`  ✅ ${key}: ${maskSensitiveValue(key, value)}`);
    }
  }

  return { missing, invalid, warnings };
}

function maskSensitiveValue(key, value) {
  const sensitiveKeys = ['SECRET', 'KEY', 'PASSWORD', 'TOKEN', 'DSN'];
  if (sensitiveKeys.some(s => key.toUpperCase().includes(s))) {
    if (value.length > 20) {
      return `${value.substring(0, 8)}...${value.substring(value.length - 4)}`;
    }
    return '***masked***';
  }
  return value;
}

function main() {
  const service = process.argv[2] || 'all';
  const env = process.env;

  console.log('🔍 Environment Variable Validation\n');
  console.log(`Service: ${service === 'all' ? 'All Services' : service}`);
  console.log(`Environment: ${env.NODE_ENV || 'not set'}\n`);

  let allMissing = [];
  let allInvalid = [];

  if (service === 'all' || service === 'backend') {
    const backendResult = validateVars(
      requiredBackendVars,
      env,
      'Backend (Required)'
    );
    allMissing.push(...backendResult.missing);
    allInvalid.push(...backendResult.invalid);

    const backendOptional = validateVars(
      optionalBackendVars,
      env,
      'Backend (Optional)'
    );
    if (backendOptional.missing.length > 0) {
      console.log('\n  ⚠️  Optional variables not set:');
      backendOptional.missing.forEach(({ key, description }) => {
        console.log(`    - ${key}: ${description}`);
      });
    }
  }

  if (service === 'all' || service === 'frontend') {
    const frontendResult = validateVars(
      requiredFrontendVars,
      env,
      'Frontend (Required)'
    );
    allMissing.push(...frontendResult.missing);
    allInvalid.push(...frontendResult.invalid);

    const frontendOptional = validateVars(
      optionalFrontendVars,
      env,
      'Frontend (Optional)'
    );
    if (frontendOptional.missing.length > 0) {
      console.log('\n  ⚠️  Optional variables not set:');
      frontendOptional.missing.forEach(({ key, description }) => {
        console.log(`    - ${key}: ${description}`);
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary\n');

  if (allMissing.length === 0 && allInvalid.length === 0) {
    console.log('✅ All required environment variables are valid!\n');
    process.exit(0);
  }

  if (allMissing.length > 0) {
    console.log('❌ Missing required variables:\n');
    allMissing.forEach(({ key, description }) => {
      console.log(`  - ${key}`);
      console.log(`    Description: ${description}\n`);
    });
  }

  if (allInvalid.length > 0) {
    console.log('⚠️  Invalid variable values:\n');
    allInvalid.forEach(({ key, description, error, value }) => {
      console.log(`  - ${key}`);
      console.log(`    Description: ${description}`);
      console.log(`    Current value: ${value}`);
      console.log(`    Error: ${error}\n`);
    });
  }

  console.log('='.repeat(60));
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { validateVars };
