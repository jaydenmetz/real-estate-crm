# Project-83: Session Management Review

**Phase**: F | **Priority**: HIGH | **Status**: Not Started
**Est**: 6 hrs + 2 hrs = 8 hrs | **Deps**: Project-76 complete
**MILESTONE**: None

## 🎯 Goal
Review and harden session management including session configuration, secure cookies, session timeout, and session fixation prevention.

## 📋 Current → Target
**Now**: JWT-based authentication with refresh tokens; cookies set with httpOnly
**Target**: Hardened session management with secure cookies, session timeout, token rotation, session fixation prevention, and concurrent session limits
**Success Metric**: All cookies secure (httpOnly, secure, sameSite); session timeout enforced; token rotation working; zero session fixation vulnerabilities

## 📖 Context
Session management vulnerabilities allow attackers to hijack user sessions through session fixation, session hijacking, or stolen tokens. This project hardens the current JWT + refresh token implementation by ensuring secure cookie configuration, implementing session timeout, adding token rotation, preventing session fixation, and limiting concurrent sessions.

Key features: Secure cookie attributes (httpOnly, secure, sameSite), session timeout (15min access token, 7 day refresh token), token rotation on refresh, session fixation prevention, concurrent session limits (max 3 devices), and session invalidation on logout.

## ⚠️ Risk Assessment

### Technical Risks
- **Session Timeout Too Aggressive**: Users logged out frequently
- **Token Rotation Bugs**: Refresh failing after rotation
- **Cookie Issues**: SameSite breaking third-party integrations
- **Concurrent Session Limits**: Legitimate users blocked

### Business Risks
- **Session Hijacking**: Attackers stealing user sessions
- **Account Takeover**: Session fixation allowing unauthorized access
- **User Frustration**: Too frequent logouts damaging UX
- **Compliance Violations**: Insecure sessions failing audits

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-83-session-management-$(date +%Y%m%d)
git push origin pre-project-83-session-management-$(date +%Y%m%d)

# Backup users table (contains refresh tokens)
pg_dump $DATABASE_URL -t users -t refresh_tokens > backup-sessions-$(date +%Y%m%d).sql
```

### If Things Break
```bash
# If session management breaks authentication
# Rollback auth middleware
git checkout pre-project-83-session-management-YYYYMMDD -- backend/src/middleware/auth.middleware.js
git checkout pre-project-83-session-management-YYYYMMDD -- backend/src/controllers/auth.controller.js
git push origin main

# Or temporarily extend session timeout (emergency)
# JWT_EXPIRES_IN=24h
```

## ✅ Tasks

### Planning (1 hour)
- [ ] Review current session implementation (JWT + refresh tokens)
- [ ] Plan session timeout values (access: 15min, refresh: 7 days)
- [ ] Design token rotation strategy
- [ ] Plan concurrent session limits (max 3 devices)
- [ ] Document session fixation prevention

### Implementation (5 hours)
- [ ] **Secure Cookies** (1 hour):
  - [ ] Set httpOnly flag (prevent JavaScript access)
  - [ ] Set secure flag (HTTPS only)
  - [ ] Set sameSite flag (CSRF protection)
  - [ ] Set appropriate domain and path
  - [ ] Implement cookie signing (HMAC)

- [ ] **Session Timeout** (1 hour):
  - [ ] Implement access token expiration (15 minutes)
  - [ ] Implement refresh token expiration (7 days)
  - [ ] Add absolute session timeout (30 days max)
  - [ ] Implement idle timeout tracking

- [ ] **Token Rotation** (1.5 hours):
  - [ ] Implement refresh token rotation (new token on refresh)
  - [ ] Invalidate old refresh token after rotation
  - [ ] Add grace period for race conditions (5 seconds)
  - [ ] Store refresh token family ID (detect token reuse)

- [ ] **Session Fixation Prevention** (1 hour):
  - [ ] Regenerate session ID after login
  - [ ] Invalidate old tokens on password change
  - [ ] Implement token binding (user agent + IP)
  - [ ] Add CSRF token for state-changing operations

- [ ] **Concurrent Session Limits** (0.5 hours):
  - [ ] Track active sessions per user
  - [ ] Implement max 3 concurrent sessions
  - [ ] Add "logout all devices" functionality
  - [ ] Show active sessions in settings

### Testing (1.5 hours)
- [ ] Test secure cookie attributes
- [ ] Test session timeout (access token expires)
- [ ] Test token rotation on refresh
- [ ] Test session fixation prevention
- [ ] Test concurrent session limits
- [ ] Test "logout all devices"

### Documentation (0.5 hours)
- [ ] Document session management architecture
- [ ] Add session security to SECURITY_REFERENCE.md
- [ ] Create session troubleshooting guide
- [ ] Document cookie configuration

## 🧪 Verification Tests

### Test 1: Secure Cookie Attributes
```bash
# Login and check cookie attributes
curl -I -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
# Expected: Set-Cookie header with:
# - HttpOnly
# - Secure
# - SameSite=Strict
# - Domain=.jaydenmetz.com
# - Path=/
```

### Test 2: Session Timeout
```bash
# Get access token (expires in 15 minutes)
TOKEN="<JWT token>"

