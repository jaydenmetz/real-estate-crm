# Security Awareness Training Program

## Overview

All employees must complete annual security training to maintain SOC 2 compliance. This program ensures team members understand:
- Security best practices
- Data privacy requirements (GDPR, CCPA)
- Incident reporting procedures
- Social engineering awareness

**Frequency:** Annual (12-month intervals)
**Method:** Online training via Vanta or KnowBe4
**Passing Score:** 80% minimum
**Completion Tracking:** Automated via Vanta

## Training Curriculum

### Module 1: Information Security Basics (30 minutes)

**Learning Objectives:**
- Understand the CIA triad (Confidentiality, Integrity, Availability)
- Recognize the importance of data protection
- Identify common security threats

**Topics Covered:**
1. What is Information Security?
   - Protecting customer data
   - Business impact of security incidents
   - Regulatory requirements (GDPR, CCPA, SOC 2)

2. Password Security
   - Strong password requirements (12+ characters, symbols, no dictionary words)
   - Password manager usage (1Password, Bitwarden, LastPass)
   - Never reuse passwords across sites
   - MFA/2FA enforcement

3. Device Security
   - Encrypt all devices (FileVault on Mac, BitLocker on Windows)
   - Auto-lock after 5 minutes of inactivity
   - Keep software updated (OS, browsers, applications)
   - Install only approved software

4. Physical Security
   - Lock screens when leaving desk (Cmd+Ctrl+Q on Mac, Win+L on Windows)
   - Never leave devices unattended in public
   - Shred sensitive documents
   - Secure home office (if remote)

**Quiz Questions:**
1. What is the minimum password length? *Answer: 12 characters*
2. What does MFA stand for? *Answer: Multi-Factor Authentication*
3. Should you use the same password for work and personal accounts? *Answer: No*
4. How often should you update your OS? *Answer: As soon as updates are available*

### Module 2: Phishing & Social Engineering (30 minutes)

**Learning Objectives:**
- Identify phishing emails and texts
- Recognize social engineering tactics
- Know how to report suspicious activity

**Topics Covered:**
1. What is Phishing?
   - Fake emails pretending to be from trusted sources
   - Goal: Steal credentials or install malware
   - Consequences: Data breach, ransomware, financial loss

2. Phishing Red Flags
   - ❌ Urgent language ("Act now!" "Your account will be suspended")
   - ❌ Suspicious sender address (jay[email protected] vs [email protected])
   - ❌ Generic greetings ("Dear user" instead of your name)
   - ❌ Unexpected attachments or links
   - ❌ Requests for passwords or sensitive info
   - ❌ Spelling/grammar errors

3. Real Examples (Interactive)
   - Show 10 emails, identify which are phishing (7 phishing, 3 legitimate)
   - Hover over links to see real destination (without clicking)
   - Check sender domain carefully

4. What to Do if You Click a Phishing Link
   - **Immediately:** Disconnect from WiFi
   - **Within 5 minutes:** Report to [email protected]
   - **Within 15 minutes:** Change your password from a different device
   - **Within 1 hour:** Security team will scan your device for malware

5. Social Engineering Tactics
   - Pretexting (creating fake scenario to gain trust)
   - Baiting (leaving infected USB drives)
   - Tailgating (following employee into secure area)
   - Quid pro quo ("I'm from IT, give me your password to fix your computer")

**Quiz Questions:**
1. What should you do if you receive an email asking for your password? *Answer: Report it as phishing, never provide password*
2. How can you verify a link's destination without clicking it? *Answer: Hover over the link*
3. What is the first thing you should do if you click a phishing link? *Answer: Disconnect from network*
4. Is it safe to open an unexpected attachment from a coworker? *Answer: No, verify with them first via different channel (call/text)*

### Module 3: Data Privacy & Compliance (30 minutes)

**Learning Objectives:**
- Understand GDPR and CCPA requirements
- Know how to handle customer data requests
- Classify data properly (Public, Internal, Confidential, Restricted)

**Topics Covered:**
1. What is PII (Personally Identifiable Information)?
   - Names, email addresses, phone numbers
   - Social Security numbers, driver's license numbers
   - Financial information, health records
   - IP addresses, device IDs, location data

2. GDPR (General Data Protection Regulation)
   - Applies to: EU residents' data (even if company is US-based)
   - Key principle: Minimize data collection ("only collect what you need")
   - Data subject rights:
     - Right to access (export their data)
     - Right to deletion ("right to be forgotten")
     - Right to rectification (correct inaccurate data)
     - Right to data portability (transfer data to competitor)

3. CCPA (California Consumer Privacy Act)
   - Applies to: California residents' data
   - Similar rights to GDPR
   - Must provide "Do Not Sell My Information" option
   - Must disclose data collection practices

