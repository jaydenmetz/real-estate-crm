# Leads Dashboard - In-Depth Technical Reference

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

The Leads Dashboard follows a **config-driven architecture** using `DashboardTemplate`. All entity-specific behavior is defined in `leads.config.js`, with custom components for views, stats, and editors.

### Design Principles
- **Config-driven**: Entity behavior defined in configuration files
- **Component composition**: Small, focused components assembled into larger features
- **Centralized state**: StatusContext for cross-component state
- **Lazy loading**: React Query for efficient data fetching

---

## Folder Structure

```
frontend/src/components/dashboards/leads/
├── index.jsx                           # Dashboard entry point with providers
├── _documentation/
│   ├── Leads_Dashboard_OnePager.md     # Quick reference
│   └── Leads_Dashboard_InDepth.md      # This file
├── hero/
│   ├── index.js                        # Barrel exports
│   ├── LeadsHeroCarousel.jsx           # 2-page carousel
│   ├── AIManagerModal.jsx              # Fullscreen upsell modal
│   ├── stats/
│   │   ├── index.js
│   │   ├── TotalLeadsCard.jsx
│   │   ├── NewThisWeekCard.jsx
│   │   ├── QualifiedLeadsCard.jsx
│   │   └── ConvertedThisMonthCard.jsx
│   └── pages/
│       ├── AIManagerPage/
│       │   ├── index.jsx               # Page 2 content
│       │   └── AIManagerStatCard.jsx   # Stat card component
│       └── HomePage/
│           └── AIManagerTeaser.jsx     # 300x300 teaser widget
├── navigation/
│   ├── index.js
│   ├── tabs/
│   │   └── LeadStatusTabs.jsx
│   └── filters/
│       ├── LeadViewModes.jsx
│       ├── LeadScopeFilter.jsx
│       └── LeadSortOptions.jsx
├── view-modes/
│   ├── index.js
│   ├── card/LeadCard.jsx
│   ├── list/LeadListItem.jsx
│   └── table/LeadTableRow.jsx
├── modals/
│   ├── index.js
│   └── NewLeadModal.jsx
└── editors/
    ├── index.js
    ├── EditLeadName.jsx
    ├── EditLeadEmail.jsx
    ├── EditLeadPhone.jsx
    ├── EditLeadStatus.jsx
    └── EditLeadSource.jsx
```

---

## Component Breakdown

### Entry Point (`index.jsx`)

```jsx
import { DashboardTemplate } from '../../../templates/Dashboard';
import { leadsConfig } from '../../../config/entities/leads.config';
import { LeadCard, LeadListItem, LeadTableRow } from './view-modes';
import { NewLeadModal } from './modals';
import { StatusProvider } from '../../../contexts/StatusContext';
import { LeadsHeroCarousel } from './hero';

const LeadsDashboard = () => (
  <StatusProvider entityType="leads">
    <DashboardTemplate
      config={leadsConfig}
      CardComponent={LeadCard}
      ListComponent={LeadListItem}
      TableComponent={LeadTableRow}
      NewItemModal={NewLeadModal}
      HeroComponent={LeadsHeroCarousel}
    />
  </StatusProvider>
);
```

**Props passed to DashboardTemplate:**
- `config`: Entity configuration from `leads.config.js`
- `CardComponent`: Grid view card
- `ListComponent`: List view row with avatar
- `TableComponent`: Table view row
- `NewItemModal`: Create new lead modal
- `HeroComponent`: Custom carousel hero section

---

## Hero Carousel System

### LeadsHeroCarousel.jsx

The hero carousel provides a 2-page experience:
- **Page 1**: Standard hero with stats and AI teaser
- **Page 2**: AI Lead Nurturing Manager dashboard with detailed metrics

**Key Features:**
- Framer Motion animations for smooth transitions
- Swipe support via `react-swipeable`
- Keyboard navigation (left/right arrows)
- Arrow buttons for desktop users
- Dot indicators for page position

### AIManagerPage

Page 2 of the carousel, showing AI-specific statistics:
- **AI-Scored**: Count of leads analyzed by AI
- **Hot Leads**: High probability conversion leads
- **Pending Follow-ups**: Leads needing attention
- **Conversion Rate**: Period conversion percentage

