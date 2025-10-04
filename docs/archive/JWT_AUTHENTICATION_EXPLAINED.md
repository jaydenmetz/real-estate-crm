# JWT Authentication System - Explained

## Your Current Problem

**Symptom:** You get logged out after 15 minutes of activity, even though you should stay logged in for 7 days.

**Root Cause:** The refresh token cookie is not being sent from the frontend to the backend, so the automatic token refresh is failing.

---

## How JWT Authentication SHOULD Work (Best Practice)

### The Two-Token System

Your system uses the **industry-standard dual-token pattern**:

1. **Access Token (JWT)** - Short-lived (15 minutes)
   - Stored in localStorage as `authToken`
   - Sent with every API request as `Authorization: Bearer <token>`
   - Contains user identity (id, email, role)
   - **Why short-lived?** Limits damage if token is stolen

2. **Refresh Token** - Long-lived (7 days)
   - Stored in **httpOnly cookie** (cannot be accessed by JavaScript)
   - Used to get new access tokens when they expire
   - Rotates on each use (old token invalidated, new one issued)
   - **Why httpOnly?** Protects against XSS attacks - even if malicious JS runs, it can't steal the refresh token

### The Intended Flow (What Should Happen)

```
User Activity Timeline:
├─ Login (minute 0)
│  ├─ Backend issues access token (expires in 15m)
│  ├─ Backend issues refresh token (expires in 7d, stored as httpOnly cookie)
│  └─ Frontend stores access token in localStorage
│
├─ User browses CRM (minutes 1-14)
│  └─ All API calls use access token from localStorage
│
├─ Minute 15: Access token expires
│  ├─ User makes API call → 401 Unauthorized
│  ├─ Frontend detects 401 error
│  ├─ Frontend calls POST /auth/refresh (sends refresh token cookie automatically)
│  ├─ Backend validates refresh token
│  ├─ Backend issues NEW access token (15m) + NEW refresh token (7d)
│  ├─ Frontend updates localStorage with new access token
│  └─ Frontend retries failed API call with new token ✅
│
├─ User continues browsing (minutes 16-30)
│  └─ All API calls use NEW access token
│
├─ Minute 30: Access token expires again
│  └─ Refresh cycle repeats...
│
└─ Day 7: Refresh token expires
   └─ User is finally logged out (must login again)
```

**This means:** As long as you're active within 7 days, you should NEVER be logged out. The 15-minute access token refreshes automatically in the background.

---

## What's Actually Happening (The Bug)

### Current Broken Flow

```
User Activity Timeline:
├─ Login (minute 0)
│  ├─ Backend issues access token ✅
│  ├─ Backend sets refresh token cookie ✅
│  └─ Frontend stores access token ✅
│
├─ User browses CRM (minutes 1-14)
│  └─ All API calls work fine ✅
│
├─ Minute 15: Access token expires
│  ├─ User makes API call → 401 Unauthorized ✅
│  ├─ Frontend detects 401 error ✅
│  ├─ Frontend calls POST /auth/refresh ❌
│  │  └─ Cookie is NOT sent (CORS/domain issue)
│  ├─ Backend receives request WITHOUT refresh token ❌
│  ├─ Backend returns 401 "No refresh token provided" ❌
│  ├─ Frontend refresh fails ❌
│  └─ Frontend logs user out and redirects to /login ❌
│
└─ User is kicked out after 15 minutes (not 7 days)
```

### The Cookie Problem

**Your refresh token cookie settings (from backend):**
```javascript
res.cookie('refreshToken', tokenValue, {
  httpOnly: true,           // ✅ Correct (prevents XSS)
  secure: true,             // ✅ Correct (HTTPS only in production)
  sameSite: 'lax',          // ⚠️ PROBLEM!
  domain: '.jaydenmetz.com', // ⚠️ POTENTIAL PROBLEM
  maxAge: 7 * 24 * 60 * 60 * 1000 // ✅ Correct (7 days)
});
```

**Your API service settings (from frontend):**
```javascript
const config = {
  credentials: 'include', // ✅ Correct (tells browser to send cookies)
  // ...
};
```

**Why cookies aren't sent:**

1. **SameSite: 'lax' issue** - With `sameSite: 'lax'`, cookies are only sent for:
   - Same-site requests (crm.jaydenmetz.com → crm.jaydenmetz.com) ✅
   - Top-level navigation (clicking a link)
   - **NOT sent for cross-origin POST requests** ❌

   Your frontend (crm.jaydenmetz.com) is making a POST to api.jaydenmetz.com - this is cross-origin!

2. **Domain mismatch** - Cookie set for `.jaydenmetz.com` but:
   - Frontend: `crm.jaydenmetz.com`
   - API: `api.jaydenmetz.com`
   - These are different subdomains, so browser sees them as cross-origin

---

