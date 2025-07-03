const request = require('supertest');
const { createTestApp } = require('./test-utils');

describe('Integration Tests - Complete Workflows', () => {
    let app;

    beforeEach(() => {
        app = createTestApp();
    });

    describe('Complete Token Lifecycle', () => {
        test('should handle complete token issuance and transfer workflow', async () => {
            // Step 1: Register all required users
            const issuerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'CentralBank', role: 'issuer' });
            const issuerData = issuerResponse.body.user;

            const aliceResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Alice', role: 'participant' });
            const aliceData = aliceResponse.body.user;

            const bobResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Bob', role: 'participant' });
            const bobData = bobResponse.body.user;

            const minerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'PaymentProcessor', role: 'payment_provider' });
            const minerData = minerResponse.body.user;

            // Step 2: Issue tokens to Alice
            const issueResponse = await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'CentralBank',
                    toUsername: 'Alice',
                    amount: 1000,
                    assetName: 'Digital Dollars',
                    privateKey: issuerData.privateKey
                })
                .expect(200);

            // Step 3: Mine the issuance transaction
            const mineResponse1 = await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'PaymentProcessor',
                    privateKey: minerData.privateKey
                })
                .expect(200);

            // Verify Alice received tokens
            expect(mineResponse1.body.balances).toHaveProperty('Alice', 1000);

            // Step 4: Alice transfers tokens to Bob
            const transferResponse = await request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Alice',
                    toUsername: 'Bob',
                    amount: 300,
                    privateKey: aliceData.privateKey
                })
                .expect(200);

            // Step 5: Mine the transfer transaction
            const mineResponse2 = await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'PaymentProcessor',
                    privateKey: minerData.privateKey
                })
                .expect(200);

            // Verify final balances
            expect(mineResponse2.body.balances).toHaveProperty('Alice', 700);
            expect(mineResponse2.body.balances).toHaveProperty('Bob', 300);

            // Step 6: Verify blockchain integrity
            const blockchainResponse = await request(app)
                .get('/api/blockchain')
                .expect(200);

            expect(blockchainResponse.body.chain).toHaveLength(3); // Genesis + 2 mined blocks
            expect(blockchainResponse.body.isValid).toBe(true);

            // Step 7: Search for transactions
            const issueHash = issueResponse.body.transaction.id;
            const transferHash = transferResponse.body.transaction.id;

            const issueSearchResponse = await request(app)
                .get(`/api/search/${issueHash}`)
                .expect(200);
            expect(issueSearchResponse.body.data.type).toBe('issue');

            const transferSearchResponse = await request(app)
                .get(`/api/search/${transferHash}`)
                .expect(200);
            expect(transferSearchResponse.body.data.type).toBe('transfer');
        });

        test('should handle multiple issuers and complex transaction patterns', async () => {
            // Register multiple issuers
            const bank1Response = await request(app)
                .post('/api/register')
                .send({ username: 'Bank1', role: 'issuer' });
            const bank1Data = bank1Response.body.user;

            const bank2Response = await request(app)
                .post('/api/register')
                .send({ username: 'Bank2', role: 'issuer' });
            const bank2Data = bank2Response.body.user;

            // Register participants
            const aliceResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Alice', role: 'participant' });
            const aliceData = aliceResponse.body.user;

            const bobResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Bob', role: 'participant' });
            const bobData = bobResponse.body.user;

            const charlieResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Charlie', role: 'participant' });
            const charlieData = charlieResponse.body.user;

            // Register miner
            const minerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Miner', role: 'payment_provider' });
            const minerData = minerResponse.body.user;

            // Bank1 issues tokens to Alice and Bob
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'Bank1',
                    toUsername: 'Alice',
                    amount: 500,
                    assetName: 'USD Tokens',
                    privateKey: bank1Data.privateKey
                });

            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'Bank1',
                    toUsername: 'Bob',
                    amount: 300,
                    assetName: 'USD Tokens',
                    privateKey: bank1Data.privateKey
                });

            // Bank2 issues different tokens to Charlie
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'Bank2',
                    toUsername: 'Charlie',
                    amount: 200,
                    assetName: 'EUR Tokens',
                    privateKey: bank2Data.privateKey
                });

            // Mine all issuance transactions
            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'Miner',
                    privateKey: minerData.privateKey
                });

            // Create transfer transactions
            await request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Alice',
                    toUsername: 'Charlie',
                    amount: 100,
                    privateKey: aliceData.privateKey
                });

            await request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Bob',
                    toUsername: 'Alice',
                    amount: 50,
                    privateKey: bobData.privateKey
                });

            // Mine transfer transactions
            const finalMineResponse = await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'Miner',
                    privateKey: minerData.privateKey
                });

            // Verify final balances
            expect(finalMineResponse.body.balances).toHaveProperty('Alice', 450); // 500 - 100 + 50
            expect(finalMineResponse.body.balances).toHaveProperty('Bob', 250);   // 300 - 50
            expect(finalMineResponse.body.balances).toHaveProperty('Charlie', 300); // 200 + 100

            // Verify blockchain integrity
            const blockchainResponse = await request(app)
                .get('/api/blockchain')
                .expect(200);

            expect(blockchainResponse.body.chain).toHaveLength(3); // Genesis + 2 mined blocks
            expect(blockchainResponse.body.isValid).toBe(true);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle insufficient balance scenarios correctly', async () => {
            // Setup users
            const issuerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Bank', role: 'issuer' });
            const issuerData = issuerResponse.body.user;

            const aliceResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Alice', role: 'participant' });
            const aliceData = aliceResponse.body.user;

            const bobResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Bob', role: 'participant' });

            const minerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Miner', role: 'payment_provider' });
            const minerData = minerResponse.body.user;

            // Issue small amount to Alice
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'Bank',
                    toUsername: 'Alice',
                    amount: 50,
                    assetName: 'Tokens',
                    privateKey: issuerData.privateKey
                });

            // Mine the issuance
            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'Miner',
                    privateKey: minerData.privateKey
                });

            // Try to transfer more than Alice has
            const transferResponse = await request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Alice',
                    toUsername: 'Bob',
                    amount: 100, // More than Alice's balance of 50
                    privateKey: aliceData.privateKey
                })
                .expect(400);

            expect(transferResponse.body.error).toBe('Not enough balance');

            // Verify no pending transactions were created
            const pendingResponse = await request(app)
                .get('/api/pending')
                .expect(200);

            expect(pendingResponse.body).toHaveLength(0);
        });

        test('should handle role-based access control correctly', async () => {
            // Setup users
            const issuerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Bank', role: 'issuer' });
            const issuerData = issuerResponse.body.user;

            const participantResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Alice', role: 'participant' });
            const participantData = participantResponse.body.user;

            const minerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Miner', role: 'payment_provider' });
            const minerData = minerResponse.body.user;

            // Participant tries to issue tokens (should fail)
            const participantIssueResponse = await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'Alice',
                    toUsername: 'Bank',
                    amount: 100,
                    assetName: 'Tokens',
                    privateKey: participantData.privateKey
                })
                .expect(400);

            expect(participantIssueResponse.body.error).toBe('Only issuers can issue tokens');

            // Issuer tries to mine (should fail)
            const issuerMineResponse = await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'Bank',
                    privateKey: issuerData.privateKey
                })
                .expect(400);

            expect(issuerMineResponse.body.error).toBe('Only payment providers can mine blocks');

            // Miner tries to transfer (should fail - no balance)
            const minerTransferResponse = await request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Miner',
                    toUsername: 'Alice',
                    amount: 50,
                    privateKey: minerData.privateKey
                })
                .expect(400);

            expect(minerTransferResponse.body.error).toBe('Only participants can transfer tokens');
        });

        test('should handle concurrent transactions correctly', async () => {
            // Setup users
            const issuerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Bank', role: 'issuer' });
            const issuerData = issuerResponse.body.user;

            const aliceResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Alice', role: 'participant' });
            const aliceData = aliceResponse.body.user;

            const bobResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Bob', role: 'participant' });

            const charlieResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Charlie', role: 'participant' });

            const minerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'Miner', role: 'payment_provider' });
            const minerData = minerResponse.body.user;

            // Issue tokens to Alice
            await request(app)
                .post('/api/issue-tokens')
                .send({
                    issuerUsername: 'Bank',
                    toUsername: 'Alice',
                    amount: 1000,
                    assetName: 'Tokens',
                    privateKey: issuerData.privateKey
                });

            await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'Miner',
                    privateKey: minerData.privateKey
                });

            // Create multiple concurrent transactions
            const transfer1Promise = request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Alice',
                    toUsername: 'Bob',
                    amount: 200,
                    privateKey: aliceData.privateKey
                });

            const transfer2Promise = request(app)
                .post('/api/transfer')
                .send({
                    fromUsername: 'Alice',
                    toUsername: 'Charlie',
                    amount: 300,
                    privateKey: aliceData.privateKey
                });

            const [transfer1Response, transfer2Response] = await Promise.all([
                transfer1Promise,
                transfer2Promise
            ]);

            expect(transfer1Response.status).toBe(200);
            expect(transfer2Response.status).toBe(200);

            // Mine all pending transactions
            const mineResponse = await request(app)
                .post('/api/mine')
                .send({
                    minerUsername: 'Miner',
                    privateKey: minerData.privateKey
                });

            // Verify final balances
            expect(mineResponse.body.balances).toHaveProperty('Alice', 500); // 1000 - 200 - 300
            expect(mineResponse.body.balances).toHaveProperty('Bob', 200);
            expect(mineResponse.body.balances).toHaveProperty('Charlie', 300);
        });
    });

    describe('System Reset and Recovery', () => {
        test('should reset system completely', async () => {
            // Create some data first
            await request(app)
                .post('/api/register')
                .send({ username: 'TestUser', role: 'issuer' });

            // Verify data exists
            const usersResponse = await request(app)
                .get('/api/users')
                .expect(200);
            expect(Object.keys(usersResponse.body)).toHaveLength(1);

            // Reset system
            await request(app)
                .post('/api/reset')
                .expect(200);

            // Verify system is reset
            const resetUsersResponse = await request(app)
                .get('/api/users')
                .expect(200);
            expect(resetUsersResponse.body).toEqual({});

            const resetBlockchainResponse = await request(app)
                .get('/api/blockchain')
                .expect(200);
            expect(resetBlockchainResponse.body.chain).toHaveLength(1); // Only genesis block
            expect(resetBlockchainResponse.body.balances).toEqual({});
        });
    });
});
