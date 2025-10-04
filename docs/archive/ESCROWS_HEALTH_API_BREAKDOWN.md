# Escrows Health Dashboard - Complete API Breakdown

## Overview
The Escrows Health Dashboard provides comprehensive testing and monitoring of the escrow module's functionality, including CRUD operations, database connectivity, permissions, and data integrity.

## API Endpoints

### 1. Main Health Check
**Endpoint:** `GET /v1/escrows/health`

**Purpose:** Comprehensive health check that tests all escrow operations

**Required Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
# OR
X-API-Key: {API_KEY}
Content-Type: application/json
```

**Authentication Flow:**
1. The `authenticate` middleware checks for either JWT token or API key
2. Validates the token/key and attaches user info to `req.user`
3. User object contains:
   - `id`: User's UUID
   - `email`: User's email
   - `teamId`: Team UUID for multi-tenant isolation
   - `authMethod`: Either 'jwt' or 'apiKey'

**Tests Performed:**
1. **CREATE_ESCROW** - Creates a test escrow with prefix `HEALTH_CHECK_{timestamp}`
2. **READ_ESCROW** - Verifies the created escrow can be retrieved
3. **UPDATE_ESCROW** - Updates purchase price from $100,000 to $150,000
4. **UPDATE_PEOPLE** - Adds buyers and sellers JSON data
5. **UPDATE_CHECKLISTS** - Adds loan and house checklists
6. **PERMISSION_CHECK** - Verifies user cannot access other users' escrows
7. **ARCHIVE_ESCROW** - Soft deletes the escrow (sets deleted_at)
8. **DELETE_ESCROW** - Permanently removes the test escrow

**Response Format:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-20T10:30:00Z",
    "user": "admin@jaydenmetz.com",
    "authMethod": "jwt",
    "tests": [
      {
        "name": "CREATE_ESCROW",
        "status": "passed",
        "escrowId": "uuid-here",
        "displayId": "HEALTH_CHECK_1234567890-001"
      },
      {
        "name": "READ_ESCROW",
        "status": "passed",
        "data": {
          "id": "uuid-here",
          "display_id": "HEALTH_CHECK_1234567890-001",
          "property_address": "HEALTH_CHECK_1234567890 Test Property",
          "escrow_status": "Active"
        }
      },
      {
        "name": "UPDATE_ESCROW",
        "status": "passed",
        "newPrice": 150000
      },
      {
        "name": "UPDATE_PEOPLE",
        "status": "passed"
      },
      {
        "name": "UPDATE_CHECKLISTS",
        "status": "passed"
      },
      {
        "name": "PERMISSION_CHECK",
        "status": "passed",
        "message": "Correctly denied access to other user's escrow"
      },
      {
        "name": "ARCHIVE_ESCROW",
        "status": "passed"
      },
      {
        "name": "DELETE_ESCROW",
        "status": "passed"
      }
    ],
    "summary": {
      "total": 8,
      "passed": 8,
      "failed": 0,
      "skipped": 0,
      "executionTime": 250
    }
  }
}
```

### 2. Database Connectivity Check
**Endpoint:** `GET /v1/escrows/health/db`

**Headers Required:**
```http
Authorization: Bearer {JWT_TOKEN}
# OR
X-API-Key: {API_KEY}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "latency": 15,
    "database": {
      "version": "PostgreSQL 14.9",
      "maxConnections": 100,
      "currentConnections": 25
    },
    "timestamp": "2024-01-20T10:30:00Z"
  }
}
```

### 3. Authentication Test
**Endpoint:** `GET /v1/escrows/health/auth`

**Headers Required:**
```http
Authorization: Bearer {JWT_TOKEN}
# OR
X-API-Key: {API_KEY}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "method": "jwt",
    "user": {
      "id": "user-uuid",
      "email": "admin@jaydenmetz.com",
      "role": "admin",
      "teamId": "team-uuid"
    },
    "permissions": {
      "escrows": true,
      "canCreate": true,
      "canRead": true,
      "canUpdate": true,
      "canDelete": true
    },
    "timestamp": "2024-01-20T10:30:00Z"
  }
}
```

### 4. CRUD Operations Test (with Test Mode)
**Endpoint:** `GET /v1/escrows/health/crud?testMode=true`

**Query Parameters:**
- `testMode=true` - Keeps test data for manual inspection
- `testMode=false` - Deletes test data after completion (default)

**Headers Required:**
```http
Authorization: Bearer {JWT_TOKEN}
# OR
X-API-Key: {API_KEY}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "operations": {
      "create": "passed",
      "read": "passed",
      "update": "passed",
      "archive": "passed",
      "delete": "passed"
    },
    "testEscrowId": "uuid-here",
    "displayId": "TEST-2024-001",
    "executionTime": 180,
    "timestamp": "2024-01-20T10:30:00Z"
  }
}
```

## Authentication Middleware Details

### JWT Authentication
**Header Format:** `Authorization: Bearer {token}`

