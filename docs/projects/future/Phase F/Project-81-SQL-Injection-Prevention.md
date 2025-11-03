# Project-81: SQL Injection Prevention

**Phase**: F | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 6 hrs + 2 hrs = 8 hrs | **Deps**: Project-79 complete
**MILESTONE**: None

## 🎯 Goal
Verify comprehensive SQL injection prevention through parameterized queries, query validation, and injection payload testing.

## 📋 Current → Target
**Now**: Mostly parameterized queries; some string concatenation in dynamic queries
**Target**: 100% parameterized queries, no string concatenation, query validation, and verified defense against SQL injection payloads
**Success Metric**: Zero SQL injection vulnerabilities; all queries parameterized; SQL injection test suite passing

## 📖 Context
SQL injection is one of the most dangerous vulnerabilities (OWASP Top 10 #3). This project audits all database queries to ensure parameterization, eliminates string concatenation, implements query validation, and tests with SQL injection payloads. PostgreSQL parameterized queries ($1, $2) prevent injection by treating user input as data, not code.

Key activities: Audit all database queries, replace string concatenation with parameterized queries, implement query validation in service layer, test with SQL injection payload database, and add logging for suspicious queries.

## ⚠️ Risk Assessment

### Technical Risks
- **Breaking Dynamic Queries**: Parameterization limiting query flexibility
- **Performance Impact**: Parameterized queries sometimes slower
- **ORM Vulnerabilities**: Raw queries bypassing ORM protections
- **Stored Procedure Injection**: Second-order SQL injection

### Business Risks
- **Data Breach**: SQL injection exposing all database data
- **Data Loss**: Attackers deleting tables or records
- **Privilege Escalation**: Attackers gaining admin access
- **Reputation Damage**: SQL injection exploit damaging trust

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-81-sql-injection-$(date +%Y%m%d)
git push origin pre-project-81-sql-injection-$(date +%Y%m%d)

# Backup database before testing
pg_dump $DATABASE_URL > backup-pre-sql-injection-test-$(date +%Y%m%d).sql
```

### If Things Break
```bash
# If parameterized queries break functionality
# Rollback service layer
git checkout pre-project-81-sql-injection-YYYYMMDD -- backend/src/services/
git push origin main

# Restore database if test injection succeeds (security issue!)
psql $DATABASE_URL < backup-pre-sql-injection-test-YYYYMMDD.sql
```

## ✅ Tasks

### Planning (1 hour)
- [ ] Audit all database queries (grep for db.query, pool.query)
- [ ] Identify string concatenation in queries
- [ ] Plan parameterization strategy for dynamic queries
- [ ] Compile SQL injection payload test database
- [ ] Document query patterns (safe vs unsafe)

### Implementation (4.5 hours)
- [ ] **Query Audit** (1.5 hours):
  - [ ] Audit escrows.service.js queries
  - [ ] Audit listings.service.js queries
  - [ ] Audit clients.service.js queries
  - [ ] Audit leads.service.js queries
  - [ ] Audit appointments.service.js queries
  - [ ] Audit auth.service.js queries
  - [ ] Audit admin queries

- [ ] **Parameterization** (2.5 hours):
  - [ ] Replace string concatenation with placeholders ($1, $2, etc.)
  - [ ] Implement query builder for dynamic WHERE clauses
  - [ ] Parameterize ORDER BY and LIMIT clauses
  - [ ] Verify no raw SQL in controllers
  - [ ] Add query validation middleware

- [ ] **Testing** (0.5 hours):
  - [ ] Create SQL injection test suite
  - [ ] Test injection in WHERE clauses
  - [ ] Test injection in ORDER BY clauses
  - [ ] Test injection in LIMIT/OFFSET clauses
  - [ ] Test second-order injection (stored then executed)

### Testing (2 hours)
- [ ] Test SQL injection payloads on all endpoints
- [ ] Test authenticated vs unauthenticated injection
- [ ] Test boolean-based blind SQL injection
- [ ] Test time-based blind SQL injection
- [ ] Test UNION-based injection
- [ ] Verify all queries parameterized (code review)

### Documentation (0.5 hours)
- [ ] Document parameterized query patterns
- [ ] Add SQL injection prevention to SECURITY_REFERENCE.md
- [ ] Create query best practices guide
- [ ] Document dynamic query building

## 🧪 Verification Tests

### Test 1: WHERE Clause Injection
```bash
# Test SQL injection in property address filter
curl -X GET "https://api.jaydenmetz.com/v1/escrows?property_address=123' OR '1'='1" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 0 results (injection blocked) OR only matching address returned

# Verify no data leak
# Should NOT return all escrows (OR '1'='1' would match everything)
```

### Test 2: Classic SQL Injection (DROP TABLE)
```bash
# Test DROP TABLE injection
curl -X POST https://api.jaydenmetz.com/v1/escrows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "property_address": "123 Main'; DROP TABLE escrows;--",
    "closing_date": "2025-12-01",
    "purchase_price": 500000
  }'
