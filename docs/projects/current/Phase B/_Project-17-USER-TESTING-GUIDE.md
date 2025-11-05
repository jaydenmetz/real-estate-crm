# Project-17: User Role System Implementation & Validation - USER TESTING GUIDE

## 🎯 Goal
Implement contextual role system (roles, user_roles, role_history) and verify role-based permissions work correctly.

---

## 📋 DATABASE SCHEMA CHANGES (Verify First)

### New Tables Created:
1. **roles** - 11 roles across 3 contexts (platform, brokerage, transaction)
2. **user_roles** - Role assignments per user per context
3. **role_history** - Audit trail of role changes
4. **brokerages** - Renamed from brokers (brokerage companies)
5. **broker_history** - Track agent brokerage affiliations
6. **users** - Added DRE license fields (10 new columns)

### Verify Tables Exist:
```sql
-- Run in database
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('roles', 'user_roles', 'role_history', 'brokerages', 'broker_history')
ORDER BY tablename;

-- Expected: All 5 tables listed
```

### Verify Roles Populated:
```sql
SELECT name, display_name, context_type FROM roles ORDER BY context_type, name;

-- Expected: 11 roles
-- Platform: platform_admin
-- Brokerage: brokerage_agent, brokerage_broker
-- Transaction: transaction_* (8 roles)
```

### Verify User Migration:
```sql
SELECT u.email, u.role as old_role, r.name as new_role, ur.context_type
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email IN ('admin@jaydenmetz.com', 'josh@bhhsassociated.com', 'ryan@ryandobbsteam.com');

-- Expected: 
-- admin@jaydenmetz.com: system_admin → platform_admin
-- josh@bhhsassociated.com: broker → brokerage_broker
-- ryan@ryandobbsteam.com: broker → brokerage_broker
```

---

## 🧪 BACKEND API TESTS (Before Frontend)

### TEST 1: Verify Role Endpoint Exists
```bash
# Check if backend can query user roles
TOKEN="your-admin-token"
curl -s "https://api.jaydenmetz.com/v1/users/me" \
  -H "Authorization: Bearer $TOKEN" | grep -o "role"
```
**Expected**: Response includes role information

### TEST 2: Verify Backward Compatibility
```bash
# Old role column should still work
curl -s "https://api.jaydenmetz.com/v1/escrows?scope=user" \
  -H "Authorization: Bearer $TOKEN" | grep "success.*true"
```
**Expected**: API still works with existing auth

### TEST 3: Test Permission Middleware
```bash
# Admin can access admin endpoint
curl -s "https://api.jaydenmetz.com/v1/admin/users" \
  -H "Authorization: Bearer $TOKEN" -w "\n%{http_code}\n"
```
**Expected**: HTTP 200 (admin has access)

---

## 🧪 FRONTEND SCOPE FILTER TESTS

### TEST 4: System Admin Scope (Currently Broken - Needs Fix)

**Login as**: `admin@jaydenmetz.com`

**Go to**: Escrows dashboard

**Current Bug**: Shows "My Escrows", "Team" (generic labels)

**Should Show**: 
- **For system_admin**: Single option "System Admin"
- **No team/brokerage** (admin has no team_id/broker_id)

**Fix Needed**: Update scopeOptions to be dynamic based on:
```javascript
if (user.role === 'system_admin') {
  scopeOptions = [{ value: 'all', label: 'System Admin' }];
} else {
  scopeOptions = [
    { value: 'user', label: `${user.first_name} ${user.last_name}` },
    ...(user.team_id ? [{ value: 'team', label: teamName }] : []),
    ...(user.broker_id ? [{ value: 'brokerage', label: brokerageName }] : [])
  ];
}
```

---

### TEST 5: Broker Scope (Needs Implementation)

**Login as**: `josh@bhhsassociated.com` (password: BrokerTest123!)

