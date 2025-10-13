# Phase 2: Automatic Token Refresh - Testing Checklist

**Goal:** Verify that tokens automatically refresh every 5 minutes when expiring (< 2 min remaining)

**Estimated Time:** 15-20 minutes (most is waiting)

---

## Prerequisites

1. **Login to CRM:**
   - Go to https://crm.jaydenmetz.com/login
   - Login with: `admin@jaydenmetz.com` / `AdminPassword123!`

2. **Open Browser Console:**
   - Press F12 (Chrome/Edge) or Cmd+Option+I (Mac)
   - Click "Console" tab
   - Keep it open for all tests

---

## Test 1: Verify Initial Token Expiry ✅

**What to do:**
1. After login, open console
2. Type: `localStorage.getItem('tokenExpiry')`
3. Copy the number (timestamp)
4. Type: `new Date(parseInt(localStorage.getItem('tokenExpiry'))).toLocaleString()`

**Expected:**
- You see a timestamp ~15 minutes from now
- Example: `1760382000118` → `"10/13/2025, 3:15:00 PM"`

**Success Criteria:** Token expires in 14-16 minutes from login

---

## Test 2: Verify 5-Minute Interval ✅

**What to do:**
1. Watch console for 5-10 minutes
2. Look for refresh check logs every 5 minutes

**Expected Console Output:**
```
🔄 Token expiring soon (initial check), refreshing... (if < 2 min remaining on mount)
[5 minutes later] - Check runs again
[5 minutes later] - Check runs again
```

**Success Criteria:**
- Interval logs appear every 5 minutes (not 10 minutes)
- No errors in console

---

## Test 3: Token Refresh at 2-Minute Mark 🔥 CRITICAL

**What to do:**
1. Wait ~13 minutes after login (so token has < 2 min remaining)
2. Watch console closely

**Expected Console Output:**
```
⏰ Token expiring soon: 119s remaining
🔄 Token expiring soon, refreshing...
🔄 Refreshing token (expires in 119s)...
✅ Token refreshed - new expiry in 900s (~15 minutes)
✅ Token refreshed successfully (auto-refresh)
```

**Success Criteria:**
- Refresh triggers automatically when < 2 minutes remaining
- New token has ~15 minutes expiry
- No 401 errors
- Page stays functional (no logout)

---

## Test 4: Verify New Token in localStorage ✅

**What to do:**
1. After auto-refresh completes (Test 3)
2. In console, type: `localStorage.getItem('authToken')`
3. Compare first 20 characters to old token (if you saved it)

**Expected:**
- Token string changed (first 20 chars different from before refresh)
- Token still exists (not null)

**Success Criteria:** Token updated in localStorage after refresh

---

## Test 5: Verify Token Works After Refresh ✅

**What to do:**
1. After auto-refresh completes
2. Navigate to different page (e.g., /escrows, /clients)
3. Check if data loads correctly

**Expected:**
- Page loads without errors
- Data displays (escrows/clients/etc.)
- No 401 errors in console
- No redirect to login page

**Success Criteria:** All API calls work with new token

---

## Test 6: Page Refresh During Auto-Refresh ✅

**What to do:**
1. Wait for token to expire soon (< 2 min)
2. When you see "🔄 Token expiring soon..." in console
3. Press F5 to refresh page immediately

**Expected:**
- Page reloads
- Auto-refresh check runs on mount
- Token refreshed if still < 2 min remaining
- No authentication errors

**Success Criteria:** Refresh doesn't break auto-refresh mechanism

---

## Test 7: New Tab Auto-Refresh ✅

**What to do:**
1. After auto-refresh has happened in one tab
2. Open new tab: https://crm.jaydenmetz.com
3. Check console in new tab

**Expected:**
- New tab loads with refreshed token
- No auto-refresh runs (token has ~15 min left)
- Page works normally

**Success Criteria:** New tabs share refreshed token from localStorage

---

## Test 8: 7-Day Expiry (Forced Login) ⏳ LONG TEST

**What to do (requires waiting 7 days or manual cookie deletion):**
1. Option A: Wait 7 days and check
2. Option B (Quick Test): Delete refresh token cookie manually
   - Open DevTools → Application → Cookies
   - Find `refreshToken` cookie for `.jaydenmetz.com`
   - Delete it
3. Wait for next auto-refresh attempt (< 2 min mark)

**Expected:**
- Auto-refresh fails (no refresh token cookie)
- Console shows: `⚠️ Token refresh failed: NO_REFRESH_TOKEN`
- Next API call returns 401
- User redirected to login page

**Success Criteria:** Forced login after 7 days (or deleted cookie)

---

## Quick Verification Script

Run this in console to see current token status:

```javascript
const expiry = localStorage.getItem('tokenExpiry');
const now = Date.now();
const remaining = expiry ? parseInt(expiry) - now : 0;
const minutes = Math.floor(remaining / 60000);
const seconds = Math.floor((remaining % 60000) / 1000);

console.log(`Token expires in: ${minutes}m ${seconds}s`);
console.log(`Expiry timestamp: ${expiry}`);
console.log(`Expiry date: ${new Date(parseInt(expiry)).toLocaleString()}`);
console.log(`Will refresh at: ${remaining < 2 * 60 * 1000 ? 'YES (< 2 min)' : 'NO (> 2 min)'}`);
```

---

## Expected Console Timeline (15-Minute Session)

```
00:00 - Login
00:00 - ✅ Token refreshed - new expiry in 900s (~15 minutes)
05:00 - [Auto-refresh check runs, token has 10 min left, no action]
10:00 - [Auto-refresh check runs, token has 5 min left, no action]
13:00 - ⏰ Token expiring soon: 120s remaining
13:00 - 🔄 Token expiring soon, refreshing...
13:00 - ✅ Token refreshed - new expiry in 900s (~15 minutes)
18:00 - [Auto-refresh check runs, token has 10 min left, no action]
23:00 - [Auto-refresh check runs, token has 5 min left, no action]
26:00 - ⏰ Token expiring soon: 120s remaining
26:00 - 🔄 Token expiring soon, refreshing...
26:00 - ✅ Token refreshed - new expiry in 900s (~15 minutes)
```

---

## Common Issues & Solutions

### Issue: No console logs appear
**Solution:** Refresh page, logs only appear when authenticated

### Issue: Token refreshed but says "expires in -50s"
**Solution:** Clock skew - backend/frontend time mismatch. Refresh page.

### Issue: Refresh fails with "NO_REFRESH_TOKEN"
**Solution:** Refresh token cookie expired (7 days). Login again.

### Issue: Interval runs every 10 minutes (not 5)
**Solution:** Phase 2 not deployed. Check latest commit is deployed to Railway.

### Issue: Multiple refresh attempts back-to-back
**Solution:** Multiple tabs open, each running interval. Expected behavior.

---

## Success Summary

**Phase 2 Complete When:**
- ✅ Token expires in ~15 minutes after login
- ✅ Auto-refresh check runs every 5 minutes
- ✅ Token auto-refreshes at < 2 min mark
- ✅ New token stored in localStorage
- ✅ All API calls work after refresh
- ✅ Page refresh doesn't break mechanism
- ✅ New tabs share refreshed token
- ✅ Forced login after 7 days (or deleted cookie)

**If all tests pass, Phase 2 is successfully implemented!**
