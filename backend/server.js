require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const app = require('./src/app');
const logger = require('./src/utils/logger');
const websocketService = require('./src/services/websocket.service');
const cronService = require('./src/services/cron.service');

const PORT = process.env.PORT || 5050;

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket with the server
websocketService.initialize(httpServer);

// Start cron jobs
cronService.start();

// Start server
httpServer.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📡 WebSocket enabled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});