# Project-99: Logging Enhancement

**Phase**: H | **Priority**: HIGH | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Project 98
**MILESTONE**: None

## 🎯 Goal
Implement structured logging with log aggregation, search capability, and retention policies.

## 📋 Current → Target
**Now**: Console.log statements, Railway logs interface
**Target**: Structured logging with levels, log aggregation service, searchable logs, retention policies, correlation IDs
**Success Metric**: All logs structured, searchable within seconds, 90-day retention, correlation IDs for request tracing

## 📖 Context
Currently using basic console.log statements scattered throughout the codebase. Need structured logging with proper levels, context, and aggregation for effective debugging and troubleshooting in production.

Key features: Winston/Pino logger setup, log levels (debug, info, warn, error), structured log format (JSON), log aggregation service, search interface, and retention policies.

## ⚠️ Risk Assessment

### Technical Risks
- **Log Volume**: Excessive logging consuming storage
- **Performance Impact**: Logging overhead slowing app
- **Missing Context**: Insufficient information in logs
- **PII Leakage**: Accidentally logging sensitive data

### Business Risks
- **Debug Difficulty**: Poor logs making troubleshooting hard
- **Compliance Issues**: Logs containing regulated data
- **Storage Costs**: High log volume increasing costs
- **Retention Violations**: Keeping logs too long/short

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-99-logging-$(date +%Y%m%d)
git push origin pre-project-99-logging-$(date +%Y%m%d)

# Backup current logging code
mkdir -p archive/logging-$(date +%Y%m%d)
cp backend/src/utils/logger.js archive/logging-$(date +%Y%m%d)/ 2>/dev/null || true
```

### If Things Break
```bash
# Rollback logging changes
git checkout pre-project-99-logging-YYYYMMDD -- backend/src/utils/logger.js
git checkout pre-project-99-logging-YYYYMMDD -- backend/src/middleware/logging.middleware.js
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Choose logging library (Winston vs Pino)
- [ ] Choose log aggregation service (Datadog/Logtail/Papertrail)
- [ ] Design log format and structure
- [ ] Define log levels per component
- [ ] Plan PII redaction strategy

### Implementation (5 hours)
- [ ] **Logger Setup** (2 hours):
  - [ ] Install Winston or Pino
  - [ ] Configure log levels per environment
  - [ ] Set up structured JSON format
  - [ ] Add correlation ID middleware
  - [ ] Configure log transports (console + service)
  - [ ] Add request/response logging

- [ ] **Log Aggregation** (1.5 hours):
  - [ ] Set up log aggregation service
  - [ ] Configure log shipping from Railway
  - [ ] Set up log retention policies
  - [ ] Create log search interface
  - [ ] Configure log parsing rules

- [ ] **Code Cleanup** (1.5 hours):
  - [ ] Replace console.log with logger
  - [ ] Add contextual logging to controllers
  - [ ] Add error logging to error handlers
  - [ ] Add performance logging to slow operations
  - [ ] Remove debug console.log statements

### Testing (1.5 hours)
- [ ] Test log levels filtering
- [ ] Verify structured format
- [ ] Test correlation ID tracking
- [ ] Verify log aggregation working
- [ ] Test log search functionality
- [ ] Validate PII redaction

### Documentation (1 hour)
- [ ] Document logging standards
- [ ] Create log analysis guide
- [ ] Document log retention policies
- [ ] Create troubleshooting guide using logs

## 🧪 Verification Tests

### Test 1: Structured Logging
```bash
# Make API request
curl -H "Authorization: Bearer $TOKEN" https://api.jaydenmetz.com/v1/escrows

# Check logs show structured format
railway logs --tail 10

# Expected: JSON format with timestamp, level, message, context, correlationId
```

### Test 2: Correlation ID Tracking
```bash
# Make request with custom correlation ID
curl -H "X-Correlation-ID: test-123" https://api.jaydenmetz.com/v1/health

# Search logs for correlation ID
# Expected: All logs for this request have correlationId: test-123
```

### Test 3: Log Aggregation Search
```bash
# Search for specific error in log service
# Query: level:error AND message:"Database connection failed"

# Expected: Returns all database connection errors with context
```

## 📝 Implementation Notes

### Winston Logger Configuration
```javascript
// backend/src/utils/logger.js
const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'real-estate-crm-api',
    env: process.env.NODE_ENV,
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Log aggregation service (if configured)
    process.env.LOG_SERVICE_URL && new winston.transports.Http({
      host: process.env.LOG_SERVICE_URL,
      path: '/logs',
      ssl: true,
    }),
  ],
});

// Redact sensitive fields
logger.addFilter('redactSensitive', (log) => {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
  sensitiveFields.forEach(field => {
    if (log[field]) log[field] = '[REDACTED]';
  });
  return log;
});

module.exports = logger;
```