## Why This Architecture is Best Practice

### Security Benefits

**1. XSS Protection (Cross-Site Scripting)**
- If attacker injects malicious JavaScript: `<script>sendTokenToHacker(localStorage.authToken)</script>`
- Access token CAN be stolen (it's in localStorage)
- Refresh token CANNOT be stolen (httpOnly cookie)
- **Damage limited to 15 minutes** - attacker can't get new access tokens

**2. Token Rotation**
- Every refresh creates a new refresh token and invalidates the old one
- If refresh token is stolen, it only works once
- Legitimate user's next refresh fails → triggers re-authentication → alerts admin

**3. Short-Lived Access Tokens**
- If access token is compromised, damage window is only 15 minutes
- No need to revoke/blacklist (expires quickly on its own)

**4. Long-Lived Sessions Without Risk**
- User stays logged in for 7 days (good UX)
- But no long-lived token stored in accessible storage (good security)

### UX Benefits

- **Seamless experience** - User never sees "session expired" during active use
- **No annoying re-logins** - As long as user returns within 7 days
- **Invisible security** - All token refreshing happens in background

---

## Arguments Against This Approach

### Criticism #1: "Too Complex"

**The Argument:**
> "Just use a 7-day access token and store it in localStorage. Why all this refresh token complexity?"

**The Problem:**
- If 7-day token stolen via XSS → attacker has 7 days of access
- Can't revoke it (no server-side tracking)
- User has no way to know they're compromised

**Why We Don't Do This:**
Security > Simplicity. The dual-token pattern is industry standard for good reason.

---

### Criticism #2: "Cookies Are Old School"

**The Argument:**
> "Just store refresh token in localStorage too. Cookies are outdated!"

**The Problem:**
- localStorage is accessible to any JavaScript (including malicious scripts)
- httpOnly cookies are protected by the browser itself
- XSS attack can steal BOTH tokens from localStorage

**Why We Don't Do This:**
Defense in depth. Even if XSS bypasses our protections, refresh token is safe.

---

### Criticism #3: "SameSite Cookie Issues"

**The Argument:**
> "This cookie stuff doesn't work with modern CORS. Just use Authorization headers for everything."

**The Reality:**
- You discovered this exact problem! (cookies not sent cross-origin)
- But there ARE solutions (see below)

**Why We Keep Cookies:**
The httpOnly protection is worth fixing the CORS issues.

---

## How to Fix Your System

### Solution 1: Change SameSite to 'none' (Recommended for Your Setup)

**Backend change:**
```javascript
res.cookie('refreshToken', tokenValue, {
  httpOnly: true,
  secure: true,              // REQUIRED when sameSite: 'none'
  sameSite: 'none',          // ← CHANGE THIS
  domain: '.jaydenmetz.com',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

**Why this works:**
- `sameSite: 'none'` allows cross-origin requests to send cookies
- Frontend (crm.jaydenmetz.com) can now send cookie to backend (api.jaydenmetz.com)
- MUST use `secure: true` (HTTPS only) when using `sameSite: 'none'`

**Trade-off:**
- Slightly less CSRF protection (but you're already using CORS)
- Still protected from XSS (httpOnly still active)

---

### Solution 2: Same-Origin Architecture (More Secure, More Complex)

**Approach:** Serve frontend and API from same domain

**Option A: Proxy Pattern**
```
User → crm.jaydenmetz.com/app → Frontend
User → crm.jaydenmetz.com/api → Backend (proxied)
```

**Option B: Path-Based Routing**
```
Frontend: crm.jaydenmetz.com/
API: crm.jaydenmetz.com/api/v1/
```

**Why this works:**
- Browser sees all requests as same-origin
- `sameSite: 'lax'` or `'strict'` works perfectly
- Maximum CSRF protection

**Trade-off:**
- Requires infrastructure changes (Nginx proxy or Railway routing config)
- More complex deployment

---

### Solution 3: Hybrid Approach (What Many Apps Do)

**Implementation:**
```javascript
// Backend: Send refresh token in BOTH cookie and response body
res.cookie('refreshToken', refreshTokenValue, { httpOnly: true, ... });
res.json({
  accessToken,
  refreshToken: refreshTokenValue, // ← Also in response
  expiresIn: '15m'
});

// Frontend: Store refresh token in localStorage as fallback
localStorage.setItem('refreshToken', refreshTokenValue);

// Frontend refresh logic:
async refreshAccessToken() {
  // Try cookie-based refresh first (most secure)
  try {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include' // Send cookie
    });

    if (response.ok) return response.json();
  } catch (error) {
    console.warn('Cookie-based refresh failed, trying localStorage');
  }

  // Fallback: Use localStorage refresh token
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
    return response.json();
  }

  throw new Error('No refresh token available');
}
```

**Why this works:**
- Best of both worlds: httpOnly security where possible, localStorage fallback where needed
- Works across all environments (web, mobile, Electron)

**Trade-off:**
- Less secure than pure httpOnly (XSS can steal localStorage token)
- But still better than long-lived access tokens

---

## Recommended Fix for Your System

### Step 1: Change SameSite Policy (Immediate Fix)

**File:** `backend/src/controllers/auth.controller.js`

**Change line 305-312 from:**
```javascript
res.cookie('refreshToken', refreshTokenData.token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',  // ← CHANGE THIS
  domain: '.jaydenmetz.com',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**To:**
```javascript
res.cookie('refreshToken', refreshTokenData.token, {
  httpOnly: true,
  secure: true, // Always true (you're always HTTPS)
  sameSite: 'none', // ← NEW: Allow cross-origin
  domain: '.jaydenmetz.com',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**Also update the refresh endpoint** (around line 674):
```javascript
// In auth.controller.js refresh() method
res.cookie('refreshToken', newRefreshToken.token, {
  httpOnly: true,
  secure: true,
  sameSite: 'none', // ← NEW
  domain: '.jaydenmetz.com',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### Step 2: Verify CORS Configuration

**File:** `backend/src/app.js` (or wherever CORS is configured)

**Ensure you have:**
```javascript
app.use(cors({
  origin: 'https://crm.jaydenmetz.com',
  credentials: true, // ← CRITICAL for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
```

### Step 3: Test the Fix

**After deploying:**
1. Login to CRM
2. Open browser DevTools → Application → Cookies
3. Verify `refreshToken` cookie exists with:
   - `HttpOnly: ✓`
   - `Secure: ✓`
   - `SameSite: None`
   - `Domain: .jaydenmetz.com`
4. Wait 16 minutes (past 15min expiry)
5. Make an API request
6. Check Network tab:
   - Should see `POST /auth/refresh` with Cookie header
   - Should get new access token
   - Original request should retry and succeed

---

## Understanding the 7-Day Refresh vs. 15-Minute Access

### Why Two Different Timeframes?

**15-Minute Access Token:**
- **Purpose:** Minimize damage window if stolen
- **Storage:** localStorage (vulnerable to XSS)
- **Lifetime:** Short by design

**7-Day Refresh Token:**
- **Purpose:** Allow long sessions without constant re-authentication
- **Storage:** httpOnly cookie (protected from XSS)
- **Lifetime:** Long because it's more secure

### The Math

**Current (Broken):**
```
Login → 15 minutes of access → Forced logout
```

**After Fix:**
```
Login → 7 days of access (with automatic 15min renewals)

Day 1: 96 automatic refreshes (24 hours × 4 per hour)
Day 2: 96 automatic refreshes
...
Day 7: User must login again (7-day refresh token expires)
```

### Does the Clock Reset on Login?

**Access Token (15m):**
- ✅ YES - Resets every time it's refreshed
- If you refresh at minute 14, you get another 15 minutes

**Refresh Token (7d):**
- ✅ YES - Rotates on each use with new 7-day expiry
- If you refresh on day 6, you get another 7 days
- **This means:** As long as you visit within 7 days, you never logout!

**Inactivity Logout:**
- If you don't visit for 7 days → refresh token expires → must login again
- This is intentional (abandoned accounts should logout)

---

## Security Best Practices Checklist

Your system already has:

- ✅ Short-lived access tokens (15m)
- ✅ Long-lived refresh tokens (7d)
- ✅ httpOnly cookies (XSS protection)
- ✅ Secure cookies (HTTPS only)
- ✅ Token rotation (refresh tokens are one-time use)
- ✅ CORS configuration
- ✅ Account lockout (5 failed attempts)
- ✅ Security event logging

Just needs:

- ❌ Fix SameSite to 'none' for cross-origin cookies
- ⚠️ Consider proxy architecture for same-origin (long-term)

---

## Conclusion

**Your Question:** "Why am I not given the proper refreshed JWT?"

**Answer:** The refresh token cookie isn't being sent from frontend to backend due to `sameSite: 'lax'` blocking cross-origin POST requests.

**Your System is Well-Designed:** The dual-token pattern with httpOnly cookies is industry best practice. You just have a cookie configuration issue, not an architectural problem.

**The Fix:** Change `sameSite: 'lax'` to `sameSite: 'none'` in your cookie settings. This allows cross-origin requests while maintaining httpOnly security.

**After Fix:** You'll have the intended behavior:
- 15-minute access tokens refresh automatically
- Stay logged in for 7 days of activity
- Logout only after 7 days of inactivity
- Protected from XSS attacks
- Minimal damage window if token stolen

---

**Questions?**
- Check [SECURITY_REFERENCE.md](./SECURITY_REFERENCE.md) for auth architecture details
- Review [CLAUDE.md](../CLAUDE.md) for project overview
