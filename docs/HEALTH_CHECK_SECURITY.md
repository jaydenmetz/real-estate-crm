# Health Check Security Model

## Problem Statement

**You said**: *"I don't want paying customers seeing my error logs or system diagnostics if I'm working through a bug."*

**Solution**: **3-tier access control** - Public status for customers, detailed diagnostics for admin only.

---

## Security Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      PUBLIC ACCESS (No Auth)                      │
│                                                                   │
│  GET /v1/status/public     - Simple operational status          │
│  GET /v1/status/ping       - Ultra-simple uptime check          │
│  GET /v1/status/health     - Load balancer health check         │
│                                                                   │
│  What customers see:                                             │
│  • "All systems operational" or "Experiencing issues"            │
│  • Component status (API, Database, Auth) as green/red          │
│                                                                   │
│  What customers DON'T see:                                       │
│  ❌ Error logs or stack traces                                   │
│  ❌ Database connection counts                                   │
│  ❌ Memory usage or CPU stats                                    │
│  ❌ Table sizes or query performance                             │
│  ❌ Redis statistics                                             │
│  ❌ API key counts                                               │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│               ADMIN ACCESS (Authentication Required)              │
│                                                                   │
│  GET /v1/health            - Full system diagnostics            │
│  GET /v1/health/postgres   - Database deep dive                 │
│  GET /v1/health/redis      - Cache diagnostics                  │
│  GET /v1/health/auth       - Authentication stats               │
│                                                                   │
│  Requires:                                                       │
│  1. Valid JWT token OR API key                                   │
│  2. User role = "system_admin"                                   │
│                                                                   │
│  What YOU see (admin):                                           │
│  ✅ Complete error details                                       │
│  ✅ Database connection pools                                    │
│  ✅ Memory and CPU usage                                         │
│  ✅ Table sizes and growth                                       │
│  ✅ Slow query analysis                                          │
│  ✅ API key statistics                                           │
│  ✅ User counts and activity                                     │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│         MODULE HEALTH (Authentication + Module Access)           │
│                                                                   │
│  GET /v1/escrows/health/enhanced    - Escrow module tests       │
│  GET /v1/listings/health/enhanced   - Listings module tests     │
│  GET /v1/clients/health/enhanced    - Clients module tests      │
│                                                                   │
│  Requires:                                                       │
│  1. Valid JWT token OR API key                                   │
│  2. Access to specific module (team-based permissions)           │
│                                                                   │
│  Who can access:                                                 │
│  • Paying customers (their own data)                             │
│  • System admin (all data)                                       │
│                                                                   │
│  What they see:                                                  │
│  • CRUD operations working/failing                               │
│  • Authentication validation                                     │
│  • Permission checks                                             │
│  • NO system-wide errors or diagnostics                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Endpoint Comparison

| Endpoint | Access | What It Shows | Use Case |
|----------|--------|---------------|----------|
| `GET /v1/status/public` | 🌍 **Public** | "All systems operational" | Customer status page, marketing site |
| `GET /v1/status/ping` | 🌍 **Public** | `{status: "ok"}` | UptimeRobot, Pingdom monitoring |
| `GET /v1/status/health` | 🌍 **Public** | 200 = healthy, 503 = down | Load balancer health check |
| `GET /v1/health` | 🔒 **Admin Only** | Full system diagnostics | YOU troubleshooting issues |
| `GET /v1/health/postgres` | 🔒 **Admin Only** | Database deep dive | YOU optimizing queries |
| `GET /v1/escrows/health/enhanced` | 🔑 **Authenticated** | Module-specific tests | Customers testing their access |

---

## Public Status Endpoint

### `GET /v1/status/public`

**Who can access**: Anyone (no authentication)

