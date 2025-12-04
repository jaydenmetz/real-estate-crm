# Clients Dashboard

**Complete Implementation Reference**

Jillow Real Estate CRM · Version 2.3 · December 2024

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Entry Point Pattern](#2-entry-point-pattern)
3. [Config Structure](#3-config-structure)
4. [Navigation Configuration](#4-navigation-configuration)
5. [Hero Carousel](#5-hero-carousel)
6. [AI Manager Integration](#6-ai-manager-integration)
7. [View Modes](#7-view-modes)
8. [Inline Editors](#8-inline-editors)
9. [Complete Barrel Exports](#9-complete-barrel-exports)
10. [Dependencies](#10-dependencies)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Folder Structure

Standard dashboard folder structure for the clients entity.

### 1.1 Complete File Tree (29 Files)

```
frontend/src/components/dashboards/clients/
├── index.jsx                           # Dashboard entry point
│
├── hero/
│   ├── index.js                        # Barrel: exports stats + carousel + modal + teaser
│   ├── ClientsHeroCarousel.jsx         # Carousel (2-page with animations)
│   ├── AIManagerModal.jsx              # Full AI upsell modal
│   ├── stats/
│   │   ├── index.js                    # Barrel: 4 stat cards
│   │   ├── TotalClientsCard.jsx
│   │   ├── ActiveClientsCard.jsx
│   │   ├── NewThisMonthCard.jsx
│   │   └── ClientValueCard.jsx
│   └── pages/
│       ├── AIManagerPage/
│       │   ├── index.jsx               # Page 2 of carousel
│       │   └── AIManagerStatCard.jsx   # Stat cards for AI page
│       └── HomePage/
│           └── AIManagerTeaser.jsx     # 300x300 clickable widget
│
├── navigation/
│   ├── index.js                        # Barrel: all nav configs
│   ├── tabs/
│   │   └── ClientStatusTabs.jsx        # Uses centralized status config
│   └── filters/
│       ├── ClientViewModes.jsx
│       ├── ClientScopeFilter.jsx
│       └── ClientSortOptions.jsx
│
├── view-modes/
│   ├── index.js
│   ├── card/ClientCard.jsx
│   ├── list/ClientListItem.jsx
│   └── table/ClientTableRow.jsx
│
├── modals/
│   ├── index.js
│   └── NewClientModal.jsx
│
└── editors/
    ├── index.js
    ├── EditClientName.jsx
    ├── EditClientEmail.jsx
    ├── EditClientPhone.jsx
    ├── EditClientStatus.jsx
    └── EditClientBudget.jsx
```

---

## 2. Entry Point Pattern

The dashboard entry point wraps the DashboardTemplate with context providers.

### 2.1 index.jsx Structure

```jsx
// frontend/src/components/dashboards/clients/index.jsx
import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { clientsConfig } from '../../../config/entities/clients.config';
import { ClientCard, ClientListItem, ClientTableRow } from './view-modes';
import { NewClientModal } from './modals';
import { StatusProvider } from '../../../contexts/StatusContext';
import { ClientsHeroCarousel } from './hero';

const ClientsDashboard = () => {
  return (
    <StatusProvider entityType="clients">
      <DashboardTemplate
        config={clientsConfig}
        CardComponent={ClientCard}
        ListComponent={ClientListItem}
        TableComponent={ClientTableRow}
        NewItemModal={NewClientModal}
        HeroComponent={ClientsHeroCarousel}
      />
    </StatusProvider>
  );
};

export default ClientsDashboard;
```

### 2.2 Context Providers

| Provider | Purpose |
|----------|---------|
| StatusProvider | Provides database-driven status options. **Required** for all dashboards. |

> **Note:** Unlike escrows, clients does NOT require PrivacyProvider (no sensitive commission data).

---

## 3. Config Structure

The `clients.config.js` file defines all entity-specific settings.

### 3.1 Config Wrapper

```js
import { createEntityConfig } from '../../utils/config/createEntityConfig';

export const clientsConfig = createEntityConfig({
  // ... config object
});
```

### 3.2 Entity Identity

```js
entity: {
  name: 'client',
  namePlural: 'clients',
  label: 'Client',
  labelPlural: 'Clients',
  icon: 'People',
  color: '#0891B2',
  colorGradient: {
    start: '#0891B2',
    end: '#06B6D4'
  }
}
```

### 3.3 API Configuration

```js
api: {
  baseEndpoint: '/clients',
  getAll: (params) => clientsAPI.getAll(params),
  getById: (id) => clientsAPI.getById(id),
  create: (data) => clientsAPI.create(data),
  update: (id, data) => clientsAPI.update(id, data),
  delete: (id) => clientsAPI.delete(id),
  archive: (id) => clientsAPI.archive(id),
  restore: (id) => clientsAPI.restore(id),
  endpoints: {
    list: '/clients',
    get: '/clients/:id',
    create: '/clients',
    update: '/clients/:id',
    delete: '/clients/:id',
    archive: '/clients/:id/archive',
    restore: '/clients/:id/restore',
    stats: '/clients/stats',
  },
  idField: 'id',
}
```

### 3.4 Status Categories (4 Tabs)

> **Important:** Status categories are defined in `config/statuses/statusCategories.js`

| Key | Label | Statuses Array | Default View |
|-----|-------|----------------|--------------|
| Active | Active | `['active', 'lead']` | Card |
| Past | Past | `['past_client']` | List |
| Inactive | Inactive | `['inactive']` | List |
| All | All Clients | `['active', 'lead', 'past_client', 'inactive']` | Card |

### 3.5 Component-Based Stats

Stats use `visibleWhen` arrays with **capitalized** tab names matching category IDs:

```js
stats: [
  {
    id: 'total_active_clients',
    component: TotalClientsCard,
    props: { status: 'active' },
    visibleWhen: ['Active']
  },
  {
    id: 'active_clients_count',
    component: ActiveClientsCard,
    props: {},
    visibleWhen: ['Active']
  },
  {
    id: 'new_this_month_active',
    component: NewThisMonthCard,
    props: {},
    visibleWhen: ['Active']
  },
  {
    id: 'total_client_value_active',
    component: ClientValueCard,
    props: {},
    visibleWhen: ['Active']
  },
  // Repeat pattern for Past, Inactive, All tabs (4 stats × 4 tabs = 16 total)
]
```

### 3.6 Navigation Imports

```js
import {
  clientStatusTabs,
  clientSortOptions,
  clientDefaultSort,
  getClientScopeOptions,
  clientDefaultScope,
  clientViewModes,
  clientDefaultViewMode
} from '../../components/dashboards/clients/navigation';
```

### 3.7 Field Definitions

```js
fields: {
  primary: 'name',  // Computed: first_name + last_name
  status: 'client_status',
  date: 'created_at',
}
```

### 3.8 Dashboard Hero Configuration

```js
dashboard: {
  hero: {
    dateRangeFilters: ['1D', '1M', '1Y', 'YTD', 'Custom'],
    defaultDateRange: '1M',
    showAIManager: true,
    aiManagerLabel: 'AI Client Manager',
    aiManagerDescription: 'Hire an AI assistant to manage client relationships...',
    showAnalyticsButton: true,
    analyticsButtonLabel: 'CLIENT ANALYTICS',
    showAddButton: true,
    addButtonLabel: 'ADD NEW CLIENT'
  }
}
```

---

## 4. Navigation Configuration

### 4.1 Folder Structure

```
navigation/
├── index.js                    # Barrel exports
├── tabs/
│   └── ClientStatusTabs.jsx    # Uses centralized status config
└── filters/
    ├── ClientViewModes.jsx
    ├── ClientScopeFilter.jsx
    └── ClientSortOptions.jsx
```

### 4.2 Status Tabs (Centralized)

Status tabs use the centralized configuration system:

```jsx
// tabs/ClientStatusTabs.jsx
import { getEntityTabs } from '../../../../../config/statuses';

// Generate tabs from centralized status configuration
export const clientStatusTabs = getEntityTabs('clients');

export default clientStatusTabs;
```

The centralized config (`config/statuses/statusCategories.js`) defines:

```js
export const CLIENT_CATEGORIES = {
  ACTIVE: {
    id: 'Active',
    label: 'Active',
    displayName: 'Active Clients',
    statuses: ['active', 'lead'],
    description: 'Active clients and leads',
    preferredViewMode: 'card',
    sortOrder: 1,
  },
  PAST: {
    id: 'Past',
    label: 'Past',
    displayName: 'Past Clients',
    statuses: ['past_client'],
    description: 'Past clients',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  INACTIVE: {
    id: 'Inactive',
    label: 'Inactive',
    displayName: 'Inactive Clients',
    statuses: ['inactive'],
    description: 'Inactive clients',
    preferredViewMode: 'list',
    sortOrder: 3,
  },
  ALL: {
    id: 'All',
    label: 'All Clients',
    displayName: 'All Clients',
    statuses: ['active', 'lead', 'past_client', 'inactive'],
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};
```

### 4.3 Scope Filter

```jsx
// filters/ClientScopeFilter.jsx
export const getClientScopeOptions = (user) => {
  const options = [];
  const firstName = user?.firstName || user?.first_name || 'My';
  const teamName = user?.teamName || user?.team_name || 'Team';
  const brokerName = user?.brokerName || user?.broker_name || 'Broker';
  const userRole = user?.role || 'agent';

  // All users can see their own records
  options.push({
    value: 'user',
    label: `${firstName}'s Clients`,
  });

  // Team owners and above can see team view
  if (['team_owner', 'broker', 'system_admin'].includes(userRole)) {
    options.push({
      value: 'team',
      label: `${teamName}'s Clients`,
    });
  }

  // Brokers and system admins can see broker view
  if (['broker', 'system_admin'].includes(userRole)) {
    options.push({
      value: 'broker',
      label: `${brokerName}'s Clients`,
    });
  }

  return options;
};

export const clientDefaultScope = 'user';
```

### 4.4 Sort Options

```jsx
// filters/ClientSortOptions.jsx
export const clientSortOptions = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'last_contact', label: 'Last Contact' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'budget', label: 'Budget' },
  { value: 'priority', label: 'Priority' },
  { value: 'client_status', label: 'Status' }
];

export const clientDefaultSort = 'created_at';
```

### 4.5 View Modes

```jsx
// filters/ClientViewModes.jsx
export const clientViewModes = [
  { value: 'grid', label: 'Grid View', icon: 'GridView' },
  { value: 'list', label: 'List View', icon: 'ViewList' },
  { value: 'table', label: 'Table View', icon: 'TableRows' }
];

export const clientDefaultViewMode = 'grid';
```

---

## 5. Hero Carousel

The HeroCarousel is a **2-page carousel** that wraps the entire hero section with navigation and animations.

### 5.1 Carousel Architecture

```
ClientsHeroCarousel
├── Page 1: DashboardHero (standard hero with stats + AI widget)
│   └── AI Manager Teaser (from config, made clickable)
├── Page 2: AIManagerPage (full AI dashboard)
└── AIManagerModal (fullscreen upsell, triggered by clicks)
```

### 5.2 Full Component Implementation

```jsx
// hero/ClientsHeroCarousel.jsx
import React, { useState, useCallback } from 'react';
import { Box, IconButton } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardHero } from '../../../../templates/Dashboard/components/DashboardHero';
import AIManagerModal from './AIManagerModal';
import AIManagerPage from './pages/AIManagerPage';

const ClientsHeroCarousel = ({
  // All props passed through from DashboardTemplate
  config,
  stats,
  statsConfig,
  selectedStatus,
  onNewItem,
  dateRangeFilter,
  setDateRangeFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  dateRange,
  detectPresetRange,
  selectedYear,
  setSelectedYear,
  StatCardComponent,
  allData,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const totalPages = 2;

  // Navigation handlers
  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const goToPage = useCallback((index) => {
    setDirection(index > currentPage ? 1 : -1);
    setCurrentPage(index);
  }, [currentPage]);

  // Animation variants for page transitions
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  });

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Wrap AI widget to make it clickable
  const configWithClickableWidget = {
    ...config,
    aiAssistantWidget: () => {
      const OriginalWidget = config.aiAssistantWidget;
      if (!OriginalWidget) return null;

      return (
        <Box onClick={() => setModalOpen(true)} sx={{ cursor: 'pointer' }}>
          <OriginalWidget />
        </Box>
      );
    },
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Navigation Arrows (desktop only) */}
      {totalPages > 1 && (
        <>
          <IconButton
            onClick={goToPrevious}
            disabled={currentPage === 0}
            sx={{
              position: 'absolute',
              left: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: { xs: 'none', lg: 'flex' },
              // ... styling
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            onClick={goToNext}
            disabled={currentPage === totalPages - 1}
            sx={{
              position: 'absolute',
              right: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: { xs: 'none', lg: 'flex' },
              // ... styling
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}

      {/* Hero Pages with Animation */}
      <Box {...swipeHandlers} sx={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          {currentPage === 0 && (
            <motion.div
              key="page-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <DashboardHero
                config={configWithClickableWidget}
                stats={stats}
                statsConfig={statsConfig}
                selectedStatus={selectedStatus}
                onNewItem={onNewItem}
                dateRangeFilter={dateRangeFilter}
                setDateRangeFilter={setDateRangeFilter}
                customStartDate={customStartDate}
                setCustomStartDate={setCustomStartDate}
                customEndDate={customEndDate}
                setCustomEndDate={setCustomEndDate}
                dateRange={dateRange}
                detectPresetRange={detectPresetRange}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                StatCardComponent={StatCardComponent}
                allData={allData}
              />
            </motion.div>
          )}

          {currentPage === 1 && (
            <motion.div
              key="page-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <AIManagerPage
                isVisible={currentPage === 1}
                onConfigureAI={() => setModalOpen(true)}
                onViewActivity={() => {/* TODO */}}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Dots */}
        {totalPages > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 50,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1.5,
              zIndex: 10,
            }}
          >
            {Array.from({ length: totalPages }).map((_, index) => (
              <Box
                key={index}
                onClick={() => goToPage(index)}
                sx={{
                  width: currentPage === index ? 32 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentPage === index
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* AI Manager Modal */}
      <AIManagerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </Box>
  );
};

export default ClientsHeroCarousel;
```

### 5.3 Props Reference

The HeroCarousel receives all props from DashboardTemplate that would normally go to DashboardHero:

| Prop | Type | Purpose |
|------|------|---------|
| config | object | Entity configuration |
| stats | object | Calculated statistics |
| statsConfig | array | Stat card configurations |
| selectedStatus | string | Current status tab |
| onNewItem | function | Handler for "New" button |
| dateRangeFilter | string | Current date filter |
| setDateRangeFilter | function | Date filter setter |
| customStartDate | Date | Custom range start |
| setCustomStartDate | function | Start date setter |
| customEndDate | Date | Custom range end |
| setCustomEndDate | function | End date setter |
| dateRange | object | Computed date range |
| detectPresetRange | function | Preset range detector |
| selectedYear | number | Selected year |
| setSelectedYear | function | Year setter |
| StatCardComponent | component | Stat card renderer |
| allData | array | All client data |

### 5.4 Carousel Features

| Feature | Implementation |
|---------|----------------|
| **Page Navigation** | Arrow buttons (desktop), dots (all) |
| **Swipe Support** | `react-swipeable` for mobile/touch |
| **Keyboard Nav** | ArrowLeft/ArrowRight keys |
| **Animations** | Framer Motion slide transitions |
| **Lazy Loading** | Page 2 only fetches data when visible |

### 5.5 Stat Card Summary

| Component | Calculation | Special Features |
|-----------|-------------|------------------|
| TotalClientsCard | Count by status filter | — |
| ActiveClientsCard | Count of active status | — |
| NewThisMonthCard | Count by `created_at` in month | Date-aware |
| ClientValueCard | Sum of budget/value | Currency formatting |

---

## 6. AI Manager Integration

### 6.1 Component Overview

| Component | Location | Purpose |
|-----------|----------|---------|
| **AIManagerModal** | `hero/AIManagerModal.jsx` | Fullscreen upsell/waitlist modal |
| **AIManagerPage** | `hero/pages/AIManagerPage/index.jsx` | Page 2 of carousel - full AI dashboard |
| **AIManagerStatCard** | `hero/pages/AIManagerPage/AIManagerStatCard.jsx` | Stat cards used in AIManagerPage |

### 6.2 AIManagerPage (Carousel Page 2)

Full AI dashboard with client-specific stats:
- 4 stat cards (AI-managed, Follow-up due, Birthdays, Engagement)
- Date filter buttons (1 Day, 1 Month, 1 Year, YTD)
- Quick info chips (follow-ups, emails, calls, nurture sequences)
- AI status bar
- Configure AI / View Activity buttons
- **Lazy loading via React Query**

```jsx
// hero/pages/AIManagerPage/index.jsx
import { useQuery } from '@tanstack/react-query';
import apiInstance from '../../../../../../services/api.service';

const AIManagerPage = ({ isVisible = true, onConfigureAI, onViewActivity }) => {
  const [dateFilter, setDateFilter] = useState('1_month');

  // Lazy load - only fetch when page is visible
  const { data, isLoading } = useQuery({
    queryKey: ['clients', 'manager', dateFilter],
    queryFn: async () => {
      const response = await apiInstance.get(`/clients/manager?period=${dateFilter}`);
      return response.data;
    },
    enabled: isVisible,  // KEY: Only fetches when carousel page is active
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const stats = data?.data?.stats || {
    managed_count: 0,
    follow_up_due: 0,
    birthdays_this_month: 0,
    engagement_rate: 100,
  };

  const quickItemsData = data?.data?.quick_items || {
    follow_ups_today: 0,
    pending_emails: 0,
    calls_scheduled: 0,
    nurture_sequences_active: 0,
  };

  // ... render stats, quick items, action buttons
};
```

### 6.3 Client-Specific AI Stats

| Stat | Label | Icon | Purpose |
|------|-------|------|---------|
| managed_count | AI-MANAGED | 👥 | Total clients being monitored |
| follow_up_due | FOLLOW-UP DUE | 📞 | Clients needing contact this week |
| birthdays_this_month | BIRTHDAYS | 🎂 | Upcoming birthdays |
| engagement_rate | ENGAGEMENT | 📈 | Active engagement percentage |

### 6.4 Quick Items

| Item | Icon | Type |
|------|------|------|
| follow_ups_today | 📞 | urgent |
| pending_emails | ✉️ | pending |
| calls_scheduled | 📅 | info |
| nurture_sequences_active | 🔄 | success |

### 6.5 Color Theme

Clients AI Manager uses a **purple gradient** (vs blue for escrows):

```js
background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)'
```

---

## 7. View Modes

### 7.1 Card View Template

```jsx
// view-modes/card/ClientCard.jsx
import { CardTemplate } from '../../../../templates/Card/CardTemplate';
import {
  EditClientName,
  EditClientEmail,
  EditClientPhone,
  EditClientStatus,
  EditClientBudget
} from '../../editors';

export const ClientCard = ({ item, onUpdate, onDelete }) => {
  const cardConfig = {
    title: `${item.first_name} ${item.last_name}`,
    subtitle: item.email,
    status: item.client_status,
    image: item.profile_image_url || '/placeholder-client.jpg',
    metrics: [
      {
        label: 'Phone',
        value: item.phone,
        formatter: 'phone',
        editor: EditClientPhone
      },
      {
        label: 'Budget',
        value: item.budget,
        formatter: 'currency',
        editor: EditClientBudget
      },
      {
        label: 'Last Contact',
        value: item.last_contact,
        formatter: 'date'
      },
      {
        label: 'Status',
        value: item.client_status,
        editor: EditClientStatus
      }
    ],
    actions: ['view', 'edit', 'delete']
  };

  return (
    <CardTemplate
      config={cardConfig}
      item={item}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );
};

export default ClientCard;
```

### 7.2 View Mode Summary

| Mode | Best For | Key Features |
|------|----------|--------------|
| Card (Grid) | Visual browsing, profile images | Image, status chip, metrics grid |
| List | Quick scanning, contact info | Compact layout, inline actions |
| Table | Data comparison, bulk operations | Checkbox selection, sortable columns |

---

## 8. Inline Editors

### 8.1 Editor Components (5 Total)

| Editor | Field Type | Features |
|--------|------------|----------|
| EditClientName | Text | First/last name fields |
| EditClientEmail | Email | Email validation |
| EditClientPhone | Phone | Phone formatting |
| EditClientStatus | Select | Status dropdown |
| EditClientBudget | Currency | Formatted currency input |

### 8.2 Barrel Export

```js
// editors/index.js
export { EditClientName } from './EditClientName';
export { EditClientEmail } from './EditClientEmail';
export { EditClientPhone } from './EditClientPhone';
export { EditClientStatus } from './EditClientStatus';
export { EditClientBudget } from './EditClientBudget';
```

---

## 9. Complete Barrel Exports

### 9.1 hero/index.js

```js
export { default as ClientsHeroCarousel } from './ClientsHeroCarousel';
export { default as AIManagerModal } from './AIManagerModal';
export { default as AIManagerPage } from './pages/AIManagerPage';
export { default as AIManagerTeaser } from './pages/HomePage/AIManagerTeaser';
export * from './stats';
```

### 9.2 hero/stats/index.js

```js
export { default as TotalClientsCard } from './TotalClientsCard';
export { default as ActiveClientsCard } from './ActiveClientsCard';
export { default as NewThisMonthCard } from './NewThisMonthCard';
export { default as ClientValueCard } from './ClientValueCard';
```

### 9.3 navigation/index.js

```js
export * from './filters/ClientScopeFilter';
export * from './filters/ClientSortOptions';
export * from './filters/ClientViewModes';
export * from './tabs/ClientStatusTabs';
```

### 9.4 view-modes/index.js

```js
export { default as ClientCard } from './card/ClientCard';
export { default as ClientListItem } from './list/ClientListItem';
export { default as ClientTableRow } from './table/ClientTableRow';
```

### 9.5 editors/index.js

```js
export { EditClientName } from './EditClientName';
export { EditClientEmail } from './EditClientEmail';
export { EditClientPhone } from './EditClientPhone';
export { EditClientStatus } from './EditClientStatus';
export { EditClientBudget } from './EditClientBudget';
```

### 9.6 modals/index.js

```js
export { default as NewClientModal } from './NewClientModal';
```

---

## 10. Dependencies

### 10.1 Required Packages

| Package | Purpose | Used In |
|---------|---------|---------|
| `react-swipeable` | Touch/swipe gesture support | ClientsHeroCarousel |
| `framer-motion` | Page transition animations | ClientsHeroCarousel |
| `@tanstack/react-query` | Data fetching with caching | AIManagerPage |
| `@mui/material` | UI components | All components |
| `@mui/icons-material` | Icons | All components |

### 10.2 Internal Dependencies

| Module | Purpose |
|--------|---------|
| `templates/Dashboard/components/DashboardHero` | Standard hero layout |
| `templates/Card/CardTemplate` | Card view template |
| `contexts/StatusContext` | Database-driven statuses |
| `services/api.service` | API client |
| `config/statuses/statusCategories` | Centralized status config |

---

## 11. Implementation Checklist

### 11.1 Setup Steps

1. Create folder structure under `components/dashboards/clients/`
2. Create `clients.config.js` with `createEntityConfig()` wrapper
3. Add status categories to `config/statuses/statusCategories.js`
4. Create status tabs using `getEntityTabs('clients')`
5. Create filter configs (sort, scope, view modes) in `navigation/filters/`
6. Build 4 stat card components in `hero/stats/`
7. Create AIManagerPage with React Query in `hero/pages/AIManagerPage/`
8. Create AIManagerModal in `hero/`
9. Create HeroCarousel with:
    - 2-page carousel logic
    - Framer Motion animations
    - Swipe support
    - Keyboard navigation
    - Clickable widget wrapper
10. Build view mode components (Card, List, Table)
11. Create 5 inline editor components
12. Build `NewClientModal`
13. Wire up `index.jsx` with StatusProvider and DashboardTemplate
14. Add route in `App.jsx`
15. Create all barrel exports

### 11.2 Time Estimates

| Task | Time |
|------|------|
| Folder structure + config | 30 minutes |
| Status categories (centralized) | 15 minutes |
| Navigation (tabs + filters) | 30 minutes |
| Stat cards (4 components) | 1 hour |
| AIManagerPage + StatCard | 1.5 hours |
| AIManagerModal | 1 hour |
| HeroCarousel (full implementation) | 2 hours |
| View modes (3 components) | 2 hours |
| Editors (5 components) | 1.5 hours |
| NewClientModal | 1 hour |
| Wiring + barrel exports | 30 minutes |
| Testing & polish | 1 hour |
| **TOTAL** | **~12.75 hours** |

---

## Key Differences from Escrows Dashboard

| Feature | Clients | Escrows |
|---------|---------|---------|
| PrivacyProvider | ❌ Not needed | ✅ Required |
| AI Manager Stats | Follow-ups, birthdays, engagement | Deadlines, docs, compliance |
| Hero Carousel | ✅ 2-page with animations | ✅ 2-page with animations |
| Status Field | `client_status` | `escrow_status` |
| Primary Field | `name` (computed) | `property_address` |
| Color Theme | Purple (#0891B2 / #7c3aed) | Blue (#1976d2 / #4a90d9) |
| Editors | 5 (name, email, phone, status, budget) | 6 (address, price, dates, commission, clients) |
| View Modes | grid, list, table | card, list, table |