4. Data Classification
   - **Public:** Can be shared with anyone (marketing materials)
   - **Internal:** For employees only (company policies)
   - **Confidential:** Requires NDA (customer contracts, financials)
   - **Restricted:** Highly sensitive (customer PII, passwords, source code)

5. Handling Data Subject Requests
   - **Access Request:** Provide all data within 30 days
   - **Deletion Request:** Delete within 30 days (may retain for legal compliance)
   - **Rectification Request:** Correct inaccurate data within 30 days
   - **Process:** Forward all requests to [email protected] immediately

6. Data Retention
   - Customer data: 7 years (legal requirement for transactions)
   - Leads: 2 years (marketing data)
   - Logs: 1 year (security monitoring)
   - Employee records: 7 years after termination

**Quiz Questions:**
1. What does GDPR stand for? *Answer: General Data Protection Regulation*
2. How long do you have to respond to a data access request? *Answer: 30 days*
3. What should you do if a customer asks to delete their data? *Answer: Forward to privacy@company.com*
4. Which data classification requires the highest level of protection? *Answer: Restricted*

### Module 4: Incident Response (20 minutes)

**Learning Objectives:**
- Recognize a security incident
- Know the incident reporting process
- Understand your role in incident response

**Topics Covered:**
1. What is a Security Incident?
   - Unauthorized access to systems or data
   - Data breach or leak
   - Malware infection
   - Lost/stolen device
   - Suspected phishing attempt
   - Unusual system behavior

2. Incident Severity Levels
   - **P1 (Critical):** Active data breach, system-wide outage
     - Response time: 15 minutes
     - Notify: CEO, Security Team, all hands on deck

   - **P2 (High):** Suspected breach, malware infection, major vulnerability
     - Response time: 1 hour
     - Notify: Security Team, Engineering Lead

   - **P3 (Medium):** Phishing attempt, policy violation, minor vulnerability
     - Response time: 4 hours
     - Notify: Security Team

   - **P4 (Low):** Security question, password reset, access request
     - Response time: 24 hours
     - Notify: IT Support

3. Incident Reporting Process
   ```
   Step 1: STOP
   - Don't touch anything (preserve evidence)
   - Disconnect affected device from network (if malware suspected)

   Step 2: NOTIFY
   - Email: [email protected]
   - Slack: #security-incidents channel
   - Phone: (555) 123-4567 (for P1 only)

   Step 3: DOCUMENT
   - What happened? (timeline of events)
   - When did you notice? (exact time)
   - What systems are affected?
   - What actions have you taken?

   Step 4: COOPERATE
   - Security team will lead investigation
   - Provide access to affected systems
   - Answer all questions honestly
   - Don't delete anything
   ```

4. Post-Incident Actions
   - Lessons learned meeting (within 7 days)
   - Update security procedures if needed
   - Additional training if policy violated
   - No blame culture (report without fear)

**Quiz Questions:**
1. What is the response time for a P1 critical incident? *Answer: 15 minutes*
2. What should you do first if you suspect malware? *Answer: Disconnect from network*
3. Where do you report security incidents? *Answer: [email protected]*
4. Should you delete suspicious files before reporting? *Answer: No, preserve evidence*

### Module 5: Secure Development Practices (30 minutes)
*For Engineering Team Only*

**Learning Objectives:**
- Write secure code
- Avoid common vulnerabilities
- Implement security controls

**Topics Covered:**
1. OWASP Top 10 Vulnerabilities
   - Injection (SQL, NoSQL, OS command)
   - Broken Authentication
   - Sensitive Data Exposure
   - XML External Entities (XXE)
   - Broken Access Control
   - Security Misconfiguration
   - Cross-Site Scripting (XSS)
   - Insecure Deserialization
   - Using Components with Known Vulnerabilities
   - Insufficient Logging & Monitoring

2. Secure Coding Checklist
   - ✅ Validate all user input (never trust client-side validation)
   - ✅ Use parameterized queries (prevent SQL injection)
   - ✅ Implement proper authentication (JWT with short expiry)
   - ✅ Enforce authorization on every endpoint
   - ✅ Hash passwords with bcrypt (cost factor 12+)
   - ✅ Use HTTPS everywhere (TLS 1.3)
   - ✅ Sanitize output (prevent XSS)
   - ✅ Keep dependencies updated (npm audit, Snyk)
   - ✅ Log security events (authentication, authorization failures)
   - ✅ Never commit secrets (use environment variables)

3. Code Review Checklist
   - [ ] No hardcoded passwords/API keys
   - [ ] All inputs validated and sanitized
   - [ ] SQL queries use parameterized statements
   - [ ] Authorization checks on all endpoints
   - [ ] Error messages don't leak sensitive info
   - [ ] Sensitive data encrypted at rest
   - [ ] Dependencies have no known CVEs

