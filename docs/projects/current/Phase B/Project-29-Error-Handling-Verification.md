# Project-29: Error Handling Verification

**Phase**: B | **Priority**: MEDIUM | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Projects 18-22 (Core modules), Project 25 (WebSocket)

## 🎯 Goal
Verify all API errors display user-friendly messages, no 500 errors exposed to users.

## 📋 Current → Target
**Now**: Some errors show technical details, inconsistent error messages
**Target**: All errors show user-friendly messages, error boundaries catch crashes, logging for debugging
**Success Metric**: Zero exposed stack traces, all error messages helpful, no app crashes

## 📖 Context
Good error handling is critical for user trust and debugging. Users should never see technical jargon like "TypeError: Cannot read property 'id' of undefined" or raw 500 errors. Instead, they should see helpful messages like "We couldn't load that escrow. Please try refreshing the page." All errors should be logged (Sentry or console) for debugging while showing friendly messages to users.

This project implements: error boundaries to catch React crashes, API error formatting (convert 500 → "Something went wrong"), field validation errors (clear messages for form inputs), network error handling (offline detection, retry logic), and comprehensive error logging for debugging.

## ⚠️ Risk Assessment

### Technical Risks
- **Over-Catching**: Error boundaries hide real bugs
- **Lost Error Context**: Friendly messages hide root cause
- **Logging Failures**: Errors not captured for debugging

### Business Risks
- **User Frustration**: Generic errors not actionable
- **Bug Blindness**: Errors hidden, bugs not fixed
- **Data Loss**: Errors during form submission lose user input

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-29-error-handling-$(date +%Y%m%d)
git push origin pre-project-29-error-handling-$(date +%Y%m%d)

# Backup error handling code
cp frontend/src/utils/errorHandler.js backup-error-handler-$(date +%Y%m%d).js
cp backend/src/middleware/errorHandler.js backup-api-error-handler-$(date +%Y%m%d).js
```

### If Things Break
```bash
git checkout pre-project-29-error-handling-YYYYMMDD -- frontend/src/utils/errorHandler.js
git checkout pre-project-29-error-handling-YYYYMMDD -- frontend/src/components/ErrorBoundary.jsx
git checkout pre-project-29-error-handling-YYYYMMDD -- backend/src/middleware/errorHandler.js
git push origin main
```

## ✅ Tasks

### Planning (1 hour)
- [ ] Audit current error handling (frontend + backend)
- [ ] Document all error types (API, validation, network, React crashes)
- [ ] Plan user-friendly message templates
- [ ] Review Sentry integration (if configured)
- [ ] Plan error recovery flows

### Implementation (5 hours)
- [ ] **Backend API Error Handling** (2 hours):
  - [ ] Update error middleware to never expose stack traces
  - [ ] Create error code → user message mapping
  - [ ] Standardize error response format
  - [ ] Add validation error formatting
  - [ ] Ensure 500 errors return generic message

- [ ] **Frontend Error Boundaries** (1.5 hours):
  - [ ] Create ErrorBoundary component (if not exists)
  - [ ] Wrap app root with ErrorBoundary
  - [ ] Create fallback UI (error page with retry)
  - [ ] Log errors to Sentry/console
  - [ ] Test error boundary with intentional crash

- [ ] **API Error Handling** (1 hour):
  - [ ] Update apiInstance to format API errors
  - [ ] Map error codes to user messages
  - [ ] Handle network errors (offline, timeout)
  - [ ] Add retry logic for transient failures
  - [ ] Display errors in Snackbar/Alert

- [ ] **Form Validation** (0.5 hours):
  - [ ] Standardize validation error messages
  - [ ] Show field-level errors clearly
  - [ ] Prevent submission with errors
  - [ ] Preserve form data on error

### Testing (2.5 hours)
- [ ] **API Error Scenarios**:
  - [ ] Test 404 Not Found → "Record not found"
  - [ ] Test 403 Forbidden → "You don't have permission"
  - [ ] Test 500 Server Error → "Something went wrong"
  - [ ] Test network offline → "Check your internet connection"
  - [ ] Test timeout → "Request took too long"

- [ ] **React Crash Scenarios**:
  - [ ] Trigger component error (undefined variable)
  - [ ] Verify ErrorBoundary catches it
  - [ ] Verify fallback UI displays
  - [ ] Test "Try Again" button

- [ ] **Form Validation**:
  - [ ] Submit with empty required fields
  - [ ] Verify clear error messages
  - [ ] Submit with invalid data (bad email format)
  - [ ] Verify field-level errors

### Documentation (0.5 hours)
- [ ] Document error code mapping
- [ ] Create error handling best practices guide
- [ ] Add troubleshooting section

## 🧪 Verification Tests

### Test 1: API Error Messages
```bash
TOKEN="<JWT token>"

