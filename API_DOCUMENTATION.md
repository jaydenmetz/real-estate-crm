# Real Estate CRM API Documentation

## Overview

This document provides comprehensive documentation for the Real Estate CRM API. All endpoints follow RESTful conventions and return standardized JSON responses.

### Base URL
```
Production: https://api.jaydenmetz.com/v1
Development: http://localhost:5050/v1
```

### Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

**Note:** Some endpoints currently have authentication middleware commented out during development. These will be enforced in production.

### Standard Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": {} | [],
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  },
  "timestamp": "2025-07-14T10:30:00.000Z"
}
```

### Pagination
List endpoints support pagination with these query parameters:
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page
- `sort` (string) - Field to sort by
- `order` (string: "asc" | "desc") - Sort order

---

## Escrows

### List All Escrows
```http
GET /v1/escrows
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by escrow status |
| minPrice | number | Minimum purchase price |
| maxPrice | number | Maximum purchase price |
| closingDateStart | ISO8601 | Start date for closing date range |
| closingDateEnd | ISO8601 | End date for closing date range |
| page | integer | Page number (min: 1) |
| limit | integer | Items per page (min: 1) |

**Response:**
```json
{
  "success": true,
  "data": {
    "escrows": [
      {
        "id": "1",
        "propertyAddress": "123 Main St",
        "purchasePrice": 500000,
        "buyers": [{"name": "John Doe"}],
        "sellers": [{"name": "Jane Smith"}],
        "status": "Active",
        "closingDate": "2025-08-15T00:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pages": 3
  }
}
```

### Get Single Escrow
```http
GET /v1/escrows/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "propertyAddress": "123 Main St",
    "purchasePrice": 500000,
    "buyers": [{"name": "John Doe", "email": "john@example.com"}],
    "sellers": [{"name": "Jane Smith", "email": "jane@example.com"}],
    "status": "Active",
    "acceptanceDate": "2025-07-01T00:00:00.000Z",
    "closingDate": "2025-08-15T00:00:00.000Z",
    "propertyType": "Single Family",
    "escrowCompany": "ABC Escrow",
    "escrowOfficer": "Sarah Johnson",
    "checklist": {
      "earnestMoneyDeposited": true,
      "inspectionCompleted": false,
      "appraisalOrdered": true
    }
  }
}
```

### Create Escrow
```http
POST /v1/escrows
```

**Request Body:**
```json
{
  "propertyAddress": "456 Oak Ave",
  "purchasePrice": 750000,
  "buyers": [
    {
      "name": "Michael Brown",
      "email": "michael@example.com",
      "phone": "+1234567890"
    }
  ],
  "sellers": [
    {
      "name": "Lisa White",
      "email": "lisa@example.com"
    }
  ],
  "acceptanceDate": "2025-07-14T00:00:00.000Z",
  "closingDate": "2025-08-30T00:00:00.000Z",
  "propertyType": "Condo",
  "escrowCompany": "XYZ Escrow",
  "earnestMoneyDeposit": 25000,
  "downPayment": 150000,
  "loanAmount": 600000
}
```

### Update Escrow
```http
PUT /v1/escrows/:id
```

**Request Body (partial update allowed):**
```json
{
  "purchasePrice": 740000,
  "closingDate": "2025-09-01T00:00:00.000Z",
  "notes": "Price reduced after inspection"
}
```

### Delete Escrow
```http
DELETE /v1/escrows/:id
```

### Update Escrow Checklist
```http
PATCH /v1/escrows/:id/checklist
```

**Request Body:**
```json
{
  "item": "inspectionCompleted",
  "value": true,
  "note": "Inspection completed on 7/10, minor repairs needed"
}
```

### Parse RPA PDF
```http
POST /v1/escrows/parse-rpa
```

