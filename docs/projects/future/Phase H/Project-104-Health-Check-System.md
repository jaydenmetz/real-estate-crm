# Project-104: Health Check System

**Phase**: H | **Priority**: HIGH | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Projects 98, 100
**MILESTONE**: None

## 🎯 Goal
Implement comprehensive health check system with dependency checks, health dashboard, and integration with monitoring.

## 📋 Current → Target
**Now**: Basic /health endpoint returning 200 OK
**Target**: Comprehensive health checks for all dependencies, health dashboard, integration with load balancer and monitoring
**Success Metric**: All critical dependencies monitored, <30 second issue detection, health dashboard showing real-time status

## 📖 Context
Currently have minimal health check endpoint. Need comprehensive health monitoring that checks database connectivity, external API availability, queue status, and other critical dependencies. This enables proactive issue detection and informs load balancer health decisions.

Key features: Detailed health checks, dependency monitoring, health dashboard, graceful degradation, and integration with monitoring and alerting.

## ⚠️ Risk Assessment

### Technical Risks
- **Health Check Overhead**: Too many checks slowing system
- **False Negatives**: Missing actual issues
- **False Positives**: Marking healthy services unhealthy
- **Cascade Failures**: Health checks causing issues

### Business Risks
- **Downtime**: Missing critical dependency failures
- **User Impact**: Not detecting degraded performance
- **Alert Fatigue**: Too many health alerts
- **Load Balancer**: Incorrect health status removing healthy instances

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-104-health-$(date +%Y%m%d)
git push origin pre-project-104-health-$(date +%Y%m%d)

# Backup current health endpoint
cp backend/src/controllers/health.controller.js \
   archive/health.controller-$(date +%Y%m%d).js
```

### If Things Break
```bash
# Rollback health check changes
git checkout pre-project-104-health-YYYYMMDD -- backend/src/controllers/health.controller.js
git checkout pre-project-104-health-YYYYMMDD -- backend/src/middleware/health.middleware.js
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Identify all critical dependencies
- [ ] Define health check criteria
- [ ] Design health status levels (healthy/degraded/unhealthy)
- [ ] Plan health check frequency and timeouts
- [ ] Design health dashboard UI

### Implementation (5 hours)
- [ ] **Health Check Endpoints** (2.5 hours):
  - [ ] Enhance GET /v1/health (detailed checks)
  - [ ] Add GET /v1/health/liveness (simple alive check)
  - [ ] Add GET /v1/health/readiness (ready to serve traffic)
  - [ ] Add GET /v1/health/dependencies (all dependency status)
  - [ ] Implement database connection check
  - [ ] Implement Redis connection check (if using)
  - [ ] Implement external API checks (Stripe, Zillow, etc.)
  - [ ] Add disk space check
  - [ ] Add memory usage check

- [ ] **Health Dashboard** (1.5 hours):
  - [ ] Create health status page component
  - [ ] Display overall system status
  - [ ] Show individual dependency status
  - [ ] Add historical uptime metrics
  - [ ] Display current resource usage
  - [ ] Add status badge for public status page

- [ ] **Integration** (1 hour):
  - [ ] Integrate with monitoring (Project-98)
  - [ ] Integrate with error tracking (Project-100)
  - [ ] Configure load balancer health check
  - [ ] Add health metrics to dashboard
  - [ ] Set up health-based alerts

### Testing (1.5 hours)
- [ ] Test each health check individually
- [ ] Test with database down
- [ ] Test with Redis down (if applicable)
- [ ] Test with external API down
- [ ] Test load balancer health check integration
- [ ] Test health dashboard displays correctly

### Documentation (1 hour)
- [ ] Document health check system
- [ ] Create health troubleshooting guide
- [ ] Document health status levels
- [ ] Document integration with monitoring

## 🧪 Verification Tests

### Test 1: Healthy System
```bash
curl https://api.jaydenmetz.com/v1/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-11-02T14:23:45Z",
  "uptime": 86400,
  "checks": {
    "database": { "status": "healthy", "latency": "5ms" },
    "redis": { "status": "healthy", "latency": "2ms" },
    "stripe": { "status": "healthy", "latency": "150ms" },
    "disk": { "status": "healthy", "usage": "45%" },
    "memory": { "status": "healthy", "usage": "60%" }
  }
}
```

### Test 2: Degraded System
```bash
# Simulate slow database
# (temporarily add sleep to database query)

curl https://api.jaydenmetz.com/v1/health

# Expected response:
{
  "status": "degraded",
  "checks": {
    "database": { "status": "degraded", "latency": "1500ms", "warning": "High latency" },
    ...
  }
}
```

