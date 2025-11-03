# Project-04: Script Centralization

**Phase**: A
**Priority**: MEDIUM
**Status**: Not Started
**Estimated Time**: 6 hours (base) + 1.5 hours (buffer 20%) = 7.5 hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

## 🎯 Goal
Move all utility scripts to proper folders (/scripts/testing, /scripts/backend) and remove scripts from project root.

## 📋 Context
CLAUDE.md requires clean root directory with only README.md, CLAUDE.md, docker-compose.yml, railway.json. Currently scripts may be scattered in root or inconsistent locations.

**Target Structure:**
```
/scripts/testing/     # Test scripts
/scripts/backend/     # Backend utilities
/backend/scripts/     # Operational scripts (backups, etc.)
```

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Scripts referenced in docs/CI may break
- [ ] **Performance Impact**: None
- [ ] **Dependencies**: CI/CD pipelines, cron jobs

### Business Risks:
- [ ] **User Impact**: Low - scripts are dev tools
- [ ] **Downtime Risk**: Low
- [ ] **Data Risk**: Low

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-04-$(date +%Y%m%d)`
- [ ] List all scripts currently in root
- [ ] Check if any scripts referenced in Railway/CI

### Backup Methods:
```bash
git reset --hard pre-project-04-$(date +%Y%m%d)
```

### If Things Break:
1. Check for broken script references in docs
2. Update paths in documentation
3. Revert if needed

### Recovery Checklist:
- [ ] All scripts executable and in correct locations
- [ ] Documentation updated with new paths

---

## ✅ Tasks

### Planning
- [ ] List all scripts in project
- [ ] Identify scripts in wrong locations
- [ ] Check script references in docs

### Implementation
- [ ] Move test scripts to /scripts/testing
- [ ] Move backend utilities to /scripts/backend
- [ ] Update script shebangs if needed
- [ ] Update documentation references
- [ ] Verify scripts still executable

### Testing
- [ ] Run each script to verify works
- [ ] Check documentation paths correct

---

## 🧪 Simple Verification Tests

### Test 1: Success Metric Test
**Steps:**
1. Run: `ls -la *.sh *.js 2>/dev/null | wc -l`
2. Verify output is 0 (no scripts in root)

**Expected Result:** Root directory has no .sh or .js script files

**Pass/Fail:** [ ]

### Test 2: Scripts Execute
**Steps:**
1. Test each moved script runs from new location
2. Verify permissions correct

**Expected Result:** All scripts executable from new locations

**Pass/Fail:** [ ]

---

## 📝 Implementation Notes

### Changes Made:
- [Script moved and why]

---

## 📐 CLAUDE.md Compliance

### Required Patterns:
- [ ] **Clean root directory** - No scripts in root
- [ ] **Proper organization** - Scripts in /scripts folder
- [ ] **Git commits**: Include `Co-Authored-By: Claude <noreply@anthropic.com>`

---

## 🔗 Dependencies

**Depends On:**
- Project-03: Naming Convention Enforcement

**Blocks:**
- Project-14: Archive Legacy Code

---

## 🎲 Project Selection Criteria

### ✅ Can Start This Project If:
- [ ] Project-03 completed
- [ ] Have 7.5 hours available
- [ ] Railway deployment healthy

### 🚫 Should Skip/Defer If:
- [ ] Active production issue
- [ ] End of sprint

### ⏰ Optimal Timing:
- **Best Day**: Any day
- **Sprint Position**: Mid-Late

---

## ✅ Success Criteria
- [ ] Root directory clean (no scripts)
- [ ] All scripts in proper folders
- [ ] Scripts still executable
- [ ] Documentation updated

---

## 📊 Completion Checklist

### Before Moving to Archive:
- [ ] All success criteria met
- [ ] User verified functionality

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Brief notes]
