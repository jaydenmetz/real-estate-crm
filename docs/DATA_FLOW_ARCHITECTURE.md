# Data Flow Architecture

**Last Updated:** October 4, 2025
**Status:** Reference Implementation (Escrows Module)

This document explains how data flows from the database to the UI widgets across all modules (Escrows, Listings, Clients, Leads, Appointments). Use the **Escrows module** as the reference implementation for all other modules.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Dashboard Component (e.g., EscrowsDashboard.jsx)              │
│           │                                                     │
│           ├─ State Management (useState, useEffect)            │
│           │                                                     │
│           └─ API Service Call (escrowsAPI.getAll())           │
│                       │                                         │
│                       ▼                                         │
│  API Service (/frontend/src/services/api.service.js)          │
│           │                                                     │
│           └─ HTTP Request with Auth (JWT or API Key)          │
│                                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    HTTP Request
                   (Authorization)
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                         BACKEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  API Routes (/backend/src/routes/escrows.routes.js)           │
│           │                                                     │
│           ├─ Authentication Middleware                         │
│           ├─ Validation Middleware                             │
│           │                                                     │
│           └─ Controller Method                                 │
│                       │                                         │
│                       ▼                                         │
│  Controller (/backend/src/controllers/escrows.controller.js)  │
│           │                                                     │
│           ├─ Business Logic                                    │
│           ├─ Data Transformation                               │
│           │                                                     │
│           └─ Database Query (PostgreSQL)                       │
│                       │                                         │
│                       ▼                                         │
│  Database (PostgreSQL on Railway)                              │
│           │                                                     │
│           └─ Returns Raw Data                                  │
│                                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    JSON Response
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                         WIDGET LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Small/Medium/Large Widgets Receive Props                      │
│           │                                                     │
│           ├─ Parse & Format Data                               │
│           ├─ Display in Consistent 320px Height                │
│           │                                                     │
│           └─ Render with Skeleton Loading States               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Implementation: Escrows Module

### 1. Frontend API Service (`/frontend/src/services/api.service.js`)

**Single API Service for All Modules** - All widgets (small/medium/large) use the **same API endpoint**.

```javascript
export const escrowsAPI = {
  getAll: (params) => apiInstance.get('/escrows', params),
  getById: (id) => apiInstance.get(`/escrows/${id}`),
  create: (data) => apiInstance.post('/escrows', data),
  update: (id, data) => apiInstance.put(`/escrows/${id}`, data),
  archive: (id) => apiInstance.put(`/escrows/${id}/archive`),
  restore: (id) => apiInstance.put(`/escrows/${id}/restore`),
  delete: (id) => apiInstance.delete(`/escrows/${id}`),
  batchDelete: (ids) => apiInstance.post('/escrows/batch-delete', { ids }),
  // ... more methods
};
```

**Key Points:**
- ✅ **Single endpoint** (`/escrows`) returns all data
- ✅ **No separate APIs** for small/medium/large widgets
- ✅ **Widgets parse the same data** differently based on size
- ✅ **Consistent authentication** (JWT or API Key via headers)

### 2. Dashboard Component (`/frontend/src/components/dashboards/EscrowsDashboard.jsx`)

**Fetches Data Once, Passes to All Widgets**

```javascript
const [escrows, setEscrows] = useState([]);
const [loading, setLoading] = useState(true);
const [viewMode, setViewMode] = useState('small'); // 'small', 'medium', 'large'

useEffect(() => {
  fetchEscrows();
}, []);

const fetchEscrows = async () => {
  try {
    setLoading(true);
    const response = await escrowsAPI.getAll({ includeArchived: true });
    setEscrows(response.escrows || []);
  } catch (error) {
    console.error('Failed to fetch escrows:', error);
  } finally {
    setLoading(false);
  }
};

// Render based on view mode
{viewMode === 'small' && (
  <Grid container spacing={2}>
    {escrows.map((escrow, idx) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={escrow.id}>
        <EscrowWidgetSmall escrow={escrow} index={idx} loading={loading} />
      </Grid>
    ))}
  </Grid>
)}
```

**Key Points:**
- ✅ **Fetches data once** on component mount
- ✅ **Passes same data** to all widget sizes
- ✅ **View mode toggle** switches between small/medium/large
- ✅ **Loading state** passed to widgets for skeleton display

### 3. Widget Components

**All Three Widgets Use Identical Data Structure**

