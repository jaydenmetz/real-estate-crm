# Project-77: GDPR Compliance Check

**Phase**: F | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Project-76 complete
**MILESTONE**: GDPR compliant, ready for EU market

## 🎯 Goal
Implement GDPR compliance features including data consent management, right to be forgotten, data portability, and privacy policy tools.

## 📋 Current → Target
**Now**: Basic privacy features; no GDPR-specific compliance mechanisms
**Target**: Full GDPR compliance with consent management, data deletion capabilities, data export, and privacy policy enforcement
**Success Metric**: All GDPR articles addressed; users can request data deletion/export; consent tracking implemented; privacy policy accessible

## 📖 Context
GDPR (General Data Protection Regulation) compliance is required for operating in the European market and represents best practices for user privacy globally. This project implements the technical requirements for GDPR including user consent, data subject rights (access, rectification, erasure, portability), breach notification readiness, and privacy by design.

Key features: Consent management system, data deletion API, data export functionality, privacy policy acceptance tracking, audit logging for data access, and GDPR-compliant data retention policies.

## ⚠️ Risk Assessment

### Technical Risks
- **Incomplete Data Deletion**: Missing data in deletion process
- **Data Leakage**: Exported data including other users' data
- **Consent Tracking Gaps**: Missing consent records
- **Cascade Deletion Failures**: Foreign key constraints preventing deletion

### Business Risks
- **Legal Liability**: Non-compliance fines (up to €20M or 4% revenue)
- **Market Access**: Cannot operate in EU without compliance
- **User Trust**: Privacy violations damaging reputation
- **Audit Failures**: Unable to demonstrate compliance

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-77-gdpr-$(date +%Y%m%d)
git push origin pre-project-77-gdpr-$(date +%Y%m%d)

# Backup users table (contains consent data)
pg_dump $DATABASE_URL -t users -t user_consents > backup-gdpr-$(date +%Y%m%d).sql
```

### If Things Break
```bash
# If data deletion goes wrong
# Restore from backup
psql $DATABASE_URL < backup-gdpr-YYYYMMDD.sql

# Rollback code
git checkout pre-project-77-gdpr-YYYYMMDD -- backend/src/controllers/gdpr.controller.js
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Review GDPR requirements (Articles 7, 15, 17, 20)
- [ ] Design consent management schema
- [ ] Plan data deletion cascade strategy
- [ ] Document data retention policies
- [ ] Create GDPR compliance checklist

### Implementation (5.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create user_consents table
  - [ ] Add consent_marketing, consent_analytics columns to users
  - [ ] Create data_requests table (deletion, export requests)
  - [ ] Add deleted_at column to users (soft delete)

- [ ] **Backend API** (2.5 hours):
  - [ ] Implement POST /v1/gdpr/request-data (export user data)
  - [ ] Implement POST /v1/gdpr/delete-account (right to be forgotten)
  - [ ] Implement GET /v1/gdpr/data-export (download all user data)
  - [ ] Implement POST /v1/gdpr/consent (update consent preferences)
  - [ ] Add data deletion service (cascade delete all user data)
  - [ ] Add data export service (compile all user data to JSON/CSV)

- [ ] **Frontend UI** (2 hours):
  - [ ] Create Privacy Settings page
  - [ ] Add consent management toggles
  - [ ] Add "Request Data Export" button
  - [ ] Add "Delete My Account" flow with confirmation
  - [ ] Create privacy policy acceptance modal (on signup)
  - [ ] Add consent withdrawal UI

### Testing (2 hours)
- [ ] Test data export (verify all user data included)
- [ ] Test account deletion (verify all data removed)
- [ ] Test consent management (verify preferences saved)
- [ ] Test privacy policy acceptance flow
- [ ] Verify cascade deletion (no orphaned records)
- [ ] Test data access logging

### Documentation (1 hour)
- [ ] Create GDPR compliance documentation
- [ ] Document data retention policies
- [ ] Document data deletion process
- [ ] Add GDPR endpoints to API_REFERENCE.md
- [ ] Create user guide for privacy settings

## 🧪 Verification Tests

### Test 1: Request Data Export
```bash
TOKEN="<JWT token>"

# Request data export
curl -X POST https://api.jaydenmetz.com/v1/gdpr/request-data \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200, export request created

# Download data export (after processing)
curl -X GET https://api.jaydenmetz.com/v1/gdpr/data-export \
  -H "Authorization: Bearer $TOKEN"
# Expected: JSON file with all user data (profile, escrows, clients, etc.)
```

### Test 2: Delete Account (Right to be Forgotten)
```bash
# Delete account
curl -X POST https://api.jaydenmetz.com/v1/gdpr/delete-account \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmation": "DELETE MY ACCOUNT"}'
# Expected: 200, account marked for deletion

# Verify user data deleted
psql $DATABASE_URL -c "SELECT * FROM users WHERE id = '<user_id>';"
# Expected: User soft-deleted (deleted_at timestamp set) or hard-deleted

# Verify cascade deletion
psql $DATABASE_URL -c "SELECT COUNT(*) FROM escrows WHERE user_id = '<user_id>';"
# Expected: 0 (all user data removed)
```