**Request:** Multipart form data
- Field name: `rpa`
- File type: PDF
- Max size: 10MB

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyAddress": "789 Pine St",
    "purchasePrice": 625000,
    "buyers": ["Robert Johnson"],
    "sellers": ["Maria Garcia"],
    "acceptanceDate": "2025-07-12T00:00:00.000Z",
    "closingDate": "2025-08-25T00:00:00.000Z"
  }
}
```

---

## Listings

### List All Listings
```http
GET /v1/listings
```

**Query Parameters:** Standard pagination parameters

**Response:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "1",
        "propertyAddress": "321 Elm St",
        "listPrice": 899000,
        "listingStatus": "Active",
        "propertyType": "Single Family",
        "listingDate": "2025-07-01T00:00:00.000Z",
        "daysOnMarket": 13
      }
    ],
    "total": 15,
    "page": 1,
    "pages": 2
  }
}
```

### Get Single Listing
```http
GET /v1/listings/:id
```

### Create Listing
```http
POST /v1/listings
```

**Request Body:**
```json
{
  "propertyAddress": "555 Maple Dr",
  "listPrice": 1250000,
  "sellers": [
    {
      "name": "David Chen",
      "email": "david@example.com"
    }
  ],
  "listingDate": "2025-07-14T00:00:00.000Z",
  "propertyType": "Single Family",
  "bedrooms": 4,
  "bathrooms": 3,
  "squareFeet": 2800,
  "lotSize": 0.25,
  "yearBuilt": 2015
}
```

### Update Listing
```http
PUT /v1/listings/:id
```

### Update Listing Status
```http
PATCH /v1/listings/:id/status
```

**Request Body:**
```json
{
  "status": "Pending",
  "note": "Offer accepted, entering escrow"
}
```

### Log Price Reduction
```http
POST /v1/listings/:id/price-reduction
```

**Request Body:**
```json
{
  "newPrice": 849000,
  "reason": "Market adjustment"
}
```

### Log Showing
```http
POST /v1/listings/:id/showings
```

**Request Body:**
```json
{
  "date": "2025-07-15T14:00:00.000Z",
  "buyerAgent": "Tom Wilson",
  "feedback": "Buyers loved the kitchen, concerned about street noise"
}
```

### Get Price History
```http
GET /v1/listings/:id/price-history
```

### Get Listing Analytics
```http
GET /v1/listings/analytics/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "views": 245,
    "showings": 8,
    "saves": 15,
    "priceChanges": 1,
    "daysOnMarket": 21,
    "averageTimeInArea": 35
  }
}
```

---

## Clients

### List All Clients
```http
GET /v1/clients
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "1",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah@example.com",
        "phone": "+1234567890",
        "clientType": "Buyer",
        "clientStatus": "Active",
        "createdAt": "2025-06-15T00:00:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pages": 15
  }
}
```

### Get Single Client
```http
GET /v1/clients/:id
```

### Create Client
```http
POST /v1/clients
```

**Request Body:**
```json
{
  "firstName": "Jennifer",
  "lastName": "Lee",
  "email": "jennifer@example.com",
  "phone": "+1234567891",
  "clientType": "Buyer",
  "budget": 800000,
  "preApproved": true,
  "notes": "Looking for 3+ bedrooms in good school district"
}
```

### Update Client
```http
PUT /v1/clients/:id
```

### Delete Client
```http
DELETE /v1/clients/:id
```

### Add Client Note
```http
POST /v1/clients/:id/notes
```

**Request Body:**
```json
{
  "note": "Spoke with client about new listing on Oak St",
  "category": "General"
}
```

### Update Client Tags
```http
PATCH /v1/clients/:id/tags
```

**Request Body:**
```json
{
  "tags": ["First Time Buyer", "Cash Buyer", "Investor"]
}
```

---

## Appointments

### List All Appointments
```http
GET /v1/appointments
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "1",
        "title": "Property Showing - 123 Main St",
        "appointmentType": "Property Showing",
        "date": "2025-07-15T00:00:00.000Z",
        "startTime": "14:00",
        "duration": 60,
        "status": "Scheduled",
        "attendees": ["John Doe", "Sarah Agent"]
      }
    ],
    "total": 45,
    "page": 1,
    "pages": 5
  }
}
```

### Get Single Appointment
```http
GET /v1/appointments/:id
```

### Create Appointment
```http
POST /v1/appointments
```

