# Detail Page API Architecture - Best Practices

**Created:** 2025-10-29
**Purpose:** Define standardized API structure for detail pages across all entities
**Status:** Active Reference - Architectural Guidelines

---

## Current State Analysis

### Frontend (DetailTemplate)
The DetailTemplate currently makes a **single API call** to fetch entity data:

```javascript
// /templates/Detail/index.jsx (line 182)
const response = await config.api.getById(id);
// Example: clientsAPI.getById('uuid-123')
```

**What it receives:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "first_name": "Client",
    "last_name": "1",
    "email": "test1@jaydenmetz.com",
    "status": "active",
    "city": "Bakersfield",
    "state": "CA"
    // ... all flat database fields
  }
}
```

### Backend (Current Implementation)
Controllers simply return the raw database row:

```javascript
// /domains/clients/controllers/clients.controller.js (line 56-68)
getClientById = async (req, res) => {
  const client = await clientsService.findById(id);
  this.success(res, client); // Returns flat DB row
}
```

**Problem:** This requires **multiple additional API calls** for widgets:
- Frontend loads client → makes call to `/clients/:id`
- Timeline widget loads → makes call to `/clients/:id/timeline`
- Properties widget loads → makes call to `/clients/:id/properties`
- Documents widget loads → makes call to `/clients/:id/documents`
- Activity feed loads → makes call to `/clients/:id/activity`

**Total:** 5+ separate API calls just to populate one detail page!

---

## Recommended Architecture: Single-Request Detail Response

### Best Practice: GET /v1/escrows/:id → Complete Detail Payload

**Philosophy:**
> "One detail page view = One API request"

The backend should return a **complete, structured payload** that contains everything the detail page needs:
- Hero data (main entity fields)
- Sidebar data (quick actions, context)
- Widget data (timeline, checklists, documents, etc.)
- Activity feed data (recent activity)

### Recommended Response Structure

```javascript
// GET /v1/escrows/:id
{
  "success": true,
  "data": {
    // ==========================================
    // 1. HERO DATA (main entity fields)
    // ==========================================
    "id": "uuid-123",
    "escrow_number": "ESC-2025-001",
    "property_address": "5609 Monitor Street",
    "city": "Bakersfield",
    "state": "CA",
    "zip": "93306",
    "status": "active",
    "purchase_price": 450000,
    "closing_date": "2025-11-15",
    "created_at": "2025-10-01T12:00:00Z",
    "updated_at": "2025-10-29T14:30:00Z",

    // ==========================================
    // 2. COMPUTED FIELDS FOR HERO (calculated stats)
    // ==========================================
    "computed": {
      "days_until_closing": 17,
      "total_cash_needed": 90000,
      "loan_amount": 360000,
      "ltv_ratio": 80,
      "progress_percentage": 65
    },

    // ==========================================
    // 3. LEFT SIDEBAR DATA (Quick Actions)
    // ==========================================
    "sidebar_left": {
      "quick_actions": [
        { "id": 1, "label": "Edit Escrow", "icon": "Edit", "action": "edit" },
        { "id": 2, "label": "Send Docs", "icon": "Send", "action": "send_docs" },
        { "id": 3, "label": "Add Note", "icon": "FileText", "action": "add_note" }
      ],
      "contacts": [
        { "id": "c1", "name": "John Smith", "role": "buyer", "phone": "555-1234" },
        { "id": "c2", "name": "Jane Doe", "role": "seller_agent", "phone": "555-5678" }
      ]
    },

    // ==========================================
    // 4. RIGHT SIDEBAR DATA (Smart Context)
    // ==========================================
    "sidebar_right": {
      "important_dates": [
        { "date": "2025-11-01", "label": "Inspection", "days_away": 3 },
        { "date": "2025-11-08", "label": "Appraisal", "days_away": 10 }
      ],
      "ai_insights": [
        { "type": "warning", "message": "Appraisal due in 10 days - schedule now" },
        { "type": "info", "message": "Buyer pre-approved, good credit score" }
      ]
    },

    // ==========================================
    // 5. WIDGETS DATA (2x2 grid)
    // ==========================================
    "widgets": {
      "timeline": {
        "events": [
          { "id": 1, "date": "2025-10-29", "type": "status_change", "message": "Escrow opened", "user": "Jayden Metz" },
          { "id": 2, "date": "2025-10-28", "type": "document", "message": "Purchase agreement signed", "user": "John Smith" }
        ],
        "total_events": 12
      },

      "checklists": {
        "items": [
          { "id": 1, "title": "Order title report", "completed": true, "due_date": "2025-10-25" },
          { "id": 2, "title": "Schedule inspection", "completed": false, "due_date": "2025-11-01" }
        ],
        "completion_percentage": 65,
        "total_items": 8,
        "completed_items": 5
      },

      "documents": {
        "files": [
          { "id": 1, "name": "Purchase Agreement.pdf", "size": 245000, "uploaded_at": "2025-10-28" },
          { "id": 2, "name": "Inspection Report.pdf", "size": 1200000, "uploaded_at": "2025-10-29" }
        ],
        "total_files": 7,
        "total_size_bytes": 5000000
      },

      "financials": {
        "purchase_price": 450000,
        "down_payment": 90000,
        "loan_amount": 360000,
        "estimated_closing_costs": 12000,
        "total_cash_needed": 102000
      }
    },

    // ==========================================
    // 6. ACTIVITY FEED DATA (bottom tab)
    // ==========================================
    "activity_feed": {
      "recent_activity": [
        { "id": 1, "timestamp": "2025-10-29T14:30:00Z", "user": "Jayden Metz", "action": "updated status", "details": "Changed to Active" },
        { "id": 2, "timestamp": "2025-10-29T12:15:00Z", "user": "John Smith", "action": "uploaded document", "details": "Inspection Report.pdf" }
      ],
      "total_activity_count": 45,
      "unread_count": 3
    },

    // ==========================================
    // 7. METADATA (optional)
    // ==========================================
    "metadata": {
      "permissions": {
        "can_edit": true,
        "can_delete": true,
        "can_archive": true
      },
      "related_entities": {
        "client_id": "client-uuid-456",
        "listing_id": "listing-uuid-789"
      }
    }
  }
}
```

---

## Implementation Plan

### Phase 1: Backend - Extend Controllers with Detail Endpoint

**Option A: Extend Existing getById (Recommended)**
```javascript
// /domains/escrows/controllers/escrows.controller.js

