const express = require('express');
const cors = require('cors');
const path = require('path');
const { Blockchain, Transaction, User } = require('./blockchain');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize blockchain
const myBlockchain = new Blockchain();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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
        const { issuerUsername, toUsername, amount, assetName, privateKey } = req.body;
        
        if (!issuerUsername || !toUsername || !amount || !assetName || !privateKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate private key
        if (!myBlockchain.validatePrivateKey(issuerUsername, privateKey)) {
            return res.status(401).json({ error: 'Invalid private key' });
        }

        const issuer = myBlockchain.getUserByUsername(issuerUsername);
        const recipient = myBlockchain.getUserByUsername(toUsername);

        if (!issuer || !recipient) {
            return res.status(400).json({ error: 'User not found' });
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

// Transfer tokens between participants
app.post('/api/transfer', (req, res) => {
    try {
        const { fromUsername, toUsername, amount, privateKey } = req.body;
        
        if (!fromUsername || !toUsername || !amount || !privateKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate private key
        if (!myBlockchain.validatePrivateKey(fromUsername, privateKey)) {
            return res.status(401).json({ error: 'Invalid private key' });
        }

        const sender = myBlockchain.getUserByUsername(fromUsername);
        const recipient = myBlockchain.getUserByUsername(toUsername);

        if (!sender || !recipient) {
            return res.status(400).json({ error: 'User not found' });
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

        myBlockchain.addTransaction(transaction);
        
        res.json({ 
            message: 'Transfer transaction added to pending transactions',
            transaction: transaction
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Mine pending transactions (only payment providers can do this)
app.post('/api/mine', (req, res) => {
    try {
        const { minerUsername, privateKey } = req.body;
        
        if (!minerUsername || !privateKey) {
            return res.status(400).json({ error: 'Miner username and private key are required' });
        }

        // Validate private key
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

// Reset blockchain (for demo purposes)
app.post('/api/reset', (req, res) => {
    myBlockchain.chain = [myBlockchain.createGenesisBlock()];
    myBlockchain.pendingTransactions = [];
    myBlockchain.users.clear();
    myBlockchain.walletToUser.clear();
    
    res.json({ message: 'Blockchain reset successfully' });
});

app.listen(PORT, () => {
    console.log(`Blockchain demo server running on http://localhost:${PORT}`);
    console.log('Open your browser and navigate to the URL above to see the demo');
});
