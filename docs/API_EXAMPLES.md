# 🔗 Advanced Blockchain Demo - API Examples

## 📋 Complete API Reference with Example Calls

This document provides comprehensive examples for all API endpoints in the Advanced Blockchain Demo. All examples use `curl` commands and include expected responses.

**Base URL**: `http://localhost:3000`

---

## 👤 (A) User Registration

Register users with different roles in the blockchain system.

### Register Token Issuer

**Endpoint**: `POST /api/register`

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "CentralBank",
    "role": "issuer"
  }'
```

**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "username": "CentralBank",
    "role": "issuer",
    "walletAddress": "a1b2c3d4e5f6789012345678901234567890abcd",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw...\n-----END PUBLIC KEY-----\n"
  }
}
```

### Register Participant

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Alice",
    "role": "participant"
  }'
```

**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "username": "Alice",
    "role": "participant",
    "walletAddress": "b2c3d4e5f6789012345678901234567890abcdef",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx...\n-----END PUBLIC KEY-----\n"
  }
}
```

### Register Payment Provider

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "MinerCorp",
    "role": "payment_provider"
  }'
```

**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "username": "MinerCorp",
    "role": "payment_provider",
    "walletAddress": "c3d4e5f6789012345678901234567890abcdef12",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy...\n-----END PUBLIC KEY-----\n"
  }
}
```

### Get All Users

```bash
curl -X GET http://localhost:3000/api/users
```

**Response**:
```json
{
  "CentralBank": {
    "username": "CentralBank",
    "role": "issuer",
    "walletAddress": "a1b2c3d4e5f6789012345678901234567890abcd"
  },
  "Alice": {
    "username": "Alice",
    "role": "participant",
    "walletAddress": "b2c3d4e5f6789012345678901234567890abcdef"
  },
  "MinerCorp": {
    "username": "MinerCorp",
    "role": "payment_provider",
    "walletAddress": "c3d4e5f6789012345678901234567890abcdef12"
  }
}
```

---

## 🪙 (B) Token Issuance

Issue new tokens to participants (only issuers can perform this operation).

### Issue Tokens

**Endpoint**: `POST /api/issue-tokens`

```bash
curl -X POST http://localhost:3000/api/issue-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "issuerUsername": "CentralBank",
    "toUsername": "Alice",
    "amount": 1000,
    "assetName": "Gold Coins",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
  }'
```

**Response**:
```json
{
  "message": "Token issuance transaction added to pending transactions",
  "transaction": {
    "fromAddress": "a1b2c3d4e5f6789012345678901234567890abcd",
    "toAddress": "b2c3d4e5f6789012345678901234567890abcdef",
    "amount": 1000,
    "type": "issue",
    "assetName": "Gold Coins",
    "timestamp": "2025-07-03T10:30:45.123Z",
    "signature": "a1b2c3d4e5f6789012345678901234567890abcdef123456789...",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw...\n-----END PUBLIC KEY-----\n",
    "id": "tx_abc123def456789012345678901234567890abcdef"
  }
}
```

### Issue Different Asset Types

```bash
# Issue Silver Coins
curl -X POST http://localhost:3000/api/issue-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "issuerUsername": "CentralBank",
    "toUsername": "Bob",
    "amount": 500,
    "assetName": "Silver Coins",
    "privateKey": "ISSUER_PRIVATE_KEY_HERE"
  }'

# Issue Digital Dollars
curl -X POST http://localhost:3000/api/issue-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "issuerUsername": "CentralBank",
    "toUsername": "Charlie",
    "amount": 2000,
    "assetName": "Digital Dollars",
    "privateKey": "ISSUER_PRIVATE_KEY_HERE"
  }'
```

---

## ⛏️ (C) Block Mining

Mine pending transactions into blocks (only payment providers can perform this operation).

### Mine Block

**Endpoint**: `POST /api/mine`

```bash
curl -X POST http://localhost:3000/api/mine \
  -H "Content-Type: application/json" \
  -d '{
    "minerUsername": "MinerCorp",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n"
  }'
```

**Response**:
```json
{
  "message": "Block mined successfully!",
  "block": {
    "timestamp": "7/3/2025, 10:35:22 AM",
    "transactions": [
      {
        "fromAddress": "a1b2c3d4e5f6789012345678901234567890abcd",
        "toAddress": "b2c3d4e5f6789012345678901234567890abcdef",
        "amount": 1000,
        "type": "issue",
        "assetName": "Gold Coins",
        "timestamp": "2025-07-03T10:30:45.123Z",
        "signature": "a1b2c3d4e5f6789012345678901234567890abcdef123456789...",
        "id": "tx_abc123def456789012345678901234567890abcdef",
        "fromUsername": "CentralBank",
        "toUsername": "Alice"
      }
    ],
    "previousHash": "0123456789abcdef0123456789abcdef01234567",
    "hash": "00abc123def456789012345678901234567890abcdef",
    "nonce": 12847
  },
  "balances": {
    "Alice": 1000
  }
}
```

