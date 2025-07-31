import { test, expect } from './fixtures';

test.describe('Contract Management', () => {
  test('complete contract lifecycle from creation to signing', async ({ buyerPage, sellerPage }) => {
    // Navigate to contract creation
    await buyerPage.goto('/contracts');
    await buyerPage.click('[data-testid="create-contract-button"]');
    
    // Fill contract details
    await buyerPage.fill('[data-testid="contract-title"]', 'E2E Test Contract');
    await buyerPage.fill('[data-testid="contract-description"]', 'Automated testing contract');
    await buyerPage.fill('[data-testid="contract-amount"]', '1000');
    await buyerPage.selectOption('[data-testid="contract-currency"]', 'USD');
    await buyerPage.fill('[data-testid="counterparty-email"]', 'olivia.collins@nexitynetwork.uk');
    
    // Create contract
    await buyerPage.click('[data-testid="create-contract-submit"]');
    await expect(buyerPage.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify contract creation in database
    const contractsResponse = await buyerPage.request.get('/api/contracts');
    expect(contractsResponse.status()).toBe(200);
    const contracts = await contractsResponse.json();
    const testContract = contracts.find(c => c.title === 'E2E Test Contract');
    expect(testContract).toBeDefined();
    expect(testContract.amount).toBe(1000);
    expect(testContract.currency).toBe('USD');
    expect(testContract.status).toBe('draft');
    
    // Navigate to negotiation room
    await buyerPage.click(`[data-testid="contract-${testContract.id}-negotiate"]`);
    await buyerPage.click('[data-testid="send-for-review"]');
    
    // Seller approves contract
    await sellerPage.goto('/contracts');
    await sellerPage.click(`[data-testid="contract-${testContract.id}-review"]`);
    await sellerPage.click('[data-testid="approve-contract"]');
    
    // Verify contract approval in database
    const updatedResponse = await sellerPage.request.get(`/api/contracts/${testContract.id}`);
    const updatedContract = await updatedResponse.json();
    expect(updatedContract.status).toBe('approved');
    
    // Both parties sign contract
    await buyerPage.goto(`/contracts/${testContract.id}/signature`);
    await buyerPage.click('[data-testid="sign-contract"]');
    
    await sellerPage.goto(`/contracts/${testContract.id}/signature`);
    await sellerPage.click('[data-testid="sign-contract"]');
    
    // Verify final contract state
    const finalResponse = await buyerPage.request.get(`/api/contracts/${testContract.id}`);
    const finalContract = await finalResponse.json();
    expect(finalContract.status).toBe('signed');
    expect(finalContract.blockchain_address).toBeDefined();
  });
});
