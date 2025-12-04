# Escrows Dashboard

**Complete Implementation Reference**

Jillow Real Estate CRM · Version 2.1 · December 2024

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

Standard dashboard folder structure for the escrows entity.

### 1.1 Complete File Tree (32 Files)

```
frontend/src/components/dashboards/escrows/
├── index.jsx                           # Dashboard entry point
│
├── hero/
│   ├── index.js                        # Barrel: exports stat cards ONLY
│   ├── EscrowsHeroCarousel.jsx         # Carousel (direct import, not barrel)
│   ├── AIManagerModal.jsx              # Full AI analysis modal
│   ├── stats/
│   │   ├── index.js                    # Barrel: 4 stat cards
│   │   ├── TotalEscrowsCard.jsx
│   │   ├── TotalThisMonthCard.jsx
│   │   ├── TotalVolumeCard.jsx
│   │   └── TotalCommissionCard.jsx     # MASTER PRIVACY TOGGLE
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
│   │   └── EscrowStatusTabs.jsx        # Uses centralized status config
│   └── filters/
│       ├── EscrowViewModes.jsx
│       ├── EscrowScopeFilter.jsx
│       └── EscrowSortOptions.jsx
│
├── view-modes/
│   ├── index.js
│   ├── card/EscrowCard.jsx
│   ├── list/EscrowListItem.jsx
│   └── table/EscrowTableRow.jsx
│
├── modals/
│   ├── index.js
│   └── NewEscrowModal.jsx
│
└── editors/
    ├── index.js
    ├── EditPropertyAddress.jsx
    ├── EditPurchasePrice.jsx
    ├── EditClosingDate.jsx
    ├── EditAcceptanceDate.jsx
    ├── EditCommissionAmount.jsx
    └── EditClients.jsx
```

---

## 2. Entry Point Pattern

The dashboard entry point wraps the DashboardTemplate with context providers.

### 2.1 index.jsx Structure

```jsx
// frontend/src/components/dashboards/escrows/index.jsx
import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { escrowsConfig } from '../../../config/entities/escrows.config';
import { EscrowCard, EscrowListItem, EscrowTableRow } from './view-modes';
import { NewEscrowModal } from './modals/NewEscrowModal';
import { PrivacyProvider } from '../../../contexts/PrivacyContext';
import { StatusProvider } from '../../../contexts/StatusContext';
import EscrowsHeroCarousel from './hero/EscrowsHeroCarousel';  // DIRECT IMPORT

const EscrowsDashboard = () => {
  return (
    <StatusProvider entityType="escrows">
      <PrivacyProvider entityType="escrows">
        <DashboardTemplate
          config={escrowsConfig}
          CardComponent={EscrowCard}
          ListComponent={EscrowListItem}
          TableComponent={EscrowTableRow}
          NewItemModal={NewEscrowModal}
          HeroComponent={EscrowsHeroCarousel}
        />
      </PrivacyProvider>
    </StatusProvider>
  );
};

export default EscrowsDashboard;
```

### 2.2 Context Providers

| Provider | Purpose |
|----------|---------|
| StatusProvider | Provides database-driven status options. **Required** for all dashboards. |
| PrivacyProvider | Manages visibility for sensitive fields. **Required** for escrows (has commission data). |

---

## 3. Config Structure

The `escrows.config.js` file defines all entity-specific settings.

### 3.1 Config Wrapper

```js
import { createEntityConfig } from '../../utils/config/createEntityConfig';

export const escrowsConfig = createEntityConfig({
  // ... config object
});
```

### 3.2 Entity Identity

```js
entity: {
  name: 'escrow',
  namePlural: 'escrows',
  label: 'Escrow',
  labelPlural: 'Escrows',
  icon: 'Home',
  color: '#1976d2',
  colorGradient: {
    start: '#1976d2',
    end: '#42a5f5'
  }
}
```

### 3.3 API Configuration

```js
api: {
  baseEndpoint: '/escrows',
  getAll: (params) => escrowsAPI.getAll(params),
  getById: (id) => escrowsAPI.getById(id),
  create: (data) => escrowsAPI.create(data),
  update: (id, data) => escrowsAPI.update(id, data),
  delete: (id) => escrowsAPI.delete(id),
  endpoints: {
    list: '/escrows',
    get: '/escrows/:id',
    create: '/escrows',
    update: '/escrows/:id',
    delete: '/escrows/:id',
    people: '/escrows/:id/people',
    financials: '/escrows/:id/financials',
    timeline: '/escrows/:id/timeline',
    checklists: '/escrows/:id/checklists',
    manager: '/escrows/manager'  // AI Manager endpoint
  }
}
```

