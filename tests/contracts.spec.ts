import { test, expect } from './fixtures';

test.describe('Dispute Resolution', () => {
  test('dispute creation and notification workflow', async ({ buyerPage, sellerPage }) => {
    // Get active order for dispute
    const ordersResponse = await buyerPage.request.get('/api/orders');
    const orders = await ordersResponse.json();
    const activeOrder = orders.find(o => o.status === 'in_progress');
    
    if (!activeOrder) {
      test.skip('No active order available for dispute testing');
    }
    
    // Buyer creates dispute
    await buyerPage.goto(`/orders/${activeOrder.id}`);
    await buyerPage.click('[data-testid="create-dispute"]');
    
    // Fill dispute details
    await buyerPage.fill('[data-testid="dispute-title"]', 'Quality Issue Dispute');
    await buyerPage.fill('[data-testid="dispute-description"]', 'Work quality does not meet specifications');
    await buyerPage.selectOption('[data-testid="dispute-category"]', 'quality');
    
    // Upload evidence
    await buyerPage.setInputFiles('[data-testid="evidence-upload"]', {
      name: 'evidence.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Evidence of quality issues')
    });
    
    // Submit dispute
    await buyerPage.click('[data-testid="submit-dispute"]');
    await expect(buyerPage.locator('[data-testid="dispute-success"]')).toBeVisible();
    
    // Verify dispute creation in database
    const disputesResponse = await buyerPage.request.get('/api/disputes');
    expect(disputesResponse.status()).toBe(200);
    const disputes = await disputesResponse.json();
    const testDispute = disputes.find(d => d.title === 'Quality Issue Dispute');
    expect(testDispute).toBeDefined();
    expect(testDispute.status).toBe('open');
    expect(testDispute.category).toBe('quality');
    expect(testDispute.order_id).toBe(activeOrder.id);
    
    // Verify seller receives notification
    await sellerPage.goto('/notifications');
    await expect(sellerPage.locator('[data-testid="dispute-notification"]')).toBeVisible();
    
    // Check notification in database
    const notificationsResponse = await sellerPage.request.get('/api/notifications');
    const notifications = await notificationsResponse.json();
    const disputeNotification = notifications.find(n => 
      n.type === 'dispute_created' && n.related_id === testDispute.id
    );
    expect(disputeNotification).toBeDefined();
    expect(disputeNotification.read).toBe(false);
    
    // Seller responds to dispute
    await sellerPage.goto(`/disputes/${testDispute.id}`);
    await sellerPage.fill('[data-testid="dispute-response"]', 'Will address quality concerns immediately');
    await sellerPage.click('[data-testid="submit-response"]');
    
    // Verify response in database
    const responseCheck = await sellerPage.request.get(`/api/disputes/${testDispute.id}/responses`);
    const responses = await responseCheck.json();
    expect(responses.length).toBeGreaterThan(0);
    expect(responses[0].message).toContain('quality concerns');
    
    // Admin mediates dispute (simulate admin access)
    const adminResponse = await buyerPage.request.patch(`/api/disputes/${testDispute.id}/mediate`, {
      data: {
        resolution: 'Partial refund approved',
        action: 'refund_50_percent'
      }
    });
    
    if (adminResponse.status() === 200) {
      // Verify resolution
      const resolvedResponse = await buyerPage.request.get(`/api/disputes/${testDispute.id}`);
      const resolvedDispute = await resolvedResponse.json();
      expect(resolvedDispute.status).toBe('resolved');
      expect(resolvedDispute.resolution).toContain('Partial refund');
    }
  });
});
