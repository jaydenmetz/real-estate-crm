# 📐 Responsive Design Guide

**Last Updated:** November 8, 2025
**Project:** Real Estate CRM Template System
**Status:** Current (Updated for Template Architecture)

---

## 🚨 CRITICAL RULES

### Rule #1: Max 2 Columns Inside Cards

**⚠️ NEVER use more than 2 columns inside a card/widget!**

When creating metric grids inside cards (Financial Summary, Stats Box, etc.):
- ✅ **USE**: `display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)'`
- ❌ **NEVER**: `md={3}` or `md={4}` inside cards
- ❌ **NEVER**: More than 2 columns in width-constrained containers

**Why:** Cards are 320px-600px wide. 3-4 columns cause text overlap and unreadable content.

**Example from EscrowCard.jsx:**
```jsx
{/* ✅ CORRECT - 2×2 grid inside card */}
<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 1 }}>
  <Box>{/* Price */}</Box>
  <Box>{/* Commission */}</Box>
  <Box>{/* Acceptance Date */}</Box>
  <Box>{/* Close Date */}</Box>
</Box>
```

### Rule #2: Grid View Uses `auto-fit` for Responsive Columns

Dashboard grid automatically adjusts 1-2-3-4 columns based on viewport:

```jsx
// DashboardContent.jsx
gridTemplateColumns: viewMode === 'grid'
  ? 'repeat(auto-fit, minmax(320px, 1fr))'  // ✅ Auto-adjusts columns
  : '1fr'  // List/table = full width
```

**Result:**
- 320px cards
- 5px gap between cards
- Automatically fits: 4 cols (wide) → 3 cols (medium) → 2 cols (tablet) → 1 col (mobile)

---

## 🎯 Current Template System Patterns

### Dashboard Template (Config-Driven)

Your dashboards now use the template system - no manual responsive code needed!

---

## 🔧 Usage Examples

### Example 1: Dashboard Template (Current System)

```jsx
// 1. Create entity config (config/entities/escrows.config.js)
export const escrowsConfig = createEntityConfig({
  entity: { name: 'escrow', namePlural: 'escrows' },
  dashboard: { /* stats, filters */ }
});

// 2. Create dashboard (3 lines!)
import { DashboardTemplate } from '@/templates/Dashboard';

const EscrowsDashboard = () => (
  <DashboardTemplate
    config={escrowsConfig}
    CardComponent={EscrowCard}  // 320px wide cards
  />
);
```

**Template automatically handles:**
- ✅ Grid view: `auto-fit` with 320px cards (1-4 columns responsive)
- ✅ List view: Full-width rows with images
- ✅ Table view: Compact table rows
- ✅ Stats calculation from filtered data
- ✅ Status tabs, scope filters, date ranges
- ✅ No manual breakpoint code needed!

### Example 2: Entity Card Component (Manual Responsive)

```jsx
import { useMediaQuery, useTheme } from '@mui/material';

function EscrowCard({ escrow, viewMode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <Card sx={{ width: 320 }}>  {/* Fixed 320px for grid view */}
      {/* 2×2 metrics grid (NEVER more than 2 cols in cards!) */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',  // Always 2 columns
        gap: 1
      }}>
        <Box>{/* Price */}</Box>
        <Box>{/* Commission */}</Box>
        <Box>{/* Acceptance */}</Box>
        <Box>{/* Close Date */}</Box>
      </Box>
    </Card>
  );
}
```

**Key Points:**
- Cards are 320px wide (fits 4 across on large screens)
- Internal grid is ALWAYS 2×2 (prevents text overlap)
- Use Material-UI breakpoints instead of custom hook

### Example 3: Stat Cards in Hero (Full Width - OK for 4 Columns)

```jsx
// DashboardStats.jsx - Stats in hero card (full page width)
<Box sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',               // Mobile: 1 column
    sm: 'repeat(2, 1fr)',    // Tablet: 2 columns
    md: 'repeat(3, 1fr)',    // Medium: 3 columns
    lg: 'repeat(4, 1fr)',    // Desktop: 4 columns
  },
  gap: 3,
  width: '100%',  // ← Full page width, not inside card
}}>
  <DashboardStatCard stat={stat1} />
  <DashboardStatCard stat={stat2} />
  <DashboardStatCard stat={stat3} />
  <DashboardStatCard stat={stat4} />
</Box>
```

