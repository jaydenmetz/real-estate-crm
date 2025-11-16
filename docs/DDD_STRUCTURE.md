# Domain-Driven Design (DDD) Architecture

**Last Updated:** November 15, 2025
**Architecture Pattern:** Domain-Driven Design with Module-Based Structure
**Testing Convention:** Jest `__tests__/` Pattern (Facebook, 2014)

---

## Table of Contents

1. [Overview](#overview)
2. [Module Organization](#module-organization)
3. [Directory Structure](#directory-structure)
4. [Testing Patterns](#testing-patterns)
5. [Adding New Modules](#adding-new-modules)
6. [Current Module Breakdown](#current-module-breakdown)
7. [Best Practices](#best-practices)

---

## Overview

This CRM uses **Domain-Driven Design (DDD)** principles to organize code by business domain rather than technical layers. Each module represents a business capability and contains all related code (controllers, services, routes, tests) in one location.

### Why DDD?

**Before (Layered Architecture):**
```
backend/
├── controllers/      # All controllers
├── services/         # All services
├── routes/          # All routes
└── tests/           # All tests (disconnected)
```

**After (DDD Architecture):**
```
backend/
└── src/
    └── modules/
        └── core-modules/
            └── escrows/
                ├── controllers/
                ├── services/
                ├── routes/
                └── __tests__/    # Tests colocated with code
```

**Benefits:**
- **Cohesion:** All escrow-related code lives together
- **Discoverability:** Easy to find all escrow functionality
- **Maintenance:** Changes to escrows stay within one module
- **Testing:** Unit tests next to code they test
- **Scalability:** New developers understand domain boundaries

---

## Module Organization

### Module Categories (6 Total)

Modules are grouped by business function:

```
backend/src/modules/
├── core-modules/        # Primary business entities (escrows, clients, leads, appointments)
├── operations/          # Day-to-day operations (listings, documents)
├── crm/                # Customer relationship (contacts, roles)
├── system/             # Platform-level (auth, teams, users, onboarding, admin)
├── workflow/           # Task management (projects, tasks, checklists)
├── integration/        # External systems (communications, webhooks, skyslope)
└── financial/          # Money operations (commissions, invoices, expenses)
```

### Module Anatomy

Each module follows this exact structure:

```
module-name/
├── controllers/              # Request handlers (HTTP → Business Logic)
│   └── *.controller.js
├── services/                 # Business logic (core functionality)
│   ├── index.js             # Main service
│   └── */                   # Sub-services (optional)
├── routes/                   # API endpoint definitions
│   └── index.js             # Main routes file
└── __tests__/               # Unit tests (Jest convention)
    ├── *.controller.test.js
    ├── *.service.test.js
    └── *.routes.test.js
```

**NO README.md files in modules!** Documentation lives in `/docs`, not scattered across modules.

---

## Directory Structure

### Complete Backend Structure

```
backend/
├── src/
│   ├── modules/                    # DDD modules (by business domain)
│   │   ├── core-modules/          # The Big 4: escrows, clients, leads, appointments
│   │   ├── operations/            # listings, documents
│   │   ├── crm/                   # contacts, contact-roles
│   │   ├── system/                # auth, teams, users, onboarding, admin, waitlist, link-preview, stats
│   │   ├── workflow/              # projects, tasks (with checklist templates)
│   │   ├── integration/           # communications, webhooks, skyslope
│   │   └── financial/             # commissions, invoices, expenses
│   │
│   ├── config/                    # Configuration files
│   │   ├── infrastructure/        # database.js, redis.js
│   │   └── openapi.config.js     # API documentation
│   │
│   ├── lib/                       # Shared libraries (cross-cutting concerns)
│   │   ├── ai/                   # AI/NLP services
│   │   ├── communication/        # email.service.js, alerting.service.js
│   │   │   └── __tests__/        # Tests for communication services
│   │   ├── infrastructure/       # websocket.service.js
│   │   └── security/             # geoAnomaly.service.js, securityEvent.service.js
│   │       └── __tests__/        # Tests for security services
│   │
│   ├── middleware/                # Express middleware
│   │   ├── auth/                 # Authentication (JWT, API keys)
│   │   ├── security/             # Security headers, validation, rate limiting
│   │   └── logging/              # Error logging
│   │
│   ├── routes/                    # Platform-level routes (cross-cutting)
│   │   ├── platform/             # ai.routes.js, analytics.routes.js, system-health.routes.js
│   │   └── security/             # apiKeys.routes.js, gdpr.routes.js, securityEvents.routes.js
│   │
│   ├── tests/                     # Integration tests (full API testing)
│   │   ├── escrows.test.js
│   │   ├── clients.test.js
│   │   ├── appointments.test.js
│   │   └── leads.test.js
│   │
│   ├── utils/                     # Utility functions
│   │   ├── logger.js
│   │   └── validation.js
│   │
│   ├── jobs/                      # Background jobs
│   │   └── scheduler.js
│   │
│   └── app.js                     # Express app setup
│
├── uploads/                       # Permanent file storage (served by Express)
│   ├── documents/
│   │   ├── appointments/
│   │   ├── clients/
│   │   ├── escrows/
│   │   ├── leads/
│   │   ├── listings/
│   │   └── templates/
│   └── images/
│       ├── large/
│       ├── medium/
│       ├── small/
│       └── thumbnail/
│
├── temp/                          # Temporary upload buffer (multer)
│   └── uploads/                   # Files here get validated → moved to uploads/
│
├── migrations/                    # Database schema migrations
│
└── server.js                      # Entry point
```

### Frontend Structure (Brief Overview)

```
frontend/
└── src/
    ├── components/
    │   ├── dashboards/           # Main dashboard views (escrows, clients, leads, appointments)
    │   ├── details/              # Detail pages with hero/widgets/sidebar pattern
    │   ├── common/               # Shared components
    │   └── health/               # Health check dashboards
    ├── services/                 # API and WebSocket services
    ├── contexts/                 # React contexts (auth, user state)
    ├── hooks/                    # Custom React hooks
    └── utils/                    # Utility functions
```

---

## Testing Patterns

### The `__tests__/` Convention

**Origin:** Facebook (Jest team), 2014
**Pattern:** Python's double-underscore naming convention
**Purpose:** Clearly identify test directories, auto-discovered by Jest

### Test Types

**1. Unit Tests** (in module `__tests__/` directories)
- Test individual functions/classes in isolation
- Location: `backend/src/modules/*/\_\_tests\_\_/`
- Example: [backend/src/modules/core-modules/escrows/\_\_tests\_\_/](../backend/src/modules/core-modules/escrows/__tests__/)

**2. Integration Tests** (in `backend/src/tests/`)
- Test full API endpoints end-to-end
- Location: `backend/src/tests/`
- Example: [backend/src/tests/escrows.test.js](../backend/src/tests/escrows.test.js)

**3. Shared Library Tests** (in `lib/*/\_\_tests\_\_/`)
- Test cross-cutting services
- Examples:
  - [backend/src/lib/communication/\_\_tests\_\_/alerting.service.test.js](../backend/src/lib/communication/__tests__/alerting.service.test.js)
  - [backend/src/lib/security/\_\_tests\_\_/geoAnomaly.service.test.js](../backend/src/lib/security/__tests__/geoAnomaly.service.test.js)

### Test File Naming

```
module-name/
└── __tests__/
    ├── module.controller.test.js    # Controller tests
    ├── module.service.test.js       # Service tests
    └── module.routes.test.js        # Route tests
```

**Pattern:** `{filename}.test.js` matches `{filename}.js`

### Running Tests

```bash
# All tests
npm test

# Specific module tests
npm test -- escrows

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## Adding New Modules

### Step-by-Step Guide

**1. Choose Module Category**

Determine which category your module belongs to:
- **core-modules:** Primary business entity (rare - only 4 exist)
- **operations:** Day-to-day business operations
- **crm:** Customer relationship features
- **system:** Platform-level features
- **workflow:** Task/project management
- **integration:** External system connections
- **financial:** Money-related operations

**2. Create Module Structure**

```bash
# Example: Adding a new "properties" module to operations
mkdir -p backend/src/modules/operations/properties/{controllers,services,routes,__tests__}

# Create files
touch backend/src/modules/operations/properties/controllers/properties.controller.js
touch backend/src/modules/operations/properties/services/index.js
touch backend/src/modules/operations/properties/routes/index.js
touch backend/src/modules/operations/properties/__tests__/properties.service.test.js
```

**3. Implement Controller**

[backend/src/modules/operations/properties/controllers/properties.controller.js](../backend/src/modules/operations/properties/controllers/properties.controller.js):
```javascript
const PropertiesService = require('../services');

class PropertiesController {
  async getAllProperties(req, res) {
    try {
      const properties = await PropertiesService.getAll(req.user.id);
      res.json({ success: true, data: properties });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message }
      });
    }
  }

  async getPropertyById(req, res) {
    try {
      const property = await PropertiesService.getById(req.params.id, req.user.id);
      res.json({ success: true, data: property });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: error.message }
      });
    }
  }
}

module.exports = new PropertiesController();
```

**4. Implement Service**

[backend/src/modules/operations/properties/services/index.js](../backend/src/modules/operations/properties/services/index.js):
```javascript
const { pool } = require('../../../../config/infrastructure/database');

class PropertiesService {
  async getAll(userId) {
    const query = `
      SELECT * FROM properties
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async getById(propertyId, userId) {
    const query = `
      SELECT * FROM properties
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [propertyId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Property not found');
    }

    return result.rows[0];
  }
}

module.exports = new PropertiesService();
```

**5. Implement Routes**

[backend/src/modules/operations/properties/routes/index.js](../backend/src/modules/operations/properties/routes/index.js):
```javascript
const express = require('express');
const { authenticate } = require('../../../../middleware/auth/apiKey.middleware');
const PropertiesController = require('../controllers/properties.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /v1/properties
router.get('/', PropertiesController.getAllProperties);

// GET /v1/properties/:id
router.get('/:id', PropertiesController.getPropertyById);

module.exports = router;
```

**6. Add Route to app.js**

[backend/src/app.js](../backend/src/app.js):
```javascript
// Operations Modules - Day-to-day business operations
apiRouter.use('/listings', require('./modules/operations/listings/routes'));
apiRouter.use('/properties', require('./modules/operations/properties/routes')); // NEW
```

**7. Write Tests**

[backend/src/modules/operations/properties/\_\_tests\_\_/properties.service.test.js](../backend/src/modules/operations/properties/__tests__/properties.service.test.js):
```javascript
const PropertiesService = require('../services');
const { pool } = require('../../../../config/infrastructure/database');

jest.mock('../../../../config/infrastructure/database');

describe('PropertiesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll()', () => {
    test('should return all properties for user', async () => {
      const mockProperties = [
        { id: '1', address: '123 Main St', user_id: 'user-1' },
        { id: '2', address: '456 Oak Ave', user_id: 'user-1' },
      ];

      pool.query.mockResolvedValue({ rows: mockProperties });

      const result = await PropertiesService.getAll('user-1');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM properties'),
        ['user-1']
      );
      expect(result).toEqual(mockProperties);
    });
  });
});
```

**8. Test Your Module**

```bash
# Run tests
npm test -- properties

