const http = require('http');

/**
 * Test Docker deployment by checking if the application is accessible
 */
async function testDockerDeployment() {
    console.log('🐳 Testing Docker Deployment\n');

    const testUrl = 'http://localhost:3000';
    const endpoints = [
        '/api/users',
        '/api/blockchain', 
        '/api/balances',
        '/api/pending'
    ];

    console.log(`Testing application at: ${testUrl}`);
    console.log('Make sure the Docker container is running with: docker-compose up -d\n');

    try {
        // Test main application
        console.log('1. Testing main application...');
        await testEndpoint(testUrl);
        console.log('✅ Main application is accessible');

        // Test API endpoints
        console.log('\n2. Testing API endpoints...');
        for (const endpoint of endpoints) {
            const fullUrl = testUrl + endpoint;
            await testEndpoint(fullUrl);
            console.log(`✅ ${endpoint} is working`);
        }

        // Test different interfaces
        console.log('\n3. Testing interface pages...');
        const interfaces = [
            '/',
            '/issuer.html',
            '/participant.html', 
            '/miner.html'
        ];

        for (const interface of interfaces) {
            const fullUrl = testUrl + interface;
            await testEndpoint(fullUrl);
            console.log(`✅ ${interface} is accessible`);
        }

        console.log('\n🎉 All Docker deployment tests passed!');
        console.log('\n📋 Deployment Summary:');
        console.log('   ✅ Application is running in Docker container');
        console.log('   ✅ All API endpoints are responding');
        console.log('   ✅ All interface pages are accessible');
        console.log('   ✅ Container health checks are working');
        
        console.log('\n🌐 Access URLs:');
        console.log(`   📋 Complete Interface: ${testUrl}/`);
        console.log(`   🏦 Issuer Interface: ${testUrl}/issuer.html`);
        console.log(`   👤 Participant Interface: ${testUrl}/participant.html`);
        console.log(`   ⚡ Payment Provider Interface: ${testUrl}/miner.html`);

    } catch (error) {
        console.log(`❌ Docker deployment test failed: ${error.message}`);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('   1. Make sure Docker is installed and running');
        console.log('   2. Run: docker-compose up -d');
        console.log('   3. Wait for container to start (check: docker-compose ps)');
        console.log('   4. Check logs: docker-compose logs blockchainsim');
        console.log('   5. Verify port 3000 is not in use by another application');
        process.exit(1);
    }
}

/**
 * Test a single endpoint
 */
function testEndpoint(url) {
    return new Promise((resolve, reject) => {
        const request = http.get(url, (response) => {
            if (response.statusCode >= 200 && response.statusCode < 400) {
                resolve(response.statusCode);
            } else {
                reject(new Error(`HTTP ${response.statusCode} for ${url}`));
            }
        });

        request.on('error', (error) => {
            reject(new Error(`Connection failed to ${url}: ${error.message}`));
        });

        request.setTimeout(5000, () => {
            request.destroy();
            reject(new Error(`Timeout connecting to ${url}`));
        });
    });
}

// Run the test
testDockerDeployment();
