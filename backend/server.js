require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { initializeDatabase } = require('./src/config/database');
const { initializeRedis } = require('./src/config/redis');
const { startCronJobs } = require('./src/services/ai/cronJobs');

const PORT = process.env.PORT || 5050;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Make io accessible throughout the app
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('subscribe', (room) => {
    socket.join(room);
    logger.info(`Socket ${socket.id} joined room ${room}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database connected successfully');
    
    // Initialize Redis
    await initializeRedis();
    logger.info('Redis connected successfully');
    
    // Start cron jobs for AI agents
    startCronJobs();
    logger.info('AI agent cron jobs started');
    
    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API Version: ${process.env.API_VERSION}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
});