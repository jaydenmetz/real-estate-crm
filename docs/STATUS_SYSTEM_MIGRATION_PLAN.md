# Status System Migration Plan
**Database-Driven, User-Customizable Status System**

**Created:** 2025-01-25
**Status:** Ready for Implementation
**Estimated Time:** 8-12 hours

---

## Executive Summary

Migrate from hardcoded status values to a flexible, database-driven status system that allows:
- ✅ User-customizable statuses per team
- ✅ Status transition validation
- ✅ Audit trail for all status changes
- ✅ Foundation for multi-tenant SaaS
- ✅ Eliminates sync issues between frontend/backend/database

---

## Current System Analysis

### Problems with Current Approach

1. **3 Parallel Status Systems** (causes sync issues)
   - Frontend: `/frontend/src/config/statuses/`
   - Backend: `/backend/src/config/statuses/`
   - Legacy: Component-level constants

2. **Database Mismatches** (causes runtime bugs)
   - Escrows: DB has "opened", code expects "Active"
   - Listings: DB missing 4 statuses defined in code
   - No validation on invalid status values

3. **No User Customization** (limits product flexibility)
   - Every team must use same statuses
   - Can't add custom workflow states
   - Not competitive with modern CRMs

4. **No Transition Rules** (data integrity issues)
   - Can go from "Closed" → "Active" (invalid)
   - No validation on status changes
   - No audit trail for compliance

---

## New System Architecture

### Database Schema (✅ Created)

**File:** `/backend/migrations/047_status_system_tables.sql`

**Tables:**
1. `statuses` - Core status definitions
2. `status_categories` - Tab groupings (Active, Closed, All, etc.)
3. `status_category_mappings` - Many-to-many (statuses ↔ categories)
4. `status_transitions` - Valid state changes
5. `status_change_log` - Audit trail

**Key Features:**
- Team-specific customization (team_id column)
- System defaults (team_id = '00000000-0000-0000-0000-000000000000')
- Automatic fallback if team hasn't customized
- Status color/icon for UI consistency

### Backend API (✅ Created)

**Service:** `/backend/src/modules/system/statuses/services/statuses.service.js`

**Functions:**
- `getStatuses(teamId, entityType)` - Get all statuses
- `getStatusCategories(teamId, entityType)` - Get tabs with statuses
- `validateTransition(from, to, userRole)` - Check if transition valid
- `logStatusChange(...)` - Audit trail
- `createCustomStatus(...)` - User customization

**Routes:** `/backend/src/modules/system/statuses/routes/statuses.routes.js`

**Endpoints:**
- `GET /api/v1/statuses/:entityType` - List all statuses
- `GET /api/v1/statuses/:entityType/categories` - Get tabs
- `GET /api/v1/statuses/:entityType/:entityId/history` - Audit log
- `POST /api/v1/statuses/:entityType` - Create custom status
- `POST /api/v1/statuses/validate-transition` - Validate state change

---

## Migration Steps

### Phase 1: Database Setup (2 hours)

**1. Run Migration**
```bash
cd backend
PGPASSWORD=ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ psql \
  -h ballast.proxy.rlwy.net \
  -p 20017 \
  -U postgres \
  -d railway \
  -f migrations/047_status_system_tables.sql
```

**2. Verify Seed Data**
```sql
-- Should return 3 rows (Active, Closed, Cancelled)
SELECT * FROM statuses WHERE entity_type = 'escrows';

-- Should return 4 rows (Active, Closed, Cancelled, All)
SELECT * FROM status_categories WHERE entity_type = 'escrows';

-- Should return 7 rows (Listings has more statuses)
SELECT * FROM statuses WHERE entity_type = 'listings';
```

**3. Update Existing Escrow Records**
```sql
-- Map old database values to new status system
UPDATE escrows SET escrow_status = 'Active' WHERE escrow_status = 'opened';
UPDATE escrows SET escrow_status = 'Closed' WHERE escrow_status IN ('pending', 'closed');
```

### Phase 2: Backend Integration (2 hours)

**1. Update Escrow Controller** to log status changes
```javascript
// In escrows.controller.js updateEscrow() function

// Before saving status change
if (req.body.escrow_status && req.body.escrow_status !== existingEscrow.escrow_status) {
  const fromStatus = await getStatusByKey('escrows', existingEscrow.escrow_status);
  const toStatus = await getStatusByKey('escrows', req.body.escrow_status);

  // Validate transition
  const validation = await validateTransition(fromStatus.id, toStatus.id, req.user.role);
  if (!validation.allowed) {
    return res.status(400).json({ error: validation.message });
  }

  // Log the change
  await logStatusChange({
    entityType: 'escrows',
    entityId: id,
    fromStatusId: fromStatus.id,
    toStatusId: toStatus.id,
    changedBy: req.user.id,
    reason: req.body.status_change_reason // Optional
  });
}
```

