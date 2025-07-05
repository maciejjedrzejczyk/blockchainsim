const crypto = require('crypto');

class User {
    constructor(username, role) {
        this.username = username;
        this.role = role; // 'issuer', 'participant', 'payment_provider'
        this.keyPair = this.generateKeyPair();
        this.walletAddress = this.generateWalletAddress();
        this.balance = 0;
    }

    generateKeyPair() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });
        return { publicKey, privateKey };
    }

    generateWalletAddress() {
        return crypto.createHash('sha256')
            .update(this.keyPair.publicKey + this.username)
            .digest('hex')
            .substring(0, 40);
    }

    signTransaction(transactionData) {
        const sign = crypto.createSign('SHA256');
        sign.update(JSON.stringify(transactionData));
        return sign.sign(this.keyPair.privateKey, 'hex');
    }

    static signTransactionWithKey(transactionData, privateKey) {
        try {
            const sign = crypto.createSign('SHA256');
            sign.update(JSON.stringify(transactionData));
            return sign.sign(privateKey.trim(), 'hex');
        } catch (error) {
            console.error('Error signing transaction:', error);
            return null;
        }
    }

    static verifySignature(transactionData, signature, publicKey) {
        try {
            const verify = crypto.createVerify('SHA256');
            verify.update(JSON.stringify(transactionData));
            return verify.verify(publicKey, signature, 'hex');
        } catch (error) {
            console.error('Error verifying signature:', error);
            return false;
        }
    }
}

