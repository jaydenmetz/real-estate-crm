# Escrows Dashboard

**One-Pager Reference** · Jillow Real Estate CRM · December 2024

---

## Folder Structure (32 Files)

```
components/dashboards/escrows/
├── index.jsx                    # Entry: StatusProvider + PrivacyProvider
├── hero/
│   ├── index.js                 # Barrel: exports stat cards ONLY
│   ├── EscrowsHeroCarousel.jsx  # Direct import (not in barrel)
│   ├── AIManagerModal.jsx       # Lives HERE, not ai-manager/
│   ├── stats/                   # 4 stat card components
│   │   ├── index.js
│   │   ├── TotalEscrowsCard.jsx
│   │   ├── TotalThisMonthCard.jsx
│   │   ├── TotalVolumeCard.jsx
│   │   └── TotalCommissionCard.jsx
│   └── pages/
│       ├── AIManagerPage/
│       │   ├── index.jsx
│       │   └── AIManagerStatCard.jsx
│       └── HomePage/
│           └── AIManagerTeaser.jsx
├── navigation/
│   ├── index.js
│   ├── tabs/EscrowStatusTabs.jsx
│   └── filters/
│       ├── EscrowViewModes.jsx
│       ├── EscrowScopeFilter.jsx
│       └── EscrowSortOptions.jsx
├── view-modes/                  # card/, list/, table/
├── modals/                      # NewEscrowModal
└── editors/                     # 6 inline field editors
```

---

## Status Categories (4 Tabs)

> **Note:** Status tabs use centralized config from `config/statuses/statusCategories.js`

| Tab | Statuses | Default View |
|-----|----------|--------------|
| Active | `['Active']` | Card |
| Closed | `['Closed']` | List |
| Cancelled | `['Cancelled']` | List |
| All | `['Active', 'Closed', 'Cancelled']` | Card |

---

## Hero Stats (Component-Based)

| Component | Data Source | Special |
|-----------|-------------|---------|
| TotalEscrowsCard | Count by status filter | — |
| TotalThisMonthCard | `closing_date` per tab | Tab-aware dateField |
| TotalVolumeCard | Sum of `purchase_price` | — |
| TotalCommissionCard | Sum of commission | **Privacy toggle** |

**Config Pattern:**
```js
{
  id: 'total_active_escrows',
  component: TotalEscrowsCard,
  props: { status: 'active' },
  visibleWhen: ['Active']
}
```

---

## Entry Point Pattern

```jsx
import EscrowsHeroCarousel from './hero/EscrowsHeroCarousel';

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
```

---

## Card View Metrics

| Field | Formatter | Editor | Private |
|-------|-----------|--------|---------|
| `property_address` | string | EditPropertyAddress | No |
| `purchase_price` | currency | EditPurchasePrice | No |
| `closing_date` | date | EditClosingDate | No |
| `acceptance_date` | date | EditAcceptanceDate | No |
| `commission_amount` | currency | EditCommissionAmount | **YES** |
| `days_in_escrow` | number | — | No |

---

## Core Features

| Feature | Location | Purpose |
|---------|----------|---------|
| StatusProvider | index.jsx wrapper | DB-driven statuses |
| PrivacyProvider | index.jsx wrapper | Sensitive field visibility |
| HeroCarousel | hero/EscrowsHeroCarousel.jsx | AI integration |
| AIManagerModal | hero/AIManagerModal.jsx | Full AI analysis |
| AIManagerTeaser | hero/pages/HomePage/AIManagerTeaser.jsx | Widget preview |
| AIManagerPage | hero/pages/AIManagerPage/index.jsx | Full-page AI view |

---

## Barrel Exports

**hero/index.js** *(stat cards ONLY - no HeroCarousel)*
```js
export { TotalEscrowsCard, TotalThisMonthCard, TotalVolumeCard, TotalCommissionCard } from './stats';
```

**navigation/index.js**
```js
export { escrowStatusTabs } from './tabs/EscrowStatusTabs';
export { escrowSortOptions, escrowDefaultSort } from './filters/EscrowSortOptions';
export { getEscrowScopeOptions, escrowDefaultScope } from './filters/EscrowScopeFilter';
export { escrowViewModes, escrowDefaultViewMode } from './filters/EscrowViewModes';
```

**editors/index.js**
```js
export { EditPropertyAddress } from './EditPropertyAddress';
export { EditPurchasePrice } from './EditPurchasePrice';
export { EditClosingDate } from './EditClosingDate';
export { EditAcceptanceDate } from './EditAcceptanceDate';
export { EditCommissionAmount } from './EditCommissionAmount';
export { EditClients } from './EditClients';
```

**view-modes/index.js**
```js
export { default as EscrowCard } from './card/EscrowCard';
export { default as EscrowListItem } from './list/EscrowListItem';
export { default as EscrowTableRow } from './table/EscrowTableRow';
```

**modals/index.js**
```js
export { NewEscrowModal } from './NewEscrowModal';
```
