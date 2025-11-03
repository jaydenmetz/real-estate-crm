# Project-89: Performance Testing Setup

**Phase**: G | **Priority**: HIGH | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Project-87 complete
**MILESTONE**: Performance baselines established

## 🎯 Goal
Set up performance testing tools, create test scenarios, establish performance baselines, and implement monitoring for API response times and page load speeds.

## 📋 Current → Target
**Now**: No automated performance testing; unknown performance characteristics under load
**Target**: Performance test tools configured; baseline metrics established; automated performance tests; regression detection enabled
**Success Metric**: Performance baselines documented; tests run automatically; regressions detected before production

## 📖 Context
Performance testing ensures the application remains fast and responsive as features are added. This project sets up tools like k6, Apache JMeter, or Lighthouse to test API performance, page load times, and resource usage. Establishing baselines allows detecting performance regressions early.

Key activities: Choose performance tools, create test scenarios, establish baselines, set up monitoring, and integrate with CI/CD.

## ⚠️ Risk Assessment

### Technical Risks
- **Baseline Inconsistency**: Performance varies between test runs
- **Environment Differences**: Dev/staging/production performance gaps
- **Tool Overhead**: Testing tools affecting results
- **False Positives**: Natural variation triggering alerts

### Business Risks
- **User Experience**: Slow performance driving churn
- **Scalability Issues**: Poor performance limiting growth
- **Cost Overruns**: Performance issues requiring infrastructure upgrades
- **Reputation Damage**: Slow app damaging brand

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-89-performance-$(date +%Y%m%d)
git push origin pre-project-89-performance-$(date +%Y%m%d)

# Backup performance configs
cp k6.config.js k6.config.js.backup 2>/dev/null || true
cp lighthouse.config.js lighthouse.config.js.backup 2>/dev/null || true
```

### If Things Break
```bash
# Remove performance testing infrastructure
git checkout pre-project-89-performance-YYYYMMDD -- performance/ k6.config.js
git push origin main
```

## ✅ Tasks

### Planning (2 hours)
- [ ] Choose performance testing tools (k6, Lighthouse, etc.)
- [ ] Define performance metrics to track
- [ ] Plan test scenarios
- [ ] Document acceptable performance thresholds
- [ ] Design baseline establishment process

### Implementation (6 hours)
- [ ] **API Performance Testing** (2.5 hours):
  - [ ] Install k6 or similar tool
  - [ ] Create API load test scripts
  - [ ] Test all critical endpoints
  - [ ] Measure response times
  - [ ] Track error rates
  - [ ] Monitor resource usage

- [ ] **Frontend Performance Testing** (2 hours):
  - [ ] Install Lighthouse CI
  - [ ] Configure Lighthouse tests
  - [ ] Test critical pages (dashboard, escrows, listings)
  - [ ] Measure page load times
  - [ ] Track Core Web Vitals (LCP, FID, CLS)
  - [ ] Monitor bundle sizes

- [ ] **Database Performance** (1 hour):
  - [ ] Create query performance tests
  - [ ] Test slow query detection
  - [ ] Monitor connection pool usage
  - [ ] Track transaction times

- [ ] **Baseline Establishment** (0.5 hours):
  - [ ] Run baseline tests
  - [ ] Document baseline metrics
  - [ ] Set performance budgets
  - [ ] Configure thresholds

### Testing (1.5 hours)
- [ ] Run performance tests locally
- [ ] Verify baseline consistency
- [ ] Test CI/CD integration
- [ ] Validate threshold alerts
- [ ] Check report generation

### Documentation (0.5 hours)
- [ ] Document performance testing setup
- [ ] Document running performance tests
- [ ] Document baseline metrics
- [ ] Add performance testing to README

## 🧪 Verification Tests

### Test 1: Run API Performance Tests
```bash
# Run k6 load test
k6 run performance/api/escrows-load-test.js

# Expected: Response times < 200ms for 95th percentile
# Error rate < 1%
```

### Test 2: Frontend Performance Test
```bash
# Run Lighthouse CI
npm run test:lighthouse

# Expected: Performance score > 90
# LCP < 2.5s, FID < 100ms, CLS < 0.1
```

### Test 3: Database Performance
```bash
# Run query performance tests
npm run test:db-performance

