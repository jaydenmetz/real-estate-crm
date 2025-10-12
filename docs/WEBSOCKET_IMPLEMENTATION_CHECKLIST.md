# WebSocket Implementation Checklist
**Quick Reference for Implementing Real-Time Sync and AI Agent Visibility**

---

## Phase 1: Critical Fixes (This Week - 12 hours)

### Day 1-2: Enable WebSocket for All Modules (8 hours)

#### Task 1.1: Add Events to listings.controller.js (2 hours)
- [ ] Import websocketService at top of file
- [ ] Add event emission to `createListing()` - emit on success
- [ ] Add event emission to `updateListing()` - emit on success
- [ ] Add event emission to `deleteListing()` - emit on success
- [ ] Test: Create listing in Browser A, verify appears in Browser B

**Code Template:**
```javascript
// At top of listings.controller.js
const websocketService = require('../services/websocket.service');

// In createListing function (after successful insert)
const eventData = {
  entityType: 'listing',
  entityId: listing.id,
  action: 'create',
  userId: req.user.id,
  teamId: req.user.teamId,
  data: listing
};
websocketService.sendToTeam(req.user.teamId, 'data:update', eventData);
websocketService.sendToUser(req.user.id, 'data:update', eventData);
```

#### Task 1.2: Add Events to clients.controller.js (2 hours)
- [ ] Import websocketService
- [ ] Add event emission to create/update/delete
- [ ] Test multi-user sync

#### Task 1.3: Add Events to appointments.controller.js (2 hours)
- [ ] Import websocketService
- [ ] Add event emission to create/update/delete
- [ ] Test multi-user sync

#### Task 1.4: Add Events to leads.controller.js (2 hours)
- [ ] Import websocketService
- [ ] Add event emission to create/update/delete
- [ ] Test multi-user sync

### Day 3: Add Connection Status Indicator (3 hours)

#### Task 2.1: Update Navigation Component (2 hours)
- [ ] Open `/frontend/src/components/common/Navigation.jsx`
- [ ] Import `useWebSocket` hook
- [ ] Add connection status badge to AppBar
- [ ] Style badge (green/yellow/red)
- [ ] Test by stopping backend server (should show "Reconnecting...")

**Code Template:**
```javascript
// In Navigation.jsx
import { useWebSocket } from '../../hooks/useWebSocket';
import { Chip } from '@mui/material';

const Navigation = () => {
  const { connectionStatus } = useWebSocket();

  const statusConfig = {
    connected: { label: 'Connected', color: 'success', icon: '🟢' },
    disconnected: { label: 'Offline', color: 'error', icon: '🔴' },
    reconnecting: { label: 'Reconnecting', color: 'warning', icon: '🟡' }
  };

  const status = statusConfig[connectionStatus] || statusConfig.disconnected;

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6">Real Estate CRM</Typography>
        <Box sx={{ ml: 'auto' }}>
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            icon={<span>{status.icon}</span>}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
```

#### Task 2.2: Add Sentry Logging for Connection Failures (1 hour)
- [ ] Open `/frontend/src/services/websocket.service.js`
- [ ] Add Sentry breadcrumb on connection error
- [ ] Add Sentry error capture on max retries exceeded
- [ ] Test by forcing connection failure

**Code Template:**
```javascript
// In websocket.service.js connect() method
this.socket.on('connect_error', (error) => {
  Sentry.addBreadcrumb({
    category: 'websocket',
    message: 'Connection error',
    level: 'error',
    data: { error: error.message, attempts: this.reconnectAttempts }
  });

  if (this.reconnectAttempts >= this.maxReconnectAttempts) {
    Sentry.captureException(new Error('WebSocket max retries exceeded'));
  }
});
```

### Day 4: Testing & Verification (1 hour)

#### Task 3.1: Multi-User Testing
- [ ] Open 2 browsers (different users, same team)
- [ ] Test escrows sync (create/update/delete in Browser A, verify in Browser B)
- [ ] Test listings sync
- [ ] Test clients sync
- [ ] Test appointments sync
- [ ] Test leads sync
- [ ] Verify connection status badge works

#### Task 3.2: Connection Resilience Testing
- [ ] Stop backend server while frontend running
- [ ] Verify "Reconnecting..." badge appears
- [ ] Verify messages queued (create escrow while offline)
- [ ] Start backend server
- [ ] Verify "Connected" badge appears
- [ ] Verify queued messages sent

**Success Criteria:**
- ✅ All 5 modules broadcast WebSocket events
- ✅ Team members see each other's changes within 1 second
- ✅ Connection status visible in UI
- ✅ No console errors

---

## Phase 2: Incremental Updates (Week 2-3 - 20 hours)

### Task 1: Change Event Structure (4 hours)

