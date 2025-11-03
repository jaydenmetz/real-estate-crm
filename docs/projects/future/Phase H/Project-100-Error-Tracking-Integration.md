# Project-100: Error Tracking Integration

**Phase**: H | **Priority**: HIGH | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Project 99
**MILESTONE**: Comprehensive error tracking operational

## 🎯 Goal
Integrate error tracking service with grouping, source maps, and alerting for proactive error detection.

## 📋 Current → Target
**Now**: Errors logged to console/logs, manual discovery
**Target**: Sentry integrated with automatic error reporting, grouping, source maps, user context, and alerts
**Success Metric**: 100% of errors tracked, <5 minute detection time, source-mapped stack traces, intelligent error grouping

## 📖 Context
Currently errors are only visible in logs or when users report them. Need proactive error tracking with Sentry to detect errors immediately, group similar errors, identify affected users, and enable quick debugging with source-mapped stack traces.

Key features: Sentry integration, error grouping, source map upload, user context tracking, release tracking, error alerts, and performance monitoring.

## ⚠️ Risk Assessment

### Technical Risks
- **Source Map Exposure**: Revealing source code publicly
- **Performance Impact**: Error tracking overhead
- **Alert Noise**: Too many error notifications
- **Quota Limits**: Exceeding Sentry event quota

### Business Risks
- **User Privacy**: Tracking too much user data
- **Alert Fatigue**: Team ignoring error alerts
- **Cost Overruns**: High Sentry event volume
- **False Negatives**: Critical errors not detected

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-100-sentry-$(date +%Y%m%d)
git push origin pre-project-100-sentry-$(date +%Y%m%d)

# Backup current error handling
mkdir -p archive/error-handling-$(date +%Y%m%d)
cp backend/src/middleware/error.middleware.js archive/error-handling-$(date +%Y%m%d)/
```

### If Things Break
```bash
# Disable Sentry if causing issues
git checkout pre-project-100-sentry-YYYYMMDD -- backend/src/config/sentry.js
git checkout pre-project-100-sentry-YYYYMMDD -- frontend/src/config/sentry.js
git push origin main

# Temporarily disable in environment variables
railway variables set SENTRY_ENABLED=false
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Set up Sentry organization and projects
- [ ] Plan error grouping strategy
- [ ] Define sampling rates
- [ ] Plan alert rules
- [ ] Document source map upload process

### Implementation (5 hours)
- [ ] **Backend Integration** (2 hours):
  - [ ] Install @sentry/node
  - [ ] Configure Sentry SDK
  - [ ] Add error middleware
  - [ ] Configure breadcrumbs
  - [ ] Add user context
  - [ ] Set up release tracking
  - [ ] Configure source map upload

- [ ] **Frontend Integration** (2 hours):
  - [ ] Install @sentry/react
  - [ ] Configure Sentry SDK
  - [ ] Add error boundary
  - [ ] Configure breadcrumbs
  - [ ] Add user context
  - [ ] Set up release tracking
  - [ ] Configure source map upload

- [ ] **Alert Configuration** (1 hour):
  - [ ] Set up error rate alerts
  - [ ] Configure new issue alerts
  - [ ] Set up regression alerts
  - [ ] Configure notification channels (Slack)
  - [ ] Set up alert rules per environment

### Testing (1.5 hours)
- [ ] Test backend error capturing
- [ ] Test frontend error capturing
- [ ] Verify source maps working
- [ ] Test user context tracking
- [ ] Verify error grouping
- [ ] Test alert notifications

### Documentation (1 hour)
- [ ] Document Sentry integration
- [ ] Create error triage guide
- [ ] Document alert response procedures
- [ ] Document source map upload process

## 🧪 Verification Tests

### Test 1: Backend Error Tracking
```bash
# Trigger test error
curl -X POST https://api.jaydenmetz.com/v1/test-error \
  -H "Authorization: Bearer $TOKEN"

# Check Sentry dashboard
# Expected: Error appears in Sentry with full stack trace, user context
```

### Test 2: Frontend Error Tracking
```javascript
// In browser console
throw new Error('Test frontend error');

// Check Sentry dashboard
// Expected: Error appears with source-mapped stack trace, user context
```

### Test 3: Source Maps
```bash
# Check stack trace in Sentry shows original TypeScript/JSX code
# Not minified JavaScript

# Expected: Stack trace shows actual file names and line numbers from source
```

## 📝 Implementation Notes

### Backend Sentry Configuration
```javascript
// backend/src/config/sentry.js
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE || 'unknown',

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Profiling
  profilesSampleRate: 0.1,
  integrations: [
    new ProfilingIntegration(),
  ],

  // Before send hook for filtering
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Filter out known noise
    if (event.exception?.values?.[0]?.type === 'UnhandledRejection') {
      const value = event.exception.values[0].value;
      if (value && value.includes('ECONNREFUSED')) {
        return null; // Don't report connection refused errors
      }
    }

    return event;
  },
});

// Express middleware
function sentryrequestHandler() {
  return Sentry.Handlers.requestHandler();
}

function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors
      return true;
    },
  });
}

module.exports = { Sentry, sentryRequestHandler, sentryErrorHandler };
```

