# Listings Module

**Status:** ✅ 100% Complete (Phase 2)
**Last Updated:** October 24, 2025

## Overview

The listings module manages property listings throughout their lifecycle from "Coming Soon" to "Sold". This module follows the same modular pattern established by the escrows module in Phase 1.

## Directory Structure

```
listings/
├── controllers/        # Request handlers
│   └── listings.controller.js  # All CRUD operations
├── models/             # Data models
│   ├── Listing.model.js        # Main listing model
│   └── Listing.mock.js         # Mock data for testing
├── routes/             # API routes
│   ├── index.js                # Main routes (mounted at /v1/listings)
│   └── health.routes.js        # Health check endpoints
├── tests/              # Test suite
│   ├── listings.controller.test.js
│   └── integration/
│       └── listings.integration.test.js
├── utils/              # Helper utilities (none yet)
└── README.md           # This file
```

## API Endpoints

### Main Routes (`/v1/listings`)
- `GET /` - List all listings (with filters, pagination)
- `POST /` - Create new listing
- `GET /:id` - Get listing by ID
- `PUT /:id` - Update listing
- `DELETE /:id` - Delete listing (soft delete)

### Health Routes (`/v1/listings/health/*`)
- `GET /health/basic` - Basic module health check
- `GET /health/database` - Database connectivity test
- `GET /health/crud` - CRUD operations test

## Controller

### listings.controller.js
**Purpose:** All listing CRUD operations
**Methods:**
- `getListings` - GET / - List with filters (status, price range, property type)
- `createListing` - POST / - Create new listing
- `getListingById` - GET /:id - Single listing
- `updateListing` - PUT /:id - Update listing
- `deleteListing` - DELETE /:id - Soft delete listing

## Database Schema

**Primary Table:** `listings`

**Key Fields:**
- `id` (VARCHAR) - Primary key (e.g., `list_abc123def456`)
- `property_address` - Property being listed
- `mls_number` - Multiple Listing Service number
- `listing_status` - Coming Soon, Active, Pending, Sold, Expired, Withdrawn, Cancelled
- `list_price` - Listing price
- `listing_date` - Date property was listed
- `property_type` - Single Family, Condo, Townhouse, Multi-Family, Land, Commercial
- `user_id` - Creator/owner
- `team_id` - Team assignment

**Relationships:**
- `listing_agent_id` → `users.id`
- `seller_id` → `contacts.id`

## Authentication

All endpoints require authentication via:
- **JWT Token** - For user sessions
- **API Key** - For external integrations

**Authorization:**
- Users can only access listings in their team
- System admins can access all listings

## Usage Example

```javascript
// Create listing
POST /v1/listings
{
  "propertyAddress": "456 Oak St, Anytown, CA 90210",
  "listPrice": 575000,
  "listingStatus": "Active",
  "propertyType": "Single Family",
  "listingDate": "2025-10-24",
  "mls_number": "MLS202512345"
}

// Get listing
GET /v1/listings/{id}

// Response:
{
  "success": true,
  "data": {
    "id": "list_abc123",
    "property_address": "456 Oak St, Anytown, CA 90210",
    "list_price": 575000,
    "listing_status": "Active",
    "property_type": "Single Family",
    "mls_number": "MLS202512345",
    "listing_date": "2025-10-24",
    "created_at": "2025-10-24T15:30:00Z"
  }
}
```

## Migration History

**Phase 2 (October 24, 2025):**
- ✅ Moved models from `backend/src/models/` to `modules/listings/models/`
- ✅ Moved routes from `backend/src/routes/` to `modules/listings/routes/`
- ✅ Moved controller from `backend/src/controllers/` to `modules/listings/controllers/`
- ✅ Moved tests from `backend/src/tests/` to `modules/listings/tests/`
- ✅ Deleted old `backend/src/controllers/listings/` folder (empty)
- ✅ Updated all import paths in routes, controllers, and models

**Before:** Listings code scattered across 4 directories
**After:** 100% modular (all listings code in `modules/listings/`)

## Future Improvements

**Planned Controller Refactoring:**
Currently listings has a single monolithic controller (35,014 bytes). Future work:
- Split into modular controllers like escrows:
  - `crud.controller.js` - Basic CRUD
  - `details.controller.js` - Complex queries with joins
  - `documents.controller.js` - Document management
  - `financials.controller.js` - Pricing and commission data
- Estimated time: 2-3 hours

## Maintainers

- **Primary:** Jayden Metz (admin@jaydenmetz.com)
- **Pattern:** Based on escrows module (Phase 1)
- **Reference Doc:** `docs/BACKEND_COMPLETE_REORGANIZATION_PLAN.md`
