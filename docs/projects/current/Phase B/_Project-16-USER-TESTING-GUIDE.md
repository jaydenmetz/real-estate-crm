# Project-16: Authentication Flow Verification - USER TESTING GUIDE

## 🧪 TEST 1: Login Flow (5 minutes)

### Steps:
1. **Open browser** (Chrome/Safari) in Incognito/Private mode
2. **Go to**: https://crm.jaydenmetz.com
3. **You should see**: Login page (not dashboard - you're logged out)

### Test Login:
4. **Enter**:
   - Email: `admin@jaydenmetz.com`
   - Password: `[your actual password]`
5. **Click**: "Sign In" button
6. **Expected**: Redirect to Home Dashboard
7. **Check**: Top right shows your name/email

### ✅ PASS Criteria:
- Login form appears
- Correct credentials → dashboard loads
- User info visible in top right
- No console errors (F12 → Console tab)

### ❌ FAIL if:
- Stuck on login page
- Gets error message
- Dashboard doesn't load
- Console shows auth errors

---

## 🧪 TEST 2: Protected Routes (3 minutes)

### While Logged In:
1. **Click** "Escrows" in sidebar
2. **Expected**: Escrows dashboard loads with data
3. **Click** any escrow → Detail page opens
4. **Click** "Clients" → Clients dashboard loads
5. **Click** "Listings" → Listings dashboard loads

### ✅ PASS Criteria:
- All pages load without errors
- Data displays (even if empty "No escrows" message)
- No "Unauthorized" or "401" errors
- Can navigate between pages

### ❌ FAIL if:
- Redirected back to login
- "Unauthorized" error appears
- Pages don't load
- Network errors in F12 → Network tab

---

## 🧪 TEST 3: Session Persistence (2 minutes)

### Test Refresh:
1. **While on dashboard**, press `Cmd+R` (Mac) or `Ctrl+R` (Windows)
2. **Expected**: Page refreshes, stays logged in
3. **Check**: Dashboard still shows, not back at login

### Test New Tab:
4. **Open new tab**: https://crm.jaydenmetz.com
5. **Expected**: Already logged in, shows dashboard
6. **Check**: Don't have to log in again

### ✅ PASS Criteria:
- Refresh keeps you logged in
- New tabs automatically logged in
- Session persists

### ❌ FAIL if:
- Refresh logs you out
- New tabs show login page
- Have to re-enter password

---

## 🧪 TEST 4: Logout (2 minutes)

### Steps:
1. **Click** user menu (top right corner)
2. **Click** "Logout" or "Sign Out"
3. **Expected**: Redirect to login page
4. **Check**: Dashboard no longer accessible

### Test Logout Worked:
5. **Try to go to**: https://crm.jaydenmetz.com/escrows
6. **Expected**: Redirect back to login page (can't access without auth)
7. **Open F12 → Application → Cookies**
8. **Check**: No `accessToken` or `refreshToken` cookies

### ✅ PASS Criteria:
- Logout redirects to login
- Protected pages redirect to login
- Cookies cleared
- Can't access data without re-login

### ❌ FAIL if:
- Logout doesn't work
- Still can access escrows after logout
- Cookies still present

---

## 🧪 TEST 5: Token Expiration (15 minutes - OPTIONAL)

### Setup:
1. **Login** to dashboard
2. **Leave browser open** for 16 minutes (access token expires after 15 min)
3. **After 16 minutes**, click "Escrows" or refresh page

### Expected Behavior:
4. **System should**: Automatically refresh token in background
5. **You should**: See data load normally (seamless)
6. **You should NOT**: Get logged out or see errors

### Check Network Tab:
7. **Open F12 → Network**
8. **Look for**: `/auth/refresh` request (happens automatically)
9. **Status**: Should be 200 OK

### ✅ PASS Criteria:
- After 15+ minutes, app still works
- Token refresh happens automatically
- No visible errors to user
- Seamless experience

### ❌ FAIL if:
- Get logged out after 15 minutes
- See "Token expired" error
- Have to manually refresh page
- /auth/refresh returns error

---

## 🧪 TEST 6: Wrong Password (1 minute)

### Steps:
1. **Logout** if logged in
2. **Try login with**:
   - Email: `admin@jaydenmetz.com`
   - Password: `WrongPassword123`
3. **Click**: Sign In

### Expected:
4. **Error message appears**: "Invalid email or password"
5. **Stays on login page**
6. **After 5 attempts**: Account lockout message

### ✅ PASS Criteria:
- Wrong password shows error
- Error message is user-friendly
- Doesn't crash
- After 5 wrong attempts: "Account locked" message

### ❌ FAIL if:
- No error shown
- Crashes or blank page
- Error is technical jargon
- No lockout after 5 attempts

---

## 🧪 TEST 7: API Key Authentication (CURL - 5 minutes)

### Get an API Key:
1. **Login** to dashboard
2. **Go to**: Settings → API Keys (or Admin → API Keys)
3. **Click**: "Generate New API Key"
4. **Copy**: The generated key (64-character string)

### Test API Key in Terminal:
```bash
# Replace YOUR_API_KEY with the key you copied
curl -X GET "https://api.jaydenmetz.com/v1/escrows" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Expected Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "property_address": "123 Main St",
      ...
    }
  ]
}
```

### ✅ PASS Criteria:
- API key works without Bearer token
- Returns escrows data
- HTTP 200 status

### ❌ FAIL if:
- 401 Unauthorized
- "Invalid API key" error
- No data returned

---

## 🧪 TEST 8: Rate Limiting (2 minutes)

### Test Login Rate Limit:
1. **Logout**
2. **Rapidly try to login** with wrong password **30+ times** in under 15 minutes
3. **Expected**: After 30 attempts, get rate limit error

### What to Look For:
```
Error: Too many login attempts. Please try again in 15 minutes.
```

### ✅ PASS Criteria:
- Rate limit kicks in after 30 attempts
- Clear error message
- Can't bypass by refreshing

### ❌ FAIL if:
- Can spam login attempts forever
- No rate limit protection
- Rate limit doesn't reset

---

## 📊 SUMMARY CHECKLIST

After completing all tests, verify:

- [ ] ✅ TEST 1: Login works with correct credentials
- [ ] ✅ TEST 2: All protected routes require authentication
- [ ] ✅ TEST 3: Session persists across refreshes and tabs
- [ ] ✅ TEST 4: Logout clears session completely
- [ ] ✅ TEST 5: Token refresh happens automatically (OPTIONAL)
- [ ] ✅ TEST 6: Wrong password shows error, lockout after 5 attempts
- [ ] ✅ TEST 7: API keys work for authentication
- [ ] ✅ TEST 8: Rate limiting protects against spam

---

## 🐛 IF YOU FIND BUGS

**Report format:**
```
Test: [Test number and name]
Steps: [What you did]
Expected: [What should happen]
Actual: [What actually happened]
Error: [Any error messages]
Screenshot: [If helpful]
```

**Example:**
```
Test: TEST 1 - Login Flow
Steps: Entered admin@jaydenmetz.com and correct password, clicked Sign In
Expected: Redirect to dashboard
Actual: Stayed on login page, no error shown
Error: Console shows "Network Error" in F12
```

---

## ✅ SUCCESS CRITERIA

**Project-16 is COMPLETE when:**
- All 8 tests PASS
- No bugs found during manual testing
- Authentication feels smooth and professional
- You're confident users won't have login issues

**Current Status**: TESTING IN PROGRESS
**Your Role**: Run these tests and report any failures
**My Role**: Fix any bugs you find, re-test, repeat until perfect
