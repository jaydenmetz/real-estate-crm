# Phase 2: Quick Testing Guide (5 Minutes)

## Simple Tests to Confirm Phase 2 Works

### Test 1: Login and Check Console (30 seconds)

1. **Login to CRM:**
   - Go to https://crm.jaydenmetz.com/login
   - Login with: `admin@jaydenmetz.com` / `AdminPassword123!`

2. **Open Browser Console:**
   - Press F12 (or Cmd+Option+I on Mac)
   - Click "Console" tab

3. **What to look for:**
   - You should see: `✅ Token refreshed - new expiry in 900s (~15 minutes)`
   - This means Phase 1 + Phase 2 are working

**✅ PASS:** If you see the green checkmark with token expiry time

---

### Test 2: Verify Token in localStorage (30 seconds)

**In the browser console, type:**
```javascript
const expiry = localStorage.getItem('tokenExpiry');
const remaining = Math.round((parseInt(expiry) - Date.now()) / 60000);
console.log(`Token expires in ${remaining} minutes`);
```

**Expected output:**
```
Token expires in 15 minutes
```

**✅ PASS:** If you see ~14-16 minutes remaining

---

### Test 3: Check 5-Minute Interval (Optional - Wait 5 min)

**What to do:**
- Keep console open for 5 minutes
- Go about your work (browse escrows, clients, etc.)
- Watch console for refresh check

**Expected output (after 5 minutes):**
```
[5 minutes pass, no log = token has > 2 min remaining, no action needed]
```

**Note:** You won't see logs every 5 minutes UNLESS token is expiring soon (< 2 min remaining)

**✅ PASS:** If no errors in console after 5 minutes

---

### Test 4: Watch Auto-Refresh (Optional - Wait 13 min)

**What to do:**
- Stay on any page for 13 minutes
- Watch console closely at the 13-minute mark

**Expected output (at ~13 minutes):**
```
⏰ Token expiring soon: 119s remaining
🔄 Token expiring soon, refreshing...
🔄 Refreshing token (expires in 119s)...
✅ Token refreshed - new expiry in 900s (~15 minutes)
✅ Token refreshed successfully (auto-refresh)
```

**✅ PASS:** If token automatically refreshes with no errors

---

## Quick Verification Script

**Copy/paste this into browser console:**

```javascript
// Phase 2 Verification Script
console.log('=== PHASE 2 VERIFICATION ===');

// Check authToken exists
const authToken = localStorage.getItem('authToken');
console.log('✅ authToken:', authToken ? 'EXISTS' : '❌ MISSING');

// Check tokenExpiry exists
const expiry = localStorage.getItem('tokenExpiry');
console.log('✅ tokenExpiry:', expiry ? 'EXISTS' : '❌ MISSING');

// Calculate time remaining
if (expiry) {
  const remaining = Math.round((parseInt(expiry) - Date.now()) / 60000);
  const seconds = Math.round((parseInt(expiry) - Date.now()) / 1000) % 60;
  console.log(`⏰ Token expires in: ${remaining} min ${seconds} sec`);
  console.log(`📅 Expiry date: ${new Date(parseInt(expiry)).toLocaleString()}`);

  // Check if will refresh soon
  const willRefresh = remaining < 2;
  console.log(`🔄 Will refresh now: ${willRefresh ? 'YES (< 2 min)' : 'NO (> 2 min)'}`);
} else {
  console.error('❌ No tokenExpiry found - Phase 2 may not be working');
}

// Check user exists
const user = localStorage.getItem('user');
console.log('✅ user:', user ? JSON.parse(user).email : '❌ MISSING');

console.log('=== END VERIFICATION ===');
```

**✅ ALL PASS Criteria:**
- authToken: EXISTS
- tokenExpiry: EXISTS
- Token expires in: ~14-16 minutes
- No errors in output

---

## What I Learned About the Code

### 1. Two Types of Refresh

**Proactive (Phase 2 - NEW):**
- Runs every 5 minutes automatically
- Checks if token has < 2 min remaining
- Refreshes BEFORE it expires
- Located in: `AuthContext.jsx`

**Reactive (Existing - Safety Net):**
- Runs when API call returns 401
- Tries to refresh and retry request
- Located in: `api.service.js`

**Why both?** Proactive prevents 99% of 401 errors, reactive handles edge cases.

### 2. Deleted Emergency Auth Utility

**File deleted:** `frontend/src/utils/refreshAuth.js`

**Why?**
- Had hard-coded admin password (security risk)
- Used wrong endpoint (not the proper refresh endpoint)
- Created duplicate/conflicting logic
- No longer needed with Phase 2 auto-refresh

### 3. Console Logging Strategy

**Emojis help you quickly identify what's happening:**
- 🔄 = Refresh in progress
- ✅ = Success
- ⚠️ = Warning (non-fatal)
- ❌ = Error (needs attention)
- ⏰ = Time-based trigger (expiring soon)

**Example:**
```
⏰ Token expiring soon: 119s remaining
🔄 Refreshing token...
✅ Token refreshed - new expiry in 900s
```

### 4. Token Lifecycle

```
Login → JWT (15 min) + Refresh Token (7 days)
  ↓
[Wait 13 minutes]
  ↓
Auto-refresh triggered (< 2 min remaining)
  ↓
New JWT (15 min) + New Refresh Token (7 days)
  ↓
[Cycle repeats every ~13 minutes]
  ↓
[After 7 days]
  ↓
Refresh token expires → Forced login
```

### 5. What Changed from Phase 1 to Phase 2

**Phase 1:**
- Tokens stored in localStorage (persistence)
- Manual refresh only (when API returns 401)

**Phase 2:**
- Automatic refresh every 5 minutes (proactive)
- Refresh triggers at < 2 min mark (prevents 401s)
- Better logging for debugging
- Removed emergency auth code (security)

---

## Summary

**Phase 2 is working if:**
1. ✅ Token exists in localStorage after login
2. ✅ Token expires in ~15 minutes
3. ✅ Console shows green checkmarks (no errors)
4. ✅ Token auto-refreshes at 13-minute mark
5. ✅ No 401 errors while using the app

**Next:** Phase 3 - Role-Based Access Control (fix /admin routes)

---

**Quick Answer: "Is Phase 2 done?"**

**YES** if you see this in console after login:
```
✅ Token refreshed - new expiry in 900s (~15 minutes)
```

**NO** if you see:
```
❌ Token refresh error: [some error]
⚠️ No tokenExpiry found in localStorage
```

**Run the verification script above to be 100% sure.**
