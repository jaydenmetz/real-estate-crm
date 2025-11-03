# Project-32: Email Template System

**Phase**: C | **Priority**: HIGH | **Status**: Not Started
**Est**: 10 hrs + 3 hrs = 13 hrs | **Deps**: Phase B complete

## 🎯 Goal
Build email template system with variables, preview, and automated sending.

## 📋 Current → Target
**Now**: No email template functionality
**Target**: Template library with variables, preview, and scheduled sending
**Success Metric**: Users can create, customize, and send templated emails; variables populated automatically

## 📖 Context
Professional email communication is essential for real estate agents. This project creates a template system for common emails: appointment confirmations, listing updates, offer notifications, closing reminders, etc. Templates support variables (client name, property address, appointment time) and can be previewed before sending.

Key features: template library, visual template editor, variable insertion, email preview, manual/automated sending, and integration with contacts/escrows.

## ⚠️ Risk Assessment

### Technical Risks
- **Email Deliverability**: Emails marked as spam
- **Variable Parsing**: Incorrect variable substitution
- **HTML Rendering**: Emails display poorly in some clients
- **Rate Limiting**: Email service API limits

### Business Risks
- **Spam Complaints**: Unprofessional emails damaging sender reputation
- **Wrong Recipients**: Sending to incorrect contacts
- **Template Errors**: Embarrassing typos in automated emails
- **Legal Compliance**: CAN-SPAM Act violations

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-32-email-$(date +%Y%m%d)
git push origin pre-project-32-email-$(date +%Y%m%d)

# Backup email_templates table
pg_dump $DATABASE_URL -t email_templates > backup-email-templates-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-32-email-YYYYMMDD -- backend/src/services/email.service.js
git checkout pre-project-32-email-YYYYMMDD -- frontend/src/components/email
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Design email_templates table schema
- [ ] Define template variable syntax
- [ ] Choose email service (SendGrid/Postmark/Nodemailer)
- [ ] Plan template categories
- [ ] Map email triggers

### Implementation (6.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create email_templates table
  - [ ] Add template variables (subject, body, html)
  - [ ] Create email_logs table for tracking
  - [ ] Add default templates migration

- [ ] **Backend API** (2.5 hours):
  - [ ] Implement POST /v1/email/templates (create)
  - [ ] Implement GET /v1/email/templates (list)
  - [ ] Implement PUT /v1/email/templates/:id (update)
  - [ ] Implement POST /v1/email/send (send with template)
  - [ ] Add variable substitution logic
  - [ ] Integrate email service API
  - [ ] Add email validation

- [ ] **Frontend UI** (3 hours):
  - [ ] Create EmailTemplatesManager component
  - [ ] Add template editor with rich text
  - [ ] Implement variable insertion UI
  - [ ] Add email preview modal
  - [ ] Create send email dialog
  - [ ] Add template library view
  - [ ] Show email send history

### Testing (2 hours)
- [ ] Test template creation
- [ ] Test variable substitution
- [ ] Test email preview
- [ ] Test sending to test addresses
- [ ] Test HTML rendering in various clients
- [ ] Verify unsubscribe link works

### Documentation (1 hour)
- [ ] Document available template variables
- [ ] Document email service setup
- [ ] Add template examples
- [ ] Update API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Create Template
```bash
TOKEN="<JWT token>"

# Create email template
curl -X POST https://api.jaydenmetz.com/v1/email/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Appointment Confirmation",
    "subject": "Appointment Confirmed - {{property_address}}",
    "body": "Hi {{client_name}}, Your appointment for {{appointment_time}} is confirmed.",
    "category": "appointment"
  }'
# Expected: 201, template created with ID
```

### Test 2: Send Templated Email
```bash
TEMPLATE_ID="<template UUID>"

# Send email with variable substitution
curl -X POST https://api.jaydenmetz.com/v1/email/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "'$TEMPLATE_ID'",
    "to": "client@example.com",
    "variables": {
      "client_name": "John Smith",
      "property_address": "123 Main St",
      "appointment_time": "March 15, 2025 at 2:00 PM"
    }
  }'
# Expected: 200, email sent successfully
```

### Test 3: Template Preview
```bash
# Preview template with variables
curl -X POST https://api.jaydenmetz.com/v1/email/templates/$TEMPLATE_ID/preview \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "client_name": "John Smith",
      "property_address": "123 Main St"
    }
  }'
# Expected: Rendered HTML with variables substituted
```

## 📝 Implementation Notes

### Email Templates Table Schema
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50), -- appointment, listing, offer, closing, marketing
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  html TEXT, -- HTML version
  variables JSONB, -- Array of required variables
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id),
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  status VARCHAR(50), -- sent, failed, bounced, opened
  sent_by UUID REFERENCES users(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Template Variables
- `{{client_name}}` - Client first and last name
- `{{property_address}}` - Full property address
- `{{appointment_time}}` - Appointment date/time
- `{{agent_name}}` - Agent's name
- `{{agent_phone}}` - Agent's phone
- `{{listing_price}}` - Property listing price
- `{{offer_amount}}` - Offer amount
- `{{closing_date}}` - Escrow closing date

### Default Templates
1. **Appointment Confirmation**
2. **New Listing Alert**
3. **Offer Received Notification**
4. **Offer Accepted Congratulations**
5. **Closing Reminder (1 week before)**
6. **Post-Closing Thank You**

### Email Service Options
- **SendGrid**: Robust, $15/month for 40k emails
- **Postmark**: Transactional focus, $15/month for 10k emails
- **Nodemailer**: Free (use Gmail SMTP), limited deliverability
- **Recommendation**: Start with Nodemailer, upgrade to SendGrid when scaling

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store email API keys in .env
- [ ] Use apiInstance for API calls
- [ ] Follow existing service pattern

## 🧪 Test Coverage Impact
**After Project-32**:
- Email API: Full CRUD coverage
- Template rendering: Tested
- Variable substitution: Verified
- Email sending: Tested with test accounts

## 🔗 Dependencies

### Depends On
- Phase B complete (Projects 16-30)
- Email service account (SendGrid/Postmark/Gmail)

### Blocks
- None (enables marketing features later)

### Parallel Work
- Can work alongside Projects 31, 33-34

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Phase B complete
- ✅ Email service configured
- ✅ Have test email addresses

### Should Skip If:
- ❌ Not planning to use email automation
- ❌ Using external email marketing tool

### Optimal Timing:
- After Project-31 (Payment) completes
- 1-2 days of work (13 hours)

## ✅ Success Criteria
- [ ] Email templates table created
- [ ] Template CRUD API working
- [ ] Variable substitution functional
- [ ] Email sending works
- [ ] Preview displays correctly
- [ ] Default templates loaded
- [ ] Email logs tracking sends
- [ ] CAN-SPAM compliant (unsubscribe link)
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Templates table created
- [ ] Default templates loaded
- [ ] Email sending verified
- [ ] Variable substitution tested
- [ ] Preview functionality working
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
