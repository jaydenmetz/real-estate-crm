# Project-79: Input Sanitization Audit

**Phase**: F | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 6 hrs + 2 hrs = 8 hrs | **Deps**: Project-76 complete
**MILESTONE**: None

## 🎯 Goal
Audit all input points in the application and implement comprehensive input sanitization to prevent injection attacks and malicious data entry.

## 📋 Current → Target
**Now**: Basic input validation; inconsistent sanitization across endpoints
**Target**: Comprehensive input sanitization on all API endpoints, form inputs, and user-generated content with validation layers and malicious input testing
**Success Metric**: All inputs sanitized; XSS/SQL injection payloads blocked; validation errors logged; zero injection vulnerabilities

## 📖 Context
Input sanitization is the first line of defense against injection attacks (SQL injection, XSS, command injection). This project audits every input point (API endpoints, forms, file uploads, URL parameters) and implements defense-in-depth sanitization: client-side validation, server-side validation, database parameterization, and output encoding.

Key activities: Audit all API endpoints for input validation, implement sanitization middleware, add validation libraries (Joi, validator.js), sanitize user-generated content, prevent SQL injection with parameterized queries, and test with malicious input payloads.

## ⚠️ Risk Assessment

### Technical Risks
- **Overly Aggressive Sanitization**: Blocking legitimate inputs (e.g., names with apostrophes)
- **Sanitization Bypasses**: Attackers finding encoding tricks to bypass filters
- **Performance Impact**: Heavy sanitization slowing down API responses
- **Breaking Changes**: Sanitization rejecting previously accepted data

### Business Risks
- **User Frustration**: Legitimate data rejected by overzealous validation
- **Data Loss**: Sanitization stripping important characters from inputs
- **Support Burden**: Users complaining about "invalid input" errors
- **Injection Exploits**: Incomplete sanitization allowing attacks

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-79-input-sanitization-$(date +%Y%m%d)
git push origin pre-project-79-input-sanitization-$(date +%Y%m%d)
```

### If Things Break
```bash
# If sanitization blocks legitimate inputs
# Rollback validation middleware
git checkout pre-project-79-input-sanitization-YYYYMMDD -- backend/src/middleware/validation.middleware.js
git push origin main

# Or temporarily disable validation
# DISABLE_INPUT_VALIDATION=true (emergency only)
```

## ✅ Tasks

### Planning (1 hour)
- [ ] Audit all API endpoints for input validation
- [ ] Identify user-generated content locations
- [ ] Plan sanitization strategy (allowlist vs blocklist)
- [ ] Select validation libraries (Joi, validator.js)
- [ ] Create malicious input test suite

### Implementation (5 hours)
- [ ] **Sanitization Middleware** (2 hours):
  - [ ] Install Joi and validator.js
  - [ ] Create input validation middleware
  - [ ] Implement schema validation for all endpoints
  - [ ] Add sanitization for special characters
  - [ ] Implement allowlist validation (emails, phone numbers, etc.)
  - [ ] Add HTML sanitization (strip script tags)

- [ ] **Endpoint Validation** (2.5 hours):
  - [ ] Add validation to POST /v1/escrows
  - [ ] Add validation to POST /v1/listings
  - [ ] Add validation to POST /v1/clients
  - [ ] Add validation to POST /v1/leads
  - [ ] Add validation to POST /v1/appointments
  - [ ] Add validation to POST /v1/auth/* (email, password)
  - [ ] Add validation to all user profile endpoints

- [ ] **Database Layer** (0.5 hours):
  - [ ] Verify all queries use parameterized statements
  - [ ] Replace string concatenation with placeholders
  - [ ] Add input validation to service layer

### Testing (1.5 hours)
- [ ] Test SQL injection payloads (e.g., `'; DROP TABLE users;--`)
- [ ] Test XSS payloads (e.g., `<script>alert('XSS')</script>`)
- [ ] Test command injection payloads (e.g., `; ls -la`)
- [ ] Test Unicode/encoding tricks (e.g., `\u003cscript\u003e`)
- [ ] Test legitimate inputs with special characters
- [ ] Test validation error responses

### Documentation (0.5 hours)
- [ ] Document input validation rules
- [ ] Add sanitization examples to API_REFERENCE.md
- [ ] Create allowlist/blocklist documentation
- [ ] Document validation error codes

## 🧪 Verification Tests

### Test 1: SQL Injection Prevention
```bash
# Test SQL injection in property address
curl -X POST https://api.jaydenmetz.com/v1/escrows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "property_address": "123 Main St'; DROP TABLE escrows;--",
    "closing_date": "2025-12-01",
    "purchase_price": 500000
  }'
# Expected: 400 Bad Request (invalid input) OR input sanitized to "123 Main St"

# Verify escrows table still exists
psql $DATABASE_URL -c "\d escrows"
# Expected: Table definition returned (not dropped)
```

### Test 2: XSS Prevention
```bash
# Test XSS in client name
curl -X POST https://api.jaydenmetz.com/v1/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>John Doe",
    "email": "john@example.com"
  }'
# Expected: 400 Bad Request OR script tags stripped

# Verify stored data (if accepted)
psql $DATABASE_URL -c "SELECT name FROM clients WHERE email = 'john@example.com';"
# Expected: "John Doe" (script tags removed) OR no record (rejected)
```