### 3.4 Status Categories (4 Tabs)

> **Important:** Status categories are defined in `config/statuses/statusCategories.js`

| Key | Label | Statuses Array | Default View |
|-----|-------|----------------|--------------|
| Active | Active | `['Active']` | Card |
| Closed | Closed | `['Closed']` | List |
| Cancelled | Cancelled | `['Cancelled']` | List |
| All | All Escrows | `['Active', 'Closed', 'Cancelled']` | Card |

### 3.5 Component-Based Stats

Stats use `visibleWhen` arrays with **capitalized** tab names matching category IDs:

```js
stats: [
  {
    id: 'total_active_escrows',
    component: TotalEscrowsCard,
    props: { status: 'active' },
    visibleWhen: ['Active']
  },
  {
    id: 'total_active_this_month',
    component: TotalThisMonthCard,
    props: { status: 'active', dateField: 'created_at' },
    visibleWhen: ['Active']
  },
  {
    id: 'total_active_volume',
    component: TotalVolumeCard,
    props: { status: 'active' },
    visibleWhen: ['Active']
  },
  {
    id: 'total_active_commission',
    component: TotalCommissionCard,
    props: { status: 'active' },
    visibleWhen: ['Active']
  },
  // Repeat pattern for Closed, Cancelled, All tabs (4 stats × 4 tabs = 16 total)
]
```

### 3.6 Navigation Imports

```js
import {
  escrowStatusTabs,
  escrowSortOptions,
  escrowDefaultSort,
  getEscrowScopeOptions,
  escrowDefaultScope,
  escrowViewModes,
  escrowDefaultViewMode
} from '../../components/dashboards/escrows/navigation';
```

### 3.7 Field Definitions

```js
fields: {
  primary: 'property_address',
  secondary: 'escrow_number',
  status: 'escrow_status',
  date: 'closing_date',
  amount: 'purchase_price'
}
```

### 3.8 AI Manager Widget Configuration

```js
dashboard: {
  hero: {
    showAIAssistant: true,
    aiAssistantWidget: AIManagerTeaser,  // Component reference
    aiAssistantLabel: 'AI Escrow Manager',
    aiAssistantDescription: 'Hire an AI assistant to manage escrows...'
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
│   └── EscrowStatusTabs.jsx    # Uses centralized status config
└── filters/
    ├── EscrowViewModes.jsx
    ├── EscrowScopeFilter.jsx
    └── EscrowSortOptions.jsx
```

### 4.2 Status Tabs (Centralized)

Status tabs use the centralized configuration system:

```jsx
// tabs/EscrowStatusTabs.jsx
import { getEntityTabs } from '../../../../../config/statuses';

// Generate tabs from centralized status configuration
export const escrowStatusTabs = getEntityTabs('escrows');

export default escrowStatusTabs;
```

The centralized config (`config/statuses/statusCategories.js`) defines:

```js
export const ESCROW_CATEGORIES = {
  ACTIVE: {
    id: 'Active',
    label: 'Active',
    displayName: 'Active Escrows',
    statuses: ['Active'],
    preferredViewMode: 'card',
    sortOrder: 1,
  },
  CLOSED: {
    id: 'Closed',
    label: 'Closed',
    displayName: 'Closed Escrows',
    statuses: ['Closed'],
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  CANCELLED: {
    id: 'Cancelled',
    label: 'Cancelled',
    displayName: 'Cancelled Escrows',
    statuses: ['Cancelled'],
    preferredViewMode: 'list',
    sortOrder: 3,
  },
  ALL: {
    id: 'All',
    label: 'All Escrows',
    displayName: 'All Escrows',
    statuses: ['Active', 'Closed', 'Cancelled'],
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};
```

### 4.3 Scope Filter

```jsx
// filters/EscrowScopeFilter.jsx
export const getEscrowScopeOptions = (userRole) => {
  const options = [
    { value: 'mine', label: 'My Escrows' },
    { value: 'team', label: 'Team Escrows' }
  ];

  if (['broker', 'system_admin'].includes(userRole)) {
    options.push({ value: 'brokerage', label: 'All Escrows' });
  }

  return options;
};

export const escrowDefaultScope = 'mine';
```

