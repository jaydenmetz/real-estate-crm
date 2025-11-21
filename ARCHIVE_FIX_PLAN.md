# Archive Tab Fix Plan

## Problem Summary
1. **No stat cards showing in Archive tab** - Hero stat cards not rendering
2. **Infinite loop causing 429 errors** - Archive API called repeatedly
3. **Date range filtering not working** - Display start/end dates not filtering archived items
4. **Inconsistent behavior** - Archive should work like other status tabs (Active, Closed, Cancelled, All)

## Root Causes

### Backend Issues
1. **`onlyArchived` parameter**: Currently exists in backend but not properly integrated
2. **Date range filtering missing**: No `startDate`/`endDate` query parameters
3. **Date intersection logic missing**: Need to filter items where date ranges overlap

### Frontend Issues
1. **Separate archive query hook**: Creates infinite loop because it's not properly memoized/cached
2. **Hero stats not passed to archive view**: Archive tab doesn't receive `allData` for stat calculations
3. **Date filtering not sent to API**: `customStartDate`/`customEndDate` not passed as query params

## Solution Plan

### Phase 1: Backend - Add Date Range Filtering (30 min)
**File**: `backend/src/modules/core-modules/escrows/controllers/crud.controller.js`

**Changes**:
1. Add `startDate` and `endDate` query parameters to `getAllEscrows`
2. Implement date range intersection logic:
   ```sql
   -- Item shows if:
   -- (item_end_date >= display_start_date OR item_end_date IS NULL)
   -- AND
   -- (item_start_date <= display_end_date OR item_start_date IS NULL)

   WHERE (
     e.closing_date >= $X OR e.closing_date IS NULL
   ) AND (
     ${acceptanceDateField} <= $Y OR ${acceptanceDateField} IS NULL
   )
   ```
3. Apply date filter to **both archived and non-archived queries**
4. Date filter should work **across all status tabs** (Active, Closed, Cancelled, All, Archive)

**Query parameters to add**:
- `startDate`: Display start date (YYYY-MM-DD)
- `endDate`: Display end date (YYYY-MM-DD)
- `onlyArchived`: Already exists (true/false)

### Phase 2: Frontend - Unify Archive with Status Tabs (45 min)
**File**: `frontend/src/components/dashboards/escrows/index.jsx`

**Changes**:
1. **Remove separate archive API call** - Archive should use the same `useGetEscrows` hook
2. **Treat "archived" as a status** - Like "active", "closed", "cancelled", "all"
3. **Pass `onlyArchived=true` query param** when `selectedStatus === 'archived'`
4. **Pass date range params** from `customStartDate`/`customEndDate`:
   ```js
   const queryParams = {
     status: selectedStatus === 'archived' ? undefined : selectedStatus,
     onlyArchived: selectedStatus === 'archived',
     startDate: customStartDate ? format(customStartDate, 'yyyy-MM-dd') : undefined,
     endDate: customEndDate ? format(customEndDate, 'yyyy-MM-dd') : undefined,
   };
   ```

### Phase 3: Frontend - Fix Hero Stats for Archive (15 min)
**File**: `frontend/src/templates/Dashboard/components/DashboardHero.jsx`

**Current issue**: Hero receives `allData` but stat cards filter by status themselves.

**Solution**: Archive tab stat cards should:
1. Receive filtered data (only archived items)
2. Calculate stats from archived data
3. Use same stat card components as other tabs

**Changes**:
1. Ensure `allData` passed to hero includes archived items when `selectedStatus === 'archived'`
2. Stat cards already filter by status internally, so they'll work automatically

### Phase 4: Remove ArchiveBar Component (10 min)
**File**: `frontend/src/components/dashboards/escrows/index.jsx`

**Changes**:
1. Remove `<ArchiveBar>` component (not needed)
2. Archive should use standard `<DashboardNavigation>` like other tabs
3. "Archive" is just another status tab

## Date Range Filtering Logic

### Backend SQL (Intersection Logic)
```sql
-- Show item if its date range overlaps with display range
-- item: [acceptance_date, closing_date]
-- display: [startDate, endDate]

WHERE (
  -- Item ends after display starts (or no end date)
  (e.closing_date >= $startDate OR e.closing_date IS NULL)
) AND (
  -- Item starts before display ends (or no start date)
  (${acceptanceDateField} <= $endDate OR ${acceptanceDateField} IS NULL)
)
```

### Frontend Query Params
```js
const params = {
  status: selectedStatus === 'archived' ? undefined : (selectedStatus === 'all' ? undefined : selectedStatus),
  onlyArchived: selectedStatus === 'archived',
  startDate: customStartDate ? format(customStartDate, 'yyyy-MM-dd') : undefined,
  endDate: customEndDate ? format(customEndDate, 'yyyy-MM-dd') : undefined,
  scope: selectedScope,
};
```

## Implementation Order

1. ✅ **Backend first** - Add date filtering to `getAllEscrows` (COMPLETED)
2. ✅ **Frontend query** - Add date params to API call (COMPLETED)
3. ✅ **Archive unified** - Already using single query with onlyArchived param (VERIFIED)
4. 🔄 **Test all tabs** - Active, Closed, Cancelled, All, Archive with date filtering (READY FOR USER TESTING)

## Testing Checklist

### Backend Tests
- [ ] `/api/escrows?onlyArchived=true` returns only archived items
- [ ] `/api/escrows?startDate=2025-11-01&endDate=2025-11-30` filters by date range
- [ ] `/api/escrows?onlyArchived=true&startDate=2025-11-01` combines filters
- [ ] Date intersection works: item with acceptance=Nov 1, closing=Dec 31 shows when display=Nov 15-Nov 20

### Frontend Tests
- [ ] Archive tab shows stat cards
- [ ] Archive tab only shows archived items
- [ ] Date picker filters archive tab
- [ ] No infinite loop (only 1 API call per page load)
- [ ] Date picker filters all tabs (Active, Closed, Cancelled, All, Archive)
- [ ] Switching between tabs doesn't cause duplicate API calls

## Expected Behavior After Fix

1. **Archive tab works like other status tabs**
   - Shows hero with 4 stat cards
   - Shows filtered data grid/list/calendar
   - Uses same components as other tabs

2. **Date filtering works consistently**
   - All tabs (Active, Closed, Cancelled, All, Archive) respect date range
   - Date range uses intersection logic (shows items that overlap)
   - Stat cards calculate from date-filtered data

3. **Single API call**
   - One `GET /api/escrows` call per tab
   - No separate archive endpoint
   - Proper query param memoization

## Code Changes Summary

### Backend (1 file)
- `backend/src/modules/core-modules/escrows/controllers/crud.controller.js` (+20 lines)

### Frontend (2 files)
- `frontend/src/components/dashboards/escrows/index.jsx` (-30 lines, refactor)
- Remove separate `useGetArchivedEscrows` hook

## Estimated Time
- Backend: 30 min
- Frontend: 1 hour
- Testing: 30 min
- **Total: 2 hours**

## Notes
- This same pattern should be applied to **all dashboards** (clients, leads, appointments, listings)
- Date filtering is a universal feature across all entity types
- Archive is just a status filter, not a separate view
