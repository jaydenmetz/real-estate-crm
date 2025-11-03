# Project-98: Monitoring Setup

**Phase**: H | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 10 hrs + 3 hrs = 13 hrs | **Deps**: Project 97
**MILESTONE**: None

## 🎯 Goal
Implement comprehensive monitoring with metrics collection, dashboards, and alerting.

## 📋 Current → Target
**Now**: Basic Railway metrics, health check endpoint exists
**Target**: Full monitoring stack with APM, custom dashboards, business metrics, proactive alerts
**Success Metric**: <5 minute incident detection, 99.9% uptime visibility, comprehensive dashboards for all key metrics

## 📖 Context
Currently have minimal monitoring—just Railway's built-in metrics and a health check endpoint. Need comprehensive monitoring to detect issues before users report them, track system performance, and make data-driven optimization decisions.

Key features: Application Performance Monitoring (APM), infrastructure metrics, custom business metrics, real-time dashboards, and intelligent alerting.

## ⚠️ Risk Assessment

### Technical Risks
- **Alert Fatigue**: Too many false positive alerts
- **Monitoring Overhead**: Performance impact from instrumentation
- **Data Storage**: High metrics data volume costs
- **Integration Complexity**: Multiple monitoring tools

### Business Risks
- **Missed Incidents**: Monitoring gaps leaving issues undetected
- **Alert Delays**: Slow detection causing extended outages
- **Cost Overruns**: Expensive monitoring service bills
- **False Confidence**: Metrics showing green while users suffer

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-98-monitoring-$(date +%Y%m%d)
git push origin pre-project-98-monitoring-$(date +%Y%m%d)

# Document current monitoring setup
railway logs --tail 100 > backup-logs-$(date +%Y%m%d).txt
```

### If Things Break
```bash
# Remove monitoring instrumentation if causing issues
git checkout pre-project-98-monitoring-YYYYMMDD -- backend/src/middleware/monitoring.js
git checkout pre-project-98-monitoring-YYYYMMDD -- backend/src/config/monitoring.js
git push origin main

# Disable monitoring service if necessary
```

## ✅ Tasks

### Planning (2 hours)
- [ ] Choose monitoring service (Datadog/New Relic/Sentry Performance)
- [ ] Define key metrics to track
- [ ] Design dashboard layouts
- [ ] Plan alert rules and thresholds
- [ ] Document monitoring architecture

### Implementation (6 hours)
- [ ] **APM Integration** (2.5 hours):
  - [ ] Install monitoring SDK
  - [ ] Configure APM instrumentation
  - [ ] Add custom transaction tracking
  - [ ] Instrument critical API endpoints
  - [ ] Add database query monitoring
  - [ ] Configure distributed tracing

- [ ] **Custom Metrics** (1.5 hours):
  - [ ] Track API response times per endpoint
  - [ ] Monitor database connection pool
  - [ ] Track WebSocket connections
  - [ ] Monitor memory and CPU usage
  - [ ] Track business metrics (logins, escrows created, etc.)
  - [ ] Monitor external API calls (Stripe, Zillow, etc.)

- [ ] **Dashboard Creation** (1.5 hours):
  - [ ] Create system health dashboard
  - [ ] Build API performance dashboard
  - [ ] Create user activity dashboard
  - [ ] Build error rate dashboard
  - [ ] Create infrastructure dashboard

- [ ] **Alert Configuration** (0.5 hours):
  - [ ] Set up error rate alerts (>5% errors)
  - [ ] Configure response time alerts (>2s P95)
  - [ ] Set up downtime alerts
  - [ ] Configure database connection alerts
  - [ ] Set up memory/CPU alerts

### Testing (2 hours)
- [ ] Test metrics collection
- [ ] Verify dashboards show real data
- [ ] Trigger test alerts
- [ ] Test distributed tracing
- [ ] Validate performance overhead <5%
- [ ] Test alert notification delivery

### Documentation (1 hour)
- [ ] Document monitoring architecture
- [ ] Create dashboard user guide
- [ ] Document alert rules
- [ ] Create troubleshooting guide using metrics

## 🧪 Verification Tests

### Test 1: Metrics Collection
```bash
# Generate traffic
for i in {1..100}; do
  curl https://api.jaydenmetz.com/v1/health
  sleep 0.5
done

# Check dashboard shows traffic
# Expected: Dashboard shows 100 requests, response times, no errors
```

### Test 2: Alert Triggering
```bash
# Simulate high error rate
# (Create temporary endpoint that returns 500)
for i in {1..20}; do
  curl https://api.jaydenmetz.com/v1/test-error
done

# Expected: Error rate alert triggered within 5 minutes
```

### Test 3: Performance Overhead
```bash
# Before monitoring (baseline)
ab -n 1000 -c 10 https://api.jaydenmetz.com/v1/health

# After monitoring
ab -n 1000 -c 10 https://api.jaydenmetz.com/v1/health

