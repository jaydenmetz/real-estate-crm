# Project-102: Scaling Configuration

**Phase**: H | **Priority**: HIGH | **Status**: Not Started
**Est**: 10 hrs + 3 hrs = 13 hrs | **Deps**: Project 98
**MILESTONE**: None

## 🎯 Goal
Configure auto-scaling, load balancing, and scaling triggers for handling variable load.

## 📋 Current → Target
**Now**: Single instance, manual scaling
**Target**: Auto-scaling based on metrics, load balancing, horizontal scaling, resource optimization
**Success Metric**: Auto-scale from 1-10 instances based on load, <5 second scale-up time, handle 10,000+ concurrent users

## 📖 Context
Currently running single instance that could be overwhelmed by traffic spikes. Need auto-scaling to handle variable load, maintain performance during peak times, and optimize costs during low usage.

Key features: Railway auto-scaling configuration, scaling triggers based on CPU/memory/requests, load balancing, horizontal scaling, and resource monitoring.

## ⚠️ Risk Assessment

### Technical Risks
- **Scaling Delays**: Slow scale-up causing outages
- **Scaling Oscillation**: Rapid scale up/down (flapping)
- **State Issues**: Session/WebSocket state with multiple instances
- **Database Connections**: Connection pool exhaustion

### Business Risks
- **Cost Overruns**: Over-scaling increasing bills
- **Performance**: Under-scaling causing slowdowns
- **Downtime**: Scaling issues causing outages
- **User Experience**: Inconsistent performance

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-102-scaling-$(date +%Y%m%d)
git push origin pre-project-102-scaling-$(date +%Y%m%d)

# Document current Railway configuration
railway status > backup-railway-config-$(date +%Y%m%d).txt
```

### If Things Break
```bash
# Revert to single instance
railway scale set replicas=1

# Rollback code changes
git checkout pre-project-102-scaling-YYYYMMDD
git push origin main
```

## ✅ Tasks

### Planning (2 hours)
- [ ] Analyze current resource usage patterns
- [ ] Define scaling triggers and thresholds
- [ ] Plan for stateful components (WebSocket, sessions)
- [ ] Calculate cost implications
- [ ] Design load balancing strategy

### Implementation (6 hours)
- [ ] **Scaling Configuration** (2.5 hours):
  - [ ] Configure Railway auto-scaling settings
  - [ ] Set min/max replica count (1-10)
  - [ ] Define CPU threshold (70% for scale-up)
  - [ ] Define memory threshold (80% for scale-up)
  - [ ] Set scale-up/down cooldown periods
  - [ ] Configure load balancing (round-robin)

- [ ] **Stateless Refactoring** (2.5 hours):
  - [ ] Move sessions to Redis/database
  - [ ] Configure sticky sessions for WebSocket
  - [ ] Externalize caching (if using in-memory)
  - [ ] Update health check for load balancer
  - [ ] Test multi-instance deployment

- [ ] **Resource Optimization** (1 hour):
  - [ ] Optimize database connection pooling
  - [ ] Configure graceful shutdown
  - [ ] Set resource limits per instance
  - [ ] Add scaling metrics to monitoring

### Testing (2 hours)
- [ ] Test single instance (baseline)
- [ ] Test 2 instances (load balancing)
- [ ] Test auto scale-up (load test)
- [ ] Test auto scale-down
- [ ] Test WebSocket with multiple instances
- [ ] Test session persistence

### Documentation (1 hour)
- [ ] Document scaling configuration
- [ ] Create scaling troubleshooting guide
- [ ] Document cost implications
- [ ] Document stateful component handling

## 🧪 Verification Tests

### Test 1: Load Balancing
```bash
# Deploy with 2 instances
railway scale set replicas=2

# Make 100 requests
for i in {1..100}; do
  curl https://api.jaydenmetz.com/v1/health
done

# Check logs from both instances
# Expected: Requests distributed across both instances
```

### Test 2: Auto Scale-Up
```bash
# Load test to trigger scaling
ab -n 10000 -c 100 https://api.jaydenmetz.com/v1/escrows

# Monitor scaling
railway status --watch

# Expected: Scales from 1 to 2+ instances when CPU >70%
```

### Test 3: Session Persistence
```bash
# Login and get session
TOKEN=$(curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq -r '.token')

# Make 10 authenticated requests
for i in {1..10}; do
  curl -H "Authorization: Bearer $TOKEN" https://api.jaydenmetz.com/v1/user/profile
done

# Expected: All requests succeed (session works across instances)
```

## 📝 Implementation Notes

### Railway Auto-Scaling Configuration
```json
// railway.json
{
  "scaling": {
    "min_replicas": 1,
    "max_replicas": 10,
    "metrics": {
      "cpu": {
        "target": 70,
        "type": "average"
      },
      "memory": {
        "target": 80,
        "type": "average"
      }
    },
    "cooldown": {
      "scale_up": 60,    // seconds before next scale-up
      "scale_down": 300   // seconds before scale-down (longer to prevent flapping)
    }
  },
  "load_balancing": {
    "algorithm": "round_robin",
    "sticky_sessions": true,  // For WebSocket
    "health_check": {
      "path": "/health",
      "interval": 30,
      "timeout": 5,
      "unhealthy_threshold": 3
    }
  }
}
```

### Session Management with Redis
```javascript
// backend/src/config/session.js
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

