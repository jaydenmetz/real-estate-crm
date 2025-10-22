# Multi-Tenant System Implementation Plan
**Created:** October 22, 2025
**Updated:** October 22, 2025 (Privacy Rules Clarified)
**Priority:** ASAP
**Focus:** Data Ownership First, then Admin UI

---

## 🔐 PRIVACY QUICK REFERENCE

| Data Type | Broker Can See? | Privacy Support | Notes |
|-----------|----------------|-----------------|-------|
| **Escrows** | ✅ YES (always) | ❌ No privacy | Always visible to broker |
| **Clients** | ✅ YES (always) | ❌ No privacy | Always visible to broker |
| **Listings** | ✅ YES (always) | ❌ No privacy | Always visible to broker |
| **Leads** | ❌ NO (if private) | ✅ Yes (is_private flag) | Agents can mark as private |
| **Appointments** | ❌ NO (if linked to private lead) | ✅ Inherited from lead | Privacy based on lead_id |

**Why This Makes Sense:**
- **Escrows/Clients/Listings** = Business transactions → Broker needs visibility for compliance
- **Leads** = Personal prospecting → Agent owns their pipeline (family, friends, cold calls)
- **Appointments** = Inherit lead privacy → If lead is private, appointment is too

---

## 📋 YOUR REQUIREMENTS (Clarified)

### 1. **Timeline**
- ✅ ASAP - Start immediately with database schema

### 2. **Priority Order**
1. **Data Ownership** (HIGHEST) - Prevent data loss from corrupt brokers
2. **Admin UI** (HIGH) - system_admin needs entity selector
3. **Permission Toggles** (HIGH) - Broker can grant/revoke admin privileges

### 3. **Role Hierarchy & Permissions**

```
system_admin (YOU - admin@jaydenmetz.com)
  └─ Can see ALL data including private
  └─ Can impersonate any broker/team/user
  └─ Cannot be restricted

broker (Josh Riley - josh@bhhsassociated.com)
  └─ Can see all NON-PRIVATE data in their brokerage
  └─ CANNOT see private data (user-owned escrows/clients)
  └─ Can toggle admin permissions for agents:
      ├─ broker_admin → Can manage all teams in brokerage
      ├─ team_admin → Can manage only their team
      └─ no_admin → Regular agent (no admin UI access)

team_owner (Lee Rangel - lee@rangelrealty.com)
  └─ Can see all NON-PRIVATE team data
  └─ CANNOT see private data
  └─ Can grant global permissions to team members:
      ├─ can_delete (delete team records)
      ├─ can_edit_team_data (edit any team record)
      └─ can_view_financials (see commission splits)
  └─ Can add per-resource collaborators (share specific escrows)

agent (Jayden Metz - jayden@jaydenmetz.com, Cole Rangel - cole@rangelrealty.com)
  └─ Can see own data + team non-private data
  └─ Can mark own records as "private" (invisible to broker/team_owner)
  └─ Can be toggled to broker_admin/team_admin by broker
```

### 4. **Private Data Rules** (UPDATED)

**Broker CAN see these (always public):**
- ✅ **Escrows** - All escrows in brokerage are visible to broker
- ✅ **Clients** - All clients in brokerage are visible to broker
- ✅ **Listings** - All listings in brokerage are visible to broker

**Broker CANNOT see these (support privacy):**
- ❌ **Leads** - Can be marked private by agents (hidden from broker/team_owner)
- ❌ **Appointments** - ONLY hidden if linked to a private lead

**Privacy Model:**
- ✅ **Agents can mark leads as "private"** (personal prospecting, family, friends)
- ✅ **Private leads are invisible** to broker/team_owner (only system_admin sees)
- ✅ **Appointments inherit privacy** from linked lead (if lead is private, appointment is private)
- ✅ **Private data persists** even if agent leaves team (protected from deletion)
- ✅ **system_admin sees everything** (for support/debugging only)

### 5. **Permission Model**
- **Global Permissions:** team_owner grants can_delete, can_edit_team_data
- **Per-Resource Collaborators:** Agent shares specific escrow with teammate
- **Broker Admin Toggle:** Broker grants broker_admin or team_admin role