### 4.4 Sort Options

```jsx
// filters/EscrowSortOptions.jsx
export const escrowSortOptions = [
  { value: 'closing_date', label: 'Closing Date' },
  { value: 'purchase_price', label: 'Purchase Price' },
  { value: 'property_address', label: 'Property Address' },
  { value: 'created_at', label: 'Date Created' }
];

export const escrowDefaultSort = 'closing_date';
```

### 4.5 View Modes

```jsx
// filters/EscrowViewModes.jsx
export const escrowViewModes = [
  { value: 'card', label: 'Card', icon: 'GridView' },
  { value: 'list', label: 'List', icon: 'ViewList' },
  { value: 'table', label: 'Table', icon: 'TableChart' }
];

export const escrowDefaultViewMode = {
  'Active': 'card',
  'Closed': 'list',
  'Cancelled': 'list',
  'All': 'card'
};
```

---

## 5. Hero Carousel

The HeroCarousel is a **2-page carousel** that wraps the entire hero section with navigation and animations.

### 5.1 Carousel Architecture

```
EscrowsHeroCarousel
├── Page 1: DashboardHero (standard hero with stats + AI widget)
│   └── AIManagerTeaser (clickable, opens modal)
├── Page 2: AIManagerPage (full AI dashboard)
└── AIManagerModal (fullscreen upsell, triggered by clicks)
```

### 5.2 Full Component Implementation

```jsx
// hero/EscrowsHeroCarousel.jsx
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

const EscrowsHeroCarousel = ({
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

export default EscrowsHeroCarousel;
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
| allData | array | All escrow data |

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
| TotalEscrowsCard | Count by status | — |
| TotalThisMonthCard | Count by date field | Tab-aware (`created_at` vs `closing_date`) |
| TotalVolumeCard | Sum of `purchase_price` | Currency formatting |
| TotalCommissionCard | Sum of commission | **Master privacy toggle** |

---

## 6. AI Manager Integration

### 6.1 Component Overview

| Component | Location | Purpose |
|-----------|----------|---------|
| **AIManagerModal** | `hero/AIManagerModal.jsx` | Fullscreen upsell/waitlist modal |
| **AIManagerPage** | `hero/pages/AIManagerPage/index.jsx` | Page 2 of carousel - full AI dashboard |
| **AIManagerTeaser** | `hero/pages/HomePage/AIManagerTeaser.jsx` | 300x300 clickable widget in hero |
| **AIManagerStatCard** | `hero/pages/AIManagerPage/AIManagerStatCard.jsx` | Stat cards used in AIManagerPage |

### 6.2 AIManagerModal

Fullscreen upsell modal with:
- Feature highlights (6 AI capabilities)
- "Add Me to Waitlist" CTA button
- Gradient background design
- Close button (top-right)

```jsx
// hero/AIManagerModal.jsx
const AIManagerModal = ({ open, onClose }) => {
  const features = [
    { title: 'Smart Deadline Tracking', description: '...' },
    { title: 'Automated Document Management', description: '...' },
    { title: 'Compliance Monitoring', description: '...' },
    { title: 'Workflow Automation', description: '...' },
    { title: 'Predictive Analytics', description: '...' },
    { title: 'Team Coordination', description: '...' },
  ];

  const handleWaitlist = () => {
    // TODO: Connect to waitlist API
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      {/* Crown icon, title, features list, CTA button */}
    </Dialog>
  );
};
```

### 6.3 AIManagerPage (Carousel Page 2)

Full AI dashboard with:
- 4 stat cards (AI-managed, Due in 48h, Docs Pending, Compliance)
- Date filter buttons (1 Day, 1 Month, 1 Year, YTD)
- Quick info chips (urgent items, pending docs, follow-ups, reminders)
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
    queryKey: ['escrows', 'manager', dateFilter],
    queryFn: async () => {
      const response = await apiInstance.get(`/escrows/manager?period=${dateFilter}`);
      return response.data;
    },
    enabled: isVisible,  // KEY: Only fetches when carousel page is active
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const stats = data?.data?.stats || {
    managed_count: 0,
    due_in_48h: 0,
    docs_pending: 0,
    compliance_rate: 100,
  };

  // ... render stats, quick items, action buttons
};
```

### 6.4 AIManagerTeaser (Hero Widget)

