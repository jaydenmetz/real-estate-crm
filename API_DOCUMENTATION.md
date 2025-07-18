# Real Estate CRM API Documentation

## All Endpoints

### Escrows
- <span style="color: #28a745;">**GET**</span> `/v1/escrows` - [List All Escrows](#list-all-escrows)
- <span style="color: #28a745;">**GET**</span> `/v1/escrows/:id` - [Get Single Escrow](#get-single-escrow)
- <span style="color: #007bff;">**POST**</span> `/v1/escrows` - [Create Escrow](#create-escrow)
- <span style="color: #ffc107;">**PUT**</span> `/v1/escrows/:id` - [Update Escrow](#update-escrow)
- <span style="color: #dc3545;">**DELETE**</span> `/v1/escrows/:id` - [Delete Escrow](#delete-escrow)
- <span style="color: #17a2b8;">**PATCH**</span> `/v1/escrows/:id/checklist` - [Update Escrow Checklist](#update-escrow-checklist)
- <span style="color: #007bff;">**POST**</span> `/v1/escrows/parse-rpa` - [Parse RPA PDF](#parse-rpa-pdf)

### Listings
- <span style="color: #28a745;">**GET**</span> `/v1/listings` - [List All Listings](#list-all-listings)
- <span style="color: #28a745;">**GET**</span> `/v1/listings/:id` - [Get Single Listing](#get-single-listing)
- <span style="color: #007bff;">**POST**</span> `/v1/listings` - [Create Listing](#create-listing)
- <span style="color: #ffc107;">**PUT**</span> `/v1/listings/:id` - [Update Listing](#update-listing)
- <span style="color: #17a2b8;">**PATCH**</span> `/v1/listings/:id/status` - [Update Listing Status](#update-listing-status)
- <span style="color: #007bff;">**POST**</span> `/v1/listings/:id/price-reduction` - [Log Price Reduction](#log-price-reduction)
- <span style="color: #007bff;">**POST**</span> `/v1/listings/:id/showings` - [Log Showing](#log-showing)
- <span style="color: #28a745;">**GET**</span> `/v1/listings/:id/price-history` - [Get Price History](#get-price-history)
- <span style="color: #ffc107;">**PUT**</span> `/v1/listings/:id/checklist` - [Update Listing Checklist](#update-listing-checklist)
- <span style="color: #28a745;">**GET**</span> `/v1/analytics/listing/:id` - [Get Listing Analytics](#get-listing-analytics)

### Clients
- <span style="color: #28a745;">**GET**</span> `/v1/clients` - [List All Clients](#list-all-clients)
- <span style="color: #28a745;">**GET**</span> `/v1/clients/:id` - [Get Single Client](#get-single-client)
- <span style="color: #007bff;">**POST**</span> `/v1/clients` - [Create Client](#create-client)
- <span style="color: #ffc107;">**PUT**</span> `/v1/clients/:id` - [Update Client](#update-client)
- <span style="color: #dc3545;">**DELETE**</span> `/v1/clients/:id` - [Delete Client](#delete-client)
- <span style="color: #007bff;">**POST**</span> `/v1/clients/:id/notes` - [Add Client Note](#add-client-note)
- <span style="color: #007bff;">**POST**</span> `/v1/clients/:id/communication` - [Log Client Communication](#log-client-communication)
- <span style="color: #17a2b8;">**PATCH**</span> `/v1/clients/:id/status` - [Update Client Status](#update-client-status)
- <span style="color: #007bff;">**POST**</span> `/v1/clients/:id/tags` - [Add Client Tag](#add-client-tag)
- <span style="color: #dc3545;">**DELETE**</span> `/v1/clients/:id/tags/:tag` - [Remove Client Tag](#remove-client-tag)
- <span style="color: #28a745;">**GET**</span> `/v1/clients/stats` - [Get Client Statistics](#get-client-statistics)
- <span style="color: #28a745;">**GET**</span> `/v1/clients/:id/transactions` - [Get Client Transactions](#get-client-transactions)
- <span style="color: #28a745;">**GET**</span> `/v1/clients/:id/communications` - [Get Communications](#get-communications)
- <span style="color: #28a745;">**GET**</span> `/v1/clients/:id/notes` - [Get Client Notes](#get-client-notes)
- <span style="color: #ffc107;">**PUT**</span> `/v1/clients/:id/checklist` - [Update Client Checklist](#update-entity-checklists)

### Appointments
- <span style="color: #28a745;">**GET**</span> `/v1/appointments` - [List All Appointments](#list-all-appointments)
- <span style="color: #28a745;">**GET**</span> `/v1/appointments/:id` - [Get Single Appointment](#get-single-appointment)
- <span style="color: #007bff;">**POST**</span> `/v1/appointments` - [Create Appointment](#create-appointment)
- <span style="color: #ffc107;">**PUT**</span> `/v1/appointments/:id` - [Update Appointment](#update-appointment)
- <span style="color: #007bff;">**POST**</span> `/v1/appointments/:id/cancel` - [Cancel Appointment](#cancel-appointment)
- <span style="color: #007bff;">**POST**</span> `/v1/appointments/:id/reschedule` - [Reschedule Appointment](#reschedule-appointment)
- <span style="color: #17a2b8;">**PATCH**</span> `/v1/appointments/:id/status` - [Update Appointment Status](#update-appointment-status)
- <span style="color: #28a745;">**GET**</span> `/v1/appointments/upcoming` - [Get Upcoming Appointments](#get-upcoming-appointments)
- <span style="color: #007bff;">**POST**</span> `/v1/appointments/check-conflicts` - [Check Appointment Conflicts](#check-appointment-conflicts)
- <span style="color: #28a745;">**GET**</span> `/v1/appointments/stats` - [Get Appointment Statistics](#get-appointment-statistics)
- <span style="color: #28a745;">**GET**</span> `/v1/analytics/appointments/:id` - [Get Appointment Analytics](#get-appointment-analytics)
- <span style="color: #ffc107;">**PUT**</span> `/v1/appointments/:id/checklist` - [Update Appointment Checklist](#update-entity-checklists)

### Leads
- <span style="color: #28a745;">**GET**</span> `/v1/leads` - [List All Leads](#list-all-leads)
- <span style="color: #28a745;">**GET**</span> `/v1/leads/:id` - [Get Single Lead](#get-single-lead)
- <span style="color: #007bff;">**POST**</span> `/v1/leads` - [Create Lead](#create-lead)
- <span style="color: #ffc107;">**PUT**</span> `/v1/leads/:id` - [Update Lead](#update-lead)
- <span style="color: #007bff;">**POST**</span> `/v1/leads/:id/convert` - [Convert Lead to Client](#convert-lead-to-client)
- <span style="color: #dc3545;">**DELETE**</span> `/v1/leads/:id` - [Delete Lead](#delete-lead)
- <span style="color: #17a2b8;">**PATCH**</span> `/v1/leads/:id/status` - [Update Lead Status](#update-lead-status)
- <span style="color: #17a2b8;">**PATCH**</span> `/v1/leads/:id/score` - [Update Lead Score](#update-lead-score)
- <span style="color: #007bff;">**POST**</span> `/v1/leads/:id/activity` - [Log Lead Activity](#log-lead-activity)
- <span style="color: #28a745;">**GET**</span> `/v1/leads/stats` - [Get Lead Statistics](#get-lead-statistics)
- <span style="color: #28a745;">**GET**</span> `/v1/leads/hot` - [Get Hot Leads](#get-hot-leads)
- <span style="color: #28a745;">**GET**</span> `/v1/leads/:id/communications` - [Get Lead Communications](#get-communications)
- <span style="color: #28a745;">**GET**</span> `/v1/analytics/lead/:id` - [Get Lead Analytics](#get-lead-analytics)
- <span style="color: #ffc107;">**PUT**</span> `/v1/leads/:id/checklist` - [Update Lead Checklist](#update-entity-checklists)

### Commissions
- <span style="color: #28a745;">**GET**</span> `/v1/commissions` - [List All Commissions](#list-all-commissions)
- <span style="color: #28a745;">**GET**</span> `/v1/commissions/:id` - [Get Single Commission](#get-single-commission)
- <span style="color: #28a745;">**GET**</span> `/v1/commissions/stats` - [Get Commission Statistics](#get-commission-statistics)
- <span style="color: #007bff;">**POST**</span> `/v1/commissions` - [Create Commission](#create-commission)
- <span style="color: #17a2b8;">**PATCH**</span> `/v1/commissions/:id/status` - [Update Commission Status](#update-commission-status)

### Invoices
- <span style="color: #28a745;">**GET**</span> `/v1/invoices` - [List All Invoices](#list-all-invoices)
- <span style="color: #28a745;">**GET**</span> `/v1/invoices/:id` - [Get Single Invoice](#get-single-invoice)
- <span style="color: #28a745;">**GET**</span> `/v1/invoices/stats` - [Get Invoice Statistics](#get-invoice-statistics)
- <span style="color: #007bff;">**POST**</span> `/v1/invoices` - [Create Invoice](#create-invoice)
- <span style="color: #007bff;">**POST**</span> `/v1/invoices/:id/payment` - [Record Invoice Payment](#record-invoice-payment)

### Expenses
- <span style="color: #28a745;">**GET**</span> `/v1/expenses` - [List All Expenses](#list-all-expenses)
- <span style="color: #28a745;">**GET**</span> `/v1/expenses/:id` - [Get Single Expense](#get-single-expense)
- <span style="color: #28a745;">**GET**</span> `/v1/expenses/stats` - [Get Expense Statistics](#get-expense-statistics)
- <span style="color: #28a745;">**GET**</span> `/v1/expenses/categories` - [Get Expense Categories](#get-expense-categories)
- <span style="color: #007bff;">**POST**</span> `/v1/expenses` - [Create Expense](#create-expense)
- <span style="color: #007bff;">**POST**</span> `/v1/expenses/report` - [Generate Expense Report](#generate-expense-report)

### AI Agents
- <span style="color: #28a745;">**GET**</span> `/v1/ai/agents` - [Get All AI Agents](#get-all-ai-agents)
- <span style="color: #17a2b8;">**PATCH**</span> `/v1/ai/agents/:id/toggle` - [Toggle AI Agent](#toggle-ai-agent)
- <span style="color: #28a745;">**GET**</span> `/v1/ai/token-usage` - [Get Token Usage](#get-token-usage)
- <span style="color: #28a745;">**GET**</span> `/v1/ai/alex/daily-briefing` - [Get Daily Briefing (Alex)](#get-daily-briefing-alex)
- <span style="color: #007bff;">**POST**</span> `/v1/ai/process-lead` - [Process Lead with AI](#process-lead-with-ai)
- <span style="color: #28a745;">**GET**</span> `/v1/ai/team` - [Get AI Team Status](#get-ai-team-status)
- <span style="color: #007bff;">**POST**</span> `/v1/ai/team/task` - [Trigger AI Task](#trigger-ai-task)

### Analytics
- <span style="color: #28a745;">**GET**</span> `/v1/analytics/dashboard` - [Dashboard Analytics](#dashboard-analytics)
- <span style="color: #28a745;">**GET**</span> `/v1/analytics/escrow/:id` - [Escrow Analytics](#escrow-analytics)

### Additional
- <span style="color: #28a745;">**GET**</span> `/v1/properties/search` - [Property Search](#property-search)
- <span style="color: #007bff;">**POST**</span> `/v1/webhooks` - [Configure Webhooks](#webhooks)

---

## Legend
- <span style="color: #28a745;">**GET**</span> - Retrieve data
- <span style="color: #007bff;">**POST**</span> - Create new resources
- <span style="color: #ffc107;">**PUT**</span> - Update entire resources
- <span style="color: #17a2b8;">**PATCH**</span> - Partial updates
- <span style="color: #dc3545;">**DELETE**</span> - Remove resources

---

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

### List vs Detail Pattern
To optimize performance, the API implements a list vs detail pattern:
- **List endpoints** (`GET /v1/resource`) return minimal data suitable for displaying in tables/lists
- **Detail endpoints** (`GET /v1/resource/:id`) return comprehensive data for full page views

This reduces payload sizes for list views from ~15-20KB per record to ~2-3KB per record.

### Pagination
List endpoints support pagination with these query parameters:
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page
- `sort` (string) - Field to sort by
- `order` (string: "asc" | "desc") - Sort order

### Performance Considerations

#### Response Size Management
- **List views**: ~2-3KB per record (minimal data)
- **Detail views**: ~15-20KB per record (comprehensive data)
- **Compression**: Enable gzip to reduce transfer size by ~70%

#### Optimization Strategies

1. **Field Selection** (future enhancement)
   ```http
   GET /v1/escrows/:id?fields=id,propertyAddress,status,closingDate
   ```

2. **Nested Resource Control** (future enhancement)
   ```http
   GET /v1/escrows/:id?include=property,timeline,documents
   GET /v1/escrows/:id?exclude=aiAgents,marketData
   ```

3. **Separate Endpoints for Heavy Data** (future enhancement)
   ```http
   GET /v1/escrows/:id/timeline
   GET /v1/escrows/:id/documents
   GET /v1/escrows/:id/market-analysis
   ```

#### Caching Strategy
- Cache property details (changes rarely)
- Cache market data (update daily)
- Don't cache transaction-specific data
- Use ETags for conditional requests

#### Database Optimization
```sql
-- Recommended indexes
CREATE INDEX idx_escrows_status ON escrows(escrowStatus);
CREATE INDEX idx_escrows_closing_date ON escrows(closingDate);
CREATE INDEX idx_listings_status ON listings(listingStatus);
CREATE INDEX idx_clients_type ON clients(clientType);
CREATE INDEX idx_leads_score ON leads(score);
```

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

**Response (Minimal List View):**
```json
{
  "success": true,
  "data": {
    "escrows": [
      {
        "id": "1",
        "escrowNumber": "ESC-2025-001",
        "propertyAddress": "456 Ocean View Dr, La Jolla, CA 92037",
        "propertyType": "Single Family",
        "propertyImage": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
        "purchasePrice": 1250000,
        "escrowStatus": "Active",
        "currentStage": "Inspection",
        "closingDate": "2025-08-15T00:00:00.000Z",
        "daysToClose": 30,
        "grossCommission": 31250,
        "buyers": [{"name": "Michael & Sarah Chen"}],
        "sellers": [{"name": "Robert Johnson"}],
        "createdAt": "2025-07-01T00:00:00.000Z",
        "updatedAt": "2025-07-17T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3,
      "limit": 20
    }
  }
}
```

### Get Single Escrow
```http
GET /v1/escrows/:id
```

**Response (Comprehensive):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "escrowNumber": "ESC-2025-001",
    "propertyAddress": "456 Ocean View Dr, La Jolla, CA 92037",
    "purchasePrice": 1250000,
    "escrowStatus": "Active",
    "status": "Active",
    "currentStage": "Inspection",
    "closingDate": "2025-08-15T00:00:00.000Z",
    "acceptanceDate": "2025-07-01T00:00:00.000Z",
    "daysToClose": 30,
    "daysInEscrow": 16,
    
    "earnestMoneyDeposit": 37500,
    "downPayment": 250000,
    "loanAmount": 1000000,
    "grossCommission": 31250,
    "commissionPercentage": 2.5,
    "commissionSplit": {
      "listing": 15625,
      "selling": 15625
    },
    
    "escrowCompany": "Pacific Escrow Services",
    "escrowOfficer": "Jennifer Martinez",
    "titleCompany": "First American Title",
    "lender": "Wells Fargo Home Mortgage",
    
    "propertyType": "Single Family",
    "propertyImage": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
    "property": {
      "type": "Single Family",
      "bedrooms": 4,
      "bathrooms": 3,
      "sqft": 2800,
      "yearBuilt": 2018,
      "lot": "0.25 acres",
      "images": [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"
      ]
    },
    
    "buyers": [{
      "name": "Michael & Sarah Chen",
      "email": "chen.family@email.com",
      "phone": "(858) 555-1234"
    }],
    "sellers": [{
      "name": "Robert Johnson",
      "email": "rjohnson@email.com",
      "phone": "(858) 555-5678"
    }],
    "buyer": {
      "name": "Michael & Sarah Chen",
      "email": "chen.family@email.com",
      "phone": "(858) 555-1234",
      "agent": "Sarah Johnson",
      "agentPhone": "(555) 234-5678",
      "agentEmail": "sarah@realty.com"
    },
    "seller": {
      "name": "Robert Johnson",
      "email": "rjohnson@email.com",
      "phone": "(858) 555-5678",
      "agent": "Mike Davis",
      "agentPhone": "(555) 456-7890",
      "agentEmail": "mike@realty.com"
    },
    
    "financials": {
      "purchasePrice": 1250000,
      "downPayment": 250000,
      "loanAmount": 1000000,
      "earnestMoneyDeposit": 25000,
      "closingCosts": 15000,
      "sellerCredits": 5000,
      "commission": {
        "listingSide": 37500,
        "buyingSide": 37500,
        "total": 75000
      }
    },
    
    "checklist": {
      "Pre-Contract": {
        "offerSubmitted": true,
        "offerAccepted": true,
        "escrowOpened": true,
        "earnestMoneyDeposited": true
      },
      "Contract to Close": {
        "inspectionScheduled": true,
        "inspectionCompleted": true,
        "repairNegotiation": false,
        "appraisalOrdered": true,
        "appraisalCompleted": false,
        "loanApproval": false,
        "titleOrdered": true,
        "titleReportReceived": false,
        "homeInsurance": false,
        "finalWalkthrough": false
      },
      "Closing": {
        "closingScheduled": false,
        "closingDocumentsReviewed": false,
        "finalFundsTransferred": false,
        "closingCompleted": false,
        "keysDelivered": false
      }
    },
    
    "timeline": [
      {
        "date": "2025-07-01T00:00:00.000Z",
        "event": "Offer Accepted",
        "status": "completed",
        "notes": "Offer accepted at full asking price"
      },
      {
        "date": "2025-07-03T00:00:00.000Z",
        "event": "Escrow Opened",
        "status": "completed",
        "notes": "Escrow opened with Pacific Escrow Services"
      },
      {
        "date": "2025-07-10T00:00:00.000Z",
        "event": "Inspection Completed",
        "status": "completed",
        "notes": "Minor repairs needed"
      },
      {
        "date": "2025-07-20T00:00:00.000Z",
        "event": "Appraisal",
        "status": "pending"
      },
      {
        "date": "2025-08-01T00:00:00.000Z",
        "event": "Loan Approval",
        "status": "upcoming"
      },
      {
        "date": "2025-08-13T00:00:00.000Z",
        "event": "Final Walkthrough",
        "status": "upcoming"
      },
      {
        "date": "2025-08-15T00:00:00.000Z",
        "event": "Closing",
        "status": "upcoming"
      }
    ],
    
    "documents": [
      {
        "id": 1,
        "name": "Purchase Agreement",
        "type": "contract",
        "uploadedDate": "2025-07-01T00:00:00.000Z",
        "uploadedBy": "Sarah Johnson",
        "size": "2.4 MB"
      },
      {
        "id": 2,
        "name": "Escrow Instructions",
        "type": "escrow",
        "uploadedDate": "2025-07-03T00:00:00.000Z",
        "uploadedBy": "Pacific Escrow",
        "size": "1.8 MB"
      },
      {
        "id": 3,
        "name": "Inspection Report",
        "type": "inspection",
        "uploadedDate": "2025-07-10T00:00:00.000Z",
        "uploadedBy": "Home Inspector Pro",
        "size": "5.2 MB"
      }
    ],
    
    "aiAgents": [
      {
        "id": "transaction_coord",
        "name": "Transaction Coordinator AI",
        "type": "coordination",
        "status": "active",
        "tasksCompleted": 8,
        "currentTask": "Monitoring appraisal status",
        "efficiency": 98.5
      },
      {
        "id": "compliance_officer",
        "name": "Compliance Officer AI",
        "type": "compliance",
        "status": "active",
        "tasksCompleted": 5,
        "currentTask": "Reviewing documentation completeness",
        "efficiency": 99.2
      }
    ],
    
    "recentActivity": [
      {
        "date": "2025-07-17T10:30:00.000Z",
        "type": "update",
        "description": "Appraisal scheduled for July 20th",
        "user": "Sarah Johnson"
      },
      {
        "date": "2025-07-16T14:15:00.000Z",
        "type": "document",
        "description": "Repair addendum uploaded",
        "user": "Mike Davis"
      },
      {
        "date": "2025-07-15T09:00:00.000Z",
        "type": "milestone",
        "description": "Loan conditions submitted to lender",
        "user": "Transaction Coordinator AI"
      }
    ],
    
    "marketData": {
      "originalListPrice": 1295000,
      "daysOnMarket": 12,
      "pricePerSqft": 446,
      "neighborhoodAverage": 425,
      "appreciationRate": 5.2,
      "similarSales": [
        {
          "address": "789 Coastal Dr",
          "price": 1187500,
          "soldDate": "2025-06-27T00:00:00.000Z",
          "daysOnMarket": 15
        }
      ]
    },
    
    "createdAt": "2025-07-01T00:00:00.000Z",
    "updatedAt": "2025-07-17T00:00:00.000Z"
  },
  "timestamp": "2025-07-17T12:00:00.000Z"
}
```

**Performance Notes:**
- Full response size: ~15-20KB (acceptable with compression)
- Consider field selection: `?fields=id,propertyAddress,status,closingDate`
- For list views, only essential fields are returned
- Use caching for property details and market data

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

**Response (Minimal List View):**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "1",
        "mlsNumber": "SD2025001",
        "propertyAddress": "123 Main Street",
        "city": "San Diego",
        "state": "CA",
        "zipCode": "92101",
        "fullAddress": "123 Main Street, San Diego, CA 92101",
        "listingStatus": "Active",
        "listPrice": 850000,
        "pricePerSqft": 354,
        "propertyType": "Single Family",
        "bedrooms": 4,
        "bathrooms": 3,
        "squareFootage": 2400,
        "primaryImage": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
        "daysOnMarket": 32,
        "listingAgent": {
          "name": "Jayden Metz"
        },
        "createdAt": "2025-07-01T00:00:00.000Z",
        "updatedAt": "2025-07-17T00:00:00.000Z"
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

**Response (Minimal List View):**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "1",
        "fullName": "Michael Thompson",
        "firstName": "Michael",
        "lastName": "Thompson",
        "email": "michael.thompson@email.com",
        "phone": "(619) 555-1234",
        "clientType": "Buyer",
        "status": "Active",
        "source": "Referral",
        "tags": ["First Time Buyer", "Pre-Approved", "Urgent"],
        "preApproved": true,
        "preApprovalAmount": 950000,
        "lastContactDate": "2025-07-10T00:00:00.000Z",
        "nextFollowUpDate": "2025-07-20T00:00:00.000Z",
        "createdAt": "2025-06-01T00:00:00.000Z",
        "updatedAt": "2025-07-17T00:00:00.000Z"
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

### Get Client Transactions
```http
GET /v1/clients/:id/transactions
```

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

**Response (Minimal List View):**
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
        "location": "123 Main Street, San Diego, CA 92101",
        "clientId": "1",
        "clientName": "Michael Thompson",
        "propertyId": "123",
        "propertyAddress": "123 Main Street",
        "reminder": {
          "enabled": true,
          "minutesBefore": 30
        },
        "createdAt": "2025-07-15T00:00:00.000Z",
        "updatedAt": "2025-07-17T00:00:00.000Z"
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

### Get Appointment Analytics
```http
GET /v1/analytics/appointments/:id
```

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

**Response (Minimal List View):**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "1",
        "fullName": "Jennifer Wilson",
        "firstName": "Jennifer",
        "lastName": "Wilson",
        "email": "jennifer.wilson@email.com",
        "phone": "(619) 555-6789",
        "type": "Buyer",
        "status": "New",
        "source": "Website",
        "score": 85,
        "temperature": "Hot",
        "estimatedValue": 125000,
        "lastContactDate": "2025-07-15T00:00:00.000Z",
        "nextFollowUpDate": "2025-07-17T00:00:00.000Z",
        "conversionProbability": 0.75,
        "tags": ["Urgent", "Growing Family", "Tech Professional"],
        "createdAt": "2025-07-01T00:00:00.000Z",
        "updatedAt": "2025-07-17T00:00:00.000Z"
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

### Get Lead Analytics
```http
GET /v1/analytics/lead/:id
```

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

### Get AI Team Status
```http
GET /v1/ai/team
```

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

---

## Additional Entity Endpoints

### Property Search
```http
GET /v1/properties/search
```

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

---

## Financial Management

### Commissions

#### List All Commissions
```http
GET /v1/commissions
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (Pending, Processing, Paid, Cancelled) |
| agentId | string | Filter by agent ID |
| side | string | Filter by side (Listing, Buyer, Both) |
| startDate | ISO8601 | Start date for payout date range |
| endDate | ISO8601 | End date for payout date range |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |

**Response (Minimal List View):**
```json
{
  "success": true,
  "data": {
    "commissions": [
      {
        "id": "1",
        "escrowId": "1",
        "escrowNumber": "ESC-2025-001",
        "propertyAddress": "456 Ocean View Dr, La Jolla, CA 92037",
        "side": "Listing",
        "agentName": "Jayden Metz",
        "salePrice": 1250000,
        "grossCommission": 31250,
        "netCommission": 24605,
        "status": "Pending",
        "projectedPayoutDate": "2025-08-15T00:00:00.000Z",
        "actualPayoutDate": null,
        "createdAt": "2025-07-01T00:00:00.000Z",
        "updatedAt": "2025-07-17T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "pages": 1,
      "limit": 20
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

#### Get Single Commission
```http
GET /v1/commissions/:id
```

**Response (Comprehensive):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "escrowId": "1",
    "escrowNumber": "ESC-2025-001",
    "propertyAddress": "456 Ocean View Dr, La Jolla, CA 92037",
    "transactionType": "Sale",
    "side": "Listing",
    "agentId": "1",
    "agentName": "Jayden Metz",
    "salePrice": 1250000,
    "commissionRate": 2.5,
    "grossCommission": 31250,
    "brokerageSplit": 80,
    "agentCommission": 25000,
    "brokerageCommission": 6250,
    "referralFee": 0,
    "referralAgent": null,
    "transactionFee": 395,
    "netCommission": 24605,
    "status": "Pending",
    "projectedPayoutDate": "2025-08-15T00:00:00.000Z",
    "actualPayoutDate": null,
    "invoiceId": null,
    "notes": "Standard listing side commission",
    "taxWithheld": false,
    "taxRate": 0,
    "deductions": [],
    "breakdown": {
      "salePrice": 1250000,
      "commissionRate": 2.5,
      "grossCommission": 31250,
      "brokerageSplit": "80/20",
      "agentCommission": 25000,
      "brokerageCommission": 6250,
      "referralFee": 0,
      "transactionFee": 395,
      "deductions": [],
      "taxWithheld": 0,
      "netCommission": 24605
    },
    "transaction": {
      "escrowId": "1",
      "escrowNumber": "ESC-2025-001",
      "propertyAddress": "456 Ocean View Dr, La Jolla, CA 92037",
      "closingDate": "2025-08-15T00:00:00.000Z",
      "buyers": ["Michael & Sarah Chen"],
      "sellers": ["Robert Johnson"],
      "otherAgent": "Sarah Johnson (Buyer Agent)"
    },
    "paymentHistory": [],
    "documents": [
      {
        "id": 1,
        "name": "Commission Agreement",
        "type": "agreement",
        "uploadDate": "2025-07-01T00:00:00.000Z",
        "url": "/api/v1/documents/commission-agreement-1"
      }
    ],
    "auditTrail": [
      {
        "date": "2025-07-01T00:00:00.000Z",
        "action": "Commission Created",
        "user": "System",
        "details": "Commission record created from escrow"
      }
    ],
    "createdAt": "2025-07-01T00:00:00.000Z",
    "updatedAt": "2025-07-17T00:00:00.000Z"
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

#### Get Commission Statistics
```http
GET /v1/commissions/stats
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| agentId | string | Filter stats by agent ID (optional) |

**Response:**
```json
{
  "success": true,
  "data": {
    "ytd": {
      "totalGross": 185000,
      "totalNet": 148000,
      "totalTransactions": 8,
      "averageCommission": 18500,
      "byStatus": {
        "pending": 2,
        "processing": 1,
        "paid": 5
      }
    },
    "monthly": {
      "totalGross": 52500,
      "totalNet": 42000,
      "totalTransactions": 2
    },
    "pipeline": {
      "pending": 52500,
      "processing": 36250
    },
    "averageSplit": 80
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

#### Create Commission
```http
POST /v1/commissions
```

**Request Body:**
```json
{
  "escrowId": "4",
  "escrowNumber": "ESC-2025-004",
  "propertyAddress": "123 New St, San Diego, CA",
  "transactionType": "Sale",
  "side": "Buyer",
  "agentId": "1",
  "agentName": "Jayden Metz",
  "salePrice": 950000,
  "commissionRate": 2.5,
  "brokerageSplit": 75,
  "referralFee": 0,
  "referralAgent": null,
  "transactionFee": 395,
  "deductions": [],
  "notes": "Buyer side commission"
}
```

#### Update Commission Status
```http
PATCH /v1/commissions/:id/status
```

**Request Body:**
```json
{
  "status": "Paid",
  "paymentDetails": {
    "payoutDate": "2025-07-20T00:00:00.000Z",
    "checkNumber": "12456",
    "depositAccount": "Business Checking ****1234",
    "invoiceId": "INV-2025-0045"
  }
}
```

### Invoices

#### List All Invoices
```http
GET /v1/invoices
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (Pending, Paid, Overdue, Cancelled) |
| type | string | Filter by type (Commission, Service, Other) |
| clientId | string | Filter by client ID |
| startDate | ISO8601 | Start date range |
| endDate | ISO8601 | End date range |
| overdue | boolean | Show only overdue invoices |
| search | string | Search invoice number or client name |

**Response (Minimal List View):**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "3",
        "invoiceNumber": "INV-2025-0043",
        "type": "Service",
        "status": "Pending",
        "clientName": "Michael Thompson",
        "issueDate": "2025-07-15T00:00:00.000Z",
        "dueDate": "2025-08-15T00:00:00.000Z",
        "total": 2706.25,
        "amountPaid": 0,
        "balance": 2706.25,
        "createdAt": "2025-07-15T00:00:00.000Z",
        "updatedAt": "2025-07-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 2,
      "limit": 20
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

#### Get Single Invoice
```http
GET /v1/invoices/:id
```

**Response (Comprehensive):**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "invoiceNumber": "INV-2025-0043",
    "type": "Service",
    "status": "Pending",
    "clientId": "1",
    "clientName": "Michael Thompson",
    "clientEmail": "michael.thompson@email.com",
    "clientPhone": "(619) 555-1234",
    "billingAddress": {
      "street": "789 Buyer Lane",
      "city": "La Jolla",
      "state": "CA",
      "zipCode": "92037"
    },
    "issueDate": "2025-07-15T00:00:00.000Z",
    "dueDate": "2025-08-15T00:00:00.000Z",
    "paidDate": null,
    "subtotal": 2500,
    "tax": 206.25,
    "discount": 0,
    "total": 2706.25,
    "amountPaid": 0,
    "balance": 2706.25,
    "currency": "USD",
    "items": [
      {
        "id": 1,
        "description": "Professional Photography Package",
        "quantity": 1,
        "rate": 500,
        "amount": 500,
        "type": "service"
      },
      {
        "id": 2,
        "description": "Virtual Tour Creation",
        "quantity": 1,
        "rate": 750,
        "amount": 750,
        "type": "service"
      }
    ],
    "notes": "Marketing services for property listing",
    "terms": "Net 30",
    "attachments": [],
    "relatedTo": {
      "type": "listing",
      "id": "1",
      "reference": "123 Main Street"
    },
    "paymentHistory": [],
    "activityLog": [
      {
        "date": "2025-07-15T00:00:00.000Z",
        "action": "Invoice Created",
        "user": "Jayden Metz",
        "details": "Invoice INV-2025-0043 created"
      }
    ],
    "emailHistory": [
      {
        "date": "2025-07-15T00:00:00.000Z",
        "subject": "Invoice INV-2025-0043 - Michael Thompson",
        "recipient": "michael.thompson@email.com",
        "status": "Sent",
        "opened": true,
        "openedDate": "2025-07-15T02:00:00.000Z"
      }
    ],
    "createdBy": "Jayden Metz",
    "createdAt": "2025-07-15T00:00:00.000Z",
    "updatedAt": "2025-07-15T00:00:00.000Z"
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

#### Get Invoice Statistics
```http
GET /v1/invoices/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "outstanding": {
      "total": 4868.63,
      "count": 2,
      "overdue": 162.38,
      "overdueCount": 1
    },
    "ytd": {
      "total": 85291.13,
      "paid": 80422.50,
      "count": 42,
      "avgInvoiceValue": 2030.74
    },
    "monthly": {
      "total": 12543.25,
      "paid": 9837.00,
      "count": 6
    },
    "performance": {
      "avgDaysToPayment": 12,
      "paymentRate": 85.7,
      "byType": {
        "commission": 25,
        "service": 17
      }
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

#### Create Invoice
```http
POST /v1/invoices
```

**Request Body:**
```json
{
  "type": "Service",
  "clientId": "2",
  "clientName": "Jennifer Wilson",
  "clientEmail": "jennifer.wilson@email.com",
  "clientPhone": "(619) 555-6789",
  "billingAddress": {
    "street": "456 Seller Ave",
    "city": "Del Mar",
    "state": "CA",
    "zipCode": "92014"
  },
  "items": [
    {
      "description": "Home Staging Services",
      "quantity": 1,
      "rate": 2500,
      "amount": 2500,
      "type": "service"
    }
  ],
  "taxRate": 8.25,
  "notes": "Full home staging for listing",
  "terms": "Net 30",
  "dueDate": "2025-08-15T00:00:00.000Z"
}
```

#### Record Invoice Payment
```http
POST /v1/invoices/:id/payment
```

**Request Body:**
```json
{
  "amount": 2706.25,
  "method": "Check",
  "reference": "CHK-98765",
  "date": "2025-07-20T00:00:00.000Z"
}
```

### Expenses

#### List All Expenses
```http
GET /v1/expenses
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| status | string | Filter by status |
| startDate | ISO8601 | Start date range |
| endDate | ISO8601 | End date range |
| taxDeductible | boolean | Filter by tax deductible status |
| search | string | Search vendor or description |

**Response (Minimal List View):**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "1",
        "category": "Marketing",
        "subcategory": "Online Advertising",
        "vendor": "Google Ads",
        "description": "PPC Campaign for Luxury Listings",
        "amount": 1250.00,
        "date": "2025-07-01T00:00:00.000Z",
        "status": "Paid",
        "taxDeductible": true,
        "hasReceipt": true,
        "tags": ["advertising", "digital", "luxury"],
        "createdAt": "2025-07-01T00:00:00.000Z",
        "updatedAt": "2025-07-01T00:00:00.000Z"
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

#### Get Single Expense
```http
GET /v1/expenses/:id
```

**Response (Comprehensive):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "category": "Marketing",
    "subcategory": "Online Advertising",
    "vendor": "Google Ads",
    "description": "PPC Campaign for Luxury Listings",
    "amount": 1250.00,
    "date": "2025-07-01T00:00:00.000Z",
    "paymentMethod": "Credit Card",
    "paymentReference": "CC-****1234",
    "status": "Paid",
    "taxDeductible": true,
    "receipt": {
      "id": 1,
      "filename": "google-ads-receipt-july.pdf",
      "url": "/api/v1/documents/receipt-1",
      "uploadDate": "2025-07-02T00:00:00.000Z"
    },
    "notes": "Monthly Google Ads spend for luxury property campaigns",
    "tags": ["advertising", "digital", "luxury"],
    "relatedTo": {
      "type": "listing",
      "id": "3",
      "reference": "789 Sunset Boulevard"
    },
    "recurring": {
      "enabled": true,
      "frequency": "monthly",
      "endDate": "2025-12-31T00:00:00.000Z"
    },
    "categoryInfo": {
      "main": "Marketing",
      "sub": "Online Advertising",
      "allSubcategories": [
        "Online Advertising",
        "Print Advertising",
        "Signs & Banners",
        "Photography",
        "Virtual Tours",
        "Direct Mail",
        "Social Media",
        "Website",
        "Other"
      ]
    },
    "taxInfo": {
      "deductible": true,
      "category": "Marketing",
      "estimatedDeduction": 1250.00,
      "mileageDeduction": 0,
      "totalDeduction": 1250.00
    },
    "relatedExpenses": [
      {
        "id": "6",
        "vendor": "Google Ads",
        "description": "PPC Campaign - June",
        "amount": 1185.00,
        "date": "2025-06-01T00:00:00.000Z"
      }
    ],
    "auditTrail": [
      {
        "date": "2025-07-01T00:00:00.000Z",
        "action": "Expense Created",
        "user": "Jayden Metz",
        "details": "Created expense for Google Ads"
      },
      {
        "date": "2025-07-02T00:00:00.000Z",
        "action": "Receipt Uploaded",
        "user": "Jayden Metz",
        "details": "Uploaded google-ads-receipt-july.pdf"
      }
    ],
    "createdBy": "Jayden Metz",
    "approvedBy": null,
    "createdAt": "2025-07-01T00:00:00.000Z",
    "updatedAt": "2025-07-01T00:00:00.000Z"
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

#### Get Expense Statistics
```http
GET /v1/expenses/stats
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| year | integer | Year for statistics (default: current year) |

**Response:**
```json
{
  "success": true,
  "data": {
    "ytd": {
      "total": 45678.92,
      "count": 145,
      "deductible": 42156.78,
      "nonDeductible": 3522.14,
      "avgPerMonth": 3806.58,
      "avgPerExpense": 315.03
    },
    "byCategory": {
      "Marketing": {
        "total": 12456.78,
        "count": 32,
        "deductible": 12456.78
      },
      "Transportation": {
        "total": 5234.56,
        "count": 45,
        "deductible": 5234.56
      }
    },
    "monthlyBreakdown": [
      {
        "month": 1,
        "total": 3456.78,
        "count": 12
      },
      {
        "month": 7,
        "total": 4567.89,
        "count": 15
      }
    ],
    "topVendors": [
      {
        "vendor": "Google Ads",
        "total": 8750.00
      },
      {
        "vendor": "Premier Property Photos",
        "total": 4500.00
      }
    ],
    "mileage": {
      "totalMiles": 3456,
      "totalDeduction": 2263.68,
      "currentRate": 0.655
    },
    "pending": {
      "count": 3,
      "total": 856.42
    },
    "reimbursable": {
      "pending": 2500.00,
      "approved": 750.00
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

#### Get Expense Categories
```http
GET /v1/expenses/categories
```

**Response:**
```json
{
  "success": true,
  "data": {
    "Marketing": [
      "Online Advertising",
      "Print Advertising",
      "Signs & Banners",
      "Photography",
      "Virtual Tours",
      "Direct Mail",
      "Social Media",
      "Website",
      "Other"
    ],
    "Transportation": [
      "Vehicle",
      "Gas",
      "Parking",
      "Tolls",
      "Public Transit",
      "Uber/Lyft",
      "Other"
    ],
    "Office Supplies": [
      "Technology",
      "Furniture",
      "Stationery",
      "Software",
      "Printing",
      "Other"
    ],
    "Professional Services": [
      "Legal",
      "Accounting",
      "Photography",
      "Staging",
      "Inspection",
      "Other"
    ],
    "Professional Development": [
      "Education",
      "Conferences",
      "Training",
      "Certifications",
      "Memberships",
      "Other"
    ]
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

#### Create Expense
```http
POST /v1/expenses
```

**Request Body:**
```json
{
  "category": "Transportation",
  "subcategory": "Gas",
  "vendor": "Chevron",
  "description": "Gas for property showings",
  "amount": 92.45,
  "date": "2025-07-17T00:00:00.000Z",
  "paymentMethod": "Credit Card",
  "paymentReference": "CC-****1234",
  "taxDeductible": true,
  "notes": "Showing properties in North County",
  "tags": ["gas", "auto", "showings"],
  "mileage": {
    "start": 45389,
    "end": 45612,
    "total": 223,
    "rate": 0.655
  }
}
```

#### Generate Expense Report
```http
POST /v1/expenses/report
```

**Request Body:**
```json
{
  "year": 2025,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-12-31T00:00:00.000Z",
  "category": "all",
  "taxDeductible": true
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
- **Financial Management System**:
  - Commission tracking with split calculations and payout management
  - Invoice generation and payment tracking
  - Expense management with tax deduction tracking
  - Financial reporting and analytics
  - Receipt upload and document management

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

## Invoices

### List All Invoices
```http
GET /v1/invoices
```

**Query Parameters:**
- `status` (string) - Filter by status: "pending", "paid", "overdue", "cancelled"
- `clientId` (integer) - Filter by client ID
- `dateFrom` (string) - Start date filter (ISO 8601)
- `dateTo` (string) - End date filter (ISO 8601)
- `minAmount` (number) - Minimum invoice amount
- `maxAmount` (number) - Maximum invoice amount
- `page` (integer) - Page number (default: 1)
- `limit` (integer) - Items per page (default: 10)

**Response (Summary):**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv_001",
      "invoiceNumber": "INV-2025-001",
      "clientId": "1",
      "clientName": "Michael & Sarah Chen",
      "escrowId": "1",
      "escrowNumber": "ESC-2025-001",
      "amount": 31250,
      "status": "pending",
      "dueDate": "2025-08-30T00:00:00.000Z",
      "createdDate": "2025-08-15T00:00:00.000Z",
      "paidDate": null,
      "type": "commission"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 5,
    "limit": 10
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Get Single Invoice
```http
GET /v1/invoices/:id
```

**Response (Comprehensive):**
```json
{
  "success": true,
  "data": {
    "id": "inv_001",
    "invoiceNumber": "INV-2025-001",
    "clientId": "1",
    "clientName": "Michael & Sarah Chen",
    "clientEmail": "michael.chen@email.com",
    "clientPhone": "+1-858-555-0123",
    "escrowId": "1",
    "escrowNumber": "ESC-2025-001",
    "propertyAddress": "456 Ocean View Dr, La Jolla, CA 92037",
    "amount": 31250,
    "status": "pending",
    "dueDate": "2025-08-30T00:00:00.000Z",
    "createdDate": "2025-08-15T00:00:00.000Z",
    "paidDate": null,
    "type": "commission",
    "description": "Commission for sale of property",
    "lineItems": [
      {
        "id": 1,
        "description": "Real estate commission - Sale",
        "quantity": 1,
        "rate": 31250,
        "amount": 31250
      }
    ],
    "subtotal": 31250,
    "tax": 0,
    "taxRate": 0,
    "total": 31250,
    "paymentTerms": "Net 15",
    "paymentMethod": null,
    "paymentReference": null,
    "notes": "Commission payable upon successful closing",
    "attachments": [
      {
        "id": 1,
        "name": "Commission Agreement.pdf",
        "type": "application/pdf",
        "size": 245632,
        "uploadDate": "2025-08-15T00:00:00.000Z",
        "url": "/api/v1/documents/inv_001_attachment_1"
      }
    ],
    "paymentHistory": [],
    "remindersSent": [
      {
        "date": "2025-08-25T00:00:00.000Z",
        "type": "email",
        "recipient": "michael.chen@email.com",
        "status": "sent"
      }
    ],
    "auditTrail": [
      {
        "date": "2025-08-15T00:00:00.000Z",
        "action": "Invoice Created",
        "user": "System",
        "details": "Invoice generated from commission"
      }
    ],
    "createdAt": "2025-08-15T00:00:00.000Z",
    "updatedAt": "2025-08-15T00:00:00.000Z"
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Get Invoice Statistics
```http
GET /v1/invoices/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalInvoices": 156,
      "totalAmount": 2456780,
      "pendingAmount": 487650,
      "paidAmount": 1969130,
      "overdueAmount": 125400,
      "averageInvoiceAmount": 15748,
      "averagePaymentTime": 12.5
    },
    "byStatus": {
      "pending": {
        "count": 23,
        "amount": 487650
      },
      "paid": {
        "count": 125,
        "amount": 1969130
      },
      "overdue": {
        "count": 6,
        "amount": 125400
      },
      "cancelled": {
        "count": 2,
        "amount": 0
      }
    },
    "byMonth": [
      {
        "month": "2025-01",
        "invoices": 18,
        "amount": 285600,
        "paid": 245600,
        "pending": 40000
      },
      {
        "month": "2025-02",
        "invoices": 22,
        "amount": 342800,
        "paid": 298400,
        "pending": 44400
      }
    ],
    "byType": {
      "commission": {
        "count": 98,
        "amount": 1876540
      },
      "service": {
        "count": 45,
        "amount": 456780
      },
      "other": {
        "count": 13,
        "amount": 123460
      }
    },
    "topClients": [
      {
        "clientId": "1",
        "clientName": "Michael & Sarah Chen",
        "invoiceCount": 12,
        "totalAmount": 186500
      }
    ],
    "paymentMethods": {
      "check": {
        "count": 85,
        "amount": 1345670
      },
      "wire": {
        "count": 32,
        "amount": 567890
      },
      "ach": {
        "count": 8,
        "amount": 55570
      }
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Create Invoice
```http
POST /v1/invoices
```

**Request Body:**
```json
{
  "clientId": "1",
  "escrowId": "1",
  "type": "commission",
  "dueDate": "2025-08-30",
  "paymentTerms": "Net 15",
  "lineItems": [
    {
      "description": "Real estate commission - Sale",
      "quantity": 1,
      "rate": 31250
    }
  ],
  "notes": "Commission payable upon successful closing",
  "sendEmail": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "inv_002",
    "invoiceNumber": "INV-2025-002",
    "message": "Invoice created successfully",
    "emailSent": true
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Record Invoice Payment
```http
POST /v1/invoices/:id/payment
```

**Request Body:**
```json
{
  "amount": 31250,
  "paymentMethod": "check",
  "paymentDate": "2025-08-28",
  "paymentReference": "Check #1234",
  "notes": "Payment received via mail"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "inv_001",
    "status": "paid",
    "paidAmount": 31250,
    "paidDate": "2025-08-28T00:00:00.000Z",
    "balance": 0,
    "message": "Payment recorded successfully"
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

---

## Expenses

### List All Expenses
```http
GET /v1/expenses
```

**Query Parameters:**
- `category` (string) - Filter by category
- `dateFrom` (string) - Start date filter (ISO 8601)
- `dateTo` (string) - End date filter (ISO 8601)
- `minAmount` (number) - Minimum expense amount
- `maxAmount` (number) - Maximum expense amount
- `taxDeductible` (boolean) - Filter by tax deductible status
- `reimbursable` (boolean) - Filter by reimbursable status
- `page` (integer) - Page number (default: 1)
- `limit` (integer) - Items per page (default: 10)

**Response (Summary):**
```json
{
  "success": true,
  "data": [
    {
      "id": "exp_001",
      "date": "2025-07-15T00:00:00.000Z",
      "vendor": "Office Depot",
      "description": "Office supplies",
      "category": "office_supplies",
      "amount": 156.43,
      "taxDeductible": true,
      "reimbursable": false,
      "status": "approved",
      "paymentMethod": "credit_card",
      "hasReceipt": true
    }
  ],
  "pagination": {
    "total": 234,
    "page": 1,
    "pages": 24,
    "limit": 10
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Get Single Expense
```http
GET /v1/expenses/:id
```

**Response (Comprehensive):**
```json
{
  "success": true,
  "data": {
    "id": "exp_001",
    "date": "2025-07-15T00:00:00.000Z",
    "vendor": "Office Depot",
    "description": "Office supplies for July",
    "category": "office_supplies",
    "subcategory": "general_supplies",
    "amount": 156.43,
    "taxAmount": 12.51,
    "totalAmount": 168.94,
    "taxDeductible": true,
    "deductionCategory": "business_expense",
    "reimbursable": false,
    "reimbursementStatus": null,
    "status": "approved",
    "paymentMethod": "credit_card",
    "paymentAccount": "Business Credit Card ****1234",
    "referenceNumber": "OD-2025-07-15-001",
    "notes": "Monthly office supply run - printer paper, pens, folders",
    "tags": ["office", "supplies", "monthly"],
    "receipt": {
      "id": "rec_001",
      "filename": "office_depot_receipt_071525.pdf",
      "uploadDate": "2025-07-15T14:30:00.000Z",
      "fileSize": 145632,
      "url": "/api/v1/documents/exp_001_receipt"
    },
    "attachments": [
      {
        "id": "att_001",
        "filename": "itemized_list.xlsx",
        "type": "application/vnd.ms-excel",
        "uploadDate": "2025-07-15T14:32:00.000Z",
        "url": "/api/v1/documents/exp_001_att_001"
      }
    ],
    "mileage": null,
    "project": null,
    "client": null,
    "approvedBy": "Jayden Metz",
    "approvedDate": "2025-07-16T09:00:00.000Z",
    "accounting": {
      "glCode": "6100",
      "glDescription": "Office Supplies",
      "costCenter": "ADMIN",
      "taxYear": 2025,
      "quarter": "Q3"
    },
    "recurring": {
      "isRecurring": false,
      "frequency": null,
      "nextDate": null
    },
    "auditTrail": [
      {
        "date": "2025-07-15T14:30:00.000Z",
        "action": "Expense Created",
        "user": "Jayden Metz",
        "details": "Expense submitted for approval"
      },
      {
        "date": "2025-07-16T09:00:00.000Z",
        "action": "Expense Approved",
        "user": "Admin",
        "details": "Approved as business expense"
      }
    ],
    "createdAt": "2025-07-15T14:30:00.000Z",
    "updatedAt": "2025-07-16T09:00:00.000Z"
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Get Expense Statistics
```http
GET /v1/expenses/stats
```

**Query Parameters:**
- `year` (integer) - Year for statistics (default: current year)
- `quarter` (string) - Quarter filter (Q1, Q2, Q3, Q4)
- `groupBy` (string) - Group statistics by: "category", "month", "vendor"

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalExpenses": 456,
      "totalAmount": 125678.90,
      "taxDeductibleAmount": 98456.78,
      "nonDeductibleAmount": 27222.12,
      "averageExpense": 275.61,
      "largestExpense": 8945.00,
      "expenseCount": {
        "daily": 2.1,
        "weekly": 14.7,
        "monthly": 63.5
      }
    },
    "byCategory": [
      {
        "category": "office_supplies",
        "displayName": "Office Supplies",
        "count": 48,
        "amount": 3456.78,
        "percentage": 2.75,
        "taxDeductible": 3456.78
      },
      {
        "category": "travel",
        "displayName": "Travel & Transportation",
        "count": 89,
        "amount": 12345.67,
        "percentage": 9.82,
        "taxDeductible": 11234.56
      },
      {
        "category": "marketing",
        "displayName": "Marketing & Advertising",
        "count": 67,
        "amount": 23456.78,
        "percentage": 18.65,
        "taxDeductible": 23456.78
      }
    ],
    "byMonth": [
      {
        "month": "2025-01",
        "expenses": 38,
        "amount": 9876.54,
        "taxDeductible": 8765.43
      },
      {
        "month": "2025-02",
        "expenses": 42,
        "amount": 10234.56,
        "taxDeductible": 9123.45
      }
    ],
    "topVendors": [
      {
        "vendor": "Office Depot",
        "count": 12,
        "totalAmount": 1876.54
      },
      {
        "vendor": "Uber",
        "count": 45,
        "totalAmount": 2345.67
      }
    ],
    "paymentMethods": {
      "credit_card": {
        "count": 234,
        "amount": 67890.12
      },
      "debit_card": {
        "count": 123,
        "amount": 34567.89
      },
      "cash": {
        "count": 89,
        "amount": 12345.67
      },
      "check": {
        "count": 10,
        "amount": 10875.22
      }
    },
    "taxDeductions": {
      "estimatedDeductions": 98456.78,
      "byCategory": [
        {
          "category": "business_expense",
          "amount": 45678.90
        },
        {
          "category": "vehicle",
          "amount": 23456.78
        },
        {
          "category": "home_office",
          "amount": 12345.67
        }
      ]
    },
    "trends": {
      "monthOverMonth": {
        "change": 5.2,
        "trend": "increasing"
      },
      "yearOverYear": {
        "change": -2.8,
        "trend": "decreasing"
      },
      "projectedYearEnd": 145678.90
    }
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Get Expense Categories
```http
GET /v1/expenses/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "office_supplies",
      "name": "Office Supplies",
      "description": "General office supplies and equipment",
      "taxDeductible": true,
      "glCode": "6100",
      "subcategories": [
        { "id": "general_supplies", "name": "General Supplies" },
        { "id": "furniture", "name": "Office Furniture" },
        { "id": "equipment", "name": "Office Equipment" }
      ]
    },
    {
      "id": "travel",
      "name": "Travel & Transportation",
      "description": "Business travel and local transportation",
      "taxDeductible": true,
      "glCode": "6200",
      "subcategories": [
        { "id": "airfare", "name": "Airfare" },
        { "id": "lodging", "name": "Hotels & Lodging" },
        { "id": "meals", "name": "Meals & Entertainment" },
        { "id": "ground_transport", "name": "Ground Transportation" },
        { "id": "mileage", "name": "Vehicle Mileage" }
      ]
    },
    {
      "id": "marketing",
      "name": "Marketing & Advertising",
      "description": "Marketing, advertising, and promotional expenses",
      "taxDeductible": true,
      "glCode": "6300",
      "subcategories": [
        { "id": "digital_ads", "name": "Digital Advertising" },
        { "id": "print_ads", "name": "Print Advertising" },
        { "id": "promotional", "name": "Promotional Materials" },
        { "id": "events", "name": "Events & Sponsorships" }
      ]
    }
  ],
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Create Expense
```http
POST /v1/expenses
```

**Request Body:**
```json
{
  "date": "2025-07-15",
  "vendor": "Office Depot",
  "description": "Office supplies for July",
  "category": "office_supplies",
  "subcategory": "general_supplies",
  "amount": 156.43,
  "taxAmount": 12.51,
  "taxDeductible": true,
  "paymentMethod": "credit_card",
  "referenceNumber": "OD-2025-07-15-001",
  "notes": "Monthly office supply run",
  "tags": ["office", "supplies", "monthly"],
  "receipt": {
    "data": "base64_encoded_file_data",
    "filename": "receipt.pdf",
    "mimeType": "application/pdf"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "exp_002",
    "message": "Expense created successfully",
    "status": "pending_approval",
    "receiptUploaded": true
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

### Generate Expense Report
```http
POST /v1/expenses/report
```

**Request Body:**
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "categories": ["travel", "marketing", "office_supplies"],
  "format": "pdf",
  "groupBy": "category",
  "includeTaxSummary": true,
  "includeReceipts": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "rpt_2025_001",
    "status": "processing",
    "estimatedTime": 30,
    "downloadUrl": null,
    "message": "Report generation started. You will be notified when complete."
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

---

## Additional Resources

### Webhooks
```http
POST /v1/webhooks
```

Configure webhooks to receive real-time notifications for various events.

**Request Body:**
```json
{
  "url": "https://your-domain.com/webhook-endpoint",
  "events": [
    "escrow.created",
    "escrow.updated",
    "escrow.closed",
    "listing.created",
    "listing.status_changed",
    "client.created",
    "lead.converted",
    "appointment.created",
    "appointment.cancelled",
    "commission.paid",
    "invoice.paid",
    "ai.task_completed"
  ],
  "secret": "your-webhook-secret",
  "active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "wh_001",
    "url": "https://your-domain.com/webhook-endpoint",
    "events": ["escrow.created", "escrow.updated"],
    "secret": "wh_sec_***",
    "active": true,
    "createdAt": "2025-07-17T00:00:00.000Z"
  },
  "timestamp": "2025-07-17T00:00:00.000Z"
}
```

**Webhook Payload Format:**
```json
{
  "id": "evt_001",
  "type": "escrow.created",
  "timestamp": "2025-07-17T00:00:00.000Z",
  "data": {
    "escrowId": "1",
    "escrowNumber": "ESC-2025-001",
    "propertyAddress": "456 Ocean View Dr, La Jolla, CA 92037"
  },
  "signature": "sha256=..."
}
```

**Available Webhook Events:**
- **Escrows**: `escrow.created`, `escrow.updated`, `escrow.closed`, `escrow.cancelled`
- **Listings**: `listing.created`, `listing.updated`, `listing.status_changed`, `listing.price_reduced`
- **Clients**: `client.created`, `client.updated`, `client.deleted`, `client.status_changed`
- **Leads**: `lead.created`, `lead.updated`, `lead.converted`, `lead.status_changed`
- **Appointments**: `appointment.created`, `appointment.updated`, `appointment.cancelled`, `appointment.completed`
- **Financial**: `commission.created`, `commission.paid`, `invoice.created`, `invoice.paid`, `expense.approved`
- **AI**: `ai.task_started`, `ai.task_completed`, `ai.task_failed`, `ai.insight_generated`

---

## Support

For API support, please contact:
- Email: api-support@your-company.com
- Documentation: https://docs.your-company.com/api
- Status Page: https://status.your-company.com