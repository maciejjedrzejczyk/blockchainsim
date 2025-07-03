const { Blockchain, Transaction, User } = require('./blockchain');

// Create a test blockchain (like the server does)
const myBlockchain = new Blockchain();

console.log('🔧 Debugging Server-like Transaction Flow\n');

// Step 1: Register users (like the server does)
console.log('1. Registering users...');
const issuerData = myBlockchain.registerUser('BankIssuer', 'issuer');
const aliceData = myBlockchain.registerUser('Alice', 'participant');
const bobData = myBlockchain.registerUser('Bob', 'participant');
const minerData = myBlockchain.registerUser('MinerCorp', 'payment_provider');

console.log('✅ Users registered');
console.log(`   Alice wallet: ${aliceData.walletAddress}`);
console.log(`   Bob wallet: ${bobData.walletAddress}\n`);

// Step 2: Issue tokens (like the server does)
console.log('2. Issuing tokens to Alice...');
const issuer = myBlockchain.getUserByUsername('BankIssuer');
const alice = myBlockchain.getUserByUsername('Alice');

const issueTimestamp = new Date().toISOString();
const issueTransactionData = {
    fromAddress: issuer.walletAddress,
    toAddress: alice.walletAddress,
    amount: 200,
    type: 'issue',
    timestamp: issueTimestamp
};

const issueSignature = User.signTransactionWithKey(issueTransactionData, issuerData.privateKey);
const issueTransaction = new Transaction(
    issuer.walletAddress,
    alice.walletAddress,
    200,
    'issue',
    'Test Tokens',
    issueSignature,
    issuer.keyPair.publicKey,
    issueTimestamp
);

myBlockchain.addTransaction(issueTransaction);
myBlockchain.minePendingTransactions('MinerCorp');
console.log(`✅ Tokens issued. Alice balance: ${myBlockchain.getBalance(alice.walletAddress)}\n`);

// Step 3: Transfer tokens (exactly like the server does)
console.log('3. Transferring tokens from Alice to Bob (server-style)...');

// Simulate server request
const fromUsername = 'Alice';
const toUsername = 'Bob';
const amount = 50;
const privateKey = aliceData.privateKey; // This is what user would paste

console.log(`   Request: ${fromUsername} -> ${toUsername}, amount: ${amount}`);
console.log(`   Private key length: ${privateKey.length}`);

// Validate private key (like server does)
const isValidKey = myBlockchain.validatePrivateKey(fromUsername, privateKey);
console.log(`   Private key valid: ${isValidKey}`);

if (!isValidKey) {
    console.log('❌ Private key validation failed!');
    process.exit(1);
}

// Get users (like server does)
const sender = myBlockchain.getUserByUsername(fromUsername);
const recipient = myBlockchain.getUserByUsername(toUsername);

console.log(`   Sender found: ${sender ? 'YES' : 'NO'}`);
console.log(`   Recipient found: ${recipient ? 'YES' : 'NO'}`);
console.log(`   Sender wallet: ${sender.walletAddress}`);
console.log(`   Recipient wallet: ${recipient.walletAddress}`);

// Create transaction data for signing (like server does)
const timestamp = new Date().toISOString();
const transactionData = {
    fromAddress: sender.walletAddress,
    toAddress: recipient.walletAddress,
    amount: parseInt(amount),
    type: 'transfer',
    timestamp: timestamp
};

console.log('   Transaction data for signing:');
console.log(`     fromAddress: ${transactionData.fromAddress}`);
console.log(`     toAddress: ${transactionData.toAddress}`);
console.log(`     amount: ${transactionData.amount}`);
console.log(`     type: ${transactionData.type}`);
console.log(`     timestamp: ${transactionData.timestamp}`);

// Sign the transaction with the provided private key (like server does)
const signature = User.signTransactionWithKey(transactionData, privateKey);
console.log(`   Signature created: ${signature ? 'YES' : 'NO'}`);

if (!signature) {
    console.log('❌ Failed to sign transaction!');
    process.exit(1);
}

// Create transaction (like server does)
const transaction = new Transaction(
    sender.walletAddress,
    recipient.walletAddress,
    parseInt(amount),
    'transfer',
    null,
    signature,
    sender.keyPair.publicKey,
    timestamp
);

console.log('   Transaction created');
console.log(`   Transaction valid: ${transaction.isValid()}`);

// Debug the validation process
console.log('\n4. Debugging validation...');
console.log(`   Transaction signature: ${transaction.signature ? 'EXISTS' : 'MISSING'}`);
console.log(`   Transaction publicKey: ${transaction.publicKey ? 'EXISTS' : 'MISSING'}`);

if (transaction.publicKey) {
    console.log(`   Public key preview: ${transaction.publicKey.substring(0, 50)}...`);
}

// Manual validation
const validationData = {
    fromAddress: transaction.fromAddress,
    toAddress: transaction.toAddress,
    amount: transaction.amount,
    type: transaction.type,
    timestamp: transaction.timestamp
};

const manualValidation = User.verifySignature(validationData, transaction.signature, transaction.publicKey);
console.log(`   Manual validation: ${manualValidation}`);

// Try to add transaction (like server does)
try {
    myBlockchain.addTransaction(transaction);
    console.log('✅ Transaction added successfully');
    
    // Mine the transaction
    myBlockchain.minePendingTransactions('MinerCorp');
    console.log(`   Alice balance after transfer: ${myBlockchain.getBalance(alice.walletAddress)}`);
    console.log(`   Bob balance after transfer: ${myBlockchain.getBalance(recipient.walletAddress)}`);
} catch (error) {
    console.log(`❌ Error adding transaction: ${error.message}`);
    
    // Additional debugging
    console.log('\n5. Additional debugging...');
    console.log(`   Sender balance: ${myBlockchain.getBalance(sender.walletAddress)}`);
    console.log(`   Transaction amount: ${transaction.amount}`);
    console.log(`   Has sufficient balance: ${myBlockchain.getBalance(sender.walletAddress) >= transaction.amount}`);
}
