# Real Estate CRM API Documentation

## Overview

This document provides comprehensive documentation for the Real Estate CRM API. All endpoints follow RESTful conventions and return standardized JSON responses.

### Base URL
```
https://crm.jaydenmetz.com/api/v1
```

### Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

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
const ws = new WebSocket('wss://crm.jaydenmetz.com');
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
  baseUrl: 'https://crm.jaydenmetz.com/api/v1'
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
    base_url='https://crm.jaydenmetz.com/api/v1'
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

## Support

For API support, please contact:
- Email: api-support@your-company.com
- Documentation: https://docs.your-company.com/api
- Status Page: https://status.your-company.com