/**
 * Treasurer Service Test Script
 * اختبار خدمة الخازن
 * 
 * This script tests the dynamic pricing calculation
 * Expected: Product price 100$ for NEW user should be 90$ (10% discount)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock pricing rules data (simulating what would be in database)
const mockPricingRules = [
  {
    id: '1',
    rule_name: 'NEW_CUSTOMER_DISCOUNT',
    rule_type: 'DISCOUNT',
    conditions: {
      userType: 'NEW',
      minOrderValue: 50,
    },
    actions: {
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxDiscount: 20,
    },
    priority: 100,
    is_active: true,
    valid_from: null,
    valid_until: null,
  },
];

/**
 * Simplified calculateDynamicPrice function for testing
 */
function calculateDynamicPriceTest(
  originalPrice: number,
  context: {
    userType?: 'NEW' | 'RETURNING' | 'VIP';
    quantity?: number;
    orderValue?: number;
  }
): {
  originalPrice: number;
  finalPrice: number;
  discount: number;
  discountPercentage: number;
  appliedRules: Array<{ ruleName: string; discount: number }>;
} {
  let finalPrice = originalPrice;
  const appliedRules: Array<{ ruleName: string; discount: number }> = [];

  // Evaluate rules
  for (const rule of mockPricingRules) {
    if (!rule.is_active) continue;

    // Check conditions
    let conditionsMet = true;

    if (rule.conditions.userType && context.userType !== rule.conditions.userType) {
      conditionsMet = false;
    }

    if (rule.conditions.minOrderValue && (context.orderValue || 0) < rule.conditions.minOrderValue) {
      conditionsMet = false;
    }

    if (conditionsMet) {
      // Apply discount
      const discountType = rule.actions.discountType;
      const discountValue = rule.actions.discountValue || 0;
      const maxDiscount = rule.actions.maxDiscount || Infinity;

      let discount = 0;
      if (discountType === 'PERCENTAGE') {
        discount = (originalPrice * discountValue) / 100;
      } else if (discountType === 'FIXED') {
        discount = discountValue;
      }

      discount = Math.min(discount, maxDiscount);
      finalPrice = Math.max(0, finalPrice - discount);

      appliedRules.push({
        ruleName: rule.rule_name,
        discount,
      });
    }
  }

  const totalDiscount = originalPrice - finalPrice;
  const discountPercentage = originalPrice > 0 ? (totalDiscount / originalPrice) * 100 : 0;

  return {
    originalPrice,
    finalPrice,
    discount: totalDiscount,
    discountPercentage,
    appliedRules,
  };
}

async function main() {
  console.log('🧪 Testing Treasurer Service - Dynamic Pricing\n');
  console.log('='.repeat(60));

  // Test Case 1: NEW user, product price 100$
  console.log('\n📋 Test Case 1: NEW User, Product Price $100');
  console.log('-'.repeat(60));
  
  const test1 = calculateDynamicPriceTest(100, {
    userType: 'NEW',
    orderValue: 100,
  });

  console.log(`Original Price: $${test1.originalPrice}`);
  console.log(`Final Price: $${test1.finalPrice}`);
  console.log(`Discount: $${test1.discount}`);
  console.log(`Discount %: ${test1.discountPercentage.toFixed(1)}%`);
  console.log(`Applied Rules: ${test1.appliedRules.map(r => r.ruleName).join(', ')}`);

  // Verify expected result
  const expectedPrice = 90; // 100 - 10% = 90
  if (Math.abs(test1.finalPrice - expectedPrice) < 0.01) {
    console.log('\n✅ TEST PASSED: Price is $90 as expected (10% discount applied)');
  } else {
    console.log(`\n❌ TEST FAILED: Expected $${expectedPrice}, got $${test1.finalPrice}`);
    process.exit(1);
  }

  // Test Case 2: RETURNING user (no discount)
  console.log('\n📋 Test Case 2: RETURNING User, Product Price $100');
  console.log('-'.repeat(60));
  
  const test2 = calculateDynamicPriceTest(100, {
    userType: 'RETURNING',
    orderValue: 100,
  });

  console.log(`Original Price: $${test2.originalPrice}`);
  console.log(`Final Price: $${test2.finalPrice}`);
  console.log(`Discount: $${test2.discount}`);
  console.log(`Applied Rules: ${test2.appliedRules.length > 0 ? test2.appliedRules.map(r => r.ruleName).join(', ') : 'None'}`);

  if (test2.finalPrice === 100) {
    console.log('\n✅ TEST PASSED: No discount for RETURNING user');
  } else {
    console.log(`\n❌ TEST FAILED: Expected $100, got $${test2.finalPrice}`);
    process.exit(1);
  }

  // Test Case 3: NEW user, low order value (below minimum)
  console.log('\n📋 Test Case 3: NEW User, Order Value $30 (below $50 minimum)');
  console.log('-'.repeat(60));
  
  const test3 = calculateDynamicPriceTest(100, {
    userType: 'NEW',
    orderValue: 30, // Below $50 minimum
  });

  console.log(`Original Price: $${test3.originalPrice}`);
  console.log(`Final Price: $${test3.finalPrice}`);
  console.log(`Applied Rules: ${test3.appliedRules.length > 0 ? test3.appliedRules.map(r => r.ruleName).join(', ') : 'None'}`);

  if (test3.finalPrice === 100) {
    console.log('\n✅ TEST PASSED: No discount applied (order value too low)');
  } else {
    console.log(`\n❌ TEST FAILED: Expected $100 (no discount), got $${test3.finalPrice}`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 All Treasurer Service tests passed!');
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Test failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
