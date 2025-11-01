# Project-XX: [Project Name]

**Phase**: [A/B/C/D/E/F/G/H]
**Priority**: [CRITICAL/HIGH/MEDIUM/LOW]
**Status**: [Not Started/In Progress/Testing/Complete]
**Estimated Time**: X hours (base) + Y hours (buffer %) = Z hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

## 🎯 Goal
[Clear statement of what this project accomplishes]

## 📋 Context
[Background information, why this project is needed, current state]

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-XX-$(date +%Y%m%d)`
- [ ] Verify Railway auto-deploy is working
- [ ] Confirm latest commit deployed successfully
- [ ] [Project-specific preparation steps]

### Backup Methods:
**Database:** [If project touches database]
```bash
# Backup database before starting
PGPASSWORD=$PGPASSWORD pg_dump -h ballast.proxy.rlwy.net -p 20017 -U postgres railway > backup-project-XX-$(date +%Y%m%d).sql
```

**Files:** [Always include]
```bash
# Git tracks all changes - rollback with:
git reset --hard pre-project-XX-$(date +%Y%m%d)
git push --force origin main  # Only if no one else working
```

### If Things Break:
1. **Immediate:** Revert last commit: `git revert HEAD && git push`
2. **Full Rollback:** Reset to tag: `git reset --hard pre-project-XX-$(date +%Y%m%d)`
3. **Production Issue:** Check Railway logs: `railway logs`
4. **Database Issue:** Restore from backup (see backup command above)

### Recovery Checklist:
- [ ] Verify application loads: https://crm.jaydenmetz.com
- [ ] Run health tests: https://crm.jaydenmetz.com/health
- [ ] Check Railway deployment succeeded
- [ ] Verify no console errors in browser
- [ ] Test critical user flows (login, dashboard, create escrow)

---

## ✅ Tasks

### Planning
- [ ] Review current implementation
- [ ] Identify all affected files
- [ ] Create task breakdown
- [ ] Review dependencies

### Implementation
- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] [Specific task 3]
- [ ] [Specific task 4]
- [ ] [Specific task 5]

### Testing
- [ ] Manual testing completed
- [ ] Simple verification tests passed
- [ ] Edge cases tested
- [ ] Performance verified

### Documentation
- [ ] Code comments updated
- [ ] README updated if needed
- [ ] Changes documented in project log

---

## 🧪 Simple Verification Tests

### Test 1: [Basic Functionality]
**Steps:**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Expected Result:** [What should happen]

**Pass/Fail:** [ ]

### Test 2: [Error Handling]
**Steps:**
1. [Action 1]
2. [Action 2]

**Expected Result:** [What should happen]

**Pass/Fail:** [ ]

### Test 3: [UI/Display]
**Steps:**
1. [Action 1]
2. [Action 2]

**Expected Result:** [What should happen]

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
- Project-XX: [Name]

**Blocks:**
- Project-XX: [Name]

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] All verification tests pass
- [ ] No console errors
- [ ] No API errors
- [ ] UI displays correctly
- [ ] Performance acceptable
- [ ] Code committed and pushed
- [ ] Documentation updated

---

## 🚀 Production Deployment Checkpoint

> ⚠️ **ONLY INCLUDE THIS SECTION FOR MILESTONE PROJECTS** (Projects 2, 6, 10, 15, etc.)
> Delete this section if project is not a production checkpoint.

> **CRITICAL MILESTONE** - This project marks end of [Phase Name]

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
- [ ] User verified functionality
- [ ] No regression issues
- [ ] Clean git commit
- [ ] Project summary written

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Brief notes]
**Follow-up Items:** [Any items for future projects]