### Test 3: Consent Management
```bash
# Update consent preferences
curl -X POST https://api.jaydenmetz.com/v1/gdpr/consent \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consent_marketing": false,
    "consent_analytics": true
  }'
# Expected: 200, consent preferences updated

# Verify consent logged
psql $DATABASE_URL -c "SELECT * FROM user_consents WHERE user_id = '<user_id>' ORDER BY created_at DESC LIMIT 1;"
# Expected: Consent record with timestamp and IP address
```

## 📝 Implementation Notes

### GDPR Compliance Tables Schema
```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_marketing BOOLEAN DEFAULT FALSE,
  consent_analytics BOOLEAN DEFAULT FALSE,
  consent_third_party BOOLEAN DEFAULT FALSE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(50), -- export, deletion
  status VARCHAR(50), -- pending, processing, completed
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  export_url TEXT -- S3 URL for data export
);

-- Add to users table
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE;
```

### GDPR Requirements Checklist

**Article 7 - Consent**:
- [ ] Consent must be freely given, specific, informed, and unambiguous
- [ ] Clear affirmative action (opt-in, not opt-out)
- [ ] Withdraw consent as easy as giving consent
- [ ] Record of when and how consent was obtained

**Article 15 - Right of Access**:
- [ ] Users can request copy of their personal data
- [ ] Data provided in structured, commonly used format (JSON/CSV)
- [ ] Response within 1 month

**Article 17 - Right to Erasure (Right to be Forgotten)**:
- [ ] Users can request deletion of their data
- [ ] Delete all personal data without undue delay
- [ ] Notify third parties if data was shared

**Article 20 - Right to Data Portability**:
- [ ] Users can receive their data in machine-readable format
- [ ] Users can transmit data to another controller

**Article 25 - Privacy by Design**:
- [ ] Data minimization (only collect necessary data)
- [ ] Pseudonymization where possible
- [ ] Default to highest privacy settings

**Article 33 - Breach Notification**:
- [ ] Logging system to detect breaches
- [ ] Process to notify authorities within 72 hours
- [ ] Process to notify affected users

### Data Deletion Strategy
```javascript
// Service method for cascade deletion
async function deleteUserData(userId) {
  // Delete in order (respect foreign key constraints)
  await db.query('DELETE FROM appointments WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM leads WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM clients WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM listings WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM escrows WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM documents WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM subscriptions WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM user_consents WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM audit_logs WHERE user_id = $1', [userId]);

  // Soft delete user (or hard delete after 30 days)
  await db.query('UPDATE users SET deleted_at = NOW() WHERE id = $1', [userId]);
}
```

### Data Export Format
```json
{
  "export_date": "2025-11-02T12:00:00Z",
  "user_id": "65483115-0e3e-43f3-8a4a-488a6f0df017",
  "personal_data": {
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "escrows": [...],
  "listings": [...],
  "clients": [...],
  "leads": [...],
  "appointments": [...],
  "documents": [...],
  "consent_history": [...]
}
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store privacy policy in /docs/legal/
- [ ] Use apiInstance for API calls
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-77**:
- GDPR API: Full coverage (data export, deletion, consent)
- Privacy settings: Tested for all consent types
- Data deletion: Verified cascade deletion works correctly
- Data export: Verified all user data included

## 🔗 Dependencies

### Depends On
- Project-76 (Security Audit Complete - needs security baseline)
- User authentication working (need to identify users)

### Blocks
- Project-85 (Compliance Documentation - needs GDPR implementation complete)

### Parallel Work
- Can work alongside Projects 78-84 (other security projects)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-76 complete (security audit done)
- ✅ Planning to operate in EU or accept EU users
- ✅ User authentication working
- ✅ Database supports soft deletes

### Should Skip If:
- ❌ Only operating in non-EU markets (still recommended)
- ❌ No user data collected (unlikely for CRM)

### Optimal Timing:
- After security audit (Project-76)
- Before public beta launch
- Before accepting EU users

## ✅ Success Criteria
- [ ] user_consents table created
- [ ] data_requests table created
- [ ] Privacy Settings page functional
- [ ] Data export API working
- [ ] Account deletion API working
- [ ] Consent management UI complete
- [ ] Privacy policy acceptance on signup
- [ ] Data export includes all user data
- [ ] Account deletion removes all user data
- [ ] Consent withdrawal working
- [ ] GDPR compliance documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Privacy policy finalized and approved
- [ ] Data retention policy documented
- [ ] Data deletion tested on staging
- [ ] Data export tested on staging
- [ ] Consent management tested

### Post-Deployment Verification
- [ ] Privacy Settings page accessible
- [ ] Test data export request
- [ ] Test account deletion flow
- [ ] Verify consent preferences save correctly
- [ ] Check audit logs for GDPR actions

### Rollback Triggers
- Data deletion removing wrong data
- Data export exposing other users' data
- Consent preferences not saving
- Privacy policy acceptance blocking signups

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] GDPR tables created
- [ ] Data export API functional
- [ ] Account deletion API functional
- [ ] Consent management working
- [ ] Privacy Settings page complete
- [ ] Privacy policy acceptance flow working
- [ ] Zero data leakage in exports
- [ ] Cascade deletion verified
- [ ] Documentation complete
- [ ] MILESTONE ACHIEVED: GDPR compliant, ready for EU market

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
