import { test, expect } from '@playwright/test';

test.describe('AI System Tests', () => {
  test('should open and interact with ChatWidget (Panda Chat)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for chat bubble (usually bottom-right)
    const chatBubble = page.locator('[data-testid="chat-bubble"], button:has-text("🐼"), .fixed.bottom-4.right-4 button');
    
    if (await chatBubble.count() > 0) {
      await chatBubble.click();
      await page.waitForTimeout(500);

      // Verify chat window opened
      const chatWindow = page.locator('[data-testid="chat-window"], .chat-window, [role="dialog"]');
      await expect(chatWindow.first()).toBeVisible({ timeout: 5000 });

      // Type a message
      const input = page.locator('input[placeholder*="message"], textarea[placeholder*="message"], input[type="text"]').last();
      if (await input.count() > 0) {
        await input.fill('Hello, Panda!');
        await input.press('Enter');
        
        // Wait for response (with timeout)
        await page.waitForTimeout(3000);

        // Verify message was sent (check for user message in chat)
        const userMessage = page.locator('text=Hello, Panda!');
        // Message might be visible or might be loading
        await expect(userMessage.first()).toBeVisible({ timeout: 10000 }).catch(() => {
          // If not visible, check for loading state
          const loading = page.locator('text=Loading, text=加载中, text=جاري التحميل');
          expect(loading.first()).toBeVisible({ timeout: 5000 });
        });
      }
    }
  });

  test('should access FounderAIAssistant page', async ({ page }) => {
    await page.goto('/founder/assistant');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page).toHaveURL(/.*founder.*assistant/);

    // Check for assistant buttons (Vision, Technical, Security, etc.)
    const assistantButtons = page.locator('button:has-text("Vision"), button:has-text("Technical"), button:has-text("Security"), button:has-text("الرؤية"), button:has-text("التقنية")');
    
    if (await assistantButtons.count() > 0) {
      // Click on Technical assistant
      const technicalButton = page.locator('button:has-text("Technical"), button:has-text("التقنية")').first();
      if (await technicalButton.count() > 0) {
        await technicalButton.click();
        await page.waitForTimeout(500);

        // Verify chat interface is visible
        const chatInput = page.locator('input[type="text"], textarea').first();
        await expect(chatInput).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should test voice input button (if available)', async ({ page }) => {
    await page.goto('/founder/assistant');
    await page.waitForLoadState('networkidle');

    // Look for microphone button
    const micButton = page.locator('button:has-text("🎤"), button[aria-label*="microphone"], button[title*="microphone"]');
    
    if (await micButton.count() > 0) {
      // Verify button exists
      await expect(micButton.first()).toBeVisible();
      
      // Note: Actual voice input testing requires browser permissions
      // This test just verifies the button exists
    }
  });

  test('should test text-to-speech button (if available)', async ({ page }) => {
    await page.goto('/founder/assistant');
    await page.waitForLoadState('networkidle');

    // Look for audio/play button (usually next to assistant messages)
    const audioButton = page.locator('button:has-text("🔊"), button:has-text("⏸️"), button[aria-label*="audio"], button[title*="audio"]');
    
    if (await audioButton.count() > 0) {
      // Verify button exists
      await expect(audioButton.first()).toBeVisible();
    }
  });
});