300x300 clickable widget that:
- Shows in DashboardHero (Page 1)
- Has hover animations
- Opens AIManagerModal on click

```jsx
// hero/pages/HomePage/AIManagerTeaser.jsx
const AIManagerTeaser = ({ onClick }) => {
  return (
    <Paper
      onClick={onClick}
      sx={{
        width: 300,
        height: 300,
        cursor: 'pointer',
        // ... glass morphism styling
      }}
    >
      {/* Crown icon, title, subtitle, "Click to learn more" */}
    </Paper>
  );
};
```

### 6.5 File Structure

```
hero/
├── AIManagerModal.jsx              # Fullscreen modal
└── pages/
    ├── AIManagerPage/
    │   ├── index.jsx               # Page 2 with React Query
    │   └── AIManagerStatCard.jsx   # Stat card component
    └── HomePage/
        └── AIManagerTeaser.jsx     # 300x300 widget
```

---

## 7. View Modes

### 7.1 Card View Template

```jsx
// view-modes/card/EscrowCard.jsx
import { CardTemplate } from '../../../../templates/Card/CardTemplate';
import { usePrivacy } from '../../../../contexts/PrivacyContext';
import {
  EditPropertyAddress,
  EditPurchasePrice,
  EditClosingDate,
  EditAcceptanceDate,
  EditCommissionAmount
} from '../../editors';

export const EscrowCard = ({ item, onUpdate, onDelete }) => {
  const { isPrivate } = usePrivacy();

  const cardConfig = {
    title: item.property_address,
    subtitle: item.escrow_number,
    status: item.escrow_status,
    image: item.property_image_url || '/placeholder-property.jpg',
    metrics: [
      {
        label: 'Purchase Price',
        value: item.purchase_price,
        formatter: 'currency',
        editor: EditPurchasePrice
      },
      {
        label: 'Commission',
        value: isPrivate ? null : item.commission_amount,
        formatter: 'currency',
        private: true,
        editor: EditCommissionAmount
      },
      {
        label: 'Closing Date',
        value: item.closing_date,
        formatter: 'date',
        editor: EditClosingDate
      },
      {
        label: 'Days in Escrow',
        value: item.days_in_escrow,
        formatter: 'number'
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

export default EscrowCard;
```

### 7.2 View Mode Summary

| Mode | Best For | Key Features |
|------|----------|--------------|
| Card | Visual browsing, property images | Image, status chip, metrics grid |
| List | Quick scanning, progress tracking | Progress bar, compact metrics |
| Table | Data comparison, bulk operations | Checkbox selection, sortable columns |

---

## 8. Inline Editors

### 8.1 Editor Components (6 Total)

| Editor | Field Type | Features |
|--------|------------|----------|
| EditPropertyAddress | Text + Autocomplete | Google Places API integration |
| EditPurchasePrice | Currency | Formatted input, validation |
| EditClosingDate | Date | Date picker, weekend highlighting |
| EditAcceptanceDate | Date | Date picker, validation |
| EditCommissionAmount | Currency + % | Amount/percentage toggle |
| EditClients | Multi-select | Client picker with search |

### 8.2 Barrel Export

```js
// editors/index.js
export { EditPropertyAddress } from './EditPropertyAddress';
export { EditPurchasePrice } from './EditPurchasePrice';
export { EditClosingDate } from './EditClosingDate';
export { EditAcceptanceDate } from './EditAcceptanceDate';
export { EditCommissionAmount } from './EditCommissionAmount';
export { EditClients } from './EditClients';
```

---

## 9. Complete Barrel Exports

### 9.1 hero/index.js

```js
export { default as EscrowsHeroCarousel } from './EscrowsHeroCarousel';
export { default as AIManagerModal } from './AIManagerModal';
export { default as AIManagerPage } from './pages/AIManagerPage';
export { default as AIManagerTeaser } from './pages/HomePage/AIManagerTeaser';
export * from './stats';
```

### 9.2 hero/stats/index.js

```js
export { TotalEscrowsCard } from './TotalEscrowsCard';
export { TotalThisMonthCard } from './TotalThisMonthCard';
export { TotalVolumeCard } from './TotalVolumeCard';
export { TotalCommissionCard } from './TotalCommissionCard';
```

### 9.3 navigation/index.js

