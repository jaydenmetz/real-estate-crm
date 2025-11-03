# Detail API Implementation Gap Analysis

**Created:** 2025-10-30
**Purpose:** Assess current state vs. proposed detail API architecture
**Status:** Active - Implementation Planning

---

## Executive Summary

### **Current State: 🟡 20% Complete**

Your backend **already has the foundation** for detail APIs:
- ✅ Controllers with `getById` methods exist
- ✅ Service layer architecture in place
- ✅ Authentication and permissions working
- ❌ **Missing:** `?include=full` query parameter support
- ❌ **Missing:** Computed fields, sidebar data, widget data, activity feed
- ❌ **Missing:** Parallel data fetching for performance

### **Is This Best Practice? ✅ YES**

Your proposed structure follows **industry-standard REST API design**:
- ✅ Single endpoint for detail views (reduces API calls)
- ✅ Opt-in complexity via query parameters (backward compatible)
- ✅ Structured response format (hero, sidebars, widgets, activity)
- ✅ Computed fields on backend (consistency across clients)
- ✅ Parallel data fetching (performance optimization)

**This is exactly how companies like Stripe, GitHub, and Shopify design their APIs.**

---

## Current Backend Architecture

### What You Have Today

```javascript
// /backend/src/domains/escrows/controllers/escrows.controller.js
getEscrowById = async (req, res) => {
  const { id } = req.params;
  const escrow = await escrowsService.findById(id);  // Returns flat DB row
  await this.checkOwnership(escrow, req.user.id, req.user.team_id);
  this.success(res, escrow);  // Returns: { success: true, data: { id, address, price, ... } }
};
```