**When 4 columns is OK:**
- ✅ Hero card (full page width)
- ✅ Page-level stats row
- ❌ Inside a widget card (causes overlap!)

### Example 4: Metrics Inside a Card (⚠️ CRITICAL)

```jsx
import useResponsiveLayout from '../hooks/useResponsiveLayout';

function FinancialSummaryCard() {
  const { layouts } = useResponsiveLayout();

  return (
    <Card>
      <CardContent>
        {/* ❌ WRONG - Will cause text overlap! */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>  {/* 4 columns = overlap */}
            <Typography>Purchase Price</Typography>
            <Typography variant="h4">$650,000</Typography>
          </Grid>
          {/* ... 3 more items */}
        </Grid>

        {/* ✅ CORRECT - Always 2×2 grid */}
        <Box sx={layouts.statsGrid2x2}>
          <Box>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              Purchase Price
            </Typography>
            <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              $650,000
            </Typography>
          </Box>
          {/* ... 3 more items */}
        </Box>
      </CardContent>
    </Card>
  );
}
```

**Result:**
- ✅ No text overlap at any width
- ✅ Always 2×2 grid (never squished)
- ✅ Responsive typography scales smoothly

### Example 5: Form Layout

```jsx
<ResponsiveGrid variant="form">
  <TextField label="First Name" />
  <TextField label="Last Name" />
  <TextField label="Email" />
  <TextField label="Phone" />
</ResponsiveGrid>
```

**Result:**
- Mobile: Stacked (1 column)
- Desktop: Side-by-side (2 columns)

---

## 📊 Breakpoint Reference

| Name | Range | Device | Columns | Gap | Usage |
|------|-------|--------|---------|-----|-------|
| **xs** | 0-600px | Phone portrait | 1 | 16px | Single column, large buttons |
| **sm** | 600-900px | Phone landscape | 1-2 | 20px | Auto-wrap grids |
| **md** | 900-1200px | Tablet | 2-3 | 24px | 2-column layouts |
| **lg** | 1200-1536px | Desktop | 3-4 | 32px | Full layouts |
| **xl** | 1536px+ | Large desktop | 4+ | 40px | Show sidebars |

---

## 🎨 Hook API Reference

### Device Detection

```jsx
const {
  isMobile,          // true if xs (0-600px)
  isTablet,          // true if sm or md (600-1200px)
  isDesktop,         // true if lg or xl (1200px+)
  isMobileOrTablet,  // true below 900px
  breakpoint,        // Current breakpoint name: 'xs', 'sm', 'md', 'lg', 'xl'
} = useResponsiveLayout();
```

### Spacing (in theme.spacing units, multiply by 8 for px)

```jsx
const { spacing } = useResponsiveLayout();

spacing.gap        // 2 → 5   (16px → 40px)
spacing.container  // 2 → 6   (16px → 48px)
spacing.section    // 3 → 8   (24px → 64px)
spacing.card       // 2 → 4   (16px → 32px)
spacing.compact    // 1 → 2.5 (8px → 20px)
```

### Sizing

```jsx
const { sizing } = useResponsiveLayout();

sizing.minWidgetWidth  // 100% → 320px (prevents squishing)
sizing.touchTarget     // 48px mobile, 40px desktop
sizing.iconMedium      // 24px mobile, 20px desktop
sizing.avatarLarge     // 80px mobile, 64px desktop
sizing.borderRadius    // 12px → 24px
```

### Typography (CSS clamp values)

```jsx
const { typography } = useResponsiveLayout();

<Typography sx={{ fontSize: typography.h1 }}>
  // Fluid heading: 28px → 48px
</Typography>

<Typography sx={{ fontSize: typography.body }}>
  // Fluid body: 14px → 16px
</Typography>
```

### Grid Helpers

```jsx
const { gridColumns, autoFitGrid } = useResponsiveLayout();

// Fixed columns at each breakpoint
gridTemplateColumns: gridColumns(1, 2, 3, 4)
// Result: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', ... }

// Auto-wrapping grid (prevents squishing)
gridTemplateColumns: autoFitGrid(300)
// Result: { xs: '1fr', sm: 'repeat(auto-fit, minmax(300px, 1fr))' }
```

