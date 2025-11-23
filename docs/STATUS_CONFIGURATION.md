# Status Configuration System

**Last Updated:** 2025-01-23
**Version:** 1.0.0

## Overview

This document describes the centralized status configuration system that manages all entity statuses, categories, and their relationships across the entire application (frontend and backend).

---

## File Structure

### Frontend Files

```
frontend/src/config/statuses/
├── statusDefinitions.js    # Master list of all statuses
├── statusCategories.js     # Category groupings (tabs)
└── index.js               # Barrel export
```

### Backend Files

```
backend/src/config/statuses/
├── statusDefinitions.js    # Status validation & transitions
├── statusCategories.js     # Category filtering & SQL helpers
└── index.js               # Barrel export
```

---

## Status Definitions

### Frontend: `/frontend/src/config/statuses/statusDefinitions.js`

Defines **all statuses** for all entities with UI properties.

**Structure:**
```javascript
export const LISTING_STATUSES = {
  ACTIVE: {
    id: 'Active',              // Database value
    label: 'Active',           // Display name
    color: '#10b981',          // Primary color
    bg: 'rgba(...)',           // Background color
    icon: 'trending_up',       // MUI icon name
    description: '...',        // Tooltip text
    sortOrder: 1,              // Display order
  },
  // ... more statuses
};
```

**Available Statuses:**

| Entity | Status Constants | Database Values |
|--------|-----------------|-----------------|
| **Escrows** | `ESCROW_STATUSES` | Active, Closed, Cancelled |
| **Listings** | `LISTING_STATUSES` | Active, ActiveUnderContract, Pending, Closed, Cancelled, Expired, Withdrawn, Coming Soon |
| **Clients** | `CLIENT_STATUSES` | active, prospecting, under_contract, closed, inactive, lost |
| **Leads** | `LEAD_STATUSES` | New, Contacted, Qualified, Nurturing, Converted, Unqualified, Lost, Dead |
| **Appointments** | `APPOINTMENT_STATUSES` | scheduled, confirmed, completed, cancelled, no_show |

**Helper Functions:**
- `getEntityStatuses(entity)` - Get all statuses for entity
- `getStatusById(entity, statusId)` - Get status definition
- `getStatusOptions(entity)` - Get dropdown options

### Backend: `/backend/src/config/statuses/statusDefinitions.js`

Defines statuses with **validation** and **state transitions**.

**Structure:**
```javascript
const LISTING_STATUSES = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  // ...
};

const LISTING_STATUS_TRANSITIONS = {
  Active: ['Pending', 'Closed', 'Cancelled'],
  Pending: ['Closed', 'Cancelled'],
  Closed: [], // Terminal state
  // ...
};
```

**Helper Functions:**
- `getValidStatuses(entity)` - Get array of valid status strings
- `isValidStatus(entity, status)` - Validate a status
- `getValidTransitions(entity, currentStatus)` - Get allowed transitions
- `isValidTransition(entity, current, new)` - Validate transition
- `isTerminalStatus(entity, status)` - Check if terminal state

---

## Status Categories

### Frontend: `/frontend/src/config/statuses/statusCategories.js`

Defines **tab groupings** and **dropdown structure**.

**Structure:**
```javascript
export const LISTING_CATEGORIES = {
  ACTIVE: {
    id: 'active',                      // Category identifier
    label: 'Active',                   // Tab label
    displayName: 'Active Listings',    // Dropdown header
    statuses: ['Active', 'Pending'],   // Included statuses
    preferredViewMode: 'card',         // Default view
    sortOrder: 1,                      // Tab order
  },
  // ... more categories
};
```

**Dropdown Structure:**

When a tab is clicked, dropdown shows:
```
Active Listings         ← displayName
_______________        ← divider
Active                 ← status 1
Active Under Contract  ← status 2
Pending               ← status 3
```

**Available Categories:**

| Entity | Categories |
|--------|-----------|
| **Escrows** | Active, Closed, Cancelled, All Escrows |
| **Listings** | Active, Closed, Cancelled, All Listings |
| **Clients** | Active, Closed, Inactive, All Clients |
| **Leads** | Active, Converted, Lost, All Leads |
| **Appointments** | Scheduled, Completed, Cancelled, All Appointments |

**Helper Functions:**
- `getEntityCategories(entity)` - Get all categories
- `getCategoryById(entity, categoryId)` - Get category definition
- `getCategoryByStatus(entity, statusId)` - Find category for a status
- `getEntityTabs(entity)` - Get tab array for dashboard
- `getCategoryDropdown(entity, categoryId)` - Get dropdown structure
- `isStatusInCategory(entity, status, category)` - Check membership

### Backend: `/backend/src/config/statuses/statusCategories.js`