**Current Response (Escrows Example):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "property_address": "5609 Monitor Street",
    "purchase_price": 450000,
    "escrow_status": "active",
    "closing_date": "2025-11-15",
    // ... just the escrows table columns
  }
}
```

**What's Missing:**
- No computed fields (days until closing, progress percentage, etc.)
- No sidebar data (contacts, important dates, AI insights)
- No widget data (timeline, checklists, documents, financials)
- No activity feed
- Frontend must make 5+ additional API calls to populate detail page

---

## Proposed Backend Architecture

### What You Need to Build

```javascript
// /backend/src/domains/escrows/controllers/escrows.controller.js
getEscrowById = async (req, res) => {
  const { id } = req.params;
  const { include } = req.query;  // NEW: Check for ?include=full

  // Fetch base entity
  const escrow = await escrowsService.findById(id);
  await this.checkOwnership(escrow, req.user.id, req.user.team_id);

  // If include=full, fetch additional detail data
  if (include?.includes('full')) {
    const detailData = await escrowsService.getDetailData(id, req.user);

    const response = {
      ...escrow,  // Base fields
      computed: detailData.computed,
      sidebar_left: detailData.sidebar_left,
      sidebar_right: detailData.sidebar_right,
      widgets: detailData.widgets,
      activity_feed: detailData.activity_feed,
      metadata: detailData.metadata
    };

    return this.success(res, response);
  }

  // Default: return just the entity (unchanged behavior)
  this.success(res, escrow);
};
```

**New Response (with ?include=full):**
```json
{
  "success": true,
  "data": {
    // Base fields (unchanged)
    "id": "uuid-123",
    "property_address": "5609 Monitor Street",
    "purchase_price": 450000,

    // NEW: Computed fields
    "computed": {
      "days_until_closing": 16,
      "progress_percentage": 65,
      "loan_amount": 360000,
      "my_commission": 6750
    },

    // NEW: Sidebar data
    "sidebar_left": {
      "quick_actions": [...],
      "key_contacts": [...]
    },
    "sidebar_right": {
      "important_dates": [...],
      "ai_insights": [...]
    },

    // NEW: Widget data
    "widgets": {
      "timeline": { events: [...] },
      "checklists": { items: [...] },
      "documents": { files: [...] },
      "financials": { transaction_summary: {...} }
    },

    // NEW: Activity feed
    "activity_feed": {
      "recent_activity": [...],
      "unread_count": 5
    },

    // NEW: Metadata
    "metadata": {
      "permissions": {...},
      "related_entities": {...}
    }
  }
}
```

---

## Implementation Gap by Entity

### 1. Escrows Detail API

| Component | Current State | Gap | Estimated Effort |
|-----------|--------------|-----|-----------------|
| **Controller** | ✅ `getEscrowById` exists | Add `?include=full` support | 15 min |
| **Service - Computed Fields** | ❌ None | Build `computeStats()` method | 2 hours |
| **Service - Sidebar Left** | ❌ None | Build `getKeyContacts()`, `getQuickActions()` | 1 hour |
| **Service - Sidebar Right** | ❌ None | Build `getImportantDates()`, `getAIInsights()` | 2 hours |
| **Service - Timeline Widget** | ❌ None | Build `getTimelineEvents()` method | 1 hour |
| **Service - Checklists Widget** | ❌ None | Build `getChecklists()` method | 1.5 hours |
| **Service - Documents Widget** | ❌ None | Build `getDocuments()` method | 1 hour |
| **Service - Financials Widget** | ❌ None | Build `getFinancials()` method | 1.5 hours |
| **Service - Activity Feed** | ❌ None | Build `getRecentActivity()` method | 1 hour |
| **Service - Orchestrator** | ❌ None | Build `getDetailData()` (parallel fetch) | 1 hour |
| **Database Tables** | ⚠️ Partial | May need new tables (checklists, timeline) | 2-4 hours |

**Total Effort for Escrows:** **14-16 hours** (2 working days)

---

### 2. Listings Detail API

| Component | Current State | Gap | Estimated Effort |
|-----------|--------------|-----|-----------------|
| **Controller** | ✅ `getListingById` exists | Add `?include=full` support | 15 min |
| **Service - Computed Fields** | ❌ None | Build `computeStats()` (DOM, price/sqft, views) | 1.5 hours |
| **Service - Sidebar Left** | ❌ None | Build `getUpcomingShowings()`, `getContacts()` | 1 hour |
| **Service - Sidebar Right** | ❌ None | Build `getMarketInsights()`, `getPriceAnalysis()` | 2 hours |
| **Service - Showings Widget** | ❌ None | Build `getShowings()` with feedback | 1.5 hours |
| **Service - Price History Widget** | ❌ None | Build `getPriceHistory()` method | 1 hour |
| **Service - Media Widget** | ❌ None | Build `getMedia()` (photos, videos, tours) | 1 hour |
| **Service - Documents Widget** | ❌ None | Build `getDocuments()` method | 1 hour |
| **Service - Activity Feed** | ❌ None | Build `getRecentActivity()` method | 1 hour |
| **Service - Orchestrator** | ❌ None | Build `getDetailData()` | 1 hour |
| **Database Tables** | ⚠️ Partial | May need showings, price_history tables | 2-3 hours |

**Total Effort for Listings:** **13-15 hours** (2 working days)

---

### 3. Clients Detail API

| Component | Current State | Gap | Estimated Effort |
|-----------|--------------|-----|-----------------|
| **Controller** | ✅ `getClientById` exists | Add `?include=full` support | 15 min |
| **Service - Computed Fields** | ❌ None | Build `computeStats()` (LTV, days as client, etc.) | 1.5 hours |
| **Service - Sidebar Left** | ❌ None | Build `getContactPreferences()`, `getRelationships()` | 1 hour |
| **Service - Sidebar Right** | ❌ None | Build `getBuyerPreferences()`, `getFinancingInfo()` | 1.5 hours |
| **Service - Communications Widget** | ❌ None | Build `getCommunications()` method | 1.5 hours |
| **Service - Properties Widget** | ❌ None | Build `getPropertiesViewed()` method | 1 hour |
| **Service - Transactions Widget** | ❌ None | Build `getTransactions()` method | 1 hour |
| **Service - Documents Widget** | ❌ None | Build `getDocuments()` method | 1 hour |
| **Service - Activity Feed** | ❌ None | Build `getRecentActivity()` method | 1 hour |
| **Service - Orchestrator** | ❌ None | Build `getDetailData()` | 1 hour |
| **Database Tables** | ❌ Missing | Need client_profiles, client_financials, related_people | 4-6 hours |

**Total Effort for Clients:** **15-18 hours** (2-3 working days)

---

### 4. Appointments Detail API

| Component | Current State | Gap | Estimated Effort |
|-----------|--------------|-----|-----------------|
| **Controller** | ✅ `getAppointmentById` exists | Add `?include=full` support | 15 min |
| **Service - Computed Fields** | ❌ None | Build `computeStats()` (hours until, duration, etc.) | 1 hour |
| **Service - Sidebar Left** | ❌ None | Build `getAttendees()`, `getReminders()` | 1 hour |
| **Service - Sidebar Right** | ❌ None | Build `getLocationDetails()`, `getPropertyContext()` | 1.5 hours |
| **Service - Preparation Widget** | ❌ None | Build `getPreparationChecklist()` | 1 hour |
| **Service - Documents Widget** | ❌ None | Build `getDocuments()` method | 1 hour |
| **Service - Notes Widget** | ❌ None | Build `getNotes()` method | 30 min |
| **Service - History Widget** | ❌ None | Build `getRelatedAppointments()` | 1 hour |
| **Service - Activity Feed** | ❌ None | Build `getRecentActivity()` method | 1 hour |
| **Service - Orchestrator** | ❌ None | Build `getDetailData()` | 30 min |
| **Database Tables** | ⚠️ Partial | May need appointment_attendees, reminders | 2-3 hours |

**Total Effort for Appointments:** **11-13 hours** (1.5-2 working days)

---

### 5. Leads Detail API

| Component | Current State | Gap | Estimated Effort |
|-----------|--------------|-----|-----------------|
| **Controller** | ✅ `getLeadById` exists | Add `?include=full` support | 15 min |
| **Service - Computed Fields** | ❌ None | Build `computeStats()` (days as lead, score, etc.) | 1 hour |
| **Service - Sidebar Left** | ❌ None | Build `getContactInfo()`, `getSource()` | 30 min |
| **Service - Sidebar Right** | ❌ None | Build `getLeadScoring()`, `getAIInsights()` | 2 hours |
| **Service - Activity Widget** | ❌ None | Build `getLeadActivity()` method | 1 hour |
| **Service - Communications Widget** | ❌ None | Build `getCommunications()` method | 1 hour |
| **Service - Qualification Widget** | ❌ None | Build `getQualificationData()` method | 1.5 hours |
| **Service - Next Steps Widget** | ❌ None | Build `getNextSteps()` method | 1 hour |
| **Service - Activity Feed** | ❌ None | Build `getRecentActivity()` method | 1 hour |
| **Service - Orchestrator** | ❌ None | Build `getDetailData()` | 30 min |
| **Database Tables** | ⚠️ Partial | May need lead_scoring, lead_activity tables | 2-3 hours |

**Total Effort for Leads:** **11-13 hours** (1.5-2 working days)

---

## Total Implementation Effort Summary

| Entity | Current % | Effort (Hours) | Effort (Days) | Priority |
|--------|-----------|----------------|---------------|----------|
| **Escrows** | 20% | 14-16 | 2 days | 🔴 CRITICAL |
| **Listings** | 20% | 13-15 | 2 days | 🔴 CRITICAL |
| **Clients** | 10% | 15-18 | 2-3 days | 🟠 HIGH |
| **Appointments** | 20% | 11-13 | 1.5-2 days | 🟡 MEDIUM |
| **Leads** | 20% | 11-13 | 1.5-2 days | 🟡 MEDIUM |
| **TOTAL** | **18%** | **64-75 hours** | **9-11 days** | |

**Timeline:**
- Working 8 hours/day: **9-11 business days**
- Working 4 hours/day: **16-19 business days**
- With 2 developers: **5-6 business days**

---

## Best Practices Validation

### ✅ Your Proposed Structure Follows Industry Standards

**1. Single Endpoint with Opt-In Complexity**
- ✅ `GET /escrows/:id` - Lightweight (dashboard use)
- ✅ `GET /escrows/:id?include=full` - Complete (detail page use)
- ✅ Backward compatible (existing apps don't break)

**Examples from Industry:**
- **Stripe:** `GET /charges/:id?expand=customer,invoice`
- **GitHub:** `GET /repos/:owner/:repo?include=topics,permissions`
- **Shopify:** `GET /products/:id?fields=id,title,images,variants`

**2. Computed Fields on Backend**
- ✅ Prevents inconsistent calculations across clients
- ✅ Reduces frontend complexity
- ✅ Single source of truth

**Example:** Stripe calculates `amount_refunded`, `amount_due`, `refunded` (boolean) on backend

**3. Parallel Data Fetching**
- ✅ Uses `Promise.all()` for performance
- ✅ Fetches sidebar, widgets, activity in parallel
- ✅ Dramatically faster than sequential fetching

**Example: Service Layer Pattern**
```javascript
async getDetailData(escrowId, user) {
  // Fetch everything in parallel (50-150ms total)
  const [computed, contacts, dates, timeline, checklists, docs, activity] = await Promise.all([
    this.computeStats(escrowId),              // 10ms
    this.getKeyContacts(escrowId),            // 15ms
    this.getImportantDates(escrowId),         // 10ms
    this.getTimelineEvents(escrowId),         // 20ms
    this.getChecklists(escrowId),             // 15ms
    this.getDocuments(escrowId),              // 20ms
    this.getRecentActivity(escrowId)          // 25ms
  ]);

  return { computed, sidebar_left: { contacts }, sidebar_right: { dates }, ... };
}

