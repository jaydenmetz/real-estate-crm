# Project-17: User Role System Validation - USER TESTING GUIDE

## 🎯 Goal
Verify that role-based permissions (system_admin, broker, agent) work correctly and users can only access data they're authorized to see.

---

## 🧪 TEST 1: System Admin Can See Everything (5 minutes)

### Prerequisites:
- Login as: `admin@jaydenmetz.com` (system_admin role)

### Steps:
1. **Go to** Home Dashboard
2. **Expected**: See "Broker Dashboard" section at top (admin can see all data)
3. **Go to** Escrows dashboard
4. **Check filter dropdown**: Should have options:
   - ✅ "My Escrows" (user scope)
   - ✅ "Team" (team scope)
   - ✅ "Brokerage" (brokerage scope)
   - ✅ "All" (all scope - system_admin only)

### Test Each Scope:
5. **Select "My Escrows"**: Should show escrows owned by admin
6. **Select "Team"**: Should show team's escrows
7. **Select "All"**: Should show ALL escrows in system (36 total)
8. **Check**: No "Forbidden" or "Unauthorized" errors

### ✅ PASS Criteria:
- System admin can select ANY scope filter
- "All" scope works (shows all 36 escrows)
- No permission errors
- Can see broker/team hierarchy

### ❌ FAIL if:
- Can't select "All" scope
- Forbidden error on any scope
- Missing data across scopes

---

## 🧪 TEST 2: Admin Panel Access (3 minutes)

### Steps (as system_admin):
1. **Go to** Admin panel (should be in sidebar or settings)
2. **Expected**: Can access admin features:
   - ✅ User management
   - ✅ API Keys management
   - ✅ Security Events
   - ✅ Audit Logs

3. **Check each admin section loads**:
   - Users Table
   - API Keys Table
   - Security Events
   - Refresh Tokens

### ✅ PASS Criteria:
- Admin panel is accessible
- All admin tables load
- Can view security events
- Can manage API keys

### ❌ FAIL if:
- Admin panel not visible
- Forbidden errors
- Tables don't load
- Missing admin features

---

## 🧪 TEST 3: Broker Role Permissions (10 minutes - NEEDS BROKER ACCOUNT)

### Prerequisites:
- Need a broker account (not admin)
- If you don't have one, skip this test OR create one

