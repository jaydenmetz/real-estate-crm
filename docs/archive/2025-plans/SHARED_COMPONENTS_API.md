# Shared Components API Documentation

**Version:** 1.0.0
**Last Updated:** October 24, 2025
**Status:** Production Ready

## Table of Contents

1. [Overview](#overview)
2. [Dashboard Components](#dashboard-components)
3. [Hooks](#hooks)
4. [Usage Patterns](#usage-patterns)
5. [Migration Guide](#migration-guide)
6. [Examples](#examples)

---

## Overview

The shared component library provides a consistent, reusable foundation for all dashboard implementations across the CRM. All components follow Material-UI design principles and support responsive layouts, loading states, and error handling.

### Installation

```javascript
import {
  DashboardLayout,
  DashboardHeader,
  DashboardStats,
  DashboardContent,
  DashboardError,
  DashboardToolbar,
  DashboardPagination
} from '@/shared';

import {
  useDashboardData,
  useDebounce,
  useLocalStorage
} from '@/shared/hooks';
```

---

## Dashboard Components

### DashboardLayout

Master layout component that orchestrates all dashboard sections.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Dashboard title |
| `subtitle` | `string` | `null` | Optional subtitle |
| `breadcrumbs` | `Array<{label, href, onClick}>` | `[]` | Navigation breadcrumbs |
| `stats` | `Array<StatObject>` | `[]` | Statistics cards |
| `statsLoading` | `boolean` | `false` | Loading state for stats |
| `statsColor` | `string` | `'primary'` | Default color for stat cards |
| `toolbar` | `ToolbarConfig` | `{}` | Toolbar configuration |
| `content` | `React.Node` | Required | Main content area |
| `contentLoading` | `boolean` | `false` | Loading state for content |
| `pagination` | `PaginationConfig` | `null` | Pagination controls |
| `loading` | `boolean` | `false` | Global loading state |
| `error` | `Error` | `null` | Error object |
| `maxWidth` | `string` | `'xl'` | Container max width |
| `spacing` | `number` | `4` | Layout spacing |

**StatObject Schema:**

```typescript
{
  id: string;              // Unique identifier
  label: string;           // Stat label
  value: number;           // Stat value
  format?: 'currency' | 'number' | 'percentage';
  change?: number;         // Percentage change
  changePeriod?: string;   // "vs last month"
  subtitle?: string;       // Optional subtitle
  icon?: ReactNode;        // Optional icon
  color?: string;          // Custom color (e.g., 'primary.main')
  info?: string;           // Tooltip text
  onClick?: () => void;    // Click handler
}
```

**ToolbarConfig Schema:**

```typescript
{
  viewMode: 'grid' | 'list' | 'table' | 'calendar';
  onViewModeChange: (mode: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  availableModes?: string[];  // Default: ['grid', 'list', 'table']
  onFilterClick?: () => void;
  actions?: Array<ActionButton>;
  customFilters?: ReactNode;  // Custom filter UI
  emptyMessage?: string;
  emptyAction?: EmptyActionConfig;
  selectedCount?: number;
  onRefresh?: () => void;
}
```

**ActionButton Schema:**

```typescript
{
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'success';
  disabled?: boolean;
  props?: object;  // Additional button props
}
```

**PaginationConfig Schema:**

```typescript
{
  page: number;
  totalPages: number;
  totalItems: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}
```

**Example:**

```jsx
<DashboardLayout
  title="Escrows"
  subtitle="Manage your active escrows"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Escrows' }
  ]}
  stats={dashboardData.stats}
  toolbar={dashboardData.toolbar}
  content={<EscrowGrid escrows={dashboardData.data} />}
  pagination={dashboardData.pagination}
  loading={dashboardData.isLoading}
  error={dashboardData.error}
/>
```

---

### DashboardHeader

Header section with title, breadcrumbs, and action buttons.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Header title |
| `subtitle` | `string` | `null` | Optional subtitle |
| `breadcrumbs` | `Array` | `[]` | Breadcrumb navigation |
| `actions` | `Array<ActionButton>` | `[]` | Header action buttons |
| `loading` | `boolean` | `false` | Show loading skeleton |

**Example:**

```jsx
<DashboardHeader
  title="Client Management"
  subtitle="Manage all your clients"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Clients' }
  ]}
  actions={[
    {
      label: 'Export',
      icon: <Download />,
      onClick: handleExport
    }
  ]}
/>
```

---

### DashboardStats

Statistics cards with trend indicators.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stats` | `Array<StatObject>` | `[]` | Statistics data |
| `color` | `string` | `'primary.main'` | Default color |
| `loading` | `boolean` | `false` | Show loading skeletons |
| `columns` | `object` | `{xs:12, sm:6, md:3}` | Grid column breakpoints |

**Example:**

```jsx
<DashboardStats
  stats={[
    {
      id: 'total',
      label: 'Total Clients',
      value: 150,
      format: 'number',
      change: 12,
      changePeriod: 'vs last month',
      icon: <People />
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: 250000,
      format: 'currency',
      change: -5,
      icon: <AttachMoney />
    }
  ]}
/>
```

---

### DashboardToolbar

Toolbar with view modes, search, and actions.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `viewMode` | `string` | `'grid'` | Current view mode |
| `onViewModeChange` | `function` | Required | View mode change handler |
| `searchTerm` | `string` | `''` | Search input value |
| `onSearchChange` | `function` | Required | Search change handler |
| `searchPlaceholder` | `string` | `'Search...'` | Search placeholder |
| `onFilterClick` | `function` | `null` | Filter button handler |
| `actions` | `Array<ActionButton>` | `[]` | Action buttons |
| `availableModes` | `Array<string>` | `['grid','list','table']` | Available view modes |
| `loading` | `boolean` | `false` | Disabled state |

**Example:**

```jsx
<DashboardToolbar
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search clients..."
  availableModes={['grid', 'list']}
  actions={[
    {
      label: 'New Client',
      icon: <Add />,
      onClick: handleNew
    }
  ]}
/>
```

---

### DashboardContent

Content wrapper with loading and empty states.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.Node` | Required | Content to display |
| `loading` | `boolean` | `false` | Show loading skeletons |
| `empty` | `boolean` | `false` | Show empty state |
| `emptyMessage` | `string` | `'No data found'` | Empty state message |
| `emptyAction` | `object` | `null` | Empty state action config |
| `viewMode` | `string` | `'grid'` | Current view mode |
| `skeletonCount` | `number` | `6` | Number of loading skeletons |

**Example:**

```jsx
<DashboardContent
  loading={isLoading}
  empty={data.length === 0}
  emptyMessage="No clients found"
  emptyAction={{
    label: 'Add First Client',
    onClick: handleAddClient,
    icon: <Add />
  }}
  viewMode="grid"
>
  <ClientGrid clients={data} />
</DashboardContent>
```

---

### DashboardPagination

Pagination controls with items per page selector.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `number` | `1` | Current page |
| `totalPages` | `number` | `1` | Total number of pages |
| `totalItems` | `number` | `0` | Total item count |
| `itemsPerPage` | `number` | `20` | Items per page |
| `onPageChange` | `function` | Required | Page change handler |
| `onItemsPerPageChange` | `function` | Required | Items per page handler |
| `itemsPerPageOptions` | `Array<number>` | `[10,20,50,100]` | Available page sizes |
| `showItemsPerPage` | `boolean` | `true` | Show items per page selector |
| `showTotalCount` | `boolean` | `true` | Show total count |
| `loading` | `boolean` | `false` | Disabled state |

**Example:**

```jsx
<DashboardPagination
  page={page}
  totalPages={10}
  totalItems={200}
  itemsPerPage={20}
  onPageChange={setPage}
  onItemsPerPageChange={setItemsPerPage}
/>
```

---

### DashboardError

Error display with retry functionality.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `error` | `Error` | Required | Error object |
| `onRetry` | `function` | `null` | Retry handler |
| `title` | `string` | `'Error Loading Data'` | Error title |
| `showDetails` | `boolean` | `true` | Show error details |

**Example:**

```jsx
<DashboardError
  error={error}
  onRetry={refetch}
  title="Failed to load escrows"
/>
```

---

## Hooks

### useDashboardData

Master hook for dashboard data management.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `fetchFunction` | `(params) => Promise` | Data fetch function |
| `options` | `DashboardDataOptions` | Configuration options |

**DashboardDataOptions:**

```typescript
{
  queryKey: string | string[];     // React Query cache key
  defaultFilters?: object;         // Initial filters
  defaultViewMode?: string;        // Initial view mode
  defaultRowsPerPage?: number;     // Initial page size
  persistFilters?: boolean;        // Save to localStorage
  staleTime?: number;              // Cache freshness (ms)
  cacheTime?: number;              // Cache retention (ms)
  refetchOnWindowFocus?: boolean;  // Auto-refetch on focus
  onSuccess?: (data) => void;      // Success callback
  onError?: (error) => void;       // Error callback
}
```

**Return Value:**

```typescript
{
  // Data
  data: Array;                     // Fetched items
  stats: Array<StatObject>;        // Dashboard stats

  // Pagination
  pagination: PaginationConfig;

  // Toolbar
  toolbar: ToolbarConfig;

  // Selection
  selection: {
    selected: Array;
    onSelectAll: (checked: boolean) => void;
    onSelectItem: (id, checked: boolean) => void;
    onBulkAction: (action, callback) => void;
  };

  // States
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  error: Error | null;

  // Actions
  refetch: () => void;
  clearFilters: () => void;
  exportData: () => void;
}
```

**Example:**

```jsx
const dashboardData = useDashboardData(
  (params) => clientsAPI.getAll(params),
  {
    queryKey: 'clients',
    defaultFilters: { status: 'active' },
    defaultViewMode: 'grid',
    defaultRowsPerPage: 20,
    persistFilters: true
  }
);

// Access all state
const { data, stats, pagination, toolbar, isLoading } = dashboardData;
```

---

### useDebounce

Debounce a value with configurable delay.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | `any` | Required | Value to debounce |
| `delay` | `number` | `500` | Delay in milliseconds |

**Example:**

```jsx
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

// Use debouncedSearch in API calls
useEffect(() => {
  fetchData({ search: debouncedSearch });
}, [debouncedSearch]);
```

---

### useLocalStorage

Persistent state with localStorage sync.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | localStorage key |
| `initialValue` | `any` | Default value |

**Example:**

```jsx
const [filters, setFilters] = useLocalStorage('dashboard-filters', {
  status: 'active',
  sortBy: 'name'
});

// Works like useState, but persists to localStorage
setFilters({ ...filters, status: 'archived' });
```

---

## Usage Patterns

### Basic Dashboard Implementation

```jsx
import { DashboardLayout, useDashboardData } from '@/shared';
import { myModuleAPI } from '@/services/api.service';

const MyDashboard = () => {
  const dashboardData = useDashboardData(
    (params) => myModuleAPI.getAll(params),
    { queryKey: 'my-module' }
  );

  return (
    <DashboardLayout
      title="My Dashboard"
      stats={dashboardData.stats}
      toolbar={dashboardData.toolbar}
      content={<MyGrid items={dashboardData.data} />}
      pagination={dashboardData.pagination}
      loading={dashboardData.isLoading}
      error={dashboardData.error}
    />
  );
};
```

### Custom Filters

```jsx
const renderCustomFilters = () => (
  <ToggleButtonGroup value={statusFilter} exclusive onChange={handleStatusChange}>
    <ToggleButton value="active">Active</ToggleButton>
    <ToggleButton value="archived">Archived</ToggleButton>
  </ToggleButtonGroup>
);

<DashboardLayout
  toolbar={{
    ...dashboardData.toolbar,
    customFilters: renderCustomFilters()
  }}
  // ... other props
/>
```

### Selection & Bulk Actions

```jsx
const { selection } = dashboardData;

<DashboardLayout
  toolbar={{
    ...dashboardData.toolbar,
    actions: [
      ...(selection.selected.length > 0 ? [
        {
          label: `Delete ${selection.selected.length} items`,
          onClick: () => selection.onBulkAction('delete', handleBulkDelete)
        }
      ] : [])
    ]
  }}
  // ... other props
/>
```

---

## Migration Guide

### Before (Old Pattern)

```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [page, setPage] = useState(1);
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
  fetchData();
}, [page, searchTerm]);

// ... 100+ lines of state management
```

### After (New Pattern)

```jsx
const dashboardData = useDashboardData(
  fetchFunction,
  { queryKey: 'module-name' }
);

// All state managed by hook!
```

**Reduction:** 100+ lines → 5 lines (95% reduction)

---

## Examples

See `/frontend/src/features/escrows/EscrowsDashboard.jsx` for a complete, production-ready example.

**Metrics:**
- Old: 1,179 lines
- New: 169 lines
- Reduction: 85.7%

---

## Best Practices

1. **Always use useDashboardData** for data fetching
2. **Enable persistFilters** for better UX
3. **Provide meaningful stats** with appropriate formats
4. **Use customFilters** for module-specific filtering
5. **Handle empty states** with emptyAction configuration
6. **Implement selection** for bulk operations
7. **Add loading states** to prevent flickering

---

## Support

For questions or issues, see:
- [Phase 1 Implementation Guide](/docs/PHASE_1_IMPLEMENTATION_GUIDE.md)
- [Phase 1 Completion Summary](/docs/PHASE_1_SHARED_COMPONENTS_COMPLETE.md)
