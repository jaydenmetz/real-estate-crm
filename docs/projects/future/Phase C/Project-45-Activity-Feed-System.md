# Project-45: Activity Feed System

**Phase**: C | **Priority**: MEDIUM | **Status**: Not Started
**Est**: 10 hrs + 2 hrs = 12 hrs | **Deps**: Project-44 (Team Collaboration)
**FINAL MILESTONE**: Phase C completion

## 🎯 Goal
Build comprehensive activity feed aggregating all CRM events with filtering.

## 📋 Current → Target
**Now**: No activity feed
**Target**: Real-time activity stream, event aggregation, filtering, notifications
**Success Metric**: All CRM events logged; activity feed displays; filters work; real-time updates via WebSocket

## 📖 Context
An activity feed provides transparency and awareness: see when escrows are created, listings added, documents uploaded, messages sent, tasks completed, etc. This project creates a comprehensive activity stream that aggregates all CRM events, displays them chronologically, and allows filtering by user, event type, and date range.

Key features: Event logging, activity aggregation, real-time feed updates, filtering, and event detail views.

## ⚠️ Risk Assessment

### Technical Risks
- **Performance**: Large activity tables
- **Real-Time Scaling**: High WebSocket load
- **Data Volume**: Activity logs growing indefinitely

### Business Risks
- **Privacy**: Exposing sensitive activities
- **Information Overload**: Too many events
- **Storage Costs**: Large activity tables

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-45-activity-$(date +%Y%m%d)
git push origin pre-project-45-activity-$(date +%Y%m%d)

# Backup activity_feed table
pg_dump $DATABASE_URL -t activity_feed > backup-activity-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-45-activity-YYYYMMDD -- backend/src/services/activity.service.js
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Design activity_feed table schema
- [ ] Define event types to track
- [ ] Plan activity aggregation logic
- [ ] Map real-time update events

### Implementation (6.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create activity_feed table
  - [ ] Add indexes for performance
  - [ ] Create activity retention policy

- [ ] **Backend API** (3 hours):
  - [ ] Implement POST /v1/activity (log event)
  - [ ] Implement GET /v1/activity (fetch feed with filters)
  - [ ] Implement GET /v1/activity/user/:id (user activity)
  - [ ] Add activity logging to all controllers
  - [ ] Integrate with WebSocket for real-time

- [ ] **Frontend UI** (2.5 hours):
  - [ ] Create ActivityFeed component
  - [ ] Add activity stream with infinite scroll
  - [ ] Add filter UI (user, type, date range)
  - [ ] Add event icons and formatting
  - [ ] Show real-time updates

### Testing (2 hours)
- [ ] Test activity logging
- [ ] Test feed filtering
- [ ] Test real-time updates
- [ ] Test performance with 10k+ events
- [ ] Test retention policy

### Documentation (0.5 hours)
- [ ] Document tracked events
- [ ] Add activity API to API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Log Activity
```bash
TOKEN="<JWT token>"

# Activity logged automatically when creating escrow
curl -X POST https://api.jaydenmetz.com/v1/escrows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Main St",
    "buyer_name": "John Smith",
    "purchase_price": 500000
  }'

# Check activity feed
curl -X GET https://api.jaydenmetz.com/v1/activity \
  -H "Authorization: Bearer $TOKEN"
# Expected: "Jayden created escrow for 123 Main St"
```

### Test 2: Filter Activity Feed
```bash
# Filter by event type
curl -X GET "https://api.jaydenmetz.com/v1/activity?event_type=escrow_created&limit=20" \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of escrow creation events
```

### Test 3: User Activity Timeline
```bash
USER_ID="<user UUID>"

curl -X GET https://api.jaydenmetz.com/v1/activity/user/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
# Expected: All activities by specific user
```

## 📝 Implementation Notes

### Activity Feed Table Schema
```sql
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- Who performed the action
  event_type VARCHAR(100) NOT NULL, -- escrow_created, listing_added, etc.
  event_data JSONB, -- Additional event details
  resource_type VARCHAR(50), -- escrow, listing, client, etc.
  resource_id UUID, -- ID of the resource
  description TEXT, -- Human-readable: "Jayden created escrow for 123 Main St"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_event_type ON activity_feed(event_type);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX idx_activity_feed_resource ON activity_feed(resource_type, resource_id);
```

### Tracked Event Types
- **Escrows**: `escrow_created`, `escrow_updated`, `escrow_closed`, `escrow_cancelled`
- **Listings**: `listing_added`, `listing_updated`, `listing_sold`
- **Clients**: `client_added`, `client_updated`
- **Documents**: `document_uploaded`, `document_deleted`
- **Tasks**: `task_created`, `task_completed`
- **Messages**: `message_sent`, `file_shared`
- **Appointments**: `appointment_scheduled`, `appointment_completed`
- **Commissions**: `commission_calculated`, `commission_approved`

### Activity Logging Pattern
```javascript
// In escrows.controller.js
const escrow = await EscrowService.create(data);
await ActivityService.log({
  user_id: req.user.id,
  event_type: 'escrow_created',
  resource_type: 'escrow',
  resource_id: escrow.id,
  description: `${req.user.name} created escrow for ${escrow.address}`,
  event_data: { escrow_id: escrow.id, address: escrow.address }
});
```

### Activity Retention Policy
- Keep all activities for 90 days
- Archive activities >90 days old to `activity_feed_archive` table
- Delete archived activities >1 year old
- Run retention job daily at 3 AM

### Real-Time Updates
- Broadcast new activities via WebSocket
- Clients subscribe to `activity_feed` room
- Emit event: `activity_created` with activity object
- Frontend prepends new activity to feed

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use existing WebSocket service
- [ ] Use apiInstance for API calls
- [ ] Follow existing patterns

## 🧪 Test Coverage Impact
**After Project-45**: Activity feed API tested

## 🔗 Dependencies

### Depends On
- Project-44 (Team Collaboration - uses team events)
- Phase B complete (all modules generating events)
- Optional: Project-25 (WebSocket)

### Blocks
- None (final project in Phase C)

### Parallel Work
- None (final project)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ All Phase C projects complete (Projects 31-44)
- ✅ WebSocket infrastructure ready
- ✅ Have CRM events to log

### Should Skip If:
- ❌ No need for activity transparency

### Optimal Timing:
- Final project in Phase C
- 1-2 days of work (12 hours)

## ✅ Success Criteria
- [ ] Activity feed table created
- [ ] All event types logging
- [ ] Activity feed displays correctly
- [ ] Filtering working
- [ ] Real-time updates functional
- [ ] Retention policy implemented
- [ ] Performance acceptable (<2s load)
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Test with 10k+ activities
- [ ] Verify query performance (<2s)
- [ ] Test real-time WebSocket updates
- [ ] Verify retention job scheduled

### Post-Deployment Verification
- [ ] Activity feed loads successfully
- [ ] New activities appear in real-time
- [ ] Filters work correctly
- [ ] No console errors

### Rollback Triggers
- Activity feed load time >5s
- WebSocket connection failures
- Missing activity events
- Database performance degradation

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Activity feed working
- [ ] Real-time updates functional
- [ ] Filters working
- [ ] Performance acceptable
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated
- [ ] **MILESTONE ACHIEVED: Phase C complete!**

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
**Phase C Status**: ✅ COMPLETE (45/105 projects = 43%)
