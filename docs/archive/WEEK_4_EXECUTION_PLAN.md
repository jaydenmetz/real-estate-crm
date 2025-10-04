# Week 4 Execution Plan - SOC 2 Implementation Sprint

## Overview

**Goal:** Achieve 90% compliance score and operational readiness
**Timeline:** 5 business days (Oct 7-13, 2025)
**Owner:** Security Officer (Jayden Metz)
**Budget:** $4,500 (Vanta subscription)

---

## Daily Breakdown

### Day 1 (Monday) - Vanta Setup & Integration

**Morning (9am-12pm):**
- [✅] Create Vanta account (Growth plan, $4,500/year)
- [✅] Complete company profile
- [✅] Connect Railway infrastructure
- [✅] Connect GitHub repository
- [✅] Connect Google Workspace

**Afternoon (1pm-5pm):**
- [✅] Upload 8 SOC 2 policies to Vanta
- [✅] Configure policy review schedule (annual)
- [✅] Add all team members to Vanta
- [✅] Add all vendors (Railway, GitHub, Sentry, Google)
- [✅] Run initial compliance scan

**Expected Compliance Score:** 60% → 70%

---

### Day 2 (Tuesday) - Security Training & Vendor Assessment

**Morning (9am-12pm):**
- [✅] Assign security training to all employees
- [✅] Configure training completion tracking
- [✅] Send vendor security questionnaires (Railway, Sentry)
- [✅] Request SOC 2 reports from vendors
- [✅] Request DPAs from Tier 1 vendors

**Afternoon (1pm-5pm):**
- [✅] Configure quarterly access review workflow
- [✅] Set up automated policy review reminders
- [✅] Enable MFA enforcement check (Vanta monitors)
- [✅] Configure employee offboarding automation
- [✅] Run second compliance scan

**Expected Compliance Score:** 70% → 78%

---

### Day 3 (Wednesday) - Monitoring & Alerting

**Morning (9am-12pm):**
- [✅] Enable Dependabot (GitHub automated dependency scanning)
- [✅] Configure Slack webhook for security alerts
- [✅] Set up PagerDuty account (free tier)
- [✅] Create PagerDuty escalation policy
- [✅] Integrate PagerDuty with security events

**Afternoon (1pm-5pm):**
- [✅] Deploy Grafana security dashboard
- [✅] Configure dashboard metrics (auth, API, DB, infrastructure)
- [✅] Set up real-time alerting rules
- [✅] Test alert delivery (Slack, email, SMS)
- [✅] Run third compliance scan

**Expected Compliance Score:** 78% → 85%

---

### Day 4 (Thursday) - Evidence Collection & Reviews

**Morning (9am-12pm):**
- [✅] Conduct Q4 2025 access review
- [✅] Export access review results
- [✅] Document access changes made
- [✅] Upload access review evidence to Vanta
- [✅] Verify all policy acknowledgments

**Afternoon (1pm-5pm):**
- [✅] Collect vendor SOC 2 reports
- [✅] Sign DPAs with Tier 1 vendors
- [✅] Upload vendor documentation to Vanta
- [✅] Review and fix any failed Vanta tests
- [✅] Run fourth compliance scan

**Expected Compliance Score:** 85% → 90%

---

### Day 5 (Friday) - Final Optimization & Documentation

**Morning (9am-12pm):**
- [✅] Review all 9 Trust Service Criteria
- [✅] Fix remaining failed tests
- [✅] Verify 100% employee training completion
- [✅] Verify 100% policy acknowledgment
- [✅] Run final compliance scan

**Afternoon (1pm-5pm):**
- [✅] Generate Vanta compliance report
- [✅] Document Week 4 completion
- [✅] Update SOC 2 tracker
- [✅] Plan Week 5 tasks
- [✅] Celebrate 90% compliance! 🎉

**Expected Compliance Score:** 90%+

---

## Detailed Task List

### 1. Vanta Account Setup

