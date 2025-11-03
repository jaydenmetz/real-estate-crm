# Project-23: Contacts Multi-Role Verification

**Phase**: B | **Priority**: MEDIUM | **Status**: Not Started
**Est**: 6 hrs + 1.5 hrs = 7.5 hrs | **Deps**: Projects 18-22 (All core modules complete)

## 🎯 Goal
Verify contacts can have multiple roles (buyer, seller, agent, broker) across different escrows.

## 📋 Current → Target
**Now**: ContactSelectionModal uses mock data, contacts table not built
**Target**: Real contacts table with multi-role support, ContactSelectionModal fetches real data
**Success Metric**: Contact can be buyer on one escrow, seller on another; role assignment works

## 📖 Context
Contacts are people in the system who can play different roles in different transactions. A person might be a buyer on their first home purchase (Escrow #1), then later a seller when they upgrade (Escrow #2). An agent might also be a buyer for their own investment property. The contacts table must support this many-to-many relationship between people and escrows with different roles.

Currently, ContactSelectionModal uses hardcoded mock data. This project implements the real contacts table, updates ContactSelectionModal to fetch from the database, and ensures the multi-role relationship works properly through the `escrow_people` join table.

## ⚠️ Risk Assessment

### Technical Risks
- **Data Migration**: Existing escrow_people records need contacts
- **Role Conflicts**: Validation needed for invalid role combinations
- **Performance**: Contact search with large database

### Business Risks
- **Data Loss**: Migration fails, people lose association with escrows
- **Role Confusion**: Same person showing as buyer and seller on same escrow
- **UI Breakage**: ContactSelectionModal breaks during transition

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-23-contacts-multi-role-$(date +%Y%m%d)
git push origin pre-project-23-contacts-multi-role-$(date +%Y%m%d)

# Backup all contact-related tables
pg_dump $DATABASE_URL -t contacts -t escrow_people > backup-contacts-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-23-contacts-multi-role-YYYYMMDD -- frontend/src/components/modals/ContactSelectionModal.jsx
git checkout pre-project-23-contacts-multi-role-YYYYMMDD -- backend/src/controllers/contacts.controller.js
psql $DATABASE_URL < backup-contacts-YYYYMMDD.sql
git push origin main
```

### Recovery Checklist
- [ ] Verify ContactSelectionModal loads
- [ ] Test escrow_people associations intact
- [ ] Check no orphaned records

## ✅ Tasks

### Planning (1 hour)
- [ ] Create backup tag
- [ ] Design contacts table schema
- [ ] Review escrow_people join table
- [ ] Plan migration from mock data to real database
- [ ] Document multi-role use cases

### Implementation (4 hours)
- [ ] **Contacts Table** (1 hour):
  - [ ] Create contacts migration if not exists
  - [ ] Verify columns: id, first_name, last_name, email, phone, company
  - [ ] Add indexes for performance (email, name search)
  - [ ] Seed with test contacts

- [ ] **API Endpoints** (1.5 hours):
  - [ ] Implement GET /v1/contacts (list with search)
  - [ ] Implement GET /v1/contacts/:id (detail)
  - [ ] Implement POST /v1/contacts (create new)
  - [ ] Implement PUT /v1/contacts/:id (update)
  - [ ] Implement DELETE /v1/contacts/:id (soft delete)
  - [ ] Add search/filter by name, email, company

- [ ] **ContactSelectionModal Update** (1.5 hours):
  - [ ] Remove mock data
  - [ ] Add API call to fetch real contacts
  - [ ] Implement search functionality
  - [ ] Add "Create New Contact" flow
  - [ ] Update role assignment logic
  - [ ] Test multi-role assignment

### Testing (1.5 hours)
- [ ] Test contact CRUD operations
- [ ] Test ContactSelectionModal with real data
- [ ] Test multi-role scenarios:
  - [ ] Person is buyer on Escrow #1, seller on Escrow #2
  - [ ] Person is agent on Escrow #1, buyer on Escrow #2
  - [ ] Person has 3+ roles across different escrows
- [ ] Test search/filter performance
- [ ] Test role validation (no duplicate roles on same escrow)

### Documentation (0.5 hours)
- [ ] Document contacts table schema
- [ ] Document multi-role relationship model
- [ ] Add examples of valid role combinations

## 🧪 Verification Tests

### Test 1: Contacts CRUD
```bash
TOKEN="<JWT token>"

# CREATE contact
curl -X POST https://api.jaydenmetz.com/v1/contacts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.j@example.com",
    "phone": "(661) 555-1111",
    "company": "Johnson Realty"
  }' -w "\n%{http_code}\n"