### Frontend Sentry Configuration
```javascript
// frontend/src/config/sentry.js
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.REACT_APP_SENTRY_RELEASE || 'unknown',

  // Performance Monitoring
  integrations: [new BrowserTracing()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay (optional)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Before send hook
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry would capture:', event);
      return null;
    }

    // Filter out known noise
    if (event.message && event.message.includes('ResizeObserver')) {
      return null; // Common benign error
    }

    return event;
  },
});

export default Sentry;
```

### Error Boundary Component
```javascript
// frontend/src/components/ErrorBoundary.jsx
import React from 'react';
import * as Sentry from '@sentry/react';
import { Box, Button, Typography } from '@mui/material';

function FallbackComponent({ error, resetError }) {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        We've been notified and are looking into it.
      </Typography>
      <Button variant="contained" onClick={resetError} sx={{ mt: 2 }}>
        Try Again
      </Button>
    </Box>
  );
}

const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: FallbackComponent,
    showDialog: false,
  }
);

export default ErrorBoundary;
```

### User Context Tracking
```javascript
// Set user context when user logs in
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
  role: user.role,
});

// Clear user context on logout
Sentry.setUser(null);
```

### Custom Error Context
```javascript
// Add custom context to errors
Sentry.setContext('escrow', {
  escrowId: escrow.id,
  status: escrow.status,
  propertyAddress: escrow.propertyAddress,
});

// Add breadcrumbs for debugging
Sentry.addBreadcrumb({
  category: 'escrow',
  message: 'User updated escrow status',
  level: 'info',
  data: {
    escrowId: escrow.id,
    oldStatus: 'pending',
    newStatus: 'active',
  },
});
```

### Source Map Upload
```json
// package.json scripts
{
  "scripts": {
    "build": "react-scripts build && npm run sentry:sourcemaps",
    "sentry:sourcemaps": "sentry-cli sourcemaps upload --release=$SENTRY_RELEASE ./build"
  }
}
```

```yaml
# .github/workflows/deploy.yml
- name: Upload source maps to Sentry
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org
    SENTRY_PROJECT: real-estate-crm
  run: |
    npm install -g @sentry/cli
    export SENTRY_RELEASE=$(sentry-cli releases propose-version)
    sentry-cli releases new $SENTRY_RELEASE
    sentry-cli releases files $SENTRY_RELEASE upload-sourcemaps ./build
    sentry-cli releases finalize $SENTRY_RELEASE
```

### Alert Rules

**High Priority Alerts** (Slack + Email):
- New error never seen before
- Error rate >10 errors/minute
- Error affecting >50 users

**Medium Priority Alerts** (Slack only):
- Error rate >5 errors/minute
- Regression (resolved error reoccurs)
- Error affecting >10 users

**Low Priority Alerts** (None, check dashboard):
- Occasional errors <5/minute
- Errors affecting <10 users

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store Sentry DSN in environment variables
- [ ] Never expose source maps publicly
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-100**:
- Error tracking: 100% of errors captured
- Stack traces: Source-mapped for debugging
- User context: All errors linked to users
- Alert coverage: All critical errors trigger alerts

## 🔗 Dependencies

### Depends On
- Project-99 (Logging Enhancement - structured logs for context)

### Blocks
- Project-104 (Health Check System - integrates with error tracking)

### Parallel Work
- None (integrates with logging)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-99 complete (logging infrastructure ready)
- ✅ Sentry account created
- ✅ Source maps can be uploaded securely
- ✅ Alert channels configured (Slack)

### Should Skip If:
- ❌ Using different error tracking solution
- ❌ No budget for Sentry

### Optimal Timing:
- Immediately after Project-99
- Before production launch

## ✅ Success Criteria
- [ ] Sentry integrated in backend
- [ ] Sentry integrated in frontend
- [ ] Source maps uploading automatically
- [ ] User context tracking working
- [ ] Error grouping intelligent
- [ ] Alerts configured and tested
- [ ] <5 minute error detection
- [ ] Stack traces source-mapped
- [ ] Documentation complete
- [ ] MILESTONE ACHIEVED: Error tracking operational

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Test Sentry in staging environment
- [ ] Verify source maps working
- [ ] Confirm user context tracking
- [ ] Test alert notifications
- [ ] Validate error grouping

### Post-Deployment Verification
- [ ] Monitor first 24 hours of errors
- [ ] Verify all errors captured
- [ ] Confirm alerts not too noisy
- [ ] Check source maps working
- [ ] Validate no PII in error reports

### Rollback Triggers
- Sentry causing performance issues
- Alert spam overwhelming team
- Source maps exposing sensitive code
- Quota exceeded causing sampling

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Backend Sentry configured
- [ ] Frontend Sentry configured
- [ ] Source maps uploading
- [ ] User context working
- [ ] Alerts configured
- [ ] Error grouping validated
- [ ] Deployed to production
- [ ] Documentation updated
- [ ] MILESTONE ACHIEVED

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