### Get Pending Transactions

```bash
curl -X GET http://localhost:3000/api/pending
```

**Response**:
```json
[
  {
    "fromAddress": "b2c3d4e5f6789012345678901234567890abcdef",
    "toAddress": "c3d4e5f6789012345678901234567890abcdef12",
    "amount": 250,
    "type": "transfer",
    "timestamp": "2025-07-03T10:40:15.456Z",
    "signature": "def456789012345678901234567890abcdef123456789...",
    "id": "tx_def456789012345678901234567890abcdef123",
    "fromUsername": "Alice",
    "toUsername": "Bob"
  }
]
```

---

## 💸 (D) Token Transfer

Transfer tokens between participants (only participants can perform this operation).

### Transfer Tokens

**Endpoint**: `POST /api/transfer`

```bash
curl -X POST http://localhost:3000/api/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromUsername": "Alice",
    "toUsername": "Bob",
    "amount": 250,
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n"
  }'
```

**Response**:
```json
{
  "message": "Transfer transaction added to pending transactions",
  "transaction": {
    "fromAddress": "b2c3d4e5f6789012345678901234567890abcdef",
    "toAddress": "c3d4e5f6789012345678901234567890abcdef12",
    "amount": 250,
    "type": "transfer",
    "assetName": null,
    "timestamp": "2025-07-03T10:40:15.456Z",
    "signature": "def456789012345678901234567890abcdef123456789...",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx...\n-----END PUBLIC KEY-----\n",
    "id": "tx_def456789012345678901234567890abcdef123"
  }
}
```

### Multiple Transfer Examples

```bash
# Transfer from Alice to Bob
curl -X POST http://localhost:3000/api/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromUsername": "Alice",
    "toUsername": "Bob",
    "amount": 100,
    "privateKey": "ALICE_PRIVATE_KEY_HERE"
  }'

# Transfer from Bob to Charlie
curl -X POST http://localhost:3000/api/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromUsername": "Bob",
    "toUsername": "Charlie",
    "amount": 75,
    "privateKey": "BOB_PRIVATE_KEY_HERE"
  }'
```

---

## 📊 (E) Transaction Data Reading

Read and search for transaction information.

### Search Transaction by Hash

**Endpoint**: `GET /api/search/:hash`

```bash
curl -X GET http://localhost:3000/api/search/tx_abc123def456789012345678901234567890abcdef
```

**Response**:
```json
{
  "type": "transaction",
  "data": {
    "fromAddress": "a1b2c3d4e5f6789012345678901234567890abcd",
    "toAddress": "b2c3d4e5f6789012345678901234567890abcdef",
    "amount": 1000,
    "type": "issue",
    "assetName": "Gold Coins",
    "timestamp": "2025-07-03T10:30:45.123Z",
    "signature": "a1b2c3d4e5f6789012345678901234567890abcdef123456789...",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw...\n-----END PUBLIC KEY-----\n",
    "id": "tx_abc123def456789012345678901234567890abcdef",
    "fromUsername": "CentralBank",
    "toUsername": "Alice",
    "blockHash": "00abc123def456789012345678901234567890abcdef",
    "blockTimestamp": "7/3/2025, 10:35:22 AM"
  }
}
```

### Get All Balances

```bash
curl -X GET http://localhost:3000/api/balances
```

**Response**:
```json
{
  "Alice": 750,
  "Bob": 325,
  "Charlie": 75
}
```

---

## 📦 (F) Block Data Reading

Read and search for block information.

### Search Block by Hash

**Endpoint**: `GET /api/search/:hash`

```bash
curl -X GET http://localhost:3000/api/search/00abc123def456789012345678901234567890abcdef
```

