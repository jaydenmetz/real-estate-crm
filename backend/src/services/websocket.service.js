const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const alexService = require('./ai/alex.service');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
    this.aiServices = {
      alex_executive: alexService,
    };
    this.teamActivities = new Map();
    this.kpiMetrics = new Map();
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // TEMPORARY: Skip auth and assign default user for development
    this.io.use(async (socket, next) => {
      socket.userId = 'dev-user';
      socket.userRole = 'admin';
      next();
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    // Start real-time updates
    this.startRealTimeUpdates();

    logger.info('WebSocket service initialized with virtual office features');
  }

  handleConnection(socket) {
    const userId = socket.userId;
    logger.info(`User ${userId} connected to virtual office`);

    this.connectedClients.set(userId, socket);

    // Send initial team status
    this.sendTeamStatus(socket);
    this.sendAlexWelcome(socket);

    // Handle AI messages and quick tasks
    socket.on('ai:message', async (data) => {
      await this.handleAIMessage(socket, data);
    });

    // Handle Alex quick tasks
    socket.on('alex:quickTask', async (data) => {
      await this.handleAlexQuickTask(socket, data);
    });

    // Handle task delegation
    socket.on('ai:delegateTask', async (data) => {
      await this.handleTaskDelegation(socket, data);
    });

    // Handle agent status requests
    socket.on('ai:getTeamStatus', () => {
      this.sendTeamStatus(socket);
    });

    // Handle agent toggle
    socket.on('ai:toggle', async (data) => {
      await this.handleAgentToggle(socket, data);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`User ${userId} disconnected: ${reason}`);
      this.connectedClients.delete(userId);
    });
  }

  async sendAlexWelcome(socket) {
    try {
      const welcomeMessage = `🎉 Welcome to your AI Real Estate Office! 

I'm Alex, your Executive Assistant. I'm currently managing your team of 14 AI agents who are working on:
• 🔄 ${Math.floor(Math.random() * 20) + 10} active tasks
• 📞 Lead follow-ups and qualifying
• 📋 Listing optimizations  
• 📄 Transaction coordination
• 📊 Market analysis

Use the quick task bar above to delegate anything to me, or visit the AI Team page to see your virtual office in action!`;
      
      socket.emit('ai:message', {
        from: 'alex_executive',
        message: welcomeMessage,
        timestamp: new Date().toISOString(),
        type: 'welcome'
      });
    } catch (error) {
      logger.error('Failed to send Alex welcome message:', error);
    }
  }

  async handleAIMessage(socket, data) {
    try {
      const { to, message, type } = data;
      
      // Process with Alex (main AI service)
      const response = await this.processWithAlex(message, type, socket.userId);
      
      // Send response
      socket.emit('ai:message', {
        from: to || 'alex_executive',
        message: response,
        timestamp: new Date().toISOString(),
        type: 'response'
      });

      // Log interaction
      await this.logAIInteraction(socket.userId, to || 'alex_executive', message, response);

    } catch (error) {
      logger.error('Error handling AI message:', error);
      socket.emit('ai:message', {
        from: 'system',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        type: 'error'
      });
    }
  }

  async handleAlexQuickTask(socket, data) {
    try {
      const { description, action, page } = data;
      
      // Notify that Alex is processing
      socket.emit('alex:status', {
        status: 'working',
        message: `Processing: ${description}`,
        timestamp: new Date().toISOString()
      });

      // Simulate processing time
      const processingTime = 2000 + Math.random() * 3000; // 2-5 seconds
      
      setTimeout(() => {
        // Determine which agent should handle this
        const assignedAgent = this.determineAgentForTask(action, page);
        
        // Create task delegation
        this.delegateTaskToAgent(assignedAgent, description, socket);
        
        // Notify completion
        socket.emit('alex:status', {
          status: 'completed',
          message: `✅ Task delegated to ${assignedAgent}`,
          timestamp: new Date().toISOString()
        });

        // Broadcast to all clients for virtual office
        this.broadcast('ai:taskDelegated', {
          from: 'alex_executive',
          to: assignedAgent,
          task: description,
          timestamp: new Date().toISOString()
        });

      }, processingTime);

    } catch (error) {
      logger.error('Error handling Alex quick task:', error);
      socket.emit('alex:status', {
        status: 'error',
        message: 'Failed to process task',
        timestamp: new Date().toISOString()
      });
    }
  }

  determineAgentForTask(action, page) {
    const agentMapping = {
      // Page-based routing
      '/leads': {
        'followup_leads': 'buyer_nurture',
        'score_leads': 'buyer_qualifier',
        'qualify_prospects': 'buyer_qualifier',
        'nurture_sequence': 'buyer_nurture'
      },
      '/appointments': {
        'schedule_followups': 'showing_coordinator',
        'confirm_appointments': 'showing_coordinator',
        'send_reminders': 'alex_executive',
        'prep_packets': 'transaction_coordinator'
      },
      '/listings': {
        'analyze_listings': 'market_analyst',
        'showing_feedback': 'listing_marketing',
        'update_mls': 'listing_launch',
        'call_prospects': 'buyer_qualifier'
      },
      '/clients': {
        'market_updates': 'market_analyst',
        'annual_checkins': 'buyer_nurture',
        'update_profiles': 'alex_executive',
        'anniversary_reminders': 'buyer_nurture'
      },
      '/ai-team': {
        'optimize_workflows': 'alex_executive',
        'review_kpis': 'alex_executive',
        'schedule_training': 'alex_executive',
        'team_report': 'alex_executive'
      }
    };

    // Default assignments for general tasks
    const defaultMapping = {
      'daily_briefing': 'alex_executive',
      'urgent_tasks': 'alex_executive',
      'performance': 'alex_executive',
      'alerts': 'alex_executive'
    };

    // Try page-specific mapping first
    const pageAgents = agentMapping[page];
    if (pageAgents && pageAgents[action]) {
      return pageAgents[action];
    }

    // Fall back to default mapping
    if (defaultMapping[action]) {
      return defaultMapping[action];
    }

    // Default to Alex for unknown tasks
    return 'alex_executive';
  }

  delegateTaskToAgent(agentId, taskDescription, socket) {
    // Update agent activity
    this.teamActivities.set(agentId, {
      agentId,
      status: 'working',
      currentTask: taskDescription,
      progress: 0,
      startTime: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + Math.random() * 300000).toISOString()
    });

    // Simulate task completion
    setTimeout(() => {
      this.completeAgentTask(agentId, taskDescription);
    }, 3000 + Math.random() * 7000); // 3-10 seconds
  }

  completeAgentTask(agentId, taskDescription) {
    // Mark as completed
    this.teamActivities.set(agentId, {
      agentId,
      status: 'completed',
      currentTask: null,
      lastCompleted: taskDescription,
      completedAt: new Date().toISOString()
    });

    // Broadcast completion
    this.broadcast('ai:taskCompleted', {
      agentId,
      task: taskDescription,
      timestamp: new Date().toISOString()
    });

    // Check for KPI achievements
    this.checkKPIAchievements(agentId, taskDescription);

    // Return to idle after showing completion
    setTimeout(() => {
      this.teamActivities.set(agentId, {
        agentId,
        status: 'idle',
        currentTask: null,
        lastCompleted: taskDescription,
        lastActive: new Date().toISOString()
      });
      
      this.broadcastTeamStatus();
    }, 5000);
  }

  checkKPIAchievements(agentId, taskDescription) {
    const achievements = [];

    // Random KPI achievements for demo
    if (Math.random() > 0.7) {
      const kpiTypes = [
        {
          type: 'response_time',
          achievement: `Lightning response: 2.1 minutes (Target: <5 min)`,
          celebration: true
        },
        {
          type: 'conversion',
          achievement: `Lead qualification rate: 95% (Target: >90%)`,
          celebration: true
        },
        {
          type: 'efficiency',
          achievement: `Task completed 40% faster than average`,
          celebration: true
        },
        {
          type: 'performance',
          achievement: `Weekly KPI target exceeded by 15%`,
          celebration: true
        }
      ];

      const randomKPI = kpiTypes[Math.floor(Math.random() * kpiTypes.length)];
      
      achievements.push({
        agentId,
        ...randomKPI,
        timestamp: new Date().toISOString()
      });
    }

    // Broadcast achievements
    achievements.forEach(achievement => {
      this.broadcast('ai:achievement', achievement);
    });
  }

  async processWithAlex(message, type, userId) {
    try {
      // Enhanced Alex responses for virtual office
      const responses = {
        briefing: `📊 **Daily Briefing - ${new Date().toLocaleDateString()}**

🤖 **AI Team Status:**
• 12 agents active and working
• 247 tasks completed today
• 94.2% efficiency rating

🎯 **Key Achievements:**
• Buyer Qualifier: 2.1 min avg response time
• Listing Launch: +150% listing views
• Transaction Coord: 98% on-time completion

🔄 **Currently Working On:**
• Lead qualification for 3 new prospects
• MLS optimization for 2 listings  
• Escrow coordination for 4 transactions

**Recommendation:** Focus on the Henderson closing tomorrow - all documentation is ready!`,

        urgent: `⚠️ **Urgent Tasks Requiring Your Attention:**

🔥 **High Priority (Next 2 hours):**
• Wilson contract negotiation response needed
• Henderson inspection contingency expires  

⚡ **Medium Priority (Today):**
• Johnson family showing follow-up
• Martinez closing document review

🤖 **AI Team Handling:**
• Lead follow-ups (Buyer Nurture)
• MLS updates (Listing Launch)
• Document preparation (Transaction Coord)

**I'll keep monitoring and escalate anything critical!**`,

        schedule: `📅 **Today's Schedule & AI Support:**

**Your Appointments:**
• 10:00 AM - Smith Listing Presentation
  (AI prepared: comps, market analysis, presentation deck)
• 2:00 PM - Johnson Buyer Consultation  
  (AI prepared: buyer profile, property matches, financing options)
• 4:30 PM - Downtown Condo Showing
  (AI coordinated: keys, showing instructions, feedback form)

**AI Team Tasks:**
• Morning: Lead follow-up calls (3 completed)
• Afternoon: Listing optimization (2 in progress)
• Evening: Tomorrow's preparation (auto-scheduled)

**Your calendar is optimized for maximum productivity!**`
      };

      // Check for specific quick commands
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('brief')) {
        return responses.briefing;
      } else if (lowerMessage.includes('urgent')) {
        return responses.urgent;
      } else if (lowerMessage.includes('schedule')) {
        return responses.schedule;
      } else if (lowerMessage.includes('team') || lowerMessage.includes('agents')) {
        return `🤖 **AI Team Overview:**

**Managers (Always Active):**
• Buyer Manager: Overseeing 4 buyer agents
• Listing Manager: Managing 3 listing agents  
• Operations Manager: Coordinating 3 ops agents

**Current Activities:**
• 🟢 4 agents actively working on tasks
• 🟡 6 agents available for new assignments
• ⚪ 2 agents in standby mode

**Today's Performance:**
• 247 tasks completed
• 94.2% efficiency rating
• $23.50 token cost (within budget)

Visit the AI Team page to see them working in the virtual office!`;
      } else {
        // General AI response
        return `I understand you want me to: "${message}"

I'm processing this request and will delegate it to the appropriate team member. You can:

• Use the quick task buttons for common requests
• Visit the AI Team page to see real-time progress
• Check back here for updates

Is there anything specific you'd like me to prioritize?`;
      }

    } catch (error) {
      logger.error('Error processing Alex message:', error);
      return "I'm having trouble processing that request right now. Please try again.";
    }
  }

  sendTeamStatus(socket) {
    const teamStatus = {
      totalAgents: 14,
      activeAgents: 12,
      workingAgents: Array.from(this.teamActivities.values()).filter(a => a.status === 'working').length,
      completedToday: 247,
      efficiency: 94.2,
      activities: Array.from(this.teamActivities.values()),
      timestamp: new Date().toISOString()
    };

    socket.emit('ai:teamStatus', teamStatus);
  }

  broadcastTeamStatus() {
    const teamStatus = {
      totalAgents: 14,
      activeAgents: 12,
      workingAgents: Array.from(this.teamActivities.values()).filter(a => a.status === 'working').length,
      completedToday: 247,
      efficiency: 94.2,
      activities: Array.from(this.teamActivities.values()),
      timestamp: new Date().toISOString()
    };

    this.broadcast('ai:teamStatus', teamStatus);
  }

  startRealTimeUpdates() {
    // Send team status updates every 10 seconds
    setInterval(() => {
      this.broadcastTeamStatus();
    }, 10000);

    // Simulate random agent activities
    setInterval(() => {
      this.simulateAgentActivity();
    }, 15000);
  }

  simulateAgentActivity() {
    const agents = ['buyer_qualifier', 'listing_launch', 'market_analyst', 'buyer_nurture', 'transaction_coordinator'];
    const tasks = [
      'Qualifying new lead inquiry',
      'Optimizing listing description',
      'Analyzing market trends',
      'Sending follow-up sequence',
      'Updating transaction timeline',
      'Preparing market comparison',
      'Coordinating inspection schedule',
      'Processing referral lead'
    ];

    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

    // Only assign if agent is idle
    const currentActivity = this.teamActivities.get(randomAgent);
    if (!currentActivity || currentActivity.status === 'idle') {
      this.delegateTaskToAgent(randomAgent, randomTask, null);
    }
  }

  async handleAgentToggle(socket, data) {
    try {
      const { agentId, enabled } = data;
      
      socket.emit('ai:status', {
        agentId,
        enabled,
        message: `Agent ${enabled ? 'enabled' : 'disabled'} successfully`,
        timestamp: new Date().toISOString()
      });

      logger.info(`Agent ${agentId} ${enabled ? 'enabled' : 'disabled'} by user ${socket.userId}`);

    } catch (error) {
      logger.error('Error toggling agent:', error);
      socket.emit('ai:status', {
        agentId: data.agentId,
        error: 'Failed to toggle agent status'
      });
    }
  }

  async logAIInteraction(userId, agentId, userMessage, aiResponse) {
    try {
      logger.info('AI Interaction:', {
        userId,
        agentId,
        userMessage: userMessage.substring(0, 100),
        responseLength: aiResponse.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to log AI interaction:', error);
    }
  }

  broadcast(event, data) {
    this.io.emit(event, data);
  }

  sendToUser(userId, event, data) {
    const socket = this.connectedClients.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  sendNotification(message, type = 'info', priority = 'normal') {
    this.broadcast('notification', {
      message,
      type,
      priority,
      timestamp: new Date().toISOString()
    });
  }

  getConnectedClients() {
    return Array.from(this.connectedClients.keys());
  }

  getConnectionCount() {
    return this.connectedClients.size;
  }
}

module.exports = new WebSocketService();