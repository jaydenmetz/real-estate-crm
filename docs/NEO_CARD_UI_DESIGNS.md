# Neo-Card UI Designs - All Dashboards

Modern, high-impact card designs for all 5 database dashboards following consistent design principles.

## Design Principles

- **4px Status Accent Bar** - Left edge color coding
- **50% Visual Impact** - Large images or gradients at top
- **NO Truncation** - Full text display, multi-line if needed
- **Large Gradient Data Boxes** - Bold financial/key metrics
- **Floating Status Chips** - Overlay on image
- **Animated Progress Bars** - 6px height, gradient fill
- **Minimal Icons** - Only where essential
- **Bold Typography** - 800 weight for numbers

---

## 1. ESCROWS DASHBOARD - Neo Card

### Card Dimensions
- **Width**: 320px (fixed in grid mode)
- **Height**: Auto (min 380px)
- **Padding**: 0 (full bleed image)
- **Border Radius**: 16px
- **Shadow**: 0 8px 32px rgba(0,0,0,0.12)

### Visual Layout
```
┌─────────────────────────────────────────┐
│█│ ┌─────────────────────────────────┐   │ ← 4px ACCENT (green/orange/red by status)
│█│ │                                 │   │
│█│ │   🏠 Property Image 180px       │   │   MLS photo OR
│█│ │   or Status Gradient BG        │   │   Gradient: green→emerald (active)
│█│ │                                 │   │            orange→amber (pending)
│█│ │   [Active Under Contract]      │   │   Floating chip (top-right)
│█│ │   ████████░░ (85% complete)    │   │   6px progress bar (bottom)
│█│ └─────────────────────────────────┘   │
│█├─────────────────────────────────────┬─┤
│█│ 9081 Soledad Road                   │ │
│█│ Mojave, CA 93501                    │ │   NO truncation, full address
│█│                                     │ │   Font: 1rem, weight 600
│█│ ┌──────────────┐ ┌──────────────┐  │ │
│█│ │  SALE PRICE  │ │  MY COMMISSION│ │   2 large gradient boxes
│█│ │   $280,000   │ │    $2,800    │  │   Bold 800, no icons
│█│ │ (teal grad)  │ │  (purple)    │  │   50% width each, gap 8px
│█│ └──────────────┘ └──────────────┘  │ │
│█│                                     │ │
│█│ 👤 John & Sarah Smith              │ │   Client (icon + name)
│█│ 🏦 Chase Bank (Lender)             │ │   Lender (icon + name)
│█│                                     │ │
│█│ COE: Apr 12, 2025    ┌──────────┐  │ │
│█│                      │   23d    │  │   Days remaining badge
│█│                      │ (gradient)│  │   Orange→red gradient
│█│                      └──────────┘  │ │
│█│                                     │ │
│█│ ┌─────┐┌─────┐┌─────┐┌─────┐       │ │
│█│ │ 📋 ││ 💬 ││ 📎 ││ ⚡ │       │ │   Quick action icons
│█│ │ 3  ││ 5  ││ 2  ││    │       │   Task/Comments/Docs/Priority
│█│ └─────┘└─────┘└─────┘└─────┘       │ │
└─────────────────────────────────────────┘
```

### Status Accent Colors
- **Active Under Contract**: `#10b981` (green-500)
- **Pending**: `#f59e0b` (amber-500)
- **Closed**: `#3b82f6` (blue-500)
- **Cancelled**: `#ef4444` (red-500)

### Gradient Boxes
- **Sale Price**: `linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)` (teal→cyan)
- **My Commission**: `linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)` (violet→indigo)

---

## 2. LISTINGS DASHBOARD - Neo Card

### Card Dimensions
- **Width**: 320px (fixed in grid mode)
- **Height**: Auto (min 400px)
- **Padding**: 0 (full bleed image)
- **Border Radius**: 16px
- **Shadow**: 0 8px 32px rgba(0,0,0,0.12)

