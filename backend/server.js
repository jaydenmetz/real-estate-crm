require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const app = require('./src/app');
const logger = require('./src/utils/logger');
const websocketService = require('./src/services/websocket.service');
const cronService = require('./src/services/cron.service');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5050;

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket with the server
websocketService.initialize(httpServer);

// Start cron jobs
cronService.start();

// Create default admin user on startup
const createDefaultUser = async () => {
  try {
    // Check if this is the first run (no users exist)
    const authRoute = require('./src/routes/auth');
    const users = authRoute.users || {};
    
    if (Object.keys(users).length === 0) {
      // Create Jayden Metz's account
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const userId = 'user_default_admin';
      const apiKey = `jm_live_k3y_${Buffer.from('jaydenmetz:admin').toString('base64')}`;
      
      const defaultUser = {
        id: userId,
        username: 'jaydenmetz',
        email: 'realtor@jaydenmetz.com',
        passwordHash,
        role: 'admin',
        apiKey,
        createdAt: new Date(),
        preferences: {
          showDebugInfo: true,
          defaultDashboard: 'ai-agents',
          theme: 'light',
          emailNotifications: true,
          twoFactorEnabled: false,
          errorDisplay: 'detailed',
          timezone: 'America/Los_Angeles',
          dateFormat: 'MM/DD/YYYY',
          numberFormat: 'en-US'
        },
        profile: {
          firstName: 'Jayden',
          lastName: 'Metz',
          company: 'Metz Realty Group',
          phone: '(661) 747-0853',
          licenseNumber: '02203217',
          photo: null
        }
      };
      
      // Store the user
      users['jaydenmetz'] = defaultUser;
      
      logger.info('✅ Default admin user created successfully');
      logger.info('📧 Username: jaydenmetz');
      logger.info('🔒 Use the password you configured to login');
    }
  } catch (error) {
    logger.error('Failed to create default user:', error);
  }
};

// Start server
httpServer.listen(PORT, async () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📡 WebSocket enabled`);
  
  // Create default user after server starts
  await createDefaultUser();
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