# Wait 16 minutes (or modify JWT exp to past time)
sleep 960

# Try to access protected endpoint
curl -X GET https://api.jaydenmetz.com/v1/escrows \
  -H "Authorization: Bearer $TOKEN"
# Expected: 401 Unauthorized (token expired)

# Refresh token should still work (7 day expiration)
curl -X POST https://api.jaydenmetz.com/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh token>"}'
# Expected: 200 OK, new access token + new refresh token (rotation)
```

### Test 3: Token Rotation
```bash
REFRESH_TOKEN="<refresh token>"

# First refresh
curl -X POST https://api.jaydenmetz.com/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
# Expected: 200 OK, new access token + new refresh token

# Try to use old refresh token again
curl -X POST https://api.jaydenmetz.com/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
# Expected: 401 Unauthorized (old token invalidated)
```

## 📝 Implementation Notes

### Secure Cookie Configuration
```javascript
const cookieOptions = {
  httpOnly: true, // Prevent JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  sameSite: 'strict', // CSRF protection
  domain: process.env.COOKIE_DOMAIN || '.jaydenmetz.com',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (refresh token)
  signed: true // Sign cookie with secret
};

res.cookie('refreshToken', refreshToken, cookieOptions);
```

### JWT Configuration
```javascript
const jwt = require('jsonwebtoken');

// Access token (short-lived)
const accessToken = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' } // 15 minutes
);

