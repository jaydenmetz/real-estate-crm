# Widget Template System

**Purpose:** Standardized, reusable card/widget components across all CRM modules
**Created:** October 4, 2025
**Last Updated:** October 4, 2025

## Overview

This system defines three widget sizes that can display database items (escrows, listings, clients, appointments, leads) in progressively more detailed views. Users can toggle between views using the Grid/Medium/Large buttons in the tab bar.

## Design Philosophy

1. **Progressive Disclosure** - Small → Medium → Large shows increasingly more data
2. **Consistent Layout** - Same visual structure across all modules
3. **Responsive Design** - Adapts to screen size while maintaining ratio
4. **Scannable Information** - Key data always visible, details on demand
5. **Action-Oriented** - Quick actions available in all views

---

## Widget Size Specifications

### Small Widget (Grid View)
**Layout:** 4 cards per row at desktop (1440px+)
**Grid:** `minmax(320px, 1fr)` - auto-fills based on container width
**Height:** Fixed 240-280px
**Use Case:** Quick overview, scanning many items

**Structure:**
```
┌─────────────────────────────┐
│ Icon/Image    Status Badge  │
│                              │
│ Primary Title (Bold)         │
│ Secondary Subtitle           │
│                              │
│ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │Stat1│ │Stat2│ │Stat3│    │
│ └─────┘ └─────┘ └─────┘    │
│                              │
│ Progress Bar (if applicable) │
│                              │
│ [Action] [Action]            │
└─────────────────────────────┘
```

**Data Limits:**
- Title: 1 line (truncate with ellipsis)
- Subtitle: 1 line
- Stats: 3-4 key metrics only
- Actions: 2 primary buttons max

---

### Medium Widget
**Layout:** 2 cards per row at desktop (1440px+)
**Grid:** `minmax(500px, 1fr)` - auto-fills
**Height:** Flexible (min 320px, grows with content)
**Use Case:** Moderate detail, comparison between items

**Structure:**
```
┌───────────────────────────────────────────────────────┐
│ Icon/Image          Primary Title (Bold)   [Status]   │
│                     Secondary Subtitle                 │
│                                                        │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│ │ Stat 1 │ │ Stat 2 │ │ Stat 3 │ │ Stat 4 │         │
│ │ Label  │ │ Label  │ │ Label  │ │ Label  │         │
│ └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                        │
│ Detail Row 1: Label          Value                    │
│ Detail Row 2: Label          Value                    │
│ Detail Row 3: Label          Value                    │
│ Detail Row 4: Label          Value                    │
│                                                        │
│ Progress Bar (if applicable)                          │
│                                                        │
│ [Action 1] [Action 2] [Action 3]                      │
└───────────────────────────────────────────────────────┘
```

**Data Limits:**
- Title: 1-2 lines
- Stats: 4-6 key metrics with labels
- Detail Rows: 4-6 key-value pairs
- Actions: 3-4 buttons

---

### Large Widget
**Layout:** 1 card per row (full width)
**Grid:** Single column, full container width
**Height:** Flexible (400px+, grows with content)
**Use Case:** Complete detail view, all available information

**Structure:**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐  Primary Title (Bold, Large)                    [Status Badge]   │
│ │         │  Secondary Subtitle                                               │
│ │  Icon/  │  Tertiary info line                                               │
│ │  Image  │                                                                    │
│ └─────────┘  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│              │ Stat 1 │ │ Stat 2 │ │ Stat 3 │ │ Stat 4 │ │ Stat 5 │        │
│              │ Label  │ │ Label  │ │ Label  │ │ Label  │ │ Label  │        │
│              └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
│                                                                                │
│ ─────────── Section 1: Key Details ────────────                              │
│ Detail 1: Label                          Value                                │
│ Detail 2: Label                          Value                                │
│ Detail 3: Label                          Value                                │
│ Detail 4: Label                          Value                                │
│                                                                                │
│ ─────────── Section 2: Additional Info ─────────────                         │
│ Detail 5: Label                          Value                                │
│ Detail 6: Label                          Value                                │
│ Detail 7: Label                          Value                                │
│ Detail 8: Label                          Value                                │
│                                                                                │
│ ─────────── Section 3: Timeline/Progress ────────────                        │
│ Progress Bar with detailed labels                                             │
│ Timeline or milestone indicators                                              │
│                                                                                │
│ ─────────── Section 4: Notes/Description ────────────                        │
│ Multi-line text area with notes, description, or comments                     │
│                                                                                │
│ [Primary Action] [Action 2] [Action 3] [Action 4] [...More]                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Data Limits:**
- Title: 2-3 lines
- Stats: 5-8 metrics with labels
- Detail Rows: 12-20 key-value pairs (grouped into sections)
- Notes/Description: Multi-line (max 200 chars with "Read more")
- Actions: 4-6 buttons + overflow menu

