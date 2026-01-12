import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Banda Chao/i);
  });

  test('should display header with navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for main navigation elements
    await expect(page.locator('text=首页').or(page.locator('text=الرئيسية'))).toBeVisible();
    await expect(page.locator('text=商品').or(page.locator('text=المنتجات'))).toBeVisible();
  });

  test('should display featured products section', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load (if any)
    const productsSection = page.locator('text=Latest Products').or(page.locator('text=أحدث المنتجات'));
    await expect(productsSection).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    
    // Click on products link
    const productsLink = page.locator('a:has-text("商品")').or(page.locator('a:has-text("المنتجات")'));
    if (await productsLink.count() > 0) {
      await productsLink.first().click();
      await expect(page).toHaveURL(/\/products/);
    }
  });

  test('should display language switcher', async ({ page }) => {
    await page.goto('/');
    
    // Check for language options
    const languageSwitcher = page.locator('text=中文').or(page.locator('text=العربية'));
    await expect(languageSwitcher).toBeVisible();
  });
});

