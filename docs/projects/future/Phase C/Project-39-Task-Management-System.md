# Project-39: Task Management System

**Phase**: C | **Priority**: MEDIUM | **Status**: Not Started
**Est**: 10 hrs + 2 hrs = 12 hrs | **Deps**: Phase B complete

## 🎯 Goal
Implement task management with assignment, notifications, and status tracking.

## 📋 Current → Target
**Now**: No task management
**Target**: Task creation, assignment, notifications, Kanban view, due dates
**Success Metric**: Tasks created/assigned; notifications sent; status tracked; overdue tasks flagged

## 📖 Context
Real estate agents juggle many tasks: follow-ups, document reviews, property inspections, etc. This project creates a task management system for creating tasks, assigning to team members, setting due dates, and tracking completion. Integrates with email/SMS for notifications.

Key features: Task CRUD, assignment logic, due date tracking, notifications, Kanban board view, and task filters.

## ⚠️ Risk Assessment

### Technical Risks
- **Notification Spam**: Too many alerts
- **Performance**: Large task lists
- **Conflict**: Multiple users editing same task

### Business Risks
- **Missed Deadlines**: Unnoticed overdue tasks
- **Task Overload**: Too many tasks demotivating
- **Communication Gaps**: Tasks not assigned properly

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-39-tasks-$(date +%Y%m%d)
git push origin pre-project-39-tasks-$(date +%Y%m%d)
pg_dump $DATABASE_URL -t tasks > backup-tasks-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-39-tasks-YYYYMMDD -- backend/src/controllers/tasks.controller.js
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Design tasks table schema
- [ ] Define task statuses and priorities
- [ ] Plan notification triggers
- [ ] Design Kanban view layout

### Implementation (6.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create tasks table
  - [ ] Add assignment columns
  - [ ] Add priority and status columns

- [ ] **Backend API** (2.5 hours):
  - [ ] Implement POST /v1/tasks (create)
  - [ ] Implement GET /v1/tasks (list with filters)
  - [ ] Implement PUT /v1/tasks/:id (update)
  - [ ] Implement DELETE /v1/tasks/:id
  - [ ] Add notification logic for assignments

- [ ] **Frontend UI** (3 hours):
  - [ ] Create TaskBoard component (Kanban view)
  - [ ] Add task creation dialog
  - [ ] Add task card component
  - [ ] Add task filters (status, assigned to, due date)
  - [ ] Add drag-and-drop for Kanban
  - [ ] Show overdue task indicators

### Testing (2 hours)
- [ ] Test task creation
- [ ] Test task assignment
- [ ] Test status transitions
- [ ] Test Kanban drag-and-drop
- [ ] Test overdue task detection

### Documentation (0.5 hours)
- [ ] Document task statuses
- [ ] Add tasks API to API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Create Task
```bash
TOKEN="<JWT token>"

curl -X POST https://api.jaydenmetz.com/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review purchase contract",
    "description": "Check for contingencies",
    "assigned_to": "agent_user_id",
    "due_date": "2025-03-20",
    "priority": "high",
    "related_escrow_id": "escrow_uuid"
  }'
# Expected: 201, task created, notification sent to assignee
```

### Test 2: Update Task Status
```bash
TASK_ID="<task UUID>"

curl -X PUT https://api.jaydenmetz.com/v1/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
# Expected: 200, task marked complete
```

### Test 3: Get Overdue Tasks
```bash
curl -X GET "https://api.jaydenmetz.com/v1/tasks?overdue=true" \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of tasks with due_date < today and status != completed
```

## 📝 Implementation Notes

### Tasks Table Schema
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'todo', -- todo, in_progress, completed, cancelled
  priority VARCHAR(50), -- low, medium, high, urgent
  due_date DATE,
  related_escrow_id UUID REFERENCES escrows(id),
  related_listing_id UUID REFERENCES listings(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Task Statuses
- **To Do**: Not started
- **In Progress**: Currently working on
- **Completed**: Finished
- **Cancelled**: No longer needed

### Task Priorities
- **Low**: Can wait
- **Medium**: Normal priority
- **High**: Important
- **Urgent**: Drop everything

### Notification Triggers
- Task assigned → Email to assignee
- Task due in 24 hours → Email reminder
- Task overdue → Email alert
- Task completed → Email to creator

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use apiInstance for API calls
- [ ] Follow existing patterns

## 🧪 Test Coverage Impact
**After Project-39**: Task API fully tested

## 🔗 Dependencies

### Depends On
- Phase B complete
- Optional: Project-32 (Email templates for notifications)

### Blocks
- None

### Parallel Work
- Can work alongside Projects 36-38, 40-41

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Phase B complete
- ✅ Have users to assign tasks to

### Should Skip If:
- ❌ Using external task management (Asana, Trello)

### Optimal Timing:
- After Project-32 (Email) for notifications
- 1-2 days of work (12 hours)

## ✅ Success Criteria
- [ ] Tasks table created
- [ ] Task CRUD working
- [ ] Assignment functional
- [ ] Notifications sent
- [ ] Kanban view working
- [ ] Overdue tasks flagged
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Task management working
- [ ] Kanban view functional
- [ ] Notifications tested
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