---

## Responsive Breakpoints

### Small Widget
```javascript
gridTemplateColumns: {
  xs: '1fr',                    // Mobile: 1 per row
  sm: 'repeat(2, 1fr)',         // Tablet: 2 per row
  md: 'repeat(3, 1fr)',         // Small desktop: 3 per row
  lg: 'repeat(4, 1fr)',         // Desktop: 4 per row
}
```

### Medium Widget
```javascript
gridTemplateColumns: {
  xs: '1fr',                    // Mobile: 1 per row
  md: 'repeat(2, 1fr)',         // Tablet+: 2 per row
}
```

### Large Widget
```javascript
gridTemplateColumns: '1fr'      // Always 1 per row
```

---

## Implementation Template

### File Structure
```
frontend/src/components/common/
├── widgets/
│   ├── EscrowWidgetSmall.jsx
│   ├── EscrowWidgetMedium.jsx
│   ├── EscrowWidgetLarge.jsx
│   ├── ListingWidgetSmall.jsx
│   ├── ListingWidgetMedium.jsx
│   ├── ListingWidgetLarge.jsx
│   ├── ClientWidgetSmall.jsx
│   ├── ClientWidgetMedium.jsx
│   ├── ClientWidgetLarge.jsx
│   ├── AppointmentWidgetSmall.jsx
│   ├── AppointmentWidgetMedium.jsx
│   ├── AppointmentWidgetLarge.jsx
│   ├── LeadWidgetSmall.jsx
│   ├── LeadWidgetMedium.jsx
│   └── LeadWidgetLarge.jsx
```

### Component Template

```jsx
// EscrowWidgetSmall.jsx
import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, LinearProgress } from '@mui/material';
import { Home, AttachMoney, CalendarToday } from '@mui/icons-material';
import { motion } from 'framer-motion';

const EscrowWidgetSmall = ({ escrow, onClick, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        sx={{
          height: 260,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
        onClick={() => onClick && onClick(escrow.id)}
      >
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header: Icon + Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Home sx={{ fontSize: 28, color: 'primary.main' }} />
            <Chip
              label={escrow.status}
              size="small"
              color={escrow.status === 'active' ? 'success' : 'default'}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {/* Title + Subtitle */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {escrow.address}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {escrow.clientName}
          </Typography>

          {/* Stats Row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Price</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ${escrow.salePrice?.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Close</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {new Date(escrow.closeDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Days</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {escrow.daysRemaining || 'N/A'}
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={escrow.progressPercentage || 0}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* Actions */}
          <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" fullWidth>
              View
            </Button>
            <Button size="small" variant="text" fullWidth>
              Edit
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EscrowWidgetSmall;
```

---

## Escrow Module - Data Mapping

### Small Widget (Grid View)
**Fields Displayed (8-10 total):**
1. **Icon:** Home icon (top left)
2. **Status Badge:** Status chip (top right)
3. **Title:** Property address (truncated to 1 line)
4. **Subtitle:** Client name (truncated to 1 line)
5. **Stat 1:** Sale price (formatted currency)
6. **Stat 2:** Close date (MM/DD/YYYY)
7. **Stat 3:** Days remaining
8. **Progress Bar:** Percentage complete (based on timeline)
9. **Action 1:** View button
10. **Action 2:** Edit button

**Visual Priority:**
1. Address (largest, bold)
2. Status badge (color-coded)
3. Sale price (money is important)
4. Progress bar (visual progress indicator)

---

### Medium Widget
**Fields Displayed (16-18 total):**

**Header Section:**
1. Icon: Home icon (left)
2. Title: Property address (1-2 lines)
3. Subtitle: Client name
4. Status Badge: Status chip (right)

