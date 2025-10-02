# Automated Vendor Security Assessment Workflow

## Overview

Every vendor that accesses customer data must undergo security assessment. This document provides:
1. Automated vendor risk scoring system
2. Security questionnaire templates
3. DPA (Data Processing Agreement) requirements
4. Continuous monitoring procedures

**Goal:** Ensure all vendors meet SOC 2 security standards before onboarding.

## Vendor Classification System

### Tier 1: Critical Vendors (High Risk)
**Criteria:** Direct access to production database, customer PII, or financial data

**Examples:**
- Railway (hosting infrastructure)
- Database providers (PostgreSQL)
- Payment processors (Stripe)
- Email service providers (SendGrid)

**Requirements:**
- ✅ SOC 2 Type II report (current, <12 months old)
- ✅ Signed DPA (Data Processing Agreement)
- ✅ Penetration test results (annual)
- ✅ Incident response plan documented
- ✅ 99.9%+ uptime SLA
- ✅ Encryption at rest and in transit (AES-256, TLS 1.3)
- ✅ GDPR/CCPA compliance attestation

### Tier 2: Important Vendors (Medium Risk)
**Criteria:** Access to non-PII business data or limited customer data

**Examples:**
- Analytics tools (Google Analytics)
- Error monitoring (Sentry)
- CDN providers (Cloudflare)
- CI/CD tools (GitHub Actions)

**Requirements:**
- ✅ ISO 27001 or SOC 2 Type I minimum
- ✅ Signed security addendum to contract
- ✅ Data encryption (TLS 1.2+ in transit)
- ✅ 99.5%+ uptime SLA
- ✅ Security incident notification (24-hour SLA)

### Tier 3: Standard Vendors (Low Risk)
**Criteria:** No access to customer data, internal tools only

**Examples:**
- Productivity tools (Slack, Notion)
- Design tools (Figma)
- Documentation (Confluence)

**Requirements:**
- ✅ ISO 27001 or equivalent certification
- ✅ SSO/SAML support (for user management)
- ✅ MFA enforcement
- ✅ Annual security review

## Vendor Onboarding Checklist

### Step 1: Risk Classification
```bash
# Use this decision tree:

Does vendor access production database?
├─ YES → Tier 1 (Critical)
└─ NO → Continue

Does vendor process customer PII?
├─ YES → Tier 1 (Critical)
└─ NO → Continue

Does vendor access business systems (code, analytics)?
├─ YES → Tier 2 (Important)
└─ NO → Tier 3 (Standard)
```

### Step 2: Security Questionnaire
Send this questionnaire to ALL vendors before onboarding:

**Vendor Security Questionnaire Template:**

```markdown
# Vendor Security Assessment - [Vendor Name]

**Date:** [Today's Date]
**Assessed By:** [Your Name]
**Vendor Contact:** [Vendor Email]

## 1. Certifications & Compliance

□ Do you have SOC 2 Type II certification?
  - If yes, provide report (current within 12 months)
  - If no, provide ISO 27001 or equivalent

□ Are you GDPR compliant?
  - Provide DPA (Data Processing Agreement)

□ Are you CCPA compliant?
  - Provide privacy policy link

□ Do you undergo annual penetration testing?
  - Provide summary of findings (redacted if needed)

## 2. Data Security

□ How is data encrypted at rest?
  - Acceptable: AES-256, AES-128
  - Unacceptable: No encryption, proprietary encryption

□ How is data encrypted in transit?
  - Acceptable: TLS 1.3, TLS 1.2
  - Unacceptable: TLS 1.1 or lower, no encryption

□ Where is data stored geographically?
  - US/EU: Acceptable
  - Other regions: Requires additional review

□ Do you have data retention and deletion policies?
  - Provide policy document

## 3. Access Controls

□ Do you enforce MFA for all employee accounts?
  - Acceptable: Yes (mandatory)
  - Unacceptable: No or optional

□ How often do you review user access?
  - Acceptable: Quarterly or more frequent
  - Unacceptable: Annual or ad-hoc

□ Do you have role-based access control (RBAC)?
  - Describe permission model

## 4. Incident Response

□ Do you have a documented incident response plan?
  - Provide plan summary

□ What is your incident notification SLA?
  - Acceptable: 24 hours or less
  - Unacceptable: >48 hours

□ Have you had any security incidents in the past 12 months?
  - If yes, describe incident and remediation

## 5. Business Continuity

□ What is your uptime SLA?
  - Tier 1 requirement: 99.9%+
  - Tier 2 requirement: 99.5%+
  - Tier 3 requirement: 99.0%+

□ Do you have a disaster recovery plan?
  - Provide RTO (Recovery Time Objective)
  - Provide RPO (Recovery Point Objective)

□ How often do you test backups?
  - Acceptable: Monthly or more frequent
  - Unacceptable: Quarterly or less

## 6. Subprocessors

□ Do you use subprocessors (third-party vendors)?
  - List all subprocessors that will access our data

□ Do all subprocessors meet your security standards?
  - Provide evidence of subprocessor compliance
```

