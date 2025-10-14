# Contacts & Multi-Role System

**Created:** 2025-10-13
**Purpose:** Define the role-based contact architecture for the CRM
**Status:** Design Document - Implementation Pending

---

## Overview

**Contacts** is the master table for all person records in the CRM. Every person - whether they're a lead, client, vendor, realtor, or any other role - starts as a contact record. Roles are **additive and cumulative**, meaning a person can have multiple roles simultaneously and historical roles are preserved.

---

## Core Concept: Roles Are Additive

### Example Journey
```
Person Timeline:
1. Vendor (contacts plumber)
   └─ roles: ['vendor']

2. Vendor becomes a Lead (expressed interest in buying)
   └─ roles: ['vendor', 'lead']

3. Lead becomes a Client (committed to working with agent)
   └─ roles: ['vendor', 'lead', 'client']

4. Client becomes a Home Inspector (hired for transaction)
   └─ roles: ['vendor', 'lead', 'client', 'home_inspector']
```

**Key Principle:** Once a role is added, it's never removed. A person can be a past lead AND a current client simultaneously.

---

## Available Roles

### Primary Roles (Transaction Participants)
- `lead` - Prospective client, not yet committed
- `client` - Active client working with agent
- `buyer` - Purchasing a property (in escrow)
- `seller` - Selling a property (in escrow)

### Professional Roles (Service Providers)
- `realtor` - Real estate agent
- `broker` - Real estate broker
- `loan_officer` - Mortgage loan officer
- `escrow_officer` - Escrow/title officer
- `transaction_coordinator` - Transaction coordinator
- `home_inspector` - Home inspection professional
- `termite_inspector` - Termite/pest inspection professional
- `appraiser` - Property appraiser
- `attorney` - Real estate attorney

### Support Roles
- `vendor` - General service provider
- `contractor` - Construction/repair contractor
- `handyman` - Handyman services
- `stager` - Home staging professional
- `photographer` - Real estate photographer
- `cleaner` - Cleaning service

### Other
- `family_member` - Family member of client
- `spouse` - Spouse of contact
- `referral_partner` - Referral source
- `other` - Uncategorized contact

---

## Database Architecture

### Current Schema (contacts table)
```sql
contacts {
  id: UUID (primary key)
  contact_type: VARCHAR(50) -- LIMITATION: Single type only
  first_name: VARCHAR(100)
  last_name: VARCHAR(100)
  full_name: VARCHAR(200) -- Generated column
  email: VARCHAR(255) UNIQUE
  phone: VARCHAR(20)
  company_name: VARCHAR(200)
  tags: TEXT[] -- Array of custom tags
  is_active: BOOLEAN
  created_at: TIMESTAMP
  team_id: UUID
  -- ... other fields
}

-- Current CHECK constraint (needs to be removed):
CHECK (contact_type IN ('agent', 'client', 'buyer', 'seller', 'vendor', 'other'))
```

### Proposed Schema Changes

#### Option 1: JSONB Roles Field (Recommended)
```sql
ALTER TABLE contacts DROP CONSTRAINT contacts_contact_type_check;
ALTER TABLE contacts ALTER COLUMN contact_type DROP NOT NULL;
ALTER TABLE contacts ADD COLUMN roles JSONB DEFAULT '[]'::jsonb;

CREATE INDEX idx_contacts_roles ON contacts USING GIN (roles);

-- Example data:
{
  "roles": [
    {"type": "vendor", "added_at": "2024-01-15", "status": "active"},
    {"type": "lead", "added_at": "2024-03-20", "status": "active"},
    {"type": "client", "added_at": "2024-04-10", "status": "active"}
  ]
}
```

**Pros:**
- Flexible - unlimited roles per contact
- Preserves role history with timestamps
- Can track role status (active/inactive)
- Easy to query with GIN index
- No additional joins required

**Cons:**
- JSONB queries slightly more complex
- Not as strongly typed

#### Option 2: Separate contact_roles Junction Table
```sql
CREATE TABLE contact_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  role_type VARCHAR(50) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  notes TEXT,
  UNIQUE(contact_id, role_type)
);

CREATE INDEX idx_contact_roles_contact ON contact_roles(contact_id);
CREATE INDEX idx_contact_roles_type ON contact_roles(role_type);
CREATE INDEX idx_contact_roles_status ON contact_roles(status);
```

**Pros:**
- Strongly typed
- Easy to query and filter
- Normalized data structure
- Can add role-specific metadata

**Cons:**
- Requires JOIN for filtering
- Additional table to maintain

