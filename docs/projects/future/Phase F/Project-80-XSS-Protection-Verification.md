# Project-80: XSS Protection Verification

**Phase**: F | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 6 hrs + 2 hrs = 8 hrs | **Deps**: Project-79 complete
**MILESTONE**: None

## 🎯 Goal
Verify comprehensive XSS (Cross-Site Scripting) protection across all output points with CSP headers, output encoding, and payload testing.

## 📋 Current → Target
**Now**: Basic HTML sanitization on input; no CSP headers; inconsistent output encoding
**Target**: Comprehensive XSS protection with Content Security Policy headers, output encoding at all render points, and verified defense against XSS payload testing
**Success Metric**: Zero XSS vulnerabilities; CSP headers configured; all outputs encoded; XSS payload test suite passing

## 📖 Context
XSS (Cross-Site Scripting) is one of the most common web vulnerabilities (OWASP Top 10 #3). This project implements defense-in-depth XSS protection: Content Security Policy (CSP) headers to restrict script sources, output encoding at all render points (React auto-escapes, but need to verify), and comprehensive testing with XSS payloads.

Key activities: Audit all output points (HTML, JSON, attributes), configure CSP headers, verify React escaping, test with XSS payload database, implement DOMPurify for rich text, and add CSP violation reporting.

## ⚠️ Risk Assessment

### Technical Risks
- **CSP Breaking Functionality**: Too strict CSP blocking legitimate scripts
- **React Vulnerabilities**: dangerouslySetInnerHTML bypassing protections
- **Third-Party Scripts**: External dependencies requiring CSP exceptions
- **Legacy Browser Support**: Older browsers not supporting CSP

### Business Risks
- **User Data Theft**: XSS attacks stealing session tokens/user data
- **Malware Distribution**: Attackers injecting malicious scripts
- **Reputation Damage**: XSS exploits damaging trust
- **Compliance Violations**: XSS vulnerabilities failing security audits

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-80-xss-protection-$(date +%Y%m%d)
git push origin pre-project-80-xss-protection-$(date +%Y%m%d)
```

### If Things Break
```bash
# If CSP headers break functionality
# Rollback CSP middleware
git checkout pre-project-80-xss-protection-YYYYMMDD -- backend/src/middleware/security.middleware.js
git push origin main

# Or switch to report-only mode
# CSP_REPORT_ONLY=true
```

## ✅ Tasks

### Planning (1 hour)
- [ ] Audit all output points (components rendering user data)
- [ ] Review React dangerouslySetInnerHTML usage
- [ ] Plan CSP policy (allowed sources for scripts, styles, images)
- [ ] Compile XSS payload test database
- [ ] Document CSP exceptions (third-party scripts: Stripe, analytics)

### Implementation (4.5 hours)
- [ ] **CSP Headers** (1.5 hours):
  - [ ] Install helmet middleware
  - [ ] Configure Content-Security-Policy header
  - [ ] Set script-src, style-src, img-src, connect-src directives
  - [ ] Add CSP nonces for inline scripts (if needed)
  - [ ] Configure CSP report-uri for violations

- [ ] **Output Encoding** (2 hours):
  - [ ] Audit all React components rendering user data
  - [ ] Verify no dangerouslySetInnerHTML usage (or DOMPurify if used)
  - [ ] Implement DOMPurify for rich text rendering
  - [ ] Add output encoding to JSON responses (if needed)
  - [ ] Verify attribute encoding (href, src)

- [ ] **XSS Testing** (1 hour):
  - [ ] Create XSS payload test suite
  - [ ] Test stored XSS (data saved to database)
  - [ ] Test reflected XSS (URL parameters)
  - [ ] Test DOM-based XSS (client-side JavaScript)
  - [ ] Test mutation XSS (encoding tricks)

### Testing (2 hours)
- [ ] Test XSS payloads on all input fields
- [ ] Test CSP headers blocking inline scripts
- [ ] Test CSP report-uri receiving violations
- [ ] Test DOMPurify sanitizing rich text
- [ ] Test third-party scripts still working (Stripe, etc.)
- [ ] Browser compatibility testing (Chrome, Firefox, Safari, Edge)

### Documentation (0.5 hours)
- [ ] Document CSP policy and exceptions
- [ ] Add XSS protection to SECURITY_REFERENCE.md
- [ ] Document DOMPurify usage for rich text
- [ ] Create CSP violation monitoring guide

## 🧪 Verification Tests

### Test 1: Stored XSS Prevention
```bash
# Test stored XSS in client name
curl -X POST https://api.jaydenmetz.com/v1/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<img src=x onerror=alert(\"XSS\")>",
    "email": "test@example.com"
  }'
# Expected: 400 Bad Request OR script tags stripped

# Verify in UI (open client details page)
# Expected: No alert popup, "<img src=x onerror=alert(\"XSS\")>" displayed as text
```

### Test 2: CSP Headers
```bash
# Check CSP header
curl -I https://crm.jaydenmetz.com
# Expected:
# Content-Security-Policy: default-src 'self'; script-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.jaydenmetz.com; report-uri /csp-violation-report
```

### Test 3: Reflected XSS Prevention
```bash
# Test reflected XSS in URL parameter
curl "https://crm.jaydenmetz.com/search?q=<script>alert('XSS')</script>"
# Expected: Query parameter displayed as text, no script execution

