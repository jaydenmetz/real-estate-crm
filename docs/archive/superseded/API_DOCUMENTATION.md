# Real Estate CRM API Documentation

## Base URL
- Development: `http://localhost:5050/v1`
- Production: `https://api.jaydenmetz.com/v1`

## Authentication
All endpoints require authentication using either:
1. **Bearer Token**: `Authorization: Bearer <token>`
2. **API Key**: `X-API-Key: <api_key>`

## Response Format
All responses follow this structure:
```json
{
  "success": boolean,
  "data": object | array,
  "error": {
    "code": string,
    "message": string
  },
  "message": string,
  "timestamp": "ISO 8601 date"
}
```

## Endpoints

### Authentication

#### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "company": "string",
  "phone": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "JWT token",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "permissions": [],
      "profile": {}
    }
  }
}
```

#### POST /auth/login
Authenticate user and receive token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "rememberMe": boolean
}
```

### Escrows

#### GET /escrows
List all escrows with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `status` (string): Filter by status
- `minPrice` (number): Minimum purchase price filter
- `maxPrice` (number): Maximum purchase price filter
- `closingDateStart` (ISO 8601): Start date for closing date range
- `closingDateEnd` (ISO 8601): End date for closing date range

**Response:**
```json
{
  "success": true,
  "data": {
    "escrows": [
      {
        "id": "string",
        "displayId": "string",
        "escrowNumber": "string",
        "propertyAddress": "string",
        "city": "string",
        "state": "string",
        "zipCode": "string",
        "escrowStatus": "string",
        "purchasePrice": number,
        "myCommission": number,
        "acceptanceDate": "ISO date",
        "closingDate": "ISO date",
        "scheduledCoeDate": "ISO date",
        "daysToClose": number,
        "checklistProgress": number,
        "buyers": [],
        "sellers": [],
        "buyerAgent": "string",
        "listingAgent": "string",
        "escrowOfficerName": "string",
        "checklists": {
          "loan": {},
          "house": {},
          "admin": {}
        }
      }
    ],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
}
```

#### GET /escrows/:id
Get detailed escrow information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "displayId": "string",
    "escrowNumber": "string",
    "propertyAddress": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "county": "string",
    "escrowStatus": "string",
    "purchasePrice": number,
    "myCommission": number,
    "acceptanceDate": "ISO date",
    "closingDate": "ISO date",
    "scheduledCoeDate": "ISO date",
    "escrowOfficerName": "string",
    "escrowOfficerEmail": "string",
    "escrowOfficerPhone": "string",
    "escrowCompanyName": "string",
    "titleOfficerName": "string",
    "loanOfficerName": "string",
    "buyers": [],
    "sellers": [],
    "buyerAgent": "string",
    "listingAgent": "string",
    "checklists": {},
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

#### POST /escrows
Create a new escrow.

**Request Body:**
```json
{
  "propertyAddress": "string (required)",
  "purchasePrice": number,
  "buyers": ["string"],
  "sellers": ["string"],
  "acceptanceDate": "ISO date",
  "closingDate": "ISO date",
  "escrowStatus": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string"
}
```

**Note:** Both snake_case and camelCase field names are accepted.

#### PUT /escrows/:id
Update an existing escrow.

**Request Body:**
```json
{
  "purchasePrice": number,
  "closingDate": "ISO date",
  "escrowStatus": "string",
  "escrowOfficerName": "string"
}
```

**Note:** Both snake_case and camelCase field names are accepted.

#### DELETE /escrows/:id
Delete an escrow.

#### PATCH /escrows/:id/checklist
Update a checklist item.

**Request Body:**
```json
{
  "item": "string (required)",
  "value": boolean,
  "note": "string"
}
```

### Escrow Sub-Resources

#### GET /escrows/:id/timeline
Get escrow timeline events.

#### GET /escrows/:id/people
Get all people associated with the escrow.

#### GET /escrows/:id/financials
Get financial details for the escrow.

#### GET /escrows/:id/checklists
Get all checklists for the escrow.

#### GET /escrows/:id/details
Get comprehensive escrow details.

#### GET /escrows/:id/property-details
Get property-specific details.

#### GET /escrows/:id/checklist-loan
Get loan checklist items.

#### GET /escrows/:id/checklist-house
Get house/property checklist items.

#### GET /escrows/:id/checklist-admin
Get administrative checklist items.

#### GET /escrows/:id/documents
Get documents associated with the escrow.

#### GET /escrows/:id/notes
Get notes for the escrow.