// Refresh token (long-lived)
const refreshToken = jwt.sign(
  { id: user.id, tokenFamily: uuidv4() },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' } // 7 days
);
```

### Token Rotation Implementation
```javascript
async function refreshAccessToken(oldRefreshToken) {
  try {
    // Verify old refresh token
    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if token already used (token reuse detection)
    const existingToken = await RefreshToken.findOne({
      token: oldRefreshToken,
      used: true
    });

    if (existingToken) {
      // Token reuse detected! Invalidate entire token family (security breach)
      await RefreshToken.invalidateFamily(decoded.tokenFamily);
      throw new Error('Token reuse detected. All sessions invalidated.');
    }

    // Mark old token as used
    await RefreshToken.markAsUsed(oldRefreshToken);

    // Generate new tokens
    const user = await User.findById(decoded.id);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, decoded.tokenFamily);

    // Store new refresh token
    await RefreshToken.create({
      user_id: user.id,
      token: newRefreshToken,
      token_family: decoded.tokenFamily,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}
```

### Session Fixation Prevention
```javascript
// Regenerate session on login
async function login(req, res) {
  const { email, password } = req.body;

  // Authenticate user
  const user = await User.authenticate(email, password);

  // Invalidate any existing sessions (prevent fixation)
  await RefreshToken.deleteMany({ user_id: user.id });

  // Generate new tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set secure cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.json({ success: true, accessToken });
}
```

### Concurrent Session Limits
```javascript
async function limitConcurrentSessions(userId, maxSessions = 3) {
  // Get all active sessions
  const activeSessions = await RefreshToken.find({
    user_id: userId,
    expires_at: { $gt: new Date() }
  }).sort({ created_at: -1 });

  // If exceeds limit, delete oldest sessions
  if (activeSessions.length >= maxSessions) {
    const sessionsToDelete = activeSessions.slice(maxSessions - 1);
    await RefreshToken.deleteMany({
      _id: { $in: sessionsToDelete.map(s => s._id) }
    });
  }
}
```

### Logout All Devices
```javascript
async function logoutAllDevices(req, res) {
  const userId = req.user.id;

  // Invalidate all refresh tokens
  await RefreshToken.deleteMany({ user_id: userId });

  res.json({ success: true, message: 'Logged out from all devices' });
}
```

### Active Sessions Display
```javascript
async function getActiveSessions(req, res) {
  const userId = req.user.id;

  const sessions = await RefreshToken.find({
    user_id: userId,
    expires_at: { $gt: new Date() }
  }).select('created_at user_agent ip_address');

  res.json({
    success: true,
    sessions: sessions.map(s => ({
      created_at: s.created_at,
      device: parseUserAgent(s.user_agent),
      ip_address: s.ip_address,
      current: s.token === req.cookies.refreshToken
    }))
  });
}
```

### Refresh Tokens Table Schema
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  token_family UUID NOT NULL, -- For detecting token reuse
  used BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_family ON refresh_tokens(token_family);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store JWT secrets in .env (JWT_SECRET, JWT_REFRESH_SECRET)
- [ ] Use existing auth patterns
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-83**:
- Session management tests: Cookie attributes, timeout, rotation
- Token reuse tests: Detect and invalidate token families
- Concurrent session tests: Verify max 3 sessions enforced
- Fixation tests: Verify session regeneration on login

## 🔗 Dependencies

### Depends On
- Project-76 (Security Audit Complete - session management is security control)

### Blocks
- Project-84 (Encryption Implementation - secure session storage)

### Parallel Work
- Can work alongside Projects 77-82

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-76 complete (security audit done)
- ✅ JWT authentication already implemented
- ✅ Refresh token mechanism in place
- ✅ Production uses HTTPS (required for secure cookies)

### Should Skip If:
- ❌ No user authentication (stateless API)
- ❌ OAuth-only authentication (session managed by provider)

### Optimal Timing:
- After security audit (Project-76)
- Before public beta launch
- Before compliance audits (SOC2, etc.)

## ✅ Success Criteria
- [ ] Secure cookie attributes set (httpOnly, secure, sameSite)
- [ ] Session timeout enforced (15min access, 7 day refresh)
- [ ] Token rotation implemented
- [ ] Old refresh tokens invalidated
- [ ] Token reuse detection working
- [ ] Session fixation prevention implemented
- [ ] Concurrent session limits enforced (max 3)
- [ ] "Logout all devices" functionality working
- [ ] Active sessions display implemented
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Secure cookies tested on staging
- [ ] Session timeout tested on staging
- [ ] Token rotation tested on staging
- [ ] HTTPS enabled on production (required)
- [ ] Cookie domain configured correctly

### Post-Deployment Verification
- [ ] Test login and verify cookie attributes
- [ ] Test session timeout
- [ ] Test token rotation
- [ ] Test concurrent session limits
- [ ] Monitor token refresh errors (<1%)

### Rollback Triggers
- Token rotation failing consistently (>5%)
- Users logged out too frequently (complaints)
- Concurrent session limits blocking legitimate users
- Cookie issues breaking authentication

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Secure cookies implemented
- [ ] Session timeout enforced
- [ ] Token rotation working
- [ ] Token reuse detection active
- [ ] Session fixation prevention implemented
- [ ] Concurrent session limits enforced
- [ ] "Logout all devices" working
- [ ] Active sessions display implemented
- [ ] Documentation complete

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
