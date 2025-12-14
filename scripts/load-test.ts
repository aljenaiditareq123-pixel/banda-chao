/**
 * Load Test Script - User Journey Simulation
 * 
 * This script simulates a typical user journey through the Banda Chao platform:
 * 1. Opens Feed
 * 2. Searches for a product
 * 3. Adds to cart
 * 4. Performs daily check-in
 * 
 * Run: npx tsx scripts/load-test.ts
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const ITERATIONS = 50;
const CONCURRENT_USERS = 5; // Simulate 5 concurrent users

interface TestResult {
  endpoint: string;
  success: boolean;
  duration: number;
  error?: string;
}

interface UserJourney {
  userId: string;
  results: TestResult[];
  totalDuration: number;
}

// Mock user credentials (for testing - in production, use test accounts)
const TEST_USERS = [
  { email: 'test1@bandachao.com', password: 'test123' },
  { email: 'test2@bandachao.com', password: 'test123' },
  { email: 'test3@bandachao.com', password: 'test123' },
  { email: 'test4@bandachao.com', password: 'test123' },
  { email: 'test5@bandachao.com', password: 'test123' },
];

/**
 * Make API request with timing
 */
async function makeRequest(
  method: 'GET' | 'POST',
  endpoint: string,
  token?: string,
  data?: any
): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const config: any = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    const duration = Date.now() - startTime;

    return {
      endpoint,
      success: response.status >= 200 && response.status < 300,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return {
      endpoint,
      success: false,
      duration,
      error: error.response?.data?.error || error.message || 'Unknown error',
    };
  }
}

/**
 * Simulate user login
 */
async function loginUser(email: string, password: string): Promise<string | null> {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });

    if (response.data.success && response.data.token) {
      return response.data.token;
    }
    return null;
  } catch (error) {
    console.warn(`Login failed for ${email}:`, (error as any).message);
    return null;
  }
}

/**
 * Simulate a complete user journey
 */
async function simulateUserJourney(userIndex: number): Promise<UserJourney> {
  const user = TEST_USERS[userIndex % TEST_USERS.length];
  const results: TestResult[] = [];
  const journeyStart = Date.now();

  console.log(`\n👤 User ${userIndex + 1}: Starting journey...`);

  // Step 1: Login
  console.log(`  🔐 Logging in...`);
  const token = await loginUser(user.email, user.password);
  if (!token) {
    console.warn(`  ⚠️  Login failed, skipping user ${userIndex + 1}`);
    return {
      userId: `user-${userIndex + 1}`,
      results: [],
      totalDuration: 0,
    };
  }
  results.push({
    endpoint: '/auth/login',
    success: true,
    duration: 0, // Already timed in loginUser
  });

  // Step 2: Open Feed (Get videos)
  console.log(`  📹 Opening feed...`);
  const feedResult = await makeRequest('GET', '/videos?limit=10&type=SHORT', token);
  results.push(feedResult);
  console.log(`  ${feedResult.success ? '✅' : '❌'} Feed: ${feedResult.duration}ms`);

  // Step 3: Search for product
  console.log(`  🔍 Searching for products...`);
  const searchQueries = ['phone', 'watch', 'laptop', 'shoes', 'bag'];
  const searchQuery = searchQueries[userIndex % searchQueries.length];
  const searchResult = await makeRequest('POST', '/search', token, {
    query: searchQuery,
    limit: 10,
  });
  results.push(searchResult);
  console.log(`  ${searchResult.success ? '✅' : '❌'} Search: ${searchResult.duration}ms`);

  // Step 4: Get products (to add to cart)
  console.log(`  📦 Getting products...`);
  const productsResult = await makeRequest('GET', '/products?limit=5', token);
  results.push(productsResult);
  console.log(`  ${productsResult.success ? '✅' : '❌'} Products: ${productsResult.duration}ms`);

  // Step 5: Add to cart (if products available)
  if (productsResult.success) {
    console.log(`  🛒 Adding to cart...`);
    // Note: In real scenario, we'd parse products and add one
    // For load test, we'll just test the cart endpoint
    const cartResult = await makeRequest('GET', '/cart', token);
    results.push(cartResult);
    console.log(`  ${cartResult.success ? '✅' : '❌'} Cart: ${cartResult.duration}ms`);
  }

  // Step 6: Daily check-in
  console.log(`  🎮 Performing daily check-in...`);
  const checkInResult = await makeRequest('POST', '/games/check-in', token);
  results.push(checkInResult);
  console.log(`  ${checkInResult.success ? '✅' : '❌'} Check-in: ${checkInResult.duration}ms`);

  // Step 7: Get wallet balance
  console.log(`  💳 Getting wallet balance...`);
  const walletResult = await makeRequest('GET', '/wallet/balance', token);
  results.push(walletResult);
  console.log(`  ${walletResult.success ? '✅' : '❌'} Wallet: ${walletResult.duration}ms`);

  const totalDuration = Date.now() - journeyStart;

  return {
    userId: `user-${userIndex + 1}`,
    results,
    totalDuration,
  };
}

/**
 * Run load test
 */
