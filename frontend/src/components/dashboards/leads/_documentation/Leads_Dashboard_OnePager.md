# Leads Dashboard - Quick Reference

**Version 2.0** | December 2024

---

## Overview

The Leads Dashboard is a **config-driven dashboard** using `DashboardTemplate` with custom components for lead management. It follows the escrows dashboard architecture pattern.

---

## Key Files

| File | Purpose |
|------|---------|
| `index.jsx` | Dashboard entry point with StatusProvider and HeroComponent |
| `hero/LeadsHeroCarousel.jsx` | 2-page carousel with AI Lead Nurturing Manager |
| `hero/AIManagerModal.jsx` | Fullscreen upsell modal (green theme) |
| `hero/pages/AIManagerPage/` | Page 2 with React Query data fetching |
| `hero/pages/HomePage/AIManagerTeaser.jsx` | 300x300 clickable widget |
| `view-modes/card/LeadCard.jsx` | Grid view card component |
| `view-modes/list/LeadListItem.jsx` | List view component with avatar |
| `view-modes/table/LeadTableRow.jsx` | Table view row component |
| `/constants/leadConfig.js` | Centralized constants (status, sources, types, etc.) |

---

## Architecture

```
LeadsDashboard
├── StatusProvider (entityType="leads")
└── DashboardTemplate
    ├── config={leadsConfig}
    ├── CardComponent={LeadCard}
    ├── ListComponent={LeadListItem}
    ├── TableComponent={LeadTableRow}
    ├── NewItemModal={NewLeadModal}
    └── HeroComponent={LeadsHeroCarousel}
```

---

## Hero Carousel

**2 Pages:**
1. **Page 1**: Standard hero with stats + AI Lead Nurturing teaser widget
2. **Page 2**: AI Lead Nurturing Manager dashboard with detailed metrics

**Features:**
- Framer Motion animations
- Swipe support (react-swipeable)
- Keyboard navigation (arrow keys)
- Dot indicators

---

## Status Types

| Status | Color | Description |
|--------|-------|-------------|
| `new` | Blue #3b82f6 | Fresh opportunity |
| `contacted` | Purple #8b5cf6 | Initial contact made |
| `qualified` | Green #10b981 | Verified as qualified |
| `nurturing` | Amber #f59e0b | In nurture campaign |
| `converted` | Indigo #6366f1 | Converted to client |
| `unqualified` | Red #ef4444 | Not a fit |
| `dead` | Gray #6b7280 | Inactive/cold |
| `archived` | Light gray #9ca3af | Archived |

---

## Lead Sources

Website, Referral, Social Media, Zillow, Realtor.com, Trulia, Facebook, Instagram, Google Ads, Open House, Cold Call, Email Campaign, Networking, Walk-In, Other

---

## Lead Types

| Type | Label |
|------|-------|
| `buyer` | Buyer |
| `seller` | Seller |
| `both` | Buyer & Seller |
| `renter` | Renter |
| `investor` | Investor |

---

## Priority Levels

| Priority | Color | Contact Frequency |
|----------|-------|-------------------|
| `hot` | Red #ef4444 | Daily |
| `warm` | Amber #f59e0b | Every 3 days |
| `cold` | Blue #3b82f6 | Weekly |

---

## Color Theme

**Primary**: Green (#10b981)
**Gradient**: `#047857 → #10b981 → #34d399`

---

## Quick Links

- **Config**: `/frontend/src/config/entities/leads.config.js`
- **Constants**: `/frontend/src/constants/leadConfig.js`
- **API Service**: `/frontend/src/services/api.service.js`
- **In-Depth Docs**: `Leads_Dashboard_InDepth.md`

---

**Last Updated:** December 2024