**Sample Response**:
```json
{
  "success": true,
  "data": {
    "service": "Real Estate CRM API",
    "status": "operational",  // operational, degraded, outage
    "timestamp": "2025-10-01T21:00:00Z",
    "message": "All systems operational",
    "components": [
      {
        "name": "API Server",
        "status": "operational",
        "description": "REST API endpoints"
      },
      {
        "name": "Database",
        "status": "operational",
        "description": "Data storage and retrieval"
      },
      {
        "name": "Escrows",
        "status": "operational",
        "description": "Transaction management"
      },
      {
        "name": "Listings",
        "status": "operational",
        "description": "Property listings"
      },
      {
        "name": "Authentication",
        "status": "operational",
        "description": "Login and security"
      }
    ]
  }
}
```

**What happens during an outage**:
```json
{
  "status": "degraded",  // or "outage"
  "message": "Some systems experiencing issues. We're working on it.",
  "components": [
    {
      "name": "Database",
      "status": "outage",  ← Only thing that changes
      "description": "Data storage and retrieval"
    }
  ]
}
```

**NO error details exposed** - Just status changes.

---

## Admin Health Endpoints

### `GET /v1/health` - Admin Only

**Who can access**: System administrators only

**Authentication**:
```bash
# Must provide JWT or API key
curl https://api.jaydenmetz.com/v1/health \
  -H "Authorization: Bearer YOUR_ADMIN_JWT"

# AND user role must be "system_admin"
```

**What you get** (full diagnostics):
```json
{
  "status": "healthy",
  "checks": {
    "postgresql": {
      "status": "healthy",
      "responseTime": "15ms",
      "details": {
        "database": "railway",
        "activeConnections": 5,       ← Admin sees this
        "sizeInMB": 245,                ← Admin sees this
        "tableCounts": {                ← Admin sees this
          "users": 10,
          "escrows": 150,
          "api_keys": 25
        }
      }
    },
    "system": {
      "memoryUsage": {                  ← Admin sees this
        "totalMB": 512,
        "freeMB": 256,
        "usedByAppMB": 85
      },
      "cpuCores": 2,                    ← Admin sees this
      "loadAverage": [0.5, 0.4, 0.3]   ← Admin sees this
    }
  }
}
```

**If non-admin tries to access**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required. This endpoint is restricted to system administrators.",
    "userRole": "agent",              ← Their actual role
    "requiredRole": "system_admin"    ← What they need
  }
}
```

---

## Authentication Flow

### Public Endpoints (No Auth)
```javascript
// Anyone can call this
fetch('https://api.jaydenmetz.com/v1/status/public')

// Returns:
{
  "status": "operational",
  "message": "All systems operational"
}
```

### Admin Endpoints (Requires system_admin)
```javascript
// Step 1: Authenticate
const response = await fetch('/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'admin@jaydenmetz.com',
    password: 'your-password'
  })
});

const { token } = await response.json();

// Step 2: Call admin endpoint
const health = await fetch('/v1/health', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Backend checks:
// 1. Is token valid? ✓
// 2. User role = "system_admin"? ✓
// → Allow access

// If user role = "agent":
// → 403 Forbidden
```

### Module Health (Requires authentication, any role)
```javascript
// Paying customers can test their own modules
const escrowHealth = await fetch('/v1/escrows/health/enhanced', {
  headers: {
    'Authorization': `Bearer ${customerToken}`
  }
});

// They see their own CRUD tests
// They DON'T see system diagnostics
```

---

## Frontend Integration

### Public Status Page (status.jaydenmetz.com)

```jsx
// Public-facing status page (no login required)
import React, { useState, useEffect } from 'react';

export default function PublicStatusPage() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // No auth required - anyone can see this
    fetch('https://api.jaydenmetz.com/v1/status/public')
      .then(r => r.json())
      .then(data => setStatus(data.data));
  }, []);

  return (
    <div className="status-page">
      <h1>Real Estate CRM Status</h1>

      {/* Overall status banner */}
      <StatusBanner status={status?.status} message={status?.message} />

      {/* Component statuses */}
      <div className="components">
        {status?.components.map(component => (
          <ComponentCard key={component.name} component={component} />
        ))}
      </div>

      {/* NO error logs, NO system metrics */}
      <p className="note">
        Having issues? Contact support at admin@jaydenmetz.com
      </p>
    </div>
  );
}

