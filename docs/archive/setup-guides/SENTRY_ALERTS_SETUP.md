# Sentry Error Alerts Setup

**Phase 8: Production Hardening**
**Goal:** Real-time error notifications via email
**Service:** Sentry.io (Already Integrated)

---

## Current Sentry Integration Status

✅ **Backend:** Sentry already integrated
✅ **Frontend:** Sentry already integrated
✅ **Error Capture:** Working (errors sent to Sentry)
⚠️ **Alerts:** Need configuration (not set up yet)

**Sentry DSN:** Check `.env` files for `SENTRY_DSN`

---

## Step 1: Login to Sentry Dashboard

1. **Go to Sentry.io**
   - URL: https://sentry.io
   - Login with your credentials

2. **Select Project**
   - Organization: Your organization name
   - Project: "Real Estate CRM" (or similar)

3. **Verify Events Are Being Captured**
   - Go to **Issues** tab
   - Should see recent errors/events
   - If empty, Sentry may not be properly configured

---

## Step 2: Configure Alert Rules

### Alert Rule 1: High-Volume Errors (Critical)

**Purpose:** Alert when many errors occur in short time (potential outage)

1. **Create Alert Rule**
   - Go to **Alerts** → **Create Alert**
   - Choose **Issues**

2. **Configure Conditions**
   - **When:** An event is seen
   - **Filter:** `level:error OR level:fatal`
   - **Frequency:** More than 10 events
   - **Time Window:** in 1 hour
   - **Project:** Real Estate CRM

3. **Configure Actions**
   - **Then:** Send a notification to
   - **Delivery Method:** Email
   - **Recipients:** admin@jaydenmetz.com

4. **Set Alert Name**
   - Name: "High-Volume Errors (10+ per hour)"
   - Environment: production

5. **Save Alert Rule**

### Alert Rule 2: New Error Types (High Priority)

**Purpose:** Alert on first occurrence of new error

1. **Create Alert Rule**
   - Go to **Alerts** → **Create Alert**
   - Choose **Issues**

2. **Configure Conditions**
   - **When:** A new issue is created
   - **Filter:** `level:error OR level:fatal`
   - **Environment:** production

3. **Configure Actions**
   - **Then:** Send a notification to
   - **Delivery Method:** Email
   - **Recipients:** admin@jaydenmetz.com

4. **Set Alert Name**
   - Name: "New Production Error"
   - Save Alert Rule

### Alert Rule 3: User Impact Threshold (Medium Priority)

**Purpose:** Alert when many users affected

1. **Create Alert Rule**
   - Go to **Alerts** → **Create Alert**
   - Choose **Issues**

2. **Configure Conditions**
   - **When:** An event is seen
   - **Filter:** `level:error`
   - **Frequency:** Affecting more than 10 users
   - **Time Window:** in 1 hour

3. **Configure Actions**
   - **Then:** Send a notification to
   - **Delivery Method:** Email
   - **Recipients:** admin@jaydenmetz.com

4. **Set Alert Name**
   - Name: "High User Impact (10+ users)"
   - Save Alert Rule

### Alert Rule 4: Authentication Failures (Security)

**Purpose:** Alert on repeated auth failures (potential attack)

1. **Create Alert Rule**
   - Go to **Alerts** → **Create Alert**
   - Choose **Issues**

2. **Configure Conditions**
   - **When:** An event is seen
   - **Filter:** `message:"Authentication failed" OR message:"Unauthorized"`
   - **Frequency:** More than 50 events
   - **Time Window:** in 15 minutes

3. **Configure Actions**
   - **Then:** Send a notification to
   - **Delivery Method:** Email
   - **Recipients:** admin@jaydenmetz.com

4. **Set Alert Name**
   - Name: "Authentication Failure Spike"
   - Save Alert Rule

---

## Step 3: Configure Email Preferences

1. **Go to User Settings**
   - Click profile icon → **User Settings**

2. **Navigate to Notifications**
   - Left sidebar → **Notifications**