#### POST /escrows/:id/notes
Add a note to an escrow.

**Request Body:**
```json
{
  "note": "string (required)",
  "type": "string"
}
```

### Escrow Updates

#### PUT /escrows/:id/details
Update escrow details.

#### PUT /escrows/:id/people
Update people associated with the escrow.

#### PUT /escrows/:id/timeline
Update timeline events.

#### PUT /escrows/:id/financials
Update financial information.

#### PUT /escrows/:id/property-details
Update property details.

#### PUT /escrows/:id/checklist-loan
Update loan checklist.

#### PUT /escrows/:id/checklist-house
Update house checklist.

#### PUT /escrows/:id/checklist-admin
Update admin checklist.

#### PUT /escrows/:id/documents
Update documents list.

### Health Check Endpoints

#### GET /escrows/health
Comprehensive health check that tests all CRUD operations.

#### GET /escrows/health/auth
Test authentication system.

#### GET /escrows/health/db
Test database connectivity.

### API Keys

#### GET /api-keys
List all API keys for the authenticated user.

#### POST /api-keys
Create a new API key.

**Request Body:**
```json
{
  "name": "string",
  "expiresInDays": number
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "key": "64-character-hex-string",
    "keyPrefix": "first-8-chars",
    "name": "string",
    "expiresAt": "ISO date"
  }
}
```

#### PUT /api-keys/:id/revoke
Revoke an API key.

#### DELETE /api-keys/:id
Delete an API key.

### Other Resources

#### Clients
- GET /clients
- GET /clients/:id
- POST /clients
- PUT /clients/:id
- DELETE /clients/:id
- POST /clients/:id/notes
- PATCH /clients/:id/tags

#### Listings
- GET /listings
- GET /listings/:id
- POST /listings
- PUT /listings/:id
- POST /listings/:id/price-reduction
- POST /listings/:id/showings

#### Commissions
- GET /commissions
- GET /commissions/stats
- GET /commissions/:id
- POST /commissions
- PUT /commissions/:id
- PATCH /commissions/:id/status
- DELETE /commissions/:id

#### Invoices
- GET /invoices
- GET /invoices/stats
- GET /invoices/:id
- GET /invoices/:id/download
- POST /invoices
- PUT /invoices/:id
- POST /invoices/:id/payment
- POST /invoices/:id/reminder
- DELETE /invoices/:id

#### Documents
- GET /documents
- GET /documents/:id
- POST /documents
- PUT /documents/:id
- DELETE /documents/:id

#### Uploads
- POST /upload/document
- POST /upload/image
- GET /upload/:filename
- GET /upload/metadata/:id
- DELETE /upload/:id
- GET /upload/stats/summary

#### Settings
- GET /settings
- PUT /settings
- PUT /settings/notifications
- GET /settings/theme
- POST /settings/theme/toggle

#### Communications
- GET /communications
- POST /communications
- GET /communications/:id
- PUT /communications/:id
- DELETE /communications/:id

## Error Codes

- `NO_AUTH`: No authentication provided
- `INVALID_TOKEN`: Token is invalid or expired
- `INVALID_API_KEY`: API key is invalid or revoked
- `SESSION_EXPIRED`: Session has expired
- `MISSING_FIELDS`: Required fields are missing
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: Insufficient permissions
- `SERVER_ERROR`: Internal server error
- `DATABASE_ERROR`: Database operation failed

## Rate Limiting

- 100 requests per minute per IP for authenticated users
- 20 requests per minute per IP for unauthenticated users
- 1000 requests per hour per user token

## Field Name Convention

The API accepts both snake_case and camelCase field names for compatibility:
- `property_address` or `propertyAddress`
- `purchase_price` or `purchasePrice`
- `closing_date` or `closingDate`
- `escrow_status` or `escrowStatus`
- `escrow_officer_name` or `escrowOfficerName`

## Best Practices

1. **Authentication**: Always include authentication headers
2. **Pagination**: Use pagination for list endpoints to improve performance
3. **Error Handling**: Implement exponential backoff for retries
4. **Field Names**: Use camelCase for new implementations
5. **API Keys**: Store API keys securely, never in client-side code
6. **Monitoring**: Track API usage and response times

## Testing

Test endpoints are available for development:
- GET /debug/test-db - Test database connectivity
- GET /debug/db-status - Get database status (requires auth)

## Support

For API support and issues:
- GitHub Issues: https://github.com/jaydenmetz/real-estate-crm/issues
- Documentation: https://api.jaydenmetz.com/docs