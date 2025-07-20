FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create cache and images directories
RUN mkdir -p cache images

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S weathercanvas -u 1001

# Change ownership to non-root user
RUN chown -R weathercanvas:nodejs /app
USER weathercanvas

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"]