### Steps (as broker):
1. **Login** as broker account
2. **Go to** Escrows dashboard
3. **Check filter dropdown**: Should have:
   - ✅ "My Escrows"
   - ✅ "Team"
   - ✅ "Brokerage"
   - ❌ "All" (should NOT appear - brokers can't see all)

### Test Scope Limits:
4. **Select "My Escrows"**: Shows broker's own escrows
5. **Select "Team"**: Shows team escrows
6. **Select "Brokerage"**: Shows all brokerage escrows
7. **Try accessing /admin panel**: Should get "Forbidden" or not visible

### ✅ PASS Criteria:
- Broker CANNOT select "All" scope
- Broker CANNOT access admin panel
- Can see team and brokerage data
- Proper permission boundaries

### ❌ FAIL if:
- Broker can select "All" scope
- Broker can access admin panel
- See data from other brokerages
- No permission enforcement

---

## 🧪 TEST 4: Agent Role Restrictions (10 minutes - NEEDS AGENT ACCOUNT)

### Prerequisites:
- Need an agent account (not admin/broker)
- If you don't have one, skip this test OR create one

### Steps (as agent):
1. **Login** as agent account
2. **Go to** Escrows dashboard
3. **Check filter dropdown**: Should have:
   - ✅ "My Escrows" (default and only option)
   - ❌ "Team" (should NOT appear)
   - ❌ "Brokerage" (should NOT appear)
   - ❌ "All" (should NOT appear)

### Test Data Visibility:
4. **View escrows**: Should ONLY see own escrows (not team/broker escrows)
5. **Try to access**: `/escrows?scope=team` manually in URL
6. **Expected**: Forbidden error or filtered to user scope
7. **Try to access**: Admin panel
8. **Expected**: Not visible or Forbidden error

### ✅ PASS Criteria:
- Agent can ONLY see own data
- Agent cannot change scope filter
- Agent cannot access admin features
- Agent cannot see team/brokerage data

### ❌ FAIL if:
- Agent can select Team/Brokerage scope
- Agent sees other people's data
- Agent can access admin panel
- No role enforcement

---

## 🧪 TEST 5: Permission Boundaries via API (5 minutes - CURL)

### Test Admin Can Access All Scopes:
```bash
# Get your admin JWT token from browser (F12 → Application → Local Storage → authToken)
TOKEN="your-admin-token-here"

# Test each scope
curl -s "https://api.jaydenmetz.com/v1/escrows?scope=user" -H "Authorization: Bearer $TOKEN" | grep -o "success.*true"
curl -s "https://api.jaydenmetz.com/v1/escrows?scope=team" -H "Authorization: Bearer $TOKEN" | grep -o "success.*true"
curl -s "https://api.jaydenmetz.com/v1/escrows?scope=all" -H "Authorization: Bearer $TOKEN" | grep -o "success.*true"
```

### Expected:
- All three return `"success":true`
- Admin can access any scope

### Test Invalid Scope Rejected:
```bash
curl -s "https://api.jaydenmetz.com/v1/escrows?scope=invalid" -H "Authorization: Bearer $TOKEN"
```

### Expected:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SCOPE",
    "message": "Invalid scope. Must be one of: my, user, team, brokerage, all"
  }
}
```

### ✅ PASS Criteria:
- Admin can use all valid scopes
- Invalid scopes rejected with clear error
- HTTP 400 for invalid scope

### ❌ FAIL if:
- Admin forbidden from valid scope
- Invalid scope accepted
- Unclear error messages

---

## 🧪 TEST 6: Cross-Module Permission Consistency (5 minutes)

### Test All Modules Respect Roles:
1. **As system_admin**, test each module:
   - Escrows: `?scope=all` → works
   - Clients: `?scope=all` → works
   - Listings: `?scope=all` → works
   - Leads: `?scope=all` → works
   - Appointments: `?scope=all` → works

2. **Check**: All modules use same permission system

### ✅ PASS Criteria:
- All 5 modules respect scope filters
- Consistent behavior across modules
- No module bypasses permissions

### ❌ FAIL if:
- Some modules ignore scope
- Inconsistent permission behavior
- Any module shows unauthorized data

---

## 📊 SUMMARY CHECKLIST

After completing tests (or marking N/A if no broker/agent accounts):

- [ ] ✅ TEST 1: System admin can see everything (all scopes work)
- [ ] ✅ TEST 2: Admin panel accessible to system_admin only
- [ ] ✅/N/A TEST 3: Broker permissions properly limited
- [ ] ✅/N/A TEST 4: Agent permissions properly restricted
- [ ] ✅ TEST 5: API permission boundaries enforced
- [ ] ✅ TEST 6: All modules use consistent permissions

---

## 🐛 BUGS TO REPORT

**Format:**
```
Test: [Test number]
Role: [system_admin/broker/agent]
Issue: [What's wrong]
Expected: [What should happen]
Actual: [What actually happened]
```

---

## ✅ SUCCESS CRITERIA

**Project-17 is COMPLETE when:**
- System admin can access all scopes
- Brokers cannot access "all" scope
- Agents can only see own data
- Admin panel restricted to system_admin
- All modules enforce roles consistently
- No permission bypass bugs found

**Current Status**: TESTING IN PROGRESS
**Your Role**: Run tests and report any permission bypass bugs
**My Role**: Fix any role enforcement issues found

---

## 📝 NOTES

**Account Requirements:**
- You have: system_admin (admin@jaydenmetz.com) ✅
- May need: broker account (for TEST 3)
- May need: agent account (for TEST 4)

**If no broker/agent accounts exist:**
- Mark those tests as N/A
- Focus on system_admin testing
- Role system can be validated with admin alone
- Future phases will add more test accounts