3. **Enable Email Notifications**
   - **Workflow Notifications:** ON
   - **Issue Alerts:** ON
   - **Deploy Notifications:** ON (optional)

4. **Set Email Frequency**
   - **Real-time:** Immediately (recommended for critical errors)
   - **Daily Digest:** OFF (for production)
   - **Weekly Report:** ON (for summaries)

5. **Configure Per-Project**
   - Go to **Project Settings** → **Alerts** → **Email**
   - Enable "Real Estate CRM" alerts

---

## Step 4: Test Sentry Alerts

### Test 1: Trigger Backend Error

**Create test endpoint:**

```javascript
// backend/src/routes/test.routes.js
router.get('/test/sentry-error', (req, res) => {
  // This will trigger Sentry error
  throw new Error('Test Sentry alert - please ignore');
});
```

**Trigger the error:**
```bash
curl https://api.jaydenmetz.com/v1/test/sentry-error
```

**Expected Result:**
- Error appears in Sentry dashboard within 30 seconds
- Email alert received within 5 minutes

### Test 2: Trigger Frontend Error

**Create test button in a component:**

```javascript
// Anywhere in React component
<Button onClick={() => {
  throw new Error('Frontend Sentry test - please ignore');
}}>
  Test Sentry
</Button>
```

**Trigger the error:**
- Click the test button
- Check Sentry dashboard
- Verify email alert received

### Test 3: High-Volume Test

**Trigger 15 errors rapidly:**

```bash
for i in {1..15}; do
  curl https://api.jaydenmetz.com/v1/test/sentry-error &
done
wait
```

**Expected Result:**
- "High-Volume Errors" alert triggered
- Email received: "10+ errors in 1 hour"

---

## Step 5: Configure Slack Alerts (Optional)

### If You Use Slack

1. **Install Sentry Slack App**
   - Go to Sentry dashboard
   - **Settings** → **Integrations**
   - Search for "Slack"
   - Click **Install**

2. **Connect Slack Workspace**
   - Choose workspace
   - Authorize Sentry

3. **Add Slack to Alert Rules**
   - Edit each alert rule
   - **Actions** → Add "Send a Slack notification"
   - Choose channel: #alerts or #engineering

4. **Test Slack Integration**
   - Trigger test error
   - Verify Slack message received

---

## Alert Email Examples

### Example 1: High-Volume Error Alert

```
Subject: [Sentry] High-Volume Errors (10+ per hour)

Real Estate CRM has generated 15 errors in the last hour:

Error: Cannot read property 'id' of undefined
  at EscrowCard.jsx:234
  Occurrences: 8
  Users affected: 3

Error: Network request failed
  at api.service.js:156
  Occurrences: 7
  Users affected: 5

View all issues: https://sentry.io/...
```

### Example 2: New Production Error

```
Subject: [Sentry] New Production Error

A new error was detected in Real Estate CRM:

Error: Invalid date format in appointment
  at AppointmentCard.jsx:109
  First seen: 2 minutes ago
  Users affected: 1

Stack trace:
  at formatDateTime (AppointmentCard.jsx:109)
  at AppointmentCard (AppointmentCard.jsx:156)
  ...

View issue: https://sentry.io/...
```

---

## Alert Response Workflow

### When You Receive an Alert

1. **Check Severity**
   - Critical: Drop everything, investigate now
   - High: Investigate within 30 minutes
   - Medium: Investigate within 2 hours
   - Low: Add to backlog

2. **Go to Sentry Dashboard**
   - Click link in email
   - Review stack trace
   - Check affected users count
   - Look at recent occurrences

3. **Determine Impact**
   - How many users affected?
   - Is functionality broken?
   - Can users work around it?

4. **Take Action**
   - **If critical:** Deploy hotfix immediately
   - **If high:** Create bug ticket, fix within 24 hours
   - **If medium:** Schedule fix in next sprint

5. **Mark as Resolved**
   - After fix deployed, mark issue as resolved in Sentry
   - Sentry will reopen if error recurs

---

## Sentry Best Practices

### 1. Add Context to Errors