**Stats Row (4 stats):**
5. Sale Price (with $ icon)
6. Close Date (with calendar icon)
7. Days Remaining (with timer icon)
8. Commission (with money icon)

**Detail Rows (8 key-value pairs):**
9. **Open Date:** MM/DD/YYYY
10. **Escrow Company:** Company name
11. **Loan Amount:** $XXX,XXX
12. **Earnest Money:** $X,XXX
13. **Contingencies:** Active count
14. **Inspection Date:** MM/DD/YYYY or "N/A"
15. **Appraisal Date:** MM/DD/YYYY or "N/A"
16. **Agent:** Agent name

**Progress Section:**
17. Progress bar with percentage

**Actions (3 buttons):**
18. View Details | Edit | Archive

**Visual Enhancements:**
- Icons for each stat
- Color-coded status
- Hover effects
- Clickable entire card

---

### Large Widget
**Fields Displayed (25-30 total):**

**Header Section:**
1. Property Image/Icon (larger, left side)
2. Title: Property address (large, bold)
3. Subtitle: City, State, ZIP
4. Tertiary: MLS #
5. Status Badge (prominent, top right)

**Stats Row (6 stats with labels):**
6. Sale Price
7. Loan Amount
8. Down Payment
9. Close Date
10. Days Remaining
11. Commission Amount

**Section 1: Transaction Details**
12. Open Date
13. Close Date
14. Escrow Company
15. Escrow Number
16. Title Company
17. Transaction Type (Buy/Sell/Refinance)

**Section 2: Financial Details**
18. Earnest Money Deposit
19. Earnest Money Held By
20. Down Payment Amount
21. Loan Type
22. Lender Name
23. Loan Officer Name

**Section 3: Important Dates**
24. Inspection Date
25. Inspection Status (Pass/Fail/Pending)
26. Appraisal Date
27. Appraisal Value
28. Contingency Removal Date
29. Final Walkthrough Date

**Section 4: Parties Involved**
30. Buyer Name(s)
31. Buyer Agent
32. Seller Name(s)
33. Seller Agent
34. Listing Agent (if applicable)

**Section 5: Progress & Timeline**
35. Progress Bar (with milestones: Open → Inspection → Appraisal → Clear to Close → Closed)
36. Milestone indicators showing completed/pending/upcoming
37. Timeline visualization

**Section 6: Notes & Description**
38. Internal notes (multi-line, expandable)
39. Special instructions
40. Contingencies list

**Actions (6 buttons + overflow):**
- View Full Details
- Edit Transaction
- Upload Documents
- Add Note
- Send Update
- Archive
- **[•••]** More actions menu

**Visual Enhancements:**
- Dividers between sections
- Icons for every field
- Color-coded progress states
- Expandable sections for lengthy content
- Tooltips for abbreviations

---

## Implementation in Dashboard

### View Toggle Logic
```jsx
const [viewMode, setViewMode] = useState('small'); // 'small', 'medium', 'large'

// In render:
<ToggleButtonGroup
  value={viewMode}
  exclusive
  onChange={(e, newView) => newView && setViewMode(newView)}
  size="small"
>
  <ToggleButton value="small">
    <ViewModule sx={{ mr: 1 }} />
    Grid
  </ToggleButton>
  <ToggleButton value="medium">
    <ViewList sx={{ mr: 1 }} />
    Medium
  </ToggleButton>
  <ToggleButton value="large">
    <ViewAgenda sx={{ mr: 1 }} />
    Large
  </ToggleButton>
</ToggleButtonGroup>
```

### Container Grid Logic
```jsx
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns:
      viewMode === 'small'
        ? { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }
        : viewMode === 'medium'
        ? { xs: '1fr', md: 'repeat(2, 1fr)' }
        : '1fr',
    gap: 3,
  }}
>
  {escrows.map((escrow, index) => {
    if (viewMode === 'small') {
      return <EscrowWidgetSmall key={escrow.id} escrow={escrow} index={index} />;
    } else if (viewMode === 'medium') {
      return <EscrowWidgetMedium key={escrow.id} escrow={escrow} index={index} />;
    } else {
      return <EscrowWidgetLarge key={escrow.id} escrow={escrow} index={index} />;
    }
  })}
</Box>
```

---

## Module-Specific Adaptations

### Listings Module

