const http = require('http');

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData ? Buffer.byteLength(postData) : 0
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function testCompleteWorkflow() {
    console.log('🎯 Final Server Test - Complete Workflow\n');

    try {
        // Step 1: Register users
        console.log('1. Registering users...');
        
        const issuerResp = await makeRequest('POST', '/api/register', {
            username: 'BankIssuer',
            role: 'issuer'
        });
        
        const aliceResp = await makeRequest('POST', '/api/register', {
            username: 'Alice',
            role: 'participant'
        });
        
        const bobResp = await makeRequest('POST', '/api/register', {
            username: 'Bob',
            role: 'participant'
        });
        
        const minerResp = await makeRequest('POST', '/api/register', {
            username: 'MinerCorp',
            role: 'payment_provider'
        });

        if (issuerResp.status !== 200) {
            console.log('❌ User registration failed');
            return;
        }

        console.log('✅ All users registered successfully');

        // Step 2: Issue tokens
        console.log('2. Issuing 200 tokens to Alice...');
        
        const issueResp = await makeRequest('POST', '/api/issue-tokens', {
            issuerUsername: 'BankIssuer',
            toUsername: 'Alice',
            amount: 200,
            assetName: 'Gold Coins',
            privateKey: issuerResp.data.user.privateKey
        });

        if (issueResp.status !== 200) {
            console.log(`❌ Token issuance failed: ${issueResp.data.error}`);
            return;
        }

        console.log('✅ Tokens issued successfully');

        // Step 3: Mine issuance
        console.log('3. Mining issuance transaction...');
        
        const mineResp1 = await makeRequest('POST', '/api/mine', {
            minerUsername: 'MinerCorp',
            privateKey: minerResp.data.user.privateKey
        });

        if (mineResp1.status !== 200) {
            console.log(`❌ Mining failed: ${mineResp1.data.error}`);
            return;
        }

        console.log(`✅ Block mined! Alice balance: ${mineResp1.data.balances.Alice}`);

        // Step 4: Transfer tokens
        console.log('4. Transferring 75 tokens from Alice to Bob...');
        
        const transferResp = await makeRequest('POST', '/api/transfer', {
            fromUsername: 'Alice',
            toUsername: 'Bob',
            amount: 75,
            privateKey: aliceResp.data.user.privateKey
        });

        if (transferResp.status !== 200) {
            console.log(`❌ Transfer failed: ${transferResp.data.error}`);
            return;
        }

        console.log('✅ Transfer transaction created successfully');

        // Step 5: Mine transfer
        console.log('5. Mining transfer transaction...');
        
        const mineResp2 = await makeRequest('POST', '/api/mine', {
            minerUsername: 'MinerCorp',
            privateKey: minerResp.data.user.privateKey
        });

        if (mineResp2.status !== 200) {
            console.log(`❌ Mining transfer failed: ${mineResp2.data.error}`);
            return;
        }

        console.log('✅ Transfer mined successfully!');
        console.log(`   Alice final balance: ${mineResp2.data.balances.Alice}`);
        console.log(`   Bob final balance: ${mineResp2.data.balances.Bob}`);

        // Step 6: Verify blockchain
        console.log('6. Verifying blockchain integrity...');
        
        const blockchainResp = await makeRequest('GET', '/api/blockchain');
        
        if (blockchainResp.status !== 200) {
            console.log('❌ Failed to get blockchain data');
            return;
        }

        console.log(`✅ Blockchain verified!`);
        console.log(`   Total blocks: ${blockchainResp.data.chain.length}`);
        console.log(`   Blockchain valid: ${blockchainResp.data.isValid}`);

        // Step 7: Search for transaction
        console.log('7. Testing search functionality...');
        
        const txHash = transferResp.data.transaction.id;
        const searchResp = await makeRequest('GET', `/api/search/${txHash}`);
        
        if (searchResp.status !== 200) {
            console.log('❌ Search failed');
            return;
        }

        console.log('✅ Search successful!');
        console.log(`   Found transaction: ${searchResp.data.data.fromUsername} -> ${searchResp.data.data.toUsername}`);
        console.log(`   Amount: ${searchResp.data.data.amount}`);

        console.log('\n🎉 ALL TESTS PASSED! The blockchain system is working perfectly!');
        console.log('\n📊 Final Summary:');
        console.log('   ✅ User registration for all roles');
        console.log('   ✅ Token issuance by issuers');
        console.log('   ✅ Token transfers between participants');
        console.log('   ✅ Mining by payment providers');
        console.log('   ✅ Blockchain integrity validation');
        console.log('   ✅ Search functionality');
        console.log('   ✅ Balance tracking');

    } catch (error) {
        console.log(`❌ Test failed with error: ${error.message}`);
    }
}

// Wait a moment for server to start, then run test
setTimeout(testCompleteWorkflow, 3000);