#### Option 3: PostgreSQL Array (Simple)
```sql
ALTER TABLE contacts ADD COLUMN roles TEXT[] DEFAULT ARRAY[]::TEXT[];
CREATE INDEX idx_contacts_roles_gin ON contacts USING GIN (roles);

-- Example data:
roles = ['vendor', 'lead', 'client']
```

**Pros:**
- Very simple
- Fast array operations
- GIN indexing support

**Cons:**
- No role metadata (timestamps, status)
- Can't track when role was added

---

## Recommended Implementation: JSONB Roles

### Migration Script
```sql
-- Step 1: Remove old constraint
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_contact_type_check;

-- Step 2: Make contact_type nullable (for backwards compatibility)
ALTER TABLE contacts ALTER COLUMN contact_type DROP NOT NULL;

-- Step 3: Add roles JSONB column
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '[]'::jsonb;

-- Step 4: Migrate existing contact_type to roles array
UPDATE contacts
SET roles = jsonb_build_array(
  jsonb_build_object(
    'type', contact_type,
    'added_at', created_at,
    'status', 'active'
  )
)
WHERE contact_type IS NOT NULL AND roles = '[]'::jsonb;

-- Step 5: Create GIN index for fast role queries
CREATE INDEX IF NOT EXISTS idx_contacts_roles ON contacts USING GIN (roles);

-- Step 6: Create helper function to check if contact has role
CREATE OR REPLACE FUNCTION contact_has_role(contact_roles JSONB, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM jsonb_array_elements(contact_roles) AS role
    WHERE role->>'type' = role_name
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### API Design

#### Add Role to Contact
```javascript
POST /v1/contacts/:contactId/roles
Body: {
  "role": "client",
  "notes": "Signed buyer representation agreement"
}

Response: {
  "success": true,
  "data": {
    "contactId": "uuid",
    "roles": [
      {"type": "lead", "added_at": "2024-03-20", "status": "active"},
      {"type": "client", "added_at": "2024-10-13", "status": "active"}
    ]
  }
}
```

#### Query Contacts by Role
```javascript
GET /v1/contacts?role=client
GET /v1/contacts?roles=client,lead  // Has either role
GET /v1/contacts?hasAllRoles=client,buyer  // Has both roles
```

#### Filter UI
```javascript
// Contacts Dashboard
Tabs:
- All Contacts (no filter)
- Leads (has 'lead' role)
- Clients (has 'client' role)
- Vendors (has 'vendor' role)
- Professionals (has any professional role)
- Multi-Role (has 2+ roles)
```

---

## Automatic Role Assignment

### When Creating Records

#### Leads Module → Add "lead" Role
```javascript
// When creating a lead record
POST /v1/leads
{
  "first_name": "John",
  "email": "john@example.com"
}

// Backend automatically:
1. Create/update contact with email
2. Add "lead" role if not present
3. Link lead record to contact
```

#### Clients Module → Add "client" Role
```javascript
// When creating a client record
POST /v1/clients
{
  "contact_id": "uuid"
}

// Backend automatically:
1. Add "client" role to contact
2. Keep existing roles (e.g., "lead" if they were a lead)
```

#### Escrow Transaction → Add Transaction Roles
```javascript
// When adding people to escrow
POST /v1/escrows/:escrowId/people
{
  "buyer_id": "contact-uuid",
  "seller_id": "contact-uuid",
  "listing_agent_id": "contact-uuid",
  "buyer_agent_id": "contact-uuid",
  "escrow_officer_id": "contact-uuid"
}

// Backend automatically adds roles:
- buyer_id → Add "buyer" role
- seller_id → Add "seller" role
- listing_agent_id → Add "realtor" role
- buyer_agent_id → Add "realtor" role
- escrow_officer_id → Add "escrow_officer" role
```

---

## UI/UX Design

### Contacts Dashboard

#### Filtering
```
Tabs:
[ All ] [ Leads ] [ Clients ] [ Buyers ] [ Sellers ] [ Vendors ] [ Professionals ]

Advanced Filter:
☐ Has multiple roles
☐ Active clients only
☐ Inactive contacts

Role Badges:
John Doe [Lead] [Client] [Vendor]
Jane Smith [Client] [Buyer] [Home Inspector]
```

#### Contact Detail Page
```
John Doe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Roles:
  [x] Lead        Added: 2024-01-15  Status: Active
  [x] Client      Added: 2024-03-20  Status: Active
  [x] Vendor      Added: 2024-02-10  Status: Active
  [+] Add Role

