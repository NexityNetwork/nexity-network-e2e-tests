import { test, expect } from './fixtures.ts';

test.describe('Smart Contract Integration', () => {
  test('blockchain deployment and on-chain recording', async ({ buyerPage, sellerPage }) => {
    // Navigate to smart contracts section
    await buyerPage.goto('/contracts');
    
    // Get contracts for blockchain testing
    const contractsResponse = await buyerPage.request.get('/api/contracts');
    const contracts = await contractsResponse.json();
    const signedContract = contracts.find(c => c.status === 'signed');
    
    if (!signedContract) {
      test.skip('No signed contract available for blockchain testing');
    }
    
    // Verify blockchain deployment
    expect(signedContract.blockchain_address).toBeDefined();
    expect(signedContract.blockchain_hash).toBeDefined();
    
    // Test blockchain transaction validation
    const blockchainResponse = await buyerPage.request.get(`/api/blockchain/validate/${signedContract.blockchain_hash}`);
    expect(blockchainResponse.status()).toBe(200);
    const blockchainData = await blockchainResponse.json();
    expect(blockchainData.valid).toBe(true);
    expect(blockchainData.network).toBe('sepolia');
    
    // Test escrow smart contract triggers
    const ordersResponse = await buyerPage.request.get('/api/orders');
    const orders = await ordersResponse.json();
    const contractOrders = orders.filter(o => o.contract_id === signedContract.id);
    
    for (const order of contractOrders) {
      if (order.status === 'completed') {
        // Verify NFT minting
        expect(order.nft_token_id).toBeDefined();
        expect(order.nft_contract_address).toBeDefined();
        
        // Validate NFT on blockchain
        const nftResponse = await buyerPage.request.get(`/api/blockchain/nft/${order.nft_token_id}`);
        const nftData = await nftResponse.json();
        expect(nftData.exists).toBe(true);
        expect(nftData.owner).toBeDefined();
        expect(nftData.metadata).toBeDefined();
      }
    }
    
    // Test MetaMask signature verification
    await buyerPage.evaluate(() => {
      (window as any).ethereum = {
        request: async ({ method, params }) => {
          if (method === 'personal_sign') {
            return '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz890';
          }
          if (method === 'eth_accounts') {
            return ['0x742d35Cc6734C0532925a3b8D0Ac6bc900dE1B2e'];
          }
        }
      };
    });
    
    // Test contract creation with signature
    await buyerPage.goto('/contracts/create');
    await buyerPage.fill('[data-testid="contract-title"]', 'Blockchain Test Contract');
    await buyerPage.fill('[data-testid="contract-amount"]', '500');
    await buyerPage.click('[data-testid="require-blockchain"]');
    
    // Sign with MetaMask
    await buyerPage.click('[data-testid="sign-with-metamask"]');
    await expect(buyerPage.locator('[data-testid="signature-success"]')).toBeVisible();
    
    // Verify signature storage
    const signatureResponse = await buyerPage.request.get('/api/contracts/latest/signature');
    const signatureData = await signatureResponse.json();
    expect(signatureData.signature).toBeDefined();
    expect(signatureData.signer_address).toBe('0x742d35Cc6734C0532925a3b8D0Ac6bc900dE1B2e');
    
    // Test gas optimization
    const gasResponse = await buyerPage.request.get('/api/blockchain/gas-estimate');
    const gasData = await gasResponse.json();
    expect(gasData.estimated_gas).toBeGreaterThan(0);
    expect(gasData.gas_price).toBeGreaterThan(0);
    expect(gasData.total_cost_eth).toBeGreaterThan(0);
  });
});