### Step 3: Automated Risk Scoring

**Risk Score Calculation:**

```javascript
// Vendor Risk Score (0-100, lower is better)

let riskScore = 0;

// Certification (40 points max)
if (hasSOC2TypeII) riskScore -= 40;
else if (hasSOC2TypeI) riskScore -= 25;
else if (hasISO27001) riskScore -= 20;
else riskScore += 20; // No certification = added risk

// Encryption (20 points max)
if (hasAES256AtRest && hasTLS13InTransit) riskScore -= 20;
else if (hasEncryptionAtRest && hasTLS12InTransit) riskScore -= 10;
else riskScore += 15; // Poor encryption = added risk

// Access Controls (20 points max)
if (enforcesMFA && hasRBAC && quarterlyAccessReview) riskScore -= 20;
else if (enforcesMFA && hasRBAC) riskScore -= 10;
else riskScore += 10; // Weak access controls = added risk

// Incident Response (10 points max)
if (hasIncidentPlan && notificationSLA <= 24) riskScore -= 10;
else if (hasIncidentPlan) riskScore -= 5;
else riskScore += 5; // No incident plan = added risk

// Uptime SLA (10 points max)
if (uptimeSLA >= 99.9) riskScore -= 10;
else if (uptimeSLA >= 99.5) riskScore -= 5;
else riskScore += 5; // Poor uptime = added risk

// Final Risk Level
if (riskScore <= 20) return "LOW RISK - Approved";
else if (riskScore <= 50) return "MEDIUM RISK - Conditional approval with monitoring";
else return "HIGH RISK - Rejected, requires remediation";
```

### Step 4: Required Documents

**For Tier 1 Vendors (Critical):**
1. ✅ SOC 2 Type II report (current)
2. ✅ Signed DPA (Data Processing Agreement)
3. ✅ Penetration test summary
4. ✅ Incident response plan
5. ✅ Business continuity plan
6. ✅ Subprocessor list (if applicable)
7. ✅ Insurance certificate (cyber liability, $1M+ coverage)

**For Tier 2 Vendors (Important):**
1. ✅ ISO 27001 or SOC 2 Type I
2. ✅ Security addendum to contract
3. ✅ Incident notification policy
4. ✅ Subprocessor list (if applicable)

**For Tier 3 Vendors (Standard):**
1. ✅ Security certification (any)
2. ✅ Privacy policy
3. ✅ Terms of service review

## Current Vendor Inventory

### Tier 1: Critical Vendors

**1. Railway (Infrastructure Hosting)**
- Status: ✅ Approved
- SOC 2: Available (request via Railway support)
- Encryption: AES-256 at rest, TLS 1.3 in transit
- Uptime: 99.99% SLA
- DPA: Required - request from Railway legal
- Review Date: Quarterly

**2. PostgreSQL on Railway**
- Status: ✅ Approved (covered under Railway SOC 2)
- Encryption: AES-256, SSL connections enforced
- Backups: Automated daily, 7-day retention
- Review Date: Quarterly

**Action Items:**
- [ ] Request SOC 2 report from Railway support
- [ ] Request and sign DPA from Railway legal
- [ ] Upload documents to Vanta

### Tier 2: Important Vendors

**1. Sentry (Error Monitoring)**
- Status: ✅ Approved
- SOC 2: Type II available at https://sentry.io/security/
- Encryption: TLS 1.3, AES-256
- Data: Error logs, stack traces (no PII)
- Review Date: Annual

**2. GitHub (Code Repository)**
- Status: ✅ Approved
- SOC 2: Type II + ISO 27001
- Encryption: TLS 1.3, AES-256
- MFA: Enforced for all org members
- Review Date: Annual

**Action Items:**
- [ ] Download Sentry SOC 2 report
- [ ] Download GitHub trust reports
- [ ] Upload to Vanta

### Tier 3: Standard Vendors

**1. Google Workspace (Email, Docs)**
- Status: ✅ Approved
- Certifications: SOC 2, ISO 27001, FedRAMP
- SSO: Configured
- MFA: Enforced
- Review Date: Annual