**Response**:
```json
{
  "type": "block",
  "data": {
    "timestamp": "7/3/2025, 10:35:22 AM",
    "transactions": [
      {
        "fromAddress": "a1b2c3d4e5f6789012345678901234567890abcd",
        "toAddress": "b2c3d4e5f6789012345678901234567890abcdef",
        "amount": 1000,
        "type": "issue",
        "assetName": "Gold Coins",
        "timestamp": "2025-07-03T10:30:45.123Z",
        "signature": "a1b2c3d4e5f6789012345678901234567890abcdef123456789...",
        "id": "tx_abc123def456789012345678901234567890abcdef",
        "fromUsername": "CentralBank",
        "toUsername": "Alice"
      }
    ],
    "previousHash": "0123456789abcdef0123456789abcdef01234567",
    "hash": "00abc123def456789012345678901234567890abcdef",
    "nonce": 12847
  }
}
```

### Get Complete Blockchain

```bash
curl -X GET http://localhost:3000/api/blockchain
```

**Response**:
```json
{
  "chain": [
    {
      "timestamp": "7/3/2025, 10:00:00 AM",
      "transactions": [
        {
          "fromAddress": null,
          "toAddress": null,
          "amount": 0,
          "type": "genesis",
          "assetName": "Genesis Block",
          "timestamp": "2025-07-03T10:00:00.000Z",
          "signature": null,
          "id": "genesis_block_transaction",
          "fromUsername": "Unknown",
          "toUsername": "Unknown"
        }
      ],
      "previousHash": "0",
      "hash": "0123456789abcdef0123456789abcdef01234567",
      "nonce": 0
    },
    {
      "timestamp": "7/3/2025, 10:35:22 AM",
      "transactions": [
        {
          "fromAddress": "a1b2c3d4e5f6789012345678901234567890abcd",
          "toAddress": "b2c3d4e5f6789012345678901234567890abcdef",
          "amount": 1000,
          "type": "issue",
          "assetName": "Gold Coins",
          "timestamp": "2025-07-03T10:30:45.123Z",
          "signature": "a1b2c3d4e5f6789012345678901234567890abcdef123456789...",
          "id": "tx_abc123def456789012345678901234567890abcdef",
          "fromUsername": "CentralBank",
          "toUsername": "Alice"
        }
      ],
      "previousHash": "0123456789abcdef0123456789abcdef01234567",
      "hash": "00abc123def456789012345678901234567890abcdef",
      "nonce": 12847
    }
  ],
  "isValid": true,
  "balances": {
    "Alice": 750,
    "Bob": 325,
    "Charlie": 75
  }
}
```

---

## 💼 (G) Wallet Data Reading

Read wallet information and transaction history.

### Search Wallet by Address

**Endpoint**: `GET /api/search/wallet/:address`

```bash
curl -X GET http://localhost:3000/api/search/wallet/b2c3d4e5f6789012345678901234567890abcdef
```

**Response**:
```json
{
  "walletAddress": "b2c3d4e5f6789012345678901234567890abcdef",
  "username": "Alice",
  "role": "participant",
  "transactions": [
    {
      "fromAddress": "b2c3d4e5f6789012345678901234567890abcdef",
      "toAddress": "c3d4e5f6789012345678901234567890abcdef12",
      "amount": 250,
      "type": "transfer",
      "assetName": null,
      "timestamp": "2025-07-03T10:40:15.456Z",
      "signature": "def456789012345678901234567890abcdef123456789...",
      "id": "tx_def456789012345678901234567890abcdef123",
      "fromUsername": "Alice",
      "toUsername": "Bob",
      "blockHash": "00def456789012345678901234567890abcdef123",
      "blockTimestamp": "7/3/2025, 10:45:30 AM",
      "blockIndex": 2,
      "direction": "sent"
    },
    {
      "fromAddress": "a1b2c3d4e5f6789012345678901234567890abcd",
      "toAddress": "b2c3d4e5f6789012345678901234567890abcdef",
      "amount": 1000,
      "type": "issue",
      "assetName": "Gold Coins",
      "timestamp": "2025-07-03T10:30:45.123Z",
      "signature": "a1b2c3d4e5f6789012345678901234567890abcdef123456789...",
      "id": "tx_abc123def456789012345678901234567890abcdef",
      "fromUsername": "CentralBank",
      "toUsername": "Alice",
      "blockHash": "00abc123def456789012345678901234567890abcdef",
      "blockTimestamp": "7/3/2025, 10:35:22 AM",
      "blockIndex": 1,
      "direction": "received"
    }
  ],
  "summary": {
    "totalTransactions": 2,
    "totalReceived": 1000,
    "totalSent": 250,
    "currentBalance": 750
  }
}
```

### Validate Private Key

```bash
curl -X POST http://localhost:3000/api/validate-key \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Alice",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n"
  }'
```

**Response**:
```json
{
  "valid": true
}
```

---

## 🔄 Complete Workflow Example

