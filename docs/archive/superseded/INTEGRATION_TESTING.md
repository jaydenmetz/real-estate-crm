# Integration Testing Guide

## Overview

This guide documents the comprehensive integration testing system for the Real Estate CRM, covering all 5 core modules with dual authentication support.

**Last Updated:** October 3, 2025
**Test Coverage:** 228 tests across 5 modules
**Success Rate:** 100% (228/228 passing)

## Test Architecture

### Health Check System

Each module has a dedicated health dashboard accessible at `/{module}/health`:

- `/escrows/health` - 48 tests (24 JWT + 24 API Key)
- `/listings/health` - 48 tests (24 JWT + 24 API Key)
- `/clients/health` - 44 tests (22 JWT + 22 API Key)
- `/appointments/health` - 44 tests (22 JWT + 22 API Key)
- `/leads/health` - 44 tests (22 JWT + 22 API Key)

### System Health Dashboard

**URL:** `/health`

Aggregated view of all module health checks with:
- Real-time test execution
- Visual pass/fail indicators
- Module-level statistics
- Quick navigation to detailed dashboards

## Dual Authentication Testing

### JWT Authentication
- Uses Bearer token from localStorage (`authToken`)
- Automatic token refresh on 401 errors
- Tests user session-based API access

### API Key Authentication
- Creates temporary test API key (1-day expiry)
- Runs all tests with X-API-Key header
- Automatically deletes test key after completion

## Test Categories

### 1. Core Operations (CORE)
**Purpose:** Validate CRUD operations

Tests:
- Create resource with valid data
- Read single resource by ID
- Update resource fields
- Delete resource
- List all resources with pagination

**Example (Escrows):**
```javascript
POST /v1/escrows - Create escrow
GET /v1/escrows/:id - Get single escrow
PUT /v1/escrows/:id - Update escrow
DELETE /v1/escrows/:id - Delete escrow
GET /v1/escrows - List all escrows
```

### 2. Search & Filters (FILTERS)
**Purpose:** Validate query parameters and filtering

Tests:
- Filter by status (active, pending, closed, etc.)
- Search by text fields
- Filter by date ranges
- Filter by associations (user, team, etc.)

**Example (Listings):**
```javascript
GET /v1/listings?status=active
GET /v1/listings?minPrice=100000&maxPrice=500000
GET /v1/listings?propertyType=Single%20Family
```

### 3. Error Handling (ERROR)
**Purpose:** Validate API error responses

Tests:
- Invalid ID formats (non-UUID)
- Missing required fields
- Invalid data types
- Unauthorized access attempts

**Example:**
```javascript
GET /v1/escrows/invalid-id → 400 Bad Request
POST /v1/escrows (empty body) → 400 Invalid Input
GET /v1/escrows/:id (wrong user) → 403 Forbidden
```

### 4. Edge Cases (EDGE)
**Purpose:** Validate boundary conditions

Tests:
- Empty result sets
- Maximum pagination limits
- Special characters in search
- Duplicate prevention

### 5. Performance (PERFORMANCE)
**Purpose:** Validate response times

Tests:
- List operations < 500ms
- Single resource retrieval < 200ms
- Search queries < 300ms
- Bulk operations < 1000ms

### 6. Workflows (WORKFLOW)
**Purpose:** Validate multi-step processes

Tests:
- Create → Update → Delete sequence
- Status transitions (e.g., lead → client)
- Association management (client → escrow)
- Verification of deletions (404 expected)

## Using the Health Dashboards

### Accessing Tests

1. **System-Wide Testing:**
   ```
   Navigate to: https://crm.jaydenmetz.com/health
   ```
   - Auto-runs all 228 tests on page load
   - Shows aggregated results by module
   - Click module cards for detailed view

2. **Module-Specific Testing:**
   ```
   Navigate to: https://crm.jaydenmetz.com/{module}/health
   Examples:
   - /escrows/health
   - /listings/health
   - /clients/health
   ```

### Test Execution Flow

**JWT Mode (Default):**
1. Dashboard loads
2. Checks for authToken in localStorage
3. Auto-runs all tests with Bearer token
4. Displays results grouped by category

**API Key Mode:**
1. Switch to "API Key Authentication" tab
2. System creates temporary test key (1-day expiry)
3. Runs all tests with X-API-Key header
4. Displays full API key for manual testing
5. Automatically deletes test key after tests complete

### Reading Test Results

Each test displays:
- ✅ Green = Success (200-299 status)
- ❌ Red = Failed (4xx/5xx errors)
- ⚠️ Yellow = Warning (unexpected but non-critical)

**Test Details (click to expand):**
- HTTP Method (GET, POST, PUT, DELETE)
- Full endpoint URL
- Request body (if applicable)
- Response data
- Response time in ms
- cURL command (copy-pasteable)

## Test Data Management

### Automatic Cleanup

All tests create temporary data and clean up after:
- Test resources have "Test-" prefix in names
- Deletion tests verify 404 response
- No test data persists after test run

### Temporary API Keys

API Key tests follow this lifecycle:
1. **Create** - POST /v1/api-keys (using JWT)
2. **Use** - All tests run with temporary key
3. **Delete** - DELETE /v1/api-keys/:id (using JWT)
4. **Verify** - Confirms 404 on deleted key

## Integration with apiInstance

All health checks use the centralized `apiInstance` from `api.service.js`:

```javascript
// Health Check Service
const healthService = new HealthCheckService(API_URL, authValue, authType);

// Uses apiInstance internally
if (authType === 'jwt') {
  data = await apiInstance.request(endpoint, options);
} else {
  data = await apiInstance.requestWithApiKey(endpoint, apiKey, options);
}
```