### 6. **Scale Expectations**
- **Year 1:** 1,000 brokers, 10,000 teams, 100,000 users
- **Must support:** Fast search with 1M+ users (full-text indexes)
- **Query performance:** <100ms for filtered searches

---

## 🗓️ PHASE 1: DATABASE SCHEMA (Week 1 - Days 1-7)

### **Day 1: Broker-User Relationship**

#### Migration 025: Add broker_id to users
```sql
-- /backend/migrations/025_add_broker_id_to_users.sql

-- Step 1: Add broker_id column (nullable initially)
ALTER TABLE users ADD COLUMN broker_id UUID;

-- Step 2: Populate broker_id from teams.primary_broker_id
UPDATE users u
SET broker_id = t.primary_broker_id
FROM teams t
WHERE u.team_id = t.team_id
  AND t.primary_broker_id IS NOT NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE users
ADD CONSTRAINT users_broker_id_fkey
FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE SET NULL;

-- Step 4: Create index for fast broker queries
CREATE INDEX idx_users_broker_id ON users(broker_id);
CREATE INDEX idx_users_role ON users(role);

-- Step 5: Create composite index for broker + team queries
CREATE INDEX idx_users_broker_team ON users(broker_id, team_id);

-- Rollback
-- ALTER TABLE users DROP CONSTRAINT users_broker_id_fkey;
-- DROP INDEX idx_users_broker_id;
-- DROP INDEX idx_users_role;
-- DROP INDEX idx_users_broker_team;
-- ALTER TABLE users DROP COLUMN broker_id;
```

---

### **Day 2: Data Ownership Columns (SIMPLIFIED)**

**Privacy Only for Leads & Appointments - Escrows/Clients/Listings Always Public**

#### Migration 026: Add ownership to leads (PRIVATE SUPPORTED)
```sql
-- /backend/migrations/026_add_ownership_to_leads.sql

-- Step 1: Add ownership columns
ALTER TABLE leads ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN is_private BOOLEAN DEFAULT FALSE;

-- Step 2: Populate owner_id from user_id (existing creator)
UPDATE leads SET owner_id = user_id WHERE user_id IS NOT NULL;

-- Step 3: Create indexes
CREATE INDEX idx_leads_owner_id ON leads(owner_id);
CREATE INDEX idx_leads_is_private ON leads(is_private) WHERE is_private = TRUE;
CREATE INDEX idx_leads_owner_private ON leads(owner_id, is_private);

-- Step 4: Prevent orphaned private leads (protect from CASCADE)
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_team_id_fkey;
ALTER TABLE leads ADD CONSTRAINT leads_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL;

-- Rollback
-- ALTER TABLE leads DROP CONSTRAINT leads_team_id_fkey;
-- ALTER TABLE leads ADD CONSTRAINT leads_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE;
-- DROP INDEX idx_leads_owner_id;
-- DROP INDEX idx_leads_is_private;
-- DROP INDEX idx_leads_owner_private;
-- ALTER TABLE leads DROP COLUMN owner_id;
-- ALTER TABLE leads DROP COLUMN is_private;
```

#### Migration 027: Add ownership to escrows (NO PRIVACY - ALWAYS VISIBLE TO BROKER)
```sql
-- /backend/migrations/027_add_ownership_to_escrows.sql

-- Step 1: Add owner_id only (no is_private, broker always sees escrows)
ALTER TABLE escrows ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Step 2: Populate owner_id from user_id (existing creator)
UPDATE escrows SET owner_id = user_id WHERE user_id IS NOT NULL;

-- Step 3: Create index
CREATE INDEX idx_escrows_owner_id ON escrows(owner_id);

-- Rollback
-- DROP INDEX idx_escrows_owner_id;
-- ALTER TABLE escrows DROP COLUMN owner_id;
```

#### Migration 028: Add ownership to clients (NO PRIVACY)
```sql
-- /backend/migrations/028_add_ownership_to_clients.sql
-- Same as escrows - owner_id only, no is_private

ALTER TABLE clients ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
UPDATE clients SET owner_id = user_id WHERE user_id IS NOT NULL;
CREATE INDEX idx_clients_owner_id ON clients(owner_id);
```

