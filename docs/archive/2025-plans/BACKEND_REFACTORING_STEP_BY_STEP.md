# Backend Refactoring - Step-by-Step Implementation Guide

**Goal:** Refactor `backend/src/controllers/escrows.controller.js` (2,796 lines) into modular structure

**Status:** Foundation created, ready for implementation

**Time Estimate:** 12-15 hours (can be done incrementally over 1-2 weeks)

---

## ✅ COMPLETED: Foundation Setup

### 1. Directory Structure Created
```
backend/src/modules/escrows/
├── controllers/     ✅ Created
├── services/        ✅ Created
├── utils/           ✅ Created
└── routes/          ✅ Created
```

### 2. Schema Service Extracted
**File:** `backend/src/modules/escrows/services/schema.service.js` ✅

**What it does:**
- Detects which columns exist in escrows table
- Caches results for performance
- Used by all controllers that query database

**Usage:**
```javascript
const { detectSchema } = require('./services/schema.service');

const schema = await detectSchema();
if (schema.hasNumericId) {
  query += ', numeric_id';
}
```

---

## 📋 REFACTORING STRATEGY

### Phase 1: Extract Services (Business Logic)
Move business logic out of controllers into reusable services.

### Phase 2: Create Modular Controllers
Split monolithic controller into focused modules.

### Phase 3: Update Routes
Point routes to new modular controllers.

### Phase 4: Test & Verify
Run integration tests to ensure nothing broke.

### Phase 5: Clean Up
Remove old controller file.

---

## 🔧 PHASE 1: Extract Services (4-6 hours)

Services contain **business logic** (calculations, validations, database queries).
Controllers should only handle **HTTP requests/responses**.

### Services to Create:

#### 1. `services/commission.service.js`
**Purpose:** Calculate commissions

**Functions to extract:**
- Calculate gross commission (purchase_price * percentage)
- Calculate net commission (gross - splits/fees)
- Calculate buyer/seller side commissions
- Validate commission data

**Current locations in escrows.controller.js:**
- Look for: `commission_percentage`, `gross_commission`, `net_commission`
- Lines: ~200-400 (createEscrow method)

**Example:**
```javascript
// services/commission.service.js
function calculateGrossCommission(purchasePrice, commissionPercentage) {
  if (!purchasePrice || !commissionPercentage) return 0;
  return (purchasePrice * commissionPercentage) / 100;
}

function calculateNetCommission(grossCommission, splits = []) {
  let net = grossCommission;
  splits.forEach(split => {
    net -= split.amount;
  });
  return net;
}

module.exports = {
  calculateGrossCommission,
  calculateNetCommission
};
```

---

#### 2. `services/escrow.service.js`
**Purpose:** Core escrow business logic

**Functions to extract:**
- Build escrow queries (with schema detection)
- Apply filters (status, date range, search)
- Format escrow responses
- Validate escrow data

**Current locations:**
- getAllEscrows method (lines ~70-300)
- getEscrowById method (lines ~300-500)

**Example:**
```javascript
// services/escrow.service.js
const { detectSchema } = require('./schema.service');

async function buildEscrowQuery(filters = {}) {
  const schema = await detectSchema();

  let query = 'SELECT e.id, e.property_address, e.purchase_price';

  if (schema.hasNumericId) {
    query += ', e.numeric_id';
  }

  if (schema.hasTeamSequenceId) {
    query += ', e.team_sequence_id';
  }

  query += ' FROM escrows e WHERE e.deleted_at IS NULL';

  // Apply filters
  if (filters.status) {
    query += ` AND e.escrow_status = '${filters.status}'`;
  }

  return query;
}

module.exports = {
  buildEscrowQuery
};
```

---

#### 3. `services/status.service.js`
**Purpose:** Escrow status transitions

**Functions to extract:**
- Validate status transitions (Active → Pending → Closed)
- Update escrow status
- Trigger status change notifications

