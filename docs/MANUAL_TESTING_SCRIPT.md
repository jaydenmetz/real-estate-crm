# 🧪 Complete Manual Testing Script
## Real Estate CRM - End-to-End System Review

**Testing Date:** _______________
**Tester Name:** _______________
**Environment:** Production (https://crm.jaydenmetz.com)
**Browser:** _______________
**Test Duration:** ~2-3 hours

---

## 📋 Testing Overview

This script covers **100% of the application** in a systematic order. Follow each step exactly as written, check what you see, and grade each section.

### Grading Scale:
- **A+ (95-100%)** - Perfect, no issues
- **A (90-94%)** - Excellent, minor cosmetic issues only
- **B (80-89%)** - Good, some bugs but functional
- **C (70-79%)** - Functional but multiple issues
- **D (60-69%)** - Barely functional, major bugs
- **F (<60%)** - Broken, unusable

---

## 🎯 Pre-Test Setup Checklist

Before starting, verify:
- [ ] Production site loads: https://crm.jaydenmetz.com
- [ ] API is running: https://api.jaydenmetz.com/v1/health (should show "healthy")
- [ ] Browser DevTools open (F12) - keep Console tab visible
- [ ] No red errors in console on page load
- [ ] Have login credentials ready: `admin@jaydenmetz.com` / `AdminPassword123!`

**Initial Console Check:**
```
✅ PASS: No errors in console
❌ FAIL: Red errors present - Document them below:
_____________________________________________
```

---

# PART 1: AUTHENTICATION & ONBOARDING
**Time:** 15 minutes | **Grade:** _____ / 100

---

## Section 1.1: Login Page
**URL:** https://crm.jaydenmetz.com/login

### Step 1: Visual Inspection
**Look for:**
- [ ] Clean, professional login form
- [ ] "Real Estate CRM" or company branding visible
- [ ] Email and Password input fields
- [ ] "Remember Me" checkbox
- [ ] "Login" button
- [ ] "Don't have an account? Register" link

**What you should see:**
```
Expected: Modern login card, centered on page, no layout breaks
Actual: _____________________________________________
```

**Grade this section:** _____ / 100

---

### Step 2: Login Validation
**Test invalid credentials:**

**Action 2.1:** Enter `wrong@email.com` / `wrongpassword`
- [ ] Click "Login" button
- **Expected:** Red error message: "Invalid credentials" or similar
- **Actual:** _____________________________________________

**Action 2.2:** Leave email blank, enter password
- [ ] Click "Login"
- **Expected:** Validation error: "Email is required"
- **Actual:** _____________________________________________

**Action 2.3:** Enter email, leave password blank
- [ ] Click "Login"
- **Expected:** Validation error: "Password is required"
- **Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 3: Successful Login
**Action 3.1:** Enter valid credentials
- Email: `admin@jaydenmetz.com`
- Password: `AdminPassword123!`
- [ ] Check "Remember Me"
- [ ] Click "Login"

**Expected:**
- Loading spinner appears briefly
- Redirects to `/` (Home Dashboard) within 2 seconds
- No errors in console
- User profile visible in top-right corner

**Actual:**
- Redirect time: _____ seconds
- Destination URL: _____________________________________________
- Console errors: _____________________________________________

**Grade this section:** _____ / 100

---

## Section 1.2: Home Dashboard (Initial Load)
**URL:** https://crm.jaydenmetz.com/

### Step 4: Dashboard Overview
**Visual inspection:**

**Top Navigation Bar:**
- [ ] Company logo/name on left
- [ ] Navigation menu items visible
- [ ] User profile/avatar on right
- [ ] Notifications icon (if applicable)

**Main Content Area:**
- [ ] "Welcome" or greeting message
- [ ] Statistics cards (4-6 cards showing counts)
- [ ] Recent activity or quick links
- [ ] No broken images or layout issues

**Stats Cards - Record the numbers you see:**
```
Active Escrows: _____
Active Listings: _____
Total Clients: _____
Upcoming Appointments: _____
New Leads: _____
Pending Tasks: _____
```

**Expected:** All cards show numbers (may be 0 if fresh system)
**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

## Section 1.3: Navigation Menu
**Test all menu items:**

### Step 5: Click each menu item and verify it loads

**Action 5.1:** Click "Escrows" in navigation
- [ ] URL changes to `/escrows`
- [ ] Page loads within 2 seconds
- [ ] No console errors
- **Actual:** _____________________________________________

**Action 5.2:** Click "Listings" in navigation
- [ ] URL changes to `/listings`
- [ ] Page loads within 2 seconds
- **Actual:** _____________________________________________

**Action 5.3:** Click "Clients" in navigation
- [ ] URL changes to `/clients`
- [ ] Page loads within 2 seconds
- **Actual:** _____________________________________________

**Action 5.4:** Click "Leads" in navigation
- [ ] URL changes to `/leads`
- [ ] Page loads within 2 seconds
- **Actual:** _____________________________________________

**Action 5.5:** Click "Appointments" in navigation
- [ ] URL changes to `/appointments`
- [ ] Page loads within 2 seconds
- **Actual:** _____________________________________________

**Action 5.6:** Click "Home" or dashboard icon
- [ ] Returns to home dashboard
- **Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

# PART 2: ESCROWS MODULE (PHASE 6 COMPLETE)
**Time:** 30 minutes | **Grade:** _____ / 100

---

## Section 2.1: Escrows List View
**URL:** https://crm.jaydenmetz.com/escrows

### Step 6: Escrows Dashboard Visual Check

**What you should see:**
- [ ] "Escrows" page title/heading
- [ ] "+ New Escrow" button (top-right)
- [ ] List of escrow cards OR empty state message
- [ ] Filter/search controls (if applicable)
- [ ] View mode toggle (grid/list/table)

**If escrows exist, check one card:**
- [ ] Property address visible
- [ ] Purchase price shown
- [ ] Status badge (Active/Pending/Closed)
- [ ] Buyer/Seller names
- [ ] Closing date
- [ ] **🆕 Lock icon OR access badge** (Private/Team/Broker chip)

**Privacy Badge Check (NEW FEATURE):**
```
Card #1 - Does it show a privacy indicator?
[ ] Yes - RED "Private" chip with lock icon
[ ] Yes - BLUE "Team" chip with group icon
[ ] Yes - PURPLE "Broker" chip with business icon
[ ] No - No privacy indicator (old data)

Record what you see: _____________________________________________
```

**Grade this section:** _____ / 100

---

### Step 7: Create New Escrow (Full Test)

**Action 7.1:** Click "+ New Escrow" button

**Modal should open with:**
- [ ] "New Escrow" or "Create Escrow" title
- [ ] Property Address field
- [ ] Purchase Price field
- [ ] Closing Date picker
- [ ] Buyer Name field
- [ ] Seller Name field
- [ ] Status dropdown (Active/Pending/Closed)
- [ ] **🆕 Privacy & Sharing section** (at bottom)
- [ ] "Cancel" button
- [ ] "Create Escrow" or "Save" button

**🆕 NEW FEATURE: Privacy Controls Check**
```
Privacy Section Visible?
[ ] Yes - Contains toggle switch and dropdown
[ ] No - Missing (BUG - should be present)

If YES, describe what you see:
[ ] "Private" toggle switch (OFF by default)
[ ] Label: "Only you can see this record" or similar
[ ] "Sharing Level" dropdown (when Private is OFF)
  [ ] Options: "Team" and "Broker"
[ ] Helper text explaining access levels

Record what you see: _____________________________________________
```

**Grade this section:** _____ / 100

---

### Step 8: Test Privacy Controls

**Test 8.1: Toggle Private ON**
- [ ] Click the "Private" toggle switch
- **Expected:**
  - Switch turns red or highlighted
  - Sharing Level dropdown disappears or grays out
  - Text changes to "Only you can see this record"
- **Actual:** _____________________________________________

**Test 8.2: Toggle Private OFF**
- [ ] Click the "Private" toggle again
- **Expected:**
  - Switch returns to default state
  - Sharing Level dropdown reappears
  - Default selection: "Team"
- **Actual:** _____________________________________________

**Test 8.3: Change Sharing Level**
- [ ] Ensure Private is OFF
- [ ] Open "Sharing Level" dropdown
- **Expected options:**
  - "Team" - with description "Visible to all team members"
  - "Broker" - with description "Visible to all users in your brokerage"
- [ ] Select "Broker"
- **Expected:** Dropdown shows "Broker" selected
- **Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 9: Create Test Escrow with Privacy

**Fill out the form:**
- Property Address: `123 Test Street, Bakersfield, CA 93301`
- Purchase Price: `450000`
- Closing Date: Select a future date (e.g., 30 days from today)
- Buyer Name: `John Buyer`
- Seller Name: `Jane Seller`
- Status: `Active`
- **Privacy Settings:**
  - Private: **OFF** (unchecked)
  - Sharing Level: **Team**

**Action 9.1:** Click "Create Escrow" button

**Expected:**
- [ ] Modal closes within 2 seconds
- [ ] Success message appears (green toast/snackbar)
- [ ] New escrow card appears in the list
- [ ] New card shows property address "123 Test Street"
- [ ] New card shows **BLUE "Team" chip** with group icon

**Actual:**
- Modal closed: [ ] Yes [ ] No
- Success message: _____________________________________________
- Card appears: [ ] Yes [ ] No
- Privacy badge on card: _____________________________________________

**Grade this section:** _____ / 100

---

### Step 10: Create Private Escrow

**Action 10.1:** Click "+ New Escrow" again

**Fill out the form:**
- Property Address: `456 Private Lane, Bakersfield, CA 93301`
- Purchase Price: `550000`
- Closing Date: Select a future date
- Buyer Name: `Bob Private`
- Seller Name: `Alice Confidential`
- Status: `Active`
- **Privacy Settings:**
  - Private: **ON** (checked/toggled)
  - Sharing Level: (should be hidden/disabled)

**Action 10.2:** Click "Create Escrow"

**Expected:**
- [ ] Modal closes
- [ ] Success message
- [ ] New escrow card appears
- [ ] New card shows **RED "Private" chip** with lock icon 🔒

**Actual:**
- Card shows: _____________________________________________
- Privacy badge color: _____________________________________________
- Icon visible: [ ] Lock [ ] Group [ ] Business [ ] None

**Grade this section:** _____ / 100

---

### Step 11: Create Broker-Level Escrow

**Action 11.1:** Click "+ New Escrow" again

**Fill out the form:**
- Property Address: `789 Broker Blvd, Bakersfield, CA 93301`
- Purchase Price: `650000`
- Closing Date: Select a future date
- Buyer Name: `Charlie Broker`
- Seller Name: `Diana Corp`
- Status: `Pending`
- **Privacy Settings:**
  - Private: **OFF**
  - Sharing Level: **Broker**

**Action 11.2:** Click "Create Escrow"

**Expected:**
- [ ] Modal closes
- [ ] New card shows **PURPLE "Broker" chip** with business icon 🏢

**Actual:**
- Privacy badge: _____________________________________________

**Grade this section:** _____ / 100

---

### Step 12: Verify All 3 Escrows Created

**Count the escrow cards on the page:**
```
Total escrows visible: _____

Card 1 (123 Test Street):
  Privacy: [ ] Blue "Team" [ ] Red "Private" [ ] Purple "Broker" [ ] None

Card 2 (456 Private Lane):
  Privacy: [ ] Blue "Team" [ ] Red "Private" [ ] Purple "Broker" [ ] None

Card 3 (789 Broker Blvd):
  Privacy: [ ] Blue "Team" [ ] Red "Private" [ ] Purple "Broker" [ ] None
```

**Expected:**
- Card 1: Blue "Team"
- Card 2: Red "Private"
- Card 3: Purple "Broker"

**All correct?** [ ] Yes [ ] No

**Grade this section:** _____ / 100

---

### Step 13: Escrow Detail Page

**Action 13.1:** Click on any escrow card

**Expected:**
- Navigates to detail page (URL: `/escrows/{id}`)
- Shows full escrow details
- Edit button visible
- Delete/Archive button visible
- All fields display correctly

**Detail Page Elements:**
- [ ] Property address as title
- [ ] Purchase price prominently displayed
- [ ] Buyer and seller information
- [ ] Closing date
- [ ] Status badge
- [ ] Commission information
- [ ] Timeline or milestones section
- [ ] Documents section (if applicable)
- [ ] Notes/comments section

**Privacy Indicator on Detail Page:**
```
Is privacy status shown on detail page?
[ ] Yes - Shows lock icon or badge
[ ] No - Not visible (may be expected)

Record what you see: _____________________________________________
```

**Grade this section:** _____ / 100

---

### Step 14: Edit Escrow

**Action 14.1:** On escrow detail page, click "Edit" button

**Expected:**
- Edit modal opens OR page enters edit mode
- All fields populated with current values
- Privacy controls visible with current settings

**Action 14.2:** Change privacy setting
- If currently "Team", change to "Private"
- **Expected:** Toggle or dropdown changes

**Action 14.3:** Click "Save" or "Update"

**Expected:**
- [ ] Changes saved
- [ ] Success message
- [ ] Privacy badge updates on card (return to list to verify)

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 15: Archive/Delete Escrow

**Action 15.1:** From escrow detail page, click "Archive" or "Delete"

**Expected:**
- Confirmation dialog appears
- Warning message about deleting data
- "Cancel" and "Confirm" buttons

**Action 15.2:** Click "Confirm"

**Expected:**
- [ ] Escrow removed from active list
- [ ] Success message
- [ ] Redirects to escrows list

**Action 15.3:** Check archived section (if exists)
- Navigate to archived escrows (look for "Archived" tab or filter)
- **Expected:** Deleted escrow appears in archived section

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

## Section 2.2: Escrows Health Dashboard
**URL:** https://crm.jaydenmetz.com/escrows/health

### Step 16: Health Dashboard Test

**Action 16.1:** Navigate to `/escrows/health`

**What you should see:**
- [ ] Page title: "Escrows Health Check" or similar
- [ ] List of test cases (29 tests for escrows)
- [ ] "Run All Tests" button
- [ ] Test authentication section (JWT and API Key tabs)

**Action 16.2:** Click "Run All Tests"

**Expected:**
- [ ] Tests execute automatically (may take 10-30 seconds)
- [ ] Each test shows ✅ green checkmark (PASS) or ❌ red X (FAIL)
- [ ] Summary at top: "X/29 tests passed"

**Record results:**
```
Tests Passed: _____ / 29
Tests Failed: _____ / 29

If any failed, list them:
_____________________________________________
_____________________________________________
```

**Grade this section:** _____ / 100

---

**🎯 ESCROWS MODULE FINAL GRADE:** _____ / 100

**Critical Issues Found (if any):**
```
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________
```

---

# PART 3: LISTINGS MODULE
**Time:** 25 minutes | **Grade:** _____ / 100

---

## Section 3.1: Listings List View
**URL:** https://crm.jaydenmetz.com/listings

### Step 17: Listings Dashboard Visual Check

**What you should see:**
- [ ] "Listings" page title
- [ ] "+ New Listing" button
- [ ] Grid of listing cards (or empty state)
- [ ] Each card shows:
  - [ ] Property photo or placeholder
  - [ ] Property address
  - [ ] List price
  - [ ] Bedrooms/Bathrooms
  - [ ] Square footage
  - [ ] Status (Active/Pending/Sold)
  - [ ] **🆕 Privacy badge** (Team/Private/Broker)

**Privacy Badge Check:**
```
Do existing listings show privacy indicators?
[ ] Yes - Record what you see: _____________________________________________
[ ] No - May be old data without privacy settings
```

**Grade this section:** _____ / 100

---

### Step 18: Create New Listing with Privacy

**Action 18.1:** Click "+ New Listing"

**Modal Elements Check:**
- [ ] Property Address autocomplete/search
- [ ] City, State, ZIP fields
- [ ] List Price field
- [ ] Property Type dropdown (Single Family, Condo, etc.)
- [ ] Bedrooms field
- [ ] Bathrooms field
- [ ] Square Footage field
- [ ] Status dropdown (Coming Soon, Active, Pending)
- [ ] Client selector dropdown
- [ ] **🆕 Privacy & Sharing section**

**Privacy Controls Check:**
```
Privacy section visible? [ ] Yes [ ] No
If YES:
  [ ] Private toggle switch
  [ ] Sharing Level dropdown
  [ ] Helper text present

Record what you see: _____________________________________________
```

**Grade this section:** _____ / 100

---

### Step 19: Test Listing Creation with Privacy

**Fill out form:**
- Property Address: `1010 Luxury Lane, Bakersfield, CA 93301` (or use autocomplete)
- List Price: `750000`
- Property Type: `Single Family`
- Bedrooms: `4`
- Bathrooms: `3`
- Square Footage: `2500`
- Status: `Active`
- Client: Select any client or "Add New Client"
- **Privacy:** Private = OFF, Sharing = **Team**

**Action 19.1:** Click "Create Listing"

**Expected:**
- [ ] Modal closes
- [ ] Success message
- [ ] New listing card appears
- [ ] Card shows **Blue "Team" badge**

**Actual:**
- Card created: [ ] Yes [ ] No
- Privacy badge: _____________________________________________

**Grade this section:** _____ / 100

---

### Step 20: Create Private Listing

**Action 20.1:** Click "+ New Listing" again

**Fill out form with Private ON:**
- Property Address: `2020 Secret Street, Bakersfield, CA 93301`
- List Price: `850000`
- Property Type: `Condo`
- Bedrooms: `3`
- Bathrooms: `2`
- Square Footage: `1800`
- Status: `Coming Soon`
- **Privacy:** Private = **ON**

**Action 20.2:** Click "Create Listing"

**Expected:**
- [ ] New card shows **Red "Private" badge** with lock icon

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 21: Listing Detail & Edit

**Action 21.1:** Click on a listing card

**Expected:**
- Full listing detail page loads
- Property photos (if any)
- All property details displayed
- Edit and delete buttons visible

**Action 21.2:** Click "Edit"
- Privacy controls should show current settings
- Change privacy from Team to Broker
- Save changes

**Expected:**
- [ ] Card updates to show **Purple "Broker" badge**

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 22: Listings Health Check
**URL:** https://crm.jaydenmetz.com/listings/health

**Action 22.1:** Navigate to health dashboard
**Action 22.2:** Run all tests

**Results:**
```
Tests Passed: _____ / 26
Tests Failed: _____

Failed tests (if any):
_____________________________________________
```

**Grade this section:** _____ / 100

---

**🎯 LISTINGS MODULE FINAL GRADE:** _____ / 100

---

# PART 4: CLIENTS MODULE
**Time:** 20 minutes | **Grade:** _____ / 100

---

## Section 4.1: Clients List View
**URL:** https://crm.jaydenmetz.com/clients

### Step 23: Clients Dashboard Check

**What you should see:**
- [ ] "Clients" page title
- [ ] "+ New Client" button
- [ ] List/grid of client cards
- [ ] Each card shows:
  - [ ] Client name
  - [ ] Email address
  - [ ] Phone number
  - [ ] Client type (Buyer/Seller/Both)
  - [ ] Status badge
  - [ ] **🆕 Privacy badge**

**Privacy Badge Check:**
```
Clients showing privacy indicators?
[ ] Yes - Describe: _____________________________________________
[ ] No
```

**Grade this section:** _____ / 100

---

### Step 24: Create New Client with Privacy

**Action 24.1:** Click "+ New Client"

**Modal should show:**
- [ ] First Name field
- [ ] Last Name field
- [ ] Email field
- [ ] Phone field
- [ ] Client Type dropdown (Buyer/Seller/Both)
- [ ] Stage dropdown (New/Qualified/Showing/Offer/Contract/Closed)
- [ ] **🆕 Privacy & Sharing section**

**Test Privacy Controls:**
- [ ] Toggle Private ON → dropdown disappears
- [ ] Toggle Private OFF → dropdown shows Team/Broker options

**Fill out form:**
- First Name: `Michael`
- Last Name: `TestClient`
- Email: `michael@test.com`
- Phone: `661-555-0101`
- Client Type: `Buyer`
- Stage: `Qualified`
- **Privacy:** Private = OFF, Sharing = **Team**

**Action 24.2:** Click "Create Client"

**Expected:**
- [ ] New client card appears
- [ ] Shows **Blue "Team" badge**

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 25: Create Private Client

**Create another client with:**
- First Name: `Sarah`
- Last Name: `PrivateClient`
- Email: `sarah@private.com`
- Phone: `661-555-0102`
- Client Type: `Seller`
- **Privacy:** Private = **ON**

**Expected:**
- [ ] Card shows **Red "Private" badge** with lock icon

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 26: Client Detail & Edit

**Action 26.1:** Click on a client card

**Expected:**
- Client detail page loads
- Full contact information
- Associated listings/escrows shown
- Edit and delete buttons

**Action 26.2:** Test edit with privacy change

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 27: Clients Health Check
**URL:** https://crm.jaydenmetz.com/clients/health

**Run all tests:**
```
Tests Passed: _____ / 15
Tests Failed: _____
```

**Grade this section:** _____ / 100

---

**🎯 CLIENTS MODULE FINAL GRADE:** _____ / 100

---

# PART 5: LEADS MODULE
**Time:** 20 minutes | **Grade:** _____ / 100

---

## Section 5.1: Leads List View
**URL:** https://crm.jaydenmetz.com/leads

### Step 28: Leads Dashboard Check

**What you should see:**
- [ ] "Leads" page title
- [ ] "+ New Lead" button
- [ ] Lead cards with:
  - [ ] Lead name
  - [ ] Email/Phone
  - [ ] Lead status (New/Contacted/Qualified/Nurturing/Hot Lead/Converted/Lost)
  - [ ] Lead score or rating
  - [ ] **🆕 Privacy badge**

**Grade this section:** _____ / 100

---

### Step 29: Create New Lead with Privacy

**Action 29.1:** Click "+ New Lead"

**Modal elements:**
- [ ] First Name, Last Name
- [ ] Email, Phone
- [ ] Lead Status dropdown
- [ ] Source (Website/Referral/Social Media/etc.)
- [ ] Notes field
- [ ] **🆕 Privacy & Sharing section**

**Create lead:**
- First Name: `Emma`
- Last Name: `LeadTest`
- Email: `emma@lead.com`
- Phone: `661-555-0103`
- Status: `New`
- Source: `Website`
- **Privacy:** Team

**Expected:**
- [ ] Lead created with **Blue "Team" badge**

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 30: Create Private Lead

**Create another lead with:**
- First Name: `Private`
- Last Name: `LeadSecure`
- **Privacy:** Private = **ON**

**Expected:**
- [ ] Shows **Red "Private" badge** with lock

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 31: Lead Conversion Test

**Action 31.1:** Click on a lead card
**Action 31.2:** Look for "Convert to Client" button

**If button exists:**
- [ ] Click "Convert to Client"
- [ ] Conversion dialog appears
- [ ] Privacy settings transfer to new client
- [ ] Lead status changes to "Converted"

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 32: Leads Health Check
**URL:** https://crm.jaydenmetz.com/leads/health

**Results:**
```
Tests Passed: _____ / 14
Tests Failed: _____
```

**Grade this section:** _____ / 100

---

**🎯 LEADS MODULE FINAL GRADE:** _____ / 100

---

# PART 6: APPOINTMENTS MODULE
**Time:** 20 minutes | **Grade:** _____ / 100

---

## Section 6.1: Appointments List View
**URL:** https://crm.jaydenmetz.com/appointments

### Step 33: Appointments Dashboard Check

**What you should see:**
- [ ] "Appointments" page title
- [ ] "+ New Appointment" button
- [ ] Calendar view OR list view
- [ ] Appointment cards showing:
  - [ ] Date and time
  - [ ] Location
  - [ ] Purpose/Title
  - [ ] Linked lead/client (if any)
  - [ ] Status (Scheduled/Completed/Cancelled)
  - [ ] **🆕 Privacy badge**

**Grade this section:** _____ / 100

---

### Step 34: Create New Appointment with Privacy

**Action 34.1:** Click "+ New Appointment"

**Modal elements:**
- [ ] Date picker
- [ ] Time picker
- [ ] Location field (with autocomplete)
- [ ] Purpose/Title field
- [ ] Link to Lead dropdown (optional)
- [ ] Type (Showing/Consultation/Inspection/etc.)
- [ ] **🆕 Privacy & Sharing section**

**Create appointment:**
- Date: Tomorrow's date
- Time: `10:00 AM`
- Location: `123 Test Street, Bakersfield, CA`
- Purpose: `Property Showing`
- **Privacy:** Team

**Expected:**
- [ ] Appointment created with **Blue "Team" badge**

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 35: Create Private Appointment

**Create another appointment with:**
- Date: 2 days from now
- Time: `2:00 PM`
- Location: `Private Office`
- Purpose: `Confidential Meeting`
- **Privacy:** Private = **ON**

**Expected:**
- [ ] Shows **Red "Private" badge**

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 36: Appointment Detail & Reschedule

**Action 36.1:** Click on an appointment
**Action 36.2:** Click "Edit" or "Reschedule"
- Change time or date
- Save changes

**Expected:**
- [ ] Changes saved
- [ ] Calendar updates (if calendar view)

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 37: Appointments Health Check
**URL:** https://crm.jaydenmetz.com/appointments/health

**Results:**
```
Tests Passed: _____ / 15
Tests Failed: _____
```

**Grade this section:** _____ / 100

---

**🎯 APPOINTMENTS MODULE FINAL GRADE:** _____ / 100

---

# PART 7: ADMIN & SETTINGS
**Time:** 30 minutes | **Grade:** _____ / 100

---

## Section 7.1: Settings Page
**URL:** https://crm.jaydenmetz.com/settings

### Step 38: Settings Overview

**Action 38.1:** Navigate to Settings (click user profile → Settings)

**What you should see:**
- [ ] Profile settings section
- [ ] API Keys section
- [ ] Team settings (if team_owner or broker)
- [ ] Preferences section
- [ ] Security section

**Grade this section:** _____ / 100

---

### Step 39: API Keys Management

**Action 39.1:** Scroll to "API Keys" section

**Expected elements:**
- [ ] "Generate New API Key" button
- [ ] List of existing API keys (if any)
- [ ] Each key shows:
  - [ ] Name
  - [ ] Created date
  - [ ] Last used date
  - [ ] Expiration date
  - [ ] Revoke button

**Action 39.2:** Click "Generate New API Key"

**Modal should show:**
- [ ] Key name input field
- [ ] Expiration dropdown (30/90/365 days / Never)
- [ ] Scopes/permissions checkboxes (if applicable)

**Create key:**
- Name: `Test Integration Key`
- Expiration: `90 days`

**Expected:**
- [ ] Key generated
- [ ] **IMPORTANT:** Full API key shown ONCE (copy it!)
- [ ] Warning: "Save this key, it won't be shown again"
- [ ] New key appears in list (showing only last 8 characters)

**Copy the API key here (you'll need it):**
```
API Key: _____________________________________________
```

**Grade this section:** _____ / 100

---

### Step 40: Test API Key (Advanced)

**Action 40.1:** Open browser DevTools → Console

**Paste this command (replace YOUR_API_KEY):**
```javascript
fetch('https://api.jaydenmetz.com/v1/escrows', {
  headers: {
    'X-API-Key': 'YOUR_API_KEY_HERE'
  }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
```

**Expected:**
- [ ] Console shows: `API Response: {success: true, data: [...]}`
- [ ] Data array contains your escrows

**Actual:**
```
Console output: _____________________________________________
```

**Grade this section:** _____ / 100

---

### Step 41: Revoke API Key

**Action 41.1:** In API Keys list, click "Revoke" on the test key

**Expected:**
- [ ] Confirmation dialog
- [ ] After confirming, key shows as "Revoked"
- [ ] Key no longer works (retry fetch command → should get 401 error)

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

## Section 7.2: Team Permissions Manager (NEW FEATURE)

**⚠️ This section requires team_owner, broker, or system_admin role**

### Step 42: Access Team Permissions

**Action 42.1:** Look for "Team Permissions" or "Manage Team" in Settings or Admin menu

**If you DON'T see it:**
```
[ ] Not visible - Expected for regular agents
[ ] Should be visible but isn't - BUG (record this)

Current user role: _____________________________________________
```

**If you DO see it:**

**Action 42.2:** Click to open Team Permissions Manager

**Expected:**
- [ ] Table showing all team members
- [ ] Columns:
  - [ ] User (name, email)
  - [ ] Role (agent/team_owner/broker)
  - [ ] Permission checkboxes (6 columns):
    - [ ] Can Delete
    - [ ] Can Edit Team Data
    - [ ] View Financials
    - [ ] Manage Team
    - [ ] Team Admin
    - [ ] Broker Admin
  - [ ] Actions (Edit button)

**Grade this section:** _____ / 100

---

### Step 43: Edit Team Member Permissions

**Action 43.1:** Click "Edit" (pencil icon) on a team member

**Expected:**
- [ ] Row enters edit mode
- [ ] Checkboxes become clickable
- [ ] Save and Cancel buttons appear

**Action 43.2:** Toggle a permission (e.g., "Can Delete")
- [ ] Checkbox toggles ON
- [ ] Click "Save" (checkmark icon)

**Expected:**
- [ ] Success message
- [ ] Checkbox stays checked
- [ ] Row exits edit mode

**Action 43.3:** Try to edit YOUR OWN row

**Expected:**
- [ ] Edit button is disabled OR
- [ ] Error message: "You cannot modify your own permissions"

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

### Step 44: Try to Edit Broker/Admin

**Action 44.1:** Find a user with role "broker" or "system_admin" (if any)
**Action 44.2:** Try to click "Edit" on that user

**Expected:**
- [ ] Edit button disabled OR
- [ ] Error: "Cannot modify permissions for brokers or system admins"

**Actual:** _____________________________________________

**Grade this section:** _____ / 100

---

## Section 7.3: Admin Entity Selector (NEW FEATURE)

**⚠️ Only for system_admin or broker roles**

### Step 45: Access Admin Dashboard

**Action 45.1:** Look for "Admin Dashboard" or "System Admin" in navigation

**If visible:**

**Expected elements:**
- [ ] Entity Selector component at top:
  - [ ] "View Scope" dropdown (Brokerage/Team/User)
  - [ ] Broker dropdown (if system_admin)
  - [ ] Team dropdown (when Team or User scope)
  - [ ] User dropdown (when User scope)
- [ ] Current selection shown as colored chips

**Action 45.2:** Change scope from Brokerage → Team

**Expected:**
- [ ] Team dropdown appears
- [ ] Shows teams under selected broker

**Action 45.3:** Select a team from dropdown

**Expected:**
- [ ] Blue "Team" chip appears showing team name
- [ ] Dashboard below updates to show that team's data

**Grade this section:** _____ / 100

---

**🎯 ADMIN & SETTINGS FINAL GRADE:** _____ / 100

---

# PART 8: HEALTH DASHBOARDS (SYSTEM TESTING)
**Time:** 20 minutes | **Grade:** _____ / 100

---

## Section 8.1: Main Health Dashboard
**URL:** https://crm.jaydenmetz.com/health

### Step 46: System-Wide Health Check

**Action 46.1:** Navigate to `/health`

**What you should see:**
- [ ] "System Health" or "Health Overview" title
- [ ] Cards for each module:
  - [ ] Escrows (29 tests)
  - [ ] Listings (26 tests)
  - [ ] Clients (15 tests)
  - [ ] Appointments (15 tests)
  - [ ] Leads (14 tests)
- [ ] Each card shows:
  - [ ] Module name
  - [ ] Test count
  - [ ] Status indicator (green/red)
  - [ ] "View Details" or "Run Tests" button

**Action 46.2:** Click "Run All Tests" (if available)

**Expected:**
- [ ] All module tests execute
- [ ] Overall pass rate shown (e.g., "228/228 tests passed")
- [ ] Any failures highlighted in red

**Record results:**
```
Total Tests: _____
Passed: _____
Failed: _____
Pass Rate: _____%
```

**Grade this section:** _____ / 100

---

### Step 47: Individual Module Health Checks

**Test each module's health dashboard:**

**Escrows Health:** `/escrows/health`
- [ ] 29 tests run
- [ ] Pass rate: _____%

**Listings Health:** `/listings/health`
- [ ] 26 tests run
- [ ] Pass rate: _____%

**Clients Health:** `/clients/health`
- [ ] 15 tests run
- [ ] Pass rate: _____%

**Appointments Health:** `/appointments/health`
- [ ] 15 tests run
- [ ] Pass rate: _____%

**Leads Health:** `/leads/health`
- [ ] 14 tests run
- [ ] Pass rate: _____%

**Overall Health Check Grade:**
```
All modules 100%: A+
1-2 failures: A
3-5 failures: B
6-10 failures: C
>10 failures: D/F
```

**Grade this section:** _____ / 100

---

**🎯 HEALTH DASHBOARDS FINAL GRADE:** _____ / 100

---

# PART 9: DATA CONSISTENCY & PRIVACY VERIFICATION
**Time:** 15 minutes | **Grade:** _____ / 100

---

## Section 9.1: Privacy Badge Consistency

### Step 48: Verify Privacy Across All Modules

**Return to each module and count privacy badges:**

**Escrows:**
```
Total escrows: _____
With "Team" badge: _____
With "Private" badge: _____
With "Broker" badge: _____
With NO badge: _____ (old data expected)
```

**Listings:**
```
Total listings: _____
With privacy badges: _____
Without badges: _____
```

**Clients:**
```
Total clients: _____
With privacy badges: _____
Without badges: _____
```

**Leads:**
```
Total leads: _____
With privacy badges: _____
Without badges: _____
```

**Appointments:**
```
Total appointments: _____
With privacy badges: _____
Without badges: _____
```

**Expected:**
- Items created TODAY should have privacy badges
- Old items may not have badges (created before Phase 6)

**Consistency Check:**
```
All new items show badges: [ ] Yes [ ] No
Badge colors correct: [ ] Yes [ ] No
Icons display properly: [ ] Yes [ ] No
```

**Grade this section:** _____ / 100

---

## Section 9.2: Cross-Module Integration

### Step 49: Create Full Transaction Flow

**Action 49.1: Create a Lead**
- Name: `Full Flow Test`
- Email: `fullflow@test.com`
- Privacy: **Team**
- Record Lead ID: _____________

**Action 49.2: Convert Lead to Client**
- Convert the lead you just created
- **Expected:** Privacy setting transfers to client
- Client shows **Blue "Team" badge**: [ ] Yes [ ] No

**Action 49.3: Create Listing for that Client**
- Create a new listing
- Link to the client from step 49.2
- Privacy: **Team** (to match client)
- **Expected:** Listing shows **Blue "Team" badge**

**Action 49.4: Create Escrow for that Listing**
- Create escrow with same property address
- Link to same client
- Privacy: **Team**
- **Expected:** Escrow shows **Blue "Team" badge**

**Action 49.5: Create Appointment for Showing**
- Create appointment
- Link to the lead/client
- Privacy: **Team**
- **Expected:** Appointment shows **Blue "Team" badge**

**Full Flow Verification:**
```
Lead created: [ ] Yes [ ] No
Client created: [ ] Yes [ ] No
Listing created: [ ] Yes [ ] No
Escrow created: [ ] Yes [ ] No
Appointment created: [ ] Yes [ ] No

All show Team badge: [ ] Yes [ ] No
All properly linked: [ ] Yes [ ] No
```

**Grade this section:** _____ / 100

---

**🎯 DATA CONSISTENCY FINAL GRADE:** _____ / 100

---

# PART 10: PERFORMANCE & USER EXPERIENCE
**Time:** 10 minutes | **Grade:** _____ / 100

---

## Section 10.1: Performance Testing

### Step 50: Page Load Times

**Measure page load times (use DevTools Network tab → Disable cache):**

**Home Dashboard:** https://crm.jaydenmetz.com/
- Load time: _____ seconds
- [ ] <2 seconds: A+
- [ ] 2-3 seconds: A
- [ ] 3-5 seconds: B
- [ ] >5 seconds: C/D

**Escrows List:** https://crm.jaydenmetz.com/escrows
- Load time: _____ seconds
- Grade: _____

**Listings List:** https://crm.jaydenmetz.com/listings
- Load time: _____ seconds
- Grade: _____

**Overall Performance Grade:** _____ / 100

---

### Step 51: Responsive Design Check

**Test on different screen sizes:**

**Desktop (1920x1080):**
- [ ] Layout looks good
- [ ] No horizontal scrolling
- [ ] Cards display in grid

**Tablet (iPad - 768x1024):**
- [ ] Resize browser to ~800px width
- [ ] Navigation adapts (mobile menu?)
- [ ] Cards stack properly
- [ ] Touch targets large enough

**Mobile (iPhone - 375x667):**
- [ ] Resize to ~400px width
- [ ] Mobile menu visible
- [ ] Cards stack vertically
- [ ] Forms still usable

**Responsive Grade:** _____ / 100

---

### Step 52: UI/UX Quality Check

**Rate the following (1-10):**

**Visual Design:**
- Professional appearance: _____ / 10
- Color scheme cohesion: _____ / 10
- Typography readability: _____ / 10

**Usability:**
- Navigation clarity: _____ / 10
- Button placement/visibility: _____ / 10
- Form field labels clear: _____ / 10

**Accessibility:**
- Contrast ratio adequate: _____ / 10
- Icons have tooltips: _____ / 10
- Keyboard navigation works: _____ / 10

**Total UX Score:** _____ / 90 → Convert to _____ / 100

---

**🎯 PERFORMANCE & UX FINAL GRADE:** _____ / 100

---

# PART 11: SECURITY & ERROR HANDLING
**Time:** 15 minutes | **Grade:** _____ / 100

---

## Section 11.1: Authentication Security

### Step 53: Session Persistence

**Action 53.1:** Refresh the page (F5)

**Expected:**
- [ ] You stay logged in
- [ ] No redirect to login page
- [ ] User state preserved

**Action 53.2:** Open new tab, navigate to https://crm.jaydenmetz.com

**Expected:**
- [ ] Already logged in (no login required)

**Grade this section:** _____ / 100

---

### Step 54: Logout & Re-login

**Action 54.1:** Click user profile → Logout

**Expected:**
- [ ] Redirects to login page
- [ ] Session cleared
- [ ] Cannot access protected routes

**Action 54.2:** Try to access `/escrows` directly (type in URL)

**Expected:**
- [ ] Redirects to login page
- [ ] 401 Unauthorized or similar

**Action 54.3:** Log back in with same credentials

**Expected:**
- [ ] Login successful
- [ ] Redirects to home dashboard
- [ ] All data still present

**Grade this section:** _____ / 100

---

### Step 55: Error Handling

**Test invalid API requests:**

**Action 55.1:** In browser DevTools Console, paste:
```javascript
fetch('https://api.jaydenmetz.com/v1/escrows/invalid-uuid-000', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  }
})
.then(r => r.json())
.then(console.log)
```

**Expected response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Escrow not found"
  }
}
```

**Actual:** _____________________________________________

**Action 55.2:** Try to create escrow with missing required field

**Expected:**
- [ ] Validation error shown
- [ ] Modal doesn't close
- [ ] Error message clear

**Grade this section:** _____ / 100

---

### Step 56: Console Error Check

**Action 56.1:** Review browser console for the entire testing session

**Count errors:**
```
🔴 Red errors: _____
🟡 Yellow warnings: _____
🔵 Blue info messages: _____

