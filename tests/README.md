# 🧪 Test Scripts

This directory contains additional test scripts for debugging, validation, and comprehensive testing of the blockchain demo.

## 🔧 Debug Scripts

### **[debug-signature.js](debug-signature.js)**
- **Purpose**: Debug transaction signature validation issues
- **Usage**: `node tests/debug-signature.js`
- **Features**: Tests signature creation and validation in isolation

### **[debug-server.js](debug-server.js)**  
- **Purpose**: Debug server-like transaction flows
- **Usage**: `node tests/debug-server.js`
- **Features**: Mimics exact server behavior for troubleshooting

## 🧪 Comprehensive Test Scripts

### **[test-api-examples.js](test-api-examples.js)**
- **Purpose**: Test all API endpoints with comprehensive examples
- **Usage**: `node tests/test-api-examples.js`
- **Coverage**: All user roles, operations, and error scenarios

### **[test-wallet-search.js](test-wallet-search.js)**
- **Purpose**: Test wallet search and history functionality
- **Usage**: `node tests/test-wallet-search.js`  
- **Features**: Wallet history, transaction tracking, search validation

### **[simple-test.js](simple-test.js)**
- **Purpose**: Simple integration test with debug logging
- **Usage**: `node tests/simple-test.js`
- **Features**: Step-by-step workflow validation with detailed output

## 🌐 HTTP Test Scripts

### **[test-http.js](test-http.js)**
- **Purpose**: Test HTTP endpoints directly
- **Usage**: `node tests/test-http.js`
- **Features**: Raw HTTP testing without test frameworks

### **[final-test.js](final-test.js)**
- **Purpose**: Final comprehensive workflow test
- **Usage**: `node tests/final-test.js`
- **Features**: Complete end-to-end testing scenario

## 🚀 How to Run Tests

### **Individual Test Scripts:**
```bash
# Debug signature issues
node tests/debug-signature.js

# Test all API examples  
node tests/test-api-examples.js

# Test wallet search functionality
node tests/test-wallet-search.js

# Run simple integration test
node tests/simple-test.js
```

### **All Tests:**
```bash
# Run Jest test suite (from root directory)
npm test

# Run all additional test scripts
for file in tests/*.js; do node "$file"; done
```

## 📊 Test Coverage

### **Functionality Tested:**
- ✅ User registration for all roles
- ✅ Token issuance operations  
- ✅ Token transfer operations
- ✅ Mining and block creation
- ✅ Search functionality (hash and wallet)
- ✅ Error handling and validation
- ✅ API endpoint responses
- ✅ Transaction signature validation

### **Test Types:**
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end workflow testing  
- **API Tests**: HTTP endpoint validation
- **Debug Tests**: Issue troubleshooting and validation

## 🎯 When to Use Each Test

### **Development:**
- Use `debug-*.js` scripts when troubleshooting issues
- Run `simple-test.js` for quick validation
- Use `test-api-examples.js` for comprehensive API testing

### **Validation:**
- Run `test-wallet-search.js` to verify search features
- Use `final-test.js` for complete system validation
- Run Jest tests (`npm test`) for formal test suite

### **Debugging:**
- Start with `debug-signature.js` for signature issues
- Use `debug-server.js` for server-side problems
- Check `test-http.js` for HTTP-specific issues

All test scripts provide detailed output and clear success/failure indicators for easy debugging and validation.