### Test 3: Legitimate Special Characters
```bash
# Test legitimate apostrophe in name
curl -X POST https://api.jaydenmetz.com/v1/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "O'\''Brien",
    "email": "obrien@example.com"
  }'
# Expected: 200 OK (legitimate apostrophe allowed)

# Verify stored correctly
psql $DATABASE_URL -c "SELECT name FROM clients WHERE email = 'obrien@example.com';"
# Expected: "O'Brien" (apostrophe preserved)
```

## 📝 Implementation Notes

### Joi Validation Schemas
```javascript
const Joi = require('joi');

const escrowSchema = Joi.object({
  property_address: Joi.string()
    .min(5)
    .max(255)
    .pattern(/^[a-zA-Z0-9\s,.-]+$/) // Allow alphanumeric, spaces, commas, periods, hyphens
    .required(),
  closing_date: Joi.date().iso().required(),
  purchase_price: Joi.number().min(0).max(100000000).required(),
  escrow_status: Joi.string().valid('pending', 'active', 'closed', 'cancelled')
});

const clientSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s'-]+$/) // Allow letters, spaces, apostrophes, hyphens
    .required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/) // E.164 format
});
```

### HTML Sanitization
```javascript
const sanitizeHtml = require('sanitize-html');

function sanitizeUserInput(input) {
  return sanitizeHtml(input, {
    allowedTags: [], // Strip all HTML tags
    allowedAttributes: {}
  });
}

// Usage in controller
const sanitizedName = sanitizeUserInput(req.body.name);
```

### Parameterized Queries (PostgreSQL)
```javascript
// GOOD: Parameterized query
const result = await db.query(
  'SELECT * FROM escrows WHERE property_address = $1',
  [propertyAddress]
);

// BAD: String concatenation (vulnerable to SQL injection)
const result = await db.query(
  `SELECT * FROM escrows WHERE property_address = '${propertyAddress}'`
);
```

### Input Validation Middleware
```javascript
function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.body = value; // Use sanitized/validated data
    next();
  };
}

// Usage
router.post('/escrows', validateRequest(escrowSchema), escrowController.create);
```

### Malicious Input Test Suite
```javascript
const maliciousInputs = [
  // SQL Injection
  "'; DROP TABLE users;--",
  "1' OR '1'='1",
  "admin'--",

  // XSS
  "<script>alert('XSS')</script>",
  "<img src=x onerror=alert('XSS')>",
  "javascript:alert('XSS')",

  // Command Injection
  "; ls -la",
  "| cat /etc/passwd",
  "&& rm -rf /",

  // Unicode/Encoding Tricks
  "\\u003cscript\\u003ealert('XSS')\\u003c/script\\u003e",
  "%3Cscript%3Ealert('XSS')%3C/script%3E"
];
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use existing validation middleware patterns
- [ ] Auto-commit and push after completion
- [ ] Test on staging before production

## 🧪 Test Coverage Impact
**After Project-79**:
- Input validation tests: Coverage for all API endpoints
- Malicious input tests: Test suite with SQL/XSS/Command injection payloads
- Edge case tests: Special characters, Unicode, long strings
- Validation error tests: Verify error responses formatted correctly

## 🔗 Dependencies

### Depends On
- Project-76 (Security Audit Complete - audit identifies input validation gaps)

### Blocks
- Project-80 (XSS Protection Verification - needs input sanitization first)
- Project-81 (SQL Injection Prevention - needs parameterized queries verified)

### Parallel Work
- Can work alongside Projects 77, 78, 82-84

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-76 complete (security audit identified input validation gaps)
- ✅ API endpoints documented
- ✅ Test suite in place
- ✅ Staging environment available for testing

### Should Skip If:
- ❌ No user input accepted (static site, read-only API)
- ❌ Input validation already comprehensive (rare)

### Optimal Timing:
- After security audit (Project-76)
- Before XSS/SQL injection testing (Projects 80-81)
- Before public beta launch

## ✅ Success Criteria
- [ ] All API endpoints have input validation
- [ ] Joi schemas defined for all entities
- [ ] HTML sanitization implemented
- [ ] Parameterized queries verified (no string concatenation)
- [ ] SQL injection payloads blocked
- [ ] XSS payloads blocked
- [ ] Command injection payloads blocked
- [ ] Legitimate special characters allowed (apostrophes, hyphens)
- [ ] Validation errors logged
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] All validation schemas tested on staging
- [ ] Malicious input test suite passing
- [ ] Legitimate inputs still accepted
- [ ] Validation error responses user-friendly
- [ ] No performance degradation

### Post-Deployment Verification
- [ ] Test input validation on production API
- [ ] Monitor validation error rate (<5% of requests)
- [ ] Verify no legitimate inputs blocked
- [ ] Check logs for injection attempts
- [ ] Confirm parameterized queries working

### Rollback Triggers
- Validation blocking >10% of legitimate requests
- Performance degradation (>200ms added latency)
- Validation errors causing user complaints
- Critical data unable to be entered

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Input validation middleware implemented
- [ ] Joi schemas defined for all endpoints
- [ ] HTML sanitization working
- [ ] Parameterized queries verified
- [ ] Malicious input test suite passing
- [ ] Legitimate inputs accepted
- [ ] Validation errors logged
- [ ] Zero injection vulnerabilities
- [ ] Documentation complete

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