### Visual Layout
```
┌─────────────────────────────────────────┐
│█│ ┌─────────────────────────────────┐   │ ← 4px ACCENT (blue/green/gray by status)
│█│ │                                 │   │
│█│ │   🏠 Listing Photo 200px        │   │   MLS professional photo OR
│█│ │   (with virtual tour badge)    │   │   Property gradient background
│█│ │                                 │   │
│█│ │   [Active - 45 DOM]            │   │   Status + Days on Market chip
│█│ │   ██████████ (Virtual Tour)    │   │   Feature badges at bottom
│█│ └─────────────────────────────────┘   │
│█├─────────────────────────────────────┬─┤
│█│ 742 Morning Sun Drive               │ │
│█│ Tehachapi, CA 93561                 │ │   Full address, 2 lines
│█│                                     │ │   Font: 1rem, weight 600
│█│ ┌──────────────┐ ┌──────────────┐  │ │
│█│ │  LIST PRICE  │ │  PRICE/SQFT  │  │   2 large gradient boxes
│█│ │   $485,000   │ │    $185      │  │   Bold 800, no icons
│█│ │ (blue grad)  │ │  (green)     │  │   50% width each
│█│ └──────────────┘ └──────────────┘  │ │
│█│                                     │ │
│█│ 🛏️  4bd  │  🛁 2.5ba  │  📐 2,620 sf│   Property specs (inline)
│█│                                     │ │
│█│ MLS: 25-0042      ┌──────────────┐ │ │
│█│                   │   45 Days    │  │   Days on Market badge
│█│                   │  on Market   │  │   Gradient by urgency
│█│                   └──────────────┘ │ │
│█│                                     │ │
│█│ ┌─────┐┌─────┐┌─────┐┌─────┐       │ │
│█│ │ 📷 ││ 🎥 ││ 🚁 ││ 👁️ │       │ │   Media badges
│█│ │ 24 ││ ✓  ││ ✓  ││ 89 │       │ │   Photos/Video/Drone/Views
│█│ └─────┘└─────┘└─────┘└─────┘       │ │
│█│                                     │ │
│█│ Next Showing: Tomorrow 2pm          │ │   Upcoming event
└─────────────────────────────────────────┘
```

### Status Accent Colors
- **Active**: `#3b82f6` (blue-500)
- **Pending**: `#f59e0b` (amber-500)
- **Sold**: `#10b981` (green-500)
- **Expired**: `#6b7280` (gray-500)

### Gradient Boxes
- **List Price**: `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)` (blue→blue-600)
- **Price/SqFt**: `linear-gradient(135deg, #10b981 0%, #059669 100%)` (green→green-600)

---

## 3. CLIENTS DASHBOARD - Neo Card

### Card Dimensions
- **Width**: 320px (fixed in grid mode)
- **Height**: Auto (min 360px)
- **Padding**: 16px (no image)
- **Border Radius**: 16px
- **Shadow**: 0 8px 32px rgba(0,0,0,0.12)

### Visual Layout
```
┌─────────────────────────────────────────┐
│█│ ┌─────────────────────────────────┐   │ ← 4px ACCENT (purple/blue/green by type)
│█│ │                                 │   │
│█│ │   ┌───────┐                     │   │
│█│ │   │  JS   │  John Smith         │   │   Initials avatar (gradient bg)
│█│ │   └───────┘  Buyer              │   │   80px circle, 2rem initials
│█│ │                                 │   │
│█│ │   [Active Client]               │   │   Status chip
│█│ │   ████████░░ (4/5 stages)      │   │   Client journey progress
│█│ └─────────────────────────────────┘   │
│█├─────────────────────────────────────┬─┤
│█│ john.smith@email.com                │ │
│█│ (805) 555-0123                      │ │   Contact info (2 lines)
│█│                                     │ │   Font: 0.9rem
│█│ ┌──────────────┐ ┌──────────────┐  │ │
│█│ │TOTAL VALUE   │ │ TRANSACTIONS │  │   2 large gradient boxes
│█│ │  $1,250,000  │ │      3       │  │   Bold 800, no icons
│█│ │(purple grad) │ │   (teal)     │  │   50% width each
│█│ └──────────────┘ └──────────────┘  │ │
│█│                                     │ │
│█│ 🏷️  First-Time Buyer, Pre-Approved │   Tags (inline chips)
│█│                                     │ │
│█│ Last Contact: 2 days ago            │ │
│█│ Next: Follow-up Call (Mar 15)      │ │   Timeline info
│█│                                     │ │
│█│ ┌─────┐┌─────┐┌─────┐┌─────┐       │ │
│█│ │ 📧 ││ 📞 ││ 💬 ││ 📅 │       │ │   Quick actions
│█│ │Email││Call ││Text ││Appt│       │ │   Communication shortcuts
│█│ └─────┘└─────┘└─────┘└─────┘       │ │
└─────────────────────────────────────────┘
```

### Status Accent Colors
- **Active Client**: `#8b5cf6` (violet-500)
- **Lead**: `#3b82f6` (blue-500)
- **Past Client**: `#10b981` (green-500)
- **Inactive**: `#6b7280` (gray-500)