#### Migration 029: Add ownership to listings (NO PRIVACY)
```sql
-- /backend/migrations/029_add_ownership_to_listings.sql
-- Same as escrows - owner_id only, no is_private

ALTER TABLE listings ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
UPDATE listings SET owner_id = user_id WHERE user_id IS NOT NULL;
CREATE INDEX idx_listings_owner_id ON listings(owner_id);
```

#### Migration 030: Add lead_id to appointments (for inherited privacy)
```sql
-- /backend/migrations/030_add_lead_id_to_appointments.sql

-- Step 1: Add lead_id foreign key
ALTER TABLE appointments ADD COLUMN lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;

-- Step 2: Create index for fast privacy checks
CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);

-- NOTE: Appointments don't have is_private column
-- Privacy is inherited from linked lead (if lead is private, appointment is private)

-- Rollback
-- DROP INDEX idx_appointments_lead_id;
-- ALTER TABLE appointments DROP COLUMN lead_id;
```

---

### **Day 3: Permissions System**

#### Migration 031: Create user_permissions table
```sql
-- /backend/migrations/031_create_user_permissions.sql

CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Scope of permission (what this applies to)
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,

  -- Permission type
  permission VARCHAR(100) NOT NULL,
  -- Global permissions:
  --   broker_admin    - Full broker management (Josh can grant to Jayden)
  --   team_admin      - Full team management (Josh can grant to Jayden for specific team)
  --   can_delete      - Delete team records (Lee can grant to Cole)
  --   can_edit_team_data - Edit any team record (Lee can grant to Cole)
  --   can_view_financials - See commission splits (Lee can grant to Cole)

  -- Metadata
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  revoked_by UUID REFERENCES users(id),

  -- Prevent duplicate permissions
  UNIQUE(user_id, team_id, broker_id, permission)
);

-- Indexes for fast permission checks
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_team_id ON user_permissions(team_id);
CREATE INDEX idx_user_permissions_broker_id ON user_permissions(broker_id);
CREATE INDEX idx_user_permissions_permission ON user_permissions(permission);
CREATE INDEX idx_user_permissions_active ON user_permissions(user_id, permission) WHERE revoked_at IS NULL;

-- Example data (Josh grants Jayden broker_admin)
-- INSERT INTO user_permissions (user_id, broker_id, permission, granted_by)
-- VALUES (
--   'jayden-user-id',
--   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
--   'broker_admin',
--   '2d20218c-eba2-4af8-8fdd-a1a76b2acac4'
-- );

-- Rollback
-- DROP TABLE user_permissions;
```

---

### **Day 4: Collaborator System**

#### Migration 032: Create data_access_control table
```sql
-- /backend/migrations/032_create_data_access_control.sql

CREATE TABLE data_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What resource is being shared
  resource_type VARCHAR(50) NOT NULL, -- 'escrow', 'client', 'lead', 'listing'
  resource_id UUID NOT NULL,

  -- Who gets access
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Access level
  access_level VARCHAR(20) NOT NULL, -- 'read', 'write', 'delete'

  -- Who shared it
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Optional expiration

  -- Prevent duplicate shares
  UNIQUE(resource_type, resource_id, user_id, access_level)
);

-- Indexes for fast collaborator checks
CREATE INDEX idx_dac_user_id ON data_access_control(user_id);
CREATE INDEX idx_dac_resource ON data_access_control(resource_type, resource_id);
CREATE INDEX idx_dac_active ON data_access_control(user_id, resource_type) WHERE expires_at IS NULL OR expires_at > NOW();

-- Example: Jayden shares escrow with Cole
-- INSERT INTO data_access_control (resource_type, resource_id, user_id, access_level, granted_by)
-- VALUES ('escrow', 'some-escrow-id', 'cole-user-id', 'write', 'jayden-user-id');

-- Rollback
-- DROP TABLE data_access_control;
```

---

### **Day 5: Full-Text Search Indexes**

