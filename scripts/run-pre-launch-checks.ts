#!/usr/bin/env tsx

/**
 * Pre-Launch Checklist Runner
 * Runs all verification checks before beta launch
 * 
 * Run: npx tsx scripts/run-pre-launch-checks.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CheckResult {
  name: string;
  status: '✅' | '❌' | '⚠️';
  message: string;
  details?: string;
}

const checks: CheckResult[] = [];

async function runCheck(name: string, command: string, validator?: (output: string) => boolean): Promise<CheckResult> {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: process.cwd() });
    const output = stdout + stderr;
    
    if (validator) {
      const isValid = validator(output);
      return {
        name,
        status: isValid ? '✅' : '❌',
        message: isValid ? 'Passed' : 'Failed validation',
        details: output.substring(0, 200),
      };
    }
    
    return {
      name,
      status: '✅',
      message: 'Completed successfully',
      details: output.substring(0, 200),
    };
  } catch (error: any) {
    return {
      name,
      status: '❌',
      message: `Failed: ${error.message}`,
      details: error.stdout?.substring(0, 200) || error.stderr?.substring(0, 200),
    };
  }
}

async function main() {
  console.log('🚀 Pre-Launch Checklist Runner\n');
  console.log('='.repeat(60));

  // Check 1: Environment Variables
  console.log('\n1️⃣ Checking Environment Variables...');
  try {
    const { stdout } = await execAsync('npx tsx scripts/verify-env.ts', { cwd: process.cwd() });
    checks.push({
      name: 'Environment Variables',
      status: stdout.includes('ALL CHECKS PASSED') ? '✅' : '❌',
      message: stdout.includes('ALL CHECKS PASSED') ? 'All required variables are set' : 'Some variables are missing',
    });
  } catch (error: any) {
    checks.push({
      name: 'Environment Variables',
      status: '❌',
      message: 'Verification script failed',
      details: error.message,
    });
  }

  // Check 2: TypeScript Compilation
  console.log('\n2️⃣ Checking TypeScript Compilation...');
  const tsCheck = await runCheck(
    'TypeScript Compilation',
    'npx tsc --noEmit',
    (output) => !output.includes('error')
  );
  checks.push(tsCheck);

  // Check 3: ESLint
  console.log('\n3️⃣ Checking ESLint...');
  const lintCheck = await runCheck(
    'ESLint',
    'npm run lint',
    (output) => !output.includes('error') && !output.includes('Error')
  );
  checks.push(lintCheck);

  // Check 4: Build Test
  console.log('\n4️⃣ Testing Build...');
  const buildCheck = await runCheck(
    'Next.js Build',
    'npm run build',
    (output) => output.includes('Compiled successfully') || output.includes('Route (app)')
  );
  checks.push(buildCheck);

  // Check 5: Unit Tests
  console.log('\n5️⃣ Running Unit Tests...');
  const unitTestCheck = await runCheck(
    'Unit Tests',
    'npm run test -- --run',
    (output) => output.includes('Test Files') && !output.includes('FAIL')
  );
  checks.push(unitTestCheck);

  // Check 6: E2E Tests (if Playwright is installed)
  console.log('\n6️⃣ Running E2E Tests...');
  try {
    const e2eCheck = await runCheck(
      'E2E Tests',
      'npm run test:e2e -- --reporter=list',
      (output) => output.includes('passed') || output.includes('PASS')
    );
    checks.push(e2eCheck);
  } catch (error) {
    checks.push({
      name: 'E2E Tests',
      status: '⚠️',
      message: 'E2E tests skipped (may require browser setup)',
    });
  }

  // Print Results
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Pre-Launch Checklist Results:\n');

  let allPassed = true;
  let hasWarnings = false;

  for (const check of checks) {
    console.log(`${check.status} ${check.name}`);
    console.log(`   ${check.message}`);
    if (check.details) {
      console.log(`   Details: ${check.details.substring(0, 100)}...`);
    }
    console.log();

    if (check.status === '❌') {
      allPassed = false;
    } else if (check.status === '⚠️') {
      hasWarnings = true;
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('\n📋 Summary:\n');

  const passedCount = checks.filter((c) => c.status === '✅').length;
  const failedCount = checks.filter((c) => c.status === '❌').length;
  const warningCount = checks.filter((c) => c.status === '⚠️').length;

  console.log(`✅ Passed: ${passedCount}/${checks.length}`);
  console.log(`❌ Failed: ${failedCount}/${checks.length}`);
  console.log(`⚠️  Warnings: ${warningCount}/${checks.length}`);

  if (allPassed && !hasWarnings) {
    console.log('\n🎉 ALL CHECKS PASSED! Ready for beta launch!');
    process.exit(0);
  } else if (allPassed && hasWarnings) {
    console.log('\n⚠️  All critical checks passed, but there are warnings.');
    console.log('   Review warnings before launch.');
    process.exit(0);
  } else {
    console.log('\n❌ SOME CHECKS FAILED! Please fix issues before launch.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

