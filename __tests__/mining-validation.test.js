const request = require('supertest');
const { createTestApp } = require('./test-utils');

describe('Mining and Transaction Validation Tests', () => {
    let app;
    let issuerData, participantData, minerData;

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
    });

    describe('POST /api/mine', () => {
        beforeEach(async () => {
            // Create a pending transaction
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'BankIssuer',
                    toUsername: 'Alice',
                    amount: 100,
                    assetName: 'Gold Coins',
                    privateKey: issuerData.privateKey
                });
        });

        test('should allow payment provider to mine pending transactions', async () => {
            const mineData = {
                minerUsername: 'MinerCorp',
                privateKey: minerData.privateKey
            };

            const response = await request(app)
                .post('/api/mine')
                .send(mineData)
                .expect(200);

            expect(response.body.message).toBe('Block mined successfully!');
            expect(response.body.block).toHaveProperty('timestamp');
            expect(response.body.block).toHaveProperty('transactions');
            expect(response.body.block).toHaveProperty('previousHash');
            expect(response.body.block).toHaveProperty('hash');
            expect(response.body.block).toHaveProperty('nonce');
            expect(response.body.block.transactions).toHaveLength(1);
            expect(response.body.balances).toHaveProperty('Alice', 100);
        });

        test('should reject mining with invalid private key', async () => {
            const mineData = {
                minerUsername: 'MinerCorp',
                privateKey: 'invalid-private-key'
            };

            const response = await request(app)
                .post('/api/mine')
                .send(mineData)
                .expect(401);

            expect(response.body.error).toBe('Invalid private key');
        });

        test('should reject mining from non-payment-provider', async () => {
            const mineData = {
                minerUsername: 'Alice', // Alice is a participant, not payment provider
                privateKey: participantData.privateKey
            };

            const response = await request(app)
                .post('/api/mine')
                .send(mineData)
                .expect(400);

            expect(response.body.error).toBe('Only payment providers can mine blocks');
        });

        test('should reject mining when no pending transactions', async () => {
            // First mine the existing pending transaction
            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerData.privateKey
                });

            // Try to mine again with no pending transactions
            const response = await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerData.privateKey
                })
                .expect(400);

            expect(response.body.error).toBe('No pending transactions to mine');
        });

        test('should reject mining with missing fields', async () => {
            const mineData = {
                minerUsername: 'MinerCorp'
                // Missing privateKey
            };

            const response = await request(app)
                .post('/api/mine')
                .send(mineData)
                .expect(400);

            expect(response.body.error).toBe('Miner username and private key are required');
        });

        test('should update balances correctly after mining multiple transactions', async () => {
            // Add another participant
            const bobResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Bob', role: 'participant' });

            // Issue tokens to Bob as well
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'BankIssuer',
                    toUsername: 'Bob',
                    amount: 75,
                    assetName: 'Silver Coins',
                    privateKey: issuerData.privateKey
                });

            // Mine both transactions
            const response = await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerData.privateKey
                })
                .expect(200);

            expect(response.body.block.transactions).toHaveLength(2);
            expect(response.body.balances).toHaveProperty('Alice', 100);
            expect(response.body.balances).toHaveProperty('Bob', 75);
        });
    });

    describe('GET /api/blockchain', () => {
        test('should return blockchain with genesis block initially', async () => {
            const response = await request(app)
                .get('/api/blockchain')
                .expect(200);

            expect(response.body).toHaveProperty('chain');
            expect(response.body).toHaveProperty('isValid', true);
            expect(response.body).toHaveProperty('balances');
            expect(response.body.chain).toHaveLength(1); // Only genesis block
            expect(response.body.chain[0].transactions[0].type).toBe('genesis');
        });

        test('should return updated blockchain after mining', async () => {
            // Create and mine a transaction
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'BankIssuer',
                    toUsername: 'Alice',
                    amount: 100,
                    assetName: 'Gold Coins',
                    privateKey: issuerData.privateKey
                });

            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerData.privateKey
                });

            const response = await request(app)
                .get('/api/blockchain')
                .expect(200);

            expect(response.body.chain).toHaveLength(2); // Genesis + 1 mined block
            expect(response.body.isValid).toBe(true);
            expect(response.body.balances).toHaveProperty('Alice', 100);
            
            const minedBlock = response.body.chain[1];
            expect(minedBlock.transactions).toHaveLength(1);
            expect(minedBlock.transactions[0].type).toBe('issue');
            expect(minedBlock.transactions[0].fromUsername).toBe('BankIssuer');
            expect(minedBlock.transactions[0].toUsername).toBe('Alice');
        });

        test('should maintain blockchain integrity with multiple blocks', async () => {
            // Create multiple transactions and mine them separately
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'BankIssuer',
                    toUsername: 'Alice',
                    amount: 100,
                    assetName: 'Gold Coins',
                    privateKey: issuerData.privateKey
                });

            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerData.privateKey
                });

            // Add Bob and create another transaction
            await request(app)
                .post('/api/register')
                .send({ username: 'Bob', role: 'participant' });

            await request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Alice',
                    toUsername: 'Bob',
                    amount: 30,
                    privateKey: participantData.privateKey
                });

            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerData.privateKey
                });

            const response = await request(app)
                .get('/api/blockchain')
                .expect(200);

            expect(response.body.chain).toHaveLength(3); // Genesis + 2 mined blocks
            expect(response.body.isValid).toBe(true);
            expect(response.body.balances).toHaveProperty('Alice', 70);
            expect(response.body.balances).toHaveProperty('Bob', 30);

            // Verify block linking
            const block1 = response.body.chain[1];
            const block2 = response.body.chain[2];
            expect(block2.previousHash).toBe(block1.hash);
        });
    });

    describe('Transaction Validation', () => {
        test('should validate transaction signatures correctly', async () => {
            // Issue tokens
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'BankIssuer',
                    toUsername: 'Alice',
                    amount: 100,
                    assetName: 'Gold Coins',
                    privateKey: issuerData.privateKey
                });

            // Check pending transactions have valid signatures
            const pendingResponse = await request(app)
                .get('/api/pending')
                .expect(200);

            expect(pendingResponse.body).toHaveLength(1);
            expect(pendingResponse.body[0]).toHaveProperty('signature');
            expect(pendingResponse.body[0]).toHaveProperty('publicKey');
            expect(pendingResponse.body[0].signature).toMatch(/^[a-f0-9]+$/);
        });

        test('should maintain blockchain validity after multiple operations', async () => {
            // Perform multiple operations
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'BankIssuer',
                    toUsername: 'Alice',
                    amount: 200,
                    assetName: 'Gold Coins',
                    privateKey: issuerData.privateKey
                });

            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerData.privateKey
                });

            // Add Bob and transfer
            await request(app)
                .post('/api/register')
                .send({ username: 'Bob', role: 'participant' });

            await request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Alice',
                    toUsername: 'Bob',
                    amount: 50,
                    privateKey: participantData.privateKey
                });

            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerData.privateKey
                });

            // Verify blockchain is still valid
            const response = await request(app)
                .get('/api/blockchain')
                .expect(200);

            expect(response.body.isValid).toBe(true);
            expect(response.body.chain).toHaveLength(3);
        });
    });
});