# Test API locally
cd backend && npm run dev

# In another terminal:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/v1/properties
```

---

## Current Module Breakdown

### Core Modules (4)

The foundational business entities - everything else supports these:

| Module | Path | Purpose | Key Files |
|--------|------|---------|-----------|
| **Escrows** | `core-modules/escrows` | Transaction management | controllers/, services/commission/, services/zillow/ |
| **Clients** | `core-modules/clients` | Client relationship mgmt | controllers/, services/ |
| **Leads** | `core-modules/leads` | Lead tracking | controllers/, services/ |
| **Appointments** | `core-modules/appointments` | Calendar/scheduling | controllers/, services/ |

### Operations Modules (2)

| Module | Path | Purpose |
|--------|------|---------|
| **Listings** | `operations/listings` | Property listings |
| **Documents** | `operations/documents` | File management |

### CRM Modules (1)

| Module | Path | Purpose |
|--------|------|---------|
| **Contacts** | `crm/contacts` | Contact management with roles |

### System Modules (8)

| Module | Path | Purpose |
|--------|------|---------|
| **Auth** | `system/auth` | Authentication (JWT, refresh tokens) |
| **Teams** | `system/teams` | Multi-tenant team management |
| **Users** | `system/users` | User profiles and settings |
| **Onboarding** | `system/onboarding` | User onboarding flow |
| **Admin** | `system/admin` | Admin dashboard and tools |
| **Waitlist** | `system/waitlist` | Pre-launch waitlist |
| **Link Preview** | `system/link-preview` | URL metadata fetching |
| **Stats** | `system/stats` | Dashboard statistics |

### Workflow Modules (2)

| Module | Path | Purpose |
|--------|------|---------|
| **Projects** | `workflow/projects` | Dev roadmap (admin-only) |
| **Tasks** | `workflow/tasks` | Task management with checklists |

### Integration Modules (3)

| Module | Path | Purpose |
|--------|------|---------|
| **Communications** | `integration/communications` | Email/SMS integration |
| **Webhooks** | `integration/webhooks` | External webhook handlers |
| **SkySlope** | `integration/skyslope` | Transaction mgmt integration |

### Financial Modules (3)

| Module | Path | Purpose |
|--------|------|---------|
| **Commissions** | `financial/commissions` | Commission tracking |
| **Invoices** | `financial/invoices` | Invoice management |
| **Expenses** | `financial/expenses` | Expense tracking |

**Total:** 23 modules across 7 categories

---

## Best Practices

### DO ✅

1. **Keep modules self-contained:** All related code lives together
2. **Use `__tests__/` for unit tests:** Follow Jest convention
3. **Export service instances:** `module.exports = new ServiceClass()`
4. **Centralize documentation:** Keep docs in `/docs`, not in modules
5. **Follow naming conventions:**
   - Controllers: `*.controller.js`
   - Services: `*.service.js` or `index.js`
   - Routes: `*.routes.js` or `index.js`
   - Tests: `*.test.js`
6. **Authenticate routes:** Always use `authenticate` middleware
7. **Handle errors consistently:** Return `{ success, data/error }` format
8. **Write tests first:** TDD helps design better APIs

### DON'T ❌

1. **Don't create module READMEs:** Documentation belongs in `/docs`
2. **Don't mix concerns:** Keep controller logic thin, business logic in services
3. **Don't bypass authentication:** Every route should verify user identity
4. **Don't put tests in `backend/src/tests/`:** That's for integration tests only
5. **Don't create duplicate files:** Use `git mv` to preserve history
6. **Don't skip error handling:** Always wrap in try/catch
7. **Don't hardcode values:** Use environment variables via `process.env`
8. **Don't use `var`:** Use `const` (preferred) or `let`

### Module Checklist

Before marking a module "complete," verify:

- [ ] Controllers handle HTTP requests only (thin layer)
- [ ] Business logic lives in services
- [ ] All routes are authenticated
- [ ] Unit tests exist in `__tests__/`
- [ ] Error handling uses try/catch
- [ ] Responses follow `{ success, data/error }` format
- [ ] Module is registered in [app.js](../backend/src/app.js)
- [ ] Database queries use parameterized statements (SQL injection prevention)
- [ ] Input validation is implemented
- [ ] Module follows naming conventions

---

## Migration Notes

### From Layered to DDD (October-November 2025)

**What Changed:**
1. **Tests moved:** Unit tests from `backend/src/tests/` → module `__tests__/` directories
2. **Import paths updated:** Tests now use relative imports (`../services` instead of `../../services`)
3. **README cleanup:** Removed all module READMEs (this document replaces them)
4. **Documentation centralized:** All architecture docs now in `/docs`

**What Stayed the Same:**
1. **Integration tests:** Still in `backend/src/tests/` (test full API endpoints)
2. **Shared libraries:** Still in `backend/src/lib/` (cross-cutting concerns)
3. **API contracts:** No breaking changes to endpoints
4. **Database schema:** No changes to database structure

**Key Commits:**
- Test migration: November 15, 2025
- README cleanup: November 15, 2025

---

## Additional Resources

- **Architecture Overview:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Reference:** [API_REFERENCE.md](API_REFERENCE.md)
- **Database Structure:** [DATABASE_STRUCTURE.md](DATABASE_STRUCTURE.md)
- **Security Reference:** [SECURITY_REFERENCE.md](SECURITY_REFERENCE.md)
- **Development Guide:** [../CLAUDE.md](../CLAUDE.md)

---

**Questions or Issues?**

If you're unsure about where a module should go or how to structure it, refer to existing modules in the same category as examples. The core modules (escrows, clients, leads, appointments) are the most mature and follow all best practices.
