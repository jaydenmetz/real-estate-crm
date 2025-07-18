# Multi-stage build for optimized deployment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci --silent

# Copy application files
COPY . .

# Build the application with optimizations
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

# Install serve globally
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy only the built files
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Start the application (Railway sets PORT env var)
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]