# JWT Cookie Implementation Guide

## Overview
This guide provides step-by-step instructions to enhance your authentication system by adding HttpOnly cookie support while maintaining backward compatibility with existing JWT header authentication and API keys.

## Current Authentication Methods
1. **JWT in Authorization Header** - Used by frontend app
2. **API Keys in X-API-Key Header** - Used for external integrations
3. **localStorage JWT** - Current browser storage (less secure)

## Goal: Add Cookie-Based JWT Authentication
- Implement HttpOnly cookies for web sessions (XSS protection)
- Maintain backward compatibility with existing auth methods
- Support both cookies and headers simultaneously

---

## Backend Implementation Steps

### Step 1: Install Required Dependencies
```bash
cd backend
npm install cookie-parser
npm install csrf  # For CSRF protection
npm install express-rate-limit  # Already installed, but verify
```

### Step 2: Update app.js to Support Cookies
```javascript
// backend/src/app.js
// Add after existing imports
const cookieParser = require('cookie-parser');
const csrf = require('csrf');

// Add after body parser middleware
app.use(cookieParser());

// Configure CORS to allow credentials
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://crm.jaydenmetz.com'
  ],
  credentials: true  // Allow cookies to be sent
}));
```

### Step 3: Update Auth Controller for Cookie Support
```javascript
// backend/src/controllers/auth.controller.js
// Modify the login method to set both cookie and return token

static async login(req, res) {
  try {
    // ... existing login logic ...

    // After generating token (around line 348)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    // Set HttpOnly cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Also return token in response for backward compatibility
    res.json({
      success: true,
      data: {
        user: { /* ... user data ... */ },
        token  // Still return token for non-cookie clients
      }
    });
  } catch (error) {
    // ... error handling ...
  }
}

// Add a proper logout method that clears the cookie
static async logout(req, res) {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}
```

### Step 4: Update Auth Middleware to Check Multiple Sources
```javascript
// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Priority order for token sources:
    // 1. Check Authorization header (for API/mobile clients)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Check cookie (for web browsers)
    if (!token && req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // 3. Check X-API-Key header (handled separately in apiKey.middleware.js)
    // This is already implemented in your apiKey.middleware.js

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Authentication required'
        }
      });
    }

    // Verify token
    const jwtSecret = '279fffb2e462a0f2d8b41137be7452c4746f99f2ff3dd0aeafb22f2e799c1472';
    const decoded = jwt.verify(token, jwtSecret);

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      }
    });
  }
};

module.exports = authenticate;
```

### Step 5: Add CSRF Protection (Optional but Recommended)
```javascript
// backend/src/middleware/csrf.middleware.js
const Tokens = require('csrf');
const tokens = new Tokens();

// Store secrets in memory (use Redis in production)
const csrfSecrets = new Map();

const csrfProtection = (req, res, next) => {
  // Skip CSRF for API key authentication
  if (req.headers['x-api-key']) {
    return next();
  }

  // Skip for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Get or create secret for this session
  const sessionId = req.cookies.sessionId || generateSessionId();
  let secret = csrfSecrets.get(sessionId);

  if (!secret) {
    secret = tokens.secretSync();
    csrfSecrets.set(sessionId, secret);
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  // Verify token for POST/PUT/DELETE
  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!tokens.verify(secret, token)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_INVALID',
        message: 'Invalid CSRF token'
      }
    });
  }

  next();
};

// Endpoint to get CSRF token
const getCsrfToken = (req, res) => {
  const sessionId = req.cookies.sessionId || generateSessionId();
  let secret = csrfSecrets.get(sessionId);

  if (!secret) {
    secret = tokens.secretSync();
    csrfSecrets.set(sessionId, secret);
  }

  const token = tokens.create(secret);

  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({
    success: true,
    data: { csrfToken: token }
  });
};

module.exports = { csrfProtection, getCsrfToken };
```

---

## Frontend Implementation Steps

### Step 1: Update API Service for Cookie Support
```javascript
// frontend/src/services/api.service.js

class APIService {
  constructor(baseURL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com') {
    this.baseURL = baseURL.endsWith('/v1') ? baseURL : `${baseURL}/v1`;
    this.csrfToken = null;
  }

  // Add method to get CSRF token
  async getCsrfToken() {
    if (!this.csrfToken) {
      const response = await fetch(`${this.baseURL}/auth/csrf-token`, {
        credentials: 'include'  // Include cookies
      });
      const data = await response.json();
      this.csrfToken = data.data.csrfToken;
    }
    return this.csrfToken;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Ensure CSRF token for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
      await this.getCsrfToken();
    }

    const config = {
      ...options,
      credentials: 'include',  // Always include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    };

    // Add CSRF token if we have one
    if (this.csrfToken) {
      config.headers['X-CSRF-Token'] = this.csrfToken;
    }

    // Only add Authorization header if we have a token in localStorage
    // (for backward compatibility)
    const token = localStorage.getItem('authToken') ||
                  localStorage.getItem('crm_auth_token') ||
                  localStorage.getItem('token');

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);

    // ... rest of error handling ...
  }
}
```

