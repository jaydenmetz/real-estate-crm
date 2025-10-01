# Health Check Strategy - Production-Grade System Monitoring

## Overview

Your Real Estate CRM has a **comprehensive 3-tier health check system** designed to catch issues before users do. Each tier serves a specific purpose in the monitoring strategy.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tier 1: System Health                     │
│                    GET /v1/health (PUBLIC)                   │
│  • Database connectivity                                     │
│  • Redis status                                              │
│  • System resources                                          │
│  • Authentication system                                     │
│  • Overall API status                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Tier 2: Component-Specific Health               │
│           GET /v1/health/postgres (detailed)                 │
│           GET /v1/health/redis (detailed)                    │
│           GET /v1/health/auth (detailed)                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│             Tier 3: Module End-to-End Testing                │
│         GET /v1/escrows/health/enhanced (auth required)      │
│         GET /v1/listings/health/enhanced (auth required)     │
│         GET /v1/clients/health/enhanced (auth required)      │
│         GET /v1/appointments/health/enhanced (auth required) │
│         GET /v1/leads/health/enhanced (auth required)        │
│                                                              │
│  Tests per module:                                           │
│  1. JWT authentication validation                            │
│  2. API key authentication validation                        │
│  3. Create test API key                                      │
│  4. Verify API key works                                     │
│  5. Full CRUD operations (Create, Read, Update, Delete)      │
│  6. List/query operations                                    │
│  7. Delete test API key                                      │
│  8. Verify API key is deleted                                │
│  9. Permission isolation check                               │
│  10. Business rule validation                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Tier 1: System Health (`/v1/health`)

### Purpose
**Quick system-wide status check** - No authentication required

### When to Use
- Uptime monitoring (Pingdom, UptimeRobot, etc.)
- Load balancer health checks
- Quick "is the API up?" checks
- Docker/Kubernetes readiness probes

### What It Tests
```json
{
  "status": "healthy",  // healthy, degraded, unhealthy
  "timestamp": "2025-10-01T20:00:00Z",
  "uptime": 3600,  // seconds
  "environment": "production",
  "checks": {
    "postgresql": {
      "status": "healthy",
      "responseTime": "15ms",
      "details": {
        "database": "railway",
        "version": "14.5",
        "sizeInMB": 245,
        "activeConnections": 5,
        "tableCounts": {
          "users": 10,
          "escrows": 150,
          "api_keys": 25,
          "teams": 3
        }
      }
    },
    "redis": {
      "status": "healthy",  // or "not_configured" (OK)
      "responseTime": "5ms"
    },
    "authentication": {
      "status": "healthy",
      "details": {
        "jwtConfigured": true,
        "storageLocation": "PostgreSQL + Browser localStorage",
        "activeUsers": 8,
        "activeApiKeys": 15
      }
    },
    "system": {
      "status": "healthy",
      "details": {
        "platform": "linux",
        "nodeVersion": "v20.10.0",
        "memoryUsage": {
          "totalMB": 512,
          "freeMB": 256,
          "usedByAppMB": 85
        },
        "cpuCores": 2,
        "loadAverage": [0.5, 0.4, 0.3]
      }
    }
  },
  "recommendations": [
    {
      "type": "performance",
      "message": "Consider adding Redis for caching",
      "priority": "low"
    }
  ]
}
```

### Response Codes
- `200` - System healthy
- `200` with `"status": "degraded"` - Some issues but operational
- `500` - Critical failure

---

## Tier 2: Component Diagnostics

### `/v1/health/postgres` - Database Deep Dive
**Purpose**: Detailed PostgreSQL diagnostics

**What It Tests**:
- Connection pool stats
- Table sizes and growth
- Slow queries (if pg_stat_statements enabled)
- Index usage statistics
- Active/idle connection breakdown

**When to Use**:
- Investigating performance issues
- Capacity planning
- Database optimization

**Sample Response**:
```json
{
  "connections": [
    { "state": "active", "count": 3 },
    { "state": "idle", "count": 2 }
  ],
  "largestTables": [
    { "tablename": "escrows", "size": "15 MB", "inserts": 1500 },
    { "tablename": "listings", "size": "8 MB", "inserts": 850 }
  ],
  "indexUsage": [
    {
      "tablename": "escrows",
      "indexname": "idx_escrows_user_id",
      "scans": 45000,
      "tuples_read": 150000
    }
  ]
}
```

### `/v1/health/redis` - Cache Status
**Purpose**: Redis diagnostics (if configured)