### Correlation ID Middleware
```javascript
// backend/src/middleware/logging.middleware.js
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

function addCorrelationId(req, res, next) {
  // Use existing correlation ID or generate new one
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);

  // Add to logger context
  req.logger = logger.child({ correlationId: req.correlationId });

  next();
}

function logRequest(req, res, next) {
  const startTime = Date.now();

  req.logger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    req.logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}

module.exports = { addCorrelationId, logRequest };
```

### Log Levels Strategy

**DEBUG**: Detailed diagnostic information (development only)
```javascript
logger.debug('User query executed', { userId, query, results: 42 });
```

**INFO**: General informational messages
```javascript
logger.info('Escrow created', { escrowId, userId, propertyAddress });
```

**WARN**: Warning messages for potentially harmful situations
```javascript
logger.warn('API rate limit approaching', { userId, requestCount: 95 });
```

**ERROR**: Error events that might still allow the app to continue
```javascript
logger.error('Failed to send email', { error: err.message, userId, emailType });
```

**FATAL**: Very severe errors that might cause the app to abort
```javascript
logger.fatal('Database connection lost', { error: err.message });
```

### Structured Log Format
```json
{
  "timestamp": "2025-11-02 14:23:45",
  "level": "info",
  "message": "Escrow created",
  "service": "real-estate-crm-api",
  "env": "production",
  "correlationId": "abc123-def456-789",
  "userId": "user-uuid",
  "escrowId": "escrow-uuid",
  "propertyAddress": "123 Main St",
  "duration": "45ms"
}
```

### PII Redaction Rules
Always redact before logging:
- Passwords
- JWT tokens
- API keys
- Credit card numbers
- Social security numbers
- Email addresses (in some contexts)
- Phone numbers (in some contexts)

### Log Retention Policies
- **Development**: 7 days
- **Staging**: 30 days
- **Production**: 90 days
- **Compliance logs**: 7 years (audit logs)

### Log Aggregation Service Options

**Option 1: Datadog Logs** (Recommended if using Datadog monitoring)
- Pros: Integrated with APM, powerful search
- Cons: Can get expensive at scale

**Option 2: Logtail** (Good balance)
- Pros: Affordable, good UI, SQL queries
- Cons: Less features than Datadog

**Option 3: Papertrail** (Budget option)
- Pros: Simple, affordable, good for small teams
- Cons: Basic features

**Option 4: Railway Native** (Minimal option)
- Pros: Built-in, no extra cost
- Cons: Limited search, short retention

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Replace all console.log with logger
- [ ] Never log passwords or tokens
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-99**:
- Logging coverage: 100% of controllers and services
- Log searchability: All logs searchable within seconds
- Retention: 90-day retention for production logs
- Correlation tracking: All requests traceable end-to-end

## 🔗 Dependencies

### Depends On
- Project-98 (Monitoring Setup - logging integrates with monitoring)

### Blocks
- Project-100 (Error Tracking Integration - uses structured logs)

### Parallel Work
- None (integrates with monitoring)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-98 complete (monitoring infrastructure ready)
- ✅ Log aggregation service account created
- ✅ Log retention policies defined
- ✅ PII redaction rules documented

### Should Skip If:
- ❌ Using different logging solution already
- ❌ Console logs sufficient for use case

### Optimal Timing:
- Immediately after Project-98
- Before implementing error tracking (100)

## ✅ Success Criteria
- [ ] Winston/Pino logger configured
- [ ] Structured JSON log format
- [ ] Correlation IDs implemented
- [ ] Log aggregation service configured
- [ ] All console.log replaced
- [ ] PII redaction working
- [ ] Log search functional
- [ ] 90-day retention configured
- [ ] Documentation complete
- [ ] Zero PII in logs

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Test logging in staging environment
- [ ] Verify structured format
- [ ] Confirm correlation IDs working
- [ ] Test log aggregation
- [ ] Validate PII redaction

### Post-Deployment Verification
- [ ] Monitor log volume first 24 hours
- [ ] Verify logs searchable
- [ ] Confirm no PII leaking
- [ ] Check log retention working
- [ ] Validate no performance impact

### Rollback Triggers
- Log volume causing performance issues
- Excessive logging costs
- PII leaking in logs
- Log aggregation failing

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Logger configured
- [ ] Structured format implemented
- [ ] Correlation IDs working
- [ ] Log aggregation configured
- [ ] Console.log statements replaced
- [ ] PII redaction verified
- [ ] Deployed to production
- [ ] Documentation updated
- [ ] Team trained

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
