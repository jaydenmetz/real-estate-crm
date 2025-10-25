# Shared Component Prop Naming Conventions

**Created:** October 24, 2025
**Purpose:** Standardize prop naming across all shared dashboard components
**Status:** Active Reference

## Overview

This document establishes consistent prop naming conventions for the shared component infrastructure created in Phase 1. All new components and refactored modules should follow these standards.

## Core Principles

1. **Clarity over brevity** - Use descriptive names that clearly indicate purpose
2. **Consistency across components** - Same concept = same prop name
3. **Standard React patterns** - Follow React community conventions where they exist
4. **Callback naming** - Use `on[Action]` pattern for event handlers

## Pagination Props

### Standard Names (Use These)
```javascript
{
  page: number,                    // Current page number (1-indexed)
  totalPages: number,              // Total number of pages
  totalItems: number,              // Total count of items across all pages
  itemsPerPage: number,            // Number of items shown per page
  onPageChange: (page) => void,    // Callback when page changes
  onItemsPerPageChange: (count) => void,  // Callback when items per page changes
  itemsPerPageOptions: number[]    // Available page size options [10, 20, 50, 100]
}
```

### ❌ Avoid These Variants
- `rowsPerPage` - Use `itemsPerPage` instead
- `pageSize` - Use `itemsPerPage` instead
- `perPage` - Use `itemsPerPage` instead
- `limit` - Use `itemsPerPage` instead (limit is for API queries)

**Rationale:** "itemsPerPage" is clearer and works for both grid and list views, whereas "rowsPerPage" implies table-only usage.

## View Mode Props

### Standard Names (Use These)
```javascript
{
  viewMode: 'grid' | 'list' | 'table' | 'calendar',  // Current view mode
  onViewModeChange: (mode) => void,                  // Callback when view changes
  availableModes: string[]                           // Allowed view modes for this dashboard
}
```

### ❌ Avoid These Variants
- `view` - Too generic, use `viewMode`
- `displayMode` - Use `viewMode` instead
- `layout` - Reserved for actual layout configuration

## Search Props

### Standard Names (Use These)
```javascript
{
  searchTerm: string,              // Current search query
  onSearchChange: (term) => void,  // Callback when search changes
  searchPlaceholder: string        // Placeholder text for search field
}
```

### ❌ Avoid These Variants
- `search` - Use `searchTerm` to indicate it's a value
- `query` - Use `searchTerm` instead
- `searchQuery` - Redundant, use `searchTerm`

## Filter Props

### Standard Names (Use These)
```javascript
{
  filters: object,                 // Current filter state
  onFilterChange: (filters) => void,  // Callback when filters change
  onFilterClick: () => void,       // Callback to open filter panel
  availableFilters: array          // Filter options available
}
```

## Loading & State Props

### Standard Names (Use These)
```javascript
{
  loading: boolean,                // Data is being fetched
  error: Error | string | null,    // Error state
  empty: boolean,                  // No data available
  disabled: boolean                // Component is disabled
}
```

### ❌ Avoid These Variants
- `isLoading` - Use `loading` (shorter, standard React pattern)
- `hasError` - Use `error` directly (allows error details)
- `isEmpty` - Use `empty`

## Data Props

### Standard Names (Use These)
```javascript
{
  data: array | object,            // Primary data to display
  items: array,                    // For lists/collections
  stats: array,                    // For statistics/metrics
  totalItems: number,              // Total count
  totalCount: number               // Alternative to totalItems (use consistently within app)
}
```

## Action Props

### Standard Names (Use These)
```javascript
{
  onAdd: () => void,               // Add/create new item
  onCreate: () => void,            // Alternative to onAdd
  onEdit: (item) => void,          // Edit existing item
  onDelete: (item) => void,        // Delete item
  onRefresh: () => void,           // Refresh data
  actions: array                   // Collection of action configs
}
```

