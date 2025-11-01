# Project-11: API Route Standardization

**Phase**: A
**Priority**: MEDIUM
**Status**: Not Started
**Estimated Time**: 7 hours (base) + 1.4 hours (buffer 20%) = 8.4 hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

## 🎯 Goal
Standardize all API route definitions to follow consistent RESTful patterns, ensure all routes use proper middleware, and eliminate any inconsistencies in route structure.

## 📋 Context
API routes should follow consistent RESTful conventions with proper HTTP methods, standardized naming, and consistent middleware application.

**Target Patterns:**
```
GET    /v1/escrows          # List all
GET    /v1/escrows/:id      # Get one
POST   /v1/escrows          # Create
PUT    /v1/escrows/:id      # Update
DELETE /v1/escrows/:id      # Delete
```

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Changing route paths breaks frontend API calls. Risk of 404 errors if frontend not updated.
- [ ] **Performance Impact**: None expected
- [ ] **Dependencies**: Frontend API calls, health check tests, external API consumers

### Business Risks:
- [ ] **User Impact**: Medium - API errors break all features
- [ ] **Downtime Risk**: Medium - Frontend can't communicate with backend if routes wrong
- [ ] **Data Risk**: None - Route reorganization only

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-11-$(date +%Y%m%d)`
- [ ] Verify Railway auto-deploy is working
- [ ] Confirm latest commit deployed successfully
- [ ] Run all 228 health tests to establish baseline

### Backup Methods:
**Files:**
```bash
# Git tracks all changes - rollback with:
git reset --hard pre-project-11-$(date +%Y%m%d)
git push --force origin main  # Only if no one else working
```

### If Things Break:
1. **Immediate:** Revert last commit: `git revert HEAD && git push`
2. **Full Rollback:** Reset to tag: `git reset --hard pre-project-11-$(date +%Y%m%d)`
3. **Production Issue:** Check Railway logs: `railway logs`
4. **API Errors:** Check health tests for specific endpoint failures

### Recovery Checklist:
- [ ] Verify application loads: https://crm.jaydenmetz.com
- [ ] Run health tests: https://crm.jaydenmetz.com/health
- [ ] Check Railway deployment succeeded
- [ ] Verify no console errors in browser
- [ ] Test critical user flows (login, dashboard, create escrow)

## ✅ Tasks

### Planning
- [ ] Audit all route files in backend/src/routes
- [ ] List all API endpoints and their patterns
- [ ] Identify non-RESTful routes
- [ ] Check middleware consistency
- [ ] Create standardization plan

### Implementation
- [ ] Standardize route naming conventions
- [ ] Ensure RESTful HTTP method usage
- [ ] Apply consistent middleware to all routes
- [ ] Group routes by resource (escrows, listings, etc.)
- [ ] Remove duplicate or unused routes
- [ ] Ensure all routes return consistent response format
- [ ] Update route registration in app.js

### Testing
- [ ] Test all API endpoints still work
- [ ] Run health check tests (228 tests)
- [ ] Verify authentication required on protected routes
- [ ] Test error responses are consistent
- [ ] Check rate limiting works correctly

### Documentation
- [ ] Update API_REFERENCE.md with all routes
- [ ] Document route naming conventions
- [ ] Add examples for each endpoint pattern

---

## 🧪 Simple Verification Tests

### Test 1: All Routes Follow RESTful Patterns
**Steps:**
1. Review backend/src/routes/*.js files
2. Verify GET/POST/PUT/DELETE used correctly
3. Check route paths follow /v1/resource/:id pattern

**Expected Result:** All routes use proper HTTP methods and naming

**Pass/Fail:** [ ]

### Test 2: All Health Tests Pass
**Steps:**
1. Navigate to https://crm.jaydenmetz.com/health
2. Run all module tests
3. Verify 228/228 tests pass

**Expected Result:** All API endpoints work correctly

**Pass/Fail:** [ ]

### Test 3: Authentication Middleware Applied
**Steps:**
1. Test unauthenticated request to protected route
2. Verify 401 Unauthorized response
3. Test with valid JWT token
4. Verify request succeeds

**Expected Result:** Auth middleware properly protects routes

**Pass/Fail:** [ ]

---

## 📝 Implementation Notes

### Changes Made:
- [File/component changed and why]

### Issues Encountered:
- [Issue and resolution]

### Decisions Made:
- [Decision and rationale]

---

## 📐 CLAUDE.md Compliance

### Required Patterns:
- [ ] **NO duplicate files** - Edit existing files in place, never create Enhanced/Optimized/V2 versions
- [ ] **Component naming**: PascalCase for components (EscrowCard.jsx not escrowCard.jsx)
- [ ] **API calls**: Use apiInstance from api.service.js (NEVER raw fetch except Login/Register)
- [ ] **Responsive grids**: Max 2 columns inside cards/widgets (prevents text overlap)
- [ ] **Archive old code**: Move to `archive/ComponentName_YYYY-MM-DD.jsx` if preserving
- [ ] **Git commits**: Include `Co-Authored-By: Claude <noreply@anthropic.com>`

### Project-Specific Rules:
- [ ] RESTful patterns: GET (list/get), POST (create), PUT (update), DELETE (delete)
- [ ] Route naming: `/v1/resource` and `/v1/resource/:id` patterns
- [ ] Consistent middleware: Auth, rate-limiting, validation on all routes
- [ ] Response format: Standardized `{ success, data, error, timestamp }` pattern
- [ ] HTTP status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)

---

## 🧪 Test Coverage Impact

### Current Baseline:
- **Total Tests**: 228/228 passing (100%)
- **Health Dashboard**: https://crm.jaydenmetz.com/health
- **Coverage**: Dual authentication (JWT + API Key) across 5 modules

### Tests Modified by This Project:
- API endpoint tests may need route path updates after standardization
- Authentication tests should verify middleware applied consistently
- Response format tests should check standardized structure

### Coverage Verification:
- [ ] Run backend tests: `cd backend && npm test`
- [ ] Run health dashboard: https://crm.jaydenmetz.com/health
- [ ] Verify: 228/228 tests still passing ✅
- [ ] All routes return consistent response format
- [ ] Auth middleware protecting all protected routes

### Post-Project Validation:
- [ ] All tests green in health dashboard
- [ ] RESTful patterns enforced across all endpoints
- [ ] Coverage maintained or improved

---

## 🔗 Dependencies

**Depends On:**
- Project-03: Backend Directory Consolidation

**Blocks:**
- Project-12: Service Layer Unification
- Phase B: Core Functionality projects

---

## 🎲 Project Selection Criteria

### ✅ Can Start This Project If:
- [ ] All dependencies completed (Project-03 complete)
- [ ] Current build is stable (228/228 tests passing)
- [ ] Have 8.4 hours available this sprint
- [ ] Not blocking other developers
- [ ] Railway deployment healthy

### 🚫 Should Skip/Defer If:
- [ ] Active production issue or P0 bug
- [ ] Waiting on user feedback for this area
- [ ] Higher priority project available
- [ ] End of sprint (less than 8.4 hours remaining)
- [ ] Active frontend API integration work

### ⏰ Optimal Timing:
- **Best Day**: Monday-Wednesday (need time to update frontend)
- **Avoid**: Friday (API changes risky for weekends)
- **Sprint Position**: Mid sprint (after backend consolidation)

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] All verification tests pass
- [ ] Routes follow RESTful patterns
- [ ] Consistent middleware application
- [ ] All 228 health tests pass
- [ ] Documentation updated
- [ ] Code committed and pushed

---

## 📊 Completion Checklist

### Before Moving to Archive:
- [ ] All success criteria met
- [ ] User verified API works correctly
- [ ] Clean git commit
- [ ] Project summary written

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Brief notes]
**Follow-up Items:** [Any items for future projects]
