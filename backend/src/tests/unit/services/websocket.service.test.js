/**
 * Unit Tests: WebSocket Service
 * Tests real-time communication and Socket.IO integration
 */

const WebSocketService = require('../../../lib/infrastructure/websocket.service');
const logger = require('../../../utils/logger');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../../utils/logger');
jest.mock('jsonwebtoken');
jest.mock('socket.io');

describe('WebSocketService Unit Tests', () => {
  let mockServer;
  let mockSocket;
  let mockIo;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock server
    mockServer = {};

    // Mock socket
    mockSocket = {
      id: 'socket-123',
      userId: 'user-456',
      teamId: 'team-789',
      handshake: {
        auth: { token: 'valid-token' },
        headers: {},
      },
      join: jest.fn(),
      emit: jest.fn(),
      to: jest.fn(() => ({
        emit: jest.fn(),
      })),
      on: jest.fn(),
    };

    // Mock io
    mockIo = {
      use: jest.fn(),
      on: jest.fn(),
      to: jest.fn(() => ({
        emit: jest.fn(),
      })),
      emit: jest.fn(),
      close: jest.fn(),
    };

    const socketIo = require('socket.io');
    socketIo.mockReturnValue(mockIo);

    // Reset service state
    WebSocketService.io = null;
    WebSocketService.connectedClients = new Map();
  });

  describe('authenticateSocket()', () => {
    test('should authenticate socket with valid token from auth', () => {
      const next = jest.fn();
      const decoded = { id: 'user-123', teamId: 'team-456', role: 'agent' };

      jwt.verify.mockReturnValue(decoded);

      WebSocketService.authenticateSocket(mockSocket, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(mockSocket.userId).toBe('user-123');
      expect(mockSocket.teamId).toBe('team-456');
      expect(mockSocket.userRole).toBe('agent');
      expect(next).toHaveBeenCalledWith();
    });

    test('should authenticate with token from authorization header', () => {
      const next = jest.fn();
      const socket = {
        ...mockSocket,
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-token' },
        },
      };

      jwt.verify.mockReturnValue({ id: 'user-789', team_id: 'team-123' });

      WebSocketService.authenticateSocket(socket, next);

      expect(jwt.verify).toHaveBeenCalledWith('header-token', process.env.JWT_SECRET);
      expect(socket.userId).toBe('user-789');
      expect(socket.teamId).toBe('team-123');
    });

    test('should reject socket without token', () => {
      const next = jest.fn();
      const socket = {
        handshake: { auth: {}, headers: {} },
      };

      WebSocketService.authenticateSocket(socket, next);

      expect(next).toHaveBeenCalledWith(new Error('Authentication required'));
    });

    test('should reject socket with invalid token', () => {
      const next = jest.fn();
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      WebSocketService.authenticateSocket(mockSocket, next);

      expect(logger.error).toHaveBeenCalledWith('Socket authentication error:', expect.any(Error));
      expect(next).toHaveBeenCalledWith(new Error('Invalid token'));
    });

    test('should handle team_id or teamId from token', () => {
      const next = jest.fn();

      // First test with teamId
      jwt.verify.mockReturnValueOnce({ id: 'user-1', teamId: 'team-1' });
      WebSocketService.authenticateSocket(mockSocket, next);
      expect(mockSocket.teamId).toBe('team-1');

      // Then test with team_id
      jwt.verify.mockReturnValueOnce({ id: 'user-2', team_id: 'team-2' });
      WebSocketService.authenticateSocket(mockSocket, next);
      expect(mockSocket.teamId).toBe('team-2');
    });
  });

  describe('sendToUser()', () => {
    test('should send event to specific user', () => {
      WebSocketService.io = mockIo;

      const toMock = jest.fn(() => ({ emit: jest.fn() }));
      mockIo.to = toMock;

      WebSocketService.sendToUser('user-123', 'notification', { message: 'Test' });

      expect(toMock).toHaveBeenCalledWith('user-user-123');
    });
  });

  describe('sendToTeam()', () => {
    test('should send event to specific team', () => {
      WebSocketService.io = mockIo;

      const toMock = jest.fn(() => ({ emit: jest.fn() }));
      mockIo.to = toMock;

      WebSocketService.sendToTeam('team-456', 'update', { data: 'Team update' });

      expect(toMock).toHaveBeenCalledWith('team-team-456');
    });
  });

  describe('broadcastToAll()', () => {
    test('should broadcast event to all connected clients', () => {
      WebSocketService.io = mockIo;

      WebSocketService.broadcastToAll('announcement', { message: 'System update' });

      expect(mockIo.emit).toHaveBeenCalledWith('announcement', { message: 'System update' });
    });
  });

  describe('getConnectionCount()', () => {
    test('should return number of connected clients', () => {
      WebSocketService.connectedClients.set('socket-1', { userId: 'user-1', teamId: 'team-1' });
      WebSocketService.connectedClients.set('socket-2', { userId: 'user-2', teamId: 'team-1' });

      const count = WebSocketService.getConnectionCount();

      expect(count).toBe(2);
    });

    test('should return 0 when no clients connected', () => {
      const count = WebSocketService.getConnectionCount();

      expect(count).toBe(0);
    });
  });

  describe('getConnectedClients()', () => {
    test('should return array of connected client info', () => {
      WebSocketService.connectedClients.set('socket-1', {
        userId: 'user-1',
        teamId: 'team-1',
        socket: mockSocket,
      });
      WebSocketService.connectedClients.set('socket-2', {
        userId: 'user-2',
        teamId: 'team-2',
        socket: mockSocket,
      });

      const clients = WebSocketService.getConnectedClients();

      expect(clients).toHaveLength(2);
      expect(clients[0]).toMatchObject({
        userId: expect.any(String),
        teamId: expect.any(String),
      });
    });

    test('should return empty array when no clients connected', () => {
      const clients = WebSocketService.getConnectedClients();

      expect(clients).toEqual([]);
    });
  });

  describe('disconnect()', () => {
    test('should close socket server and clear clients', () => {
      WebSocketService.io = mockIo;
      WebSocketService.connectedClients.set('socket-1', { userId: 'user-1' });

      WebSocketService.disconnect();

      expect(mockIo.close).toHaveBeenCalled();
      expect(WebSocketService.io).toBeNull();
      expect(WebSocketService.connectedClients.size).toBe(0);
      expect(logger.info).toHaveBeenCalledWith('WebSocket server disconnected');
    });

    test('should handle disconnect when io is null', () => {
      WebSocketService.io = null;

      WebSocketService.disconnect();

      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('initialize()', () => {
    test('should create socket.io server with correct configuration', () => {
      const socketIo = require('socket.io');

      WebSocketService.initialize(mockServer);

      expect(socketIo).toHaveBeenCalledWith(mockServer, expect.objectContaining({
        cors: expect.any(Object),
        pingInterval: 10000,
        pingTimeout: 5000,
        transports: ['websocket', 'polling'],
      }));
    });

    test('should register authentication middleware', () => {
      WebSocketService.initialize(mockServer);

      expect(mockIo.use).toHaveBeenCalledWith(expect.any(Function));
    });

    test('should log initialization', () => {
      WebSocketService.initialize(mockServer);

      expect(logger.info).toHaveBeenCalledWith('WebSocket server initialized');
    });

    test('should allow requests with no origin', () => {
      WebSocketService.initialize(mockServer);

      const corsConfig = require('socket.io').mock.calls[0][1].cors;
      const callback = jest.fn();

      corsConfig.origin(null, callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    test('should allow whitelisted origins', () => {
      WebSocketService.initialize(mockServer);

      const corsConfig = require('socket.io').mock.calls[0][1].cors;
      const callback = jest.fn();

      corsConfig.origin('https://crm.jaydenmetz.com', callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    test('should allow subdomains of jaydenmetz.com', () => {
      WebSocketService.initialize(mockServer);

      const corsConfig = require('socket.io').mock.calls[0][1].cors;
      const callback = jest.fn();

      corsConfig.origin('https://api.jaydenmetz.com', callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    test('should reject non-whitelisted origins', () => {
      WebSocketService.initialize(mockServer);

      const corsConfig = require('socket.io').mock.calls[0][1].cors;
      const callback = jest.fn();

      corsConfig.origin('https://malicious.com', callback);

      expect(callback).toHaveBeenCalledWith(new Error('Not allowed by CORS'));
    });
  });

  describe('Connection Handling', () => {
    test('should handle client connection', () => {
      WebSocketService.initialize(mockServer);

      // Get the connection handler
      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];

      connectionHandler(mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith('team-team-789');
      expect(mockSocket.join).toHaveBeenCalledWith('user-user-456');
      expect(mockSocket.emit).toHaveBeenCalledWith('connection', {
        status: 'connected',
        userId: 'user-456',
        teamId: 'team-789',
      });
      expect(logger.info).toHaveBeenCalledWith('WebSocket client connected: user-456 (Team: team-789)');
    });

    test('should store connected client', () => {
      WebSocketService.initialize(mockServer);

      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];

      connectionHandler(mockSocket);

      expect(WebSocketService.connectedClients.has('socket-123')).toBe(true);
      expect(WebSocketService.connectedClients.get('socket-123')).toMatchObject({
        userId: 'user-456',
        teamId: 'team-789',
      });
    });

    test('should broadcast connection to team', () => {
      WebSocketService.initialize(mockServer);

      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
      const toMock = jest.fn(() => ({ emit: jest.fn() }));
      mockSocket.to = toMock;

      connectionHandler(mockSocket);

      expect(toMock).toHaveBeenCalledWith('team-team-789');
    });
  });

  describe('Message Handling', () => {
    test('should register message event handler', () => {
      WebSocketService.initialize(mockServer);

      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];

      connectionHandler(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
    });

    test('should register data update handler', () => {
      WebSocketService.initialize(mockServer);

      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];

      connectionHandler(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledWith('data:update', expect.any(Function));
    });

    test('should register disconnect handler', () => {
      WebSocketService.initialize(mockServer);

      const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];

      connectionHandler(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });
});