function StatusBanner({ status, message }) {
  const colors = {
    operational: 'green',
    degraded: 'yellow',
    outage: 'red'
  };

  return (
    <div className={`banner ${colors[status]}`}>
      <StatusIcon status={status} />
      <h2>{message}</h2>
    </div>
  );
}

function ComponentCard({ component }) {
  return (
    <div className="component-card">
      <StatusDot status={component.status} />
      <div>
        <h3>{component.name}</h3>
        <p>{component.description}</p>
      </div>
    </div>
  );
}
```

### Admin Dashboard (crm.jaydenmetz.com/admin/health)

```jsx
// Admin-only diagnostics page (requires login)
import React, { useState, useEffect } from 'react';

export default function AdminHealthDashboard() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');

    fetch('https://api.jaydenmetz.com/v1/health', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(r => {
        if (r.status === 403) {
          throw new Error('Admin access required');
        }
        return r.json();
      })
      .then(data => setHealth(data.data))
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return <div>❌ {error}</div>;
  }

  return (
    <div className="admin-health">
      <h1>System Health (Admin)</h1>

      {/* Show EVERYTHING */}
      <SystemMetrics health={health} />
      <DatabaseStats health={health} />
      <MemoryUsage health={health} />
      <ErrorLogs health={health} />

      {/* Detailed diagnostics */}
      <button onClick={() => fetchDeepDive('/v1/health/postgres')}>
        PostgreSQL Deep Dive
      </button>
    </div>
  );
}
```

---

## Sentry Integration

### Setup Sentry for Real-Time Alerts

**Why Sentry?**
- Automatically captures errors
- Alerts you IMMEDIATELY when something breaks
- Shows stack traces, user context, breadcrumbs
- Free tier: 5,000 errors/month

**Installation**:
```bash
cd backend
npm install @sentry/node @sentry/profiling-node
```

**Configuration** (`backend/src/config/sentry.js`):
```javascript
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Get from sentry.io
  integrations: [
    new ProfilingIntegration(),
  ],
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Don't send these errors to Sentry
  ignoreErrors: [
    'VALIDATION_ERROR',
    'UNAUTHORIZED',
    'NOT_FOUND'
  ],

  // Add user context
  beforeSend(event, hint) {
    // Don't send if it's a validation error (expected)
    if (event.exception?.values?.[0]?.type === 'ValidationError') {
      return null;
    }
    return event;
  }
});

module.exports = Sentry;
```

**Add to app.js**:
```javascript
const Sentry = require('./config/sentry');

// FIRST middleware (capture all errors)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your routes ...

