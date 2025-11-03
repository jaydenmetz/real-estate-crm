# Project-25: WebSocket Real-Time Updates

**Phase**: B | **Priority**: HIGH | **Status**: Not Started
**Est**: 12 hrs + 3.5 hrs = 15.5 hrs | **Deps**: Projects 18-22 (All core modules)

## 🎯 Goal
Expand WebSocket from escrows-only to all 5 modules (listings, clients, leads, appointments).

## 📋 Current → Target
**Now**: Only escrows has real-time WebSocket updates
**Target**: All 5 modules have real-time collaboration with WebSocket sync
**Success Metric**: Multiple users see updates instantly across all modules without page refresh

## 📖 Context
Currently, only the escrows module has WebSocket real-time updates for inline editing. When one user edits an escrow field, other users viewing the same escrow see the change instantly. This creates a collaborative experience and prevents conflicting edits. This project extends WebSocket functionality to listings, clients, leads, and appointments, enabling real-time collaboration across the entire CRM.

WebSocket events include: record created, record updated, record deleted, field changed. The frontend listens for these events and updates the UI accordingly. This improves user experience by eliminating the need for manual page refreshes and reduces edit conflicts.

## ⚠️ Risk Assessment

### Technical Risks
- **WebSocket Connection Management**: Handling disconnects, reconnects
- **Event Flooding**: Too many updates overwhelming clients
- **Message Ordering**: Events arriving out of order
- **Memory Leaks**: Subscriptions not cleaned up

### Business Risks
- **Performance Degradation**: WebSocket overhead slowing down app
- **Confusion**: Users seeing changes they didn't make
- **Data Sync Issues**: Client and server state out of sync

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-25-websocket-expansion-$(date +%Y%m%d)
git push origin pre-project-25-websocket-expansion-$(date +%Y%m%d)

# Document current WebSocket code
cp backend/src/websocket.js backup-websocket-$(date +%Y%m%d).js
cp frontend/src/services/websocket.service.js backup-websocket-service-$(date +%Y%m%d).js
```

### If Things Break
```bash
git checkout pre-project-25-websocket-expansion-YYYYMMDD -- backend/src/websocket.js
git checkout pre-project-25-websocket-expansion-YYYYMMDD -- frontend/src/services/websocket.service.js
git push origin main

# Restart backend to reset WebSocket connections
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Review current escrows WebSocket implementation
- [ ] Design WebSocket event schema for all modules
- [ ] Plan connection management strategy
- [ ] Document event types per module
- [ ] Plan testing strategy for real-time updates

### Implementation (8.5 hours)
- [ ] **Backend WebSocket Server** (3 hours):
  - [ ] Extend WebSocket server to handle listings events
  - [ ] Add clients module events
  - [ ] Add leads module events
  - [ ] Add appointments module events
  - [ ] Implement room-based subscriptions (users subscribe to specific records)
  - [ ] Add connection logging (connect, disconnect, subscribe, unsubscribe)

- [ ] **Module Controllers** (3 hours):
  - [ ] Update listings controller to emit WebSocket events (create, update, delete)
  - [ ] Update clients controller to emit events
  - [ ] Update leads controller to emit events
  - [ ] Update appointments controller to emit events
  - [ ] Ensure all CRUD operations trigger events

- [ ] **Frontend WebSocket Service** (2.5 hours):
  - [ ] Extend websocket.service.js to handle all module types
  - [ ] Add subscription management (subscribe/unsubscribe by module and record ID)
  - [ ] Add event handlers for each module
  - [ ] Implement reconnection logic
  - [ ] Add connection status indicator

### Testing (4 hours)
- [ ] **Escrows** (already working, verify still works):
  - [ ] Open same escrow in 2 tabs
  - [ ] Edit field in tab 1, verify tab 2 updates

- [ ] **Listings**:
  - [ ] Open same listing in 2 tabs
  - [ ] Edit status in tab 1, verify tab 2 updates instantly

- [ ] **Clients**:
  - [ ] Open same client in 2 tabs
  - [ ] Edit phone in tab 1, verify tab 2 updates

- [ ] **Leads**:
  - [ ] Open same lead in 2 tabs
  - [ ] Change status in tab 1, verify tab 2 updates

- [ ] **Appointments**:
  - [ ] Open same appointment in 2 tabs
  - [ ] Change time in tab 1, verify tab 2 updates

- [ ] **Stress Testing**:
  - [ ] Test with 10+ concurrent connections
  - [ ] Test rapid updates (10 edits in 10 seconds)
  - [ ] Test disconnect/reconnect behavior

### Documentation (1 hour)
- [ ] Document WebSocket event schema
- [ ] Add WebSocket troubleshooting guide
- [ ] Document subscription management

## 🧪 Verification Tests

