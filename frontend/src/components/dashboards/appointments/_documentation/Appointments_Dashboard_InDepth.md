# Appointments Dashboard - In-Depth Technical Reference

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

The Appointments Dashboard follows a **config-driven architecture** using `DashboardTemplate`. All entity-specific behavior is defined in `appointments.config.js`, with custom components for views, stats, and editors.

### Design Principles
- **Config-driven**: Entity behavior defined in configuration files
- **Component composition**: Small, focused components assembled into larger features
- **Centralized state**: StatusContext for cross-component state
- **Lazy loading**: React Query for efficient data fetching

---

## Folder Structure

```
frontend/src/components/dashboards/appointments/
├── index.jsx                           # Dashboard entry point with providers
├── _documentation/
│   ├── Appointments_Dashboard_OnePager.md  # Quick reference
│   └── Appointments_Dashboard_InDepth.md   # This file
├── hero/
│   ├── index.js                        # Barrel exports
│   ├── AppointmentsHeroCarousel.jsx    # 2-page carousel
│   ├── AIManagerModal.jsx              # Fullscreen upsell modal
│   ├── stats/
│   │   ├── index.js
│   │   ├── TotalAppointmentsCard.jsx
│   │   ├── UpcomingAppointmentsCard.jsx
│   │   ├── CompletedThisMonthCard.jsx
│   │   └── MissedAppointmentsCard.jsx
│   └── pages/
│       ├── AIManagerPage/
│       │   ├── index.jsx               # Page 2 content
│       │   └── AIManagerStatCard.jsx   # Stat card component
│       └── HomePage/
│           └── AIManagerTeaser.jsx     # 300x300 teaser widget
├── navigation/
│   ├── index.js
│   ├── tabs/
│   │   └── AppointmentStatusTabs.jsx
│   └── filters/
│       ├── AppointmentViewModes.jsx
│       ├── AppointmentScopeFilter.jsx
│       └── AppointmentSortOptions.jsx
├── view-modes/
│   ├── index.js
│   ├── card/AppointmentCard.jsx
│   ├── list/AppointmentListItem.jsx
│   └── table/AppointmentTableRow.jsx
├── modals/
│   ├── index.js
│   └── NewAppointmentModal.jsx
└── editors/
    ├── index.js
    ├── EditAppointmentTitle.jsx
    ├── EditAppointmentDate.jsx
    ├── EditAppointmentTime.jsx
    ├── EditAppointmentLocation.jsx
    └── EditAppointmentStatus.jsx
```

---

## Component Breakdown

### Entry Point (`index.jsx`)

```jsx
import { DashboardTemplate } from '../../../templates/Dashboard';
import { appointmentsConfig } from '../../../config/entities/appointments.config';
import { AppointmentCard, AppointmentListItem, AppointmentTableRow } from './view-modes';
import { NewAppointmentModal } from './modals';
import { StatusProvider } from '../../../contexts/StatusContext';
import { AppointmentsHeroCarousel } from './hero';

const AppointmentsDashboard = () => (
  <StatusProvider entityType="appointments">
    <DashboardTemplate
      config={appointmentsConfig}
      CardComponent={AppointmentCard}
      ListComponent={AppointmentListItem}
      TableComponent={AppointmentTableRow}
      NewItemModal={NewAppointmentModal}
      HeroComponent={AppointmentsHeroCarousel}
    />
  </StatusProvider>
);
```

**Props passed to DashboardTemplate:**
- `config`: Entity configuration from `appointments.config.js`
- `CardComponent`: Grid view card
- `ListComponent`: List view row
- `TableComponent`: Table view row
- `NewItemModal`: Create new appointment modal
- `HeroComponent`: Custom carousel hero section

---

## Hero Carousel System

### AppointmentsHeroCarousel.jsx

The hero carousel provides a 2-page experience:
- **Page 1**: Standard hero with stats and AI teaser
- **Page 2**: AI Manager dashboard with detailed metrics

**Key Features:**
- Framer Motion animations for smooth transitions
- Swipe support via `react-swipeable`
- Keyboard navigation (left/right arrows)
- Arrow buttons for desktop users
- Dot indicators for page position

### AIManagerPage

Page 2 of the carousel, showing AI-specific statistics:
- **AI-Managed**: Count of appointments under AI monitoring
- **Next 24h**: Upcoming appointments in next 24 hours
- **Need Confirm**: Unconfirmed appointments
- **Show Rate**: Attendance percentage

