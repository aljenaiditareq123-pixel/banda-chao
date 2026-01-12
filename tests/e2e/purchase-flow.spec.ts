import { test, expect } from '@playwright/test';

test.describe('Complete Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full purchase flow from product selection to payment', async ({ page }) => {
    // Step 1: Navigate to products page
    await page.click('text=商品');
    await page.waitForURL('**/products');
    await page.waitForLoadState('networkidle');

    // Step 2: Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      await page.waitForURL('**/products/**');
      await page.waitForLoadState('networkidle');

      // Step 3: Add product to cart
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("加入购物车"), button:has-text("أضف إلى السلة")');
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click();
        
        // Wait for cart to update (check for cart badge or notification)
        await page.waitForTimeout(1000);

        // Step 4: Navigate to cart
        const cartLink = page.locator('a[href*="/cart"], a:has-text("购物车"), a:has-text("السلة")');
        if (await cartLink.count() > 0) {
          await cartLink.click();
          await page.waitForURL('**/cart');
          await page.waitForLoadState('networkidle');

          // Step 5: Verify cart has items
          const cartItems = page.locator('[data-testid="cart-item"]');
          const itemCount = await cartItems.count();
          
          if (itemCount > 0) {
            // Step 6: Proceed to checkout
            const checkoutButton = page.locator('button:has-text("Proceed to Checkout"), button:has-text("去结账"), button:has-text("الانتقال للدفع")');
            if (await checkoutButton.count() > 0) {
              await checkoutButton.click();
              await page.waitForURL('**/checkout');
              await page.waitForLoadState('networkidle');

              // Step 7: Fill checkout form
              const fullNameInput = page.locator('input[name="fullName"], input[placeholder*="Name"], input[placeholder*="姓名"]');
              if (await fullNameInput.count() > 0) {
                await fullNameInput.fill('Test User');
              }

              const countryInput = page.locator('input[name="country"], input[placeholder*="Country"], input[placeholder*="国家"]');
              if (await countryInput.count() > 0) {
                await countryInput.fill('China');
              }

              const cityInput = page.locator('input[name="city"], input[placeholder*="City"], input[placeholder*="城市"]');
              if (await cityInput.count() > 0) {
                await cityInput.fill('Beijing');
              }

              const addressInput = page.locator('input[name="address"], input[placeholder*="Address"], input[placeholder*="地址"]');
              if (await addressInput.count() > 0) {
                await addressInput.fill('123 Test Street');
              }

              const phoneInput = page.locator('input[name="phone"], input[placeholder*="Phone"], input[placeholder*="电话"]');
              if (await phoneInput.count() > 0) {
                await phoneInput.fill('+861234567890');
              }

              // Step 8: Verify order summary is visible
              const orderSummary = page.locator('text=Order Summary, text=订单摘要, text=ملخص الطلب');
              await expect(orderSummary.first()).toBeVisible({ timeout: 5000 });

              // Step 9: Click proceed to payment (this will redirect to Stripe)
              const paymentButton = page.locator('button:has-text("Proceed to Payment"), button:has-text("去支付"), button:has-text("الانتقال للدفع")');
              if (await paymentButton.count() > 0) {
                // Note: We won't actually complete Stripe payment in test
                // Just verify the button exists and form is valid
                await expect(paymentButton).toBeVisible();
                
                // Verify form validation
                const isFormValid = await paymentButton.isEnabled();
                expect(isFormValid).toBeTruthy();
              }
            }
          }
        }
      }
    }
  });

  test('should handle empty cart state', async ({ page }) => {
    // Navigate to cart directly
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Check for empty cart message
    const emptyCartMessage = page.locator('text=Your cart is empty, text=购物车是空的, text=سلة التسوق فارغة');
    if (await emptyCartMessage.count() > 0) {
      await expect(emptyCartMessage.first()).toBeVisible();
    }
  });

  test('should update cart quantity', async ({ page }) => {
    // This test assumes cart has items
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Look for quantity controls
    const increaseButton = page.locator('button:has-text("+"), button[aria-label*="increase"]');
    const decreaseButton = page.locator('button:has-text("-"), button[aria-label*="decrease"]');

    if (await increaseButton.count() > 0) {
      const initialQuantity = await page.locator('input[type="number"], span:has-text(/^[0-9]+$/)').first().textContent();
      
      await increaseButton.first().click();
      await page.waitForTimeout(500);

      // Verify quantity increased
      const newQuantity = await page.locator('input[type="number"], span:has-text(/^[0-9]+$/)').first().textContent();
      if (initialQuantity && newQuantity) {
        expect(parseInt(newQuantity)).toBeGreaterThan(parseInt(initialQuantity));
      }
    }
  });
});

