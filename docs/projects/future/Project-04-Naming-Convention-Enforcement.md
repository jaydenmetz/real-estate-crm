# Project-04: Naming Convention Enforcement

**Phase**: A
**Priority**: HIGH
**Status**: Not Started
**Estimated Time**: 6 hours (base) + 2 hours (buffer 30%) = 8 hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

> 📐 **STRUCTURAL FOUNDATION PROJECT**
> Requires Projects 1-2 complete. Changes here affect all subsequent projects.

---

## 🎯 Goal
Enforce consistent naming conventions across all files, components, variables, and functions throughout the codebase to improve readability and maintainability.

## 📋 Context
Consistent naming makes code easier to understand and maintain. This project enforces the naming standards documented in CLAUDE.md.

**Naming Standards:**
- Components: PascalCase (EscrowCard.jsx, not escrow-card.jsx)
- Files: Match component name exactly
- Services: camelCase with .service.js suffix
- Controllers: camelCase with .controller.js suffix
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Database tables: lowercase_snake_case
- API routes: kebab-case (/api/v1/escrow-stats)

**Forbidden Patterns:**
- ❌ EnhancedComponent, OptimizedComponent, ComponentV2
- ❌ file2.js, fileOld.js, fileCopy.js
- ❌ Inconsistent casing (escrowCard vs EscrowCard in same context)

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Renaming files breaks all imports referencing old names. Risk of "Cannot find module" errors throughout codebase.
- [ ] **Performance Impact**: None expected
- [ ] **Dependencies**: All file imports across frontend/backend, webpack bundler, Railway deployment

