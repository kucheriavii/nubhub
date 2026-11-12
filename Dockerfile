# ==========================================
# Stage 1: Build the Vite React application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies for building
RUN npm ci || npm install

# Copy application source code
COPY . .

# Build production SPA assets to /app/dist
RUN npm run build

# ==========================================
# Stage 2: Production runtime image
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3030
ENV HOST=0.0.0.0
ENV DB_PATH=/app/data/db.json

# Copy package manifests and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --omit=dev

# Copy compiled frontend assets from builder
COPY --from=builder /app/dist ./dist

# Copy backend server, seed data and database
COPY server ./server
COPY src/data ./src/data

# Ensure data directory exists and set permissions
RUN mkdir -p /app/data && chown -R node:node /app

# Run container as non-root user for security
USER node

# Expose HTTP port
EXPOSE 3030

# Declare persistent volume for application data
VOLUME ["/app/data"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3030/health || exit 1

# Start standalone production server
CMD ["node", "server/server.js"]
