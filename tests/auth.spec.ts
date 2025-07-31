import { test, expect } from './fixtures.ts';

test.describe('Authentication System', () => {
  test('buyer and seller can login and access dashboard', async ({ buyerPage, sellerPage }) => {
    // Verify buyer authentication and dashboard access
    await expect(buyerPage).toHaveURL(/.*dashboard/);
    await expect(buyerPage.locator('[data-testid="user-profile"]')).toContainText('catalin@nexitynetwork.org');
    
    // Verify seller authentication and dashboard access  
    await expect(sellerPage).toHaveURL(/.*dashboard/);
    await expect(sellerPage.locator('[data-testid="user-profile"]')).toContainText('olivia.collins@nexitynetwork.uk');
    
    // Validate backend authentication state via API
    const buyerAuthResponse = await buyerPage.request.get('/api/auth/me');
    expect(buyerAuthResponse.status()).toBe(200);
    const buyerAuth = await buyerAuthResponse.json();
    expect(buyerAuth.email).toBe('catalin@nexitynetwork.org');
    
    const sellerAuthResponse = await sellerPage.request.get('/api/auth/me');
    expect(sellerAuthResponse.status()).toBe(200);
    const sellerAuth = await sellerAuthResponse.json();
    expect(sellerAuth.email).toBe('olivia.collins@nexitynetwork.uk');
    
    // Verify organization isolation in database
    expect(buyerAuth.organization_id).toBe(1);
    expect(sellerAuth.organization_id).toBe(2);
    expect(buyerAuth.organization_id).not.toBe(sellerAuth.organization_id);
  });
});
