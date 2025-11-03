# Project-94: API Testing Automation

**Phase**: G | **Priority**: HIGH | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Project-87 complete
**MILESTONE**: API contracts validated

## 🎯 Goal
Automate comprehensive API testing including contract testing, request/response validation, error scenario testing, and API performance monitoring.

## 📋 Current → Target
**Now**: Integration tests cover basic API functionality; no contract testing or comprehensive error scenarios
**Target**: Full API test automation; contract tests prevent breaking changes; all error scenarios tested; API performance monitored
**Success Metric**: 100% API endpoint coverage; contract tests in CI/CD; error scenarios automated; performance regression detection

## 📖 Context
APIs are the backbone of the CRM. This project creates comprehensive automated API tests beyond basic integration tests, including contract testing to prevent breaking changes, exhaustive error scenario testing, and performance monitoring. Tests validate API contracts, schemas, and behaviors automatically.

Key activities: Set up API testing framework, create contract tests, test error scenarios, validate schemas, monitor performance, and integrate into CI/CD.

## ⚠️ Risk Assessment

### Technical Risks
- **API Breaking Changes**: Changes breaking frontend or integrations
- **Schema Drift**: API responses not matching documentation
- **Performance Regression**: API slowdowns going undetected
- **Test Maintenance**: API changes requiring test updates

### Business Risks
- **Integration Failures**: API changes breaking third-party integrations
- **Customer Impact**: Breaking changes affecting production users
- **Support Costs**: API issues increasing support tickets
- **Trust Issues**: Unreliable API damaging developer trust

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-94-api-automation-$(date +%Y%m%d)
git push origin pre-project-94-api-automation-$(date +%Y%m%d)

# Backup API test configs
cp api-tests/ api-tests-backup/ -r 2>/dev/null || true
```

### If Things Break
```bash
# Restore configs
git checkout pre-project-94-api-automation-YYYYMMDD -- api-tests/
git push origin main
```

## ✅ Tasks

### Planning (2 hours)
- [ ] Review API documentation
- [ ] Plan contract testing approach
- [ ] Document error scenarios
- [ ] Design schema validation tests
- [ ] Plan performance monitoring

### Implementation (6.5 hours)
- [ ] **API Test Framework** (1.5 hours):
  - [ ] Set up Postman collections or REST-assured
  - [ ] Configure API test environment variables
  - [ ] Create test data generators
  - [ ] Set up authentication helpers
  - [ ] Configure test reporters

- [ ] **Contract Testing** (2 hours):
  - [ ] Install Pact or similar
  - [ ] Define API contracts
  - [ ] Create consumer tests
  - [ ] Create provider tests
  - [ ] Set up contract verification

- [ ] **Schema Validation** (1.5 hours):
  - [ ] Define JSON schemas for responses
  - [ ] Create schema validation tests
  - [ ] Test all successful responses
  - [ ] Test all error responses
  - [ ] Validate data types and formats

- [ ] **Error Scenario Testing** (1.5 hours):
  - [ ] Test 400 Bad Request scenarios
  - [ ] Test 401 Unauthorized scenarios
  - [ ] Test 403 Forbidden scenarios
  - [ ] Test 404 Not Found scenarios
  - [ ] Test 500 Internal Server Error handling
  - [ ] Test rate limiting (429)
  - [ ] Test validation errors
  - [ ] Test database errors

### Testing (1 hour)
- [ ] Run API test collections
- [ ] Verify contract tests
- [ ] Test schema validation
- [ ] Run error scenario tests
- [ ] Check performance baselines

### Documentation (0.5 hours)
- [ ] Document API test structure
- [ ] Document running API tests
- [ ] Document contract testing process
- [ ] Add API testing to README

## 🧪 Verification Tests

### Test 1: Run API Test Collection
```bash
# Run all API tests
npm run test:api

# Expected: All endpoints tested, schemas validated
```

### Test 2: Run Contract Tests
```bash
# Run contract verification
npm run test:api:contracts

# Expected: All API contracts verified against implementation
```

### Test 3: Run Error Scenario Tests
```bash
# Test error handling
npm run test:api:errors

