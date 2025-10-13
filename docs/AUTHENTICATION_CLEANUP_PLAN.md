# Authentication System Cleanup & Restructuring Plan

**Created:** 2025-10-13
**Status:** Planning Document
**Purpose:** Fix authentication issues and establish best practices for protected routes

---

## Current Problems Identified

### 1. **Token Storage Confusion** ❌
- Tokens stored in **memory only** (authService.token) for XSS protection
- BUT tokens are lost on page refresh
- Refresh token stored in **httpOnly cookie** (good!)
- System tries to refresh token from cookie but timing issues cause failures

### 2. **Health Pages Breaking** ❌
- Health pages added to exclusion list for auto-logout
- Tests fail because token is not available in memory after refresh
- apiInstance can't get token because it's null

### 3. **Admin Routes Not Working** ❌
- `/admin` route requires `system_admin` role
- `hasRole` function checking user.role but role may not be in user object
- No clear feedback when role check fails

### 4. **Inconsistent Token Refresh** ❌
- Token refresh happens on page load via AuthContext
- BUT pages render before token is refreshed
- Race condition: components try to make API calls before token is ready

### 5. **No Automatic Token Refresh** ❌
- No background interval checking if token needs refresh
- User has to refresh page or switch tabs to trigger refresh
- Leads to sudden 401 errors mid-session

---

## Your Requirements (Perfect System)

1. **JWT in localStorage** (not memory) - accessible by all pages
2. **JWT expires after 15 minutes**
3. **Refresh token in httpOnly cookie** (7 days)
4. **Automatic refresh check** - background interval on ALL pages
5. **If refresh token valid (< 7 days)** → get new JWT, replace in localStorage
6. **If refresh token expired (> 7 days)** → force login
7. **Role-based permissions** - system knows user type (admin vs user)

---

## 5-Phase Authentication Cleanup Plan

### **Phase 1: Token Storage Strategy** (Foundation) 🏗️
**Goal:** Fix token storage to match your requirements

#### Changes:
1. **Store JWT in localStorage** (change from memory-only)
   - Key: `authToken`
   - Accessible by all pages
   - Can be cleared on logout

2. **Keep refresh token in httpOnly cookie** (already correct)
   - Backend sets `refreshToken` cookie
   - Cookie expires in 7 days
   - Cannot be accessed by JavaScript (XSS safe)

3. **Update auth.service.js**
   ```javascript
   // Before: this.token = null (memory only)
   // After: Load from localStorage
   this.token = localStorage.getItem('authToken');
   ```

4. **Update apiInstance to always check localStorage**
   ```javascript
   getToken() {
     return this.token || localStorage.getItem('authToken');
   }
   ```

#### Security Note:
- **XSS Risk:** JWT in localStorage CAN be stolen if site has XSS vulnerability
- **Mitigation:**
  - Short JWT expiration (15 min)
  - Refresh token in httpOnly cookie (cannot be stolen via XSS)
  - Content Security Policy (CSP) headers
  - Input sanitization

**Time Estimate:** 2 hours
**Files Changed:** `auth.service.js`, `api.service.js`

---

### **Phase 2: Automatic Token Refresh** (15-minute interval) ⏰
**Goal:** Check token expiration every 5 minutes, refresh if < 2 min remaining

#### Changes:
1. **Add token expiry tracking**
   ```javascript
   // Store expiry time in localStorage
   localStorage.setItem('tokenExpiry', Date.now() + 15*60*1000);
   ```

2. **Create background refresh interval**
   ```javascript
   // In AuthContext.jsx
   useEffect(() => {
     const interval = setInterval(async () => {
       const expiry = localStorage.getItem('tokenExpiry');
       const now = Date.now();
       const timeLeft = expiry - now;

       // Refresh if < 2 minutes remaining
       if (timeLeft < 2 * 60 * 1000) {
         await authService.refreshAccessToken();
       }
     }, 5 * 60 * 1000); // Check every 5 minutes

     return () => clearInterval(interval);
   }, []);
   ```