```javascript
// EscrowWidgetSmall.jsx
const EscrowWidgetSmall = ({ escrow, index = 0, loading = false }) => {
  if (loading) return <EscrowWidgetSmallSkeleton />;

  // Parse the SAME data differently
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
  const commission = parseFloat(escrow.myCommission) || 0;
  const checklistProgress = parseInt(escrow.checklistProgress) || 0;
  const propertyImage = escrow.propertyImageUrl || escrow.zillowImageUrl;

  // Display in 320px card with image, 4 metrics, 4 company logos
};

// EscrowWidgetMedium.jsx
const EscrowWidgetMedium = ({ escrow, index = 0, loading = false }) => {
  if (loading) return <EscrowWidgetMediumSkeleton />;

  // Parse the SAME data with MORE details
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
  const loanAmount = parseFloat(escrow.loanAmount) || 0;
  const earnestMoney = parseFloat(escrow.earnestMoney) || 0;
  const commission = parseFloat(escrow.myCommission) || 0;

  // Display in 320px horizontal card with image, 7 metrics, 2 company logos
};

// EscrowWidgetLarge.jsx
const EscrowWidgetLarge = ({ escrow, index = 0, loading = false }) => {
  if (loading) return <EscrowWidgetLargeSkeleton />;

  // Parse the SAME data with MAXIMUM details
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
  const loanAmount = parseFloat(escrow.loanAmount) || 0;
  const earnestMoney = parseFloat(escrow.earnestMoney) || 0;
  const commission = parseFloat(escrow.myCommission) || 0;
  const downPayment = purchasePrice - loanAmount;

  // Display in 320px full-width card with image, 10 metrics, 4 company logos
};
```

**Key Points:**
- ✅ **Same data object** (`escrow`) passed to all widgets
- ✅ **Different parsing** - small shows 4 fields, medium shows 7, large shows 10+
- ✅ **Consistent height** - all 320px tall
- ✅ **Skeleton loading** - each widget has its own skeleton component

---

## Data Structure from API

### GET `/v1/escrows` Response

```json
{
  "success": true,
  "escrows": [
    {
      "id": "uuid-here",
      "displayId": "ESC-727",
      "propertyAddress": "21325 Arroyo Way, Tehachapi, CA 93561",
      "escrowStatus": "Closed",
      "purchasePrice": 265000,
      "commissionPercentage": 2.5,
      "grossCommission": 6625,
      "myCommission": 6625,
      "closingDate": "2023-09-01",
      "actualCoeDate": null,
      "acceptanceDate": null,
      "earnestMoney": null,
      "loanAmount": null,
      "downPayment": null,
      "leadSource": "Zillow",
      "escrowCompany": "Prominence Title",
      "lenderName": "Guild Mortgage",
      "titleCompany": null,
      "nhdCompany": "REOTRANS Inc.",
      "transactionCoordinator": null,
      "avid": false,
      "zillowUrl": "https://www.zillow.com/homedetails/...",
      "propertyImageUrl": null,
      "zillowImageUrl": null,
      "checklistProgress": 0,
      "clientName": null,
      "assignedAgent": null,
      "escrowNumber": null,
      "people": {},
      "timeline": [],
      "financials": {},
      "checklists": {},
      "documents": [],
      "expenses": [],
      "createdAt": "2025-10-04T22:25:10.083Z",
      "updatedAt": "2025-10-04T22:25:10.083Z"
    }
  ],
  "total": 27,
  "page": 1,
  "limit": 20
}
```

---

## Widget Display Mapping

### Small Widget (320px x 320px)

**Displays 8 Data Points:**
1. Property Image (or grey house icon)
2. Status Chip (Active/Pending/Closed/Cancelled)
3. Progress Badge (`checklistProgress`)
4. Street Address (`propertyAddress` parsed)
5. City or Client (`propertyAddress` or `clientName`)
6. Purchase Price (`purchasePrice`)
7. Close Date (`closingDate`)
8. Commission (`myCommission`)
9. Days to Close (calculated from `closingDate`)
10. 4 Company Logos (`escrowCompany`, `lenderName`, `titleCompany`, `nhdCompany`)

### Medium Widget (320px height, flexible width)

**Displays 11 Data Points:**
1. Property Image (280px width)
2. Status Chip
3. Progress Bar
4. Street Address
5. City/State
6. Purchase Price
7. Close Date
8. Days to Close
9. Commission
10. Loan Amount (`loanAmount`)
11. Earnest Money (`earnestMoney`)
12. Down Payment (calculated)
13. 2 Company Logos (Escrow & Lender)

### Large Widget (320px height, full width)

**Displays 16+ Data Points:**
1. Property Image (360px width)
2. Status Chip
3. Animated Progress Bar
4. Full Address (street + city/state/zip)
5. Purchase Price
6. Commission
7. Close Date
8. Days to Close
9. Loan Amount
10. Down Payment
11. Earnest Money
12. Client Name (`clientName`)
13. Escrow Number (`escrowNumber` or `displayId`)
14. Open Date (`acceptanceDate`)
15. 4 Company Logos with icons (Escrow, Lender, Title, NHD)

---

## Standard Pattern for All Modules

### File Structure Template

```
/frontend/src/
├── components/
│   ├── dashboards/
│   │   └── [Module]Dashboard.jsx       # Main dashboard (fetches data)
│   └── common/
│       └── widgets/
│           ├── [Module]WidgetSmall.jsx  # 320px x 320px card
│           ├── [Module]WidgetMedium.jsx # 320px height, horizontal
│           └── [Module]WidgetLarge.jsx  # 320px height, full width
└── services/
    └── api.service.js                   # Single API service for all widgets
```

### Implementation Checklist

