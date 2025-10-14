# Automated Access Review System

## Overview

SOC 2 requires quarterly reviews of all user access to ensure the principle of least privilege. This system automates access reviews, tracks changes, and maintains an audit trail.

**Review Frequency:** Quarterly (Q1, Q2, Q3, Q4)
**Review Owner:** Security Officer + Department Managers
**Tracking Method:** Vanta + automated reports
**Compliance Requirement:** SOC 2 Trust Service Criteria CC6.1, CC6.2, CC6.3

## Access Review Schedule

### Quarterly Reviews (Every 3 months)

| Quarter | Review Date | Systems to Review | Owner | Status |
|---------|-------------|-------------------|-------|--------|
| Q1 2025 | January 15 | All systems | Security Officer | Pending |
| Q2 2025 | April 15 | All systems | Security Officer | Pending |
| Q3 2025 | July 15 | All systems | Security Officer | Pending |
| Q4 2025 | October 15 | All systems | Security Officer | Pending |

### Systems Requiring Access Review

**Production Systems (Critical):**
1. **Railway Production Environment**
   - Database access (PostgreSQL)
   - Environment variables
   - Deployment permissions
   - Review: Who can deploy code? Who can access production DB?

2. **GitHub Repository**
   - Admin access
   - Write access
   - Protected branch settings
   - Review: Who can merge to main? Who has admin rights?

3. **Production Database**
   - Direct database access
   - Admin privileges
   - Read-only access
   - Review: Who needs database access? Can we reduce?

**Business Systems (Important):**
4. **Google Workspace**
   - Super Admin access
   - Admin console access
   - Group memberships
   - Review: Who has admin rights? Are groups current?

5. **Sentry (Error Monitoring)**
   - Admin access
   - Member access
   - Review: Does everyone still need access?

6. **Financial Systems** (if applicable)
   - Stripe dashboard
   - Banking access
   - Review: Who can process refunds? Who has financial access?

**Internal Tools (Standard):**
7. **Productivity Tools**
   - Slack admin
   - Notion admin
   - Review: Remove inactive users

## Automated Access Review Process

### Step 1: Data Collection (Automated - Day 1)

Vanta automatically collects access data from:

```bash
# Railway Access Export
- Collects: All users with Railway access
- Shows: Email, role, last login, permissions
- Flags: Users inactive >90 days

# GitHub Access Export
- Collects: Org members, teams, permissions
- Shows: Username, role (admin/write/read), teams, last commit
- Flags: Admins without recent activity, members not in teams

# Google Workspace Export
- Collects: All users, groups, admin roles
- Shows: Email, admin status, group memberships, last login
- Flags: Super admins, users inactive >30 days, suspended accounts

# Database Access Audit
- Collects: PostgreSQL user accounts, roles, permissions
- Shows: Username, privileges (SUPERUSER, CREATEDB, CREATEROLE)
- Flags: Accounts with SUPERUSER, accounts never used
```

**Vanta Output:**
```
Access Review Report - Q4 2025
Generated: October 1, 2025

SUMMARY:
- Total Users: 12
- Admin Users: 3
- Flagged for Review: 5
- Inactive Accounts: 2

FLAGGED ITEMS:
1. john@example.com - Super Admin in Google Workspace (verify need)
2. contractor@example.com - Railway access (contract ended 60 days ago)
3. db_user_old - PostgreSQL SUPERUSER (unused for 90 days)
4. former_intern - GitHub write access (left company 30 days ago)
5. temp_api_key - API key unused for 45 days

RECOMMENDED ACTIONS:
- Remove: 2 accounts (contractor, former intern)
- Revoke: 1 API key (temp_api_key)
- Downgrade: 1 admin (john@example.com to regular user)
- Archive: 1 database user (db_user_old)
```

### Step 2: Manager Review (Day 1-7)

Send access review to each manager:

**Email Template:**
```
Subject: Q[X] Access Review Required - Action by [Due Date]

Hi [Manager Name],

Your quarterly access review is due. Please verify that your team members
still need the access they have.

YOUR TEAM (4 members):
1. Alice Smith ([email protected])
   - Railway: Admin access
   - GitHub: Write access
   - Database: Read-only access
   ✅ Keep access  ❌ Remove access  ⚠️ Reduce access

2. Bob Johnson ([email protected])
   - Railway: Member access
   - GitHub: Write access
   ✅ Keep access  ❌ Remove access  ⚠️ Reduce access

3. Carol Davis ([email protected]) - FLAGGED
   - Last login: 60 days ago
   - Railway: Admin access
   - Reason for flag: Extended leave
   ✅ Keep (return date: [X])  ❌ Remove  ⚠️ Suspend until return

4. Dave Wilson ([email protected]) - FLAGGED
   - Last login: 5 days ago
   - Railway: Admin access
   - GitHub: Admin access (!!!)
   - Database: SUPERUSER (!!!)
   - Reason for flag: Excessive privileges
   ✅ Keep all  ⚠️ Reduce to standard access

COMPLETE YOUR REVIEW:
[Review in Vanta Button]

Deadline: [7 days from now]

If you don't respond, we'll assume all flagged users should be removed
for security compliance.

Questions? Contact [email protected]
```

### Step 3: Security Officer Review (Day 8-10)

After manager reviews, Security Officer performs final review:

**Review Checklist:**
```markdown
ADMIN ACCESS VALIDATION:
- [ ] Railway Admin: Currently [X] users
  → Should be: [Y] users (CEO, CTO only)
  → Action: Downgrade [Z] users to member

- [ ] GitHub Admin: Currently [X] users
  → Should be: [Y] users (CTO only)
  → Action: Downgrade [Z] users to write

- [ ] Google Super Admin: Currently [X] users
  → Should be: [Y] users (CEO + 1 backup)
  → Action: Downgrade [Z] users to regular admin

- [ ] Database SUPERUSER: Currently [X] accounts
  → Should be: [Y] accounts (1 service account + CTO)
  → Action: Revoke [Z] accounts

INACTIVE ACCOUNT REMOVAL:
- [ ] Railway: Remove [X] users inactive >90 days
- [ ] GitHub: Remove [X] users inactive >90 days
- [ ] Google: Suspend [X] users inactive >30 days
- [ ] Database: Drop [X] users not logged in >90 days

CONTRACTOR/TEMP ACCESS:
- [ ] Review all non-employee accounts
- [ ] Verify contract end dates
- [ ] Remove access for ended contracts
- [ ] Set expiration dates for active contractors

API KEY AUDIT:
- [ ] List all API keys (Vanta auto-discovers)
- [ ] Identify unused keys (>30 days)
- [ ] Rotate keys >90 days old
- [ ] Remove keys for departed users
```

### Step 4: Execute Changes (Day 11-12)

**Automated Revocation (via Vanta or scripts):**

```bash
# Railway Access Removal
# (Manual via Railway dashboard)
for user in removed_users:
  1. Go to Railway → Settings → Members
  2. Find user email
  3. Click "Remove"
  4. Document in access log

# GitHub Access Removal
# (Manual via GitHub settings)
for user in removed_users:
  1. Go to GitHub → Settings → Members
  2. Find username
  3. Click "Remove from organization"
  4. Document in access log

# Google Workspace - Suspend Account
# (Manual via Admin Console)
for user in inactive_users:
  1. Go to Google Admin → Users
  2. Find user
  3. Click "Suspend user"
  4. Set recovery email
  5. Document in access log

# Database Access Revocation
# (Via SQL)
-- Revoke superuser privilege
ALTER USER db_user_old NOSUPERUSER;

-- Drop inactive user
DROP USER IF EXISTS contractor_user;

-- Rotate passwords for active users
ALTER USER active_user WITH PASSWORD '[new_random_password]';
```

**Change Log:**
```markdown
# Access Review Q4 2025 - Change Log
Date: October 15, 2025
Reviewer: Jayden Metz (Security Officer)

ACTIONS TAKEN:

REMOVED (3 users):
- contractor@example.com - Railway, GitHub (contract ended)
- former_intern@example.com - GitHub (departed company)
- temp_user - Database (temporary access expired)

DOWNGRADED (2 users):
- john@example.com - Google Super Admin → Regular Admin
- bob@example.com - GitHub Admin → Write access

REVOKED (1 API key):
- temp_api_key - Unused for 45 days

SUSPENDED (1 user):
- carol@example.com - On extended leave (return: Nov 15)

ROTATED (4 credentials):
- production_db_user - Password rotated (>90 days)
- api_service_account - Key rotated (>90 days)
- backup_user - Password rotated (>90 days)
- monitoring_user - Password rotated (>90 days)

TOTAL CHANGES: 11
ADMIN COUNT: 5 → 3 (40% reduction)
ACTIVE USERS: 12 → 9 (3 removed)
```