#### Migration 033: Add search indexes for scale
```sql
-- /backend/migrations/033_add_fulltext_search_indexes.sql

-- Step 1: Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 2: Create trigram indexes for fast LIKE '%search%' queries
CREATE INDEX idx_users_full_name_trgm ON users
  USING gin((first_name || ' ' || last_name) gin_trgm_ops);

CREATE INDEX idx_users_email_trgm ON users
  USING gin(email gin_trgm_ops);

CREATE INDEX idx_teams_name_trgm ON teams
  USING gin(name gin_trgm_ops);

CREATE INDEX idx_brokers_name_trgm ON brokers
  USING gin(name gin_trgm_ops);

CREATE INDEX idx_brokers_company_name_trgm ON brokers
  USING gin(company_name gin_trgm_ops);

-- Step 3: Create composite indexes for common queries
CREATE INDEX idx_escrows_property_address_trgm ON escrows
  USING gin(property_address gin_trgm_ops);

CREATE INDEX idx_clients_name_trgm ON clients
  USING gin((first_name || ' ' || last_name) gin_trgm_ops);

-- Step 4: Optimize broker hierarchy queries
CREATE INDEX idx_users_broker_role ON users(broker_id, role);
CREATE INDEX idx_teams_broker ON teams(primary_broker_id);

-- Performance verification query
-- EXPLAIN ANALYZE
-- SELECT * FROM users WHERE (first_name || ' ' || last_name) ILIKE '%jayden%' LIMIT 50;

-- Rollback
-- DROP INDEX idx_users_full_name_trgm;
-- DROP INDEX idx_users_email_trgm;
-- DROP INDEX idx_teams_name_trgm;
-- DROP INDEX idx_brokers_name_trgm;
-- DROP INDEX idx_brokers_company_name_trgm;
-- DROP INDEX idx_escrows_property_address_trgm;
-- DROP INDEX idx_clients_name_trgm;
-- DROP INDEX idx_users_broker_role;
-- DROP INDEX idx_teams_broker;
```

---

### **Day 6-7: Create Test Users & Seed Data**

#### Migration 034: Create test users
```sql
-- /backend/migrations/034_create_test_users.sql

-- Jayden Metz (agent on Jayden Metz Realty Group team)
INSERT INTO users (
  id, email, first_name, last_name, role, team_id, broker_id, password_hash
) VALUES (
  gen_random_uuid(),
  'jayden@jaydenmetz.com',
  'Jayden',
  'Metz',
  'agent',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', -- Jayden Metz Realty Group
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- Josh Riley's brokerage
  '$2b$10$FlM9z1dFQnN/K7EMuTdpOeMnhWw2BYXfbrZiTZR3zDHlwSxpWYrAK' -- password: Password123!
) ON CONFLICT (email) DO NOTHING;

-- Cole Rangel (agent on Lee Rangel's team)
INSERT INTO users (
  id, email, first_name, last_name, role, team_id, broker_id, password_hash
) VALUES (
  gen_random_uuid(),
  'cole@rangelrealty.com',
  'Cole',
  'Rangel',
  'agent',
  '3aef0a75-f22a-44e8-8615-9e28fc429f6f', -- Rangel Realty Group
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- Josh Riley's brokerage
  '$2b$10$FlM9z1dFQnN/K7EMuTdpOeMnhWw2BYXfbrZiTZR3zDHlwSxpWYrAK' -- password: Password123!
) ON CONFLICT (email) DO NOTHING;

-- Update existing users to have broker_id
UPDATE users SET broker_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE email IN (
  'admin@jaydenmetz.com',
  'josh@bhhsassociated.com',
  'lee@rangelrealty.com'
) AND broker_id IS NULL;

-- Grant Jayden broker_admin permission (Josh grants this)
INSERT INTO user_permissions (user_id, broker_id, permission, granted_by)
SELECT
  u.id,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'broker_admin',
  (SELECT id FROM users WHERE email = 'josh@bhhsassociated.com')
FROM users u
WHERE u.email = 'jayden@jaydenmetz.com'
ON CONFLICT DO NOTHING;

-- Rollback
-- DELETE FROM user_permissions WHERE permission = 'broker_admin';
-- DELETE FROM users WHERE email IN ('jayden@jaydenmetz.com', 'cole@rangelrealty.com');
```

---

