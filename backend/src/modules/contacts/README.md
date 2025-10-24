# Contacts Module

**Status:** ✅ 100% Complete (Phase 6 - FINAL)
**Last Updated:** October 24, 2025

## Overview

The contacts module manages a unified contact database for all people and organizations in the CRM. This is the final module in the backend reorganization, completing the modular architecture pattern established in Phases 1-5.

## Directory Structure

```
contacts/
├── controllers/        # Request handlers
│   ├── contacts.controller.js       # Contact CRUD operations
│   └── contact-roles.controller.js  # Role management
├── models/             # Data models (none - uses database directly)
├── routes/             # API routes
│   ├── index.js                     # Main routes (mounted at /v1/contacts)
│   └── contact-roles.routes.js      # Role routes (mounted at /v1/contact-roles)
├── tests/              # Test suite
│   └── integration/
│       ├── contacts-multi-role.test.js
│       └── contact-search.test.js
├── utils/              # Helper utilities (none yet)
└── README.md           # This file
```

## API Endpoints

### Main Routes (`/v1/contacts`)
- `GET /` - List all contacts (with filters)
- `GET /search` - Search contacts by role and name
- `GET /:id` - Get contact by ID
- `POST /` - Create new contact
- `PUT /:id` - Update contact
- `PATCH /:id/archive` - Archive contact
- `PATCH /:id/restore` - Restore archived contact
- `DELETE /:id` - Permanently delete contact

### Contact Roles Routes (`/v1/contact-roles`)
- `GET /` - List all available contact roles
- `POST /:contactId/roles` - Assign role to contact
- `DELETE /:contactId/roles/:roleId` - Remove role from contact

## Controllers

### contacts.controller.js
**Purpose:** Contact CRUD operations and management
**Methods:**
- `list` - GET / - List contacts with filters
- `search` - GET /search - Search by role and name
- `getById` - GET /:id - Single contact
- `create` - POST / - Create new contact
- `update` - PUT /:id - Update contact
- `archive` - PATCH /:id/archive - Archive contact
- `restore` - PATCH /:id/restore - Restore archived contact
- `deleteContact` - DELETE /:id - Permanently delete

### contact-roles.controller.js
**Purpose:** Manage contact role assignments
**Methods:**
- `list` - GET / - List available roles
- `assignRole` - POST /:contactId/roles - Assign role
- `removeRole` - DELETE /:contactId/roles/:roleId - Remove role

## Database Schema

**Primary Table:** `contacts`

**Key Fields:**
- `id` (UUID) - Primary key
- `first_name` - First name
- `last_name` - Last name
- `email` - Email address
- `phone` - Phone number
- `company` - Company/organization name
- `role` - Contact role (lead, client, vendor, etc.)
- `archived` - Soft delete flag
- `user_id` - Creator/owner
- `team_id` - Team assignment

**Contact Roles Table:** `contact_roles`
- Links contacts to multiple roles (many-to-many)
- Supports complex scenarios (e.g., someone who is both a client and a vendor)

## Authentication

All endpoints require authentication via:
- **JWT Token** - For user sessions
- **API Key** - For external integrations

**Authorization:**
- Users can only access contacts in their team
- System admins can access all contacts

## Usage Example

```javascript
// Create contact
POST /v1/contacts
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "555-234-5678",
  "company": "Johnson Enterprises",
  "role": "client"
}

// Search contacts
GET /v1/contacts/search?role=lead&name=johnson

// Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "first_name": "Sarah",
      "last_name": "Johnson",
      "email": "sarah.johnson@example.com",
      "phone": "555-234-5678",
      "company": "Johnson Enterprises",
      "role": "client",
      "archived": false
    }
  ]
}

// Assign multiple roles
POST /v1/contact-roles/uuid-123/roles
{
  "roleId": "vendor_role_id"
}
```

## Migration History

**Phase 6 (October 24, 2025) - FINAL PHASE:**
- ✅ Moved routes from `backend/src/routes/` to `modules/contacts/routes/` (2 files)
- ✅ Moved controllers from `backend/src/controllers/` to `modules/contacts/controllers/` (2 files)
- ✅ Moved tests from `backend/src/tests/` to `modules/contacts/tests/` (2 files)
- ✅ Updated all import paths in routes and controllers
- ✅ No models (contacts uses database directly)

**Before:** Contacts code scattered across 3 directories
**After:** 100% modular (all contacts code in `modules/contacts/`)

## Special Notes

**No Models:**
Unlike other modules, contacts doesn't have separate model files. It directly queries the database via the pool connection. This is a valid architectural choice for simpler modules.

**Multiple Routes:**
Contacts is unique in having two separate route files:
- `index.js` - Main contact operations
- `contact-roles.routes.js` - Role management

Both are part of the same module but mounted at different API paths.

## Future Improvements

**Planned Enhancements:**
- Add contact models for data validation
- Contact merge/deduplication
- Contact import/export (CSV, vCard)
- Contact segmentation and tagging
- Activity timeline per contact
- Email integration (Gmail, Outlook)

**Controller Refactoring:**
Currently contacts has 2 controllers. Future work could include:
- Split contacts.controller.js into modular controllers:
  - `crud.controller.js` - Basic CRUD
  - `search.controller.js` - Advanced search and filters
  - `import-export.controller.js` - Bulk operations
  - `activity.controller.js` - Contact activity tracking
- Estimated time: 1-2 hours

## Completion Status

**Phase 6 marks the completion of the backend reorganization project!**

All 6 core modules are now 100% modular:
1. ✅ Escrows (6 controllers)
2. ✅ Listings (1 controller)
3. ✅ Clients (1 controller)
4. ✅ Appointments (1 controller)
5. ✅ Leads (1 controller)
6. ✅ Contacts (2 controllers)

The backend now mirrors the frontend's clean, modular structure.

## Maintainers

- **Primary:** Jayden Metz (admin@jaydenmetz.com)
- **Pattern:** Based on escrows, listings, clients, appointments, and leads modules
- **Reference Doc:** `docs/BACKEND_COMPLETE_REORGANIZATION_PLAN.md`
- **Status:** ✅ **Backend Reorganization 100% Complete**
