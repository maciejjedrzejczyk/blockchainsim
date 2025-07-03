# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy application code from builder stage
COPY --from=builder /app/blockchain.js ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/public ./public/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S blockchainsim -u 1001

# Change ownership of app directory
RUN chown -R blockchainsim:nodejs /app

# Switch to non-root user
USER blockchainsim

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/users', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
