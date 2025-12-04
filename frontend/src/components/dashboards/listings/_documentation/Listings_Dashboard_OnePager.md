# Listings Dashboard - Quick Reference

**Version 2.0** | December 2024

---

## Folder Structure (31 Files)

```
frontend/src/components/dashboards/listings/
├── index.jsx                           # Dashboard entry point
├── hero/
│   ├── index.js                        # Barrel: exports stats + carousel + modal + teaser
│   ├── ListingsHeroCarousel.jsx        # 2-page carousel with animations
│   ├── AIManagerModal.jsx              # Fullscreen upsell modal
│   ├── stats/
│   │   ├── index.js
│   │   ├── TotalListingsCard.jsx
│   │   ├── TotalThisMonthCard.jsx
│   │   ├── TotalVolumeCard.jsx
│   │   └── TotalCommissionCard.jsx
│   └── pages/
│       ├── AIManagerPage/
│       │   ├── index.jsx               # Page 2 with React Query
│       │   └── AIManagerStatCard.jsx
│       └── HomePage/
│           └── AIManagerTeaser.jsx     # 300x300 clickable widget
├── navigation/
│   ├── index.js                        # Barrel: all nav configs
│   ├── tabs/
│   │   └── ListingStatusTabs.jsx       # Uses centralized config
│   └── filters/
│       ├── ListingViewModes.jsx
│       ├── ListingScopeFilter.jsx
│       └── ListingSortOptions.jsx
├── view-modes/
│   ├── index.js
│   ├── card/ListingCard.jsx
│   ├── list/ListingListItem.jsx
│   └── table/ListingTableRow.jsx
├── modals/
│   ├── index.js
│   └── NewListingModal.jsx
└── editors/
    ├── index.js
    ├── EditPropertyAddress.jsx
    ├── EditListedPrice.jsx
    ├── EditListingCommission.jsx
    ├── EditCommissionAmount.jsx
    ├── EditListingDate.jsx
    └── EditExpirationDate.jsx
```

---

## Status Categories (4 Tabs)

| Key | Label | Statuses | View |
|-----|-------|----------|------|
| Active | Active | `['Active']` | Card |
| Closed | Closed | `['Closed', 'Sold']` | List |
| Cancelled | Cancelled | `['Cancelled', 'Expired', 'Withdrawn']` | List |
| All | All Listings | All statuses | Card |

**Config:** `config/statuses/statusCategories.js` → `LISTING_CATEGORIES`

---

## Stat Cards (4 per Tab = 16 Total)

| Component | Calculation |
|-----------|-------------|
| TotalListingsCard | Count by status filter |
| TotalThisMonthCard | Count by `created_at` or `closing_date` in current month |
| TotalVolumeCard | Sum of listing prices |
| TotalCommissionCard | Sum of commission values |

**Config Format:**
```js
{
  id: 'total_active_listings',
  component: TotalListingsCard,
  props: { status: 'Active' },
  visibleWhen: ['Active']  // Capitalized, array format
}
```

---

## Hero Carousel (2 Pages)

| Page | Content | Data Source |
|------|---------|-------------|
| 1 | Standard hero + stats + AI teaser | Props from DashboardTemplate |
| 2 | AI Manager dashboard | `/listings/manager` via React Query |

**Features:** Framer Motion animations, swipe (react-swipeable), keyboard nav

---

## Navigation Exports

```js
// navigation/index.js
export * from './filters/ListingScopeFilter';
export * from './filters/ListingSortOptions';
export * from './filters/ListingViewModes';
export * from './tabs/ListingStatusTabs';
```

**Sort Options:** listing_date, created_at, list_price, property_address, days_on_market, listing_status
**View Modes:** grid, list, table, map
**Scope:** user, team, broker (role-based)

---

## Editor Components (6)

| Editor | Purpose |
|--------|---------|
| EditPropertyAddress | Address editing |
| EditListedPrice | Price with currency formatting |
| EditListingCommission | Commission percentage |
| EditCommissionAmount | Dollar amount |
| EditListingDate | Listing start date |
| EditExpirationDate | Listing expiration |

---

## Key Differences from Escrows

| Feature | Listings | Escrows |
|---------|----------|---------|
| PrivacyProvider | ✅ Required | ✅ Required |
| Status Field | `listing_status` | `escrow_status` |
| Primary Field | `property_address` | `property_address` |
| Color Theme | Purple (#8B5CF6) | Blue (#1976d2) |
| AI Manager Stats | MLS, DOM, photos, showings | Deadlines, docs, compliance |

---

## Quick Implementation

```jsx
// index.jsx
import { DashboardTemplate } from '../../../templates/Dashboard';
import { listingsConfig } from '../../../config/entities/listings.config';
import { ListingCard, ListingListItem, ListingTableRow } from './view-modes';
import NewListingModal from './modals/NewListingModal';
import { PrivacyProvider } from '../../../contexts/PrivacyContext';
import { StatusProvider } from '../../../contexts/StatusContext';
import { ListingsHeroCarousel } from './hero';

const ListingsDashboard = () => (
  <StatusProvider entityType="listings">
    <PrivacyProvider entityType="listings">
      <DashboardTemplate
        config={listingsConfig}
        CardComponent={ListingCard}
        ListComponent={ListingListItem}
        TableComponent={ListingTableRow}
        NewItemModal={NewListingModal}
        HeroComponent={ListingsHeroCarousel}
      />
    </PrivacyProvider>
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

**Full Reference:** See `Listings_Dashboard_InDepth.md`
