# 🚀 API Quick Reference Card

## Essential API Calls for Blockchain Demo

### 🔧 Setup Commands

```bash
# Start server
npm start

# Reset blockchain (demo only)
curl -X POST http://localhost:3000/api/reset
```

### 👤 User Registration

```bash
# Register Issuer
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "Bank", "role": "issuer"}'

# Register Participant  
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "Alice", "role": "participant"}'

# Register Payment Provider
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "Miner", "role": "payment_provider"}'
```

### 🪙 Token Operations

```bash
# Issue Tokens (use actual private key from registration)
curl -X POST http://localhost:3000/api/issue-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "issuerUsername": "Bank",
    "toUsername": "Alice", 
    "amount": 1000,
    "assetName": "Gold Coins",
    "privateKey": "ISSUER_PRIVATE_KEY_HERE"
  }'

# Transfer Tokens
curl -X POST http://localhost:3000/api/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromUsername": "Alice",
    "toUsername": "Bob",
    "amount": 250,
    "privateKey": "ALICE_PRIVATE_KEY_HERE"
  }'
```

### ⛏️ Mining

```bash
# Mine Block
curl -X POST http://localhost:3000/api/mine \
  -H "Content-Type: application/json" \
  -d '{
    "minerUsername": "Miner",
    "privateKey": "MINER_PRIVATE_KEY_HERE"
  }'

# Check Pending Transactions
curl -X GET http://localhost:3000/api/pending
```

### 📊 Data Queries

```bash
# Get All Users
curl -X GET http://localhost:3000/api/users

# Get Balances
curl -X GET http://localhost:3000/api/balances

# Get Blockchain
curl -X GET http://localhost:3000/api/blockchain

# Search by Hash (transaction or block)
curl -X GET http://localhost:3000/api/search/HASH_HERE

# Search Wallet History
curl -X GET http://localhost:3000/api/search/wallet/WALLET_ADDRESS_HERE
```

### 🔐 Validation

```bash
# Validate Private Key
curl -X POST http://localhost:3000/api/validate-key \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Alice",
    "privateKey": "PRIVATE_KEY_HERE"
  }'
```

## 📝 Quick Workflow

```bash
# 1. Register users (save private keys!)
# 2. Issue tokens to participants
# 3. Mine the issuance block
# 4. Transfer tokens between participants  
# 5. Mine the transfer block
# 6. Check balances and explore data
```

## ⚠️ Important Notes

- **Save private keys** from registration responses
- **Mine blocks** to confirm transactions
- **Role restrictions** apply to all operations
- **Use actual hashes** from responses in search calls

## 🎯 Common Response Codes

- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid private key)
- `404` - Not found (hash/user doesn't exist)

Perfect for quick testing and demonstrations! 🚀
