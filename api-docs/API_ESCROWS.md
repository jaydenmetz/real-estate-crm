# Escrows API Documentation

Base URL: `https://api.jaydenmetz.com/v1/escrows`

## Overview

The Escrows API provides endpoints for managing real estate escrow transactions, including property details, people involved, timelines, financials, checklists, and documents.

## Response Structure

All endpoints return responses in the following format:

```json
{
  "success": boolean,
  "data": object | array,
  "error": {
    "code": string,
    "message": string
  } // Only present on error
}
```

## Endpoints

### 1. List All Escrows

**GET** `/v1/escrows`

Returns a list of all escrows with summary information for list views.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "escrowNumber": "ESC-2025-001",
      "propertyAddress": "123 Main St, City, ST 12345",
      "propertyImage": "https://...",
      "escrowStatus": "Active",
      "purchasePrice": 500000,
      "myCommission": 15000,
      "clients": [
        {
          "name": "John Doe",
          "type": "buyer",
          "avatar": "https://..."
        }
      ],
      "scheduledCoeDate": "2025-06-01T00:00:00.000Z",
      "daysToClose": 30,
      "checklistProgress": 75,
      "lastActivity": "2025-05-01T12:00:00.000Z",
      "upcomingDeadlines": 3
    }
  ]
}
```

### 2. Get Single Escrow (Full Details)

**GET** `/v1/escrows/:id`

Returns complete escrow details with restructured format for easier consumption.

#### Response Structure
```json
{
  "success": true,
  "data": {
    "details": {
      "id": "uuid",
      "escrowNumber": "ESC-2025-001",
      "propertyAddress": "123 Main St, City, ST 12345",
      "propertyImage": "https://...",
      "zillowUrl": "https://www.zillow.com/...",
      "escrowStatus": "Active",
      "purchasePrice": 500000,
      "earnestMoneyDeposit": 25000,
      "downPayment": 100000,
      "loanAmount": 400000,
      "myCommission": 15000,
      "scheduledCoeDate": "2025-06-01T00:00:00.000Z",
      "daysToClose": 30,
      "checklistProgress": 75,
      "lastActivity": "2025-05-01T12:00:00.000Z",
      "upcomingDeadlines": 3,
      "escrowCompany": "ABC Escrow",
      "escrowOfficerName": "Jane Smith",
      "escrowOfficerEmail": "jane@escrow.com",
      "escrowOfficerPhone": "(555) 123-4567",
      "titleCompany": "XYZ Title",
      "transactionType": "Purchase",
      "leadSource": "Referral",
      "createdAt": "2025-04-01T00:00:00.000Z",
      "updatedAt": "2025-05-01T12:00:00.000Z"
    },
    "property-details": {
      "address": "123 Main St, City, ST 12345",
      "city": "City",
      "state": "ST",
      "zipCode": "12345",
      "county": "County Name",
      "propertyType": "Single Family",
      "bedrooms": 4,
      "bathrooms": "2.5",
      "squareFeet": 2500,
      "lotSizeSqft": 7500,
      "yearBuilt": 1995,
      "stories": 2,
      "garageSpaces": 2,
      "pool": false,
      "spa": false,
      "viewType": "Mountain",
      "architecturalStyle": "Contemporary",
      "propertyCondition": "Excellent",
      "zoning": "Residential",
      "subdivision": "Sunny Hills",
      "crossStreets": "Main St & First Ave",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "apn": "123-456-789",
      "mlsNumber": "ML123456",
      "hoaFee": "250.00",
      "hoaFrequency": "Monthly",
      "hoaName": "Sunny Hills HOA",
      "gatedCommunity": false,
      "seniorCommunity": false,
      "listPrice": 525000,
      "listDate": "2025-03-15T00:00:00.000Z",
      "daysOnMarket": 15,
      "previousListPrice": 550000,
      "originalListPrice": 550000,
      "pricePerSqft": 200
    },
    "people": {
      "buyer": {
        "contactId": "uuid",
        "role": "buyer",
        "name": "John Doe",
        "email": "john@email.com",
        "phone": "(555) 111-2222"
      },
      "buyerAgent": {
        "contactId": "uuid",
        "role": "buyerAgent",
        "name": "Agent Smith"
      },
      "buyerTC": {
        "contactId": "uuid",
        "role": "buyerTC",
        "name": "TC Name"
      },
      "seller": {
        "contactId": "uuid",
        "role": "seller",
        "name": "Jane Seller"
      },
      "sellerAgent": {
        "contactId": "uuid",
        "role": "sellerAgent",
        "name": "Listing Agent"
      },
      "listingTC": null,
      "escrowOfficer": {
        "contactId": "uuid",
        "role": "escrowOfficer",
        "name": "Escrow Officer"
      },
      "titleOfficer": null,
      "loanOfficer": {
        "contactId": "uuid",
        "role": "loanOfficer",
        "name": "Loan Officer"
      },
      "homeInspector": null,
      "termiteInspector": null,
      "appraiser": null,
      "photographer": null,
      "contractor": null,
      "nhdRep": null,
      "homeWarrantyRep": null,
      "transactionCoordinator": null,
      "referralAgent": null
    },
    "timeline": {
      "acceptanceDate": "2025-04-01T00:00:00.000Z",
      "emdDate": "2025-04-03",
      "sellerDisclosuresDueDate": "2025-04-08",
      "homeInspectionDate": "2025-04-10",
      "termiteInspectionDate": "2025-04-11",
      "appraisalDate": "2025-04-15",
      "inspectionContingencyDate": "2025-04-17",
      "appraisalContingencyDate": "2025-04-22",
      "loanContingencyDate": "2025-04-25",
      "allContingenciesRemovalDate": "2025-04-25",
      "coeDate": "2025-06-01T00:00:00.000Z"
    },
    "financials": {
      "purchasePrice": 500000,
      "baseCommission": 15000,
      "grossCommission": 15000,
      "grossCommissionFees": 0,
      "grossReferralFee": 0,
      "grossReferralFeePercentage": 0,
      "adjustedGross": 15000,
      "netCommission": 13500,
      "dealExpense": 500,
      "franchiseFees": 937.50,
      "franchiseFeePercentage": 6.25,
      "dealNet": 12562.50,
      "agentGCI": 12562.50,
      "splitPercentage": 70,
      "agentSplit": 8793.75,
      "agentReferralFee": 0,
      "agentReferralFeePercentage": 0,
      "transactionFee": 285,
      "tcFee": 250,
      "agent1099Income": 8258.75,
      "excessPayment": 0,
      "agentNet": 8258.75,
      "commissionPercentage": 3,
      "commissionAdjustments": 0,
      "expenseAdjustments": 0
    },
    "checklist-loan": {
      "le": true,
      "lockedRate": true,
      "appraisalOrdered": false,
      "appraisalReceived": false,
      "clearToClose": false,
      "cd": false,
      "loanDocsSigned": false,
      "cashToClosePaid": false,
      "loanFunded": false
    },
    "checklist-house": {
      "homeInspectionOrdered": false,
      "emd": true,
      "solarTransferInitiated": false,
      "avid": false,
      "homeInspectionReceived": false,
      "sellerDisclosures": false,
      "rr": false,
      "cr": false,
      "recorded": false
    },
    "checklist-admin": {
      "mlsStatusUpdate": false,
      "tcEmail": false,
      "tcGlideInvite": false,
      "addContactsToPhone": false,
      "addContactsToNotion": false
    },
    "documents": [
      {
        "id": "doc-uuid",
        "name": "Purchase Agreement.pdf",
        "type": "contract",
        "uploadDate": "2025-04-01T00:00:00.000Z",
        "size": 2456789,
        "url": "https://..."
      }
    ]
  }
}
```

### 3. Get Escrow Statistics

**GET** `/v1/escrows/stats`

Returns dashboard statistics for escrows.

#### Response
```json
{
  "success": true,
  "data": {
    "totalEscrows": 45,
    "activeEscrows": 12,
    "closedEscrows": 30,
    "pendingEscrows": 3,
    "totalVolume": 15000000,
    "totalCommission": 450000,
    "averagePrice": 333333,
    "averageDaysToClose": 35
  }
}
```

### 4. Get Escrow People

**GET** `/v1/escrows/:id/people`

Returns only the people section of an escrow.

#### Response
```json
{
  "success": true,
  "data": {
    "buyer": { "name": "John Doe", "email": "john@email.com", "phone": "(555) 111-2222" },
    "buyerAgent": { "name": "Agent Smith" },
    "buyerTC": null,
    "seller": { "name": "Jane Seller" },
    "sellerAgent": { "name": "Listing Agent" },
    "listingTC": null,
    "escrowOfficer": { "name": "Escrow Officer" },
    "loanOfficer": { "name": "Loan Officer" },
    "titleOfficer": null,
    "homeInspector": null,
    "termiteInspector": null,
    "appraiser": null,
    "nhdRep": null,
    "homeWarrantyRep": null
  }
}
```

### 5. Get Escrow Timeline

**GET** `/v1/escrows/:id/timeline`

Returns only the timeline section of an escrow.

#### Response
```json
{
  "success": true,
  "data": {
    "acceptanceDate": "2025-04-01T00:00:00.000Z",
    "emdDate": "2025-04-03",
    "sellerDisclosuresDueDate": "2025-04-08",
    "homeInspectionDate": "2025-04-10",
    "termiteInspectionDate": "2025-04-11",
    "appraisalDate": "2025-04-15",
    "inspectionContingencyDate": "2025-04-17",
    "appraisalContingencyDate": "2025-04-22",
    "loanContingencyDate": "2025-04-25",
    "allContingenciesRemovalDate": "2025-04-25",
    "coeDate": "2025-06-01T00:00:00.000Z"
  }
}
```

### 6. Get Escrow Financials

**GET** `/v1/escrows/:id/financials`

Returns only the financial details of an escrow.

### 7. Get Escrow Checklists

**GET** `/v1/escrows/:id/checklists`

Returns all checklists for an escrow.

#### Response
```json
{
  "success": true,
  "data": {
    "loan": {
      "le": true,
      "lockedRate": true,
      "appraisalOrdered": false,
      "appraisalReceived": false,
      "clearToClose": false,
      "cd": false,
      "loanDocsSigned": false,
      "cashToClosePaid": false,
      "loanFunded": false
    },
    "house": {
      "homeInspectionOrdered": false,
      "emd": true,
      "solarTransferInitiated": false,
      "avid": false,
      "homeInspectionReceived": false,
      "sellerDisclosures": false,
      "rr": false,
      "cr": false,
      "recorded": false
    },
    "admin": {
      "mlsStatusUpdate": false,
      "tcEmail": false,
      "tcGlideInvite": false,
      "addContactsToPhone": false,
      "addContactsToNotion": false
    }
  }
}
```

### 8. Get Escrow Documents

**GET** `/v1/escrows/:id/documents`

Returns all documents associated with an escrow.

### 9. Get Property Details

**GET** `/v1/escrows/:id/property-details`

Returns detailed property information.

### 10. Get Property Image

**GET** `/v1/escrows/:id/image`

Fetches and returns the property image URL from Zillow or other sources.

## Update Endpoints

### 11. Update Escrow

**PUT** `/v1/escrows/:id`

Updates the main escrow details.

#### Request Body
```json
{
  "escrowStatus": "Active",
  "purchasePrice": 500000,
  "earnestMoneyDeposit": 25000,
  "scheduledCoeDate": "2025-06-01T00:00:00.000Z"
}
```

### 12. Update Escrow People

**PUT** `/v1/escrows/:id/people`

Updates people associated with the escrow.

#### Request Body
```json
{
  "buyer": {
    "name": "John Doe",
    "email": "john@email.com",
    "phone": "(555) 111-2222",
    "contactId": "uuid"
  },
  "buyerAgent": {
    "name": "Agent Smith",
    "contactId": "uuid"
  }
}
```

### 13. Update Escrow Checklists

**PUT** `/v1/escrows/:id/checklists`

Updates checklist items.

#### Request Body
```json
{
  "loan": {
    "le": true,
    "lockedRate": true
  },
  "house": {
    "emd": true
  }
}
```

### 14. Update Property Details

**PUT** `/v1/escrows/:id/property-details`

Updates property details.

#### Request Body
```json
{
  "bedrooms": 4,
  "bathrooms": "2.5",
  "squareFeet": 2500,
  "pool": false,
  "spa": false
}
```

### 15. Update Financials

**PUT** `/v1/escrows/:id/financials`

Updates financial information.

#### Request Body
```json
{
  "purchasePrice": 500000,
  "baseCommission": 15000,
  "splitPercentage": 70,
  "transactionFee": 285,
  "tcFee": 250
}
```

### 16. Update Timeline

**PUT** `/v1/escrows/:id/timeline`

Updates timeline dates.

#### Request Body
```json
{
  "acceptanceDate": "2025-04-01T00:00:00.000Z",
  "emdDate": "2025-04-03",
  "homeInspectionDate": "2025-04-10",
  "coeDate": "2025-06-01T00:00:00.000Z"
}
```

## Create and Delete

### 17. Create New Escrow

**POST** `/v1/escrows`

Creates a new escrow with auto-generated sequential ID.

#### Request Body
```json
{
  "propertyAddress": "123 Main St, City, ST 12345",
  "purchasePrice": 500000,
  "escrowStatus": "Active",
  "transactionType": "Purchase",
  "scheduledCoeDate": "2025-06-01T00:00:00.000Z"
}
```

### 18. Delete Escrow

**DELETE** `/v1/escrows/:id`

Deletes an escrow (soft delete).

## Patch Operations

### 19. Update Single Checklist Item

**PATCH** `/v1/escrows/:id/checklist`

Updates a single checklist item.

#### Request Body
```json
{
  "itemId": "le",
  "checked": true
}
```

## SkySlope Integration

### 20. Get SkySlope Documents

**GET** `/v1/skyslope/escrows/:id/documents`

Fetches documents from SkySlope for an escrow.

### 21. Sync with SkySlope

**POST** `/v1/skyslope/escrows/:id/sync`

Syncs escrow data with SkySlope.

### 22. Upload Document to SkySlope

**POST** `/v1/skyslope/escrows/:id/documents`

Uploads a document to SkySlope.

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ESCROW_NOT_FOUND",
    "message": "Escrow with ID xxx not found"
  }
}
```

Common error codes:
- `ESCROW_NOT_FOUND` - Escrow ID does not exist
- `VALIDATION_ERROR` - Invalid input data
- `DATABASE_ERROR` - Database operation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions

## Notes

1. All dates are returned in ISO 8601 format
2. Financial amounts are in cents (multiply by 100 for display)
3. The API uses UUID for escrow IDs
4. The `escrowNumber` field follows the format `ESC-YYYY-XXXX`
5. All endpoints require authentication (Bearer token in Authorization header)
6. Rate limiting: 100 requests per minute per API key