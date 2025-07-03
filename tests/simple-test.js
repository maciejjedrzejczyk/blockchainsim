const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { Blockchain, Transaction, User } = require('./blockchain');

// Create the same app as server.js
const app = express();
const myBlockchain = new Blockchain();

app.use(cors());
app.use(express.json());

// Copy the exact endpoints from server.js
app.post('/api/register', (req, res) => {
    try {
        const { username, role } = req.body;
        
        if (!username || !role) {
            return res.status(400).json({ error: 'Username and role are required' });
        }

        const userData = myBlockchain.registerUser(username, role);
        
        res.json({
            message: 'User registered successfully',
            user: userData
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/issue-tokens', (req, res) => {
    try {
        const { issuerUsername, toUsername, amount, assetName, privateKey } = req.body;
        
        if (!issuerUsername || !toUsername || !amount || !assetName || !privateKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!myBlockchain.validatePrivateKey(issuerUsername, privateKey)) {
            return res.status(401).json({ error: 'Invalid private key' });
        }

        const issuer = myBlockchain.getUserByUsername(issuerUsername);
        const recipient = myBlockchain.getUserByUsername(toUsername);

        if (!issuer || !recipient) {
            return res.status(400).json({ error: 'User not found' });
        }

        const timestamp = new Date().toISOString();
        const transactionData = {
            fromAddress: issuer.walletAddress,
            toAddress: recipient.walletAddress,
            amount: parseInt(amount),
            type: 'issue',
            timestamp: timestamp
        };

        const signature = User.signTransactionWithKey(transactionData, privateKey);
        
        if (!signature) {
            return res.status(400).json({ error: 'Failed to sign transaction' });
        }

        const transaction = new Transaction(
            issuer.walletAddress,
            recipient.walletAddress,
            parseInt(amount),
            'issue',
            assetName,
            signature,
            issuer.keyPair.publicKey,
            timestamp
        );

        myBlockchain.addTransaction(transaction);
        
        res.json({ 
            message: 'Token issuance transaction added to pending transactions',
            transaction: transaction
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/transfer', (req, res) => {
    try {
        const { fromUsername, toUsername, amount, privateKey } = req.body;
        
        console.log('=== TRANSFER REQUEST DEBUG ===');
        console.log('Request body:', { fromUsername, toUsername, amount, privateKeyLength: privateKey?.length });
        
        if (!fromUsername || !toUsername || !amount || !privateKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log('Validating private key...');
        if (!myBlockchain.validatePrivateKey(fromUsername, privateKey)) {
            console.log('Private key validation FAILED');
            return res.status(401).json({ error: 'Invalid private key' });
        }
        console.log('Private key validation PASSED');

        const sender = myBlockchain.getUserByUsername(fromUsername);
        const recipient = myBlockchain.getUserByUsername(toUsername);

        if (!sender || !recipient) {
            console.log('User not found:', { sender: !!sender, recipient: !!recipient });
            return res.status(400).json({ error: 'User not found' });
        }

        console.log('Users found:', { 
            senderWallet: sender.walletAddress, 
            recipientWallet: recipient.walletAddress 
        });

        const timestamp = new Date().toISOString();
        const transactionData = {
            fromAddress: sender.walletAddress,
            toAddress: recipient.walletAddress,
            amount: parseInt(amount),
            type: 'transfer',
            timestamp: timestamp
        };

        console.log('Transaction data:', transactionData);

        const signature = User.signTransactionWithKey(transactionData, privateKey);
        console.log('Signature created:', !!signature);
        
        if (!signature) {
            return res.status(400).json({ error: 'Failed to sign transaction' });
        }

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

        console.log('Transaction created, validating...');
        console.log('Transaction valid:', transaction.isValid());

        myBlockchain.addTransaction(transaction);
        console.log('Transaction added successfully');
        
        res.json({ 
            message: 'Transfer transaction added to pending transactions',
            transaction: transaction
        });
    } catch (error) {
        console.log('Transfer error:', error.message);
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/mine', (req, res) => {
    try {
        const { minerUsername, privateKey } = req.body;
        
        if (!minerUsername || !privateKey) {
            return res.status(400).json({ error: 'Miner username and private key are required' });
        }

        if (!myBlockchain.validatePrivateKey(minerUsername, privateKey)) {
            return res.status(401).json({ error: 'Invalid private key' });
        }

        const newBlock = myBlockchain.minePendingTransactions(minerUsername);
        
        if (!newBlock) {
            return res.status(400).json({ error: 'No pending transactions to mine' });
        }

        res.json({ 
            message: 'Block mined successfully!',
            block: {
                timestamp: new Date(newBlock.timestamp).toLocaleString(),
                transactions: newBlock.transactions,
                previousHash: newBlock.previousHash,
                hash: newBlock.hash,
                nonce: newBlock.nonce
            },
            balances: myBlockchain.getAllBalances()
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Test the transfer functionality
async function testTransfer() {
    console.log('🧪 Testing Transfer with Debug Logging\n');

    try {
        // Register users
        const issuerResp = await request(app)
            .post('/api/register')
            .send({ username: 'TestIssuer', role: 'issuer' });
        
        const aliceResp = await request(app)
            .post('/api/register')
            .send({ username: 'Alice', role: 'participant' });
        
        const bobResp = await request(app)
            .post('/api/register')
            .send({ username: 'Bob', role: 'participant' });
        
        const minerResp = await request(app)
            .post('/api/register')
            .send({ username: 'MinerCorp', role: 'payment_provider' });

        console.log('✅ Users registered');

        // Issue tokens
        const issueResp = await request(app)
            .post('/api/issue-tokens')
            .send({
                issuerUsername: 'TestIssuer',
                toUsername: 'Alice',
                amount: 200,
                assetName: 'Test Tokens',
                privateKey: issuerResp.body.user.privateKey
            });

        console.log('Issue response status:', issueResp.status);
        if (issueResp.status !== 200) {
            console.log('Issue error:', issueResp.body);
            return;
        }

        // Mine issuance
        const mineResp1 = await request(app)
            .post('/api/mine')
            .send({
                minerUsername: 'MinerCorp',
                privateKey: minerResp.body.user.privateKey
            });

        console.log('✅ Tokens issued and mined. Alice balance:', mineResp1.body.balances.Alice);

        // Transfer tokens
        console.log('\n--- ATTEMPTING TRANSFER ---');
        const transferResp = await request(app)
            .post('/api/transfer')
            .send({
                fromUsername: 'Alice',
                toUsername: 'Bob',
                amount: 50,
                privateKey: aliceResp.body.user.privateKey
            });

        console.log('Transfer response status:', transferResp.status);
        console.log('Transfer response body:', transferResp.body);

        if (transferResp.status === 200) {
            console.log('✅ Transfer successful!');
            
            // Mine the transfer
            const mineResp2 = await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerResp.body.user.privateKey
                });

            console.log('Final balances:', mineResp2.body.balances);
        } else {
            console.log('❌ Transfer failed');
        }

    } catch (error) {
        console.log('Test error:', error.message);
    }
}

testTransfer();