**Current locations:**
- updateEscrow method (lines ~500-700)

---

### How to Extract Services:

**Step 1:** Find the function in `escrows.controller.js`
```javascript
// OLD (in controller)
static async createEscrow(req, res) {
  const grossCommission = (req.body.purchase_price * req.body.commission_percentage) / 100;
  // ... rest of code
}
```

**Step 2:** Move calculation to service
```javascript
// NEW (in services/commission.service.js)
function calculateGrossCommission(purchasePrice, percentage) {
  return (purchasePrice * percentage) / 100;
}
```

**Step 3:** Use service in controller
```javascript
// NEW (in controller)
const commissionService = require('../services/commission.service');

static async createEscrow(req, res) {
  const grossCommission = commissionService.calculateGrossCommission(
    req.body.purchase_price,
    req.body.commission_percentage
  );
  // ... rest of code
}
```

---

## 🎯 PHASE 2: Create Modular Controllers (6-8 hours)

Controllers handle **HTTP requests/responses only**.

### Controllers to Create:

#### 1. `controllers/crud.controller.js` (Priority: HIGH)
**Purpose:** Basic CRUD operations

**Methods to extract:**
- `getAllEscrows` - GET /escrows
- `getEscrowById` - GET /escrows/:id
- `createEscrow` - POST /escrows
- `updateEscrow` - PUT /escrows/:id
- `deleteEscrow` - DELETE /escrows/:id
- `archiveEscrow` - PATCH /escrows/:id/archive
- `restoreEscrow` - PATCH /escrows/:id/restore
- `batchDeleteEscrows` - DELETE /escrows/batch

**Template:**
```javascript
// controllers/crud.controller.js
const { pool } = require('../../../../config/database');
const escrowService = require('../services/escrow.service');
const { detectSchema } = require('../services/schema.service');

/**
 * GET /escrows
 * Get all escrows with pagination
 */
exports.getAllEscrows = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    // Use service to build query
    const query = await escrowService.buildEscrowQuery({
      status,
      search,
      userId: req.user.id
    });

    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching escrows:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch escrows' }
    });
  }
};

// ... other CRUD methods
```

---

#### 2. `controllers/details.controller.js` (Priority: MEDIUM)
**Purpose:** Detailed escrow sections

**Methods to extract:**
- `getEscrowDetails` - GET /escrows/:id/details
- `updateEscrowDetails` - PUT /escrows/:id/details
- `getEscrowPropertyDetails` - GET /escrows/:id/property
- `updateEscrowPropertyDetails` - PUT /escrows/:id/property
- `getEscrowDocuments` - GET /escrows/:id/documents
- `updateEscrowDocuments` - PUT /escrows/:id/documents

---

#### 3. `controllers/checklists.controller.js` (Priority: MEDIUM)
**Purpose:** Checklist management

**Methods to extract:**
- `getEscrowChecklists` - GET /escrows/:id/checklists
- `updateEscrowChecklists` - PUT /escrows/:id/checklists
- `getEscrowChecklistLoan` - GET /escrows/:id/checklist/loan
- `updateEscrowChecklistLoan` - PUT /escrows/:id/checklist/loan
- `getEscrowChecklistHouse` - GET /escrows/:id/checklist/house
- `updateEscrowChecklistHouse` - PUT /escrows/:id/checklist/house
- `getEscrowChecklistAdmin` - GET /escrows/:id/checklist/admin
- `updateEscrowChecklistAdmin` - PUT /escrows/:id/checklist/admin

---

#### 4. `controllers/financials.controller.js` (Priority: HIGH)
**Purpose:** Financial calculations

**Methods to extract:**
- `getEscrowFinancials` - GET /escrows/:id/financials
- `updateEscrowFinancials` - PUT /escrows/:id/financials

---

#### 5. `controllers/people.controller.js` (Priority: LOW)
**Purpose:** People/contacts linked to escrow

