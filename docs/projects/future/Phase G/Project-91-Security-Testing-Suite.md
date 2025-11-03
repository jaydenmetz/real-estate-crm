# Project-91: Security Testing Suite

**Phase**: G | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Phase F complete
**MILESTONE**: Security vulnerabilities eliminated

## 🎯 Goal
Implement comprehensive security testing including automated scanners, penetration testing, dependency scanning, and authentication/authorization tests.

## 📋 Current → Target
**Now**: Manual security review complete (Phase F); no automated security testing
**Target**: Automated security scanners running; penetration tests performed; dependencies scanned; auth tests automated; vulnerabilities tracked
**Success Metric**: Zero critical vulnerabilities; automated scanning in CI/CD; penetration test report complete; all auth flows tested

## 📖 Context
Security testing validates that the application is protected against common vulnerabilities and attacks. This project implements automated security scanners (OWASP ZAP, Snyk), performs penetration testing, scans dependencies for vulnerabilities, and creates comprehensive authentication/authorization tests.

Key activities: Set up security scanners, run penetration tests, configure dependency scanning, test auth flows, and integrate security checks into CI/CD.

## ⚠️ Risk Assessment

### Technical Risks
- **False Positives**: Scanners flagging non-issues
- **Scanner Limitations**: Automated tools missing vulnerabilities
- **Breaking Changes**: Security fixes breaking functionality
- **Tool Overhead**: Security scans slowing CI/CD

### Business Risks
- **Data Breaches**: Undetected vulnerabilities exploited
- **Compliance Violations**: Security gaps causing regulatory issues
- **Reputation Damage**: Security incidents damaging trust
- **Legal Liability**: Negligent security causing lawsuits

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-91-security-$(date +%Y%m%d)
git push origin pre-project-91-security-$(date +%Y%m%d)

# Backup security configs
cp .snyk .snyk.backup 2>/dev/null || true
cp security/ security-backup/ -r 2>/dev/null || true
```

### If Things Break
```bash
# Restore configs
git checkout pre-project-91-security-YYYYMMDD -- security/ .snyk
git push origin main
```

## ✅ Tasks

### Planning (2 hours)
- [ ] Choose security testing tools
- [ ] Plan penetration testing scope
- [ ] Document security test scenarios
- [ ] Review OWASP Top 10 coverage
- [ ] Plan vulnerability remediation process

### Implementation (6.5 hours)
- [ ] **Automated Security Scanners** (2 hours):
  - [ ] Install OWASP ZAP or similar
  - [ ] Configure security scan profiles
  - [ ] Set up automated scans
  - [ ] Configure vulnerability thresholds
  - [ ] Integrate with CI/CD

- [ ] **Dependency Scanning** (1 hour):
  - [ ] Install Snyk or npm audit
  - [ ] Configure dependency scanning
  - [ ] Set up automated alerts
  - [ ] Create vulnerability remediation workflow
  - [ ] Document updating dependencies

- [ ] **Authentication Testing** (2 hours):
  - [ ] Test login with correct credentials
  - [ ] Test login with incorrect credentials
  - [ ] Test account lockout after failed attempts
  - [ ] Test password reset flow
  - [ ] Test JWT token expiration
  - [ ] Test JWT refresh tokens
  - [ ] Test session hijacking prevention
  - [ ] Test CSRF protection

- [ ] **Authorization Testing** (1 hour):
  - [ ] Test role-based access control
  - [ ] Test privilege escalation prevention
  - [ ] Test unauthorized API access
  - [ ] Test data isolation between teams
  - [ ] Test admin-only endpoints

- [ ] **Penetration Testing** (0.5 hours):
  - [ ] Run automated penetration tests
  - [ ] Document findings
  - [ ] Prioritize vulnerabilities
  - [ ] Create remediation plan

### Testing (1 hour)
- [ ] Run all security scanners
- [ ] Verify no critical vulnerabilities
- [ ] Test auth/authz tests
- [ ] Validate dependency scanning
- [ ] Check CI/CD integration

### Documentation (0.5 hours)
- [ ] Document security testing setup
- [ ] Document running security tests
- [ ] Document vulnerability remediation process
- [ ] Add security testing to README

## 🧪 Verification Tests

### Test 1: Run Security Scanner
```bash
# Run OWASP ZAP scan
npm run test:security

