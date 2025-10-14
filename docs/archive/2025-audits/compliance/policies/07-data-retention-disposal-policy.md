# Data Retention & Disposal Policy

**Document ID:** POL-007
**Effective Date:** January 1, 2026
**Policy Owner:** [Your Name], CEO/CTO

---

## 1. Purpose
Define how long data is retained and procedures for secure disposal to comply with legal requirements and minimize risk.

## 2. Data Classification & Retention Periods

### 2.1 Customer Data
| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| **Escrow Records** | 7 years after close | Tax/Legal |
| **Client Contact Info** | Active + 3 years | Business need |
| **Lead Information** | Active + 2 years | Business need |
| **Listing Data** | Active + 5 years | MLS requirements |
| **Appointments** | 3 years | Business need |
| **Communications (SMS/Email)** | 7 years | Legal compliance |
| **Documents (Contracts, Disclosures)** | 7 years | Legal compliance |

### 2.2 Financial Data
| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| **Commission Records** | 7 years | Tax law (IRS) |
| **Expense Reports** | 7 years | Tax law |
| **Invoices** | 7 years | Tax law |
| **Payment Transactions** | 7 years | PCI DSS, tax law |
| **Tax Returns** | Permanent | Tax law |

### 2.3 System Data
| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| **Security Logs** | 1 year | SOC 2 requirement |
| **Audit Logs** | 7 years | Compliance |
| **API Logs** | 90 days | Operational need |
| **Backup Data** | 30 days (daily), 1 year (monthly) | Disaster recovery |
| **Performance Metrics** | 2 years | Business analytics |

### 2.4 HR & Employee Data
| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| **Personnel Files** | 7 years after termination | Labor law |
| **I-9 Forms** | 3 years after hire or 1 year after termination | Immigration law |
| **Payroll Records** | 7 years | FLSA requirement |
| **Background Checks** | 5 years | FCRA requirement |

## 3. Data Disposal Procedures

### 3.1 Automated Deletion
**Database Records:**
```sql
-- Example: Delete leads older than 2 years (inactive)
DELETE FROM leads
WHERE status = 'closed'
  AND last_activity_date < NOW() - INTERVAL '2 years';

-- Log deletion for audit
INSERT INTO audit_logs (action, table_name, record_count, deleted_at)
VALUES ('data_retention_cleanup', 'leads', ROW_COUNT(), NOW());
```

**Scheduled Jobs:**
- Daily: Delete expired refresh tokens
- Monthly: Delete old API logs (> 90 days)
- Quarterly: Delete inactive leads (> 2 years)
- Annually: Delete closed escrows (> 7 years)

### 3.2 Manual Deletion
For special requests (GDPR "Right to be Forgotten"):
1. Verify identity of requester
2. Check for legal hold (ongoing litigation)
3. Document deletion request
4. Execute deletion across all systems
5. Confirm deletion to requester
6. Retain deletion log (evidence of compliance)

### 3.3 Secure Disposal Methods

**Digital Data:**
- Database: `DELETE` command with confirmation
- Files: Overwrite with random data (3 passes minimum)
- Backups: Encryption keys destroyed
- Cloud storage: Permanent delete (not just "trash")

**Physical Media:**
- Paper: Cross-cut shredding (P-4 level minimum)
- Hard drives: Degaussing or physical destruction
- USB drives: Physical destruction
- CDs/DVDs: Shredding or incineration

**Certificates of Destruction:**
- Required for all physical media disposal
- Maintained for 3 years
- Includes: Date, media type, quantity, disposal method, authorized signature

## 4. Legal Holds

When litigation or investigation is anticipated:
1. **Suspend normal disposal** for relevant data
2. **Notify all personnel** of legal hold
3. **Preserve all data** in current state
4. **Document hold scope** and duration
5. **Release hold** only upon legal counsel approval

**Legal Hold Process:**
- Legal counsel issues hold notice
- IT implements preservation measures
- Automatic deletion disabled for affected data
- Manual deletions prohibited
- Hold tracked in legal hold register
- Released upon case closure

## 5. GDPR Compliance

### 5.1 Right to be Forgotten (Article 17)
Customers may request deletion of personal data:
- Request must be verified
- Exceptions: Legal obligations, litigation, contracts
- Deletion completed within 30 days
- Confirmation provided to customer
- Deletion logged for audit

### 5.2 Data Minimization (Article 5)
- Only collect data necessary for business purpose
- Delete data when no longer needed
- Avoid excessive data collection
- Regular reviews of data collected

## 6. Data Retention Schedule (Summary)

**Immediate Deletion:**
- Expired refresh tokens
- Failed login attempts (after 30 days)
- Temporary files and caches

**Short-Term (90 days):**
- API request logs
- Performance metrics
- Non-critical system logs

**Medium-Term (1-3 years):**
- Security event logs (1 year)
- Active customer data (until inactive)
- Lead information (2 years post-close)

**Long-Term (7 years):**
- Financial records (tax requirement)
- Escrow transactions (legal requirement)
- Contracts and agreements
- Audit logs

**Permanent:**
- Tax returns
- Corporate records
- Legal agreements

## 7. Monitoring & Compliance

### 7.1 Automated Monitoring
- Cron job runs retention cleanup monthly
- Deletion logs reviewed quarterly
- Storage capacity monitored
- Alerts for retention policy violations

### 7.2 Manual Audits
- Annual review of retention schedule
- Quarterly review of deletion logs
- Sample verification of deleted data
- Policy effectiveness assessment

### 7.3 Metrics & Reporting
- Data volume by type
- Deletion activity
- Storage cost reduction
- GDPR deletion requests (count, avg response time)

## 8. Exceptions & Approvals

**Extending Retention:**
- Business justification required
- Legal counsel approval
- Security Officer approval
- Documented in exception log
- Annual re-approval required

**Early Deletion:**
- Generally prohibited
- Exceptions: Security incident, corruption
- Security Officer approval required
- Legal counsel consulted
- Documented with justification

## 9. Training & Awareness

- Annual training on data retention policy
- Quarterly reminders about GDPR deletion rights
- Managers trained on legal hold procedures
- IT trained on disposal procedures

---

**Approved by:** [Your Name], CEO/CTO
**Date:** January 1, 2026
