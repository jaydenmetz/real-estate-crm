# Escrows Dashboard

**Complete Implementation Reference**

Jillow Real Estate CRM · Version 2.0 · December 2024

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Entry Point Pattern](#2-entry-point-pattern)
3. [Config Structure](#3-config-structure)
4. [Navigation Configuration](#4-navigation-configuration)
5. [Hero Carousel](#5-hero-carousel)
6. [View Modes](#6-view-modes)
7. [Inline Editors](#7-inline-editors)
8. [AI Manager Integration](#8-ai-manager-integration)
9. [Complete Barrel Exports](#9-complete-barrel-exports)
10. [Implementation Checklist](#10-implementation-checklist)

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
│       │   ├── index.jsx
│       │   └── AIManagerStatCard.jsx
│       └── HomePage/
│           └── AIManagerTeaser.jsx
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
    checklists: '/escrows/:id/checklists'
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

### 5.1 Component Structure

```jsx
// hero/EscrowsHeroCarousel.jsx
import { useState } from 'react';
import { Box } from '@mui/material';
import {
  TotalEscrowsCard,
  TotalThisMonthCard,
  TotalVolumeCard,
  TotalCommissionCard
} from './stats';
import AIManagerModal from './AIManagerModal';  // Same folder

export const EscrowsHeroCarousel = ({ stats, activeTab }) => {
  const [showAIManager, setShowAIManager] = useState(false);

  const statCards = [
    TotalEscrowsCard,
    TotalThisMonthCard,
    TotalVolumeCard,
    TotalCommissionCard
  ];

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {statCards.map((StatCard, i) => (
          <StatCard
            key={i}
            stats={stats}
            onAIClick={() => setShowAIManager(true)}
          />
        ))}
      </Box>
      <AIManagerModal
        open={showAIManager}
        onClose={() => setShowAIManager(false)}
        entityType="escrows"
        stats={stats}
      />
    </>
  );
};

export default EscrowsHeroCarousel;
```

### 5.2 Stat Card Summary

| Component | Calculation | Special Features |
|-----------|-------------|------------------|
| TotalEscrowsCard | Count by status | — |
| TotalThisMonthCard | Count by date field | Tab-aware (`created_at` vs `closing_date`) |
| TotalVolumeCard | Sum of `purchase_price` | Currency formatting |
| TotalCommissionCard | Sum of commission | **Master privacy toggle** |

---

## 6. View Modes

### 6.1 Card View Template

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

### 6.2 View Mode Summary

| Mode | Best For | Key Features |
|------|----------|--------------|
| Card | Visual browsing, property images | Image, status chip, metrics grid |
| List | Quick scanning, progress tracking | Progress bar, compact metrics |
| Table | Data comparison, bulk operations | Checkbox selection, sortable columns |

---

## 7. Inline Editors

### 7.1 Editor Components (6 Total)

| Editor | Field Type | Features |
|--------|------------|----------|
| EditPropertyAddress | Text + Autocomplete | Google Places API integration |
| EditPurchasePrice | Currency | Formatted input, validation |
| EditClosingDate | Date | Date picker, weekend highlighting |
| EditAcceptanceDate | Date | Date picker, validation |
| EditCommissionAmount | Currency + % | Amount/percentage toggle |
| EditClients | Multi-select | Client picker with search |

### 7.2 Barrel Export

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

## 8. AI Manager Integration

### 8.1 Components

| Component | Purpose |
|-----------|---------|
| AIManagerModal | Full-screen modal with AI analysis and recommendations |
| AIManagerTeaser | Widget preview for detail page sidebar |
| AIManagerPage | Standalone full-page view (`/escrows/ai-manager`) |
| AIManagerStatCard | Stat card component used within AIManagerPage |

### 8.2 File Locations (Under hero/)

```
hero/
├── AIManagerModal.jsx              # Full modal
└── pages/
    ├── AIManagerPage/
    │   ├── index.jsx               # Main page component
    │   └── AIManagerStatCard.jsx   # Stats for AI page
    └── HomePage/
        └── AIManagerTeaser.jsx     # Teaser widget
```

---

## 9. Complete Barrel Exports

### 9.1 hero/index.js

```js
export {
  TotalEscrowsCard,
  TotalThisMonthCard,
  TotalVolumeCard,
  TotalCommissionCard
} from './stats';

// NOTE: EscrowsHeroCarousel uses direct import, not exported here
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

## 10. Implementation Checklist

### 10.1 Setup Steps

1. Create folder structure under `components/dashboards/escrows/`
2. Create `escrows.config.js` with `createEntityConfig()` wrapper
3. Add status categories to `config/statuses/statusCategories.js`
4. Create status tabs using `getEntityTabs('escrows')`
5. Create filter configs (sort, scope, view modes) in `navigation/filters/`
6. Build 4 stat card components in `hero/stats/`
7. Create HeroCarousel with AI Manager integration
8. Build view mode components (Card, List, Table)
9. Create 6 inline editor components
10. Build `NewEscrowModal`
11. Wire up `index.jsx` with providers and DashboardTemplate
12. Add route in `App.jsx`
13. Create all barrel exports

### 10.2 Time Estimates

| Task | Time |
|------|------|
| Folder structure + config | 30 minutes |
| Status categories (centralized) | 15 minutes |
| Navigation (tabs + filters) | 30 minutes |
| Stat cards (4 components) | 1 hour |
| HeroCarousel + AI Manager | 2 hours |
| View modes (3 components) | 2 hours |
| Editors (6 components) | 2 hours |
| NewEscrowModal | 1 hour |
| Wiring + barrel exports | 30 minutes |
| Testing & polish | 1 hour |
| **TOTAL** | **~10.75 hours** |

---

## Key Differences from Other Dashboards

| Feature | Escrows | Others |
|---------|---------|--------|
| PrivacyProvider | ✅ Required | Optional |
| AI Manager Integration | ✅ Full (Modal, Teaser, Page) | Partial/None |
| Centralized Status Config | ✅ Uses `getEntityTabs()` | May use hardcoded |
| HeroCarousel | ✅ Custom component | Standard hero |
| Commission Privacy | ✅ Master toggle | N/A |
