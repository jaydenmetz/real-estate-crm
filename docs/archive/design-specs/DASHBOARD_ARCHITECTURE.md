# Dashboard Architecture - Component Reusability System

**Created:** October 11, 2025
**Purpose:** Reduce dashboard code from 2,000+ lines to <200 lines per dashboard
**Status:** Design Phase

## Problem Statement

Current dashboards (Escrows, Clients, Listings, Appointments, Leads) have 2,000-3,500 lines each with 90% duplicate code:
- EscrowsDashboard: 3,524 lines
- ListingsDashboard: 2,538 lines
- ClientsDashboard: 2,364 lines
- LeadsDashboard: 2,340 lines
- AppointmentsDashboard: 2,262 lines

**Total:** 13,028 lines of mostly duplicate code

## Goal

Create a `BaseDashboard` component system that reduces each dashboard to **<200 lines** while maintaining:
- ✅ All current functionality
- ✅ WebSocket real-time updates
- ✅ Keyboard shortcuts (Cmd/Ctrl+K, F, R, A)
- ✅ Batch operations (select, delete, archive)
- ✅ Pagination (50 per page)
- ✅ Network monitoring
- ✅ Responsive design with date controls
- ✅ Custom stat cards per dashboard
- ✅ Custom filters per dashboard
- ✅ Calendar dialogs
- ✅ Archived view toggle

## Architecture Overview

### Layer 1: Base Component (`BaseDashboard.jsx`)
**Handles:** All shared UI and behavior logic (1,500-2,000 lines total)

```
BaseDashboard.jsx (1,800 lines - write once, use everywhere)
├── Props Interface (dashboard configuration)
├── State Management (all shared state)
├── WebSocket Logic (real-time updates)
├── Keyboard Shortcuts (Cmd+K, F, R, A)
├── Batch Operations (select, delete, archive)
├── Pagination (50 per page, load more)
├── Network Monitoring (request/error tracking)
├── Date Range Filtering (1D, 1M, 1Y, YTD, custom)
├── View Mode Switching (grid/list)
├── Sort Controls
├── Archive Toggle
└── Render Methods (hero, filters, tabs, cards)
```

### Layer 2: Custom Hooks (Reusable Logic)
Extract complex logic into composable hooks:

```javascript
// hooks/useWebSocket.js (100 lines)
export const useWebSocket = (endpoint, onMessage, dependencies) => {
  // WebSocket connection, reconnection, cleanup
}

// hooks/useKeyboardShortcuts.js (80 lines)
export const useKeyboardShortcuts = (shortcuts) => {
  // Register keyboard shortcuts, cleanup
}

// hooks/useBatchOperations.js (120 lines)
export const useBatchOperations = (items, api) => {
  // Selected items, select all, delete, archive
}

// hooks/usePagination.js (60 lines)
export const usePagination = (items, pageSize = 50) => {
  // Pagination logic, load more
}

// hooks/useDateFilter.js (100 lines)
export const useDateFilter = (items, dateField) => {
  // Date range filtering logic
}

// hooks/useNetworkMonitor.js (80 lines)
export const useNetworkMonitor = () => {
  // Track API requests, errors, latency
}
```

### Layer 3: Shared Components (UI Building Blocks)
Reusable UI components with theming:

```javascript
// components/dashboard/StatCard.jsx (150 lines)
<StatCard
  title="Total Escrows"
  value={42}
  change={+12}
  icon={<Business />}
  color="blue"
  chart={chartData}
/>

// components/dashboard/FilterBar.jsx (200 lines)
<FilterBar
  tabs={['all', 'active', 'archived']}
  currentTab={activeTab}
  onTabChange={setActiveTab}
  sortOptions={['date', 'amount', 'status']}
  currentSort={sort}
  onSortChange={setSort}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  showArchived={showArchived}
  onToggleArchived={toggleArchived}
  selectedCount={selectedItems.length}
  onBatchDelete={handleBatchDelete}
/>

// components/dashboard/HeroSection.jsx (250 lines)
<HeroSection
  title="Escrows"
  subtitle="Manage your transactions"
  stats={[
    { label: 'Total', value: 42, icon: <Business />, color: 'blue' },
    { label: 'Active', value: 28, icon: <CheckCircle />, color: 'green' },
  ]}
  dateRange={dateRange}
  onDateRangeChange={setDateRange}
  aiManager={<AIManager />}
/>

// components/dashboard/DatabaseCard.jsx (200 lines)
<DatabaseCard
  item={escrow}
  selected={isSelected}
  onSelect={handleSelect}
  onClick={() => navigate(`/escrows/${escrow.id}`)}
  fields={[
    { label: 'Address', value: escrow.property_address, icon: <Home /> },
    { label: 'Amount', value: formatCurrency(escrow.purchase_price) },
    { label: 'Status', value: escrow.status, chip: true },
  ]}
  actions={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Archive', onClick: handleArchive },
  ]}
/>

// components/dashboard/CalendarDialog.jsx (150 lines)
<CalendarDialog
  open={calendarOpen}
  onClose={() => setCalendarOpen(false)}
  events={escrows.map(e => ({
    date: e.closing_date,
    title: e.property_address,
    color: getStatusColor(e.status),
  }))}
/>
```

