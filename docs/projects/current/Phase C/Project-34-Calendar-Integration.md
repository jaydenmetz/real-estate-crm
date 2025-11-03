# Project-34: Calendar Integration

**Phase**: C | **Priority**: HIGH | **Status**: Not Started
**Est**: 12 hrs + 4 hrs = 16 hrs | **Deps**: Phase B complete, Project-22 (Appointments)

## 🎯 Goal
Integrate with Google Calendar and Outlook for two-way appointment sync.

## 📋 Current → Target
**Now**: Appointments only in CRM database
**Target**: Two-way sync with Google/Outlook calendars, conflict detection, OAuth flow
**Success Metric**: Appointments created in CRM appear in Google/Outlook; external events sync to CRM

## 📖 Context
Real estate agents rely on their calendars for scheduling. This project integrates with Google Calendar and Outlook Calendar to sync appointments bidirectionally. When an agent creates an appointment in the CRM, it appears in their Google/Outlook calendar. When they book an event externally, it syncs to the CRM.

Key features: OAuth 2.0 authentication, calendar API integration, two-way sync, conflict detection, calendar selection (which calendars to sync), and sync status indicators.

## ⚠️ Risk Assessment

### Technical Risks
- **OAuth Complexity**: Token refresh failures
- **API Rate Limits**: Google/Microsoft API quotas
- **Sync Conflicts**: Same event edited in both places
- **Timezone Issues**: Different timezone handling

### Business Risks
- **Double Bookings**: Sync failures causing conflicts
- **Privacy Concerns**: Exposing personal calendar events
- **Token Expiration**: Lost access to calendars
- **Vendor Lock-In**: Dependency on Google/Microsoft APIs

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-34-calendar-$(date +%Y%m%d)
git push origin pre-project-34-calendar-$(date +%Y%m%d)

# Backup calendar_sync table
pg_dump $DATABASE_URL -t calendar_sync -t oauth_tokens > backup-calendar-$(date +%Y%m%d).sql
```

### If Things Break
```bash
# Disable calendar sync
git checkout pre-project-34-calendar-YYYYMMDD -- backend/src/services/calendar.service.js
git push origin main
```

## ✅ Tasks

### Planning (2 hours)
- [ ] Design calendar_sync and oauth_tokens tables
- [ ] Plan OAuth flow (Google and Microsoft)
- [ ] Define sync logic (which direction takes precedence)
- [ ] Map CRM appointments to calendar events
- [ ] Plan conflict resolution strategy

### Implementation (7.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create calendar_sync table
  - [ ] Create oauth_tokens table
  - [ ] Add calendar_id to appointments table
  - [ ] Add last_synced_at timestamps

- [ ] **Backend API** (4 hours):
  - [ ] Implement OAuth flow for Google Calendar
  - [ ] Implement OAuth flow for Outlook Calendar
  - [ ] Implement POST /v1/calendar/sync (trigger sync)
  - [ ] Implement GET /v1/calendar/status
  - [ ] Add Google Calendar API integration
  - [ ] Add Microsoft Graph API integration
  - [ ] Implement two-way sync logic
  - [ ] Add conflict detection

- [ ] **Frontend UI** (2.5 hours):
  - [ ] Create calendar settings page
  - [ ] Add "Connect Google Calendar" button
  - [ ] Add "Connect Outlook Calendar" button
  - [ ] Show sync status indicator
  - [ ] Add calendar selection dropdown
  - [ ] Display last sync time
  - [ ] Add manual sync button

### Testing (2.5 hours)
- [ ] Test OAuth flow (Google and Outlook)
- [ ] Test appointment sync CRM → Calendar
- [ ] Test event sync Calendar → CRM
- [ ] Test conflict detection
- [ ] Test token refresh
- [ ] Test sync with multiple calendars

### Documentation (1 hour)
- [ ] Document OAuth setup (Google/Microsoft consoles)
- [ ] Document sync behavior
- [ ] Add calendar API to API_REFERENCE.md
- [ ] Document conflict resolution

## 🧪 Verification Tests

### Test 1: Connect Calendar
```bash
# Visit: https://crm.jaydenmetz.com/settings/calendar
# Click "Connect Google Calendar"
# Complete OAuth flow
# Verify "Connected" status appears
```

### Test 2: Sync Appointment
```bash
TOKEN="<JWT token>"