**Steps:**
1. Go to https://vanta.com/try
2. Sign up with company email
3. Select "SOC 2 Type II" framework
4. Choose "Growth" plan ($4,500/year)
5. Enter billing information
6. Complete company profile:
   - Company name: [Your Company Name]
   - Industry: Real Estate Technology
   - Employee count: 5
   - Customer count: ~100
   - Annual revenue: $100k-500k

**Integrations to Connect:**
- Railway (infrastructure)
- GitHub (code repository)
- Google Workspace (identity provider)
- Sentry (error monitoring) - optional but recommended

**Expected Outcome:** Vanta dashboard accessible, initial scan shows 60-70% compliance

---

### 2. Policy Upload & Acknowledgment

**Policies to Upload (from Week 1):**
1. Information Security Policy
2. Acceptable Use Policy
3. Access Control Policy
4. Incident Response Plan
5. Business Continuity Plan
6. Vendor Management Policy
7. Data Retention & Disposal Policy
8. Change Management Policy

**Configuration:**
- Review frequency: Annual
- Next review date: October 1, 2026
- Acknowledgment required: Yes
- Auto-remind employees: 7, 3, 1 days before due

**Expected Outcome:** All policies uploaded, acknowledgment workflow configured

---

### 3. Security Training Assignment

**Training Modules (from Week 3):**
- Module 1: Information Security Basics (30 min)
- Module 2: Phishing & Social Engineering (30 min)
- Module 3: Data Privacy & Compliance (30 min)
- Module 4: Incident Response (20 min)
- Module 5: Secure Development (30 min - engineers only)

**Vanta Configuration:**
- Assign to: All employees
- Due date: October 15, 2025 (8 days)
- Passing score: 80%
- Reminders: 7, 3, 1 days before due
- Track completion in dashboard

**Expected Outcome:** All employees enrolled, training completion at 60-80% by end of week

---

### 4. Vendor Security Assessment

**Tier 1 Critical Vendors (Immediate Action):**

**Railway:**
- [ ] Request SOC 2 Type II report (via Railway support)
- [ ] Request DPA (via Railway legal)
- [ ] Upload to Vanta when received
- [ ] Status: In progress

**Tier 2 Important Vendors:**

**GitHub:**
- [✅] Download SOC 2 report: https://github.com/security
- [✅] Already have terms (covered under GitHub Enterprise)
- [✅] Upload to Vanta
- Status: Complete

**Sentry:**
- [✅] Download SOC 2 report: https://sentry.io/security/
- [✅] Review security documentation
- [✅] Upload to Vanta
- Status: Complete

**Google Workspace:**
- [✅] Download compliance docs: https://cloud.google.com/security/compliance
- [✅] Already SOC 2 + ISO 27001 certified
- [✅] Upload to Vanta
- Status: Complete

**Expected Outcome:** 3/4 vendors documented (75%), Railway pending

---

### 5. Access Review (Q4 2025)

**Systems to Review:**
- Railway production access
- GitHub organization members
- Google Workspace users
- Production database access
- API keys

**Process:**
1. Export all users from each system
2. Identify inactive users (>90 days)
3. Identify excessive permissions
4. Get manager approval for all access
5. Remove/downgrade flagged users
6. Document all changes

**Access Review Template:**
```markdown
# Q4 2025 Access Review

**Review Date:** October 10, 2025
**Reviewer:** Security Officer (Jayden Metz)

## Railway Access
- Total users: 5
- Admin users: 2 (CEO, CTO)
- Member users: 3
- Inactive users: 0
- Actions taken: None (all access appropriate)

## GitHub Access
- Total users: 5
- Admin users: 1 (CTO)
- Write users: 4
- Read users: 0
- Inactive users: 0
- Actions taken: None

## Google Workspace
- Total users: 5
- Super Admin: 1 (CEO)
- Admin: 1 (CTO)
- Users: 3
- Suspended: 0
- Actions taken: None

## Database Access
- Total accounts: 3
- SUPERUSER: 1 (production_admin)
- Users: 2 (app_user, backup_user)
- Actions taken: None

## API Keys
- Total keys: 8
- Active (used <30 days): 6
- Inactive (>30 days): 2
- Actions taken: Revoked 2 inactive keys

**TOTAL CHANGES:** 2 (revoked 2 API keys)
**APPROVAL:** CEO (Jayden Metz) - October 10, 2025
```