**Token Payload:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "agent",
  "teamId": "team-uuid",
  "iat": 1705750200,
  "exp": 1705836600
}
```

### API Key Authentication
**Header Format:** `X-API-Key: {64-character-hex-key}`

**API Key Validation Process:**
1. Extract key from header
2. Hash the key using SHA-256
3. Query database for matching key_hash
4. Verify key is active and not expired
5. Load associated user data
6. Attach user to request

## Data in Headers

### Request Headers (Client → Server)
```http
# Required for all health endpoints
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
# OR
X-API-Key: a1b2c3d4e5f6789...

# Standard headers
Content-Type: application/json
Accept: application/json
Origin: https://crm.jaydenmetz.com

# Optional headers
X-Team-ID: team-uuid  # For team-specific filtering
X-Request-ID: unique-request-id  # For request tracking
```

### Response Headers (Server → Client)
```http
Content-Type: application/json
X-Response-Time: 125ms
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 95
X-Rate-Limit-Reset: 1705750800
Cache-Control: no-cache, no-store, must-revalidate
Access-Control-Allow-Origin: https://crm.jaydenmetz.com
Access-Control-Allow-Credentials: true
```

## Database Queries Executed

### 1. Create Test Escrow
```sql
INSERT INTO escrows (
  property_address, city, state, zip_code,
  purchase_price, escrow_status, acceptance_date,
  closing_date, display_id, created_by, team_id,
  net_commission
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING id, display_id
```

### 2. Read Escrow with Permissions
```sql
SELECT id, display_id, property_address, escrow_status
FROM escrows
WHERE id = $1 AND (created_by = $2 OR team_id = $3)
```

### 3. Update with Permission Check
```sql
UPDATE escrows
SET purchase_price = $1, updated_at = CURRENT_TIMESTAMP
WHERE id = $2 AND (created_by = $3 OR team_id = $4)
RETURNING id, purchase_price
```

### 4. Archive (Soft Delete)
```sql
UPDATE escrows
SET deleted_at = CURRENT_TIMESTAMP,
    escrow_status = 'Archived'
WHERE id = $1 AND (created_by = $2 OR team_id = $3)
AND deleted_at IS NULL
RETURNING id, deleted_at
```

### 5. Hard Delete
```sql
DELETE FROM escrows
WHERE id = $1
AND (created_by = $2 OR team_id = $3)
AND deleted_at IS NOT NULL
```

## Security Features

### 1. Multi-Tenant Isolation
- All queries filter by `team_id` or `created_by`
- Users can only access their team's data
- Permission checks prevent cross-tenant access

### 2. Rate Limiting
- API endpoints limited to 100 requests per 15 minutes
- Health check endpoints limited to 5 requests per minute
- Headers show remaining rate limit

### 3. Input Validation
- All inputs sanitized using express-validator
- SQL injection prevention via parameterized queries
- XSS protection through input escaping

### 4. Audit Trail
- All operations logged with timestamp
- User identification in every request
- Test data clearly marked with prefix

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Database connection failed",
    "details": "Connection timeout after 2000ms"
  }
}
```

## Frontend Integration

### React Component Data Flow
1. **Authentication Check** - Retrieves token from localStorage
2. **API Call** - Sends request with proper headers
3. **Response Handling** - Parses JSON response
4. **State Update** - Updates component state with results
5. **UI Rendering** - Displays test results with color coding

### Test Result Color Coding
- **Green** - Test passed successfully
- **Red** - Test failed with error
- **Yellow** - Test skipped or warning
- **Gray** - Test pending or not run

## Performance Benchmarks

### Expected Response Times
- Database connectivity: < 50ms
- CRUD operations: < 200ms per operation
- Full health check: < 500ms total
- Authentication check: < 100ms

### Database Query Performance
- Simple SELECT: < 10ms
- INSERT with RETURNING: < 20ms
- UPDATE with conditions: < 15ms
- DELETE with conditions: < 15ms

## Monitoring and Alerts

### Health Score Calculation
```javascript
// Score starts at 100
let score = 100;

// Deduct points for failures
score -= (failedTests * 10);
score -= (slowQueries * 5);
score -= (highLatency ? 10 : 0);
score -= (connectionIssues ? 20 : 0);

// Minimum score is 0
score = Math.max(0, score);
```

### Alert Thresholds
- **Critical** (< 60): Immediate attention required
- **Warning** (60-80): Some issues need addressing
- **Healthy** (> 80): System operating normally

## Testing Best Practices

### 1. Regular Health Checks
- Run automated checks every 5 minutes
- Manual testing after deployments
- Load testing during off-peak hours

### 2. Test Data Management
- Always use unique prefixes for test data
- Clean up test data immediately after tests
- Never use production data for testing

### 3. Permission Testing
- Verify cross-tenant isolation regularly
- Test with different user roles
- Ensure proper access control

## Troubleshooting Guide

### Common Issues and Solutions

**Issue: Authentication failures**
- Verify token hasn't expired
- Check API key is active
- Ensure proper header format

**Issue: Permission denied errors**
- Verify user has correct role
- Check team_id matches
- Ensure resource ownership

**Issue: Database timeouts**
- Check connection pool settings
- Verify database server status
- Review slow query logs

**Issue: Test data not cleaning up**
- Manually delete with prefix filter
- Check for transaction rollbacks
- Verify delete permissions