### Show/Hide Helpers

```jsx
const { show, hide } = useResponsiveLayout();

// Hide sidebar on mobile
<Box sx={hide.onMobile}>...</Box>

// Show mobile menu only on mobile
<Box sx={show.onMobile}>...</Box>

// Available options:
show.onMobile              // xs only
show.onTablet              // sm-md only
show.onDesktop             // lg+ only
show.onMobileAndTablet     // xs-md (below lg)
show.onTabletAndDesktop    // sm+ (above xs)

// Same for hide.*
```

### Layout Presets

```jsx
const { layouts } = useResponsiveLayout();

// Pre-configured layout styles
<Box sx={layouts.cardGrid}>...</Box>     // Auto-fit cards
<Box sx={layouts.widgetGrid}>...</Box>   // 2×2 widgets
<Box sx={layouts.statsRow}>...</Box>     // 1-2-3-4 columns
<Box sx={layouts.formGrid}>...</Box>     // 1 col mobile, 2 col desktop
<Box sx={layouts.sidebarLayout}>...</Box> // Flex with sidebar
```

---

## 🚀 ResponsiveGrid Variants

```jsx
<ResponsiveGrid variant="widgets">   // 2×2 grid, wraps on tablet
<ResponsiveGrid variant="cards">     // Auto-fit everywhere
<ResponsiveGrid variant="stats">     // 1-2-3-4 columns
<ResponsiveGrid variant="form">      // 1 col mobile, 2 col desktop
<ResponsiveGrid variant="dense">     // 2-3-4-6 columns (small items)
<ResponsiveGrid variant="masonry">   // Auto-fill with gap filling
```

### Custom MinWidth

```jsx
// Prevent squishing below 350px
<ResponsiveGrid variant="cards" minWidth={350}>
  <LargeCard />
  <LargeCard />
</ResponsiveGrid>
```

---

## ✅ Best Practices

### DO:
- ✅ Use `ResponsiveGrid` for all grid layouts
- ✅ Use `spacing` values from the hook (auto-adapt)
- ✅ Set `minWidth` on complex widgets (prevent squishing)
- ✅ Hide sidebars at `xl` breakpoint (1536px)
- ✅ Use `autoFitGrid()` when you want wrapping behavior
- ✅ Test by resizing browser from 320px to 1920px

### DON'T:
- ❌ Don't hardcode pixel spacing (use `spacing` values)
- ❌ Don't use only 2 breakpoints (xs/md) - use all 5!
- ❌ Don't hide sidebars too early (causes wasted space)
- ❌ Don't hide sidebars too late (causes squishing)
- ❌ Don't forget `minWidth` on cards/widgets
- ❌ Don't use `repeat(auto-fill)` without `minmax()`

---

## 🎯 Common Patterns

### Pattern 1: Dashboard with Sidebar

```jsx
function Dashboard() {
  const { layouts, hide, spacing } = useResponsiveLayout();

  return (
    <Box sx={layouts.sidebarLayout}>
      {/* Hide sidebar below 1536px */}
      <Box sx={hide.onTabletAndMobile} width={280}>
        <Sidebar />
      </Box>

      {/* Main content */}
      <Box flex={1} p={spacing.container}>
        <ResponsiveGrid variant="widgets">
          <Widget1 />
          <Widget2 />
          <Widget3 />
          <Widget4 />
        </ResponsiveGrid>
      </Box>
    </Box>
  );
}
```

### Pattern 2: Adaptive Card Padding

```jsx
function Card() {
  const { spacing, sizing } = useResponsiveLayout();

  return (
    <Paper
      sx={{
        p: spacing.card,           // 16px → 32px
        borderRadius: sizing.borderRadius / 8, // 1.5 → 3 (12px → 24px)
      }}
    >
      Content
    </Paper>
  );
}
```

### Pattern 3: Touch-Friendly Buttons

