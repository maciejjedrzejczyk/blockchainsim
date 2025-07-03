#!/bin/bash

# blockchainsim Docker Quick Start Script
# This script helps users quickly deploy the blockchain demonstration tool using Docker

set -e

echo "🔗 blockchainsim - Blockchain Demonstration Tool"
echo "🐳 Docker Quick Start Script"
echo "================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Check if port 3000 is available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use. The application might already be running."
    echo "   You can check with: docker-compose ps"
    echo "   Or stop existing containers with: docker-compose down"
    read -p "   Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build and start the application
echo "🚀 Starting blockchainsim with Docker Compose..."
echo "   This may take a few minutes on first run..."

if docker-compose up -d --build; then
    echo "✅ blockchainsim is starting up!"
    
    # Wait for application to be ready
    echo "⏳ Waiting for application to be ready..."
    sleep 10
    
    # Test if application is responding
    if curl -s http://localhost:3000/api/users > /dev/null 2>&1; then
        echo "🎉 blockchainsim is ready!"
        echo ""
        echo "🌐 Access the application:"
        echo "   📋 Complete Interface:        http://localhost:3000/"
        echo "   🏦 Token Issuer Interface:    http://localhost:3000/issuer.html"
        echo "   👤 Participant Interface:     http://localhost:3000/participant.html"
        echo "   ⚡ Payment Provider Interface: http://localhost:3000/miner.html"
        echo ""
        echo "🔧 Useful commands:"
        echo "   View logs:        docker-compose logs -f"
        echo "   Stop application: docker-compose down"
        echo "   Restart:          docker-compose restart"
        echo "   Check status:     docker-compose ps"
        echo ""
        echo "📚 For more information, see docs/DOCKER_DEPLOYMENT.md"
        
        # Optionally open browser
        if command -v open &> /dev/null; then
            read -p "🌐 Open application in browser? (Y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                open http://localhost:3000
            fi
        fi
        
    else
        echo "⚠️  Application started but may not be ready yet."
        echo "   Please wait a moment and check: http://localhost:3000"
        echo "   Or check logs with: docker-compose logs -f"
    fi
    
else
    echo "❌ Failed to start blockchainsim"
    echo "   Check logs with: docker-compose logs"
    echo "   For help, see docs/DOCKER_DEPLOYMENT.md"
    exit 1
fi
