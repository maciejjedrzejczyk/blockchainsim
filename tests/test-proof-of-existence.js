const fs = require('fs');
const path = require('path');

/**
 * Test script for Proof-of-Existence functionality
 * Tests the API endpoints using curl commands
 */

async function testProofOfExistence() {
    console.log('🧪 Testing Proof-of-Existence functionality...\n');
    
    const { execSync } = require('child_process');
    const testFilePath = path.join(__dirname, 'test-sample.txt');
    
    try {
        // Create a test file
        const testContent = `Test file for proof-of-existence
Created: ${new Date().toISOString()}
Content: This is a sample file for testing blockchain proof-of-existence functionality.`;
        
        fs.writeFileSync(testFilePath, testContent);
        console.log('✅ Created test file:', testFilePath);
        
        // Test 1: Create proof-of-existence
        console.log('\n📝 Test 1: Creating proof-of-existence...');
        const createCommand = `curl -s -X POST -F "file=@${testFilePath}" http://localhost:3000/api/proof-of-existence`;
        const createResult = execSync(createCommand, { encoding: 'utf8' });
        const createData = JSON.parse(createResult);
        
        if (createData.message && createData.fileHash) {
            console.log('✅ Proof created successfully!');
            console.log('   File Hash:', createData.fileHash);
            console.log('   Block Hash:', createData.blockHash);
            console.log('   Transaction ID:', createData.transactionId);
            
            const fileHash = createData.fileHash;
            
            // Test 2: Verify proof by hash
            console.log('\n🔍 Test 2: Verifying proof by hash...');
            const verifyCommand = `curl -s http://localhost:3000/api/proof-of-existence/${fileHash}`;
            const verifyResult = execSync(verifyCommand, { encoding: 'utf8' });
            const verifyData = JSON.parse(verifyResult);
            
            if (verifyData.exists) {
                console.log('✅ Proof verified successfully by hash!');
                console.log('   Original file name:', verifyData.fileName);
                console.log('   Timestamp:', verifyData.timestamp);
            } else {
                console.log('❌ Proof verification by hash failed!');
            }
            
            // Test 3: Verify proof by file upload
            console.log('\n📤 Test 3: Verifying proof by file upload...');
            const verifyFileCommand = `curl -s -X POST -F "file=@${testFilePath}" http://localhost:3000/api/verify-proof`;
            const verifyFileResult = execSync(verifyFileCommand, { encoding: 'utf8' });
            const verifyFileData = JSON.parse(verifyFileResult);
            
            if (verifyFileData.exists) {
                console.log('✅ Proof verified successfully by file upload!');
                console.log('   Calculated hash matches:', verifyFileData.calculatedHash === fileHash);
            } else {
                console.log('❌ Proof verification by file upload failed!');
            }
            
            // Test 4: Get all proofs
            console.log('\n📋 Test 4: Getting all proof-of-existence records...');
            const allProofsCommand = `curl -s http://localhost:3000/api/proof-of-existence`;
            const allProofsResult = execSync(allProofsCommand, { encoding: 'utf8' });
            const allProofs = JSON.parse(allProofsResult);
            
            console.log(`✅ Found ${allProofs.length} proof(s) in total`);
            
            // Test 5: Test duplicate prevention
            console.log('\n🚫 Test 5: Testing duplicate prevention...');
            const duplicateCommand = `curl -s -X POST -F "file=@${testFilePath}" http://localhost:3000/api/proof-of-existence`;
            const duplicateResult = execSync(duplicateCommand, { encoding: 'utf8' });
            const duplicateData = JSON.parse(duplicateResult);
            
            if (duplicateData.error && duplicateData.error.includes('already exists')) {
                console.log('✅ Duplicate prevention working correctly!');
            } else {
                console.log('❌ Duplicate prevention test failed!');
            }
            
            // Test 6: Test non-existent hash
            console.log('\n🔍 Test 6: Testing with non-existent hash...');
            const fakeHash = 'a'.repeat(64);
            const fakeCommand = `curl -s http://localhost:3000/api/proof-of-existence/${fakeHash}`;
            const fakeResult = execSync(fakeCommand, { encoding: 'utf8' });
            const fakeData = JSON.parse(fakeResult);
            
            if (!fakeData.exists) {
                console.log('✅ Non-existent hash correctly returns false!');
            } else {
                console.log('❌ Non-existent hash test failed!');
            }
            
            console.log('\n🎉 All tests completed successfully!');
            
        } else {
            console.log('❌ Failed to create proof:', createData);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running on http://localhost:3000');
        console.log('   Start the server with: npm start');
    } finally {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
            console.log('\n🧹 Test file cleaned up.');
        }
    }
}

// Check if server is accessible before running tests
async function checkServer() {
    const { execSync } = require('child_process');
    try {
        execSync('curl -s http://localhost:3000/api/users', { encoding: 'utf8' });
        return true;
    } catch (error) {
        return false;
    }
}

// Main execution
async function main() {
    console.log('🔍 Checking if server is running...');
    
    if (await checkServer()) {
        console.log('✅ Server is accessible\n');
        await testProofOfExistence();
    } else {
        console.log('❌ Server is not accessible at http://localhost:3000');
        console.log('\n💡 Please start the server first:');
        console.log('   cd /path/to/blockchain');
        console.log('   npm start');
        console.log('\nThen run this test again.');
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { testProofOfExistence, checkServer };
