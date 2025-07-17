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

**Note:** Returns comprehensive escrow data including property details, timeline, documents, AI agents, and market data. See [ESCROW_API_STRUCTURE.md](/backend/ESCROW_API_STRUCTURE.md) for complete response structure.

**Response (Simplified):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "escrowNumber": "ESC-2025-001",
    "propertyAddress": "456 Ocean View Dr, La Jolla, CA 92037",
    "purchasePrice": 1250000,
    "status": "Active",
    "escrowStatus": "Active",
    "currentStage": "Inspection",
    "closingDate": "2025-08-15T00:00:00.000Z",
    "daysToClose": 30,
    
    "property": {
      "type": "Single Family",
      "bedrooms": 4,
      "bathrooms": 3,
      "sqft": 2800,
      "yearBuilt": 2018,
      "images": ["..."]
    },
    
    "buyer": {
      "name": "Michael & Sarah Chen",
      "email": "chen.family@email.com",
      "phone": "(858) 555-1234",
      "agent": "Sarah Johnson"
    },
    
    "seller": {
      "name": "Robert Johnson",
      "email": "rjohnson@email.com",
      "phone": "(858) 555-5678",
      "agent": "Mike Davis"
    },
    
    "checklist": {
      "Pre-Contract": { "...": true },
      "Contract to Close": { "...": false },
      "Closing": { "...": false }
    },
    
    "timeline": [ "..." ],
    "documents": [ "..." ],
    "aiAgents": [ "..." ],
    "recentActivity": [ "..." ],
    "marketData": { "..." }
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

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by listing status (Active, Pending, Sold, etc.) |
| propertyType | string | Filter by property type |
| minPrice | number | Minimum list price |
| maxPrice | number | Maximum list price |
| minBedrooms | number | Minimum number of bedrooms |
| minBathrooms | number | Minimum number of bathrooms |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |
| sort | string | Sort field (default: listingDate) |
| order | string | Sort order: asc or desc |

**Response:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "1",
        "propertyAddress": "123 Main Street",
        "city": "San Diego",
        "state": "CA",
        "zipCode": "92101",
        "fullAddress": "123 Main Street, San Diego, CA 92101",
        "mlsNumber": "SD2025001",
        "listingStatus": "Active",
        "listPrice": 850000,
        "originalListPrice": 875000,
        "pricePerSqft": 354,
        "propertyType": "Single Family",
        "bedrooms": 4,
        "bathrooms": 3,
        "halfBathrooms": 0,
        "squareFootage": 2400,
        "lotSize": 7200,
        "yearBuilt": 2018,
        "garage": 2,
        "pool": true,
        "listingDate": "2025-06-15T00:00:00.000Z",
        "daysOnMarket": 32,
        "virtualTourLink": "https://example.com/tour/123",
        "primaryImage": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
        "showings": 12,
        "views": 342,
        "favorites": 28,
        "listingAgent": {
          "id": 1,
          "name": "Jayden Metz",
          "email": "jayden@luxuryrealty.com"
        }
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pages": 2,
      "limit": 20
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Get Single Listing
```http
GET /v1/listings/:id
```

**Response (Comprehensive):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "propertyAddress": "123 Main Street",
    "city": "San Diego",
    "state": "CA",
    "zipCode": "92101",
    "listPrice": 850000,
    "propertyType": "Single Family",
    "bedrooms": 4,
    "bathrooms": 3,
    "squareFootage": 2400,
    
    "taxes": 10625,
    "hoaDues": 0,
    "insurance": 3400,
    "utilities": 350,
    
    "features": {
      "interior": ["Gourmet Kitchen", "Hardwood Floors", "Master Suite"],
      "exterior": ["Pool & Spa", "Solar Panels", "Landscaping"],
      "community": ["Smart Home", "EV Charging"]
    },
    
    "rooms": [
      { "name": "Master Bedroom", "dimensions": "18x20", "level": 2 },
      { "name": "Living Room", "dimensions": "22x25", "level": 1 }
    ],
    
    "schools": [
      { "name": "La Jolla Elementary", "rating": 9, "distance": "0.5 mi" }
    ],
    
    "activityLog": [
      {
        "date": "2025-07-15T00:00:00.000Z",
        "type": "showing",
        "agent": "Sarah Johnson - Coastal Realty",
        "feedback": "Buyers loved the property"
      }
    ],
    
    "analytics": {
      "views": 342,
      "viewsThisWeek": 51,
      "viewsTrend": "up",
      "viewsBySource": [
        { "source": "MLS", "views": 137 },
        { "source": "Zillow", "views": 103 }
      ]
    },
    
    "marketingChecklist": {
      "photography": true,
      "virtualTour": true,
      "droneVideo": true,
      "mlsListing": true,
      "socialMedia": true
    },
    
    "priceHistory": [
      { "date": "2025-06-15T00:00:00.000Z", "price": 875000, "event": "Listed" },
      { "date": "2025-07-01T00:00:00.000Z", "price": 850000, "event": "Price Reduced" }
    ],
    
    "comparableProperties": [
      {
        "address": "321 Maple Street",
        "soldPrice": 833000,
        "soldDate": "2025-06-01T00:00:00.000Z",
        "sqft": 2200,
        "pricePerSqft": 378
      }
    ]
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
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

