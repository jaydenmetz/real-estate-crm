# Tasks & Checklists Implementation Plan

**Created:** October 19, 2025
**Status:** Phase 1 Complete (Database), Phase 2 In Progress (API)
**Purpose:** Complete roadmap for implementing enterprise-grade task and checklist management

---

## 🎯 **Vision & Strategy**

### **The Core Insight**
"Escrows, Listings, Clients ARE the projects. AI agents create and manage tasks."

### **3-Tier Architecture**
```
ENTITIES (Real estate work: Escrows, Listings, Clients, Leads, Custom Projects)
  ↓
CHECKLISTS (Best-practice templates auto-applied to entities)
  ↓
TASKS (Individual action items with due dates, assignments, AI-ready)
```

### **What This Solves**
- ❌ **Before:** Realtors forget steps, miss deadlines, reinvent the wheel every transaction
- ✅ **After:** Best-practice checklists auto-applied, AI monitors progress, nothing falls through cracks

---

## 📊 **Current Status**

### ✅ **Phase 1: Database Foundation (COMPLETE)**

**Tables Created:**
1. ✅ `checklist_templates` - Reusable best-practice workflows
2. ✅ `checklists` - Instances applied to specific entities
3. ✅ `tasks` - Enhanced with `checklist_id` and `checklist_position`

**Features Working:**
- ✅ Auto-calculate checklist progress from tasks (PostgreSQL triggers)
- ✅ Auto-complete checklists when all tasks done
- ✅ Polymorphic entity relationships (links to escrows, listings, clients, etc.)
- ✅ 16 optimized indexes for performance
- ✅ Soft delete support throughout

**6 System Templates Seeded:**
- ✅ Escrow Opening Checklist (auto-apply)
- ✅ Escrow Closing Checklist
- ✅ Listing Pre-Market Checklist (auto-apply)
- ✅ Buyer Onboarding Checklist (auto-apply)
- ✅ Farm a Neighborhood (custom marketing)
- ✅ Sphere of Influence Blitz (custom marketing)

---

## 🚀 **Implementation Roadmap**

### **Phase 2: API Layer (IN PROGRESS - ETA: 4-6 hours)**

Build RESTful endpoints for checklists and tasks.

#### **2.1 Checklist Templates API**
**File:** `backend/src/controllers/checklistTemplates.controller.js`

**Endpoints:**
```
GET    /v1/checklist-templates           # List all templates (filter by entity_type)
GET    /v1/checklist-templates/:id       # Get template details
POST   /v1/checklist-templates           # Create custom template
PUT    /v1/checklist-templates/:id       # Update template
DELETE /v1/checklist-templates/:id       # Delete (soft delete, except is_system=true)
GET    /v1/checklist-templates/defaults  # Get all auto-apply templates
```

**Features:**
- Filter by `entity_type` ('escrow', 'listing', 'client', 'custom')
- Filter by `category` ('opening', 'marketing', etc.)
- Show only `is_public=true` or user's own templates
- Prevent deletion of `is_system=true` templates

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Escrow Opening Checklist",
    "entity_type": "escrow",
    "category": "opening",
    "items": [
      {
        "text": "Order title report",
        "position": 1,
        "priority": "critical",
        "auto_due_days": 1,
        "estimated_hours": 0.5
      }
    ],
    "is_default": true,
    "is_system": true
  }
}
```

#### **2.2 Checklists API**
**File:** `backend/src/controllers/checklists.controller.js`

**Endpoints:**
```
GET    /v1/checklists                    # List checklists (filter by entity)
GET    /v1/checklists/:id                # Get checklist with tasks
POST   /v1/checklists                    # Create checklist from template
PUT    /v1/checklists/:id                # Update checklist (name, status, etc.)
DELETE /v1/checklists/:id                # Delete (soft delete)
POST   /v1/checklists/:id/apply-template # Apply template to existing checklist
GET    /v1/checklists/entity/:type/:id   # Get all checklists for entity (e.g., /entity/escrow/ESC-2025-0001)
```

**Features:**
- **Auto-create tasks** when checklist created from template
- Calculate due dates based on `auto_due_days` (relative to checklist creation or entity date)
- Return checklist with nested tasks in response
- Update progress automatically via triggers

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Escrow Opening Checklist",
    "entity_type": "escrow",
    "entity_id": "ESC-2025-0001",
    "status": "active",
    "progress_percentage": 33,
    "tasks": [
      {
        "id": "uuid",
        "name": "Order title report",
        "status": "completed",
        "priority": "critical",
        "due_date": "2025-10-20",
        "completed_date": "2025-10-19"
      },
      {
        "id": "uuid",
        "name": "Order home inspection",
        "status": "in-progress",
        "priority": "high",
        "due_date": "2025-10-22"
      }
    ]
  }
}
```

