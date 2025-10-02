# Security Operations Guide
**Real Estate CRM - Day-to-Day Security Operations**

**Last Updated:** October 2, 2025
**Purpose:** Operational procedures for security monitoring and incident response

---

## Table of Contents
1. [Health Check Monitoring](#health-check-monitoring)
2. [Security Event Monitoring](#security-event-monitoring)
3. [Sentry Error Tracking](#sentry-error-tracking)
4. [Incident Response](#incident-response)
5. [Common Security Tasks](#common-security-tasks)

---

## Health Check Monitoring

### 3-Tier Access Control Architecture

**Problem Statement:** Don't expose error logs or system diagnostics to paying customers.

**Solution:** Three-tier security model separating public status, admin diagnostics, and module-specific health checks.

```
┌──────────────────────────────────────────────────────────┐
│           PUBLIC ACCESS (No Authentication)               │
│                                                           │
│  GET /v1/status/public  - Operational status            │
│  GET /v1/status/ping    - Uptime check                  │
│  GET /v1/status/health  - Load balancer health          │
│                                                           │
│  Customers see:                                          │
│  ✅ "All systems operational" or "Experiencing issues"  │
│  ✅ Component status (API, Database, Auth) green/red    │
│                                                           │
│  Customers DON'T see:                                    │
│  ❌ Error logs or stack traces                          │
│  ❌ Database metrics (connections, memory, CPU)         │
│  ❌ Table sizes or query performance                    │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│        ADMIN ACCESS (Authentication Required)            │
│                                                           │
│  GET /v1/health           - Full system diagnostics     │
│  GET /v1/health/postgres  - Database deep dive          │
│  GET /v1/health/redis     - Cache diagnostics           │
│  GET /v1/health/auth      - Authentication stats        │
│                                                           │
│  Requires:                                               │
│  1. Valid JWT token OR API key                          │
│  2. User role = "system_admin"                          │
│                                                           │
│  Admin sees:                                             │
│  ✅ Complete error details and stack traces             │
│  ✅ Database connection pools                           │
│  ✅ Memory and CPU usage                                │
│  ✅ Table sizes and growth trends                       │
│  ✅ Slow query analysis                                 │
│  ✅ API key statistics                                  │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│  MODULE HEALTH (Authentication + Module Access)          │
│                                                           │
│  GET /v1/escrows/health/enhanced  - Escrow tests        │
│  GET /v1/listings/health/enhanced - Listings tests      │
│  GET /v1/clients/health/enhanced  - Clients tests       │
│                                                           │
│  Requires:                                               │
│  1. Valid JWT token OR API key                          │
│  2. Access to specific module (team permissions)        │
│                                                           │
│  Users see:                                              │
│  ✅ CRUD operations working/failing (their own data)    │
│  ✅ Authentication validation                           │
│  ✅ Permission checks                                   │
│  ❌ NO system-wide errors or diagnostics                │
└──────────────────────────────────────────────────────────┘
```

### Endpoint Access Reference

| Endpoint | Access | Shows | Use Case |
|----------|--------|-------|----------|
| `GET /v1/status/public` | 🌍 Public | "All systems operational" | Customer status page |
| `GET /v1/status/ping` | 🌍 Public | `{status: "ok"}` | UptimeRobot monitoring |
| `GET /v1/status/health` | 🌍 Public | 200 = healthy, 503 = down | Load balancer check |
| `GET /v1/health` | 🔒 Admin | Full diagnostics | Troubleshooting issues |
| `GET /v1/health/postgres` | 🔒 Admin | Database deep dive | Query optimization |
| `GET /v1/escrows/health/enhanced` | 🔑 Auth | Module tests | Customer testing access |

### Public Status Endpoint

**URL:** `GET /v1/status/public`
**Authentication:** None required

**Response (Operational):**
```json
{
  "success": true,
  "data": {
    "service": "Real Estate CRM API",
    "status": "operational",
    "timestamp": "2025-10-02T21:00:00Z",
    "message": "All systems operational",
    "components": [
      {"name": "API Server", "status": "operational"},
      {"name": "Database", "status": "operational"},
      {"name": "Escrows", "status": "operational"},
      {"name": "Listings", "status": "operational"},
      {"name": "Authentication", "status": "operational"}
    ]
  }
}
```

**Response (Degraded/Outage):**
```json
{
  "status": "degraded",  // or "outage"
  "message": "Some systems experiencing issues. We're working on it.",
  "components": [
    {"name": "Database", "status": "outage", "description": "Data storage and retrieval"}
  ]
}
```

### Admin Health Endpoint

**URL:** `GET /v1/health`
**Authentication:** JWT token OR API key (system_admin role)

**Response:**
```json
{
  "success": true,
  "data": {
    "service": "Real Estate CRM API",
    "status": "healthy",
    "timestamp": "2025-10-02T21:00:00Z",
    "uptime": 864000,  // seconds
    "version": "1.0.0",

    // System Resources
    "system": {
      "memory": {
        "total": "8 GB",
        "used": "2.5 GB",
        "free": "5.5 GB",
        "percentage": 31.25
      },
      "cpu": {
        "usage": 12.5,  // percentage
        "cores": 4
      }
    },

    // Database Health
    "database": {
      "status": "healthy",
      "responseTime": 12,  // ms
      "connections": {
        "active": 3,
        "idle": 7,
        "max": 20
      },
      "topTables": [
        {"name": "escrows", "size": "15 MB", "rows": 1247},
        {"name": "clients", "size": "8 MB", "rows": 892}
      ]
    },

    // Authentication Stats
    "auth": {
      "activeUsers": 12,
      "activeSessions": 23,
      "apiKeys": 5
    }
  }
}
```

### Frontend Integration

**Public Status Page** (customers see):
```javascript
// No authentication needed
const response = await fetch('https://api.jaydenmetz.com/v1/status/public');
const {data} = await response.json();

// Display component statuses
data.components.forEach(comp => {
  console.log(`${comp.name}: ${comp.status}`);  // operational, degraded, outage
});
```

**Admin Health Dashboard** (you see):
```javascript
// Requires JWT token
const response = await fetch('https://api.jaydenmetz.com/v1/health', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});

const {data} = await response.json();
console.log(`Memory usage: ${data.system.memory.percentage}%`);
console.log(`DB connections: ${data.database.connections.active}/${data.database.connections.max}`);
```

---

## Security Event Monitoring

### Query Security Events

**URL:** `GET /v1/security-events`
**Authentication:** JWT token OR API key

**Query Parameters:**
```javascript
{
  eventType: 'login_failed',           // Specific event type
  eventCategory: 'authentication',     // Category filter
  severity: 'warning',                 // info, warning, error, critical
  startDate: '2025-09-01T00:00:00Z',  // Date range start
  endDate: '2025-09-30T23:59:59Z',    // Date range end
  success: false,                      // Filter by success/failure
  limit: 100,                          // Results per page
  offset: 0                            // Pagination offset
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "event_type": "login_failed",
        "event_category": "authentication",
        "severity": "warning",
        "user_id": "uuid",
        "email": "user@example.com",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "success": false,
        "message": "Invalid password",
        "created_at": "2025-10-02T14:30:00Z"
      }
    ],
    "total": 247,
    "page": 1,
    "pages": 3
  }
}
```

### Common Security Queries

#### Failed Login Attempts (Last 24 Hours)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.jaydenmetz.com/v1/security-events?eventType=login_failed&startDate=$(date -u -d '24 hours ago' '+%Y-%m-%dT%H:%M:%SZ')"
```

#### Account Lockouts (Last 7 Days)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.jaydenmetz.com/v1/security-events?eventType=account_locked&startDate=$(date -u -d '7 days ago' '+%Y-%m-%dT%H:%M:%SZ')"
```

#### Critical Events (Admin Only)
```bash
GET /v1/security-events/critical?daysBack=7
```

#### Geographic Anomalies
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.jaydenmetz.com/v1/security-events?eventType=geo_anomaly&severity=warning"
```

### Security Event Statistics

**URL:** `GET /v1/security-events/stats?daysBack=30`

**Response:**
```json
{
  "success": true,
  "data": {
    "authentication": {
      "total_events": 1250,
      "successful_events": 1200,
      "failed_events": 50,
      "lockouts": 2
    },
    "data_access": {
      "total_events": 5420,
      "successful_events": 5420,
      "failed_events": 0
    },
    "api_key": {
      "total_events": 3200,
      "successful_events": 3180,
      "failed_events": 20
    }
  }
}
```

### Recent Events (Quick Access)

**URL:** `GET /v1/security-events/recent`

**Response:** Last 50 events for current user (no query params needed)

---

## Sentry Error Tracking

### Setup Status

**Current Status:** ✅ Configured and ready
**DSN:** Configured via `SENTRY_DSN` environment variable
**Environment:** `production`

### Sentry Configuration

```javascript
// backend/src/app.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  tracesSampleRate: 0.1,  // 10% performance monitoring

  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove passwords from error logs
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.newPassword;
    }
    return event;
  },
});

// Error handler (must be before other middleware)
Sentry.setupExpressErrorHandler(app);
```

### What Sentry Tracks

**Automatic Tracking:**
- ✅ Unhandled exceptions
- ✅ Unhandled promise rejections
- ✅ Express route errors
- ✅ Database connection failures
- ✅ API request failures (with context)

**Manual Tracking:**
```javascript
// Capture specific error with context
Sentry.captureException(error, {
  tags: {
    module: 'escrows',
    operation: 'create',
  },
  user: {
    id: req.user?.id,
    email: req.user?.email,
  },
});
```

### Viewing Sentry Errors

1. **Log in to Sentry:** https://sentry.io
2. **Select Project:** Real Estate CRM - Production
3. **View Issues:** Filter by severity, module, user

**Key Metrics to Monitor:**
- Error frequency (should be <1% of requests)
- Response time (should be <500ms average)
- Failed requests (should be <0.1%)

---

## Incident Response

### Security Incident Response Procedure

#### 1. Detection
**Triggered by:**
- Sentry critical error alert
- Security event spike (>100 failed logins/hour)
- Customer report of suspicious activity
- Manual audit finding

#### 2. Assessment (Within 15 minutes)
```bash
# Check recent security events
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.jaydenmetz.com/v1/security-events/critical?daysBack=1"

# Check system health
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.jaydenmetz.com/v1/health"

# Check Sentry dashboard for errors
```

**Classify Severity:**
- **P0 (Critical):** Data breach, system down, authentication broken
- **P1 (High):** Partial outage, performance degradation >50%
- **P2 (Medium):** Individual user issues, minor bugs
- **P3 (Low):** Enhancement requests, cosmetic issues

#### 3. Containment (Within 30 minutes for P0/P1)

**Compromised Account:**
```sql
-- Disable user account
UPDATE users SET is_active = false WHERE email = 'compromised@example.com';

-- Revoke all sessions
DELETE FROM refresh_tokens WHERE user_id = 'user-uuid';

-- Revoke API keys
UPDATE api_keys SET revoked_at = NOW() WHERE user_id = 'user-uuid';
```

**Suspicious IP:**
```bash
# Check security events from IP
curl "https://api.jaydenmetz.com/v1/security-events?ipAddress=192.168.1.1"

# Temporarily block IP (add to rate limiter blacklist)
# Note: Implement IP blacklist feature if needed
```

**Database Breach:**
```bash
# 1. Rotate all secrets immediately
# 2. Force logout all users (delete all refresh tokens)
psql $DATABASE_URL -c "DELETE FROM refresh_tokens;"

# 3. Invalidate all API keys
psql $DATABASE_URL -c "UPDATE api_keys SET revoked_at = NOW();"

# 4. Notify all users via email
```

#### 4. Investigation
- Review Sentry error logs
- Query security_events table for patterns
- Check database audit logs
- Review recent deployments (git log)

#### 5. Resolution
- Deploy fix to production
- Verify fix in production
- Monitor for 24 hours

#### 6. Post-Mortem (Within 72 hours)
**Document:**
- Timeline of events
- Root cause analysis
- Immediate fixes applied
- Long-term improvements needed
- Lessons learned

---

## Common Security Tasks

### Rotate JWT Secret

**When:** Every 90 days (recommended) or immediately if compromised

```bash
# 1. Generate new secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 2. Update Railway environment variable
# Railway Dashboard → Environment → JWT_SECRET

# 3. Restart application (Railway auto-restarts)

# 4. Force logout all users
psql $DATABASE_URL -c "DELETE FROM refresh_tokens;"

# 5. Notify users via email
```

### Rotate Database Password

**When:** Every 90 days or immediately if exposed

```bash
# 1. Generate new password in Railway
# Railway Dashboard → PostgreSQL → Settings → Reset Password

# 2. Update DB_PASSWORD environment variable
# Railway Dashboard → API Service → Environment → DB_PASSWORD

# 3. Restart application (Railway auto-restarts)

# 4. Verify connection
curl https://api.jaydenmetz.com/v1/health
```

### Revoke Compromised API Key

```bash
# Via API
curl -X DELETE \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.jaydenmetz.com/v1/api-keys/{key-id}"

# Via Database
psql $DATABASE_URL -c "UPDATE api_keys SET revoked_at = NOW() WHERE id = 'key-uuid';"
```

### Unlock User Account

```bash
# Via Database
psql $DATABASE_URL -c "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = 'user@example.com';"

# Or wait 30 minutes for automatic unlock
```

### Export User Security Events (GDPR)

```bash
# CSV export for user
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.jaydenmetz.com/v1/gdpr/security-events/export?userId=user-uuid" \
  -o user-security-events.csv
```

### Delete User Data (GDPR Right to Erasure)

```bash
# Delete all security events for user
curl -X DELETE \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.jaydenmetz.com/v1/gdpr/security-events/user/{user-uuid}"

# Or anonymize (preserve audit trail)
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.jaydenmetz.com/v1/gdpr/security-events/anonymize/{user-uuid}"
```

---

## Monitoring Checklist

### Daily (Automated)
- ✅ Check Sentry for critical errors (email alerts)
- ✅ Review failed login attempts (security_events table)
- ✅ Monitor system health (`/v1/health`)

### Weekly (Manual - 15 minutes)
```bash
# 1. Review security event statistics
curl https://api.jaydenmetz.com/v1/security-events/stats?daysBack=7

# 2. Check for account lockouts
curl https://api.jaydenmetz.com/v1/security-events?eventType=account_locked&startDate=$(date -u -d '7 days ago' '+%Y-%m-%dT%H:%M:%SZ')

# 3. Review critical events
curl https://api.jaydenmetz.com/v1/security-events/critical?daysBack=7

# 4. Check npm vulnerabilities
cd backend && npm audit
```

### Monthly (Manual - 1 hour)
- Run full security audit (see SECURITY_REFERENCE.md)
- Review API key usage and rotate unused keys
- Update dependencies (`npm audit fix`)
- Review user access levels
- Backup security_events table

### Quarterly (Manual - 4 hours)
- Rotate JWT secret
- Rotate database credentials
- Review and update security policies
- Penetration testing (if budget allows)
- Update compliance documentation (SOC 2, GDPR)

---

## Emergency Contacts

**Security Officer:** Jayden Metz (admin@jaydenmetz.com)
**On-Call Phone:** [Add phone number]

**Escalation Path:**
1. Security Officer (Jayden Metz)
2. Technical Lead (if different)
3. CEO/Founder

**External Contacts:**
- **Railway Support:** https://railway.app/support
- **Sentry Support:** support@sentry.io
- **HubSpot Security:** [If using HubSpot integration]

---

## Additional Resources

- **Security Reference:** [SECURITY_REFERENCE.md](./SECURITY_REFERENCE.md)
- **Implementation History:** [SECURITY_IMPLEMENTATION_HISTORY.md](./SECURITY_IMPLEMENTATION_HISTORY.md)
- **Health Check Dashboard:** https://crm.jaydenmetz.com/health
- **Sentry Dashboard:** https://sentry.io
- **Railway Dashboard:** https://railway.app

**Last Updated:** October 2, 2025
**Next Review:** January 2026