```js
export { escrowStatusTabs } from './tabs/EscrowStatusTabs';
export { escrowSortOptions, escrowDefaultSort } from './filters/EscrowSortOptions';
export { getEscrowScopeOptions, escrowDefaultScope } from './filters/EscrowScopeFilter';
export { escrowViewModes, escrowDefaultViewMode } from './filters/EscrowViewModes';
```

### 9.4 view-modes/index.js

```js
export { default as EscrowCard } from './card/EscrowCard';
export { default as EscrowListItem } from './list/EscrowListItem';
export { default as EscrowTableRow } from './table/EscrowTableRow';
```

### 9.5 editors/index.js

```js
export { EditPropertyAddress } from './EditPropertyAddress';
export { EditPurchasePrice } from './EditPurchasePrice';
export { EditClosingDate } from './EditClosingDate';
export { EditAcceptanceDate } from './EditAcceptanceDate';
export { EditCommissionAmount } from './EditCommissionAmount';
export { EditClients } from './EditClients';
```

### 9.6 modals/index.js

```js
export { NewEscrowModal } from './NewEscrowModal';
```

---

## 10. Dependencies

### 10.1 Required Packages

| Package | Purpose | Used In |
|---------|---------|---------|
| `react-swipeable` | Touch/swipe gesture support | EscrowsHeroCarousel |
| `framer-motion` | Page transition animations | EscrowsHeroCarousel |
| `@tanstack/react-query` | Data fetching with caching | AIManagerPage |
| `@mui/material` | UI components | All components |
| `@mui/icons-material` | Icons | All components |

### 10.2 Internal Dependencies

| Module | Purpose |
|--------|---------|
| `templates/Dashboard/components/DashboardHero` | Standard hero layout |
| `templates/Card/CardTemplate` | Card view template |
| `contexts/PrivacyContext` | Commission visibility toggle |
| `contexts/StatusContext` | Database-driven statuses |
| `services/api.service` | API client |
| `config/statuses/statusCategories` | Centralized status config |

---

## 11. Implementation Checklist

### 11.1 Setup Steps

1. Create folder structure under `components/dashboards/escrows/`
2. Create `escrows.config.js` with `createEntityConfig()` wrapper
3. Add status categories to `config/statuses/statusCategories.js`
4. Create status tabs using `getEntityTabs('escrows')`
5. Create filter configs (sort, scope, view modes) in `navigation/filters/`
6. Build 4 stat card components in `hero/stats/`
7. Create AIManagerTeaser widget in `hero/pages/HomePage/`
8. Create AIManagerPage with React Query in `hero/pages/AIManagerPage/`
9. Create AIManagerModal in `hero/`
10. Create HeroCarousel with:
    - 2-page carousel logic
    - Framer Motion animations
    - Swipe support
    - Keyboard navigation
    - Clickable widget wrapper
11. Build view mode components (Card, List, Table)
12. Create 6 inline editor components
13. Build `NewEscrowModal`
14. Wire up `index.jsx` with providers and DashboardTemplate
15. Add route in `App.jsx`
16. Create all barrel exports

### 11.2 Time Estimates

| Task | Time |
|------|------|
| Folder structure + config | 30 minutes |
| Status categories (centralized) | 15 minutes |
| Navigation (tabs + filters) | 30 minutes |
| Stat cards (4 components) | 1 hour |
| AIManagerTeaser | 30 minutes |
| AIManagerPage + StatCard | 1.5 hours |
| AIManagerModal | 1 hour |
| HeroCarousel (full implementation) | 2 hours |
| View modes (3 components) | 2 hours |
| Editors (6 components) | 2 hours |
| NewEscrowModal | 1 hour |
| Wiring + barrel exports | 30 minutes |
| Testing & polish | 1 hour |
| **TOTAL** | **~13.75 hours** |

---

## Key Differences from Other Dashboards

| Feature | Escrows | Others |
|---------|---------|--------|
| PrivacyProvider | ✅ Required | Optional |
| AI Manager Integration | ✅ Full (Modal, Teaser, Page, Carousel) | Partial/None |
| Hero Carousel | ✅ 2-page with animations | Standard hero |
| Swipe/Keyboard Navigation | ✅ Full support | None |
| Lazy Data Loading | ✅ React Query (AIManagerPage) | Standard fetch |
| Centralized Status Config | ✅ Uses `getEntityTabs()` | May use hardcoded |
| Commission Privacy | ✅ Master toggle | N/A |
