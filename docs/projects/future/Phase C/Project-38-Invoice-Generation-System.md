# Project-38: Invoice Generation System

**Phase**: C | **Priority**: HIGH | **Status**: Not Started
**Est**: 10 hrs + 3 hrs = 13 hrs | **Deps**: Project-31 (Stripe - payment infrastructure)

## 🎯 Goal
Build invoice generation system with PDF templates and payment tracking.

## 📋 Current → Target
**Now**: No invoice functionality
**Target**: Professional PDF invoices, payment tracking, automated reminders
**Success Metric**: Invoices generated as PDFs; payment status tracked; clients can pay online

## 📖 Context
Professional invoices are essential for real estate business: commission invoices to sellers, service invoices to clients, vendor invoices for reimbursements. This project creates an invoice generation system with PDF templates, payment tracking, and integration with Stripe for online payments.

Key features: Invoice templates, PDF generation, payment status tracking, payment link generation, automated reminders, and invoice history.

## ⚠️ Risk Assessment

### Technical Risks
- **PDF Generation**: Complex layouts
- **Payment Link Security**: Invoice tampering
- **Template Formatting**: Broken PDFs

### Business Risks
- **Tax Compliance**: Missing invoice fields
- **Payment Delays**: Clients not paying
- **Professional Image**: Ugly invoices

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-38-invoices-$(date +%Y%m%d)
git push origin pre-project-38-invoices-$(date +%Y%m%d)
pg_dump $DATABASE_URL -t invoices > backup-invoices-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-38-invoices-YYYYMMDD -- backend/src/services/invoice.service.js
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Design invoices table schema
- [ ] Choose PDF library (PDFKit, Puppeteer)
- [ ] Design invoice template layout
- [ ] Plan payment tracking integration

### Implementation (6.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create invoices table
  - [ ] Create invoice_items table
  - [ ] Add payment_status column

- [ ] **Backend API** (3.5 hours):
  - [ ] Implement POST /v1/invoices (create)
  - [ ] Implement GET /v1/invoices/:id/pdf (generate PDF)
  - [ ] Implement POST /v1/invoices/:id/payment-link
  - [ ] Implement PUT /v1/invoices/:id/mark-paid
  - [ ] Add PDF generation logic (PDFKit)
  - [ ] Integrate with Stripe for payment links

- [ ] **Frontend UI** (2 hours):
  - [ ] Create InvoiceCreator component
  - [ ] Add invoice form with line items
  - [ ] Add PDF preview
  - [ ] Create invoice list with status
  - [ ] Add payment link display

### Testing (2 hours)
- [ ] Test invoice creation
- [ ] Test PDF generation
- [ ] Test payment link generation
- [ ] Test payment status updates
- [ ] Test invoice templates

### Documentation (1 hour)
- [ ] Document invoice fields
- [ ] Add invoice API to API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Create Invoice
```bash
TOKEN="<JWT token>"

curl -X POST https://api.jaydenmetz.com/v1/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "John Smith",
    "client_email": "john@example.com",
    "items": [
      {"description": "Agent Commission", "amount": 15000.00}
    ],
    "due_date": "2025-04-01"
  }'
# Expected: 201, invoice created with invoice number
```

### Test 2: Generate PDF
```bash
INVOICE_ID="<invoice UUID>"

curl -X GET https://api.jaydenmetz.com/v1/invoices/$INVOICE_ID/pdf \
  -H "Authorization: Bearer $TOKEN" \
  -o invoice.pdf
# Expected: Professional PDF downloaded
```

### Test 3: Create Payment Link
```bash
curl -X POST https://api.jaydenmetz.com/v1/invoices/$INVOICE_ID/payment-link \
  -H "Authorization: Bearer $TOKEN"
# Expected: Stripe payment link URL returned
```

## 📝 Implementation Notes

### Invoices Tables Schema
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL, -- INV-2025-001
  user_id UUID REFERENCES users(id),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  total_amount DECIMAL(12,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, overdue
  stripe_payment_link VARCHAR(500),
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL
);
```

### PDF Template Components
- Company logo and details
- Invoice number and date
- Client information
- Line items table (description, quantity, price, total)
- Subtotal, tax, total
- Payment instructions
- Due date
- Notes/terms

### Invoice Numbering
- Format: `INV-YYYY-NNN` (e.g., INV-2025-001)
- Sequential numbering per year
- Unique constraint enforced

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use DECIMAL for money
- [ ] Use apiInstance for API calls

## 🧪 Test Coverage Impact
**After Project-38**: Invoice API fully tested

## 🔗 Dependencies

### Depends On
- Project-31 (Stripe - payment links)

### Blocks
- None

### Parallel Work
- Can work alongside Projects 36-37, 39-41

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Payment system working (Project-31)
- ✅ Have client data (Project-20)

### Should Skip If:
- ❌ Not invoicing clients

### Optimal Timing:
- After Project-31 completes
- 1-2 days of work (13 hours)

## ✅ Success Criteria
- [ ] Invoices table created
- [ ] Invoice creation working
- [ ] PDF generation functional
- [ ] Payment links created
- [ ] Payment status tracked
- [ ] Professional PDF layout
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Invoices generating
- [ ] PDFs professional quality
- [ ] Payment links working
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
