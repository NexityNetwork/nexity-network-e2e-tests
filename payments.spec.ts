import { test, expect } from './fixtures';

test.describe('Payment Processing', () => {
  test('multi-currency payment processing and escrow management', async ({ buyerPage, sellerPage }) => {
    // Navigate to payments dashboard
    await buyerPage.goto('/payments');
    
    // Test Stripe payment for USD
    await buyerPage.click('[data-testid="add-payment-method"]');
    await buyerPage.selectOption('[data-testid="payment-provider"]', 'stripe');
    await buyerPage.selectOption('[data-testid="currency-select"]', 'USD');
    await buyerPage.fill('[data-testid="amount-input"]', '100');
    
    // Fill mock Stripe details (test mode)
    await buyerPage.fill('[data-testid="card-number"]', '4242424242424242');
    await buyerPage.fill('[data-testid="card-expiry"]', '12/25');
    await buyerPage.fill('[data-testid="card-cvc"]', '123');
    
    // Process payment
    await buyerPage.click('[data-testid="process-payment"]');
    await expect(buyerPage.locator('[data-testid="payment-success"]')).toBeVisible();
    
    // Verify payment in database
    const paymentsResponse = await buyerPage.request.get('/api/payments');
    expect(paymentsResponse.status()).toBe(200);
    const payments = await paymentsResponse.json();
    const testPayment = payments.find(p => p.amount === 100 && p.currency === 'USD');
    expect(testPayment).toBeDefined();
    expect(testPayment.status).toBe('completed');
    expect(testPayment.provider).toBe('stripe');
    
    // Test cryptocurrency payment with MetaMask
    await buyerPage.click('[data-testid="add-crypto-payment"]');
    await buyerPage.selectOption('[data-testid="crypto-currency"]', 'ETH');
    await buyerPage.fill('[data-testid="crypto-amount"]', '0.05');
    
    // Mock MetaMask connection
    await buyerPage.evaluate(() => {
      (window as any).ethereum = {
        request: async ({ method }) => {
          if (method === 'eth_requestAccounts') {
            return ['0x742d35Cc6734C0532925a3b8D0Ac6bc900dE1B2e'];
          }
          if (method === 'eth_sendTransaction') {
            return '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz890';
          }
        }
      };
    });
    
    await buyerPage.click('[data-testid="connect-metamask"]');
    await buyerPage.click('[data-testid="confirm-crypto-payment"]');
    
    // Verify cryptocurrency payment
    const cryptoResponse = await buyerPage.request.get('/api/payments/crypto');
    const cryptoPayments = await cryptoResponse.json();
    const cryptoPayment = cryptoPayments.find(p => p.currency === 'ETH');
    expect(cryptoPayment).toBeDefined();
    expect(cryptoPayment.blockchain_hash).toBeDefined();
    
    // Test escrow functionality
    await buyerPage.goto('/orders');
    const ordersResponse = await buyerPage.request.get('/api/orders');
    const orders = await ordersResponse.json();
    const activeOrder = orders.find(o => o.status === 'in_progress');
    
    if (activeOrder) {
      // Verify escrow balance
      const escrowResponse = await buyerPage.request.get(`/api/payments/escrow/${activeOrder.id}`);
      const escrowData = await escrowResponse.json();
      expect(escrowData.held_amount).toBeGreaterThan(0);
      expect(escrowData.status).toBe('held');
      
      // Test escrow release
      await buyerPage.click(`[data-testid="release-escrow-${activeOrder.id}"]`);
      
      const releasedResponse = await buyerPage.request.get(`/api/payments/escrow/${activeOrder.id}`);
      const releasedData = await releasedResponse.json();
      expect(releasedData.status).toBe('released');
    }
  });
});
