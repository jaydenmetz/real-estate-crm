# Project-97: Environment Management

**Phase**: H | **Priority**: HIGH | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Project 96
**MILESTONE**: None

## 🎯 Goal
Implement comprehensive environment management strategy with staging environment, environment variables management, and validation.

## 📋 Current → Target
**Now**: Production only, environment variables in Railway dashboard
**Target**: Development, staging, and production environments with structured env management, validation, and documentation
**Success Metric**: All environments properly configured, env variables validated on startup, staging environment mirrors production

## 📖 Context
Currently operating with only production environment and local development. Need proper staging environment for testing before production deployment, centralized environment variable management, and automated validation to prevent configuration errors.

Key features: Staging environment setup, environment variable documentation, validation on app startup, environment-specific configurations, and secrets management.

## ⚠️ Risk Assessment

### Technical Risks
- **Environment Drift**: Staging differs from production
- **Configuration Errors**: Missing env variables breaking apps
- **Secret Exposure**: Accidentally committing secrets
- **Database Separation**: Staging using production database

### Business Risks
- **Production Outages**: Bad config reaching production
- **Data Leakage**: Staging accessing production data
- **Cost Increase**: Running additional environments
- **Testing Delays**: Staging environment unavailable

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-97-env-$(date +%Y%m%d)
git push origin pre-project-97-env-$(date +%Y%m%d)

# Backup current env configuration
railway variables > backup-env-$(date +%Y%m%d).txt
```

### If Things Break
```bash
# Restore environment variables
railway variables --file backup-env-YYYYMMDD.txt

# Rollback code changes
git checkout pre-project-97-env-YYYYMMDD
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Document all required environment variables
- [ ] Design environment validation schema
- [ ] Plan staging environment architecture
- [ ] Define environment-specific configurations
- [ ] Create secrets management strategy

### Implementation (5 hours)
- [ ] **Environment Configuration** (2 hours):
  - [ ] Create .env.example with all variables
  - [ ] Document each variable in README
  - [ ] Add environment validation on startup
  - [ ] Create config loader with defaults
  - [ ] Add environment-specific config files

- [ ] **Staging Environment** (2 hours):
  - [ ] Set up staging Railway project
  - [ ] Configure staging database
  - [ ] Set staging environment variables
  - [ ] Configure staging domain
  - [ ] Link GitHub branch to staging

- [ ] **Validation & Tooling** (1 hour):
  - [ ] Create env validation script
  - [ ] Add startup checks for required variables
  - [ ] Create env sync tool (local ↔ Railway)
  - [ ] Add env diff tool to compare environments

### Testing (1.5 hours)
- [ ] Test missing env variable detection
- [ ] Verify staging environment works
- [ ] Test environment-specific configs
- [ ] Validate staging database separation
- [ ] Test env validation script

### Documentation (1 hour)
- [ ] Document all environment variables
- [ ] Document environment setup process
- [ ] Create staging deployment guide
- [ ] Document env validation procedures

## 🧪 Verification Tests

### Test 1: Environment Validation
```bash
# Remove required env variable
unset DATABASE_URL
npm start

# Expected: App fails to start with clear error message
# Error: "Missing required environment variable: DATABASE_URL"
```

### Test 2: Staging Environment
```bash
# Deploy to staging
git push origin staging

# Verify staging works
curl https://staging.jaydenmetz.com/health
# Expected: 200 OK, different database than production
```

### Test 3: Environment Variable Comparison
```bash
# Compare staging vs production env
./scripts/env-diff.sh staging production

# Expected: Shows differences, flags any critical mismatches
```

## 📝 Implementation Notes

### Required Environment Variables
```bash
# Application
NODE_ENV=production|staging|development
PORT=3000
FRONTEND_URL=https://crm.jaydenmetz.com
API_URL=https://api.jaydenmetz.com

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
JWT_SECRET=<64-char-hex>
JWT_REFRESH_SECRET=<64-char-hex>
SESSION_SECRET=<64-char-hex>

# External Services
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
SENDGRID_API_KEY=SG....
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...

# Feature Flags
ENABLE_WEBSOCKET=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=true

# Monitoring (if configured)
SENTRY_DSN=https://...
LOG_LEVEL=info
```