### Test 3: Unhealthy System
```bash
# Stop database
# (or use invalid DATABASE_URL temporarily)

curl https://api.jaydenmetz.com/v1/health

# Expected response: 503 Service Unavailable
{
  "status": "unhealthy",
  "checks": {
    "database": { "status": "unhealthy", "error": "Connection refused" },
    ...
  }
}
```

## 📝 Implementation Notes

### Health Check Controller
```javascript
// backend/src/controllers/health.controller.js
const pool = require('../config/database');
const redisClient = require('../config/redis');
const os = require('os');
const diskusage = require('diskusage');

// Health status levels
const STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
};

// Detailed health check
async function getHealth(req, res) {
  const startTime = Date.now();
  const checks = {};
  let overallStatus = STATUS.HEALTHY;

  try {
    // Database check
    checks.database = await checkDatabase();
    if (checks.database.status === STATUS.UNHEALTHY) {
      overallStatus = STATUS.UNHEALTHY;
    } else if (checks.database.status === STATUS.DEGRADED) {
      overallStatus = STATUS.DEGRADED;
    }

    // Redis check (if using)
    if (process.env.REDIS_URL) {
      checks.redis = await checkRedis();
      if (checks.redis.status === STATUS.UNHEALTHY) {
        overallStatus = STATUS.UNHEALTHY;
      }
    }

    // External API checks (optional, can be slow)
    if (req.query.detailed === 'true') {
      checks.stripe = await checkStripe();
      checks.zillow = await checkZillow();
    }

    // System resource checks
    checks.disk = await checkDisk();
    checks.memory = checkMemory();

    if (checks.disk.status === STATUS.DEGRADED || checks.memory.status === STATUS.DEGRADED) {
      if (overallStatus === STATUS.HEALTHY) {
        overallStatus = STATUS.DEGRADED;
      }
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${Date.now() - startTime}ms`,
      checks,
    };

    const statusCode = overallStatus === STATUS.HEALTHY ? 200 :
                       overallStatus === STATUS.DEGRADED ? 200 : 503;

    res.status(statusCode).json(response);
  } catch (error) {
    res.status(503).json({
      status: STATUS.UNHEALTHY,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Simple liveness check (fast, for load balancer)
function getLiveness(req, res) {
  res.status(200).json({ status: 'alive' });
}

// Readiness check (ready to serve traffic)
async function getReadiness(req, res) {
  try {
    // Check database only (fast check)
    const dbCheck = await checkDatabase();

    if (dbCheck.status === STATUS.UNHEALTHY) {
      return res.status(503).json({
        status: 'not_ready',
        reason: 'Database unavailable',
      });
    }

    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
    });
  }
}

// Individual dependency checks
async function checkDatabase() {
  const startTime = Date.now();
  try {
    const result = await pool.query('SELECT 1');
    const latency = Date.now() - startTime;

    if (latency > 1000) {
      return {
        status: STATUS.DEGRADED,
        latency: `${latency}ms`,
        warning: 'High database latency',
      };
    }

    return {
      status: STATUS.HEALTHY,
      latency: `${latency}ms`,
      connections: pool.totalCount,
      idle: pool.idleCount,
    };
  } catch (error) {
    return {
      status: STATUS.UNHEALTHY,
      error: error.message,
    };
  }
}

async function checkRedis() {
  const startTime = Date.now();
  try {
    await redisClient.ping();
    const latency = Date.now() - startTime;

    return {
      status: latency > 500 ? STATUS.DEGRADED : STATUS.HEALTHY,
      latency: `${latency}ms`,
    };
  } catch (error) {
    return {
      status: STATUS.UNHEALTHY,
      error: error.message,
    };
  }
}

async function checkStripe() {
  // Optional: ping Stripe API
  try {
    const response = await fetch('https://api.stripe.com/v1/charges', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    return {
      status: response.ok ? STATUS.HEALTHY : STATUS.DEGRADED,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      status: STATUS.DEGRADED,
      error: 'Stripe API unreachable',
    };
  }
}

function checkMemory() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedPercent = ((totalMem - freeMem) / totalMem) * 100;

  return {
    status: usedPercent > 90 ? STATUS.DEGRADED : STATUS.HEALTHY,
    usage: `${usedPercent.toFixed(1)}%`,
    total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
    free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
  };
}

async function checkDisk() {
  try {
    const info = await diskusage.check('/');
    const usedPercent = (info.used / info.total) * 100;

    return {
      status: usedPercent > 90 ? STATUS.DEGRADED : STATUS.HEALTHY,
      usage: `${usedPercent.toFixed(1)}%`,
      total: `${(info.total / 1024 / 1024 / 1024).toFixed(2)}GB`,
      free: `${(info.free / 1024 / 1024 / 1024).toFixed(2)}GB`,
    };
  } catch (error) {
    return {
      status: STATUS.HEALTHY,
      note: 'Disk check not available',
    };
  }
}

module.exports = {
  getHealth,
  getLiveness,
  getReadiness,
};
```

### Health Routes
```javascript
// backend/src/routes/health.routes.js
const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

// Detailed health check
router.get('/', healthController.getHealth);

// Liveness probe (for Kubernetes/Railway)
router.get('/liveness', healthController.getLiveness);

// Readiness probe (for load balancer)
router.get('/readiness', healthController.getReadiness);

module.exports = router;
```

### Health Dashboard Component
```javascript
// frontend/src/components/health/HealthDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

function HealthDashboard() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchHealth() {
    try {
      const response = await fetch('/v1/health?detailed=true');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status) {
    if (status === 'healthy') return <CheckCircleIcon color="success" />;
    if (status === 'degraded') return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  }

  function getStatusColor(status) {
    if (status === 'healthy') return 'success';
    if (status === 'degraded') return 'warning';
    return 'error';
  }

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Health Status
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getStatusIcon(health.status)}
            <Typography variant="h5">
              Overall Status:{' '}
              <Chip
                label={health.status.toUpperCase()}
                color={getStatusColor(health.status)}
              />
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Last updated: {new Date(health.timestamp).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Uptime: {(health.uptime / 3600).toFixed(2)} hours
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {Object.entries(health.checks).map(([name, check]) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getStatusIcon(check.status)}
                  <Typography variant="h6">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                </Box>
                <Chip
                  label={check.status}
                  color={getStatusColor(check.status)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                {check.latency && (
                  <Typography variant="body2">Latency: {check.latency}</Typography>
                )}
                {check.usage && (
                  <Typography variant="body2">Usage: {check.usage}</Typography>
                )}
                {check.error && (
                  <Typography variant="body2" color="error">
                    Error: {check.error}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HealthDashboard;
```

### Load Balancer Configuration
```json
// Railway load balancer health check
{
  "health_check": {
    "path": "/v1/health/readiness",
    "interval": 30,
    "timeout": 5,
    "healthy_threshold": 2,
    "unhealthy_threshold": 3
  }
}
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Keep health checks fast (<5 seconds)
- [ ] Don't expose sensitive information in health endpoint
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-104**:
- Health monitoring: All critical dependencies checked
- Issue detection: <30 second detection time
- Load balancer integration: Automatic unhealthy instance removal
- Dashboard visibility: Real-time system status

## 🔗 Dependencies

### Depends On
- Project-98 (Monitoring Setup - integrates with monitoring)
- Project-100 (Error Tracking - integrates with error tracking)

### Blocks
- None (final infrastructure piece)

### Parallel Work
- Can work alongside Project-103 (CDN)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Projects 98, 100 complete (monitoring and error tracking ready)
- ✅ All critical dependencies identified
- ✅ Load balancer configuration accessible
- ✅ Health dashboard design approved

### Should Skip If:
- ❌ Simple uptime monitoring sufficient
- ❌ No load balancer (single instance)

### Optimal Timing:
- After monitoring and error tracking (98, 100)
- Before production launch

## ✅ Success Criteria
- [ ] Comprehensive health checks implemented
- [ ] Database connectivity monitored
- [ ] External API status tracked
- [ ] System resources monitored
- [ ] Health dashboard created
- [ ] Load balancer integration working
- [ ] Monitoring integration complete
- [ ] <30 second issue detection
- [ ] Documentation complete
- [ ] Health status public page (optional)

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Test health checks in staging
- [ ] Verify all dependencies checked
- [ ] Test with simulated failures
- [ ] Confirm load balancer integration
- [ ] Test health dashboard

### Post-Deployment Verification
- [ ] Monitor health endpoint first 24 hours
- [ ] Verify load balancer using health checks
- [ ] Confirm no false positives/negatives
- [ ] Check health dashboard accuracy
- [ ] Validate alert integration

### Rollback Triggers
- Health checks causing performance issues
- False positives removing healthy instances
- Health endpoint becoming bottleneck
- Dashboard showing incorrect status

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Health checks implemented
- [ ] All dependencies monitored
- [ ] Health dashboard created
- [ ] Load balancer configured
- [ ] Monitoring integrated
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Testing complete
- [ ] Production deployed

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