### Gradient Boxes
- **Total Value**: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)` (violet→violet-600)
- **Transactions**: `linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)` (teal→teal-600)

### Avatar Gradient
- `linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)` (violet→indigo)

---

## 4. APPOINTMENTS DASHBOARD - Neo Card

### Card Dimensions
- **Width**: 320px (fixed in grid mode)
- **Height**: Auto (min 340px)
- **Padding**: 0 (gradient header)
- **Border Radius**: 16px
- **Shadow**: 0 8px 32px rgba(0,0,0,0.12)

### Visual Layout
```
┌─────────────────────────────────────────┐
│█│ ┌─────────────────────────────────┐   │ ← 4px ACCENT (blue/green/gray by status)
│█│ │                                 │   │
│█│ │   📅 TIME GRADIENT BG 140px     │   │   Time-based gradient
│█│ │                                 │   │   Morning: orange→yellow
│█│ │      TUE, MAR 15                │   │   Afternoon: blue→cyan
│█│ │       2:00 PM                   │   │   Evening: purple→pink
│█│ │                                 │   │
│█│ │   [Property Showing]            │   │   Appointment type chip
│█│ └─────────────────────────────────┘   │
│█├─────────────────────────────────────┬─┤
│█│ 👤 John & Sarah Smith               │ │
│█│ 🏠 742 Morning Sun Dr, Tehachapi   │ │   Client + Location (2 lines)
│█│                                     │ │   Font: 0.95rem, weight 500
│█│ ┌──────────────┐ ┌──────────────┐  │ │
│█│ │   DURATION   │ │    STATUS    │  │   2 large gradient boxes
│█│ │   60 min     │ │  Confirmed   │  │   Bold 700
│█│ │ (blue grad)  │ │  (green)     │  │   50% width each
│█│ └──────────────┘ └──────────────┘  │ │
│█│                                     │ │
│█│ 📝 Notes: First showing, bring    │ │
│█│    comparable sales data           │ │   Preview of notes (2 lines max)
│█│                                     │ │
│█│ ⏰ In 2 hours        ┌──────────┐  │ │
│█│                      │   Add to │  │   Time until + Calendar button
│█│                      │ Calendar │  │   Gradient background
│█│                      └──────────┘  │ │
│█│                                     │ │
│█│ ┌─────┐┌─────┐┌─────┐┌─────┐       │ │
│█│ │ ✏️  ││ 📞 ││ ✅ ││ ❌ │       │ │   Quick actions
│█│ │Edit ││Call ││Done││Cancel│       │ │   Appointment management
│█│ └─────┘└─────┘└─────┘└─────┘       │ │
└─────────────────────────────────────────┘
```

### Status Accent Colors
- **Scheduled**: `#3b82f6` (blue-500)
- **Confirmed**: `#10b981` (green-500)
- **Completed**: `#6b7280` (gray-500)
- **Cancelled**: `#ef4444` (red-500)

### Time-Based Header Gradients
- **Morning (6am-12pm)**: `linear-gradient(135deg, #f97316 0%, #fbbf24 100%)` (orange→yellow)
- **Afternoon (12pm-5pm)**: `linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)` (blue→cyan)
- **Evening (5pm-9pm)**: `linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)` (purple→pink)

### Gradient Boxes
- **Duration**: `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)` (blue→blue-600)
- **Status**: `linear-gradient(135deg, #10b981 0%, #059669 100%)` (green→green-600)

---

## 5. LEADS DASHBOARD - Neo Card

### Card Dimensions
- **Width**: 320px (fixed in grid mode)
- **Height**: Auto (min 380px)
- **Padding**: 0 (gradient header)
- **Border Radius**: 16px
- **Shadow**: 0 8px 32px rgba(0,0,0,0.12)

### Visual Layout
```
┌─────────────────────────────────────────┐
│█│ ┌─────────────────────────────────┐   │ ← 4px ACCENT (gradient by lead score)
│█│ │                                 │   │
│█│ │   SCORE GRADIENT BG 160px       │   │   Score-based gradient
│█│ │                                 │   │   0-30: red→orange (cold)
│█│ │      ┌─────────┐                │   │   31-70: yellow→blue (warm)
│█│ │      │   85    │                │   │   71-100: green→emerald (hot)
│█│ │      │  /100   │                │   │
│█│ │      └─────────┘                │   │   Large score display
│█│ │                                 │   │
│█│ │   [Hot Lead]                    │   │   Lead temperature chip
│█│ │   ████████░░ (Qualification)   │   │   Journey progress bar
│█│ └─────────────────────────────────┘   │
│█├─────────────────────────────────────┬─┤
│█│ 👤 Jennifer Martinez                │ │
│█│ 📍 Interested in: Bakersfield      │ │   Name + Interest (2 lines)
│█│                                     │ │   Font: 1rem, weight 600
│█│ ┌──────────────┐ ┌──────────────┐  │ │
│█│ │LEAD SOURCE   │ │   BUDGET     │  │   2 large gradient boxes
│█│ │   Zillow     │ │  $400-500K   │  │   Bold 700
│█│ │ (purple)     │ │  (green)     │  │   50% width each
│█│ └──────────────┘ └──────────────┘  │ │
│█│                                     │ │
│█│ ✉️  jennifer.m@email.com            │ │
│█│ 📱 (661) 555-0198                   │ │   Contact info (2 lines)
│█│                                     │ │
│█│ 🏷️  First-Time Buyer, Pre-Approved │   Tags (inline)
│█│                                     │ │
│█│ Created: 3 days ago  ┌──────────┐  │ │
│█│ Last Contact: Today  │ Convert  │  │   Timeline + Convert button
│█│                      │to Client │  │   Prominent CTA
│█│                      └──────────┘  │ │
│█│                                     │ │
│█│ ┌─────┐┌─────┐┌─────┐┌─────┐       │ │
│█│ │ 📧 ││ 📞 ││ 💬 ││ 📋 │       │ │   Quick actions
│█│ │Email││Call ││Text ││Note│       │ │   Lead engagement
│█│ └─────┘└─────┘└─────┘└─────┘       │ │
└─────────────────────────────────────────┘
```