Defines categories for **API filtering** and **SQL queries**.

**Helper Functions:**
- `getCategoryStatuses(entity, categoryId)` - Get status array
- `buildCategoryWhereClause(entity, category, column)` - Generate SQL WHERE
- `isStatusInCategory(entity, status, category)` - Validate membership

**Example SQL Generation:**
```javascript
const whereClause = buildCategoryWhereClause('listings', 'active', 'listing_status');
// Returns: "listing_status IN ('Active', 'ActiveUnderContract', 'Pending')"
```

---

## Usage Examples

### Frontend - Dashboard Tabs

```javascript
import { getEntityTabs, getCategoryDropdown } from '@/config/statuses';

// Get all tabs for listings dashboard
const tabs = getEntityTabs('listings');
// Returns:
// [
//   { id: 'active', label: 'Active', displayName: 'Active Listings', ... },
//   { id: 'closed', label: 'Closed', displayName: 'Closed Listings', ... },
//   { id: 'cancelled', label: 'Cancelled', displayName: 'Cancelled Listings', ... },
//   { id: 'all', label: 'All Listings', displayName: 'All Listings', ... },
// ]

// Get dropdown for Active tab
const dropdown = getCategoryDropdown('listings', 'active');
// Returns:
// {
//   header: 'Active Listings',
//   items: ['Active', 'ActiveUnderContract', 'Pending']
// }
```

### Frontend - Status Chips

```javascript
import { getStatusById } from '@/config/statuses';

const status = getStatusById('listings', 'Active');
// Returns:
// {
//   id: 'Active',
//   label: 'Active',
//   color: '#10b981',
//   bg: 'rgba(16, 185, 129, 0.1)',
//   icon: 'trending_up',
//   description: 'Actively listed property'
// }

<Chip
  label={status.label}
  sx={{ backgroundColor: status.bg, color: status.color }}
/>
```

### Backend - Validation

```javascript
const { isValidStatus, isValidTransition } = require('@/config/statuses');

// Validate status
if (!isValidStatus('listings', userInput)) {
  return res.status(400).json({ error: 'Invalid status' });
}

// Validate transition
if (!isValidTransition('listings', currentStatus, newStatus)) {
  return res.status(400).json({ error: 'Invalid status transition' });
}
```

### Backend - Category Filtering

```javascript
const { buildCategoryWhereClause } = require('@/config/statuses');

// Build WHERE clause for active listings
const whereClause = buildCategoryWhereClause('listings', 'active', 'listing_status');

const query = `
  SELECT * FROM listings
  WHERE ${whereClause}
    AND deleted_at IS NULL
`;
```

---

## Database Schema Alignment

### Current Database Status Columns

| Table | Column | Type | Current Values |
|-------|--------|------|----------------|
| escrows | `escrow_status` | varchar(50) | Active, Closed, Cancelled |
| listings | `listing_status` | varchar(50) | Active, Closed, Coming Soon, Off Market |
| clients | `status` | varchar(50) | active |
| leads | `lead_status` | varchar(50) | New |
| appointments | `appointment_status` | varchar(50) | (varies) |

### Migration Needed For Full Implementation

**Listings Table:**
```sql
-- Add new statuses to CHECK constraint
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check
  CHECK (listing_status IN (
    'Coming Soon',
    'Active',
    'ActiveUnderContract',
    'Pending',
    'Closed',
    'Cancelled',
    'Expired',
    'Withdrawn'
  ));
```

**Clients Table:**
```sql
-- Update status column constraint
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE clients ADD CONSTRAINT clients_status_check
  CHECK (status IN (
    'active',
    'prospecting',
    'under_contract',
    'closed',
    'inactive',
    'lost'
  ));
```

**Leads Table:**
```sql
-- Update status column constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (lead_status IN (
    'New',
    'Contacted',
    'Qualified',
    'Nurturing',
    'Converted',
    'Unqualified',
    'Lost',
    'Dead'
  ));
```

---

## Future: User-Defined Statuses

When implementing user-defined statuses (future phase), the system will:

1. **Load from Database:**
   - Replace hardcoded constants with database queries
   - Store in `entity_statuses` and `entity_categories` tables

2. **Database Schema:**
```sql
CREATE TABLE entity_statuses (
  id UUID PRIMARY KEY,
  entity VARCHAR(50) NOT NULL,
  status_id VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(20),
  icon VARCHAR(50),
  sort_order INTEGER,
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entity, status_id, team_id)
);

CREATE TABLE entity_categories (
  id UUID PRIMARY KEY,
  entity VARCHAR(50) NOT NULL,
  category_id VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  display_name VARCHAR(150),
  sort_order INTEGER,
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entity, category_id, team_id)
);

CREATE TABLE category_status_mappings (
  category_id UUID REFERENCES entity_categories(id),
  status_id UUID REFERENCES entity_statuses(id),
  PRIMARY KEY (category_id, status_id)
);
```