When creating a new module (e.g., Listings, Clients), follow these steps:

#### 1. Backend API (Already exists for all modules)

- [ ] Route file: `/backend/src/routes/[module].routes.js`
- [ ] Controller: `/backend/src/controllers/[module].controller.js`
- [ ] Endpoint: `GET /v1/[module]` returns array of items
- [ ] Authentication middleware applied
- [ ] Response format: `{ success: true, [module]: [...], total, page, limit }`

#### 2. Frontend API Service (Already exists)

- [ ] Export in `/frontend/src/services/api.service.js`
- [ ] Methods: `getAll()`, `getById()`, `create()`, `update()`, `delete()`
- [ ] Uses same `apiInstance` for authentication
- [ ] Returns standardized response

#### 3. Dashboard Component

- [ ] Create `/frontend/src/components/dashboards/[Module]Dashboard.jsx`
- [ ] Use `useState` for data and loading state
- [ ] Use `useState` for view mode (`'small'` | `'medium'` | `'large'`)
- [ ] Fetch data once on mount with `useEffect`
- [ ] Pass `loading` prop to widgets during fetch
- [ ] Conditional rendering based on `viewMode`
- [ ] Grid layout for small, list for medium/large

#### 4. Widget Components (Small, Medium, Large)

**Each widget must:**
- [ ] Accept `{ item, index, loading }` props
- [ ] Return skeleton component if `loading === true`
- [ ] Be exactly **320px height**
- [ ] Have property image (or default icon placeholder)
- [ ] Have status chip/badge
- [ ] Have progress indicator
- [ ] Parse same data, display different amounts based on size
- [ ] Use consistent formatting (currency, dates, etc.)
- [ ] Include hover effects and click-to-navigate
- [ ] Export skeleton component

**Small Widget:**
- [ ] 320px x 320px square card
- [ ] Image at top (140px height)
- [ ] 4-8 key data points
- [ ] Grid layout (2x2 or similar)
- [ ] Company logos in single row

**Medium Widget:**
- [ ] 320px height, horizontal layout
- [ ] Image on left (280px width)
- [ ] 7-11 data points
- [ ] Content on right side
- [ ] 2 company logos side-by-side

**Large Widget:**
- [ ] 320px height, full width
- [ ] Image on left (360px width)
- [ ] 12-20 data points
- [ ] Maximum information density
- [ ] Full-width company bar (4+ companies)

#### 5. Skeleton Loading Components

Each widget needs a matching skeleton:

```javascript
const [Module]WidgetSmallSkeleton = () => {
  return (
    <Card sx={{ height: 320 }}>
      <Skeleton variant="rectangular" height={140} animation="wave" />
      <CardContent>
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="text" width="60%" height={18} />
        {/* ... more skeletons matching layout */}
      </CardContent>
    </Card>
  );
};
```

---

## Re-uploading Escrow Data

To re-upload the 27 escrows you deleted:

```bash
# Script already exists
cd backend
node scripts/import-escrows.js
```

This will:
1. Read the hardcoded escrow data (28 records in the file)
2. Connect to PostgreSQL database
3. Insert all records with proper field mapping
4. Display IDs: ESC-727 through ESC-753

---

## Best Practices Summary

### ✅ DO:
- Use **single API endpoint** for all widget sizes
- Fetch data **once** in the dashboard component
- Pass **same data object** to all widgets
- Implement **skeleton loading states** for each widget
- Keep **consistent 320px height** across all widgets
- Use **semantic field names** (purchasePrice, not price)
- Include **property images** with default placeholders
- Add **status indicators** (chips/badges)
- Implement **hover effects** and **click-to-navigate**
- Parse dates, currency, and percentages consistently

### ❌ DON'T:
- Create separate APIs for small/medium/large widgets
- Fetch data multiple times for different views
- Hardcode heights (use 320px constant)
- Skip skeleton loading states
- Use different data structures per widget
- Forget authentication headers
- Mix naming conventions (camelCase vs snake_case)

---

## Next Steps: Applying to Other Modules

**Order of Implementation:**
1. ✅ **Escrows** (Reference Implementation - COMPLETE)
2. **Listings** (Similar to escrows, has property images)
3. **Clients** (People-focused, different data structure)
4. **Leads** (Pipeline/funnel focus)
5. **Appointments** (Calendar/schedule focus)

**For each module, ask:**
1. What are the **8 most important fields** for small view?
2. What are the **11 most important fields** for medium view?
3. What are the **16-20 most important fields** for large view?
4. What **default icon/image** should display if no photo?
5. What **status values** exist and what colors should they be?
6. What **company/party information** should show in logos section?

---

## Questions for You

Before we implement this pattern for Listings/Clients/Leads/Appointments:

1. **Should we re-upload the 27 escrows now?** (Script is ready to run)
2. **Which module should we implement next?** (Listings recommended)
3. **Do all modules need small/medium/large views?** (Or just key modules?)
4. **Should we create a widget generator script?** (To automate skeleton creation)

---

**End of Data Flow Architecture Documentation**