// vs. Sequential (would be 115ms+ with round-trip overhead)
```

**4. Structured Response Format**
- ✅ Hero data (main entity)
- ✅ Computed fields (derived data)
- ✅ Sidebar data (contextual actions/info)
- ✅ Widget data (detailed sections)
- ✅ Activity feed (recent events)
- ✅ Metadata (permissions, related entities)

This matches **GraphQL-style thinking** but using REST (best of both worlds).

**5. Non-Breaking Changes**
- ✅ Existing `GET /escrows/:id` unchanged
- ✅ New behavior is opt-in via query parameter
- ✅ Allows gradual migration (update frontend module by module)

---

## Recommended Implementation Order

### Phase 1: Foundation (Week 1)
**Goal:** Prove the pattern works with one entity

1. **Day 1-2: Escrows Detail API**
   - Extend `escrows.controller.js` with `?include=full`
   - Build `escrowsService.getDetailData()` orchestrator
   - Implement computed fields (days until closing, progress, commission)
   - Implement sidebar_left (contacts, quick actions)
   - Implement sidebar_right (important dates, AI insights)

2. **Day 3: Escrows Widgets (Priority)**
   - Timeline widget (existing events)
   - Financials widget (transaction summary, commission breakdown)
   - Skip checklists/documents for now (need new tables)

3. **Day 4: Test & Validate**
   - Test with real escrow data
   - Measure API response time (should be <200ms)
   - Validate JSON structure matches proposed design
   - Update frontend DetailTemplate to consume new payload

4. **Day 5: Documentation**
   - Document service layer methods
   - Create API usage examples
   - Write integration tests

**Success Criteria:** Escrows detail page loads with 1 API call in <200ms

---

### Phase 2: Core Entities (Week 2)
**Goal:** Extend pattern to Listings and Clients

5. **Day 6-7: Listings Detail API**
   - Follow escrows pattern
   - Focus on showings, price history, media widgets
   - Implement market insights (comparables, DOM)

6. **Day 8-10: Clients Detail API**
   - Build new database tables (client_profiles, client_financials)
   - Implement communication history widget
   - Implement properties viewed widget
   - Implement transactions widget

**Success Criteria:** Listings and Clients detail pages work with 1 API call each

---

### Phase 3: Supporting Entities (Week 3)
**Goal:** Complete remaining entities

7. **Day 11-12: Appointments Detail API**
   - Implement attendees, reminders, location context
   - Build preparation checklist widget

8. **Day 13-14: Leads Detail API**
   - Implement lead scoring, qualification data
   - Build next steps widget

9. **Day 15: Polish & Optimization**
   - Add caching (Redis) for frequently accessed detail data
   - Optimize database queries (add indexes)
   - Add response compression
   - Performance testing

**Success Criteria:** All 5 entities have full detail API support with <200ms response times

---

## Database Schema Changes Required

### New Tables Needed

```sql
-- 1. Client Profiles (for Clients Detail API)
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  preferred_contact_method VARCHAR(20),
  communication_preferences JSONB,
  buyer_preferences JSONB,
  financing_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Timeline Events (for all entities)
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50), -- escrow, listing, client, appointment, lead
  entity_id UUID,
  event_type VARCHAR(50), -- status_change, document_upload, note_added, etc.
  message TEXT,
  user_id UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_timeline_entity ON timeline_events(entity_type, entity_id, created_at DESC);

