#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔗 Blockchain Demo - Test Runner\n');

const testSuites = [
    {
        name: 'User Registration Tests',
        file: 'user-registration.test.js',
        description: 'Tests user registration, authentication, and validation',
        status: '✅ FULLY WORKING'
    },
    {
        name: 'Asset Operations Tests',
        file: 'asset-operations.test.js',
        description: 'Tests token issuance and transfer operations',
        status: '⚠️ PARTIAL (issuance works, transfers need fixes)'
    },
    {
        name: 'Mining and Validation Tests',
        file: 'mining-validation.test.js',
        description: 'Tests mining operations and blockchain validation',
        status: '⚠️ PARTIAL (basic mining works)'
    },
    {
        name: 'Search Functionality Tests',
        file: 'search-functionality.test.js',
        description: 'Tests search by transaction and block hash',
        status: '⚠️ PARTIAL (basic search works)'
    },
    {
        name: 'Integration Tests',
        file: 'integration.test.js',
        description: 'Tests complete workflows and edge cases',
        status: '⚠️ PARTIAL (simple workflows work)'
    }
];

function runTest(testFile, testName) {
    console.log(`\n🧪 Running ${testName}...`);
    console.log('=' .repeat(50));
    
    try {
        const result = execSync(`npx jest ${testFile} --verbose`, { 
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        console.log(result);
        return true;
    } catch (error) {
        console.log(error.stdout);
        console.log('\n❌ Some tests failed in this suite');
        return false;
    }
}

function runAllTests() {
    console.log('🚀 Running all test suites...\n');
    
    let passedSuites = 0;
    let totalSuites = testSuites.length;
    
    testSuites.forEach(suite => {
        console.log(`\n📋 ${suite.name}`);
        console.log(`   Description: ${suite.description}`);
        console.log(`   Status: ${suite.status}`);
        
        if (runTest(suite.file, suite.name)) {
            passedSuites++;
        }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Summary: ${passedSuites}/${totalSuites} test suites passed`);
    
    if (passedSuites === totalSuites) {
        console.log('🎉 All test suites passed!');
    } else {
        console.log('⚠️  Some test suites have failing tests - see details above');
    }
}

function runSingleTest(testName) {
    const suite = testSuites.find(s => s.name.toLowerCase().includes(testName.toLowerCase()) || 
                                      s.file.includes(testName.toLowerCase()));
    
    if (!suite) {
        console.log(`❌ Test suite '${testName}' not found`);
        console.log('\nAvailable test suites:');
        testSuites.forEach(s => console.log(`  - ${s.name} (${s.file})`));
        return;
    }
    
    console.log(`📋 ${suite.name}`);
    console.log(`   Description: ${suite.description}`);
    console.log(`   Status: ${suite.status}`);
    
    runTest(suite.file, suite.name);
}

// Command line interface
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Available commands:');
    console.log('  node run-tests.js all                    # Run all test suites');
    console.log('  node run-tests.js user                   # Run user registration tests');
    console.log('  node run-tests.js asset                  # Run asset operations tests');
    console.log('  node run-tests.js mining                 # Run mining tests');
    console.log('  node run-tests.js search                 # Run search tests');
    console.log('  node run-tests.js integration            # Run integration tests');
    console.log('\nTest Suite Status:');
    testSuites.forEach(suite => {
        console.log(`  ${suite.status} ${suite.name}`);
    });
} else if (args[0] === 'all') {
    runAllTests();
} else {
    runSingleTest(args[0]);
}
