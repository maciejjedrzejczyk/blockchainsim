const http = require('http');

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
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

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testTransferFlow() {
    console.log('🧪 Testing HTTP Transfer Flow\n');

    try {
        // Reset
        console.log('1. Resetting blockchain...');
        await makeRequest('POST', '/api/reset');

        // Register users
        console.log('2. Registering users...');
        const issuerResp = await makeRequest('POST', '/api/register', {
            username: 'TestIssuer',
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

        if (issuerResp.status !== 200 || aliceResp.status !== 200) {
            console.log('❌ User registration failed');
            return;
        }

        console.log('✅ Users registered successfully');

        const issuerKey = issuerResp.data.user.privateKey;
        const aliceKey = aliceResp.data.user.privateKey;
        const minerKey = minerResp.data.user.privateKey;

        console.log(`   Issuer key length: ${issuerKey.length}`);
        console.log(`   Alice key length: ${aliceKey.length}`);

        // Issue tokens
        console.log('3. Issuing tokens to Alice...');
        const issueResp = await makeRequest('POST', '/api/issue-tokens', {
            issuerUsername: 'TestIssuer',
            toUsername: 'Alice',
            amount: 200,
            assetName: 'Test Tokens',
            privateKey: issuerKey
        });

        if (issueResp.status !== 200) {
            console.log(`❌ Token issuance failed: ${issueResp.data.error || issueResp.data}`);
            return;
        }

        console.log('✅ Tokens issued successfully');

        // Mine the issuance
        console.log('4. Mining issuance transaction...');
        const mineResp1 = await makeRequest('POST', '/api/mine', {
            minerUsername: 'MinerCorp',
            privateKey: minerKey
        });

        if (mineResp1.status !== 200) {
            console.log(`❌ Mining failed: ${mineResp1.data.error || mineResp1.data}`);
            return;
        }

        console.log(`✅ Block mined. Alice balance: ${mineResp1.data.balances.Alice}`);

        // Transfer tokens
        console.log('5. Transferring tokens from Alice to Bob...');
        console.log(`   Using Alice's private key (length: ${aliceKey.length})`);
        
        const transferResp = await makeRequest('POST', '/api/transfer', {
            fromUsername: 'Alice',
            toUsername: 'Bob',
            amount: 50,
            privateKey: aliceKey
        });

        console.log(`   Transfer response status: ${transferResp.status}`);
        
        if (transferResp.status !== 200) {
            console.log(`❌ Transfer failed: ${transferResp.data.error || transferResp.data}`);
            
            // Debug the private key validation
            console.log('6. Debugging private key validation...');
            const keyValidResp = await makeRequest('POST', '/api/validate-key', {
                username: 'Alice',
                privateKey: aliceKey
            });
            
            console.log(`   Key validation status: ${keyValidResp.status}`);
            console.log(`   Key validation result: ${JSON.stringify(keyValidResp.data)}`);
            
            return;
        }

        console.log('✅ Transfer transaction created successfully');

        // Mine the transfer
        console.log('6. Mining transfer transaction...');
        const mineResp2 = await makeRequest('POST', '/api/mine', {
            minerUsername: 'MinerCorp',
            privateKey: minerKey
        });

        if (mineResp2.status !== 200) {
            console.log(`❌ Mining transfer failed: ${mineResp2.data.error || mineResp2.data}`);
            return;
        }

        console.log('✅ Transfer mined successfully!');
        console.log(`   Alice balance: ${mineResp2.data.balances.Alice}`);
        console.log(`   Bob balance: ${mineResp2.data.balances.Bob}`);

    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

testTransferFlow();