```jsx
function ActionBar() {
  const { sizing, isMobile } = useResponsiveLayout();

  return (
    <Button
      sx={{
        minWidth: sizing.touchTarget,  // 48px mobile, 40px desktop
        minHeight: sizing.touchTarget,
      }}
      size={isMobile ? 'large' : 'medium'}
    >
      Submit
    </Button>
  );
}
```

---

## 🔍 Debugging

### Check Current Breakpoint

```jsx
const { breakpoint } = useResponsiveLayout();
console.log('Current breakpoint:', breakpoint); // 'xs', 'sm', 'md', 'lg', 'xl'
```

### Visualize Responsive Behavior

```jsx
const { isMobile, isTablet, isDesktop, breakpoint } = useResponsiveLayout();

return (
  <Box sx={{ position: 'fixed', bottom: 16, right: 16, p: 2, bgcolor: 'background.paper' }}>
    <Typography>Breakpoint: {breakpoint}</Typography>
    <Typography>Mobile: {isMobile ? '✅' : '❌'}</Typography>
    <Typography>Tablet: {isTablet ? '✅' : '❌'}</Typography>
    <Typography>Desktop: {isDesktop ? '✅' : '❌'}</Typography>
  </Box>
);
```

---

## 🎨 Perfectionist vs. Pragmatist

### What MATTERS:
1. ✅ Readable text (never below 14px)
2. ✅ Clickable buttons (48×48px minimum on mobile)
3. ✅ No horizontal scroll
4. ✅ Logical wrapping (next row, not squished)
5. ✅ Performance (no huge images on mobile)

### What DOESN'T Matter:
1. ❌ Pixel-perfect alignment across all breakpoints
2. ❌ Exact spacing (24px vs 25px)
3. ❌ Typography matching desktop exactly
4. ❌ Every widget having same height
5. ❌ Animations on mobile (disable for performance)

---

## 📱 Testing Checklist

Test your component at these widths:

- [ ] **320px** - iPhone SE (smallest)
- [ ] **375px** - iPhone 12/13 Mini
- [ ] **428px** - iPhone 14 Pro Max
- [ ] **768px** - iPad Portrait
- [ ] **1024px** - iPad Landscape
- [ ] **1366px** - Laptop
- [ ] **1920px** - Desktop
- [ ] **2560px** - Large Desktop (sidebars visible)

**Quick Test:** Resize browser from 320px → 2560px. Everything should look good the entire way.

---

## 🚀 Migration Guide

### Before (Manual Breakpoints):

```jsx
const WidgetGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  [theme.breakpoints.up('xs')]: {
    gridTemplateColumns: '1fr',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}));
```

### After (useResponsiveLayout):

```jsx
import ResponsiveGrid from '../components/common/ResponsiveGrid';

<ResponsiveGrid variant="widgets" minWidth={320}>
  {/* Components */}
</ResponsiveGrid>
```

**Benefits:**
- ✅ No more manual breakpoint code
- ✅ Automatic wrapping (prevents squishing)
- ✅ Adaptive spacing
- ✅ Consistent across entire app

---

## 💡 Pro Tips

1. **Always use `minWidth`** on widgets to prevent squishing
2. **Hide sidebars at `xl`** (1536px), not `lg` (1200px)
3. **Use `autoFitGrid()`** when you want flexible wrapping
4. **Use `gridColumns()`** when you want fixed columns
5. **Test on real devices**, not just browser resize
6. **Disable animations on mobile** for better performance
7. **Use fluid typography** (`clamp()`) for scalable text
8. **Prefer wrapping over scrolling** horizontally

---

## 📝 Summary: Template System = Automatic Responsiveness

**Your current architecture:**
- Dashboard templates handle responsive layout automatically
- Cards are fixed 320px width
- Grid uses `auto-fit` to adjust columns (1-4)
- List/table views are full-width
- No manual breakpoint code in most components

**When you DO need manual responsive code:**
- Custom card components (EscrowCard, ClientCard, etc.)
- Detail page layouts
- Modals and dialogs
- Complex custom widgets

**When you DON'T need it:**
- Dashboard grids (template handles it)
- Stats display (template handles it)
- Navigation/filters (template handles it)

---

**Created:** October 18, 2025
**Updated:** November 8, 2025 (for template system)
**Author:** Real Estate CRM Team
**Version:** 2.0
