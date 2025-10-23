# Multi-Role Contacts: Remaining Implementation

**Current Status:** Phase 1 Complete (Database) ✅
**Next:** Phases 2-6 (30-40 minutes total)

---

## ✅ PHASE 1 COMPLETE (5 minutes)

**Database Migration:**
- ✅ Created 3 tables (contact_roles, contact_role_assignments, contact_validation_preferences)
- ✅ Seeded 14 roles with your exact requirements
- ✅ Migrated 43 existing contacts
- ✅ All contacts now support multiple roles

**Verification:**
```sql
SELECT * FROM contact_roles; -- 14 rows
SELECT * FROM contact_role_assignments; -- 43 rows
SELECT * FROM contacts_with_all_roles; -- Works
```

---

## 🚧 PHASE 2: Backend APIs (10 minutes)

### Files to Create/Update:

**1. `/backend/src/controllers/contact-roles.controller.js` (NEW)**
```javascript
// List all available roles
exports.list = async (req, res) => {
  // SELECT * FROM contact_roles WHERE is_active = true ORDER BY sort_order
};

// Get role by ID
exports.getById = async (req, res) => {
  // SELECT * FROM contact_roles WHERE id = $1
};
```

**2. `/backend/src/controllers/contacts.controller.js` (UPDATE)**

Add these new methods:

```javascript
// Search contacts by role + name
exports.search = async (req, res) => {
  const { role, name, email } = req.query;
  //SELECT c.* FROM contacts c
  //JOIN contact_role_assignments cra ON c.id = cra.contact_id
  //JOIN contact_roles cr ON cra.role_id = cr.id
  //WHERE cr.role_name = $1 AND c.full_name ILIKE $2
};

// Get all roles for a contact
exports.getRoles = async (req, res) => {
  // SELECT * FROM contacts_with_all_roles WHERE contact_id = $1
};

// Add role to contact
exports.addRole = async (req, res) => {
  const { role_id, role_metadata, is_primary } = req.body;
  // INSERT INTO contact_role_assignments (contact_id, role_id, role_metadata, is_primary)
  // If is_primary = true, set all other roles to is_primary = false first
};

// Remove role from contact
exports.removeRole = async (req, res) => {
  // DELETE FROM contact_role_assignments WHERE contact_id = $1 AND role_id = $2
};

// Set primary role
exports.setPrimaryRole = async (req, res) => {
  const { role_id } = req.body;
  // UPDATE contact_role_assignments SET is_primary = false WHERE contact_id = $1
  // UPDATE contact_role_assignments SET is_primary = true WHERE contact_id = $1 AND role_id = $2
};
```

**3. `/backend/src/app.js` (UPDATE)**

Add route registration:
```javascript
app.use('/v1/contact-roles', require('./routes/contact-roles.routes'));
```

---

## 🚧 PHASE 3: CreateContactModal (10 minutes)

**File:** `/frontend/src/components/common/modals/CreateContactModal.jsx` (NEW)

**Features:**
1. **Role Selector** (Step 0)
   - Dropdown with all 14 roles
   - Fetch from `/v1/contact-roles`
   - Shows icon + display name

2. **Dynamic Fields** (Step 1)
   - Fetch role definition: `/v1/contact-roles/:id`
   - Show/hide fields based on `required_fields`, `hidden_fields`
   - Add `required` attribute dynamically

3. **Multi-Role Support** (Step 2)
   - Checkboxes for additional roles
   - Primary role radio button
   - Role-specific metadata per role

4. **Review** (Step 3)
   - Show all fields + roles
   - Submit button

**API Call on Submit:**
```javascript
POST /v1/contacts
{
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  company: "ABC Inspections",
  license_number: "CA-12345",
  roles: [
    {
      role_id: "inspector-uuid",
      is_primary: true,
      role_metadata: { specialty: "residential" }
    }
  ]
}
```

---

## 🚧 PHASE 4: Nested Modal Integration (5 minutes)

**Files to Update:**

### 1. NewEscrowModal.jsx (Buyer/Seller dropdowns)

```jsx
<Autocomplete
  options={contacts}
  filterOptions={(options) => options}
  renderInput={(params) => <TextField {...params} label="Buyer" />}
  noOptionsText={
    <Button onClick={() => setContactModalOpen(true)} startIcon={<Add />}>
      + Create New Contact
    </Button>
  }
/>

{/* Nested Modal */}
<CreateContactModal
  open={contactModalOpen}
  onClose={() => setContactModalOpen(false)}
  onSuccess={(newContact) => {
    setFormData({...formData, buyerId: newContact.id});
    setContactModalOpen(false);
  }}
  defaultRole="lead_buyer"  // Pre-select buyer lead
/>
```

### 2. NewListingModal.jsx (Client dropdown)

Same pattern, defaultRole="client"

### 3. NewAppointmentModal.jsx (Lead dropdown)

