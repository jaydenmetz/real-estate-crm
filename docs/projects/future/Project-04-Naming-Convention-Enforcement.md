# Project-04: Naming Convention Enforcement

**Phase**: A
**Priority**: HIGH
**Status**: Not Started
**Estimated Time**: 6 hours
**Started**: [Date]
**Completed**: [Date]

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

## 🔗 Dependencies

**Depends On:**
- Project-02: Remove Duplicate Code Files
- Project-03: Backend Directory Consolidation

**Blocks:**
- Project-05: Frontend Component Organization
- Project-06: Import Path Standardization
- Project-15: Build Process Verification

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
