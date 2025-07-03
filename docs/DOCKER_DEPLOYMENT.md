# 🐳 Docker Deployment Guide

This guide explains how to run blockchainsim - Blockchain Demonstration Tool using Docker containers for easy deployment and distribution.

## 🎯 Overview

Docker containerization provides:
- **Easy deployment** across different environments
- **Consistent runtime** regardless of host system
- **Isolated environment** with all dependencies included
- **Production-ready** configuration with optional reverse proxy
- **Scalability** for educational institutions and organizations

## 🚀 Quick Start

### **Prerequisites**
- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)

### **Simple Deployment**

```bash
# Clone the repository
git clone https://github.com/yourusername/blockchainsim.git
cd blockchainsim

# Build and start the container
docker-compose up -d

# Access the application
open http://localhost:3000
```

That's it! The blockchain demonstration tool is now running in a container.

## 📋 Deployment Options

### **Option 1: Docker Compose (Recommended)**

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### **Option 2: Docker Build and Run**

```bash
# Build the image
docker build -t blockchainsim .

# Run the container
docker run -d \
  --name blockchainsim-app \
  -p 3000:3000 \
  --restart unless-stopped \
  blockchainsim

# View logs
docker logs -f blockchainsim-app

# Stop the container
docker stop blockchainsim-app
docker rm blockchainsim-app
```

### **Option 3: Production with Nginx**

```bash
# Start with nginx reverse proxy
docker-compose --profile production up -d

# Access via nginx (port 80)
open http://localhost
```

## 🔧 Configuration Options

### **Environment Variables**

Create a `.env` file in the project root:

```bash
# Application settings
NODE_ENV=production
PORT=3000

# Optional: Custom settings
MINING_DIFFICULTY=2
MAX_USERS=100
```

### **Custom Port Mapping**

```bash
# Run on different port (e.g., 8080)
docker run -d -p 8080:3000 --name blockchainsim blockchainsim

# Or modify docker-compose.yml
services:
  blockchainsim:
    ports:
      - "8080:3000"  # Host:Container
```

### **Memory and CPU Limits**

```yaml
# In docker-compose.yml
services:
  blockchainsim:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 🏫 Educational Institution Deployment

### **Multi-Instance Setup**

```yaml
# docker-compose-classroom.yml
version: '3.8'
services:
  blockchainsim-class1:
    build: .
    ports:
      - "3001:3000"
    container_name: blockchainsim-class1
    
  blockchainsim-class2:
    build: .
    ports:
      - "3002:3000"
    container_name: blockchainsim-class2
    
  blockchainsim-class3:
    build: .
    ports:
      - "3003:3000"
    container_name: blockchainsim-class3
```

```bash
# Deploy multiple instances
docker-compose -f docker-compose-classroom.yml up -d

# Access different instances
# Class 1: http://localhost:3001
# Class 2: http://localhost:3002
# Class 3: http://localhost:3003
```

### **Load Balancer Setup**

```yaml
# docker-compose-loadbalanced.yml
version: '3.8'
services:
  blockchainsim-1:
    build: .
    
  blockchainsim-2:
    build: .
    
  blockchainsim-3:
    build: .
    
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - blockchainsim-1
      - blockchainsim-2
      - blockchainsim-3
```

## 🔒 Production Deployment

### **Security Considerations**

1. **Use HTTPS in production**:
```bash
# Generate SSL certificates
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem

# Enable HTTPS in nginx.conf (uncomment HTTPS server block)
```

2. **Environment-specific configurations**:
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  blockchainsim:
    build: .
    environment:
      - NODE_ENV=production
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

3. **Health monitoring**:
```bash
# Check container health
docker-compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' blockchainsim-app
```

## 📊 Monitoring and Logs

### **Container Logs**

```bash
# View real-time logs
docker-compose logs -f blockchainsim

# View last 100 lines
docker-compose logs --tail=100 blockchainsim

# View logs from specific time
docker-compose logs --since="2024-01-01T00:00:00" blockchainsim
```

### **Health Checks**

```bash
# Check application health
curl http://localhost:3000/api/users

# Check container health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### **Resource Usage**

```bash
# Monitor resource usage
docker stats blockchainsim-app

# View detailed container info
docker inspect blockchainsim-app
```

## 🛠️ Development with Docker

### **Development Mode**

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  blockchainsim-dev:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
```

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# The application will reload on code changes
```

### **Running Tests in Container**

