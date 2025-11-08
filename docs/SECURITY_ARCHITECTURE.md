# Security Architecture - Role-Based Access Control

**Last Updated:** November 8, 2025

## ⚠️ CRITICAL SECURITY CONCERNS ADDRESSED

### Current Issue: User Role in LocalStorage

**Problem:**
- User role is stored in `localStorage` after login
- Can be manipulated via browser DevTools
- Frontend role checks can be bypassed

**Example Attack:**
```javascript
// User can open DevTools console and run:
localStorage.setItem('user', JSON.stringify({
  ...JSON.parse(localStorage.getItem('user')),
  role: ['system_admin']  // Elevate to admin
}));
location.reload();
```

---

## 🔒 Security Best Practices

### 1. **Frontend Role Checks = UI Convenience ONLY**

Frontend role checks should **NEVER** be considered security:
- ✅ Use for: Showing/hiding UI elements (buttons, menus, dashboards)
- ❌ Don't use for: Actual access control to sensitive data

**Current Implementation:**
```javascript
// This is OK for UI routing:
if (hasRole('system_admin')) {
  return <SystemAdminHomeDashboard />;
}

// But this is NOT security - user can manipulate localStorage
```

### 2. **Backend Enforcement = True Security**

Every API endpoint MUST verify role server-side:

```javascript
// Backend (Node.js/Express)
router.get('/admin/users', authenticate, requireRole('system_admin'), async (req, res) => {
  // req.user.role comes from decoded JWT (signed by server)
  // User CANNOT manipulate this
  const users = await User.findAll();
  res.json(users);
});
```

**Why This Works:**
- JWT is **cryptographically signed** by server
- User cannot forge or modify JWT without secret key
- Even if user changes localStorage, backend rejects invalid JWT

### 3. **How JWT Role Verification Works**

**Login Flow:**
```
1. User logs in with email/password
2. Backend verifies credentials in database
3. Backend queries user's role from database
4. Backend creates JWT with role embedded:
   {
     "id": "user-id",
     "email": "admin@example.com",
     "role": ["system_admin", "agent"],
     "iat": 1699564800,
     "exp": 1699651200
   }
5. Backend signs JWT with SECRET_KEY (only server knows)
6. Frontend stores JWT in localStorage
7. Frontend decodes JWT to show UI elements
```

**API Request Flow:**
```
1. Frontend sends request with JWT in header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. Backend verifies JWT signature with SECRET_KEY
3. If signature valid, backend trusts the role in JWT
4. Backend checks: Does role allow this action?
5. If yes, process request. If no, return 403 Forbidden
```

**Security Guarantee:**
- User can change localStorage all they want
- User **cannot** change the JWT role without server's secret key
- Backend always validates JWT before trusting role

---

## 🎯 Current Real Estate CRM Implementation

### Frontend (UI Layer)
**File:** `/frontend/src/components/dashboards/HomeDashboard.jsx`

```javascript
const hasRole = (roleName) => {
  if (!user?.role) return false;
  if (Array.isArray(user.role)) {
    return user.role.includes(roleName);
  }
  return user.role === roleName;
};

// UI routing only - NOT security
if (hasRole('system_admin')) {
  return <SystemAdminHomeDashboard />; // Shows admin UI
}
```

**Purpose:** Show appropriate dashboard (UI convenience)
**Security Level:** ❌ None (user can manipulate)

### Backend (Security Layer)
**File:** `/backend/src/middleware/auth.js`

```javascript
// JWT verification middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    // Verify JWT signature with SECRET_KEY
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Role comes from verified JWT, not user input
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Role enforcement middleware
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    // req.user.role was verified by authenticate middleware
    if (!req.user.role.includes(requiredRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

**Purpose:** True access control
**Security Level:** ✅ Cryptographically secure

---

## 🔐 Why This Approach is Best Practice

### ✅ Advantages

1. **Defense in Depth:**
   - Frontend checks provide smooth UX
   - Backend checks provide actual security
   - If user bypasses frontend, backend blocks them

2. **Stateless Authentication:**
   - No server-side session storage needed
   - JWT contains all needed info
   - Scales horizontally (multiple servers)

3. **Tamper-Proof:**
   - JWT signature uses HMAC-SHA256
   - Changing any byte invalidates signature
   - Only server with SECRET_KEY can sign

4. **Industry Standard:**
   - Used by Google, Facebook, GitHub
   - OAuth 2.0 and OpenID Connect use JWTs
   - Well-audited libraries available

### ❌ What NOT to Do

1. **Don't rely on localStorage for security:**
   ```javascript
   // BAD - can be manipulated
   if (localStorage.getItem('isAdmin') === 'true') {
     showAdminData();
   }
   ```

2. **Don't trust client-side data:**
   ```javascript
   // BAD - user can send any role
   fetch('/api/users', {
     body: JSON.stringify({ userRole: 'admin' })
   });
   ```

3. **Don't skip backend validation:**
   ```javascript
   // BAD - no role check
   router.get('/admin/users', async (req, res) => {
     res.json(await User.findAll()); // Anyone can access!
   });
   ```

---

## 🛡️ Additional Security Recommendations

### 1. **Implement Backend Role Checks Everywhere**

Audit every API endpoint:
```bash
# Check which endpoints need role protection
grep -r "router.get\|router.post\|router.put\|router.delete" backend/src/routes/
```

Add `requireRole` middleware:
```javascript
// Before:
router.get('/admin/users', authenticate, getUsers);

// After:
router.get('/admin/users', authenticate, requireRole('system_admin'), getUsers);
```

### 2. **Rotate JWT Secret Regularly**

```bash
# Generate new secret (do this monthly):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env file:
JWT_SECRET=new_secret_here

# This invalidates all existing JWTs (users must re-login)
```

### 3. **Use Short JWT Expiration**

```javascript
// backend/src/services/auth.service.js
const token = jwt.sign(
  { id, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' } // Short expiration
);
```

Use refresh tokens for long sessions:
```javascript
const refreshToken = jwt.sign(
  { id },
  process.env.REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

### 4. **Log Suspicious Activity**

```javascript
// backend/src/middleware/auth.js
if (!req.user.role.includes(requiredRole)) {
  // Log potential attack
  logger.warn('Unauthorized access attempt', {
    userId: req.user.id,
    requiredRole,
    actualRole: req.user.role,
    endpoint: req.path
  });

  return res.status(403).json({ error: 'Forbidden' });
}
```

---

## 📊 Security Checklist

### Frontend Security (UI)
- ✅ Role checks for UI routing only
- ✅ Handle role as array or string
- ✅ Never trust localStorage for sensitive operations
- ✅ Always send JWT with API requests

### Backend Security (Critical)
- ✅ Verify JWT signature on every request
- ✅ Check role from decoded JWT (not request body)
- ✅ Use `requireRole` middleware on protected endpoints
- ✅ Log unauthorized access attempts
- ✅ Rotate JWT secret regularly
- ✅ Use short token expiration + refresh tokens

### Database Security
- ✅ User roles stored in database (single source of truth)
- ✅ Never query roles from client input
- ✅ Audit role changes in audit_logs table

---

## 🚨 Current Status

**Frontend:** ✅ Fixed to handle array roles with priority
**Backend:** ⚠️ Needs audit - verify all admin endpoints use `requireRole('system_admin')`

**Next Steps:**
1. Audit all `/admin/*` endpoints for role checks
2. Add logging for failed authorization attempts
3. Implement refresh token rotation
4. Add rate limiting on sensitive endpoints

---

**Remember:** Frontend is for UX, Backend is for Security!
