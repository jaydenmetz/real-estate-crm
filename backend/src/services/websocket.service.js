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
      'http://localhost:3001',
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
        credentials: true,
      },
      pingInterval: 10000,
      pingTimeout: 5000,
      transports: ['websocket', 'polling'],
    });

    this.io.use(this.authenticateSocket.bind(this));

    this.io.on('connection', (socket) => {
      const { userId, teamId, brokerId } = socket;

      logger.info(`WebSocket client connected: ${userId} (Broker: ${brokerId}, Team: ${teamId})`);
      this.connectedClients.set(socket.id, { userId, teamId, brokerId, socket });

      // Join 3-tier room hierarchy: broker → team → user
      if (brokerId) {
        socket.join(`broker-${brokerId}`);
      }
      if (teamId) {
        socket.join(`team-${teamId}`);
      }
      socket.join(`user-${userId}`);

      socket.emit('connection', { status: 'connected', userId, teamId, brokerId });

      // Broadcast connection to team
      if (teamId) {
        socket.to(`team-${teamId}`).emit('team:userConnected', {
          userId,
          timestamp: new Date(),
        });
      }

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
        if (teamId) {
          socket.to(`team-${teamId}`).emit('team:userDisconnected', {
            userId,
            timestamp: new Date(),
          });
        }
      });
    });

    logger.info('WebSocket server initialized');
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.teamId = decoded.teamId || decoded.team_id;
      socket.userRole = decoded.role;

      // Fetch broker_id from database for the user
      // This requires database query, so we'll use a helper
      socket.brokerId = await this.getBrokerIdForUser(socket.userId, socket.teamId);

      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Invalid token'));
    }
  }

  async getBrokerIdForUser(userId, teamId) {
    try {
      const { pool } = require('../config/infrastructure/database');

      // Try to get broker_id from broker_users table
      const brokerUserResult = await pool.query(
        'SELECT broker_id FROM broker_users WHERE user_id = $1 AND is_active = true LIMIT 1',
        [userId]
      );

      if (brokerUserResult.rows.length > 0) {
        return brokerUserResult.rows[0].broker_id;
      }

      // If no direct broker_users link, try via team
      if (teamId) {
        const teamResult = await pool.query(
          'SELECT primary_broker_id FROM teams WHERE team_id = $1',
          [teamId]
        );

        if (teamResult.rows.length > 0 && teamResult.rows[0].primary_broker_id) {
          return teamResult.rows[0].primary_broker_id;
        }
      }

      return null;
    } catch (error) {
      logger.error('Error fetching broker_id for user:', error);
      return null;
    }
  }

  sendToUser(userId, event, data) {
    this.io.to(`user-${userId}`).emit(event, data);
  }

  sendToTeam(teamId, event, data) {
    if (teamId) {
      this.io.to(`team-${teamId}`).emit(event, data);
    }
  }

  sendToBroker(brokerId, event, data) {
    if (brokerId) {
      this.io.to(`broker-${brokerId}`).emit(event, data);
    }
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  getConnectionCount() {
    return this.connectedClients.size;
  }

  getConnectedClients() {
    return Array.from(this.connectedClients.values()).map((client) => ({
      userId: client.userId,
      teamId: client.teamId,
      brokerId: client.brokerId,
    }));
  }

  /**
   * Broadcast escrow update to all team members
   * Used by Phase 1 modular controllers (people, timeline, financials, checklists, documents)
   * @param {string} escrowId - Escrow UUID or display ID
   * @param {object} payload - Update payload with type and data
   */
  broadcastEscrowUpdate(escrowId, payload) {
    if (!escrowId || !payload) {
      logger.warn('broadcastEscrowUpdate called without escrowId or payload');
      return;
    }

    // Broadcast to all connected clients (they will filter by escrowId on frontend)
    this.broadcastToAll('escrow:updated', {
      escrowId,
      ...payload,
      timestamp: new Date().toISOString(),
    });

    logger.debug(`Escrow update broadcasted: ${escrowId} - ${payload.type}`);
  }

  /**
   * Broadcast specific escrow event types (for granular frontend filtering)
   */
  broadcastEscrowPeopleUpdate(escrowId, peopleData) {
    this.broadcastEscrowUpdate(escrowId, {
      type: 'people:updated',
      data: peopleData,
    });
  }

  broadcastEscrowTimelineUpdate(escrowId, timelineData) {
    this.broadcastEscrowUpdate(escrowId, {
      type: 'timeline:updated',
      data: timelineData,
    });
  }

  broadcastEscrowFinancialsUpdate(escrowId, financialsData) {
    this.broadcastEscrowUpdate(escrowId, {
      type: 'financials:updated',
      data: financialsData,
    });
  }

  broadcastEscrowChecklistUpdate(escrowId, category, checklistData) {
    this.broadcastEscrowUpdate(escrowId, {
      type: 'checklist:updated',
      category, // 'loan', 'house', 'admin', or 'all'
      data: checklistData,
    });
  }

  broadcastEscrowDocumentAdded(escrowId, document) {
    this.broadcastEscrowUpdate(escrowId, {
      type: 'documents:added',
      data: document,
    });
  }

  broadcastEscrowDocumentDeleted(escrowId, documentId) {
    this.broadcastEscrowUpdate(escrowId, {
      type: 'documents:deleted',
      documentId,
    });
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