#### Backend Changes
- [ ] Update `escrows.controller.js` - emit `escrow:created` instead of `data:update`
- [ ] Update `escrows.controller.js` - emit `escrow:updated` instead of `data:update`
- [ ] Update `escrows.controller.js` - emit `escrow:deleted` instead of `data:update`
- [ ] Repeat for listings, clients, appointments, leads

#### Frontend Changes
- [ ] Update `useWebSocket.js` - listen for specific events
- [ ] Update event handlers to use `escrow:created`, `escrow:updated`, etc.

### Task 2: Implement Cache Patching (6 hours)

- [ ] Open `/frontend/src/hooks/useWebSocket.js`
- [ ] Replace `invalidateQueries` with `setQueryData`
- [ ] Implement record patching logic
- [ ] Test with 50+ records

**Code Template:**
```javascript
// In useWebSocket.js
websocketService.on('escrow:updated', (data) => {
  queryClient.setQueryData(['escrows'], (oldData) => {
    if (!oldData?.data) return oldData;

    return {
      ...oldData,
      data: oldData.data.map(escrow =>
        escrow.id === data.escrowId
          ? { ...escrow, ...data.changes }  // Merge changes
          : escrow
      )
    };
  });
});

websocketService.on('escrow:created', (data) => {
  queryClient.setQueryData(['escrows'], (oldData) => {
    if (!oldData?.data) return oldData;

    return {
      ...oldData,
      data: [data.escrow, ...oldData.data]  // Prepend new escrow
    };
  });
});

websocketService.on('escrow:deleted', (data) => {
  queryClient.setQueryData(['escrows'], (oldData) => {
    if (!oldData?.data) return oldData;

    return {
      ...oldData,
      data: oldData.data.filter(e => e.id !== data.escrowId)  // Remove
    };
  });
});
```

### Task 3: Add Optimistic Mutations (8 hours)

#### Archive Escrow (2 hours)
- [ ] Open `EscrowsDashboard.jsx`
- [ ] Convert archive function to useMutation
- [ ] Add optimistic update (remove from list immediately)
- [ ] Add rollback on error
- [ ] Test: Archive escrow, see instant removal, verify API success

#### Mark Appointment Complete (2 hours)
- [ ] Open `AppointmentsDashboard.jsx`
- [ ] Convert complete function to useMutation
- [ ] Add optimistic update
- [ ] Test

#### Update Lead Status (2 hours)
- [ ] Open `LeadsDashboard.jsx`
- [ ] Convert status update to useMutation
- [ ] Add optimistic update
- [ ] Test

#### Create Note (2 hours)
- [ ] Create useMutation for note creation
- [ ] Add optimistic update
- [ ] Test

**Code Template:**
```javascript
const archiveMutation = useMutation(
  (escrowId) => escrowsAPI.archive(escrowId),
  {
    onMutate: async (escrowId) => {
      await queryClient.cancelQueries(['escrows']);
      const previousData = queryClient.getQueryData(['escrows']);

      queryClient.setQueryData(['escrows'], (old) => ({
        ...old,
        data: old.data.filter(e => e.id !== escrowId)
      }));

      return { previousData };
    },
    onError: (err, escrowId, context) => {
      queryClient.setQueryData(['escrows'], context.previousData);
      toast.error('Failed to archive escrow');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['escrows']);
      toast.success('Escrow archived');
    }
  }
);
```

### Task 4: Performance Testing (2 hours)

- [ ] Measure network traffic before/after (use Chrome DevTools Network tab)
- [ ] Measure UI update latency (use React DevTools Profiler)
- [ ] Test with 100+ records
- [ ] Document improvements

**Success Criteria:**
- ✅ Single record update → 2KB network traffic (not 100KB)
- ✅ UI updates within 50ms of WebSocket event
- ✅ Optimistic updates feel instant (<100ms)

---

## Phase 3: AI Agent Visibility (Week 4-6 - 40 hours)

### Task 1: Create AITaskService (8 hours)

- [ ] Create `/backend/src/services/aiTask.service.js`
- [ ] Implement `executeTask()` method
- [ ] Add progress callback support
- [ ] Emit WebSocket events at each step
- [ ] Add error handling

