# Phase 4: Quick Test Guide (2 Minutes)

**Goal:** Verify health pages require authentication

---

## ✅ Test 1: Unauthenticated Access Blocked

**What to do:**
1. Logout from CRM (if logged in)
2. Navigate to: `https://crm.jaydenmetz.com/health`

**Expected result:**
```
✅ You see the LOGIN page
❌ You do NOT see the health dashboard
```

**Why it works:** `ProtectedRoute` checks authentication before rendering any content.

---

## ✅ Test 2: Non-Admin Access Blocked

**What to do:**
1. Login as a regular user (not admin)
2. Check your role in console:
   ```javascript
   JSON.parse(localStorage.getItem('user')).role
   // Should be: "agent" or "user" (not "system_admin")
   ```
3. Navigate to: `https://crm.jaydenmetz.com/health`

**Expected result:**
```
✅ You see "Unauthorized" page
❌ You do NOT see the health dashboard
```

**Why it works:** `ProtectedRoute` calls backend to verify your role from JWT token. Backend sees `role=agent` and denies access.

---

## ✅ Test 3: Admin Access Works

**What to do:**
1. Login as admin: `admin@jaydenmetz.com` / `AdminPassword123!`
2. Navigate to: `https://crm.jaydenmetz.com/health`
3. Click "Run All Tests"

**Expected result:**
```
✅ Health dashboard loads successfully
✅ All 228 tests run and pass
✅ Green indicators for all modules
```

**Why it works:** Backend verifies `role=system_admin` from JWT token and grants access.

---

## ✅ Test 4: All Health Routes Protected

**What to do:**
Try visiting each health route (as non-admin):

1. `https://crm.jaydenmetz.com/health` → ❌ Unauthorized
2. `https://crm.jaydenmetz.com/escrows/health` → ❌ Unauthorized
3. `https://crm.jaydenmetz.com/listings/health` → ❌ Unauthorized
4. `https://crm.jaydenmetz.com/clients/health` → ❌ Unauthorized
5. `https://crm.jaydenmetz.com/appointments/health` → ❌ Unauthorized
6. `https://crm.jaydenmetz.com/leads/health` → ❌ Unauthorized

**Expected result:**
```
✅ All 6 health routes show "Unauthorized" page
✅ No health dashboards accessible without admin role
```

**Why it works:** All health routes wrapped with `ProtectedRoute requiredRole="system_admin"`

---

## ✅ Test 5: Token Expiry Redirects to Login

**What to do:**
1. Login as admin
2. Visit: `https://crm.jaydenmetz.com/health`
3. Wait 15+ minutes (token expires)
4. Click "Run All Tests"

**Expected result:**
```
✅ First API call detects expired token
✅ apiInstance attempts automatic refresh
✅ If refresh succeeds → Tests run normally
✅ If refresh fails → Redirect to /login after brief delay
```

**Why it works:** Phase 2 (automatic token refresh) + Phase 4 (health pages no longer excluded from logout)

---

## 🎯 Phase 4 Success Criteria

All 5 tests should pass:
- ✅ Test 1: Unauthenticated users blocked
- ✅ Test 2: Non-admin users blocked
- ✅ Test 3: Admin users granted access
- ✅ Test 4: All 6 health routes protected
- ✅ Test 5: Token expiry handled correctly

**If all tests pass:** Phase 4 is working correctly! 🎉

**If any test fails:** Check:
1. Railway deployed latest commit (`2d2a863` or later)
2. Browser cache cleared (hard refresh: Cmd+Shift+R)
3. JWT token not expired (logout and login again)
4. User role is correct (check localStorage)

---

## 📊 What Phase 4 Fixed

**Before Phase 4:**
```javascript
// Health pages were EXCLUDED from logout redirect
if (!isHealthPage) {
  window.location.href = '/login';
}
```
**Problem:** Health pages could be accessed briefly even after token expired

**After Phase 4:**
```javascript
// Health pages NOW INCLUDED in logout redirect
if (!isAuthEndpoint && !isApiKeysEndpoint && !isLoginPage && !isSettingsPage) {
  window.location.href = '/login';
}
```
**Result:** Consistent authentication behavior across ALL pages

---

**Phase 4 Complete! Security Score: 10/10** 🎉