**Data Loading:**
```jsx
const { data, isLoading } = useQuery({
  queryKey: ['leads', 'manager', dateFilter],
  queryFn: async () => {
    const response = await apiInstance.get(`/leads/manager?period=${dateFilter}`);
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
- Brain/psychology icon

### AIManagerModal

Fullscreen upsell modal for AI Lead Nurturing Manager:
- Feature list with descriptions
- "Coming Soon" badge
- "Join the Waitlist" CTA
- Green gradient background (#047857 → #10b981 → #34d399)

---

## Stat Card Implementation

### Available Stat Cards

| Component | Purpose | Props |
|-----------|---------|-------|
| TotalLeadsCard | Count of all leads | `{ status }` |
| NewThisWeekCard | New leads this week | `{ status }` |
| QualifiedLeadsCard | Count of qualified leads | `{ status }` |
| ConvertedThisMonthCard | Conversions this month | `{ status }` |

### visibleWhen Logic

Stats only render when `selectedStatus` matches any value in `visibleWhen`:
- `['New']` - Only shows on New tab
- `['Qualified']` - Only shows on Qualified tab
- `['All']` - Shows on All Leads tab

---

## Navigation System

### Status Tabs

```js
// navigation/tabs/LeadStatusTabs.jsx
export const leadStatusTabs = [
  { key: 'New', label: 'New', statuses: ['new'] },
  { key: 'Contacted', label: 'Contacted', statuses: ['contacted'] },
  { key: 'Qualified', label: 'Qualified', statuses: ['qualified'] },
  { key: 'Nurturing', label: 'Nurturing', statuses: ['nurturing'] },
  { key: 'Converted', label: 'Converted', statuses: ['converted'] },
  { key: 'All', label: 'All Leads', statuses: null }
];
```

### Sort Options

```js
export const leadSortOptions = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'last_contact', label: 'Last Contact' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'priority', label: 'Priority' },
  { value: 'score', label: 'Lead Score' }
];
```

### View Modes

```js
export const leadViewModes = [
  { value: 'grid', label: 'Grid', icon: 'GridView' },
  { value: 'list', label: 'List', icon: 'ViewList' },
  { value: 'table', label: 'Table', icon: 'TableRows' }
];
```

---

## View Modes

### LeadCard (Grid View)

Displays lead as a card with:
- Avatar with initials
- Name and lead type
- Email and phone
- Lead score with progress bar
- Source and status badges

### LeadListItem (List View)

Horizontal layout with:
- Avatar section (120px) with lead score
- Content area with name, contact info
- Status chip and source
- Quick actions menu

### LeadTableRow (Table View)

Compact row for data-dense view:
- Avatar and name column
- Email, phone columns
- Status badge
- Source and lead score
- Created date
- Actions column

---

## Editor Components

All editors use shared base components for consistency.

| Editor | Field | Validation |
|--------|-------|------------|
| EditLeadName | `firstName`, `lastName` | Required, 1-100 chars |
| EditLeadEmail | `email` | Required, valid email |
| EditLeadPhone | `phone` | Optional, valid phone format |
| EditLeadStatus | `lead_status` | Dropdown selection |
| EditLeadSource | `source` | Dropdown selection |

---

## Status Configuration

### Centralized in `/frontend/src/constants/leadConfig.js`

```js
export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  NURTURING: 'nurturing',
  CONVERTED: 'converted',
  UNQUALIFIED: 'unqualified',
  DEAD: 'dead',
  ARCHIVED: 'archived'
};

export const LEAD_STATUS_CONFIG = {
  'new': {
    color: '#3b82f6',
    bg: 'linear-gradient(...)',
    icon: 'fiber_new',
    label: 'New'
  },
  // ... other statuses
};
```

---

## Context Providers

### StatusProvider

Fetches and provides database-driven status configurations:
```jsx
<StatusProvider entityType="leads">
  {/* children */}
</StatusProvider>
```

---

## API Integration

### Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /leads` | List all leads with filters |
| `GET /leads/:id` | Get single lead |
| `POST /leads` | Create new lead |
| `PUT /leads/:id` | Update lead |
| `DELETE /leads/:id` | Delete lead |
| `GET /leads/manager` | AI Manager stats (Page 2) |
| `POST /leads/:id/archive` | Archive lead |
| `POST /leads/:id/convert` | Convert lead to client |

---

## Styling Conventions

### Color Theme

- **Primary**: Green (#10b981)
- **Gradient**: `#047857 → #10b981 → #34d399`
- **Status Colors**: Defined in `LEAD_STATUS_COLORS`

### Common Patterns

```jsx
// Card background
background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)'

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

1. **Hero Carousel Added**: New 2-page carousel with AI Lead Manager integration
2. **Constants Centralized**: Moved from `constants/leadConstants.js` to `/frontend/src/constants/leadConfig.js`
3. **HeroComponent Prop**: Added to DashboardTemplate call
4. **StatusProvider Added**: Wraps dashboard for status context
5. **List/Table Components**: Added to DashboardTemplate props

### Breaking Changes

- Import path for lead constants changed
- HeroComponent is now required for full functionality

---

**Last Updated:** December 2024
**Maintainer:** Development Team
