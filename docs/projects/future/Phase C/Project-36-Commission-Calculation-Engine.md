# Project-36: Commission Calculation Engine

**Phase**: C | **Priority**: HIGH | **Status**: Not Started
**Est**: 10 hrs + 3 hrs = 13 hrs | **Deps**: Project-35 (MLS), Project-18 (Escrows)

## 🎯 Goal
Build commission calculation engine with split handling and approval workflow.

## 📋 Current → Target
**Now**: Manual commission calculations
**Target**: Automated commission calc with splits, approval workflow, reporting
**Success Metric**: Commissions calculated accurately; splits distributed correctly; approval workflow enforced

## 📖 Context
Commission calculations are complex: buyer/seller agent splits, broker splits, transaction coordinator fees, referral fees, etc. This project builds an engine to automate these calculations based on configurable rules, handle multi-party splits, and provide an approval workflow for broker review.

Key features: Commission rules engine, split calculation, approval workflow, commission reports, and integration with escrows and MLS data.

## ⚠️ Risk Assessment

### Technical Risks
- **Calculation Errors**: Incorrect commission amounts
- **Split Logic Bugs**: Wrong distribution percentages
- **Rounding Errors**: Cents don't add up
- **Rule Complexity**: Too many configuration options

### Business Risks
- **Financial Disputes**: Agents challenging calculations
- **Broker Liability**: Incorrect payouts
- **Tax Complications**: 1099 reporting errors
- **Trust Issues**: Agents doubting accuracy

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-36-commissions-$(date +%Y%m%d)
git push origin pre-project-36-commissions-$(date +%Y%m%d)

# Backup commissions tables
pg_dump $DATABASE_URL -t commissions -t commission_splits > backup-commissions-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-36-commissions-YYYYMMDD -- backend/src/services/commission.service.js
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Design commissions and commission_splits tables
- [ ] Define commission calculation rules
- [ ] Plan split logic (percentages, fixed amounts)
- [ ] Design approval workflow states
- [ ] Map commission types (buyer, seller, referral)

### Implementation (6.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create commissions table
  - [ ] Create commission_splits table
  - [ ] Create commission_rules table
  - [ ] Add commission_status to escrows table

- [ ] **Backend API** (3.5 hours):
  - [ ] Implement POST /v1/commissions/calculate
  - [ ] Implement GET /v1/commissions/:escrow_id
  - [ ] Implement PUT /v1/commissions/:id/approve
  - [ ] Implement GET /v1/commissions/reports
  - [ ] Add commission calculation logic
  - [ ] Add split distribution logic
  - [ ] Implement approval workflow

- [ ] **Frontend UI** (2 hours):
  - [ ] Create CommissionCalculator component
  - [ ] Add commission breakdown display
  - [ ] Add split configuration UI
  - [ ] Create approval workflow UI
  - [ ] Add commission reports page

### Testing (2 hours)
- [ ] Test commission calculations (various scenarios)
- [ ] Test split distribution (verify totals = 100%)
- [ ] Test approval workflow
- [ ] Test rounding (verify no cent discrepancies)
- [ ] Test edge cases (zero commission, 100% splits)

### Documentation (1 hour)
- [ ] Document commission rules
- [ ] Document split logic
- [ ] Add commission API to API_REFERENCE.md
- [ ] Create commission calculation examples

## 🧪 Verification Tests

### Test 1: Calculate Commission
```bash
TOKEN="<JWT token>"
ESCROW_ID="<escrow UUID>"

# Calculate commission
curl -X POST https://api.jaydenmetz.com/v1/commissions/calculate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "escrow_id": "'$ESCROW_ID'",
    "sale_price": 500000,
    "commission_rate": 0.03,
    "splits": [
      {"agent_id": "agent1", "percentage": 50},
      {"agent_id": "agent2", "percentage": 30},
      {"agent_id": "broker", "percentage": 20}
    ]
  }'
# Expected: 200, commission breakdown with splits
```

### Test 2: Approve Commission
```bash
COMMISSION_ID="<commission UUID>"

# Approve commission
curl -X PUT https://api.jaydenmetz.com/v1/commissions/$COMMISSION_ID/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved_by": "broker_user_id",
    "notes": "Approved for payout"
  }'
# Expected: 200, status = approved
```

### Test 3: Commission Report
```bash
# Get commission report for date range
curl -X GET "https://api.jaydenmetz.com/v1/commissions/reports?start_date=2025-01-01&end_date=2025-12-31" \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of commissions with totals by agent
```

## 📝 Implementation Notes

### Commissions Tables Schema
```sql
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID REFERENCES escrows(id) ON DELETE CASCADE,
  sale_price DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,4), -- 0.0300 = 3%
  total_commission DECIMAL(12,2) NOT NULL,
  status VARCHAR(50), -- pending, approved, paid
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE commission_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID REFERENCES commissions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES users(id),
  split_type VARCHAR(50), -- percentage, fixed_amount
  split_value DECIMAL(12,2), -- 50.00 = 50% or $5000.00 fixed
  amount DECIMAL(12,2) NOT NULL, -- Calculated amount
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES users(id),
  rule_name VARCHAR(255),
  default_commission_rate DECIMAL(5,4),
  broker_split_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Commission Calculation Examples

**Example 1: Simple 50/50 Split**
- Sale Price: $500,000
- Commission Rate: 3% ($15,000)
- Agent 1: 50% = $7,500
- Agent 2: 50% = $7,500

**Example 2: Broker + Agent Split**
- Sale Price: $400,000
- Commission Rate: 2.5% ($10,000)
- Agent: 70% = $7,000
- Broker: 30% = $3,000

**Example 3: Three-Way Split**
- Sale Price: $600,000
- Commission Rate: 3% ($18,000)
- Listing Agent: 40% = $7,200
- Buyer Agent: 40% = $7,200
- Referral Fee: 20% = $3,600

### Approval Workflow States
1. **Pending**: Commission calculated, awaiting approval
2. **Approved**: Broker approved, ready for payout
3. **Paid**: Commission disbursed to agents
4. **Disputed**: Calculation challenged, under review

### Rounding Rules
- All amounts rounded to nearest cent (2 decimals)
- Ensure splits total exactly 100%
- If rounding creates discrepancy, adjust largest split

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use DECIMAL for money (not FLOAT)
- [ ] Use apiInstance for API calls
- [ ] Follow existing service pattern

## 🧪 Test Coverage Impact
**After Project-36**:
- Commission API: Full coverage
- Split calculations: Tested (10+ scenarios)
- Approval workflow: Verified

## 🔗 Dependencies

### Depends On
- Project-35 (MLS - uses property data)
- Project-18 (Escrows - commission linked to transactions)

### Blocks
- None

### Parallel Work
- Can work alongside Projects 37-41

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Escrows module working
- ✅ MLS integration complete (for sale prices)
- ✅ Commission rules defined

### Should Skip If:
- ❌ Not managing commissions in CRM
- ❌ Using external commission software

### Optimal Timing:
- After Project-35 (MLS) completes
- 1-2 days of work (13 hours)

## ✅ Success Criteria
- [ ] Commissions tables created
- [ ] Commission calculation accurate (100% test cases pass)
- [ ] Splits total 100% (no rounding errors)
- [ ] Approval workflow functional
- [ ] Reports display correct totals
- [ ] Broker can approve/dispute
- [ ] Zero calculation errors
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Commissions tables created
- [ ] Calculations verified accurate
- [ ] Splits tested extensively
- [ ] Approval workflow working
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
