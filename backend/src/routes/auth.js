const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// User storage - In production, this would be in PostgreSQL
const users = {};

// Default preferences for new users
const defaultPreferences = {
  showDebugInfo: false,
  defaultDashboard: 'ai-agents',
  theme: 'light',
  emailNotifications: true,
  twoFactorEnabled: false,
  errorDisplay: 'friendly',
  timezone: 'America/Los_Angeles',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: 'en-US'
};

// Admin preferences
const adminPreferences = {
  ...defaultPreferences,
  showDebugInfo: true,
  errorDisplay: 'detailed'
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

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, company, phone } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Username, email, and password are required' }
      });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_USERNAME', message: 'Username must be 3-20 characters, alphanumeric and underscore only' }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_EMAIL', message: 'Invalid email format' }
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' }
      });
    }

    // Check if username already exists
    if (users[username.toLowerCase()]) {
      return res.status(409).json({
        success: false,
        error: { code: 'USERNAME_EXISTS', message: 'Username already taken' }
      });
    }

    // Check if email already exists
    const emailExists = Object.values(users).some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'Email already registered' }
      });
    }

    // You get admin role with all privileges
    const role = 'admin';
    const preferences = adminPreferences;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate user ID and API key
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const apiKey = `${username.toLowerCase().substring(0, 2)}_live_k3y_${Buffer.from(`${username}:${Date.now()}`).toString('base64')}`;

    // Create user object
    const newUser = {
      id: userId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      role,
      apiKey,
      createdAt: new Date(),
      preferences,
      profile: {
        firstName: firstName || '',
        lastName: lastName || '',
        company: company || '',
        phone: phone || '',
        licenseNumber: '',
        photo: null
      }
    };

    // Store user
    users[username.toLowerCase()] = newUser;

    // Generate session and token
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tokenData = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      sessionId
    };

    const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Store session
    activeSessions.set(sessionId, {
      userId: newUser.id,
      createdAt: new Date(),
      lastActivity: new Date(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    // Return user data without sensitive info
    const userData = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      preferences: newUser.preferences,
      profile: newUser.profile,
      apiKey: newUser.apiKey
    };

    res.json({
      success: true,
      data: {
        token,
        user: userData,
        message: 'Welcome! Your admin account has been created.'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An error occurred during registration' }
    });
  }
});

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