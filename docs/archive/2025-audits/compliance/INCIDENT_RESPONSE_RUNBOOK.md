# Incident Response Runbook

## Overview

This runbook provides step-by-step procedures for responding to security incidents. Follow these procedures exactly to minimize damage, preserve evidence, and maintain SOC 2 compliance.

**Incident Response Team:**
- **Incident Commander:** Security Officer (Jayden Metz)
- **Technical Lead:** CTO / Engineering Lead
- **Communications Lead:** CEO
- **Legal Counsel:** (Engage if data breach)

**Response Times:**
- **P1 (Critical):** 15 minutes
- **P2 (High):** 1 hour
- **P3 (Medium):** 4 hours
- **P4 (Low):** 24 hours

## Incident Severity Classification

### P1 - Critical (Active Data Breach / System-Wide Outage)

**Examples:**
- Active data breach in progress
- Unauthorized access to production database
- Ransomware infection
- Complete system outage (>50% of users affected)
- Customer PII exposed publicly

**Response Time:** 15 minutes
**Escalation:** CEO, all hands on deck
**Notification:** Customers (if PII exposed), regulators (if GDPR/CCPA)

### P2 - High (Suspected Breach / Major Vulnerability)

**Examples:**
- Suspected unauthorized access (investigating)
- Malware infection (contained)
- Major vulnerability discovered (exploitable)
- Partial system outage (10-50% users affected)
- Failed intrusion attempt (logged)

**Response Time:** 1 hour
**Escalation:** Security Team, Engineering Lead
**Notification:** Internal team only

### P3 - Medium (Policy Violation / Minor Vulnerability)

**Examples:**
- Phishing attempt (reported, no click)
- Policy violation (employee sent PII via unencrypted email)
- Minor vulnerability (low exploitability)
- Suspicious login (MFA prevented)

**Response Time:** 4 hours
**Escalation:** Security Team
**Notification:** Manager of involved employee

### P4 - Low (Security Question / Access Request)

**Examples:**
- Password reset request
- Security best practice question
- Access review anomaly
- Routine security scan finding

**Response Time:** 24 hours
**Escalation:** IT Support
**Notification:** Requestor only

## Incident Response Process (5 Phases)

### Phase 1: DETECTION & TRIAGE (First 15 minutes)

**Step 1: Receive Alert**
```bash
# Alerts come from:
- Security Event Logging (automated)
- Employee report ([email protected])
- Sentry error spike
- Vanta compliance alert
- Customer complaint
```

**Step 2: Initial Assessment**
```markdown
QUESTIONS TO ANSWER (5 minutes):
1. What happened? (1 sentence description)
   Example: "User reported suspicious login attempt from China"

2. When did it happen? (exact time)
   Example: "October 1, 2025 14:23 UTC"

3. What systems are affected?
   Example: "Production database, user authentication"

4. Is the threat active or contained?
   Example: "Active - attacker may still have access"

5. What is the business impact?
   Example: "Customer PII may be exposed"
```

**Step 3: Assign Severity**
```bash
# Use decision tree:

Is customer PII exposed or at risk?
├─ YES → P1 (Critical)
└─ NO → Continue

Is there active unauthorized access?
├─ YES → P1 (Critical)
└─ NO → Continue

Is there suspected breach or major vulnerability?
├─ YES → P2 (High)
└─ NO → Continue

Is there a policy violation or minor issue?
├─ YES → P3 (Medium)
└─ NO → P4 (Low)
```

**Step 4: Notify Incident Response Team**

**For P1 (Critical):**
```
PHONE: Call Incident Commander immediately
TEXT: "P1 incident - [1 sentence description] - Assemble war room now"
SLACK: @channel in #security-incidents
EMAIL: [email protected] with subject "P1 INCIDENT"
```

**For P2 (High):**
```
SLACK: @security-team in #security-incidents
EMAIL: [email protected] with subject "P2 INCIDENT"
```

**For P3/P4:**
```
SLACK: Post in #security-incidents (no @mention)
EMAIL: [email protected]
```

### Phase 2: CONTAINMENT (First 1 hour)

**Objective:** Stop the bleeding, prevent further damage

**Step 1: Isolate Affected Systems**

