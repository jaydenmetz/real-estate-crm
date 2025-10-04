# Widget Template System

**Purpose:** Standardized, reusable card/widget components across all CRM modules
**Created:** October 4, 2025
**Last Updated:** October 4, 2025
**Status:** ✅ Production Standard
**Reference Implementation:** Escrows Module

⚠️ **IMPORTANT:** This document is aligned with [DATA_FLOW_ARCHITECTURE.md](DATA_FLOW_ARCHITECTURE.md). All widgets must follow this standard.

---

## Overview

This system defines **three widget sizes** that display database items (escrows, listings, clients, appointments, leads) with progressively more detail. All widgets are **exactly 320px tall** for visual consistency.

### Design Philosophy

1. **Progressive Disclosure** - Small → Medium → Large shows increasingly more data
2. **Consistent Height** - All widgets are exactly **320px tall**
3. **Same Data Source** - All sizes use the **same API endpoint**
4. **Different Parsing** - Widgets parse identical data differently based on display capacity
5. **Professional Loading** - Skeleton components with wave animations
6. **Action-Oriented** - Click entire card to navigate to detail page

---

## Widget Size Specifications

### ✅ Small Widget (Grid View)

**Dimensions:** 320px × 320px (square card)
**Layout:** 4 cards per row at desktop (1440px+)
**Grid:** `Grid item xs={12} sm={6} md={4} lg={3}`
**Use Case:** Quick overview, scanning many items at once

**Structure:**
```
┌─────────────────────────────────┐
│ ┌───────────────────────────┐   │
│ │                           │   │ 140px
│ │   Property Image          │   │ Image
│ │   (or default icon)       │   │
│ │                           │   │
│ │  [Status]   [Progress]    │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ Street Address (Bold)           │
│ City or Client Name             │
│                                 │
│ ┌───────┐ ┌───────┐            │ 2x2
│ │ Price │ │ Close │            │ Metrics
│ └───────┘ └───────┘            │ Grid
│ ┌───────┐ ┌───────┐            │
│ │ Comm. │ │ Days  │            │
│ └───────┘ └───────┘            │
│                                 │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │ Company
│ │ES│ │LD│ │TL│ │NH│           │ Logos
│ └──┘ └──┘ └──┘ └──┘           │ (1x4)
└─────────────────────────────────┘
```

**Data Points (8-10):**
- Property image (140px height)
- Status chip
- Progress badge
- Street address
- City or client name
- Purchase price
- Close date
- Commission
- Days to close
- 4 company logos

---

### ✅ Medium Widget (Horizontal Card)

**Dimensions:** 320px height × flexible width
**Layout:** Horizontal with image on left
**Grid:** `Grid item xs={12} md={6}`
**Use Case:** Moderate detail, comparison between items

**Structure:**
```
┌────────────┬────────────────────────────────────────┐
│            │ Street Address (Bold)                  │
│            │ City, State                            │
│  Property  │                                        │
│  Image     │ ┌──────┐ ┌──────┐ ┌──────┐           │
│  280px     │ │Price │ │Close │ │Days  │           │
│  wide      │ └──────┘ └──────┘ └──────┘           │
│            │                                        │
│  [Status]  │ ──────────────────────────────        │
│            │                                        │
│  Progress  │ Commission:    $6,625                 │
│  Bar       │ Loan Amount:   $212K                  │
│            │ EMD:           $5,000                  │
│            │ Down Payment:  $53K                   │
│            │                                        │
│            │ ┌──────────────┐ ┌──────────────┐    │
│            │ │🏦 Escrow Co. │ │💰 Lender     │    │
│            │ └──────────────┘ └──────────────┘    │
└────────────┴────────────────────────────────────────┘
```

**Data Points (11-13):**
- Property image (280px × 320px)
- Status chip
- Progress bar
- Street address
- City, State
- Purchase price
- Close date
- Days to close
- Commission
- Loan amount
- Earnest money
- Down payment
- 2 company boxes

---

### ✅ Large Widget (Full Width Card)

**Dimensions:** 320px height × full container width
**Layout:** Horizontal with maximum information density
**Grid:** `Grid item xs={12}` (one per row)
**Use Case:** Complete detail view

**Structure:**
```
┌─────────────┬──────────────────────────────────────────────────────────────┐
│             │ Full Address (Street, City, State ZIP)                      │
│             │                                                              │
│  Property   │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│  Image      │ │Price │ │Comm. │ │Close │ │Days  │                       │
│  360px      │ └──────┘ └──────┘ └──────┘ └──────┘                       │
│  wide       │                                                              │
│             │ ──────────────────────────────────────                      │
│  [Status]   │                                                              │
│             │ Loan:        $212K      Client:      John Doe               │
│  Animated   │ Down:        $53K       Escrow #:    ESC-755                │
│  Progress   │ EMD:         $5K        Open Date:   Aug 1, 2023            │
│  Bar        │                                                              │
│             │ ┌────────────┬────────────┬────────────┬────────────┐      │
│             │ │🏦 Escrow   │💰 Lender   │📋 Title    │🏘️ NHD      │      │
│             │ │Prominence  │Guild Mtg   │First Am.   │REOTRANS    │      │
│             │ └────────────┴────────────┴────────────┴────────────┘      │
└─────────────┴──────────────────────────────────────────────────────────────┘
```

**Data Points (16-20):**
- Property image (360px × 320px)
- Status chip
- Animated progress bar
- Full address
- Purchase price
- Commission
- Close date
- Days to close
- Loan amount
- Down payment
- Earnest money
- Client name
- Escrow number
- Open date
- 4 company sections

---

## Implementation Standards

### Required Features (All Widgets)

✅ **Consistent 320px Height**
✅ **Property Images with Default Icons**
✅ **Status Chips (Color-coded)**
✅ **Progress Indicators**
✅ **Smart Data Formatting**
✅ **Hover Effects**
✅ **Click to Navigate**
✅ **Skeleton Loading States**
✅ **Framer Motion Animations**

See [DATA_FLOW_ARCHITECTURE.md](DATA_FLOW_ARCHITECTURE.md) for complete implementation details.

---

**End of Widget Template System**
