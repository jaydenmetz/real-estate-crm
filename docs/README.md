# Real Estate CRM Documentation

**Last Updated:** October 4, 2025
**Status:** ✅ Production
**Current Version:** 2.0

---

## Quick Start

New to the codebase? Start here:

1. **[DATABASE_DASHBOARD_TEMPLATE.md](DATABASE_DASHBOARD_TEMPLATE.md)** - ⭐ Complete guide: Database → Beautiful UI
2. **[SYSTEM_WHITEPAPER.md](SYSTEM_WHITEPAPER.md)** - Complete system overview
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture details

---

## Core Architecture Documentation

### 📐 Architecture & Design
- **[DATABASE_DASHBOARD_TEMPLATE.md](DATABASE_DASHBOARD_TEMPLATE.md)** - ⭐ PRIMARY: Database → UI complete guide
- **[SYSTEM_WHITEPAPER.md](SYSTEM_WHITEPAPER.md)** - Complete system architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture details
- **[MULTI_TENANT_ARCHITECTURE.md](MULTI_TENANT_ARCHITECTURE.md)** - Team/tenant structure

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

### 🔧 Feature Guides
- **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Google OAuth integration

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
- See BILLION_DOLLAR_PLAYBOOK.md and ZERO_BUDGET_ROADMAP.md for future plans

---

## Reference Implementation: Escrows Module

The **Escrows module** is the reference implementation for all other modules.

**See [DATABASE_DASHBOARD_TEMPLATE.md](DATABASE_DASHBOARD_TEMPLATE.md) for the complete guide** on how to:
- Transform any database table into a beautiful dashboard
- Implement 3-tier widget system (Small/Medium/Large)
- Follow data flow from PostgreSQL → API → React → Widgets
- Use consistent 320px height, progressive disclosure, and professional design

**Key Files:**
```
/frontend/src/components/dashboards/EscrowsDashboard.jsx
/frontend/src/components/common/widgets/EscrowWidgetSmall.jsx
/frontend/src/components/common/widgets/EscrowWidgetMedium.jsx
/frontend/src/components/common/widgets/EscrowWidgetLarge.jsx
```

---

## Archive

Older documentation has been moved to `/docs/archive/` for historical reference:

**Archived Files (October 4, 2025):**

*First Archive (9 files):*
- `deploy-zillow-feature.md` - One-time Zillow deployment (completed)
- `fix-railway-env.md` - Railway authentication fix (resolved)
- `ZILLOW_FEATURE_STATUS.md` - Zillow feature status (deployed)
- `IMPLEMENTATION_PLAN.md` - Old multi-tenant plan (implemented)
- `TEAM_STRUCTURE_PROPOSAL.md` - Team architecture proposal (implemented)
- `get-zillow-image-manually.md` - Manual Zillow image process (rarely used)
- `railway-db-commands.md` - Railway database commands (replaced by CLAUDE.md)
- `DUPLICATE_COMPONENTS_AUDIT.md` - Component naming audit (one-time cleanup)
- `ONBOARDING_TESTING_GUIDE.md` - Onboarding testing guide (feature complete)

*Second Archive (3 files - consolidated into DATABASE_DASHBOARD_TEMPLATE.md):*
- `DATA_FLOW_ARCHITECTURE.md` - Data flow from database to widgets
- `WIDGET_TEMPLATE_SYSTEM.md` - Small/Medium/Large widget standards
- `DASHBOARD_PAGE_TEMPLATE.md` - Dashboard page structure template

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