# Expected: Security scan completes, report generated
# Zero critical vulnerabilities
```

### Test 2: Dependency Scan
```bash
# Run dependency vulnerability scan
npm audit --production
# or
snyk test

# Expected: No high/critical vulnerabilities
```

### Test 3: Auth Testing
```bash
# Run authentication tests
npm run test:auth

# Expected: All auth flows tested, security controls verified
```

## 📝 Implementation Notes

### Security Test Structure
```
security/
├── scanners/
│   ├── owasp-zap-config.xml
│   ├── snyk.config.js
│   └── scan-results/
│       └── .gitkeep
├── tests/
│   ├── auth.security.test.js
│   ├── authz.security.test.js
│   ├── injection.security.test.js
│   ├── xss.security.test.js
│   └── csrf.security.test.js
├── pen-test/
│   ├── findings.md
│   ├── remediation-plan.md
│   └── retest-results.md
└── reports/
    └── .gitkeep
```

### Authentication Security Tests
```javascript
// security/tests/auth.security.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Authentication Security Tests', () => {
  describe('Password Security', () => {
    it('should reject weak passwords', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: '12345',  // Weak password
          name: 'Test User',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('password');
    });

    it('should enforce password complexity', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'nouppercaseornumbers',
          name: 'Test User',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Account Lockout', () => {
    it('should lock account after 5 failed login attempts', async () => {
      // Attempt login 5 times with wrong password
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/v1/auth/login')
          .send({
            email: 'admin@jaydenmetz.com',
            password: 'WrongPassword123!',
          });
      }

      // 6th attempt should be blocked
      const res = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'admin@jaydenmetz.com',
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(429);
      expect(res.body.error).toContain('locked');
    });
  });

  describe('JWT Security', () => {
    it('should reject expired JWT tokens', async () => {
      const expiredToken = 'expired.jwt.token';

      const res = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('expired');
    });

    it('should reject invalid JWT tokens', async () => {
      const invalidToken = 'invalid.jwt.token';

      const res = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(res.status).toBe(401);
    });

    it('should reject tampered JWT tokens', async () => {
      // Get valid token, then tamper with it
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'admin@jaydenmetz.com',
          password: 'SecurePassword123!',
        });

      let token = loginRes.body.token;
      // Tamper with token
      token = token.slice(0, -5) + 'XXXXX';

      const res = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Session Security', () => {
    it('should prevent session fixation', async () => {
      // Login with session ID
      const res1 = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'admin@jaydenmetz.com',
          password: 'SecurePassword123!',
        });

      const sessionId1 = res1.headers['set-cookie'];

      // Login again
      const res2 = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'admin@jaydenmetz.com',
          password: 'SecurePassword123!',
        });

      const sessionId2 = res2.headers['set-cookie'];

      // Session IDs should be different
      expect(sessionId1).not.toBe(sessionId2);
    });
  });
});
```

### Authorization Security Tests
```javascript
// security/tests/authz.security.test.js
describe('Authorization Security Tests', () => {
  let agentToken;
  let adminToken;

  beforeAll(async () => {
    // Create test users with different roles
    agentToken = await getAuthToken({ role: 'agent' });
    adminToken = await getAuthToken({ role: 'system_admin' });
  });

  describe('Role-Based Access Control', () => {
    it('should prevent agents from accessing admin endpoints', async () => {
      const res = await request(app)
        .get('/v1/admin/users')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admins to access admin endpoints', async () => {
      const res = await request(app)
        .get('/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Data Isolation', () => {
    it('should prevent users from accessing other teams data', async () => {
      // Create escrow for team A
      const team1Token = await getAuthToken({ team_id: 'team-1' });
      const escrow = await createTestEscrow({ team_id: 'team-1' });

      // Try to access from team B
      const team2Token = await getAuthToken({ team_id: 'team-2' });
      const res = await request(app)
        .get(`/v1/escrows/${escrow.id}`)
        .set('Authorization', `Bearer ${team2Token}`);

      expect(res.status).toBe(404);  // Or 403
    });
  });

  describe('Privilege Escalation Prevention', () => {
    it('should prevent users from modifying their own role', async () => {
      const res = await request(app)
        .patch('/v1/users/me')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ role: 'system_admin' });

      expect(res.status).toBe(403);
    });
  });
});
```

### SQL Injection Tests
```javascript
// security/tests/injection.security.test.js
describe('SQL Injection Prevention', () => {
  it('should sanitize search inputs', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .get('/v1/escrows?search=\' OR 1=1--')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    // Should return empty or sanitized results, not all escrows
    expect(res.body).not.toHaveLength(100);  // Adjust based on test data
  });

  it('should use parameterized queries', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${token}`)
      .send({
        property_address: '\'; DROP TABLE escrows;--',
        closing_date: '2025-12-31',
        purchase_price: 500000,
      });

    // Should either create safely or reject, but never execute SQL
    expect([201, 400]).toContain(res.status);

    // Verify escrows table still exists
    const checkRes = await request(app)
      .get('/v1/escrows')
      .set('Authorization', `Bearer ${token}`);

    expect(checkRes.status).toBe(200);
  });
});
```

### XSS Tests
```javascript
// security/tests/xss.security.test.js
describe('XSS Prevention', () => {
  it('should sanitize user inputs', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${token}`)
      .send({
        property_address: '<script>alert("XSS")</script>',
        closing_date: '2025-12-31',
        purchase_price: 500000,
      });

    if (res.status === 201) {
      // If created, retrieve and check sanitization
      const escrow = res.body;
      expect(escrow.property_address).not.toContain('<script>');
    }
  });
});
```

### OWASP Top 10 Coverage
1. **A01:2021 - Broken Access Control**: Authorization tests
2. **A02:2021 - Cryptographic Failures**: JWT tests, password hashing
3. **A03:2021 - Injection**: SQL injection tests
4. **A04:2021 - Insecure Design**: Architecture review (Phase F)
5. **A05:2021 - Security Misconfiguration**: Automated scanners
6. **A06:2021 - Vulnerable Components**: Dependency scanning
7. **A07:2021 - Authentication Failures**: Auth tests
8. **A08:2021 - Software/Data Integrity**: Dependency scanning
9. **A09:2021 - Logging Failures**: Audit log tests (Project-65)
10. **A10:2021 - SSRF**: Input validation tests

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Security tests in /security directory
- [ ] Scanner configs version controlled
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-91**:
- Security tests: OWASP Top 10 covered
- Automated scanning: Running in CI/CD
- Dependency scanning: Automated alerts
- Auth/authz: Comprehensive test coverage

## 🔗 Dependencies

### Depends On
- Phase F complete (Security implementation done)
- Test infrastructure from Projects 86-87

### Blocks
- None (can run parallel with other tests)

### Parallel Work
- Can work alongside Projects 89-90 (Performance/Load testing)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Phase F complete
- ✅ Security tools approved for use
- ✅ Test infrastructure ready
- ✅ Permission for penetration testing

### Should Skip If:
- ❌ Not handling sensitive data (unlikely for CRM)
- ❌ Security not a concern (never!)

### Optimal Timing:
- After Phase F complete
- Before production launch
- Ongoing (run regularly)

## ✅ Success Criteria
- [ ] Security scanners configured
- [ ] Dependency scanning automated
- [ ] Authentication tests complete
- [ ] Authorization tests complete
- [ ] OWASP Top 10 tested
- [ ] Penetration test completed
- [ ] Zero critical vulnerabilities
- [ ] CI/CD integration working
- [ ] Documentation complete
- [ ] MILESTONE ACHIEVED: Security validated

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] All security tests passing
- [ ] Zero critical vulnerabilities
- [ ] Dependency scan clean
- [ ] Penetration test complete
- [ ] Remediation plan for any findings

### Post-Deployment Verification
- [ ] Security scans run on each deploy
- [ ] Dependency alerts configured
- [ ] Vulnerability tracking in place
- [ ] Incident response plan ready

### Rollback Triggers
- Critical vulnerabilities discovered
- Security tests consistently failing
- Compliance violations detected
- Penetration test failures

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Scanners configured
- [ ] Auth/authz tests complete
- [ ] Dependency scanning automated
- [ ] Penetration test done
- [ ] Zero critical vulnerabilities
- [ ] CI/CD integration working
- [ ] Documentation updated
- [ ] MILESTONE ACHIEVED: Security testing complete

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