# Expected: <5% performance degradation
```

## 📝 Implementation Notes

### Key Metrics to Track

**Application Metrics**:
- Request rate (requests per minute)
- Response time (P50, P95, P99)
- Error rate (4xx, 5xx by endpoint)
- Throughput (requests per second)
- Active connections

**Infrastructure Metrics**:
- CPU utilization (%)
- Memory usage (MB)
- Disk I/O
- Network bandwidth
- Database connections

**Business Metrics**:
- User logins per hour
- Escrows created per day
- API calls per user
- Feature usage rates
- Conversion rates

### Dashboard Examples

**System Health Dashboard**:
- Uptime (30-day rolling)
- Request rate (real-time)
- Error rate (last 24h)
- Response time (P95, last 1h)
- Active users (current)

**API Performance Dashboard**:
- Top 10 slowest endpoints
- Error rate by endpoint
- Request volume by endpoint
- Database query performance
- External API latency

**User Activity Dashboard**:
- Active users (real-time)
- New registrations (daily)
- Feature adoption rates
- User session duration
- Geographic distribution

### Alert Rules

| Alert | Condition | Severity | Notification |
|-------|-----------|----------|--------------|
| High Error Rate | >5% errors for 5 min | Critical | Slack + Email |
| Slow Response Time | P95 >2s for 10 min | High | Slack |
| Service Down | Health check fails 3x | Critical | Slack + Email + SMS |
| High Memory | >90% for 5 min | High | Slack |
| Database Issues | Connection errors | Critical | Slack + Email |

### Monitoring Service Recommendations

**Option 1: Datadog** (Recommended for comprehensive monitoring)
- Pros: Full APM + infrastructure + logs
- Cons: Expensive ($31+/host/month)
- Best for: Production-ready comprehensive monitoring

**Option 2: New Relic** (Good APM alternative)
- Pros: Excellent APM, free tier available
- Cons: Complex pricing, can get expensive
- Best for: APM-focused monitoring

**Option 3: Sentry Performance** (Good for error + performance)
- Pros: Already familiar from error tracking, affordable
- Cons: Less comprehensive than Datadog
- Best for: Budget-conscious teams

**Option 4: Railway + Prometheus + Grafana** (Self-hosted)
- Pros: Full control, lower cost
- Cons: More setup and maintenance
- Best for: DevOps-savvy teams

### Implementation with Datadog (Recommended)
```javascript
// backend/src/config/monitoring.js
const tracer = require('dd-trace').init({
  service: 'real-estate-crm-api',
  env: process.env.NODE_ENV,
  hostname: process.env.HOSTNAME,
  analytics: true,
  runtimeMetrics: true,
});

// Custom metrics
const { StatsD } = require('hot-shots');
const dogstatsd = new StatsD({
  host: 'localhost',
  port: 8125,
  prefix: 'crm.',
});

// Track custom business metrics
function trackEscrowCreated(userId) {
  dogstatsd.increment('escrows.created', {
    user_id: userId,
    env: process.env.NODE_ENV
  });
}

// Track API response times
function trackResponseTime(endpoint, duration) {
  dogstatsd.histogram('api.response_time', duration, {
    endpoint: endpoint,
    env: process.env.NODE_ENV
  });
}

module.exports = { tracer, dogstatsd, trackEscrowCreated, trackResponseTime };
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store monitoring API keys in environment variables
- [ ] Test monitoring locally before deploying
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-98**:
- Monitoring coverage: 100% of API endpoints
- Metric collection: Real-time business and system metrics
- Alert coverage: All critical failure modes
- Dashboard visibility: Complete system observability

## 🔗 Dependencies

### Depends On
- Project-97 (Environment Management - needs env configs)

### Blocks
- Project-99 (Logging Enhancement - integrates with monitoring)
- Project-102 (Scaling Configuration - needs metrics for auto-scaling)
- Project-104 (Health Check System - integrates with monitoring)

### Parallel Work
- Can work alongside Project-101 (Backup Automation)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-97 complete (environment management ready)
- ✅ Monitoring service account created
- ✅ Budget approved for monitoring service
- ✅ Alert notification channels configured (Slack/Discord)

### Should Skip If:
- ❌ Using different monitoring solution already
- ❌ No budget for monitoring services

### Optimal Timing:
- Immediately after Project-97
- Before implementing auto-scaling (102)

## ✅ Success Criteria
- [ ] APM integrated and collecting data
- [ ] Custom metrics tracking business events
- [ ] Dashboards created and showing real data
- [ ] Alerts configured with proper thresholds
- [ ] Alert notifications working
- [ ] Performance overhead <5%
- [ ] <5 minute incident detection
- [ ] Zero monitoring blind spots
- [ ] Documentation complete
- [ ] Team trained on using dashboards

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Test monitoring in staging environment
- [ ] Verify metrics collection working
- [ ] Confirm dashboards accessible
- [ ] Test alert notifications
- [ ] Measure performance overhead

### Post-Deployment Verification
- [ ] Monitor first 24 hours closely
- [ ] Verify all metrics being collected
- [ ] Confirm alerts not too noisy
- [ ] Check dashboard accuracy
- [ ] Validate no performance degradation

### Rollback Triggers
- Performance degradation >5%
- Monitoring causing app instability
- Alert spam (>10 alerts/hour)
- Metrics collection failing

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] APM integrated
- [ ] Custom metrics implemented
- [ ] Dashboards created
- [ ] Alerts configured
- [ ] Notifications working
- [ ] Performance tested
- [ ] Deployed to production
- [ ] Documentation updated
- [ ] Team trained

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