-- 3. Checklists (for Escrows, Clients)
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50),
  entity_id UUID,
  title VARCHAR(200),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  category VARCHAR(100),
  assigned_to UUID,
  priority VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_checklists_entity ON checklists(entity_type, entity_id);

-- 4. Showings (for Listings Detail API)
CREATE TABLE showings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  showing_date DATE,
  showing_time TIME,
  agent_name VARCHAR(200),
  agent_company VARCHAR(200),
  agent_phone VARCHAR(20),
  status VARCHAR(20), -- scheduled, confirmed, completed, cancelled
  feedback TEXT,
  feedback_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_showings_listing ON showings(listing_id, showing_date DESC);

-- 5. Price History (for Listings Detail API)
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  price NUMERIC(12, 2),
  change_amount NUMERIC(12, 2),
  change_percentage DECIMAL(5, 2),
  reason VARCHAR(200),
  effective_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_price_history_listing ON price_history(listing_id, effective_date DESC);

-- 6. Communications Log (for Clients, Leads)
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50), -- client, lead
  entity_id UUID,
  communication_type VARCHAR(20), -- email, phone, text, in_person
  direction VARCHAR(10), -- inbound, outbound
  subject TEXT,
  message TEXT,
  status VARCHAR(20), -- sent, delivered, opened, clicked
  duration_minutes INTEGER, -- for phone calls
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_communications_entity ON communications(entity_type, entity_id, created_at DESC);
```

**Estimated Schema Work:** 4-6 hours (migration creation, testing, deployment)

---

## Performance Considerations

### Expected Response Times (with Optimization)

| Endpoint | Without ?include=full | With ?include=full | Acceptable? |
|----------|----------------------|-------------------|-------------|
| `GET /escrows/:id` | 15-30ms | 150-250ms | ✅ YES |
| `GET /listings/:id` | 15-30ms | 120-200ms | ✅ YES |
| `GET /clients/:id` | 15-30ms | 180-280ms | ✅ YES |
| `GET /appointments/:id` | 15-30ms | 100-150ms | ✅ YES |
| `GET /leads/:id` | 15-30ms | 100-150ms | ✅ YES |

**Why This is Fast:**
- Parallel queries (`Promise.all`) instead of sequential
- Indexed database queries (proper indexes on foreign keys)
- Limited result sets (last 10 timeline events, not all)
- Pagination for large datasets (documents, activity feed)

**Optimization Strategies:**
1. **Add Indexes** (critical for performance):
   ```sql
   CREATE INDEX idx_timeline_entity ON timeline_events(entity_type, entity_id, created_at DESC);
   CREATE INDEX idx_checklists_entity ON checklists(entity_type, entity_id);
   CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
   ```

2. **Use Query Limits** (prevent over-fetching):
   ```javascript
   getTimelineEvents(entityId, limit = 10) {
     return db.query('SELECT * FROM timeline_events WHERE entity_id = $1 ORDER BY created_at DESC LIMIT $2', [entityId, limit]);
   }
   ```

3. **Cache Computed Fields** (Redis for 5-minute TTL):
   ```javascript
   async computeStats(escrowId) {
     const cached = await redis.get(`escrow:${escrowId}:stats`);
     if (cached) return JSON.parse(cached);

     const stats = { /* calculate stats */ };
     await redis.setex(`escrow:${escrowId}:stats`, 300, JSON.stringify(stats));
     return stats;
   }
   ```

4. **Denormalize Key Fields** (avoid joins):
   - Store `contact_name` in escrows table (instead of JOIN to contacts)
   - Update via database triggers when contacts.name changes

---

## Migration Strategy (Non-Breaking)

### Step 1: Add Query Parameter Support (30 minutes)
```javascript
// Before (existing code - unchanged)
GET /v1/escrows/:id → Returns flat escrow object

