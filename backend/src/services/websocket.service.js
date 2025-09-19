// File: backend/src/services/websocket.service.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
  }

  initialize(server) {
    // Use the same CORS origins as the main app
    const corsOrigins = [
      'https://crm.jaydenmetz.com',
      'https://api.jaydenmetz.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];

    this.io = socketIo(server, {
      cors: {
        origin: (origin, callback) => {
          // Allow requests with no origin
          if (!origin) return callback(null, true);

          // Check if origin is in allowed list
          if (corsOrigins.includes(origin)) {
            return callback(null, true);
          }

          // Allow subdomains of jaydenmetz.com
          if (/^https:\/\/[a-z0-9-]+\.jaydenmetz\.com$/.test(origin)) {
            return callback(null, true);
          }

          callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingInterval: 10000,
      pingTimeout: 5000,
      transports: ['websocket', 'polling']
    });

    this.io.use(this.authenticateSocket.bind(this));

    this.io.on('connection', (socket) => {
      const userId = socket.userId;
      const teamId = socket.teamId;

      logger.info(`WebSocket client connected: ${userId} (Team: ${teamId})`);
      this.connectedClients.set(socket.id, { userId, teamId, socket });

      socket.join(`team-${teamId}`);
      socket.join(`user-${userId}`);

      socket.emit('connection', { status: 'connected', userId, teamId });

      // Broadcast connection to team
      socket.to(`team-${teamId}`).emit('team:userConnected', {
        userId,
        timestamp: new Date()
      });

      // Handle generic messaging
      socket.on('message', (data) => {
        logger.debug('WebSocket message received:', data);

        // Broadcast to team
        if (data.toTeam) {
          socket.to(`team-${teamId}`).emit('message', data);
        }

        // Send to specific user
        if (data.toUser) {
          socket.to(`user-${data.toUser}`).emit('message', data);
        }
      });

      // Handle data updates
      socket.on('data:update', (data) => {
        // Broadcast data updates to team
        socket.to(`team-${teamId}`).emit('data:update', data);
      });

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${userId}`);
        this.connectedClients.delete(socket.id);

        // Notify team of disconnection
        socket.to(`team-${teamId}`).emit('team:userDisconnected', {
          userId,
          timestamp: new Date()
        });
      });
    });

    logger.info('WebSocket server initialized');
  }

  authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.teamId = decoded.teamId || decoded.team_id;
      socket.userRole = decoded.role;

      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Invalid token'));
    }
  }

  sendToUser(userId, event, data) {
    this.io.to(`user-${userId}`).emit(event, data);
  }

  sendToTeam(teamId, event, data) {
    this.io.to(`team-${teamId}`).emit(event, data);
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  getConnectionCount() {
    return this.connectedClients.size;
  }

  getConnectedClients() {
    return Array.from(this.connectedClients.values()).map(client => ({
      userId: client.userId,
      teamId: client.teamId
    }));
  }

  disconnect() {
    if (this.io) {
      this.io.close();
      this.io = null;
      this.connectedClients.clear();
      logger.info('WebSocket server disconnected');
    }
  }
}

module.exports = new WebSocketService();