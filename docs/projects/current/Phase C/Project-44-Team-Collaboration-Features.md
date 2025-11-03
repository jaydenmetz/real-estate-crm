# Project-44: Team Collaboration Features

**Phase**: C | **Priority**: HIGH | **Status**: Not Started
**Est**: 12 hrs + 4 hrs = 16 hrs | **Deps**: Project-43 (Broker Hierarchy)

## 🎯 Goal
Build team collaboration features: team chat, shared calendars, file sharing.

## 📋 Current → Target
**Now**: No team collaboration tools
**Target**: Team chat, shared team calendar, shared file repository
**Success Metric**: Team members can chat; shared calendar synced; files shared securely

## 📖 Context
Real estate teams need collaboration tools to coordinate showings, share documents, discuss deals, etc. This project implements team chat (real-time messaging), shared team calendars (everyone's appointments visible), and shared file storage (team documents accessible to all members).

Key features: Real-time team chat, shared calendar view, file sharing with permissions, and team notifications.

## ⚠️ Risk Assessment

### Technical Risks
- **Real-Time Complexity**: WebSocket scaling
- **Storage Costs**: Shared files storage
- **Performance**: Large team calendars

### Business Risks
- **Privacy**: Accidentally sharing confidential info
- **Spam**: Too many messages/notifications
- **Storage Limits**: Running out of space

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-44-collaboration-$(date +%Y%m%d)
git push origin pre-project-44-collaboration-$(date +%Y%m%d)

# Backup collaboration tables
pg_dump $DATABASE_URL -t team_messages -t shared_files > backup-collaboration-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-44-collaboration-YYYYMMDD -- backend/src/services/chat.service.js
git push origin main
```

## ✅ Tasks

### Planning (2 hours)
- [ ] Design team_messages and shared_files tables
- [ ] Plan WebSocket chat implementation
- [ ] Design shared calendar logic
- [ ] Plan file sharing permissions

### Implementation (7.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create team_messages table
  - [ ] Create shared_files table
  - [ ] Create message_read_status table

- [ ] **Backend API** (4 hours):
  - [ ] Implement WebSocket chat server
  - [ ] Implement POST /v1/teams/:id/messages
  - [ ] Implement GET /v1/teams/:id/messages
  - [ ] Implement POST /v1/teams/:id/files (upload)
  - [ ] Implement GET /v1/teams/:id/files (list)
  - [ ] Implement GET /v1/teams/:id/calendar (shared view)
  - [ ] Add real-time message broadcasting

- [ ] **Frontend UI** (2.5 hours):
  - [ ] Create TeamChatWidget component
  - [ ] Add message list with real-time updates
  - [ ] Add message input with send button
  - [ ] Create SharedCalendarView component
  - [ ] Add SharedFilesWidget
  - [ ] Add file upload/download UI

### Testing (2.5 hours)
- [ ] Test real-time chat messaging
- [ ] Test message persistence
- [ ] Test shared calendar display
- [ ] Test file upload/download
- [ ] Test file permissions

### Documentation (1 hour)
- [ ] Document chat usage
- [ ] Document file sharing permissions
- [ ] Add collaboration API to API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Send Team Message
```bash
TOKEN="<JWT token>"
TEAM_ID="<team UUID>"

curl -X POST https://api.jaydenmetz.com/v1/teams/$TEAM_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Property showing scheduled for 2 PM",
    "mentioned_users": ["user_id_1"]
  }'
# Expected: 201, message sent and broadcast via WebSocket
```

### Test 2: Upload Shared File
```bash
curl -X POST https://api.jaydenmetz.com/v1/teams/$TEAM_ID/files \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@contract.pdf" \
  -F "name=Purchase Contract Template"
# Expected: 201, file uploaded and shared with team
```

### Test 3: Get Shared Calendar
```bash
curl -X GET "https://api.jaydenmetz.com/v1/teams/$TEAM_ID/calendar?start_date=2025-03-01&end_date=2025-03-31" \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of all team members' appointments
```

## 📝 Implementation Notes

### Team Collaboration Tables Schema
```sql
CREATE TABLE team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  sender_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  mentioned_users UUID[], -- Array of user IDs @mentioned
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE message_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES team_messages(id),
  user_id UUID REFERENCES users(id),
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE shared_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  uploaded_by UUID REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### WebSocket Chat Implementation
- Use Socket.io for real-time messaging
- Rooms: One room per team
- Events: `message_sent`, `message_read`, `user_typing`
- Authentication: Verify JWT on WebSocket connection

### Shared Calendar Logic
- Query all appointments where user.team_id = team_id
- Display all team members' appointments
- Color-code by agent
- Allow filtering by agent

### File Sharing Permissions
- All team members can upload files
- All team members can view/download shared files
- Only uploader can delete file
- Broker can delete any team file

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use existing WebSocket service (Project-25)
- [ ] Use apiInstance for API calls
- [ ] Follow existing patterns

## 🧪 Test Coverage Impact
**After Project-44**: Team collaboration APIs tested

## 🔗 Dependencies

### Depends On
- Project-43 (Broker Hierarchy - needs team structure)
- Optional: Project-25 (WebSocket - can extend existing)

### Blocks
- Project-45 (Activity Feed - uses team events)

### Parallel Work
- None (critical dependency for Project-45)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Hierarchy implemented (Project-43)
- ✅ Have team structure (teams table)
- ✅ WebSocket infrastructure ready

### Should Skip If:
- ❌ Single-agent operation
- ❌ Using external collaboration tools (Slack, Teams)

### Optimal Timing:
- After Project-43 (Hierarchy) completes
- 2 days of work (16 hours)

## ✅ Success Criteria
- [ ] Team chat working
- [ ] Real-time messaging functional
- [ ] Shared calendar displays correctly
- [ ] File sharing working
- [ ] File permissions enforced
- [ ] Notifications sent
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Team chat functional
- [ ] Shared calendar working
- [ ] File sharing tested
- [ ] Real-time updates working
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