Here's a complete workflow showing all operations in sequence:

```bash
#!/bin/bash

# 1. Register Users
echo "=== Registering Users ==="

# Register Issuer
ISSUER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "CentralBank", "role": "issuer"}')

ISSUER_KEY=$(echo $ISSUER_RESPONSE | jq -r '.user.privateKey')
echo "Issuer registered: CentralBank"

# Register Participants
ALICE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "Alice", "role": "participant"}')

ALICE_KEY=$(echo $ALICE_RESPONSE | jq -r '.user.privateKey')
ALICE_WALLET=$(echo $ALICE_RESPONSE | jq -r '.user.walletAddress')
echo "Participant registered: Alice"

BOB_RESPONSE=$(curl -s -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "Bob", "role": "participant"}')

BOB_KEY=$(echo $BOB_RESPONSE | jq -r '.user.privateKey')
echo "Participant registered: Bob"

# Register Miner
MINER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "MinerCorp", "role": "payment_provider"}')

MINER_KEY=$(echo $MINER_RESPONSE | jq -r '.user.privateKey')
echo "Payment provider registered: MinerCorp"

# 2. Issue Tokens
echo -e "\n=== Issuing Tokens ==="

curl -s -X POST http://localhost:3000/api/issue-tokens \
  -H "Content-Type: application/json" \
  -d "{
    \"issuerUsername\": \"CentralBank\",
    \"toUsername\": \"Alice\",
    \"amount\": 1000,
    \"assetName\": \"Gold Coins\",
    \"privateKey\": \"$ISSUER_KEY\"
  }" | jq '.message'

# 3. Mine Block
echo -e "\n=== Mining Block ==="

curl -s -X POST http://localhost:3000/api/mine \
  -H "Content-Type: application/json" \
  -d "{
    \"minerUsername\": \"MinerCorp\",
    \"privateKey\": \"$MINER_KEY\"
  }" | jq '.message'

# 4. Transfer Tokens
echo -e "\n=== Transferring Tokens ==="

curl -s -X POST http://localhost:3000/api/transfer \
  -H "Content-Type: application/json" \
  -d "{
    \"fromUsername\": \"Alice\",
    \"toUsername\": \"Bob\",
    \"amount\": 250,
    \"privateKey\": \"$ALICE_KEY\"
  }" | jq '.message'

# 5. Mine Transfer
echo -e "\n=== Mining Transfer ==="

curl -s -X POST http://localhost:3000/api/mine \
  -H "Content-Type: application/json" \
  -d "{
    \"minerUsername\": \"MinerCorp\",
    \"privateKey\": \"$MINER_KEY\"
  }" | jq '.message'

# 6. Check Balances
echo -e "\n=== Final Balances ==="
curl -s -X GET http://localhost:3000/api/balances | jq '.'

# 7. Check Alice's Wallet History
echo -e "\n=== Alice's Wallet History ==="
curl -s -X GET "http://localhost:3000/api/search/wallet/$ALICE_WALLET" | jq '.summary'

echo -e "\n=== Workflow Complete ==="
```

---

## 🛠️ Utility Endpoints

### Reset Blockchain (Demo Only)

```bash
curl -X POST http://localhost:3000/api/reset
```

**Response**:
```json
{
  "message": "Blockchain reset successfully"
}
```

---

## ⚠️ Error Responses

### Common Error Formats

**Invalid Private Key**:
```json
{
  "error": "Invalid private key"
}
```

**Missing Required Fields**:
```json
{
  "error": "Missing required fields"
}
```

**Insufficient Balance**:
```json
{
  "error": "Not enough balance"
}
```

**User Not Found**:
```json
{
  "error": "User not found"
}
```

**Role Restriction**:
```json
{
  "error": "Only issuers can issue tokens"
}
```

**Hash Not Found**:
```json
{
  "error": "Hash not found"
}
```

---

## 📝 Notes

1. **Private Keys**: Always keep private keys secure. In this demo, they're shown for educational purposes.

2. **Transaction Order**: Transactions must be mined to be confirmed and affect balances.

3. **Role Restrictions**: 
   - Only **issuers** can issue tokens
   - Only **participants** can transfer tokens
   - Only **payment providers** can mine blocks

4. **Hash Format**: All hashes are SHA-256 hexadecimal strings.

5. **Timestamps**: All timestamps are in ISO 8601 format.

6. **Wallet Addresses**: Generated from public keys, 40-character hexadecimal strings.

This API documentation provides everything needed to interact with the Advanced Blockchain Demo programmatically! 🚀
