# Use Node.js Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm prune --production

# Install serve globally
RUN npm install -g serve

# Expose port (Railway will override this)
EXPOSE 3000

# Start the application using PORT environment variable
CMD serve -s build -l $PORT