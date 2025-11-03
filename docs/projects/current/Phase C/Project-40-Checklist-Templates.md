# Project-40: Checklist Templates

**Phase**: C | **Priority**: MEDIUM | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Phase B complete, Project-18 (Escrows)

## 🎯 Goal
Create reusable checklist templates for escrow processes and listing workflows.

## 📋 Current → Target
**Now**: No checklist system
**Target**: Template library, checklist application to escrows, progress tracking
**Success Metric**: Checklists created; templates reusable; progress displayed; completion tracked

## 📖 Context
Real estate transactions follow standard processes: escrow checklists (inspection, appraisal, title, final walkthrough), listing checklists (photos, MLS entry, showings), etc. This project creates reusable checklist templates that can be applied to escrows/listings and tracked to completion.

Key features: Checklist templates, template library, checklist application, item completion tracking, and progress visualization.

## ⚠️ Risk Assessment

### Technical Risks
- **Template Complexity**: Too many template options
- **Data Model**: Checklist structure design

### Business Risks
- **Incomplete Checklists**: Missing critical steps
- **Checklist Fatigue**: Too many items demotivating

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-40-checklists-$(date +%Y%m%d)
git push origin pre-project-40-checklists-$(date +%Y%m%d)
pg_dump $DATABASE_URL -t checklist_templates -t checklists > backup-checklists-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-40-checklists-YYYYMMDD -- backend/src/controllers/checklists.controller.js
git push origin main
```

## ✅ Tasks

### Planning (1 hour)
- [ ] Design checklist_templates and checklists tables
- [ ] Define default templates
- [ ] Plan template application logic

### Implementation (5.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create checklist_templates table
  - [ ] Create checklist_template_items table
  - [ ] Create checklists table (applied instances)
  - [ ] Create checklist_items table (with completion status)
  - [ ] Create default templates migration

- [ ] **Backend API** (2 hours):
  - [ ] Implement GET /v1/checklist-templates
  - [ ] Implement POST /v1/checklists (apply template)
  - [ ] Implement PUT /v1/checklists/:id/items/:itemId (mark complete)
  - [ ] Implement GET /v1/escrows/:id/checklist

- [ ] **Frontend UI** (2.5 hours):
  - [ ] Create ChecklistWidget component
  - [ ] Add checklist progress bar
  - [ ] Add checklist items with checkboxes
  - [ ] Create template selector
  - [ ] Show completion percentage

### Testing (1.5 hours)
- [ ] Test template application
- [ ] Test item completion
- [ ] Test progress calculation
- [ ] Test checklist display

### Documentation (0.5 hours)
- [ ] Document default templates
- [ ] Add checklists API to API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Apply Checklist Template
```bash
TOKEN="<JWT token>"
ESCROW_ID="<escrow UUID>"

curl -X POST https://api.jaydenmetz.com/v1/checklists \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "buyer_escrow_template_id",
    "escrow_id": "'$ESCROW_ID'"
  }'
# Expected: 201, checklist created with all template items
```

### Test 2: Mark Item Complete
```bash
CHECKLIST_ID="<checklist UUID>"
ITEM_ID="<item UUID>"

curl -X PUT https://api.jaydenmetz.com/v1/checklists/$CHECKLIST_ID/items/$ITEM_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
# Expected: 200, item marked complete, progress updated
```

### Test 3: Get Checklist Progress
```bash
curl -X GET https://api.jaydenmetz.com/v1/escrows/$ESCROW_ID/checklist \
  -H "Authorization: Bearer $TOKEN"
# Expected: Checklist with completion percentage (e.g., 8/15 items = 53%)
```

## 📝 Implementation Notes

### Checklists Tables Schema
```sql
CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- escrow_buyer, escrow_seller, listing, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE checklist_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES checklist_templates(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  order_index INTEGER,
  category VARCHAR(50) -- pre_approval, inspection, closing, etc.
);

CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES checklist_templates(id),
  escrow_id UUID REFERENCES escrows(id),
  listing_id UUID REFERENCES listings(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  order_index INTEGER
);
```

### Default Templates

**Buyer Escrow Checklist**:
1. Pre-approval letter received
2. Purchase offer submitted
3. Earnest money deposited
4. Home inspection scheduled
5. Inspection completed and reviewed
6. Appraisal ordered
7. Appraisal received
8. Final walkthrough scheduled
9. Final walkthrough completed
10. Title review completed
11. Closing documents signed
12. Funds wired
13. Keys received

**Seller Escrow Checklist**:
1. Listing agreement signed
2. Disclosures completed
3. Offer accepted
4. Inspection scheduled
5. Repairs completed
6. Appraisal scheduled
7. Title cleared
8. Final walkthrough scheduled
9. Closing documents signed
10. Proceeds received

**New Listing Checklist**:
1. Photography scheduled
2. Photos received
3. MLS entry created
4. Yard sign ordered
5. Lockbox installed
6. First showing scheduled
7. Open house advertised

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use apiInstance for API calls
- [ ] Follow existing patterns

## 🧪 Test Coverage Impact
**After Project-40**: Checklist API fully tested

## 🔗 Dependencies

### Depends On
- Phase B complete
- Project-18 (Escrows)

### Blocks
- None

### Parallel Work
- Can work alongside Projects 36-39, 41

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Escrows module working
- ✅ Have defined escrow processes

### Should Skip If:
- ❌ Processes too variable for templates

### Optimal Timing:
- After Project-18 (Escrows) stable
- 1 day of work (10 hours)

## ✅ Success Criteria
- [ ] Checklist tables created
- [ ] Default templates loaded
- [ ] Template application working
- [ ] Item completion functional
- [ ] Progress calculation accurate
- [ ] Checklist widget displays
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Templates created
- [ ] Checklist system working
- [ ] Progress tracked correctly
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
