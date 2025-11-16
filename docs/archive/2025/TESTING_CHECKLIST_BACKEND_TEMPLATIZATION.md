# Backend Templatization Testing Checklist

**Purpose:** Verify that the factory-based controllers work identically to the original code.

**What Changed:**
- 4 controllers migrated to factory pattern (listings, clients, leads, appointments)
- Escrows controller unchanged (it was already working correctly)
- User normalization layer added to handle array vs string roles

**When to Delete .backup Files:**
After ALL tests below pass ✅

---

## Critical Tests (Must Pass Before Deleting Backups)

### 1. **Escrows Dashboard** (Unchanged - Baseline)
- [ ] Navigate to Escrows dashboard
- [ ] Data loads correctly
- [ ] Scope dropdown works (My Escrows → Team's Escrows → Broker's Escrows)
- [ ] Status tabs work (Active, Pending, Closed, All, Archived)
- [ ] Create new escrow works
- [ ] Edit existing escrow works
- [ ] Archive escrow works
- [ ] **Expected:** Everything works exactly as before (no regressions)

### 2. **Listings Dashboard** (Migrated to Factory)
- [ ] Navigate to Listings dashboard
- [ ] **Data loads** (this was broken before, should work now)
- [ ] Scope dropdown works (My Listings → Team's Listings → Broker's Listings)
- [ ] Status tabs work (Active, Closed, Expired, All Listings, Archived)
- [ ] Create new listing works
- [ ] Edit listing works
- [ ] Archive listing works
- [ ] **Expected:** Works identically to Escrows

### 3. **Clients Dashboard** (Migrated to Factory)
- [ ] Navigate to Clients dashboard
- [ ] **Data loads** (was broken before)
- [ ] Scope dropdown works
- [ ] Status tabs work
- [ ] Create new client works
- [ ] Edit client works
- [ ] Archive client works
- [ ] **Expected:** Works identically to Escrows

### 4. **Leads Dashboard** (Migrated to Factory - Special Case)
- [ ] Navigate to Leads dashboard
- [ ] **Data loads** (was broken before)
- [ ] Scope dropdown works
- [ ] **Private leads hidden** from broker when marked private
- [ ] Create new lead works
- [ ] Toggle "is_private" flag works
- [ ] Edit lead works
- [ ] Archive lead works
- [ ] **Expected:** Privacy filtering works correctly

### 5. **Appointments Dashboard** (Migrated to Factory - Special Case)
- [ ] Navigate to Appointments dashboard
- [ ] **Data loads** (was broken before)
- [ ] Scope dropdown works
- [ ] **Appointments linked to private leads** are hidden from broker
- [ ] Create new appointment works
- [ ] Edit appointment works
- [ ] Archive appointment works
- [ ] **Expected:** Inherits privacy from linked leads

---

## Role-Based Testing (Critical)

Test with different user roles to ensure scope filtering works:

### As Agent:
- [ ] Can see only own records (escrows, listings, clients, leads, appointments)
- [ ] Scope dropdown shows: "My [Entity]" only
- [ ] Cannot see team members' records

### As Team Owner:
- [ ] Can see own records
- [ ] Can see team members' records
- [ ] Scope dropdown shows: "My [Entity]" and "Team's [Entity]"
- [ ] Cannot see other teams' records

### As Broker:
- [ ] Can see all records under brokerage
- [ ] Scope dropdown shows: "My [Entity]", "Team's [Entity]", "Broker's [Entity]"
- [ ] **Cannot see private leads** (unless owner)
- [ ] **Cannot see appointments linked to private leads** (unless owner)

### As System Admin:
- [ ] Can see everything
- [ ] Scope dropdown shows all options including "All [Entity]"

---

## API Endpoint Testing (Backend Only)

Use curl or Postman to test API directly:

### Test User Role Normalization:
```bash
# This should work even if role comes as array ['agent'] or string 'agent'
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.jaydenmetz.com/v1/listings

# Expected: 200 OK with listings data
```

### Test Scope Filtering:
```bash
# User scope
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.jaydenmetz.com/v1/listings?scope=user"

# Team scope
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.jaydenmetz.com/v1/listings?scope=team"

# Broker scope (if you're a broker)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.jaydenmetz.com/v1/listings?scope=broker"

# Expected: Each returns different subset of data
```

### Test Create Operation:
```bash
# Create a listing
curl -X POST https://api.jaydenmetz.com/v1/listings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyAddress": "123 Test St, Test City, CA 90210",
    "listPrice": 500000,
    "propertyType": "Single Family",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFootage": 1500
  }'

# Expected: 201 Created with listing data
```

### Test Update Operation:
```bash
# Update a listing
curl -X PUT https://api.jaydenmetz.com/v1/listings/LISTING_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listPrice": 475000
  }'

# Expected: 200 OK with updated data
```

