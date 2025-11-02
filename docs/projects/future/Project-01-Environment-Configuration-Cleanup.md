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

## 🎯 Goal
Consolidate all environment variables into a single source of truth and eliminate redundant configuration files.

## 📋 Context
Currently, environment variables are scattered across multiple files (.env, .env.example, railway.json, docker-compose.yml, hardcoded in backend/src/config/database.js). This creates:
- Configuration drift between environments
- Difficulty tracking what variables are actually used
- Security risks from example files containing sensitive patterns
- Deployment issues when variables are missing or misconfigured

Railway is the production environment, and all configuration should flow from Railway's environment variables. Local development should mirror production as closely as possible.

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Railway deployment could fail if variables renamed incorrectly
- [ ] **Performance Impact**: None - configuration loading happens once at startup
- [ ] **Dependencies**: Railway environment variables, database connection, external APIs

### Business Risks:
- [ ] **User Impact**: High - misconfiguration could break production login/database access
- [ ] **Downtime Risk**: Medium - requires careful Railway variable updates
- [ ] **Data Risk**: Low - no data structure changes, only configuration

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-01-$(date +%Y%m%d)`
- [ ] Verify Railway auto-deploy is working
- [ ] Confirm latest commit deployed successfully
- [ ] Run health tests to establish baseline: https://crm.jaydenmetz.com/health
- [ ] **Screenshot Railway environment variables** (critical for rollback)

### Backup Methods:
**Railway Configuration:**
```bash
# Export current Railway variables (manually copy from dashboard)
# https://railway.app → real-estate-crm → Variables tab → Copy all
```

**Files:**
```bash
git reset --hard pre-project-01-$(date +%Y%m%d)
git push --force origin main  # Only if no one else working
```

### If Things Break:
1. **Immediate:** Revert last commit: `git revert HEAD && git push`
2. **Full Rollback:** Reset to tag: `git reset --hard pre-project-01-$(date +%Y%m%d)`
3. **Production Issue:** Restore Railway variables from screenshot
4. Check Railway logs: `railway logs`
5. Verify database connection: Test `/v1/health` endpoint

### Recovery Checklist:
- [ ] Verify application loads: https://crm.jaydenmetz.com
- [ ] Run health tests: https://crm.jaydenmetz.com/health (228/228 must pass)
- [ ] Check Railway deployment succeeded
- [ ] Verify no console errors in browser
- [ ] Test critical user flows (login, dashboard, create escrow)
- [ ] Confirm database connection working

---

## ✅ Tasks

### Planning
- [ ] Review current implementation
- [ ] Audit all .env* files in project
- [ ] Document all environment variables currently in use
- [ ] Map Railway variables to code usage

### Implementation
- [ ] Create single comprehensive .env.example with all variables and descriptions
- [ ] Remove redundant .env.local, .env.development files
- [ ] Update backend/src/config/database.js to use environment variables (no hardcoded values)
- [ ] Update railway.json to reference environment variables, not hardcoded values
- [ ] Create docs/ENVIRONMENT_VARIABLES.md documenting all variables, their purpose, and required/optional status
- [ ] Add .env validation script to check for missing required variables at startup
- [ ] Update README.md with environment setup instructions

### Testing
- [ ] Manual testing completed
- [ ] Run success metric test
- [ ] Run health dashboard tests (228/228)
- [ ] Test affected functionality in production

### Documentation
- [ ] Update RAILWAY_ENVIRONMENT_SETUP.md
- [ ] Add implementation notes below
- [ ] Update CLAUDE.md if patterns changed

---

## 🧪 Simple Verification Tests

### Test 1: Success Metric Test
**Steps:**
1. Run: `node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? 'PASS' : 'FAIL')"`
2. Verify all required variables load correctly

**Expected Result:** All required environment variables load from .env without errors, database connection succeeds

**Pass/Fail:** [ ]

### Test 2: Health Dashboard Check
**Steps:**
1. Navigate to https://crm.jaydenmetz.com/health
2. Click "Run All Tests"
3. Verify all 228 tests pass

**Expected Result:** All 228/228 tests green

**Pass/Fail:** [ ]

### Test 3: Railway Deployment Test
**Steps:**
1. Push changes to GitHub
2. Wait for Railway auto-deploy (2-3 minutes)
3. Check Railway logs for successful startup
4. Verify database connection established

**Expected Result:** Railway deployment succeeds, no environment variable errors in logs

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
- [ ] **NO duplicate files** - Edit existing files in place
- [ ] **Component naming**: PascalCase for components
- [ ] **API calls**: Use apiInstance from api.service.js
- [ ] **Responsive grids**: Max 2 columns inside cards/widgets
- [ ] **Archive old code**: Move to `archive/ComponentName_YYYY-MM-DD.jsx`
- [ ] **Git commits**: Include `Co-Authored-By: Claude <noreply@anthropic.com>`

### Project-Specific Rules:
- [ ] **NO API key prefixes** - Clean 64-character hex strings (from CLAUDE.md)
- [ ] **Environment variables** - Never commit .env file, only .env.example
- [ ] **Railway first** - Production config is source of truth
- [ ] **Documentation** - All new config patterns go in docs/ENVIRONMENT_VARIABLES.md

---

## 🔗 Dependencies

**Depends On:**
- None - This is the first Phase A project

**Blocks:**
- All other Phase A projects (clean foundation needed)

---

## 🎲 Project Selection Criteria

### ✅ Can Start This Project If:
- [ ] All dependencies completed (none for Project-01)
- [ ] Current build is stable (228/228 tests passing)
- [ ] Have 8 hours available this sprint
- [ ] Not blocking other developers
- [ ] Railway deployment healthy

### 🚫 Should Skip/Defer If:
- [ ] Active production issue or P0 bug
- [ ] Waiting on user feedback for environment config
- [ ] Higher priority project available (none - this is CRITICAL)
- [ ] End of sprint (less than 8 hours remaining)
- [ ] Railway access unavailable

### ⏰ Optimal Timing:
- **Best Day**: Monday-Tuesday (start of sprint)
- **Avoid**: Friday (risk of weekend production issues)
- **Sprint Position**: Early (foundation for all other projects)

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] Success metric test passes
- [ ] All 228 health tests pass
- [ ] No console errors in production
- [ ] Railway deployment succeeds
- [ ] Single .env.example file with all variables documented
- [ ] No hardcoded configuration values in code
- [ ] docs/ENVIRONMENT_VARIABLES.md created and comprehensive
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