# Expected: 400 Bad Request (validation) OR input treated as literal string

# Verify escrows table still exists
psql $DATABASE_URL -c "\d escrows"
# Expected: Table definition returned (not dropped)
```

### Test 3: UNION-Based Injection
```bash
# Test UNION injection to extract user data
curl -X GET "https://api.jaydenmetz.com/v1/escrows?property_address=123' UNION SELECT id, email, password FROM users--" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 400 Bad Request OR only matching escrows returned (no user data)
```

## 📝 Implementation Notes

### Parameterized Query Patterns

**UNSAFE (String Concatenation)**:
```javascript
// NEVER DO THIS - Vulnerable to SQL injection!
const propertyAddress = req.query.property_address;
const query = `SELECT * FROM escrows WHERE property_address = '${propertyAddress}'`;
const result = await db.query(query);
```

**SAFE (Parameterized Query)**:
```javascript
// ALWAYS DO THIS - Parameterized query
const propertyAddress = req.query.property_address;
const query = 'SELECT * FROM escrows WHERE property_address = $1';
const result = await db.query(query, [propertyAddress]);
```

### Dynamic WHERE Clauses (Safe)
```javascript
function buildWhereClause(filters) {
  const conditions = [];
  const values = [];
  let paramCount = 1;

  if (filters.property_address) {
    conditions.push(`property_address = $${paramCount++}`);
    values.push(filters.property_address);
  }

  if (filters.escrow_status) {
    conditions.push(`escrow_status = $${paramCount++}`);
    values.push(filters.escrow_status);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  return { whereClause, values };
}

// Usage
const filters = { property_address: '123 Main St', escrow_status: 'active' };
const { whereClause, values } = buildWhereClause(filters);
const query = `SELECT * FROM escrows ${whereClause}`;
const result = await db.query(query, values);
```

### ORDER BY Parameterization (Tricky)
```javascript
// ORDER BY cannot be parameterized directly (column names aren't values)
// Use allowlist validation instead

const allowedOrderColumns = ['closing_date', 'purchase_price', 'created_at'];
const allowedOrderDirections = ['ASC', 'DESC'];

function buildOrderBy(orderBy, orderDirection) {
  // Validate against allowlist
  if (!allowedOrderColumns.includes(orderBy)) {
    throw new Error('Invalid order column');
  }

  if (!allowedOrderDirections.includes(orderDirection.toUpperCase())) {
    throw new Error('Invalid order direction');
  }

  return `ORDER BY ${orderBy} ${orderDirection}`;
}

// Usage
const orderBy = req.query.orderBy || 'closing_date';
const orderDirection = req.query.orderDirection || 'DESC';
const orderClause = buildOrderBy(orderBy, orderDirection);
const query = `SELECT * FROM escrows ${orderClause}`;
```

### SQL Injection Payload Test Database
```javascript
const sqlInjectionPayloads = [
  // Classic injection
  "' OR '1'='1",
  "' OR 1=1--",
  "admin'--",

  // DROP TABLE
  "'; DROP TABLE users;--",
  "'); DROP TABLE escrows;--",

  // UNION-based
  "' UNION SELECT null, null, null--",
  "' UNION SELECT id, email, password FROM users--",

  // Stacked queries
  "'; INSERT INTO users (email, role) VALUES ('hacker@evil.com', 'admin');--",

  // Boolean-based blind
  "' AND 1=1--", // Should return results
  "' AND 1=2--", // Should return no results

  // Time-based blind
  "'; SELECT pg_sleep(10);--",

  // Comment tricks
  "' OR '1'='1' /*",
  "' OR '1'='1' #",
  "' OR '1'='1' --",
];
```

### Query Validation Middleware
```javascript
function validateQuery(query, values) {
  // Check for suspicious patterns in query string
  const suspiciousPatterns = [
    /;\s*DROP\s+TABLE/i,
    /;\s*DELETE\s+FROM/i,
    /;\s*INSERT\s+INTO/i,
    /UNION\s+SELECT/i,
    /pg_sleep/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(query)) {
      console.error('Suspicious query detected:', query);
      throw new Error('Invalid query');
    }
  }

  // Check for suspicious patterns in values
  for (const value of values) {
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          console.error('Suspicious value detected:', value);
          throw new Error('Invalid input');
        }
      }
    }
  }
}
```

### ORM Usage (Node-postgres)
```javascript
// Using node-postgres (pg) - already safe with parameterization
const { Pool } = require('pg');
const pool = new Pool();

