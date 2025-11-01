# Project-07: Script Centralization

**Phase**: A
**Priority**: MEDIUM
**Status**: Not Started
**Estimated Time**: 4 hours (base) + 0.8 hours (buffer 20%) = 4.8 hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

## 🎯 Goal
Centralize all utility and operational scripts into a consistent folder structure, eliminate duplicate scripts, and ensure all scripts follow best practices for environment variables and error handling.

## 📋 Context
Scripts are currently spread across multiple locations (root, /scripts, /backend/scripts) with some duplication and inconsistent patterns. This project consolidates everything into clear categories.

**Current Issues:**
- Scripts in root directory violating project organization rules
- Duplicate backup/database scripts
- Inconsistent use of environment variables
- Some scripts missing error handling
- Unclear which scripts are for testing vs production use

**Target Structure:**
```
scripts/
├── testing/             # Test and verification scripts
│   ├── test-api-auth.sh
│   └── run-health-checks.sh
├── backend/             # Backend utility scripts
│   ├── database-backup.sh
│   ├── run-migration.sh
│   └── seed-data.sh
├── deployment/          # Deployment automation
│   ├── deploy-frontend.sh
│   └── deploy-backend.sh
└── maintenance/         # Maintenance tasks
    ├── cleanup-logs.sh
    └── optimize-db.sh
```

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Moving scripts breaks references in documentation and CI/CD. Risk of broken automation.
- [ ] **Performance Impact**: None expected
- [ ] **Dependencies**: Documentation references, CI/CD pipelines, Railway deployment scripts

