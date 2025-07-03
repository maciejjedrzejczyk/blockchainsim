# 🔗 blockchainsim - Blockchain Demonstration Tool

An advanced, educational blockchain demonstration designed for non-technical audiences. This application shows how a realistic blockchain system works with proper user roles, authentication, and security features.

[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🎯 Overview

This blockchain demonstration tool provides a **complete, realistic blockchain implementation** with:
- **Role-based access control** (Issuers, Participants, Payment Providers)
- **Cryptographic security** (RSA key pairs, digital signatures)
- **Real mining simulation** with proof-of-work
- **Multiple user interfaces** tailored for different roles
- **Comprehensive search capabilities** including wallet history
- **Educational focus** perfect for demonstrations and learning

## ✨ Key Features

### 🔐 **Security & Authentication**
- **RSA-2048 key pairs** for all users
- **Digital signatures** for transaction validation
- **Private key authentication** for all operations
- **Cryptographic wallet addresses** derived from public keys

### 👥 **Role-Based System**
- **🏦 Token Issuers**: Create and distribute new tokens
- **👤 Participants**: Transfer tokens between accounts
- **⚡ Payment Providers**: Mine blocks and validate transactions

### 🎨 **Multiple Interfaces**
- **📋 Complete Interface**: Full-featured administrative interface
- **🏦 Issuer Interface**: Focused on token creation operations
- **👤 Participant Interface**: Streamlined for token transfers
- **⚡ Payment Provider Interface**: Mining and validation tools

### 🔍 **Advanced Search & Exploration**
- **Hash Search**: Find blocks and transactions by hash
- **Wallet History**: Complete transaction history for any address
- **Copy Functionality**: Easy hash copying for external use
- **Real-time Updates**: Live blockchain data synchronization

### ⛏️ **Realistic Mining**
- **Proof-of-work algorithm** with adjustable difficulty
- **Nonce calculation** and hash validation
- **Block creation** with transaction batching
- **Mining statistics** and performance monitoring

## 🚀 Quick Start

### Prerequisites
- **Node.js 14+**
- **npm** (comes with Node.js)
- **Modern web browser**

### Installation

```bash
# Clone the repository
git clone https://github.com/maciejjedrzejczyk/blockchainsim.git
cd blockchainsim

# Install dependencies
npm install

# Start the server
npm start
```

### Access the Application

- **Complete Interface**: http://localhost:3000/
- **Token Issuer Interface**: http://localhost:3000/issuer.html
- **Participant Interface**: http://localhost:3000/participant.html
- **Payment Provider Interface**: http://localhost:3000/miner.html

## 📖 How to Use

### 1. **Register Users**
- Create users with different roles (Issuer, Participant, Payment Provider)
- **Save private keys securely** (shown only once!)
- Each user gets a unique wallet address

### 2. **Issue Tokens** (Issuers Only)
- Select issuer and participant recipient
- Specify amount and asset name
- Authenticate with private key
- Transaction enters pending pool

### 3. **Transfer Tokens** (Participants Only)
- Select sender and receiver participants
- Enter transfer amount
- Authenticate with sender's private key
- Requires sufficient balance

### 4. **Mine Blocks** (Payment Providers Only)
- Select payment provider
- Authenticate with private key
- Process all pending transactions into new block
- Updates all balances

### 5. **Explore Blockchain**
- Search by block hash or transaction hash
- View wallet transaction history
- Copy hashes for external use
- Monitor real-time blockchain state

## 🏗️ Architecture

```
├── blockchain.js          # Core blockchain implementation
├── server.js             # Express API server
├── public/               # Frontend interfaces
│   ├── index.html        # Complete interface
│   ├── issuer.html       # Token issuer interface
│   ├── participant.html  # Participant interface
│   ├── miner.html        # Payment provider interface
│   ├── script.js         # Frontend JavaScript
│   └── styles.css        # Styling and themes
├── __tests__/            # Jest test suites
├── tests/                # Additional test scripts
├── docs/                 # Documentation
└── diagrams/             # Process flow diagrams
```

## 📚 Documentation

### **Core Documentation**
- **[API Examples](docs/API_EXAMPLES.md)** - Complete API reference with curl examples
- **[API Quick Reference](docs/API_QUICK_REFERENCE.md)** - Essential API calls
- **[Role Interfaces](docs/ROLE_INTERFACES.md)** - Role-specific interface documentation
- **[Exploration Features](docs/EXPLORATION_FEATURES.md)** - Search and exploration capabilities

### **Process Flow Diagrams**
- **[Process Flow Diagrams](diagrams/PROCESS_FLOW_DIAGRAM.md)** - Detailed Mermaid and Graphviz diagrams
- **[Simple Process Diagrams](diagrams/SIMPLE_PROCESS_DIAGRAM.md)** - Simplified flow charts
- **[Working Mermaid Diagrams](diagrams/WORKING_MERMAID_DIAGRAM.md)** - Tested diagram code
- **[Text-based Diagrams](diagrams/TEXT_DIAGRAM.md)** - ASCII flow charts

### **Technical Documentation**
- **[Interface Summary](docs/INTERFACE_SUMMARY.md)** - Complete interface overview
- **[Transfer Fix Summary](docs/TRANSFER_FIX_SUMMARY.md)** - Technical implementation details
- **[Test Documentation](docs/TEST_DOCUMENTATION.md)** - Testing strategy and results

## 🧪 Testing

The project includes comprehensive test suites:

```bash
# Run all tests
npm test

# Run specific test files
npm test user-registration.test.js
npm test blockchain-operations.test.js

# Run additional test scripts
node tests/test-api-examples.js
node tests/test-wallet-search.js
```

### Test Coverage
- **User Registration**: All role types and validation
- **Token Operations**: Issuance and transfers
- **Mining Operations**: Block creation and validation
- **Search Functionality**: Hash and wallet searches
- **API Endpoints**: Complete API testing
- **Error Handling**: Invalid operations and edge cases

## 🎓 Educational Use Cases

### **For Financial Institutions**
- Demonstrate digital currency concepts
- Show regulatory compliance capabilities
- Explain blockchain benefits to stakeholders
- Train staff on blockchain technology

### **For Educational Institutions**
- Teach blockchain fundamentals
- Demonstrate cryptographic concepts
- Show role separation in distributed systems
- Provide hands-on blockchain experience

### **For Developers**
- Learn blockchain implementation patterns
- Understand consensus mechanisms
- Practice with cryptographic operations
- Study role-based system design

### **For Business Training**
- Explain blockchain to non-technical audiences
- Demonstrate transaction flows
- Show security and validation concepts
- Illustrate decentralized system benefits

## 🔧 API Reference

### **Core Endpoints**

#### User Management
- `POST /api/register` - Register new users
- `GET /api/users` - Get all users
- `POST /api/validate-key` - Validate private keys

#### Token Operations
- `POST /api/issue-tokens` - Issue new tokens (issuers only)
- `POST /api/transfer` - Transfer tokens (participants only)
- `GET /api/balances` - Get current balances

#### Mining Operations
- `POST /api/mine` - Mine pending transactions (payment providers only)
- `GET /api/pending` - Get pending transactions

#### Blockchain Data
- `GET /api/blockchain` - Get complete blockchain
- `GET /api/search/:hash` - Search by block or transaction hash
- `GET /api/search/wallet/:address` - Get wallet transaction history

For complete API documentation with examples, see [API Examples](docs/API_EXAMPLES.md).

## 🎨 Customization

### **Modify Mining Difficulty**
```javascript
// In blockchain.js
const difficulty = 2; // Adjust for faster/slower mining
```

### **Add New User Roles**
```javascript
// In blockchain.js - User class
const validRoles = ['issuer', 'participant', 'payment_provider', 'your_new_role'];
```

### **Customize Interface Themes**
```css
/* In public/styles.css */
.your-custom-theme {
    --primary-color: #your-color;
    --secondary-color: #your-secondary-color;
}
```

## 🛡️ Security Considerations

### **For Educational Use**
- Private keys are generated server-side for demo purposes
- In production, generate private keys client-side
- This demo stores keys in memory (lost on restart)
- Not suitable for production without security enhancements

### **Security Features Implemented**
- RSA-2048 cryptographic key pairs
- SHA-256 hashing for blocks and transactions
- Digital signature validation
- Role-based access control
- Transaction validation and balance checking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Setup**
```bash
# Clone and install
git clone https://github.com/maciejjedrzejczyk/blockchainsim.git
cd blockchainsim
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for educational purposes to demonstrate blockchain concepts
- Designed for non-technical audiences and educational institutions
- Inspired by real-world blockchain implementations
- Created to bridge the gap between theory and practice

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/maciejjedrzejczyk/blockchainsim/issues)
- **Discussions**: [GitHub Discussions](https://github.com/maciejjedrzejczyk/blockchainsim/discussions)
- **Documentation**: [docs/](docs/) directory

## 🔄 Version History

- **v1.0.0** - Initial release with basic blockchain functionality
- **v1.1.0** - Added role-based interfaces and enhanced security
- **v1.2.0** - Implemented advanced search and wallet history features
- **v1.3.0** - Added comprehensive testing and documentation

---

**Perfect for educational institutions, financial organizations, and anyone wanting to understand blockchain technology through hands-on experience!** 🎓🏦💻