### Test Archive/Delete:
```bash
# Archive a listing
curl -X PUT https://api.jaydenmetz.com/v1/listings/LISTING_ID/archive \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: 200 OK

# Delete archived listing
curl -X DELETE https://api.jaydenmetz.com/v1/listings/LISTING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: 200 OK
```

---

## WebSocket Testing

Test real-time updates:

1. **Open two browser windows** with same dashboard
2. **Create/Update/Delete** a record in one window
3. **Verify** the other window updates in real-time
4. **Test with different users** to ensure events broadcast to correct rooms

**Expected:**
- Broker sees all updates in their brokerage
- Team members see team updates
- Individual users see their own updates

---

## Error Handling Testing

### Test Invalid Data:
```bash
# Try to create listing without required field
curl -X POST https://api.jaydenmetz.com/v1/listings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listPrice": 500000
  }'

# Expected: 400 Bad Request with validation error
```

### Test Unauthorized Access:
```bash
# Try to access broker scope as agent
curl "https://api.jaydenmetz.com/v1/listings?scope=broker" \
  -H "Authorization: Bearer AGENT_TOKEN"

# Expected: 403 Forbidden
```

### Test Optimistic Locking:
1. Get a record with version number
2. Update it in one window/request
3. Try to update with old version number in second request
4. **Expected:** 409 Conflict error

---

## Performance Testing

### Load Time Comparison:
- [ ] Listings dashboard loads in < 2 seconds
- [ ] Clients dashboard loads in < 2 seconds
- [ ] Leads dashboard loads in < 2 seconds
- [ ] Appointments dashboard loads in < 2 seconds
- [ ] No slower than escrows dashboard

### Database Query Efficiency:
Check Railway logs for slow queries:
```bash
railway logs --service real-estate-crm-api | grep "slow query"
```

**Expected:** No slow query warnings

---

## Browser Console Testing

Open browser console (F12) and check for:

- [ ] **No JavaScript errors** when loading dashboards
- [ ] **No 404 errors** (missing API endpoints)
- [ ] **No 500 errors** (server crashes)
- [ ] **No array role warnings** (e.g., "role.includes is not a function")

---

## Rollback Plan (If Tests Fail)

If any critical test fails:

### Option 1: Quick Fix
```bash
# Identify which controller is broken
# Fix the specific issue
# Redeploy
```

### Option 2: Restore from Backups
```bash
# Copy backup files back
cp backend/src/modules/listings/controllers/listings.controller.js.backup \
   backend/src/modules/listings/controllers/listings.controller.js

cp backend/src/modules/clients/controllers/clients.controller.js.backup \
   backend/src/modules/clients/controllers/clients.controller.js

cp backend/src/modules/leads/controllers/leads.controller.js.backup \
   backend/src/modules/leads/controllers/leads.controller.js

cp backend/src/modules/appointments/controllers/appointments.controller.js.backup \
   backend/src/modules/appointments/controllers/appointments.controller.js

# Commit and deploy
git add -A
git commit -m "Revert: Restore original controllers from backup"
git push origin main
```

---

## When to Delete .backup Files

✅ **Delete backups ONLY after:**
1. All dashboards load data correctly
2. All CRUD operations work (create, read, update, archive, delete)
3. Scope filtering works for all roles
4. Privacy filtering works for leads/appointments
5. WebSocket real-time updates work
6. No errors in browser console or Railway logs
7. System has been stable for **at least 24 hours**

### Safe Deletion Command:
```bash
# After all tests pass
rm backend/src/modules/listings/controllers/listings.controller.js.backup
rm backend/src/modules/clients/controllers/clients.controller.js.backup
rm backend/src/modules/leads/controllers/leads.controller.js.backup
rm backend/src/modules/appointments/controllers/appointments.controller.js.backup

git add -A
git commit -m "Remove backup controllers - factory migration verified"
git push origin main
```

---

## What We Didn't Change (Safe)

These parts are **unchanged** and cannot break:

- ✅ Escrows controller (still uses original code)
- ✅ Database schema
- ✅ Frontend components
- ✅ Authentication middleware
- ✅ Authorization middleware
- ✅ WebSocket service
- ✅ Notification service

Only the **backend CRUD logic** for listings/clients/leads/appointments changed.

---

## Confidence Indicators

You can be confident the migration worked if:

1. **Escrows works** (proves infrastructure is intact)
2. **Listings loads data** (proves factory pattern works)
3. **No role array errors** (proves user normalization works)
4. **Scope dropdown changes data** (proves ownership filtering works)
5. **Create/update/delete work** (proves all CRUD operations work)

If all 5 pass, the migration is successful! 🎉

---

## Current Status

**Deployment:** In progress (waiting for Railway)
**Tests Run:** None yet
**Backups:** Safe to keep until all tests pass
**Recommended:** Test manually first, then wait 24 hours before deleting backups
