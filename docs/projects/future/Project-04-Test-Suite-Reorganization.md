# Project-04: Test Suite Reorganization

**Phase**: A
**Priority**: Medium
**Status**: Not Started
**Estimated Time**: 6 hours
**Started**: [Date]
**Completed**: [Date]

---

## 🎯 Goal
Reorganize test files into a clear, consistent structure that makes tests easy to find, run, and maintain. Eliminate duplicate test code and ensure all tests follow the same patterns.

## 📋 Context
Tests are currently scattered across multiple locations with some duplication and inconsistent naming. This project consolidates all tests and establishes clear testing patterns.

**Current Issues:**
- Tests in multiple locations (backend/tests, backend/src/tests, etc.)
- Duplicate test utilities across test files
- Inconsistent test naming conventions
- Some integration tests mixed with unit tests
- Test fixtures and mock data duplicated

**Target Structure:**
```
backend/src/tests/
├── unit/                # Unit tests for individual functions
│   ├── services/
│   ├── controllers/
│   └── utils/
├── integration/         # Integration tests (API endpoints)
│   ├── escrows.test.js
│   ├── listings.test.js
│   ├── clients.test.js
│   ├── leads.test.js
│   └── appointments.test.js
├── fixtures/            # Test data
│   ├── escrow-data.js
│   ├── user-data.js
│   └── listing-data.js
└── helpers/             # Shared test utilities
    ├── auth-helper.js
    ├── db-helper.js
    └── api-helper.js

frontend/src/__tests__/
├── components/          # Component tests
├── services/            # Service tests
├── utils/              # Utility tests
└── integration/        # E2E tests
```

## ✅ Tasks

### Planning
- [ ] Audit all test files in project
- [ ] Identify duplicate test utilities
- [ ] Categorize tests (unit vs integration)
- [ ] Review test coverage gaps
- [ ] Create reorganization plan

### Implementation
- [ ] Create organized test folder structure
- [ ] Move tests to appropriate folders
- [ ] Consolidate duplicate test utilities into helpers/
- [ ] Standardize test naming (*.test.js pattern)
- [ ] Create shared test fixtures
- [ ] Remove duplicate test code
- [ ] Update test scripts in package.json
- [ ] Ensure all tests can still be run

### Testing
- [ ] Run backend test suite: `npm test`
- [ ] Verify all 228 integration tests still pass
- [ ] Run unit tests separately
- [ ] Check test coverage reports
- [ ] Verify CI/CD pipeline still works

### Documentation
- [ ] Create tests/README.md with testing guide
- [ ] Document how to run different test suites
- [ ] Add examples for writing new tests
- [ ] Update INTEGRATION_TESTING.md if needed

---

## 🧪 Simple Verification Tests

### Test 1: All Backend Tests Pass
**Steps:**
1. Run: `cd backend && npm test`
2. Verify all tests execute
3. Check test summary for pass/fail count

**Expected Result:** All existing tests pass (228/228 or similar)

**Pass/Fail:** [ ]

### Test 2: Tests Are Organized by Category
**Steps:**
1. Run: `ls -R backend/src/tests/`
2. Verify unit/ and integration/ folders exist
3. Check tests are in correct folders

**Expected Result:** Clear folder structure with unit and integration tests separated

**Pass/Fail:** [ ]

### Test 3: No Duplicate Test Files
**Steps:**
1. Run: `find backend -name "*.test.js" -o -name "*.spec.js"`
2. Check for duplicate test names in different locations
3. Verify each test file is unique

**Expected Result:** Each test file appears only once in the project

**Pass/Fail:** [ ]

### Test 4: Test Helpers Are Reusable
**Steps:**
1. Check: `cat backend/src/tests/helpers/auth-helper.js`
2. Verify common auth functions exist (createTestUser, getTestToken, etc.)
3. Run: `grep -r "auth-helper" backend/src/tests/`
4. Confirm multiple tests import the helper

**Expected Result:** Shared helpers exist and are used by multiple test files

**Pass/Fail:** [ ]

### Test 5: Health Check Tests Still Work
**Steps:**
1. Navigate to https://crm.jaydenmetz.com/health
2. Click "Run All Tests" for each module
3. Verify all health tests pass

**Expected Result:** All 228 integration tests pass via health dashboard

**Pass/Fail:** [ ]

---

## 📝 Implementation Notes

### Changes Made:
- [File/component changed and why]
- [File/component changed and why]

### Issues Encountered:
- [Issue and resolution]

### Decisions Made:
- [Decision and rationale]

---

## 🔗 Dependencies

**Depends On:**
- Project-01: Backend Directory Consolidation

**Blocks:**
- Project-15: Build Process Verification
- Phase G: Testing & Quality projects

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] All verification tests pass
- [ ] All 228 integration tests still pass
- [ ] Tests organized into unit/integration folders
- [ ] No duplicate test utilities
- [ ] Shared helpers created and used
- [ ] Test naming consistent (*.test.js)
- [ ] Documentation updated
- [ ] Code committed and pushed

---

## 📊 Completion Checklist

### Before Moving to Archive:
- [ ] All success criteria met
- [ ] User verified all tests pass
- [ ] No regression issues
- [ ] Clean git commit with descriptive message
- [ ] Project summary written

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Brief notes]
**Follow-up Items:** [Any items for future projects]
