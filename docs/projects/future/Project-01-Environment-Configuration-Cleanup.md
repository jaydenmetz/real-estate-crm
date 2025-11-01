# Project-01: Environment Configuration Cleanup

**Phase**: A
**Priority**: CRITICAL
**Status**: Not Started
**Estimated Time**: 6 hours (base) + 2 hours (buffer 30%) = 8 hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

> ⚠️ **CRITICAL FOUNDATION PROJECT**
> This MUST be completed before structural changes (Projects 3-6) to prevent production issues and wasted rework.

---

## 🎯 Goal
Consolidate environment configuration files, eliminate duplicate or conflicting environment variables, and ensure all sensitive credentials are properly managed and never committed to version control.

## 📋 Context
Environment configuration is currently spread across multiple .env files and some config files with potential duplication and inconsistencies. This project establishes a single source of truth for each environment.

**Current Issues:**
- Multiple .env files (.env, .env.local, .env.production, etc.)
- Duplicate or conflicting environment variable names
- Some configuration hardcoded in source files instead of env vars
- Unclear which .env file is used in which environment
- Risk of committing secrets to git

**Target Structure:**
```
Project Root:
.env.example           # Template with all required vars (safe to commit)
.env                   # Local development (gitignored)

Railway Dashboard:
Production env vars    # Set in Railway dashboard, not in files

Documentation:
ENVIRONMENTS.md        # Complete guide to all env vars
```

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-01-$(date +%Y%m%d)`
- [ ] Verify Railway auto-deploy is working
- [ ] Confirm latest commit deployed successfully
- [ ] Screenshot Railway environment variables (if making changes)

### Backup Methods:
**Environment Variables:**
```bash
# Export current Railway env vars before making changes
# Log into Railway dashboard and copy all env vars to a text file
# Save as: env-backup-project-01-$(date +%Y%m%d).txt
```

**Files:**
```bash
# Git tracks all changes - rollback with:
git reset --hard pre-project-01-$(date +%Y%m%d)
git push --force origin main  # Only if no one else working
```

### If Things Break:
1. **Immediate:** Revert last commit: `git revert HEAD && git push`
2. **Full Rollback:** Reset to tag: `git reset --hard pre-project-01-$(date +%Y%m%d)`
3. **Production Issue:** Check Railway logs: `railway logs`
4. **Database Issue:** Verify DATABASE_URL still correct in Railway dashboard

### Recovery Checklist:
- [ ] Verify application loads: https://crm.jaydenmetz.com
- [ ] Run health tests: https://crm.jaydenmetz.com/health
- [ ] Check Railway deployment succeeded
- [ ] Verify no console errors in browser
- [ ] Test critical user flows (login, dashboard, create escrow)

## ✅ Tasks

### Planning
- [ ] Audit all .env files in project
- [ ] List all environment variables currently used
- [ ] Identify duplicate or conflicting variables
- [ ] Review hardcoded config in source files
- [ ] Verify .gitignore properly excludes .env files

### Implementation
- [ ] Create comprehensive .env.example with all variables
- [ ] Consolidate duplicate environment variables
- [ ] Remove conflicting variable names
- [ ] Move hardcoded config to environment variables
- [ ] Update Railway dashboard with production env vars
- [ ] Delete unnecessary .env files (keep .env for local dev)
- [ ] Verify .gitignore includes all .env variants
- [ ] Update all code to use consistent env var names

### Testing
- [ ] Test backend starts with .env.example values
- [ ] Verify Railway deployment uses correct env vars
- [ ] Check no hardcoded credentials in source code
- [ ] Test local development with fresh .env file
- [ ] Verify API connections work with env vars

### Documentation
- [ ] Update ENVIRONMENTS.md with all variables
- [ ] Add comments to .env.example explaining each variable
- [ ] Document Railway environment setup
- [ ] Update README with environment setup instructions

---

## 🧪 Simple Verification Tests

### Test 1: No Secrets Committed to Git
**Steps:**
1. Run: `git log --all --full-history -- "*.env"`
2. Run: `grep -r "HARDCODED_PASSWORD\|sk_live_\|pk_live_" --include="*.js" --include="*.jsx" backend/ frontend/`
3. Verify no secrets in source code

**Expected Result:** No .env files in git history, no hardcoded API keys/passwords

**Pass/Fail:** [ ]

### Test 2: .env.example Has All Required Variables
**Steps:**
1. Run: `cat .env.example`
2. Compare with code usage: `grep -r "process.env\." backend/src --include="*.js" | cut -d. -f3 | sort | uniq`
3. Verify all used env vars are in .env.example

**Expected Result:** .env.example includes every environment variable used in code

**Pass/Fail:** [ ]

### Test 3: Backend Starts With Environment Variables
**Steps:**
1. Copy .env.example to .env: `cp .env.example .env`
2. Fill in placeholder values
3. Run: `cd backend && npm run dev`
4. Verify server starts without "undefined" errors

**Expected Result:** Backend starts successfully, connects to database

**Pass/Fail:** [ ]

### Test 4: Railway Has All Production Variables
**Steps:**
1. Log into Railway dashboard
2. Check environment variables tab
3. Verify all required vars from .env.example are set
4. Check no placeholder values (like "your_database_password_here")

**Expected Result:** All production env vars properly configured in Railway

**Pass/Fail:** [ ]

### Test 5: No Duplicate Environment Variables
**Steps:**
1. Run: `cat .env.example | grep "^[A-Z]" | cut -d= -f1 | sort | uniq -d`
2. Check if command returns any duplicates

**Expected Result:** No duplicate variable names

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
- [ ] Environment variables: No secrets committed to git (check `.gitignore` includes `.env*`)
- [ ] Verify `.env.example` has all required variables from code usage
- [ ] Railway production env vars properly set (no placeholder values)
- [ ] No hardcoded credentials in source code (search for API keys, passwords)
- [ ] Update ENVIRONMENTS.md with all new variables

---

## 🔗 Dependencies

**Depends On:**
- None (foundation project)

**Blocks:**
- Project-02: Remove Duplicate Code Files
- Project-03: Backend Directory Consolidation
- Project-07: Script Centralization
- Project-09: Config File Consolidation
- Project-15: Build Process Verification
- Phase H: Deployment & Operations projects

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] All verification tests pass
- [ ] Single .env.example file with all variables
- [ ] No duplicate or conflicting env var names
- [ ] No secrets committed to git
- [ ] Railway dashboard has all production env vars
- [ ] Backend starts successfully with env vars
- [ ] Documentation updated (ENVIRONMENTS.md)
- [ ] Code committed and pushed

---

## 📊 Completion Checklist

### Before Moving to Archive:
- [ ] All success criteria met
- [ ] User verified production deployment works
- [ ] No secrets exposed in git history
- [ ] Clean git commit with descriptive message
- [ ] Project summary written

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Brief notes]
**Follow-up Items:** [Any items for future projects]