**Benefits:**
- Automatic JWT token refresh
- Consistent error handling
- Sentry integration
- CORS configuration
- Request/response logging

## Running Tests Manually

### Via Health Dashboard (Recommended)

**Option 1: Auto-run (JWT)**
```
1. Login to CRM
2. Navigate to /health or /{module}/health
3. Tests run automatically with your JWT token
```

**Option 2: API Key Testing**
```
1. Navigate to /{module}/health
2. Click "API Key Authentication" tab
3. System creates temporary key
4. Tests run automatically
5. Copy full API key for manual cURL testing
```

**Option 3: Manual Refresh**
```
- Click ▶️ (Play) to run with new API key
- Click 🔄 (Refresh) to reuse existing API key
- Click 📋 (Copy) to copy full JSON report
```

### Via cURL Commands

Every test provides a copy-pasteable cURL command:

**Example - Create Escrow:**
```bash
curl -X POST "https://api.jaydenmetz.com/v1/escrows" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "property_address": "123 Test St",
    "buyer_name": "Test Buyer",
    "seller_name": "Test Seller",
    "status": "active"
  }'
```

**Example - With API Key:**
```bash
curl -X GET "https://api.jaydenmetz.com/v1/escrows" \
  -H "X-API-Key: 1a2b3c4d5e6f7g8h9i0j..."
```

## Test Coverage Summary

| Module | Total Tests | JWT Tests | API Key Tests | Coverage |
|--------|-------------|-----------|---------------|----------|
| Escrows | 48 | 24 | 24 | CRUD, Search, Workflow |
| Listings | 48 | 24 | 24 | CRUD, Search, Filters |
| Clients | 44 | 22 | 22 | CRUD, Search, Types |
| Appointments | 44 | 22 | 22 | CRUD, Calendar, Status |
| Leads | 44 | 22 | 22 | CRUD, Funnel, Conversion |
| **Total** | **228** | **114** | **114** | **100%** |

## Expected Test Results (100% Pass Rate)

### Escrows Health (48/48)
- ✅ Core: 8 tests (Create, Read, Update, Delete, List, Pagination)
- ✅ Filters: 6 tests (Status, Date Range, User Filter)
- ✅ Error: 6 tests (Invalid ID, Missing Fields, Bad Auth)
- ✅ Edge: 4 tests (Empty Results, Special Chars, Limits)
- ✅ Performance: 4 tests (Response Times < 500ms)
- ✅ Workflow: 20 tests (Multi-step, Verification, Cleanup)

### Listings Health (48/48)
- Similar structure to Escrows
- Additional property-specific filters
- Price range and location searches

### Clients Health (44/44)
- Client type filtering (Buyer, Seller, Both)
- Contact information validation
- Association with escrows/listings

### Appointments Health (44/44)
- Calendar integration tests
- Date/time validation
- Status transitions (Scheduled → Completed)

### Leads Health (44/44)
- Lead source tracking
- Qualification funnel tests
- Conversion tracking (Lead → Client)

## Troubleshooting

### All Tests Failing with "Token Expired"
**Issue:** JWT token expired
**Solution:** Logout and login again to get fresh token

### API Key Tests Not Running
**Issue:** Can't create temporary API key
**Solution:**
1. Ensure you're logged in with JWT first
2. Check Settings > API Keys tab for permission
3. Verify backend is running

### Some Tests Timeout
**Issue:** Database or network latency
**Solution:**
- Check Railway backend logs
- Verify database connection
- Run tests again (may be transient)

### 404 Errors in Production
**Issue:** API endpoint not found
**Solution:**
- Verify Railway deployment succeeded
- Check API_URL in environment (should be api.jaydenmetz.com)
- Review recent commits for breaking changes

## Best Practices

### 1. Test Before Deployment
Always run health checks before pushing to production:
```bash
1. Make code changes
2. Run `npm run build` locally
3. Navigate to /health
4. Verify 228/228 passing
5. Deploy to Railway
```

### 2. Monitor Test Performance
Track response times to detect degradation:
- Core operations: < 200ms ✅
- Search queries: < 300ms ✅
- List operations: < 500ms ✅
- Bulk operations: < 1000ms ✅

### 3. Use Both Auth Methods
Test with JWT AND API Key to ensure:
- Token refresh works correctly
- API key scoping is enforced
- Both auth flows handle errors

### 4. Review Failed Tests Immediately
When tests fail:
1. Click test to expand details
2. Copy cURL command
3. Run manually in terminal
4. Check response and status code
5. Review backend logs in Railway

## Related Documentation

- [SECURITY_REFERENCE.md](./SECURITY_REFERENCE.md) - Authentication & authorization architecture
- [CLAUDE.md](../CLAUDE.md) - Project overview and dev guidelines
- [API Documentation](./API.md) - Complete API endpoint reference (if exists)

## Future Enhancements

**Planned Improvements:**
1. **Automated CI/CD Testing** - Run health checks on every deployment
2. **Performance Benchmarks** - Alert on regression beyond thresholds
3. **Test Data Seeding** - Pre-populate test scenarios
4. **Visual Regression Testing** - Screenshot comparisons
5. **Load Testing** - Concurrent user simulation

**Phase 5.1+ Integration:**
- Security event logging tests
- Geo-anomaly detection validation
- GDPR compliance endpoint tests
- Admin dashboard permission tests

---

**Questions or Issues?** Report at https://github.com/anthropics/claude-code/issues
