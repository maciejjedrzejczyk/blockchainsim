# Blockchain Demo - Test Documentation

This document provides comprehensive information about the test suite for the Advanced Blockchain Demo application.

## Overview

The test suite covers all major functionality of the blockchain application through API endpoint testing. Tests are organized into logical groups and use Jest as the testing framework with Supertest for HTTP assertions.

## Test Structure

### Test Files

1. **`user-registration.test.js`** - User registration and authentication tests
2. **`asset-operations.test.js`** - Token issuance and transfer tests
3. **`mining-validation.test.js`** - Mining and blockchain validation tests
4. **`search-functionality.test.js`** - Search and lookup functionality tests
5. **`integration.test.js`** - End-to-end workflow tests
6. **`blockchain.test.js`** - Test application setup and utilities

## Test Categories

### 1. User Registration Tests (`user-registration.test.js`)

#### Scenarios Covered:
- **Successful Registration**: Tests registration for all three roles (issuer, participant, payment_provider)
- **Input Validation**: Tests missing username, missing role, invalid role
- **Duplicate Prevention**: Tests duplicate username rejection
- **Unique Address Generation**: Verifies unique wallet addresses
- **User Listing**: Tests retrieval of all registered users
- **Private Key Validation**: Tests correct and incorrect private key validation

#### Key Test Cases:
```javascript
// Example test case
test('should register an issuer successfully', async () => {
    const userData = { username: 'BankIssuer', role: 'issuer' };
    const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(200);
    
    expect(response.body.user).toHaveProperty('walletAddress');
    expect(response.body.user).toHaveProperty('privateKey');
    expect(response.body.user.walletAddress).toMatch(/^[a-f0-9]{40}$/);
});
```

### 2. Asset Operations Tests (`asset-operations.test.js`)

#### Scenarios Covered:
- **Token Issuance**: Tests successful token creation by issuers
- **Role-based Access**: Tests that only issuers can issue tokens
- **Token Transfer**: Tests transfers between participants
- **Balance Validation**: Tests insufficient balance scenarios
- **Authentication**: Tests private key validation for transactions
- **Pending Transactions**: Tests transaction pool management

#### Key Test Cases:
```javascript
// Token issuance test
test('should allow issuer to issue tokens to participant', async () => {
    const issueData = {
        issuerUsername: 'BankIssuer',
        toUsername: 'Alice',
        amount: 100,
        assetName: 'Gold Coins',
        privateKey: issuerData.privateKey
    };
    
    const response = await request(app)
        .post('/api/issue-tokens')
        .send(issueData)
        .expect(200);
    
    expect(response.body.transaction.type).toBe('issue');
    expect(response.body.transaction.amount).toBe(100);
});
```

### 3. Mining and Validation Tests (`mining-validation.test.js`)

#### Scenarios Covered:
- **Mining Authorization**: Tests that only payment providers can mine
- **Block Creation**: Tests successful block mining with pending transactions
- **Balance Updates**: Tests balance updates after mining
- **Blockchain Integrity**: Tests blockchain validation after operations
- **Multiple Transactions**: Tests mining blocks with multiple transactions
- **Empty Mining**: Tests mining when no pending transactions exist

#### Key Test Cases:
```javascript
// Mining test
test('should allow payment provider to mine pending transactions', async () => {
    const mineData = {
        minerUsername: 'MinerCorp',
        privateKey: minerData.privateKey
    };
    
    const response = await request(app)
        .post('/api/mine')
        .send(mineData)
        .expect(200);
    
    expect(response.body.message).toBe('Block mined successfully!');
    expect(response.body.block).toHaveProperty('hash');
    expect(response.body.block).toHaveProperty('nonce');
});
```

### 4. Search Functionality Tests (`search-functionality.test.js`)

#### Scenarios Covered:
- **Transaction Search**: Tests finding transactions by hash
- **Block Search**: Tests finding blocks by hash
- **Genesis Block Search**: Tests finding the genesis block
- **Not Found Handling**: Tests 404 responses for non-existent hashes
- **Data Completeness**: Tests that search results contain all required fields
- **Edge Cases**: Tests invalid hash formats and special characters

#### Key Test Cases:
```javascript
// Transaction search test
test('should find transaction by hash', async () => {
    const response = await request(app)
        .get(`/api/search/${transactionHash}`)
        .expect(200);
    
    expect(response.body.type).toBe('transaction');
    expect(response.body.data).toHaveProperty('fromUsername');
    expect(response.body.data).toHaveProperty('toUsername');
    expect(response.body.data).toHaveProperty('blockHash');
});
```

### 5. Integration Tests (`integration.test.js`)

#### Scenarios Covered:
- **Complete Workflows**: Tests full token lifecycle from issuance to transfer
- **Multi-user Scenarios**: Tests complex interactions between multiple users
- **Error Handling**: Tests system behavior under error conditions
- **Concurrent Operations**: Tests handling of simultaneous transactions
- **System Reset**: Tests complete system reset functionality

#### Key Test Cases:
```javascript
// Complete workflow test
test('should handle complete token issuance and transfer workflow', async () => {
    // Register users, issue tokens, mine, transfer, mine again
    // Verify all steps work together correctly
    expect(finalBalances).toHaveProperty('Alice', 700);
    expect(finalBalances).toHaveProperty('Bob', 300);
    expect(blockchainResponse.body.isValid).toBe(true);
});
```