Related Records:
- Lead Record: #L-2024-001
- Client Record: #CL-2024-045
- Involved in 3 transactions
```

---

## Data Consistency Rules

### 1. Contact is Source of Truth
- All person data lives in `contacts` table
- Leads, clients, etc. reference `contacts.id`
- Update contact → propagates to all linked records

### 2. Roles Are Additive
```sql
-- GOOD: Add role if not present
UPDATE contacts
SET roles = roles || jsonb_build_array(
  jsonb_build_object('type', 'client', 'added_at', NOW(), 'status', 'active')
)
WHERE id = $1
  AND NOT contact_has_role(roles, 'client');

-- BAD: Replace roles (loses history)
UPDATE contacts SET roles = '["client"]' WHERE id = $1;
```

### 3. Role Deactivation (Not Deletion)
```sql
-- Mark role as inactive instead of removing
UPDATE contacts
SET roles = (
  SELECT jsonb_agg(
    CASE
      WHEN role->>'type' = 'client'
      THEN jsonb_set(role, '{status}', '"inactive"')
      ELSE role
    END
  )
  FROM jsonb_array_elements(roles) AS role
)
WHERE id = $1;
```

---

## Migration Path

### Phase 1: Database Setup
1. Run migration to add `roles` JSONB column
2. Migrate existing `contact_type` to `roles` array
3. Create GIN index on roles
4. Create helper functions

### Phase 2: Backend Updates
1. Update contacts controller to support role filtering
2. Add role management endpoints (add/remove/list)
3. Update leads/clients controllers to auto-add roles
4. Update escrows controller to auto-add transaction roles

### Phase 3: Frontend Updates
1. Update Contacts dashboard with role filters
2. Add role badges to contact cards
3. Create "Add Role" UI in contact detail page
4. Update forms to show role selection

### Phase 4: Data Migration
1. Audit all existing leads → ensure "lead" role
2. Audit all existing clients → ensure "client" role
3. Audit escrow people → add appropriate roles

---

## Examples

### Example 1: Your Personal Profile
```json
{
  "id": "uuid",
  "first_name": "Jayden",
  "last_name": "Metz",
  "email": "admin@jaydenmetz.com",
  "roles": [
    {"type": "realtor", "added_at": "2020-01-01", "status": "active"},
    {"type": "lead", "added_at": "2024-05-10", "status": "active"},
    {"type": "client", "added_at": "2024-06-01", "status": "active"},
    {"type": "buyer", "added_at": "2024-09-15", "status": "active"}
  ]
}

// You can see yourself in:
- Contacts (as yourself)
- Leads dashboard (when you were prospecting)
- Clients dashboard (when you signed agreement)
- Escrow transactions (as the buyer)
- Realtors list (your professional role)
```

### Example 2: Home Inspector Who Became a Client
```json
{
  "id": "uuid",
  "first_name": "Mike",
  "last_name": "Johnson",
  "email": "mike@inspections.com",
  "company_name": "Mike's Home Inspections",
  "roles": [
    {"type": "vendor", "added_at": "2023-01-10", "status": "active"},
    {"type": "home_inspector", "added_at": "2023-01-10", "status": "active"},
    {"type": "lead", "added_at": "2024-08-15", "status": "active"},
    {"type": "client", "added_at": "2024-09-01", "status": "active"}
  ]
}

// Mike appears in:
- Contacts (all records)
- Vendors list (as service provider)
- Home Inspectors list (professional list)
- Leads (when he inquired about buying)
- Clients (when he signed representation agreement)
- Transaction people dropdowns (as inspector for other deals)
```

---

## Benefits of This System

### 1. Single Source of Truth
- One contact record = one person
- No duplicate data across modules
- Update once, reflects everywhere

### 2. Historical Tracking
- Never lose relationship history
- See how someone's role evolved
- Track customer lifetime value

### 3. Flexible Relationships
- Same person can wear many hats
- Natural representation of real-world relationships
- Easy to add new roles as business grows

### 4. Better Analytics
- "How many leads became clients?" (count role additions)
- "Which vendors also became clients?" (multi-role query)
- "Lifetime value of client who was also a referral partner"

### 5. Simplified UI
- One "Contacts" page shows everyone
- Filter by role(s) to see specific views
- No confusion about where to add someone

---

## Next Steps

1. **Review and approve** this design document
2. **Create migration script** (in `backend/migrations/`)
3. **Implement backend API** for role management
4. **Build Contacts dashboard** with role filtering
5. **Update existing modules** to auto-assign roles
6. **Data migration** for existing contacts

---

## Questions to Address

1. Should we soft-delete roles or permanently mark as inactive?
2. Do we need role-specific metadata (e.g., client since date, vendor license number)?
3. Should some roles be mutually exclusive (e.g., can't be both buyer and seller on same transaction)?
4. How to handle role conflicts (e.g., representing both sides of a transaction)?
5. Should we notify user when a contact gains a new role?