### Update Listing Checklist
```http
PUT /v1/listings/:id/checklist
```

**Request Body:**
```json
{
  "checklist": {
    "photography": true,
    "virtualTour": true,
    "droneVideo": false,
    "mlsListing": true,
    "socialMedia": true,
    "openHouse": false
  }
}
```

### Get Listing Analytics
```http
GET /v1/analytics/listing/:id
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

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| clientType | string | Filter by type (Buyer, Seller, Lead, Past Client) |
| status | string | Filter by status (New, Active, Hot Lead, Inactive) |
| source | string | Filter by lead source |
| tag | string | Filter by specific tag |
| search | string | Search in name, email, phone, notes |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "1",
        "firstName": "Michael",
        "lastName": "Thompson",
        "fullName": "Michael Thompson",
        "email": "michael.thompson@email.com",
        "phone": "(619) 555-1234",
        "clientType": "Buyer",
        "status": "Active",
        "source": "Referral",
        "preApproved": true,
        "preApprovalAmount": 950000,
        "tags": ["First Time Buyer", "Pre-Approved", "Urgent"],
        "lastContactDate": "2025-07-10T00:00:00.000Z",
        "nextFollowUpDate": "2025-07-20T00:00:00.000Z",
        "createdAt": "2025-06-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 8,
      "limit": 20
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Get Single Client
```http
GET /v1/clients/:id
```

**Response (Comprehensive):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "firstName": "Michael",
    "lastName": "Thompson",
    "fullName": "Michael Thompson",
    "email": "michael.thompson@email.com",
    "phone": "(619) 555-1234",
    "clientType": "Buyer",
    "status": "Active",
    "preApproved": true,
    "preApprovalAmount": 950000,
    "occupation": "Software Engineer",
    "annualIncome": 185000,
    "spouseName": "Jennifer Thompson",
    
    "communicationHistory": [
      {
        "id": 1,
        "date": "2025-07-15T00:00:00.000Z",
        "type": "Email",
        "subject": "New Listings Matching Your Criteria",
        "notes": "Sent 3 properties, client interested in 123 Main St",
        "outcome": "Scheduled showing"
      }
    ],
    
    "properties": {
      "interested": [
        {
          "id": "1",
          "address": "123 Main Street, San Diego, CA",
          "listPrice": 850000,
          "status": "Active",
          "notes": "Loves the kitchen, concerned about street noise",
          "rating": 4
        }
      ],
      "viewed": [],
      "owned": []
    },
    
    "tasks": [
      {
        "id": 1,
        "title": "Send new listings in La Jolla",
        "dueDate": "2025-07-20T00:00:00.000Z",
        "priority": "high",
        "status": "pending"
      }
    ],
    
    "financialSummary": {
      "preApprovalAmount": 950000,
      "downPaymentAvailable": 190000,
      "monthlyBudget": 4316,
      "creditScore": 750
    },
    
    "preferences": {
      "propertyTypes": ["Single Family", "Townhouse"],
      "bedrooms": { "min": 3, "max": 5 },
      "priceRange": { "min": 760000, "max": 950000 },
      "locations": ["La Jolla", "Del Mar", "Carmel Valley"],
      "mustHaves": ["Home Office", "Good Schools", "Garage"]
    },
    
    "aiInsights": {
      "engagementScore": 85,
      "readinessToBuy": "High",
      "recommendedActions": [
        "Schedule follow-up for new listings",
        "Check on mortgage rate lock status"
      ]
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
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

### Log Client Communication
```http
POST /v1/clients/:id/communication
```

**Request Body:**
```json
{
  "type": "Email",
  "subject": "New Property Matches",
  "notes": "Sent 5 properties matching criteria",
  "duration": null,
  "outcome": "Client interested in 2 properties",
  "nextFollowUpDate": "2025-07-20T00:00:00.000Z"
}
```

### Update Client Status
```http
PATCH /v1/clients/:id/status
```

**Request Body:**
```json
{
  "status": "Hot Lead",
  "note": "Ready to make offer on 123 Main St"
}
```

### Add Client Tag
```http
POST /v1/clients/:id/tags
```

**Request Body:**
```json
{
  "tag": "Cash Buyer"
}
```

### Remove Client Tag
```http
DELETE /v1/clients/:id/tags/:tag
```

### Get Client Statistics
```http
GET /v1/clients/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 156,
    "byType": {
      "buyers": 78,
      "sellers": 45,
      "pastClients": 28,
      "leads": 5
    },
    "byStatus": {
      "active": 92,
      "hotLeads": 12,
      "inactive": 35,
      "new": 17
    },
    "bySource": {
      "referral": 67,
      "website": 43,
      "openHouse": 28,
      "other": 18
    }
  }
}
```

---

## Appointments

### List All Appointments
```http
GET /v1/appointments
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by appointment type |
| status | string | Filter by status |
| startDate | ISO8601 | Start of date range |
| endDate | ISO8601 | End of date range |
| clientId | string | Filter by client |
| propertyId | string | Filter by property |

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "1",
        "title": "Property Showing - 123 Main St",
        "type": "Showing",
        "status": "Confirmed",
        "priority": "High",
        "startTime": "2025-07-18T14:00:00.000Z",
        "endTime": "2025-07-18T15:00:00.000Z",
        "duration": 60,
        "location": "123 Main Street, San Diego, CA 92101",
        "clientName": "Michael Thompson",
        "clientPhone": "(619) 555-1234",
        "agentName": "Jayden Metz",
        "notes": "Second showing - bringing spouse"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 3,
      "limit": 20
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Get Single Appointment
```http
GET /v1/appointments/:id
```

