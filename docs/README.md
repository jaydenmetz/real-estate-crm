# Real Estate CRM Documentation

**Last Updated:** October 4, 2025
**Status:** ✅ Production
**Current Version:** 2.0

---

## Quick Start

New to the codebase? Start here:

1. **[SYSTEM_WHITEPAPER.md](SYSTEM_WHITEPAPER.md)** - Complete system overview
2. **[DATA_FLOW_ARCHITECTURE.md](DATA_FLOW_ARCHITECTURE.md)** - How data flows from DB to UI
3. **[WIDGET_TEMPLATE_SYSTEM.md](WIDGET_TEMPLATE_SYSTEM.md)** - Widget/card standards
4. **[DASHBOARD_PAGE_TEMPLATE.md](DASHBOARD_PAGE_TEMPLATE.md)** - Page structure template

---

## Core Architecture Documentation

### 📐 Architecture & Design
- **[SYSTEM_WHITEPAPER.md](SYSTEM_WHITEPAPER.md)** - Complete system architecture
- **[DATA_FLOW_ARCHITECTURE.md](DATA_FLOW_ARCHITECTURE.md)** - ⭐ Data flow from database to widgets
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture details
- **[MULTI_TENANT_ARCHITECTURE.md](MULTI_TENANT_ARCHITECTURE.md)** - Team/tenant structure

### 🎨 Frontend Standards
- **[WIDGET_TEMPLATE_SYSTEM.md](WIDGET_TEMPLATE_SYSTEM.md)** - ⭐ Small/Medium/Large widget standards
- **[DASHBOARD_PAGE_TEMPLATE.md](DASHBOARD_PAGE_TEMPLATE.md)** - ⭐ Dashboard page structure
- **[DUPLICATE_COMPONENTS_AUDIT.md](DUPLICATE_COMPONENTS_AUDIT.md)** - Component naming standards

### 🗄️ Database
- **[DATABASE_STRUCTURE.md](DATABASE_STRUCTURE.md)** - Schema and tables
- **[DATABASE_RELATIONSHIPS.md](DATABASE_RELATIONSHIPS.md)** - Foreign keys and relationships

### 🔌 API
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- **[AI_INTEGRATION_GUIDE.md](AI_INTEGRATION_GUIDE.md)** - AI/MCP integration

---

## Security & Compliance

### 🔒 Security
- **[SECURITY_REFERENCE.md](SECURITY_REFERENCE.md)** - Security architecture (Phase 4 & 5)
- **[SECURITY_OPERATIONS.md](SECURITY_OPERATIONS.md)** - Day-to-day security ops
- **[SECURITY_IMPLEMENTATION_HISTORY.md](SECURITY_IMPLEMENTATION_HISTORY.md)** - How we achieved 10/10
- **[SECURITY_AUDIT_2025.md](SECURITY_AUDIT_2025.md)** - Latest audit results

### 📋 Compliance
- **[compliance/SOC2_COMPLIANCE_TRACKER.md](compliance/SOC2_COMPLIANCE_TRACKER.md)** - SOC 2 readiness
- **[compliance/SOC2_AUDIT_READINESS.md](compliance/SOC2_AUDIT_READINESS.md)** - Audit preparation
- **[compliance/SECURITY_MONITORING_ALERTING.md](compliance/SECURITY_MONITORING_ALERTING.md)** - Monitoring
- **[compliance/INCIDENT_RESPONSE_RUNBOOK.md](compliance/INCIDENT_RESPONSE_RUNBOOK.md)** - Incident response

---

## Deployment & Operations

### 🚀 Deployment
- **[RAILWAY_ENVIRONMENT_SETUP.md](RAILWAY_ENVIRONMENT_SETUP.md)** - Railway configuration
- **[ENVIRONMENTS.md](ENVIRONMENTS.md)** - Environment variables
- **[railway-db-commands.md](railway-db-commands.md)** - Database operations

### 🏥 Health & Monitoring
- **[HEALTH_CHECK_STRATEGY.md](HEALTH_CHECK_STRATEGY.md)** - Health check system
- **[SENTRY_SETUP.md](SENTRY_SETUP.md)** - Error tracking

