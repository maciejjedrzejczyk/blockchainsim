# 🔧 Docker Troubleshooting Guide

## Common Docker Build and Runtime Issues

### Issue 1: npm ci Package Lock Mismatch

**Error**: 
```
npm ci can only install packages when your package.json and package-lock.json are in sync
Missing: nodemon@3.1.10 from lock file
```

**Solution**:
```bash
# Delete package-lock.json and regenerate it
rm package-lock.json
npm install

# Then rebuild Docker image
docker-compose build --no-cache
docker-compose up -d
```

**Alternative**: Use the simple Dockerfile:
```bash
# Use the simple Dockerfile instead
docker build -f Dockerfile.simple -t blockchainsim .
docker run -d -p 3000:3000 --name blockchainsim-app blockchainsim
```

### Issue 2: Port Already in Use

**Error**: 
```
Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use
```

**Solution**:
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or use different port
docker-compose down
docker run -d -p 3001:3000 --name blockchainsim-app blockchainsim

# Or modify docker-compose.yml to use different port
```

### Issue 3: Docker Build Fails

**Error**: Various build errors

**Solutions**:
```bash
# Clean Docker cache and rebuild
docker system prune -a
docker-compose build --no-cache

# Or build manually with verbose output
docker build --no-cache --progress=plain -t blockchainsim .

# Check Docker disk space
docker system df
```

### Issue 4: Container Starts but App Not Accessible

**Error**: Container runs but http://localhost:3000 doesn't work

**Solutions**:
```bash
# Check container logs
docker-compose logs -f blockchainsim

# Check container status
docker-compose ps

# Test container internally
docker-compose exec blockchainsim wget -qO- http://localhost:3000/api/users

# Check port mapping
docker port blockchainsim-app
```

### Issue 5: Health Check Failures

**Error**: Container marked as unhealthy

**Solutions**:
```bash
# Check health check logs
docker inspect --format='{{json .State.Health}}' blockchainsim-app

# Test health check manually
docker-compose exec blockchainsim wget --spider http://localhost:3000/api/users

# Disable health check temporarily (in docker-compose.yml)
# Comment out the healthcheck section
```

## Quick Fixes

### Fix 1: Use Simple Build Process

Create `docker-compose.simple.yml`:
```yaml
version: '3.8'
services:
  blockchainsim:
    build:
      context: .
      dockerfile: Dockerfile.simple
    ports:
      - "3000:3000"
    restart: unless-stopped
```

Run with:
```bash
docker-compose -f docker-compose.simple.yml up -d
```

### Fix 2: Manual Docker Commands

If docker-compose fails, try manual commands:
```bash
# Build image
docker build -t blockchainsim .

# Run container
docker run -d \
  --name blockchainsim-app \
  -p 3000:3000 \
  --restart unless-stopped \
  blockchainsim

# Check logs
docker logs -f blockchainsim-app
```

### Fix 3: Development Mode

For development with live reload:
```bash
# Run without building
docker run -d \
  --name blockchainsim-dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  node:18-alpine \
  sh -c "npm install && npm start"
```

## Debugging Commands

### Container Inspection
```bash
# Get container details
docker inspect blockchainsim-app

# Check resource usage
docker stats blockchainsim-app

# Execute commands in container
docker exec -it blockchainsim-app sh

# Check files in container
docker exec blockchainsim-app ls -la /app
```

### Network Debugging
```bash
# Check Docker networks
docker network ls

# Inspect network
docker network inspect blockchainsim_blockchainsim-network

# Test connectivity
docker exec blockchainsim-app ping google.com
```

### Log Analysis
```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View last 50 lines
docker-compose logs --tail=50

# View logs for specific service
docker-compose logs blockchainsim
```

## Environment-Specific Issues

### macOS Issues
```bash
# If Docker Desktop issues
# Restart Docker Desktop
# Increase memory allocation in Docker Desktop settings

# Permission issues
sudo chown -R $USER:staff .
```

### Windows Issues
```bash
# Line ending issues
git config --global core.autocrlf false
git rm --cached -r .
git reset --hard

# Path issues in docker-compose
# Use forward slashes in volume paths
```

### Linux Issues
```bash
# Permission issues
sudo usermod -aG docker $USER
newgrp docker

# SELinux issues (if applicable)
sudo setsebool -P container_manage_cgroup on
```

## Alternative Deployment Methods

### Method 1: Direct Node.js (No Docker)
```bash
npm install
npm start
```

### Method 2: Using Docker without Compose
```bash
docker build -t blockchainsim .
docker run -p 3000:3000 blockchainsim
```

### Method 3: Using Pre-built Image (if available)
```bash
docker run -p 3000:3000 your-registry/blockchainsim:latest
```

## Getting Help

If issues persist:

1. **Check Docker version**: `docker --version` (requires 20.10+)
2. **Check Docker Compose version**: `docker-compose --version` (requires 2.0+)
3. **Check system resources**: Ensure sufficient disk space and memory
4. **Review logs**: Always check container logs for specific errors
5. **Try simple deployment**: Use Dockerfile.simple for basic setup

## Success Verification

Once working, you should see:
```bash
# Container running
docker-compose ps
# Shows: blockchainsim-app   Up   3000/tcp

# Application accessible
curl http://localhost:3000/api/users
# Returns: JSON response

# All interfaces working
curl http://localhost:3000/
curl http://localhost:3000/issuer.html
curl http://localhost:3000/participant.html
curl http://localhost:3000/miner.html
```

## Contact

If you continue to experience issues, please:
1. Include your Docker version and OS
2. Provide the complete error message
3. Share relevant logs
4. Describe your environment setup
