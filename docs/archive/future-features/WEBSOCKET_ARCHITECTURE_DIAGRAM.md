# WebSocket Architecture Diagrams

## Current Architecture (As-Is)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER                              │
│                    (api.jaydenmetz.com:5050)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │          WebSocket Service (Socket.IO)                    │    │
│  │  - JWT Authentication                                     │    │
│  │  - 3-Tier Rooms (broker/team/user)                       │    │
│  │  - 10s ping, 5s timeout                                  │    │
│  └───────────────────────────────────────────────────────────┘    │
│                          │                                         │
│                          │ Events Emitted                          │
│                          ▼                                         │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                   Controllers                             │    │
│  ├───────────────────────────────────────────────────────────┤    │
│  │  ✅ escrows.controller.js                                 │    │
│  │     └─> emit 'data:update' (create/update/delete)        │    │
│  │                                                           │    │
│  │  ❌ listings.controller.js    (NO EVENTS)                │    │
│  │  ❌ clients.controller.js     (NO EVENTS)                │    │
│  │  ❌ appointments.controller.js (NO EVENTS)               │    │
│  │  ❌ leads.controller.js       (NO EVENTS)                │    │
│  │  ❌ AI agent service          (NOT IMPLEMENTED)          │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                           │
                           │ WebSocket Connection (wss://)
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                      FRONTEND CLIENTS                               │
│                   (crm.jaydenmetz.com)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │         websocket.service.js                              │    │
│  │  - Auto-reconnect (5 attempts, 1s delay)                 │    │
│  │  - Message queue (offline support)                       │    │
│  │  - Event listeners (data:update, ai:*, etc.)            │    │
│  └───────────────────────────────────────────────────────────┘    │
│                          │                                         │
│                          │ Events Received                         │
│                          ▼                                         │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │              useWebSocket Hook                            │    │
│  │  - Listen for 'data:update'                              │    │
│  │  - Invalidate React Query cache                          │    │
│  │  - Trigger full dataset refetch                          │    │
│  └───────────────────────────────────────────────────────────┘    │
│                          │                                         │
│                          │ Cache Invalidation                      │
│                          ▼                                         │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                   Dashboards                              │    │
│  ├───────────────────────────────────────────────────────────┤    │
│  │  ✅ EscrowsDashboard    (receives updates)               │    │
│  │  ⚠️ ListingsDashboard   (listens but no events)          │    │
│  │  ⚠️ ClientsDashboard    (listens but no events)          │    │
│  │  ⚠️ AppointmentsDashboard (listens but no events)        │    │
│  │  ⚠️ LeadsDashboard      (listens but no events)          │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ❌ No connection status indicator                                 │
│  ❌ No AI progress UI                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Room Hierarchy (3-Tier)

```
                    ┌──────────────────────────┐
                    │   Broker: Associated RE  │
                    │   (broker-abc123)        │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │                          │
        ┌───────────▼──────────┐   ┌──────────▼──────────┐
        │ Team: Jayden Metz    │   │ Team: Riley Team    │
        │ (team-xyz789)        │   │ (team-def456)       │
        └───────────┬──────────┘   └──────────┬──────────┘
                    │                          │
        ┌───────────┼────────────┐ ┌──────────┼──────────┐
        │           │            │ │          │          │
    ┌───▼───┐  ┌───▼───┐  ┌────▼─▼──┐  ┌────▼───┐  ┌───▼───┐
    │ User1 │  │ User2 │  │  Josh   │  │ User4  │  │ User5 │
    │(u-123)│  │(u-456)│  │ (u-789) │  │(u-012) │  │(u-345)│
    └───────┘  └───────┘  └─────────┘  └────────┘  └───────┘
```

**Broadcast Behavior:**
- `sendToUser(u-123)` → User1 only
- `sendToTeam(team-xyz789)` → User1, User2, Josh
- `sendToBroker(broker-abc123)` → All 5 users

## Data Flow: Current (Inefficient)

```
USER ACTION                 BACKEND                    FRONTEND
─────────────────────────────────────────────────────────────────

User clicks                API POST /escrows/:id
"Archive Escrow"           └─> Update database
     │                     └─> Emit WebSocket event
     │                             │
     │                             │ 'data:update'
     │                             │ { entityType: 'escrow',
     │                             │   entityId: '123',
     │                             │   action: 'update' }
     │                             │
     │                     ┌───────▼─────────┐
     │                     │  Team Room      │
     │                     │  (3 users)      │
     │                     └───────┬─────────┘
     │                             │
     ▼                             ▼
┌────────────────────┐   ┌─────────────────┐
│ User's Browser     │   │ Teammate's      │
│                    │   │ Browser         │
│ useWebSocket hook  │   │ useWebSocket    │
│ receives event     │   │ receives event  │
│                    │   │                 │
│ queryClient        │   │ queryClient     │
│ .invalidateQueries │   │ .invalidateQueries│
│ (['escrows'])      │   │ (['escrows'])   │
│                    │   │                 │
│ ❌ Refetch ALL     │   │ ❌ Refetch ALL  │
│    escrows (50)    │   │    escrows (50) │
│                    │   │                 │
│ API GET /escrows   │   │ API GET /escrows│
│ ?page=1&limit=50   │   │ ?page=1&limit=50│
└────────┬───────────┘   └────────┬────────┘
         │                        │
         ▼                        ▼
   ┌────────────┐          ┌────────────┐
   │ Database   │          │ Database   │
   │ SELECT *   │          │ SELECT *   │
   │ FROM       │          │ FROM       │
   │ escrows    │          │ escrows    │
   │ LIMIT 50   │          │ LIMIT 50   │
   └────────────┘          └────────────┘

RESULT:
- 100KB network traffic (50 records × 2KB)
- 2-3 second delay
- Wasted bandwidth
- Database load (2 queries for 1 change)
```

## Data Flow: Recommended (Efficient)

```
USER ACTION                 BACKEND                    FRONTEND
─────────────────────────────────────────────────────────────────

User clicks                API POST /escrows/:id
"Archive Escrow"           └─> Update database
     │                     └─> Emit WebSocket event
     │                             │
     │ ✅ Optimistic               │ 'escrow:updated'
     │    UI update                │ { escrowId: '123',
     │    (instant)                │   changes: { archived: true },
     │                             │   updatedBy: 'u-456' }
     │                             │
     │                     ┌───────▼─────────┐
     │                     │  Team Room      │
     │                     │  (3 users)      │
     │                     └───────┬─────────┘
     │                             │
     ▼                             ▼
┌────────────────────┐   ┌─────────────────┐
│ User's Browser     │   │ Teammate's      │
│ (sees change now)  │   │ Browser         │
│                    │   │                 │
│ useWebSocket hook  │   │ useWebSocket    │
│ receives event     │   │ receives event  │
│                    │   │                 │
│ queryClient        │   │ queryClient     │
│ .setQueryData()    │   │ .setQueryData() │
│                    │   │                 │
│ ✅ Patch 1 record  │   │ ✅ Patch 1      │
│    in cache        │   │    record       │
│                    │   │                 │
│ ✅ NO API call     │   │ ✅ NO API call  │
│    needed          │   │    needed       │
└────────────────────┘   └─────────────────┘

RESULT:
- 2KB network traffic (1 record × 2KB)
- <100ms delay (instant)
- 50x reduction in bandwidth
- 0 extra database queries
```

## AI Agent Progress Flow (Recommended)

```
USER ACTION                    BACKEND                        FRONTEND
────────────────────────────────────────────────────────────────────────

User: "Create escrow         AI Task Service
from CSV file"               creates taskId: task-001
     │
     │                       emit 'ai:task:started'
     │                       { taskId: 'task-001',
     │                         message: 'Starting import...' }
     │                               │
     │                               ▼
     │                       ┌───────────────────┐
     │                       │   User Room       │
     │                       │   (user-456)      │
     │                       └────────┬──────────┘
     │                                │
     ▼                                ▼
┌───────────────────────┐   ┌─────────────────────────┐
│  User's Browser       │   │  AITaskProgress.jsx     │
│                       │   │                         │
│  websocket.service    │   │  [🤖 Importing CSV]     │
│  receives event       │   │  ░░░░░░░░░░░░░░░░ 0%   │
│                       │   │  Starting import...     │
└───────────────────────┘   └─────────────────────────┘
         │
         │ Backend processes CSV
         │
         │ emit 'ai:task:progress' (10%)
         │ { taskId: 'task-001',
         │   progress: 10,
         │   message: 'Validating addresses...' }
         │
         ▼
┌─────────────────────────┐
│  AITaskProgress.jsx     │
│                         │
│  [🤖 Importing CSV]     │
│  ██░░░░░░░░░░░░░░ 10%   │
│  Validating addresses...│
└─────────────────────────┘
         │
         │ Backend creates escrows
         │
         │ emit 'ai:task:progress' (50%)
         │ { taskId: 'task-001',
         │   progress: 50,
         │   message: 'Creating escrow 5/10...' }
         │
         ▼
┌─────────────────────────┐
│  AITaskProgress.jsx     │
│                         │
│  [🤖 Importing CSV]     │
│  ██████████░░░░░░ 50%   │
│  Creating escrow 5/10...│
└─────────────────────────┘
         │
         │ Backend finishes
         │
         │ emit 'ai:task:completed'
         │ { taskId: 'task-001',
         │   result: { created: 10 },
         │   message: 'Imported 10 escrows!' }
         │
         ▼
┌─────────────────────────┐
│  AITaskProgress.jsx     │
│                         │
│  [✅ Import Complete]   │
│  ████████████████ 100%  │
│  Imported 10 escrows!   │
│  (auto-dismiss in 3s)   │
└─────────────────────────┘
```

## Multi-User Collaboration (Phase 4)

```
┌─────────────────────────────────────────────────────────────────┐
│                           SCENARIO                              │
│  User A and User B are both viewing Escrows Dashboard          │
│  User A clicks "Edit" on ESC-2025-001                          │
└─────────────────────────────────────────────────────────────────┘

USER A (Desktop)              BACKEND                 USER B (Mobile)
────────────────────────────────────────────────────────────────────

Click "Edit"                 emit 'escrow:locked'
ESC-2025-001                 { escrowId: '123',
     │                         lockedBy: 'u-456',
     │                         lockedUntil: +5 min }
     │                               │
     │                       ┌───────▼─────────┐
     │                       │   Team Room     │
     │                       └───────┬─────────┘
     │                               │
     ▼                               ▼
┌───────────────┐           ┌──────────────────────┐
│ Edit Modal    │           │ Dashboard            │
│ Opens         │           │ Shows banner:        │
│               │           │                      │
│ [Save] [Cancel]│          │ ⚠️ "Jayden is        │
│               │           │    editing this      │
│               │           │    escrow"           │
└───────────────┘           │                      │
     │                      │ [View Only] button   │
     │                      └──────────────────────┘
     │
     │ User A saves
     │
     ▼
API POST                     emit 'escrow:updated'
/escrows/123                 { escrowId: '123',
                               changes: {...},
                               updatedBy: 'u-456' }
     │                               │
     │                       ┌───────▼─────────┐
     │                       │   Team Room     │
     │                       └───────┬─────────┘
     │                               │
     ▼                               ▼
┌───────────────┐           ┌──────────────────────┐
│ Modal Closes  │           │ Dashboard            │
│               │           │ Updates escrow card  │
│ Shows success │           │ (new data)           │
│ toast         │           │                      │
└───────────────┘           │ Banner disappears    │
                            └──────────────────────┘
```

## Connection States

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONNECTION LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────┘

STATE 1: DISCONNECTED
┌──────────────────────────────────────┐
│  Navigation Bar                      │
│  ┌─────────────────────────────────┐ │
│  │  Real Estate CRM    🔴 Offline  │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
- WebSocket not connected
- Messages queued locally
- User sees red badge


STATE 2: CONNECTING / RECONNECTING
┌──────────────────────────────────────┐
│  Navigation Bar                      │
│  ┌─────────────────────────────────┐ │
│  │  Real Estate CRM  🟡 Connecting │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
- Attempting to connect
- Auto-retry with exponential backoff
- User sees yellow badge


STATE 3: CONNECTED
┌──────────────────────────────────────┐
│  Navigation Bar                      │
│  ┌─────────────────────────────────┐ │
│  │  Real Estate CRM  🟢 Connected  │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
- WebSocket connected
- Real-time sync active
- Queued messages sent
- User sees green badge


STATE 4: CONNECTION ERROR (Retry Exhausted)
┌──────────────────────────────────────┐
│  Navigation Bar                      │
│  ┌─────────────────────────────────┐ │
│  │  Real Estate CRM  ⚠️ Error      │ │
│  │  [Retry Connection]              │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
- All retry attempts failed
- User must manually retry
- Alert shown with [Retry] button
```

## Scalability: Single Server vs. Clustered (Phase 5)

### Single Server (Current - Handles 10-100 users)

```
┌────────────────────────────────────────┐
│       Frontend Clients (100)           │
│  Browser 1, Browser 2, ... Browser 100 │
└────────────┬───────────────────────────┘
             │
             │ WebSocket connections
             │
┌────────────▼───────────────────────────┐
│       Railway Backend Server           │
│       (Single Node.js process)         │
│  - Socket.IO server                    │
│  - In-memory room state                │
│  - Max ~1,000 connections              │
└────────────┬───────────────────────────┘
             │
             │ Database queries
             │
┌────────────▼───────────────────────────┐
│       PostgreSQL Database              │
│       (Railway)                        │
└────────────────────────────────────────┘

BOTTLENECK: Single process saturates at ~1,000 connections
```

### Clustered with Redis (Phase 5 - Handles 10,000+ users)

```
┌────────────────────────────────────────┐
│       Frontend Clients (10,000)        │
│  Browser 1, Browser 2, ... Browser N   │
└────────────┬───────────────────────────┘
             │
             │ WebSocket connections
             │ (load balanced with sticky sessions)
             │
┌────────────▼───────────────────────────┐
│       Load Balancer (Nginx)            │
│       - IP hash (sticky sessions)      │
│       - WebSocket upgrade support      │
└───────┬────────────────────┬───────────┘
        │                    │
   ┌────▼────┐          ┌────▼────┐
   │ Backend │          │ Backend │          More servers...
   │ Server 1│◄────────►│ Server 2│◄────────► [Server 3-5]
   │ 2,000   │  Redis   │ 2,000   │
   │ users   │  Pub/Sub │ users   │
   └────┬────┘          └────┬────┘
        │                    │
        └────────┬───────────┘
                 │
                 │ Database queries
                 │
┌────────────────▼────────────────────────┐
│       PostgreSQL Database               │
│       (Railway)                         │
└─────────────────────────────────────────┘

KEY COMPONENTS:
- Redis pub/sub: Share events between servers
- Sticky sessions: Same user → same server
- Horizontal scaling: Add more servers as needed

CAPACITY:
- 5 servers × 2,000 connections = 10,000 users
- Add more servers to scale further
```

## Event Naming Convention

### Current (Generic)
```javascript
'data:update'  // Too vague - all entities use this
'notification' // What type of notification?
'message'      // Message from who/what?
```

### Recommended (Specific)
```javascript
// Data events (CRUD)
'escrow:created'
'escrow:updated'
'escrow:deleted'
'escrow:archived'
'escrow:restored'

'listing:created'
'listing:updated'
'listing:sold'

'client:created'
'client:updated'

// AI events
'ai:task:started'
'ai:task:progress'
'ai:task:completed'
'ai:task:failed'
'ai:task:cancelled'

// Collaboration events
'user:presence:online'
'user:presence:offline'
'user:presence:away'

'escrow:locked'
'escrow:unlocked'

'user:typing'
'user:stopped_typing'

// System events
'notification:info'
'notification:warning'
'notification:error'
'notification:success'

'system:maintenance'
'system:broadcast'
```

**Benefits:**
- Easy to filter (`socket.on('escrow:*')`)
- Self-documenting code
- Better logging
- Follows industry standards (Slack, Discord)

---

## Recommended: Connection Status Badge Designs

### Option 1: Minimalist (Recommended)
```
┌─────────────────────────────────────┐
│  Real Estate CRM           🟢 Live  │
└─────────────────────────────────────┘
```

### Option 2: Detailed
```
┌────────────────────────────────────────────────┐
│  Real Estate CRM    🟢 Connected • 3 online    │
└────────────────────────────────────────────────┘
```

### Option 3: Icon + Tooltip
```
┌─────────────────────────────────────┐
│  Real Estate CRM              [🟢]  │  ← Hover shows:
└─────────────────────────────────────┘     "Connected
                                             3 team members online
                                             Last sync: 2s ago"
```

---

## Summary: What Needs to Change

### Priority 1: Enable Real-Time for All Modules
```diff
// listings.controller.js
exports.createListing = async (req, res) => {
  const listing = await listingsService.create(req.body);

+ // NEW: Broadcast to team
+ websocketService.sendToTeam(req.user.teamId, 'data:update', {
+   entityType: 'listing',
+   entityId: listing.id,
+   action: 'create',
+   data: listing
+ });

  res.json({ success: true, data: listing });
};
```

### Priority 2: Add Connection Status
```diff
// Navigation.jsx
+ import { useWebSocket } from '../../hooks/useWebSocket';

const Navigation = () => {
+ const { connectionStatus } = useWebSocket();

  return (
    <AppBar>
      <Toolbar>
        <Typography variant="h6">Real Estate CRM</Typography>
+       <Chip
+         label={connectionStatus === 'connected' ? 'Connected' : 'Offline'}
+         color={connectionStatus === 'connected' ? 'success' : 'error'}
+         icon={<span>{connectionStatus === 'connected' ? '🟢' : '🔴'}</span>}
+       />
      </Toolbar>
    </AppBar>
  );
};
```

### Priority 3: Implement AI Progress
```diff
// New file: backend/src/services/aiTask.service.js
+ class AITaskService {
+   async executeTask(userId, taskType, params) {
+     const taskId = uuidv4();
+
+     websocketService.sendToUser(userId, 'ai:task:started', {
+       taskId, message: 'Starting task...'
+     });
+
+     // ... perform work with progress callbacks ...
+
+     websocketService.sendToUser(userId, 'ai:task:completed', {
+       taskId, result: data
+     });
+   }
+ }
```

```diff
// New file: frontend/src/components/common/AITaskProgress.jsx
+ const AITaskProgress = () => {
+   const [tasks, setTasks] = useState([]);
+
+   useEffect(() => {
+     websocketService.on('ai:task:progress', (data) => {
+       setTasks(prev => prev.map(t =>
+         t.taskId === data.taskId ? { ...t, progress: data.progress } : t
+       ));
+     });
+   }, []);
+
+   return (
+     <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
+       {tasks.map(task => (
+         <Card key={task.taskId}>
+           <LinearProgress value={task.progress} />
+         </Card>
+       ))}
+     </Box>
+   );
+ };
```

---

**End of Diagrams**
