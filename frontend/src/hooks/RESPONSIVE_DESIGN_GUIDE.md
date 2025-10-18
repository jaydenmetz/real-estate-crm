# 📐 Ultimate Responsive Design Guide

## 🎯 Quick Start - The ONE Prompt

**Copy-paste this into any component request:**

```
Make this fully responsive using our useResponsiveLayout() hook:
- Mobile (0-600px): Single column, large touch targets
- Tablet (600-1200px): Auto-wrap when widgets get below 300px
- Desktop (1200px+): Full multi-column layout
- Sidebars hide below 1536px (xl breakpoint)
- No content squishing - wrap to next row instead
```

---

## 🔧 Usage Examples

### Example 1: Basic Responsive Grid

```jsx
import ResponsiveGrid from '../components/common/ResponsiveGrid';

// Widgets that auto-wrap when too narrow
<ResponsiveGrid variant="widgets" minWidth={320}>
  <Widget1 />
  <Widget2 />
  <Widget3 />
  <Widget4 />
</ResponsiveGrid>
```

**Result:**
- Mobile: 1 column
- Tablet (600-900px): Auto-fits (wraps at 320px min)
- Desktop (900px+): Locked 2×2 grid

### Example 2: Using the Hook Directly

```jsx
import useResponsiveLayout from '../hooks/useResponsiveLayout';

function MyComponent() {
  const { spacing, sizing, isMobile, hide } = useResponsiveLayout();

  return (
    <Box
      sx={{
        padding: spacing.container,  // Auto-adapts: 16px → 48px
        gap: spacing.gap,             // Auto-adapts: 16px → 40px
      }}
    >
      {/* Hide sidebar on mobile */}
      <Box sx={hide.onMobileAndTablet}>
        <Sidebar />
      </Box>

      {/* Touch-friendly button size */}
      <Button sx={{ minWidth: sizing.touchTarget }}>
        Click Me
      </Button>
    </Box>
  );
}
```

### Example 3: Stats Row (1-2-3-4 Columns)

```jsx
<ResponsiveGrid variant="stats">
  <StatCard title="Revenue" value="$120K" />
  <StatCard title="Deals" value="42" />
  <StatCard title="Leads" value="156" />
  <StatCard title="Conversion" value="32%" />
</ResponsiveGrid>
```

**Result:**
- Mobile (xs): 1 column
- Tablet (sm): 2 columns
- Tablet (md): 3 columns
- Desktop (lg+): 4 columns

### Example 4: Form Layout

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

Created: October 18, 2025
Author: Claude + useResponsiveLayout()
Version: 1.0
