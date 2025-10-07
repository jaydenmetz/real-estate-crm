# Quick Start: Create New Dashboard in 40 Minutes

**Use Escrows as your template** - Everything is production-tested

---

## 🚀 Step-by-Step (Example: Listings Dashboard)

### Step 1: Copy Hooks (5 minutes)

```bash
cd frontend/src/hooks

# Copy the three hooks
cp useEscrows.js useListings.js
cp useEscrowFilters.js useListingFilters.js
cp useEscrowAnalytics.js useListingAnalytics.js

# Find/Replace (macOS)
sed -i '' 's/Escrow/Listing/g' useListings.js
sed -i '' 's/escrow/listing/g' useListings.js
sed -i '' 's/Escrow/Listing/g' useListingFilters.js
sed -i '' 's/escrow/listing/g' useListingFilters.js
sed -i '' 's/Escrow/Listing/g' useListingAnalytics.js
sed -i '' 's/escrow/listing/g' useListingAnalytics.js

# Or on Linux:
sed -i 's/Escrow/Listing/g' useListings.js
# etc...
```

✅ **Done!** You now have three hooks ready to use.

---

### Step 2: Update API Endpoint (2 minutes)

Edit `useListings.js`:

```javascript
// Line ~26: Change API endpoint
const response = await listingsAPI.getAll(); // was: escrowsAPI
```

✅ **Done!** Hook now fetches listing data.

---

### Step 3: Customize Analytics (10 minutes)

Edit `useListingAnalytics.js` to calculate listing-specific metrics:

```javascript
export function useListingAnalytics(listings) {
  return useMemo(() => {
    if (!listings || listings.length === 0) {
      return {
        totalListings: 0,
        activeListings: 0,
        totalValue: 0,
        avgPrice: 0,
        avgDOM: 0, // Days on Market
      };
    }

    const active = listings.filter(l => l.status === 'Active');
    const totalValue = active.reduce((sum, l) => sum + (l.price || 0), 0);
    const avgPrice = active.length > 0 ? totalValue / active.length : 0;

    // Calculate average days on market
    const avgDOM = active.length > 0
      ? Math.round(
          active.reduce((sum, l) => sum + (l.days_on_market || 0), 0) / active.length
        )
      : 0;

    return {
      totalListings: listings.length,
      activeListings: active.length,
      totalValue,
      avgPrice,
      avgDOM,
    };
  }, [listings]);
}
```

✅ **Done!** Custom analytics ready.

---

### Step 4: Create Dashboard Component (20 minutes)

Create `components/dashboards/ListingsDashboard.jsx`:

```javascript
import React, { useState } from 'react';
import { Container, Box, Typography, Button, Grid, CircularProgress } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useListings } from '../../hooks/useListings';
import { useListingFilters } from '../../hooks/useListingFilters';
import { useListingAnalytics } from '../../hooks/useListingAnalytics';
import NewListingModal from '../forms/NewListingModal';

function ListingsDashboard() {
  const navigate = useNavigate();

  // Custom hooks - all data logic extracted
  const { listings, loading, error, refetch } = useListings({ status: 'active' });
  const { filters, updateFilter, filterListings } = useListingFilters();
  const stats = useListingAnalytics(listings);

  // UI state
  const [showNewModal, setShowNewModal] = useState(false);

  // Apply filters
  const filteredListings = filterListings(listings);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight="bold">
          Listings
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<Refresh />} onClick={refetch}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowNewModal(true)}
          >
            New Listing
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Listings" value={stats.totalListings} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active" value={stats.activeListings} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Value"
            value={`$${(stats.totalValue / 1000000).toFixed(1)}M`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Avg DOM" value={stats.avgDOM} />
        </Grid>
      </Grid>

      {/* Listings Grid */}
      <Grid container spacing={3}>
        {filteredListings.map(listing => (
          <Grid item xs={12} sm={6} md={3} key={listing.id}>
            <ListingCard
              listing={listing}
              onClick={() => navigate(`/listings/${listing.id}`)}
            />
          </Grid>
        ))}
      </Grid>

      {/* New Listing Modal */}
      <NewListingModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={refetch}
      />
    </Container>
  );
}

// Simple stat card component
function StatCard({ title, value }) {
  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="body2" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default ListingsDashboard;
```

✅ **Done!** Fully functional dashboard in ~150 lines.

---

### Step 5: Add Route (2 minutes)

In `App.jsx`:

```javascript
import ListingsDashboard from './components/dashboards/ListingsDashboard';

// Add route
<Route path="/listings" element={<ListingsDashboard />} />
```

✅ **Done!** Dashboard accessible at `/listings`

---

## ⏱️ Time Breakdown

| Step | Time | Task |
|------|------|------|
| 1 | 5 min | Copy hooks |
| 2 | 2 min | Update API endpoint |
| 3 | 10 min | Customize analytics |
| 4 | 20 min | Create dashboard component |
| 5 | 2 min | Add route |
| **Total** | **39 min** | **Complete new dashboard** |

---

## 🎯 What You Get

✅ Data fetching with loading/error states
✅ Filter state management
✅ Real-time analytics calculations
✅ Clean, maintainable 150-line component
✅ Production-ready code
✅ Zero duplication

---

## 📚 Full Documentation

See [DASHBOARD_TEMPLATE_PATTERN.md](./DASHBOARD_TEMPLATE_PATTERN.md) for complete details.

---

## 🔁 Repeat for Any Module

- Clients: `useClients`, `useClientFilters`, `useClientAnalytics`
- Leads: `useLeads`, `useLeadFilters`, `useLeadAnalytics`
- Appointments: `useAppointments`, `useAppointmentFilters`, `useAppointmentAnalytics`

**Same 40-minute process every time!**
