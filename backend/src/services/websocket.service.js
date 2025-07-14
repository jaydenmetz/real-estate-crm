// File: backend/src/services/websocket.service.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const alexService = require('./ai/alex.service');
const sarahService = require('./ai/sarah.service');
const davidService = require('./ai/david.service');
const mikeService = require('./ai/mike.service');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
    this.aiServices = {
      alex_executive: alexService,
      sarah_buyer: sarahService,
      david_listing: davidService,
      mike_operations: mikeService
    };
    this.teamActivities = new Map();
    this.kpiMetrics = new Map();
    this.agentLocations = new Map();
    this.roomOccupancy = new Map();
    
    // Initialize default agent locations based on floor plan
    this.defaultLocations = {
      alex_executive: { room: 'reception', x: -14.5, z: 10 },
      sarah_buyer: { room: 'clientLounge', x: -0.5, z: 10 },
      david_listing: { room: 'leadLounge', x: 12.5, z: 10 },
      mike_operations: { room: 'managerSuite', x: -14.5, z: 0 }
    };
    
    // Room configurations for 40' x 30' office
    this.rooms = {
      partnerOffice: { x: -15, z: -10, capacity: 4 },
      seniorOffice1: { x: -5.5, z: -10, capacity: 3 },
      seniorOffice2: { x: 3.5, z: -10, capacity: 3 },
      conferenceRoom: { x: 12, z: -10, capacity: 12 },
      managerSuite: { x: -14.5, z: 0, capacity: 6 },
      commonArea: { x: 1, z: -1.5, capacity: 20 },
      wellnessZone: { x: 13, z: -1.5, capacity: 8 },
      refreshmentBar: { x: 13, z: 7.5, capacity: 6 },
      reception: { x: -14.5, z: 10, capacity: 8 },
      clientLounge: { x: -0.5, z: 10, capacity: 15 },
      leadLounge: { x: 12.5, z: 10, capacity: 15 }
    };
  }

  initialize(server) {
    // Use the same CORS origins as the main app
    const allowedOrigins = [
      'https://crm.jaydenmetz.com',
      'https://api.jaydenmetz.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    this.io = socketIo(server, {
      cors: {
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps or curl)
          if (!origin) return callback(null, true);
          
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          
          // Allow subdomains of jaydenmetz.com
          if (/^https:\/\/[a-z0-9-]+\.jaydenmetz\.com$/.test(origin)) {
            return callback(null, true);
          }
          
          callback(new Error('Not allowed by CORS'));
        },
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true // Allow different Socket.io versions
    });

    // Authentication middleware (simplified for development)
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
          socket.userId = decoded.userId;
          socket.userRole = decoded.role;
        } else {
          // Development mode - assign default user
          socket.userId = 'dev-user';
          socket.userRole = 'admin';
        }
        next();
      } catch (error) {
        socket.userId = 'dev-user';
        socket.userRole = 'admin';
        next();
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    // Initialize agent locations
    this.initializeAgentLocations();

    // Start real-time updates
    this.startRealTimeUpdates();

    // Start agent activity simulation
    this.startAgentSimulation();

    logger.info('WebSocket service initialized for 40x30 office layout');
  }

  initializeAgentLocations() {
    Object.entries(this.defaultLocations).forEach(([agentId, location]) => {
      this.agentLocations.set(agentId, { ...location });
    });
  }

  handleConnection(socket) {
    const userId = socket.userId;
    logger.info(`User ${userId} connected to virtual office`);

    this.connectedClients.set(userId, socket);

    // Join user to virtual office room
    socket.join('virtual-office');

    // Send initial data
    this.sendInitialData(socket);
    this.sendAlexWelcome(socket);

    // Event handlers
    socket.on('ai:message', async (data) => {
      await this.handleAIMessage(socket, data);
    });

    socket.on('alex:quickTask', async (data) => {
      await this.handleAlexQuickTask(socket, data);
    });

    socket.on('ai:delegateTask', async (data) => {
      await this.handleTaskDelegation(socket, data);
    });

    socket.on('ai:getTeamStatus', () => {
      this.sendTeamStatus(socket);
    });

    socket.on('ai:toggle', async (data) => {
      await this.handleAgentToggle(socket, data);
    });

    socket.on('agent:move', async (data) => {
      await this.handleAgentMove(socket, data);
    });

    socket.on('room:book', async (data) => {
      await this.handleRoomBooking(socket, data);
    });

    socket.on('room:status', (data) => {
      this.sendRoomStatus(socket, data.roomId);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`User ${userId} disconnected: ${reason}`);
      this.connectedClients.delete(userId);
    });
  }

  sendInitialData(socket) {
    // Send current agent locations
    const locations = {};
    this.agentLocations.forEach((location, agentId) => {
      locations[agentId] = location;
    });
    socket.emit('agents:locations', locations);

    // Send team status
    this.sendTeamStatus(socket);

    // Send recent activities
    const recentActivities = Array.from(this.teamActivities.values())
      .slice(-50)
      .reverse();
    socket.emit('activities:history', recentActivities);
  }

  async sendAlexWelcome(socket) {
    try {
      const welcomeMessage = {
        id: Date.now(),
        agentId: 'alex_executive',
        agentName: 'Alex',
        type: 'welcome',
        content: `🎉 Welcome to your Virtual AI Office! 

I'm Alex, your Executive Assistant. I'm here at the reception desk ready to help coordinate your team.

Your office layout includes:
• Manager's Suite (11' x 10') - Our largest office
• Conference Room (16' x 10') - Perfect for team meetings
• Client & Lead Lounges - For nurturing relationships
• Wellness Zone - For team wellbeing

How can I help you today?`,
        timestamp: new Date(),
        location: this.agentLocations.get('alex_executive')
      };

      socket.emit('ai:message', welcomeMessage);
      
      // Add to activities
      this.addActivity({
        id: Date.now(),
        type: 'system',
        agent: 'Alex',
        action: `Welcomed ${socket.userId} to the virtual office`,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      logger.error('Error sending Alex welcome:', error);
    }
  }

  async handleAIMessage(socket, data) {
    try {
      const { agentId, message } = data;
      const aiService = this.aiServices[agentId];
      
      if (!aiService) {
        socket.emit('error', { message: 'Agent not found' });
        return;
      }

      // Move agent to indicate activity
      this.simulateAgentActivity(agentId, 'message');

      // Process message with AI service
      const response = await aiService.processMessage(message, {
        userId: socket.userId,
        context: {
          location: this.agentLocations.get(agentId),
          office: 'virtual'
        }
      });

      // Send response
      socket.emit('ai:response', {
        agentId,
        agentName: response.agentName,
        content: response.content,
        timestamp: new Date(),
        metadata: response.metadata
      });

      // Log activity
      this.addActivity({
        id: Date.now(),
        type: 'message',
        agent: response.agentName,
        action: `Responded to ${socket.userId}`,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (error) {
      logger.error('Error handling AI message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  }

  async handleAlexQuickTask(socket, data) {
    try {
      const { action, context } = data;
      
      // Move Alex to indicate activity
      this.simulateAgentActivity('alex_executive', 'task');

      // Process quick task
      const result = await alexService.handleQuickTask(action, {
        userId: socket.userId,
        context
      });

      // Delegate to appropriate agents
      if (result.delegations) {
        for (const delegation of result.delegations) {
          const agentId = delegation.agentId;
          
          // Move agent to appropriate location
          this.moveAgentToRoom(agentId, delegation.location || 'commonArea');
          
          // Simulate task execution
          setTimeout(() => {
            this.io.to('virtual-office').emit('task:progress', {
              taskId: delegation.taskId,
              agentId,
              progress: 50,
              status: 'in_progress'
            });
          }, 2000);

          setTimeout(() => {
            this.io.to('virtual-office').emit('task:complete', {
              taskId: delegation.taskId,
              agentId,
              result: delegation.expectedResult
            });
            
            // Return agent to default location
            this.moveAgentToDefault(agentId);
          }, 5000);
        }
      }

      // Send response
      socket.emit('alex:taskResponse', {
        action,
        status: 'delegated',
        message: result.message,
        delegations: result.delegations
      });

      // Log activity
      this.addActivity({
        id: Date.now(),
        type: 'task',
        agent: 'Alex',
        action: `Delegated "${action}" task`,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (error) {
      logger.error('Error handling quick task:', error);
      socket.emit('error', { message: 'Failed to execute task' });
    }
  }

  async handleTaskDelegation(socket, data) {
    try {
      const { task, targetAgentId } = data;
      
      // Move agents to conference room for delegation
      this.moveAgentToRoom('alex_executive', 'conferenceRoom');
      this.moveAgentToRoom(targetAgentId, 'conferenceRoom');

      // Simulate delegation
      setTimeout(() => {
        this.io.to('virtual-office').emit('task:delegated', {
          fromAgent: 'alex_executive',
          toAgent: targetAgentId,
          task,
          location: 'conferenceRoom'
        });

        // Return agents after meeting
        setTimeout(() => {
          this.moveAgentToDefault('alex_executive');
          this.moveAgentToDefault(targetAgentId);
        }, 3000);
      }, 1000);

      socket.emit('delegation:success', {
        task,
        targetAgentId,
        estimatedCompletion: '30 minutes'
      });

    } catch (error) {
      logger.error('Error handling task delegation:', error);
      socket.emit('error', { message: 'Failed to delegate task' });
    }
  }

  handleAgentMove(socket, data) {
    const { agentId, targetRoom } = data;
    
    if (!this.rooms[targetRoom]) {
      socket.emit('error', { message: 'Invalid room' });
      return;
    }

    this.moveAgentToRoom(agentId, targetRoom);
  }

  moveAgentToRoom(agentId, roomId) {
    const room = this.rooms[roomId];
    if (!room) return;

    const currentLocation = this.agentLocations.get(agentId);
    const newLocation = {
      room: roomId,
      x: room.x + (Math.random() - 0.5) * 4, // Random offset within room
      z: room.z + (Math.random() - 0.5) * 4
    };

    this.agentLocations.set(agentId, newLocation);

    // Broadcast movement
    this.io.to('virtual-office').emit('agent:move', {
      agentId,
      from: currentLocation,
      to: newLocation,
      timestamp: new Date()
    });

    // Update room occupancy
    this.updateRoomOccupancy();
  }

  moveAgentToDefault(agentId) {
    const defaultLocation = this.defaultLocations[agentId];
    if (!defaultLocation) return;

    this.agentLocations.set(agentId, { ...defaultLocation });

    this.io.to('virtual-office').emit('agent:move', {
      agentId,
      to: defaultLocation,
      timestamp: new Date()
    });

    this.updateRoomOccupancy();
  }

  updateRoomOccupancy() {
    const occupancy = new Map();
    
    // Initialize all rooms
    Object.keys(this.rooms).forEach(roomId => {
      occupancy.set(roomId, []);
    });

    // Count agents in each room
    this.agentLocations.forEach((location, agentId) => {
      if (location.room) {
        const agents = occupancy.get(location.room) || [];
        agents.push(agentId);
        occupancy.set(location.room, agents);
      }
    });

    this.roomOccupancy = occupancy;

    // Broadcast update
    this.io.to('virtual-office').emit('rooms:occupancy', {
      occupancy: Object.fromEntries(occupancy),
      timestamp: new Date()
    });
  }

  async handleRoomBooking(socket, data) {
    try {
      const { roomId, date, startTime, endTime, purpose } = data;
      
      // Validate room
      if (!this.rooms[roomId]) {
        socket.emit('error', { message: 'Invalid room' });
        return;
      }

      // Create booking
      const booking = {
        id: Date.now(),
        roomId,
        userId: socket.userId,
        date,
        startTime,
        endTime,
        purpose,
        status: 'confirmed'
      };

      // Send confirmation
      socket.emit('booking:confirmed', booking);

      // Notify others
      socket.broadcast.to('virtual-office').emit('room:booked', {
        roomId,
        booking
      });

      // Log activity
      this.addActivity({
        id: Date.now(),
        type: 'booking',
        agent: 'System',
        action: `${socket.userId} booked ${roomId}`,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (error) {
      logger.error('Error handling room booking:', error);
      socket.emit('error', { message: 'Failed to book room' });
    }
  }

  sendRoomStatus(socket, roomId) {
    const room = this.rooms[roomId];
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const occupants = this.roomOccupancy.get(roomId) || [];
    
    socket.emit('room:status', {
      roomId,
      capacity: room.capacity,
      occupied: occupants.length,
      occupants,
      available: occupants.length < room.capacity
    });
  }

  sendTeamStatus(socket) {
    const status = {
      agents: [],
      metrics: {
        totalActive: 0,
        totalTasks: 0,
        avgResponseTime: 0
      }
    };

    // Compile agent status
    const agentIds = ['alex_executive', 'sarah_buyer', 'david_listing', 'mike_operations'];
    
    agentIds.forEach(agentId => {
      const location = this.agentLocations.get(agentId);
      const metrics = this.kpiMetrics.get(agentId) || {
        tasksCompleted: 0,
        avgResponseTime: 0,
        efficiency: 0
      };

      const agentStatus = {
        id: agentId,
        name: this.getAgentName(agentId),
        status: this.getAgentStatus(agentId),
        location,
        metrics,
        lastActive: new Date()
      };

      status.agents.push(agentStatus);
      
      if (agentStatus.status === 'available' || agentStatus.status === 'busy') {
        status.metrics.totalActive++;
      }
    });

    // Calculate totals
    status.metrics.totalTasks = Array.from(this.kpiMetrics.values())
      .reduce((sum, m) => sum + (m.tasksCompleted || 0), 0);
    
    status.metrics.avgResponseTime = Array.from(this.kpiMetrics.values())
      .reduce((sum, m) => sum + (m.avgResponseTime || 0), 0) / agentIds.length;

    socket.emit('team:status', status);
  }

  async handleAgentToggle(socket, data) {
    const { agentId } = data;
    
    // Toggle agent status
    const currentStatus = this.getAgentStatus(agentId);
    const newStatus = currentStatus === 'available' ? 'away' : 'available';
    
    // Update status
    this.setAgentStatus(agentId, newStatus);

    // Broadcast update
    this.io.to('virtual-office').emit('agent:update', {
      agentId,
      updates: { status: newStatus }
    });

    // Log activity
    this.addActivity({
      id: Date.now(),
      type: 'status',
      agent: this.getAgentName(agentId),
      action: `Status changed to ${newStatus}`,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  simulateAgentActivity(agentId, activityType) {
    const activities = {
      message: ['commonArea', 'managerSuite'],
      task: ['conferenceRoom', 'commonArea'],
      meeting: ['conferenceRoom'],
      break: ['wellnessZone', 'refreshmentBar']
    };

    const possibleRooms = activities[activityType] || ['commonArea'];
    const targetRoom = possibleRooms[Math.floor(Math.random() * possibleRooms.length)];
    
    this.moveAgentToRoom(agentId, targetRoom);

    // Return to default after activity
    const duration = activityType === 'meeting' ? 10000 : 5000;
    setTimeout(() => {
      this.moveAgentToDefault(agentId);
    }, duration);
  }

  startAgentSimulation() {
    // Simulate random agent activities
    setInterval(() => {
      const agents = ['alex_executive', 'sarah_buyer', 'david_listing', 'mike_operations'];
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      
      const activities = ['message', 'task', 'meeting', 'break'];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      
      if (Math.random() > 0.7) { // 30% chance of activity
        this.simulateAgentActivity(randomAgent, randomActivity);
        
        // Generate activity log
        this.addActivity({
          id: Date.now(),
          type: randomActivity,
          agent: this.getAgentName(randomAgent),
          action: this.generateActivityDescription(randomActivity),
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }, 15000); // Every 15 seconds
  }

  startRealTimeUpdates() {
    // Update KPIs every 30 seconds
    setInterval(() => {
      this.updateKPIMetrics();
      this.broadcastKPIUpdate();
    }, 30000);

    // Check for achievements every minute
    setInterval(() => {
      this.checkAchievements();
    }, 60000);
  }

  updateKPIMetrics() {
    const agents = ['alex_executive', 'sarah_buyer', 'david_listing', 'mike_operations'];
    
    agents.forEach(agentId => {
      const currentMetrics = this.kpiMetrics.get(agentId) || {
        tasksCompleted: 0,
        avgResponseTime: 2.5,
        efficiency: 90
      };

      // Simulate metric changes
      const metrics = {
        tasksCompleted: currentMetrics.tasksCompleted + Math.floor(Math.random() * 5),
        avgResponseTime: Math.max(0.5, currentMetrics.avgResponseTime + (Math.random() - 0.5) * 0.5),
        efficiency: Math.min(100, Math.max(80, currentMetrics.efficiency + (Math.random() - 0.5) * 5))
      };

      this.kpiMetrics.set(agentId, metrics);
    });
  }

  broadcastKPIUpdate() {
    const kpiData = {};
    this.kpiMetrics.forEach((metrics, agentId) => {
      kpiData[agentId] = metrics;
    });

    this.io.to('virtual-office').emit('kpi:update', {
      metrics: kpiData,
      timestamp: new Date()
    });
  }

  checkAchievements() {
    const totalTasks = Array.from(this.kpiMetrics.values())
      .reduce((sum, m) => sum + m.tasksCompleted, 0);

    // Check for milestones
    if (totalTasks >= 100 && totalTasks < 105) {
      this.broadcastAchievement({
        id: Date.now(),
        title: 'Century Club',
        description: 'Team completed 100 tasks!',
        icon: '🎯',
        timestamp: new Date()
      });
    }

    if (totalTasks >= 500 && totalTasks < 505) {
      this.broadcastAchievement({
        id: Date.now(),
        title: 'Task Masters',
        description: 'Team completed 500 tasks!',
        icon: '🏆',
        timestamp: new Date()
      });
    }
  }

  broadcastAchievement(achievement) {
    this.io.to('virtual-office').emit('achievement:earned', achievement);
    
    this.addActivity({
      id: Date.now(),
      type: 'achievement',
      agent: 'Team',
      action: `Earned "${achievement.title}"`,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  addActivity(activity) {
    this.teamActivities.set(activity.id, activity);
    
    // Keep only last 1000 activities
    if (this.teamActivities.size > 1000) {
      const firstKey = this.teamActivities.keys().next().value;
      this.teamActivities.delete(firstKey);
    }

    // Broadcast to all clients
    this.io.to('virtual-office').emit('activity:new', activity);
  }

  generateActivityDescription(activityType) {
    const descriptions = {
      message: [
        'Responded to client inquiry',
        'Updated team on progress',
        'Sent follow-up email',
        'Clarified requirements'
      ],
      task: [
        'Completed market analysis',
        'Updated listing information',
        'Processed new lead',
        'Reviewed contracts'
      ],
      meeting: [
        'Attended team standup',
        'Client consultation',
        'Strategy session',
        'Progress review'
      ],
      break: [
        'Taking a quick break',
        'Grabbing coffee',
        'In wellness zone',
        'Recharging'
      ]
    };

    const options = descriptions[activityType] || ['Working on tasks'];
    return options[Math.floor(Math.random() * options.length)];
  }

  getAgentName(agentId) {
    const names = {
      alex_executive: 'Alex',
      sarah_buyer: 'Sarah',
      david_listing: 'David',
      mike_operations: 'Mike'
    };
    return names[agentId] || 'Unknown';
  }

  getAgentStatus(agentId) {
    // Simplified status management
    const statuses = new Map([
      ['alex_executive', 'available'],
      ['sarah_buyer', 'busy'],
      ['david_listing', 'available'],
      ['mike_operations', 'away']
    ]);
    return statuses.get(agentId) || 'offline';
  }

  setAgentStatus(agentId, status) {
    // In production, this would update a database
    logger.info(`Agent ${agentId} status changed to ${status}`);
  }

  getIO() {
    return this.io;
  }

  emitToUser(userId, event, data) {
    const socket = this.connectedClients.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  emitToAll(event, data) {
    this.io.to('virtual-office').emit(event, data);
  }
}

module.exports = new WebSocketService();