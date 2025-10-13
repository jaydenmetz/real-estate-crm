# Phase 3: Role-Based Access Control - Testing Checklist

**Goal:** Verify that `/admin` route and role checking work correctly after fixing `isAdmin()` function

**Estimated Time:** 5 minutes

---

## Test 1: Check User Role in localStorage (30 seconds)

**What to do:**
1. Login to CRM: https://crm.jaydenmetz.com/login
2. Login as: `admin@jaydenmetz.com` / `AdminPassword123!`
3. Open browser console (F12)
4. Type: `JSON.parse(localStorage.getItem('user')).role`

**Expected output:**
```
"system_admin"
```

**✅ PASS:** If you see `"system_admin"` (with quotes)
**❌ FAIL:** If you see `null`, `undefined`, or any other role

---

## Test 2: Access /admin Route (30 seconds)

**What to do:**
1. After login, navigate to: https://crm.jaydenmetz.com/admin
2. Or click "Admin" in the navigation menu

**Expected:**
- You see the AdminPanel page
- Page shows: Database Overview, User Management, System Health, etc.
- No "Unauthorized" or "403" error
- No redirect to `/unauthorized`

**✅ PASS:** AdminPanel loads successfully
**❌ FAIL:** You see "Unauthorized" or get redirected

---

## Test 3: Verify isAdmin() Function (30 seconds)

**What to do:**
1. On any page after login, open console (F12)
2. Type:
```javascript
// Access AuthContext via React DevTools or test directly
const user = JSON.parse(localStorage.getItem('user'));
console.log('User role:', user.role);
console.log('Is system_admin:', user.role === 'system_admin');
```

**Expected output:**
```
User role: system_admin
Is system_admin: true
```

**✅ PASS:** Both lines show correct values
**❌ FAIL:** Either line shows false or different role

---

## Test 4: Check Health Routes (1 minute)

**What to do:**
1. Navigate to these URLs (all require `system_admin` role):
   - https://crm.jaydenmetz.com/health
   - https://crm.jaydenmetz.com/escrows/health
   - https://crm.jaydenmetz.com/listings/health
   - https://crm.jaydenmetz.com/clients/health

**Expected:**
- All pages load successfully
- You see health check tests and run buttons
- No "Unauthorized" errors

**✅ PASS:** All health pages load
**❌ FAIL:** Any page redirects to `/unauthorized`

---

## Test 5: Test Non-Admin User (Optional - 2 minutes)

**What to do:**
1. Logout from admin account
2. Login as a regular user (if you have one)
3. Try to access: https://crm.jaydenmetz.com/admin

**Expected:**
- You get redirected to `/unauthorized`
- You see "Unauthorized Access" page
- You do NOT see AdminPanel

**✅ PASS:** Redirected to unauthorized page
**❌ FAIL:** You can access admin panel as regular user

**Note:** If you don't have a regular user, skip this test.

---

## Test 6: Check Navigation Menu (30 seconds)

**What to do:**
1. Login as admin
2. Look at the navigation menu (top or sidebar)
3. Check if "Admin" link is visible

**Expected:**
- "Admin" menu item is visible
- Clicking it goes to `/admin`
- No errors in console

**✅ PASS:** Admin menu item visible and clickable
**❌ FAIL:** Admin menu item missing or broken

---

## Quick Verification Script

**Copy/paste this into console after login:**

```javascript
console.log('=== PHASE 3 RBAC VERIFICATION ===');

// Check user exists
const user = JSON.parse(localStorage.getItem('user'));
console.log('✅ User:', user?.email || '❌ MISSING');

// Check role
console.log('✅ Role:', user?.role || '❌ MISSING');

// Check if system_admin
const isSystemAdmin = user?.role === 'system_admin';
console.log(isSystemAdmin ? '✅ Is System Admin: YES' : '❌ Is System Admin: NO');

// Check if should access /admin
if (isSystemAdmin) {
  console.log('✅ Can access /admin: YES');
  console.log('✅ Can access /health routes: YES');
} else {
  console.warn('⚠️ Cannot access admin routes (not system_admin)');
}

console.log('=== END VERIFICATION ===');
```

**✅ ALL PASS Criteria:**
```
✅ User: admin@jaydenmetz.com
✅ Role: system_admin
✅ Is System Admin: YES
✅ Can access /admin: YES
✅ Can access /health routes: YES
```

---

## Common Issues & Solutions

### Issue: "Unauthorized" when accessing /admin
**Cause:** Role is not `'system_admin'`
**Solution:**
1. Check `localStorage.getItem('user')` - verify `role: "system_admin"`
2. If role is wrong, contact admin to update database
3. Logout and login again

### Issue: Admin menu item not visible
**Cause:** Component using old `isAdmin()` check
**Solution:** Wait for Phase 3 deployment to complete on Railway (~2-3 min)

### Issue: Role shows as `null` or `undefined`
**Cause:** User object not stored correctly
**Solution:**
1. Logout completely
2. Clear localStorage: `localStorage.clear()`
3. Login again

### Issue: Still getting errors after Phase 3 deploy
**Cause:** Old bundle cached in browser
**Solution:** Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## Role Definitions (Reference)

| Role | Description | Access Level |
|------|-------------|--------------|
| `system_admin` | Full system access | Admin panel, health checks, all features |
| `broker` | Brokerage owner | Team management, all team data |
| `agent` | Real estate agent | Own data + team data (read) |
| `user` | Basic user | Own data only |

**Current User:** `admin@jaydenmetz.com` has `system_admin` role

---

## What Changed in Phase 3

**Before Phase 3:**
```javascript
// AuthContext.jsx (line 216)
isAdmin() {
  return hasRole('admin'); // ❌ WRONG - no 'admin' role exists
}
```

**After Phase 3:**
```javascript
// AuthContext.jsx (line 221)
isAdmin() {
  return hasRole('system_admin'); // ✅ CORRECT - matches backend
}
```

**Impact:**
- `/admin` route now works for `system_admin` users
- `ProtectedRoute` with `requiredRole="system_admin"` now works
- All health routes (`/health`, `/escrows/health`, etc.) now work
- Components using `isAdmin()` now get correct result

---

## Success Summary

**Phase 3 Complete When:**
- ✅ User role in localStorage is `'system_admin'`
- ✅ `/admin` route loads AdminPanel (not Unauthorized)
- ✅ All `/health` routes load correctly
- ✅ `isAdmin()` returns true for system_admin users
- ✅ Verification script shows all green checkmarks

**If all tests pass, Phase 3 is successfully implemented!**