# Expected: 201, returns contact ID

# SEARCH contacts
curl -X GET "https://api.jaydenmetz.com/v1/contacts?search=Johnson" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200, returns matching contacts
```

### Test 2: Multi-Role Assignment
```bash
# Create contact
CONTACT_ID="<contact UUID>"
ESCROW_1="<escrow 1 UUID>"
ESCROW_2="<escrow 2 UUID>"

# Assign as buyer on Escrow #1
curl -X POST https://api.jaydenmetz.com/v1/escrows/$ESCROW_1/people \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "'$CONTACT_ID'",
    "role": "buyer"
  }'

# Assign same person as seller on Escrow #2
curl -X POST https://api.jaydenmetz.com/v1/escrows/$ESCROW_2/people \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "'$CONTACT_ID'",
    "role": "seller"
  }'

# Verify both assignments exist
curl -X GET https://api.jaydenmetz.com/v1/contacts/$CONTACT_ID/escrows \
  -H "Authorization: Bearer $TOKEN"
# Expected: Returns both escrows with different roles
```

### Test 3: ContactSelectionModal Works
```bash
# Visit escrow detail page: https://crm.jaydenmetz.com/escrows/<id>
# Click "Add Person" button
# Verify ContactSelectionModal opens
# Search for contact by name
# Select contact and assign role (buyer, seller, agent, etc.)
# Verify person appears in People Grid widget
# Check no console errors
```

## 📝 Implementation Notes

### Contacts Table Schema
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP WITH TIME ZONE -- soft delete
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contacts_company ON contacts(company);
```

### Escrow-People Relationship
```sql
CREATE TABLE escrow_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID REFERENCES escrows(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  role VARCHAR(50) NOT NULL, -- buyer, seller, buyer_agent, seller_agent, lender, title
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(escrow_id, contact_id, role) -- prevent duplicate role assignments
);
```

### Multi-Role Examples
1. **Sarah Johnson**: Buyer on Escrow #1 (2024), Seller on Escrow #2 (2025)
2. **Mike Chen** (Agent): Buyer_agent on 10 escrows, Buyer on his own investment property
3. **Linda Garcia**: Lender on 50 escrows, Buyer on 1 personal purchase

### Role Validation Rules
- ✅ Same person can have different roles on different escrows
- ✅ Same person can have multiple roles on same escrow (e.g., buyer + buyer_agent if representing self)
- ❌ Same person cannot have same role twice on same escrow (prevented by UNIQUE constraint)

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Edit ContactSelectionModal.jsx in place
- [ ] Use apiInstance for contact API calls
- [ ] Remove mock data cleanly

## 🧪 Test Coverage Impact
**After Project-23**:
- Contacts API: Full CRUD coverage
- Multi-role: All scenarios tested
- ContactSelectionModal: Real data, search working

## 🔗 Dependencies

### Depends On
- Projects 18-22 (All core modules, especially escrows)

### Blocks
- Project-24 (Documents need contacts for permissions)

### Parallel Work
- Can work alongside Projects 24-26

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Projects 18-22 complete (all modules verified)
- ✅ Escrows module working perfectly
- ✅ escrow_people table exists

### Should Skip If:
- ❌ Core modules have critical bugs
- ❌ Database migrations failing

### Optimal Timing:
- After completing all 5 core module checks (Projects 18-22)
- 1 day of work (7.5 hours)

## ✅ Success Criteria
- [ ] Contacts table created and populated
- [ ] Contacts CRUD API working
- [ ] ContactSelectionModal fetches real data
- [ ] Search/filter functionality works
- [ ] Multi-role assignment works (person can have different roles on different escrows)
- [ ] Role validation prevents duplicates on same escrow
- [ ] No console errors
- [ ] Performance acceptable (<500ms contact search)
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Contacts table created
- [ ] API endpoints implemented
- [ ] ContactSelectionModal updated
- [ ] Multi-role scenarios tested
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated
- [ ] Mock data removed

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
