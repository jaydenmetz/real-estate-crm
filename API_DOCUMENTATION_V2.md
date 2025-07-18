# Real Estate CRM API Documentation

## Table of Contents

### Core API Information
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Standard Response Format](#standard-response-format)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

### Core Endpoints
- [Escrows](#escrows)
  - [List All Escrows](#list-all-escrows)
  - [Get Single Escrow](#get-single-escrow)
  - [Create Escrow](#create-escrow)
  - [Update Escrow](#update-escrow)
  - [Delete Escrow](#delete-escrow)
  - [Update Escrow Checklist](#update-escrow-checklist)
  - [Parse RPA PDF](#parse-rpa-pdf)
  
- [Listings](#listings)
  - [List All Listings](#list-all-listings)
  - [Get Single Listing](#get-single-listing)
  - [Create Listing](#create-listing)
  - [Update Listing](#update-listing)
  - [Update Listing Status](#update-listing-status)
  - [Log Price Reduction](#log-price-reduction)
  - [Log Showing](#log-showing)
  - [Get Price History](#get-price-history)
  - [Update Listing Checklist](#update-listing-checklist)
  - [Get Listing Analytics](#get-listing-analytics)

- [Clients](#clients)
  - [List All Clients](#list-all-clients)
  - [Get Single Client](#get-single-client)
  - [Create Client](#create-client)
  - [Update Client](#update-client)
  - [Delete Client](#delete-client)
  - [Add Client Note](#add-client-note)
  - [Log Client Communication](#log-client-communication)
  - [Update Client Status](#update-client-status)
  - [Add Client Tag](#add-client-tag)
  - [Remove Client Tag](#remove-client-tag)
  - [Get Client Statistics](#get-client-statistics)
  - [Get Client Transactions](#get-client-transactions)
  - [Get Client Communications](#get-client-communications)
  - [Get Client Notes](#get-client-notes)

- [Appointments](#appointments)
  - [List All Appointments](#list-all-appointments)
  - [Get Single Appointment](#get-single-appointment)
  - [Create Appointment](#create-appointment)
  - [Update Appointment](#update-appointment)
  - [Cancel Appointment](#cancel-appointment)
  - [Reschedule Appointment](#reschedule-appointment)
  - [Update Appointment Status](#update-appointment-status)
  - [Get Upcoming Appointments](#get-upcoming-appointments)
  - [Check Appointment Conflicts](#check-appointment-conflicts)
  - [Get Appointment Statistics](#get-appointment-statistics)

- [Leads](#leads)
  - [List All Leads](#list-all-leads)
  - [Get Single Lead](#get-single-lead)
  - [Create Lead](#create-lead)
  - [Update Lead](#update-lead)
  - [Convert Lead to Client](#convert-lead-to-client)
  - [Delete Lead](#delete-lead)
  - [Update Lead Status](#update-lead-status)
  - [Update Lead Score](#update-lead-score)
  - [Log Lead Activity](#log-lead-activity)
  - [Get Lead Statistics](#get-lead-statistics)
  - [Get Hot Leads](#get-hot-leads)
  - [Get Lead Communications](#get-lead-communications)

### Financial Management
- [Commissions](#commissions)
  - [List All Commissions](#list-all-commissions)
  - [Get Single Commission](#get-single-commission)
  - [Get Commission Statistics](#get-commission-statistics)
  - [Create Commission](#create-commission)
  - [Update Commission Status](#update-commission-status)

- [Invoices](#invoices)
  - [List All Invoices](#list-all-invoices)
  - [Get Single Invoice](#get-single-invoice)
  - [Get Invoice Statistics](#get-invoice-statistics)
  - [Create Invoice](#create-invoice)
  - [Record Invoice Payment](#record-invoice-payment)

- [Expenses](#expenses)
  - [List All Expenses](#list-all-expenses)
  - [Get Single Expense](#get-single-expense)
  - [Get Expense Statistics](#get-expense-statistics)
  - [Get Expense Categories](#get-expense-categories)
  - [Create Expense](#create-expense)
  - [Generate Expense Report](#generate-expense-report)

### AI & Analytics
- [AI Agents](#ai-agents)
  - [Get All AI Agents](#get-all-ai-agents)
  - [Toggle AI Agent](#toggle-ai-agent)
  - [Get Token Usage](#get-token-usage)
  - [Get Daily Briefing (Alex)](#get-daily-briefing-alex)
  - [Process Lead with AI](#process-lead-with-ai)
  - [Get AI Team Status](#get-ai-team-status)
  - [Trigger AI Task](#trigger-ai-task)

- [Analytics](#analytics)
  - [Dashboard Analytics](#dashboard-analytics)
  - [Escrow Analytics](#escrow-analytics)
  - [Listing Analytics](#listing-analytics-endpoint)
  - [Appointment Analytics](#appointment-analytics)
  - [Lead Analytics](#lead-analytics)

### Additional Features
- [Property Search](#property-search)
- [Update Entity Checklists](#update-entity-checklists)
- [WebSocket Events](#websocket-events)
- [Webhooks](#webhooks)
- [SDK Examples](#sdk-examples)
- [Implementation Status](#implementation-status)

---

## Overview

This document provides comprehensive documentation for the Real Estate CRM API. All endpoints follow RESTful conventions and return standardized JSON responses.

## Base URL
```
Production: https://api.jaydenmetz.com/v1
Development: http://localhost:5050/v1
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

**Note:** Some endpoints currently have authentication middleware commented out during development. These will be enforced in production.

## Standard Response Format
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

**Response:** Returns comprehensive escrow data including property details, buyer/seller information, financials, checklist, timeline, documents, AI agents, recent activity, and market data.

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

### Get Single Listing
```http
GET /v1/listings/:id
```

**Response:** Returns comprehensive listing data including property details, features, rooms, schools, activity log, analytics, marketing checklist, price history, and comparable properties.

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

### Get Single Client
```http
GET /v1/clients/:id
```

**Response:** Returns comprehensive client data including communication history, properties, tasks, financial summary, preferences, and AI insights.

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

### Get Client Transactions
```http
GET /v1/clients/:id/transactions
```

### Get Client Communications
```http
GET /v1/clients/:id/communications
```

### Get Client Notes
```http
GET /v1/clients/:id/notes
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

### Get Single Appointment
```http
GET /v1/appointments/:id
```

**Response:** Returns comprehensive appointment data including location details, attendees, tasks, related appointments, driving info, and follow-up actions.

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

### Get Appointment Statistics
```http
GET /v1/appointments/stats
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

### Get Single Lead
```http
GET /v1/leads/:id
```

**Response:** Returns comprehensive lead data including source details, budget, property interest, score breakdown, activity timeline, recommended properties, and AI insights.

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

### Update Lead
```http
PUT /v1/leads/:id
```

### Convert Lead to Client
```http
POST /v1/leads/:id/convert
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

### Get Hot Leads
```http
GET /v1/leads/hot
```

**Query Parameters:**
- `limit` (integer) - Maximum number of leads to return (default: 10)

### Get Lead Communications
```http
GET /v1/leads/:id/communications
```

---

## Commissions

### List All Commissions
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

### Get Single Commission
```http
GET /v1/commissions/:id
```

**Response:** Returns comprehensive commission data including breakdown, transaction details, payment history, documents, and audit trail.

### Get Commission Statistics
```http
GET /v1/commissions/stats
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| agentId | string | Filter stats by agent ID (optional) |

### Create Commission
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

### Update Commission Status
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

---

## Invoices

### List All Invoices
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

### Get Single Invoice
```http
GET /v1/invoices/:id
```

**Response:** Returns comprehensive invoice data including line items, payment history, activity log, and email history.

### Get Invoice Statistics
```http
GET /v1/invoices/stats
```

### Create Invoice
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

### Record Invoice Payment
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

---

## Expenses

### List All Expenses
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

### Get Single Expense
```http
GET /v1/expenses/:id
```

**Response:** Returns comprehensive expense data including receipt info, tax info, related expenses, and audit trail.

### Get Expense Statistics
```http
GET /v1/expenses/stats
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| year | integer | Year for statistics (default: current year) |

### Get Expense Categories
```http
GET /v1/expenses/categories
```

### Create Expense
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

### Generate Expense Report
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

## AI Agents

### Get All AI Agents
```http
GET /v1/ai/agents
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

### Get Daily Briefing (Alex)
```http
GET /v1/ai/alex/daily-briefing
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

### Escrow Analytics
```http
GET /v1/analytics/escrow/:id
```

Get detailed analytics and insights for a specific escrow transaction.

### Listing Analytics Endpoint
```http
GET /v1/analytics/listing/:id
```

Get performance analytics and trends for a specific listing.

### Appointment Analytics
```http
GET /v1/analytics/appointments/:id
```

Get analytics and related information for a specific appointment.

### Lead Analytics
```http
GET /v1/analytics/lead/:id
```

Get engagement analytics and conversion insights for a specific lead.

---

## Additional Features

### Property Search
```http
GET /v1/properties/search
```

**Query Parameters:**
- `address` (string) - Partial or full address to search

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

## Support

For API support, please contact:
- Email: api-support@your-company.com
- Documentation: https://docs.your-company.com/api
- Status Page: https://status.your-company.com