**Data Loading:**
```jsx
const { data, isLoading } = useQuery({
  queryKey: ['appointments', 'manager', dateFilter],
  queryFn: async () => {
    const response = await apiInstance.get(`/appointments/manager?period=${dateFilter}`);
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

Fullscreen upsell modal for AI Appointment Manager:
- Feature list with descriptions
- "Coming Soon" badge
- "Add to Waitlist" CTA
- Teal gradient background (#0e7490 → #06b6d4)

---

## Stat Card Implementation

### Available Stat Cards

| Component | Purpose | Props |
|-----------|---------|-------|
| TotalAppointmentsCard | Count of appointments | `{ status }` |
| UpcomingAppointmentsCard | Count of upcoming | `{ status }` |
| CompletedThisMonthCard | Count completed this month | `{ status, dateField }` |
| MissedAppointmentsCard | Count of no-shows | `{ status }` |

### visibleWhen Logic

Stats only render when `selectedStatus` matches any value in `visibleWhen`:
- `['Upcoming']` - Only shows on Upcoming tab
- `['Completed']` - Only shows on Completed tab
- `['All']` - Shows on All Appointments tab

---

## Navigation System

### Status Tabs

```js
// navigation/tabs/AppointmentStatusTabs.jsx
export const appointmentStatusTabs = [
  { key: 'Upcoming', label: 'Upcoming', statuses: ['scheduled', 'confirmed'] },
  { key: 'Completed', label: 'Completed', statuses: ['completed'] },
  { key: 'Cancelled', label: 'Cancelled', statuses: ['cancelled', 'no_show', 'rescheduled'] },
  { key: 'All', label: 'All Appointments', statuses: null }
];
```

### Sort Options

```js
export const appointmentSortOptions = [
  { value: 'appointment_date', label: 'Date & Time' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' }
];
```

### View Modes

```js
export const appointmentViewModes = [
  { value: 'grid', label: 'Grid', icon: 'GridView' },
  { value: 'list', label: 'List', icon: 'ViewList' },
  { value: 'table', label: 'Table', icon: 'TableRows' },
  { value: 'calendar', label: 'Calendar', icon: 'CalendarMonth' }
];
```

---

## View Modes

### AppointmentCard (Grid View)

Displays appointment as a card with:
- Date/time header with color coding
- Title and type
- Location and duration
- Client name
- Status badge

### AppointmentListItem (List View)

Horizontal layout with:
- Date/time column (colored by status)
- Details section
- Action buttons

### AppointmentTableRow (Table View)

Compact row for data-dense view:
- All key fields in columns
- Sortable headers
- Inline actions

---

## Editor Components

All editors use shared base components for consistency.

| Editor | Field | Validation |
|--------|-------|------------|
| EditAppointmentTitle | `title` | Required, 3-200 chars |
| EditAppointmentDate | `appointment_date` | Required, date picker |
| EditAppointmentTime | `appointment_time` | Required, time picker |
| EditAppointmentLocation | `location` | Optional, 500 chars max |
| EditAppointmentStatus | `appointment_status` | Dropdown selection |

---

## Status Configuration

### Centralized in `/frontend/src/constants/appointmentConfig.js`

```js
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled',
  ARCHIVED: 'archived'
};

export const APPOINTMENT_STATUS_CONFIG = {
  'scheduled': {
    color: '#3b82f6',
    bg: 'linear-gradient(...)',
    icon: 'schedule',
    label: 'Scheduled'
  },
  // ... other statuses
};
```

---

## Context Providers

### StatusProvider

Fetches and provides database-driven status configurations:
```jsx
<StatusProvider entityType="appointments">
  {/* children */}
</StatusProvider>
```

---

## API Integration

### Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /appointments` | List all appointments with filters |
| `GET /appointments/:id` | Get single appointment |
| `POST /appointments` | Create new appointment |
| `PUT /appointments/:id` | Update appointment |
| `DELETE /appointments/:id` | Delete appointment |
| `GET /appointments/manager` | AI Manager stats (Page 2) |
| `POST /appointments/:id/archive` | Archive appointment |

---

## Styling Conventions

### Color Theme

- **Primary**: Teal (#0891B2)
- **Gradient**: `#0e7490 → #0891b2 → #06b6d4`
- **Status Colors**: Defined in `APPOINTMENT_STATUS_COLORS`

### Common Patterns

```jsx
// Card background
background: 'linear-gradient(135deg, rgba(8,145,178,0.08) 0%, rgba(6,182,212,0.12) 100%)'

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
2. **Constants Centralized**: Moved from `constants/appointmentConstants.js` to `/frontend/src/constants/appointmentConfig.js`
3. **HeroComponent Prop**: Added to DashboardTemplate call
4. **StatusProvider Added**: Wraps dashboard for status context
5. **List/Table Components**: Added to DashboardTemplate props

### Breaking Changes

- Import path for appointment constants changed
- HeroComponent is now required for full functionality

---

**Last Updated:** December 2024
**Maintainer:** Development Team