### Status Accent Colors (by Score)
- **Cold Lead (0-30)**: `#ef4444` (red-500) → `#f97316` (orange-500) gradient
- **Warm Lead (31-70)**: `#fbbf24` (yellow-400) → `#3b82f6` (blue-500) gradient
- **Hot Lead (71-100)**: `#10b981` (green-500) → `#059669` (green-600) gradient

### Header Gradient (by Score)
- **Cold (0-30)**: `linear-gradient(135deg, #ef4444 0%, #f97316 100%)` (red→orange)
- **Warm (31-70)**: `linear-gradient(135deg, #fbbf24 0%, #3b82f6 100%)` (yellow→blue)
- **Hot (71-100)**: `linear-gradient(135deg, #10b981 0%, #059669 100%)` (green→green-600)

### Gradient Boxes
- **Lead Source**: `linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)` (violet→indigo)
- **Budget**: `linear-gradient(135deg, #10b981 0%, #059669 100%)` (green→green-600)

---

## Shared Design Tokens

### Typography Scale
```javascript
{
  cardTitle: '1rem / 600',        // Address, Name
  cardSubtitle: '0.9rem / 500',   // Secondary info
  largeData: '1.5rem / 800',      // Price, Score, Numbers
  body: '0.875rem / 400',         // Description text
  caption: '0.75rem / 500',       // Labels, hints
}
```

### Spacing System
```javascript
{
  cardPadding: '16px',
  sectionGap: '12px',
  elementGap: '8px',
  chipGap: '6px',
}
```

### Animation Tokens
```javascript
{
  progressBar: {
    height: '6px',
    animationDuration: '2s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  cardHover: {
    transform: 'translateY(-8px) scale(1.02)',
    duration: '0.3s',
    shadow: '0 20px 40px rgba(0,0,0,0.15)',
  },
  countUp: {
    duration: '2.5s',
    easing: 'easeOut',
  }
}
```

### Border Radius System
```javascript
{
  card: '16px',
  dataBox: '12px',
  chip: '20px',
  avatar: '50%',
  progressBar: '3px',
}
```

### Shadow System
```javascript
{
  cardDefault: '0 8px 32px rgba(0,0,0,0.12)',
  cardHover: '0 20px 40px rgba(0,0,0,0.15)',
  dataBox: '0 4px 12px rgba(0,0,0,0.08)',
  floating: '0 12px 24px rgba(0,0,0,0.1)',
}
```

---

## Implementation Priority

### Phase 1 (Week 1): Escrows & Listings
- Property image integration (MLS API)
- Status-based accent bars
- Large gradient data boxes
- Progress bars with animation

### Phase 2 (Week 2): Clients & Appointments
- Avatar generation system
- Time-based gradients
- Contact quick actions
- Calendar integration

### Phase 3 (Week 3): Leads & Polish
- Score-based gradient system
- Lead conversion flow
- Unified animation system
- Performance optimization

### Phase 4 (Week 4): Advanced Features
- Card stacking/expansion
- Drag-and-drop reordering
- Bulk actions
- Real-time updates

---

## Component Architecture

```javascript
// Shared base component
<NeoCard
  accentColor={statusColor}
  headerType="image|gradient|avatar|time"
  headerContent={...}
  dataBoxes={[
    { label: 'Price', value: '$280K', gradient: 'teal' },
    { label: 'Commission', value: '$2.8K', gradient: 'purple' }
  ]}
  actions={[
    { icon: '📋', label: 'Tasks', count: 3 },
    { icon: '💬', label: 'Comments', count: 5 }
  ]}
  onClick={handleClick}
/>
```

Each dashboard imports `NeoCard` and passes dashboard-specific props.

---

**Created**: October 6, 2025
**Version**: 1.0
**Status**: Ready for Implementation
