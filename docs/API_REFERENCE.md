# API Reference - Real Estate CRM

Complete API documentation for all backend endpoints.

**Base URL:** `https://api.jaydenmetz.com/v1`
**Authentication:** JWT tokens or API keys
**Response Format:** JSON

---

## 🔐 Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication.

### Methods

**1. JWT Token (Session-based)**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. API Key (Stateless)**
```http
X-API-Key: your-64-character-api-key-here
```

---

## 📋 Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-10-06T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "timestamp": "2025-10-06T12:00:00.000Z"
}
```

---

## 🏠 Escrows API

### GET /escrows
Get all escrows for authenticated user.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)
- `status` (string) - Filter by status: "Active", "Pending", "Closed", "Cancelled"
- `search` (string) - Search by property address
- `sort` (string) - Sort field (default: "created_at")
- `order` (string) - "asc" or "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "propertyAddress": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "purchasePrice": 500000,
      "escrowStatus": "Active",
      "closingDate": "2025-11-15",
      "myCommission": 15000,
      "created_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

### POST /escrows
Create new escrow.

**Request Body:**
```json
{
  "propertyAddress": "123 Main St",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001",
  "purchasePrice": 500000,
  "closingDate": "2025-11-15"
}
```

**Response:** HTTP 201 with created escrow object

### GET /escrows/:id
Get single escrow by ID.

### PUT /escrows/:id
Update escrow.

### DELETE /escrows/:id
Soft delete escrow (sets deleted_at timestamp).

---

## 🏢 Listings API

### GET /listings
Get all listings for authenticated user.

**Query Parameters:** Same as escrows

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "propertyAddress": "456 Oak Ave",
      "listingPrice": 750000,
      "status": "Active",
      "listingDate": "2025-10-01",
      "propertyType": "Single Family",
      "bedrooms": 4,
      "bathrooms": 3,
      "squareFeet": 2500
    }
  ]
}
```

### POST /listings
Create new listing.

### GET /listings/:id
Get single listing.

### PUT /listings/:id
Update listing.

### DELETE /listings/:id
Soft delete listing.

---

## 👥 Clients API

### GET /clients
Get all clients for authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "(555) 123-4567",
      "status": "Active",
      "clientType": "Buyer",
      "created_at": "2025-09-15T08:00:00Z"
    }
  ]
}
```

### POST /clients
Create new client.

### GET /clients/:id
Get single client.

### PUT /clients/:id
Update client.

### DELETE /clients/:id
Soft delete client.

---

## 🎯 Leads API

### GET /leads
Get all leads for authenticated user.

**Query Parameters:**
- `status` - Filter by status: "New", "Contacted", "Qualified", "Converted", "Lost"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "(555) 987-6543",
      "status": "Qualified",
      "source": "Website",
      "interestedIn": "Buying",
      "created_at": "2025-10-05T14:30:00Z"
    }
  ]
}
```

### POST /leads
Create new lead.

### PUT /leads/:id
Update lead status.

### DELETE /leads/:id
Soft delete lead.

---

## 📅 Appointments API

### GET /appointments
Get all appointments for authenticated user.

**Query Parameters:**
- `startDate` - Filter appointments after date
- `endDate` - Filter appointments before date
- `status` - Filter by status: "Scheduled", "Completed", "Cancelled"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Property Showing",
      "startTime": "2025-10-10T14:00:00Z",
      "endTime": "2025-10-10T15:00:00Z",
      "location": "123 Main St",
      "status": "Scheduled",
      "attendees": ["client@example.com"]
    }
  ]
}
```

### POST /appointments
Create new appointment.

### PUT /appointments/:id
Update appointment.

### DELETE /appointments/:id
Cancel appointment.

---

## 💰 Commissions API

### GET /commissions
Get all commissions for authenticated user.

**Query Parameters:**
- `status` - Filter by status: "Pending", "Paid"
- `startDate` - Filter by date range
- `endDate` - Filter by date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 15000,
      "percentage": 3.0,
      "side": "buyer",
      "status": "Paid",
      "escrowId": "uuid",
      "paidDate": "2025-10-01T00:00:00Z"
    }
  ]
}
```

### POST /commissions/calculate
Calculate commission from sale price.

