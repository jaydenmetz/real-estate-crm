# Project-31: Stripe Payment Integration

**Phase**: C | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 15 hrs + 5 hrs = 20 hrs | **Deps**: Phase B complete
**MILESTONE**: Enables revenue generation

## 🎯 Goal
Implement Stripe payment processing for subscription billing and one-time payments.

## 📋 Current → Target
**Now**: No payment processing capability
**Target**: Full Stripe integration with subscription plans, payment forms, billing dashboard
**Success Metric**: Users can subscribe to monthly/annual plans; payments processed securely; billing dashboard shows history

## 📖 Context
Payment processing is critical for monetizing the CRM. This project integrates Stripe to handle subscription billing, one-time payments, and invoice management. Stripe provides secure payment processing, PCI compliance, and robust APIs for managing subscriptions, customers, and invoices.

Key features: Stripe API integration, subscription plan creation (Free, Pro, Enterprise), payment form UI, billing dashboard, webhook handling for payment events, and integration with user accounts.

## ⚠️ Risk Assessment

### Technical Risks
- **PCI Compliance**: Handling payment data securely
- **Webhook Reliability**: Missing payment events
- **API Key Security**: Exposing secret keys
- **Failed Payments**: Handling declined cards gracefully

### Business Risks
- **Revenue Loss**: Payment bugs preventing sales
- **Trust Issues**: Payment failures damaging reputation
- **Subscription Cancellations**: Poor billing UX driving churn
- **Double Charging**: Webhook replay causing duplicate charges

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-31-stripe-$(date +%Y%m%d)
git push origin pre-project-31-stripe-$(date +%Y%m%d)

# Backup relevant tables
pg_dump $DATABASE_URL -t subscriptions -t payments > backup-billing-$(date +%Y%m%d).sql
```

### If Things Break
```bash
# Disable Stripe webhooks in Stripe dashboard
# Rollback code
git checkout pre-project-31-stripe-YYYYMMDD -- backend/src/controllers/stripe.controller.js
git checkout pre-project-31-stripe-YYYYMMDD -- frontend/src/components/billing
git push origin main
```

## ✅ Tasks

### Planning (2.5 hours)
- [ ] Design subscriptions table schema
- [ ] Plan Stripe product/price IDs
- [ ] Document subscription tiers (Free, Pro, Enterprise)
- [ ] Map webhook events to actions
- [ ] Security review for API keys

### Implementation (9.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create subscriptions table
  - [ ] Create payments table
  - [ ] Add stripe_customer_id to users table
  - [ ] Add subscription_status column

- [ ] **Backend API** (4 hours):
  - [ ] Implement POST /v1/billing/create-subscription
  - [ ] Implement POST /v1/billing/cancel-subscription
  - [ ] Implement GET /v1/billing/subscription-status
  - [ ] Implement POST /v1/billing/webhook (Stripe events)
  - [ ] Add Stripe SDK integration
  - [ ] Create customer in Stripe on signup
  - [ ] Handle subscription lifecycle events

- [ ] **Frontend UI** (4.5 hours):
  - [ ] Create BillingDashboard component
  - [ ] Add subscription plan selector
  - [ ] Implement Stripe Elements payment form
  - [ ] Add payment history display
  - [ ] Create subscription status widget
  - [ ] Add cancel subscription flow
  - [ ] Show current plan details

### Testing (3 hours)
- [ ] Test subscription creation (test cards)
- [ ] Test payment form validation
- [ ] Test webhook handling (use Stripe CLI)
- [ ] Test failed payment scenarios
- [ ] Test subscription cancellation
- [ ] Test upgrade/downgrade flows
- [ ] Verify idempotency (no double charges)

### Documentation (1 hour)
- [ ] Document Stripe setup process
- [ ] Document subscription tiers
- [ ] Document webhook endpoints
- [ ] Add billing API to API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Create Subscription
```bash
TOKEN="<JWT token>"

