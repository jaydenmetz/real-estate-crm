# Project-03: Script Centralization

**Phase**: A
**Priority**: Medium
**Status**: Not Started
**Estimated Time**: 4 hours
**Started**: [Date]
**Completed**: [Date]

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

## 🔗 Dependencies

**Depends On:**
- None

**Blocks:**
- Project-05: Environment Configuration Cleanup
- Project-15: Build Process Verification

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