```javascript
// Backend
Sentry.setUser({
  id: req.user.id,
  email: req.user.email,
  username: req.user.username
});

Sentry.setTag('api_endpoint', req.originalUrl);
Sentry.setTag('team_id', req.user.teamId);

// Frontend
Sentry.setUser({
  id: user.id,
  email: user.email
});

Sentry.setContext('page', {
  url: window.location.href,
  referrer: document.referrer
});
```

### 2. Capture Handled Errors

```javascript
// Don't just throw - capture context
try {
  await dangerousOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      operation: 'dangerousOperation',
      user_id: userId
    },
    extra: {
      attemptCount: 3,
      lastAttempt: new Date()
    }
  });
  throw error;
}
```

### 3. Filter Noise

**Ignore common errors:**

```javascript
// In Sentry initialization
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',

    // User-initiated cancellations
    'AbortError',
    'cancelled',

    // Network issues (user's connection, not our bug)
    'NetworkError when attempting to fetch resource',
    'Failed to fetch',
  ],
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
  ],
});
```

### 4. Set Release Tracking

```javascript
// In Sentry initialization
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: `real-estate-crm@${process.env.npm_package_version}`,
  environment: process.env.NODE_ENV,
});
```

**Benefits:**
- Track which version introduced errors
- See if new deploy increased error rate
- Rollback if needed

---

## Monitoring Sentry Health

### Weekly Review (Every Monday)

1. **Check Error Trends**
   - Go to Sentry dashboard
   - View last 7 days
   - Look for spikes or new patterns

2. **Review Top Errors**
   - Identify most frequent errors
   - Prioritize fixes based on impact
   - Create tickets for top 5

3. **Check Error Rate**
   - Should be < 1% of requests
   - If > 1%, investigate immediately

4. **Review User Impact**
   - How many unique users hit errors?
   - Are certain users hitting many errors?
   - Reach out to affected users

### Monthly Deep Dive (First Monday)

1. **Error Category Analysis**
   - Group errors by type (API, UI, DB, Auth)
   - Identify patterns
   - Plan systematic fixes

2. **Performance Review**
   - Check transaction performance
   - Identify slow endpoints (> 1s)
   - Optimize bottlenecks

3. **Release Comparison**
   - Compare error rates across releases
   - Identify problematic deploys
   - Document lessons learned

---

## Success Criteria

✅ **4 alert rules configured**
✅ **Email notifications enabled**
✅ **Test alert received successfully**
✅ **Response workflow documented**
✅ **Context added to all Sentry calls**

---

## Phase 8 Impact

**Before Phase 8:**
- Errors captured but no alerts
- Manual Sentry dashboard checks required
- Slow response to critical issues

**After Phase 8:**
- Real-time email alerts for critical errors
- 10+ errors/hour = instant notification
- New errors = immediate awareness
- Security alerts for auth failures

**DevOps Score:** 9/10 → 9.5/10

---

## Cost

**Sentry Pricing:**
- **Free Tier:** 5,000 errors/month
- **Team Plan:** $26/month - 50,000 errors/month
- **Business Plan:** $80/month - 150,000 errors/month

**Current Usage:** Likely < 1,000 errors/month
**Recommendation:** Free tier is sufficient for now

---

## Alternative: Self-Hosted Error Tracking

If Sentry becomes expensive:

**GlitchTip** (Open-source Sentry alternative)
- Self-host on Railway or DigitalOcean
- Sentry-compatible API
- No usage limits
- Cost: ~$5/month for small VPS

**Current Recommendation:** Stick with Sentry.io for simplicity

---

## Final Checklist

- [ ] Login to Sentry dashboard
- [ ] Verify project "Real Estate CRM" exists
- [ ] Create 4 alert rules (high-volume, new errors, user impact, auth failures)
- [ ] Enable email notifications
- [ ] Test alert with /test/sentry-error endpoint
- [ ] Verify email received
- [ ] Configure Slack alerts (optional)
- [ ] Document response workflow
- [ ] Add to weekly monitoring routine

**Time to Complete:** 1-2 hours
**Current Status:** Ready to configure