# Create subscription
curl -X POST https://api.jaydenmetz.com/v1/billing/create-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price_id": "price_1234567890",
    "payment_method_id": "pm_card_visa"
  }'
# Expected: 200, subscription created, stripe_customer_id saved
```

### Test 2: Check Subscription Status
```bash
# Get current subscription
curl -X GET https://api.jaydenmetz.com/v1/billing/subscription-status \
  -H "Authorization: Bearer $TOKEN"
# Expected: Returns active subscription details
```

### Test 3: Webhook Processing
```bash
# Use Stripe CLI to trigger test webhook
stripe trigger payment_intent.succeeded

# Check database for recorded payment
psql $DATABASE_URL -c "SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;"
# Expected: Payment record created with correct status
```

## 📝 Implementation Notes

### Subscriptions Table Schema
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_price_id VARCHAR(255) NOT NULL,
  status VARCHAR(50), -- active, canceled, past_due, etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50), -- succeeded, failed, pending
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Subscription Tiers
- **Free**: $0/month - 1 user, 10 escrows/month, basic features
- **Pro**: $49/month - 5 users, unlimited escrows, advanced features
- **Enterprise**: $199/month - Unlimited users, all features, priority support

### Stripe Webhook Events
- `customer.subscription.created` → Activate subscription
- `customer.subscription.updated` → Update subscription status
- `customer.subscription.deleted` → Cancel subscription
- `invoice.payment_succeeded` → Record payment
- `invoice.payment_failed` → Notify user, retry billing

### Security Considerations
- Store Stripe secret key in environment variables
- Use Stripe webhook signatures to verify authenticity
- Never expose secret keys to frontend
- Use Stripe Elements for PCI-compliant payment forms
- Implement idempotency keys to prevent duplicate charges

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store API keys in .env (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY)
- [ ] Use apiInstance for API calls
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-31**:
- Billing API: Full coverage (create, cancel, status, webhook)
- Payment processing: Tested with Stripe test cards
- Webhook handling: Verified with Stripe CLI
- Frontend forms: Tested with Stripe Elements

## 🔗 Dependencies

### Depends On
- Phase B complete (Projects 16-30)
- Stripe account created and configured

### Blocks
- Project-37 (Expense Tracking - needs payment infrastructure)
- Project-38 (Invoice Generation - needs payment infrastructure)

### Parallel Work
- Can work alongside Projects 32-34 (Email, SMS, Calendar)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Phase B complete
- ✅ Stripe account created
- ✅ SSL/HTTPS enabled on production
- ✅ User authentication working

### Should Skip If:
- ❌ Not planning to charge for CRM
- ❌ No business entity (need for tax compliance)

### Optimal Timing:
- Immediately after Phase B completes
- Before implementing Expenses/Invoices (Projects 37-38)

## ✅ Success Criteria
- [ ] Subscriptions table created
- [ ] Stripe customer created on user signup
- [ ] Payment form accepts test cards
- [ ] Subscription created successfully
- [ ] Subscription status displayed in UI
- [ ] Webhooks processed correctly
- [ ] Failed payments handled gracefully
- [ ] Cancel subscription works
- [ ] Zero PCI compliance warnings
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Stripe secret keys in Railway environment variables
- [ ] Webhook endpoint URL configured in Stripe dashboard
- [ ] SSL certificate valid (https://)
- [ ] Test subscription created and canceled successfully
- [ ] Webhook signature verification working

### Post-Deployment Verification
- [ ] Test subscription on production domain
- [ ] Verify webhook events received
- [ ] Check Stripe dashboard for test transactions
- [ ] Confirm no errors in Railway logs
- [ ] Test payment failure scenario

### Rollback Triggers
- Payment processing fails >10% of attempts
- Webhook events not being received
- Double charging detected
- PCI compliance issues flagged

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Subscriptions table created
- [ ] Stripe integration working
- [ ] Payment form functional
- [ ] Webhooks processing correctly
- [ ] Billing dashboard displays data
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated
- [ ] MILESTONE ACHIEVED: Revenue generation enabled

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