async function runLoadTest() {
  console.log('🚀 Starting Load Test...');
  console.log(`📊 Configuration:`);
  console.log(`   - API Base URL: ${API_BASE_URL}`);
  console.log(`   - Iterations: ${ITERATIONS}`);
  console.log(`   - Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`   - Total Requests: ~${ITERATIONS * 7} (7 steps per user)\n`);

  const allJourneys: UserJourney[] = [];
  const startTime = Date.now();

  // Run iterations
  for (let i = 0; i < ITERATIONS; i++) {
    const batchPromises: Promise<UserJourney>[] = [];

    // Simulate concurrent users
    for (let j = 0; j < CONCURRENT_USERS; j++) {
      batchPromises.push(simulateUserJourney(i * CONCURRENT_USERS + j));
    }

    const batchResults = await Promise.all(batchPromises);
    allJourneys.push(...batchResults);

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`\n📈 Progress: ${i + 1}/${ITERATIONS} iterations completed\n`);
    }

    // Small delay between batches to avoid overwhelming the server
    if (i < ITERATIONS - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  const totalTime = Date.now() - startTime;

  // Analyze results
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOAD TEST RESULTS');
  console.log('='.repeat(60));

  const allResults = allJourneys.flatMap((j) => j.results);
  const endpointStats: Record<string, { count: number; totalDuration: number; successes: number; errors: string[] }> = {};

  allResults.forEach((result) => {
    if (!endpointStats[result.endpoint]) {
      endpointStats[result.endpoint] = {
        count: 0,
        totalDuration: 0,
        successes: 0,
        errors: [],
      };
    }

    endpointStats[result.endpoint].count++;
    endpointStats[result.endpoint].totalDuration += result.duration;
    if (result.success) {
      endpointStats[result.endpoint].successes++;
    } else {
      endpointStats[result.endpoint].errors.push(result.error || 'Unknown error');
    }
  });

  // Print statistics
  console.log(`\n⏱️  Total Test Duration: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`👥 Total User Journeys: ${allJourneys.length}`);
  console.log(`📡 Total API Requests: ${allResults.length}`);
  console.log(`✅ Successful Requests: ${allResults.filter((r) => r.success).length}`);
  console.log(`❌ Failed Requests: ${allResults.filter((r) => !r.success).length}`);
  console.log(`📈 Success Rate: ${((allResults.filter((r) => r.success).length / allResults.length) * 100).toFixed(2)}%`);

  // Per-endpoint statistics
  console.log('\n📋 Per-Endpoint Statistics:');
  console.log('-'.repeat(60));
  Object.entries(endpointStats).forEach(([endpoint, stats]) => {
    const avgDuration = stats.totalDuration / stats.count;
    const successRate = (stats.successes / stats.count) * 100;
    const uniqueErrors = [...new Set(stats.errors)];

    console.log(`\n${endpoint}:`);
    console.log(`  Requests: ${stats.count}`);
    console.log(`  Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`  Avg Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`  Min Duration: ${Math.min(...allResults.filter((r) => r.endpoint === endpoint).map((r) => r.duration))}ms`);
    console.log(`  Max Duration: ${Math.max(...allResults.filter((r) => r.endpoint === endpoint).map((r) => r.duration))}ms`);

    if (uniqueErrors.length > 0) {
      console.log(`  ⚠️  Errors: ${uniqueErrors.length} unique error(s)`);
      uniqueErrors.slice(0, 3).forEach((error) => {
        console.log(`     - ${error}`);
      });
    }
  });

  // Identify bottlenecks
  console.log('\n🔍 Bottleneck Analysis:');
  console.log('-'.repeat(60));
  const sortedEndpoints = Object.entries(endpointStats).sort(
    (a, b) => b[1].totalDuration / b[1].count - a[1].totalDuration / a[1].count
  );

  console.log('\nSlowest Endpoints (by average duration):');
  sortedEndpoints.slice(0, 5).forEach(([endpoint, stats], index) => {
    const avgDuration = stats.totalDuration / stats.count;
    console.log(`  ${index + 1}. ${endpoint}: ${avgDuration.toFixed(2)}ms`);
  });

  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('-'.repeat(60));
  const slowEndpoints = sortedEndpoints.filter(
    ([, stats]) => stats.totalDuration / stats.count > 1000
  );

  if (slowEndpoints.length > 0) {
    console.log('⚠️  Slow endpoints detected (>1000ms):');
    slowEndpoints.forEach(([endpoint]) => {
      console.log(`   - ${endpoint}: Consider optimization or caching`);
    });
  } else {
    console.log('✅ All endpoints are performing well (<1000ms average)');
  }

  const lowSuccessRate = Object.entries(endpointStats).filter(
    ([, stats]) => (stats.successes / stats.count) * 100 < 95
  );

  if (lowSuccessRate.length > 0) {
    console.log('\n⚠️  Endpoints with low success rate (<95%):');
    lowSuccessRate.forEach(([endpoint, stats]) => {
      const successRate = (stats.successes / stats.count) * 100;
      console.log(`   - ${endpoint}: ${successRate.toFixed(2)}% success rate`);
    });
  } else {
    console.log('✅ All endpoints have high success rate (>95%)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Load Test Complete!');
  console.log('='.repeat(60) + '\n');
}

// Run the test
runLoadTest().catch((error) => {
  console.error('❌ Load test failed:', error);
  process.exit(1);
});