getEscrowById = this.asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { include } = req.query; // ?include=widgets,sidebars,activity

  // Fetch base entity
  const escrow = await escrowsService.findById(id);

  // Check ownership
  await this.checkOwnership(escrow, req.user.id, req.user.team_id);

  // If include=full or detail view, fetch additional data
  if (include?.includes('full') || include?.includes('widgets')) {
    const detailData = await escrowsService.getDetailData(id, req.user);

    const response = {
      ...escrow,
      computed: detailData.computed,
      sidebar_left: detailData.sidebar_left,
      sidebar_right: detailData.sidebar_right,
      widgets: detailData.widgets,
      activity_feed: detailData.activity_feed,
      metadata: detailData.metadata
    };

    return this.success(res, response);
  }

  // Default: return just the entity
  this.success(res, escrow);
});
```

**Option B: Create Separate Detail Endpoint (Alternative)**
```javascript
// /domains/escrows/controllers/escrows.controller.js

getEscrowDetail = this.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const detailData = await escrowsService.getCompleteDetail(id, req.user);

  this.success(res, detailData);
});

// Route: GET /v1/escrows/:id/detail
```

**Recommendation:** Use **Option A** with query parameter. This keeps the API RESTful and allows:
- Dashboard views: `GET /v1/escrows/:id` (lightweight, no includes)
- Detail page: `GET /v1/escrows/:id?include=full` (complete payload)

### Phase 2: Backend - Create Service Layer Methods

```javascript
// /domains/escrows/services/escrows.service.js