**Request:**
```json
{
  "salePrice": 500000,
  "commissionPercentage": 3.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "salePrice": 500000,
    "percentage": 3.0,
    "commission": 15000
  }
}
```

---

## 💸 Expenses API

### GET /expenses
Get all expenses for authenticated user.

**Query Parameters:**
- `category` - Filter by category: "Marketing", "Office", "Travel", etc.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 250.50,
      "category": "Marketing",
      "description": "Google Ads",
      "date": "2025-10-01",
      "created_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

### POST /expenses
Create new expense.

### DELETE /expenses/:id
Delete expense.

---

## 🧾 Invoices API

### GET /invoices
Get all invoices for authenticated user.

**Query Parameters:**
- `status` - Filter by status: "Draft", "Sent", "Paid", "Overdue"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clientId": "uuid",
      "amount": 15000,
      "status": "Paid",
      "dueDate": "2025-10-15",
      "paidDate": "2025-10-10",
      "items": [
        {
          "description": "Commission",
          "amount": 15000
        }
      ]
    }
  ]
}
```

### POST /invoices
Create new invoice.

### PUT /invoices/:id/status
Update invoice status.

---

## 🔗 Link Preview API

### GET /link-preview?url=https://example.com
Get OpenGraph metadata from URL.

**Security:**
- HTTPS required
- Localhost/file:// URLs blocked (SSRF protection)
- HTML sanitized (XSS protection)
- 10 second timeout

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Example Site",
    "description": "An example website",
    "image": "https://example.com/image.jpg",
    "url": "https://example.com"
  }
}
```

---

## 🪝 Webhooks API

### POST /webhooks
Register new webhook.

**Request:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["escrow.created", "escrow.updated"],
  "secret": "webhook-secret-123"
}
```

**Response:** HTTP 201 with webhook object

**Security:**
- HTTPS required
- HMAC signature verification
- Idempotency (duplicate events handled)

---

## 👤 Admin API

### GET /admin/stats
Get database statistics (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "users": 42,
    "escrows": 156,
    "listings": 89,
    "clients": 203,
    "appointments": 67,
    "leads": 134
  }
}
```

### GET /admin/users
Get all users (admin only).

### GET /admin/users/:id
Get specific user (admin only).

### PUT /admin/users/:id
Update user (admin only).

### DELETE /admin/users/:id
Deactivate user (admin only).

---

## 🔧 Authentication API

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "agent"
    }
  }
}
```

### POST /auth/register
Create new user account.

### POST /auth/refresh
Refresh JWT token using refresh token.

### POST /auth/logout
Logout and invalidate tokens.

---

## 🔑 API Keys Management

### GET /api-keys
Get all API keys for authenticated user.

### POST /api-keys
Create new API key.

**Request:**
```json
{
  "name": "Production API Key",
  "expiresInDays": 365
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Production API Key",
    "key": "full-64-character-key-shown-only-once",
    "keyPreview": "...ast8chars",
    "expiresAt": "2026-10-06T00:00:00Z"
  }
}
```

⚠️ **Important:** Full key shown only once during creation!

### DELETE /api-keys/:id
Delete API key.

---

## ❤️ Health Check Endpoints

### GET /v1/health
Basic health check.

### GET /v1/escrows/health
Comprehensive escrows module health check (29 tests).

### GET /v1/listings/health
Listings module health check (26 tests).

### GET /v1/clients/health
Clients module health check (15 tests).

### GET /v1/appointments/health
Appointments module health check (15 tests).

### GET /v1/leads/health
Leads module health check (14 tests).

---

## 📊 Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DATABASE_ERROR` | 500 | Database query failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## 🚀 Rate Limits

- **Authentication endpoints:** 30 requests per 15 minutes per IP
- **API endpoints:** No hard limit (monitored for abuse)
- **Health checks:** Unlimited

---

## 📝 Notes

- All dates in ISO 8601 format (UTC)
- All currency values in cents (divide by 100 for dollars)
- Soft deletes preserve data (set `deleted_at` timestamp)
- Team-based data isolation enforced
- All endpoints support pagination where applicable

---

**Last Updated:** October 6, 2025
**API Version:** v1
**Contact:** admin@jaydenmetz.com