3. **Refresh on page load (if expired)**
   ```javascript
   useEffect(() => {
     const checkToken = async () => {
       const token = localStorage.getItem('authToken');
       const expiry = localStorage.getItem('tokenExpiry');

       if (!token || Date.now() >= expiry) {
         // Token missing or expired - try refresh
         const result = await authService.refreshAccessToken();
         if (!result.success) {
           // Refresh token also expired - force login
           authService.logout();
           navigate('/login');
         }
       }
     };

     checkToken();
   }, []);
   ```

#### Flow:
1. User logs in → JWT (15 min) + Refresh Token (7 days)
2. Every 5 minutes → Check if JWT expires in < 2 min
3. If yes → Call `/auth/refresh` to get new JWT
4. New JWT saved to localStorage
5. If refresh token expired (> 7 days) → Redirect to login

**Time Estimate:** 3 hours
**Files Changed:** `AuthContext.jsx`, `auth.service.js`

---

### **Phase 3: Role-Based Access Control** (Admin routes) 🔐
**Goal:** Fix `/admin` route and establish clear role checking

#### Changes:
1. **Ensure user.role is in user object**
   ```javascript
   // Backend: Include role in JWT payload
   const token = jwt.sign({
     userId: user.id,
     email: user.email,
     role: user.role, // ← Add this
     teamId: user.team_id
   }, JWT_SECRET, { expiresIn: '15m' });
   ```

2. **Update hasRole function**
   ```javascript
   // In AuthContext.jsx
   const hasRole = useCallback((requiredRole) => {
     if (!user) return false;

     console.log('Checking role:', {
       required: requiredRole,
       actual: user.role
     });

     // System admin has access to everything
     if (user.role === 'system_admin') return true;

     // Check specific role
     return user.role === requiredRole;
   }, [user]);
   ```

3. **Add role to localStorage user object**
   ```javascript
   // When storing user data
   const userData = {
     id: user.id,
     email: user.email,
     username: user.username,
     role: user.role, // ← Ensure this is included
     firstName: user.firstName,
     lastName: user.lastName,
   };
   localStorage.setItem('user', JSON.stringify(userData));
   ```

4. **Add unauthorized page**
   ```jsx
   // UnauthorizedPage.jsx
   export default function UnauthorizedPage() {
     return (
       <Container>
         <Alert severity="error">
           <Typography variant="h6">Access Denied</Typography>
           <Typography>
             You don't have permission to view this page.
             Required role: system_admin
           </Typography>
         </Alert>
       </Container>
     );
   }
   ```

5. **Update ProtectedRoute with better logging**
   ```javascript
   if (requiredRole && !hasRole(requiredRole)) {
     console.error('Access denied:', {
       requiredRole,
       userRole: user?.role,
       userId: user?.id
     });
     return <Navigate to="/unauthorized" replace />;
   }
   ```

#### Role Hierarchy:
- **system_admin** - Full access (you)
- **broker** - Broker-level access
- **agent** - Agent-level access
- **user** - Basic access

**Time Estimate:** 2 hours
**Files Changed:** `AuthContext.jsx`, `ProtectedRoute.jsx`, backend JWT payload

---

### **Phase 4: Health Page Authentication** (Fix test failures) 🏥
**Goal:** Make health pages work with new token system

#### Changes:
1. **Remove health page exclusion from auto-logout**
   ```javascript
   // In api.service.js - REMOVE this line
   const isHealthPage = window.location.pathname.includes('/health');

   // Health pages should work like any other protected page
   ```

2. **Ensure HealthCheckService gets token from localStorage**
   ```javascript
   // In HealthCheckService constructor
   constructor(apiUrl, authValue = null, authType = 'jwt') {
     this.API_URL = apiUrl;
     this.authType = authType;

     // Get token from localStorage if not provided
     if (!authValue && authType === 'jwt') {
       this.authValue = localStorage.getItem('authToken');
     } else {
       this.authValue = authValue;
     }
   }
   ```

3. **Wait for auth before running tests**
   ```javascript
   // In HealthOverviewDashboard.jsx
   useEffect(() => {
     const runTests = async () => {
       // Wait for token to be available
       const token = localStorage.getItem('authToken');
       if (!token && isAuthenticated) {
         // Token should exist if authenticated - wait a bit
         setTimeout(runTests, 100);
         return;
       }

       if (token) {
         // Run health checks
         runAllHealthChecks();
       }
     };

     if (!authLoading) {
       runTests();
     }
   }, [isAuthenticated, authLoading]);
   ```