**Action Items:**
- [ ] Download Google compliance docs
- [ ] Verify MFA enforcement

## Continuous Monitoring

### Quarterly Vendor Reviews
```bash
# Every Q1, Q2, Q3, Q4:

For each Tier 1 vendor:
- [ ] Verify SOC 2 report is current (<12 months)
- [ ] Review incident log (any breaches?)
- [ ] Check uptime metrics (meets SLA?)
- [ ] Verify DPA is active
- [ ] Review any new subprocessors

For each Tier 2 vendor:
- [ ] Verify security certification is current
- [ ] Review any security incidents
- [ ] Check for service degradations

For each Tier 3 vendor:
- [ ] Verify still in use (remove if not)
- [ ] Check for any security alerts
```

### Annual Vendor Assessments
```bash
# Every 12 months:

For ALL vendors:
- [ ] Re-run security questionnaire
- [ ] Update risk score
- [ ] Renew contracts with security terms
- [ ] Review and update DPAs if needed
- [ ] Verify insurance coverage (Tier 1)
```

### Automated Alerts (via Vanta)
```bash
# Vanta will automatically alert when:

- SOC 2 report expires (30 days before)
- DPA renewal due (60 days before)
- Security incident reported by vendor
- Uptime SLA breach detected
- New subprocessor added without notice
- Vendor access permissions change
```

## Vendor Offboarding Procedure

When terminating a vendor relationship:

**Within 24 hours:**
- [ ] Revoke all vendor API keys
- [ ] Remove vendor access to systems
- [ ] Disable vendor SSO/SAML
- [ ] Revoke database credentials (if applicable)

**Within 7 days:**
- [ ] Request data deletion confirmation (per DPA)
- [ ] Obtain certificate of destruction
- [ ] Remove vendor from asset inventory
- [ ] Update security documentation

**Within 30 days:**
- [ ] Complete vendor exit interview
- [ ] Document lessons learned
- [ ] Update vendor management policy if needed

## DPA Template (Data Processing Agreement)

Use this template for Tier 1 vendors who don't provide their own DPA:

```markdown
# DATA PROCESSING AGREEMENT

Between: [Your Company Name] ("Data Controller")
And: [Vendor Name] ("Data Processor")

## 1. Purpose and Scope
Data Processor agrees to process personal data only for the purpose of providing [Service Name] to Data Controller.

## 2. Data Types
Personal data processed includes:
- Customer names and email addresses
- Property transaction details
- [Other data types specific to vendor]

## 3. Security Measures
Data Processor shall:
- Encrypt data at rest (AES-256 minimum)
- Encrypt data in transit (TLS 1.3 minimum)
- Implement MFA for all employee access
- Conduct annual penetration testing
- Maintain SOC 2 Type II certification

## 4. Data Subject Rights
Data Processor shall assist Data Controller in responding to:
- Access requests (within 5 business days)
- Deletion requests (within 10 business days)
- Rectification requests (within 5 business days)

## 5. Data Breach Notification
Data Processor shall notify Data Controller within 24 hours of:
- Any suspected or actual data breach
- Unauthorized access to personal data
- Loss or theft of data storage devices

## 6. Subprocessors
Data Processor may not engage subprocessors without:
- Written notice to Data Controller (30 days advance)
- Data Controller approval (may be declined)
- Subprocessor agreement to these same terms

## 7. Data Retention and Deletion
Upon contract termination:
- Data Processor shall delete all personal data within 30 days
- Data Processor shall provide written certification of deletion
- Backups shall be destroyed within 90 days

## 8. Audit Rights
Data Controller may audit Data Processor:
- Annually (scheduled in advance)
- Upon reasonable notice if breach suspected
- Data Processor shall provide full access to systems

Signatures:
[Your Company] Date: ___________
[Vendor] Date: ___________
```

## Success Metrics

**Week 3 Goals:**
- [ ] All current vendors classified (Tier 1/2/3)
- [ ] Security questionnaires sent to all Tier 1 vendors
- [ ] SOC 2 reports collected from critical vendors
- [ ] DPAs signed with all Tier 1 vendors

**Week 4 Goals:**
- [ ] All vendor documents uploaded to Vanta
- [ ] Automated quarterly review reminders configured
- [ ] Vendor risk scores calculated
- [ ] 100% vendor compliance achieved

**Valuation Impact:**
- Demonstrates robust third-party risk management
- Reduces acquisition due diligence time (buyers trust vendor assessments)
- Enables enterprise sales (Fortune 500 require vendor security)
- Estimated value: +$100k-200k in acquisition price

---

*Next: Create security training program for team members*