3. **API Endpoints:**
   - `POST /api/v1/statuses/:entity` - Create custom status
   - `PUT /api/v1/statuses/:entity/:id` - Update status
   - `DELETE /api/v1/statuses/:entity/:id` - Delete status
   - `GET /api/v1/categories/:entity` - Get categories
   - `POST /api/v1/categories/:entity` - Create category

4. **Migration Path:**
   - Seed database with current hardcoded values
   - Add team_id to support multi-tenant customization
   - Cache in Redis for performance

---

## Key Benefits

1. **Single Source of Truth:** All statuses defined in one place
2. **Frontend/Backend Sync:** Parallel structure prevents mismatches
3. **Type Safety Ready:** Easy to add TypeScript definitions
4. **Dynamic Ready:** Structure supports database-backed statuses
5. **Validation Built-in:** Status transitions enforced automatically
6. **SQL Generation:** Automatic WHERE clause generation
7. **Dropdown Ready:** Built-in support for category dropdowns
8. **Maintainable:** Change once, update everywhere

---

## Common Tasks

### Adding a New Status

**Frontend:**
```javascript
// 1. Add to statusDefinitions.js
export const LISTING_STATUSES = {
  // ... existing
  ON_HOLD: {
    id: 'On Hold',
    label: 'On Hold',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    icon: 'pause',
    description: 'Listing on hold',
    sortOrder: 8,
  },
};

// 2. Add to appropriate category in statusCategories.js
export const LISTING_CATEGORIES = {
  ACTIVE: {
    statuses: ['Active', 'On Hold', 'Pending'], // Added 'On Hold'
    // ...
  },
};
```

**Backend:**
```javascript
// 1. Add to statusDefinitions.js
const LISTING_STATUSES = {
  // ... existing
  ON_HOLD: 'On Hold',
};

// 2. Add transitions
const LISTING_STATUS_TRANSITIONS = {
  // ... existing
  'On Hold': ['Active', 'Cancelled'],
  Active: ['On Hold', ...], // Add as valid transition from Active
};

// 3. Add to category
const LISTING_CATEGORIES = {
  ACTIVE: {
    statuses: ['Active', 'On Hold', 'Pending'],
  },
};
```

### Adding a New Category

**Frontend:**
```javascript
// statusCategories.js
export const LISTING_CATEGORIES = {
  // ... existing
  PENDING: {
    id: 'pending',
    label: 'Pending',
    displayName: 'Pending Listings',
    statuses: ['Pending', 'ActiveUnderContract'],
    preferredViewMode: 'list',
    sortOrder: 5,
  },
};
```

**Backend:**
```javascript
// statusCategories.js
const LISTING_CATEGORIES = {
  // ... existing
  PENDING: {
    id: 'pending',
    label: 'Pending',
    statuses: ['Pending', 'ActiveUnderContract'],
  },
};
```

---

## Testing

**Frontend:**
```javascript
import { getEntityTabs, getCategoryDropdown } from '@/config/statuses';

describe('Status Categories', () => {
  it('should return all tabs for listings', () => {
    const tabs = getEntityTabs('listings');
    expect(tabs).toHaveLength(4);
    expect(tabs[0].label).toBe('Active');
  });

  it('should return dropdown for active category', () => {
    const dropdown = getCategoryDropdown('listings', 'active');
    expect(dropdown.header).toBe('Active Listings');
    expect(dropdown.items).toContain('Active');
  });
});
```

**Backend:**
```javascript
const { isValidTransition, getCategoryStatuses } = require('@/config/statuses');

describe('Status Transitions', () => {
  it('should allow Active → Closed transition', () => {
    expect(isValidTransition('listings', 'Active', 'Closed')).toBe(true);
  });

  it('should not allow Closed → Active transition', () => {
    expect(isValidTransition('listings', 'Closed', 'Active')).toBe(false);
  });

  it('should return active category statuses', () => {
    const statuses = getCategoryStatuses('listings', 'active');
    expect(statuses).toContain('Active');
    expect(statuses).toContain('Pending');
  });
});
```

---

## Related Files

- **Tab Components:** `/frontend/src/components/dashboards/*/navigation/tabs/`
- **Status Chips:** `/frontend/src/templates/Dashboard/view-modes/`
- **API Controllers:** `/backend/src/modules/*/controllers/`
- **Database Migrations:** `/backend/src/database/migrations/`

---

## Changelog

**2025-01-23:**
- Initial implementation
- Created frontend and backend status configuration system
- Documented all entities, statuses, and categories
- Added helper functions for both frontend and backend