```bash
# Run tests
docker-compose exec blockchainsim npm test

# Run specific test
docker-compose exec blockchainsim npm test user-registration.test.js

# Run additional test scripts
docker-compose exec blockchainsim node tests/test-api-examples.js
```

## 🔧 Troubleshooting

### **Common Issues**

1. **npm package lock mismatch**:
```bash
# Run the fix script
./docker-fix.sh

# Or manually fix
rm package-lock.json
npm install
docker-compose build --no-cache
```

2. **Port already in use**:
```bash
# Check what's using port 3000
lsof -i :3000

# Use different port
docker-compose up -d --scale blockchainsim=0
docker-compose run -p 3001:3000 blockchainsim
```

3. **Container won't start**:
```bash
# Check logs for errors
docker-compose logs blockchainsim

# Try simple build
docker build -f Dockerfile.simple -t blockchainsim .
docker run -d -p 3000:3000 --name blockchainsim blockchainsim
```

4. **Build failures**:
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check available space
docker system df
```

For comprehensive troubleshooting, see [DOCKER_TROUBLESHOOTING.md](../DOCKER_TROUBLESHOOTING.md).

### **Quick Fix Script**

If you encounter build issues, run the automated fix script:
```bash
./docker-fix.sh
```

This script will:
- Regenerate package-lock.json
- Clean Docker cache
- Test different build methods
- Provide specific recommendations

### **Debug Mode**

```bash
# Run container interactively
docker run -it --rm blockchainsim sh

# Execute commands in running container
docker-compose exec blockchainsim sh

# Check application files
docker-compose exec blockchainsim ls -la /app
```

## 📦 Image Management

### **Building Custom Images**

```bash
# Build with custom tag
docker build -t blockchainsim:v1.3.0 .

# Build for different architectures
docker buildx build --platform linux/amd64,linux/arm64 -t blockchainsim:latest .
```

### **Image Optimization**

```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 3000
CMD ["npm", "start"]
```

### **Registry Deployment**

```bash
# Tag for registry
docker tag blockchainsim:latest your-registry.com/blockchainsim:latest

# Push to registry
docker push your-registry.com/blockchainsim:latest

# Pull and run from registry
docker run -d -p 3000:3000 your-registry.com/blockchainsim:latest
```

## 🎓 Educational Use Cases

### **Classroom Deployment**
- **Multiple instances** for different classes
- **Isolated environments** for each student group
- **Easy reset** between sessions
- **Consistent experience** across different computers

### **Workshop Setup**
- **Quick deployment** for training sessions
- **No installation required** on participant machines
- **Portable setup** with USB drives or cloud deployment
- **Scalable** for large audiences

### **Remote Learning**
- **Cloud deployment** for remote access
- **Shared instances** for collaborative learning
- **Easy distribution** via container images
- **Platform independent** deployment

## 🚀 Advanced Configurations

### **Kubernetes Deployment**

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blockchainsim
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blockchainsim
  template:
    metadata:
      labels:
        app: blockchainsim
    spec:
      containers:
      - name: blockchainsim
        image: blockchainsim:latest
        ports:
        - containerPort: 3000
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
---
apiVersion: v1
kind: Service
metadata:
  name: blockchainsim-service
spec:
  selector:
    app: blockchainsim
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### **Docker Swarm**

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml blockchainsim-stack

# Scale service
docker service scale blockchainsim-stack_blockchainsim=5
```

## 📋 Best Practices

### **Security**
- ✅ Use non-root user in container
- ✅ Implement health checks
- ✅ Use multi-stage builds
- ✅ Scan images for vulnerabilities
- ✅ Use specific base image versions

### **Performance**
- ✅ Optimize Docker layers
- ✅ Use .dockerignore effectively
- ✅ Set appropriate resource limits
- ✅ Enable gzip compression in nginx
- ✅ Use caching strategies

### **Maintenance**
- ✅ Regular image updates
- ✅ Log rotation configuration
- ✅ Backup strategies (if needed)
- ✅ Monitoring and alerting
- ✅ Documentation updates

## 🎉 Summary

Docker deployment of blockchainsim provides:

- **🚀 Easy deployment** with single command
- **🔒 Secure containerized environment**
- **📈 Scalable for educational institutions**
- **🛠️ Development-friendly setup**
- **🌐 Production-ready with nginx**
- **📊 Built-in monitoring and health checks**

Perfect for educational institutions, training organizations, and anyone wanting to deploy the blockchain demonstration tool quickly and reliably! 🎓🐳
