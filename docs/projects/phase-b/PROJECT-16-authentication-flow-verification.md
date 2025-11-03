# Project-16: Authentication Flow Verification

**Phase**: B | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 8 hrs + 2.5 hrs = 10.5 hrs | **Deps**: Phase A Complete (Projects 1-15)

## 🎯 Goal
Verify JWT + API Key authentication works flawlessly across all endpoints.

## 📋 Current → Target
**Now**: Authentication system exists but comprehensive flow verification needed
**Target**: 100% confidence in login, logout, token refresh, API key management, session handling
**Success Metric**: All authentication flows pass automated tests, zero auth-related errors in production

## 📖 Context
Authentication is the critical foundation of the entire CRM system. This project ensures that both JWT token-based authentication (for user sessions) and API key authentication (for integrations) work perfectly across all scenarios. We need to verify login flows, token refresh mechanisms, logout procedures, session expiration handling, and API key lifecycle management. Any weakness in authentication compromises the entire system's security and usability.

The dual authentication system (JWT + API Keys) is a unique feature that requires thorough testing. JWT tokens handle user sessions with automatic refresh, while API keys provide secure access for external integrations. Both must work seamlessly without security gaps.

This verification includes testing edge cases like expired tokens, concurrent sessions, token refresh during active requests, API key revocation, and proper cleanup on logout. Success means users never encounter authentication errors and admins have full visibility into auth events through security event logging.

## ⚠️ Risk Assessment

### Technical Risks
- **Token Refresh Race Conditions**: Multiple concurrent requests triggering simultaneous token refreshes
- **Session Persistence Issues**: LocalStorage/cookies not syncing properly across tabs
- **API Key Scope Bypass**: Users accessing endpoints beyond their API key permissions
- **Token Expiration Edge Cases**: Requests failing during token transition periods

### Business Risks
- **User Login Failures**: Authentication bugs blocking access to CRM (HIGH IMPACT)
- **Security Vulnerabilities**: Auth bypass allowing unauthorized data access (CRITICAL)
- **Integration Breakage**: API key issues breaking third-party integrations
- **Lost Productivity**: Auth errors causing repeated logins, frustrated users

## 🔄 Rollback Plan

### Before Starting
```bash
# Create backup tag
git tag pre-project-16-auth-verify-$(date +%Y%m%d)
git push origin pre-project-16-auth-verify-$(date +%Y%m%d)

# Document current auth flow
curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jaydenmetz.com","password":"AdminPassword123!"}' \
  > baseline-auth-flow.json
```

### Backup Methods
- **Git Tag**: `pre-project-16-auth-verify-YYYYMMDD`
- **Auth Config Backup**: Copy current middleware/auth.js and services/auth.service.js
- **Test Suite Snapshot**: Save current test results (228/228 passing)
- **Security Events**: Export last 24 hours of auth events as baseline

### If Things Break
1. **Auth Middleware Not Working**:
   ```bash
   git checkout pre-project-16-auth-verify-YYYYMMDD -- backend/src/middleware/auth.js
   git commit -m "Rollback: Restore auth middleware"
   git push origin main
   ```

2. **Token Refresh Failing**:
   ```bash
   # Restore auth service
   git checkout pre-project-16-auth-verify-YYYYMMDD -- backend/src/services/auth.service.js
   # Clear all user sessions (force re-login)
   psql $DATABASE_URL -c "UPDATE users SET refresh_token = NULL"
   ```

3. **API Key Auth Broken**:
   ```bash
   # Rollback API key middleware
   git checkout pre-project-16-auth-verify-YYYYMMDD -- backend/src/middleware/apiKey.js
   git push origin main
   ```

### Recovery Checklist
- [ ] Verify /health endpoint accessible (no auth required)
- [ ] Test basic login with admin@jaydenmetz.com
- [ ] Confirm JWT token issued correctly
- [ ] Check API key authentication still works
- [ ] Verify 228/228 tests passing
- [ ] Monitor Railway logs for auth errors
- [ ] Check Sentry for authentication exceptions

## ✅ Tasks

### Planning (1 hour)
- [ ] Create backup tag: `git tag pre-project-16-auth-verify-$(date +%Y%m%d)`
- [ ] Review current authentication architecture (JWT + API Key dual system)
- [ ] Document all authentication endpoints and flows
- [ ] Identify edge cases and failure scenarios to test
- [ ] Review security event logging for auth events