#### **2.3 Tasks API (Enhanced)**
**File:** `backend/src/controllers/tasks.controller.js`

**Endpoints:**
```
GET    /v1/tasks                         # List tasks (filter by checklist, entity, status, assigned_to)
GET    /v1/tasks/:id                     # Get task details
POST   /v1/tasks                         # Create standalone or checklist task
PUT    /v1/tasks/:id                     # Update task (status, due_date, assigned_to, etc.)
DELETE /v1/tasks/:id                     # Delete (soft delete)
PATCH  /v1/tasks/:id/complete            # Mark task complete (sets status='completed', completed_date=now)
GET    /v1/tasks/my-tasks                # Get current user's assigned tasks
GET    /v1/tasks/overdue                 # Get all overdue tasks
```

**Features:**
- Support standalone tasks (`checklist_id = NULL`)
- Support checklist tasks (`checklist_id = UUID`)
- Support subtasks (`parent_task_id = UUID`)
- Auto-update checklist progress when task status changes (via trigger)
- Filter by `entity_type` + `entity_id` using `related_entity_type` and `related_entity_id`

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Order title report",
    "description": "Contact title company and order prelim report",
    "project_id": null,
    "checklist_id": "uuid",
    "parent_task_id": null,
    "status": "completed",
    "priority": "critical",
    "due_date": "2025-10-20",
    "assigned_to": "user-uuid",
    "estimated_hours": 0.5,
    "actual_hours": 0.3,
    "related_entity_type": "escrow",
    "related_entity_id": "ESC-2025-0001"
  }
}
```

---

### **Phase 3: Frontend Services (ETA: 2-3 hours)**

Build API wrapper services for easy frontend integration.

#### **3.1 Checklist Templates Service**
**File:** `frontend/src/services/checklistTemplates.service.js`

```javascript
import api from './api.service';

export const checklistTemplatesAPI = {
  // List templates
  getAll: (filters = {}) => api.get('/checklist-templates', { params: filters }),

  // Get template details
  getById: (id) => api.get(`/checklist-templates/${id}`),

  // Create template
  create: (template) => api.post('/checklist-templates', template),

  // Update template
  update: (id, updates) => api.put(`/checklist-templates/${id}`, updates),

  // Delete template
  delete: (id) => api.delete(`/checklist-templates/${id}`),

  // Get auto-apply defaults
  getDefaults: (entityType) => api.get('/checklist-templates/defaults', {
    params: { entity_type: entityType }
  }),
};

export default checklistTemplatesAPI;
```

#### **3.2 Checklists Service**
**File:** `frontend/src/services/checklists.service.js`

```javascript
import api from './api.service';

export const checklistsAPI = {
  // List checklists
  getAll: (filters = {}) => api.get('/checklists', { params: filters }),

  // Get checklist with tasks
  getById: (id) => api.get(`/checklists/${id}`),

  // Create checklist from template
  create: (checklist) => api.post('/checklists', checklist),

  // Update checklist
  update: (id, updates) => api.put(`/checklists/${id}`, updates),

  // Delete checklist
  delete: (id) => api.delete(`/checklists/${id}`),

  // Get all checklists for entity
  getByEntity: (entityType, entityId) =>
    api.get(`/checklists/entity/${entityType}/${entityId}`),

  // Apply template to existing checklist
  applyTemplate: (checklistId, templateId) =>
    api.post(`/checklists/${checklistId}/apply-template`, { templateId }),
};