# Expected: All queries < 100ms
# No N+1 queries detected
```

## 📝 Implementation Notes

### Performance Test Structure
```
performance/
├── api/
│   ├── escrows-load-test.js
│   ├── listings-load-test.js
│   ├── auth-load-test.js
│   └── baseline-test.js
├── frontend/
│   ├── lighthouse.config.js
│   ├── dashboard-perf.js
│   ├── escrows-perf.js
│   └── listings-perf.js
├── database/
│   ├── query-performance.test.js
│   └── connection-pool.test.js
├── reports/
│   └── .gitkeep
└── baselines.json
```

### k6 Load Test Example
```javascript
// performance/api/escrows-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 10 },    // Stay at 10 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% of requests < 200ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function () {
  const token = 'YOUR_TEST_TOKEN';

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test GET /v1/escrows
  let res = http.get('https://api.jaydenmetz.com/v1/escrows', { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

### Lighthouse CI Configuration
```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: [
        'https://crm.jaydenmetz.com/dashboard',
        'https://crm.jaydenmetz.com/escrows',
        'https://crm.jaydenmetz.com/listings',
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Performance Baselines
```json
// baselines.json
{
  "api": {
    "escrows_list": {
      "p95_response_time": 150,
      "p99_response_time": 300,
      "max_error_rate": 0.01
    },
    "escrows_create": {
      "p95_response_time": 200,
      "p99_response_time": 400,
      "max_error_rate": 0.02
    },
    "listings_list": {
      "p95_response_time": 150,
      "p99_response_time": 300,
      "max_error_rate": 0.01
    }
  },
  "frontend": {
    "dashboard": {
      "performance_score": 90,
      "lcp": 2500,
      "fid": 100,
      "cls": 0.1,
      "bundle_size": 500000
    },
    "escrows": {
      "performance_score": 90,
      "lcp": 2500,
      "fid": 100,
      "cls": 0.1
    }
  },
  "database": {
    "query_max_time": 100,
    "connection_pool_max": 10,
    "transaction_max_time": 200
  }
}
```

### Performance Metrics to Track
**API Performance**:
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate
- Concurrent users
- CPU usage
- Memory usage

**Frontend Performance**:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Bundle size

**Database Performance**:
- Query execution time
- Connection pool usage
- Transaction duration
- Cache hit rate
- Index usage
- Slow query count

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Performance tests in /performance directory
- [ ] Baselines in baselines.json
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-89**:
- API performance: Baseline established for all endpoints
- Frontend performance: Core Web Vitals tracked
- Database performance: Query performance monitored
- Performance budgets: Configured and enforced

## 🔗 Dependencies

### Depends On
- Project-87 (Integration tests provide test scenarios)
- Production/staging environment accessible
- API endpoints documented

### Blocks
- Project-90 (Load testing builds on performance testing)

### Parallel Work
- Can work alongside Project-88 (E2E testing)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-87 complete
- ✅ Application deployed and accessible
- ✅ Performance testing tools approved
- ✅ Test environment ready

### Should Skip If:
- ❌ Not concerned with performance
- ❌ Too early in development (no stable baseline)

### Optimal Timing:
- After Project-87 complete
- Before load testing (Project-90)

## ✅ Success Criteria
- [ ] Performance testing tools installed
- [ ] API performance tests created
- [ ] Frontend performance tests configured
- [ ] Database performance monitored
- [ ] Baselines established and documented
- [ ] Performance budgets set
- [ ] CI/CD integration working
- [ ] Regression detection enabled
- [ ] Documentation complete
- [ ] MILESTONE ACHIEVED: Performance baselines established

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Performance tests passing
- [ ] Baselines documented
- [ ] Thresholds configured
- [ ] CI/CD integration working
- [ ] Reports accessible

### Post-Deployment Verification
- [ ] Performance tests run on each deploy
- [ ] Regressions detected and reported
- [ ] Metrics visible in monitoring dashboard
- [ ] Alerts configured for threshold violations

### Rollback Triggers
- Performance regressions >20% from baseline
- Tests consistently failing
- Tool overhead affecting application
- False positive rate >10%

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Performance tools configured
- [ ] Test scenarios created
- [ ] Baselines established
- [ ] Budgets set
- [ ] CI/CD integration working
- [ ] Zero blocking issues
- [ ] Documentation updated
- [ ] MILESTONE ACHIEVED: Performance testing operational

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