# Test 404 Not Found
curl -X GET https://api.jaydenmetz.com/v1/escrows/nonexistent-id \
  -H "Authorization: Bearer $TOKEN"
# Expected: {
#   "success": false,
#   "error": {
#     "code": "NOT_FOUND",
#     "message": "Escrow not found"  (NOT "Record with ID ... does not exist")
#   }
# }

# Test 403 Forbidden (access other user's escrow)
curl -X GET https://api.jaydenmetz.com/v1/escrows/<other-user-escrow> \
  -H "Authorization: Bearer $AGENT_TOKEN"
# Expected: {
#   "success": false,
#   "error": {
#     "code": "FORBIDDEN",
#     "message": "You don't have permission to access this resource"
#   }
# }

# Test 500 Server Error (trigger intentional crash)
# Expected: {
#   "success": false,
#   "error": {
#     "code": "INTERNAL_ERROR",
#     "message": "Something went wrong. Please try again."
#   }
# }
# Backend logs SHOULD have full stack trace for debugging
```

### Test 2: Error Boundary Catches Crashes
```javascript
// Temporarily add to any component:
const TestCrash = () => {
  throw new Error("Intentional crash for testing");
  return <div>This won't render</div>;
};

// Add <TestCrash /> to a page
// Expected:
// - Error boundary catches crash
// - Fallback UI displays: "Oops! Something went wrong"
// - Error logged to console/Sentry
// - "Try Again" button resets error boundary
// - No white screen of death
```

### Test 3: Network Error Handling
```bash
# Open app in browser
# Open DevTools > Network tab
# Set throttling to "Offline"
# Try to load escrows page

# Expected:
# - API call fails
# - User sees friendly message: "Check your internet connection"
# - Option to retry
# - No technical error exposed
# - Console logs actual error for debugging
```

## 📝 Implementation Notes

### Error Code → Message Mapping
```javascript
const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: "Please log in to continue",
  FORBIDDEN: "You don't have permission to do that",
  TOKEN_EXPIRED: "Your session expired. Please log in again",

  // Resources
  NOT_FOUND: "We couldn't find that record",
  ALREADY_EXISTS: "A record with that information already exists",

  // Validation
  VALIDATION_ERROR: "Please check your input and try again",
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_PHONE: "Please enter a valid phone number",

  // Server
  INTERNAL_ERROR: "Something went wrong. Please try again",
  DATABASE_ERROR: "We're having trouble saving your changes",

  // Network
  NETWORK_ERROR: "Check your internet connection",
  TIMEOUT: "That took too long. Please try again",

  // Generic
  UNKNOWN: "An unexpected error occurred"
};
```

### Error Boundary Component
```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to Sentry
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4">Oops! Something went wrong</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            We've been notified and are working on it.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
```

### API Error Formatting
```javascript
// In apiInstance response interceptor:
.catch(error => {
  const errorCode = error.response?.data?.error?.code || 'UNKNOWN';
  const userMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN;

  // Log technical details
  console.error('API Error:', error);

  // Show user-friendly message
  throw new Error(userMessage);
});
```

### Validation Error Display
```jsx
<TextField
  label="Email"
  error={Boolean(errors.email)}
  helperText={errors.email || ''}  // "Please enter a valid email"
/>
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Edit error handling files in place
- [ ] Use apiInstance for API calls
- [ ] Fire-and-forget logging (don't block on Sentry)

## 🧪 Test Coverage Impact
**After Project-29**:
- Error scenarios: All tested
- Error boundaries: Deployed
- User-friendly messages: Verified

## 🔗 Dependencies

### Depends On
- Projects 18-22 (Core modules)
- Project 25 (WebSocket - error handling for connection failures)

### Blocks
- Project 30 (Loading states complement error handling)

### Parallel Work
- Can work alongside Project 30

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Core modules working
- ✅ Error patterns identified
- ✅ Ready for UX polish

### Should Skip If:
- ❌ Major functional bugs exist (fix those first)
- ❌ Error handling already excellent

### Optimal Timing:
- After core modules and WebSocket complete
- 1-2 days of work (10 hours)

## ✅ Success Criteria
- [ ] No stack traces exposed to users
- [ ] All error messages user-friendly
- [ ] Error boundaries catch React crashes
- [ ] API errors formatted consistently
- [ ] Network errors handled gracefully
- [ ] Validation errors clear and actionable
- [ ] Errors logged for debugging (console or Sentry)
- [ ] Zero white screens of death
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Backend error middleware updated
- [ ] ErrorBoundary component deployed
- [ ] API error formatting implemented
- [ ] All error scenarios tested
- [ ] User-friendly messages verified
- [ ] Zero console errors (except intentional test crashes)
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