**Expected Dropdown**:
1. "Josh Riley" (user's escrows)
2. "Riley Real Estate Team" (team's escrows)
3. "Associated Real Estate" (brokerage's escrows)

**Currently Shows**: Generic labels (WRONG)

**Implementation Needed**:
- Fetch team name from teams table (team_id → name)
- Fetch brokerage name from brokerages table (broker_id → company_name)
- Build dynamic dropdown with real names

---

### TEST 6: Multi-Broker Isolation

**Setup**:
1. Login as Josh (Associated Real Estate)
2. Login as Ryan (Ryan Dobbs Realty) in different browser

**Test**:
- Josh should NOT see Ryan's escrows
- Ryan should NOT see Josh's escrows
- Each sees only their brokerage data

**Database Verification**:
```sql
-- Josh's brokerage
SELECT COUNT(*) FROM escrows WHERE broker_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- Ryan's brokerage  
SELECT COUNT(*) FROM escrows WHERE broker_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Should be different counts
```

---

## 🧪 ROLE ASSIGNMENT TESTS

### TEST 7: Assign Transaction Role
```sql
-- Make Jayden the buyer_agent on an escrow
INSERT INTO user_roles (user_id, role_id, context_type, context_id)
SELECT 
  '65483115-0e3e-43f3-8a4a-488a6f0df017', -- Jayden
  r.id,
  'transaction',
  '3d5e6284-fb0d-40ba-9d2e-0a3592fc87d7' -- An escrow
FROM roles r WHERE r.name = 'transaction_buyer_agent';

-- Verify assignment
SELECT 
  u.first_name, u.last_name, 
  r.display_name, 
  ur.context_type, 
  e.property_address
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
LEFT JOIN escrows e ON ur.context_id = e.id
WHERE ur.user_id = '65483115-0e3e-43f3-8a4a-488a6f0df017'
AND ur.context_type = 'transaction';
```

**Expected**: Jayden now has transaction_buyer_agent role on that specific escrow

---

## 🧪 CRITICAL TESTS BEFORE PROJECT-18

### TEST 8: Database Referential Integrity
```sql
-- Verify all foreign keys work
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('user_roles', 'role_history', 'broker_history', 'brokerages');
```

**Expected**: All FK constraints intact

### TEST 9: Authentication Still Works After Schema Changes
```bash
# Test login still works
curl -s -X POST "https://api.jaydenmetz.com/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jaydenmetz.com","password":"[your-password]"}'

# Expected: success=true, token returned
```

### TEST 10: All Module Endpoints Still Work
```bash
TOKEN="your-token"

# Test each module
for module in escrows clients listings leads appointments; do
  echo "Testing $module..."
  curl -s "https://api.jaydenmetz.com/v1/$module" \
    -H "Authorization: Bearer $TOKEN" | grep -o "success.*true"
done

# Expected: All return success:true
```

---

## ⚠️ KNOWN ISSUES TO FIX

### Issue #1: Scope Filter Labels (MUST FIX)
**Current**: Generic "My Escrows", "Team"  
**Needed**: Dynamic "Jayden Metz", "Riley Real Estate Team"

**Where to fix**: 
- `frontend/src/config/entities/*.config.js`
- Change from static `scopeOptions` to dynamic function
- Fetch team/brokerage names on mount

### Issue #2: Brokerage References (MUST UPDATE)
**Changed**: `brokers` table → `brokerages` table
**Impact**: Any code referencing `brokers` needs update

**Check these files**:
```bash
grep -r "brokers\." backend/src --include="*.js" | grep -v node_modules
grep -r "brokers" frontend/src --include="*.js" --include="*.jsx"
```

### Issue #3: User Role Column (DUAL SYSTEM)
**Current**: Both `users.role` AND `user_roles` table exist
**Status**: Backward compatible but needs migration plan

**Eventually**: Remove `users.role` column, use only `user_roles`

---

## ✅ SUCCESS CRITERIA FOR PROJECT-17

**Database:**
- [x] roles table created (11 roles)
- [x] user_roles table created
- [x] role_history table created
- [x] brokerages renamed from brokers
- [x] broker_history table created
- [x] DRE fields added to users
- [x] All users migrated to user_roles

**Backend:**
- [ ] All references to 'brokers' table updated to 'brokerages'
- [x] Auth endpoints still work
- [x] Permission middleware still works
- [ ] Role helper functions created (hasRole, getRoles)

**Frontend:**
- [ ] Scope filter shows dynamic names (not generic labels)
- [ ] Fetches team/brokerage names from database
- [ ] System admin sees "System Admin" only
- [ ] Brokers see: Name, Team, Brokerage
- [ ] Agents see: Name (+ Team/Brokerage if applicable)

**Testing:**
- [ ] Multi-broker isolation works (Josh can't see Ryan's data)
- [ ] Transaction roles can be assigned
- [ ] Role history tracks changes
- [ ] No broken endpoints after schema changes

---

## 🐛 BUG REPORTING

**If you find issues:**
```
Component: [Database/Backend/Frontend]
Issue: [What's broken]
Expected: [What should happen]
Actual: [What's happening]
Query/URL: [Reproduction]
```

**Current Status**: Schema implemented, frontend needs updates for dynamic labels.

**Next**: Fix scope filter labels, then verify all module endpoints work.
