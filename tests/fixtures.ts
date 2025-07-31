import { test as base, expect, Page } from '@playwright/test';

type TestFixtures = {
  buyerPage: Page;
  sellerPage: Page;
};

export const test = base.extend<TestFixtures>({
  buyerPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login as buyer
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'catalin@nexitynetwork.org');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    await use(page);
    await context.close();
  },

  sellerPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login as seller
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'olivia.collins@nexitynetwork.uk');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    await use(page);
    await context.close();
  },
});

export { expect };
