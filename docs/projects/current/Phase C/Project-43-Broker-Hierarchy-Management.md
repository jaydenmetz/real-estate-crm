# Project-43: Broker Hierarchy Management

**Phase**: C | **Priority**: HIGH | **Status**: Not Started
**Est**: 10 hrs + 3 hrs = 13 hrs | **Deps**: Phase B complete, Project-17 (User Roles)

## 🎯 Goal
Implement broker/agent hierarchy with permission cascading and team management.

## 📋 Current → Target
**Now**: Flat user structure
**Target**: Hierarchical org chart, permission inheritance, team views
**Success Metric**: Brokers can manage agents; permissions cascade; team data visible to brokers

## 📖 Context
Real estate brokerages have organizational hierarchies: brokers oversee agents, team leads manage teams, etc. This project implements a hierarchy system where brokers can manage their agents, permissions cascade down, and brokers can view team performance. Essential for scaling to multi-agent teams.

Key features: Org chart structure, permission inheritance, team management UI, broker dashboard, and agent assignment.

## ⚠️ Risk Assessment

### Technical Risks
- **Permission Logic**: Complex cascading rules
- **Data Isolation**: Agents seeing other agents' data
- **Performance**: Recursive queries for hierarchy

### Business Risks
- **Privacy Violations**: Brokers seeing too much
- **Permission Confusion**: Unclear access rules
- **Team Conflicts**: Agent assignment disputes

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-43-hierarchy-$(date +%Y%m%d)
git push origin pre-project-43-hierarchy-$(date +%Y%m%d)

# Backup user_hierarchy table
pg_dump $DATABASE_URL -t user_hierarchy > backup-hierarchy-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-43-hierarchy-YYYYMMDD -- backend/src/middleware/hierarchy.middleware.js
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Design user_hierarchy table schema
- [ ] Define permission cascade rules
- [ ] Plan org chart visualization
- [ ] Map broker vs agent permissions

### Implementation (6.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create user_hierarchy table
  - [ ] Add manager_id to users table
  - [ ] Create team_memberships table

- [ ] **Backend API** (3 hours):
  - [ ] Implement GET /v1/hierarchy (org chart)
  - [ ] Implement POST /v1/hierarchy/assign (assign agent to broker)
  - [ ] Implement GET /v1/users/:id/team (get user's team)
  - [ ] Add permission cascade middleware
  - [ ] Update authorization checks for hierarchy

- [ ] **Frontend UI** (2.5 hours):
  - [ ] Create OrgChartWidget component
  - [ ] Add hierarchy tree view
  - [ ] Create agent assignment UI
  - [ ] Add team dashboard (broker view)
  - [ ] Show team performance metrics

### Testing (2 hours)
- [ ] Test org chart display
- [ ] Test agent assignment
- [ ] Test permission cascading
- [ ] Test broker can view agent data
- [ ] Test agent cannot view broker data

### Documentation (1 hour)
- [ ] Document hierarchy structure
- [ ] Document permission rules
- [ ] Add hierarchy API to API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Assign Agent to Broker
```bash
TOKEN="<broker JWT token>"

curl -X POST https://api.jaydenmetz.com/v1/hierarchy/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_user_id",
    "manager_id": "broker_user_id"
  }'
# Expected: 201, agent assigned, hierarchy created
```

### Test 2: Get Org Chart
```bash
curl -X GET https://api.jaydenmetz.com/v1/hierarchy \
  -H "Authorization: Bearer $TOKEN"
# Expected: Tree structure with broker at top, agents below
```

### Test 3: Broker Access to Agent Data
```bash
# Broker fetches agent's escrows
curl -X GET "https://api.jaydenmetz.com/v1/escrows?agent_id=agent_user_id" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200, broker can view agent's escrows
```

## 📝 Implementation Notes

### Hierarchy Tables Schema
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN manager_id UUID REFERENCES users(id);

CREATE TABLE user_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  manager_id UUID REFERENCES users(id),
  hierarchy_level INTEGER, -- 1 = broker, 2 = team lead, 3 = agent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(50), -- leader, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Permission Cascade Rules
- **Broker** can view/edit all agents' data under them
- **Team Lead** can view/edit team members' data
- **Agent** can only view/edit own data
- **System Admin** can view/edit everything

### Hierarchy Levels
1. **Broker/Owner**: Top level, manages all
2. **Team Lead**: Manages a team of agents
3. **Agent**: Individual contributor

### Org Chart Example
```
Josh Riley (Broker)
├── Jayden Metz (Agent)
├── Agent 2 (Agent)
└── Team Lead 1 (Team Lead)
    ├── Agent 3 (Agent)
    └── Agent 4 (Agent)
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use apiInstance for API calls
- [ ] Follow existing authorization patterns

## 🧪 Test Coverage Impact
**After Project-43**: Hierarchy API and permissions tested

## 🔗 Dependencies

### Depends On
- Phase B complete
- Project-17 (User Roles - base role system)

### Blocks
- Project-44 (Team Collaboration - needs hierarchy for team features)

### Parallel Work
- None (critical dependency for Project-44)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ User roles implemented (Project-17)
- ✅ Have multiple users (broker + agents)
- ✅ Planning to scale to multi-agent team

### Should Skip If:
- ❌ Single-agent operation
- ❌ No broker oversight needed

### Optimal Timing:
- Before Project-44 (Team Collaboration)
- 1-2 days of work (13 hours)

## ✅ Success Criteria
- [ ] Hierarchy tables created
- [ ] Org chart displays correctly
- [ ] Agent assignment working
- [ ] Permission cascade functional
- [ ] Broker can view team data
- [ ] Agent data isolated correctly
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Hierarchy system working
- [ ] Org chart functional
- [ ] Permissions cascading correctly
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