# Expected: All error scenarios handled correctly
```

## 📝 Implementation Notes

### API Test Structure
```
api-tests/
├── collections/
│   ├── auth.postman.json
│   ├── escrows.postman.json
│   ├── listings.postman.json
│   └── admin.postman.json
├── contracts/
│   ├── escrows-contract.json
│   ├── listings-contract.json
│   └── auth-contract.json
├── schemas/
│   ├── escrow-response.schema.json
│   ├── listing-response.schema.json
│   ├── error-response.schema.json
│   └── pagination.schema.json
├── error-scenarios/
│   ├── validation-errors.test.js
│   ├── auth-errors.test.js
│   ├── not-found-errors.test.js
│   └── server-errors.test.js
├── performance/
│   └── api-performance.test.js
└── helpers/
    ├── auth.js
    ├── data-generators.js
    └── schema-validator.js
```

### Postman Collection Example
```json
{
  "info": {
    "name": "Escrows API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Escrows",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function() {",
              "  pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Response is array', function() {",
              "  pm.expect(pm.response.json()).to.be.an('array');",
              "});",
              "",
              "pm.test('Schema is valid', function() {",
              "  const schema = pm.environment.get('escrowSchema');",
              "  pm.response.to.have.jsonSchema(schema);",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/v1/escrows",
          "host": ["{{baseUrl}}"],
          "path": ["v1", "escrows"]
        }
      }
    }
  ]
}
```

### Contract Testing with Pact
```javascript
// contracts/escrows.contract.test.js
const { Pact } = require('@pact-foundation/pact');
const path = require('path');
const { getEscrows } = require('../../frontend/src/services/escrow.service');

const provider = new Pact({
  consumer: 'CRM Frontend',
  provider: 'CRM API',
  port: 8080,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
});

describe('Escrows API Contract', () => {
  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe('GET /v1/escrows', () => {
    beforeEach(() => {
      const expectedResponse = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          property_address: '123 Test St',
          closing_date: '2025-12-31',
          purchase_price: 500000,
          escrow_status: 'active',
          created_at: '2025-01-01T00:00:00Z',
        },
      ];

      return provider.addInteraction({
        state: 'escrows exist',
        uponReceiving: 'a request for all escrows',
        withRequest: {
          method: 'GET',
          path: '/v1/escrows',
          headers: {
            Authorization: 'Bearer token',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedResponse,
        },
      });
    });

    it('returns escrows', async () => {
      const escrows = await getEscrows('token');
      expect(escrows).toHaveLength(1);
      expect(escrows[0].property_address).toBe('123 Test St');
    });
  });
});
```

### JSON Schema Validation
```json
// schemas/escrow-response.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": [
    "id",
    "property_address",
    "closing_date",
    "purchase_price",
    "escrow_status"
  ],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "property_address": {
      "type": "string",
      "minLength": 1
    },
    "closing_date": {
      "type": "string",
      "format": "date"
    },
    "purchase_price": {
      "type": "number",
      "minimum": 0
    },
    "escrow_status": {
      "type": "string",
      "enum": ["active", "pending", "closed", "cancelled"]
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "additionalProperties": false
}
```

### Schema Validation Test
```javascript
// helpers/schema-validator.js
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

function validateSchema(data, schema) {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    console.error('Schema validation errors:', validate.errors);
    return { valid: false, errors: validate.errors };
  }

  return { valid: true };
}

module.exports = { validateSchema };
```

```javascript
// Using in tests
const { validateSchema } = require('../helpers/schema-validator');
const escrowSchema = require('../schemas/escrow-response.schema.json');