**File Template:**
```javascript
// backend/src/services/aiTask.service.js
const { v4: uuidv4 } = require('uuid');
const websocketService = require('./websocket.service');

class AITaskService {
  async executeTask(userId, taskType, params) {
    const taskId = uuidv4();

    // Step 1: Notify task started
    websocketService.sendToUser(userId, 'ai:task:started', {
      taskId,
      taskType,
      message: 'Starting task...',
      timestamp: new Date()
    });

    try {
      let result;

      switch (taskType) {
        case 'create_escrow':
          result = await this.createEscrowWithAI(userId, params);
          break;
        case 'import_csv':
          result = await this.importCSVWithAI(userId, params);
          break;
        default:
          throw new Error(`Unknown task type: ${taskType}`);
      }

      // Step 2: Notify completion
      websocketService.sendToUser(userId, 'ai:task:completed', {
        taskId,
        result,
        message: 'Task completed successfully!',
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      // Step 3: Notify failure
      websocketService.sendToUser(userId, 'ai:task:failed', {
        taskId,
        error: error.message,
        timestamp: new Date()
      });
      throw error;
    }
  }

  async createEscrowWithAI(userId, params) {
    const taskId = params.taskId;

    this.sendProgress(userId, taskId, 10, 'Analyzing property address...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.sendProgress(userId, taskId, 30, 'Fetching comparable sales...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.sendProgress(userId, taskId, 50, 'Calculating commission...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.sendProgress(userId, taskId, 70, 'Creating escrow record...');
    const escrow = { id: '123', address: params.address };

    this.sendProgress(userId, taskId, 90, 'Notifying team members...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.sendProgress(userId, taskId, 100, 'Complete!');

    return escrow;
  }

  sendProgress(userId, taskId, percent, message) {
    websocketService.sendToUser(userId, 'ai:task:progress', {
      taskId,
      progress: percent,
      message,
      timestamp: new Date()
    });
  }
}

module.exports = new AITaskService();
```

### Task 2: Create AITaskProgress Component (8 hours)

- [ ] Create `/frontend/src/components/common/AITaskProgress.jsx`
- [ ] Listen for AI task events
- [ ] Show progress bar
- [ ] Auto-dismiss on completion
- [ ] Handle errors

**File Template:**
```javascript
// frontend/src/components/common/AITaskProgress.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, LinearProgress, Alert, IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import websocketService from '../../services/websocket.service';

const AITaskProgress = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const unsubscribe = [
      websocketService.on('ai:task:started', (data) => {
        setTasks(prev => [...prev, {
          taskId: data.taskId,
          status: 'running',
          progress: 0,
          message: data.message,
          taskType: data.taskType
        }]);
      }),

      websocketService.on('ai:task:progress', (data) => {
        setTasks(prev => prev.map(task =>
          task.taskId === data.taskId
            ? { ...task, progress: data.progress, message: data.message }
            : task
        ));
      }),

      websocketService.on('ai:task:completed', (data) => {
        setTasks(prev => prev.map(task =>
          task.taskId === data.taskId
            ? { ...task, status: 'completed', progress: 100, message: data.message }
            : task
        ));

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          setTasks(prev => prev.filter(t => t.taskId !== data.taskId));
        }, 3000);
      }),

      websocketService.on('ai:task:failed', (data) => {
        setTasks(prev => prev.map(task =>
          task.taskId === data.taskId
            ? { ...task, status: 'failed', error: data.error }
            : task
        ));
      })
    ];

    return () => unsubscribe.forEach(fn => fn());
  }, []);

  const handleDismiss = (taskId) => {
    setTasks(prev => prev.filter(t => t.taskId !== taskId));
  };

  if (tasks.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 350,
        maxWidth: '90vw',
        zIndex: 9999
      }}
    >
      {tasks.map(task => (
        <Card key={task.taskId} sx={{ mb: 1, boxShadow: 3 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight={600}>
                {task.status === 'completed' && '✅ '}
                {task.status === 'failed' && '❌ '}
                {task.status === 'running' && '🤖 '}
                AI Task
              </Typography>
              <IconButton size="small" onClick={() => handleDismiss(task.taskId)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              {task.message}
            </Typography>

            {task.status === 'running' && (
              <LinearProgress
                variant="determinate"
                value={task.progress}
                sx={{ height: 6, borderRadius: 1 }}
              />
            )}

            {task.status === 'failed' && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {task.error}
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default AITaskProgress;
```

### Task 3: Add AITaskProgress to App.jsx (1 hour)

- [ ] Import AITaskProgress component
- [ ] Add to render tree (after routes)
- [ ] Test by triggering AI task

```javascript
// In App.jsx
import AITaskProgress from './components/common/AITaskProgress';

function App() {
  return (
    <>
      {/* ... existing routes ... */}
      <AITaskProgress />
    </>
  );
}
```

### Task 4: Test AI Progress (4 hours)

- [ ] Create test endpoint to trigger AI task
- [ ] Test progress updates
- [ ] Test error handling
- [ ] Test auto-dismiss
- [ ] Test multiple simultaneous tasks

**Test Endpoint:**
```javascript
// backend/src/routes/ai.routes.js
router.post('/test-ai-task', authenticate, async (req, res) => {
  const result = await aiTaskService.executeTask(
    req.user.id,
    'create_escrow',
    { address: '123 Test St', taskId: 'test-001' }
  );
  res.json({ success: true, data: result });
});
```