### Step 5: Documentation & Audit Trail (Day 13-14)

**Required Documentation:**

1. **Access Review Report** (from Vanta)
   - List of all users reviewed
   - Manager attestations
   - Security Officer approval
   - Changes made

2. **Manager Attestation Records**
   - Email responses from each manager
   - "I certify that I have reviewed access for my team and confirmed
     all access is appropriate and necessary."
   - Signature: [Manager Name], Date: [X]

3. **Change Log** (see above)
   - Detailed list of changes
   - Rationale for each change
   - Who approved each change

4. **Follow-up Actions**
   - Any access requests denied (appeal process)
   - Any new access granted (justification)
   - Any anomalies discovered (investigate)

**Audit Trail Storage:**
```
docs/compliance/access-reviews/
├── 2025-Q1/
│   ├── access-review-report.pdf
│   ├── manager-attestations.pdf
│   ├── change-log.md
│   └── vanta-export.csv
├── 2025-Q2/
│   └── ...
├── 2025-Q3/
│   └── ...
└── 2025-Q4/
    ├── access-review-report.pdf
    ├── manager-attestations.pdf
    ├── change-log.md
    └── vanta-export.csv
```

**Retention:** 7 years (SOC 2 requirement)

## Automated Workflows

### Vanta Access Review Workflow

```bash
# Configuration in Vanta:

1. Go to Access Reviews → Create Review
2. Configure:
   - Name: Q4 2025 Access Review
   - Systems: Railway, GitHub, Google Workspace, PostgreSQL
   - Reviewers: Engineering Manager, Product Manager, Security Officer
   - Due Date: October 15, 2025
   - Reminders: 7, 3, 1 days before

3. Vanta will:
   - Auto-discover all user accounts
   - Send review requests to managers
   - Track completion status
   - Flag anomalies (inactive users, excessive privileges)
   - Generate completion report
   - Archive for audit

4. After review:
   - Export change log
   - Upload attestations
   - Mark review complete
   - Schedule next quarter automatically
```

### Automated Anomaly Detection

Vanta flags for review:

```javascript
// CRITICAL ALERTS (immediate action)
if (user.isSuperAdmin && !user.needsSuperAdmin) {
  flag("Super Admin without justification", "CRITICAL");
}

if (user.lastLogin > 90_days && user.hasProductionAccess) {
  flag("Inactive user with production access", "CRITICAL");
}

if (user.isContractor && contract.endDate < today) {
  flag("Contractor access after contract end", "CRITICAL");
}

// WARNING ALERTS (review at next cycle)
if (user.lastLogin > 30_days && user.hasAdminAccess) {
  flag("Inactive admin user", "WARNING");
}

if (user.permissions.length > team_average * 1.5) {
  flag("User has more permissions than typical", "WARNING");
}

if (api_key.lastUsed > 45_days) {
  flag("Unused API key", "WARNING");
}

// INFO ALERTS (track but no action yet)
if (user.createdDate < 90_days && user.hasAdminAccess) {
  flag("New user with admin access (verify)", "INFO");
}
```

### Offboarding Automation

When an employee leaves:

```bash
# Immediate (Day 0 - termination day):
- [ ] Disable Google Workspace account (auto-suspends all Google services)
- [ ] Revoke GitHub access (remove from organization)
- [ ] Revoke Railway access (remove from project)
- [ ] Revoke database access (disable user account)
- [ ] Revoke all API keys associated with user
- [ ] Change shared passwords user had access to
- [ ] Collect all devices (laptop, phone, keys)

# Within 24 hours:
- [ ] Transfer data ownership (email, Drive files)
- [ ] Backup user's work (code commits, documents)
- [ ] Remove from Slack, Notion, other tools
- [ ] Notify team of access removal

# Within 7 days:
- [ ] Complete exit interview
- [ ] Obtain signed NDA reminder
- [ ] Remove from mailing lists
- [ ] Update access review records

# Within 30 days:
- [ ] Permanently delete user account (after data transfer)
- [ ] Archive all access logs
- [ ] Remove from vendor systems (Vanta, etc.)
```

