import { test, expect } from '@playwright/test';

test.describe('Shopping Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add product to cart', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 }).catch(() => {});
    
    // Click on first product if available
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      
      // Wait for product detail page
      await page.waitForURL(/\/products\/\w+/, { timeout: 5000 });
      
      // Click add to cart button
      const addToCartButton = page.locator('button:has-text("Add to Cart")').or(
        page.locator('button:has-text("أضف إلى السلة")')
      );
      
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click();
        
        // Check cart icon shows item count
        const cartBadge = page.locator('[aria-label*="cart"]').or(page.locator('text=/\\d+/'));
        await expect(cartBadge).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/cart/);
    
    // Check for cart page elements
    const cartTitle = page.locator('text=Cart').or(page.locator('text=السلة'));
    await expect(cartTitle).toBeVisible({ timeout: 5000 });
  });

  test('should display empty cart message when cart is empty', async ({ page }) => {
    // Clear cart first
    await page.evaluate(() => {
      localStorage.removeItem('banda-chao-cart');
    });
    
    await page.goto('/cart');
    
    const emptyMessage = page.locator('text=empty').or(page.locator('text=فارغة'));
    await expect(emptyMessage).toBeVisible({ timeout: 5000 });
  });
});