**Action Object Structure:**
```javascript
{
  label: string,
  onClick: () => void,
  icon: ReactElement,
  variant: 'contained' | 'outlined' | 'text',
  color: 'primary' | 'secondary' | 'error' | etc,
  disabled: boolean,
  props: object  // Additional MUI Button props
}
```

## Content & Display Props

### Standard Names (Use These)
```javascript
{
  title: string,                   // Primary heading
  subtitle: string,                // Secondary text
  description: string,             // Longer descriptive text
  icon: ReactElement,              // Icon component
  imageUrl: string,                // Image source
  showAction: boolean,             // Show/hide action button
  showTotalCount: boolean          // Show/hide count display
}
```

## Component-Specific Props

### DashboardLayout
```javascript
{
  header: object,      // { title, subtitle, actions }
  toolbar: object,     // { viewMode, onViewModeChange, searchTerm, etc }
  stats: array,        // Array of stat objects
  content: object,     // { loading, error, empty, children }
  pagination: object   // { page, totalPages, itemsPerPage, etc }
}
```

### DashboardStats
```javascript
{
  stats: [
    {
      label: string,
      value: number | string,
      icon: ReactElement,
      color: string,
      trend: number,      // Positive = up, negative = down
      format: 'number' | 'currency' | 'percentage'
    }
  ]
}
```

### DashboardEmptyState
```javascript
{
  title: string,
  subtitle: string,
  icon: ReactElement,
  imageUrl: string,
  actionLabel: string,
  onAction: () => void,
  showAction: boolean
}
```

## Prop Ordering Convention

When defining component props, follow this order for consistency:

1. **Data props** - data, items, stats
2. **State props** - loading, error, empty
3. **Display props** - title, subtitle, icon
4. **Interaction props** - onClick, onChange callbacks
5. **Configuration props** - options, modes, settings
6. **Boolean flags** - showX, enableX, disabled
7. **Styling props** - className, sx, style

**Example:**
```javascript
const DashboardComponent = ({
  // Data
  items,
  totalItems,

  // State
  loading,
  error,

  // Display
  title,
  subtitle,

  // Interaction
  onItemClick,
  onRefresh,

  // Configuration
  viewMode,
  availableModes,

  // Flags
  showActions,
  disabled,

  // Styling
  sx
}) => {
  // ...
}
```

## Deprecation Strategy

When renaming props for consistency:

1. Support both old and new prop names temporarily
2. Add console warning in development when old prop is used
3. Document deprecated props in component JSDoc
4. Remove deprecated props in next major version

**Example:**
```javascript
const DashboardPagination = ({
  itemsPerPage,
  rowsPerPage,  // Deprecated
  ...rest
}) => {
  // Support both, prefer itemsPerPage
  const perPage = itemsPerPage ?? rowsPerPage;

  // Warn in development
  if (rowsPerPage && process.env.NODE_ENV === 'development') {
    console.warn('DashboardPagination: rowsPerPage is deprecated, use itemsPerPage instead');
  }

  // ...
}
```

## Current Status

### ✅ Fully Compliant Components
- DashboardPagination (uses itemsPerPage consistently)
- DashboardToolbar (uses viewMode, searchTerm consistently)
- DashboardHeader (uses title, subtitle, actions)
- DashboardStats (uses stats array format)
- DashboardEmptyState (uses title, subtitle, actionLabel)

### 🔍 Components to Audit
- EscrowsDashboard (recently refactored, verify prop usage)
- ListingsDashboard (not yet refactored)
- ClientsDashboard (not yet refactored)
- AppointmentsDashboard (not yet refactored)
- LeadsDashboard (not yet refactored)

## References

- MUI Pagination API: https://mui.com/material-ui/api/pagination/
- React Event Naming: https://react.dev/learn/responding-to-events
- Airbnb React Style Guide: https://github.com/airbnb/javascript/tree/master/react

## Updates

- **Oct 24, 2025**: Initial document created after Phase 1 completion