4. Secret Management
   - Use environment variables (not config files)
   - Rotate secrets quarterly
   - Never log secrets (even in development)
   - Use secret managers (AWS Secrets Manager, HashiCorp Vault)
   - Revoke secrets immediately if exposed

**Quiz Questions:**
1. What is the minimum bcrypt cost factor? *Answer: 12*
2. How should you prevent SQL injection? *Answer: Use parameterized queries*
3. Where should API keys be stored? *Answer: Environment variables, never in code*
4. What should you do if you accidentally commit a secret to GitHub? *Answer: Rotate the secret immediately, don't just delete the commit*

## Training Delivery

### New Hire Training (Day 1)
**Before access to any systems:**
- [ ] Complete Modules 1-4 (2 hours total)
- [ ] Pass quiz with 80%+ score
- [ ] Acknowledge Information Security Policy
- [ ] Acknowledge Acceptable Use Policy
- [ ] Set up password manager
- [ ] Enable MFA on all accounts

**Engineering hires also complete:**
- [ ] Module 5: Secure Development Practices (30 minutes)
- [ ] Code review security checklist walkthrough

### Annual Refresher Training (All Employees)
**Every 12 months:**
- [ ] Review Modules 1-4 (condensed, 1 hour total)
- [ ] Complete new phishing quiz (10 real examples)
- [ ] Pass final quiz with 80%+ score
- [ ] Re-acknowledge all security policies

### Phishing Simulation (Quarterly)
**Every Q1, Q2, Q3, Q4:**
- Send fake phishing emails to all employees
- Track who clicks links or provides credentials
- Immediate remedial training for those who fail
- Recognition for those who report correctly

**Example Simulations:**
- Fake password reset from "IT Support"
- Fake invoice from "CEO"
- Fake package delivery notification
- Fake LinkedIn connection with malware

## Training Platform Options

### Option 1: Vanta Training (Included)
- **Cost:** Included in Vanta subscription
- **Content:** Pre-built SOC 2 training modules
- **Tracking:** Automatic completion tracking
- **Reporting:** Compliance reports for auditors
- **Pros:** Integrated with Vanta, audit-ready
- **Cons:** Limited customization

### Option 2: KnowBe4 (Advanced)
- **Cost:** $25/user/year (~$300/year for 12 users)
- **Content:** Extensive library + custom training
- **Phishing:** Automated phishing simulations
- **Reporting:** Detailed analytics, risk scores
- **Pros:** Best-in-class, comprehensive
- **Cons:** Additional cost

### Option 3: Custom Training (Internal)
- **Cost:** Development time only
- **Content:** Fully customized to your business
- **Platform:** Google Workspace (quizzes via Forms)
- **Tracking:** Manual via spreadsheet
- **Pros:** Tailored content, no recurring cost
- **Cons:** Time-intensive, no automation

**Recommendation:** Start with Vanta Training (included), upgrade to KnowBe4 when team reaches 25+ people.

## Tracking & Compliance

### Training Completion Dashboard
```
Employee Name    | Hire Date  | Last Training | Next Due    | Status
-----------------|------------|---------------|-------------|--------
Jayden Metz      | 2023-01-01 | 2024-09-15   | 2025-09-15  | ✅ Current
New Hire 1       | 2025-10-01 | Not Complete | 2025-10-01  | ⚠️ Overdue
New Hire 2       | 2025-09-15 | 2025-09-15   | 2026-09-15  | ✅ Current
```

### Automated Reminders
```bash
# Vanta automatically sends:

30 days before due: "Your annual security training is due in 30 days"
14 days before due: "Reminder: Security training due in 2 weeks"
7 days before due: "Action required: Security training due in 7 days"
On due date: "URGENT: Security training overdue"
Daily after due: "Your account may be suspended - complete training now"
```

### Compliance Reporting
```bash
# For SOC 2 audit, provide:

1. Training curriculum (this document)
2. Completion certificates for all employees
3. Quiz results showing 80%+ pass rate
4. Policy acknowledgment signatures
5. Phishing simulation results
6. Remedial training records
```

## Success Metrics

**Week 3 Goals:**
- [ ] Training curriculum finalized
- [ ] Training platform selected (Vanta)
- [ ] All current employees enrolled
- [ ] New hire training process documented

**Week 4 Goals:**
- [ ] All employees complete training (100%)
- [ ] First phishing simulation sent
- [ ] Phishing click rate <10% (industry average: 30%)
- [ ] 100% policy acknowledgment

**Annual Goals:**
- [ ] 100% employee training completion
- [ ] <5% phishing click rate (world-class)
- [ ] Zero security incidents due to human error
- [ ] All new hires trained on Day 1

**Valuation Impact:**
- Demonstrates security culture (key SOC 2 requirement)
- Reduces human error risk (80% of breaches involve human error)
- Shows buyer that team is security-aware
- Estimated value: +$50k-100k in acquisition price

---

*Next: Set up automated policy review reminders (quarterly)*