// Safe query
async function getEscrowByAddress(propertyAddress) {
  const query = 'SELECT * FROM escrows WHERE property_address = $1';
  const result = await pool.query(query, [propertyAddress]);
  return result.rows[0];
}

// Safe insert
async function createEscrow(escrowData) {
  const query = `
    INSERT INTO escrows (property_address, closing_date, purchase_price)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [
    escrowData.property_address,
    escrowData.closing_date,
    escrowData.purchase_price
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use existing database connection patterns
- [ ] Auto-commit and push after completion
- [ ] Test on staging before production

## 🧪 Test Coverage Impact
**After Project-81**:
- SQL injection tests: Coverage for WHERE, ORDER BY, LIMIT clauses
- Payload tests: Test suite with classic, UNION, blind injection
- Query audit: 100% of queries reviewed and parameterized
- Code coverage: All service methods tested for SQL injection

## 🔗 Dependencies

### Depends On
- Project-79 (Input Sanitization Audit - input validation is first line of defense)

### Blocks
- None (SQL injection prevention is independent)

### Parallel Work
- Can work alongside Projects 77, 78, 80, 82-84

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-79 complete (input sanitization implemented)
- ✅ Database queries using node-postgres or similar
- ✅ Test database available for injection testing
- ✅ Backup process in place

### Should Skip If:
- ❌ No database (static site, API-only)
- ❌ Already using ORM with no raw queries (rare)

### Optimal Timing:
- After input sanitization (Project-79)
- Before public beta launch
- Before accepting user-generated WHERE clauses

## ✅ Success Criteria
- [ ] All database queries audited
- [ ] 100% parameterized queries (no string concatenation)
- [ ] Query builder implemented for dynamic queries
- [ ] ORDER BY allowlist validation implemented
- [ ] SQL injection payload test suite passing
- [ ] No UNION-based injection possible
- [ ] No DROP TABLE injection possible
- [ ] No boolean-based blind injection possible
- [ ] Query validation middleware implemented
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] All queries parameterized on staging
- [ ] SQL injection payloads blocked on staging
- [ ] Query validation middleware active
- [ ] Backup database before testing
- [ ] Code review confirms no string concatenation

### Post-Deployment Verification
- [ ] Test SQL injection payloads on production (test account only)
- [ ] Monitor query logs for suspicious patterns
- [ ] Verify query validation middleware active
- [ ] Check for SQL errors in logs (might indicate injection attempts)
- [ ] Confirm all tests passing

### Rollback Triggers
- SQL injection successful (security breach!)
- Parameterized queries breaking functionality
- Query validation blocking legitimate queries
- Database performance degradation

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] All queries audited and parameterized
- [ ] Query builder implemented
- [ ] SQL injection test suite passing
- [ ] No string concatenation in queries
- [ ] ORDER BY allowlist validation implemented
- [ ] Query validation middleware active
- [ ] Zero SQL injection vulnerabilities
- [ ] Code review complete
- [ ] Documentation complete

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
