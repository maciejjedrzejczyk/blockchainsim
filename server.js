const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { Blockchain, Transaction, User } = require('./blockchain');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize blockchain
const myBlockchain = new Blockchain();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads (store in memory)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Register a new user
app.post('/api/register', (req, res) => {
    try {
        const { username, role } = req.body;
        
        if (!username || !role) {
            return res.status(400).json({ 
                success: false,
                error: 'Username and role are required' 
            });
        }

        const userData = myBlockchain.registerUser(username, role);
        
        res.json({
            success: true,
            message: 'User registered successfully',
            privateKey: userData.privateKey,
            user: userData
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get all users
app.get('/api/users', (req, res) => {
    res.json(myBlockchain.getAllUsers());
});

// Validate private key
app.post('/api/validate-key', (req, res) => {
    try {
        const { username, privateKey } = req.body;
        
        if (!username || !privateKey) {
            return res.status(400).json({ error: 'Username and private key are required' });
        }

        const isValid = myBlockchain.validatePrivateKey(username, privateKey);
        
        res.json({ valid: isValid });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get the entire blockchain
app.get('/api/blockchain', (req, res) => {
    res.json({
        chain: myBlockchain.getChain(),
        isValid: myBlockchain.isChainValid(),
        balances: myBlockchain.getAllBalances()
    });
});

// Get balances
app.get('/api/balances', (req, res) => {
    res.json(myBlockchain.getAllBalances());
});

// Issue new tokens (only issuers can do this)
app.post('/api/issue-tokens', (req, res) => {
    try {
        // Support both old and new parameter names for compatibility
        const issuerUsername = req.body.issuer || req.body.issuerUsername;
        const toUsername = req.body.participant || req.body.toUsername;
        const { amount, asset, assetName, privateKey } = req.body;
        const finalAssetName = asset || assetName || 'Token';
        
        if (!issuerUsername || !toUsername || !amount || !privateKey) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: issuer, participant, amount, privateKey' 
            });
        }

        // Validate private key
        if (!myBlockchain.validatePrivateKey(issuerUsername, privateKey)) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid private key' 
            });
        }

        const issuer = myBlockchain.getUserByUsername(issuerUsername);
        const recipient = myBlockchain.getUserByUsername(toUsername);

        if (!issuer || !recipient) {
            return res.status(400).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Create transaction data for signing
        const timestamp = new Date().toISOString();
        const transactionData = {
            fromAddress: issuer.walletAddress,
            toAddress: recipient.walletAddress,
            amount: parseInt(amount),
            type: 'issue',
            timestamp: timestamp
        };

        // Sign the transaction with the provided private key
        const signature = User.signTransactionWithKey(transactionData, privateKey);
        
        if (!signature) {
            return res.status(400).json({ 
                success: false,
                error: 'Failed to sign transaction' 
            });
        }

        const transaction = new Transaction(
            issuer.walletAddress,
            recipient.walletAddress,
            parseInt(amount),
            'issue',
            finalAssetName,
            signature,
            issuer.keyPair.publicKey,
            timestamp
        );

        myBlockchain.addTransaction(transaction);
        
        res.json({ 
            success: true,
            message: 'Token issuance transaction added to pending transactions',
            transaction: transaction
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Transfer tokens between participants
app.post('/api/transfer', (req, res) => {
    try {
        // Support both old and new parameter names for compatibility
        const fromUsername = req.body.sender || req.body.fromUsername;
        const toUsername = req.body.receiver || req.body.toUsername;
        const { amount, privateKey } = req.body;
        
        if (!fromUsername || !toUsername || !amount || !privateKey) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: sender, receiver, amount, privateKey' 
            });
        }

        // Validate private key
        if (!myBlockchain.validatePrivateKey(fromUsername, privateKey)) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid private key' 
            });
        }

        const sender = myBlockchain.getUserByUsername(fromUsername);
        const recipient = myBlockchain.getUserByUsername(toUsername);

        if (!sender || !recipient) {
            return res.status(400).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Create transaction data for signing
        const timestamp = new Date().toISOString();
        const transactionData = {
            fromAddress: sender.walletAddress,
            toAddress: recipient.walletAddress,
            amount: parseInt(amount),
            type: 'transfer',
            timestamp: timestamp
        };

        // Sign the transaction with the provided private key
        const signature = User.signTransactionWithKey(transactionData, privateKey);
        
        if (!signature) {
            return res.status(400).json({ 
                success: false,
                error: 'Failed to sign transaction' 
            });
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

        myBlockchain.addTransaction(transaction);
        
        res.json({ 
            success: true,
            message: 'Transfer transaction added to pending transactions',
            transaction: transaction
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Mine pending transactions (only payment providers can do this)
app.post('/api/mine', (req, res) => {
    try {
        // Support both old and new parameter names for compatibility
        const minerUsername = req.body.paymentProvider || req.body.minerUsername;
        const { privateKey } = req.body;
        
        if (!minerUsername || !privateKey) {
            return res.status(400).json({ 
                success: false,
                error: 'Payment provider username and private key are required' 
            });
        }

        // Validate private key
        if (!myBlockchain.validatePrivateKey(minerUsername, privateKey)) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid private key' 
            });
        }

        const newBlock = myBlockchain.minePendingTransactions(minerUsername);
        
        if (!newBlock) {
            return res.status(400).json({ 
                success: false,
                error: 'No pending transactions to mine' 
            });
        }

        res.json({ 
            success: true,
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
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get pending transactions
app.get('/api/pending', (req, res) => {
    const pendingWithUsernames = myBlockchain.pendingTransactions.map(tx => ({
        ...tx,
        fromUsername: myBlockchain.getUserByWallet(tx.fromAddress)?.username || 'Unknown',
        toUsername: myBlockchain.getUserByWallet(tx.toAddress)?.username || 'Unknown'
    }));
    res.json(pendingWithUsernames);
});

// Search by hash
app.get('/api/search/:hash', (req, res) => {
    try {
        const { hash } = req.params;
        const result = myBlockchain.searchByHash(hash);
        
        if (!result) {
            return res.status(404).json({ error: 'Hash not found' });
        }
        
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Search by wallet address
app.get('/api/search/wallet/:address', (req, res) => {
    try {
        const { address } = req.params;
        const result = myBlockchain.searchByWalletAddress(address);
        
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Proof-of-Existence endpoints

// Upload file and create proof-of-existence
app.post('/api/proof-of-existence', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Calculate file hash
        const fileHash = crypto.createHash('sha256')
            .update(req.file.buffer)
            .digest('hex');

        const fileName = req.file.originalname;

        // Add proof-of-existence to blockchain
        const result = myBlockchain.addProofOfExistence(fileHash, fileName);
        
        res.json({
            message: 'Proof-of-existence created successfully',
            ...result,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Verify proof-of-existence by file hash
app.get('/api/proof-of-existence/:fileHash', (req, res) => {
    try {
        const { fileHash } = req.params;
        const result = myBlockchain.getProofOfExistence(fileHash);
        
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Verify proof-of-existence by uploading file
app.post('/api/verify-proof', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Calculate file hash
        const fileHash = crypto.createHash('sha256')
            .update(req.file.buffer)
            .digest('hex');

        const result = myBlockchain.getProofOfExistence(fileHash);
        
        res.json({
            ...result,
            uploadedFileName: req.file.originalname,
            uploadedFileSize: req.file.size,
            calculatedHash: fileHash
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all proof-of-existence records
app.get('/api/proof-of-existence', (req, res) => {
    try {
        const proofs = myBlockchain.getAllProofOfExistence();
        res.json(proofs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Reset blockchain (for demo purposes)
app.post('/api/reset', (req, res) => {
    myBlockchain.chain = [myBlockchain.createGenesisBlock()];
    myBlockchain.pendingTransactions = [];
    myBlockchain.users.clear();
    myBlockchain.walletToUser.clear();
    
    res.json({ message: 'Blockchain reset successfully' });
});

// Basic Mode Endpoints (no private key validation, auto-mining)

// Issue tokens in basic mode
app.post('/api/issue-tokens-basic', (req, res) => {
    try {
        const { issuer, participant, amount, asset } = req.body;
        
        console.log('Basic mode token issuance request:', { issuer, participant, amount, asset });
        
        if (!issuer || !participant || !amount) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: issuer, participant, amount' 
            });
        }

        const issuerUser = myBlockchain.getUserByUsername(issuer);
        const participantUser = myBlockchain.getUserByUsername(participant);

        if (!issuerUser || !participantUser) {
            return res.status(400).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        if (issuerUser.role !== 'issuer') {
            return res.status(400).json({ 
                success: false,
                error: 'Only issuers can issue tokens' 
            });
        }

        // Create transaction without signature validation
        const timestamp = new Date().toISOString();
        const transaction = new Transaction(
            issuerUser.walletAddress,
            participantUser.walletAddress,
            parseInt(amount),
            'issue',
            asset || 'Token',
            'basic-mode-signature', // Dummy signature
            issuerUser.keyPair.publicKey,
            timestamp
        );

        console.log('Created basic mode transaction:', {
            from: transaction.fromAddress,
            to: transaction.toAddress,
            amount: transaction.amount,
            type: transaction.type,
            signature: transaction.signature
        });

        // Add transaction
        console.log('Adding transaction to blockchain...');
        myBlockchain.addTransaction(transaction);
        console.log('Transaction added to pending pool successfully');

        // Find a payment provider to mine the block, or create a system one
        let miner = null;
        for (const [username, user] of myBlockchain.users) {
            if (user.role === 'payment_provider') {
                miner = username;
                break;
            }
        }

        // If no payment provider exists, create a system one
        if (!miner) {
            console.log('No payment provider found, creating system miner');
            const systemMiner = myBlockchain.registerUser('system-miner', 'payment_provider');
            miner = 'system-miner';
        }

        // Mine the block
        const newBlock = myBlockchain.minePendingTransactions(miner);
        console.log('Block mined successfully:', newBlock ? 'Yes' : 'No');
        
        res.json({ 
            success: true,
            message: 'Token issuance completed and block mined',
            transaction: transaction,
            block: newBlock
        });
    } catch (error) {
        console.error('Error in basic mode token issuance:', error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Transfer tokens in basic mode
app.post('/api/transfer-basic', (req, res) => {
    try {
        const { sender, receiver, amount } = req.body;
        
        console.log('Basic mode transfer request:', { sender, receiver, amount });
        
        if (!sender || !receiver || !amount) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: sender, receiver, amount' 
            });
        }

        const senderUser = myBlockchain.getUserByUsername(sender);
        const receiverUser = myBlockchain.getUserByUsername(receiver);

        if (!senderUser || !receiverUser) {
            return res.status(400).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Check balance (still enforce this in basic mode)
        const senderBalance = myBlockchain.getBalance(senderUser.walletAddress);
        if (senderBalance < parseInt(amount)) {
            return res.status(400).json({ 
                success: false,
                error: `Insufficient balance. Available: ${senderBalance}, Required: ${amount}` 
            });
        }

        // Create transaction without signature validation
        const timestamp = new Date().toISOString();
        const transaction = new Transaction(
            senderUser.walletAddress,
            receiverUser.walletAddress,
            parseInt(amount),
            'transfer',
            null,
            'basic-mode-signature', // Dummy signature
            senderUser.keyPair.publicKey,
            timestamp
        );

        console.log('Created basic mode transfer transaction:', {
            from: transaction.fromAddress,
            to: transaction.toAddress,
            amount: transaction.amount,
            type: transaction.type,
            signature: transaction.signature
        });

        // Add transaction
        console.log('Adding transfer transaction to blockchain...');
        myBlockchain.addTransaction(transaction);
        console.log('Transfer transaction added to pending pool successfully');

        // Find a payment provider to mine the block, or use the system one
        let miner = null;
        for (const [username, user] of myBlockchain.users) {
            if (user.role === 'payment_provider') {
                miner = username;
                break;
            }
        }

        // If no payment provider exists, create a system one
        if (!miner) {
            console.log('No payment provider found, creating system miner');
            const systemMiner = myBlockchain.registerUser('system-miner', 'payment_provider');
            miner = 'system-miner';
        }

        // Mine the block
        const newBlock = myBlockchain.minePendingTransactions(miner);
        console.log('Transfer block mined successfully:', newBlock ? 'Yes' : 'No');
        
        res.json({ 
            success: true,
            message: 'Transfer completed and block mined',
            transaction: transaction,
            block: newBlock
        });
    } catch (error) {
        console.error('Error in basic mode transfer:', error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Blockchain demo server running on http://localhost:${PORT}`);
    console.log('Open your browser and navigate to the URL above to see the demo');
});