### Layer 4: Dashboard Configuration (Dashboard-Specific)
Each dashboard becomes a simple config file:

```javascript
// EscrowsDashboard.jsx (150-200 lines)
import BaseDashboard from '../base/BaseDashboard';
import NewEscrowModal from '../forms/NewEscrowModal';
import { escrowsAPI } from '../../services/api.service';

const EscrowsDashboard = () => {
  return (
    <BaseDashboard
      // Identity
      entityName="Escrow"
      entityNamePlural="Escrows"
      apiEndpoint="/escrows"
      api={escrowsAPI}

      // Theme
      primaryColor="#1976d2"
      secondaryColor="#42a5f5"

      // Stats Configuration
      stats={[
        {
          key: 'total',
          label: 'Total Escrows',
          icon: <Business />,
          getValue: (items) => items.length,
          chart: true,
        },
        {
          key: 'active',
          label: 'Active',
          icon: <CheckCircle />,
          getValue: (items) => items.filter(i => i.status === 'active').length,
        },
        {
          key: 'totalValue',
          label: 'Total Value',
          icon: <AttachMoney />,
          getValue: (items) => items.reduce((sum, i) => sum + i.purchase_price, 0),
          format: 'currency',
          change: true,
        },
      ]}

      // Tabs Configuration
      tabs={[
        { key: 'all', label: 'All Escrows', filter: () => true },
        { key: 'active', label: 'Active', filter: (item) => item.status === 'active' },
        { key: 'pending', label: 'Pending', filter: (item) => item.status === 'pending' },
        { key: 'closed', label: 'Closed', filter: (item) => item.status === 'closed' },
      ]}

      // Sort Configuration
      sortOptions={[
        { key: 'date', label: 'Date', sort: (a, b) => new Date(b.closing_date) - new Date(a.closing_date) },
        { key: 'amount', label: 'Amount', sort: (a, b) => b.purchase_price - a.purchase_price },
        { key: 'address', label: 'Address', sort: (a, b) => a.property_address.localeCompare(b.property_address) },
      ]}

      // Card Display Configuration
      cardFields={[
        { key: 'property_address', label: 'Address', icon: <Home />, primary: true },
        { key: 'purchase_price', label: 'Price', format: 'currency', icon: <AttachMoney /> },
        { key: 'closing_date', label: 'Closing', format: 'date', icon: <CalendarToday /> },
        { key: 'status', label: 'Status', chip: true, chipColor: getStatusColor },
      ]}

      // Date Field (for filtering)
      dateField="closing_date"

      // Calendar Configuration
      calendarEvents={(items) => items.map(item => ({
        date: item.closing_date,
        title: item.property_address,
        color: getStatusColor(item.status),
      }))}

      // Create Modal
      CreateModal={NewEscrowModal}

      // WebSocket Endpoint
      websocketEndpoint="escrows"

      // Keyboard Shortcuts (optional overrides)
      shortcuts={{
        'Cmd+K': () => console.log('Custom action'),
      }}
    />
  );
};

export default EscrowsDashboard;
```

## File Structure