// After (backward compatible)
GET /v1/escrows/:id → Returns flat escrow object (unchanged)
GET /v1/escrows/:id?include=full → Returns detailed payload (new)
```

### Step 2: Deploy Backend (no frontend changes needed)
- Deploy new controller/service code
- Existing frontend continues to work (no ?include=full parameter)
- Zero downtime deployment

### Step 3: Update Frontend Module by Module
- Update DetailTemplate to use `?include=full`
- Migrate Escrows detail page first
- Then Listings, Clients, Appointments, Leads
- Old dashboard views continue using lightweight endpoint

### Step 4: Deprecate Old Widget Endpoints (optional, future)
- Once all detail pages use `?include=full`, deprecate:
  - `GET /escrows/:id/timeline` → Use `widgets.timeline`
  - `GET /escrows/:id/checklists` → Use `widgets.checklists`
  - `GET /escrows/:id/documents` → Use `widgets.documents`

---

## Risk Assessment

### Low Risk ✅
- **Backward Compatible:** Existing API calls unchanged
- **Proven Pattern:** Industry-standard REST design
- **Gradual Migration:** Can update frontend module by module
- **Performance:** Parallel queries prevent slowdown

### Medium Risk ⚠️
- **Database Load:** More complex queries (mitigate with indexes, caching)
- **Testing Effort:** Need to test all 5 entities thoroughly
- **Schema Changes:** New tables require migration testing

### High Risk 🚨
- **None** - This is a very safe architectural change

---

## Conclusion & Recommendation

### ✅ **PROCEED WITH IMPLEMENTATION**

Your proposed detail API structure is:
1. ✅ **Best practice** (matches Stripe, GitHub, Shopify)
2. ✅ **Performance-optimized** (parallel queries, caching)
3. ✅ **Backward compatible** (no breaking changes)
4. ✅ **Scalable** (supports future features easily)
5. ✅ **Developer-friendly** (clean, predictable structure)

### **Recommended Starting Point:**

**Start with Escrows Detail API (Days 1-4):**
1. Extend controller with `?include=full`
2. Build `getDetailData()` orchestrator
3. Implement computed fields + sidebars
4. Implement 2 widgets (Timeline, Financials)
5. Test and validate with real data
6. Update frontend DetailTemplate

**Then replicate pattern to other entities.**

### **Expected Timeline:**
- **Escrows:** 2 days (16 hours)
- **Listings:** 2 days (15 hours)
- **Clients:** 2-3 days (18 hours)
- **Appointments:** 1.5 days (13 hours)
- **Leads:** 1.5 days (13 hours)
- **Total:** **9-11 days** (75 hours)

**With 2 developers:** **5-6 days**

---

## Next Steps

Would you like me to:
1. ✅ **Start implementing Escrows Detail API** (controller + service layer)
2. ✅ **Create database migration** for new tables (timeline, checklists, etc.)
3. ✅ **Build example service methods** (computeStats, getTimelineEvents, etc.)
4. ✅ **Write integration tests** for the new endpoint

**I recommend starting with #1 - Escrows Detail API implementation.** This will prove the pattern works and give you a template for the other entities.
