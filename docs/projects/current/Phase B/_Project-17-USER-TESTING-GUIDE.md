# Project-17: User Role System Validation - USER TESTING GUIDE

## 🎯 Goal
Verify that role-based permissions (system_admin, broker, agent) work correctly and users can only access data they're authorized to see.

---

## 🧪 TEST 1: System Admin Scope Filter (5 minutes)

### Prerequisites:
- Login as: `admin@jaydenmetz.com` (system_admin role)

### Steps:
1. **Go to** Escrows dashboard
2. **Check scope filter dropdown**:
   - **Expected for system_admin**: Single option "System Admin"
   - **Reason**: System admin is not part of a team or brokerage
   - **Behavior**: Shows ALL data (equivalent to scope=all)

3. **Select "System Admin"**: Should show ALL escrows (36 total)
4. **Check**: No team or brokerage filters (admin has no team_id or broker_id)

### Correct Scope Filter Design:
**Scope dropdown should show:**
- **Always**: User's first name + last name (shows user's own data)
- **If team_id NOT NULL**: Team name (shows team's data)
- **If broker_id NOT NULL**: Brokerage name (shows brokerage's data)
- **If system_admin**: Single "System Admin" option (shows ALL data)

### ✅ PASS Criteria:
- System admin sees single "System Admin" filter option
- Selecting it shows ALL escrows (36 total)
- No team/brokerage options (admin has no team_id/broker_id)
- No permission errors

### ❌ FAIL if:
- Shows "My Escrows", "Team", "Brokerage", "All" labels (WRONG - old design)
- System admin has team/brokerage filters
- Can't see all data
- Filter shows generic labels instead of actual names

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
- Need a broker account with team_id and broker_id set
- If you don't have one, skip this test OR create one

### Steps (as broker):
1. **Login** as broker account
2. **Go to** Escrows dashboard
3. **Check scope filter dropdown** should show:
   - ✅ "John Smith" (broker's first + last name) - shows user's own escrows
   - ✅ "Sales Team A" (broker's team name) - shows team's escrows
   - ✅ "ABC Realty" (broker's brokerage name) - shows brokerage's escrows
   - ❌ NOT "System Admin" or "All" (brokers can't see all data)

### Test Each Filter:
4. **Select "John Smith"**: Shows only broker's own escrows
5. **Select "Sales Team A"**: Shows all escrows for that team
6. **Select "ABC Realty"**: Shows all escrows for the brokerage
7. **Try to access**: Admin panel → Should be forbidden/not visible

### ✅ PASS Criteria:
- Dropdown shows actual names (not generic "My", "Team", "Brokerage")
- Broker can see: user → team → brokerage hierarchy
- Broker CANNOT see other brokerages' data
- Broker CANNOT access admin panel
- Three filter options based on broker's memberships

### ❌ FAIL if:
- Shows generic labels ("My Escrows" instead of "John Smith")
- Broker can access System Admin scope
- Broker can see data from other brokerages
- Broker can access admin panel
- Filter doesn't use actual user/team/broker names

---

## 🧪 TEST 4: Agent Role Restrictions (10 minutes - NEEDS AGENT ACCOUNT)

### Prerequisites:
- Need an agent account (not admin/broker)
- Agent may or may not have team_id/broker_id
- If you don't have one, skip this test OR create one

### Steps (as agent):
1. **Login** as agent account (e.g., jane.agent@example.com)
2. **Go to** Escrows dashboard
3. **Check scope filter dropdown** - should show based on agent's memberships:

**If agent has NO team_id and NO broker_id:**
   - ✅ "Jane Agent" (first + last name) - ONLY option
   - Shows only agent's own escrows

**If agent HAS team_id:**
   - ✅ "Jane Agent" (user's escrows)
   - ✅ "Sales Team B" (team's escrows)

**If agent HAS broker_id:**
   - ✅ "Jane Agent" (user's escrows)
   - ✅ "XYZ Brokerage" (brokerage's escrows)

**If agent HAS both team_id AND broker_id:**
   - ✅ "Jane Agent" (user's escrows)
   - ✅ "Sales Team B" (team's escrows)
   - ✅ "XYZ Brokerage" (brokerage's escrows)

### Test Restrictions:
4. **Should NOT see**: "System Admin" or "All" options
5. **Try to access**: Admin panel → Should be forbidden/not visible
6. **Try URL hack**: `/escrows?scope=all` → Should get Forbidden error

### ✅ PASS Criteria:
- Dropdown shows actual names (user/team/broker names, not generic labels)
- Agent cannot access system_admin scope
- Agent cannot access admin panel
- Dropdown dynamically shows only agent's memberships
- Filter labels are personalized (names, not "My"/"Team"/"Brokerage")

### ❌ FAIL if:
- Shows generic labels ("My Escrows" instead of agent's name)
- Agent can select "All" or "System Admin"
- Agent can access admin panel
- Sees data from other teams/brokerages they're not part of
- Filter doesn't reflect actual team/broker assignments

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