**Request Body:**
```json
{
  "title": "Buyer Consultation - Smith Family",
  "appointmentType": "Buyer Consultation",
  "date": "2025-07-16T00:00:00.000Z",
  "startTime": "10:00",
  "duration": 90,
  "location": "Office",
  "attendees": ["Mike Smith", "Lisa Smith"],
  "notes": "First time buyers, discuss loan options"
}
```

### Update Appointment
```http
PUT /v1/appointments/:id
```

### Cancel Appointment
```http
POST /v1/appointments/:id/cancel
```

**Request Body:**
```json
{
  "reason": "Buyer requested to reschedule"
}
```

### Complete Appointment
```http
POST /v1/appointments/:id/complete
```

**Request Body:**
```json
{
  "outcome": "Successful showing, buyers interested",
  "followUpRequired": true,
  "followUpNotes": "Send comparable sales data"
}
```

---

## Leads

### List All Leads
```http
GET /v1/leads
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "1",
        "firstName": "Mark",
        "lastName": "Wilson",
        "email": "mark@example.com",
        "phone": "+1234567892",
        "leadSource": "Zillow",
        "leadType": "Buyer",
        "leadStatus": "New",
        "createdAt": "2025-07-14T08:00:00.000Z"
      }
    ],
    "total": 85,
    "page": 1,
    "pages": 9
  }
}
```

### Get Single Lead
```http
GET /v1/leads/:id
```

### Create Lead
```http
POST /v1/leads
```

**Request Body:**
```json
{
  "firstName": "Emily",
  "lastName": "Davis",
  "email": "emily@example.com",
  "phone": "+1234567893",
  "leadSource": "Website Contact Form",
  "leadType": "Seller",
  "propertyInterest": "Looking to sell condo downtown",
  "expectedTimeline": "3-6 months"
}
```

### Update Lead
```http
PUT /v1/leads/:id
```

### Convert Lead to Client
```http
POST /v1/leads/:id/convert
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientId": "152",
    "message": "Lead successfully converted to client"
  }
}
```

### Log Lead Activity
```http
POST /v1/leads/:id/activities
```

**Request Body:**
```json
{
  "activityType": "Phone Call",
  "notes": "Discussed market conditions and pricing strategy",
  "outcome": "Scheduled listing appointment",
  "nextAction": "Prepare CMA before meeting"
}
```

---

## AI Agents

### Get All AI Agents
```http
GET /v1/ai/agents
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alex",
      "name": "Alex - Sales Team Lead",
      "role": "Team Lead",
      "status": "active",
      "description": "Manages team operations and client communications",
      "capabilities": ["lead_management", "team_coordination", "reporting"]
    }
  ]
}
```

### Toggle AI Agent
```http
PATCH /v1/ai/agents/:id/toggle
```

**Request Body:**
```json
{
  "enabled": true
}
```

### Get Token Usage
```http
GET /v1/ai/token-usage
```

**Query Parameters:**
- `startDate` - ISO8601 date
- `endDate` - ISO8601 date
- `agentId` - Filter by specific agent

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTokens": 125000,
    "totalCost": 12.50,
    "byAgent": {
      "alex": {
        "tokens": 45000,
        "cost": 4.50
      }
    }
  }
}
```

### Get Daily Briefing (Alex)
```http
GET /v1/ai/alex/daily-briefing
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-07-14",
    "summary": {
      "newLeads": 5,
      "appointments": 3,
      "urgentTasks": 2,
      "closingsThisWeek": 1
    },
    "priorities": [
      "Follow up with Johnson family on offer",
      "Prepare for 2pm listing presentation"
    ]
  }
}
```

### Process Lead with AI
```http
POST /v1/ai/process-lead
```

**Request Body:**
```json
{
  "leadId": "123",
  "action": "qualify",
  "context": {
    "source": "Zillow inquiry",
    "message": "Interested in seeing 123 Main St"
  }
}
```

---

## Analytics

### Dashboard Analytics
```http
GET /v1/analytics/dashboard
```

**Note:** Currently returns mock data. Will be connected to real data aggregation in production.

**Response:**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalRevenue": 2450000,
      "activeListings": 12,
      "pendingEscrows": 8,
      "closedYTD": 24
    },
    "performance": {
      "listingToContract": 21,
      "averageSalePrice": 680000,
      "listToSaleRatio": 0.98
    },
    "pipeline": {
      "buyers": 15,
      "sellers": 8,
      "totalValue": 12500000
    },
    "recentActivity": [
      {
        "type": "new_lead",
        "description": "New buyer lead from Zillow",
        "timestamp": "2025-07-14T09:30:00.000Z"
      }
    ]
  }
}
```

