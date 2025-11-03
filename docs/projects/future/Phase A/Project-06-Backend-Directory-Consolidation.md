# Project-06: Backend Directory Consolidation

**Phase**: A
**Priority**: HIGH
**Status**: Not Started
**Estimated Time**: 8 hours (base) + 2.5 hours (buffer 30%) = 10.5 hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

## 🎯 Goal
Consolidate backend file structure into clear, logical folders (controllers/, services/, middleware/, routes/).

## 📋 Context
Backend code should be organized by function, not by feature. This makes it easier to find files and understand the architecture.

**Target Structure:**
```
backend/src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── middleware/      # Auth, validation
├── routes/          # API routing
├── models/          # Database models
├── config/          # Configuration
└── utils/           # Shared utilities
```

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Moving files breaks imports
- [ ] **Performance Impact**: None
- [ ] **Dependencies**: All backend imports

### Business Risks:
- [ ] **User Impact**: High - backend powers entire API
- [ ] **Downtime Risk**: High - incorrect imports = API down
- [ ] **Data Risk**: Low

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-06-$(date +%Y%m%d)`
- [ ] Run health tests baseline
- [ ] Screenshot current directory structure

### Backup Methods:
```bash
git reset --hard pre-project-06-$(date +%Y%m%d)
```

### If Things Break:
1. Check Railway logs for import errors
2. Verify all require() paths updated
3. Revert if API down

### Recovery Checklist:
- [ ] API responds: https://api.jaydenmetz.com/v1/health
- [ ] Health tests pass: https://crm.jaydenmetz.com/health (228/228)
- [ ] Login works
- [ ] Database connection active

---

## ✅ Tasks

### Planning
- [ ] Map current backend structure
- [ ] Identify files in wrong folders
- [ ] Plan new organization

### Implementation
- [ ] Create target folder structure
- [ ] Move files to correct folders
- [ ] Update all require() imports
- [ ] Update index.js/app.js
- [ ] Verify backend starts: `cd backend && npm run dev`

### Testing
- [ ] Backend starts without errors
- [ ] All API endpoints work
- [ ] Health tests pass (228/228)

---

## 🧪 Simple Verification Tests

### Test 1: Success Metric Test
**Steps:**
1. Verify folder structure matches target
2. All backend files in correct folders

**Expected Result:** Backend organized by function (controllers/, services/, etc.)

**Pass/Fail:** [ ]

### Test 2: Health Dashboard Check
**Steps:**
1. Navigate to https://crm.jaydenmetz.com/health
2. Run all tests

**Expected Result:** 228/228 tests pass

**Pass/Fail:** [ ]

### Test 3: Backend Starts
**Steps:**
1. Run: `cd backend && npm run dev`
2. Verify no import errors

**Expected Result:** Backend starts cleanly

**Pass/Fail:** [ ]

---

## 📝 Implementation Notes

### Changes Made:
- [File moved and why]

---

## 📐 CLAUDE.md Compliance

### Required Patterns:
- [ ] **Use git mv** - Preserves history
- [ ] **Update imports** - Check all require() statements
- [ ] **Test thoroughly** - Backend is critical

---

## 🔗 Dependencies

**Depends On:**
- Project-05: Documentation Structure Finalization

**Blocks:**
- Project-09: API Route Standardization
- Project-10: Service Layer Unification

---

## 🎲 Project Selection Criteria

### ✅ Can Start This Project If:
- [ ] Project-05 completed
- [ ] Have 10.5 hours available
- [ ] Railway deployment healthy

### 🚫 Should Skip/Defer If:
- [ ] Active production issue
- [ ] End of sprint

### ⏰ Optimal Timing:
- **Best Day**: Monday-Thursday
- **Avoid**: Friday
- **Sprint Position**: Early-Mid

---

## ✅ Success Criteria
- [ ] Backend organized by function
- [ ] All imports updated
- [ ] 228/228 health tests pass
- [ ] Backend starts without errors

---

## 🚀 Production Deployment Checkpoint

> ⚠️ **MILESTONE** - Backend structure finalized

### Pre-Deploy Checklist:
- [ ] All tasks completed
- [ ] All tests pass locally
- [ ] Ready to push

### Deploy and Verify:
1. **Push to GitHub:** `git push origin main`
2. **Monitor Railway:** Watch build logs
3. **Run Health Tests:** https://crm.jaydenmetz.com/health (228/228)
4. **Verify Core Functions:**
   - [ ] Login works
   - [ ] Dashboard loads
   - [ ] API responds
   - [ ] No console errors

### If Production Issues:
- Review rollback plan
- Fix before proceeding

### Milestone Completion:
- [ ] 228/228 tests passing
- [ ] Production stable
- [ ] User acceptance complete

---

## 📊 Completion Checklist

### Before Moving to Archive:
- [ ] All success criteria met
- [ ] User verified
- [ ] Milestone verified

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Brief notes]
