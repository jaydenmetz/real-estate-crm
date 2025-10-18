# Escrow Detail Page Refactoring - Phase 1 Analysis

**Date:** October 18, 2025
**Current File:** `frontend/src/components/escrow-detail/EscrowDetailPage.jsx`
**Lines:** 414
**Target Location:** `frontend/src/pages/escrow-detail/`

## Current Component Structure

### State Management
- `activeTab` (0 = Dashboard, 1 = Data Editor)
- `expandedWidget` (which widget is expanded)
- `isRefreshing` (refresh animation state)
- Data from `useEscrowData(id)` hook:
  - `data` - escrow data object
  - `loading` - loading state
  - `error` - error state
  - `refetch` - function to reload data
  - `updateSection` - function to update specific section
  - `hasUnsavedChanges` - boolean for unsaved edits
  - `saveAllChanges` - function to save all edits

### Widgets Currently Used (Dashboard Tab)
1. **DetailsWidget** - Escrow details (2-column span)
   - Props: `data, expanded, onExpand, onUpdate`
   - Data: `data.details`

2. **PropertyWidget** - Property information (2-column span)
   - Props: `data, expanded, onExpand, onUpdate`
   - Data: `data['property-details']`

3. **PeopleWidget** - People involved (1-column)
   - Props: `data, expanded, onExpand, onUpdate`
   - Data: `data.people`

4. **TimelineWidget** - Timeline/milestones (1-column)
   - Props: `data, expanded, onExpand, onUpdate`
   - Data: `data.timeline`

5. **FinancialsWidget** - Financial information (2-column span)
   - Props: `data, expanded, onExpand, onUpdate`
   - Data: `data.financials`

6. **ChecklistWidget** (3 instances) - Checklists (1-column each)
   - Loan Checklist - `data['checklist-loan']`
   - House Checklist - `data['checklist-house']`
   - Admin Checklist - `data['checklist-admin']`

### Data Editor Tab
- **DataEditorView** component
- Props: `data, onUpdate, hasUnsavedChanges`

### Header Actions
- Back button (navigate to /escrows)
- Save button (only shown when hasUnsavedChanges on Data Editor tab)
- Refresh button
- Dark mode toggle

## Data Structure from API

```javascript
{
  details: {
    escrowNumber: string,
    propertyAddress: string,
    status: string,
    // ... other details
  },
  'property-details': {
    // property information
  },
  people: {
    // people involved
  },
  timeline: {
    // timeline/milestones
  },
  financials: {
    // financial data
  },
  'checklist-loan': {
    // loan checklist items
  },
  'checklist-house': {
    // house checklist items
  },
  'checklist-admin': {
    // admin checklist items
  }
}
```

## Current Grid Layout

Desktop (lg+): 4 columns
- Details: span 2
- Property: span 2
- People: span 1
- Timeline: span 1
- Financials: span 2
- Loan Checklist: span 1
- House Checklist: span 1
- Admin Checklist: span 1

## Refactoring Target Layout (Per Mockup)

```
┌─────────────────────────────────────────────────────────┐
│ Navigation: [Dashboard Tab] [Data Editor Tab]          │
├─────────────────────────────────────────────────────────┤
│ Hero Card (Property image + 4 stat cards + actions)    │
├─────────┬───────────────────────────────────┬──────────┤
│ Left    │ Main Content (2x2 grid)          │ Right    │
│ Sidebar │ ┌────────┬────────┐              │ Sidebar  │
│         │ │Timeline│Finance │              │          │
│ - AI    │ ├────────┼────────┤              │ - Auto   │
│ - Notes │ │People  │Progress│              │ - Quick  │
│ - Tasks │ └────────┴────────┘              │ - Health │
│         │                                   │          │
│         │ Activity Feed                     │          │
└─────────┴───────────────────────────────────┴──────────┘
```

## Components to Extract

### Phase 2: Hero Card
**File:** `components/EscrowHeroCard.jsx`
**Content:**
- Property image
- Property address
- Escrow number
- Status badge
- 4 stat cards (Purchase Price, Commission, Close Date, Next Deadline)
- Action buttons (Email, Generate Statement, More)

**Props:**
```javascript
{
  escrow: object,
  onEmailParties: func,
  onGenerateStatement: func,
  onMoreActions: func
}
```

### Phase 3: Sidebars
**Left:** `components/EscrowLeftSidebar.jsx`
- AI Assistant card
- Quick Notes
- Reminders

**Right:** `components/EscrowRightSidebar.jsx`
- Automations
- Quick Actions
- Deal Health

### Phase 4: Main Content
**File:** `components/EscrowMainContent.jsx`
- 2x2 grid:
  - TimelineWidget (reuse existing)
  - FinancialsWidget (reuse existing)
  - PeopleWidget (reuse existing)
  - ProgressWidget (new - combine checklists)

### Phase 5: Activity Feed
**File:** `components/EscrowActivityFeed.jsx`
- Activity timeline
- Load more
- Filter/export

### Phase 6: Handlers & Utils
**Hooks:**
- `hooks/useEscrowHandlers.js` - Event handlers

**Utils:**
- `utils/escrowDetailUtils.js` - Utility functions

### Phase 7: Update Main Page
- Import all components
- Clean architecture
- Test and commit

## Success Criteria
- ✅ Build succeeds
- ✅ All functionality preserved
- ✅ Matches mockup design
- ✅ Main file reduced to 300-350 lines
- ✅ Clean component architecture
