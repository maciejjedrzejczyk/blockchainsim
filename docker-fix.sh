#!/bin/bash

# Docker Fix Script for blockchainsim
# This script fixes common Docker build issues

echo "🔧 blockchainsim Docker Fix Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the blockchainsim directory."
    exit 1
fi

echo "🔍 Diagnosing Docker issues..."

# Fix 1: Regenerate package-lock.json
echo "1. Regenerating package-lock.json..."
if [ -f "package-lock.json" ]; then
    rm package-lock.json
    echo "   ✅ Removed old package-lock.json"
fi

npm install
if [ $? -eq 0 ]; then
    echo "   ✅ Generated new package-lock.json"
else
    echo "   ❌ Failed to generate package-lock.json"
    exit 1
fi

# Fix 2: Clean Docker cache
echo "2. Cleaning Docker cache..."
docker system prune -f > /dev/null 2>&1
echo "   ✅ Docker cache cleaned"

# Fix 3: Try building with the simple Dockerfile first
echo "3. Testing simple Docker build..."
if docker build -f Dockerfile.simple -t blockchainsim-simple . > /dev/null 2>&1; then
    echo "   ✅ Simple Docker build successful"
    echo "   💡 You can use: docker run -d -p 3000:3000 --name blockchainsim blockchainsim-simple"
else
    echo "   ⚠️  Simple Docker build failed, trying main Dockerfile..."
fi

# Fix 4: Try main Dockerfile
echo "4. Testing main Docker build..."
if docker build --no-cache -t blockchainsim . > /dev/null 2>&1; then
    echo "   ✅ Main Docker build successful"
    MAIN_BUILD_SUCCESS=true
else
    echo "   ❌ Main Docker build failed"
    MAIN_BUILD_SUCCESS=false
fi

# Fix 5: Test docker-compose
echo "5. Testing docker-compose..."
if docker-compose config > /dev/null 2>&1; then
    echo "   ✅ docker-compose configuration valid"
    COMPOSE_VALID=true
else
    echo "   ❌ docker-compose configuration invalid"
    COMPOSE_VALID=false
fi

echo ""
echo "🎯 Fix Results:"
echo "==============="

if [ "$MAIN_BUILD_SUCCESS" = true ] && [ "$COMPOSE_VALID" = true ]; then
    echo "✅ All fixes successful! You can now run:"
    echo "   docker-compose up -d"
    echo "   or"
    echo "   ./docker-start.sh"
elif [ -f "Dockerfile.simple" ]; then
    echo "✅ Simple build available! You can run:"
    echo "   docker run -d -p 3000:3000 --name blockchainsim blockchainsim-simple"
    echo "   Then access: http://localhost:3000"
else
    echo "❌ Docker builds failed. Try manual installation:"
    echo "   npm install"
    echo "   npm start"
    echo ""
    echo "📋 For more help, see DOCKER_TROUBLESHOOTING.md"
fi

echo ""
echo "🔧 Additional troubleshooting options:"
echo "   - Check Docker version: docker --version"
echo "   - Check available space: docker system df"
echo "   - View detailed logs: docker build --progress=plain -t blockchainsim ."
echo "   - Manual build: docker build --no-cache -t blockchainsim ."