## 🗓️ PHASE 2: AUTHORIZATION MIDDLEWARE (Week 2 - Days 8-14)

### **Day 8: Ownership Service**

#### File: /backend/src/services/ownership.service.js
```javascript
const { pool } = require('../config/database');

class OwnershipService {
  /**
   * Check if user can access resource
   * @param {string} userId - User ID
   * @param {string} userRole - User role (system_admin, broker, etc.)
   * @param {string} resourceType - 'escrow', 'client', 'lead', 'listing'
   * @param {string} resourceId - Resource UUID
   * @returns {Promise<boolean>}
   */
  static async canAccessResource(userId, userRole, resourceType, resourceId) {
    // System admin can access everything
    if (userRole === 'system_admin') return true;

    // Get resource ownership info
    const query = `
      SELECT owner_id, is_private, access_level, team_id, broker_id
      FROM ${resourceType}s
      WHERE id = $1
    `;
    const result = await pool.query(query, [resourceId]);

    if (result.rows.length === 0) return false;

    const resource = result.rows[0];

    // User owns the resource
    if (resource.owner_id === userId) return true;

    // Private resource - only owner and system_admin can access
    if (resource.is_private) return false;

    // Check if user has been granted access via collaborator
    const collaboratorAccess = await pool.query(`
      SELECT 1 FROM data_access_control
      WHERE resource_type = $1
        AND resource_id = $2
        AND user_id = $3
        AND (expires_at IS NULL OR expires_at > NOW())
    `, [resourceType, resourceId, userId]);

    if (collaboratorAccess.rows.length > 0) return true;

    // Check team/broker access based on access_level
    const userInfo = await pool.query(`
      SELECT team_id, broker_id FROM users WHERE id = $1
    `, [userId]);

    if (userInfo.rows.length === 0) return false;

    const { team_id, broker_id } = userInfo.rows[0];

    if (resource.access_level === 'team') {
      return resource.team_id === team_id;
    }

    if (resource.access_level === 'broker') {
      return resource.broker_id === broker_id;
    }

    return false;
  }

  /**
   * Check if user can modify resource
   */
  static async canModifyResource(userId, userRole, resourceType, resourceId) {
    // Must be able to access first
    const canAccess = await this.canAccessResource(userId, userRole, resourceType, resourceId);
    if (!canAccess) return false;

    // System admin can modify everything
    if (userRole === 'system_admin') return true;

    // Get resource info
    const query = `SELECT owner_id, is_private FROM ${resourceType}s WHERE id = $1`;
    const result = await pool.query(query, [resourceId]);
    const resource = result.rows[0];

    // Owner can always modify
    if (resource.owner_id === userId) return true;

    // Private resource - only owner can modify
    if (resource.is_private) return false;

    // Check if user has can_edit_team_data permission
    const hasPermission = await pool.query(`
      SELECT 1 FROM user_permissions
      WHERE user_id = $1
        AND permission IN ('can_edit_team_data', 'team_admin', 'broker_admin')
        AND revoked_at IS NULL
    `, [userId]);

    if (hasPermission.rows.length > 0) return true;

    // Check collaborator write access
    const collaboratorAccess = await pool.query(`
      SELECT 1 FROM data_access_control
      WHERE resource_type = $1
        AND resource_id = $2
        AND user_id = $3
        AND access_level IN ('write', 'delete')
        AND (expires_at IS NULL OR expires_at > NOW())
    `, [resourceType, resourceId, userId]);

    return collaboratorAccess.rows.length > 0;
  }

  /**
   * Check if user can delete resource
   */
  static async canDeleteResource(userId, userRole, resourceType, resourceId) {
    // System admin can delete everything
    if (userRole === 'system_admin') return true;

    const query = `SELECT owner_id, is_private FROM ${resourceType}s WHERE id = $1`;
    const result = await pool.query(query, [resourceId]);
    const resource = result.rows[0];

    // Owner can always delete their own resource
    if (resource.owner_id === userId) return true;

    // Private resource - only owner can delete
    if (resource.is_private) return false;

    // Check if user has can_delete permission
    const hasPermission = await pool.query(`
      SELECT 1 FROM user_permissions
      WHERE user_id = $1
        AND permission IN ('can_delete', 'team_admin', 'broker_admin')
        AND revoked_at IS NULL
    `, [userId]);

    if (hasPermission.rows.length > 0) return true;

    // Check collaborator delete access
    const collaboratorAccess = await pool.query(`
      SELECT 1 FROM data_access_control
      WHERE resource_type = $1
        AND resource_id = $2
        AND user_id = $3
        AND access_level = 'delete'
        AND (expires_at IS NULL OR expires_at > NOW())
    `, [resourceType, resourceId, userId]);

    return collaboratorAccess.rows.length > 0;
  }

  /**
   * Filter query to only show accessible resources
   */
  static buildAccessFilter(userId, userRole, tableName) {
    if (userRole === 'system_admin') {
      // System admin sees everything
      return { where: '', params: [] };
    }

    return {
      where: `
        (
          -- User owns the resource
          ${tableName}.owner_id = $1
          -- Or it's not private and user is in same team
          OR (
            ${tableName}.is_private = FALSE
            AND ${tableName}.team_id IN (SELECT team_id FROM users WHERE id = $1)
          )
          -- Or it's not private and user is in same brokerage
          OR (
            ${tableName}.is_private = FALSE
            AND ${tableName}.access_level = 'broker'
            AND ${tableName}.broker_id IN (SELECT broker_id FROM users WHERE id = $1)
          )
          -- Or user has been granted access
          OR EXISTS (
            SELECT 1 FROM data_access_control
            WHERE resource_type = '${tableName.replace(/s$/, '')}'
              AND resource_id = ${tableName}.id
              AND user_id = $1
              AND (expires_at IS NULL OR expires_at > NOW())
          )
        )
      `,
      params: [userId]
    };
  }
}

module.exports = OwnershipService;
```

