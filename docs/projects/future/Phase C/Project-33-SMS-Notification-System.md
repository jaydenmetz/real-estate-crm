# Project-33: SMS Notification System

**Phase**: C | **Priority**: MEDIUM | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Phase B complete

## 🎯 Goal
Implement SMS notifications using Twilio for appointment reminders and alerts.

## 📋 Current → Target
**Now**: No SMS capability
**Target**: SMS templates, Twilio integration, opt-in/opt-out management
**Success Metric**: Users can send SMS notifications; recipients can opt-out; delivery tracked

## 📖 Context
SMS provides instant communication for time-sensitive updates: appointment reminders, offer alerts, showing confirmations, etc. This project integrates Twilio for SMS delivery, creates SMS templates, implements opt-in/opt-out compliance, and tracks message delivery.

Key features: Twilio integration, SMS templates with variables, automated appointment reminders, opt-in/opt-out management, delivery status tracking, and TCPA compliance.

## ⚠️ Risk Assessment

### Technical Risks
- **Delivery Failures**: Messages not delivered
- **Rate Limiting**: Twilio API limits
- **Cost Overruns**: High SMS volume costs
- **Formatting Issues**: Links/formatting broken in SMS

### Business Risks
- **Spam Complaints**: Recipients marking as spam
- **Legal Violations**: TCPA non-compliance ($500-$1500 per violation)
- **Opt-Out Failures**: Unable to unsubscribe
- **Unexpected Costs**: SMS fees adding up

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-33-sms-$(date +%Y%m%d)
git push origin pre-project-33-sms-$(date +%Y%m%d)

# Backup sms tables
pg_dump $DATABASE_URL -t sms_templates -t sms_logs > backup-sms-$(date +%Y%m%d).sql
```

### If Things Break
```bash
# Disable Twilio webhooks
git checkout pre-project-33-sms-YYYYMMDD -- backend/src/services/sms.service.js
git push origin main
```

## ✅ Tasks

### Planning (1 hour)
- [ ] Design sms_templates and sms_logs tables
- [ ] Define SMS template patterns
- [ ] Plan opt-in/opt-out workflow
- [ ] Map automated SMS triggers
- [ ] Review TCPA compliance requirements

### Implementation (5.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create sms_templates table
  - [ ] Create sms_logs table
  - [ ] Add sms_opt_in column to clients table
  - [ ] Create default SMS templates

- [ ] **Backend API** (2.5 hours):
  - [ ] Implement POST /v1/sms/send
  - [ ] Implement GET /v1/sms/templates
  - [ ] Implement POST /v1/sms/opt-out (webhook)
  - [ ] Add Twilio SDK integration
  - [ ] Add variable substitution
  - [ ] Implement delivery status tracking

- [ ] **Frontend UI** (2 hours):
  - [ ] Create SMS settings page
  - [ ] Add SMS template manager
  - [ ] Add manual send SMS dialog
  - [ ] Show SMS history
  - [ ] Display opt-out status

### Testing (1.5 hours)
- [ ] Test SMS sending to real numbers
- [ ] Test opt-out workflow (reply STOP)
- [ ] Test delivery status webhooks
- [ ] Test variable substitution
- [ ] Verify character limits (160 chars)

### Documentation (0.5 hours)
- [ ] Document Twilio setup
- [ ] Document TCPA compliance
- [ ] Add SMS templates guide

## 🧪 Verification Tests

### Test 1: Send SMS
```bash
TOKEN="<JWT token>"

# Send SMS
curl -X POST https://api.jaydenmetz.com/v1/sms/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15555551234",
    "template": "appointment_reminder",
    "variables": {
      "client_name": "John",
      "appointment_time": "2:00 PM today"
    }
  }'
# Expected: 200, SMS sent, delivery status tracked
```

### Test 2: Opt-Out Handling
```bash
# Send test SMS
# Reply "STOP" from recipient phone
# Check database for opt-out status
psql $DATABASE_URL -c "SELECT sms_opt_in FROM clients WHERE phone = '+15555551234';"
# Expected: sms_opt_in = false
```

### Test 3: Delivery Status
```bash
# Check SMS delivery status
curl -X GET https://api.jaydenmetz.com/v1/sms/logs?phone=+15555551234 \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of SMS with delivery statuses (sent, delivered, failed)
```

## 📝 Implementation Notes

### SMS Tables Schema
```sql
CREATE TABLE sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL, -- Max 160 chars
  variables JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES sms_templates(id),
  recipient VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50), -- queued, sent, delivered, failed, undelivered
  twilio_sid VARCHAR(100),
  sent_by UUID REFERENCES users(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add to clients table
ALTER TABLE clients ADD COLUMN sms_opt_in BOOLEAN DEFAULT TRUE;
```

### Default SMS Templates
1. **Appointment Reminder**: "Hi {{name}}, reminder: showing at {{address}} on {{time}}. Reply STOP to opt-out."
2. **Offer Received**: "{{name}}, you received an offer on {{address}}! Call me: {{agent_phone}}"
3. **Closing Reminder**: "{{name}}, your closing is in 3 days ({{date}}). See you soon!"

### Twilio Setup
1. Create Twilio account
2. Purchase phone number ($1/month)
3. Get Account SID and Auth Token
4. Configure webhook URL for delivery status
5. Enable opt-out keyword handling (STOP, UNSUBSCRIBE)

### TCPA Compliance Checklist
- [ ] Obtain prior express written consent before sending marketing SMS
- [ ] Include opt-out instructions in every message
- [ ] Honor opt-out requests immediately
- [ ] Don't send SMS before 8 AM or after 9 PM local time
- [ ] Keep opt-out list for 5 years

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store Twilio credentials in .env
- [ ] Use apiInstance for API calls
- [ ] Follow email template pattern

## 🧪 Test Coverage Impact
**After Project-33**:
- SMS API: Full coverage
- Opt-out workflow: Tested
- Delivery tracking: Verified

## 🔗 Dependencies

### Depends On
- Phase B complete (Projects 16-30)
- Twilio account configured

### Blocks
- None

### Parallel Work
- Can work alongside Projects 31-32, 34

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Phase B complete
- ✅ Twilio account created
- ✅ Have test phone numbers

### Should Skip If:
- ❌ Not planning SMS notifications
- ❌ Budget constraints (SMS costs ~$0.0075/message)

### Optimal Timing:
- After Projects 31-32 complete
- 1 day of work (10 hours)

## ✅ Success Criteria
- [ ] SMS templates table created
- [ ] Twilio integration working
- [ ] SMS sending successful
- [ ] Opt-out workflow functional
- [ ] Delivery status tracked
- [ ] 160 character limit enforced
- [ ] TCPA compliant
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] SMS tables created
- [ ] Twilio configured
- [ ] SMS sending verified
- [ ] Opt-out tested
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
