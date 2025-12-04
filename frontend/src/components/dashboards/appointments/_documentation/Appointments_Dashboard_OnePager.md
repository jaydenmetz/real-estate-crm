# Appointments Dashboard - Quick Reference

**Version 2.0** | December 2024

---

## Folder Structure (30 Files)

```
frontend/src/components/dashboards/appointments/
├── index.jsx                           # Dashboard entry point
├── hero/
│   ├── index.js                        # Barrel: exports stats + carousel + modal + teaser
│   ├── AppointmentsHeroCarousel.jsx    # 2-page carousel with animations
│   ├── AIManagerModal.jsx              # Fullscreen upsell modal
│   ├── stats/
│   │   ├── index.js
│   │   ├── TotalAppointmentsCard.jsx
│   │   ├── UpcomingAppointmentsCard.jsx
│   │   ├── CompletedThisMonthCard.jsx
│   │   └── MissedAppointmentsCard.jsx
│   └── pages/
│       ├── AIManagerPage/
│       │   ├── index.jsx               # Page 2 with React Query
│       │   └── AIManagerStatCard.jsx
│       └── HomePage/
│           └── AIManagerTeaser.jsx     # 300x300 clickable widget
├── navigation/
│   ├── index.js                        # Barrel: all nav configs
│   ├── tabs/
│   │   └── AppointmentStatusTabs.jsx   # Uses centralized config
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

## Status Categories (4 Tabs)

| Key | Label | Statuses | View |
|-----|-------|----------|------|
| Upcoming | Upcoming | `['scheduled', 'confirmed']` | Card |
| Completed | Completed | `['completed']` | List |
| Cancelled | Cancelled | `['cancelled', 'no_show', 'rescheduled']` | List |
| All | All Appointments | All statuses | Card |

**Config:** `config/statuses/statusCategories.js` → `APPOINTMENT_CATEGORIES`

---

## Stat Cards (4 per Tab = 16 Total)

| Component | Calculation |
|-----------|-------------|
| TotalAppointmentsCard | Count by status filter |
| UpcomingAppointmentsCard | Count scheduled for future |
| CompletedThisMonthCard | Count completed in current month |
| MissedAppointmentsCard | Count of no-shows/cancellations |

**Config Format:**
```js
{
  id: 'total_upcoming_appointments',
  component: TotalAppointmentsCard,
  props: { status: 'scheduled' },
  visibleWhen: ['Upcoming']  // Capitalized, array format
}
```

---

## Hero Carousel (2 Pages)

| Page | Content | Data Source |
|------|---------|-------------|
| 1 | Standard hero + stats + AI teaser | Props from DashboardTemplate |
| 2 | AI Manager dashboard | `/appointments/manager` via React Query |

**Features:** Framer Motion animations, swipe (react-swipeable), keyboard nav

---

## Navigation Exports

```js
// navigation/index.js
export * from './filters/AppointmentScopeFilter';
export * from './filters/AppointmentSortOptions';
export * from './filters/AppointmentViewModes';
export * from './tabs/AppointmentStatusTabs';
```

**Sort Options:** appointment_date, created_at, title, priority, status
**View Modes:** grid, list, table, calendar
**Scope:** user, team, broker (role-based)

---

## Editor Components (5)

| Editor | Purpose |
|--------|---------|
| EditAppointmentTitle | Title editing |
| EditAppointmentDate | Date picker |
| EditAppointmentTime | Time picker |
| EditAppointmentLocation | Location/address |
| EditAppointmentStatus | Status dropdown |

---

## Key Differences from Escrows

| Feature | Appointments | Escrows |
|---------|--------------|---------|
| PrivacyProvider | Not needed | Required |
| Status Field | `appointment_status` | `escrow_status` |
| Primary Field | `title` | `property_address` |
| Color Theme | Teal (#0891B2) | Blue (#1976d2) |
| AI Manager Stats | Confirmations, reminders, show rate | Deadlines, docs, compliance |

---

## Quick Implementation

```jsx
// index.jsx
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

---

## Dependencies

- `react-swipeable` - Touch/swipe gestures
- `framer-motion` - Page transitions
- `@tanstack/react-query` - AIManagerPage data fetching
- `@mui/material` - UI components

---

**Full Reference:** See `Appointments_Dashboard_InDepth.md`
