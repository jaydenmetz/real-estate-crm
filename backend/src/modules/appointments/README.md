# Appointments Module

**Status:** ✅ 100% Complete (Phase 4)
**Last Updated:** October 24, 2025

## Overview

The appointments module manages calendar events, showings, meetings, and client interactions. This module follows the modular pattern established in Phases 1-3.

## Directory Structure

```
appointments/
├── controllers/        # Request handlers
│   └── appointments.controller.js  # All CRUD operations
├── models/             # Data models
│   ├── Appointment.model.js        # Main appointment model
│   └── Appointment.mock.js         # Mock data for testing
├── routes/             # API routes
│   └── index.js                    # Main routes (mounted at /v1/appointments)
├── tests/              # Test suite
│   ├── appointments.controller.test.js
│   └── integration/
│       └── appointments.integration.test.js
├── utils/              # Helper utilities (none yet)
└── README.md           # This file
```

## API Endpoints

### Main Routes (`/v1/appointments`)
- `GET /` - List all appointments (with filters, pagination)
- `POST /` - Create new appointment
- `GET /:id` - Get appointment by ID
- `PUT /:id` - Update appointment
- `DELETE /:id` - Delete appointment (soft delete)

## Controller

### appointments.controller.js
**Purpose:** All appointment CRUD operations
**Methods:**
- `getAppointments` - GET / - List with filters (date range, status, pagination)
- `createAppointment` - POST / - Create new appointment
- `getAppointmentById` - GET /:id - Single appointment
- `updateAppointment` - PUT /:id - Update appointment
- `deleteAppointment` - DELETE /:id - Soft delete appointment

## Database Schema

**Primary Table:** `appointments`

**Key Fields:**
- `id` (VARCHAR) - Primary key (e.g., `apt_abc123def456`)
- `title` - Appointment title/subject
- `description` - Detailed notes
- `appointment_date` - Date of appointment
- `start_time` - Start time
- `end_time` - End time
- `location` - Where appointment takes place
- `appointment_type` - showing, meeting, inspection, closing, etc.
- `status` - scheduled, completed, cancelled, no_show
- `user_id` - Creator/owner
- `team_id` - Team assignment

**Relationships:**
- `client_id` → `clients.id` (who the appointment is with)
- `property_id` → `listings.id` or `escrows.id` (related property)
- `user_id` → `users.id` (assigned agent)

## Authentication

All endpoints require authentication via:
- **JWT Token** - For user sessions
- **API Key** - For external integrations

**Authorization:**
- Users can only access appointments in their team
- System admins can access all appointments

## Usage Example

```javascript
// Create appointment
POST /v1/appointments
{
  "title": "Property Showing - 123 Main St",
  "description": "First showing for interested buyers",
  "appointmentDate": "2025-10-28",
  "startTime": "14:00:00",
  "endTime": "15:00:00",
  "location": "123 Main St, Anytown, CA 90210",
  "appointmentType": "showing",
  "status": "scheduled",
  "clientId": "client_abc123"
}

// Get appointment
GET /v1/appointments/{id}

// Response:
{
  "success": true,
  "data": {
    "id": "apt_abc123",
    "title": "Property Showing - 123 Main St",
    "description": "First showing for interested buyers",
    "appointment_date": "2025-10-28",
    "start_time": "14:00:00",
    "end_time": "15:00:00",
    "location": "123 Main St, Anytown, CA 90210",
    "appointment_type": "showing",
    "status": "scheduled",
    "client_id": "client_abc123",
    "created_at": "2025-10-24T16:00:00Z"
  }
}
```

## Migration History

**Phase 4 (October 24, 2025):**
- ✅ Moved models from `backend/src/models/` to `modules/appointments/models/`
- ✅ Moved routes from `backend/src/routes/` to `modules/appointments/routes/`
- ✅ Moved controller from `backend/src/controllers/` to `modules/appointments/controllers/`
- ✅ Moved tests from `backend/src/tests/` to `modules/appointments/tests/`
- ✅ Updated all import paths in routes, controller, and models

**Before:** Appointments code scattered across 4 directories
**After:** 100% modular (all appointments code in `modules/appointments/`)

## Future Improvements

**Planned Enhancements:**
- Calendar sync (Google Calendar, Outlook)
- SMS reminders via Twilio
- Automated no-show tracking
- Recurring appointments
- Video conferencing integration (Zoom, Google Meet)

**Controller Refactoring:**
Currently appointments has a single controller. Future work could include:
- Split into modular controllers:
  - `crud.controller.js` - Basic CRUD
  - `calendar.controller.js` - Calendar views and date queries
  - `reminders.controller.js` - SMS/email reminder management
  - `recurring.controller.js` - Recurring appointment logic
- Estimated time: 1-2 hours

## Maintainers

- **Primary:** Jayden Metz (admin@jaydenmetz.com)
- **Pattern:** Based on escrows (Phase 1), listings (Phase 2), and clients (Phase 3) modules
- **Reference Doc:** `docs/BACKEND_COMPLETE_REORGANIZATION_PLAN.md`
