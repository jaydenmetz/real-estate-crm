# Authentication Broken - Diagnosis & Fix

**Issue:** Login and Register endpoints returning INTERNAL_ERROR
**Status:** 🚨 CRITICAL - Blocking all testing
**Date:** 2025-10-30

---

## Symptoms

### 1. Login Returns INTERNAL_ERROR
```bash
curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jaydenmetz.com","password":"AdminPassword123!"}'

# Response:
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An error occurred processing your request",
    "errorId": "ERR_1761859980273_w8xo0924m"
  }
}
```

### 2. Register Also Returns INTERNAL_ERROR
```bash
curl -X POST https://api.jaydenmetz.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!",...}'

# Response: Same INTERNAL_ERROR
```

### 3. Other Endpoints Respond Normally
- `/v1/health` requires auth (expected)
- `/` returns NOT_FOUND (expected)
- API is running and responding

---

## Root Cause Analysis

Since BOTH login and register fail with INTERNAL_ERROR, the issue is likely:

### Most Likely: Database Connection Issue

**Evidence:**
- Auth endpoints require database access
- Both login and register fail (different code paths, same database dependency)
- No other endpoints tested (they all require auth)

**Check:**
1. Railway database is running
2. Connection string is correct
3. Database credentials haven't changed
4. Connection pool isn't exhausted

### Less Likely: Code Error

**Evidence:**
- Recent commits didn't touch auth code
- Only touched escrows controller and service
- Auth code unchanged since before

**But check:**
- Did we accidentally break something in shared code?
- Middleware error?
- Service initialization error?

---

## How to Diagnose (You Need Railway Access)

### Step 1: Check Railway Logs (CRITICAL)

1. Go to https://railway.app
2. Select your backend service
3. Click "Deployments" → Latest deployment
4. Look for errors in logs:

**Look for these error patterns:**
```
Error: connect ECONNREFUSED
Error: password authentication failed
Error: relation "users" does not exist
TypeError: Cannot read property 'xxx' of undefined
Error: getDetailData is not a function
```

### Step 2: Check Database Status

1. In Railway dashboard, go to your PostgreSQL service
2. Check if it's running (should show "Active")
3. Check CPU/Memory usage (should be normal)
4. Check connections (should not be maxed out)

### Step 3: Check Environment Variables

1. Go to backend service → Variables tab
2. Verify these exist and are correct:
   - `DATABASE_HOST` - Should be ballast.proxy.rlwy.net
   - `DATABASE_PORT` - Should be 20017
   - `DATABASE_NAME` - Should be railway
   - `DATABASE_USER` - Should be postgres
   - `PGPASSWORD` - Should be your database password
   - `JWT_SECRET` - Should exist (any value)

### Step 4: Check Recent Deployments

1. Compare latest deployment with previous working one
2. Check if build succeeded
3. Check if service restarted properly
4. Look for any warning messages

---

## Quick Fixes to Try

### Fix 1: Restart Backend Service

In Railway:
1. Go to backend service
2. Click "Settings" → "Restart"
3. Wait 30 seconds
4. Try login again

### Fix 2: Restart Database

In Railway:
1. Go to PostgreSQL service
2. Click "Settings" → "Restart"
3. Wait 1 minute for database to come back up
4. Try login again

### Fix 3: Redeploy Latest Commit

In Railway:
1. Go to "Deployments" tab
2. Click "Redeploy" on latest commit
3. Wait for build to complete
4. Try login again

### Fix 4: Rollback to Last Working Commit

If all else fails:
```bash
git log --oneline | head -10

# Find the last commit before our changes (before f012188)
git revert c2e5d0f  # Revert test results
git revert 912db40  # Revert testing guide
git revert 6665900  # Revert simplified docs
git revert 665a0b5  # Revert simplified API
git revert f012188  # Revert original detail API

git push origin main
```

---

## Alternative: Test Detail API Locally

Since Railway is broken, test the new detail API on your local machine:

### Step 1: Start Backend Locally

```bash
cd /Users/jaydenmetz/Desktop/real-estate-crm/backend

# Make sure environment variables are set
export DATABASE_HOST=ballast.proxy.rlwy.net
export DATABASE_PORT=20017
export DATABASE_USER=postgres
export DATABASE_NAME=railway
export PGPASSWORD="your_password_here"
export JWT_SECRET="any_secret_value"

# Start server
npm run dev
```

### Step 2: Test Login Locally

```bash
curl -X POST http://localhost:5050/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jaydenmetz.com","password":"AdminPassword123!"}'
```

### Step 3: Test Detail API Locally

```bash
# Get token from login response above
TOKEN="paste_token_here"

# Get escrows list
curl -X GET http://localhost:5050/v1/escrows \
  -H "Authorization: Bearer $TOKEN"

# Get escrow detail with new API
curl -X GET http://localhost:5050/v1/escrows/ESCROW_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

## What to Look For in Logs

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: getaddrinfo ENOTFOUND ballast.proxy.rlwy.net
```
**Fix:** Check DATABASE_HOST and DATABASE_PORT env vars

### Authentication Error
```
Error: password authentication failed for user "postgres"
```
**Fix:** Check PGPASSWORD env var

### Table Missing Error
```
Error: relation "users" does not exist
```
**Fix:** Database not migrated, run migrations

### Code Error
```
TypeError: Cannot read property 'getDetailData' of undefined
ReferenceError: escrowsService is not defined
```
**Fix:** Code bug, check recent changes

---

## Expected Behavior After Fix

Once auth is working again, you should see:

```bash
curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jaydenmetz.com","password":"AdminPassword123!"}'

# Expected response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "email": "admin@jaydenmetz.com",
      "first_name": "Jayden",
      "last_name": "Metz"
    }
  }
}
```

---

## Next Steps After Fix

1. ✅ Fix auth issue (Railway logs will tell you what's wrong)
2. ✅ Re-run Phase 1 tests
3. ✅ Verify detail API works
4. ✅ Proceed to Phase 2 (Update DetailTemplate)

---

## Summary

**Problem:** Auth endpoints returning INTERNAL_ERROR
**Likely Cause:** Database connection issue
**Solution:** Check Railway logs to see exact error
**Alternative:** Test locally while Railway is broken
**Status:** BLOCKED until auth is fixed

**You need to:**
1. Open Railway dashboard
2. Check logs for error messages
3. Share error message if you need help
4. Or test locally following steps above
