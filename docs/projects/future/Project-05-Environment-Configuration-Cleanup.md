# Project-05: Environment Configuration Cleanup

**Phase**: A
**Priority**: High
**Status**: Not Started
**Estimated Time**: 6 hours
**Started**: [Date]
**Completed**: [Date]

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

## 🔗 Dependencies

**Depends On:**
- Project-03: Script Centralization (scripts need env vars)

**Blocks:**
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