class Transaction {
    constructor(fromAddress, toAddress, amount, type = 'transfer', assetName = null, signature = null, publicKey = null, timestamp = null, fileHash = null, fileName = null) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.type = type; // 'issue', 'transfer', 'proof_of_existence'
        this.assetName = assetName;
        this.timestamp = timestamp || new Date().toISOString();
        this.signature = signature;
        this.publicKey = publicKey;
        this.fileHash = fileHash; // For proof-of-existence transactions
        this.fileName = fileName; // For proof-of-existence transactions
        this.id = this.calculateHash();
    }

    calculateHash() {
        return crypto.createHash('sha256')
            .update(this.fromAddress + this.toAddress + this.amount + this.timestamp + this.type + this.assetName + (this.fileHash || '') + (this.fileName || ''))
            .digest('hex');
    }

    isValid() {
        if (this.type === 'genesis') return true;
        
        // Skip validation for basic mode transactions
        if (this.signature === 'basic-mode-signature') {
            console.log('Basic mode transaction detected, skipping signature validation');
            return true;
        }
        
        if (this.type === 'proof_of_existence') {
            // Proof-of-existence transactions only need fileHash and fileName
            return this.fileHash && this.fileName;
        }
        if (this.type === 'issue') {
            // Issue transactions need signature verification
            if (!this.signature || !this.publicKey) return false;
            const transactionData = {
                fromAddress: this.fromAddress,
                toAddress: this.toAddress,
                amount: this.amount,
                type: this.type,
                timestamp: this.timestamp
            };
            return User.verifySignature(transactionData, this.signature, this.publicKey);
        }
        if (this.type === 'transfer') {
            if (!this.signature || !this.publicKey) return false;
            const transactionData = {
                fromAddress: this.fromAddress,
                toAddress: this.toAddress,
                amount: this.amount,
                type: this.type,
                timestamp: this.timestamp
            };
            return User.verifySignature(transactionData, this.signature, this.publicKey);
        }
        return false;
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return crypto.createHash('sha256')
            .update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce)
            .digest('hex');
    }

    // Simple proof of work - find hash starting with zeros
    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join("0");
        
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log(`Block mined: ${this.hash}`);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.users = new Map(); // username -> User object
        this.walletToUser = new Map(); // walletAddress -> username
    }

    createGenesisBlock() {
        const genesisTransaction = new Transaction(null, null, 0, 'genesis', 'Genesis Block');
        return new Block(Date.now(), [genesisTransaction], "0");
    }

    registerUser(username, role) {
        if (this.users.has(username)) {
            throw new Error('Username already exists');
        }

        const validRoles = ['issuer', 'participant', 'payment_provider'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role');
        }

        const user = new User(username, role);
        this.users.set(username, user);
        this.walletToUser.set(user.walletAddress, username);

        return {
            username: user.username,
            role: user.role,
            walletAddress: user.walletAddress,
            privateKey: user.keyPair.privateKey,
            publicKey: user.keyPair.publicKey
        };
    }

    getUserByWallet(walletAddress) {
        const username = this.walletToUser.get(walletAddress);
        return username ? this.users.get(username) : null;
    }

    getUserByUsername(username) {
        return this.users.get(username);
    }

    validatePrivateKey(username, privateKey) {
        const user = this.users.get(username);
        if (!user) {
            return false;
        }
        
        // Normalize both keys by removing extra whitespace and normalizing line endings
        const normalizeKey = (key) => key.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        const storedKey = normalizeKey(user.keyPair.privateKey);
        const providedKey = normalizeKey(privateKey);
        
        return storedKey === providedKey;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        // Validate transaction
        if (!transaction.isValid()) {
            throw new Error('Invalid transaction signature');
        }

        if (transaction.type === 'transfer') {
            if (!transaction.fromAddress || !transaction.toAddress) {
                throw new Error('Transaction must include from and to address');
            }

            const fromUser = this.getUserByWallet(transaction.fromAddress);
            if (!fromUser || fromUser.role !== 'participant') {
                throw new Error('Only participants can transfer tokens');
            }

            if (this.getBalance(transaction.fromAddress) < transaction.amount) {
                throw new Error('Not enough balance');
            }
        } else if (transaction.type === 'issue') {
            const fromUser = this.getUserByWallet(transaction.fromAddress);
            if (!fromUser || fromUser.role !== 'issuer') {
                throw new Error('Only issuers can issue tokens');
            }
        }

        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(minerUsername) {
        const miner = this.users.get(minerUsername);
        if (!miner || miner.role !== 'payment_provider') {
            throw new Error('Only payment providers can mine blocks');
        }

        if (this.pendingTransactions.length === 0) {
            return null;
        }

        const block = new Block(
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );

        block.mineBlock(this.difficulty);
        
        console.log('Block successfully mined!');
        this.chain.push(block);

        // Update balances
        this.updateBalances(this.pendingTransactions);
        
        this.pendingTransactions = [];
        return block;
    }

    updateBalances(transactions) {
        for (let transaction of transactions) {
            if (transaction.type === 'transfer') {
                const fromUser = this.getUserByWallet(transaction.fromAddress);
                const toUser = this.getUserByWallet(transaction.toAddress);
                
                if (fromUser) fromUser.balance -= transaction.amount;
                if (toUser) toUser.balance += transaction.amount;
            } else if (transaction.type === 'issue') {
                const toUser = this.getUserByWallet(transaction.toAddress);
                if (toUser) toUser.balance += transaction.amount;
            }
        }
    }

    getBalance(walletAddress) {
        const user = this.getUserByWallet(walletAddress);
        return user ? user.balance : 0;
    }

    getAllBalances() {
        const balances = {};
        for (let [username, user] of this.users) {
            if (user.role === 'participant') {
                balances[username] = user.balance;
            }
        }
        return balances;
    }

    getAllUsers() {
        const users = {};
        for (let [username, user] of this.users) {
            users[username] = {
                username: user.username,
                role: user.role,
                walletAddress: user.walletAddress,
                balance: user.balance
            };
        }
        return users;
    }

    searchByHash(hash) {
        // Search in blocks
        for (let block of this.chain) {
            if (block.hash === hash) {
                return {
                    type: 'block',
                    data: {
                        timestamp: new Date(block.timestamp).toLocaleString(),
                        transactions: block.transactions,
                        previousHash: block.previousHash,
                        hash: block.hash,
                        nonce: block.nonce
                    }
                };
            }
        }

        // Search in transactions
        for (let block of this.chain) {
            for (let transaction of block.transactions) {
                if (transaction.id === hash) {
                    const fromUser = this.getUserByWallet(transaction.fromAddress);
                    const toUser = this.getUserByWallet(transaction.toAddress);
                    
                    return {
                        type: 'transaction',
                        data: {
                            ...transaction,
                            fromUsername: fromUser ? fromUser.username : 'Unknown',
                            toUsername: toUser ? toUser.username : 'Unknown',
                            blockHash: block.hash,
                            blockTimestamp: new Date(block.timestamp).toLocaleString()
                        }
                    };
                }
            }
        }

        return null;
    }

    searchByWalletAddress(walletAddress) {
        const transactions = [];
        const user = this.getUserByWallet(walletAddress);
        
        if (!user) {
            return {
                walletAddress: walletAddress,
                username: 'Unknown',
                transactions: [],
                summary: {
                    totalTransactions: 0,
                    totalReceived: 0,
                    totalSent: 0,
                    currentBalance: 0
                }
            };
        }

        let totalReceived = 0;
        let totalSent = 0;

        // Search through all blocks for transactions involving this wallet
        for (let block of this.chain) {
            for (let transaction of block.transactions) {
                if (transaction.fromAddress === walletAddress || transaction.toAddress === walletAddress) {
                    const fromUser = this.getUserByWallet(transaction.fromAddress);
                    const toUser = this.getUserByWallet(transaction.toAddress);
                    
                    const txData = {
                        ...transaction,
                        fromUsername: fromUser ? fromUser.username : 'Unknown',
                        toUsername: toUser ? toUser.username : 'Unknown',
                        blockHash: block.hash,
                        blockTimestamp: new Date(block.timestamp).toLocaleString(),
                        blockIndex: this.chain.indexOf(block),
                        direction: transaction.toAddress === walletAddress ? 'received' : 'sent'
                    };

                    transactions.push(txData);

                    // Calculate totals (skip genesis transactions)
                    if (transaction.type !== 'genesis') {
                        if (transaction.toAddress === walletAddress) {
                            totalReceived += transaction.amount;
                        } else if (transaction.fromAddress === walletAddress) {
                            totalSent += transaction.amount;
                        }
                    }
                }
            }
        }

        // Sort transactions by block index (newest first)
        transactions.sort((a, b) => b.blockIndex - a.blockIndex);

        return {
            walletAddress: walletAddress,
            username: user.username,
            role: user.role,
            transactions: transactions,
            summary: {
                totalTransactions: transactions.length,
                totalReceived: totalReceived,
                totalSent: totalSent,
                currentBalance: this.getBalance(walletAddress)
            }
        };
    }

    // Proof-of-Existence methods
    addProofOfExistence(fileHash, fileName) {
        // Check if file hash already exists
        if (this.fileHashExists(fileHash)) {
            throw new Error('File hash already exists in the blockchain');
        }

        // Create proof-of-existence transaction
        const transaction = new Transaction(
            'proof_of_existence_system', // fromAddress
            'proof_of_existence_system', // toAddress
            0, // amount
            'proof_of_existence', // type
            null, // assetName
            null, // signature (not needed)
            null, // publicKey (not needed)
            null, // timestamp (will be auto-generated)
            fileHash, // fileHash
            fileName // fileName
        );

        // Validate transaction
        if (!transaction.isValid()) {
            throw new Error('Invalid proof-of-existence transaction');
        }

        // Create and mine block immediately
        const block = new Block(
            Date.now(),
            [transaction],
            this.getLatestBlock().hash
        );

        block.mineBlock(this.difficulty);
        
        console.log('Proof-of-existence block successfully mined!');
        this.chain.push(block);

        return {
            blockHash: block.hash,
            transactionId: transaction.id,
            fileHash: fileHash,
            fileName: fileName,
            timestamp: transaction.timestamp
        };
    }

    fileHashExists(fileHash) {
        for (let block of this.chain) {
            for (let transaction of block.transactions) {
                if (transaction.type === 'proof_of_existence' && transaction.fileHash === fileHash) {
                    return true;
                }
            }
        }
        return false;
    }

    getProofOfExistence(fileHash) {
        for (let block of this.chain) {
            for (let transaction of block.transactions) {
                if (transaction.type === 'proof_of_existence' && transaction.fileHash === fileHash) {
                    return {
                        exists: true,
                        fileHash: transaction.fileHash,
                        fileName: transaction.fileName,
                        timestamp: transaction.timestamp,
                        blockHash: block.hash,
                        transactionId: transaction.id,
                        blockTimestamp: new Date(block.timestamp).toLocaleString()
                    };
                }
            }
        }
        return { exists: false };
    }

    getAllProofOfExistence() {
        const proofs = [];
        for (let block of this.chain) {
            for (let transaction of block.transactions) {
                if (transaction.type === 'proof_of_existence') {
                    proofs.push({
                        fileHash: transaction.fileHash,
                        fileName: transaction.fileName,
                        timestamp: transaction.timestamp,
                        blockHash: block.hash,
                        transactionId: transaction.id,
                        blockTimestamp: new Date(block.timestamp).toLocaleString()
                    });
                }
            }
        }
        // Sort by timestamp (newest first)
        return proofs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            // Validate all transactions in the block
            for (let transaction of currentBlock.transactions) {
                if (!transaction.isValid()) {
                    return false;
                }
            }
        }

        return true;
    }

    getChain() {
        return this.chain.map(block => ({
            timestamp: new Date(block.timestamp).toLocaleString(),
            transactions: block.transactions.map(tx => ({
                ...tx,
                fromUsername: this.getUserByWallet(tx.fromAddress)?.username || 'Unknown',
                toUsername: this.getUserByWallet(tx.toAddress)?.username || 'Unknown'
            })),
            previousHash: block.previousHash,
            hash: block.hash,
            nonce: block.nonce
        }));
    }
}

module.exports = { Blockchain, Transaction, User };
