# Clients Dashboard - Quick Reference

**Version 2.1** | December 2024

---

## Folder Structure (30 Files)

```
frontend/src/components/dashboards/clients/
├── index.jsx                           # Dashboard entry point
├── config/
│   └── viewModeConfig.js
├── constants/
│   └── clientConstants.js
├── hero/
│   ├── index.js                        # Barrel: exports stats + carousel + modal
│   ├── ClientsHeroCarousel.jsx         # 2-page carousel with animations
│   ├── AIManagerModal.jsx              # Fullscreen upsell modal
│   ├── stats/
│   │   ├── index.js
│   │   ├── TotalClientsCard.jsx
│   │   ├── ActiveClientsCard.jsx
│   │   ├── NewThisMonthCard.jsx
│   │   └── ClientValueCard.jsx
│   └── pages/
│       └── AIManagerPage/
│           ├── index.jsx               # Page 2 with React Query
│           └── AIManagerStatCard.jsx
├── navigation/
│   ├── index.js                        # Barrel: all nav configs
│   ├── tabs/
│   │   └── ClientStatusTabs.jsx        # Uses centralized config
│   └── filters/
│       ├── ClientViewModes.jsx
│       ├── ClientScopeFilter.jsx
│       └── ClientSortOptions.jsx
├── view-modes/
│   ├── index.js
│   ├── card/ClientCard.jsx
│   ├── list/ClientListItem.jsx
│   └── table/ClientTableRow.jsx
├── modals/
│   ├── index.js
│   └── NewClientModal.jsx
└── editors/
    ├── index.js
    ├── EditClientName.jsx
    ├── EditClientEmail.jsx
    ├── EditClientPhone.jsx
    ├── EditClientStatus.jsx
    └── EditClientBudget.jsx
```

---

## Status Categories (4 Tabs)

| Key | Label | Statuses | View |
|-----|-------|----------|------|
| Active | Active | `['active', 'lead']` | Card |
| Past | Past | `['past_client']` | List |
| Inactive | Inactive | `['inactive']` | List |
| All | All Clients | `['active', 'lead', 'past_client', 'inactive']` | Card |

**Config:** `config/statuses/statusCategories.js` → `CLIENT_CATEGORIES`

---

## Stat Cards (4 per Tab = 16 Total)

| Component | Calculation |
|-----------|-------------|
| TotalClientsCard | Count by status filter |
| ActiveClientsCard | Count of active status |
| NewThisMonthCard | Count by `created_at` in current month |
| ClientValueCard | Sum of client value/budget |

**Config Format:**
```js
{
  id: 'total_active_clients',
  component: TotalClientsCard,
  props: { status: 'active' },
  visibleWhen: ['Active']  // Capitalized, array format
}
```

---

## Hero Carousel (2 Pages)

| Page | Content | Data Source |
|------|---------|-------------|
| 1 | Standard hero + stats + AI teaser | Props from DashboardTemplate |
| 2 | AI Manager dashboard | `/clients/manager` via React Query |

**Features:** Framer Motion animations, swipe (react-swipeable), keyboard nav

---

## Navigation Exports

```js
// navigation/index.js
export * from './filters/ClientScopeFilter';
export * from './filters/ClientSortOptions';
export * from './filters/ClientViewModes';
export * from './tabs/ClientStatusTabs';
```

**Sort Options:** created_at, last_contact, name, budget, priority, client_status
**View Modes:** grid, list, table
**Scope:** user, team, broker (role-based)

---

## Editor Components (5)

| Editor | Purpose |
|--------|---------|
| EditClientName | First/last name editing |
| EditClientEmail | Email with validation |
| EditClientPhone | Phone formatting |
| EditClientStatus | Status dropdown |
| EditClientBudget | Currency input |

---

## Key Differences from Escrows

| Feature | Clients | Escrows |
|---------|---------|---------|
| PrivacyProvider | ❌ Not needed | ✅ Required |
| Status Field | `client_status` | `escrow_status` |
| Primary Field | `name` (computed) | `property_address` |
| Color Theme | Purple (#0891B2) | Blue (#1976d2) |
| AI Manager Stats | Follow-ups, birthdays, engagement | Deadlines, docs, compliance |

---

## Quick Implementation

```jsx
// index.jsx
import { DashboardTemplate } from '../../../templates/Dashboard';
import { clientsConfig } from '../../../config/entities/clients.config';
import { ClientCard, ClientListItem, ClientTableRow } from './view-modes';
import { NewClientModal } from './modals';
import { StatusProvider } from '../../../contexts/StatusContext';
import { ClientsHeroCarousel } from './hero';

const ClientsDashboard = () => (
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
```

---

## Dependencies

- `react-swipeable` - Touch/swipe gestures
- `framer-motion` - Page transitions
- `@tanstack/react-query` - AIManagerPage data fetching
- `@mui/material` - UI components

---

**Full Reference:** See `Clients_Dashboard_InDepth.md`