**Response (Comprehensive):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Property Showing - 123 Main St",
    "type": "Showing",
    "status": "Confirmed",
    "startTime": "2025-07-18T14:00:00.000Z",
    "endTime": "2025-07-18T15:00:00.000Z",
    "location": "123 Main Street, San Diego, CA 92101",
    
    "locationDetails": {
      "propertyId": "1",
      "propertyMLS": "SD2025001",
      "propertyPrice": 850000,
      "lockboxCode": "1234",
      "specialInstructions": "Use side gate if front door locked"
    },
    
    "attendees": [
      {
        "id": 1,
        "name": "Jayden Metz",
        "role": "Agent",
        "status": "Confirmed"
      },
      {
        "id": 2,
        "name": "Michael Thompson",
        "role": "Client",
        "email": "michael.thompson@email.com",
        "phone": "(619) 555-1234",
        "status": "Confirmed"
      }
    ],
    
    "tasks": [
      { "id": 1, "task": "Confirm appointment with client", "completed": true },
      { "id": 2, "task": "Get lockbox code", "completed": true },
      { "id": 3, "task": "Prepare comp analysis", "completed": false }
    ],
    
    "relatedAppointments": [
      {
        "id": "2",
        "title": "Initial Consultation",
        "type": "Meeting",
        "startTime": "2025-07-01T10:00:00.000Z"
      }
    ],
    
    "drivingInfo": {
      "fromOffice": {
        "distance": "12.5 miles",
        "duration": "22 minutes"
      },
      "parking": "Street parking available"
    },
    
    "followUpActions": [
      {
        "id": 1,
        "action": "Send thank you note",
        "dueDate": "2025-07-19T14:00:00.000Z",
        "status": "Pending"
      }
    ]
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
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

### Reschedule Appointment
```http
POST /v1/appointments/:id/reschedule
```

**Request Body:**
```json
{
  "startTime": "2025-07-20T14:00:00.000Z",
  "endTime": "2025-07-20T15:00:00.000Z",
  "reason": "Client requested different time"
}
```

