# Dashboard Page Template & Design System

**Last Updated:** October 4, 2025
**Purpose:** Standardized template for all CRM module dashboards (Escrows, Listings, Clients, Appointments, Leads)
**Reference:** Use this document when creating new pages or updating existing ones

---

## Table of Contents
1. [Page Structure Overview](#page-structure-overview)
2. [Standard Components](#standard-components)
3. [Visual Hierarchy](#visual-hierarchy)
4. [Color Schemes by Module](#color-schemes-by-module)
5. [Common Features Across All Pages](#common-features-across-all-pages)
6. [Module-Specific Differences](#module-specific-differences)
7. [Component Patterns](#component-patterns)
8. [Implementation Checklist](#implementation-checklist)

---

## Page Structure Overview

Every dashboard page follows this exact structure from top to bottom:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DEBUG PANEL (Admin Only)                                  │
│    - Collapsible debug interface                            │
│    - Network monitoring                                      │
│    - Data inspection                                         │
├─────────────────────────────────────────────────────────────┤
│ 2. HERO SECTION                                              │
│    - Gradient background with module color                  │
│    - Page title & subtitle                                  │
│    - 4 stat cards with mini charts                         │
│    - Primary action buttons                                 │
├─────────────────────────────────────────────────────────────┤
│ 3. CHARTS ROW                                                │
│    - Left: Weekly/Monthly chart (8 cols)                   │
│    - Right: Pie/Donut chart (4 cols)                       │
├─────────────────────────────────────────────────────────────┤
│ 4. FILTERS & SEARCH                                          │
│    - Search bar (left)                                      │
│    - Sort dropdown + View mode toggle + Filters (right)    │
│    - Advanced filters (collapsible)                         │
├─────────────────────────────────────────────────────────────┤
│ 5. TABS                                                       │
│    - All / Status filters with counts                       │
│    - Badge indicators                                        │
├─────────────────────────────────────────────────────────────┤
│ 6. CONTENT AREA (3 View Modes)                              │
│    - Card Grid View (default)                              │
│    - Table View (DataGrid)                                  │
│    - Special View (Calendar for Appointments, etc)          │
├─────────────────────────────────────────────────────────────┤
│ 7. SPEED DIAL (Bottom Right)                                 │
│    - Floating action button                                 │
│    - Quick actions menu                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Standard Components

### 1. Debug Panel (Admin Only)

**Location:** Top of page, before hero section
**Visibility:** `user.username === 'admin'` only
**State:** Collapsible (click to expand/collapse)

```jsx
{user?.username === 'admin' && (
  <Box sx={{ mb: 4 }}>
    {/* Summary Card - Always Visible */}
    <Card onClick={() => setDebugExpanded(!debugExpanded)}>
      {/* Rainbow gradient top border */}
      {/* Debug icon + title + environment badges */}
      {/* Copy button for full debug JSON */}
    </Card>

    {/* Detailed Panels - Expandable */}
    <Collapse in={debugExpanded}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* Dashboard Statistics */}
        </Grid>
        <Grid item xs={12} md={6}>
          {/* API & Network Status */}
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Recent Data Sample */}
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Network Activity Log */}
        </Grid>
      </Grid>
    </Collapse>
  </Box>
)}
```

**Features:**
- Rainbow gradient border (primary → secondary → error → warning)
- Auto-refreshes every 2 seconds when expanded
- Copy button exports full debug JSON
- Network monitor integration
- Real-time request/error tracking

---

### 2. Hero Section

**Component:** `HeroSection` (styled Box)
**Layout:** Full-width gradient background
**Height:** Auto (padding: 6)
**Border Radius:** 3 (24px)

```jsx
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, [PRIMARY_COLOR] 0%, [SECONDARY_COLOR] 100%)',
  color: 'white',
  padding: theme.spacing(6),
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba([PRIMARY_RGB], 0.3)',
  // Decorative circles
  '&::before': { ... },
  '&::after': { ... },
}));
```

**Contents:**
1. **Title & Subtitle** (motion.div with fade-in)
   - H3 title, fontWeight 700
   - H6 subtitle, opacity 0.9
   - Margin bottom: 4

2. **4 Stat Cards** (Grid container spacing={3})
   - Each: xs={12} sm={6} md={3}
   - Glass morphism effect (rgba white + backdrop blur)
   - Icon (top right, opacity 0.6, size 40)
   - Label (body2, opacity 0.9)
   - Value (H4, bold, CountUp animation)
   - Mini chart (40px height, Recharts Area/Line/Bar)

3. **Action Buttons** (mt: 4, gap: 2)
   - Primary: "Add New [Module]" (contained, white bg)
   - Secondary: Module-specific action (outlined, white border)

**Stat Card Template:**
```jsx
<Box sx={{
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 2,
  p: 2.5,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}}>
  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
    <Box>
      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
        [Stat Label]
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        <CountUp end={statValue || 0} duration={2} separator="," />
      </Typography>
    </Box>
    <[IconComponent] sx={{ fontSize: 40, opacity: 0.6 }} />
  </Box>
  {/* Mini chart (40px height) */}
  <Box sx={{ height: 40, mt: 1 }}>
    <ResponsiveContainer width="100%" height="100%">
      {/* Recharts component */}
    </ResponsiveContainer>
  </Box>
</Box>
```

---

### 3. Charts Row

**Layout:** Grid container, spacing={3}, mb={4}
**Columns:**
- Left chart: xs={12} md={8}
- Right chart: xs={12} md={4}

```jsx
<Grid container spacing={3} sx={{ mb: 4 }}>
  <Grid item xs={12} md={8}>
    <StatsCard>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          [Chart Title - e.g., "Weekly Activity"]
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          {/* BarChart, LineChart, or AreaChart */}
        </ResponsiveContainer>
      </CardContent>
    </StatsCard>
  </Grid>

  <Grid item xs={12} md={4}>
    <StatsCard>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          [Chart Title - e.g., "By Status"]
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          {/* PieChart with legend below */}
        </ResponsiveContainer>
        {/* Color legend */}
        <Stack spacing={1} sx={{ mt: 2 }}>
          {data.map((item) => (
            <Box display="flex" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
                <Typography variant="body2">{item.name}</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </StatsCard>
  </Grid>
</Grid>
```

**Styled Components:**
```jsx
const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  },
}));
```

---

### 4. Filters & Search Bar

**Layout:** Paper component, p={3}, mb={3}, borderRadius={2}

```jsx
<Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
  <Grid container spacing={2} alignItems="center">
    {/* Search Bar - Left Side */}
    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search [module]..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
    </Grid>

    {/* Controls - Right Side */}
    <Grid item xs={12} md={8}>
      <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
        {/* Sort Dropdown */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="status">Status</MenuItem>
          </Select>
        </FormControl>

        {/* View Mode Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="grid">
            <ViewModule />
          </ToggleButton>
          <ToggleButton value="table">
            <ViewList />
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Filters Button */}
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
        >
          Filters
        </Button>

        {/* More Actions Menu */}
        <IconButton onClick={(e) => setActionsAnchorEl(e.currentTarget)}>
          <MoreVert />
        </IconButton>
      </Stack>
    </Grid>
  </Grid>

  {/* Advanced Filters - Collapsible */}
  <Collapse in={showAdvancedFilters}>
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        {/* Filter dropdowns specific to module */}
      </Grid>
    </Box>
  </Collapse>
</Paper>
```

---

### 5. Tabs

**Component:** Paper with Tabs
**Variant:** scrollable with auto scroll buttons
**Margin:** mb={3}

```jsx
<Paper sx={{ mb: 3 }}>
  <Tabs
    value={tabValue}
    onChange={(e, newValue) => setTabValue(newValue)}
    variant="scrollable"
    scrollButtons="auto"
  >
    <Tab label={`All (${items.length})`} />
    <Tab label={`[Status 1] (${stats.status1Count})`} />
    <Tab label={`[Status 2] (${stats.status2Count})`} />
    <Tab label={`[Status 3] (${stats.status3Count})`} />
    <Tab label={`[Status 4] (${stats.status4Count})`} />
  </Tabs>
</Paper>
```

**Tab Filters by Module:**
- **Escrows:** All, Opened, Pending, Closed, Cancelled
- **Listings:** All, Active, Pending, Sold, Archived
- **Clients:** All, Active, Inactive, VIP, Archived
- **Appointments:** All, Today, Upcoming, Completed, Cancelled
- **Leads:** All, New, Contacted, Qualified, Converted, Lost

---

### 6. Content Area - Card Grid View

**Default View:** Card grid with animation
**Layout:** Grid container, spacing={3}
**Card Size:** xs={12} sm={6} md={4}

```jsx
<Grid container spacing={3}>
  <AnimatePresence>
    {items.map((item, index) => (
      <Grid item xs={12} sm={6} md={4} key={item.id}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <[Module]Card>
            {/* Card content - see module-specific patterns */}
          </[Module]Card>
        </motion.div>
      </Grid>
    ))}
  </AnimatePresence>
</Grid>
```

**Card Styled Component Pattern:**
```jsx
const [Module]Card = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    '& .[unique-class]': {
      transform: 'scale(1.1)',  // Hover effect on specific element
    },
    '& .action-buttons': {
      opacity: 1,  // Show action buttons on hover
    },
  },
}));
```

**Common Card Structure:**
```jsx
<[Module]Card>
  {/* Image/Media (if applicable) */}
  {image && (
    <CardMedia
      component="img"
      height={200}
      image={item.image}
      alt={item.name}
    />
  )}

  <Box sx={{ p: 2 }}>
    {/* Header Row: Avatar/Icon + Title + Status Chip */}
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Avatar sx={{ width: 50, height: 50, mr: 2, bgcolor: 'primary.main' }}>
        {/* Icon or initials */}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {item.title}
        </Typography>
        <StatusChip label={item.status} status={item.status} size="small" />
      </Box>
    </Box>

    <Divider sx={{ my: 2 }} />

    {/* Details Stack */}
    <Stack spacing={1.5}>
      {/* Icon + text rows */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <[Icon] sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="body2">{item.detail}</Typography>
      </Box>
      {/* ... more rows */}
    </Stack>

    {/* Action Buttons (Hidden, shown on hover) */}
    <Box
      className="action-buttons"
      sx={{
        display: 'flex',
        gap: 1,
        mt: 2,
        opacity: 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <Button
        size="small"
        variant="contained"
        startIcon={<RemoveRedEye />}
        onClick={() => navigate(`/[module]/${item.id}`)}
        fullWidth
      >
        View Details
      </Button>
    </Box>
  </Box>
</[Module]Card>
```

---

### 7. Content Area - Table View

**Component:** DataGrid from @mui/x-data-grid
**Height:** 600px
**Features:** Sortable, filterable, paginated

```jsx
<Paper sx={{ height: 600 }}>
  <DataGrid
    rows={items}
    columns={columns}
    pageSize={10}
    rowsPerPageOptions={[10, 25, 50]}
    disableSelectionOnClick
    sx={{
      '& .MuiDataGrid-row:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
    }}
  />
</Paper>
```

**Standard Columns Pattern:**
```jsx
const columns = [
  {
    field: 'name',
    headerName: 'Name/Title',
    flex: 1,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32 }}>{/* Icon */}</Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.subtitle}</Typography>
        </Box>
      </Box>
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => (
      <StatusChip label={params.value} status={params.value} size="small" />
    ),
  },
  {
    field: 'date',
    headerName: 'Date',
    width: 150,
    renderCell: (params) => safeFormatDate(params.value, 'MMM d, yyyy'),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton size="small" onClick={() => navigate(`/[module]/${params.row.id}`)}>
          <RemoveRedEye />
        </IconButton>
        <IconButton size="small" onClick={() => handleEdit(params.row)}>
          <Edit />
        </IconButton>
      </Stack>
    ),
  },
];
```

---

### 8. Speed Dial (Bottom Right)

**Position:** Fixed, bottom: 16, right: 16
**Purpose:** Quick actions for the module

```jsx
<SpeedDial
  ariaLabel="[Module] actions"
  sx={{ position: 'fixed', bottom: 16, right: 16 }}
  icon={<SpeedDialIcon />}
>
  <SpeedDialAction
    icon={<Add />}
    tooltipTitle="New [Module]"
    onClick={() => setOpenForm(true)}
  />
  {/* Module-specific actions */}
</SpeedDial>
```

---

## Color Schemes by Module

Each module has a unique color gradient for brand differentiation:

### Escrows
```jsx
// Hero Section
background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)'  // Blue gradient
boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3)'

// Status Colors
const StatusChip = styled(Chip)(({ status, theme }) => ({
  ...(status === 'opened' && {
    backgroundColor: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main,
  }),
  ...(status === 'pending' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
  }),
  ...(status === 'closed' && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
  }),
  ...(status === 'cancelled' && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
  }),
}));
```

### Listings
```jsx
// Hero Section
background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)'  // Purple gradient
boxShadow: '0 20px 60px rgba(156, 39, 176, 0.3)'

// Status Colors
active: purple
pending: orange
sold: green
archived: grey
```

### Clients
```jsx
// Hero Section
background: 'linear-gradient(135deg, #00897B 0%, #26A69A 100%)'  // Teal gradient
boxShadow: '0 20px 60px rgba(0, 137, 123, 0.3)'

// Status Colors
active: teal
inactive: grey
vip: gold/yellow
archived: grey
```

### Appointments
```jsx
// Hero Section
background: 'linear-gradient(135deg, #F57C00 0%, #FFB74D 100%)'  // Orange gradient
boxShadow: '0 20px 60px rgba(245, 124, 0, 0.3)'

// Status Colors
scheduled: blue
completed: green
cancelled: red
no_show: orange
```

### Leads
```jsx
// Hero Section
background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)'  // Pink gradient
boxShadow: '0 20px 60px rgba(233, 30, 99, 0.3)'

// Status Colors
new: blue
contacted: purple
qualified: teal
converted: green
lost: red
```

---

## Common Features Across All Pages

### ✅ Every Page Has:

1. **Debug Panel** (admin only)
   - Collapsible summary card
   - Network monitoring
   - Data inspection
   - Copy-to-clipboard functionality

2. **Hero Section**
   - Module-specific gradient
   - Page title & description
   - 4 stat cards with CountUp animation
   - Mini charts in stat cards
   - Primary + secondary action buttons

3. **Charts Row**
   - Weekly/monthly activity chart (left, 8 cols)
   - Pie/donut breakdown chart (right, 4 cols)
   - Glass morphism cards with hover effects

4. **Search & Filters**
   - Left: Search bar with icon
   - Right: Sort dropdown + view mode toggle + filter button + more menu
   - Collapsible advanced filters

5. **Tabs with Counts**
   - All tab + 4 status-based tabs
   - Real-time counts in badges

6. **3 View Modes**
   - Card Grid (default, animated)
   - Table (DataGrid)
   - Special view (Calendar for Appointments, Map for future, etc.)

7. **Loading States**
   - Skeleton loaders for cards
   - Circular progress for data fetching

8. **Speed Dial**
   - Fixed bottom-right
   - Quick action menu

9. **Form Dialog**
   - Create/edit modal
   - Consistent validation
   - Success/error snackbars

10. **React Query Integration**
    - 30-second auto-refresh
    - Optimistic updates
    - Cache invalidation

---

## Module-Specific Differences

### Escrows
**Unique Features:**
- Purchase price prominently displayed
- Commission calculations
- Close date countdown
- Document upload section
- Transaction timeline
- Escrow number with copy button

**Card Specifics:**
- Shows property address as title
- Displays buyer/seller names
- Commission amount highlighted
- Close date with urgency indicator

---

### Listings
**Unique Features:**
- Property photos (CardMedia)
- Price prominently displayed
- MLS number
- Zillow integration badge
- Bedrooms/bathrooms/sqft
- "Hot" badge for popular listings

**Card Specifics:**
- Large image at top (200px height)
- Price in primary color, large font
- Property specs in icon grid
- "View on Zillow" link

---

### Clients
**Unique Features:**
- Contact info (phone, email)
- Tags/labels system
- Last contact date
- Relationship strength indicator
- VIP badge
- Client avatar with initials

**Card Specifics:**
- Avatar with client initials
- Contact icons for quick actions (call, email, message)
- Tags displayed as chips
- Recent activity timeline

---

### Appointments
**Unique Features:**
- FullCalendar integration (calendar view)
- Time-based sorting
- Location with map icon
- Client/attendee avatars
- Reminder toggle
- Property preview (if applicable)

**Card Specifics:**
- Date/time prominently displayed
- Location with Google Maps link
- Attendees shown as avatar group
- Property thumbnail if showing

**Special View:**
- Calendar mode (dayGridMonth, timeGridWeek, timeGridDay, listWeek)
- Drag-and-drop support
- Color-coded by status

---

### Leads
**Unique Features:**
- Lead source tracking
- Lead score/quality indicator
- Conversion pipeline stages
- Last contact timestamp
- Assignment to agent
- Follow-up reminders

**Card Specifics:**
- Lead score displayed as rating stars
- Source badge (Zillow, Realtor.com, etc.)
- Days since last contact
- Quick convert-to-client button

---

## Component Patterns

### StatusChip Component

**Usage:** Consistent status display across all modules

```jsx
const StatusChip = styled(Chip)(({ status, theme }) => ({
  fontWeight: 600,
  textTransform: 'capitalize',
  ...(status === 'active' && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(status === 'pending' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
  ...(status === 'closed' && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(status === 'cancelled' && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  }),
  // ... more status variants
}));

// Usage
<StatusChip label={item.status} status={item.status} size="small" />
```

---

### Animations

**Card Entrance Animation:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, delay: index * 0.05 }}
>
  {/* Card content */}
</motion.div>
```

**Hover Animations:**
```jsx
'&:hover': {
  transform: 'translateY(-8px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
}
```

**CountUp Numbers:**
```jsx
<CountUp end={value || 0} duration={2} separator="," prefix="$" />
```

---

### Date Formatting

**Always use safe date utility:**
```jsx
import { safeFormatDate } from '../../utils/safeDateUtils';

// Usage
<Typography>{safeFormatDate(item.date, 'MMMM d, yyyy')}</Typography>
<Typography>{safeFormatDate(item.createdAt, 'MMM d, yyyy h:mm a')}</Typography>
```

---

### Network Monitoring (Debug Panel)

**Setup:**
```jsx
const [networkData, setNetworkData] = useState({
  stats: networkMonitor.getStats(),
  requests: networkMonitor.getRequests(),
  errors: networkMonitor.getErrors()
});

useEffect(() => {
  if (debugExpanded) {
    const interval = setInterval(() => {
      setNetworkData({
        stats: networkMonitor.getStats(),
        requests: networkMonitor.getRequests(),
        errors: networkMonitor.getErrors()
      });
    }, 2000);
    return () => clearInterval(interval);
  }
}, [debugExpanded]);
```

---

## Implementation Checklist

When creating a new dashboard page or updating an existing one:

### Setup
- [ ] Import all standard MUI components
- [ ] Import framer-motion (AnimatePresence, motion)
- [ ] Import react-query (useQuery, useMutation, useQueryClient)
- [ ] Import recharts components
- [ ] Import useSnackbar from notistack
- [ ] Import safeFormatDate utility
- [ ] Import networkMonitor service
- [ ] Import CountUp component

### State Management
- [ ] `const [tabValue, setTabValue] = useState(0);`
- [ ] `const [viewMode, setViewMode] = useState('grid');`
- [ ] `const [searchTerm, setSearchTerm] = useState('');`
- [ ] `const [sortBy, setSortBy] = useState('date');`
- [ ] `const [openForm, setOpenForm] = useState(false);`
- [ ] `const [selected[Module], setSelected[Module]] = useState(null);`
- [ ] `const [filterAnchorEl, setFilterAnchorEl] = useState(null);`
- [ ] `const [actionsAnchorEl, setActionsAnchorEl] = useState(null);`
- [ ] `const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);`
- [ ] `const [debugExpanded, setDebugExpanded] = useState(false);` (if admin)
- [ ] `const [networkData, setNetworkData] = useState({...});` (if admin)

### Styled Components
- [ ] Create `HeroSection` with module-specific gradient
- [ ] Create `StatsCard` with glass morphism
- [ ] Create `[Module]Card` with hover effects
- [ ] Create `StatusChip` with module-specific statuses

### Data Fetching
- [ ] Setup useQuery with proper key and filter params
- [ ] Add 30-second refetchInterval
- [ ] Implement fallback mock data
- [ ] Calculate stats from fetched data

### Hero Section
- [ ] Gradient background with module colors
- [ ] Title and subtitle with motion animation
- [ ] 4 stat cards with:
  - [ ] Icon (top right)
  - [ ] Label (body2)
  - [ ] CountUp value (H4)
  - [ ] Mini chart (40px height)
- [ ] Primary action button
- [ ] Secondary action button

### Charts
- [ ] Left chart (8 cols): BarChart/LineChart/AreaChart
- [ ] Right chart (4 cols): PieChart with legend below
- [ ] Hover effects on cards

### Filters & Search
- [ ] Search TextField with Search icon
- [ ] Sort dropdown (FormControl + Select)
- [ ] View mode toggle (ToggleButtonGroup)
- [ ] Filters button (opens menu)
- [ ] More actions icon button
- [ ] Advanced filters (Collapse component)

### Tabs
- [ ] All tab
- [ ] 4 status-based tabs with counts
- [ ] Update tabValue state on change

### Content Views
- [ ] **Grid View:**
  - [ ] Grid container spacing={3}
  - [ ] AnimatePresence wrapper
  - [ ] Cards with motion.div
  - [ ] Card hover effects
  - [ ] Hidden action buttons (opacity: 0, shown on hover)

- [ ] **Table View:**
  - [ ] DataGrid with proper columns
  - [ ] Avatar + name in first column
  - [ ] StatusChip in status column
  - [ ] Actions column with icon buttons

- [ ] **Special View** (if applicable):
  - [ ] Calendar for Appointments
  - [ ] Map for future location-based modules

### Speed Dial
- [ ] Fixed position (bottom: 16, right: 16)
- [ ] Primary action: Add new item
- [ ] 2-3 module-specific quick actions

### Dialogs & Menus
- [ ] Form dialog for create/edit
- [ ] Filter menu component
- [ ] Actions menu component

### Debug Panel (Admin Only)
- [ ] Check `user?.username === 'admin'`
- [ ] Summary card with click to expand
- [ ] Rainbow gradient top border
- [ ] Environment badges (Production/Local, Admin Only)
- [ ] Copy button for full debug JSON
- [ ] 4 expandable panels:
  - [ ] Dashboard statistics
  - [ ] API & network status
  - [ ] Recent data sample
  - [ ] Network activity log
- [ ] Auto-refresh every 2 seconds when expanded

### Testing
- [ ] Test all 3 view modes
- [ ] Test search functionality
- [ ] Test filters and sorting
- [ ] Test create/edit form
- [ ] Test responsive layout (mobile, tablet, desktop)
- [ ] Test loading states
- [ ] Test error states
- [ ] Test admin debug panel (if admin user)

---

## Quick Reference: Module Comparison

| Feature | Escrows | Listings | Clients | Appointments | Leads |
|---------|---------|----------|---------|--------------|-------|
| **Gradient Color** | Blue | Purple | Teal | Orange | Pink |
| **Primary RGB** | 25,118,210 | 156,39,176 | 0,137,123 | 245,124,0 | 233,30,99 |
| **Card Image** | No | Yes (200px) | No | Sometimes | No |
| **Special View** | None | None | None | Calendar | None |
| **Unique Data** | Commission | Price | Tags | Location | Lead Score |
| **Main Identifier** | Escrow # | MLS # | Client Name | Date/Time | Lead Name |
| **4 Stats** | Opened, Pending, Closed, Total Value | Active, Pending, Sold, Avg Price | Active, Inactive, VIP, Total | Today, Upcoming, Completed, Cancelled | New, Contacted, Qualified, Converted |

---

## File Location Template

```
frontend/src/components/dashboards/
├── EscrowsDashboard.jsx       # Blue gradient, commission-focused
├── ListingsDashboard.jsx      # Purple gradient, photo-heavy
├── ClientsDashboard.jsx       # Teal gradient, contact-focused
├── AppointmentsDashboard.jsx  # Orange gradient, calendar view
└── LeadsDashboard.jsx         # Pink gradient, conversion pipeline
```

---

## Notes for Claude

When creating a new dashboard page:

1. **Copy the closest existing module** as a starting point
2. **Update the gradient colors** to match the new module's theme
3. **Replace all instance of module names** (e.g., "Escrow" → "Property")
4. **Update the 4 stats** in hero section to match new module's KPIs
5. **Modify the card layout** to show relevant fields
6. **Update StatusChip** statuses to match new module's workflow
7. **Adjust columns** in DataGrid for table view
8. **Keep all animations, hover effects, and transitions** consistent
9. **Maintain debug panel** structure exactly as-is
10. **Test responsive layout** at all breakpoints

**Key principle:** Consistency over creativity. Users should feel at home navigating between modules.

---

**Last Updated:** October 4, 2025
**Maintained By:** Claude Code Agent
**Version:** 1.0