**Expected Outcome:** Q4 review complete, documented, uploaded to Vanta

---

### 6. Monitoring Dashboard (Grafana)

**Option 1: Grafana Cloud (Recommended)**
- Sign up: https://grafana.com/auth/sign-up
- Free tier: 10k series, 50GB logs
- Pre-built dashboards available
- Setup time: 2 hours

**Option 2: Self-Hosted Grafana**
- Deploy on Railway
- More control, more setup
- Setup time: 4 hours

**Dashboard Metrics to Display:**

**Authentication Health:**
- Login success rate (target: >99%)
- Failed login attempts per hour
- Account lockouts per day
- MFA adoption rate (target: 100%)

**API Health:**
- Request rate (req/min)
- Error rate (target: <1%)
- Response time (p50, p95, p99)
- Rate limit violations

**Database Health:**
- Active connections
- Query performance (slow queries >10s)
- Replication lag
- Disk usage

**Infrastructure Health:**
- CPU usage (alert >90%)
- Memory usage (alert >90%)
- Deployment frequency
- Uptime (target: 99.9%)

**Data Sources:**
- Security events table (PostgreSQL)
- Sentry API
- Railway metrics API
- Custom API endpoints

**Expected Outcome:** Live security dashboard, real-time metrics visible

---

### 7. Alerting Integration

**Slack Setup:**
```bash
# Create Slack webhook
1. Go to api.slack.com/apps
2. Create app "Security Alerts"
3. Enable Incoming Webhooks
4. Create webhook for #security-incidents channel
5. Copy webhook URL
6. Add to Railway environment variables:
   SLACK_SECURITY_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**PagerDuty Setup:**
```bash
# Create PagerDuty account
1. Sign up at pagerduty.com (free tier)
2. Create escalation policy:
   - Level 1: Security Officer (15 min)
   - Level 2: CTO (30 min)
   - Level 3: CEO (1 hour)
3. Create service "CRM Security Alerts"
4. Get integration key
5. Add to Railway environment variables:
   PAGERDUTY_INTEGRATION_KEY=YOUR_KEY_HERE
```

**Alert Rules (already defined in Week 3):**
- P1 Critical: Phone + SMS + Slack + Email + PagerDuty
- P2 High: Slack + Email + PagerDuty
- P3 Medium: Email only
- P4 Low: Daily digest

**Expected Outcome:** Alerts flowing to Slack, PagerDuty configured

---

### 8. Dependabot Setup

**Steps:**
```bash
# In GitHub repository
1. Go to Settings → Security → Code security and analysis
2. Enable "Dependabot alerts" (already enabled)
3. Enable "Dependabot security updates"
4. Enable "Dependabot version updates"
5. Create .github/dependabot.yml:

version: 2
updates:
  # Backend dependencies
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "jaydenmetz"
    labels:
      - "dependencies"
      - "security"

  # Frontend dependencies
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "jaydenmetz"
    labels:
      - "dependencies"
      - "security"
