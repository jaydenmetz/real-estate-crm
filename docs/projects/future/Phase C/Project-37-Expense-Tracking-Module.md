# Project-37: Expense Tracking Module

**Phase**: C | **Priority**: MEDIUM | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Project-31 (Stripe - payment infrastructure)

## 🎯 Goal
Implement expense tracking with receipt uploads, categories, and approval flow.

## 📋 Current → Target
**Now**: No expense tracking
**Target**: Receipt uploads, expense categories, approval workflow, expense reports
**Success Metric**: Agents can upload receipts; expenses categorized; brokers can approve; reports generated

## 📖 Context
Real estate agents have business expenses: marketing, gas, staging, photography, etc. This project creates an expense tracking module for recording expenses, uploading receipts, categorizing costs, and generating expense reports for tax purposes. Includes broker approval for reimbursable expenses.

Key features: Expense entry, receipt upload (photos/PDFs), expense categories, approval workflow, expense reports, and tax deduction tracking.

## ⚠️ Risk Assessment

### Technical Risks
- **File Storage**: Receipt storage costs
- **OCR Accuracy**: Reading receipt amounts
- **Data Loss**: Receipts not saved properly

### Business Risks
- **Tax Audit**: Missing receipts
- **Reimbursement Disputes**: Lost expense records
- **Budget Overruns**: Untracked spending

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-37-expenses-$(date +%Y%m%d)
git push origin pre-project-37-expenses-$(date +%Y%m%d)
pg_dump $DATABASE_URL -t expenses > backup-expenses-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-37-expenses-YYYYMMDD -- backend/src/controllers/expenses.controller.js
git push origin main
```

## ✅ Tasks

### Planning (1 hour)
- [ ] Design expenses table schema
- [ ] Define expense categories
- [ ] Plan receipt storage strategy
- [ ] Design approval workflow

### Implementation (5.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create expenses table
  - [ ] Add receipt_url column
  - [ ] Add approval workflow columns

- [ ] **Backend API** (2.5 hours):
  - [ ] Implement POST /v1/expenses (create with receipt upload)
  - [ ] Implement GET /v1/expenses (list with filters)
  - [ ] Implement PUT /v1/expenses/:id/approve
  - [ ] Implement GET /v1/expenses/reports

- [ ] **Frontend UI** (2 hours):
  - [ ] Create ExpenseTracker component
  - [ ] Add expense entry form with receipt upload
  - [ ] Add expense list with filters
  - [ ] Create approval workflow UI
  - [ ] Add expense reports page

### Testing (1.5 hours)
- [ ] Test expense creation with receipt
- [ ] Test approval workflow
- [ ] Test expense reports
- [ ] Test file upload limits

### Documentation (0.5 hours)
- [ ] Document expense categories
- [ ] Add expense API to API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Create Expense
```bash
TOKEN="<JWT token>"

curl -X POST https://api.jaydenmetz.com/v1/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -F "amount=45.50" \
  -F "category=gas" \
  -F "description=Client showing drive" \
  -F "receipt=@receipt.jpg" \
  -F "expense_date=2025-03-15"
# Expected: 201, expense created with receipt URL
```

### Test 2: Expense Report
```bash
curl -X GET "https://api.jaydenmetz.com/v1/expenses/reports?year=2025" \
  -H "Authorization: Bearer $TOKEN"
# Expected: Expense totals by category, monthly breakdown
```

### Test 3: Approve Expense
```bash
EXPENSE_ID="<expense UUID>"

curl -X PUT https://api.jaydenmetz.com/v1/expenses/$EXPENSE_ID/approve \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200, status = approved
```

## 📝 Implementation Notes

### Expenses Table Schema
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50), -- gas, marketing, staging, photography, meals, other
  description TEXT,
  receipt_url VARCHAR(500),
  expense_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, reimbursed
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Expense Categories
- Gas/Mileage
- Marketing (signs, flyers, ads)
- Staging
- Photography
- Meals (client dinners)
- Office Supplies
- MLS Fees
- Other

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use DECIMAL for money
- [ ] Use apiInstance for API calls

## 🧪 Test Coverage Impact
**After Project-37**: Expense API fully tested

## 🔗 Dependencies

### Depends On
- Project-31 (Stripe - payment infrastructure)

### Blocks
- None

### Parallel Work
- Can work alongside Projects 36, 38-41

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Payment system working (Project-31)
- ✅ File storage configured

### Should Skip If:
- ❌ Not tracking business expenses

### Optimal Timing:
- After Project-31 completes
- 1 day of work (10 hours)

## ✅ Success Criteria
- [ ] Expenses table created
- [ ] Expense entry working
- [ ] Receipts uploaded and stored
- [ ] Approval workflow functional
- [ ] Reports accurate
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Expenses tracking working
- [ ] Receipts uploading
- [ ] Approval workflow tested
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
