# Clients Module

**Status:** ✅ 100% Complete (Phase 3)
**Last Updated:** October 24, 2025

## Overview

The clients module manages customer relationship data including buyers, sellers, and prospects. This module follows the modular pattern established in Phases 1 (escrows) and 2 (listings).

## Directory Structure

```
clients/
├── controllers/        # Request handlers
│   └── clients.controller.js   # All CRUD operations
├── models/             # Data models
│   ├── Client.model.js         # Main client model
│   └── Client.mock.js          # Mock data for testing
├── routes/             # API routes
│   └── index.js                # Main routes (mounted at /v1/clients)
├── tests/              # Test suite
│   ├── clients.controller.test.js
│   └── integration/
│       └── clients.integration.test.js
├── utils/              # Helper utilities (none yet)
└── README.md           # This file
```

## API Endpoints

### Main Routes (`/v1/clients`)
- `GET /` - List all clients (with filters, pagination)
- `POST /` - Create new client
- `GET /:id` - Get client by ID
- `PUT /:id` - Update client
- `DELETE /:id` - Delete client (soft delete)

## Controller

### clients.controller.js
**Purpose:** All client CRUD operations
**Methods:**
- `getAllClients` - GET / - List with filters (status, search, pagination)
- `createClient` - POST / - Create new client
- `getClientById` - GET /:id - Single client
- `updateClient` - PUT /:id - Update client
- `deleteClient` - DELETE /:id - Soft delete client

## Database Schema

**Primary Table:** `clients`

**Key Fields:**
- `id` (VARCHAR) - Primary key (e.g., `client_abc123def456`)
- `first_name` - Client first name
- `last_name` - Client last name
- `preferred_name` - How client prefers to be addressed
- `client_status` - active, inactive, prospect
- `email` - Primary email
- `phone` - Primary phone
- `address` - Street address
- `city` - City
- `state` - State
- `zip_code` - Zip code
- `user_id` - Creator/owner
- `team_id` - Team assignment

**Relationships:**
- `user_id` → `users.id` (assigned agent)
- `team_id` → `teams.id`

## Authentication

All endpoints require authentication via:
- **JWT Token** - For user sessions
- **API Key** - For external integrations

**Authorization:**
- Users can only access clients in their team
- System admins can access all clients

## Usage Example

```javascript
// Create client
POST /v1/clients
{
  "firstName": "John",
  "lastName": "Doe",
  "preferredName": "Johnny",
  "email": "john.doe@example.com",
  "phone": "555-123-4567",
  "clientStatus": "active",
  "address": "789 Elm St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "90210"
}

// Get client
GET /v1/clients/{id}

// Response:
{
  "success": true,
  "data": {
    "id": "client_abc123",
    "first_name": "John",
    "last_name": "Doe",
    "preferred_name": "Johnny",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "client_status": "active",
    "address": "789 Elm St",
    "city": "Anytown",
    "state": "CA",
    "zip_code": "90210",
    "created_at": "2025-10-24T15:45:00Z"
  }
}
```

## Migration History

**Phase 3 (October 24, 2025):**
- ✅ Moved models from `backend/src/models/` to `modules/clients/models/`
- ✅ Moved routes from `backend/src/routes/` to `modules/clients/routes/`
- ✅ Moved controller from `backend/src/controllers/` to `modules/clients/controllers/`
- ✅ Moved tests from `backend/src/tests/` to `modules/clients/tests/`
- ✅ Updated all import paths in routes, controller, and models

**Before:** Clients code scattered across 4 directories
**After:** 100% modular (all clients code in `modules/clients/`)

## Future Improvements

**Planned Controller Refactoring:**
Currently clients has a single controller. Future work could include:
- Split into modular controllers:
  - `crud.controller.js` - Basic CRUD
  - `details.controller.js` - Complex queries with relationships
  - `communications.controller.js` - Email/SMS history
  - `notes.controller.js` - Client notes and interactions
- Estimated time: 1-2 hours

## Maintainers

- **Primary:** Jayden Metz (admin@jaydenmetz.com)
- **Pattern:** Based on escrows (Phase 1) and listings (Phase 2) modules
- **Reference Doc:** `docs/BACKEND_COMPLETE_REORGANIZATION_PLAN.md`