// Create Redis client for session storage
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.connect().catch(console.error);

// Configure session middleware
const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

module.exports = { sessionMiddleware, redisClient };
```

### WebSocket with Sticky Sessions
```javascript
// backend/src/config/websocket.js
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

function setupWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
    // Enable sticky sessions
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  // For multi-instance: Use Redis adapter
  if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ WebSocket Redis adapter configured');
    });
  }

  return io;
}

module.exports = { setupWebSocket };
```

### Database Connection Pooling
```javascript
// backend/src/config/database.js
const { Pool } = require('pg');

// Calculate pool size based on replica count
const REPLICA_COUNT = parseInt(process.env.RAILWAY_REPLICA_NUM || '1');
const MAX_CONNECTIONS = 100; // PostgreSQL connection limit
const CONNECTIONS_PER_REPLICA = Math.floor(MAX_CONNECTIONS / REPLICA_COUNT);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: CONNECTIONS_PER_REPLICA,  // Divide connections across replicas
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, draining connection pool...');
  await pool.end();
  process.exit(0);
});

module.exports = pool;
```

### Graceful Shutdown Handler
```javascript
// backend/src/server.js
const gracefulShutdown = () => {
  console.log('Graceful shutdown initiated...');

  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');

    // Close database connections
    pool.end(() => {
      console.log('Database pool drained');

      // Close Redis connections
      redisClient.quit(() => {
        console.log('Redis client closed');

        // Exit process
        process.exit(0);
      });
    });
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### Scaling Triggers

**Scale-Up Triggers** (Add replica):
- CPU utilization >70% for 1 minute
- Memory utilization >80% for 1 minute
- Request queue >100 for 30 seconds
- Response time P95 >2s for 2 minutes

**Scale-Down Triggers** (Remove replica):
- CPU utilization <30% for 5 minutes
- Memory utilization <40% for 5 minutes
- Request queue <10 for 5 minutes
- Response time P95 <500ms for 5 minutes

**Cooldown Periods**:
- Scale-up: 60 seconds (fast response to load)
- Scale-down: 300 seconds (prevent flapping)

### Cost Estimation

**Single Instance** (Baseline):
- Railway Pro: $20/month
- Database: $10/month
- Redis: $10/month
- **Total**: $40/month

**Auto-Scaling (Average)** (2-3 replicas average):
- Railway Pro: $40-60/month
- Database: $10/month
- Redis: $10/month
- **Total**: $60-80/month

**Peak Load** (10 replicas):
- Railway Pro: $200/month
- Database: $10/month
- Redis: $10/month
- **Total**: $220/month

**Optimization**: Scale down to 1 instance during off-hours (nights, weekends) to save costs.

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Test scaling locally with multiple processes
- [ ] Document scaling configuration
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-102**:
- Scaling: Automated based on metrics
- Load handling: 10,000+ concurrent users
- Availability: Multi-instance redundancy
- Cost optimization: Scale down during low usage

## 🔗 Dependencies

### Depends On
- Project-98 (Monitoring Setup - needs metrics for scaling triggers)

### Blocks
- Project-103 (CDN Implementation - works with scaled infrastructure)

### Parallel Work
- Can work alongside Projects 99-101 (logging/errors/backups)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-98 complete (monitoring provides scaling metrics)
- ✅ Redis available for session storage
- ✅ Load testing tools ready
- ✅ Budget approved for additional instances

### Should Skip If:
- ❌ Traffic doesn't justify multi-instance setup
- ❌ Using serverless platform (auto-scales differently)

### Optimal Timing:
- After Project-98 (monitoring infrastructure)
- Before production launch with expected high traffic

## ✅ Success Criteria
- [ ] Auto-scaling configured (1-10 replicas)
- [ ] Load balancing working
- [ ] Sessions work across instances
- [ ] WebSocket works with sticky sessions
- [ ] Database connections optimized
- [ ] Graceful shutdown implemented
- [ ] Scaling triggers tested
- [ ] Cost implications documented
- [ ] Handle 10,000+ concurrent users
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Test with 2 replicas in staging
- [ ] Verify session persistence
- [ ] Test WebSocket with load balancing
- [ ] Load test to trigger auto-scaling
- [ ] Measure baseline costs

### Post-Deployment Verification
- [ ] Monitor first 48 hours of scaling behavior
- [ ] Verify scaling triggers working
- [ ] Confirm no session issues
- [ ] Check WebSocket connections stable
- [ ] Monitor costs vs expected

### Rollback Triggers
- Scaling causing instability
- Session loss across instances
- WebSocket connection issues
- Costs exceeding budget by >50%

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Auto-scaling configured
- [ ] Load balancing working
- [ ] Sessions externalized
- [ ] WebSocket configured
- [ ] Connection pooling optimized
- [ ] Graceful shutdown working
- [ ] Scaling tested
- [ ] Documentation updated
- [ ] Cost tracking enabled

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
