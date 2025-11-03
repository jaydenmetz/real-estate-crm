# Project-41: Goal Tracking Implementation

**Phase**: C | **Priority**: LOW | **Status**: Not Started
**Est**: 6 hrs + 1 hr = 7 hrs | **Deps**: Phase B complete

## 🎯 Goal
Implement goal setting and tracking with progress visualization.

## 📋 Current → Target
**Now**: No goal tracking
**Target**: Goal creation, progress tracking, visualizations, achievement notifications
**Success Metric**: Goals created; progress calculated; charts display; goals achieved celebrated

## 📖 Context
Real estate agents set goals: monthly sales targets, number of closings, GCI goals, etc. This project creates a goal tracking system for setting personal/team goals, tracking progress, and visualizing achievement. Integrates with escrows/listings data for automatic progress calculation.

Key features: Goal creation, progress tracking, goal charts, achievement notifications, and historical goal views.

## ⚠️ Risk Assessment

### Technical Risks
- **Calculation Logic**: Incorrect progress
- **Performance**: Complex aggregations

### Business Risks
- **Demotivation**: Unachievable goals
- **Privacy**: Individual goals visible to team

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-41-goals-$(date +%Y%m%d)
git push origin pre-project-41-goals-$(date +%Y%m%d)
pg_dump $DATABASE_URL -t goals > backup-goals-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-41-goals-YYYYMMDD -- backend/src/controllers/goals.controller.js
git push origin main
```

## ✅ Tasks

### Planning (0.5 hours)
- [ ] Design goals table schema
- [ ] Define goal types (sales, closings, listings)
- [ ] Plan progress calculation logic

### Implementation (4.5 hours)
- [ ] **Database** (0.5 hours):
  - [ ] Create goals table

- [ ] **Backend API** (2 hours):
  - [ ] Implement POST /v1/goals (create)
  - [ ] Implement GET /v1/goals (list)
  - [ ] Implement GET /v1/goals/:id/progress (calculate)
  - [ ] Add progress calculation logic

- [ ] **Frontend UI** (2 hours):
  - [ ] Create GoalsWidget component
  - [ ] Add goal creation form
  - [ ] Add progress bars
  - [ ] Add goal charts (line/bar)
  - [ ] Show achievement badges

### Testing (1 hour)
- [ ] Test goal creation
- [ ] Test progress calculation
- [ ] Test charts display

### Documentation (0.5 hours)
- [ ] Document goal types
- [ ] Add goals API to API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Create Goal
```bash
TOKEN="<JWT token>"

curl -X POST https://api.jaydenmetz.com/v1/goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Close 10 transactions",
    "goal_type": "closings",
    "target_value": 10,
    "period": "monthly",
    "start_date": "2025-03-01",
    "end_date": "2025-03-31"
  }'
# Expected: 201, goal created
```

### Test 2: Get Goal Progress
```bash
GOAL_ID="<goal UUID>"

curl -X GET https://api.jaydenmetz.com/v1/goals/$GOAL_ID/progress \
  -H "Authorization: Bearer $TOKEN"
# Expected: { current: 7, target: 10, percentage: 70, status: "on_track" }
```

### Test 3: List Goals
```bash
curl -X GET https://api.jaydenmetz.com/v1/goals \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of goals with progress
```

## 📝 Implementation Notes

### Goals Table Schema
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  goal_type VARCHAR(50), -- closings, sales_volume, listings, gci
  target_value DECIMAL(12,2) NOT NULL,
  period VARCHAR(50), -- daily, weekly, monthly, quarterly, yearly
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  achieved BOOLEAN DEFAULT FALSE,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Goal Types
- **Closings**: Number of closed transactions
- **Sales Volume**: Total dollar volume
- **Listings**: Number of new listings
- **GCI**: Gross Commission Income

### Progress Calculation
- Query escrows/listings within goal date range
- Count relevant records based on goal_type
- Calculate percentage: (current / target) * 100
- Status: on_track (>80%), at_risk (50-80%), behind (<50%)

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Use DECIMAL for money
- [ ] Use apiInstance for API calls

## 🧪 Test Coverage Impact
**After Project-41**: Goals API tested

## 🔗 Dependencies

### Depends On
- Phase B complete
- Escrows/Listings data for calculations

### Blocks
- Project-42 (KPI Dashboard - uses goal data)

### Parallel Work
- Can work alongside Projects 36-40

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Phase B complete
- ✅ Have historical escrow data

### Should Skip If:
- ❌ Not focused on goal setting

### Optimal Timing:
- Before Project-42 (KPI Dashboard)
- 1 day of work (7 hours)

## ✅ Success Criteria
- [ ] Goals table created
- [ ] Goal creation working
- [ ] Progress calculated accurately
- [ ] Charts displaying
- [ ] Achievement detection functional
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Goals system working
- [ ] Progress tracked correctly
- [ ] Charts functional
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