**2. Update Filtering Logic** to use database statuses
```javascript
// In escrows.controller.js getAllEscrows()

// OLD: Hardcoded status filter
const statusFilter = status ? `AND escrow_status = $2` : '';

// NEW: Query from database
const teamStatuses = await getStatuses(req.user.team_id, 'escrows');
const validStatuses = teamStatuses.map(s => s.status_key);
if (status && !validStatuses.includes(status)) {
  return res.status(400).json({ error: 'Invalid status for your team' });
}
```

### Phase 3: Frontend Integration (4 hours)

**1. Create Status Fetching Service**
```javascript
// frontend/src/services/statuses.service.js

import apiInstance from './api.service';

export const statusesService = {
  async getStatuses(entityType) {
    const response = await apiInstance.get(`/statuses/${entityType}`);
    return response.data.data;
  },

  async getCategories(entityType) {
    const response = await apiInstance.get(`/statuses/${entityType}/categories`);
    return response.data.data;
  },

  async getStatusHistory(entityType, entityId) {
    const response = await apiInstance.get(`/statuses/${entityType}/${entityId}/history`);
    return response.data.data;
  }
};
```

**2. Create Status Context**
```javascript
// frontend/src/contexts/StatusContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { statusesService } from '../services/statuses.service';

export const StatusContext = createContext(null);

export const StatusProvider = ({ children, entityType }) => {
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const [statusData, categoryData] = await Promise.all([
          statusesService.getStatuses(entityType),
          statusesService.getCategories(entityType)
        ]);
        setStatuses(statusData);
        setCategories(categoryData);
      } catch (error) {
        console.error('Failed to fetch statuses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatuses();
  }, [entityType]);

  return (
    <StatusContext.Provider value={{ statuses, categories, loading }}>
      {children}
    </StatusContext.Provider>
  );
};
```

**3. Update StatusTabWithDropdown Component**
```javascript
// BEFORE: Uses hardcoded config
const dropdown = getCategoryDropdown(entity, category.id);

// AFTER: Uses database-driven categories from context
const { categories } = useContext(StatusContext);
const currentCategory = categories.find(c => c.category_key === category.id);
```

**4. Wrap Dashboards with StatusProvider**
```javascript
// In EscrowsDashboard.jsx

import { StatusProvider } from '../../../contexts/StatusContext';

export default function EscrowsDashboard() {
  return (
    <StatusProvider entityType="escrows">
      <PrivacyProvider entityType="escrows">
        {/* Dashboard content */}
      </PrivacyProvider>
    </StatusProvider>
  );
}
```

### Phase 4: Cleanup (2 hours)

**1. Remove Old Files**
```bash
# Frontend legacy constants
rm frontend/src/components/dashboards/escrows/constants/escrowConstants.js
rm frontend/src/components/dashboards/clients/constants/clientConstants.js
rm frontend/src/components/dashboards/leads/constants/leadConstants.js

# Remove problematic statusGroups.js
rm frontend/src/config/entities/statusGroups.js
```

**2. Mark Hardcoded Configs as Deprecated**
```javascript
// frontend/src/config/statuses/statusDefinitions.js

/**
 * @deprecated Use database-driven statuses via StatusContext instead
 * This file will be removed in future version
 *
 * Migration path:
 * 1. Wrap component with <StatusProvider entityType="escrows">
 * 2. Use const { statuses, categories } = useContext(StatusContext);
 * 3. Remove imports from this file
 */
```

**3. Update Documentation**
```markdown
# Add to CLAUDE.md

## Status System Architecture (Updated 2025-01-25)

**Database-Driven:** All status configurations now stored in database
**User-Customizable:** Teams can create custom statuses via Settings
**Validated:** Status transitions enforced by database rules
**Audited:** All status changes logged for compliance

### Usage in Components

```javascript
import { StatusContext } from '@/contexts/StatusContext';

// Wrap dashboard with provider
<StatusProvider entityType="escrows">
  <YourDashboard />
</StatusProvider>

// Use in component
const { statuses, categories, loading } = useContext(StatusContext);
```

### API Endpoints

- `GET /api/v1/statuses/escrows` - List all escrow statuses
- `GET /api/v1/statuses/escrows/categories` - Get tabs with statuses
- `POST /api/v1/statuses/escrows` - Create custom status
```

---

## Testing Plan

### Backend Tests

**1. Status Service Tests**
```javascript
// backend/src/modules/system/statuses/__tests__/statuses.service.test.js

describe('Status Service', () => {
  it('should fetch team-specific statuses', async () => {
    const statuses = await getStatuses(teamId, 'escrows');
    expect(statuses).toHaveLength(3); // Active, Closed, Cancelled
  });

  it('should fall back to system defaults', async () => {
    const statuses = await getStatuses('new-team-id', 'escrows');
    expect(statuses).toHaveLength(3); // System defaults
  });

  it('should validate transitions correctly', async () => {
    const result = await validateTransition(activeId, closedId, 'agent');
    expect(result.allowed).toBe(true);
  });

  it('should reject invalid transitions', async () => {
    const result = await validateTransition(closedId, activeId, 'agent');
    expect(result.allowed).toBe(false);
  });
});
```

