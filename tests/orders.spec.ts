import { test, expect } from './fixtures';

test.describe('Order Management', () => {
  test('order creation and milestone completion workflow', async ({ buyerPage, sellerPage }) => {
    // Create order from existing contract
    await buyerPage.goto('/orders');
    await buyerPage.click('[data-testid="create-order-button"]');
    
    // Select contract and fill order details
    await buyerPage.selectOption('[data-testid="contract-select"]', { index: 0 });
    await buyerPage.fill('[data-testid="order-description"]', 'E2E Test Order');
    await buyerPage.selectOption('[data-testid="payment-workflow"]', 'milestone');
    
    // Add milestones
    await buyerPage.click('[data-testid="add-milestone"]');
    await buyerPage.fill('[data-testid="milestone-1-description"]', 'First milestone');
    await buyerPage.fill('[data-testid="milestone-1-amount"]', '500');
    
    await buyerPage.click('[data-testid="add-milestone"]');
    await buyerPage.fill('[data-testid="milestone-2-description"]', 'Final milestone');
    await buyerPage.fill('[data-testid="milestone-2-amount"]', '500');
    
    // Submit order
    await buyerPage.click('[data-testid="create-order-submit"]');
    await expect(buyerPage.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify order creation in database
    const ordersResponse = await buyerPage.request.get('/api/orders');
    expect(ordersResponse.status()).toBe(200);
    const orders = await ordersResponse.json();
    const testOrder = orders.find(o => o.description === 'E2E Test Order');
    expect(testOrder).toBeDefined();
    expect(testOrder.status).toBe('pending');
    expect(testOrder.total_amount).toBe(1000);
    
    // Seller accepts order
    await sellerPage.goto('/orders');
    await sellerPage.click(`[data-testid="order-${testOrder.id}-accept"]`);
    
    // Verify order acceptance
    const acceptedResponse = await sellerPage.request.get(`/api/orders/${testOrder.id}`);
    const acceptedOrder = await acceptedResponse.json();
    expect(acceptedOrder.status).toBe('in_progress');
    
    // Complete first milestone
    await sellerPage.click(`[data-testid="milestone-1-complete"]`);
    await buyerPage.goto(`/orders/${testOrder.id}`);
    await buyerPage.click(`[data-testid="milestone-1-approve"]`);
    
    // Verify milestone completion in database
    const milestonesResponse = await buyerPage.request.get(`/api/orders/${testOrder.id}/milestones`);
    const milestones = await milestonesResponse.json();
    expect(milestones[0].status).toBe('completed');
    expect(milestones[0].payment_released).toBe(true);
    
    // Complete final milestone and order
    await sellerPage.click(`[data-testid="milestone-2-complete"]`);
    await buyerPage.click(`[data-testid="milestone-2-approve"]`);
    
    // Verify order completion
    const completedResponse = await buyerPage.request.get(`/api/orders/${testOrder.id}`);
    const completedOrder = await completedResponse.json();
    expect(completedOrder.status).toBe('completed');
    expect(completedOrder.nft_token_id).toBeDefined();
  });
});
