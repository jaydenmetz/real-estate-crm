import io from 'socket.io-client';
import { getSafeTimestamp } from '../utils/safeDateUtils';

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
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('api_token');
        
        // Use React environment variable and ensure HTTPS in production
        const wsUrl = process.env.REACT_APP_WS_URL || 'wss://api.jaydenmetz.com';
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.socket = io(wsUrl, {
        // auth: { token },  // ← Commented out temporarily
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000,
        forceNew: false,
        upgrade: true,
        rememberUpgrade: true,
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      });

      // Set up one-time connection handler for the promise
      const onConnect = () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        this.processMessageQueue();
        this.emit('connection', { status: 'connected' });
        
        // Resolve the promise
        resolve();
      };
      
      // Set up one-time error handler for the promise
      const onError = (error) => {
        console.error('WebSocket initial connection failed:', error);
        reject(error);
      };
      
      this.socket.once('connect', onConnect);
      this.socket.once('connect_error', onError);
      
      // Set up persistent handlers
      this.socket.on('connect', () => {
        console.log('✅ WebSocket reconnected');
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
        console.error('WebSocket connection error:', error.message, error.type);
        
        // Log more details about the error
        if (error.type === 'TransportError') {
          console.error('Transport error - check CORS configuration');
        }
        
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached. WebSocket connection failed.');
          this.emit('connection', { 
            status: 'failed', 
            error: 'Max reconnection attempts reached',
            details: error.message
          });
        } else {
          console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
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
        reject(error);
      }
    });
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
      timestamp: getSafeTimestamp(),
    };

    this.send('ai:message', payload);
  }

  sendToAgent(agentId, message, type = 'task') {
    const payload = {
      to: agentId,
      message,
      type,
      timestamp: getSafeTimestamp(),
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