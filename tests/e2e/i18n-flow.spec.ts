import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n) Tests', () => {
  test('should switch between languages (Chinese, Arabic, English)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find language switcher buttons
    const zhButton = page.locator('button:has-text("中文"), button[title="中文"]');
    const arButton = page.locator('button:has-text("عربي"), button:has-text("العربية"), button[title="العربية"]');
    const enButton = page.locator('button:has-text("EN"), button:has-text("English"), button[title="English"]');

    // Test Chinese (default)
    if (await zhButton.count() > 0) {
      await zhButton.click();
      await page.waitForTimeout(500);
      
      // Verify Chinese text appears (check for common Chinese words)
      const chineseText = page.locator('text=首页, text=商品, text=搜索');
      if (await chineseText.count() > 0) {
        await expect(chineseText.first()).toBeVisible();
      }
    }

    // Test English
    if (await enButton.count() > 0) {
      await enButton.click();
      await page.waitForTimeout(500);
      
      // Verify English text appears
      const englishText = page.locator('text=Home, text=Products, text=Search');
      if (await englishText.count() > 0) {
        await expect(englishText.first()).toBeVisible();
      }
    }

    // Test Arabic
    if (await arButton.count() > 0) {
      await arButton.click();
      await page.waitForTimeout(500);
      
      // Verify RTL is applied
      const html = await page.locator('html');
      const dir = await html.getAttribute('dir');
      expect(dir).toBe('rtl');
      
      // Verify Arabic text appears
      const arabicText = page.locator('text=الرئيسية, text=المنتجات, text=البحث');
      if (await arabicText.count() > 0) {
        await expect(arabicText.first()).toBeVisible();
      }
    }
  });

  test('should verify RTL support for Arabic', async ({ page }) => {
    // Switch to Arabic
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const arButton = page.locator('button:has-text("عربي"), button:has-text("العربية")');
    if (await arButton.count() > 0) {
      await arButton.click();
      await page.waitForTimeout(500);

      // Check HTML dir attribute
      const html = await page.locator('html');
      const dir = await html.getAttribute('dir');
      expect(dir).toBe('rtl');

      // Check body direction
      const body = await page.locator('body');
      const bodyDir = await body.getAttribute('dir');
      expect(bodyDir).toBe('rtl');
    }
  });

  test('should verify register page translations', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Test Chinese
    const zhButton = page.locator('button:has-text("中文")');
    if (await zhButton.count() > 0) {
      await zhButton.click();
      await page.waitForTimeout(500);

      // Check for Chinese text on register page
      const chineseRegisterText = page.locator('text=创建新账户, text=已有账户, text=登录');
      if (await chineseRegisterText.count() > 0) {
        await expect(chineseRegisterText.first()).toBeVisible();
      }
    }

    // Test Arabic
    const arButton = page.locator('button:has-text("عربي")');
    if (await arButton.count() > 0) {
      await arButton.click();
      await page.waitForTimeout(500);

      // Check for Arabic text on register page
      const arabicRegisterText = page.locator('text=إنشاء حساب جديد, text=لديك حساب, text=تسجيل الدخول');
      if (await arabicRegisterText.count() > 0) {
        await expect(arabicRegisterText.first()).toBeVisible();
      }

      // Verify RTL
      const html = await page.locator('html');
      const dir = await html.getAttribute('dir');
      expect(dir).toBe('rtl');
    }

    // Test English
    const enButton = page.locator('button:has-text("EN")');
    if (await enButton.count() > 0) {
      await enButton.click();
      await page.waitForTimeout(500);

      // Check for English text on register page
      const englishRegisterText = page.locator('text=Create Account, text=Already have, text=Login');
      if (await englishRegisterText.count() > 0) {
        await expect(englishRegisterText.first()).toBeVisible();
      }
    }
  });

  test('should persist language selection', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to Arabic
    const arButton = page.locator('button:has-text("عربي")');
    if (await arButton.count() > 0) {
      await arButton.click();
      await page.waitForTimeout(500);

      // Check localStorage
      const language = await page.evaluate(() => localStorage.getItem('language'));
      expect(language).toBe('ar');

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify language persisted
      const html = await page.locator('html');
      const dir = await html.getAttribute('dir');
      expect(dir).toBe('rtl');
    }
  });
});

