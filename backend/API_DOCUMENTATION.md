# Real Estate CRM API Documentation

## Base URL
- Development: `http://localhost:5050/v1`
- Production: `https://api.jaydenmetz.com/v1`

## Authentication
All endpoints require authentication using either:
1. **Bearer Token**: `Authorization: Bearer <token>`
2. **API Key**: `X-API-Key: <api_key>` or `?api_key=<api_key>`

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
Create a new user account (automatically assigns admin role).

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
      "role": "admin",
      "apiKey": "string",
      "preferences": {},
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
- `status` (string): Filter by status (active, pending, closed, cancelled)
- `sort` (string): Sort field (default: createdDate)
- `order` (string): Sort order (asc, desc)
- `search` (string): Search in address and escrow number

**Response:**
```json
{
  "success": true,
  "data": {
    "escrows": [
      {
        "id": "string",
        "escrowNumber": "string",
        "propertyAddress": "string",
        "propertyImage": "string",
        "escrowStatus": "string",
        "transactionType": "string",
        "purchasePrice": number,
        "myCommission": number,
        "clients": [],
        "scheduledCoeDate": "ISO date",
        "daysToClose": number,
        "checklistProgress": number,
        "priorityLevel": "string",
        "lastActivity": "ISO date",
        "upcomingDeadlines": number
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

#### GET /escrows/stats
Get dashboard statistics and analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "activeEscrows": number,
      "pendingEscrows": number,
      "closedThisMonth": number,
      "totalVolume": number,
      "totalCommission": number,
      "avgDaysToClose": number
    },
    "performance": {
      "closingRate": number,
      "avgListToSaleRatio": number,
      "clientSatisfaction": number,
      "onTimeClosingRate": number
    },
    "pipeline": {
      "thisWeek": number,
      "thisMonth": number,
      "nextMonth": number,
      "projectedRevenue": number
    },
    "trends": []
  }
}
```

#### GET /escrows/:id
Get comprehensive escrow details.

**Response:**
```json
{
  "success": true,
  "data": {
    // Core Information
    "id": "string",
    "escrowNumber": "string",
    "propertyAddress": "string",
    "escrowStatus": "string",
    "transactionType": "string",
    "escrowOpenDate": "ISO date",
    "scheduledCoeDate": "ISO date",
    "actualCoeDate": "ISO date",
    "mlsNumber": "string",
    "propertyType": "string",
    
    // Property Details
    "propertyImages": ["url1", "url2", "url3"],
    "bedrooms": number,
    "bathrooms": number,
    "squareFootage": number,
    "lotSize": number,
    "yearBuilt": number,
    "propertyDescription": "string",
    
    // Financial Details
    "purchasePrice": number,
    "listPrice": number,
    "loanAmount": number,
    "downPaymentAmount": number,
    "downPaymentPercentage": number,
    "commissionPercentageBuySide": number,
    "commissionPercentageListSide": number,
    "grossCommission": number,
    "myCommission": number,
    "commissionSplit": number,
    "commissionAdjustments": number,
    "commissionAdjustmentNotes": "string",
    "referralFee": number,
    "transactionCoordinatorFee": number,
    "homeWarrantyCost": number,
    "expenseAdjustments": number,
    "totalExpenses": number,
    "netCommission": number,
    "cashToClose": number,
    "vpExpensesPaidThroughEscrow": number,
    
    // Relations
    "clients": [],
    "leadSource": {},
    "listing": {},
    "propertyInquiries": [],
    "appointments": [],
    "openHouse": {},
    "transactionCoordinator": {},
    "buyerAgent": {},
    "listingAgent": {},
    "loanOfficer": {},
    "escrowOfficer": {},
    "titleOfficer": {},
    "homeInspector": {},
    "termiteInspector": {},
    "homeWarrantyCompany": {},
    "nhdCompany": {},
    "appraiser": {},
    
    // Important Dates & Deadlines
    "acceptanceDate": "ISO date",
    "emdDueDate": "ISO date",
    "emdReceivedDate": "ISO date",
    "inspectionPeriodEndDate": "ISO date",
    "contingencyRemovalDate": "ISO date",
    "loanContingencyDate": "ISO date",
    "appraisalContingencyDate": "ISO date",
    "allContingenciesRemovedDate": "ISO date",
    "loanApprovalDate": "ISO date",
    "clearToCloseDate": "ISO date",
    "signingDate": "ISO date",
    "fundingDate": "ISO date",
    "recordingDate": "ISO date",
    "possessionDate": "ISO date",
    
    // Checklist Progress
    "checklistProgress": {
      "phase1": { "completed": number, "total": number, "percentage": number },
      "phase2": { "completed": number, "total": number, "percentage": number },
      "phase3": { "completed": number, "total": number, "percentage": number },
      "overall": { "completed": number, "total": number, "percentage": number }
    },
    "checklists": {},
    
    // Document Tracking
    "purchaseAgreementStatus": "string",
    "counterOffers": number,
    "addendums": [],
    "sellerDisclosuresStatus": "string",
    "inspectionReportsStatus": "string",
    "repairRequestsStatus": "string",
    "titleReportStatus": "string",
    "hoaDocumentsStatus": "string",
    "loanDocumentsStatus": "string",
    "closingDocumentsStatus": "string",
    
    // Communication Log
    "lastClientContactDate": "ISO date",
    "nextFollowUpDate": "ISO date",
    "importantNotes": "string",
    "specialInstructions": "string",
    "redFlags": "string",
    
    // Analytics Fields
    "leadSourceType": "string",
    "marketingCampaign": "string",
    "totalMarketingCost": number,
    "timeFromLeadToContract": number,
    "timeFromContractToClose": number,
    "clientSatisfactionScore": number,
    "wouldReferScore": number,
    
    // System Fields
    "createdDate": "ISO date",
    "lastModifiedDate": "ISO date",
    "createdBy": "string",
    "assignedTo": "string",
    "tags": [],
    "priorityLevel": "string",
    "archivedStatus": boolean,
    
    // Timeline & Activity
    "timeline": [],
    "activityStats": {
      "daysInEscrow": number,
      "daysToClose": number,
      "tasksCompletedToday": number,
      "upcomingDeadlines": number,
      "documentsUploaded": number,
      "communicationScore": number
    },
    
    // Market Comparison
    "marketComparison": {
      "avgDaysOnMarket": number,
      "avgSalePrice": number,
      "pricePerSqft": number,
      "neighborhoodTrend": "string",
      "similarProperties": []
    }
  }
}
```

