# Project-10: Archive Legacy Code

**Phase**: A
**Priority**: MEDIUM
**Status**: Not Started
**Estimated Time**: 5 hours (base) + 1 hour (buffer 20%) = 6 hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

## 🎯 Goal
Identify and properly archive all legacy code, commented-out code blocks, and unused features to clean up the codebase while preserving history.

## 📋 Context
Over time, code accumulates that's no longer used but hasn't been removed. This project systematically identifies and archives legacy code.

**What to Archive:**
- Unused components not imported anywhere
- Commented-out code blocks (>10 lines)
- Old implementations replaced by new features
- Deprecated API endpoints
- Test files for removed features

**Archive Location:**
```
archive/
├── components/
│   └── 2025-11-01/
│       └── OldComponent.jsx
├── api/
│   └── 2025-11-01/
│       └── deprecated-endpoints.js
└── docs/
    └── old-feature-specs.md
```

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Deleting code could break features if dependency analysis incomplete. Risk of removing still-used components.
- [ ] **Performance Impact**: None expected (removing code improves build time)
- [ ] **Dependencies**: Git version control (archive needs to be in git history)

### Business Risks:
- [ ] **User Impact**: Low - Only removing unused code
- [ ] **Downtime Risk**: Low - Thorough testing before removal
- [ ] **Data Risk**: None - Code cleanup only

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-10-$(date +%Y%m%d)`
- [ ] Verify Railway auto-deploy is working
- [ ] Confirm latest commit deployed successfully
- [ ] List all files before archiving: `find . -type f > files-before-archive.txt`

### Backup Methods:
**Files:**
```bash
# Git tracks all changes - rollback with:
git reset --hard pre-project-10-$(date +%Y%m%d)
git push --force origin main  # Only if no one else working
```

### If Things Break:
1. **Immediate:** Revert last commit: `git revert HEAD && git push`
2. **Full Rollback:** Reset to tag: `git reset --hard pre-project-10-$(date +%Y%m%d)`
3. **Production Issue:** Check Railway logs: `railway logs`
4. **Missing Code:** Check git history for accidentally deleted files

### Recovery Checklist:
- [ ] Verify application loads: https://crm.jaydenmetz.com
- [ ] Run health tests: https://crm.jaydenmetz.com/health
- [ ] Check Railway deployment succeeded
- [ ] Verify no console errors in browser
- [ ] Test critical user flows (login, dashboard, create escrow)

## ✅ Tasks

### Planning
- [ ] Search for large commented-out code blocks
- [ ] Identify unused components (not imported)
- [ ] Find deprecated API endpoints
- [ ] Check for unused test files
- [ ] Review git history for removed features

### Implementation
- [ ] Create archive structure with dated folders
- [ ] Move unused components to archive
- [ ] Remove large commented-out code blocks
- [ ] Archive deprecated API code
- [ ] Document what was archived and why
- [ ] Update relevant documentation
- [ ] Clean up imports

### Testing
- [ ] Verify app still works after cleanup
- [ ] Run all tests to ensure nothing broken
- [ ] Check all pages still load
- [ ] Test all features still work

### Documentation
- [ ] Create archive/README.md explaining archive
- [ ] Document what was archived
- [ ] Update CHANGELOG if applicable

---

## 🧪 Simple Verification Tests

### Test 1: No Large Commented-Out Code Blocks
**Steps:**
1. Run: `grep -r "^[[:space:]]*//.*{$" frontend/src backend/src | wc -l`
2. Check for excessive commented code

**Expected Result:** Minimal commented-out code (< 20 lines total)

**Pass/Fail:** [ ]

### Test 2: No Unused Components
**Steps:**
1. List all components: `find frontend/src/components -name "*.jsx"`
2. For each, check if imported anywhere
3. Verify all components are used

**Expected Result:** All components are imported and used

**Pass/Fail:** [ ]

### Test 3: Application Works Correctly
**Steps:**
1. Test all main pages load
2. Run health check tests
3. Verify no broken imports

**Expected Result:** 228/228 tests pass, all pages work

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
- [ ] Archive structure: `docs/archive/YYYY-MM-DD/` or `archive/ComponentName_YYYY-MM-DD.jsx`
- [ ] Document why archived: Add comment explaining reason for archival
- [ ] Test before deleting: Ensure archived code isn't actively used
- [ ] Keep git history: Don't force-push; let git track the removals
- [ ] NO "just in case" copies: If truly unused, delete (git has history)

---

## 🔗 Dependencies

**Depends On:**
- Project-02: Remove Duplicate Code Files
- Project-05: Frontend Component Organization

**Blocks:**
- None (cleanup project)

---

## 🎲 Project Selection Criteria

### ✅ Can Start This Project If:
- [ ] All dependencies completed (Projects 02, 05 complete)
- [ ] Current build is stable (228/228 tests passing)
- [ ] Have 6 hours available this sprint
- [ ] Not blocking other developers
- [ ] Railway deployment healthy

### 🚫 Should Skip/Defer If:
- [ ] Active production issue or P0 bug
- [ ] Waiting on user feedback for this area
- [ ] Higher priority project available
- [ ] End of sprint (less than 6 hours remaining)
- [ ] Component reorganization incomplete

### ⏰ Optimal Timing:
- **Best Day**: Any day (safe cleanup work)
- **Avoid**: None (low-risk archival)
- **Sprint Position**: Mid-late sprint (cleanup work)

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] All verification tests pass
- [ ] Legacy code archived with dates
- [ ] No large commented-out blocks
- [ ] All remaining code is actively used
- [ ] Documentation updated
- [ ] Code committed and pushed

---

## 🚀 Production Deployment Checkpoint

> ⚠️ **CRITICAL MILESTONE** - This project marks end of Cleanup
>
> ✅ Cleanup complete! Organized codebase ready for standardization.

### Pre-Deploy Checklist:
- [ ] All project tasks completed
- [ ] All verification tests passed locally
- [ ] No console errors in development
- [ ] Git committed with descriptive message
- [ ] Ready to push to Railway

### Deploy and Verify:
1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Monitor Railway Deployment:**
   - Watch deployment at: https://railway.app
   - Verify build succeeds (2-3 minutes)
   - Check deployment logs for errors

3. **Run Production Health Tests:**
   - Navigate to: https://crm.jaydenmetz.com/health
   - Click "Run All Tests" button
   - **REQUIRED:** All 228 tests must pass ✅

4. **Verify Core Functionality:**
   - [ ] Login works (admin@jaydenmetz.com)
   - [ ] Dashboard loads without errors
   - [ ] Can view escrow detail page
   - [ ] Can create new escrow (test mode)
   - [ ] No console errors (F12)

5. **User Acceptance:**
   - [ ] User tested production site
   - [ ] User confirmed no issues found
   - [ ] User approved moving to next project

### If Production Issues Found:
- **DO NOT** move to next project
- Review rollback plan above
- Fix issues before proceeding
- Re-run all verification steps

### Milestone Completion:
- [ ] All 228 health tests passing
- [ ] User acceptance complete
- [ ] Production stable
- [ ] Ready for next phase

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