# Open in browser: https://crm.jaydenmetz.com/search?q=<script>alert('XSS')</script>
# Expected: No alert popup
```

## 📝 Implementation Notes

### CSP Header Configuration
```javascript
const helmet = require('helmet');

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://js.stripe.com", // Stripe payment forms
        // Add nonce for inline scripts if needed: "'nonce-{random}'"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Material-UI requires inline styles
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:", // Base64 images
        "https:", // External images (MLS listings)
      ],
      connectSrc: [
        "'self'",
        "https://api.jaydenmetz.com", // API
        "wss://api.jaydenmetz.com", // WebSocket
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      reportUri: "/csp-violation-report"
    }
  })
);
```

### DOMPurify for Rich Text
```javascript
import DOMPurify from 'dompurify';

// Safe rendering of user HTML (if absolutely necessary)
function SafeHTML({ html }) {
  const cleanHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });

  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
}
```

### React XSS Prevention (Built-in)
```jsx
// SAFE: React auto-escapes
function ClientName({ client }) {
  return <div>{client.name}</div>; // "<script>alert('XSS')</script>" rendered as text
}

// UNSAFE: dangerouslySetInnerHTML bypasses escaping
function ClientNameUnsafe({ client }) {
  return <div dangerouslySetInnerHTML={{ __html: client.name }} />; // XSS vulnerable!
}

// SAFE: Use DOMPurify if HTML needed
function ClientNameSafe({ client }) {
  const cleanHTML = DOMPurify.sanitize(client.name);
  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
}
```

### XSS Payload Test Database
```javascript
const xssPayloads = [
  // Basic XSS
  "<script>alert('XSS')</script>",
  "<img src=x onerror=alert('XSS')>",
  "<svg onload=alert('XSS')>",

  // Event handlers
  "<body onload=alert('XSS')>",
  "<input onfocus=alert('XSS') autofocus>",
  "<marquee onstart=alert('XSS')>",

  // JavaScript protocol
  "<a href=\"javascript:alert('XSS')\">Click</a>",
  "<iframe src=\"javascript:alert('XSS')\">",

  // Mutation XSS
  "<noscript><p title=\"</noscript><img src=x onerror=alert('XSS')\">",

  // Encoding tricks
  "\\u003cscript\\u003ealert('XSS')\\u003c/script\\u003e",
  "%3Cscript%3Ealert('XSS')%3C/script%3E",

  // Filter bypass
  "<scr<script>ipt>alert('XSS')</scr</script>ipt>",
  "<<SCRIPT>alert('XSS')//<</SCRIPT>",
];
```

### CSP Violation Reporting
```javascript
// Endpoint to receive CSP violations
app.post('/csp-violation-report', (req, res) => {
  const violation = req.body['csp-report'];

  console.error('CSP Violation:', {
    blockedUri: violation['blocked-uri'],
    violatedDirective: violation['violated-directive'],
    documentUri: violation['document-uri']
  });

  // Log to monitoring system (Sentry, etc.)
  res.status(204).end();
});
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use helmet middleware for security headers
- [ ] Auto-commit and push after completion
- [ ] Test on staging before production

## 🧪 Test Coverage Impact
**After Project-80**:
- XSS payload tests: Coverage for stored, reflected, DOM-based XSS
- CSP tests: Verify headers configured correctly
- Output encoding tests: Verify all user data escaped
- Browser compatibility tests: Chrome, Firefox, Safari, Edge

## 🔗 Dependencies

### Depends On
- Project-79 (Input Sanitization Audit - input sanitization is first line of defense)

### Blocks
- None (XSS protection is independent)

### Parallel Work
- Can work alongside Projects 77, 78, 81-84

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-79 complete (input sanitization implemented)
- ✅ React app rendering user data
- ✅ Third-party scripts documented (Stripe, analytics)
- ✅ Browser testing tools available

### Should Skip If:
- ❌ No user-generated content displayed
- ❌ Static site with no dynamic data

### Optimal Timing:
- After input sanitization (Project-79)
- Before public beta launch
- Before displaying user-generated content

## ✅ Success Criteria
- [ ] CSP headers configured and deployed
- [ ] All React components audited for XSS
- [ ] No dangerouslySetInnerHTML without DOMPurify
- [ ] DOMPurify implemented for rich text
- [ ] XSS payload test suite passing (0 vulnerabilities)
- [ ] CSP violation reporting working
- [ ] Third-party scripts still working (Stripe, etc.)
- [ ] Browser compatibility verified
- [ ] Zero XSS vulnerabilities
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] CSP headers tested on staging
- [ ] Third-party scripts still working (Stripe)
- [ ] XSS payloads blocked on staging
- [ ] CSP report-uri endpoint working
- [ ] Browser compatibility tested

### Post-Deployment Verification
- [ ] CSP headers returned on production
- [ ] Test XSS payloads on production (in test account)
- [ ] Verify third-party scripts loading
- [ ] Monitor CSP violations
- [ ] Check browser console for errors

### Rollback Triggers
- CSP blocking legitimate functionality
- Third-party scripts (Stripe) not loading
- XSS vulnerabilities still present
- Browser compatibility issues

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] CSP headers configured
- [ ] XSS payload test suite passing
- [ ] DOMPurify implemented
- [ ] No dangerouslySetInnerHTML vulnerabilities
- [ ] CSP violation reporting working
- [ ] Third-party scripts working
- [ ] Browser compatibility verified
- [ ] Zero XSS vulnerabilities
- [ ] Documentation complete

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