## Running Tests

### Prerequisites
```bash
npm install
```

### Test Commands

#### Run All Tests
```bash
npm test
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Tests with Coverage
```bash
npm run test:coverage
```

#### Run Specific Test File
```bash
npx jest user-registration.test.js
```

#### Run Tests Matching Pattern
```bash
npx jest --testNamePattern="should register"
```

## Test Data and Setup

### Test Users
Each test file creates its own isolated test environment with fresh users:

- **Issuers**: `BankIssuer`, `CentralBank`, `Bank1`, `Bank2`
- **Participants**: `Alice`, `Bob`, `Charlie`
- **Payment Providers**: `MinerCorp`, `PaymentProcessor`, `Miner`

### Test Transactions
Tests create various transaction types:
- Token issuance (100-1000 tokens)
- Token transfers (25-500 tokens)
- Multiple asset types (`Gold Coins`, `Silver Coins`, `USD Tokens`, `EUR Tokens`)

## Assertions and Validations

### Common Assertions
```javascript
// User registration assertions
expect(response.body.user).toHaveProperty('username');
expect(response.body.user).toHaveProperty('role');
expect(response.body.user).toHaveProperty('walletAddress');
expect(response.body.user).toHaveProperty('privateKey');
expect(response.body.user.walletAddress).toMatch(/^[a-f0-9]{40}$/);

// Transaction assertions
expect(response.body.transaction).toHaveProperty('signature');
expect(response.body.transaction).toHaveProperty('id');
expect(response.body.transaction.type).toBe('issue' | 'transfer');

// Blockchain assertions
expect(response.body.chain).toHaveLength(expectedLength);
expect(response.body.isValid).toBe(true);
expect(response.body.balances).toHaveProperty('Alice', expectedBalance);
```

### Error Assertions
```javascript
// Authentication errors
expect(response.body.error).toBe('Invalid private key');

// Authorization errors
expect(response.body.error).toBe('Only issuers can issue tokens');

// Validation errors
expect(response.body.error).toBe('Missing required fields');
expect(response.body.error).toBe('Not enough balance');
```

## Test Coverage

The test suite aims for comprehensive coverage of:

### API Endpoints (100% Coverage)
- ✅ `POST /api/register`
- ✅ `GET /api/users`
- ✅ `POST /api/validate-key`
- ✅ `GET /api/blockchain`
- ✅ `GET /api/balances`
- ✅ `POST /api/issue-tokens`
- ✅ `POST /api/transfer`
- ✅ `POST /api/mine`
- ✅ `GET /api/pending`
- ✅ `GET /api/search/:hash`
- ✅ `POST /api/reset`

### Business Logic Coverage
- ✅ User registration for all roles
- ✅ Private key generation and validation
- ✅ Wallet address generation
- ✅ Transaction creation and signing
- ✅ Role-based access control
- ✅ Balance tracking and validation
- ✅ Mining and block creation
- ✅ Blockchain validation
- ✅ Search functionality
- ✅ Error handling

### Edge Cases Coverage
- ✅ Invalid inputs
- ✅ Missing required fields
- ✅ Unauthorized operations
- ✅ Insufficient balances
- ✅ Non-existent users/hashes
- ✅ Duplicate registrations
- ✅ Empty states
- ✅ Concurrent operations

## Performance Considerations

### Test Execution Time
- Individual tests: < 100ms
- Full test suite: < 30 seconds
- Coverage report: < 45 seconds

### Memory Usage
- Each test creates isolated blockchain instance
- Memory is cleaned up between tests
- No persistent state between test files

## Debugging Tests

### Verbose Output
```bash
npx jest --verbose
```

### Debug Specific Test
```bash
npx jest --testNamePattern="specific test name" --verbose
```

### Console Logging
Tests include strategic console.log statements for debugging:
```javascript
console.log('Transaction hash:', response.body.transaction.id);
console.log('Block hash:', response.body.block.hash);
```

## Continuous Integration

### GitHub Actions Configuration
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Test Maintenance

### Adding New Tests
1. Create test file in `__tests__/` directory
2. Import test utilities from `blockchain.test.js`
3. Follow existing naming conventions
4. Include both positive and negative test cases
5. Update this documentation

### Updating Existing Tests
1. Maintain backward compatibility
2. Update assertions if API changes
3. Preserve test isolation
4. Update documentation if behavior changes

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill existing processes
pkill -f "node server.js"
```

#### Test Timeouts
```javascript
// Increase timeout for slow tests
jest.setTimeout(10000);
```

#### Memory Issues
```javascript
// Clear test data between tests
afterEach(() => {
    // Cleanup code
});
```

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic
- Use beforeEach for common setup

### Assertions
- Test both success and failure cases
- Verify all important response fields
- Use specific matchers (toHaveProperty, toMatch)
- Include meaningful error messages

### Data Management
- Use fresh data for each test
- Avoid test interdependencies
- Clean up after tests
- Use realistic test data

This comprehensive test suite ensures the blockchain application works correctly across all scenarios and provides confidence for future development and maintenance.
