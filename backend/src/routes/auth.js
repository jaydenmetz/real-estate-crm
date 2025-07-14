const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock user database - In production, this would be in PostgreSQL
const users = {
  jaydenmetz: {
    id: 'user_001',
    username: 'jaydenmetz',
    email: 'jayden@jaydenmetz.com',
    // Password: Password123!
    passwordHash: '$2a$10$Vf9HedqwlzydziZYG7zWxucAOUG306SayHp8K0WQKoUtAJALDRYWi',
    role: 'admin',
    apiKey: 'jm_live_k3y_' + Buffer.from('jaydenmetz:2025').toString('base64'),
    createdAt: new Date('2025-01-01'),
    preferences: {
      showDebugInfo: true,
      defaultDashboard: 'ai-agents',
      theme: 'light',
      emailNotifications: true,
      twoFactorEnabled: false,
      errorDisplay: 'detailed', // 'detailed' for admins, 'friendly' for regular users
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'en-US'
    },
    profile: {
      firstName: 'Jayden',
      lastName: 'Metz',
      company: 'Metz Real Estate',
      phone: '(858) 555-0100',
      licenseNumber: 'DRE#12345678',
      photo: null
    }
  }
};

// Session storage - In production, use Redis
const activeSessions = new Map();

// JWT secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '30d'; // Stay logged in for 30 days

// Middleware to verify JWT token or API key
const authenticateToken = (req, res, next) => {
  // Check for API key first
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  if (apiKey) {
    // Find user by API key
    const user = Object.values(users).find(u => u.apiKey === apiKey);
    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        authMethod: 'api_key'
      };
      return next();
    }
  }

  // Check for Bearer token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: { code: 'NO_AUTH', message: 'Access token or API key required' } 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } 
      });
    }

    // Check if session is still active (not required for API key auth)
    if (!activeSessions.has(user.sessionId)) {
      return res.status(403).json({ 
        success: false, 
        error: { code: 'SESSION_EXPIRED', message: 'Session expired, please login again' } 
      });
    }

    req.user = user;
    req.user.authMethod = 'jwt';
    next();
  });
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe = true } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Username and password required' }
      });
    }

    // Find user
    const user = users[username.toLowerCase()];
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' }
      });
    }

    // Generate session ID
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create JWT token
    const tokenData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId
    };

    const token = jwt.sign(
      tokenData, 
      JWT_SECRET, 
      { expiresIn: rememberMe ? JWT_EXPIRES_IN : '24h' }
    );

    // Store session
    activeSessions.set(sessionId, {
      userId: user.id,
      createdAt: new Date(),
      lastActivity: new Date(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    // Return user data without sensitive info
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      profile: user.profile,
      apiKey: user.apiKey // Include API key for backend access
    };

    res.json({
      success: true,
      data: {
        token,
        user: userData,
        expiresIn: rememberMe ? '30d' : '24h'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An error occurred during login' }
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, (req, res) => {
  try {
    // Remove session
    activeSessions.delete(req.user.sessionId);

    res.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An error occurred during logout' }
    });
  }
});

// Verify token endpoint (for checking if still logged in)
router.get('/verify', authenticateToken, (req, res) => {
  try {
    // Update last activity
    const session = activeSessions.get(req.user.sessionId);
    if (session) {
      session.lastActivity = new Date();
    }

    // Get fresh user data
    const user = users[req.user.username];
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      profile: user.profile
    };

    res.json({
      success: true,
      data: { user: userData }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An error occurred during verification' }
    });
  }
});

// Update preferences endpoint
router.put('/preferences', authenticateToken, (req, res) => {
  try {
    const user = users[req.user.username];
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    // Update preferences
    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    res.json({
      success: true,
      data: { preferences: user.preferences }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An error occurred updating preferences' }
    });
  }
});

// Update profile endpoint
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const user = users[req.user.username];
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    // Update profile
    user.profile = {
      ...user.profile,
      ...req.body
    };

    res.json({
      success: true,
      data: { profile: user.profile }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An error occurred updating profile' }
    });
  }
});

// Get all sessions for current user
router.get('/sessions', authenticateToken, (req, res) => {
  try {
    const userSessions = [];
    
    activeSessions.forEach((session, sessionId) => {
      if (session.userId === req.user.id) {
        userSessions.push({
          sessionId,
          ...session,
          current: sessionId === req.user.sessionId
        });
      }
    });

    res.json({
      success: true,
      data: { sessions: userSessions }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An error occurred fetching sessions' }
    });
  }
});

// Revoke a session
router.delete('/sessions/:sessionId', authenticateToken, (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' }
      });
    }

    activeSessions.delete(sessionId);

    res.json({
      success: true,
      data: { message: 'Session revoked successfully' }
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An error occurred revoking session' }
    });
  }
});

module.exports = { router, authenticateToken };