**What It Tests**:
- Connection status
- Memory usage
- Key count
- Client connections

**Note**: Returns "not_configured" if Redis not enabled (this is fine)

### `/v1/health/auth` - Authentication System
**Purpose**: Authentication infrastructure diagnostics

**What It Tests**:
- User counts by role
- API key creation trends
- Authentication methods in use
- Security configuration

**Sample Response**:
```json
{
  "usersByRole": [
    { "role": "system_admin", "count": 1, "active": 1 },
    { "role": "agent", "count": 8, "active": 7 }
  ],
  "recentApiKeyActivity": [
    { "date": "2025-10-01", "keys_created": 3, "active_keys": 15 }
  ],
  "authMethods": {
    "jwtEnabled": true,
    "apiKeysEnabled": true,
    "usersWithApiKeys": 5,
    "sessionStorage": "Browser localStorage (JWT) + PostgreSQL (API Keys)"
  }
}
```

---

## Tier 3: Module End-to-End Tests

### Purpose
**Comprehensive testing of each module** with real authentication and full CRUD lifecycle

### Endpoints (All Require Auth)
- `GET /v1/escrows/health/enhanced`
- `GET /v1/listings/health/enhanced`
- `GET /v1/clients/health/enhanced`
- `GET /v1/appointments/health/enhanced`
- `GET /v1/leads/health/enhanced`

### Authentication Methods Tested

#### 1. JWT Token Authentication
```bash
curl https://api.jaydenmetz.com/v1/escrows/health/enhanced \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**What Gets Tested**:
- Token validity
- Token expiration
- User extraction from token
- Permission checks

#### 2. API Key Authentication
```bash
curl https://api.jaydenmetz.com/v1/escrows/health/enhanced \
  -H "X-API-Key: your-64-character-api-key-here"
```

**What Gets Tested**:
- Key hashing and lookup
- Key expiration
- Key active status
- User association

### Complete Test Flow (13 Tests Per Module)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. JWT_TOKEN_VALID                                           │
│    ✅ Verify request authenticated with JWT                  │
│    OR                                                        │
│ 2. API_KEY_VALID                                             │
│    ✅ Verify request authenticated with API key              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. API_KEY_CREATE                                            │
│    ✅ Create new test API key                                │
│    📋 Returns: Full 64-char key (shown only once)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. API_KEY_VERIFY_WORKS                                      │
│    ✅ Verify test API key exists and is valid                │
│    📋 Check: key in database, is_active=true, not expired    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ESCROW_CREATE                                             │
│    ✅ Create test escrow                                     │
│    📋 Returns: escrowId, displayId                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. ESCROW_READ                                               │
│    ✅ Read created escrow by ID                              │
│    📋 Verify: Data matches, permission granted               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. ESCROW_UPDATE                                             │
│    ✅ Update escrow (change price)                           │
│    📋 Verify: Price updated from 100k to 150k                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. ESCROW_LIST                                               │
│    ✅ Verify test escrow appears in list query               │
│    📋 Check: Count > 0 with test prefix filter               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. ESCROW_DELETE                                             │
│    ✅ Delete test escrow                                     │
│    📋 Returns: Deleted ID                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. ESCROW_VERIFY_DELETED                                    │
│     ✅ Confirm escrow no longer exists                       │
│     📋 Query returns 0 rows                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 11. API_KEY_DELETE                                           │
│     ✅ Delete test API key                                   │
│     📋 Remove from database                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 12. API_KEY_VERIFY_DELETED ⭐ CRITICAL                       │
│     ✅ Confirm API key no longer exists                      │
│     📋 Query by key_hash returns 0 rows                      │
│     ⚠️  SECURITY: Ensures deleted keys can't be used         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 13. PERMISSION_ISOLATION                                     │
│     ✅ Verify user can only access own data                  │
│     📋 Check: No cross-user data leakage                     │
└─────────────────────────────────────────────────────────────┘
```

### Sample Response

