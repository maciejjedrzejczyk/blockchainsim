const request = require('supertest');
const { createTestApp } = require('./test-utils');

describe('User Registration Tests', () => {
    let app;

    beforeEach(() => {
        app = createTestApp();
    });

    describe('POST /api/register', () => {
        test('should register an issuer successfully', async () => {
            const userData = {
                username: 'BankIssuer',
                role: 'issuer'
            };

            const response = await request(app)
                .post('/api/register')
                .send(userData)
                .expect(200);

            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.user).toHaveProperty('username', 'BankIssuer');
            expect(response.body.user).toHaveProperty('role', 'issuer');
            expect(response.body.user).toHaveProperty('walletAddress');
            expect(response.body.user).toHaveProperty('privateKey');
            expect(response.body.user).toHaveProperty('publicKey');
            expect(response.body.user.walletAddress).toMatch(/^[a-f0-9]{40}$/);
            expect(response.body.user.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
            expect(response.body.user.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
        });

        test('should register a participant successfully', async () => {
            const userData = {
                username: 'Alice',
                role: 'participant'
            };

            const response = await request(app)
                .post('/api/register')
                .send(userData)
                .expect(200);

            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.user).toHaveProperty('username', 'Alice');
            expect(response.body.user).toHaveProperty('role', 'participant');
            expect(response.body.user).toHaveProperty('walletAddress');
            expect(response.body.user).toHaveProperty('privateKey');
            expect(response.body.user).toHaveProperty('publicKey');
        });

        test('should register a payment provider successfully', async () => {
            const userData = {
                username: 'MinerCorp',
                role: 'payment_provider'
            };

            const response = await request(app)
                .post('/api/register')
                .send(userData)
                .expect(200);

            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.user).toHaveProperty('username', 'MinerCorp');
            expect(response.body.user).toHaveProperty('role', 'payment_provider');
            expect(response.body.user).toHaveProperty('walletAddress');
            expect(response.body.user).toHaveProperty('privateKey');
            expect(response.body.user).toHaveProperty('publicKey');
        });

        test('should reject registration with missing username', async () => {
            const userData = {
                role: 'issuer'
            };

            const response = await request(app)
                .post('/api/register')
                .send(userData)
                .expect(400);

            expect(response.body.error).toBe('Username and role are required');
        });

        test('should reject registration with missing role', async () => {
            const userData = {
                username: 'TestUser'
            };

            const response = await request(app)
                .post('/api/register')
                .send(userData)
                .expect(400);

            expect(response.body.error).toBe('Username and role are required');
        });

        test('should reject registration with invalid role', async () => {
            const userData = {
                username: 'TestUser',
                role: 'invalid_role'
            };

            const response = await request(app)
                .post('/api/register')
                .send(userData)
                .expect(400);

            expect(response.body.error).toBe('Invalid role');
        });

        test('should reject duplicate username registration', async () => {
            const userData = {
                username: 'DuplicateUser',
                role: 'issuer'
            };

            // Register first user
            await request(app)
                .post('/api/register')
                .send(userData)
                .expect(200);

            // Try to register same username again
            const response = await request(app)
                .post('/api/register')
                .send(userData)
                .expect(400);

            expect(response.body.error).toBe('Username already exists');
        });

        test('should generate unique wallet addresses for different users', async () => {
            const user1Response = await request(app)
                .post('/api/register')
                .send({ username: 'User1', role: 'issuer' })
                .expect(200);

            const user2Response = await request(app)
                .post('/api/register')
                .send({ username: 'User2', role: 'participant' })
                .expect(200);

            expect(user1Response.body.user.walletAddress)
                .not.toBe(user2Response.body.user.walletAddress);
        });
    });

    describe('GET /api/users', () => {
        test('should return empty object when no users registered', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(response.body).toEqual({});
        });

        test('should return all registered users', async () => {
            // Register multiple users
            await request(app)
                .post('/api/register')
                .send({ username: 'Issuer1', role: 'issuer' });

            await request(app)
                .post('/api/register')
                .send({ username: 'Alice', role: 'participant' });

            await request(app)
                .post('/api/register')
                .send({ username: 'Miner1', role: 'payment_provider' });

            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(Object.keys(response.body)).toHaveLength(3);
            expect(response.body).toHaveProperty('Issuer1');
            expect(response.body).toHaveProperty('Alice');
            expect(response.body).toHaveProperty('Miner1');
            
            expect(response.body.Issuer1.role).toBe('issuer');
            expect(response.body.Alice.role).toBe('participant');
            expect(response.body.Miner1.role).toBe('payment_provider');
        });
    });

    describe('POST /api/validate-key', () => {
        test('should validate correct private key', async () => {
            const registerResponse = await request(app)
                .post('/api/register')
                .send({ username: 'TestUser', role: 'issuer' });

            const privateKey = registerResponse.body.user.privateKey;

            const response = await request(app)
                .post('/api/validate-key')
                .send({ username: 'TestUser', privateKey })
                .expect(200);

            expect(response.body.valid).toBe(true);
        });

        test('should reject incorrect private key', async () => {
            await request(app)
                .post('/api/register')
                .send({ username: 'TestUser', role: 'issuer' });

            const response = await request(app)
                .post('/api/validate-key')
                .send({ 
                    username: 'TestUser', 
                    privateKey: 'invalid-private-key' 
                })
                .expect(200);

            expect(response.body.valid).toBe(false);
        });

        test('should reject validation for non-existent user', async () => {
            const response = await request(app)
                .post('/api/validate-key')
                .send({ 
                    username: 'NonExistentUser', 
                    privateKey: 'some-key' 
                })
                .expect(200);

            expect(response.body.valid).toBe(false);
        });
    });
});
