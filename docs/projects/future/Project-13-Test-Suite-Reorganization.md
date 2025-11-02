# Project-13: Test Suite Reorganization

**Phase**: A
**Priority**: MEDIUM
**Status**: Not Started
**Estimated Time**: 6 hours (base) + 1.5 hours (buffer 20%) = 7.5 hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

## 🎯 Goal
Consolidate test files to single location (backend/src/tests/, frontend/src/__tests__/).

## 📋 Context
Tests should be centralized, not scattered across codebase.

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Moving tests could break CI
- [ ] **Performance Impact**: None
- [ ] **Dependencies**: Test runners

### Business Risks:
- [ ] **User Impact**: None
- [ ] **Downtime Risk**: None
- [ ] **Data Risk**: None

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-13-$(date +%Y%m%d)`

---

## ✅ Tasks

### Planning
- [ ] Find all test files
- [ ] Plan centralized structure

### Implementation
- [ ] Move tests to centralized folders
- [ ] Update test runner config
- [ ] Verify tests still run

---

## 🧪 Simple Verification Tests

### Test 1: Success Metric Test
**Steps:**
1. Verify tests in centralized location

**Expected Result:** All tests in tests/ or __tests__/

**Pass/Fail:** [ ]

### Test 2: Tests Run
**Steps:**
1. Run: `cd backend && npm test`

**Expected Result:** All tests pass

**Pass/Fail:** [ ]

---

## 🔗 Dependencies

**Depends On:**
- Project-12: Database Migration Consolidation

**Blocks:**
- Project-15: Build Process Verification

---

## ✅ Success Criteria
- [ ] Tests centralized
- [ ] All tests pass

---

## 📊 Completion Checklist

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