#### POST /escrows
Create a new escrow.

#### PUT /escrows/:id
Update an existing escrow.

#### PATCH /escrows/:id/checklist
Update a checklist item.

**Request Body:**
```json
{
  "itemId": "string",
  "checked": boolean
}
```

#### POST /escrows/:id/documents
Upload a document to an escrow.

**Request Body (multipart/form-data):**
- `document`: File
- `documentType`: string
- `name`: string

#### POST /escrows/:id/timeline
Add a timeline event.

**Request Body:**
```json
{
  "event": "string",
  "description": "string",
  "type": "milestone|inspection|financial|task"
}
```

#### POST /escrows/:id/notes
Add a note to an escrow.

**Request Body:**
```json
{
  "content": "string",
  "type": "general|important|warning"
}
```

#### POST /escrows/:id/ai-assist
Request AI assistance for various tasks.

**Request Body:**
```json
{
  "action": "draft_email|update_checklist|schedule_calls|generate_timeline|ai_insights",
  "context": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "action": "string",
    "status": "processing",
    "message": "AI assistant is working on your request",
    "estimatedTime": "30 seconds",
    "endpoint": "/v1/ai-team/exec-assistant/endpoint"
  }
}
```

#### DELETE /escrows/:id
Delete an escrow (soft delete).

## AI Team Integration

### POST /ai-team/exec-assistant/endpoint
Main endpoint for AI executive assistant tasks.

**Request Body:**
```json
{
  "escrowId": "string",
  "action": "string",
  "context": {
    "escrowStatus": "string",
    "daysToClose": number,
    "checklistProgress": {},
    "additionalData": {}
  }
}
```

**Supported Actions:**
- `draft_email`: Generate follow-up emails
- `update_checklist`: Intelligently update checklist items
- `schedule_calls`: Schedule and prepare for calls
- `generate_timeline`: Create optimized timeline
- `ai_insights`: Provide transaction insights and recommendations

## Error Codes

- `NO_AUTH`: No authentication provided
- `INVALID_TOKEN`: Token is invalid or expired
- `SESSION_EXPIRED`: Session has expired
- `MISSING_FIELDS`: Required fields are missing
- `INVALID_USERNAME`: Username format is invalid
- `INVALID_EMAIL`: Email format is invalid
- `WEAK_PASSWORD`: Password doesn't meet requirements
- `USERNAME_EXISTS`: Username is already taken
- `EMAIL_EXISTS`: Email is already registered
- `USER_NOT_FOUND`: User not found
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- 100 requests per minute per IP for authenticated users
- 20 requests per minute per IP for unauthenticated users
- 1000 requests per hour per user token

## Webhooks

Configure webhooks to receive real-time updates:

```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["escrow.created", "escrow.updated", "escrow.closed"],
  "secret": "your-webhook-secret"
}
```

## Best Practices

1. **Pagination**: Always use pagination for list endpoints
2. **Caching**: Cache responses with appropriate TTL
3. **Error Handling**: Implement exponential backoff for retries
4. **Security**: Never expose API keys in client-side code
5. **Compression**: Enable gzip compression for responses
6. **Monitoring**: Track API usage and performance metrics