# Project-03: Naming Convention Enforcement

**Phase**: A
**Priority**: HIGH
**Status**: Not Started
**Estimated Time**: 6 hours (base) + 2 hours (buffer 30%) = 8 hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

## 🎯 Goal
Enforce consistent naming conventions across all components, services, and files according to CLAUDE.md standards.

## 📋 Context
Project files should follow clear naming patterns:
- **Components**: PascalCase (EscrowCard.jsx, not escrowCard.jsx)
- **Services**: camelCase.service.js (api.service.js)
- **Utils**: camelCase.js (auth.js)
- **Tests**: feature.test.js (escrows.test.js)
- **Docs**: UPPERCASE_WITH_UNDERSCORES.md (API_REFERENCE.md)

Inconsistent naming causes:
- Import confusion
- Difficult code navigation
- Poor developer experience
- Harder code reviews

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Renaming files breaks all imports
- [ ] **Performance Impact**: None
- [ ] **Dependencies**: All files that import renamed components

### Business Risks:
- [ ] **User Impact**: Medium - could break production if imports not updated
- [ ] **Downtime Risk**: Medium - requires careful import updates
- [ ] **Data Risk**: Low - no data changes

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-03-$(date +%Y%m%d)`
- [ ] Verify Railway auto-deploy is working
- [ ] Confirm latest commit deployed successfully
- [ ] Run health tests to establish baseline: https://crm.jaydenmetz.com/health

### Backup Methods:
```bash
git reset --hard pre-project-03-$(date +%Y%m%d)
```

### If Things Break:
1. **Immediate:** Revert last commit: `git revert HEAD && git push`
2. **Full Rollback:** Reset to tag
3. **Production Issue:** Check for import errors in logs

### Recovery Checklist:
- [ ] Verify application loads: https://crm.jaydenmetz.com
- [ ] Run health tests: https://crm.jaydenmetz.com/health (228/228 must pass)
- [ ] Check Railway deployment succeeded
- [ ] Verify no console errors in browser
- [ ] Test critical user flows (login, dashboard, create escrow)

---

## ✅ Tasks

### Planning
- [ ] Audit all file names in project
- [ ] Identify files not matching conventions
- [ ] Map all imports for files to be renamed

### Implementation
- [ ] Find incorrectly named components: `find frontend/src/components -name "*.jsx" | grep -v "^[A-Z]"`
- [ ] Find incorrectly named services: `find frontend/src/services -name "*.js" | grep -v ".service.js$"`
- [ ] Rename files using git mv (preserves history)
- [ ] Update all imports for renamed files
- [ ] Verify no broken imports: `npm run build`

### Testing
- [ ] Manual testing completed
- [ ] Run success metric test
- [ ] Run health dashboard tests (228/228)
- [ ] Test affected functionality in production

### Documentation
- [ ] Update relevant documentation
- [ ] Add implementation notes below

---

## 🧪 Simple Verification Tests

### Test 1: Success Metric Test
**Steps:**
1. Run naming convention audit commands
2. Verify all files follow patterns

**Expected Result:** All files follow naming conventions: Components (PascalCase), Services (camelCase.service.js), Docs (UPPERCASE.md)

**Pass/Fail:** [ ]

### Test 2: Health Dashboard Check
**Steps:**
1. Navigate to https://crm.jaydenmetz.com/health
2. Click "Run All Tests"
3. Verify all 228 tests pass

**Expected Result:** All 228/228 tests green

**Pass/Fail:** [ ]

### Test 3: Build Check
**Steps:**
1. Run: `cd frontend && npm run build`
2. Verify no import errors

**Expected Result:** Clean build with no import errors

**Pass/Fail:** [ ]

---

## 📝 Implementation Notes

### Changes Made:
- [File renamed and why]

### Issues Encountered:
- [Issue and resolution]

### Decisions Made:
- [Decision and rationale]

---

## 📐 CLAUDE.md Compliance

### Required Patterns:
- [ ] **NO duplicate files** - Edit existing files in place
- [ ] **Component naming**: PascalCase for components
- [ ] **API calls**: Use apiInstance from api.service.js
- [ ] **Responsive grids**: Max 2 columns inside cards/widgets
- [ ] **Archive old code**: Move to `archive/ComponentName_YYYY-MM-DD.jsx`
- [ ] **Git commits**: Include `Co-Authored-By: Claude <noreply@anthropic.com>`

### Project-Specific Rules:
- [ ] **Use git mv**: Preserves file history when renaming
- [ ] **Update imports**: Find all with `grep -r "OldName" frontend/src`
- [ ] **Test imports**: Run webpack build before committing

---

## 🔗 Dependencies

**Depends On:**
- Project-02: Remove Duplicate Code Files

**Blocks:**
- Project-04: Script Centralization
- Project-07: Frontend Component Organization

---

## 🎲 Project Selection Criteria

### ✅ Can Start This Project If:
- [ ] Project-02 completed
- [ ] Current build is stable (228/228 tests passing)
- [ ] Have 8 hours available this sprint
- [ ] Not blocking other developers
- [ ] Railway deployment healthy

### 🚫 Should Skip/Defer If:
- [ ] Active production issue or P0 bug
- [ ] Waiting on user feedback
- [ ] End of sprint (less than 8 hours remaining)

### ⏰ Optimal Timing:
- **Best Day**: Monday-Thursday
- **Avoid**: Friday
- **Sprint Position**: Early-Mid

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] Success metric test passes
- [ ] All 228 health tests pass
- [ ] No console errors in production
- [ ] Railway deployment succeeds
- [ ] All files follow naming conventions
- [ ] Code committed and pushed

---

## 📊 Completion Checklist

### Before Moving to Archive:
- [ ] All success criteria met
- [ ] User verified functionality
- [ ] No regression issues
- [ ] Clean git commit
- [ ] Project summary written

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Brief notes]
**Follow-up Items:** [Any items for future projects]