Same pattern, defaultRole="lead_buyer" or "lead_seller"

---

## 🚧 PHASE 5: Auto-Fill Logic (5 minutes)

**Scenario:** Lead converts to Client

**When adding Client role:**
```javascript
// In CreateContactModal, when user selects "Client" role
// Check if contact already has lead_buyer or lead_seller role

const existingLeadRole = contact.roles.find(r =>
  r.role_name === 'lead_buyer' || r.role_name === 'lead_seller'
);

if (existingLeadRole) {
  // Auto-fill source from lead role
  setFormData({
    ...formData,
    source: existingLeadRole.role_metadata.source,  // Already captured
    lead_type: existingLeadRole.role_metadata.lead_type
  });
}
```

**Backend:** When POST /v1/contacts/:id/roles with role_name="client"
```javascript
// Check if contact has lead role
const leadRole = await getContactLeadRole(contact_id);

if (leadRole) {
  // Inherit metadata
  role_metadata = {
    ...role_metadata,
    source: leadRole.role_metadata.source,
    lead_type: leadRole.role_metadata.lead_type,
    converted_from_lead: true,
    conversion_date: new Date()
  };
}
```

---

## 🚧 PHASE 6: Preferences UI (5-10 minutes)

**File:** `/frontend/src/pages/Settings.jsx` (UPDATE)

Add new tab: **"Contact Preferences"** (between Privacy and Transaction Defaults)

**Features:**
1. List all 14 roles
2. For each role, show checkboxes:
   - Required Fields (add to broker/team/user requirements)
   - Optional Fields (mark as nice-to-have)

3. Hierarchy indicator:
   - 🏢 Broker requirement (can't remove)
   - 👥 Team requirement (can't remove if user)
   - 👤 Your requirement (can toggle)

**API Endpoints:**
```javascript
GET /v1/contact-validation-preferences?scope_type=user&scope_id={userId}
POST /v1/contact-validation-preferences
PUT /v1/contact-validation-preferences/:id
DELETE /v1/contact-validation-preferences/:id
```

---

## 📝 TESTING CHECKLIST

### Phase 2: Backend APIs
1. ✅ GET /v1/contact-roles → Returns 14 roles
2. ✅ GET /v1/contacts/search?role=lead_buyer&name=john → Returns matching contacts
3. ✅ POST /v1/contacts/:id/roles → Adds inspector role to existing contact
4. ✅ GET /v1/contacts/:id/roles → Shows both roles (lead + inspector)
5. ✅ DELETE /v1/contacts/:id/roles/:roleId → Removes inspector role
6. ✅ PUT /v1/contacts/:id/roles/primary → Sets client as primary

### Phase 3: Contact Modal
1. ✅ Open modal, select "Home Inspector" role
2. ✅ Company + License Number fields appear (required)
3. ✅ Source field is hidden (not shown for vendors)
4. ✅ Fill form, submit → Creates contact with inspector role
5. ✅ Check database: contact_role_assignments has 1 row

### Phase 4: Nested Modal
1. ✅ Open NewEscrowModal
2. ✅ Click Buyer dropdown
3. ✅ Click "+ Create New Contact" button
4. ✅ CreateContactModal opens ON TOP
5. ✅ Create contact → Modal closes, buyer auto-selected in dropdown
6. ✅ Complete escrow creation → Buyer saved

### Phase 5: Auto-Fill
1. ✅ Create lead with source="Zillow"
2. ✅ Add "Client" role to same contact
3. ✅ Source field auto-filled with "Zillow" (not asked again)
4. ✅ Check database: Client role has source in role_metadata

### Phase 6: Preferences
1. ✅ Go to Settings → Contact Preferences
2. ✅ For "Lead (Buyer)" role, check "Phone" as required
3. ✅ Save preferences
4. ✅ Open CreateContactModal, select Lead
5. ✅ Phone field now has red asterisk (required)
6. ✅ Try to submit without phone → Validation error

---

## ⏱️ TIME BREAKDOWN (Realistic with Claude Code)

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | Database migration | ✅ 5 min (DONE) |
| 2 | Backend API controllers | 10 min |
| 3 | CreateContactModal.jsx | 10 min |
| 4 | Nested modal integration | 5 min |
| 5 | Auto-fill logic | 5 min |
| 6 | Preferences UI | 5-10 min |
| **Testing** | Run checklist above | 5-10 min |
| **TOTAL** | | **45-55 minutes** |

---

## 🎯 NEXT SESSION PLAN

**Say:** "Continue with Phase 2: Backend APIs"

**I will:**
1. Create contact-roles.controller.js
2. Update contacts.controller.js with 5 new methods
3. Register routes in app.js
4. Test all endpoints with curl
5. Commit + push (Railway auto-deploys)
6. Move to Phase 3

**You will:**
- Test each phase as it's deployed
- Confirm endpoints work before moving to next phase

**Goal:** All 6 phases complete in <1 hour of focused work.