### Business Risks:
- [ ] **User Impact**: Low - Scripts are internal tools, not user-facing
- [ ] **Downtime Risk**: Low - Deployment scripts could fail if paths wrong
- [ ] **Data Risk**: Low - Backup scripts could fail if misconfigured

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-07-$(date +%Y%m%d)`
- [ ] Verify Railway auto-deploy is working
- [ ] Confirm latest commit deployed successfully
- [ ] List all scripts before moving: `find . -name "*.sh" > scripts-before.txt`

### Backup Methods:
**Files:**
```bash
# Git tracks all changes - rollback with:
git reset --hard pre-project-07-$(date +%Y%m%d)
git push --force origin main  # Only if no one else working
```

### If Things Break:
1. **Immediate:** Revert last commit: `git revert HEAD && git push`
2. **Full Rollback:** Reset to tag: `git reset --hard pre-project-07-$(date +%Y%m%d)`
3. **Production Issue:** Check Railway logs: `railway logs`
4. **Script Errors:** Verify script paths in documentation match actual locations

### Recovery Checklist:
- [ ] Verify application loads: https://crm.jaydenmetz.com
- [ ] Run health tests: https://crm.jaydenmetz.com/health
- [ ] Check Railway deployment succeeded
- [ ] Verify no console errors in browser
- [ ] Test critical user flows (login, dashboard, create escrow)

## ✅ Tasks

### Planning
- [ ] Audit all scripts in project (root, /scripts, /backend/scripts)
- [ ] Identify duplicate scripts
- [ ] Categorize scripts by purpose (testing, backend, deployment, maintenance)
- [ ] Review each script for best practices
- [ ] Create consolidation plan

### Implementation
- [ ] Create organized script folder structure
- [ ] Move scripts to appropriate folders
- [ ] Remove duplicate scripts (keep best version)
- [ ] Standardize environment variable usage
- [ ] Add proper error handling to all scripts
- [ ] Add usage documentation to each script (header comments)
- [ ] Make all scripts executable (chmod +x)
- [ ] Update script references in documentation
- [ ] Remove scripts from root directory

### Testing
- [ ] Test database backup script works
- [ ] Test API auth test script runs correctly
- [ ] Verify migration scripts execute properly
- [ ] Check deployment scripts (if applicable)
- [ ] Ensure all scripts use correct paths

### Documentation
- [ ] Create scripts/README.md with usage guide
- [ ] Document required environment variables for each script
- [ ] Update CLAUDE.md with new script locations
- [ ] Add examples for common script usage

---

## 🧪 Simple Verification Tests

### Test 1: No Scripts in Root Directory
**Steps:**
1. Run: `ls -la /Users/jaydenmetz/Desktop/real-estate-crm/*.sh 2>/dev/null`
2. Check if any shell scripts exist in root

**Expected Result:** No .sh files in root directory (should be empty or error)

**Pass/Fail:** [ ]

### Test 2: Database Backup Script Works
**Steps:**
1. Run: `bash scripts/backend/database-backup.sh` (or new location)
2. Check for backup file created
3. Verify no errors in output

**Expected Result:** Backup file created successfully, no error messages

**Pass/Fail:** [ ]

### Test 3: API Auth Test Script Runs
**Steps:**
1. Run: `bash scripts/testing/test-api-auth.sh`
2. Verify script executes without errors
3. Check output shows test results

**Expected Result:** Script runs to completion, shows pass/fail results

**Pass/Fail:** [ ]

### Test 4: All Scripts Are Executable
**Steps:**
1. Run: `find scripts -name "*.sh" -type f ! -perm -u+x`
2. Check if command returns any files

**Expected Result:** No files returned (all scripts have execute permission)

**Pass/Fail:** [ ]

### Test 5: Scripts Use Environment Variables Correctly
**Steps:**
1. Run: `grep -r "HARDCODED_PASSWORD" scripts/` (check for hardcoded secrets)
2. Run: `grep -r "DATABASE_HOST" scripts/` (check proper env var usage)
3. Verify no hardcoded credentials

**Expected Result:** No hardcoded secrets, proper use of $DATABASE_HOST, $PGPASSWORD, etc.

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

## 📐 CLAUDE.md Compliance

### Required Patterns:
- [ ] **NO duplicate files** - Edit existing files in place, never create Enhanced/Optimized/V2 versions
- [ ] **Component naming**: PascalCase for components (EscrowCard.jsx not escrowCard.jsx)
- [ ] **API calls**: Use apiInstance from api.service.js (NEVER raw fetch except Login/Register)
- [ ] **Responsive grids**: Max 2 columns inside cards/widgets (prevents text overlap)
- [ ] **Archive old code**: Move to `archive/ComponentName_YYYY-MM-DD.jsx` if preserving
- [ ] **Git commits**: Include `Co-Authored-By: Claude <noreply@anthropic.com>`

### Project-Specific Rules:
- [ ] Script organization: testing/, backend/, deployment/, maintenance/ folders
- [ ] No scripts in root directory (violates project structure rules)
- [ ] Environment variables: Use $DATABASE_HOST, $PGPASSWORD (never hardcode)
- [ ] Error handling: All scripts check exit codes and display errors
- [ ] Make executable: chmod +x on all .sh files
- [ ] Header comments: Usage documentation at top of each script

---

## 🔗 Dependencies

**Depends On:**
- Project-01: Environment Configuration Cleanup
- Project-02: Remove Duplicate Code Files

**Blocks:**
- Project-09: Config File Consolidation
- Project-15: Build Process Verification

---

## 🎲 Project Selection Criteria

### ✅ Can Start This Project If:
- [ ] All dependencies completed (Projects 01-02 complete)
- [ ] Current build is stable (228/228 tests passing)
- [ ] Have 4.8 hours available this sprint
- [ ] Not blocking other developers
- [ ] Railway deployment healthy

### 🚫 Should Skip/Defer If:
- [ ] Active production issue or P0 bug
- [ ] Waiting on user feedback for this area
- [ ] Higher priority project available
- [ ] End of sprint (less than 4.8 hours remaining)
- [ ] Active database migration in progress

### ⏰ Optimal Timing:
- **Best Day**: Any day (low-risk cleanup work)
- **Avoid**: None (safe to do anytime)
- **Sprint Position**: Mid-late sprint (cleanup work)

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] All verification tests pass
- [ ] No scripts in root directory
- [ ] All scripts organized by category
- [ ] No duplicate scripts
- [ ] All scripts have proper error handling
- [ ] Environment variables used correctly (no hardcoded secrets)
- [ ] All scripts executable (chmod +x)
- [ ] Documentation updated
- [ ] Code committed and pushed

---

## 📊 Completion Checklist

### Before Moving to Archive:
- [ ] All success criteria met
- [ ] User verified scripts work in production environment
- [ ] No regression issues
- [ ] Clean git commit with descriptive message
- [ ] Project summary written

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Brief notes]
**Follow-up Items:** [Any items for future projects]