# Create appointment in CRM
curl -X POST https://api.jaydenmetz.com/v1/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Property Showing",
    "start_time": "2025-03-15T14:00:00Z",
    "end_time": "2025-03-15T15:00:00Z",
    "location": "123 Main St"
  }'

# Check Google Calendar for new event
# Expected: Event appears in Google Calendar
```

### Test 3: Two-Way Sync
```bash
# Create event in Google Calendar
# Trigger sync
curl -X POST https://api.jaydenmetz.com/v1/calendar/sync \
  -H "Authorization: Bearer $TOKEN"

# Check CRM appointments
curl -X GET https://api.jaydenmetz.com/v1/appointments \
  -H "Authorization: Bearer $TOKEN"
# Expected: External event appears in CRM
```

## 📝 Implementation Notes

### Calendar Sync Tables Schema
```sql
CREATE TABLE calendar_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50), -- google, outlook
  calendar_id VARCHAR(255), -- External calendar ID
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50), -- google, outlook
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add to appointments table
ALTER TABLE appointments ADD COLUMN calendar_event_id VARCHAR(255);
ALTER TABLE appointments ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE;
```

### OAuth Configuration

**Google Calendar**:
1. Create project in Google Cloud Console
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://api.jaydenmetz.com/v1/auth/google/callback`
5. Request scopes: `https://www.googleapis.com/auth/calendar`

**Outlook Calendar**:
1. Register app in Azure AD
2. Add Microsoft Graph permissions: `Calendars.ReadWrite`
3. Set redirect URI: `https://api.jaydenmetz.com/v1/auth/microsoft/callback`

### Sync Logic
- **CRM → Calendar**: When appointment created/updated, push to calendar
- **Calendar → CRM**: Poll every 15 minutes for new/updated events
- **Conflict Resolution**: Last updated wins (check `updated_at` timestamps)
- **Deletion**: Soft delete in CRM, hard delete in calendar

### Supported Calendar Fields
- `title` → `summary`
- `description` → `description`
- `start_time` → `start.dateTime`
- `end_time` → `end.dateTime`
- `location` → `location`
- `attendees` → `attendees` (email addresses)

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store OAuth client IDs/secrets in .env
- [ ] Use apiInstance for API calls
- [ ] Follow OAuth best practices (PKCE)

## 🧪 Test Coverage Impact
**After Project-34**:
- Calendar API: OAuth and sync tested
- Two-way sync: Verified
- Conflict resolution: Tested

## 🔗 Dependencies

### Depends On
- Phase B complete (Projects 16-30)
- Project-22 (Appointments module)
- Google/Microsoft OAuth apps configured

### Blocks
- None

### Parallel Work
- Can work alongside Projects 31-33

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Appointments module working
- ✅ OAuth apps created (Google/Microsoft)
- ✅ Have test Google/Outlook accounts

### Should Skip If:
- ❌ Agents don't use Google/Outlook calendars
- ❌ Privacy concerns with calendar access

### Optimal Timing:
- After Project-22 (Appointments) complete
- 2 days of work (16 hours)

## ✅ Success Criteria
- [ ] Calendar sync tables created
- [ ] OAuth flow working (Google and Outlook)
- [ ] Appointments sync to calendar
- [ ] External events sync to CRM
- [ ] Token refresh functional
- [ ] Conflict detection working
- [ ] Sync status displayed
- [ ] Manual sync button works
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Calendar sync tables created
- [ ] OAuth configured
- [ ] Two-way sync verified
- [ ] Conflicts handled correctly
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