**Offboarding Checklist Template:**
```markdown
# Employee Offboarding - [Name]
Departure Date: [Date]
Manager: [Manager Name]
Offboarding Coordinator: [HR/Security Officer]

IMMEDIATE (Day 0):
- [ ] Google Workspace suspended
- [ ] GitHub access revoked
- [ ] Railway access revoked
- [ ] Database access disabled
- [ ] API keys revoked ([list])
- [ ] Shared passwords rotated ([list])
- [ ] Devices collected (laptop: [serial], phone: [#])

WITHIN 24 HOURS:
- [ ] Email forwarded to: [manager email]
- [ ] Drive files transferred to: [manager]
- [ ] Code backed up: [repository]
- [ ] Slack/Notion removed
- [ ] Team notified

WITHIN 7 DAYS:
- [ ] Exit interview completed
- [ ] NDA signed (reminder)
- [ ] Access review updated
- [ ] Vendor systems updated (Vanta, etc.)

WITHIN 30 DAYS:
- [ ] Account permanently deleted
- [ ] Logs archived (7-year retention)
- [ ] Offboarding complete

Notes: [Any special circumstances]
```

## Least Privilege Principle

### Access Tiers

**Tier 1: Super Admin (2 people max)**
- CEO (primary)
- CTO or Security Officer (backup)
- Access: All systems, all permissions
- Review: Monthly (not quarterly)

**Tier 2: Admin (5 people max)**
- Engineering Lead
- Product Manager
- DevOps Lead
- Access: Production systems (limited), all dev systems
- Review: Quarterly

**Tier 3: Developer (unlimited)**
- Engineers, designers
- Access: Dev/staging environments, read-only production logs
- Review: Quarterly

**Tier 4: Contractor/Temp (as needed)**
- External contractors, interns
- Access: Limited, time-bound (auto-expire after contract end)
- Review: Monthly

### Permission Reduction Guidelines

```markdown
BEFORE reducing access:
1. Email user 7 days in advance:
   "We're reducing your [system] access from [Admin] to [Member] as part
   of our quarterly access review. This aligns with least privilege.
   If you need this access, reply with business justification."

2. If no response in 7 days, proceed with reduction
3. If user responds with valid justification, document and keep access
4. If user responds without valid justification, escalate to manager

AFTER reducing access:
1. Monitor for access requests (are they trying to do their job?)
2. If user requests access back, evaluate:
   - Is the request legitimate?
   - Can we grant temporary access instead?
   - Can we grant read-only instead of write?
3. Document decision in access review log
```

## SOC 2 Audit Evidence

For SOC 2 auditor, provide:

### Access Review Evidence Package (per quarter)
```markdown
1. Access Review Schedule
   - Shows reviews conducted quarterly (Q1, Q2, Q3, Q4)

2. Access Review Reports (4 per year)
   - Vanta-generated report for each quarter
   - Shows all users reviewed, all systems covered

3. Manager Attestations
   - Email confirmations from each manager
   - Signed statements certifying review completion

4. Change Logs (4 per year)
   - Detailed list of access changes made
   - Rationale for each change
   - Approver for each change

5. Anomaly Response
   - For each flagged user/permission:
     - What was the issue?
     - How was it resolved?
     - Approval for resolution

6. Offboarding Records
   - For each departed employee:
     - Offboarding checklist (completed)
     - Access revocation confirmation
     - Data transfer documentation

7. Metrics
   - Admin count over time (trending down = good)
   - Access requests (approved vs denied)
   - Offboarding SLA (100% within 24 hours)
```

## Success Metrics

### Week 3 Goals
- [✅] Access review schedule documented
- [✅] Automated workflow configured (Vanta)
- [✅] Offboarding checklist created
- [✅] Anomaly detection rules defined
- [✅] Manager email templates created

### Quarterly Metrics
- **Review Completion:** 100% on time (all 4 quarters)
- **Manager Participation:** 100% response rate
- **Admin Reduction:** Trending down (5 → 3 → 2)
- **Offboarding SLA:** 100% within 24 hours
- **Anomaly Resolution:** 100% within 14 days

### Annual Metrics
- **Access Violations:** 0 (unauthorized access events)
- **Privileged Accounts:** <10% of total users
- **Inactive Accounts:** 0 (all removed >90 days)
- **Contractor Compliance:** 100% (all expired contracts revoked)

**Valuation Impact:** +$50k-100k (demonstrates access governance and least privilege)

---

*Next: Create incident response runbook with step-by-step procedures*
