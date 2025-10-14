# Business Continuity & Disaster Recovery Plan

**Document ID:** POL-005
**Effective Date:** January 1, 2026
**Policy Owner:** [Your Name], CEO/CTO

---

## 1. Purpose
Ensure business operations continue during and after disruptions, with minimal impact to customers.

## 2. Scope
Covers all critical business functions:
- API services (api.jaydenmetz.com)
- Frontend application (crm.jaydenmetz.com)
- Database (PostgreSQL on Railway)
- Customer support
- Payment processing

## 3. Business Impact Analysis

### 3.1 Critical Systems (RTO: 1 hour, RPO: 15 minutes)
- **API Server:** Customer-facing services
- **Database:** All customer data
- **Authentication:** User login

### 3.2 Important Systems (RTO: 4 hours, RPO: 1 hour)
- **Frontend:** User interface
- **File Storage:** Document management
- **Email:** Communication

### 3.3 Non-Critical Systems (RTO: 24 hours, RPO: 24 hours)
- **Analytics:** Reporting dashboards
- **Marketing:** Website, blog

**Definitions:**
- **RTO (Recovery Time Objective):** Maximum acceptable downtime
- **RPO (Recovery Point Objective):** Maximum acceptable data loss

## 4. Disaster Scenarios

### Scenario 1: Railway Outage (US-West)
**Trigger:** Railway platform unavailable > 15 minutes
**Impact:** Complete service outage
**Recovery:**
1. Activate failover to AWS Lambda (US-East)
2. Update DNS to point to failover
3. Customer notification via status page
4. Monitor Railway status
5. Failback when Railway recovered

**Estimated Downtime:** 30-60 minutes

### Scenario 2: Database Corruption
**Trigger:** Database errors, data inconsistency
**Impact:** Service degradation or outage
**Recovery:**
1. Take database offline
2. Restore from most recent backup
3. Replay transaction logs (if available)
4. Verify data integrity
5. Bring database online

**Estimated Downtime:** 1-4 hours

### Scenario 3: Ransomware Attack
**Trigger:** Systems encrypted by malware
**Impact:** Complete outage, data at risk
**Recovery:**
1. Isolate all systems immediately
2. Do NOT pay ransom
3. Restore from offline backups (air-gapped)
4. Rebuild infrastructure from scratch
5. Enhance security controls

**Estimated Downtime:** 4-24 hours

### Scenario 4: Loss of Key Personnel
**Trigger:** CEO/CTO unavailable (illness, accident, resignation)
**Impact:** Decision-making delays, knowledge loss
**Recovery:**
1. Activate succession plan
2. Interim leadership assumes role
3. Access company documentation
4. Continue operations with team
5. Hire replacement (if permanent)

**Estimated Impact:** Minimal with proper documentation

## 5. Backup & Recovery

### 5.1 Database Backups
- **Frequency:** Every 6 hours
- **Retention:** 30 days (daily), 1 year (monthly)
- **Storage:** AWS S3 (encrypted, separate region)
- **Testing:** Restore tested monthly
- **Automation:** Automated via cron job

### 5.2 Application Backups
- **Code:** GitHub (primary), automated backups (secondary)
- **Secrets:** Encrypted vault backup weekly
- **Configuration:** Infrastructure-as-code in git

### 5.3 Document Backups
- **Customer Documents:** AWS S3 (versioning enabled)
- **Retention:** Indefinite (user-controlled deletion)
- **Redundancy:** Multi-region replication

## 6. Failover Procedures

### 6.1 API Failover (Railway → AWS Lambda)
```bash
# Manual failover steps:
1. Deploy Lambda function (pre-configured)
   aws lambda update-function-code --function-name crm-api-failover

2. Update DNS (Cloudflare)
   Change A record for api.jaydenmetz.com → Lambda endpoint

3. Verify failover
   curl https://api.jaydenmetz.com/v1/health

4. Monitor logs
   aws logs tail /aws/lambda/crm-api-failover --follow
```

### 6.2 Database Failover
Railway → AWS RDS (read replica promoted to primary)

## 7. Communication Plan

### 7.1 Internal Communication
- **Slack:** #incidents channel activated
- **Email:** disaster-recovery@yourcompany.com
- **Phone:** Conference bridge for coordination

### 7.2 Customer Communication
- **Status Page:** status.jaydenmetz.com updated every 30 min
- **Email:** All customers notified of outages > 1 hour
- **Social Media:** Twitter updates for major incidents
- **Support:** Extended hours during incidents

### 7.3 Stakeholder Communication
- **Investors:** Briefed on major incidents
- **Partners:** Notified if services impacted
- **Regulators:** Data breach notifications per policy

## 8. Recovery Team

| Role | Primary | Backup | Responsibility |
|------|---------|--------|----------------|
| Incident Commander | [Your Name] | [Dev #1] | Overall coordination |
| Technical Lead | [Dev #1] | [Dev #2] | System recovery |
| Communications | [Your Name] | [Support Lead] | Customer updates |
| Database Admin | [Dev #1] | [Your Name] | Data recovery |

## 9. Testing Schedule

- **Monthly:** Database backup restore test
- **Quarterly:** Failover drill (non-production)
- **Semi-annually:** Full disaster recovery test
- **Annually:** Tabletop exercise with all scenarios

## 10. Recovery Checklist

### Critical Path (First 4 Hours)
- [ ] Assess damage and classify incident
- [ ] Activate disaster recovery team
- [ ] Update status page (outage notification)
- [ ] Begin system recovery procedures
- [ ] Communicate with customers

### System Recovery
- [ ] Restore database from backup
- [ ] Deploy application to failover infrastructure
- [ ] Verify data integrity
- [ ] Run smoke tests
- [ ] Gradually restore traffic

### Post-Recovery
- [ ] Monitor systems for stability (24 hours)
- [ ] Conduct post-mortem (within 3 days)
- [ ] Update documentation
- [ ] Implement improvements

## 11. Insurance & Legal

- **Cyber Insurance:** $1M policy covering data breaches
- **Business Interruption:** Coverage for revenue loss
- **Legal Counsel:** Retained for breach notifications

---

**Approved by:** [Your Name], CEO/CTO
**Date:** January 1, 2026
**Last Tested:** [Date of last DR test]