**Methods to extract:**
- `getEscrowPeople` - GET /escrows/:id/people
- `updateEscrowPeople` - PUT /escrows/:id/people

---

#### 6. `controllers/timeline.controller.js` (Priority: LOW)
**Purpose:** Timeline and notes

**Methods to extract:**
- `getEscrowTimeline` - GET /escrows/:id/timeline
- `updateEscrowTimeline` - PUT /escrows/:id/timeline
- `getEscrowNotes` - GET /escrows/:id/notes
- `addEscrowNote` - POST /escrows/:id/notes

---

### Controller Creation Steps:

**Step 1:** Create new controller file
```bash
touch backend/src/modules/escrows/controllers/crud.controller.js
```

**Step 2:** Copy relevant methods from old controller
```bash
# Find the methods in escrows.controller.js
grep -n "static async getAllEscrows" backend/src/controllers/escrows.controller.js
# Copy lines XX-YY to new file
```

**Step 3:** Update imports
```javascript
// Change relative paths
const { pool } = require('../../../../config/database');  // Go up 4 levels
const escrowService = require('../services/escrow.service');  // Stay in module
```

**Step 4:** Test the new controller
```bash
npm test -- escrow-creation-flow
```

---

## 🔌 PHASE 3: Create Main Controller Index (1 hour)

**File:** `controllers/index.js`

**Purpose:** Export all controllers as a single module

```javascript
// controllers/index.js
const crudController = require('./crud.controller');
const detailsController = require('./details.controller');
const checklistsController = require('./checklists.controller');
const financialsController = require('./financials.controller');
const peopleController = require('./people.controller');
const timelineController = require('./timeline.controller');

module.exports = {
  // CRUD operations
  getAllEscrows: crudController.getAllEscrows,
  getEscrowById: crudController.getEscrowById,
  createEscrow: crudController.createEscrow,
  updateEscrow: crudController.updateEscrow,
  deleteEscrow: crudController.deleteEscrow,
  archiveEscrow: crudController.archiveEscrow,
  restoreEscrow: crudController.restoreEscrow,
  batchDeleteEscrows: crudController.batchDeleteEscrows,

  // Details
  getEscrowDetails: detailsController.getEscrowDetails,
  updateEscrowDetails: detailsController.updateEscrowDetails,
  getEscrowPropertyDetails: detailsController.getEscrowPropertyDetails,
  updateEscrowPropertyDetails: detailsController.updateEscrowPropertyDetails,
  getEscrowDocuments: detailsController.getEscrowDocuments,
  updateEscrowDocuments: detailsController.updateEscrowDocuments,

  // Checklists
  getEscrowChecklists: checklistsController.getEscrowChecklists,
  updateEscrowChecklists: checklistsController.updateEscrowChecklists,
  // ... all other methods

  // Financials
  getEscrowFinancials: financialsController.getEscrowFinancials,
  updateEscrowFinancials: financialsController.updateEscrowFinancials,

  // People
  getEscrowPeople: peopleController.getEscrowPeople,
  updateEscrowPeople: peopleController.updateEscrowPeople,

  // Timeline
  getEscrowTimeline: timelineController.getEscrowTimeline,
  updateEscrowTimeline: timelineController.updateEscrowTimeline,
  getEscrowNotes: timelineController.getEscrowNotes,
  addEscrowNote: timelineController.addEscrowNote
};
```

---

## 🛣️ PHASE 4: Update Routes (1 hour)

**File:** `backend/src/routes/escrows.routes.js`

**Change:**
```javascript
// OLD
const escrowController = require('../controllers/escrows.controller');

// NEW
const escrowController = require('../modules/escrows/controllers');
```

**That's it!** All routes stay the same because `controllers/index.js` exports the same interface.

---

## ✅ PHASE 5: Test Everything (2 hours)

### 1. Run integration tests
```bash
cd backend
npm test -- integration
```