```json
{
  "success": true,
  "data": {
    "timestamp": "2025-10-01T20:30:00Z",
    "user": {
      "id": "user-uuid-here",
      "email": "admin@jaydenmetz.com",
      "role": "system_admin",
      "authMethod": "jwt"  // or "api_key"
    },
    "testSummary": {
      "total": 13,
      "passed": 13,
      "failed": 0,
      "duration": 425,
      "durationFormatted": "425ms"
    },
    "status": "healthy",
    "message": "✅ All tests passed - Escrows module is healthy",
    "summary": {
      "authenticationWorks": true,
      "crudOperationsWork": true,
      "apiKeyLifecycleWorks": true,
      "permissionsWork": true
    },
    "tests": [
      {
        "name": "JWT_TOKEN_VALID",
        "status": "passed",
        "timestamp": "2025-10-01T20:30:00.100Z",
        "data": {
          "message": "Request authenticated with valid JWT token",
          "userId": "user-uuid",
          "tokenExpiry": "2025-11-01T20:30:00Z"
        }
      },
      {
        "name": "API_KEY_CREATE",
        "status": "passed",
        "timestamp": "2025-10-01T20:30:00.150Z",
        "data": {
          "keyId": "key-uuid",
          "keyName": "HEALTH_CHECK_1696185000000_TEST_KEY",
          "keyPreview": "...a1b2c3d4",
          "fullKey": "64-character-hex-string-here",
          "expiresAt": "2025-10-02T20:30:00Z",
          "message": "✅ Test API key created successfully"
        }
      },
      {
        "name": "API_KEY_VERIFY_WORKS",
        "status": "passed",
        "timestamp": "2025-10-01T20:30:00.200Z",
        "data": {
          "message": "✅ Test API key is active and can be found in database",
          "keyId": "key-uuid",
          "isActive": true,
          "isValid": true
        }
      },
      {
        "name": "ESCROW_CREATE",
        "status": "passed",
        "timestamp": "2025-10-01T20:30:00.250Z",
        "data": {
          "escrowId": "escrow-uuid",
          "displayId": "HEALTH_CHECK_1696185000000-001",
          "propertyAddress": "HEALTH_CHECK_1696185000000 Test Property"
        }
      },
      {
        "name": "API_KEY_DELETE",
        "status": "passed",
        "timestamp": "2025-10-01T20:30:00.450Z",
        "data": {
          "deletedKeyId": "key-uuid",
          "message": "✅ Test API key deleted successfully"
        }
      },
      {
        "name": "API_KEY_VERIFY_DELETED",
        "status": "passed",
        "timestamp": "2025-10-01T20:30:00.500Z",
        "data": {
          "message": "✅ Test API key confirmed deleted from database",
          "attemptedKey": "...a1b2c3d4",
          "result": "Key not found in database (expected)"
        }
      }
    ]
  }
}
```

---

## Key Security Features

### 1. API Key Lifecycle Verification
Every health check:
- ✅ Creates test API key
- ✅ Verifies it works (can be found in database)
- ✅ Deletes test API key
- ✅ **VERIFIES deletion** (key no longer in database)

**Why This Matters**:
If `API_KEY_VERIFY_DELETED` fails, it means:
- Deleted keys might still work (SECURITY ISSUE)
- Cleanup not working properly
- Database constraints not enforcing deletion

### 2. Permission Isolation
Every test:
- Uses `WHERE created_by = $userId OR team_id = $teamId`
- Verifies user can't access other users' data
- Confirms team-level sharing works

### 3. Dual Authentication Testing
Tests both auth methods:
- JWT tokens (short-term, browser-based)
- API keys (long-term, external integration)

---

## When to Use Each Tier

### Use Tier 1 (`/v1/health`) When:
- ✅ Setting up uptime monitoring
- ✅ Load balancer health checks
- ✅ Quick "is it up?" checks
- ✅ Public status pages
- ✅ Don't need authentication

### Use Tier 2 (`/v1/health/*`) When:
- ✅ Investigating performance issues
- ✅ Capacity planning
- ✅ Database optimization
- ✅ Redis troubleshooting
- ✅ Auth system diagnostics

### Use Tier 3 (`/v1/*/health/enhanced`) When:
- ✅ Testing after deployment
- ✅ Verifying authentication works
- ✅ End-to-end integration testing
- ✅ Debugging CRUD operations
- ✅ Confirming permissions work
- ✅ API key lifecycle validation

---

## Frontend Integration

### Health Dashboard Display

```javascript
// Main dashboard shows Tier 1
const systemHealth = await fetch('/v1/health');

// Module cards link to Tier 3
const escrowsHealth = await fetch('/v1/escrows/health/enhanced', {
  headers: { 'Authorization': `Bearer ${jwt}` }
});

// Each module shows:
{
  "module": "Escrows",
  "status": "healthy",  // Green badge
  "testsPassed": "13/13",  // 100%
  "lastTested": "2 minutes ago",
  "details": [
    "✅ Authentication working",
    "✅ CRUD operations functional",
    "✅ API key lifecycle verified",
    "✅ Permissions enforced"
  ]
}
```

