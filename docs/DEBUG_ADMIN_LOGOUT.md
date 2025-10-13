# Debug: Auto-Logout on /admin Route

## Problem
When navigating to `/admin`, you get logged out immediately before seeing any console messages.

## Root Cause Analysis

### What Happens on Page Load
1. **AuthContext.jsx** runs `verifyAuth()` on mount
2. Checks if user has token in **memory** (it doesn't after page refresh)
3. Sees user data in localStorage → tries to restore session
4. Calls `authService.refreshAccessToken()` to get new token from httpOnly cookie
5. **If refresh fails** → calls `authService.logout()` → redirects to `/login`

### Why Refresh Token Might Fail

**Check 1: Cookie Exists**
Open DevTools → Application tab → Cookies → `https://crm.jaydenmetz.com`
- Should see cookie named `refreshToken`
- Should have `HttpOnly` flag enabled
- Should have expiration date in future

**Check 2: Cookie Domain/Path**
- Domain should be `.jaydenmetz.com` (with leading dot for subdomain sharing)
- Path should be `/`
- SameSite should be `Strict` or `Lax`

**Check 3: Token Expiry**
Refresh tokens expire after a certain time (check backend config):
- Default: 7 days
- If you logged in more than 7 days ago → token expired → logout

**Check 4: Backend Refresh Endpoint**
The `/v1/auth/refresh` endpoint might be returning 401 if:
- Refresh token not in database (deleted or invalidated)
- Refresh token expired
- Refresh token revoked
- Database connection issue

## Quick Debug Steps

### Step 1: Check if Refresh Token Cookie Exists
```javascript
// In browser console on https://crm.jaydenmetz.com
document.cookie.split('; ').find(c => c.startsWith('refreshToken='))
```
- If returns `undefined` → **Cookie missing** (you're not actually logged in)
- If returns string → Cookie exists (proceed to step 2)

### Step 2: Test Refresh Endpoint Manually
```bash
# Get your refresh token cookie value first, then:
curl -X POST https://api.jaydenmetz.com/v1/auth/refresh \
  -H "Cookie: refreshToken=YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```
- If returns 401 → Token invalid/expired
- If returns 200 with accessToken → Token works (problem elsewhere)

### Step 3: Check Auth Verification Timing
The issue might be **double verification**:
1. AuthContext verifies on mount (line 82) → forces refresh
2. ProtectedRoute checks immediately (line 27) → sees loading=false but token still refreshing
3. Race condition → logout before refresh completes

### Step 4: Add Temporary Debug Logging
In `frontend/src/services/auth.service.js` line 258-291, add console.logs:

```javascript
// Around line 258
if (this.user && !this.token && !this.apiKey) {
  console.log('🔄 DEBUG: Starting token refresh from httpOnly cookie');
  console.log('🔄 DEBUG: User exists:', !!this.user);
  console.log('🔄 DEBUG: Token in memory:', !!this.token);
  console.log('🔄 DEBUG: API key:', !!this.apiKey);

  try {
    const refreshResult = await this.refreshAccessToken();
    console.log('🔄 DEBUG: Refresh result:', refreshResult);

    if (refreshResult.success) {
      console.log('✅ DEBUG: Token refreshed successfully');
      console.log('✅ DEBUG: New token exists:', !!this.token);
    } else {
      console.warn('❌ DEBUG: Token refresh failed:', refreshResult.error);
      console.warn('❌ DEBUG: About to logout...');
    }
  } catch (error) {
    console.error('❌ DEBUG: Token refresh threw error:', error);
  }
}
```

## Most Likely Solution

**Your refresh token cookie is missing or expired.**

### How to Fix:
1. **Log out completely** (click logout button)
2. **Clear all cookies** for `crm.jaydenmetz.com` and `api.jaydenmetz.com`
3. **Clear localStorage**:
   ```javascript
   localStorage.clear()
   ```
4. **Close browser** (to clear any in-memory state)
5. **Open fresh browser window**
6. **Log in again** with fresh credentials
7. **Check cookie is set**:
   ```javascript
   document.cookie.split('; ').find(c => c.startsWith('refreshToken='))
   ```
8. **Navigate to /admin immediately** (while token is fresh)

### If Still Failing:

Check backend refresh token configuration in `backend/src/controllers/auth.controller.js`:
- Ensure cookie is being set with correct domain
- Check `jwtRefreshExpiry` value (should be `7d` or similar)
- Verify `RefreshTokenService.rotateRefreshToken()` is working
- Check database `refresh_tokens` table for your user's tokens

## Alternative: Use API Key Auth

Since you're system_admin, you could use API key authentication instead:
1. Go to `/settings#api-keys`
2. Create a new API key
3. API keys don't expire and don't need refresh tokens
4. Stored in localStorage (safe for API keys, not JWT tokens)

## Protected Routes Summary

Your app has **13 protected route checks**:
- 1 main wrapper (all routes)
- 1 onboarding flow
- 7 admin-only health dashboards (require `system_admin` role)
- 1 admin panel (require `system_admin` role) ← **This is where you're getting logged out**

The `/admin` route has **double protection**:
```jsx
<ProtectedRoute>  // Line 300 - checks basic auth
  <ProtectedRoute requiredRole="system_admin">  // Line 361 - checks admin role
    <AdminPanel />
  </ProtectedRoute>
</ProtectedRoute>
```

Both checks run `isAuthenticated()` which triggers token refresh if token not in memory.

## Next Steps

1. Check if refresh token cookie exists
2. If missing → fresh login needed
3. If exists but expired → fresh login needed
4. If exists and valid → add debug logging to see where refresh fails
5. Consider using API key auth for admin access (more reliable)