### Implementation (5 hours)
- [ ] **JWT Token Flow** (2 hours):
  - [ ] Test login endpoint with valid credentials
  - [ ] Verify JWT token structure (header, payload, signature)
  - [ ] Test token refresh mechanism (before expiration)
  - [ ] Test expired token handling (401 response)
  - [ ] Verify refresh token rotation works
  - [ ] Test concurrent token refresh (race condition handling)

- [ ] **API Key Flow** (2 hours):
  - [ ] Test API key creation through /v1/api-keys endpoint
  - [ ] Verify API key authentication on protected endpoints
  - [ ] Test API key scope enforcement (read/write/delete permissions)
  - [ ] Test expired API key handling
  - [ ] Test revoked API key rejection
  - [ ] Verify API key usage tracking (last_used_at updates)

- [ ] **Session Management** (1 hour):
  - [ ] Test logout clears tokens properly
  - [ ] Verify session persistence across page refreshes
  - [ ] Test multi-tab session synchronization
  - [ ] Verify session expiration redirects to login
  - [ ] Test "remember me" functionality if implemented

### Testing (2 hours)
- [ ] **Automated Tests**:
  - [ ] Run existing 228 tests, all pass
  - [ ] Add auth flow integration tests (login → API call → logout)
  - [ ] Add token refresh tests (simulate expiration)
  - [ ] Add API key tests (create → use → revoke)

- [ ] **Manual Testing**:
  - [ ] Test login flow in browser (Chrome, Safari, Firefox)
  - [ ] Test API key auth in Postman
  - [ ] Test logout from multiple tabs simultaneously
  - [ ] Test token expiration during long session
  - [ ] Test API key scope restrictions

- [ ] **Security Testing**:
  - [ ] Verify expired tokens rejected
  - [ ] Verify invalid API keys rejected
  - [ ] Test rate limiting on login endpoint (30 attempts/15 min)
  - [ ] Test account lockout after 5 failed attempts
  - [ ] Verify security events logged for all auth actions

### Documentation (0.5 hours)
- [ ] Update API_REFERENCE.md with auth flow diagrams
- [ ] Document token refresh behavior
- [ ] Document API key scopes and permissions
- [ ] Add troubleshooting guide for common auth issues

## 🧪 Verification Tests

### Test 1: Login Flow Success
```bash
# Test: User can log in and receive valid JWT token
curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jaydenmetz.com",
    "password": "AdminPassword123!"
  }' -w "\n%{http_code}\n"

# Expected Output:
# {
#   "success": true,
#   "data": {
#     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": { "id": "...", "email": "admin@jaydenmetz.com", ... }
#   }
# }
# 200

# Verify token works on protected endpoint
TOKEN="<accessToken from above>"
curl -X GET https://api.jaydenmetz.com/v1/escrows \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n%{http_code}\n"

# Expected: 200, escrows data returned
```

### Test 2: Token Refresh Works
```bash
# Test: Refresh token exchanges for new access token
REFRESH_TOKEN="<refreshToken from login>"

curl -X POST https://api.jaydenmetz.com/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" \
  -w "\n%{http_code}\n"

# Expected Output:
# {
#   "success": true,
#   "data": {
#     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", (new token)
#     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (rotated)
#   }
# }
# 200
```

### Test 3: API Key Authentication
```bash
# Test: API key authenticates requests
# First, create API key via UI at https://crm.jaydenmetz.com/settings#api-keys
# Or via authenticated request:

TOKEN="<valid JWT token>"
curl -X POST https://api.jaydenmetz.com/v1/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "expiresInDays": 30,
    "scopes": {"all": ["read", "write"]}
  }' -w "\n%{http_code}\n"

# Expected: Returns API key (64-char hex string)
# Copy the key value

API_KEY="<key from above>"
curl -X GET https://api.jaydenmetz.com/v1/escrows \
  -H "X-API-Key: $API_KEY" \
  -w "\n%{http_code}\n"

# Expected: 200, escrows data returned (same as JWT auth)
```

## 📝 Implementation Notes

