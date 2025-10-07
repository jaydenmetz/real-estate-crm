# Database Dashboard Template

**Last Updated:** October 4, 2025
**Purpose:** Complete guide for transforming any database into a beautiful, functional dashboard with 3-tier widget system
**Status:** ⭐ Primary Reference - Use this for all new development
**Reference Implementation:** Escrows Module

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [System Overview](#system-overview)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Widget System (Small/Medium/Large)](#widget-system)
5. [Dashboard Page Structure](#dashboard-page-structure)
6. [Implementation Guide](#implementation-guide)
7. [Best Practices & Standards](#best-practices--standards)

---

## Design Philosophy

### Visual-First, Bold, Modern

**NO MORE:**
- ❌ Tiny icons with labels
- ❌ Boring white cards
- ❌ Cramped text
- ❌ Generic Material-UI defaults

**YES TO:**
- ✅ **LARGE, colorful gradient boxes** for key metrics
- ✅ **Full address displayed** - no truncation nightmares
- ✅ **Vibrant status colors** - gradients, not flat colors
- ✅ **Animated progress bars** - visual, not text
- ✅ **Status accent bars** - left edge color coding
- ✅ **Hover animations** - scale + glow effects
- ✅ **Larger images** - 160px height (50% of card)
- ✅ **Bold typography** - 800 weight for numbers

### Inspiration: Notion + Linear + Stripe Dashboard

Think **fintech app**, not enterprise CRUD. Every card should feel like a premium product.

---

## System Overview

### The Complete Pattern: Database → Beautiful UI

This template explains how to take **any database table** and create a **stunning, highly functional** dashboard with:

✅ **Single API endpoint** - All widgets use the same data source
✅ **3 widget sizes** - Progressive disclosure (small → medium → large)
✅ **Consistent 320px height** - All widgets are exactly 320px tall
✅ **Bold, modern design** - Gradient boxes, vibrant colors, large typography
✅ **Skeleton loading** - Smooth loading states for all views
✅ **Responsive layout** - Works on mobile, tablet, and desktop
✅ **Micro-interactions** - Hover scale, glow effects, smooth transitions

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                          │
│  Table: escrows (65 columns)                                    │
│  - id, property_address, purchase_price, commission, etc.       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js)                        │
│  GET /v1/escrows → Returns JSON array of all escrows           │
│  Authentication: JWT or API Key                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND DASHBOARD (React)                     │
│  EscrowsDashboard.jsx:                                          │
│  1. Fetches data ONCE on page load                             │
│  2. Passes same data to ALL widget sizes                       │
│  3. User toggles between small/medium/large views              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WIDGET COMPONENTS                            │
│  EscrowWidgetSmall.jsx   → Shows 8-10 key fields               │
│  EscrowWidgetMedium.jsx  → Shows 11-13 fields                  │
│  EscrowWidgetLarge.jsx   → Shows 16-20 fields                  │
│  All exactly 320px tall, parse same data differently           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

### 1. Database Layer (PostgreSQL)

**Example: Escrows Table**

```sql
-- 65 columns of rich data
escrows (
  id UUID PRIMARY KEY,
  display_id VARCHAR(50),       -- ESC-755
  property_address TEXT,         -- "21325 Arroyo Way, Tehachapi, CA"
  escrow_status VARCHAR(50),     -- "Closed"
  purchase_price DECIMAL(12,2),  -- 265000.00
  my_commission DECIMAL(12,2),   -- 6625.00
  closing_date DATE,             -- 2023-09-01
  escrow_company VARCHAR(255),   -- "Prominence Title"
  lender_name VARCHAR(255),      -- "Guild Mortgage"
  property_image_url TEXT,       -- Image URL or NULL
  checklist_progress INTEGER,    -- 0-100%
  -- ... 50+ more fields
)
```

### 2. Backend API Layer

**File:** `/backend/src/controllers/escrows.controller.js`

```javascript
// GET /v1/escrows
exports.getAllEscrows = async (req, res) => {
  try {
    const escrows = await pool.query(`
      SELECT * FROM escrows
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      escrows: escrows.rows,
      total: escrows.rows.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

**Key Points:**
- ✅ Single endpoint returns ALL data
- ✅ No separate APIs for small/medium/large views
- ✅ Authentication required (JWT or API Key)
- ✅ Standard response format

### 3. Frontend API Service

**File:** `/frontend/src/services/api.service.js`

```javascript
export const escrowsAPI = {
  getAll: (params) => apiInstance.get('/escrows', params),
  getById: (id) => apiInstance.get(`/escrows/${id}`),
  create: (data) => apiInstance.post('/escrows', data),
  update: (id, data) => apiInstance.put(`/escrows/${id}`, data),
  delete: (id) => apiInstance.delete(`/escrows/${id}`),
};
```

**Key Points:**
- ✅ All widgets use `escrowsAPI.getAll()`
- ✅ No widget-specific API methods
- ✅ Consistent authentication headers

### 4. Dashboard Component

**File:** `/frontend/src/components/dashboards/EscrowsDashboard.jsx`

```javascript
const EscrowsDashboard = () => {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('small'); // 'small' | 'medium' | 'large'

  // Fetch data ONCE on mount
  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      const response = await escrowsAPI.getAll();
      setEscrows(response.escrows || []);
    } catch (error) {
      console.error('Failed to fetch escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render based on view mode
  return (
    <Container>
      {/* Toggle buttons */}
      <ToggleButtonGroup value={viewMode} onChange={(e, v) => v && setViewMode(v)}>
        <ToggleButton value="small">Small</ToggleButton>
        <ToggleButton value="medium">Medium</ToggleButton>
        <ToggleButton value="large">Large</ToggleButton>
      </ToggleButtonGroup>

      {/* Small View: 4 per row */}
      {viewMode === 'small' && (
        <Grid container spacing={2}>
          {escrows.map((escrow, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={escrow.id}>
              <EscrowWidgetSmall escrow={escrow} index={idx} loading={loading} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Medium View: 2 per row */}
      {viewMode === 'medium' && (
        <Grid container spacing={2}>
          {escrows.map((escrow, idx) => (
            <Grid item xs={12} md={6} key={escrow.id}>
              <EscrowWidgetMedium escrow={escrow} index={idx} loading={loading} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Large View: 1 per row */}
      {viewMode === 'large' && (
        <Grid container spacing={2}>
          {escrows.map((escrow, idx) => (
            <Grid item xs={12} key={escrow.id}>
              <EscrowWidgetLarge escrow={escrow} index={idx} loading={loading} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
```

**Key Points:**
- ✅ Fetches data once, passes to all widgets
- ✅ Same `escrow` object passed to all widget sizes
- ✅ `loading` prop enables skeleton states
- ✅ View mode toggle switches layouts

---

## Widget System

### Design Philosophy

**Progressive Disclosure:** Show more data as widget size increases

- **Small (320×320px):** Quick overview - 8-10 key fields
- **Medium (320px height):** Moderate detail - 11-13 fields
- **Large (320px height):** Maximum detail - 16-20 fields

**Consistent Height:** All widgets are **exactly 320px tall** for visual consistency

**Same Data Source:** All widgets receive identical data, parse it differently

### Small Widget (Grid View)

**Dimensions:** 320px × 320px (square card)
**Layout:** 4 cards per row at desktop
**Grid:** `xs={12} sm={6} md={4} lg={3}`
**Use Case:** Quick scanning of many items

**NEW DESIGN - Visual-First Approach:**
```
┌─────────────────────────────────┐
│█│ ┌───────────────────────┐     │ ← 4px STATUS ACCENT BAR (left edge)
│█│ │                       │     │
│█│ │   LARGE Image 160px   │     │   50% of card = visual impact
│█│ │   or GRADIENT bg      │     │   Status gradient if no image
│█│ │   [FLOATING CHIP]     │     │
│█│ │   ████░░░░ (6px bar)  │     │   Animated progress bar
│█│ └───────────────────────┘     │
│█├───────────────────────────────┤
│█│ FULL ADDRESS (2 lines)        │   NO truncation
│█│ 9081 Soledad Road, Mojave     │   Larger font (1rem)
│█│                               │
│█│ ┌─────────────┐┌────────────┐│
│█│ │   PRICE     ││ COMMISSION ││   2 LARGE gradient boxes
│█│ │   $280K     ││   $2.8K    ││   No icons, just data
│█│ │ (gradient)  ││ (gradient) ││   Bold 800 weight
│█│ └─────────────┘└────────────┘│
│█│                               │
│█│ Closes: Apr 12    ┌────────┐ │
│█│                   │  23d   │ │   Days badge with gradient
│█│                   └────────┘ │
└─────────────────────────────────┘
```

**KEY DESIGN ELEMENTS:**

1. **Status Accent Bar (4px left edge)**
   - Full height gradient matching status color
   - Visual categorization without reading

2. **Large Image (160px = 50% of card)**
   - Property image or status-colored gradient with icon
   - Bottom progress bar overlay (6px)
   - Floating status chip (top right)

3. **Full Address (2 lines, 1rem)**
   - NO street/city split
   - Display complete address
   - WebKit line clamp for overflow

4. **2 LARGE Metric Boxes (not 4 tiny boxes)**
   - Price + Commission only
   - Gradient backgrounds (green for price, purple for commission)
   - Bold 800 weight numbers
   - No icons - just labels + values

5. **Footer with Close Date + Days Badge**
   - Close date on left
   - Days remaining in gradient badge (right)
   - Color coded: Red (late), Orange (urgent <7d), Blue (normal)

**Code Example:**

```javascript
const EscrowWidgetSmall = ({ escrow, index = 0, loading = false }) => {
  if (loading) return <EscrowWidgetSmallSkeleton />;

  // Parse data (same object as medium/large, different fields)
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
  const commission = parseFloat(escrow.myCommission) || 0;
  const checklistProgress = parseInt(escrow.checklistProgress) || 0;
  const propertyImage = escrow.propertyImageUrl || escrow.zillowImageUrl;

  // Parse address
  const addressParts = escrow.propertyAddress?.split(',') || [];
  const street = addressParts[0] || 'No Address';
  const city = addressParts[1]?.trim() || '';

  // Calculate days to close
  const daysToClose = escrow.closingDate
    ? Math.ceil((new Date(escrow.closingDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card
      sx={{
        height: 320, // EXACTLY 320px
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
        },
      }}
      onClick={() => navigate(`/escrows/${escrow.id}`)}
    >
      {/* Property Image - 140px */}
      <Box
        sx={{
          height: 140,
          position: 'relative',
          background: propertyImage
            ? `url(${propertyImage}) center/cover`
            : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!propertyImage && (
          <Home sx={{ fontSize: 64, color: alpha(grey[500], 0.5) }} />
        )}

        {/* Status Chip */}
        <Chip
          label={escrow.escrowStatus}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'rgba(255,255,255,0.9)',
          }}
        />

        {/* Progress Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          {checklistProgress}% Complete
        </Box>
      </Box>

      {/* Content - 180px */}
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 600, mb: 0.5 }}>
          {street}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
          {city || escrow.clientName || 'Client TBD'}
        </Typography>

        {/* 2×2 Metrics Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Price</Typography>
            <Typography variant="body2" fontWeight={600}>
              ${(purchasePrice / 1000).toFixed(0)}K
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Close</Typography>
            <Typography variant="body2" fontWeight={600}>
              {escrow.closingDate ? format(new Date(escrow.closingDate), 'MMM d') : 'TBD'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Commission</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">
              ${(commission / 1000).toFixed(1)}K
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Days</Typography>
            <Typography variant="body2" fontWeight={600}>
              {daysToClose !== null ? `${daysToClose}d` : 'TBD'}
            </Typography>
          </Box>
        </Box>

        {/* Company Logos (1×4 Grid) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
          {[
            { label: 'ESC', name: escrow.escrowCompany },
            { label: 'LDR', name: escrow.lenderName },
            { label: 'TTL', name: escrow.titleCompany },
            { label: 'NHD', name: escrow.nhdCompany },
          ].map((company) => (
            <Tooltip key={company.label} title={company.name || 'TBD'}>
              <Box
                sx={{
                  bgcolor: company.name ? 'primary.main' : grey[300],
                  color: company.name ? 'white' : grey[600],
                  p: 0.5,
                  textAlign: 'center',
                  borderRadius: 0.5,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                }}
              >
                {company.label}
              </Box>
            </Tooltip>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// Skeleton Loading Component
const EscrowWidgetSmallSkeleton = () => (
  <Card sx={{ height: 320 }}>
    <Skeleton variant="rectangular" height={140} animation="wave" />
    <CardContent sx={{ p: 2 }}>
      <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={18} sx={{ mb: 2 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={40} />
      </Box>
      <Skeleton variant="rectangular" height={28} />
    </CardContent>
  </Card>
);
```

**Data Points Displayed (8-10):**
1. Property image (or grey house icon)
2. Status chip
3. Progress badge
4. Street address
5. City/client name
6. Purchase price
7. Close date
8. Commission
9. Days to close
10. 4 company logos

---

### Medium Widget (Horizontal Card)

**Dimensions:** 320px height × flexible width
**Layout:** Horizontal with image on left
**Grid:** `xs={12} md={6}`
**Use Case:** Moderate detail for comparison

**NEW DESIGN - Visual-First Approach:**
```
┌──┬──────────────────┬──────────────────────────────────────┐
│█ │                  │ FULL ADDRESS (2 lines)               │
│█ │  LARGE Image     │ 9081 Soledad Road, Mojave            │
│█ │  280px wide      │                                      │
│█ │  320px tall      │ ┌──────┐ ┌──────┐ ┌──────┐         │ ← 4px STATUS
│█ │                  │ │PRICE │ │COMM. │ │DAYS  │         │   ACCENT BAR
│█ │  [STATUS CHIP]   │ │$280K │ │$2.8K │ │ 23d  │         │
│█ │                  │ └──────┘ └──────┘ └──────┘         │   3 LARGE
│█ │                  │ (gradient)(gradient)(gradient)       │   gradient
│█ │  ████░░░ 8px     │                                      │   boxes
│█ │  Progress Bar    │ Loan:         $212K                 │
│█ │  with glow       │ Down Payment: $53K                  │   2×2 grid
│█ │                  │ EMD:          $5,000                │   financial
│█ │  75%             │ Close Date:   Apr 12, 25            │   details
│█ │                  │                                      │
│█ │                  │ ────────────────────────────────    │
│█ │                  │ Escrow: Prominence  Lender: Guild   │   Footer
└──┴──────────────────┴──────────────────────────────────────┘
```

**KEY DESIGN ELEMENTS:**

1. **Status Accent Bar (4px left edge)**
   - Same as Small widget
   - Full height gradient

2. **Large Image (280px × 320px)**
   - 8px progress bar at bottom (vs 6px in Small)
   - Status chip floating top right
   - Progress percentage bottom left

3. **Full Address (2 lines, 1.1rem)**
   - Same full address display as Small
   - No truncation

4. **3 LARGE Metric Boxes (vs 2 in Small)**
   - Price + Commission + Days
   - All with gradient backgrounds
   - Hover scale animation

5. **2×2 Financial Details Grid**
   - Loan Amount, Down Payment, EMD, Close Date
   - Plain text labels, no icons

6. **Footer: 2 Companies**
   - Escrow Company + Lender
   - Bordered top divider

**Key Differences from Small:**
- Image on LEFT (280px × 320px) instead of top
- Horizontal layout, not vertical
- 3 metric boxes vs 2
- Shows 12 fields vs 8
- Includes loan details (loan amount, EMD, down payment)

**Data Points Displayed (11-13):**
1. Property image (280px × 320px)
2. Status chip
3. Progress bar
4. Full address
5. Purchase price
6. Close date
7. Days to close
8. Commission
9. Loan amount
10. Earnest money
11. Down payment
12. Escrow company
13. Lender

---

### Large Widget (Full Width Card)

**Dimensions:** 320px height × full container width
**Layout:** Horizontal with maximum info density
**Grid:** `xs={12}` (one per row)
**Use Case:** Complete detail view without clicking

**NEW DESIGN - Maximum Detail:**
```
┌──┬─────────────────────┬────────────────────────────────────────────────────────┐
│█ │                     │ FULL ADDRESS (2 lines, 1.2rem bold)                   │
│█ │  LARGE Image        │ 9081 Soledad Road, Mojave                             │
│█ │  360px wide         │                                                        │
│█ │  320px tall         │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │ ← 4px STATUS
│█ │                     │ │PRICE │ │COMM. │ │GROSS │ │DAYS  │                 │   ACCENT BAR
│█ │                     │ │$280K │ │$2.8K │ │$8.4K │ │ 23d  │                 │
│█ │  [STATUS CHIP]      │ └──────┘ └──────┘ └──────┘ └──────┘                 │   4 LARGE
│█ │                     │ (gradient)(gradient)(gradient)(gradient)               │   gradient
│█ │  ████████░░ 10px    │                                                        │   boxes
│█ │  Progress Bar       │ Loan:       $212K     Comm %:    2.5%                │
│█ │  with glow          │ Down:       $53K      Close:     Apr 12, 25          │   3×2 grid
│█ │                     │ EMD:        $5,000    Escrow #:  ESC-755             │   financial
│█ │  75%                │                                                        │   details
│█ │                     │ ──────────────────────────────────────────────────── │
│█ │                     │ Escrow: Prominence │ Lender: Guild │ Title │ NHD    │   4 companies
└──┴─────────────────────┴────────────────────────────────────────────────────────┘
```

**KEY DESIGN ELEMENTS:**

1. **Status Accent Bar (4px left edge)**
   - Same as Small/Medium widgets
   - Full height gradient

2. **Large Image (360px × 320px)**
   - 10px progress bar at bottom (vs 6px Small, 8px Medium)
   - Thicker glow effect on progress bar
   - Status chip floating top right
   - Progress percentage bottom left (16px font)

3. **Full Address (2 lines, 1.2rem)**
   - Larger font than Medium (1.2rem vs 1.1rem)
   - Full address display

4. **4 LARGE Metric Boxes (vs 3 in Medium)**
   - Price + Commission + Gross Commission + Days
   - Added Gross Commission (purple gradient)
   - All with gradient backgrounds
   - Hover scale animation

5. **3×2 Financial Details Grid (vs 2×2 in Medium)**
   - Loan Amount, Down Payment, EMD
   - Commission %, Close Date, Escrow #
   - More data than Medium

6. **Footer: 4 Companies (vs 2 in Medium)**
   - Escrow + Lender + Title + NHD
   - All major parties visible
   - Bordered top divider

**Key Differences from Medium:**
- Image 360px wide (vs 280px)
- 4 metric boxes vs 3
- Shows 18 fields vs 12
- Includes Gross Commission, Commission %, Escrow #
- Shows all 4 companies (Escrow, Lender, Title, NHD)

**Data Points Displayed (16-20):**
1. Property image (360px × 320px)
2. Status chip
3. Animated progress bar
4. Full address (street + city/state/zip)
5. Purchase price
6. Commission
7. Close date
8. Days to close
9. Loan amount
10. Down payment
11. Earnest money
12. Client name
13. Escrow number
14. Open date
15. Escrow company (with name)
16. Lender (with name)
17. Title company (with name)
18. NHD company (with name)

---

## Dashboard Page Structure

Every dashboard follows this exact 8-section structure:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DEBUG PANEL (Admin Only)                                  │
│    Collapsible network monitor & data inspector             │
├─────────────────────────────────────────────────────────────┤
│ 2. HERO SECTION                                              │
│    Gradient background • 4 stat cards • Action buttons      │
├─────────────────────────────────────────────────────────────┤
│ 3. CHARTS ROW                                                │
│    Weekly/Monthly chart (8 cols) • Pie chart (4 cols)      │
├─────────────────────────────────────────────────────────────┤
│ 4. FILTERS & SEARCH                                          │
│    Search bar • Sort • View toggle • Advanced filters       │
├─────────────────────────────────────────────────────────────┤
│ 5. TABS                                                       │
│    All / Status filters with counts                         │
├─────────────────────────────────────────────────────────────┤
│ 6. CONTENT AREA (Widget Views)                              │
│    Small: 4/row • Medium: 2/row • Large: 1/row             │
├─────────────────────────────────────────────────────────────┤
│ 7. SPEED DIAL (Bottom Right)                                 │
│    Floating action button with quick actions                │
└─────────────────────────────────────────────────────────────┘
```

### Complete Dashboard Template

See `/frontend/src/components/dashboards/EscrowsDashboard.jsx` for the reference implementation.

---

## Implementation Guide

### Step-by-Step: New Module (Listings Example)

#### 1. Backend API (Usually Already Exists)

```javascript
// /backend/src/controllers/listings.controller.js
exports.getAllListings = async (req, res) => {
  try {
    const listings = await pool.query(`
      SELECT * FROM listings
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      listings: listings.rows,
      total: listings.rows.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

#### 2. Frontend API Service

```javascript
// /frontend/src/services/api.service.js
export const listingsAPI = {
  getAll: (params) => apiInstance.get('/listings', params),
  getById: (id) => apiInstance.get(`/listings/${id}`),
  create: (data) => apiInstance.post('/listings', data),
  update: (id, data) => apiInstance.put(`/listings/${id}`, data),
  delete: (id) => apiInstance.delete(`/listings/${id}`),
};
```

#### 3. Dashboard Component

```javascript
// /frontend/src/components/dashboards/ListingsDashboard.jsx
const ListingsDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('small');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getAll();
      setListings(response.listings || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... same structure as Escrows
  );
};
```

#### 4. Widget Components

Create 3 files:
- `ListingWidgetSmall.jsx` (320×320px, 8-10 fields)
- `ListingWidgetMedium.jsx` (320px height, 11-13 fields)
- `ListingWidgetLarge.jsx` (320px height, 16-20 fields)

**Checklist for Each Widget:**
- [ ] Exactly 320px tall
- [ ] Property image with default icon
- [ ] Status chip
- [ ] Progress indicator
- [ ] Hover effect (translateY + boxShadow)
- [ ] Click to navigate
- [ ] Skeleton loading component
- [ ] Parse same data, show different amounts

---

## Best Practices & Standards

### ✅ DO:

1. **Single API Endpoint**
   - All widget sizes use the same API call
   - Dashboard fetches once, passes to all widgets

2. **Consistent 320px Height**
   - Never deviate from 320px height
   - Use `sx={{ height: 320 }}` explicitly

3. **Progressive Disclosure**
   - Small: 8-10 key fields
   - Medium: 11-13 fields
   - Large: 16-20 fields

4. **Skeleton Loading**
   - Every widget has matching skeleton component
   - Use MUI Skeleton with `animation="wave"`

5. **Smart Formatting**
   - Currency: `${(value / 1000).toFixed(0)}K` or `${(value / 1000000).toFixed(1)}M`
   - Dates: `format(date, 'MMM d')` or `format(date, 'MMM d, yyyy')`
   - Percentages: `${value}%`

6. **Default Images**
   - Always have fallback icon (Home, Person, Event, etc.)
   - Use gradient background if no image

7. **Status Colors**
   - Active/Open: Green
   - Pending: Orange
   - Closed/Complete: Grey or Green
   - Cancelled/Lost: Red

8. **Hover Effects**
   - `transform: 'translateY(-4px)'`
   - `boxShadow: '0 12px 24px rgba(0,0,0,0.15)'`
   - Smooth 0.2s transition

### ❌ DON'T:

1. **Multiple APIs per Widget Size**
   - Never create `/escrows/small`, `/escrows/medium`, `/escrows/large`
   - Always use single `/escrows` endpoint

2. **Variable Heights**
   - Never use flexible heights like `minHeight: 320`
   - Always exactly `height: 320`

3. **Skip Skeleton States**
   - Every widget needs loading skeleton
   - Skeleton must match actual layout

4. **Different Data Structures**
   - All widgets receive identical data object
   - Parse differently, don't fetch differently

5. **Hardcode Data**
   - Always fetch from API
   - Never mock data in components

---

## Module Color Schemes

Each module has unique gradient for visual identity:

| Module | Primary Color | Secondary Color | Gradient |
|--------|--------------|-----------------|----------|
| **Escrows** | `#1976D2` (Blue) | `#42A5F5` (Light Blue) | `linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)` |
| **Listings** | `#9C27B0` (Purple) | `#BA68C8` (Light Purple) | `linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)` |
| **Clients** | `#00897B` (Teal) | `#26A69A` (Light Teal) | `linear-gradient(135deg, #00897B 0%, #26A69A 100%)` |
| **Appointments** | `#F57C00` (Orange) | `#FFB74D` (Light Orange) | `linear-gradient(135deg, #F57C00 0%, #FFB74D 100%)` |
| **Leads** | `#E91E63` (Pink) | `#F06292` (Light Pink) | `linear-gradient(135deg, #E91E63 0%, #F06292 100%)` |

---

## File Structure

```
real-estate-crm/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── escrows.controller.js    # GET /v1/escrows logic
│   │   └── routes/
│   │       └── escrows.routes.js        # Route definitions
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── dashboards/
│       │   │   └── EscrowsDashboard.jsx  # Main dashboard
│       │   └── common/
│       │       └── widgets/
│       │           ├── EscrowWidgetSmall.jsx
│       │           ├── EscrowWidgetMedium.jsx
│       │           └── EscrowWidgetLarge.jsx
│       └── services/
│           └── api.service.js            # API client
```

---

## Summary: The Complete Pattern

**To transform any database into a beautiful dashboard:**

1. **Backend:** Create `GET /v1/[module]` endpoint returning all data
2. **Frontend API:** Add `[module]API.getAll()` in `api.service.js`
3. **Dashboard:** Create `[Module]Dashboard.jsx` that fetches once, toggles views
4. **Widgets:** Create 3 widgets (Small 320×320, Medium 320h, Large 320h)
5. **Parse Smart:** Same data, different amounts shown per widget size
6. **Load Smooth:** Skeleton components for all 3 widget sizes
7. **Design Pro:** Images, status chips, progress, hover effects, colors

**Reference Implementation:** Escrows module demonstrates every pattern perfectly.

---

**End of Database Dashboard Template**
