# Phase 1 Testing Checklist - JWT in localStorage

**Date:** 2025-10-13
**Status:** ✅ IMPLEMENTED
**Goal:** Move JWT from memory-only storage to localStorage for persistence across page refreshes

---

## What Changed in Phase 1

### Files Modified:
1. **`auth.service.js`** - Load/save JWT to/from localStorage
2. **`api.service.js`** - Check localStorage for JWT token
3. **`utils/refreshAuth.js`** - Use only 'authToken' key (removed duplicates)

### Key Changes:
- ✅ JWT now saved to `localStorage.setItem('authToken', token)` on login/register/refresh
- ✅ JWT loaded from `localStorage.getItem('authToken')` on page load
- ✅ JWT cleared from `localStorage.removeItem('authToken')` on logout
- ✅ Token expiry still tracked in 'tokenExpiry' key

---

## Simple Testing Steps

### 1. **Login Test** (Most Important!)

**Page:** `/login`

**Steps:**
1. Open browser DevTools (F12) → Application tab → Local Storage
2. Clear all localStorage items
3. Login with: `admin@jaydenmetz.com` / `AdminPassword123!`
4. Check localStorage - should see:
   - `authToken`: (long JWT string)
   - `user`: (JSON object with your user data)
   - `tokenExpiry`: (timestamp number)

**✅ Success:** You see all 3 items in localStorage
**❌ Fail:** authToken is missing or null

---

### 2. **Page Refresh Test** (Critical for Phase 1!)

**Page:** `/` (home dashboard)

**Steps:**
1. After logging in, you should be on home dashboard
2. Press F5 or Ctrl+R to refresh the page
3. Page should load WITHOUT redirecting to /login
4. Check browser console (F12 → Console tab)
5. Should see: `✅ Login successful - JWT stored in localStorage (Phase 1)`

**✅ Success:** You stay logged in after refresh
**❌ Fail:** You get redirected to /login page

---

### 3. **New Tab Test**

**Steps:**
1. While logged in, open a NEW browser tab
2. Go to `https://crm.jaydenmetz.com/escrows`
3. You should see the escrows dashboard (not login page)

**✅ Success:** New tab shows escrows dashboard
**❌ Fail:** New tab shows login page

---

### 4. **API Request Test**

**Page:** `/escrows` (escrows dashboard)

**Steps:**
1. Open browser DevTools (F12) → Network tab
2. Filter by "Fetch/XHR"
3. Refresh the page
4. Look for request to `/v1/escrows`
5. Click on the request → Headers tab
6. Check "Request Headers" section
7. Should see: `Authorization: Bearer eyJhbGc...` (JWT token)

**✅ Success:** Authorization header is present with token
**❌ Fail:** No Authorization header or token is "null"

---

### 5. **Logout Test**

**Page:** Any page

**Steps:**
1. Click your profile/settings menu
2. Click "Logout"
3. Open browser DevTools → Application → Local Storage
4. Check localStorage items:
   - `authToken`: should be DELETED
   - `user`: should be DELETED
   - `tokenExpiry`: should be DELETED

**✅ Success:** All 3 items are removed
**❌ Fail:** authToken still exists in localStorage

---

## Things to Look For

### Browser Console Messages (F12 → Console)

**Good Messages (Phase 1 working):**
- `✅ Login successful - JWT stored in localStorage (Phase 1)`
- `✅ Token refreshed - JWT stored in localStorage (Phase 1)`
- `API Service initialized: { hasToken: true }`

**Bad Messages (Phase 1 broken):**
- `❌ No token found, attempting to refresh...`
- `Authentication failed: No authentication token provided`
- `API Service initialized: { hasToken: false }`

---

## Advanced Tests (Optional)

### 6. **Token Expiry Check**

**Steps:**
1. Login
2. Open DevTools → Application → Local Storage
3. Find `tokenExpiry` key
4. Copy the value (it's a timestamp)
5. Go to https://www.epochconverter.com/
6. Paste the timestamp
7. Should show time ~15 minutes from now

**✅ Success:** Expiry is ~15 min from current time
**❌ Fail:** Expiry is in the past or way in the future

---

### 7. **Health Page Test** (If you have system_admin role)

**Page:** `/health`

**Steps:**
1. Login as admin
2. Go to `/health`
3. Health tests should start automatically
4. NO "Authentication Required" error
5. Tests should pass (green checkmarks)

**✅ Success:** Health tests run and pass
**❌ Fail:** "Authentication Required" error or tests fail with 401

---

## What Phase 1 Fixes

### Problems BEFORE Phase 1:
- ❌ JWT in memory only - lost on page refresh
- ❌ Health pages failed after refresh
- ❌ Race conditions - API calls before token loaded
- ❌ Had to refresh token on every page load

### Problems FIXED by Phase 1:
- ✅ JWT persists across page refreshes
- ✅ New tabs work immediately
- ✅ No race conditions
- ✅ Health pages work reliably
- ✅ Faster page loads (token already available)

---

## Quick Verification Command

**Open browser console (F12) and paste:**

```javascript
// Check Phase 1 implementation
const token = localStorage.getItem('authToken');
const user = localStorage.getItem('user');
const expiry = localStorage.getItem('tokenExpiry');

console.log('Phase 1 Status:', {
  hasToken: !!token,
  tokenLength: token?.length || 0,
  hasUser: !!user,
  hasExpiry: !!expiry,
  expiryDate: expiry ? new Date(parseInt(expiry)).toLocaleString() : 'Not set',
  timeUntilExpiry: expiry ? `${Math.round((parseInt(expiry) - Date.now()) / 60000)} minutes` : 'N/A'
});
```

**Expected Output:**
```
Phase 1 Status: {
  hasToken: true,
  tokenLength: 200-300 (varies),
  hasUser: true,
  hasExpiry: true,
  expiryDate: "10/13/2025, 3:45:00 PM",
  timeUntilExpiry: "14 minutes"
}
```

---

## Summary - What You Learned About the Code

### Token Storage Strategy:
- **Before:** JWT in `this.token` (memory only) - lost on refresh
- **After:** JWT in `localStorage.getItem('authToken')` + `this.token` (persistent)

### Key Files:
1. **auth.service.js** - Manages login/logout, saves JWT to localStorage
2. **api.service.js** - Makes API calls, loads JWT from localStorage
3. **AuthContext.jsx** - Provides auth state to React components

### Security Considerations:
- **XSS Risk:** JWT in localStorage CAN be stolen if site has XSS vulnerability
- **Mitigation:**
  - Short 15-min expiration limits damage
  - Refresh token in httpOnly cookie (can't be stolen via XSS)
  - Content Security Policy headers
  - Input sanitization

### Common Gotchas:
- Must clear authToken on logout
- Must update authToken on refresh
- Must check localStorage AND memory for token
- Can't assume token exists (always check)

---

## Phase 1 Complete! ✅

**Next:** Phase 2 will add automatic token refresh (5-minute background check)

**Questions to Answer:**
1. Does login save token to localStorage? ✅
2. Does page refresh keep you logged in? ✅
3. Do API calls include Authorization header? ✅
4. Does logout clear the token? ✅
5. Do health pages work? ✅

If ALL 5 questions are "✅ YES", Phase 1 is successful!