### Escrow Analytics
```http
GET /v1/analytics/escrow/:id
```

Get detailed analytics and insights for a specific escrow transaction.

**Response:**
```json
{
  "success": true,
  "data": {
    "completion_percentage": 75,
    "days_until_closing": 15,
    "commission_breakdown": {
      "listing_side": 15000,
      "buying_side": 15000,
      "adjustments": -500
    },
    "risk_factors": [],
    "milestone_progress": {
      "inspection": 100,
      "appraisal": 100,
      "loan_approval": 80,
      "closing_prep": 50
    }
  }
}
```

### Listing Analytics
```http
GET /v1/analytics/listing/:id
```

Get performance analytics and trends for a specific listing.

**Response:**
```json
{
  "success": true,
  "data": {
    "showing_trend": [
      {"date": "2025-07-17T00:00:00.000Z", "showings": 3}
    ],
    "views_trend": [
      {"date": "2025-07-17T00:00:00.000Z", "views": 45}
    ],
    "average_showings_per_week": 12,
    "view_to_showing_ratio": 0.15
  }
}
```

### Appointment Analytics
```http
GET /v1/analytics/appointments/:id
```

Get analytics and related information for a specific appointment.

**Response:**
```json
{
  "success": true,
  "data": {
    "related_appointments": [],
    "average_duration": 60,
    "typical_outcome": "Positive",
    "conversion_rate": 0.75
  }
}
```

### Lead Analytics
```http
GET /v1/analytics/lead/:id
```

Get engagement analytics and conversion insights for a specific lead.

**Response:**
```json
{
  "success": true,
  "data": {
    "engagement_trend": [],
    "conversion_probability": 0.65,
    "recommended_actions": [
      "Follow up within 24 hours",
      "Send property matches",
      "Schedule viewing"
    ],
    "similar_leads_converted": 8
  }
}
```

---

## Additional Entity Endpoints

### Get Client Transactions
```http
GET /v1/clients/:id/transactions
```

Get all closed transactions for a specific client.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "esc_789012",
      "property_address": "123 Main St, San Diego, CA 92101",
      "purchase_price": 750000,
      "closing_date": "2025-06-15T00:00:00.000Z",
      "gross_commission": 22500,
      "transaction_type": "Buyer",
      "commission_earned": 7875
    }
  ]
}
```

### Get Communications
```http
GET /v1/clients/:id/communications
GET /v1/leads/:id/communications
```

Get communication history for a client or lead.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "comm_123",
      "type": "email",
      "subject": "Property Update",
      "content": "Hi! I wanted to share some new listings...",
      "direction": "outbound",
      "status": "delivered",
      "created_at": "2025-07-16T15:30:00Z"
    }
  ]
}
```

### Get Client Notes
```http
GET /v1/clients/:id/notes
```

Get all notes associated with a client.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "note_456",
      "content": "Client prefers modern homes with open floor plans",
      "type": "preference",
      "created_by": "agent_123",
      "created_at": "2025-07-15T09:00:00Z"
    }
  ]
}
```

### Update Entity Checklists
```http
PUT /v1/escrows/:id/checklist
PUT /v1/listings/:id/checklist
PUT /v1/clients/:id/checklist
PUT /v1/appointments/:id/checklist
PUT /v1/leads/:id/checklist
```

Update checklist items for any entity type.

**Request Body:**
```json
{
  "checklist": [
    {
      "id": "chk_001",
      "task": "Order title report",
      "completed": true,
      "completedDate": "2025-07-15T10:00:00Z"
    }
  ]
}
```

### Property Search
```http
GET /v1/properties/search
```

Search for properties by address.

**Query Parameters:**
- `address` (string) - Partial or full address to search

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "lst_789012",
      "property_address": "123 Main St, San Diego, CA 92101",
      "list_price": 750000,
      "bedrooms": 3,
      "bathrooms": 2,
      "square_footage": 1800,
      "status": "active"
    }
  ]
}
```