### Update Appointment Status
```http
PATCH /v1/appointments/:id/status
```

**Request Body:**
```json
{
  "status": "Completed",
  "reason": "Showing completed successfully"
}
```

### Get Upcoming Appointments
```http
GET /v1/appointments/upcoming
```

**Query Parameters:**
- `days` (integer) - Number of days to look ahead (default: 7)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Property Showing - 123 Main St",
      "type": "Showing",
      "startTime": "2025-07-18T14:00:00.000Z",
      "clientName": "Michael Thompson",
      "location": "123 Main Street, San Diego, CA"
    }
  ]
}
```

### Check Appointment Conflicts
```http
POST /v1/appointments/check-conflicts
```

**Request Body:**
```json
{
  "startTime": "2025-07-20T14:00:00.000Z",
  "endTime": "2025-07-20T15:00:00.000Z",
  "excludeId": "123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasConflicts": false,
    "conflicts": []
  }
}
```

### Get Appointment Statistics
```http
GET /v1/appointments/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 245,
    "upcoming": 18,
    "today": 3,
    "thisWeek": 12,
    "thisMonth": 45,
    "byType": {
      "showing": 28,
      "listing": 8,
      "openHouse": 3,
      "inspection": 4,
      "closing": 2
    },
    "byStatus": {
      "scheduled": 32,
      "confirmed": 10,
      "completed": 3
    }
  }
}
```

---

## Leads

### List All Leads
```http
GET /v1/leads
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by lead type (Buyer, Seller, Investor, Renter) |
| status | string | Filter by status (New, Contacted, Qualified, etc.) |
| temperature | string | Filter by temperature (Hot, Warm, Cold) |
| source | string | Filter by lead source |
| minScore | number | Minimum lead score |
| maxScore | number | Maximum lead score |

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "1",
        "firstName": "Jennifer",
        "lastName": "Wilson",
        "fullName": "Jennifer Wilson",
        "email": "jennifer.wilson@email.com",
        "phone": "(619) 555-6789",
        "source": "Website",
        "status": "New",
        "score": 85,
        "temperature": "Hot",
        "estimatedValue": 125000,
        "type": "Buyer",
        "timeline": "1-3 months",
        "tags": ["Urgent", "Growing Family", "Tech Professional"],
        "lastContactDate": "2025-07-15T00:00:00.000Z",
        "nextFollowUpDate": "2025-07-17T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 85,
      "page": 1,
      "pages": 5,
      "limit": 20
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Get Single Lead
```http
GET /v1/leads/:id
```

