# Railway Authentication Fix Guide

## Problem
After Railway redeployment, authentication is failing because the JWT_SECRET environment variable is not set correctly.

## Solution

### 1. Set the JWT_SECRET in Railway Dashboard

Go to your Railway project dashboard and set the following environment variable:

```
JWT_SECRET=279fffb2e462a0f2d8b41137be7452c4746f99f2ff3dd0aeafb22f2e799c1472
```

This is the same secret that's hardcoded as a fallback in the auth controller.

### 2. Verify Other Required Environment Variables

Make sure these are also set in Railway:

```
NODE_ENV=production
PORT=5050
API_VERSION=v1
DATABASE_URL=postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway
```

### 3. Test Authentication

After setting the environment variables and Railway redeploys:

1. Clear your browser's localStorage:
   ```javascript
   localStorage.clear()
   ```

2. Try logging in with:
   - Username: `admin` or `admin@jaydenmetz.com`
   - Password: `Password123!`
   
   OR
   
   - Username: `jaydenmetz` or `realtor@jaydenmetz.com`
   - Password: `Password123!`

### 4. Verify Username Display

Once logged in, go to Settings page. The username should now display correctly when you click "View Public Profile".

## Alternative: Update Production Code

If you prefer to use a different JWT secret, update the fallback in `/backend/src/controllers/auth.controller.js`:

```javascript
// Change this line in all JWT sign calls:
process.env.JWT_SECRET || '279fffb2e462a0f2d8b41137be7452c4746f99f2ff3dd0aeafb22f2e799c1472'

// To match your production secret:
process.env.JWT_SECRET || '69f1e69d189afcf71dbdba8b7fa4668566ba5491a'
```

## Public Profile Routes

The following routes are accessible without authentication:
- `/profile/{username}` - Public profile pages
- `/login` - Login page
- `/register` - Registration page

All other routes require authentication.