# Nexity Network E2E Test Suite

Comprehensive end-to-end testing framework for production validation of the Nexity Network platform.

## Overview

This test suite validates:
- **Authentication**: Multi-user login and session management
- **Contracts**: Complete lifecycle from creation to blockchain deployment
- **Orders**: Milestone-based workflow and payment processing
- **Payments**: Multi-currency support and escrow management
- **Disputes**: Creation, notification, and resolution workflow
- **Smart Contracts**: Blockchain integration and NFT minting

## Features

✅ **Production Domain Testing**: Tests run against `https://trade.nexitynetwork.org`  
✅ **Database Validation**: Verifies actual backend data persistence  
✅ **Cross-Browser Testing**: Chromium, Firefox, and Mobile Chrome  
✅ **Real Business Logic**: Tests authentic workflows, not just UI  
✅ **CI/CD Integration**: GitHub Actions with automated reporting  

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Git

### Installation

1. **Extract the test suite**
   ```bash
   tar -xzf nexity-e2e-test-suite.tar.gz
   cd nexity-e2e-test-suite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install browser dependencies**
   ```bash
   npx playwright install --with-deps
   ```

### Running Tests

**Full test suite:**
```bash
npm test
```

**Headed mode (watch tests run):**
```bash
npm run test:headed
```

**Debug mode:**
```bash
npm run test:debug
```

**View test report:**
```bash
npm run report
```

## Test Architecture

### Fixtures (`tests/fixtures.ts`)
- Authenticated buyer context (`catalin@nexitynetwork.org`)
- Authenticated seller context (`olivia.collins@nexitynetwork.uk`)
- Automatic login and session management

### Test Files
- `auth.spec.ts` - Authentication and organization isolation
- `contracts.spec.ts` - Contract lifecycle and blockchain deployment
- `orders.spec.ts` - Order management and milestone tracking
- `payments.spec.ts` - Multi-currency payments and escrow
- `disputes.spec.ts` - Dispute creation and notification system
- `smartContracts.spec.ts` - Blockchain integration and NFT minting

## CI/CD Integration

### GitHub Actions

Copy `.github/workflows/e2e-tests.yml` to your repository to enable:
- **Automated testing** on push/PR to main branch
- **Nightly test runs** at 4 AM UTC
- **Test reports** with artifact retention
- **Failure notifications** for monitoring

### Configuration

The tests are configured for:
- **Target**: Production domain (`https://trade.nexitynetwork.org`)
- **Retries**: 2 retries in CI environment
- **Reporting**: HTML and JSON reports
- **Screenshots**: On failure only
- **Videos**: Retained on failure

## Credentials

The test suite uses these production accounts:

**Buyer Account:**
- Email: `catalin@nexitynetwork.org`
- Password: `password123`
- Organization: NXT Enterprises (ID: 1)

**Seller Account:**
- Email: `olivia.collins@nexitynetwork.uk`  
- Password: `password123`
- Organization: TAS IT SRL (ID: 2)

## Database Validation

Each test validates:
- **API responses** for correct data structure
- **Database state changes** after operations
- **Organization isolation** between accounts
- **Business logic execution** (payments, escrow, notifications)
- **Blockchain integration** (smart contracts, NFT minting)

## Limitations

- **Browser Dependencies**: Cannot run in Replit environment due to missing system libraries
- **Production Only**: Tests require production domain with real database
- **User Permissions**: Some admin functions may be restricted in production

## Troubleshooting

**Common Issues:**

1. **Authentication failures**: Verify production credentials are active
2. **Network timeouts**: Check production domain accessibility
3. **Database errors**: Ensure test accounts exist in production database
4. **Browser crashes**: Run `npx playwright install --with-deps`

**Getting Help:**

- Check test reports in `playwright-report/` directory
- Review screenshots and videos for failed tests
- Examine console logs in test output
- Verify production environment status

## Maintenance

**Regular Updates:**

1. **Credentials**: Verify test account passwords remain valid
2. **Selectors**: Update data-testid attributes if UI changes
3. **API Endpoints**: Adjust requests if backend routes change
4. **Business Logic**: Modify workflows if platform features evolve

This test suite provides enterprise-grade validation for the Nexity Network platform's core functionality and business logic.