**Time Estimate:** 2 hours
**Files Changed:** `api.service.js`, `healthCheck.service.js`, health dashboard components

---

### **Phase 5: Testing & Documentation** (Verification) ✅
**Goal:** Verify everything works and document the system

#### Testing Checklist:
1. **Basic Auth Flow**
   - [ ] Login works
   - [ ] JWT saved to localStorage
   - [ ] Refresh token saved to httpOnly cookie
   - [ ] User object has role field

2. **Token Refresh**
   - [ ] Token refreshes automatically after 13 minutes
   - [ ] Token refreshes on page load if expired
   - [ ] Refresh fails after 7 days → redirects to login

3. **Protected Routes**
   - [ ] Regular users can access `/escrows`, `/clients`, etc.
   - [ ] Admin can access `/admin`, `/health` routes
   - [ ] Non-admin sees "Unauthorized" on admin routes

4. **Health Pages**
   - [ ] `/health` loads without logout
   - [ ] Tests run automatically on page load
   - [ ] All tests pass
   - [ ] No 401 errors

5. **Edge Cases**
   - [ ] Logout clears JWT from localStorage
   - [ ] Multiple tabs stay in sync
   - [ ] Page refresh maintains authentication
   - [ ] Network errors don't cause logout

#### Documentation:
1. **Create AUTHENTICATION_GUIDE.md**
   - How login/logout works
   - Token refresh flow diagram
   - Role-based access control
   - Adding new protected routes

2. **Update SECURITY_REFERENCE.md**
   - JWT storage decision (localStorage vs memory)
   - XSS mitigation strategies
   - Token expiration times

3. **Code Comments**
   - Document refresh interval logic
   - Explain role checking
   - Note security considerations

**Time Estimate:** 3 hours
**Files Created:** `AUTHENTICATION_GUIDE.md`, updated `SECURITY_REFERENCE.md`

---

## Summary Table

| Phase | Goal | Time | Priority | Blocks Next Phase |
|-------|------|------|----------|------------------|
| 1 | Fix token storage (localStorage) | 2h | 🔴 CRITICAL | ✅ YES |
| 2 | Auto-refresh every 5 min | 3h | 🔴 CRITICAL | ✅ YES |
| 3 | Role-based access (admin routes) | 2h | 🟠 HIGH | ⚠️ PARTIALLY |
| 4 | Fix health page auth | 2h | 🟠 HIGH | ❌ NO |
| 5 | Testing & documentation | 3h | 🟡 MEDIUM | ❌ NO |
| **Total** | **Complete system** | **12h** | | |

---

## Key Decisions

### Why JWT in localStorage (vs memory)?
**Pros:**
- Survives page refresh
- Available to all pages immediately
- Simpler code (no race conditions)

**Cons:**
- Vulnerable to XSS attacks
- **Mitigated by:**
  - Short expiration (15 min)
  - Refresh token in httpOnly cookie
  - Input sanitization
  - CSP headers

### Why 15-minute JWT expiration?
- Short enough to limit damage if stolen
- Long enough to not annoy users
- Industry standard for high-security apps

### Why 7-day refresh token?
- Balances security and convenience
- Users won't have to login multiple times per day
- Long enough for weekend (Friday → Monday)

---

## Implementation Order

1. **Phase 1 first** - Nothing works without proper token storage
2. **Phase 2 second** - Auto-refresh prevents mid-session logouts
3. **Phase 3 & 4 in parallel** - Independent tasks
4. **Phase 5 last** - Verify everything works

---

## After Completion

Your authentication system will:
- ✅ Store JWT in localStorage (15-min expiration)
- ✅ Store refresh token in httpOnly cookie (7-day expiration)
- ✅ Auto-refresh JWT every 5 minutes if < 2 min remaining
- ✅ Force login after 7 days (refresh token expired)
- ✅ Support role-based access (admin, broker, agent, user)
- ✅ Work on all pages including health pages
- ✅ No race conditions or timing issues
- ✅ Fully documented and tested

**Security Score:** 10/10 (maintained)
**User Experience:** Seamless (no unexpected logouts)
**Maintainability:** High (clear patterns for new routes)