### Business Risks:
- [ ] **User Impact**: Medium - Application won't load if imports broken
- [ ] **Downtime Risk**: Medium - Risk of deployment failures from broken imports
- [ ] **Data Risk**: None - No database changes

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-04-$(date +%Y%m%d)`
- [ ] Verify Railway auto-deploy is working
- [ ] Confirm latest commit deployed successfully
- [ ] Run all 228 health tests to establish baseline

### Backup Methods:
**Files:**
```bash
# Git tracks all changes - rollback with:
git reset --hard pre-project-04-$(date +%Y%m%d)
git push --force origin main  # Only if no one else working
```

### If Things Break:
1. **Immediate:** Revert last commit: `git revert HEAD && git push`
2. **Full Rollback:** Reset to tag: `git reset --hard pre-project-04-$(date +%Y%m%d)`
3. **Production Issue:** Check Railway logs: `railway logs`
4. **Import Errors:** Check for "Cannot find module" after renames

### Recovery Checklist:
- [ ] Verify application loads: https://crm.jaydenmetz.com
- [ ] Run health tests: https://crm.jaydenmetz.com/health
- [ ] Check Railway deployment succeeded
- [ ] Verify no console errors in browser
- [ ] Test critical user flows (login, dashboard, create escrow)

## ✅ Tasks

### Planning
- [ ] Audit all filenames for consistency
- [ ] Check component names match file names
- [ ] Review variable naming in key files
- [ ] Identify naming violations
- [ ] Create renaming plan with impact analysis

### Implementation
- [ ] Rename files to follow conventions
- [ ] Update component names to match filenames
- [ ] Standardize service/controller naming
- [ ] Fix variable naming inconsistencies
- [ ] Update all imports after renames
- [ ] Ensure database table names consistent
- [ ] Update API route naming

### Testing
- [ ] Test all imports resolve correctly
- [ ] Verify app compiles without errors
- [ ] Run all health check tests
- [ ] Check all pages load correctly
- [ ] Test all features work after renames

### Documentation
- [ ] Update CLAUDE.md with enforced conventions
- [ ] Create naming convention quick reference
- [ ] Document any exceptions to rules

---

## 🧪 Simple Verification Tests

### Test 1: Component Names Match Filenames
**Steps:**
1. Run: `find frontend/src/components -name "*.jsx"`
2. For each file, verify component name matches filename
3. Check no mismatches

**Expected Result:** All component names match their filenames

**Pass/Fail:** [ ]

### Test 2: No Forbidden Naming Patterns
**Steps:**
1. Run: `find . -name "*Enhanced*" -o -name "*V2*" -o -name "*Optimized*"`
2. Verify no results

**Expected Result:** Zero files with forbidden patterns

**Pass/Fail:** [ ]

### Test 3: Services Follow Convention
**Steps:**
1. Run: `ls backend/src/services/*.js`
2. Verify all end with .service.js
3. Check camelCase naming

**Expected Result:** All services named correctly (escrow.service.js, auth.service.js)

**Pass/Fail:** [ ]

### Test 4: Application Compiles
**Steps:**
1. Run: `cd frontend && npm run build`
2. Verify no import errors
3. Check build completes successfully

**Expected Result:** Clean build with no naming-related errors

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

### Project-Specific Rules: Naming Standards

**Enforce These Patterns:**
- [ ] **Components**: PascalCase (EscrowCard.jsx, DetailTemplate.jsx)
- [ ] **Utils/helpers**: camelCase (formatCurrency.js, dateGuard.js)
- [ ] **Config files**: camelCase or kebab-case (escrows.config.js, api.service.js)
- [ ] **NO version suffixes**: Never Component2.jsx, ComponentNew.jsx, ComponentV2.jsx
- [ ] **Size variants**: ComponentSmall.jsx, ComponentMedium.jsx, ComponentLarge.jsx (NOT ComponentSimplified.jsx)
- [ ] **Purpose variants**: ComponentCard.jsx, ComponentModal.jsx, ComponentForm.jsx (NOT ComponentEnhanced.jsx)

**Enforcement Commands:**
```bash
# Find components with wrong casing
find frontend/src/components -name "*.jsx" | grep -v "^[A-Z]"

# Find forbidden patterns
find . -name "*Enhanced*" -o -name "*Optimized*" -o -name "*V2*" -o -name "*2.jsx"

# Verify naming consistency
ls frontend/src/components/**/*.jsx | xargs basename -s .jsx | sort
```

**Post-Rename Checklist:**
- [ ] Configure ESLint rule for PascalCase components (if not already)
- [ ] Update ALL imports after renaming (grep for old names)
- [ ] Verify no broken references: `npm run build`
- [ ] Test all pages load correctly after renames

---

## 🔗 Dependencies

**Depends On:**
- Project-02: Remove Duplicate Code Files
- Project-03: Backend Directory Consolidation

**Blocks:**
- Project-05: Frontend Component Organization
- Project-06: Import Path Standardization
- Project-15: Build Process Verification

---

## 🎲 Project Selection Criteria

### ✅ Can Start This Project If:
- [ ] All dependencies completed (Projects 02-03 complete)
- [ ] Current build is stable (228/228 tests passing)
- [ ] Have 8 hours available this sprint
- [ ] Not blocking other developers
- [ ] Railway deployment healthy

### 🚫 Should Skip/Defer If:
- [ ] Active production issue or P0 bug
- [ ] Waiting on user feedback for this area
- [ ] Higher priority project available
- [ ] End of sprint (less than 8 hours remaining)
- [ ] Active refactoring in progress

### ⏰ Optimal Timing:
- **Best Day**: Monday-Wednesday
- **Avoid**: Friday (import errors need full week to resolve)
- **Sprint Position**: Early-mid sprint (after duplicate removal)

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] All verification tests pass
- [ ] All files follow naming conventions
- [ ] Component names match filenames
- [ ] No forbidden naming patterns
- [ ] Services/controllers named consistently
- [ ] App compiles and runs correctly
- [ ] Code committed and pushed

---

## 📊 Completion Checklist

### Before Moving to Archive:
- [ ] All success criteria met
- [ ] User verified app works
- [ ] Clean git commit
- [ ] Project summary written

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Brief notes]
**Follow-up Items:** [Any items for future projects]