### JWT Token Structure
- **Access Token**: 15-minute expiration, contains user ID, email, role
- **Refresh Token**: 7-day expiration, used to get new access token
- **Token Rotation**: New refresh token issued on each refresh to prevent replay attacks

### API Key Features
- **No Prefix**: Clean 64-character hex strings (no "sk_live_" prefix)
- **Hashed Storage**: SHA-256 hashed in database
- **Scopes**: `{all: ['read', 'write', 'delete']}` or module-specific
- **Expiration**: Optional expiration date
- **Revocation**: Can be revoked instantly

### Security Event Logging
All auth actions should log to `security_events` table:
- `login_success`, `login_failed`
- `account_locked`, `lockout_attempt_while_locked`
- `token_refresh`
- `api_key_created`, `api_key_revoked`, `api_key_deleted`

### Common Issues
1. **Token Refresh Loop**: Frontend keeps refreshing token unnecessarily
   - Fix: Only refresh when 401 received, not preemptively
2. **API Key Not Hashing**: Keys stored in plaintext
   - Fix: Hash with SHA-256 before storing
3. **CORS Issues**: Auth headers not allowed
   - Fix: Add X-API-Key to Access-Control-Allow-Headers

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files (edit auth.js in place)
- [ ] Edit in place, archive if needed (backend/src/middleware/auth.js)
- [ ] Use apiInstance (never raw fetch) in frontend auth calls
- [ ] All tests use fire-and-forget logging (security events)
- [ ] Documentation in /docs folder

## 🧪 Test Coverage Impact
**Before Project-16**:
- Auth tests: Basic coverage (login, logout)
- Edge cases: Not tested
- Security events: Logged but not verified

**After Project-16**:
- Auth tests: Comprehensive (20+ test cases)
- Edge cases: All covered (expiration, refresh, concurrency)
- Security events: Verified logging for all auth actions
- Integration tests: End-to-end auth flows

**Test Files**:
- `backend/src/tests/auth.test.js` - JWT token tests
- `backend/src/tests/apiKeys.test.js` - API key tests
- `backend/src/tests/auth-flows.test.js` - NEW - End-to-end flows

## 🔗 Dependencies

### Depends On
- **Phase A Complete (Projects 1-15)**: Foundation must be solid before auth verification

### Blocks
- **Project-17: User Role System Validation**: Roles need working auth
- **Projects 18-22: All Module Checks**: Modules need verified auth
- **Project-25: WebSocket Real-Time Updates**: WebSocket auth needs verified JWT

### Parallel Work
- None (auth is critical path, must complete first)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Phase A complete (Projects 1-15 done)
- ✅ 228/228 tests passing
- ✅ Production stable with no auth-related errors
- ✅ Security event logging working

### Should Skip If:
- ❌ Active auth bugs in production (fix those first)
- ❌ Database connection issues (auth requires DB)
- ❌ Railway deployment broken

### Optimal Timing:
- **FIRST PROJECT in Phase B** (all other projects need working auth)
- Start immediately after Phase A completion
- Schedule 2 days of focused work (10.5 hours)
- Test thoroughly before moving to Project-17

## ✅ Success Criteria
- [ ] Login flow works perfectly (no errors)
- [ ] Token refresh automatic and invisible to users
- [ ] API key authentication works on all protected endpoints
- [ ] Logout clears all tokens and sessions
- [ ] Account lockout after 5 failed attempts
- [ ] Security events logged for all auth actions
- [ ] All edge cases tested (expired tokens, invalid keys, concurrent sessions)
- [ ] 228/228 tests passing + new auth tests
- [ ] Zero auth-related errors in production
- [ ] Documentation updated with auth flows

## 🏁 Completion Checklist
- [ ] All tasks complete (Planning, Implementation, Testing, Documentation)
- [ ] 228/228 tests passing + new auth tests passing
- [ ] Zero console errors in browser
- [ ] Deployed to production via Railway
- [ ] Manual testing complete (login, logout, token refresh, API keys)
- [ ] Security events verified in database
- [ ] Edge cases tested (expiration, revocation, concurrency)
- [ ] Documentation updated
- [ ] User verification: Admin can log in, use CRM, log out successfully
- [ ] Ready to start Project-17 (User Role System Validation)

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