### 2. Test manually with curl
```bash
# Test GET all escrows
curl -H "Authorization: Bearer $TOKEN" http://localhost:5050/v1/escrows

# Test GET single escrow
curl -H "Authorization: Bearer $TOKEN" http://localhost:5050/v1/escrows/ESCROW123

# Test CREATE escrow
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"property_address":"123 Test St","purchase_price":500000}' \
  http://localhost:5050/v1/escrows
```

### 3. Check production
```bash
# After deploying to Railway
curl https://api.jaydenmetz.com/v1/escrows
```

---

## 🧹 PHASE 6: Clean Up (30 minutes)

### 1. Archive old controller
```bash
mv backend/src/controllers/escrows.controller.js \
   backend/src/controllers/archive/escrows.controller.OLD.js
```

### 2. Update CLAUDE.md
```markdown
## Modular Backend Structure
Escrows module refactored into:
- controllers/ (6 focused controllers ~200 lines each)
- services/ (business logic)
- utils/ (helpers)
```

### 3. Commit changes
```bash
git add backend/src/modules/escrows/
git commit -m "Refactor escrows module to modular structure

- Split 2,796-line controller into 6 focused controllers
- Extracted business logic to services
- Created schema detection service
- Maintained backward compatibility
- All tests passing

Benefits:
- Easier to navigate (200 lines vs 2,796 lines)
- Better separation of concerns
- More testable (services can be unit tested)
- Scalable architecture

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 📊 PROGRESS TRACKING

### Checklist:
- [x] Create directory structure
- [x] Extract schema.service.js
- [ ] Create commission.service.js
- [ ] Create escrow.service.js
- [ ] Create crud.controller.js
- [ ] Create details.controller.js
- [ ] Create checklists.controller.js
- [ ] Create financials.controller.js
- [ ] Create people.controller.js
- [ ] Create timeline.controller.js
- [ ] Create controllers/index.js
- [ ] Update routes/escrows.routes.js
- [ ] Run integration tests
- [ ] Archive old controller
- [ ] Update documentation

### Time Tracking:
- Services: ☐ ☐ ☐ ☐ ☐ ☐ (6 hours)
- Controllers: ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ (8 hours)
- Routes: ☐ (1 hour)
- Testing: ☐ ☐ (2 hours)

**Total: 17 hours** (can be done incrementally)

---

## 🚨 IMPORTANT NOTES

### DO:
- ✅ Work on one controller at a time
- ✅ Test after each controller
- ✅ Keep old controller until everything works
- ✅ Commit frequently (small changes)
- ✅ Use integration tests as safety net

### DON'T:
- ❌ Delete old controller until fully tested
- ❌ Change route URLs (maintain API compatibility)
- ❌ Rush - take your time, test thoroughly
- ❌ Skip tests - they catch breaking changes

---

## 🎓 LEARNING RESOURCES

### Understanding the Pattern:

**Monolithic (Current):**
```
controllers/escrows.controller.js (2,796 lines)
├── HTTP handling
├── Business logic
├── Database queries
├── Validation
└── Everything mixed together
```

**Modular (New):**
```
modules/escrows/
├── controllers/    (HTTP handling only)
│   ├── crud.controller.js (200 lines)
│   ├── details.controller.js (300 lines)
│   └── ...
├── services/       (Business logic)
│   ├── commission.service.js (200 lines)
│   ├── escrow.service.js (300 lines)
│   └── ...
└── utils/          (Helpers)
    ├── validators.js
    └── formatters.js
```

### Benefits:
1. **Easier to find code** - Know exactly where to look
2. **Easier to test** - Test services independently
3. **Easier to maintain** - Change one thing without affecting others
4. **Easier to scale** - Add features without touching existing code

---

**Status:** Foundation complete, ready for incremental implementation
**Next Step:** Create commission.service.js and crud.controller.js
**Estimated Time:** 2-3 hours for first controller (gets faster after that)

Good luck! 🚀