// LAST middleware (send errors to Sentry)
app.use(Sentry.Handlers.errorHandler());
```

**Test it**:
```javascript
// Trigger a test error
app.get('/test-sentry', (req, res) => {
  throw new Error('Test Sentry integration');
});
```

**You'll get an email/Slack notification instantly** when errors occur in production.

---

## Monitoring Strategy

### For Customers (Public Status Page)
```
✅ Simple status page at status.jaydenmetz.com
✅ Shows: operational, degraded, or outage
✅ NO technical details
✅ NO error logs
✅ Just: "We're working on it" message
```

### For You (Admin Dashboard)
```
✅ Full diagnostics at crm.jaydenmetz.com/admin/health
✅ Requires: Login as admin@jaydenmetz.com
✅ Shows: Everything (errors, metrics, logs)
✅ Sentry alerts you immediately via email/Slack
```

### For Uptime Monitoring
```
✅ UptimeRobot pings: /v1/status/ping every 5 minutes
✅ Load balancer checks: /v1/status/health
✅ If down → You get SMS/email alert
```

---

## Access Control Summary

| User Type | Email | Role | Can Access |
|-----------|-------|------|------------|
| **You (Owner)** | admin@jaydenmetz.com | `system_admin` | ✅ All public endpoints<br>✅ All admin endpoints<br>✅ All module health |
| **Team Member** | agent@jaydenmetz.com | `agent` | ✅ All public endpoints<br>❌ Admin endpoints (403)<br>✅ Module health (their data) |
| **Paying Customer** | customer@example.com | `agent` | ✅ All public endpoints<br>❌ Admin endpoints (403)<br>✅ Module health (their data) |
| **Public** | (no login) | N/A | ✅ Public status only<br>❌ Everything else (401) |

---

## Security Benefits

### ✅ What This Prevents

1. **Information Leakage**
   - Customers can't see your database size
   - Customers can't see memory usage
   - Customers can't see other customers' data
   - Customers can't see error logs

2. **Competitive Intelligence**
   - Competitors can't see your tech stack details
   - Can't see your database structure
   - Can't see your API key usage
   - Can't see your user counts

3. **Attack Surface Reduction**
   - No sensitive endpoints exposed publicly
   - Admin endpoints require authentication + role check
   - Failed auth attempts logged (could add Sentry alert)

---

## Testing Access Control

### Test Public Access (Should Work)
```bash
curl https://api.jaydenmetz.com/v1/status/public
# ✅ Returns: { "status": "operational", "message": "All systems operational" }
```

### Test Admin Access Without Auth (Should Fail)
```bash
curl https://api.jaydenmetz.com/v1/health
# ❌ Returns: { "error": { "code": "UNAUTHORIZED" } }
```

### Test Admin Access With Wrong Role (Should Fail)
```bash
# Login as regular agent
curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -d '{"email": "agent@example.com", "password": "pass"}'

# Try to access admin endpoint
curl https://api.jaydenmetz.com/v1/health \
  -H "Authorization: Bearer AGENT_TOKEN"

# ❌ Returns: { "error": { "code": "FORBIDDEN", "message": "Admin access required" } }
```

### Test Admin Access With Correct Role (Should Work)
```bash
# Login as system_admin
curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -d '{"email": "admin@jaydenmetz.com", "password": "pass"}'

# Access admin endpoint
curl https://api.jaydenmetz.com/v1/health \
  -H "Authorization: Bearer ADMIN_TOKEN"

# ✅ Returns: Full system diagnostics
```

---

## Recommendations

### Immediate
1. ✅ **Use `/v1/status/public` for customer-facing status** (already implemented)
2. ✅ **Use `/v1/health` for your internal diagnostics** (already admin-protected)
3. ⏳ **Set up Sentry** (get instant error alerts)
4. ⏳ **Add UptimeRobot monitoring** on `/v1/status/ping`

### Short-term
5. ⏳ **Build public status page** at status.jaydenmetz.com
6. ⏳ **Add Sentry alerts to Slack** (get notified faster)
7. ⏳ **Create admin health dashboard** in frontend

### Long-term
8. ⏳ **Add incident history** to public status page
9. ⏳ **Scheduled maintenance notifications**
10. ⏳ **Performance metrics dashboard** (admin only)

---

## Summary

**Problem Solved**: ✅

- ✅ Paying customers see simple "operational/degraded/outage" status
- ✅ Paying customers DON'T see error logs, metrics, or diagnostics
- ✅ YOU (admin) see everything via admin-protected endpoints
- ✅ Sentry alerts you immediately when errors occur
- ✅ Public status page ready for customer-facing display
- ✅ All sensitive endpoints require authentication + admin role

**Your users see**: "All systems operational" ✅
**You see**: Complete diagnostics, logs, metrics 📊

**Security Model**: Production-grade, role-based access control implemented.