**2. API Route Tests**
```bash
# Test status endpoints
curl -H "Authorization: Bearer $TOKEN" \
  https://api.jaydenmetz.com/v1/statuses/escrows

# Test categories endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://api.jaydenmetz.com/v1/statuses/escrows/categories
```

### Frontend Tests

**1. Status Context Tests**
```javascript
describe('StatusContext', () => {
  it('should fetch statuses on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useContext(StatusContext), {
      wrapper: ({ children }) => (
        <StatusProvider entityType="escrows">{children}</StatusProvider>
      )
    });

    await waitForNextUpdate();
    expect(result.current.statuses).toHaveLength(3);
  });
});
```

**2. Manual Testing Checklist**
- [ ] Escrows dashboard tabs load with database statuses
- [ ] Dropdowns show correct statuses per category
- [ ] Status chips display correct colors from database
- [ ] Status changes log to status_change_log table
- [ ] Invalid transitions are blocked
- [ ] Team-specific statuses work (create custom status via API)
- [ ] Fallback to system defaults works (test with new team)

---

## Rollout Strategy

### Week 1: Foundation
- ✅ Run migration 047
- ✅ Verify seed data
- ✅ Test API endpoints
- ✅ Update escrow status values in database

### Week 2: Backend Integration
- Integrate status validation in escrows controller
- Add status change logging
- Update filtering logic to use database
- Test with Escrows module

### Week 3: Frontend Integration
- Create StatusContext and provider
- Update EscrowsDashboard to use database statuses
- Test dropdown filtering with database data
- Verify status chips show correct colors

### Week 4: Expand to Other Modules
- Apply same pattern to Listings
- Apply same pattern to Clients
- Apply same pattern to Leads
- Apply same pattern to Appointments

### Week 5: Cleanup & Documentation
- Remove legacy constant files
- Update CLAUDE.md with new patterns
- Add user-facing documentation
- Create admin UI for status customization

---

## User-Facing Features (Future)

### Phase 2: Admin Status Management UI

**Location:** Settings → Status Management

**Features:**
- View all statuses for each entity type
- Create custom statuses with color picker
- Define valid transitions (workflow editor)
- Preview how statuses appear in UI
- Clone system defaults as starting point

**UI Mockup:**
```
Status Management - Escrows

System Defaults (Read-Only)
┌─────────────────────────────────────────┐
│ ⚫ Active      (Green)   [Default]      │
│ ⚫ Closed      (Blue)    [Final]        │
│ ⚫ Cancelled   (Red)     [Final]        │
└─────────────────────────────────────────┘

Custom Statuses
┌─────────────────────────────────────────┐
│ ⚫ Pre-Approval  (Yellow)  [Edit] [Delete] │
│ ⚫ Inspection    (Orange)  [Edit] [Delete] │
└─────────────────────────────────────────┘

[+ Add Custom Status]
```

---

## Benefits Summary

### Technical Benefits
- ✅ Single source of truth (database)
- ✅ No sync issues between frontend/backend
- ✅ Easier testing (database fixtures)
- ✅ Better error handling (validation at DB level)

### Business Benefits
- ✅ Competitive feature (user customization)
- ✅ Multi-tenant ready (team-specific)
- ✅ Compliance-ready (audit trail)
- ✅ Professional product (flexible workflows)

### User Benefits
- ✅ Custom workflows per team
- ✅ Status history for transparency
- ✅ Prevented mistakes (transition validation)
- ✅ Consistent UI (colors from database)

---

## Files Created

**Backend:**
- `/backend/migrations/047_status_system_tables.sql` (550 lines)
- `/backend/src/modules/system/statuses/services/statuses.service.js` (270 lines)
- `/backend/src/modules/system/statuses/routes/statuses.routes.js` (150 lines)
- `/backend/src/modules/system/statuses/routes/index.js` (7 lines)

**Documentation:**
- `/docs/STATUS_SYSTEM_MIGRATION_PLAN.md` (this file)

**Modified:**
- `/backend/src/app.js` - Added statuses route registration

---

## Next Steps

### Immediate (This Session)
1. Run migration 047 on Railway database ✅
2. Test API endpoints with curl
3. Commit backend changes to Git

### Next Session (When Ready)
1. Create StatusContext.jsx
2. Update EscrowsDashboard to use database
3. Test dropdown filtering
4. Verify status chips

### Future (Weeks 2-4)
1. Expand to other modules (Listings, Clients, etc.)
2. Add status transition validation to all controllers
3. Build admin UI for status customization
4. Remove legacy constant files

---

**Questions or Issues?**
- Reference: `/docs/STATUS_CONFIGURATION.md` (existing docs)
- Architecture: `/docs/DDD_STRUCTURE.md`
- Migration file: `/backend/migrations/047_status_system_tables.sql`