```
frontend/src/
├── components/
│   ├── base/
│   │   └── BaseDashboard.jsx          # (1,800 lines - core logic)
│   ├── dashboard/                      # Shared UI components
│   │   ├── StatCard.jsx                # (150 lines)
│   │   ├── HeroSection.jsx             # (250 lines)
│   │   ├── FilterBar.jsx               # (200 lines)
│   │   ├── DatabaseCard.jsx            # (200 lines)
│   │   └── CalendarDialog.jsx          # (150 lines)
│   └── dashboards/                     # Dashboard configs
│       ├── EscrowsDashboard.jsx        # (150 lines - just config)
│       ├── ListingsDashboard.jsx       # (150 lines)
│       ├── ClientsDashboard.jsx        # (150 lines)
│       ├── AppointmentsDashboard.jsx   # (150 lines)
│       ├── LeadsDashboard.jsx          # (150 lines)
│       ├── RealtorsDashboard.jsx       # (150 lines - NEW)
│       ├── OpenHousesDashboard.jsx     # (150 lines - NEW)
│       └── ...
├── hooks/
│   ├── useWebSocket.js                 # (100 lines)
│   ├── useKeyboardShortcuts.js         # (80 lines)
│   ├── useBatchOperations.js           # (120 lines)
│   ├── usePagination.js                # (60 lines)
│   ├── useDateFilter.js                # (100 lines)
│   └── useNetworkMonitor.js            # (80 lines)
└── utils/
    └── dashboardHelpers.js             # (100 lines - formatters, helpers)
```

## Code Reduction

**Before:**
- 5 dashboards × 2,500 lines = 12,500 lines
- Each new dashboard = 2,500 lines of copy-paste

**After:**
- BaseDashboard.jsx = 1,800 lines (write once)
- 5 shared components = 950 lines (write once)
- 6 custom hooks = 540 lines (write once)
- 5 dashboard configs = 150 lines each = 750 lines

**Total:** 4,040 lines (68% reduction)

**Each new dashboard:** 150 lines (94% reduction per dashboard)

## Benefits

### For Development
1. **Faster Development** - New dashboard in 30 minutes vs 8 hours
2. **Consistent UX** - All dashboards behave identically
3. **Single Source of Truth** - Fix bug once, fixed everywhere
4. **Type Safety** - Centralized prop validation
5. **Easier Testing** - Test base component once

### For Maintenance
1. **Bug Fixes** - Fix once in BaseDashboard, all dashboards fixed
2. **Feature Additions** - Add to BaseDashboard, all dashboards get it
3. **Performance** - Optimize once, benefits everywhere
4. **Refactoring** - Easy to change patterns

### For New Features
Creating a new dashboard (e.g., Realtors, Open Houses, Lead Sources):

1. Create API service (10 minutes)
2. Create database table + migration (15 minutes)
3. Create dashboard config (15 minutes)
4. Create "New Item" modal (30 minutes)
5. Test (10 minutes)

**Total:** ~80 minutes per new dashboard

## Implementation Plan

### Phase 1: Extract Shared Logic (Day 1-2)
1. ✅ Create `BaseDashboard.jsx` with all shared state and logic
2. ✅ Create custom hooks (useWebSocket, useKeyboardShortcuts, etc.)
3. ✅ Create shared components (StatCard, FilterBar, etc.)
4. ✅ Test base component in isolation

### Phase 2: Refactor Existing Dashboards (Day 3-4)
1. Refactor EscrowsDashboard to use BaseDashboard
2. Test thoroughly - ensure zero functionality loss
3. Refactor remaining dashboards (Listings, Clients, Appointments, Leads)
4. Verify all features work (WebSocket, keyboard shortcuts, batch ops, etc.)

### Phase 3: New Dashboards (Day 5+)
1. Create Realtors dashboard (test architecture)
2. Create Open Houses dashboard
3. Create remaining Data menu dashboards
4. Create People menu dashboards

### Phase 4: Documentation (Ongoing)
1. API documentation for BaseDashboard props
2. Guide for creating new dashboards
3. Examples for common patterns

## BaseDashboard Props API

```typescript
interface BaseDashboardProps {
  // Identity
  entityName: string;                    // "Escrow"
  entityNamePlural: string;              // "Escrows"
  apiEndpoint: string;                   // "/escrows"
  api: APIService;                       // escrowsAPI

  // Theme
  primaryColor: string;                  // "#1976d2"
  secondaryColor: string;                // "#42a5f5"

  // Stats Configuration
  stats: StatConfig[];

  // Tabs Configuration
  tabs: TabConfig[];

  // Sort Configuration
  sortOptions: SortConfig[];

  // Card Display
  cardFields: CardFieldConfig[];

  // Date Field
  dateField: string;                     // "closing_date"

  // Calendar
  calendarEvents?: (items) => Event[];

  // Modal
  CreateModal: React.Component;

  // WebSocket
  websocketEndpoint: string;

  // Optional Overrides
  shortcuts?: Record<string, () => void>;
  customFilters?: FilterConfig[];
  customActions?: ActionConfig[];
}
```

