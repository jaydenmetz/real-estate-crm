# Phase 2: Widget Redesign & Database Integration

**Status:** Ready to implement
**Created:** October 18, 2025
**Goal:** Compact widgets with detailed popups + full database integration

## Current Status (Phase 1 Complete)

✅ Blue/white theme standardized
✅ Timeline carousel with drag scrolling
✅ Professional F-pattern layout (sidebars beside hero)
✅ All milestones visible in timeline

## Phase 2 Requirements

### 1. People Widget - Compact List
**Current:** Large cards with lots of white space
**Target:** Clean contact list with avatars

**Design:**
- Contact list with avatar on left
- Name + role badge on right
- Phone number below name
- Click widget → Full contact details popup
- Height: ~300px (fits 4-5 contacts)

**Mock Data:**
```javascript
contacts: [
  { name: 'John Smith', role: 'Buyer', phone: '(555) 123-4567', email: 'john@example.com' },
  { name: 'Sarah Johnson', role: 'Seller', phone: '(555) 234-5678', email: 'sarah@example.com' },
  { name: 'Mike Chen', role: 'Lender', phone: '(555) 345-6789', email: 'mike@loanbank.com' },
  { name: 'Lisa Brown', role: 'Title Officer', phone: '(555) 456-7890', email: 'lisa@titleco.com' }
]
```

### 2. Financials Widget - Agent GCI Focus
**Current:** Transaction financials (purchase price, down payment, etc.)
**Target:** Agent's commission breakdown

**Design (Based on Screenshot):**
```
Deal Cost Breakdown          Amount
Base Commission             $2,779.20
Net Commission              $2,779.20
Deal Expense               -$173.70
  Franchise Fees (-$173.70)
Deal Net                    $2,605.50

Agent Cost Breakdown         Amount
Deal Net                    $2,605.50
Agent GCI                   $2,605.50
Jayden Metz's Split         $2,084.40
  Agent Commission - 80% ($2,084.40)
  Transaction Fee (-$285.00)
  TC Fee (-$250.00)
Agent 1099 Income           $1,549.40
Agent Net                   $1,549.40
```

**Click Widget → Detailed Commission Popup**
- Full breakdown like screenshot
- Editable fields (commission %, fees)
- Save updates to database

### 3. Documents Widget - Clean Summary
**Current:** Category cards with progress bars
**Target:** Simple document counts

**Design:**
```
Documents                    16/33 uploaded

📄 Purchase Agreement        5/5   ✓
📋 Disclosures              6/8   ⚠
🏠 Inspection Reports        2/4   ⚠
💰 Loan Documents           3/10   ⚠
📝 Closing Documents        0/6   ❌
```

**Click Widget → Full Checklist Popup**
- Skyslopes-style checklist
- Upload button per document
- Check/uncheck completed items
- Filter by category

## Database Integration Plan

### API Endpoints Needed

**People:**
```
GET /v1/escrows/:id/people
POST /v1/escrows/:id/people
PUT /v1/escrows/:id/people/:personId
DELETE /v1/escrows/:id/people/:personId
```

**Financials:**
```
GET /v1/escrows/:id/financials
PUT /v1/escrows/:id/financials
```

**Documents:**
```
GET /v1/escrows/:id/documents
POST /v1/escrows/:id/documents/upload
PUT /v1/escrows/:id/documents/:docId
DELETE /v1/escrows/:id/documents/:docId
```

### Database Schema Updates

**escrows table (add columns):**
```sql
-- Agent financials
agent_commission_percent DECIMAL(5,2) DEFAULT 80.00,
transaction_fee DECIMAL(10,2) DEFAULT 285.00,
tc_fee DECIMAL(10,2) DEFAULT 250.00,
franchise_fee DECIMAL(10,2),
agent_1099_income DECIMAL(10,2) GENERATED ALWAYS AS (
  (purchase_price * commission_rate * agent_commission_percent / 10000) 
  - transaction_fee - tc_fee
) STORED
```

**escrow_people table (NEW):**
```sql
CREATE TABLE escrow_people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  escrow_id UUID REFERENCES escrows(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- buyer, seller, lender, title_officer, etc.
  phone VARCHAR(20),
  email VARCHAR(255),
  company VARCHAR(255),
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_escrow_people_escrow_id ON escrow_people(escrow_id);
```

**escrow_documents table (NEW):**
```sql
CREATE TABLE escrow_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  escrow_id UUID REFERENCES escrows(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- purchase, disclosures, inspection, loan, closing
  name VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  uploaded BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_escrow_documents_escrow_id ON escrow_documents(escrow_id);
CREATE INDEX idx_escrow_documents_category ON escrow_documents(category);
```

## Implementation Steps

### Step 1: Create Compact Widgets (Frontend Only)
- [ ] PeopleWidget - compact list design
- [ ] FinancialsWidget - agent GCI focus
- [ ] DocumentsWidget - summary counts
- [ ] Reduce padding/spacing (theme.spacing(2) → theme.spacing(1.5))

### Step 2: Create Detail Popups
- [ ] CommissionBreakdownModal - full financial details
- [ ] DocumentChecklistModal - Skyslopes-style list
- [ ] ContactDetailsModal - full contact form

### Step 3: Database Schema
- [ ] Create escrow_people table
- [ ] Create escrow_documents table
- [ ] Add agent financials columns to escrows

### Step 4: Backend API Routes
- [ ] People CRUD endpoints
- [ ] Financials update endpoint
- [ ] Documents CRUD + upload endpoints

### Step 5: Connect Frontend to Backend
- [ ] Update widgets to fetch real data
- [ ] Connect modals to API for updates
- [ ] Add loading states
- [ ] Add error handling

### Step 6: File Upload
- [ ] Set up S3/Cloudinary/Railway storage
- [ ] Add file upload to documents modal
- [ ] Display uploaded files with preview

## Success Criteria

✅ Widgets are compact (height ~300-400px each)
✅ White space reduced (tighter spacing)
✅ All data from database (no mock data)
✅ Popups work for detailed editing
✅ Commission breakdown matches screenshot exactly
✅ Document checklist looks like Skyslopes
✅ File uploads working

## Estimated Time

- Compact widgets: 2-3 hours
- Database schema: 1 hour
- Backend API: 3-4 hours
- Frontend integration: 2-3 hours
- Testing: 1-2 hours

**Total: 9-13 hours (1-2 days)**

## Next Session: Start Here

1. Create compact PeopleWidget.jsx
2. Create compact FinancialsWidget.jsx (agent GCI focus)
3. Create compact DocumentsWidget.jsx
4. Test layout with reduced spacing
5. Then move to database integration