export default checklistsAPI;
```

#### **3.3 Tasks Service (Enhanced)**
**File:** `frontend/src/services/tasks.service.js`

```javascript
import api from './api.service';

export const tasksAPI = {
  // List tasks
  getAll: (filters = {}) => api.get('/tasks', { params: filters }),

  // Get task details
  getById: (id) => api.get(`/tasks/${id}`),

  // Create task
  create: (task) => api.post('/tasks', task),

  // Update task
  update: (id, updates) => api.put(`/tasks/${id}`, updates),

  // Delete task
  delete: (id) => api.delete(`/tasks/${id}`),

  // Mark complete
  complete: (id) => api.patch(`/tasks/${id}/complete`),

  // Get my tasks
  getMyTasks: () => api.get('/tasks/my-tasks'),

  // Get overdue tasks
  getOverdue: () => api.get('/tasks/overdue'),
};

export default tasksAPI;
```

---

### **Phase 4: Auto-Apply Logic (ETA: 3-4 hours)**

Automatically create checklists when entities are created.

#### **4.1 Escrow Creation Hook**
**File:** `backend/src/controllers/escrows.controller.js`

**Add to `createEscrow` function:**
```javascript
// After escrow created successfully
const newEscrow = await createEscrowInDB(escrowData);

// Auto-apply default checklist templates
await autoApplyChecklists('escrow', newEscrow.id, {
  team_id: newEscrow.team_id,
  created_by: req.user.id,
  // Use acceptance_date or closing_date to calculate task due dates
  reference_date: newEscrow.acceptance_date || new Date(),
});

return res.status(201).json({ success: true, data: newEscrow });
```

#### **4.2 Auto-Apply Service**
**File:** `backend/src/services/checklistAutoApply.service.js`

```javascript
const { pool } = require('../config/database');

/**
 * Auto-apply default checklists to newly created entity
 * @param {string} entityType - 'escrow', 'listing', 'client', etc.
 * @param {string} entityId - Entity ID (ESC-2025-0001, UUID, etc.)
 * @param {object} options - { team_id, created_by, reference_date }
 */
async function autoApplyChecklists(entityType, entityId, options) {
  const { team_id, created_by, reference_date = new Date() } = options;

  // Get all default templates for this entity type
  const templatesResult = await pool.query(`
    SELECT * FROM checklist_templates
    WHERE entity_type = $1
      AND is_default = TRUE
      AND (team_id = $2 OR is_system = TRUE)
      AND deleted_at IS NULL
  `, [entityType, team_id]);

  const templates = templatesResult.rows;

  for (const template of templates) {
    // Create checklist instance
    const checklistResult = await pool.query(`
      INSERT INTO checklists (
        template_id, entity_type, entity_id, name, description, category,
        team_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      template.id,
      entityType,
      entityId,
      template.name,
      template.description,
      template.category,
      team_id,
      created_by,
    ]);

    const checklistId = checklistResult.rows[0].id;

    // Create tasks from template items
    const items = template.items;
    for (const item of items) {
      // Calculate due date based on auto_due_days
      let dueDate = null;
      if (item.auto_due_days !== undefined) {
        dueDate = new Date(reference_date);
        dueDate.setDate(dueDate.getDate() + item.auto_due_days);
      }

      await pool.query(`
        INSERT INTO tasks (
          name, description, checklist_id, checklist_position,
          status, priority, due_date, estimated_hours,
          related_entity_type, related_entity_id,
          team_id, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        item.text,
        item.description || null,
        checklistId,
        item.position,
        'not-started',
        item.priority || 'medium',
        dueDate,
        item.estimated_hours || null,
        entityType,
        entityId,
        team_id,
        created_by,
      ]);
    }
  }
}