**Small Widget:**
- Icon: Home
- Title: Property address
- Subtitle: MLS #
- Stats: Price, Beds/Baths, Sq Ft
- Status: Active/Pending/Sold

**Medium Widget:**
- Add: Days on market, price per sq ft, lot size, year built
- Detail rows: HOA fees, property type, school district

**Large Widget:**
- Add: Full property description, amenities list, neighborhood info
- Include: Virtual tour link, showing schedule, offer history

---

### Clients Module

**Small Widget:**
- Icon: Person avatar
- Title: Client name
- Subtitle: Client type (Buyer/Seller/Both)
- Stats: Active deals, lifetime value, last contact
- Status: Active/Inactive

**Medium Widget:**
- Add: Phone, email, preferred contact method, assigned agent
- Detail rows: Address, birthday, referral source, tags

**Large Widget:**
- Add: Full contact details, family members, communication log
- Include: Transaction history, preferences, notes timeline

---

### Appointments Module

**Small Widget:**
- Icon: Calendar icon
- Title: Appointment type
- Subtitle: Client name
- Stats: Date, time, duration
- Status: Scheduled/Completed/Cancelled

**Medium Widget:**
- Add: Location, agent assigned, confirmation status
- Detail rows: Property address (if applicable), notes, reminder set

**Large Widget:**
- Add: Full description, preparation checklist, outcome notes
- Include: Recurring pattern, attendees list, follow-up tasks

---

### Leads Module

**Small Widget:**
- Icon: TrendingUp
- Title: Lead name
- Subtitle: Lead source
- Stats: Lead score, days old, contact attempts
- Status: New/Contacted/Qualified/Lost

**Medium Widget:**
- Add: Phone, email, property interests, budget range
- Detail rows: Preferred areas, timeline, financing status

**Large Widget:**
- Add: Full activity log, email/call history, qualification notes
- Include: Property matches, competitor comparison, conversion probability

---

## Color & Theming Standards

### Status Colors
```javascript
const statusColors = {
  active: '#4caf50',      // Green
  pending: '#ff9800',     // Orange
  completed: '#2196f3',   // Blue
  cancelled: '#f44336',   // Red
  archived: '#9e9e9e',    // Grey
};
```

### Module Colors (from CLAUDE.md)
```javascript
const moduleColors = {
  escrows: '#1976d2',     // Blue
  listings: '#9c27b0',    // Purple
  clients: '#00897b',     // Teal
  appointments: '#f57c00', // Orange
  leads: '#e91e63',       // Pink
};
```

### Gradient Backgrounds
```javascript
// Hero section gradient for each module
background: `linear-gradient(135deg, ${moduleColor} 0%, ${lighten(moduleColor, 20)} 100%)`
```

---

## Animation Standards

### Card Entrance (Small/Medium/Large)
```javascript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.05 }}
  exit={{ opacity: 0, scale: 0.95 }}
>
```

### Hover Effects
```javascript
sx={{
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: 6,
  },
}}
```

### View Mode Transitions
```javascript
<AnimatePresence mode="wait">
  {/* Widget components */}
</AnimatePresence>
```

---

## Accessibility Standards

1. **Keyboard Navigation:**
   - All cards focusable with Tab
   - Enter/Space to activate
   - Arrow keys to navigate between cards

2. **Screen Reader Support:**
   - Semantic HTML (`<article>`, `<section>`)
   - ARIA labels for icons
   - Status announcements for changes

3. **Color Contrast:**
   - All text meets WCAG AA (4.5:1 for normal text)
   - Status badges use both color AND text

4. **Touch Targets:**
   - Minimum 44x44px for buttons
   - Adequate spacing between interactive elements

---

## Performance Considerations

### Virtualization
For lists with 50+ items, use `react-window` or `react-virtualized`:

```jsx
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={viewMode === 'small' ? 4 : viewMode === 'medium' ? 2 : 1}
  columnWidth={viewMode === 'small' ? 350 : viewMode === 'medium' ? 550 : 1100}
  height={600}
  rowCount={Math.ceil(escrows.length / columnCount)}
  rowHeight={viewMode === 'small' ? 260 : viewMode === 'medium' ? 320 : 450}
  width={containerWidth}
>
  {({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    const escrow = escrows[index];
    return (
      <div style={style}>
        {viewMode === 'small' && <EscrowWidgetSmall escrow={escrow} />}
        {/* ... */}
      </div>
    );
  }}
</FixedSizeGrid>
```

