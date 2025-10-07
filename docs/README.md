# Real Estate CRM - Documentation

**Last Updated:** October 6, 2025

## 📚 Active Documentation

This folder contains **active reference documentation** only. Completed plans, audits, and superseded docs are in [`/archive`](./archive).

### Core System Reference

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture patterns and design philosophy
- **[API_REFERENCE.md](./API_REFERENCE.md)** - REST API endpoints and authentication
- **[DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)** - Complete database schema (26 tables)
- **[DATABASE_RELATIONSHIPS.md](./DATABASE_RELATIONSHIPS.md)** - Entity relationships and foreign keys

### Security & Operations

- **[SECURITY_REFERENCE.md](./SECURITY_REFERENCE.md)** - Security architecture (10/10 OWASP score)
- **[SECURITY_OPERATIONS.md](./SECURITY_OPERATIONS.md)** - Day-to-day security monitoring
- **[SCALING_GUIDE.md](./SCALING_GUIDE.md)** - Production scaling and performance optimization

### Setup & Configuration

- **[RAILWAY_ENVIRONMENT_SETUP.md](./RAILWAY_ENVIRONMENT_SETUP.md)** - Deployment to Railway
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Google OAuth integration
- **[SENTRY_SETUP.md](./SENTRY_SETUP.md)** - Error tracking with Sentry
- **[ENVIRONMENTS.md](./ENVIRONMENTS.md)** - Environment variables reference

### Development Guides

- **[QUICK_START_NEW_DASHBOARD.md](./QUICK_START_NEW_DASHBOARD.md)** - How to create new module dashboards
- **[KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md)** - User keyboard shortcuts

---

## 🗂️ Archived Documentation

Historical documents, completed plans, and superseded docs are organized in [`/archive`](./archive):

- **`2025-plans/`** - Completed roadmaps and remediation plans
- **`2025-audits/`** - Point-in-time security and performance audits
- **`design-specs/`** - UI/UX design specifications for completed features
- **`superseded/`** - Replaced by newer documentation

---

## 🚀 Quick Links

- **Production App:** https://crm.jaydenmetz.com
- **API Endpoint:** https://api.jaydenmetz.com/v1
- **Health Dashboard:** https://crm.jaydenmetz.com/health
- **GitHub Repo:** https://github.com/jaydenmetz/real-estate-crm

---

## 📝 Documentation Guidelines

**For Claude Code agents:** See [`/CLAUDE.md`](../CLAUDE.md) for documentation management rules.

**Key principles:**
- Keep `/docs` lean - only active reference docs
- Archive completed plans and audits
- No duplicate information
- Only create docs when explicitly requested
