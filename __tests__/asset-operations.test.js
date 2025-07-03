const request = require('supertest');
const { createTestApp } = require('./test-utils');

describe('Asset Issuance and Transfer Tests', () => {
    let app;
    let issuerData, participantData1, participantData2;

    beforeEach(async () => {
        app = createTestApp();
        
        // Register test users
        const issuerResponse = await request(app)
            .post('/api/register')
            .send({ username: 'BankIssuer', role: 'issuer' });
        issuerData = issuerResponse.body.user;

        const participant1Response = await request(app)
            .post('/api/register')
            .send({ username: 'Alice', role: 'participant' });
        participantData1 = participant1Response.body.user;

        const participant2Response = await request(app)
            .post('/api/register')
            .send({ username: 'Bob', role: 'participant' });
        participantData2 = participant2Response.body.user;
    });

    describe('POST /api/issue-tokens', () => {
        test('should allow issuer to issue tokens to participant', async () => {
            const issueData = {
                issuerUsername: 'BankIssuer',
                toUsername: 'Alice',
                amount: 100,
                assetName: 'Gold Coins',
                privateKey: issuerData.privateKey
            };

            const response = await request(app)
                .post('/api/issue-tokens')
                .send(issueData)
                .expect(200);

            expect(response.body.message).toBe('Token issuance transaction added to pending transactions');
            expect(response.body.transaction).toHaveProperty('fromAddress', issuerData.walletAddress);
            expect(response.body.transaction).toHaveProperty('toAddress', participantData1.walletAddress);
            expect(response.body.transaction).toHaveProperty('amount', 100);
            expect(response.body.transaction).toHaveProperty('type', 'issue');
            expect(response.body.transaction).toHaveProperty('assetName', 'Gold Coins');
            expect(response.body.transaction).toHaveProperty('signature');
            expect(response.body.transaction).toHaveProperty('id');
        });

        test('should reject token issuance with invalid private key', async () => {
            const issueData = {
                issuerUsername: 'BankIssuer',
                toUsername: 'Alice',
                amount: 100,
                assetName: 'Gold Coins',
                privateKey: 'invalid-private-key'
            };

            const response = await request(app)
                .post('/api/issue-tokens')
                .send(issueData)
                .expect(401);

            expect(response.body.error).toBe('Invalid private key');
        });

        test('should reject token issuance with missing fields', async () => {
            const issueData = {
                issuerUsername: 'BankIssuer',
                toUsername: 'Alice',
                amount: 100
                // Missing assetName and privateKey
            };

            const response = await request(app)
                .post('/api/issue-tokens')
                .send(issueData)
                .expect(400);

            expect(response.body.error).toBe('Missing required fields');
        });

        test('should reject token issuance from non-issuer', async () => {
            const issueData = {
                issuerUsername: 'Alice', // Alice is a participant, not issuer
                toUsername: 'Bob',
                amount: 100,
                assetName: 'Gold Coins',
                privateKey: participantData1.privateKey
            };

            const response = await request(app)
                .post('/api/issue-tokens')
                .send(issueData)
                .expect(400);

            expect(response.body.error).toBe('Only issuers can issue tokens');
        });

        test('should reject token issuance to non-existent user', async () => {
            const issueData = {
                issuerUsername: 'BankIssuer',
                toUsername: 'NonExistentUser',
                amount: 100,
                assetName: 'Gold Coins',
                privateKey: issuerData.privateKey
            };

            const response = await request(app)
                .post('/api/issue-tokens')
                .send(issueData)
                .expect(400);

            expect(response.body.error).toBe('User not found');
        });
    });

    describe('POST /api/transfer', () => {
        beforeEach(async () => {
            // Issue tokens to Alice first
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'BankIssuer',
                    toUsername: 'Alice',
                    amount: 200,
                    assetName: 'Gold Coins',
                    privateKey: issuerData.privateKey
                });

            // Register a miner and mine the block to update balances
            const minerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'MinerCorp', role: 'payment_provider' });

            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerResponse.body.user.privateKey
                });
        });

        test('should allow participant to transfer tokens to another participant', async () => {
            const transferData = {
                fromUsername: 'Alice',
                toUsername: 'Bob',
                amount: 50,
                privateKey: participantData1.privateKey
            };

            const response = await request(app)
                .post('/api/transfer')
                .send(transferData)
                .expect(200);

            expect(response.body.message).toBe('Transfer transaction added to pending transactions');
            expect(response.body.transaction).toHaveProperty('fromAddress', participantData1.walletAddress);
            expect(response.body.transaction).toHaveProperty('toAddress', participantData2.walletAddress);
            expect(response.body.transaction).toHaveProperty('amount', 50);
            expect(response.body.transaction).toHaveProperty('type', 'transfer');
            expect(response.body.transaction).toHaveProperty('signature');
        });

        test('should reject transfer with insufficient balance', async () => {
            const transferData = {
                fromUsername: 'Alice',
                toUsername: 'Bob',
                amount: 500, // More than Alice has
                privateKey: participantData1.privateKey
            };

            const response = await request(app)
                .post('/api/transfer')
                .send(transferData)
                .expect(400);

            expect(response.body.error).toBe('Not enough balance');
        });

        test('should reject transfer with invalid private key', async () => {
            const transferData = {
                fromUsername: 'Alice',
                toUsername: 'Bob',
                amount: 50,
                privateKey: 'invalid-private-key'
            };

            const response = await request(app)
                .post('/api/transfer')
                .send(transferData)
                .expect(401);

            expect(response.body.error).toBe('Invalid private key');
        });

        test('should reject transfer from non-participant', async () => {
            const transferData = {
                fromUsername: 'BankIssuer', // Issuer, not participant
                toUsername: 'Alice',
                amount: 50,
                privateKey: issuerData.privateKey
            };

            const response = await request(app)
                .post('/api/transfer')
                .send(transferData)
                .expect(400);

            expect(response.body.error).toBe('Only participants can transfer tokens');
        });

        test('should reject transfer with missing fields', async () => {
            const transferData = {
                fromUsername: 'Alice',
                toUsername: 'Bob'
                // Missing amount and privateKey
            };

            const response = await request(app)
                .post('/api/transfer')
                .send(transferData)
                .expect(400);

            expect(response.body.error).toBe('Missing required fields');
        });
    });

    describe('GET /api/pending', () => {
        test('should return empty array when no pending transactions', async () => {
            const response = await request(app)
                .get('/api/pending')
                .expect(200);

            expect(response.body).toEqual([]);
        });

        test('should return pending transactions with usernames', async () => {
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

            const response = await request(app)
                .get('/api/pending')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toHaveProperty('fromUsername', 'BankIssuer');
            expect(response.body[0]).toHaveProperty('toUsername', 'Alice');
            expect(response.body[0]).toHaveProperty('amount', 100);
            expect(response.body[0]).toHaveProperty('type', 'issue');
        });
    });

    describe('GET /api/balances', () => {
        test('should return empty balances initially', async () => {
            const response = await request(app)
                .get('/api/balances')
                .expect(200);

            expect(response.body).toEqual({});
        });

        test('should return updated balances after mining', async () => {
            // Issue tokens
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'BankIssuer',
                    toUsername: 'Alice',
                    amount: 150,
                    assetName: 'Gold Coins',
                    privateKey: issuerData.privateKey
                });

            // Register miner and mine
            const minerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'MinerCorp', role: 'payment_provider' });

            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'MinerCorp',
                    privateKey: minerResponse.body.user.privateKey
                });

            const response = await request(app)
                .get('/api/balances')
                .expect(200);

            expect(response.body).toHaveProperty('Alice', 150);
        });
    });
});