List critical errors (if any):
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________
```

**Grading:**
- 0 errors: A+
- 1-2 errors: A
- 3-5 errors: B
- 6-10 errors: C
- >10 errors: D/F

**Grade this section:** _____ / 100

---

**🎯 SECURITY & ERROR HANDLING FINAL GRADE:** _____ / 100

---

# FINAL REPORT CARD

---

## Module Grades Summary

| Module | Grade | Weight | Weighted Score |
|--------|-------|--------|----------------|
| **1. Authentication & Onboarding** | _____ | 5% | _____ |
| **2. Escrows Module** | _____ | 20% | _____ |
| **3. Listings Module** | _____ | 15% | _____ |
| **4. Clients Module** | _____ | 15% | _____ |
| **5. Leads Module** | _____ | 10% | _____ |
| **6. Appointments Module** | _____ | 10% | _____ |
| **7. Admin & Settings** | _____ | 10% | _____ |
| **8. Health Dashboards** | _____ | 5% | _____ |
| **9. Data Consistency** | _____ | 5% | _____ |
| **10. Performance & UX** | _____ | 5% | _____ |
| **11. Security & Errors** | _____ | 5% | _____ |
| **OVERALL SYSTEM GRADE** | **_____** | **100%** | **_____** |

---

## Critical Issues Log

**🔴 CRITICAL (Must Fix Immediately):**
```
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________
```

**🟡 HIGH PRIORITY (Fix Within 1 Week):**
```
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________
```

**🟢 MEDIUM PRIORITY (Fix Within 1 Month):**
```
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________
```

**🔵 LOW PRIORITY (Nice to Have):**
```
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________
```

---

## Privacy Features Assessment (Phase 6 Specific)

**Privacy Controls in Modals:**
- [ ] All 5 modals have Privacy section: _____ / 5
- [ ] Toggle switch works correctly: [ ] Yes [ ] No
- [ ] Sharing dropdown shows/hides: [ ] Yes [ ] No
- [ ] Default values correct (Private=OFF, Level=Team): [ ] Yes [ ] No

**Privacy Badges on Cards:**
- [ ] All 5 card types show badges: _____ / 5
- [ ] Red "Private" badge with lock icon: [ ] Yes [ ] No
- [ ] Blue "Team" badge with group icon: [ ] Yes [ ] No
- [ ] Purple "Broker" badge with business icon: [ ] Yes [ ] No
- [ ] Badge colors/icons correct: [ ] Yes [ ] No

**Backend Privacy Integration:**
- [ ] Privacy settings save to database: [ ] Yes [ ] No
- [ ] Existing records updated with badges: [ ] Yes [ ] No
- [ ] Privacy transfers in conversions: [ ] Yes [ ] No

**Privacy Grade:** _____ / 100

---

## Recommendations

**Top 3 Things That Work Great:**
```
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________
```

**Top 3 Things That Need Improvement:**
```
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________
```

**User Experience Highlights:**
```
Best feature: _____________________________________________
Most intuitive: _____________________________________________
Most confusing: _____________________________________________
```

---

## Test Completion Checklist

- [ ] All 11 parts completed
- [ ] All grades recorded
- [ ] Critical issues documented
- [ ] Screenshots taken (if needed)
- [ ] Console errors logged
- [ ] Performance metrics recorded
- [ ] Privacy features verified

**Total Testing Time:** _____ hours _____ minutes

**Tester Signature:** _____________________________________________

**Date Completed:** _____________________________________________

---

# 🤖 BONUS: ChatGPT Browser Agent Mode Script

If you want to automate this with ChatGPT's browser agent, copy this prompt:

```
You are testing a Real Estate CRM at https://crm.jaydenmetz.com

Login credentials:
- Email: admin@jaydenmetz.com
- Password: AdminPassword123!

Test sequence:
1. Navigate to the login page
2. Enter credentials and click Login
3. Verify you land on the home dashboard
4. Navigate to /escrows
5. Click "+ New Escrow" button
6. Verify the modal opens
7. Check if there is a "Privacy & Sharing" section at the bottom
8. Take a screenshot of the modal
9. Fill out the form with test data:
   - Property Address: 123 Test Street, Bakersfield, CA
   - Purchase Price: 450000
   - Closing Date: 30 days from today
   - Buyer: John Buyer
   - Seller: Jane Seller
   - Privacy: OFF (unchecked)
   - Sharing Level: Team
10. Click "Create Escrow"
11. Verify a new card appears with a BLUE "Team" badge
12. Take a screenshot of the card
13. Repeat for /listings, /clients, /leads, /appointments
14. Report what you found

For each module, tell me:
- Does the "+ New" button work?
- Does the modal have Privacy controls?
- Do created items show privacy badges?
- Are there any errors in the console?
```

---

**END OF TESTING SCRIPT**

**Questions? Issues? Contact the development team.**

**Last Updated:** October 22, 2025
**Version:** 1.0 (Post-Phase 6 Privacy Implementation)
