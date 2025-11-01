# Project-08: Database Migration Consolidation

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
Organize all database migration files into a clear, versioned structure with proper rollback scripts and ensure migrations can be run reliably in any environment.

## 📋 Context
Database migrations need to be organized, versioned, and tested to ensure reliable schema updates across development, staging, and production environments.

**Current Issues:**
- Migration files may lack consistent naming
- Some migrations missing rollback/down scripts
- Unclear which migrations have been run in production
- No centralized migration tracking
- Some schema changes made directly without migrations

**Target Structure:**
```
backend/migrations/
├── 001_initial_schema.sql
├── 002_add_api_keys_table.sql
├── 003_add_security_events.sql
├── rollback/
│   ├── 001_rollback.sql
│   ├── 002_rollback.sql
│   └── 003_rollback.sql
└── README.md
```

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-08-$(date +%Y%m%d)`
- [ ] Verify Railway auto-deploy is working
- [ ] Confirm latest commit deployed successfully
- [ ] **CRITICAL:** Backup production database before ANY changes

### Backup Methods:
**Database:**
```bash
# Backup database before organizing migrations
PGPASSWORD=$PGPASSWORD pg_dump -h ballast.proxy.rlwy.net -p 20017 -U postgres railway > backup-project-08-$(date +%Y%m%d).sql
```

**Files:**
```bash
# Git tracks all changes - rollback with:
git reset --hard pre-project-08-$(date +%Y%m%d)
git push --force origin main  # Only if no one else working
```

### If Things Break:
1. **Immediate:** Revert last commit: `git revert HEAD && git push`
2. **Full Rollback:** Reset to tag: `git reset --hard pre-project-08-$(date +%Y%m%d)`
3. **Production Issue:** Check Railway logs: `railway logs`
4. **Database Issue:** Restore from backup: `psql -h ballast.proxy.rlwy.net -p 20017 -U postgres railway < backup-project-08-YYYYMMDD.sql`

### Recovery Checklist:
- [ ] Verify application loads: https://crm.jaydenmetz.com
- [ ] Run health tests: https://crm.jaydenmetz.com/health
- [ ] Check Railway deployment succeeded
- [ ] Verify no console errors in browser
- [ ] Test critical user flows (login, dashboard, create escrow)

## ✅ Tasks

### Planning
- [ ] Audit all migration files
- [ ] Verify migration history in production database
- [ ] Identify migrations missing rollback scripts
- [ ] Review schema changes not captured in migrations
- [ ] Create migration organization plan

### Implementation
- [ ] Rename migrations with sequential numbers
- [ ] Create rollback scripts for all migrations
- [ ] Add migration tracking table to database
- [ ] Document which migrations are in production
- [ ] Create script to run migrations safely
- [ ] Add migration verification tests
- [ ] Ensure migrations are idempotent (can run multiple times safely)

### Testing
- [ ] Test migrations on fresh database
- [ ] Test rollback scripts work correctly
- [ ] Verify migrations in production match files
- [ ] Test migration script handles errors
- [ ] Check schema matches expected state

### Documentation
- [ ] Create migrations/README.md
- [ ] Document migration naming convention
- [ ] Add instructions for creating new migrations
- [ ] Update DATABASE_STRUCTURE.md

---

## 🧪 Simple Verification Tests

### Test 1: All Migrations Have Rollback Scripts
**Steps:**
1. Run: `ls backend/migrations/*.sql | wc -l`
2. Run: `ls backend/migrations/rollback/*.sql | wc -l`
3. Verify counts match

**Expected Result:** Same number of migration and rollback files

**Pass/Fail:** [ ]

### Test 2: Migrations Are Sequentially Numbered
**Steps:**
1. Run: `ls backend/migrations/*.sql | grep -E "^[0-9]{3}_"`
2. Verify files are numbered 001, 002, 003, etc.

**Expected Result:** All migrations have three-digit prefix in sequence

**Pass/Fail:** [ ]

### Test 3: Production Schema Matches Migrations
**Steps:**
1. Check production database tables
2. Run all migrations on fresh database
3. Compare schemas

**Expected Result:** Migrations produce exact production schema

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
- [ ] Migration naming: Sequential numbering (001_, 002_, 003_)
- [ ] Rollback scripts: Every migration has corresponding down.sql
- [ ] Test migrations: Run on local database before production
- [ ] Migration tracking: Document what each migration does
- [ ] Environment variables: Use $DATABASE_HOST, $PGPASSWORD in migration scripts

---

## 🔗 Dependencies

**Depends On:**
- Project-01: Environment Configuration Cleanup
- Project-03: Backend Directory Consolidation

**Blocks:**
- Phase E: Data & Analytics projects

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] All verification tests pass
- [ ] Migrations sequentially numbered
- [ ] All migrations have rollback scripts
- [ ] Migration tracking implemented
- [ ] Documentation updated
- [ ] Code committed and pushed

---

## 📊 Completion Checklist

### Before Moving to Archive:
- [ ] All success criteria met
- [ ] User verified migrations work
- [ ] Clean git commit
- [ ] Project summary written

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Brief notes]
**Follow-up Items:** [Any items for future projects]
