# Listings Dashboard - In-Depth Technical Reference

**Version 2.0** | December 2024

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Component Breakdown](#component-breakdown)
4. [Hero Carousel System](#hero-carousel-system)
5. [Stat Card Implementation](#stat-card-implementation)
6. [Navigation System](#navigation-system)
7. [View Modes](#view-modes)
8. [Editor Components](#editor-components)
9. [Status Configuration](#status-configuration)
10. [Context Providers](#context-providers)
11. [API Integration](#api-integration)
12. [Styling Conventions](#styling-conventions)

---

## Architecture Overview

The Listings Dashboard follows a **config-driven architecture** using `DashboardTemplate`. All entity-specific behavior is defined in `listings.config.js`, with custom components for views, stats, and editors.

### Design Principles
- **Config-driven**: Entity behavior defined in configuration files
- **Component composition**: Small, focused components assembled into larger features
- **Centralized state**: StatusContext and PrivacyContext for cross-component state
- **Lazy loading**: React Query for efficient data fetching

---

## Folder Structure

```
frontend/src/components/dashboards/listings/
├── index.jsx                           # Dashboard entry point with providers
├── _documentation/
│   ├── Listings_Dashboard_OnePager.md  # Quick reference
│   └── Listings_Dashboard_InDepth.md   # This file
├── hero/
│   ├── index.js                        # Barrel exports
│   ├── ListingsHeroCarousel.jsx        # 2-page carousel
│   ├── AIManagerModal.jsx              # Fullscreen upsell modal
│   ├── stats/
│   │   ├── index.js
│   │   ├── TotalListingsCard.jsx
│   │   ├── TotalThisMonthCard.jsx
│   │   ├── TotalVolumeCard.jsx
│   │   └── TotalCommissionCard.jsx
│   └── pages/
│       ├── AIManagerPage/
│       │   ├── index.jsx               # Page 2 content
│       │   └── AIManagerStatCard.jsx   # Stat card component
│       └── HomePage/
│           └── AIManagerTeaser.jsx     # 300x300 teaser widget
├── navigation/
│   ├── index.js
│   ├── tabs/
│   │   └── ListingStatusTabs.jsx
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

## Component Breakdown

### Entry Point (`index.jsx`)

```jsx
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

**Props passed to DashboardTemplate:**
- `config`: Entity configuration from `listings.config.js`
- `CardComponent`: Grid view card
- `ListComponent`: List view row
- `TableComponent`: Table view row
- `NewItemModal`: Create new listing modal
- `HeroComponent`: Custom carousel hero section

---

## Hero Carousel System

### ListingsHeroCarousel.jsx

The hero carousel provides a 2-page experience:
- **Page 1**: Standard hero with stats and AI teaser
- **Page 2**: AI Manager dashboard with detailed metrics

**Key Features:**
- Framer Motion animations for smooth transitions
- Swipe support via `react-swipeable`
- Keyboard navigation (left/right arrows)
- Arrow buttons for desktop users
- Dot indicators for page position

```jsx
const ListingsHeroCarousel = ({
  config,
  stats,
  statsConfig,
  selectedStatus,
  onNewItem,
  // ... date range props
  StatCardComponent,
  allData,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  // Navigation handlers
  const goToNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % 2);
  }, []);

  // ... rest of implementation
};
```

### AIManagerPage

Page 2 of the carousel, showing AI-specific statistics:
- **AI-Managed**: Count of listings under AI monitoring
- **Expiring Soon**: Listings expiring within 30 days
- **Needs Update**: Listings requiring attention
- **Avg DOM**: Average days on market

**Data Loading:**
```jsx
const { data, isLoading } = useQuery({
  queryKey: ['listings', 'manager', dateFilter],
  queryFn: async () => {
    const response = await apiInstance.get(`/listings/manager?period=${dateFilter}`);
    return response.data;
  },
  enabled: isVisible, // Only fetch when page is visible
  staleTime: 30000,
});
```

### AIManagerTeaser

300x300 clickable widget displayed on Page 1:
- Opens `AIManagerModal` on click
- Hover animations
- Gradient overlay effect
- Crown/sparkle icon

### AIManagerModal

Fullscreen upsell modal for AI Listing Manager:
- Feature list with descriptions
- "Coming Soon" badge
- "Add to Waitlist" CTA
- Purple gradient background (#5b21b6 → #8b5cf6)

---

## Stat Card Implementation

### Available Stat Cards

| Component | Purpose | Props |
|-----------|---------|-------|
| TotalListingsCard | Count of listings | `{ status }` |
| TotalThisMonthCard | Count created this month | `{ status, dateField }` |
| TotalVolumeCard | Sum of listing prices | `{ status }` |
| TotalCommissionCard | Sum of commissions | `{ status }` |

### Stats Configuration

```js
// In listings.config.js
stats: [
  {
    id: 'total_active_listings',
    component: TotalListingsCard,
    props: { status: 'Active' },
    visibleWhen: ['Active']
  },
  {
    id: 'total_active_volume',
    component: TotalVolumeCard,
    props: { status: 'Active' },
    visibleWhen: ['Active']
  },
  // ... 14 more stat configs
]
```

### visibleWhen Logic

Stats only render when `selectedStatus` matches any value in `visibleWhen`:
- `['Active']` - Only shows on Active tab
- `['Closed']` - Only shows on Closed tab
- `['All']` - Shows on All Listings tab

---

## Navigation System

### Status Tabs

```js
// navigation/tabs/ListingStatusTabs.jsx
export const listingStatusTabs = [
  { key: 'Active', label: 'Active', statuses: ['Active'] },
  { key: 'Closed', label: 'Closed', statuses: ['Closed', 'Sold'] },
  { key: 'Cancelled', label: 'Cancelled', statuses: ['Cancelled', 'Expired', 'Withdrawn'] },
  { key: 'All', label: 'All Listings', statuses: null }
];
```

### Sort Options

```js
export const listingSortOptions = [
  { value: 'listing_date', label: 'Beginning Date' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'list_price', label: 'List Price' },
  { value: 'property_address', label: 'Property Address' },
  { value: 'days_on_market', label: 'Days on Market' },
  { value: 'listing_status', label: 'Status' }
];
```

### View Modes

```js
export const listingViewModes = [
  { value: 'grid', label: 'Grid', icon: 'GridView' },
  { value: 'list', label: 'List', icon: 'ViewList' },
  { value: 'table', label: 'Table', icon: 'TableRows' },
  { value: 'map', label: 'Map', icon: 'Map' }
];
```

### Scope Filter

Role-based filtering:
- **user**: My listings only
- **team**: Team listings
- **broker**: All office listings (broker role only)

---

## View Modes

### ListingCard (Grid View)

Displays listing as a card with:
- Property image with status badge
- Address and location
- Price, bed/bath count
- Days on market
- Commission info (privacy toggleable)

### ListingListItem (List View)

Horizontal layout with:
- Thumbnail image
- Property details in columns
- Action buttons on right

### ListingTableRow (Table View)

Compact row for data-dense view:
- All key fields in columns
- Sortable headers
- Inline actions

---

## Editor Components

All editors use `EditorModal` base component for consistency.

| Editor | Field | Validation |
|--------|-------|------------|
| EditPropertyAddress | `property_address` | Required, 5-200 chars |
| EditListedPrice | `listing_price` | Required, numeric |
| EditListingCommission | `listing_commission` | 0-100% |
| EditCommissionAmount | `commission_amount` | Numeric, currency format |
| EditListingDate | `listing_date` | Date picker |
| EditExpirationDate | `expiration_date` | Date picker, after listing_date |

---

## Status Configuration

### Centralized in `/frontend/src/constants/listingConfig.js`

```js
export const LISTING_STATUS = {
  COMING_SOON: 'Coming Soon',
  ACTIVE: 'Active',
  PENDING: 'Pending',
  CLOSED: 'Closed',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  WITHDRAWN: 'Withdrawn',
  ARCHIVED: 'archived'
};

export const LISTING_STATUS_CONFIG = {
  'Active': {
    color: '#10b981',
    bg: 'linear-gradient(...)',
    icon: 'trending_up',
    label: 'Active'
  },
  // ... other statuses
};
```

---

## Context Providers

### StatusProvider

Fetches and provides database-driven status configurations:
```jsx
<StatusProvider entityType="listings">
  {/* children */}
</StatusProvider>
```

### PrivacyProvider

Controls commission visibility toggle:
```jsx
<PrivacyProvider entityType="listings">
  {/* children */}
</PrivacyProvider>
```

---

## API Integration

### Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /listings` | List all listings with filters |
| `GET /listings/:id` | Get single listing |
| `POST /listings` | Create new listing |
| `PUT /listings/:id` | Update listing |
| `DELETE /listings/:id` | Delete listing |
| `GET /listings/manager` | AI Manager stats (Page 2) |
| `POST /listings/:id/archive` | Archive listing |

### Data Fetching Pattern

```js
// In listings.config.js
api: {
  baseEndpoint: '/listings',
  getAll: (params) => api.listingsAPI.getAll(params),
  getById: (id) => api.listingsAPI.getById(id),
  create: (data) => api.listingsAPI.create(data),
  update: (id, data) => api.listingsAPI.update(id, data),
  delete: (id) => api.listingsAPI.delete(id),
}
```

---

## Styling Conventions

### Color Theme

- **Primary**: Purple (#8B5CF6)
- **Gradient**: `#8B5CF6 → #A78BFA`
- **AI Manager**: `#7c3aed → #8b5cf6 → #a78bfa`

### Common Patterns

```jsx
// Card background
background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(124,58,237,0.12) 100%)'

// Glass effect
backdropFilter: 'blur(10px)'
border: '1px solid rgba(255,255,255,0.2)'

// Hover states
'&:hover': {
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
}
```

---

## Migration Notes

### From v1.x to v2.0

1. **Hero Carousel Added**: New 2-page carousel with AI Manager integration
2. **Constants Centralized**: Moved from `constants/listingConstants.js` to `/frontend/src/constants/listingConfig.js`
3. **HeroComponent Prop**: Added to DashboardTemplate call
4. **New Barrel Exports**: Added carousel, modal, teaser, and AI page exports

### Breaking Changes

- Import path for listing constants changed
- HeroComponent is now required for full functionality

---

**Last Updated:** December 2024
**Maintainer:** Development Team
