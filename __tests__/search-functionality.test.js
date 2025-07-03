const request = require('supertest');
const { createTestApp } = require('./test-utils');

describe('Search Functionality Tests', () => {
    let app;
    let issuerData, participantData, minerData;
    let transactionHash, blockHash;

    beforeEach(async () => {
        app = createTestApp();
        
        // Register test users
        const issuerResponse = await request(app)
            .post('/api/register')
            .send({ username: 'BankIssuer', role: 'issuer' });
        issuerData = issuerResponse.body.user;

        const participantResponse = await request(app)
            .post('/api/register')
            .send({ username: 'Alice', role: 'participant' });
        participantData = participantResponse.body.user;

        const minerResponse = await request(app)
            .post('/api/register')
            .send({ username: 'MinerCorp', role: 'payment_provider' });
        minerData = minerResponse.body.user;

        // Create and mine a transaction to have data to search
        const issueResponse = await request(app)
            .post('/api/issue-tokens')
            .send({
                issuerUsername: 'BankIssuer',
                toUsername: 'Alice',
                amount: 100,
                assetName: 'Gold Coins',
                privateKey: issuerData.privateKey
            });
        transactionHash = issueResponse.body.transaction.id;

        const mineResponse = await request(app)
            .post('/api/mine')
            .send({
                minerUsername: 'MinerCorp',
                privateKey: minerData.privateKey
            });
        blockHash = mineResponse.body.block.hash;
    });

    describe('GET /api/search/:hash', () => {
        test('should find transaction by hash', async () => {
            const response = await request(app)
                .get(`/api/search/${transactionHash}`)
                .expect(200);

            expect(response.body.type).toBe('transaction');
            expect(response.body.data).toHaveProperty('id', transactionHash);
            expect(response.body.data).toHaveProperty('fromAddress', issuerData.walletAddress);
            expect(response.body.data).toHaveProperty('toAddress', participantData.walletAddress);
            expect(response.body.data).toHaveProperty('amount', 100);
            expect(response.body.data).toHaveProperty('type', 'issue');
            expect(response.body.data).toHaveProperty('assetName', 'Gold Coins');
            expect(response.body.data).toHaveProperty('fromUsername', 'BankIssuer');
            expect(response.body.data).toHaveProperty('toUsername', 'Alice');
            expect(response.body.data).toHaveProperty('blockHash', blockHash);
            expect(response.body.data).toHaveProperty('blockTimestamp');
        });

        test('should find block by hash', async () => {
            const response = await request(app)
                .get(`/api/search/${blockHash}`)
                .expect(200);

            expect(response.body.type).toBe('block');
            expect(response.body.data).toHaveProperty('hash', blockHash);
            expect(response.body.data).toHaveProperty('previousHash');
            expect(response.body.data).toHaveProperty('timestamp');
            expect(response.body.data).toHaveProperty('nonce');
            expect(response.body.data).toHaveProperty('transactions');
            expect(response.body.data.transactions).toHaveLength(1);
            expect(response.body.data.transactions[0]).toHaveProperty('id', transactionHash);
        });

        test('should find genesis block by hash', async () => {
            // Get genesis block hash
            const blockchainResponse = await request(app)
                .get('/api/blockchain');
            const genesisHash = blockchainResponse.body.chain[0].hash;

            const response = await request(app)
                .get(`/api/search/${genesisHash}`)
                .expect(200);

            expect(response.body.type).toBe('block');
            expect(response.body.data).toHaveProperty('hash', genesisHash);
            expect(response.body.data).toHaveProperty('previousHash', '0');
            expect(response.body.data.transactions).toHaveLength(1);
            expect(response.body.data.transactions[0].type).toBe('genesis');
        });

        test('should return 404 for non-existent hash', async () => {
            const nonExistentHash = 'abcdef1234567890abcdef1234567890abcdef12';

            const response = await request(app)
                .get(`/api/search/${nonExistentHash}`)
                .expect(404);

            expect(response.body.error).toBe('Hash not found');
        });

        test('should handle invalid hash format gracefully', async () => {
            const invalidHash = 'invalid-hash-format';

            const response = await request(app)
                .get(`/api/search/${invalidHash}`)
                .expect(404);

            expect(response.body.error).toBe('Hash not found');
        });

        test('should search transfer transactions correctly', async () => {
            // Add Bob and create a transfer transaction
            await request(app)
                .post('/api/register')
                .send({ username: 'Bob', role: 'participant' });

            const transferResponse = await request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Alice',
                    toUsername: 'Bob',
                    amount: 30,
                    privateKey: participantData.privateKey
                });
            const transferHash = transferResponse.body.transaction.id;

            const mineResponse = await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerData.privateKey
                });
            const transferBlockHash = mineResponse.body.block.hash;

            const response = await request(app)
                .get(`/api/search/${transferHash}`)
                .expect(200);

            expect(response.body.type).toBe('transaction');
            expect(response.body.data).toHaveProperty('id', transferHash);
            expect(response.body.data).toHaveProperty('type', 'transfer');
            expect(response.body.data).toHaveProperty('amount', 30);
            expect(response.body.data).toHaveProperty('fromUsername', 'Alice');
            expect(response.body.data).toHaveProperty('toUsername', 'Bob');
            expect(response.body.data).toHaveProperty('blockHash', transferBlockHash);
        });

        test('should search blocks with multiple transactions', async () => {
            // Add Bob
            await request(app)
                .post('/api/register')
                .send({ username: 'Bob', role: 'participant' });

            // Create multiple transactions
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'BankIssuer',
                    toUsername: 'Bob',
                    amount: 75,
                    assetName: 'Silver Coins',
                    privateKey: issuerData.privateKey
                });

            await request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Alice',
                    toUsername: 'Bob',
                    amount: 25,
                    privateKey: participantData.privateKey
                });

            const mineResponse = await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerData.privateKey
                });
            const multiTxBlockHash = mineResponse.body.block.hash;

            const response = await request(app)
                .get(`/api/search/${multiTxBlockHash}`)
                .expect(200);

            expect(response.body.type).toBe('block');
            expect(response.body.data).toHaveProperty('hash', multiTxBlockHash);
            expect(response.body.data.transactions).toHaveLength(2);
            
            // Check both transactions are present
            const txTypes = response.body.data.transactions.map(tx => tx.type);
            expect(txTypes).toContain('issue');
            expect(txTypes).toContain('transfer');
        });

        test('should provide complete transaction details in search results', async () => {
            const response = await request(app)
                .get(`/api/search/${transactionHash}`)
                .expect(200);

            const txData = response.body.data;
            
            // Verify all required fields are present
            expect(txData).toHaveProperty('id');
            expect(txData).toHaveProperty('fromAddress');
            expect(txData).toHaveProperty('toAddress');
            expect(txData).toHaveProperty('amount');
            expect(txData).toHaveProperty('type');
            expect(txData).toHaveProperty('assetName');
            expect(txData).toHaveProperty('timestamp');
            expect(txData).toHaveProperty('signature');
            expect(txData).toHaveProperty('publicKey');
            expect(txData).toHaveProperty('fromUsername');
            expect(txData).toHaveProperty('toUsername');
            expect(txData).toHaveProperty('blockHash');
            expect(txData).toHaveProperty('blockTimestamp');

            // Verify data types and formats
            expect(typeof txData.amount).toBe('number');
            expect(typeof txData.timestamp).toBe('string');
            expect(txData.signature).toMatch(/^[a-f0-9]+$/);
            expect(txData.fromAddress).toMatch(/^[a-f0-9]{40}$/);
            expect(txData.toAddress).toMatch(/^[a-f0-9]{40}$/);
        });

        test('should provide complete block details in search results', async () => {
            const response = await request(app)
                .get(`/api/search/${blockHash}`)
                .expect(200);

            const blockData = response.body.data;
            
            // Verify all required fields are present
            expect(blockData).toHaveProperty('hash');
            expect(blockData).toHaveProperty('previousHash');
            expect(blockData).toHaveProperty('timestamp');
            expect(blockData).toHaveProperty('nonce');
            expect(blockData).toHaveProperty('transactions');

            // Verify data types and formats
            expect(typeof blockData.nonce).toBe('number');
            expect(typeof blockData.timestamp).toBe('string');
            expect(blockData.hash).toMatch(/^[a-f0-9]+$/);
            expect(Array.isArray(blockData.transactions)).toBe(true);
            expect(blockData.transactions.length).toBeGreaterThan(0);
        });
    });

    describe('Search Edge Cases', () => {
        test('should handle empty hash parameter', async () => {
            const response = await request(app)
                .get('/api/search/')
                .expect(404); // Express will return 404 for missing route parameter
        });

        test('should handle very long hash', async () => {
            const longHash = 'a'.repeat(100);

            const response = await request(app)
                .get(`/api/search/${longHash}`)
                .expect(404);

            expect(response.body.error).toBe('Hash not found');
        });

        test('should handle hash with special characters', async () => {
            const specialHash = 'hash-with-special-chars!@#$%';

            const response = await request(app)
                .get(`/api/search/${encodeURIComponent(specialHash)}`)
                .expect(404);

            expect(response.body.error).toBe('Hash not found');
        });
    });
});