## Example: Creating New "Realtors" Dashboard

```javascript
// RealtorsDashboard.jsx (120 lines)
import BaseDashboard from '../base/BaseDashboard';
import NewRealtorModal from '../forms/NewRealtorModal';
import { realtorsAPI } from '../../services/api.service';
import { People, Star, AttachMoney, TrendingUp } from '@mui/icons-material';

const RealtorsDashboard = () => {
  return (
    <BaseDashboard
      entityName="Realtor"
      entityNamePlural="Realtors"
      apiEndpoint="/realtors"
      api={realtorsAPI}

      primaryColor="#9333EA"
      secondaryColor="#A855F7"

      stats={[
        {
          key: 'total',
          label: 'Total Realtors',
          icon: <People />,
          getValue: (items) => items.length,
        },
        {
          key: 'active',
          label: 'Active Realtors',
          icon: <Star />,
          getValue: (items) => items.filter(i => i.status === 'active').length,
        },
        {
          key: 'totalDeals',
          label: 'Total Deals',
          icon: <AttachMoney />,
          getValue: (items) => items.reduce((sum, i) => sum + i.deals_count, 0),
        },
        {
          key: 'avgRating',
          label: 'Avg Rating',
          icon: <TrendingUp />,
          getValue: (items) => {
            const avg = items.reduce((sum, i) => sum + (i.rating || 0), 0) / items.length;
            return avg.toFixed(1);
          },
        },
      ]}

      tabs={[
        { key: 'all', label: 'All Realtors', filter: () => true },
        { key: 'active', label: 'Active', filter: (item) => item.status === 'active' },
        { key: 'preferred', label: 'Preferred', filter: (item) => item.preferred },
      ]}

      sortOptions={[
        { key: 'name', label: 'Name', sort: (a, b) => a.name.localeCompare(b.name) },
        { key: 'deals', label: 'Deals', sort: (a, b) => b.deals_count - a.deals_count },
        { key: 'rating', label: 'Rating', sort: (a, b) => b.rating - a.rating },
      ]}

      cardFields={[
        { key: 'name', label: 'Name', icon: <People />, primary: true },
        { key: 'brokerage', label: 'Brokerage', icon: <Business /> },
        { key: 'deals_count', label: 'Deals', icon: <AttachMoney /> },
        { key: 'rating', label: 'Rating', icon: <Star />, format: 'rating' },
        { key: 'status', label: 'Status', chip: true },
      ]}

      dateField="created_at"

      CreateModal={NewRealtorModal}
      websocketEndpoint="realtors"
    />
  );
};

export default RealtorsDashboard;
```

That's it! **120 lines** for a full-featured dashboard with all the functionality of Escrows.

## Testing Strategy

1. **Base Component Tests** - Test BaseDashboard in isolation with mock data
2. **Hook Tests** - Unit test each custom hook
3. **Integration Tests** - Test full dashboard configs
4. **Visual Regression** - Ensure UI matches current dashboards
5. **Performance Tests** - Ensure no performance degradation

## Migration Checklist

- [ ] Create BaseDashboard.jsx
- [ ] Create custom hooks (6 hooks)
- [ ] Create shared components (5 components)
- [ ] Refactor EscrowsDashboard
- [ ] Test EscrowsDashboard thoroughly
- [ ] Refactor ListingsDashboard
- [ ] Refactor ClientsDashboard
- [ ] Refactor AppointmentsDashboard
- [ ] Refactor LeadsDashboard
- [ ] Create Realtors dashboard (test new architecture)
- [ ] Create remaining dashboards
- [ ] Document API
- [ ] Create usage guide

## Success Metrics

- ✅ Each dashboard <200 lines
- ✅ Zero functionality loss
- ✅ Same performance or better
- ✅ New dashboard in <2 hours
- ✅ All tests passing
- ✅ Code review approved