### Test 1: Listings Real-Time Update
```bash
# Terminal 1: Watch WebSocket logs
tail -f backend/logs/websocket.log

# Browser Tab 1: Open listing
# https://crm.jaydenmetz.com/listings/<id>

# Browser Tab 2: Open same listing
# https://crm.jaydenmetz.com/listings/<id>

# Tab 1: Edit list_price from $400,000 to $395,000
# Expected: Tab 2 shows price update instantly without refresh
# Terminal: Shows "LISTING_UPDATED" event
```

### Test 2: Multi-Module Real-Time
```bash
# Open different modules in different tabs:
# Tab 1: Escrow detail
# Tab 2: Listing detail
# Tab 3: Client detail
# Tab 4: Lead detail
# Tab 5: Appointment detail

# Edit each record in sequence
# Verify all tabs receive updates for their respective modules
# Check browser console for WebSocket messages
# Verify no errors, no memory leaks
```

### Test 3: Connection Resilience
```bash
# Open escrow detail page
# Verify WebSocket connected (check Network tab, WS filter)
# Kill backend process (simulate server crash)
# Restart backend
# Verify frontend reconnects automatically
# Make edit, verify real-time sync resumes
```

## 📝 Implementation Notes

### WebSocket Event Schema
```javascript
{
  type: 'ESCROW_UPDATED' | 'LISTING_UPDATED' | 'CLIENT_UPDATED' | 'LEAD_UPDATED' | 'APPOINTMENT_UPDATED',
  module: 'escrows' | 'listings' | 'clients' | 'leads' | 'appointments',
  action: 'created' | 'updated' | 'deleted',
  recordId: 'uuid',
  data: { ... }, // Full record or changed fields only
  userId: 'uuid', // Who made the change
  timestamp: '2025-11-02T12:00:00Z'
}
```

### Room-Based Subscriptions
- Users subscribe to specific records: `escrows:uuid`, `listings:uuid`, etc.
- Server broadcasts updates only to subscribed users
- Prevents unnecessary event traffic
- Example: `socket.join(`escrows:${escrowId}`)`

### Connection Management
- Auto-reconnect on disconnect (exponential backoff: 1s, 2s, 4s, 8s)
- Heartbeat/ping-pong to detect stale connections
- Clean up subscriptions on disconnect
- Show connection status in UI (green dot = connected)

### Performance Considerations
- Don't send full record on every update (send changed fields only)
- Throttle updates (max 1 update per field per second)
- Use message compression for large payloads
- Monitor WebSocket memory usage

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Edit websocket.service.js in place
- [ ] Use apiInstance for fallback HTTP requests
- [ ] Follow existing WebSocket patterns

## 🧪 Test Coverage Impact
**After Project-25**:
- WebSocket coverage: All 5 modules
- Real-time sync: Fully tested
- Connection resilience: Verified

## 🔗 Dependencies

### Depends On
- Projects 18-22 (All core modules must be working)

### Blocks
- Projects 29-30 (Error handling and loading states benefit from WebSocket)

### Parallel Work
- Can work alongside Project-26 (performance optimization)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ All 5 core modules working (Projects 18-22 complete)
- ✅ Escrows WebSocket working
- ✅ Backend WebSocket server stable

### Should Skip If:
- ❌ Escrows WebSocket broken
- ❌ Any core module has critical bugs

### Optimal Timing:
- After all core modules verified (Projects 18-22)
- 2 days of work (15.5 hours)
- **MILESTONE: Real-time collaboration across entire CRM**

## ✅ Success Criteria
- [ ] All 5 modules support WebSocket real-time updates
- [ ] Multiple users see changes instantly
- [ ] Connection resilience (auto-reconnect works)
- [ ] No memory leaks (tested with 1 hour of continuous use)
- [ ] Performance acceptable (no lag, smooth updates)
- [ ] Zero console errors
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

**[MILESTONE - Real-Time Collaboration Everywhere]**

Project-25 completion enables:
- ✅ Real-time updates across all 5 core modules
- ✅ Collaborative editing without conflicts
- ✅ Better user experience (no manual refreshes)
- ✅ Foundation for future features (notifications, chat, etc.)

**Before declaring MILESTONE complete**:
- [ ] All 5 modules tested with multi-user real-time sync
- [ ] Connection resilience verified
- [ ] Performance acceptable under load
- [ ] Zero critical bugs
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] WebSocket extended to all 5 modules
- [ ] Real-time updates tested for each module
- [ ] Connection resilience verified
- [ ] Performance tested (10+ concurrent users)
- [ ] Zero console errors
- [ ] No memory leaks
- [ ] Deployed to production
- [ ] Documentation updated
- [ ] **MILESTONE: Real-time collaboration complete**

---
**[MILESTONE]** - WebSocket real-time updates across entire CRM
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