---

## Testing Checklist

### Functional Testing
- [ ] **Multi-User Sync**: 2 browsers, same team, create/update/delete in one, see in other
- [ ] **Connection Status**: Stop server, see "Reconnecting", start server, see "Connected"
- [ ] **Offline Queue**: Disconnect network, create item, reconnect, item created
- [ ] **AI Progress**: Trigger AI task, see progress bar update every 2-3s
- [ ] **Optimistic Updates**: Archive item, see instant removal, verify no API refetch
- [ ] **Error Handling**: Force API error, verify rollback and error message

### Performance Testing
- [ ] **Network Traffic**: Measure before/after with Chrome DevTools (target: 50x reduction)
- [ ] **UI Latency**: Measure with React DevTools Profiler (target: <100ms)
- [ ] **Large Dataset**: Test with 100+ records (no lag)
- [ ] **Concurrent Users**: 10 users simultaneously creating/updating (no conflicts)

### Security Testing
- [ ] **Authentication**: Verify unauthenticated socket rejected
- [ ] **Authorization**: Verify user can't join other team's rooms
- [ ] **Token Expiration**: Connect for 8 hours, verify auto-reconnect with new token
- [ ] **Message Rate Limit**: Send 100 messages/second, verify rate limiting

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Deployment Checklist

### Before Deploying
- [ ] All tests passing
- [ ] No console errors in frontend
- [ ] No errors in backend logs
- [ ] Performance benchmarks met
- [ ] Security audit passed

### Deployment Steps
- [ ] Commit changes to git
- [ ] Push to GitHub (triggers Railway auto-deploy)
- [ ] Monitor Railway deployment logs
- [ ] Verify deployment successful
- [ ] Test in production (create escrow, verify sync)
- [ ] Monitor Sentry for errors (first 24 hours)

### Rollback Plan
If issues occur:
- [ ] Revert git commit: `git revert HEAD`
- [ ] Push to GitHub: `git push origin main`
- [ ] Railway auto-deploys previous version
- [ ] Verify production working

### Post-Deployment
- [ ] Monitor WebSocket connection count (Railway logs)
- [ ] Monitor Sentry for new errors
- [ ] Check user feedback (any sync issues?)
- [ ] Document any issues for future improvements

---

## Maintenance Checklist (Monthly)

### Performance Monitoring
- [ ] Check WebSocket connection count (should be <1000 on single server)
- [ ] Check message throughput (should be <100/sec)
- [ ] Check average message latency (should be <100ms)
- [ ] Check error rate (should be <1%)

### Security Audit
- [ ] Review Sentry logs for WebSocket errors
- [ ] Check for unauthorized connection attempts
- [ ] Verify rate limiting working
- [ ] Update dependencies (security patches)

### User Feedback
- [ ] Survey team on real-time sync (working well?)
- [ ] Check for feature requests (what's missing?)
- [ ] Identify pain points (where is it slow?)

---

## Quick Reference: Common Commands

### Backend Development
```bash
cd backend
npm run dev                    # Start dev server
npm test                       # Run tests
npm run lint                   # Check code style
```

### Frontend Development
```bash
cd frontend
npm start                      # Start dev server
npm run build                  # Build for production
npm test                       # Run tests
```

### Testing WebSocket
```bash
# Test connection from command line
wscat -c wss://api.jaydenmetz.com \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send test message
> {"event":"data:update","data":{"test":true}}
```

### Debugging WebSocket
```javascript
// Frontend: Log all WebSocket events
websocketService.socket.onAny((event, data) => {
  console.log('WebSocket event:', event, data);
});

// Backend: Log all connections
websocketService.io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, socket.userId);
});
```

---

## Resources

### Documentation
- [Main Analysis Report](/Users/jaydenmetz/Desktop/real-estate-crm/docs/WEBSOCKET_IMPLEMENTATION_ANALYSIS.md)
- [Architecture Diagrams](/Users/jaydenmetz/Desktop/real-estate-crm/docs/WEBSOCKET_ARCHITECTURE_DIAGRAM.md)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [React Query Docs](https://tanstack.com/query/latest)

### Code Files
- Backend Service: `/backend/src/services/websocket.service.js`
- Frontend Service: `/frontend/src/services/websocket.service.js`
- useWebSocket Hook: `/frontend/src/hooks/useWebSocket.js`
- Escrows Controller: `/backend/src/controllers/escrows.controller.js`

### Contact
- **Questions?** Check CLAUDE.md for project guidelines
- **Bugs?** Check Sentry dashboard
- **Deploy Issues?** Check Railway logs at railway.app

---

**Last Updated:** October 11, 2025
