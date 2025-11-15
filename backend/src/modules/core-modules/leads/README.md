# Leads Module

**Status:** ✅ 100% Complete (Phase 5)
**Last Updated:** October 24, 2025

## Overview

The leads module manages prospective clients through the sales funnel from initial contact to qualification. This module follows the modular pattern established in Phases 1-4.

## Directory Structure

```
leads/
├── controllers/        # Request handlers
│   └── leads.controller.js     # All CRUD operations
├── models/             # Data models
│   ├── Lead.model.js           # Main lead model
│   └── Lead.mock.js            # Mock data for testing
├── routes/             # API routes
│   └── index.js                # Main routes (mounted at /v1/leads)
├── tests/              # Test suite
│   ├── leads.controller.test.js
│   └── integration/
│       └── leads.integration.test.js
├── utils/              # Helper utilities (none yet)
└── README.md           # This file
```

## API Endpoints

### Main Routes (`/v1/leads`)
- `GET /` - List all leads (with filters, pagination)
- `POST /` - Create new lead
- `GET /:id` - Get lead by ID
- `PUT /:id` - Update lead
- `DELETE /:id` - Delete lead (soft delete)

## Controller

### leads.controller.js
**Purpose:** All lead CRUD operations
**Methods:**
- `getLeads` - GET / - List with filters (status, type, search, pagination)
- `createLead` - POST / - Create new lead
- `getLeadById` - GET /:id - Single lead
- `updateLead` - PUT /:id - Update lead
- `deleteLead` - DELETE /:id - Soft delete lead

## Database Schema

**Primary Table:** `leads`

**Key Fields:**
- `id` (VARCHAR) - Primary key (e.g., `lead_abc123def456`)
- `first_name` - Lead first name
- `last_name` - Lead last name
- `email` - Email address
- `phone` - Phone number
- `lead_source` - Where lead came from (website, referral, zillow, etc.)
- `lead_status` - new, contacted, qualified, unqualified, converted
- `lead_type` - buyer, seller, both
- `interest_level` - hot, warm, cold
- `notes` - Additional notes
- `user_id` - Creator/owner
- `team_id` - Team assignment

**Relationships:**
- `user_id` → `users.id` (assigned agent)
- `team_id` → `teams.id`
- Can convert to `clients.id` (when qualified)

## Authentication

All endpoints require authentication via:
- **JWT Token** - For user sessions
- **API Key** - For external integrations

**Authorization:**
- Users can only access leads in their team
- System admins can access all leads

## Usage Example

```javascript
// Create lead
POST /v1/leads
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "555-987-6543",
  "leadSource": "zillow",
  "leadType": "buyer",
  "leadStatus": "new",
  "interestLevel": "hot",
  "notes": "Interested in properties in downtown area"
}

// Get lead
GET /v1/leads/{id}

// Response:
{
  "success": true,
  "data": {
    "id": "lead_abc123",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "555-987-6543",
    "lead_source": "zillow",
    "lead_type": "buyer",
    "lead_status": "new",
    "interest_level": "hot",
    "notes": "Interested in properties in downtown area",
    "created_at": "2025-10-24T16:30:00Z"
  }
}
```

## Migration History

**Phase 5 (October 24, 2025):**
- ✅ Moved models from `backend/src/models/` to `modules/leads/models/`
- ✅ Moved routes from `backend/src/routes/` to `modules/leads/routes/`
- ✅ Moved controller from `backend/src/controllers/` to `modules/leads/controllers/`
- ✅ Moved tests from `backend/src/tests/` to `modules/leads/tests/`
- ✅ Updated all import paths in routes, controller, and models

**Before:** Leads code scattered across 4 directories
**After:** 100% modular (all leads code in `modules/leads/`)

## Future Improvements

**Planned Enhancements:**
- Lead scoring algorithm (based on activity, interest level, source)
- Automated follow-up reminders
- Integration with marketing automation platforms
- Lead nurture campaigns
- Conversion tracking and analytics

**Controller Refactoring:**
Currently leads has a single controller. Future work could include:
- Split into modular controllers:
  - `crud.controller.js` - Basic CRUD
  - `scoring.controller.js` - Lead scoring and qualification
  - `conversion.controller.js` - Convert leads to clients
  - `campaigns.controller.js` - Marketing campaign management
- Estimated time: 1-2 hours

## Maintainers

- **Primary:** Jayden Metz (admin@jaydenmetz.com)
- **Pattern:** Based on escrows, listings, clients, and appointments modules
- **Reference Doc:** `docs/BACKEND_COMPLETE_REORGANIZATION_PLAN.md`