module.exports = { autoApplyChecklists };
```

#### **4.3 Apply to All Entity Creation**
Add similar hooks to:
- ✅ `listings.controller.js` → `createListing`
- ✅ `clients.controller.js` → `createClient`
- ✅ `leads.controller.js` → `createLead`
- ✅ `appointments.controller.js` → `createAppointment`

---

### **Phase 5: UI Components (ETA: 6-8 hours)**

Build beautiful, functional UI for managing checklists and tasks.

#### **5.1 Checklist Template Library**
**File:** `frontend/src/components/checklists/ChecklistTemplateLibrary.jsx`

**Features:**
- Browse all templates by entity type
- Preview template tasks before applying
- Create custom templates
- Edit existing templates (non-system only)
- Toggle `is_default` for auto-apply

**UI Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Checklist Template Library                        [+ New]   │
├─────────────────────────────────────────────────────────────┤
│ [Escrow] [Listing] [Client] [Custom]                        │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────┐          │
│ │ Escrow Opening       │ │ Listing Pre-Market   │          │
│ │ ✓ Auto-apply         │ │ ✓ Auto-apply         │          │
│ │ 6 tasks • 3.5 hours  │ │ 7 tasks • 6 hours    │          │
│ │ [Apply] [Edit]       │ │ [Apply] [Edit]       │          │
│ └──────────────────────┘ └──────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

#### **5.2 Checklist Display (Entity Detail Pages)**
**File:** `frontend/src/components/checklists/ChecklistDisplay.jsx`

**Features:**
- Show all checklists for entity (e.g., ESC-2025-0001's checklists)
- Expandable/collapsible cards
- Progress bars
- Task checkboxes (click to toggle complete)
- Add manual tasks to checklist

**UI Layout (on Escrow Detail Page):**
```
┌─────────────────────────────────────────────────────────────┐
│ Checklists (2)                                  [+ Add]      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✓ Escrow Opening Checklist             [●●●●○○] 67%    │ │
│ │ ☐ Order title report (Due: Today)                      │ │
│ │ ☑ Order home inspection (Completed)                    │ │
│ │ ☑ Send buyer welcome email (Completed)                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Escrow Closing Checklist               [○○○○○○] 0%     │ │
│ │ (Collapsed - click to expand)                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### **5.3 Task Board (Standalone)**
**File:** `frontend/src/components/tasks/TaskBoard.jsx`

**Features:**
- Kanban view (Not Started | In Progress | Completed)
- Filter by entity, assigned user, priority, due date
- Drag & drop to change status
- Quick add task
- View tasks across all entities

