# Dashboard Refactoring Guide

**Created:** October 17, 2025
**Purpose:** Repeatable pattern for refactoring monolithic dashboard components
**Status:** Active Reference

## 📊 Current Dashboard Status

| Dashboard | Lines | Status | Priority |
|-----------|-------|--------|----------|
| **EscrowsDashboard** | ~~3,914~~ → 1,115 | ✅ REFACTORED | Complete |
| **ListingsDashboard** | 2,631 | 🔴 Needs Refactor | HIGH |
| **ClientsDashboard** | 2,439 | 🔴 Needs Refactor | HIGH |
| **LeadsDashboard** | 2,413 | 🔴 Needs Refactor | HIGH |
| **AppointmentsDashboard** | 2,334 | 🔴 Needs Refactor | HIGH |
| **HomeDashboard** | 1,188 | 🟡 Consider Refactor | MEDIUM |

## 🏗️ Standard Folder Structure

```
dashboards/
└── [module]/                        # e.g., escrows, listings, clients
    ├── index.jsx                    # Main dashboard component (orchestrator)
    ├── components/
    │   ├── [Module]HeroCard.jsx    # Hero section with main CTAs
    │   ├── [Module]StatsCards.jsx  # Statistics and metrics
    │   ├── [Module]Navigation.jsx  # Tabs, filters, view modes
    │   ├── [Module]Content.jsx     # Main content display area
    │   ├── [Module]DebugPanel.jsx  # Admin-only debug info
    │   └── [Module]Common.jsx      # Shared small components
    ├── hooks/
    │   └── use[Module]Handlers.js  # Event handlers and business logic
    └── utils/
        └── [module]Utils.js        # Pure utility functions
```

## 📦 Component Breakdown Pattern

Based on successful escrows refactoring, each monolithic dashboard should be split into:

### 1. **HeroCard Component** (~300 lines)
- Gradient hero section
- Module title and count
- Date range filters
- Primary CTA button
- Quick stats preview

### 2. **StatsCards Component** (~600 lines)
- 4-6 metric cards
- Visual indicators (charts, progress bars)
- Comparison metrics (vs last period)
- Status-based filtering

### 3. **Navigation Component** (~500 lines)
- Tab navigation for statuses
- Scope selector (user/team/brokerage)
- Sort options
- View mode toggles (grid/list/table)
- Mobile-responsive design

### 4. **Content Component** (~500 lines)
- Main data display
- Card/list/table views
- Pagination or infinite scroll
- Empty states
- Loading states

### 5. **DebugPanel Component** (~400 lines)
- Admin-only visibility
- Network monitoring
- Data export
- Debug information
- Performance metrics

### 6. **Common Components** (~100 lines)
- Mini components (e.g., MiniContactCard)
- Helper functions (e.g., getInitials)
- Shared styled components

### 7. **Custom Hook** (~250 lines)
```javascript
export const use[Module]Handlers = ({
  items,
  setItems,
  // ... other state
}) => {
  const navigate = useNavigate();

  const handleItemClick = useCallback((id) => {
    navigate(`/${module}/${id}`);
  }, [navigate]);

  const handleArchive = async (id) => {
    // Archive logic
  };

  const handleRestore = async (id) => {
    // Restore logic
  };

  const handleUpdate = async (id, data) => {
    // Update logic
  };

  return {
    handleItemClick,
    handleArchive,
    handleRestore,
    handleUpdate,
    // ... other handlers
  };
};
```

### 8. **Utility Functions** (~250 lines)
```javascript
// Date utilities
export const safeParseDate = (date) => { /* ... */ };
export const detectPresetRange = (start, end) => { /* ... */ };

// Data processing
export const filterItemsByStatus = (items, status) => { /* ... */ };
export const sortItems = (items, sortBy) => { /* ... */ };
export const generateChartData = (items) => { /* ... */ };
```

## 🔄 Refactoring Process

### Phase 1: Analysis
1. Run line count: `wc -l [Dashboard].jsx`
2. Identify major sections
3. Find duplicate code patterns
4. List all event handlers
5. Document component dependencies