### Image Loading
```jsx
// Lazy load images in medium/large widgets
<img
  src={escrow.image}
  loading="lazy"
  alt={escrow.address}
/>
```

### Memoization
```jsx
// Prevent unnecessary re-renders
const EscrowWidgetSmall = React.memo(({ escrow, onClick, index }) => {
  // Component code
}, (prevProps, nextProps) => {
  return prevProps.escrow.id === nextProps.escrow.id &&
         prevProps.escrow.updatedAt === nextProps.escrow.updatedAt;
});
```

---

## Testing Checklist

### Visual Testing
- [ ] Small widget displays correctly at 1440px (4 per row)
- [ ] Medium widget displays correctly at 1440px (2 per row)
- [ ] Large widget displays correctly at 1440px (1 per row)
- [ ] Mobile responsive (320px - 1 per row for all)
- [ ] Tablet responsive (768px - 2 small, 1 medium, 1 large)
- [ ] Truncation works properly (ellipsis appears)
- [ ] Status colors match design system
- [ ] Hover effects smooth and performant

### Functional Testing
- [ ] Click card navigates to detail page
- [ ] Action buttons work independently
- [ ] View toggle switches correctly
- [ ] Progress bars calculate accurately
- [ ] Dates format correctly (timezone aware)
- [ ] Currency formats with commas and $ sign
- [ ] Empty states display when no data

### Performance Testing
- [ ] 50 cards render in < 1 second
- [ ] 100 cards render in < 2 seconds
- [ ] Smooth scrolling (60fps)
- [ ] View toggle transition smooth
- [ ] No layout shift on data load

### Accessibility Testing
- [ ] Tab navigation works
- [ ] Screen reader announces card content
- [ ] Focus visible on keyboard navigation
- [ ] Color contrast passes WCAG AA
- [ ] Touch targets minimum 44x44px

---

## Migration Guide

### Converting Existing Components

**Before (old EscrowCardGrid):**
```jsx
<EscrowCardGrid
  escrow={escrow}
  onClick={handleClick}
  showCommission={true}
/>
```

**After (new widget system):**
```jsx
{viewMode === 'small' && (
  <EscrowWidgetSmall
    escrow={escrow}
    onClick={handleClick}
    index={index}
  />
)}
{viewMode === 'medium' && (
  <EscrowWidgetMedium
    escrow={escrow}
    onClick={handleClick}
    index={index}
  />
)}
{viewMode === 'large' && (
  <EscrowWidgetLarge
    escrow={escrow}
    onClick={handleClick}
    index={index}
  />
)}
```

### Deprecation Timeline
1. **Phase 1 (Current):** Create new widget components alongside old
2. **Phase 2 (Next Sprint):** Update all dashboards to use new widgets
3. **Phase 3 (After Testing):** Remove old components (EscrowCardGrid, EscrowCompactCard, etc.)

---

## Future Enhancements

1. **Customizable Widgets**
   - User can drag/drop fields to customize what data appears
   - Save preferences per user

2. **Widget Templates**
   - Pre-built templates for different use cases
   - "Sales Manager View" vs "Agent View"

3. **Export/Print**
   - Print-optimized layout for large widgets
   - Export to PDF with formatting preserved

4. **Bulk Actions**
   - Checkbox selection in small/medium view
   - Multi-select actions toolbar

5. **Quick Edit**
   - Inline editing in medium/large views
   - Save without navigating to detail page

---

## Reference Implementation

**See:** `/Users/jaydenmetz/Desktop/real-estate-crm/frontend/src/components/dashboards/EscrowsDashboard.jsx`

**Current Status:**
- ✅ Small view: Using `EscrowCardGrid` (needs migration to `EscrowWidgetSmall`)
- ✅ Medium view: Using `EscrowCompactCard` (needs migration to `EscrowWidgetMedium`)
- ⚠️ Large view: Using old `EscrowCard` (needs migration to `EscrowWidgetLarge`)

**Next Steps:**
1. Create `EscrowWidgetSmall.jsx`, `EscrowWidgetMedium.jsx`, `EscrowWidgetLarge.jsx`
2. Update `EscrowsDashboard.jsx` to use new widgets
3. Test all three views
4. Replicate pattern for other 4 modules