### Step 2: Update Login Component
```javascript
// frontend/src/components/Login.jsx or wherever login is handled

const handleLogin = async (credentials) => {
  try {
    const response = await fetch('/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // Important: include cookies
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (data.success) {
      // Cookie is automatically set by the browser
      // Optionally store token in localStorage for backward compatibility
      if (data.data.token) {
        localStorage.setItem('authToken', data.data.token);
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Step 3: Update Logout Functionality
```javascript
// frontend/src/components/Header.jsx or wherever logout is handled

const handleLogout = async () => {
  try {
    await fetch('/v1/auth/logout', {
      method: 'POST',
      credentials: 'include'  // Include cookies to clear them
    });

    // Clear localStorage tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('crm_auth_token');
    localStorage.removeItem('token');

    // Redirect to login
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
    // Still clear local storage and redirect
    localStorage.clear();
    window.location.href = '/login';
  }
};
```

---

## Database Migrations (Optional Improvements)

### Add Session Tracking Table (Optional)
```sql
-- migrations/add_user_sessions.sql
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(256) NOT NULL,  -- Store SHA-256 hash of token
  device_info TEXT,
  ip_address INET,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,  -- For manual session revocation
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_sessions_user_id (user_id),
  INDEX idx_user_sessions_expires_at (expires_at),
  INDEX idx_user_sessions_token_hash (token_hash)
);

-- Add refresh tokens table for better security
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(256) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,  -- Mark as used when refreshed
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_refresh_tokens_user_id (user_id),
  INDEX idx_refresh_tokens_token_hash (token_hash)
);
```

---

## Security Best Practices

### 1. Environment Variables
```bash
# .env file
JWT_SECRET=your-secure-random-secret-here
JWT_EXPIRES_IN=30d
REFRESH_TOKEN_EXPIRES_IN=90d
COOKIE_DOMAIN=.jaydenmetz.com
NODE_ENV=production
```

### 2. Token Rotation Strategy
- **Access Token**: 15 minutes (short-lived)
- **Refresh Token**: 90 days (long-lived)
- **API Keys**: No expiration or custom expiration

### 3. Security Headers
```javascript
// backend/src/app.js
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## Testing Checklist

### Backend Tests
```bash
# Test cookie authentication
curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@jaydenmetz.com", "password": "AdminPassword123!"}' \
  -c cookies.txt  # Save cookies

# Test authenticated request with cookie
curl https://api.jaydenmetz.com/v1/escrows \
  -b cookies.txt  # Send cookies

# Test API key authentication (unchanged)
curl https://api.jaydenmetz.com/v1/escrows \
  -H "X-API-Key: your-64-char-api-key"

# Test JWT header authentication (backward compatibility)
curl https://api.jaydenmetz.com/v1/escrows \
  -H "Authorization: Bearer your-jwt-token"
```

### Frontend Tests
1. **Login Flow**
   - Verify cookie is set (check DevTools > Application > Cookies)
   - Verify requests include cookie automatically
   - Test CSRF token inclusion

2. **Logout Flow**
   - Verify cookie is cleared
   - Verify localStorage is cleared
   - Verify redirect to login

3. **API Key Testing**
   - Verify API keys still work via X-API-Key header
   - Test health dashboard with both auth methods

4. **Session Persistence**
   - Close browser and reopen
   - Verify still logged in (cookie persists)
   - Test 30-day expiration

---

## Rollout Strategy

### Phase 1: Backend Support (No Breaking Changes)
1. Add cookie support to backend
2. Keep returning JWT in response body
3. Support both cookie and header authentication
4. Deploy and test with existing frontend

### Phase 2: Frontend Migration
1. Update API service to include credentials
2. Add CSRF token support
3. Test extensively on staging
4. Deploy with feature flag if needed

### Phase 3: Deprecate localStorage (Optional)
1. After stable cookie implementation
2. Remove localStorage token storage
3. Update documentation
4. Monitor for issues

---

## Troubleshooting

### Common Issues and Solutions

1. **Cookies not being set**
   - Check `sameSite` and `secure` settings
   - Verify CORS `credentials: true`
   - Ensure HTTPS in production

2. **CSRF token errors**
   - Verify token is being fetched before POST requests
   - Check token is included in headers
   - Ensure session cookie is present

3. **Authentication failing**
   - Check cookie is being sent (Network tab)
   - Verify middleware checks cookie
   - Test with curl to isolate frontend issues

4. **Cross-domain issues**
   - Set proper CORS origins
   - Configure cookie domain for subdomains
   - Use proxy in development if needed

---

## Rollback Plan

If issues arise, you can quickly rollback:

1. **Backend**: Remove cookie-setting code, keep header auth
2. **Frontend**: Remove `credentials: 'include'`
3. **No data migration needed**: Sessions are stateless

The beauty of this implementation is it's **fully backward compatible**. You can roll it out gradually without breaking existing clients.

---

## Final Notes

- **API Keys remain unchanged** - They continue to work via X-API-Key header
- **JWT in headers still works** - Mobile apps and API clients unaffected
- **Gradual migration possible** - No need for a big-bang deployment
- **Enhanced security** - XSS protection with HttpOnly cookies
- **Better UX** - True logout capability, session management

This implementation gives you the best of all worlds: secure cookie-based sessions for web browsers, JWT headers for API/mobile clients, and API keys for external integrations.