### Phase 2: Setup Structure
```bash
# Create folder structure
mkdir -p dashboards/[module]/{components,hooks,utils}
```

### Phase 3: Extract Components (Order Matters!)
1. **Extract HeroCard first** - Usually standalone
2. **Extract StatsCards** - May depend on stats calculation
3. **Extract Navigation** - Controls for filtering/sorting
4. **Extract Content** - Main display logic
5. **Extract DebugPanel** - Admin features
6. **Extract Common Components** - Shared pieces
7. **Create Custom Hook** - Event handlers
8. **Create Utils** - Pure functions

### Phase 4: Update Main Component
1. Move file to `index.jsx`
2. Import all extracted components
3. Remove extracted code
4. Keep only orchestration logic
5. Update import paths

### Phase 5: Fix Import Paths
```javascript
// Old (when in dashboards/)
import { escrowsAPI } from '../../services/api.service';

// New (when in dashboards/escrows/)
import { escrowsAPI } from '../../../services/api.service';
```

### Phase 6: Update External Imports
```javascript
// App.jsx
- import EscrowsDashboard from './components/dashboards/EscrowsDashboard';
+ import EscrowsDashboard from './components/dashboards/escrows';

// App.lazy.jsx (if using code splitting)
- lazy(() => import('./components/dashboards/EscrowsDashboard'))
+ lazy(() => import('./components/dashboards/escrows'))
```

### Phase 7: Test & Deploy
```bash
npm run build
git add -A
git commit -m "Refactor [Module]Dashboard into modular components"
git push
```

## 📈 Expected Results

Based on escrows refactoring:
- **Main file reduction:** 70-75%
- **Better code organization:** 8-9 focused files instead of 1 massive file
- **Improved maintainability:** Easy to find and fix issues
- **Reusability:** Components can be shared across modules
- **Performance:** Better code splitting potential

## 🎯 Next Steps

1. **Refactor ListingsDashboard** (2,631 lines)
2. **Refactor ClientsDashboard** (2,439 lines)
3. **Refactor LeadsDashboard** (2,413 lines)
4. **Refactor AppointmentsDashboard** (2,334 lines)
5. **Consider HomeDashboard** (1,188 lines - may not need full refactor)

## 💡 Tips & Best Practices

1. **Don't create duplicate files** - Always move and rename
2. **Test after each extraction** - Catch issues early
3. **Keep consistent naming** - Use [Module] prefix consistently
4. **Document as you go** - Add JSDoc comments to new components
5. **Preserve functionality** - Don't change behavior during refactor
6. **Update tests** - If tests exist, update import paths

## 🚫 Common Pitfalls to Avoid

1. **Circular dependencies** - Be careful with import order
2. **Missing state updates** - Ensure all state setters are passed down
3. **Event handler binding** - Use useCallback for performance
4. **Import path errors** - Count the `../` carefully
5. **Forgetting external imports** - Update App.jsx and routing files

## 📝 Checklist Template

```markdown
### Refactoring [Module]Dashboard Checklist

- [ ] Create folder structure: `dashboards/[module]/{components,hooks,utils}`
- [ ] Extract HeroCard component
- [ ] Extract StatsCards component
- [ ] Extract Navigation component
- [ ] Extract Content component
- [ ] Extract DebugPanel component
- [ ] Extract Common components
- [ ] Create use[Module]Handlers hook
- [ ] Create [module]Utils.js
- [ ] Move main file to index.jsx
- [ ] Update all import paths
- [ ] Update App.jsx import
- [ ] Update App.lazy.jsx import (if applicable)
- [ ] Test build: `npm run build`
- [ ] Verify functionality in browser
- [ ] Commit and push changes
```

## 📊 Success Metrics

A successful refactor should achieve:
- ✅ 60-75% reduction in main file size
- ✅ 8-10 focused component files
- ✅ All tests passing
- ✅ No functionality changes
- ✅ Improved developer experience
- ✅ Clean folder organization

---

*This guide is based on the successful refactoring of EscrowsDashboard.jsx from 3,914 lines to 1,115 lines (71.5% reduction) completed on October 17, 2025.*