# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

<<<<<<< HEAD
# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Ensure public directory exists
RUN mkdir -p /app/public

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application and dependencies from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Environment variables are provided via docker-compose.yml in production
# Do not copy .env files into the image

# Set user
USER nextjs
=======
# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built application from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
>>>>>>> parent of a679453 (remove: delete all Docker and Nginx configuration files)

# Expose port
EXPOSE 3000

<<<<<<< HEAD
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Entrypoint
ENTRYPOINT ["dumb-init", "--"]

=======
>>>>>>> parent of a679453 (remove: delete all Docker and Nginx configuration files)
# Start application
CMD ["node", "server.js"]
