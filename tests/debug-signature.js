const { Blockchain, Transaction, User } = require('./blockchain');

// Create a test blockchain
const blockchain = new Blockchain();

// Register test users
console.log('🔧 Debugging Transaction Signatures\n');

console.log('1. Registering users...');
const issuer = blockchain.registerUser('TestIssuer', 'issuer');
const alice = blockchain.registerUser('Alice', 'participant');
const bob = blockchain.registerUser('Bob', 'participant');
const miner = blockchain.registerUser('Miner', 'payment_provider');

console.log('✅ Users registered successfully');
console.log(`   Issuer wallet: ${issuer.walletAddress}`);
console.log(`   Alice wallet: ${alice.walletAddress}`);
console.log(`   Bob wallet: ${bob.walletAddress}\n`);

// Test 1: Issue tokens to Alice
console.log('2. Testing token issuance...');
const issueTimestamp = new Date().toISOString();
const issueTransactionData = {
    fromAddress: issuer.walletAddress,
    toAddress: alice.walletAddress,
    amount: 100,
    type: 'issue',
    timestamp: issueTimestamp
};

const issueSignature = User.signTransactionWithKey(issueTransactionData, issuer.privateKey);
console.log(`   Issue signature created: ${issueSignature ? 'YES' : 'NO'}`);

const issueTransaction = new Transaction(
    issuer.walletAddress,
    alice.walletAddress,
    100,
    'issue',
    'Test Tokens',
    issueSignature,
    issuer.publicKey,
    issueTimestamp
);

console.log(`   Issue transaction valid: ${issueTransaction.isValid()}`);

// Add and mine the issuance transaction
blockchain.addTransaction(issueTransaction);
blockchain.minePendingTransactions('Miner');
console.log(`   Alice balance after issuance: ${blockchain.getBalance(alice.walletAddress)}\n`);

// Test 2: Transfer tokens from Alice to Bob
console.log('3. Testing token transfer...');
const transferTimestamp = new Date().toISOString();
const transferTransactionData = {
    fromAddress: alice.walletAddress,
    toAddress: bob.walletAddress,
    amount: 30,
    type: 'transfer',
    timestamp: transferTimestamp
};

console.log('   Transfer transaction data:');
console.log(`     From: ${transferTransactionData.fromAddress}`);
console.log(`     To: ${transferTransactionData.toAddress}`);
console.log(`     Amount: ${transferTransactionData.amount}`);
console.log(`     Type: ${transferTransactionData.type}`);
console.log(`     Timestamp: ${transferTransactionData.timestamp}`);

const transferSignature = User.signTransactionWithKey(transferTransactionData, alice.privateKey);
console.log(`   Transfer signature created: ${transferSignature ? 'YES' : 'NO'}`);

if (transferSignature) {
    console.log(`   Signature length: ${transferSignature.length}`);
    console.log(`   Signature preview: ${transferSignature.substring(0, 50)}...`);
}

const transferTransaction = new Transaction(
    alice.walletAddress,
    bob.walletAddress,
    30,
    'transfer',
    null,
    transferSignature,
    alice.publicKey,
    transferTimestamp
);

console.log(`   Transfer transaction created`);
console.log(`   Transaction timestamp: ${transferTransaction.timestamp}`);
console.log(`   Data timestamp: ${transferTimestamp}`);
console.log(`   Timestamps match: ${transferTransaction.timestamp === transferTimestamp}`);

// Test signature verification manually
console.log('\n4. Manual signature verification...');
const verificationData = {
    fromAddress: transferTransaction.fromAddress,
    toAddress: transferTransaction.toAddress,
    amount: transferTransaction.amount,
    type: transferTransaction.type,
    timestamp: transferTransaction.timestamp
};

console.log('   Verification data:');
console.log(`     From: ${verificationData.fromAddress}`);
console.log(`     To: ${verificationData.toAddress}`);
console.log(`     Amount: ${verificationData.amount}`);
console.log(`     Type: ${verificationData.type}`);
console.log(`     Timestamp: ${verificationData.timestamp}`);

const manualVerification = User.verifySignature(verificationData, transferTransaction.signature, transferTransaction.publicKey);
console.log(`   Manual verification result: ${manualVerification}`);

console.log(`   Transfer transaction valid: ${transferTransaction.isValid()}`);

// Try to add the transfer transaction
try {
    blockchain.addTransaction(transferTransaction);
    console.log('✅ Transfer transaction added successfully');
    
    // Mine the transfer
    blockchain.minePendingTransactions('Miner');
    console.log(`   Alice balance after transfer: ${blockchain.getBalance(alice.walletAddress)}`);
    console.log(`   Bob balance after transfer: ${blockchain.getBalance(bob.walletAddress)}`);
} catch (error) {
    console.log(`❌ Error adding transfer transaction: ${error.message}`);
}

console.log('\n5. Blockchain validation...');
console.log(`   Blockchain is valid: ${blockchain.isChainValid()}`);