it('should return valid escrow schema', async () => {
  const res = await request(app)
    .get('/v1/escrows/123')
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(200);

  const validation = validateSchema(res.body, escrowSchema);
  expect(validation.valid).toBe(true);
});
```

### Error Scenario Tests
```javascript
// error-scenarios/validation-errors.test.js
describe('API Validation Errors', () => {
  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${token}`)
      .send({});  // Missing all fields

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('required');
  });

  it('should return 400 for invalid data types', async () => {
    const res = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${token}`)
      .send({
        property_address: '123 Test St',
        closing_date: 'not-a-date',  // Invalid date
        purchase_price: 'not-a-number',  // Invalid number
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/date|number/i);
  });

  it('should return 400 for invalid enum values', async () => {
    const res = await request(app)
      .patch('/v1/escrows/123')
      .set('Authorization', `Bearer ${token}`)
      .send({
        escrow_status: 'invalid-status',  // Not in enum
      });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid UUIDs', async () => {
    const res = await request(app)
      .get('/v1/escrows/not-a-uuid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('invalid');
  });
});
```

### Authentication Error Tests
```javascript
// error-scenarios/auth-errors.test.js
describe('API Authentication Errors', () => {
  it('should return 401 for missing token', async () => {
    const res = await request(app)
      .get('/v1/escrows');
    // No Authorization header

    expect(res.status).toBe(401);
  });

  it('should return 401 for invalid token', async () => {
    const res = await request(app)
      .get('/v1/escrows')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });

  it('should return 401 for expired token', async () => {
    const expiredToken = generateExpiredToken();

    const res = await request(app)
      .get('/v1/escrows')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('expired');
  });

  it('should return 403 for insufficient permissions', async () => {
    const agentToken = await getAuthToken({ role: 'agent' });

    const res = await request(app)
      .get('/v1/admin/users')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(403);
  });
});
```

### Rate Limiting Tests
```javascript
// error-scenarios/rate-limiting.test.js
describe('API Rate Limiting', () => {
  it('should return 429 after exceeding rate limit', async () => {
    const token = await getAuthToken();

    // Make 31 requests (assuming limit is 30/15min)
    for (let i = 0; i < 31; i++) {
      const res = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${token}`);

      if (i < 30) {
        expect(res.status).toBe(200);
      } else {
        expect(res.status).toBe(429);
        expect(res.body.error).toContain('rate limit');
        expect(res.headers).toHaveProperty('retry-after');
      }
    }
  });
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "test:api": "jest api-tests/",
    "test:api:contracts": "jest api-tests/contracts/",
    "test:api:errors": "jest api-tests/error-scenarios/",
    "test:api:schemas": "jest --testPathPattern=schema",
    "test:api:postman": "newman run api-tests/collections/escrows.postman.json -e api-tests/environments/staging.json"
  }
}
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] API tests in /api-tests directory
- [ ] Schemas in JSON files
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-94**:
- API endpoints: 100% coverage
- Contract tests: All APIs covered
- Error scenarios: Comprehensive coverage
- Schema validation: All responses validated

## 🔗 Dependencies

### Depends On
- Project-87 (Integration tests provide foundation)
- API documentation complete
- Test environment configured

### Blocks
- None (complements existing tests)

### Parallel Work
- Can work alongside Projects 92-93 (Mobile/Browser testing)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-87 complete
- ✅ API documentation exists
- ✅ API stable enough for contracts
- ✅ Test environment ready

### Should Skip If:
- ❌ No API (frontend-only app)
- ❌ API still rapidly changing

### Optimal Timing:
- After Project-87 complete
- After API stabilizes
- Before production launch

## ✅ Success Criteria
- [ ] API test framework configured
- [ ] Contract tests implemented
- [ ] Schema validation automated
- [ ] Error scenarios tested
- [ ] 100% endpoint coverage
- [ ] Performance baselines set
- [ ] CI/CD integration working
- [ ] Documentation complete
- [ ] MILESTONE ACHIEVED: API contracts validated

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] All API tests passing
- [ ] Contract tests verified
- [ ] Schemas validated
- [ ] Error scenarios covered
- [ ] Performance acceptable

### Post-Deployment Verification
- [ ] API tests run on each deploy
- [ ] Contract verification blocks breaking changes
- [ ] Schema validation prevents regressions
- [ ] Performance monitoring active

### Rollback Triggers
- Contract tests failing
- Schema validation failures
- Critical API errors
- Performance regressions

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Test framework configured
- [ ] Contract tests implemented
- [ ] Schema validation automated
- [ ] Error scenarios covered
- [ ] CI/CD integration working
- [ ] Documentation updated
- [ ] MILESTONE ACHIEVED: API testing automated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
