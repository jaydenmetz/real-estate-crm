# React Query v5 Migration TODO

**Status:** PARTIALLY COMPLETE (1/11 files fixed)
**Priority:** HIGH (causing production errors)
**Created:** October 18, 2025

## Issue

The codebase was upgraded from `react-query` v3 to `@tanstack/react-query` v5, but many files still use the old v3 API syntax, causing runtime errors in production.

**Error Message:**
```
a.defaultQueryOptions is not a function
```

## API Syntax Changes (v3 → v5)

### OLD (v3) Syntax ❌
```javascript
useQuery('queryKey', fetchFunction, options)
useQuery(['queryKey', param], fetchFunction, options)
```

### NEW (v5) Syntax ✅
```javascript
useQuery({ queryKey: ['queryKey'], queryFn: fetchFunction, ...options })
useQuery({ queryKey: ['queryKey', param], queryFn: fetchFunction, ...options })
```

### Example Migration

**Before (v3):**
```javascript
const { data } = useQuery(
  ['commissions', statusFilter],
  () => api.get(`/commissions?status=${statusFilter}`),
  {
    onError: (error) => { /* ... */ },
    staleTime: 5000
  }
);
```

**After (v5):**
```javascript
const { data } = useQuery({
  queryKey: ['commissions', statusFilter],
  queryFn: () => api.get(`/commissions?status=${statusFilter}`),
  onError: (error) => { /* ... */ },
  staleTime: 5000
});
```

## Files Requiring Migration (10 remaining)

### ✅ FIXED (1 file)
- [x] `/components/dashboards/HomeDashboard.jsx` (5 queries) - **FIXED Oct 18, 2025**

### ❌ TODO (10 files, 19 queries total)

**High Priority (User-Facing Pages):**
1. `/components/dashboards/CommissionDashboard.jsx` (2 queries)
   - Line 114: `useQuery(['commissions', statusFilter], ...)`
   - Line 125: `useQuery('commissionStats', ...)`

2. `/components/dashboards/InvoiceDashboard.jsx` (2 queries)
   - Line 131: `useQuery(['invoices', statusFilter], ...)`
   - Line 150: `useQuery('invoiceStats', ...)`

3. `/components/details/clients/index.jsx` (1 query)
   - Line 465: `useQuery(['client', id], ...)`

4. `/components/details/leads/index.jsx` (1 query)
   - Line 117: `useQuery(['lead', id], ...)`

5. `/components/details/listings/index.jsx` (1 query)
   - Line 550: `useQuery(['listing', id], ...)`

**Medium Priority (Admin/Settings Pages):**
6. `/components/admin/AdminSecurityDashboard.jsx` (2 queries)
   - Line 54: `useQuery('criticalEvents', ...)`
   - Line 63: `useQuery('allStats', ...)`

7. `/components/settings/SecurityDashboard.jsx` (2 queries)
   - Line 56: `useQuery('recentEvents', ...)`
   - Line 65: `useQuery('statsData', ...)`

8. `/components/settings/OnboardingSettings.jsx` (3 queries)
   - Line 45: `useQuery('onboardingProgress', ...)`
   - Line 55: `useQuery('sampleData', ...)`
   - Line 65: `useQuery('analytics', ...)`

**Low Priority (Hooks - Already Using v5 Syntax):**
9. ✅ `/components/details/escrows/hooks/useEscrowData.js` - **Already correct!**
   - Line 13: Already uses `useQuery({ queryKey: [...], queryFn: ... })`

10. `/components/dashboards/ExpenseDashboard.jsx` (5 queries - estimated, not confirmed)

## Migration Checklist

For each file:
1. [ ] Read the file and locate all `useQuery()` calls
2. [ ] Convert each call from v3 to v5 syntax:
   - Move query key as first argument → `queryKey:` property
   - Move fetch function as second argument → `queryFn:` property
   - Merge options object into main object
3. [ ] Test locally to ensure queries work
4. [ ] Commit changes
5. [ ] Deploy to Railway
6. [ ] Verify no errors in production

## Automated Migration Script (Future)

Could create a codemod to automate this:
```bash
# Example using jscodeshift (not yet implemented)
npx jscodeshift -t react-query-v5-migration.js frontend/src
```

## Testing After Migration

1. Visit each page that uses React Query:
   - `/` - Home Dashboard ✅ FIXED
   - `/commissions` - Commission Dashboard
   - `/invoices` - Invoice Dashboard
   - `/clients/:id` - Client Detail
   - `/leads/:id` - Lead Detail
   - `/listings/:id` - Listing Detail
   - `/admin/security` - Admin Security Dashboard
   - `/settings#security` - Security Settings
   - `/settings#onboarding` - Onboarding Settings

2. Check browser console for errors
3. Verify data loads correctly
4. Test query invalidation (refresh buttons)

## Estimated Time

- **Per file:** 10-15 minutes (read, fix, test)
- **Total:** 2-3 hours for all 10 files
- **Priority:** Fix high-priority files first (1 hour)

## Next Steps

1. **Immediate:** HomeDashboard is fixed - verify production error is resolved
2. **This week:** Fix high-priority files (5 files, 1 hour)
3. **Next week:** Fix medium/low priority files (5 files, 1-2 hours)
4. **Follow-up:** Create automated migration script for future upgrades

## Related Issues

- **Production Error:** `a.defaultQueryOptions is not a function` on Home Dashboard
- **Root Cause:** React Query upgraded from v3 to v5 without updating all call sites
- **Fix Status:** 1/11 files fixed (9%)
- **Next Target:** CommissionDashboard.jsx (if user reports error)

---

**Last Updated:** October 18, 2025
**Fixed By:** Claude Code Agent
**Tracking:** GitHub Issue #react-query-v5-migration