### API Key Testing Section

Each module health page should have:

```jsx
<Card>
  <CardHeader>
    <Title>API Key Test</Title>
    <Badge variant="info">View Only Once</Badge>
  </CardHeader>
  <CardBody>
    {/* Show the full test API key during test */}
    {testResults.apiKeyCreate && (
      <Alert variant="warning">
        <strong>Test API Key (shown only once):</strong>
        <Code>{testResults.apiKeyCreate.data.fullKey}</Code>
        <Text>This key will be deleted at the end of the test.</Text>
      </Alert>
    )}

    {/* Show deletion confirmation */}
    {testResults.apiKeyVerifyDeleted && (
      <Alert variant="success">
        <strong>✅ API Key Deletion Verified</strong>
        <Text>
          The test API key (...{testResults.apiKeyCreate.data.keyPreview})
          has been confirmed deleted from the database.
        </Text>
        <Text variant="muted">
          This ensures deleted keys cannot be used.
        </Text>
      </Alert>
    )}
  </CardBody>
</Card>
```

---

## Monitoring Strategy

### Production Setup

```yaml
# Uptime Robot / Pingdom
Monitor: System Health
URL: https://api.jaydenmetz.com/v1/health
Interval: 5 minutes
Alert: If status != "healthy" OR response code != 200

# Cron Job (Daily)
Script: test-all-modules.sh
Schedule: 0 6 * * *  # 6 AM daily
Action: Run all Tier 3 health checks
Alert: Email if any module fails

# Pre-deployment
Script: run-health-checks-before-deploy.sh
Action: Run Tier 1 + Tier 3 for all modules
Requirement: All tests must pass before deploy
```

### Alert Priorities

| Tier | Alert Type | Priority | Action |
|------|-----------|----------|--------|
| Tier 1 fails | System Down | **CRITICAL** | Immediate response |
| Tier 2 degraded | Component Issue | **HIGH** | Investigate within 1 hour |
| Tier 3 fails | Module Broken | **HIGH** | Fix before next deploy |

---

## Best Practices

### ✅ DO
- Run Tier 1 every 5 minutes (uptime monitoring)
- Run Tier 3 after every deployment
- Run Tier 3 before merging PRs (CI/CD)
- Keep test data cleanup working (verify deletion)
- Monitor response times (should be <500ms)

### ❌ DON'T
- Don't run Tier 3 too frequently (creates test data)
- Don't skip `VERIFY_DELETED` tests (security risk)
- Don't ignore "degraded" status (fix proactively)
- Don't disable health checks in production
- Don't hard-code test credentials

---

## Troubleshooting

### Health Check Fails: What to Check

#### Tier 1 Fails
```
1. Check DATABASE_URL is set
2. Verify PostgreSQL is running
3. Check network connectivity
4. Review error logs
```

#### Tier 2 Fails
```
1. Check specific component (postgres/redis/auth)
2. Review connection pool stats
3. Check resource usage (CPU/memory)
4. Verify credentials
```

#### Tier 3 Fails
```
1. Check authentication (JWT or API key)
2. Review test failure details
3. Verify user permissions
4. Check database constraints
5. Look for partial cleanup (test data not deleted)
```

### Common Issues

**"API_KEY_VERIFY_DELETED" fails**:
- API key deletion not working
- Check `deleteApiKey` function
- Verify cascade delete in database

**"PERMISSION_ISOLATION" fails**:
- User can see other users' data
- Check WHERE clauses include user_id/team_id
- Review query permissions

**"ESCROW_VERIFY_DELETED" fails**:
- Escrow still in database after deletion
- Check foreign key constraints
- Review soft delete vs hard delete logic

---

## Summary

Your health check system is **production-grade** with:

✅ **3 tiers** of monitoring (system, component, module)
✅ **Dual authentication testing** (JWT + API keys)
✅ **Complete lifecycle validation** (create, verify, delete, confirm deletion)
✅ **Security verification** (permission isolation, key deletion)
✅ **13 tests per module** (comprehensive coverage)
✅ **Clear pass/fail reporting** (frontend-friendly)

**Key Feature**: Every test creates an API key, uses it, deletes it, and **confirms it's actually deleted** - ensuring your security cleanup works.

---

**Status**: ✅ **PRODUCTION READY**
**Next Step**: Integrate with frontend health dashboard
**Documentation**: Complete