**Response (Comprehensive):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "firstName": "Jennifer",
    "lastName": "Wilson",
    "email": "jennifer.wilson@email.com",
    "phone": "(619) 555-6789",
    "source": "Website",
    "status": "New",
    "score": 85,
    "temperature": "Hot",
    "type": "Buyer",
    
    "sourceDetails": {
      "page": "Property Listing - 123 Main St",
      "referrer": "Google Search",
      "utmSource": "google",
      "utmCampaign": "luxury-homes"
    },
    
    "budget": {
      "min": 600000,
      "max": 800000,
      "isPreApproved": false,
      "downPayment": 120000
    },
    
    "propertyInterest": {
      "types": ["Single Family"],
      "locations": ["La Jolla", "Del Mar"],
      "bedrooms": { "min": 4, "max": 5 },
      "features": ["Good Schools", "Pool", "Large Yard"]
    },
    
    "scoreBreakdown": {
      "engagement": 25,
      "budget": 20,
      "timeline": 15,
      "motivation": 20,
      "total": 85
    },
    
    "activityTimeline": [
      {
        "id": 1,
        "date": "2025-07-14T00:00:00.000Z",
        "type": "created",
        "title": "Lead Created",
        "description": "Lead came in from Website"
      }
    ],
    
    "recommendedProperties": [
      {
        "id": "1",
        "address": "123 Ocean View Dr, La Jolla",
        "price": 720000,
        "matchScore": 92
      }
    ],
    
    "aiInsights": {
      "conversionProbability": 85,
      "bestContactTime": "Weekday evenings 6-8 PM",
      "buyerReadiness": "High",
      "recommendedActions": [
        "Send personalized property matches",
        "Schedule follow-up call"
      ]
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
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
  "phone": "(619) 555-7890",
  "source": "Website",
  "type": "Buyer",
  "budget": {
    "min": 500000,
    "max": 700000,
    "isPreApproved": false
  },
  "timeline": "3-6 months",
  "motivation": "First time buyer, getting married",
  "propertyInterest": {
    "types": ["Condo", "Townhouse"],
    "locations": ["Downtown", "Mission Valley"],
    "bedrooms": { "min": 2, "max": 3 }
  },
  "notes": "Prefers modern construction with parking"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "6",
    "firstName": "Emily",
    "lastName": "Davis",
    "score": 65,
    "temperature": "Warm",
    "estimatedValue": 17500,
    "status": "New",
    "assignedTo": "Jayden Metz"
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
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

### Delete Lead
```http
DELETE /v1/leads/:id
```

### Update Lead Status
```http
PATCH /v1/leads/:id/status
```

**Request Body:**
```json
{
  "status": "Qualified",
  "note": "Pre-approved and ready to view properties"
}
```

### Update Lead Score
```http
PATCH /v1/leads/:id/score
```

**Request Body:**
```json
{
  "score": 90,
  "reason": "Pre-approval obtained and urgent timeline"
}
```

### Log Lead Activity
```http
POST /v1/leads/:id/activity
```

**Request Body:**
```json
{
  "type": "Phone",
  "subject": "Initial qualification call",
  "notes": "Discussed budget and timeline",
  "duration": 15,
  "outcome": "Qualified - scheduling property tour",
  "nextFollowUpDate": "2025-07-20T00:00:00.000Z"
}
```

### Get Lead Statistics
```http
GET /v1/leads/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 125,
    "new": 23,
    "thisWeek": 18,
    "thisMonth": 45,
    "byStatus": {
      "new": 23,
      "contacted": 34,
      "qualified": 28,
      "nurturing": 25,
      "converted": 12,
      "lost": 3
    },
    "byType": {
      "buyer": 78,
      "seller": 32,
      "investor": 12,
      "renter": 3
    },
    "bySource": {
      "website": 45,
      "referral": 38,
      "zillow": 22,
      "facebook": 12,
      "openHouse": 8
    },
    "byTemperature": {
      "hot": 28,
      "warm": 67,
      "cold": 30
    },
    "avgScore": 72,
    "totalEstimatedValue": 8750000,
    "conversionRate": 10
  }
}
```

### Get Hot Leads
```http
GET /v1/leads/hot
```

**Query Parameters:**
- `limit` (integer) - Maximum number of leads to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "3",
      "fullName": "Amanda Chen",
      "score": 92,
      "temperature": "Hot",
      "type": "Buyer",
      "timeline": "ASAP",
      "budget": {
        "max": 650000,
        "isPreApproved": true
      },
      "lastContactDate": "2025-07-16T00:00:00.000Z"
    }
  ]
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

**Fully Implemented with Comprehensive Mock Data:**
- Complete CRUD operations for all entities (Escrows, Listings, Clients, Appointments, Leads)
- Comprehensive data structures with rich, detailed responses
- Extended endpoints for each entity:
  - **Escrows**: Full checklist management, timeline tracking, AI agents integration
  - **Listings**: Marketing checklist, price history, analytics, comparable properties
  - **Clients**: Communication tracking, financial summaries, AI insights, preferences
  - **Appointments**: Conflict checking, attendee management, follow-up actions
  - **Leads**: Scoring system, conversion tracking, activity timeline, hot leads
- Standard response format and error handling
- WebSocket support for real-time updates
- File upload for RPA parsing
- Statistics endpoints for all entities
- Specialized operations (price reductions, status updates, tag management)

**Enhanced Features (Mock Implementation):**
- AI-powered insights and recommendations
- Comprehensive activity tracking and timelines
- Market analysis and comparable properties
- Task and checklist management
- Communication history and logging
- Financial calculations and summaries
- Property matching and recommendations

**Pending Implementation:**
- Full authentication enforcement (currently disabled on some routes)
- Database persistence (currently using in-memory mock data)
- Integration with external services (MLS, email providers)
- Webhook delivery system
- Rate limiting enforcement
- Full AI agent task execution with actual AI services
- File storage for documents and images
- Email/SMS notification system

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