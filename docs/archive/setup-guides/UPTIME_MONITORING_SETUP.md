# Uptime Monitoring Setup - UptimeRobot

**Phase 7: Testing Foundation**
**Service:** UptimeRobot (Free Tier - 50 monitors)
**Purpose:** Monitor health endpoints and alert on downtime

---

## Quick Setup (5 Minutes)

### Step 1: Create UptimeRobot Account
1. Go to https://uptimerobot.com/
2. Click "Sign Up Free" (no credit card required)
3. Verify email address
4. Login to dashboard

---

### Step 2: Add Monitors

**Monitor 1: API Health Check**
- **Monitor Type:** HTTP(s)
- **Friendly Name:** Real Estate CRM - API Health
- **URL:** `https://api.jaydenmetz.com/v1/health`
- **Monitoring Interval:** 5 minutes
- **Monitor Timeout:** 30 seconds
- **Expected HTTP Status:** 200
- **Keyword to Check:** `"status":"healthy"` (optional but recommended)

**Monitor 2: Security Events Health**
- **Monitor Type:** HTTP(s)
- **Friendly Name:** Real Estate CRM - Security Events
- **URL:** `https://api.jaydenmetz.com/v1/security-events/health`
- **Monitoring Interval:** 5 minutes
- **Monitor Timeout:** 30 seconds
- **Expected HTTP Status:** 200

**Monitor 3: Frontend Health**
- **Monitor Type:** HTTP(s)
- **Friendly Name:** Real Estate CRM - Frontend
- **URL:** `https://crm.jaydenmetz.com/`
- **Monitoring Interval:** 5 minutes
- **Monitor Timeout:** 30 seconds
- **Expected HTTP Status:** 200

**Monitor 4: Admin Health Dashboard**
- **Monitor Type:** HTTP(s)
- **Friendly Name:** Real Estate CRM - Health Dashboard
- **URL:** `https://crm.jaydenmetz.com/health`
- **Monitoring Interval:** 15 minutes
- **Monitor Timeout:** 30 seconds
- **Expected HTTP Status:** 200

---

### Step 3: Configure Alert Contacts

1. Go to **My Settings → Alert Contacts**
2. Click **Add Alert Contact**
3. Choose **Email**
   - Email: admin@jaydenmetz.com
   - Email Threshold: Alert when down
4. Click **Create Alert Contact**

**Optional: Add SMS Alerts**
- If you want SMS, add phone number
- Free tier: Limited SMS credits

---

### Step 4: Enable Alerts for Monitors

1. Go to **Dashboard**
2. For each monitor, click the **Edit** button
3. Scroll to **Alert Contacts to Notify**
4. Check the box next to your email
5. Click **Save Changes**

---

## Alert Configuration

### Recommended Settings

**Alert When:**
- Monitor is down for 5 minutes (1 failed check)
- Response time > 5 seconds (performance degradation)

**Alert Frequency:**
- Send alert immediately on downtime
- Send "back up" notification when service recovers
- Don't send alerts more than once per hour (avoid spam)

**Example Alert Email:**
```
Subject: ⚠️ Real Estate CRM - API Health is DOWN

Monitor: Real Estate CRM - API Health
Status: DOWN
Duration: 5 minutes
URL: https://api.jaydenmetz.com/v1/health
Reason: Connection timeout

UptimeRobot will continue monitoring and notify you when it's back up.
```

---

## What to Monitor

### Critical Endpoints (Free Tier - 4 Monitors)
1. **API Health** - Core backend functionality
2. **Security Events** - Security logging system
3. **Frontend** - User-facing application
4. **Health Dashboard** - Monitoring interface

### Optional Endpoints (If Upgrading)
5. Database health endpoint (requires custom endpoint)
6. WebSocket connection health
7. Individual module health checks (escrows, listings, etc.)

---

## Benefits

**✅ Free Tier Includes:**
- 50 monitors (we use 4)
- 5-minute check intervals
- Email alerts
- 50 SMS credits/month
- Public status page
- 2-month data retention

**🎯 What You Get:**
- Instant downtime notifications
- Uptime percentage tracking
- Response time graphs
- Historical data
- Public status page (optional)

---

## Monitoring Dashboard

### View Uptime Statistics
1. Login to https://uptimerobot.com/dashboard
2. See current status of all monitors
3. View uptime percentage (should be 99%+)
4. Check response time trends

### Example Dashboard View:
```
Real Estate CRM - API Health        ✅ UP (99.98% uptime)
Real Estate CRM - Security Events   ✅ UP (99.95% uptime)
Real Estate CRM - Frontend          ✅ UP (99.99% uptime)
Real Estate CRM - Health Dashboard  ✅ UP (100% uptime)
```

---

## Public Status Page (Optional)

### Create Public Status Page
1. Go to **Public Status Pages**
2. Click **Add New Public Status Page**
3. Choose monitors to display
4. Customize URL: `realestatecrm.betteruptime.com`
5. Share with team or clients

**Benefits:**
- Transparency for users
- Self-service status checking
- Professional appearance

---

## Alternative: Railway Cron Health Checks

If you prefer to keep monitoring within Railway:

### Create Health Check Script
```javascript
// backend/scripts/healthCheck.js
const axios = require('axios');
const nodemailer = require('nodemailer');

const HEALTH_URL = 'https://api.jaydenmetz.com/v1/health';
const ALERT_EMAIL = 'admin@jaydenmetz.com';

async function checkHealth() {
  try {
    const response = await axios.get(HEALTH_URL, { timeout: 10000 });

    if (response.status !== 200 || response.data.status !== 'healthy') {
      await sendAlert('Health check failed', response.data);
    }
  } catch (error) {
    await sendAlert('Health check error', error.message);
  }
}

async function sendAlert(subject, details) {
  // Configure your email service (SendGrid, AWS SES, etc.)
  console.error(`ALERT: ${subject}`, details);
  // Send email here
}

checkHealth();
```

### Add to Railway Cron
```yaml
# railway.yml
services:
  - name: health-check-cron
    buildCommand: npm install
    startCommand: node backend/scripts/healthCheck.js
    schedule: "*/5 * * * *" # Every 5 minutes
```

---

## Testing Alerts

### Manual Test
1. Temporarily break an endpoint (return 500 error)
2. Wait 5 minutes for UptimeRobot to detect
3. Verify you receive email alert
4. Fix endpoint
5. Verify "back up" notification

### Expected Alert Timeline:
- **T+0**: Endpoint goes down
- **T+5min**: UptimeRobot detects failure (1 check)
- **T+5min**: Email alert sent
- **T+10min**: Endpoint fixed
- **T+15min**: UptimeRobot detects recovery
- **T+15min**: "Back up" email sent

---

## Success Criteria

✅ **All 4 monitors configured**
✅ **Email alerts working**
✅ **Uptime > 99% for all monitors**
✅ **Response time < 500ms average**
✅ **Test alert received and confirmed**

---

## Phase 7 Impact

**Before Phase 7:**
- Manual checking required
- Downtime goes unnoticed
- No historical data

**After Phase 7:**
- Automatic downtime detection (5-minute intervals)
- Instant email alerts
- Uptime tracking and reporting
- Performance monitoring

**DevOps Score:** 8.5/10 → 9/10

---

## Next Steps

After setting up UptimeRobot:
1. Monitor for 1 week to ensure no false positives
2. Adjust alert thresholds if needed
3. Consider upgrading to Pro ($7/month) for:
   - 1-minute check intervals
   - Advanced reporting
   - More SMS credits
   - 1-year data retention

**Current Status:** Ready to deploy in production