### 📊 Performance
- **[PERFORMANCE_AUDIT_2025.md](PERFORMANCE_AUDIT_2025.md)** - Performance analysis
- **[SCALING_GUIDE.md](SCALING_GUIDE.md)** - Scaling recommendations

---

## Development Guides

### 🧪 Testing
- **[INTEGRATION_TESTING.md](INTEGRATION_TESTING.md)** - Integration test strategy
- **[ONBOARDING_TESTING_GUIDE.md](ONBOARDING_TESTING_GUIDE.md)** - Onboarding flow tests

### 🔧 Feature Guides
- **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Google OAuth integration
- **[ZILLOW_FEATURE_STATUS.md](ZILLOW_FEATURE_STATUS.md)** - Zillow integration

### 🤖 AI Integration
- **[MCP_SERVER_SETUP.md](MCP_SERVER_SETUP.md)** - MCP server configuration
- **[AI_READINESS_ASSESSMENT.md](AI_READINESS_ASSESSMENT.md)** - AI integration readiness

---

## Business & Planning

### 📈 Strategy
- **[BILLION_DOLLAR_PLAYBOOK.md](BILLION_DOLLAR_PLAYBOOK.md)** - Long-term growth strategy
- **[ZERO_BUDGET_ROADMAP.md](ZERO_BUDGET_ROADMAP.md)** - Bootstrap growth plan
- **[ENTERPRISE_READINESS_AUDIT.md](ENTERPRISE_READINESS_AUDIT.md)** - Enterprise readiness

### 🗺️ Roadmap
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** - Feature implementation plan
- **[TEAM_STRUCTURE_PROPOSAL.md](TEAM_STRUCTURE_PROPOSAL.md)** - Team architecture

---

## Reference Implementation: Escrows Module

The **Escrows module** is the reference implementation for all other modules. When building Listings, Clients, Leads, or Appointments:

1. **Data Flow:** Follow [DATA_FLOW_ARCHITECTURE.md](DATA_FLOW_ARCHITECTURE.md)
   - Single API endpoint (`GET /v1/[module]`)
   - Dashboard fetches data once
   - Same data passed to all widget sizes

2. **Widget Structure:** Follow [WIDGET_TEMPLATE_SYSTEM.md](WIDGET_TEMPLATE_SYSTEM.md)
   - Small: 320x320px grid cards
   - Medium: 320px height horizontal cards
   - Large: 320px height full-width cards

3. **File Locations:**
   ```
   /frontend/src/components/dashboards/EscrowsDashboard.jsx
   /frontend/src/components/common/widgets/EscrowWidgetSmall.jsx
   /frontend/src/components/common/widgets/EscrowWidgetMedium.jsx
   /frontend/src/components/common/widgets/EscrowWidgetLarge.jsx
   ```

4. **API Service:**
   ```javascript
   // /frontend/src/services/api.service.js
   export const escrowsAPI = {
     getAll: (params) => apiInstance.get('/escrows', params),
     // ... other methods
   };
   ```

---

## Archive

Older documentation has been moved to `/docs/archive/` for historical reference:
- Previous API structures
- Migration reports
- Weekly status reports
- Deprecated features

**Do not use archived documentation for new development.**

---

## Document Status Legend

- ⭐ **Primary Reference** - Use this for new development
- ✅ **Current** - Accurate and up-to-date
- 📋 **Compliance** - Required for audits
- 🗄️ **Archive** - Historical reference only

---

## Contributing to Documentation

When updating documentation:

1. **Update "Last Updated" date**
2. **Check alignment** with DATA_FLOW_ARCHITECTURE.md and WIDGET_TEMPLATE_SYSTEM.md
3. **Add cross-references** to related docs
4. **Move outdated docs** to `/archive/`
5. **Update this README.md** if adding new docs

---

## Support

- **Production Site:** https://crm.jaydenmetz.com
- **API:** https://api.jaydenmetz.com/v1
- **Health Dashboard:** https://crm.jaydenmetz.com/health
- **Admin Contact:** admin@jaydenmetz.com

---

**Last Reviewed:** October 4, 2025
