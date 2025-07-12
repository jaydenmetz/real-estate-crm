import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageQueue = [];
    this.listeners = new Map();
  }

  connect() {
    try {
      const token = localStorage.getItem('api_token');
      
      this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5050', {
        // auth: { token },  // ← Commented out temporarily
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000,
        forceNew: false,
        upgrade: true,
        rememberUpgrade: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        this.processMessageQueue();
        this.emit('connection', { status: 'connected' });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        this.isConnected = false;
        this.emit('connection', { status: 'disconnected', reason });
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.emit('connection', { 
            status: 'failed', 
            error: 'Max reconnection attempts reached' 
          });
        }
      });

      this.socket.on('ai:message', (data) => {
        this.emit('ai:message', data);
      });

      this.socket.on('ai:status', (data) => {
        this.emit('ai:status', data);
      });

      this.socket.on('alex:notification', (data) => {
        this.emit('alex:notification', data);
      });

      this.socket.on('data:update', (data) => {
        this.emit('data:update', data);
      });

      this.socket.on('notification', (data) => {
        this.emit('notification', data);
      });

      // Add missing event listeners from your original code
      this.socket.on('agent-update', (data) => {
        this.emit('agent-update', data);
      });

      this.socket.on('task-complete', (data) => {
        this.emit('task-complete', data);
      });

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  sendToAlex(message, type = 'chat') {
    const payload = {
      to: 'alex_executive',
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    this.send('ai:message', payload);
  }

  sendToAgent(agentId, message, type = 'task') {
    const payload = {
      to: agentId,
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    this.send('ai:message', payload);
  }

  send(event, data) {
    if (this.isConnected && this.socket) {
      this.socket.emit(event, data);
    } else {
      this.messageQueue.push({ event, data });
    }
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const { event, data } = this.messageQueue.shift();
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  requestDailyBriefing() {
    this.send('alex:request', { type: 'daily_briefing' });
  }

  requestUrgentTasks() {
    this.send('alex:request', { type: 'urgent_tasks' });
  }

  updateAgentStatus(agentId, enabled) {
    this.send('ai:toggle', { agentId, enabled });
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
    };
  }

  getConnectionCount() {
    // This would typically come from the server
    return this.isConnected ? 1 : 0;
  }
}

export default new WebSocketService();