```bash
# For database breach:
1. Revoke all database access tokens immediately
2. Change database password
3. Enable IP whitelist (block all except known IPs)
4. Take database snapshot (preserve evidence)
5. Rotate all API keys
6. Force logout all users (invalidate all sessions)

# For compromised user account:
1. Suspend Google Workspace account immediately
2. Revoke all active sessions
3. Revoke all API keys for that user
4. Reset password (user cannot access)
5. Remove from all systems (GitHub, Railway, etc.)

# For malware infection:
1. Disconnect infected device from network immediately
2. Do NOT turn off device (preserves memory for forensics)
3. Notify all users to not open any files from affected user
4. Scan all connected devices
5. Change all passwords accessed from infected device

# For ransomware:
1. Isolate infected systems (disconnect from network)
2. Do NOT pay ransom (FBI recommendation)
3. Activate backup restore procedure
4. Identify patient zero (first infected system)
5. Wipe and rebuild all affected systems
```

**Step 2: Preserve Evidence**

```markdown
DO NOT DELETE ANYTHING!

PRESERVE:
- [ ] System logs (download immediately, may be auto-deleted)
- [ ] Database query logs (past 7 days)
- [ ] Access logs (who accessed what, when)
- [ ] Network traffic logs (firewall, load balancer)
- [ ] Application logs (Sentry, CloudWatch)
- [ ] Email communications (related to incident)
- [ ] Screenshots (error messages, anomalies)
- [ ] Memory dumps (from infected devices)

STORAGE:
- Create incident folder: incidents/2025-10-01-incident-001/
- Store all evidence there (write-once, read-many)
- Encrypt evidence folder (AES-256)
- Backup to offline storage (USB drive, separate cloud)
- Document chain of custody (who accessed evidence, when)
```

**Step 3: Assess Damage**

```markdown
DAMAGE ASSESSMENT CHECKLIST:

DATA EXPOSURE:
- [ ] What data was accessed? (specific tables, files)
- [ ] How many records were affected? (exact count)
- [ ] What PII was exposed? (names, emails, SSNs, etc.)
- [ ] Was financial data exposed? (credit cards, bank info)
- [ ] Was health data exposed? (HIPAA violation)

SYSTEM COMPROMISE:
- [ ] What systems were compromised? (list all)
- [ ] Do attackers still have access? (ongoing threat)
- [ ] Were backups affected? (can we restore?)
- [ ] Was code modified? (backdoor implanted)

BUSINESS IMPACT:
- [ ] How many customers affected?
- [ ] What is downtime cost? ($X per hour)
- [ ] What is reputational damage? (media coverage)
- [ ] What are legal liabilities? (GDPR fines, lawsuits)
```

### Phase 3: ERADICATION (Hours 2-24)

**Objective:** Remove the threat completely

**Step 1: Root Cause Analysis**

```markdown
INVESTIGATE:
1. How did the attacker get in? (initial access vector)
   - Phishing email?
   - Vulnerability exploit?
   - Stolen credentials?
   - Insider threat?

2. What did they do? (attack timeline)
   - First access: [timestamp]
   - Privilege escalation: [timestamp]
   - Data exfiltration: [timestamp]
   - Lateral movement: [systems accessed]

3. How did they maintain access? (persistence mechanism)
   - Backdoor user account?
   - Malware implant?
   - Stolen API keys?
   - Modified code?

4. What else are they after? (attacker objectives)
   - Data theft?
   - Ransomware?
   - Crypto mining?
   - Competitive espionage?
```

**Step 2: Remove Threat**

```bash
# For credential theft:
1. Rotate ALL passwords (force reset)
2. Revoke ALL API keys and generate new ones
3. Invalidate ALL active sessions
4. Enable MFA for ALL users (if not already)
5. Implement IP whitelist (temporary)
6. Review all account creations in past 30 days (backdoor accounts?)

# For vulnerability exploit:
1. Identify vulnerable code/component
2. Apply patch immediately (emergency deploy)
3. Scan for other instances of same vulnerability
4. Review all code changes in past 30 days (backdoor code?)
5. Conduct security code review

# For malware:
1. Wipe all infected devices (full reformat)
2. Rebuild from clean OS image
3. Restore data from pre-infection backup
4. Install endpoint protection (Crowdstrike, SentinelOne)
5. Scan all connected devices
```

**Step 3: Verify Eradication**

```markdown
VERIFICATION CHECKLIST:
- [ ] Run vulnerability scan (no critical findings)
- [ ] Review all user accounts (no unauthorized accounts)
- [ ] Review all API keys (all rotated, none unauthorized)
- [ ] Review all code changes (no backdoors)
- [ ] Monitor logs for 48 hours (no anomalies)
- [ ] Conduct penetration test (external)
```

### Phase 4: RECOVERY (Days 2-7)

**Objective:** Return to normal operations safely

**Step 1: Restore Services**