### Environment Validation Schema
```javascript
// backend/src/config/env.validation.js
const requiredEnvVars = {
  NODE_ENV: { required: true, values: ['production', 'staging', 'development'] },
  DATABASE_URL: { required: true, format: /^postgresql:\/\// },
  JWT_SECRET: { required: true, minLength: 64 },
  JWT_REFRESH_SECRET: { required: true, minLength: 64 },
  STRIPE_SECRET_KEY: { required: false, format: /^sk_(live|test)_/ },
  FRONTEND_URL: { required: true, format: /^https?:\/\// },
};

function validateEnvironment() {
  const errors = [];

  for (const [key, rules] of Object.entries(requiredEnvVars)) {
    if (rules.required && !process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }

    if (process.env[key] && rules.format && !rules.format.test(process.env[key])) {
      errors.push(`Invalid format for ${key}`);
    }

    if (process.env[key] && rules.minLength && process.env[key].length < rules.minLength) {
      errors.push(`${key} must be at least ${rules.minLength} characters`);
    }
  }

  if (errors.length > 0) {
    console.error('Environment validation failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

module.exports = { validateEnvironment };
```

### Environment-Specific Configuration
```javascript
// backend/src/config/index.js
const config = {
  development: {
    logLevel: 'debug',
    corsOrigin: 'http://localhost:3000',
    enableWebSocket: true,
  },
  staging: {
    logLevel: 'info',
    corsOrigin: 'https://staging.jaydenmetz.com',
    enableWebSocket: true,
  },
  production: {
    logLevel: 'warn',
    corsOrigin: 'https://crm.jaydenmetz.com',
    enableWebSocket: true,
  }
};

module.exports = config[process.env.NODE_ENV];
```

### Staging Environment Setup
- **Domain**: staging.jaydenmetz.com
- **Database**: Separate staging database (not production!)
- **Branch**: Deploys from `staging` branch
- **Purpose**: Final testing before production
- **Data**: Seed data + test accounts
- **Reset**: Can be reset/wiped without consequence

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] NEVER commit .env files (use .env.example)
- [ ] Store secrets in Railway dashboard only
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-97**:
- Environment validation: Tested on startup
- Staging environment: Fully functional
- Environment sync: Verified working
- Configuration errors: Caught before deployment

## 🔗 Dependencies

### Depends On
- Project-96 (CI/CD Pipeline Optimization)

### Blocks
- Project-98 (Monitoring Setup - needs env configs)
- Project-101 (Backup Automation - needs staging environment)

### Parallel Work
- None (foundational for monitoring and backups)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-96 complete (CI/CD optimized)
- ✅ Railway account has available projects
- ✅ Domain configured (staging subdomain)
- ✅ All environment variables documented

### Should Skip If:
- ❌ Using single environment only
- ❌ No staging environment needed

### Optimal Timing:
- Immediately after Project-96
- Before implementing monitoring (98)

## ✅ Success Criteria
- [ ] .env.example created with all variables
- [ ] Environment validation on startup
- [ ] Staging environment deployed
- [ ] Staging database separate from production
- [ ] Environment sync tools created
- [ ] All env variables documented
- [ ] Validation prevents startup with missing vars
- [ ] Staging mirrors production configuration
- [ ] Documentation complete
- [ ] Zero configuration errors

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Test environment validation locally
- [ ] Verify staging environment works
- [ ] Confirm staging database is separate
- [ ] Test env sync tools
- [ ] Review all environment variables

### Post-Deployment Verification
- [ ] Staging environment accessible
- [ ] Production environment variables validated
- [ ] No missing configuration errors
- [ ] Environment-specific configs working
- [ ] Staging deploys from staging branch

### Rollback Triggers
- Staging environment not working
- Environment validation blocking valid configs
- Production environment variables corrupted
- Staging accessing production database

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] .env.example created
- [ ] Environment validation implemented
- [ ] Staging environment deployed
- [ ] Sync tools created
- [ ] All variables documented
- [ ] Validation working
- [ ] Zero configuration errors
- [ ] Documentation updated
- [ ] Staging functional

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
