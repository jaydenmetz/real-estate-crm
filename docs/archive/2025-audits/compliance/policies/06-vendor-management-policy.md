# Vendor Management Policy

**Document ID:** POL-006
**Effective Date:** January 1, 2026
**Policy Owner:** [Your Name], CEO/CTO

---

## 1. Purpose
Establish requirements for selecting, onboarding, and managing third-party vendors who access company systems or customer data.

## 2. Vendor Classification

### 2.1 Critical Vendors (Highest Risk)
Access to customer data or critical infrastructure:
- Railway (Infrastructure hosting)
- AWS S3 (File storage)
- Sentry (Error tracking - may contain PII)
- Twilio (SMS - customer phone numbers)

### 2.2 Important Vendors (Medium Risk)
Business-critical but no direct customer data access:
- GitHub (Code repository)
- OpenAI (AI services - anonymized data only)
- Vanta (Compliance monitoring)

### 2.3 Standard Vendors (Low Risk)
No access to customer data or systems:
- Office supplies
- Marketing tools
- Analytics (anonymized)

## 3. Vendor Selection

### 3.1 Due Diligence Requirements
Before engaging a vendor, assess:
- **Security Certifications:** SOC 2, ISO 27001, PCI DSS (if applicable)
- **Data Privacy:** GDPR compliance, Privacy Shield (if EU data)
- **Financial Stability:** Annual revenue, funding, years in business
- **References:** Customer testimonials, case studies
- **SLA:** Uptime guarantee, support responsiveness

### 3.2 Security Questionnaire
All critical vendors must complete:
- Security practices and certifications
- Data handling and encryption practices
- Incident response procedures
- Subprocessor list
- Data residency and compliance

## 4. Contractual Requirements

### 4.1 Data Processing Agreement (DPA)
Required for vendors handling customer data:
- Data types and purposes defined
- GDPR Article 28 compliance
- Subprocessor disclosure and approval
- Data breach notification (24 hours)
- Right to audit
- Data deletion upon termination

### 4.2 Service Level Agreement (SLA)
- Uptime guarantee (99.9% minimum for critical vendors)
- Support response times
- Escalation procedures
- Performance metrics

### 4.3 Security Requirements
- Encryption at rest and in transit
- MFA for admin access
- Regular security assessments
- Vulnerability disclosure program
- Incident notification procedures

## 5. Vendor Onboarding

### 5.1 Approval Process
1. Business justification documented
2. Security assessment completed
3. Contract review (legal + security)
4. DPA signed (if handling customer data)
5. Access provisioned (least privilege)
6. Vendor added to inventory

### 5.2 Access Provisioning
- Separate vendor accounts (no shared credentials)
- Time-limited access (90-day maximum, renewable)
- MFA required for all vendor access
- VPN access only (no direct internet exposure)
- All vendor activity logged

## 6. Ongoing Monitoring

### 6.1 Quarterly Vendor Reviews
For critical vendors:
- Review security certifications (ensure current)
- Check for security incidents or breaches
- Assess performance against SLA
- Review access logs for anomalies
- Update risk assessment

### 6.2 Annual Vendor Assessments
- Security questionnaire re-submitted
- Contract renewal evaluation
- Alternative vendor analysis
- Cost-benefit review
- Executive approval for renewal

### 6.3 Continuous Monitoring
- Monitor vendor status pages and security bulletins
- Track vendor security incidents
- Receive vendor security updates
- Audit vendor access logs monthly

## 7. Vendor Inventory

### Current Critical Vendors

| Vendor | Service | Data Access | Cert | DPA | Review Date |
|--------|---------|-------------|------|-----|-------------|
| Railway | Hosting | Full DB | SOC 2 | ✅ | Q1 2026 |
| AWS S3 | Storage | Documents | SOC 2 | ✅ | Q1 2026 |
| Sentry | Errors | May contain PII | SOC 2 | ⏳ | Q1 2026 |
| Twilio | SMS | Phone numbers | SOC 2 | ⏳ | Q1 2026 |

### Vendor Risk Scores
- **Low Risk (1-3):** Minimal data access, high security posture
- **Medium Risk (4-6):** Some data access, acceptable security
- **High Risk (7-10):** Critical data access, security concerns

## 8. Vendor Offboarding

When terminating vendor relationship:
1. Provide 30-day notice (or per contract)
2. Revoke all vendor access immediately
3. Request data deletion confirmation
4. Retrieve or delete data held by vendor
5. Remove vendor from inventory
6. Update documentation and integrations
7. Migrate to replacement vendor (if applicable)

## 9. Incident Response

If vendor has security incident:
1. Vendor must notify within 24 hours
2. Assess impact to company and customers
3. Activate incident response plan
4. Determine if customer notification required
5. Document incident and response
6. Reassess vendor risk and relationship

## 10. Subprocessors

Vendors must:
- Disclose all subprocessors
- Obtain approval before adding new subprocessors
- Ensure subprocessors meet same security standards
- Flow down DPA requirements to subprocessors
- Remain liable for subprocessor actions

## 11. International Vendors

For vendors outside US:
- Assess data residency requirements
- Verify GDPR compliance (if EU)
- Check for adequacy decisions
- Standard Contractual Clauses (SCCs) required
- Data localization requirements met

---

**Approved by:** [Your Name], CEO/CTO
**Date:** January 1, 2026