```bash
# Phased restore (don't rush!):

Phase 1: Internal testing (Day 2-3)
- Restore services in staging environment
- Test all functionality
- Verify no attacker persistence
- Run security scans

Phase 2: Limited production (Day 4-5)
- Restore to 10% of users (beta group)
- Monitor logs closely (24/7)
- Be ready to shut down again if issues

Phase 3: Full production (Day 6-7)
- Restore to all users
- Maintain elevated monitoring (30 days)
- Communicate with customers (transparency)
```

**Step 2: Strengthen Defenses**

```markdown
IMMEDIATE IMPROVEMENTS:
- [ ] Enable MFA for all users (mandatory)
- [ ] Implement IP whitelist (production database)
- [ ] Add rate limiting (prevent brute force)
- [ ] Enhance logging (capture more detail)
- [ ] Deploy WAF (Web Application Firewall)
- [ ] Implement SIEM (Security Information & Event Management)

WITHIN 30 DAYS:
- [ ] Conduct security training (lessons learned)
- [ ] Update incident response plan
- [ ] Conduct tabletop exercise (simulate incident)
- [ ] Implement additional monitoring
- [ ] Review and update all security policies
```

**Step 3: Customer Communication**

**If PII was exposed (GDPR/CCPA requirement):**

```markdown
NOTIFICATION TIMELINE:
- Within 72 hours of discovery: Notify regulators (GDPR)
- Within 72 hours: Notify affected customers
- Within 30 days: Provide detailed incident report

EMAIL TO CUSTOMERS:
---
Subject: Important Security Notice - Action Required

Dear [Customer Name],

We are writing to inform you of a security incident that may have affected
your personal information.

WHAT HAPPENED:
On [Date], we discovered unauthorized access to our system. We immediately
contained the incident and launched an investigation.

WHAT INFORMATION WAS INVOLVED:
The following information may have been accessed:
- Names and email addresses
- [Other specific data]

WHAT WE ARE DOING:
- We have secured our systems and removed the threat
- We are working with cybersecurity experts and law enforcement
- We have implemented additional security measures

WHAT YOU SHOULD DO:
1. Change your password immediately: [link]
2. Enable two-factor authentication: [link]
3. Monitor your accounts for suspicious activity
4. Consider credit monitoring (we will provide 1 year free)

We sincerely apologize for this incident and any inconvenience it may cause.
Your security is our top priority.

For questions: [email protected]

Sincerely,
[CEO Name]
---
```

### Phase 5: LESSONS LEARNED (Within 7 days)

**Step 1: Post-Incident Review Meeting**

**Attendees:** Full incident response team + affected employees

**Agenda (2 hours):**
```markdown
1. Timeline Review (30 min)
   - Walk through incident timeline
   - Identify key decision points
   - Note what worked, what didn't

2. Root Cause Analysis (30 min)
   - How did this happen? (technical)
   - Why did this happen? (process)
   - Could we have prevented it? (controls)

3. Response Effectiveness (30 min)
   - What went well?
   - What went poorly?
   - What should we do differently?

4. Action Items (30 min)
   - Technical improvements (specific)
   - Process improvements (specific)
   - Training needs (specific)
   - Assign owners and deadlines
```

**Step 2: Incident Report**

```markdown
# INCIDENT REPORT - [Incident ID]

## Executive Summary
[2-3 paragraphs: what happened, impact, resolution]

## Incident Details
- **Incident ID:** INC-2025-001
- **Severity:** P1 (Critical)
- **Detection Time:** October 1, 2025 14:23 UTC
- **Containment Time:** October 1, 2025 15:45 UTC
- **Resolution Time:** October 3, 2025 10:00 UTC
- **Total Duration:** 43 hours 37 minutes

## Timeline
| Time | Event | Action Taken |
|------|-------|--------------|
| 14:23 | Suspicious login detected | Alert sent to security team |
| 14:25 | Investigation started | Reviewed access logs |
| 14:35 | Unauthorized access confirmed | Escalated to P1, assembled team |
| 14:40 | Containment began | Revoked all database tokens |
| 15:45 | Threat contained | Attacker access revoked |
| ... | ... | ... |

## Root Cause
[Detailed technical explanation of how the incident occurred]

## Impact
- **Customers Affected:** 1,247
- **Data Exposed:** Names, email addresses (no financial data)
- **Systems Compromised:** Production database (read-only access)
- **Downtime:** 2 hours (during remediation)
- **Financial Impact:** $X,XXX (estimated)

## Response Effectiveness
**What Worked:**
- Fast detection (automated alert)
- Clear escalation process
- Good communication
- Evidence preservation

**What Didn't Work:**
- Slow initial containment (15 min delay)
- Unclear decision authority
- Incomplete logs (missed attacker entry)

## Remediation Actions
**Immediate (Completed):**
- ✅ Rotated all credentials
- ✅ Enabled MFA for all users
- ✅ Implemented IP whitelist
- ✅ Deployed enhanced logging

**Short-term (30 days):**
- [ ] Deploy WAF (Cloudflare)
- [ ] Implement SIEM (Splunk)
- [ ] Conduct pentest
- [ ] Update IR plan

**Long-term (90 days):**
- [ ] Achieve SOC 2 certification
- [ ] Build security ops team
- [ ] Implement zero-trust architecture

## Lessons Learned
1. **Lesson:** MFA should have been mandatory from day 1
   **Action:** Now mandatory for all users

2. **Lesson:** Database access logs were insufficient
   **Action:** Implemented detailed query logging

3. **Lesson:** Incident response plan was unclear
   **Action:** Updated runbook, conducted drill

## Regulatory Notifications
- **GDPR:** Notified ICO (UK) on October 2, 2025
- **CCPA:** Notified CA AG on October 2, 2025
- **Customers:** Notified all 1,247 affected on October 2, 2025

## Approval
- **Incident Commander:** [Signature] [Date]
- **CEO:** [Signature] [Date]
- **Legal Counsel:** [Signature] [Date]
```

