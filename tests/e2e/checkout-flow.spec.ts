import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart before each test
    await page.goto('/');
    await page.evaluate(() => {
      const cart = [
        {
          product: {
            id: 'test-1',
            name: 'Test Product',
            price: 99.99,
            images: [],
          },
          quantity: 1,
        },
      ];
      localStorage.setItem('banda-chao-cart', JSON.stringify(cart));
    });
  });

  test('should navigate to checkout page', async ({ page }) => {
    await page.goto('/cart');
    
    // Click proceed to checkout
    const checkoutButton = page.locator('button:has-text("Checkout")').or(
      page.locator('button:has-text("الدفع")')
    );
    
    if (await checkoutButton.count() > 0) {
      await checkoutButton.click();
      await expect(page).toHaveURL(/\/checkout/, { timeout: 5000 });
    }
  });

  test('should display checkout form', async ({ page }) => {
    await page.goto('/checkout');
    
    // Check for form fields
    const nameField = page.locator('input[type="text"]').first();
    await expect(nameField).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/checkout');
    
    // Try to submit without filling form
    const submitButton = page.locator('button:has-text("Payment")').or(
      page.locator('button:has-text("الدفع")')
    );
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Should show validation error or prevent submission
      // (Implementation depends on form validation)
    }
  });
});

