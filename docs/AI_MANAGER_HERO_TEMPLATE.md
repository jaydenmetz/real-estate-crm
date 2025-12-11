# AI Manager Hero Card Template

**Last Updated:** December 2025

This document describes the standardized AI Manager Hero Card template used across all 6 dashboards (escrows, clients, leads, appointments, listings, contacts).

---

## Overview

The AI Manager Hero Card is Page 2 of the dashboard hero carousel. It displays AI-powered monitoring stats, standardized workload KPIs, and configuration options for each entity type.

---

## Component Structure

```
AIManagerPage/
├── index.jsx           # Main component
└── AIManagerStatCard.jsx  # Entity-specific stat card
```

Each dashboard has its own AIManagerPage but shares the common `AIManagerQuickItems` component.

---

## Sections (Top to Bottom)

### 1. Header Row
- **Title**: "AI [Entity] Manager" (e.g., "AI Escrow Manager", "AI Contact Coach")
- **Date Filters**: 1 DAY | 1 MONTH | 1 YEAR | YTD
- Controls the time period for all stats

### 2. Entity-Specific Stat Cards (4 Cards)
These are UNIQUE per entity and show metrics relevant to that specific domain:

| Entity | Card 1 | Card 2 | Card 3 | Card 4 |
|--------|--------|--------|--------|--------|
| **Escrows** | AI-Managed (count) | Closing Soon (next 7 days) | Need Action (items) | On Track % |
| **Clients** | AI-Managed (count) | Need Contact (this week) | Agreements Expiring | Satisfaction Score % |
| **Leads** | AI-Managed (count) | Hot Leads (score >80) | Need Follow-up | Conversion Rate % |
| **Appointments** | AI-Managed (count) | Next 24h | Need Confirm | Show Rate % |
| **Listings** | AI-Managed (count) | Expiring Soon | Needs Update | Avg Days on Market |
| **Contacts** | Total Contacts | Needs Follow-up | Engagement % | Referral Potential |

### 3. Standardized Quick Items Row (AIManagerQuickItems)
**CRITICAL: This row is IDENTICAL across all 6 dashboards** to enable cross-entity comparison.

4 standardized KPIs measuring AI workload:

| Chip | Icon | Label | Purpose |
|------|------|-------|---------|
| Tasks Queued | 📋 | "X tasks queued" | Pending automated tasks |
| Reminders Scheduled | 📤 | "X reminders scheduled" | Upcoming automated reminders |
| Actions Today | ⚡ | "X actions today" | Actions AI will take today |
| Alerts for You | 🔔 | "X alerts for you" | Items requiring human attention |

**Why Standardized?**
- Enables comparison: "My leads AI is working harder (100 tasks) vs escrow AI (10 tasks)"
- Consistent UI/UX across all dashboards
- Single source of truth for AI workload metrics

### 4. Action Strip
Shows current AI status:
- Left: "Currently monitoring all [entities]" or "AI monitoring paused"
- Right: "Next: Daily summary at [TIME]"

### 5. Footer Buttons
- **Configure AI**: Opens AI configuration modal
- **View All Activity**: Opens activity log

---

## Data Structure

### API Endpoint
```
GET /v1/{entity}/manager?period={dateFilter}
```

### Response Format
```javascript
{
  data: {
    stats: {
      // Entity-specific stats (4 values)
      managed_count: number,
      // ... 3 more entity-specific fields
    },
    quick_items: {
      // STANDARDIZED across all entities
      tasks_queued: number,
      reminders_scheduled: number,
      actions_today: number,
      alerts_for_you: number,
    },
    ai_status: {
      is_active: boolean,
      monitoring_all: boolean,
      next_summary: string,  // e.g., "5 PM"
    }
  }
}
```

---

## Color Themes by Entity

Each AI Manager uses the entity's primary color:

| Entity | Gradient |
|--------|----------|
| Escrows | `#059669 → #10b981 → #34d399` (green) |
| Clients | `#7c3aed → #8b5cf6 → #a78bfa` (purple) |
| Leads | `#2563eb → #3b82f6 → #60a5fa` (blue) |
| Appointments | `#0e7490 → #0891b2 → #06b6d4` (cyan) |
| Listings | `#7c3aed → #8b5cf6 → #a78bfa` (purple) |
| Contacts | `#7b1fa2 → #9c27b0 → #ab47bc` (magenta) |

---

## Implementation Files

### Shared Component
- `frontend/src/components/common/ai/AIManagerQuickItems.jsx`

### Entity-Specific Pages
- `frontend/src/components/dashboards/escrows/hero/pages/AIManagerPage/index.jsx`
- `frontend/src/components/dashboards/clients/hero/pages/AIManagerPage/index.jsx`
- `frontend/src/components/dashboards/leads/hero/pages/AIManagerPage/index.jsx`
- `frontend/src/components/dashboards/appointments/hero/pages/AIManagerPage/index.jsx`
- `frontend/src/components/dashboards/listings/hero/pages/AIManagerPage/index.jsx`
- `frontend/src/components/dashboards/contacts/hero/pages/AIManagerPage/index.jsx`

---

## Adding AI Manager to a New Dashboard

1. Create `hero/pages/AIManagerPage/` directory
2. Copy structure from existing entity
3. Create entity-specific `AIManagerStatCard.jsx`
4. Customize `stats` object with 4 entity-relevant metrics
5. Use standardized `AIManagerQuickItems` component (DO NOT modify KPIs)
6. Implement backend endpoint: `GET /v1/{entity}/manager`
7. Return standardized `quick_items` structure

---

## Backend Implementation Notes

The `quick_items` values should be calculated based on:

- **tasks_queued**: Count of pending automated tasks for this entity
- **reminders_scheduled**: Count of reminders set to fire in the future
- **actions_today**: Count of automated actions scheduled for today
- **alerts_for_you**: Count of items flagged for human review/action

These should be real metrics from the AI task queue, not arbitrary numbers.