**Step 3: Update Incident Response Plan**

```markdown
UPDATES BASED ON LESSONS LEARNED:

1. Update containment procedures (add database-specific steps)
2. Clarify decision authority (who can shut down production?)
3. Add communication templates (customer notification)
4. Enhance logging requirements (capture X, Y, Z)
5. Update contact list (add legal counsel)
6. Schedule quarterly tabletop exercises
```

## Incident Communication

### Internal Communication (During Incident)

**Slack Channels:**
- **#security-incidents** - Incident response team only
- **#incident-updates** - All-company status updates
- **#engineering** - Technical coordination

**Status Update Template (Every 30 minutes during P1):**
```
INCIDENT STATUS UPDATE - [Time]

CURRENT STATUS: [Investigating / Contained / Resolved]

WHAT WE KNOW:
- [Bullet point summary]

WHAT WE'RE DOING:
- [Current actions]

NEXT STEPS:
- [Planned actions]

IMPACT:
- Customers: [affected count]
- Systems: [affected systems]
- Downtime: [duration]

NEXT UPDATE: [Time] (30 minutes)
```

### External Communication

**Social Media / Status Page:**
```
[2025-10-01 14:45] We are investigating reports of service issues.
Our team is working to resolve this as quickly as possible. We will
provide updates every 30 minutes.

[2025-10-01 15:15] We have identified the issue and are implementing
a fix. Service should be restored within 1 hour. We apologize for
the inconvenience.

[2025-10-01 16:00] The issue has been resolved and all services are
restored. We will be conducting a full post-mortem and will share
details soon. Thank you for your patience.
```

## Tabletop Exercise (Quarterly)

**Schedule:** Q1, Q2, Q3, Q4 (2 hours each)

**Scenario 1: Database Breach (Q1)**
```
SCENARIO:
You receive an alert at 2pm on a Friday that an unauthorized user
has been accessing the production database for the past 3 hours.
1,500 customer records (names, emails, addresses) have been exfiltrated.

EXERCISE:
- Walk through detection, triage, containment
- Who do you notify? When?
- What systems do you shut down?
- How do you notify customers?
- What are the regulatory requirements?

DURATION: 90 minutes
DEBRIEF: 30 minutes
```

**Scenario 2: Ransomware (Q2)**
**Scenario 3: Insider Threat (Q3)**
**Scenario 4: DDoS Attack (Q4)**

## SOC 2 Audit Evidence

For SOC 2 auditor, provide:

```markdown
1. Incident Response Plan (this document)
2. Incident Log (all incidents, any severity)
3. Incident Reports (for P1, P2 incidents)
4. Post-Incident Review Notes
5. Tabletop Exercise Records (4 per year)
6. Communication Records (internal & external)
7. Regulatory Notifications (if applicable)
8. Remediation Tracking (actions taken)
```

## Success Metrics

### Week 3 Goals
- [✅] Incident response runbook complete
- [✅] Communication templates created
- [✅] Severity classification defined
- [✅] 5-phase process documented
- [✅] Tabletop exercise scenarios prepared

### Ongoing Metrics
- **Incident Response Time:** <15 min for P1, <1 hour for P2
- **Containment Time:** <1 hour for P1, <4 hours for P2
- **Customer Notification:** <72 hours (GDPR requirement)
- **Tabletop Exercises:** 4 per year (100% completion)
- **Plan Updates:** After every P1/P2 incident

**Valuation Impact:** +$100k-200k (demonstrates incident preparedness and mature security operations)

---

*Next: Set up automated security monitoring and alerting*