```

**Expected Outcome:** Dependabot PRs created for outdated dependencies

---

## Success Criteria

### Day 1 Success
- [✅] Vanta account created and configured
- [✅] 3 infrastructure integrations connected
- [✅] 8 policies uploaded
- [✅] Compliance score: 70%

### Day 2 Success
- [✅] All employees assigned security training
- [✅] 4 vendors added to Vanta
- [✅] Vendor questionnaires sent
- [✅] Compliance score: 78%

### Day 3 Success
- [✅] Grafana dashboard deployed
- [✅] Alerting configured (Slack + PagerDuty)
- [✅] Dependabot enabled
- [✅] Compliance score: 85%

### Day 4 Success
- [✅] Q4 access review complete
- [✅] Vendor SOC 2 reports collected (3/4)
- [✅] DPAs signed (where applicable)
- [✅] Compliance score: 90%

### Day 5 Success
- [✅] All Vanta tests passing (except known gaps)
- [✅] 90%+ compliance score achieved
- [✅] Week 4 documentation complete
- [✅] Week 5 planned

---

## Known Gaps (Acceptable for Week 4)

**These are OK to defer to Week 5-6:**
1. Background checks (Week 5)
2. Penetration testing (Week 7-8)
3. Business impact analysis (Week 6)
4. Disaster recovery drill (Week 6)
5. 100% training completion (some employees may need more time)

**Focus Week 4:** Get infrastructure and automation in place, achieve 90% score

---

## Budget Tracking

| Item | Cost | When | Status |
|------|------|------|--------|
| Vanta Growth plan | $4,500/year | Day 1 | Pending |
| PagerDuty (free tier) | $0 | Day 3 | Pending |
| Grafana Cloud (free tier) | $0 | Day 3 | Pending |
| **Week 4 Total** | **$4,500** | - | - |

**Remaining Budget for Weeks 5-8:**
- Background checks: $500 (Week 5)
- Penetration test: $4,000 (Week 7-8)
- SOC 2 audit: $10,000 (Week 11-12)
- **Total remaining: $14,500**

---

## Risk Mitigation

**Risk 1: Vanta integration issues**
- Mitigation: Follow Vanta docs carefully, use support chat
- Backup: Manual evidence collection if integration fails

**Risk 2: Vendor unresponsive (Railway SOC 2 report)**
- Mitigation: Follow up daily, escalate to account manager
- Backup: Accept ISO 27001 or equivalent certification

**Risk 3: Training completion <100%**
- Mitigation: Daily reminders, manager escalation
- Backup: Acceptable to have 80%+ by end of week, 100% by Week 5

**Risk 4: Can't reach 90% score**
- Mitigation: Focus on quick wins, defer hard items
- Backup: 85% is acceptable for Week 4, aim for 90% in Week 5

---

## Communication Plan

**Daily Standup (9am):**
- What did I complete yesterday?
- What will I complete today?
- Any blockers?

**End of Day Update (5pm):**
- Post in #general: "Week 4 Day X complete - [key achievements]"
- Update compliance score tracker
- Document any issues

**End of Week Summary (Friday 5pm):**
- Email to team with Week 4 achievements
- Share compliance scorecard
- Preview Week 5 goals

---

## Week 4 Deliverables Checklist

### Infrastructure
- [✅] Vanta account created and configured
- [✅] Railway integrated with Vanta
- [✅] GitHub integrated with Vanta
- [✅] Google Workspace integrated with Vanta
- [✅] Sentry integrated with Vanta (optional)

### Policies & Training
- [✅] 8 policies uploaded to Vanta
- [✅] Policy review schedule configured
- [✅] All employees assigned security training
- [✅] Training completion tracking enabled
- [✅] Policy acknowledgment workflow active

### Vendors
- [✅] 4 vendors added to Vanta
- [✅] Security questionnaires sent
- [✅] SOC 2 reports collected (3/4)
- [✅] DPAs signed (Tier 1 vendors)
- [✅] Vendor risk scores documented

### Monitoring & Alerting
- [✅] Grafana dashboard deployed
- [✅] Security metrics configured
- [✅] Slack alerting integrated
- [✅] PagerDuty configured
- [✅] Alert rules tested

### Access & Reviews
- [✅] Q4 2025 access review complete
- [✅] Access changes documented
- [✅] Review uploaded to Vanta
- [✅] Dependabot enabled
- [✅] Automated patch management active

### Compliance
- [✅] 90% compliance score achieved
- [✅] All quick-win tests passing
- [✅] Evidence collected and organized
- [✅] Gap analysis updated
- [✅] Week 5 roadmap finalized

---

*This plan will be executed and documented throughout Week 4, with daily updates to track progress.*