class EscrowsService {
  async getDetailData(escrowId, user) {
    // Fetch data in parallel for performance
    const [
      computed,
      timelineEvents,
      checklists,
      documents,
      financials,
      activity,
      contacts,
      importantDates
    ] = await Promise.all([
      this.computeStats(escrowId),
      this.getTimelineEvents(escrowId, { limit: 10 }),
      this.getChecklists(escrowId),
      this.getDocuments(escrowId, { limit: 10 }),
      this.getFinancials(escrowId),
      this.getRecentActivity(escrowId, { limit: 20 }),
      this.getRelatedContacts(escrowId),
      this.getImportantDates(escrowId)
    ]);

    return {
      computed,
      sidebar_left: {
        quick_actions: this.getQuickActions(escrowId),
        contacts
      },
      sidebar_right: {
        important_dates: importantDates,
        ai_insights: await this.getAIInsights(escrowId)
      },
      widgets: {
        timeline: { events: timelineEvents, total_events: timelineEvents.length },
        checklists: checklists,
        documents: documents,
        financials: financials
      },
      activity_feed: {
        recent_activity: activity,
        total_activity_count: activity.length,
        unread_count: activity.filter(a => !a.read).length
      },
      metadata: {
        permissions: this.getUserPermissions(escrowId, user),
        related_entities: await this.getRelatedEntities(escrowId)
      }
    };
  }

  async computeStats(escrowId) {
    const escrow = await this.findById(escrowId);

    return {
      days_until_closing: this.calculateDaysUntil(escrow.closing_date),
      total_cash_needed: escrow.down_payment + escrow.closing_costs,
      loan_amount: escrow.purchase_price - escrow.down_payment,
      ltv_ratio: ((escrow.purchase_price - escrow.down_payment) / escrow.purchase_price) * 100,
      progress_percentage: await this.calculateProgress(escrowId)
    };
  }

  // ... other helper methods
}
```

### Phase 3: Frontend - Update DetailTemplate to Use Full Payload

```javascript
// /templates/Detail/index.jsx

useEffect(() => {
  const fetchEntity = async () => {
    try {
      setLoading(true);

      // Request full detail payload with include parameter
      const response = await config.api.getById(id, { include: 'full' });

      if (response.success) {
        setEntity(response.data);

        // Extract nested data for widgets
        setWidgetData({
          timeline: response.data.widgets?.timeline,
          checklists: response.data.widgets?.checklists,
          documents: response.data.widgets?.documents,
          financials: response.data.widgets?.financials
        });

        setSidebarData({
          left: response.data.sidebar_left,
          right: response.data.sidebar_right
        });

        setActivityFeedData(response.data.activity_feed);

        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchEntity();
}, [id, config.api]);
```

### Phase 4: Frontend - Update API Service

```javascript
// /services/api.service.js

export const clientsAPI = {
  getById: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/clients/${id}${queryString ? `?${queryString}` : ''}`;
    return apiInstance.get(url);
  }
};

export const escrowsAPI = {
  getById: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/escrows/${id}${queryString ? `?${queryString}` : ''}`;
    return apiInstance.get(url);
  }
};
```

---

## Benefits of This Architecture

### Performance Benefits
✅ **Fewer API calls:** 1 request instead of 5+
✅ **Parallel database queries:** Backend fetches all data simultaneously
✅ **Reduced latency:** No waterfall loading (widget waits for hero, etc.)
✅ **Smaller bundle size:** Less API client code

### Developer Experience Benefits
✅ **Predictable data structure:** Same shape across all entities
✅ **Type safety:** Easy to define TypeScript interfaces
✅ **Testability:** Mock entire detail page with single fixture
✅ **Reusability:** DetailTemplate works for all entities without modification

### User Experience Benefits
✅ **Faster page loads:** All data arrives at once
✅ **No loading spinners on widgets:** Everything loads together
✅ **Consistent experience:** All detail pages behave the same

---

## Migration Strategy

### Step 1: Create New Endpoint (Non-Breaking)
Add `?include=full` query parameter to existing `GET /:id` endpoints. Default behavior unchanged.

```bash
# Old behavior (unchanged)
GET /v1/escrows/123
# Returns: { success: true, data: { id: 123, ... } }

# New behavior (opt-in)
GET /v1/escrows/123?include=full
# Returns: { success: true, data: { id: 123, ..., widgets: {}, sidebars: {}, ... } }
```

### Step 2: Implement Service Layer Methods
Build `getDetailData()` method in each service (escrows, clients, listings, etc.)

### Step 3: Update DetailTemplate
Modify DetailTemplate to request `?include=full` and consume nested data.

### Step 4: Build Widget Components
Create actual widget components (Timeline, Checklists, Documents) that consume widget data from payload.

### Step 5: Deprecate Old Widget Endpoints (Optional)
Once all widgets use the main detail endpoint, deprecate individual widget endpoints:
- ~~GET /v1/escrows/:id/timeline~~ → Use `data.widgets.timeline`
- ~~GET /v1/escrows/:id/checklists~~ → Use `data.widgets.checklists`

---

## Example: Clients Detail Implementation

### Backend Controller
```javascript
// /domains/clients/controllers/clients.controller.js

getClientById = this.asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { include } = req.query;

  const client = await clientsService.findById(id);
  await this.checkOwnership(client, req.user.id, req.user.team_id);

  if (include?.includes('full')) {
    const detailData = await clientsService.getDetailData(id, req.user);

    const response = {
      ...client,
      name: `${client.first_name} ${client.last_name}`, // Computed field
      ...detailData
    };

    return this.success(res, response);
  }

  this.success(res, client);
});
```

### Backend Service
```javascript
// /domains/clients/services/clients.service.js

