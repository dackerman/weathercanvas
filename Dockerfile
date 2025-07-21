FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user first
RUN addgroup -g 1001 -S nodejs
RUN adduser -S weathercanvas -u 1001

# Create cache and images directories with proper ownership
RUN mkdir -p cache images && \
    chown -R weathercanvas:nodejs /app && \
    chmod -R 755 /app/cache /app/images

USER weathercanvas

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"]