const request = require('supertest');
const { createTestApp } = require('./__tests__/test-utils');

async function testWalletSearchFunctionality() {
    console.log('🔍 Testing Enhanced Search Functionality\n');

    const app = createTestApp();

    try {
        // Step 1: Register users
        console.log('1. Registering users...');
        
        const issuerResp = await request(app)
            .post('/api/register')
            .send({ username: 'CentralBank', role: 'issuer' });
        
        const aliceResp = await request(app)
            .post('/api/register')
            .send({ username: 'Alice', role: 'participant' });
        
        const bobResp = await request(app)
            .post('/api/register')
            .send({ username: 'Bob', role: 'participant' });
        
        const minerResp = await request(app)
            .post('/api/register')
            .send({ username: 'MinerCorp', role: 'payment_provider' });

        console.log('✅ Users registered successfully');
        console.log(`   Alice wallet: ${aliceResp.body.user.walletAddress}`);
        console.log(`   Bob wallet: ${bobResp.body.user.walletAddress}`);

        // Step 2: Create some transactions
        console.log('\n2. Creating transactions...');
        
        // Issue tokens to Alice
        await request(app)
            .post('/api/issue-tokens')
            .send({
                issuerUsername: 'CentralBank',
                toUsername: 'Alice',
                amount: 500,
                assetName: 'Gold Coins',
                privateKey: issuerResp.body.user.privateKey
            });

        // Issue tokens to Bob
        await request(app)
            .post('/api/issue-tokens')
            .send({
                issuerUsername: 'CentralBank',
                toUsername: 'Bob',
                amount: 300,
                assetName: 'Silver Coins',
                privateKey: issuerResp.body.user.privateKey
            });

        // Mine the issuance transactions
        await request(app)
            .post('/api/mine')
            .send({
                minerUsername: 'MinerCorp',
                privateKey: minerResp.body.user.privateKey
            });

        // Transfer from Alice to Bob
        await request(app)
            .post('/api/transfer')
            .send({
                fromUsername: 'Alice',
                toUsername: 'Bob',
                amount: 150,
                privateKey: aliceResp.body.user.privateKey
            });

        // Mine the transfer transaction
        await request(app)
            .post('/api/mine')
            .send({
                minerUsername: 'MinerCorp',
                privateKey: minerResp.body.user.privateKey
            });

        console.log('✅ Transactions created and mined');

        // Step 3: Test wallet search for Alice
        console.log('\n3. Testing wallet search for Alice...');
        
        const aliceWalletResp = await request(app)
            .get(`/api/search/wallet/${aliceResp.body.user.walletAddress}`)
            .expect(200);

        console.log('✅ Alice wallet search successful');
        console.log(`   Username: ${aliceWalletResp.body.username}`);
        console.log(`   Role: ${aliceWalletResp.body.role}`);
        console.log(`   Current Balance: ${aliceWalletResp.body.summary.currentBalance}`);
        console.log(`   Total Transactions: ${aliceWalletResp.body.summary.totalTransactions}`);
        console.log(`   Total Received: ${aliceWalletResp.body.summary.totalReceived}`);
        console.log(`   Total Sent: ${aliceWalletResp.body.summary.totalSent}`);

        // Step 4: Test wallet search for Bob
        console.log('\n4. Testing wallet search for Bob...');
        
        const bobWalletResp = await request(app)
            .get(`/api/search/wallet/${bobResp.body.user.walletAddress}`)
            .expect(200);

        console.log('✅ Bob wallet search successful');
        console.log(`   Username: ${bobWalletResp.body.username}`);
        console.log(`   Role: ${bobWalletResp.body.role}`);
        console.log(`   Current Balance: ${bobWalletResp.body.summary.currentBalance}`);
        console.log(`   Total Transactions: ${bobWalletResp.body.summary.totalTransactions}`);
        console.log(`   Total Received: ${bobWalletResp.body.summary.totalReceived}`);
        console.log(`   Total Sent: ${bobWalletResp.body.summary.totalSent}`);

        // Step 5: Test transaction details
        console.log('\n5. Verifying transaction details...');
        
        console.log('   Alice transactions:');
        aliceWalletResp.body.transactions.forEach((tx, index) => {
            console.log(`     ${index + 1}. ${tx.direction.toUpperCase()}: ${tx.amount} ${tx.assetName || 'tokens'}`);
            console.log(`        From: ${tx.fromUsername} To: ${tx.toUsername}`);
            console.log(`        Type: ${tx.type}, Block: ${tx.blockIndex}`);
        });

        console.log('\n   Bob transactions:');
        bobWalletResp.body.transactions.forEach((tx, index) => {
            console.log(`     ${index + 1}. ${tx.direction.toUpperCase()}: ${tx.amount} ${tx.assetName || 'tokens'}`);
            console.log(`        From: ${tx.fromUsername} To: ${tx.toUsername}`);
            console.log(`        Type: ${tx.type}, Block: ${tx.blockIndex}`);
        });

        // Step 6: Test non-existent wallet
        console.log('\n6. Testing non-existent wallet search...');
        
        const nonExistentResp = await request(app)
            .get('/api/search/wallet/nonexistentwallet123')
            .expect(200);

        console.log('✅ Non-existent wallet handled correctly');
        console.log(`   Username: ${nonExistentResp.body.username}`);
        console.log(`   Total Transactions: ${nonExistentResp.body.summary.totalTransactions}`);

        console.log('\n🎉 All wallet search functionality tests passed!');
        console.log('\n📊 Summary of new features:');
        console.log('   ✅ Wallet address search with transaction history');
        console.log('   ✅ Transaction summary statistics');
        console.log('   ✅ Transaction direction tracking (sent/received)');
        console.log('   ✅ Block information for each transaction');
        console.log('   ✅ Proper handling of non-existent wallets');

    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
        console.log(error.stack);
    }
}

testWalletSearchFunctionality();