---

### **Day 9-10: Authorization Middleware**

#### File: /backend/src/middleware/authorization.middleware.js
```javascript
const { pool } = require('../config/database');
const OwnershipService = require('../services/ownership.service');

/**
 * Check if user can access requested scope
 */
const canAccessScope = async (req, res, next) => {
  const { scope } = req.query;
  const { role, id: userId, broker_id, team_id } = req.user;

  // System admin can access any scope
  if (role === 'system_admin') return next();

  if (scope === 'brokerage') {
    // Only broker role can access brokerage scope
    if (role !== 'broker') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_ROLE',
          message: 'Broker role required for brokerage scope',
          userRole: role,
          requiredRole: 'broker'
        }
      });
    }

    // Verify user has broker_id
    if (!broker_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NO_BROKER_ASSOCIATION',
          message: 'User is not associated with a brokerage'
        }
      });
    }
  }

  if (scope === 'team') {
    // Verify user has team_id
    if (!team_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NO_TEAM_ASSOCIATION',
          message: 'User is not assigned to a team'
        }
      });
    }
  }

  next();
};

/**
 * Require ownership of resource to modify
 */
const requireOwnership = (resourceType) => async (req, res, next) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  const canModify = await OwnershipService.canModifyResource(
    userId,
    role,
    resourceType,
    id
  );

  if (!canModify) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to modify this resource'
      }
    });
  }

  next();
};

/**
 * Require permission to delete
 */
const requireDeletePermission = (resourceType) => async (req, res, next) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  const canDelete = await OwnershipService.canDeleteResource(
    userId,
    role,
    resourceType,
    id
  );

  if (!canDelete) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this resource'
      }
    });
  }

  next();
};

module.exports = {
  canAccessScope,
  requireOwnership,
  requireDeletePermission
};
```

---

## 📱 NEXT STEPS FOR YOU

1. **Review Implementation Plan** - Does this match your vision?
2. **Confirm Priority** - Start with database migrations?
3. **Test Account Passwords** - Want to set custom passwords for jayden/cole?
4. **Broker Admin Scope** - Should "broker_admin" permission allow viewing ALL teams or just managing users?

Let me know if you want me to:
- ✅ Start running the migrations (Phase 1 Days 1-7)
- ✅ Create the ownership service code
- ✅ Build the authorization middleware
- ✅ Or make any changes to the plan first

Ready to implement when you are! 🚀