**UI Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ My Tasks                              [+ Quick Add]          │
├─────────────────────────────────────────────────────────────┤
│ Filters: [All Entities ▼] [All Users ▼] [Due: This Week ▼] │
├─────────────────────────────────────────────────────────────┤
│ Not Started  │ In Progress  │ Completed                     │
│ ────────────│──────────────│──────────────                 │
│ [ Task 1   ]│ [ Task 3    ]│ [ Task 5   ]                  │
│ [ Task 2   ]│ [ Task 4    ]│ [ Task 6   ]                  │
│             │              │ [ Task 7   ]                  │
└─────────────────────────────────────────────────────────────┘
```

#### **5.4 Quick Task Widget (Dashboard)**
**File:** `frontend/src/components/tasks/QuickTaskWidget.jsx`

**Features:**
- Show today's tasks
- Show overdue tasks (red badge)
- Quick complete checkbox
- "View All" link to full task board

---

### **Phase 6: AI Agent Integration (FUTURE - ETA: 8-10 hours)**

Enable AI agents to create and manage tasks.

#### **6.1 AI Transaction Coordinator**
**Features:**
- Monitors all escrow checklists
- Auto-completes routine tasks ("Send buyer welcome email" ✓)
- Flags tasks 3 days before due date
- Suggests next action: "Inspection done → Order appraisal"

#### **6.2 AI Marketing Manager**
**Features:**
- Monitors custom marketing project checklists
- Tracks completion rates ("40% done with Pine Valley campaign")
- Suggests new tasks based on results ("Open house had 30 visitors → Add 30 follow-up call tasks")

#### **6.3 AI Lead Qualifier**
**Features:**
- Creates custom checklist when new lead comes in
- Tasks: "Call within 5 min", "Send listing PDF", "Schedule showing", "Follow up in 48hr"
- Auto-escalates hot leads

---

## 📈 **Success Metrics**

### **MVP Success (After Phase 5):**
- ✅ Checklists auto-apply to new escrows/listings
- ✅ Users can see progress on entity detail pages
- ✅ Users can mark tasks complete with one click
- ✅ Task completion auto-updates checklist progress

### **Full Success (After Phase 6):**
- ✅ AI agents auto-complete 30%+ of routine tasks
- ✅ Zero missed escrow deadlines
- ✅ 50% time savings on transaction coordination
- ✅ Marketing campaigns tracked start to finish

---

## 🎯 **Competitive Advantage**

### **How You Win:**

**Follow Up Boss:**
- ❌ Manual checklists only
- ❌ No auto-apply
- ❌ No AI monitoring
- ✅ **You:** Auto-apply best practices + AI monitoring

**BoomTown:**
- ❌ No checklist system at all
- ✅ **You:** Full workflow management

**Zillow:**
- ❌ Just lead gen, no CRM
- ✅ **You:** End-to-end transaction management

**Your Differentiator:**
> "Every escrow automatically gets a best-practice checklist with AI monitoring to ensure nothing falls through the cracks."

---

## 🚀 **Next Steps**

**Immediate (This Week):**
1. ✅ Build API endpoints (Phase 2)
2. ✅ Build frontend services (Phase 3)
3. ✅ Add auto-apply logic (Phase 4)

**Next Week:**
4. Build UI components (Phase 5)
5. Test with real escrows/listings
6. Polish UI based on feedback

**Future (When Ready to Sell):**
7. AI agent integration (Phase 6)
8. Mobile app support
9. Marketplace listing: "Best-practice checklists included!"

---

## 📝 **Notes**

### **Design Decisions:**

**Why 3 Tiers (Entities → Checklists → Tasks)?**
- Clear separation: Real work vs workflows vs individual actions
- Flexible: Supports both pre-defined workflows AND ad-hoc tasks
- AI-friendly: Agents can operate at any level

**Why Polymorphic entity_type + entity_id?**
- One checklist table supports all entity types
- Easy to add new entity types (just add to enum)
- Simpler queries than separate junction tables

**Why JSONB for template items?**
- Flexible schema for task templates
- No need for separate template_items table
- Easy to version templates

**Why auto-apply via is_default flag?**
- Simple toggle for users
- No complex trigger logic in database
- Controller decides when to apply (on creation)

### **Future Enhancements:**

**Conditional Auto-Apply:**
```javascript
// Auto-apply "Luxury Listing Checklist" only if list_price > $1M
auto_apply_conditions: {
  list_price: { $gt: 1000000 }
}
```

**Checklist Dependencies:**
```javascript
// Can't start "Closing Checklist" until "Opening Checklist" 100% complete
dependencies: ["opening-checklist-uuid"]
```

**AI Task Suggestions:**
```javascript
// AI suggests task based on escrow stage
"Inspection report received → Suggest: 'Review inspection report with buyer'"
```

---

## ✅ **Summary**

**What We Built:**
- 3-tier task management (Entities → Checklists → Tasks)
- 6 system templates for best practices
- Auto-calculate progress with PostgreSQL triggers
- AI-ready architecture

**What's Next:**
- API endpoints (4-6 hours)
- Frontend services (2-3 hours)
- Auto-apply logic (3-4 hours)
- UI components (6-8 hours)
- **Total ETA:** 15-21 hours to MVP

**End Result:**
- Realtors save 10+ hours per transaction
- Zero missed deadlines
- Best practices automatically applied
- Foundation for AI agents

This is **game-changing** for real estate productivity. 🚀
