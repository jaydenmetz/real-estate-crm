# Project-09: Config File Consolidation

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
Consolidate all configuration files into a single, well-organized config directory with clear separation between frontend and backend configuration.

## 📋 Context
Configuration files are currently scattered across the project. This project centralizes all config for easier management and consistent patterns.

**Target Structure:**
```
backend/src/config/
├── database.js        # DB connection config
├── auth.js            # JWT, API key settings
├── security.js        # CORS, rate limiting
└── index.js           # Export all configs

frontend/src/config/
├── api.js             # API endpoints, axios config
├── theme.js           # Material-UI theme
└── constants.js       # App-wide constants
```

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Moving config files breaks import paths. Risk of missing configuration causing startup failures.
- [ ] **Performance Impact**: None expected
- [ ] **Dependencies**: All config imports across frontend/backend, environment variables

### Business Risks:
- [ ] **User Impact**: Low - Config changes tested before deployment
- [ ] **Downtime Risk**: Low - Application may not start if config imports broken
- [ ] **Data Risk**: None - Config organization only

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-09-$(date +%Y%m%d)`
- [ ] Verify Railway auto-deploy is working
- [ ] Confirm latest commit deployed successfully
- [ ] List all config files before moving: `find . -name "*config*" > configs-before.txt`

### Backup Methods:
**Files:**
```bash
# Git tracks all changes - rollback with:
git reset --hard pre-project-09-$(date +%Y%m%d)
git push --force origin main  # Only if no one else working
```

### If Things Break:
1. **Immediate:** Revert last commit: `git revert HEAD && git push`
2. **Full Rollback:** Reset to tag: `git reset --hard pre-project-09-$(date +%Y%m%d)`
3. **Production Issue:** Check Railway logs: `railway logs`
4. **Config Errors:** Check backend console for missing config values

### Recovery Checklist:
- [ ] Verify application loads: https://crm.jaydenmetz.com
- [ ] Run health tests: https://crm.jaydenmetz.com/health
- [ ] Check Railway deployment succeeded
- [ ] Verify no console errors in browser
- [ ] Test critical user flows (login, dashboard, create escrow)

## ✅ Tasks

### Planning
- [ ] Find all config files across project
- [ ] Identify duplicate config values
- [ ] Review environment variable usage
- [ ] Create consolidation plan

### Implementation
- [ ] Create organized config directories
- [ ] Move config files to appropriate locations
- [ ] Consolidate duplicate configuration
- [ ] Ensure configs use environment variables
- [ ] Update imports across codebase
- [ ] Remove orphaned config files

### Testing
- [ ] Test backend starts with new config
- [ ] Verify frontend builds successfully
- [ ] Test all features work with consolidated config
- [ ] Check environment variables load correctly

### Documentation
- [ ] Document configuration structure
- [ ] Add comments to config files
- [ ] Update setup guides

---

## 🧪 Simple Verification Tests

### Test 1: Config Files Are Organized
**Steps:**
1. Check backend/src/config/ exists
2. Verify all backend config files present
3. Check frontend/src/config/ exists
4. Verify all frontend config files present

**Expected Result:** Clear config directory structure

**Pass/Fail:** [ ]

### Test 2: No Duplicate Config Values
**Steps:**
1. Search for duplicate API URLs
2. Check for repeated config values
3. Verify single source of truth

**Expected Result:** No config duplication

**Pass/Fail:** [ ]

### Test 3: Application Works
**Steps:**
1. Start backend and frontend
2. Test login and basic operations
3. Verify no config-related errors

**Expected Result:** App works normally with consolidated config

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
- [ ] Config organization: Group by purpose (database, api, features)
- [ ] No duplicate config keys across files
- [ ] Environment-specific config uses env vars (not hardcoded)
- [ ] Config naming: camelCase or kebab-case (api.config.js, database.config.js)
- [ ] Import pattern: Single config entry point where possible

---

## 🔗 Dependencies

**Depends On:**
- Project-01: Environment Configuration Cleanup
- Project-07: Script Centralization

**Blocks:**
- Project-15: Build Process Verification

---

## 🎲 Project Selection Criteria

### ✅ Can Start This Project If:
- [ ] All dependencies completed (Projects 01, 07 complete)
- [ ] Current build is stable (228/228 tests passing)
- [ ] Have 4.8 hours available this sprint
- [ ] Not blocking other developers
- [ ] Railway deployment healthy

### 🚫 Should Skip/Defer If:
- [ ] Active production issue or P0 bug
- [ ] Waiting on user feedback for this area
- [ ] Higher priority project available
- [ ] End of sprint (less than 4.8 hours remaining)
- [ ] Environment variable changes in progress

### ⏰ Optimal Timing:
- **Best Day**: Any day (low-risk organization work)
- **Avoid**: None (safe cleanup task)
- **Sprint Position**: Mid-late sprint (cleanup work)

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] All verification tests pass
- [ ] Config files organized by purpose
- [ ] No duplicate configuration
- [ ] App works correctly
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