async getDetailData(clientId, user) {
  const [properties, timeline, documents, activity] = await Promise.all([
    this.getClientProperties(clientId),
    this.getClientTimeline(clientId),
    this.getClientDocuments(clientId),
    this.getRecentActivity(clientId)
  ]);

  return {
    computed: {
      lifetime_value: properties.reduce((sum, p) => sum + p.purchase_price, 0),
      total_commission: properties.reduce((sum, p) => sum + p.commission, 0),
      days_since_contact: this.calculateDaysSince(activity[0]?.timestamp)
    },
    widgets: {
      timeline: { events: timeline },
      properties: { list: properties },
      documents: { files: documents }
    },
    activity_feed: { recent_activity: activity }
  };
}
```

### Frontend Config
```javascript
// /config/entities/clients.config.js

export const clientsConfig = {
  api: {
    getById: (id) => clientsAPI.getById(id, { include: 'full' }) // Request full payload
  },

  detail: {
    hero: {
      titleField: 'name', // Backend now returns computed 'name' field
      stats: [
        { label: 'LIFETIME VALUE', field: 'computed.lifetime_value', format: 'currency' },
        { label: 'TOTAL COMMISSION', field: 'computed.total_commission', format: 'currency' },
        { label: 'DAYS SINCE CONTACT', field: 'computed.days_since_contact', format: 'number' }
      ]
    },

    widgets: [
      { id: 'timeline', title: 'Timeline', dataPath: 'widgets.timeline' },
      { id: 'properties', title: 'Properties', dataPath: 'widgets.properties' },
      { id: 'documents', title: 'Documents', dataPath: 'widgets.documents' }
    ]
  }
};
```

---

## Questions & Answers

### Q: Should every widget's data be in the main payload?
**A:** Yes, for initial page load. You can add **pagination/infinite scroll** for large datasets:

```javascript
// Initial load (first 10 items)
GET /v1/escrows/123?include=full
// Returns widgets.timeline.events (first 10)

// Load more (next 10)
GET /v1/escrows/123/timeline?offset=10&limit=10
```

### Q: What about real-time updates (WebSocket)?
**A:** Keep the WebSocket for **incremental updates**:
- Initial load: HTTP request with full payload
- Live updates: WebSocket pushes individual changes
- Widget subscribes to WebSocket events and merges updates

### Q: How do I handle different permission levels?
**A:** Include a `metadata.permissions` object:

```javascript
"metadata": {
  "permissions": {
    "can_edit": true,
    "can_delete": false,
    "can_view_financials": true
  }
}

// Frontend uses this to show/hide buttons
{permissions.can_edit && <EditButton />}
```

### Q: What about caching?
**A:** Use React Query's built-in caching:

```javascript
const { data } = useQuery(['escrow', id], () => escrowsAPI.getById(id, { include: 'full' }), {
  staleTime: 60000, // Cache for 1 minute
  cacheTime: 300000 // Keep in memory for 5 minutes
});
```

---

## Conclusion

**Recommended Approach:**
1. ✅ **Single API request** for detail pages (`GET /escrows/:id?include=full`)
2. ✅ **Structured response** with hero, widgets, sidebars, activity feed
3. ✅ **Computed fields** calculated by backend (days until closing, LTV ratio, etc.)
4. ✅ **Parallel database queries** for performance
5. ✅ **Opt-in behavior** via query parameter (non-breaking change)

This follows **REST best practices** while optimizing for real-world detail page performance.