---

## AI Team Integration

### Get AI Team Status
```http
GET /v1/ai/team
```

Get status and information about all AI team members.

**Response:**
```json
{
  "success": true,
  "data": {
    "team_members": [
      {
        "id": "alex",
        "name": "Alex - Sales Team Lead",
        "status": "active",
        "current_tasks": 3,
        "specialties": ["lead_management", "client_communication"]
      },
      {
        "id": "morgan",
        "name": "Morgan - Listing Specialist",
        "status": "active",
        "current_tasks": 2,
        "specialties": ["listing_optimization", "market_analysis"]
      }
    ],
    "total_tasks_completed_today": 45,
    "average_response_time": "2.3s"
  }
}
```

### Trigger AI Task
```http
POST /v1/ai/team/task
```

Assign a task to the appropriate AI team member.

**Request Body:**
```json
{
  "task_type": "lead_qualification",
  "entity_id": "lead_123",
  "priority": "high",
  "context": {
    "source": "Website inquiry",
    "property_interest": "3BR homes in downtown"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `FORBIDDEN` | User lacks required permissions |
| `NOT_FOUND` | Requested resource not found |
| `VALIDATION_ERROR` | Request body validation failed |
| `DUPLICATE_ENTRY` | Attempting to create duplicate record |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated requests

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Webhooks

Configure webhooks to receive real-time updates for:
- New leads
- Escrow status changes
- Listing status changes
- Appointment updates

Webhook configuration endpoint:
```http
POST /v1/webhooks
```

---

## WebSocket Events

Connect to WebSocket for real-time updates:
```javascript
const ws = new WebSocket('wss://api.jaydenmetz.com');
```

### Event Types:
- `lead:new` - New lead created
- `escrow:update` - Escrow status changed
- `listing:update` - Listing updated
- `ai:status` - AI agent status update
- `notification` - General notifications

---

## SDK Examples

### JavaScript/Node.js
```javascript
const api = require('@your-company/crm-sdk');

const client = new api.Client({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.jaydenmetz.com/v1'
});

// Get all active listings
const listings = await client.listings.list({
  status: 'Active',
  limit: 20
});

// Create new lead
const lead = await client.leads.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  leadSource: 'Website'
});
```

### Python
```python
from crm_sdk import Client

client = Client(
    api_key='your-api-key',
    base_url='https://api.jaydenmetz.com/v1'
)

# Get escrow details
escrow = client.escrows.get('123')

# Update client information
client.clients.update('456', {
    'clientStatus': 'Active',
    'notes': 'Ready to make offers'
})
```

---

## Implementation Status

### Current State (July 2025)

**Fully Implemented:**
- Basic CRUD operations for all entities (Escrows, Listings, Clients, Appointments, Leads)
- Standard response format and error handling
- WebSocket support for real-time updates
- File upload for RPA parsing

**Partially Implemented (Mock Data):**
- Analytics Dashboard endpoint (`/v1/analytics/dashboard`)
- Entity-specific analytics endpoints
- AI agent endpoints (basic structure in place)
- Some listing analytics return randomized data

**Pending Implementation:**
- Full authentication enforcement (currently disabled on some routes)
- Real data aggregation for analytics endpoints
- Integration with external services (MLS, email providers)
- Webhook delivery system
- Rate limiting enforcement
- Full AI agent task execution

### Development Notes

1. **Mock Data**: Several endpoints currently return static or randomized mock data for development purposes. These are marked with notes in the documentation.

2. **Authentication**: While the authentication middleware is implemented, it's currently commented out on many routes to facilitate development. All routes will require authentication in production.

3. **Database**: The system is designed to work with PostgreSQL, but many endpoints currently return in-memory mock data.

4. **AI Integration**: The AI agent framework is in place but requires integration with actual AI services for full functionality.

---

## Support

For API support, please contact:
- Email: api-support@your-company.com
- Documentation: https://docs.your-company.com/api
- Status Page: https://status.your-company.com