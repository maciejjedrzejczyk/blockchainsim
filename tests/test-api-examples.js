const request = require('supertest');
const { createTestApp } = require('./__tests__/test-utils');

async function testAllAPIExamples() {
    console.log('🧪 Testing All API Examples\n');

    const app = createTestApp();
    let issuerData, aliceData, bobData, minerData;

    try {
        // (A) User Registration Tests
        console.log('=== (A) USER REGISTRATION TESTS ===');
        
        // Register Issuer
        console.log('1. Registering Token Issuer...');
        const issuerResp = await request(app)
            .post('/api/register')
            .send({ username: 'CentralBank', role: 'issuer' })
            .expect(200);
        
        issuerData = issuerResp.body.user;
        console.log(`✅ Issuer registered: ${issuerData.username} (${issuerData.walletAddress.substring(0, 16)}...)`);

        // Register Participants
        console.log('2. Registering Participants...');
        const aliceResp = await request(app)
            .post('/api/register')
            .send({ username: 'Alice', role: 'participant' })
            .expect(200);
        
        aliceData = aliceResp.body.user;
        console.log(`✅ Participant registered: ${aliceData.username} (${aliceData.walletAddress.substring(0, 16)}...)`);

        const bobResp = await request(app)
            .post('/api/register')
            .send({ username: 'Bob', role: 'participant' })
            .expect(200);
        
        bobData = bobResp.body.user;
        console.log(`✅ Participant registered: ${bobData.username} (${bobData.walletAddress.substring(0, 16)}...)`);

        // Register Payment Provider
        console.log('3. Registering Payment Provider...');
        const minerResp = await request(app)
            .post('/api/register')
            .send({ username: 'MinerCorp', role: 'payment_provider' })
            .expect(200);
        
        minerData = minerResp.body.user;
        console.log(`✅ Payment provider registered: ${minerData.username} (${minerData.walletAddress.substring(0, 16)}...)`);

        // Get All Users
        console.log('4. Getting all users...');
        const usersResp = await request(app)
            .get('/api/users')
            .expect(200);
        
        console.log(`✅ Retrieved ${Object.keys(usersResp.body).length} users`);

        // (B) Token Issuance Tests
        console.log('\n=== (B) TOKEN ISSUANCE TESTS ===');
        
        console.log('1. Issuing Gold Coins to Alice...');
        const issueResp1 = await request(app)
            .post('/api/issue-tokens')
            .send({
                issuerUsername: 'CentralBank',
                toUsername: 'Alice',
                amount: 1000,
                assetName: 'Gold Coins',
                privateKey: issuerData.privateKey
            })
            .expect(200);
        
        console.log(`✅ Issued 1000 Gold Coins to Alice (TX: ${issueResp1.body.transaction.id.substring(0, 16)}...)`);

        console.log('2. Issuing Silver Coins to Bob...');
        const issueResp2 = await request(app)
            .post('/api/issue-tokens')
            .send({
                issuerUsername: 'CentralBank',
                toUsername: 'Bob',
                amount: 500,
                assetName: 'Silver Coins',
                privateKey: issuerData.privateKey
            })
            .expect(200);
        
        console.log(`✅ Issued 500 Silver Coins to Bob (TX: ${issueResp2.body.transaction.id.substring(0, 16)}...)`);

        // (C) Block Mining Tests
        console.log('\n=== (C) BLOCK MINING TESTS ===');
        
        console.log('1. Getting pending transactions...');
        const pendingResp = await request(app)
            .get('/api/pending')
            .expect(200);
        
        console.log(`✅ Found ${pendingResp.body.length} pending transactions`);

        console.log('2. Mining block...');
        const mineResp1 = await request(app)
            .post('/api/mine')
            .send({
                minerUsername: 'MinerCorp',
                privateKey: minerData.privateKey
            })
            .expect(200);
        
        console.log(`✅ Block mined successfully (Hash: ${mineResp1.body.block.hash.substring(0, 16)}...)`);
        console.log(`   Alice balance: ${mineResp1.body.balances.Alice}`);
        console.log(`   Bob balance: ${mineResp1.body.balances.Bob}`);

        // (D) Token Transfer Tests
        console.log('\n=== (D) TOKEN TRANSFER TESTS ===');
        
        console.log('1. Transferring tokens from Alice to Bob...');
        const transferResp = await request(app)
            .post('/api/transfer')
            .send({
                fromUsername: 'Alice',
                toUsername: 'Bob',
                amount: 250,
                privateKey: aliceData.privateKey
            })
            .expect(200);
        
        console.log(`✅ Transfer created (TX: ${transferResp.body.transaction.id.substring(0, 16)}...)`);

        console.log('2. Mining transfer transaction...');
        const mineResp2 = await request(app)
            .post('/api/mine')
            .send({
                minerUsername: 'MinerCorp',
                privateKey: minerData.privateKey
            })
            .expect(200);
        
        console.log(`✅ Transfer mined successfully`);
        console.log(`   Alice final balance: ${mineResp2.body.balances.Alice}`);
        console.log(`   Bob final balance: ${mineResp2.body.balances.Bob}`);

        // (E) Transaction Data Reading Tests
        console.log('\n=== (E) TRANSACTION DATA READING TESTS ===');
        
        console.log('1. Searching transaction by hash...');
        const txSearchResp = await request(app)
            .get(`/api/search/${issueResp1.body.transaction.id}`)
            .expect(200);
        
        console.log(`✅ Transaction found: ${txSearchResp.body.data.type} transaction`);
        console.log(`   From: ${txSearchResp.body.data.fromUsername} To: ${txSearchResp.body.data.toUsername}`);
        console.log(`   Amount: ${txSearchResp.body.data.amount} ${txSearchResp.body.data.assetName}`);

        console.log('2. Getting all balances...');
        const balancesResp = await request(app)
            .get('/api/balances')
            .expect(200);
        
        console.log(`✅ Retrieved balances for ${Object.keys(balancesResp.body).length} users`);

        // (F) Block Data Reading Tests
        console.log('\n=== (F) BLOCK DATA READING TESTS ===');
        
        console.log('1. Searching block by hash...');
        const blockSearchResp = await request(app)
            .get(`/api/search/${mineResp1.body.block.hash}`)
            .expect(200);
        
        console.log(`✅ Block found with ${blockSearchResp.body.data.transactions.length} transactions`);
        console.log(`   Previous hash: ${blockSearchResp.body.data.previousHash.substring(0, 16)}...`);
        console.log(`   Nonce: ${blockSearchResp.body.data.nonce}`);

        console.log('2. Getting complete blockchain...');
        const blockchainResp = await request(app)
            .get('/api/blockchain')
            .expect(200);
        
        console.log(`✅ Retrieved blockchain with ${blockchainResp.body.chain.length} blocks`);
        console.log(`   Blockchain valid: ${blockchainResp.body.isValid}`);

        // (G) Wallet Data Reading Tests
        console.log('\n=== (G) WALLET DATA READING TESTS ===');
        
        console.log('1. Searching Alice\'s wallet history...');
        const aliceWalletResp = await request(app)
            .get(`/api/search/wallet/${aliceData.walletAddress}`)
            .expect(200);
        
        console.log(`✅ Alice's wallet history retrieved`);
        console.log(`   Username: ${aliceWalletResp.body.username} (${aliceWalletResp.body.role})`);
        console.log(`   Current balance: ${aliceWalletResp.body.summary.currentBalance}`);
        console.log(`   Total transactions: ${aliceWalletResp.body.summary.totalTransactions}`);
        console.log(`   Total received: ${aliceWalletResp.body.summary.totalReceived}`);
        console.log(`   Total sent: ${aliceWalletResp.body.summary.totalSent}`);

        console.log('2. Searching Bob\'s wallet history...');
        const bobWalletResp = await request(app)
            .get(`/api/search/wallet/${bobData.walletAddress}`)
            .expect(200);
        
        console.log(`✅ Bob's wallet history retrieved`);
        console.log(`   Username: ${bobWalletResp.body.username} (${bobWalletResp.body.role})`);
        console.log(`   Current balance: ${bobWalletResp.body.summary.currentBalance}`);
        console.log(`   Total transactions: ${bobWalletResp.body.summary.totalTransactions}`);

        console.log('3. Validating private key...');
        const keyValidResp = await request(app)
            .post('/api/validate-key')
            .send({
                username: 'Alice',
                privateKey: aliceData.privateKey
            })
            .expect(200);
        
        console.log(`✅ Private key validation: ${keyValidResp.body.valid ? 'VALID' : 'INVALID'}`);

        // Error Handling Tests
        console.log('\n=== ERROR HANDLING TESTS ===');
        
        console.log('1. Testing invalid private key...');
        const invalidKeyResp = await request(app)
            .post('/api/transfer')
            .send({
                fromUsername: 'Alice',
                toUsername: 'Bob',
                amount: 100,
                privateKey: 'invalid-key'
            })
            .expect(401);
        
        console.log(`✅ Invalid private key rejected: ${invalidKeyResp.body.error}`);

        console.log('2. Testing insufficient balance...');
        const insufficientResp = await request(app)
            .post('/api/transfer')
            .send({
                fromUsername: 'Alice',
                toUsername: 'Bob',
                amount: 10000, // More than Alice has
                privateKey: aliceData.privateKey
            })
            .expect(400);
        
        console.log(`✅ Insufficient balance rejected: ${insufficientResp.body.error}`);

        console.log('3. Testing non-existent hash...');
        const notFoundResp = await request(app)
            .get('/api/search/nonexistenthash123456789')
            .expect(404);
        
        console.log(`✅ Non-existent hash handled: ${notFoundResp.body.error}`);

        // Summary
        console.log('\n🎉 ALL API EXAMPLES TESTED SUCCESSFULLY!');
        console.log('\n📊 Test Summary:');
        console.log('   ✅ User Registration (all roles)');
        console.log('   ✅ Token Issuance (multiple assets)');
        console.log('   ✅ Block Mining (with transactions)');
        console.log('   ✅ Token Transfers (between participants)');
        console.log('   ✅ Transaction Data Reading (by hash)');
        console.log('   ✅ Block Data Reading (complete blockchain)');
        console.log('   ✅ Wallet Data Reading (transaction history)');
        console.log('   ✅ Error Handling (various scenarios)');
        
        console.log('\n🔗 Final State:');
        console.log(`   Total blocks: ${blockchainResp.body.chain.length}`);
        console.log(`   Alice balance: ${aliceWalletResp.body.summary.currentBalance}`);
        console.log(`   Bob balance: ${bobWalletResp.body.summary.currentBalance}`);
        console.log(`   Total transactions processed: ${aliceWalletResp.body.summary.totalTransactions + bobWalletResp.body.summary.totalTransactions}`);

    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
        console.log(error.stack);
    }
}

testAllAPIExamples();
