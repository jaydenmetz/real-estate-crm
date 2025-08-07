# Escrows API Documentation - Complete with Full Examples

## Base URL
All endpoints are prefixed with `/v1/escrows`

## Response Format
All API endpoints return standardized responses:
```javascript
{
  success: boolean,
  data: object | array,
  error: { code: string, message: string },
  timestamp: string
}
```

---

## GET Requests

### 1. GET /v1/escrows
**Description:** List all escrows with summary information  
**Authentication:** Required  
**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by escrow status
- `sort` (optional): Sort field (default: created_at)
- `order` (optional): Sort order (asc/desc, default: desc)
- `search` (optional): Search in address fields

**Example Request:**
```
GET /v1/escrows?page=1&limit=20&status=active&sort=created_at&order=desc
```

**Full Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "display_id": "ESC-2025-001",
      "property_address": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zip_code": "90001",
      "county": "Los Angeles County",
      "purchase_price": 750000,
      "escrow_status": "active",
      "transaction_type": "purchase",
      "property_type": "single_family",
      "bedrooms": 4,
      "bathrooms": 3,
      "square_feet": 2500,
      "coe_date": "2025-02-15",
      "acceptance_date": "2025-01-01",
      "buyer": {
        "name": "John Smith",
        "email": "john@email.com",
        "phone": "(555) 123-4567"
      },
      "seller": {
        "name": "Jane Doe",
        "email": "jane@email.com",
        "phone": "(555) 234-5678"
      },
      "my_commission": 22500,
      "net_commission": 16875,
      "property_image_url": "https://photos.zillowstatic.com/p_e/ISynkxa123.jpg",
      "checklist_progress": 45,
      "days_to_close": 38,
      "created_at": "2025-01-08T10:00:00Z",
      "updated_at": "2025-01-08T14:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "display_id": "ESC-2025-002",
      "property_address": "456 Oak Ave",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94102",
      "county": "San Francisco County",
      "purchase_price": 1200000,
      "escrow_status": "pending",
      "transaction_type": "purchase",
      "property_type": "condo",
      "bedrooms": 2,
      "bathrooms": 2,
      "square_feet": 1500,
      "coe_date": "2025-03-01",
      "acceptance_date": "2025-01-15",
      "buyer": {
        "name": "Robert Brown",
        "email": "robert@email.com",
        "phone": "(555) 111-2222"
      },
      "seller": {
        "name": "Lisa Green",
        "email": "lisa@email.com",
        "phone": "(555) 333-4444"
      },
      "my_commission": 36000,
      "net_commission": 27000,
      "property_image_url": "https://photos.zillowstatic.com/p_e/ISynkxa456.jpg",
      "checklist_progress": 25,
      "days_to_close": 52,
      "created_at": "2025-01-08T11:00:00Z",
      "updated_at": "2025-01-08T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 2. GET /v1/escrows/stats
**Description:** Get dashboard statistics for all escrows  
**Authentication:** Required

**Example Request:**
```
GET /v1/escrows/stats
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "total_escrows": 45,
    "active_escrows": 12,
    "pending_escrows": 5,
    "closed_escrows": 28,
    "cancelled_escrows": 0,
    "total_volume": 15750000,
    "average_price": 350000,
    "median_price": 325000,
    "average_days_to_close": 28,
    "closing_rate": 87.5,
    "total_commission_earned": 472500,
    "total_net_commission": 354375,
    "monthly_stats": {
      "new_escrows": 8,
      "closed_this_month": 6,
      "revenue_this_month": 125000,
      "net_revenue_this_month": 93750,
      "average_closing_time": 26
    },
    "quarterly_stats": {
      "q1_volume": 4500000,
      "q1_transactions": 12,
      "q1_commission": 135000
    },
    "upcoming_closings": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "display_id": "ESC-2025-003",
        "property_address": "789 Pine St",
        "coe_date": "2025-01-15",
        "days_remaining": 7,
        "buyer_name": "Michael Johnson",
        "purchase_price": 650000
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "display_id": "ESC-2025-004",
        "property_address": "321 Maple Dr",
        "coe_date": "2025-01-20",
        "days_remaining": 12,
        "buyer_name": "Sarah Wilson",
        "purchase_price": 850000
      }
    ],
    "pipeline_value": 8500000,
    "pipeline_commission": 255000
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 3. GET /v1/escrows/:id
**Description:** Get complete escrow details by ID  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Example Request:**
```
GET /v1/escrows/550e8400-e29b-41d4-a716-446655440000
```
or
```
GET /v1/escrows/ESC-2025-001
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_id": "ESC-2025-001",
    "escrow_number": "ESC-2025-001",
    "property_address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90001",
    "county": "Los Angeles County",
    "purchase_price": 750000,
    "list_price": 775000,
    "escrow_status": "active",
    "transaction_type": "purchase",
    "property_type": "single_family",
    "representation_type": "buyer",
    "bedrooms": 4,
    "bathrooms": 3,
    "square_feet": 2500,
    "year_built": 1998,
    "lot_size": 7500,
    "apn": "1234-567-890",
    "mls_number": "LA12345",
    "zillow_url": "https://www.zillow.com/homes/123-main-st",
    "property_image_url": "https://photos.zillowstatic.com/p_e/ISynkxa123.jpg",
    "acceptance_date": "2025-01-01",
    "escrow_opened_date": "2025-01-02",
    "emd_date": "2025-01-03",
    "inspection_date": "2025-01-10",
    "appraisal_date": "2025-01-12",
    "loan_contingency_date": "2025-01-21",
    "all_contingencies_removal_date": "2025-01-25",
    "closing_date": "2025-02-15",
    "coe_date": "2025-02-15",
    "possession_date": "2025-02-15",
    "people": {
      "buyer": {
        "name": "John Smith",
        "email": "john@email.com",
        "phone": "(555) 123-4567",
        "address": "789 Elm St, Los Angeles, CA 90002"
      },
      "seller": {
        "name": "Jane Doe",
        "email": "jane@email.com",
        "phone": "(555) 234-5678"
      },
      "buyerAgent": {
        "name": "Mike Johnson",
        "email": "mike@realty.com",
        "phone": "(555) 345-6789",
        "license": "DRE#12345678",
        "brokerage": "ABC Realty"
      },
      "sellerAgent": {
        "name": "Sarah Williams",
        "email": "sarah@realty.com",
        "phone": "(555) 456-7890",
        "license": "DRE#87654321",
        "brokerage": "XYZ Realty"
      },
      "buyerTC": {
        "name": "Amy Chen",
        "email": "amy@tcservices.com",
        "phone": "(555) 567-8901"
      },
      "listingTC": {
        "name": "Tom Brown",
        "email": "tom@tcservices.com",
        "phone": "(555) 678-9012"
      },
      "loanOfficer": {
        "name": "David Lee",
        "email": "david@lending.com",
        "phone": "(555) 789-0123",
        "nmls": "NMLS#123456",
        "company": "First National Bank"
      },
      "escrowOfficer": {
        "name": "Emily Davis",
        "email": "emily@escrow.com",
        "phone": "(555) 890-1234",
        "company": "Premier Escrow Services"
      }
    },
    "financials": {
      "purchase_price": 750000,
      "down_payment": 150000,
      "loan_amount": 600000,
      "earnest_money": 7500,
      "commission": {
        "total_commission": 45000,
        "commission_rate": 6,
        "listing_side": 22500,
        "buying_side": 22500,
        "my_side": "buying",
        "my_commission": 22500,
        "split_percentage": 75,
        "brokerage_split": 5625,
        "transaction_fee": 500,
        "tc_fee": 250,
        "net_commission": 16125
      },
      "closing_costs": {
        "buyer_costs": 12500,
        "seller_costs": 8500
      }
    },
    "checklists": {
      "loan": {
        "le": true,
        "lockedRate": true,
        "appraisalOrdered": true,
        "appraisalReceived": false,
        "clearToClose": false,
        "cd": false,
        "loanDocsSigned": false,
        "cashToClosePaid": false,
        "loanFunded": false
      },
      "house": {
        "homeInspectionOrdered": true,
        "emd": true,
        "solarTransferInitiated": false,
        "avid": false,
        "homeInspectionReceived": false,
        "sellerDisclosures": false,
        "rr": false,
        "recorded": false
      },
      "admin": {
        "mlsStatusUpdate": true,
        "tcEmail": true,
        "tcGlideInvite": false,
        "addContactsToPhone": false,
        "addContactsToNotion": false
      }
    },
    "timeline": [
      {
        "date": "2025-01-01",
        "event": "Acceptance Date",
        "category": "opening",
        "status": "completed"
      },
      {
        "date": "2025-01-10",
        "event": "Home Inspection",
        "category": "inspection",
        "status": "upcoming"
      }
    ],
    "documents": [
      {
        "id": "doc_001",
        "name": "Purchase Agreement.pdf",
        "type": "contract",
        "uploaded_date": "2025-01-01T15:30:00Z"
      }
    ],
    "notes": "Buyer requesting 5-day extension for loan approval",
    "created_at": "2025-01-08T10:00:00Z",
    "updated_at": "2025-01-08T14:30:00Z",
    "created_by": "user_123",
    "updated_by": "user_123"
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 4. GET /v1/escrows/:id/people
**Description:** Get all people associated with an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Example Request:**
```
GET /v1/escrows/550e8400-e29b-41d4-a716-446655440000/people
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "buyer": {
      "id": "contact_001",
      "name": "John Smith",
      "email": "john@email.com",
      "phone": "(555) 123-4567",
      "address": "789 Elm St, Los Angeles, CA 90002",
      "company": null,
      "license": null
    },
    "seller": {
      "id": "contact_002",
      "name": "Jane Doe",
      "email": "jane@email.com",
      "phone": "(555) 234-5678",
      "address": "456 Pine Ave, Los Angeles, CA 90003",
      "company": null,
      "license": null
    },
    "buyerAgent": {
      "id": "contact_003",
      "name": "Mike Johnson",
      "email": "mike@realty.com",
      "phone": "(555) 345-6789",
      "address": null,
      "company": "ABC Realty",
      "license": "DRE#12345678"
    },
    "sellerAgent": {
      "id": "contact_004",
      "name": "Sarah Williams",
      "email": "sarah@realty.com",
      "phone": "(555) 456-7890",
      "address": null,
      "company": "XYZ Realty",
      "license": "DRE#87654321"
    },
    "buyerTC": {
      "id": "contact_005",
      "name": "Amy Chen",
      "email": "amy@tcservices.com",
      "phone": "(555) 567-8901",
      "address": null,
      "company": "TC Services Inc",
      "license": null
    },
    "listingTC": {
      "id": "contact_006",
      "name": "Tom Brown",
      "email": "tom@tcservices.com",
      "phone": "(555) 678-9012",
      "address": null,
      "company": "TC Services Inc",
      "license": null
    },
    "loanOfficer": {
      "id": "contact_007",
      "name": "David Lee",
      "email": "david@lending.com",
      "phone": "(555) 789-0123",
      "address": null,
      "company": "First National Bank",
      "license": "NMLS#123456"
    },
    "escrowOfficer": {
      "id": "contact_008",
      "name": "Emily Davis",
      "email": "emily@escrow.com",
      "phone": "(555) 890-1234",
      "address": null,
      "company": "Premier Escrow Services",
      "license": null
    },
    "titleOfficer": {
      "id": null,
      "name": null,
      "email": null,
      "phone": null,
      "address": null,
      "company": null,
      "license": null
    },
    "homeInspector": {
      "id": null,
      "name": null,
      "email": null,
      "phone": null,
      "address": null,
      "company": null,
      "license": null
    },
    "termiteInspector": {
      "id": null,
      "name": null,
      "email": null,
      "phone": null,
      "address": null,
      "company": null,
      "license": null
    },
    "appraiser": {
      "id": null,
      "name": null,
      "email": null,
      "phone": null,
      "address": null,
      "company": null,
      "license": null
    }
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 5. GET /v1/escrows/:id/timeline
**Description:** Get escrow timeline with all key dates  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Example Request:**
```
GET /v1/escrows/550e8400-e29b-41d4-a716-446655440000/timeline
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "acceptanceDate": "2025-01-01",
    "escrowOpenedDate": "2025-01-02",
    "closingDate": "2025-02-15",
    "recordingDate": null,
    "possessionDate": "2025-02-15",
    "inspectionPeriodEndDate": "2025-01-17",
    "physicalInspectionDate": "2025-01-10",
    "termiteInspectionDate": "2025-01-11",
    "sewerInspectionDate": null,
    "poolSpaInspectionDate": null,
    "roofInspectionDate": null,
    "chimneyInspectionDate": null,
    "sellerDisclosuresDueDate": "2025-01-05",
    "sellerDisclosuresReceivedDate": "2025-01-04",
    "preliminaryTitleReportDate": "2025-01-07",
    "nhdReportDate": "2025-01-06",
    "hoaDocumentsDueDate": null,
    "hoaDocumentsReceivedDate": null,
    "loanApplicationDate": "2025-01-03",
    "loanContingencyRemovalDate": "2025-01-21",
    "appraisalContingencyRemovalDate": "2025-01-17",
    "appraisalOrderedDate": "2025-01-05",
    "appraisalCompletedDate": "2025-01-12",
    "loanApprovalDate": null,
    "loanDocsOrderedDate": null,
    "loanDocsSignedDate": null,
    "loanFundedDate": null,
    "inspectionContingencyRemovalDate": "2025-01-17",
    "allContingenciesRemovalDate": "2025-01-25",
    "walkThroughDate": "2025-02-14",
    "rentBackEndDate": null,
    "titleOrderedDate": "2025-01-02",
    "insuranceOrderedDate": "2025-01-20",
    "smokeAlarmInstallationDate": null,
    "termiteCompletionDate": null,
    "repairsCompletionDate": null,
    "finalVerificationDate": null,
    "events": [
      {
        "date": "2025-01-01",
        "event": "Acceptance Date",
        "category": "opening",
        "description": "Contract ratified by all parties",
        "status": "completed",
        "daysFromAcceptance": 0,
        "type": "deadline"
      },
      {
        "date": "2025-01-02",
        "event": "Escrow Opened",
        "category": "opening",
        "description": "Escrow account opened",
        "status": "completed",
        "daysFromAcceptance": 1,
        "type": "deadline"
      },
      {
        "date": "2025-01-03",
        "event": "EMD Due",
        "category": "financial",
        "description": "Earnest Money Deposit due",
        "status": "completed",
        "daysFromAcceptance": 2,
        "type": "deadline"
      },
      {
        "date": "2025-01-10",
        "event": "Home Inspection",
        "category": "inspection",
        "description": "General home inspection scheduled",
        "status": "upcoming",
        "daysFromAcceptance": 9,
        "type": "deadline"
      },
      {
        "date": "2025-01-17",
        "event": "Remove Inspection Contingency",
        "category": "contingency",
        "description": "Inspection contingency removal deadline",
        "status": "upcoming",
        "daysFromAcceptance": 16,
        "type": "deadline"
      },
      {
        "date": "2025-01-21",
        "event": "Remove Loan Contingency",
        "category": "contingency",
        "description": "Loan contingency removal deadline",
        "status": "upcoming",
        "daysFromAcceptance": 20,
        "type": "deadline"
      },
      {
        "date": "2025-02-15",
        "event": "Scheduled Close of Escrow",
        "category": "closing",
        "description": "Target closing date",
        "status": "upcoming",
        "daysFromAcceptance": 45,
        "type": "deadline"
      }
    ]
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 6. GET /v1/escrows/:id/financials
**Description:** Get detailed financial information for an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Example Request:**
```
GET /v1/escrows/550e8400-e29b-41d4-a716-446655440000/financials
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "purchasePrice": 750000,
    "listPrice": 775000,
    "earnestMoney": 7500,
    "downPayment": 150000,
    "downPaymentPercentage": 20,
    "loanAmount": 600000,
    "loanType": "conventional",
    "interestRate": 6.5,
    "lenderCredits": 0,
    "sellerCredits": 5000,
    "closingCosts": {
      "buyerClosingCosts": 12500,
      "sellerClosingCosts": 8500,
      "titleInsurance": 2500,
      "escrowFees": 1500,
      "recordingFees": 350,
      "transferTax": 825,
      "homeWarranty": 650,
      "inspection": 550,
      "appraisal": 650
    },
    "prorations": {
      "propertyTax": -625,
      "hoaFees": -150,
      "insurance": -75
    },
    "agentSplit": {
      "baseCommission": 22500,
      "grossAgentCommission": 22500,
      "splitPercentage": 75,
      "transactionFee": 285,
      "tcFee": 250,
      "brokerageSplit": 5625,
      "agent1099Income": 16340,
      "excessPayment": 0,
      "agentNet": 16340
    },
    "commissionBreakdown": {
      "commissionPercentage": 3,
      "grossCommission": 45000,
      "myCommission": 22500,
      "commissionAdjustments": 0,
      "expenseAdjustments": -160,
      "netCommission": 16340
    },
    "expenses": [
      {
        "id": "exp_001",
        "description": "Photography",
        "amount": 350,
        "paidBy": "agent",
        "paidThroughEscrow": false,
        "date": "2025-01-02"
      },
      {
        "id": "exp_002",
        "description": "Staging consultation",
        "amount": 500,
        "paidBy": "agent",
        "paidThroughEscrow": false,
        "date": "2025-01-03"
      }
    ],
    "expensesPaidThroughEscrow": [],
    "totalExpenses": 850,
    "buyerFundsNeeded": 157350,
    "sellerProceeds": 285150,
    "estimatedClosingDate": "2025-02-15",
    "actualClosingDate": null
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 7. GET /v1/escrows/:id/checklists
**Description:** Get all checklists for an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Example Request:**
```
GET /v1/escrows/550e8400-e29b-41d4-a716-446655440000/checklists
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "loan": {
      "le": true,
      "lockedRate": true,
      "appraisalOrdered": true,
      "appraisalReceived": false,
      "clearToClose": false,
      "cd": false,
      "loanDocsSigned": false,
      "cashToClosePaid": false,
      "loanFunded": false
    },
    "house": {
      "homeInspectionOrdered": true,
      "emd": true,
      "solarTransferInitiated": false,
      "avid": false,
      "homeInspectionReceived": false,
      "sellerDisclosures": true,
      "rr": false,
      "recorded": false
    },
    "admin": {
      "mlsStatusUpdate": true,
      "tcEmail": true,
      "tcGlideInvite": false,
      "addContactsToPhone": false,
      "addContactsToNotion": false
    }
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 8. GET /v1/escrows/:id/documents
**Description:** Get all documents associated with an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Example Request:**
```
GET /v1/escrows/550e8400-e29b-41d4-a716-446655440000/documents
```

**Full Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_001",
      "name": "Purchase Agreement.pdf",
      "type": "contract",
      "category": "Legal Documents",
      "size": "2.4 MB",
      "uploaded_date": "2025-01-01T15:30:00Z",
      "uploaded_by": "Mike Johnson",
      "status": "signed",
      "url": "https://storage.example.com/docs/purchase-agreement.pdf",
      "thumbnail_url": "https://storage.example.com/thumbs/purchase-agreement.jpg",
      "pages": 28,
      "signed_date": "2025-01-01T16:00:00Z",
      "signers": ["John Smith", "Jane Doe"]
    },
    {
      "id": "doc_002",
      "name": "Seller Disclosures.pdf",
      "type": "disclosure",
      "category": "Disclosures",
      "size": "1.8 MB",
      "uploaded_date": "2025-01-02T10:00:00Z",
      "uploaded_by": "Sarah Williams",
      "status": "pending_signature",
      "url": "https://storage.example.com/docs/seller-disclosures.pdf",
      "thumbnail_url": "https://storage.example.com/thumbs/seller-disclosures.jpg",
      "pages": 15,
      "signed_date": null,
      "signers": []
    },
    {
      "id": "doc_003",
      "name": "Pre-Approval Letter.pdf",
      "type": "financial",
      "category": "Loan Documents",
      "size": "450 KB",
      "uploaded_date": "2024-12-28T12:00:00Z",
      "uploaded_by": "David Lee",
      "status": "approved",
      "url": "https://storage.example.com/docs/pre-approval.pdf",
      "thumbnail_url": null,
      "pages": 2,
      "signed_date": null,
      "signers": []
    },
    {
      "id": "doc_004",
      "name": "Earnest Money Receipt.pdf",
      "type": "receipt",
      "category": "Financial",
      "size": "125 KB",
      "uploaded_date": "2025-01-03T14:00:00Z",
      "uploaded_by": "Emily Davis",
      "status": "completed",
      "url": "https://storage.example.com/docs/emd-receipt.pdf",
      "thumbnail_url": null,
      "pages": 1,
      "signed_date": null,
      "signers": []
    }
  ],
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 9. GET /v1/escrows/:id/property-details
**Description:** Get detailed property information  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Example Request:**
```
GET /v1/escrows/550e8400-e29b-41d4-a716-446655440000/property-details
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "propertyAddress": "123 Main St",
    "propertyType": "single_family",
    "purchasePrice": 750000,
    "bedrooms": 4,
    "bathrooms": 3,
    "squareFeet": 2500,
    "lotSizeSqft": 7500,
    "yearBuilt": 1998,
    "garageSpaces": 2,
    "stories": 2,
    "pool": true,
    "spa": true,
    "viewType": "city_lights",
    "architecturalStyle": "Mediterranean",
    "propertyCondition": "excellent",
    "zoning": "R1",
    "apn": "1234-567-890",
    "mlsNumber": "LA12345",
    "county": "Los Angeles County",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "subdivision": "Sunset Heights",
    "crossStreets": "Main St & Oak Ave",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "hoaFee": 150,
    "hoaFrequency": "monthly",
    "hoaName": "Sunset Heights HOA",
    "gatedCommunity": false,
    "seniorCommunity": false,
    "propertyFeatures": [
      "Hardwood floors",
      "Granite countertops",
      "Stainless steel appliances",
      "Master suite with walk-in closet",
      "Backyard pool and spa",
      "Three-car garage",
      "Solar panels",
      "Smart home system"
    ],
    "propertyImages": [
      "https://photos.zillowstatic.com/p_e/ISynkxa123.jpg",
      "https://photos.zillowstatic.com/p_e/ISynkxa124.jpg",
      "https://photos.zillowstatic.com/p_e/ISynkxa125.jpg"
    ],
    "listPrice": 775000,
    "listDate": "2024-12-15",
    "daysOnMarket": 17,
    "previousListPrice": 799000,
    "originalListPrice": 799000
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 10. GET /v1/escrows/:id/image
**Description:** Get property image URL from Zillow or other sources  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Example Request:**
```
GET /v1/escrows/550e8400-e29b-41d4-a716-446655440000/image
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://photos.zillowstatic.com/fp/8b5e4f6e4e5a5c5d5e5f5g5h5i5j5k5l-cc_ft_960.jpg",
    "thumbnailUrl": "https://photos.zillowstatic.com/fp/8b5e4f6e4e5a5c5d5e5f5g5h5i5j5k5l-cc_ft_192.jpg",
    "source": "zillow",
    "propertyAddress": "123 Main St, Los Angeles, CA 90001",
    "lastUpdated": "2025-01-08T10:00:00Z"
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

---

## POST Requests

### 1. POST /v1/escrows
**Description:** Create a new escrow  
**Authentication:** Required

**Full Request Payload:**
```json
{
  "property_address": "789 Oak Ave",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "county": "San Francisco County",
  "purchase_price": 1200000,
  "earnest_money": 12000,
  "escrow_status": "pending",
  "transaction_type": "purchase",
  "property_type": "condo",
  "buyer_side_commission": 2.5,
  "opening_date": "2025-01-15",
  "closing_date": "2025-03-01",
  "acceptance_date": "2025-01-14",
  "buyer": {
    "name": "Robert Brown",
    "email": "robert@email.com",
    "phone": "(555) 111-2222"
  },
  "seller": {
    "name": "Lisa Green",
    "email": "lisa@email.com",
    "phone": "(555) 333-4444"
  },
  "buyerAgent": {
    "name": "Agent Name",
    "email": "agent@realty.com",
    "phone": "(555) 555-6666",
    "license": "DRE#11111111"
  }
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "displayId": "ESCROW-2025-0003",
    "message": "Escrow created successfully with checklist items"
  },
  "timestamp": "2025-01-08T16:00:00Z"
}
```

### 2. POST /v1/escrows/:id/documents
**Description:** Upload a document to an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "documentType": "inspection",
  "name": "Home Inspection Report.pdf",
  "category": "Inspections",
  "size": "5.2 MB",
  "fileData": "base64_encoded_file_data_here...",
  "metadata": {
    "inspector": "Bob Wilson",
    "inspectionDate": "2025-01-10",
    "propertyAddress": "123 Main St"
  }
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "doc_005",
    "escrowId": "550e8400-e29b-41d4-a716-446655440000",
    "documentType": "inspection",
    "name": "Home Inspection Report.pdf",
    "category": "Inspections",
    "uploadedAt": "2025-01-08T16:30:00Z",
    "uploadedBy": "Mike Johnson",
    "size": "5.2 MB",
    "url": "https://storage.example.com/docs/home-inspection-report.pdf",
    "status": "uploaded",
    "metadata": {
      "inspector": "Bob Wilson",
      "inspectionDate": "2025-01-10",
      "propertyAddress": "123 Main St"
    }
  },
  "message": "Document uploaded successfully",
  "timestamp": "2025-01-08T16:30:00Z"
}
```

### 3. POST /v1/escrows/:id/timeline
**Description:** Add a timeline event to an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "event": "Appraisal Completed",
  "description": "Property appraised at $755,000 - value supports purchase price",
  "type": "milestone",
  "icon": "trending_up",
  "category": "loan",
  "date": "2025-01-12",
  "importance": "high",
  "notifyParties": ["buyer", "buyerAgent", "loanOfficer"]
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 1643723400000,
    "date": "2025-01-12T00:00:00Z",
    "event": "Appraisal Completed",
    "description": "Property appraised at $755,000 - value supports purchase price",
    "type": "milestone",
    "icon": "trending_up",
    "category": "loan",
    "importance": "high",
    "createdBy": "Mike Johnson",
    "createdAt": "2025-01-08T17:00:00Z"
  },
  "message": "Timeline event added",
  "timestamp": "2025-01-08T17:00:00Z"
}
```

### 4. POST /v1/escrows/:id/notes
**Description:** Add a note to an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "content": "Buyer requested 5-day extension for loan approval. Seller agreed via email on 1/8. Need to update contingency removal date to 1/26.",
  "type": "important",
  "category": "loan",
  "visibility": "internal",
  "attachments": [
    {
      "name": "extension_agreement.pdf",
      "url": "https://storage.example.com/notes/extension.pdf"
    }
  ]
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "note_002",
    "escrowId": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Buyer requested 5-day extension for loan approval. Seller agreed via email on 1/8. Need to update contingency removal date to 1/26.",
    "type": "important",
    "category": "loan",
    "visibility": "internal",
    "createdAt": "2025-01-08T17:30:00Z",
    "createdBy": "Mike Johnson",
    "attachments": [
      {
        "name": "extension_agreement.pdf",
        "url": "https://storage.example.com/notes/extension.pdf"
      }
    ]
  },
  "message": "Note added successfully",
  "timestamp": "2025-01-08T17:30:00Z"
}
```

### 5. POST /v1/escrows/:id/ai-assist
**Description:** Request AI assistance for escrow tasks  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "action": "generate_status_update",
  "context": {
    "recipients": ["buyer", "seller", "buyerAgent", "sellerAgent"],
    "includeTimeline": true,
    "includeNextSteps": true,
    "includeFinancials": false,
    "tone": "professional",
    "language": "en",
    "customMessage": "Please include information about the upcoming inspection"
  }
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "action": "generate_status_update",
    "status": "processing",
    "message": "AI assistant is working on your request",
    "estimatedTime": "30 seconds",
    "taskId": "task_789abc",
    "endpoint": "/v1/ai-team/exec-assistant/tasks/task_789abc",
    "webhookUrl": "https://api.example.com/webhooks/ai-tasks/task_789abc"
  },
  "timestamp": "2025-01-08T18:00:00Z"
}
```

---

## PUT Requests

### 1. PUT /v1/escrows/:id
**Description:** Update escrow details  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "escrow_status": "active",
  "closing_date": "2025-02-20",
  "purchase_price": 745000,
  "earnest_money": 7450,
  "loan_amount": 595000,
  "down_payment": 150000,
  "property_type": "single_family",
  "bedrooms": 4,
  "bathrooms": 2.5,
  "square_feet": 2450,
  "notes": "Price reduced by $5,000 after inspection negotiations. Seller to credit for repairs.",
  "inspection_contingency_removal_date": "2025-01-20",
  "loan_contingency_removal_date": "2025-01-26"
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_id": "ESC-2025-001",
    "escrow_status": "active",
    "closing_date": "2025-02-20",
    "purchase_price": 745000,
    "earnest_money": 7450,
    "loan_amount": 595000,
    "down_payment": 150000,
    "property_type": "single_family",
    "bedrooms": 4,
    "bathrooms": 2.5,
    "square_feet": 2450,
    "notes": "Price reduced by $5,000 after inspection negotiations. Seller to credit for repairs.",
    "inspection_contingency_removal_date": "2025-01-20",
    "loan_contingency_removal_date": "2025-01-26",
    "updated_at": "2025-01-08T18:30:00Z",
    "updated_by": "user_123"
  },
  "message": "Escrow updated successfully",
  "timestamp": "2025-01-08T18:30:00Z"
}
```

### 2. PUT /v1/escrows/:id/people
**Description:** Update people associated with escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "loanOfficer": {
    "name": "Jennifer Smith",
    "email": "jennifer@newbank.com",
    "phone": "(555) 999-8888",
    "company": "New Bank Corp",
    "license": "NMLS#654321",
    "address": "100 Financial Center, SF, CA 94105"
  },
  "homeInspector": {
    "name": "Bob Wilson",
    "email": "bob@inspections.com",
    "phone": "(555) 777-6666",
    "company": "Premier Home Inspections",
    "license": "HI#12345"
  },
  "appraiser": {
    "name": "Susan Martinez",
    "email": "susan@appraisals.com",
    "phone": "(555) 444-3333",
    "company": "Accurate Appraisals LLC",
    "license": "CA#98765"
  },
  "titleOfficer": {
    "name": "James Lee",
    "email": "james@titleco.com",
    "phone": "(555) 222-1111",
    "company": "First American Title"
  }
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "loanOfficer": {
      "id": "contact_009",
      "name": "Jennifer Smith",
      "email": "jennifer@newbank.com",
      "phone": "(555) 999-8888",
      "company": "New Bank Corp",
      "license": "NMLS#654321",
      "address": "100 Financial Center, SF, CA 94105"
    },
    "homeInspector": {
      "id": "contact_010",
      "name": "Bob Wilson",
      "email": "bob@inspections.com",
      "phone": "(555) 777-6666",
      "company": "Premier Home Inspections",
      "license": "HI#12345"
    },
    "appraiser": {
      "id": "contact_011",
      "name": "Susan Martinez",
      "email": "susan@appraisals.com",
      "phone": "(555) 444-3333",
      "company": "Accurate Appraisals LLC",
      "license": "CA#98765"
    },
    "titleOfficer": {
      "id": "contact_012",
      "name": "James Lee",
      "email": "james@titleco.com",
      "phone": "(555) 222-1111",
      "company": "First American Title"
    }
  },
  "message": "People updated successfully",
  "timestamp": "2025-01-08T19:00:00Z"
}
```

### 3. PUT /v1/escrows/:id/checklists
**Description:** Update checklist items  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "loan": {
    "appraisalReceived": true,
    "clearToClose": true,
    "cd": true
  },
  "house": {
    "homeInspectionReceived": true,
    "sellerDisclosures": true,
    "rr": true
  },
  "admin": {
    "tcGlideInvite": true,
    "addContactsToPhone": true,
    "addContactsToNotion": true
  }
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "loan": {
      "le": true,
      "lockedRate": true,
      "appraisalOrdered": true,
      "appraisalReceived": true,
      "clearToClose": true,
      "cd": true,
      "loanDocsSigned": false,
      "cashToClosePaid": false,
      "loanFunded": false
    },
    "house": {
      "homeInspectionOrdered": true,
      "emd": true,
      "solarTransferInitiated": false,
      "avid": false,
      "homeInspectionReceived": true,
      "sellerDisclosures": true,
      "rr": true,
      "recorded": false
    },
    "admin": {
      "mlsStatusUpdate": true,
      "tcEmail": true,
      "tcGlideInvite": true,
      "addContactsToPhone": true,
      "addContactsToNotion": true
    }
  },
  "message": "Checklists updated successfully",
  "timestamp": "2025-01-08T19:30:00Z"
}
```

### 4. PUT /v1/escrows/:id/property-details
**Description:** Update property details  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "bedrooms": 4,
  "bathrooms": 2.5,
  "squareFeet": 2450,
  "yearBuilt": 1999,
  "lotSizeSqft": 7200,
  "garageSpaces": 2,
  "stories": 2,
  "pool": false,
  "spa": false,
  "apn": "1234-567-891",
  "viewType": "mountain",
  "architecturalStyle": "Contemporary",
  "propertyCondition": "good",
  "propertyFeatures": [
    "New roof (2023)",
    "Updated kitchen with quartz countertops",
    "Solar panels (owned)",
    "EV charging station",
    "Drought-resistant landscaping",
    "Smart thermostat",
    "Security system"
  ],
  "hoaFee": 175,
  "hoaFrequency": "monthly",
  "hoaName": "Hillside Estates HOA"
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "bedrooms": 4,
    "bathrooms": 2.5,
    "squareFeet": 2450,
    "yearBuilt": 1999,
    "lotSizeSqft": 7200,
    "garageSpaces": 2,
    "stories": 2,
    "pool": false,
    "spa": false,
    "apn": "1234-567-891",
    "viewType": "mountain",
    "architecturalStyle": "Contemporary",
    "propertyCondition": "good",
    "propertyFeatures": [
      "New roof (2023)",
      "Updated kitchen with quartz countertops",
      "Solar panels (owned)",
      "EV charging station",
      "Drought-resistant landscaping",
      "Smart thermostat",
      "Security system"
    ],
    "hoaFee": 175,
    "hoaFrequency": "monthly",
    "hoaName": "Hillside Estates HOA",
    "updated_at": "2025-01-08T20:00:00Z"
  },
  "message": "Property details updated successfully",
  "timestamp": "2025-01-08T20:00:00Z"
}
```

### 5. PUT /v1/escrows/:id/financials
**Description:** Update financial details  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "purchasePrice": 745000,
  "baseCommission": 22350,
  "splitPercentage": 70,
  "transactionFee": 285,
  "tcFee": 250,
  "earnestMoney": 7450,
  "downPayment": 149000,
  "loanAmount": 596000,
  "sellerCredits": 5000,
  "lenderCredits": 2000,
  "closingCosts": {
    "buyerClosingCosts": 11500,
    "sellerClosingCosts": 7800,
    "titleInsurance": 2300,
    "escrowFees": 1450,
    "recordingFees": 325
  },
  "expenses": [
    {
      "description": "Home inspection",
      "amount": 550,
      "paidBy": "buyer",
      "paidThroughEscrow": false
    },
    {
      "description": "Termite inspection",
      "amount": 125,
      "paidBy": "buyer",
      "paidThroughEscrow": false
    }
  ]
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "purchasePrice": 745000,
    "listPrice": 775000,
    "earnestMoney": 7450,
    "downPayment": 149000,
    "downPaymentPercentage": 20,
    "loanAmount": 596000,
    "loanType": "conventional",
    "interestRate": 6.5,
    "lenderCredits": 2000,
    "sellerCredits": 5000,
    "closingCosts": {
      "buyerClosingCosts": 11500,
      "sellerClosingCosts": 7800,
      "titleInsurance": 2300,
      "escrowFees": 1450,
      "recordingFees": 325
    },
    "agentSplit": {
      "baseCommission": 22350,
      "grossAgentCommission": 22350,
      "splitPercentage": 70,
      "transactionFee": 285,
      "tcFee": 250,
      "brokerageSplit": 6705,
      "agent1099Income": 15110,
      "agentNet": 15110
    },
    "commissionBreakdown": {
      "commissionPercentage": 3,
      "grossCommission": 44700,
      "myCommission": 22350,
      "commissionAdjustments": 0,
      "expenseAdjustments": -535,
      "netCommission": 15110
    },
    "expenses": [
      {
        "id": "exp_003",
        "description": "Home inspection",
        "amount": 550,
        "paidBy": "buyer",
        "paidThroughEscrow": false,
        "date": "2025-01-10"
      },
      {
        "id": "exp_004",
        "description": "Termite inspection",
        "amount": 125,
        "paidBy": "buyer",
        "paidThroughEscrow": false,
        "date": "2025-01-11"
      }
    ],
    "totalExpenses": 675,
    "buyerFundsNeeded": 155975,
    "sellerProceeds": 282950
  },
  "message": "Financials updated successfully",
  "timestamp": "2025-01-08T20:30:00Z"
}
```

### 6. PUT /v1/escrows/:id/timeline
**Description:** Update timeline dates  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "acceptanceDate": "2025-01-01",
  "emdDate": "2025-01-03",
  "homeInspectionDate": "2025-01-12",
  "appraisalDate": "2025-01-15",
  "loanContingencyDate": "2025-01-25",
  "allContingenciesRemovalDate": "2025-01-26",
  "coeDate": "2025-02-20",
  "closingDate": "2025-02-20",
  "possessionDate": "2025-02-20",
  "walkThroughDate": "2025-02-19",
  "sellerDisclosuresDueDate": "2025-01-05",
  "sellerDisclosuresReceivedDate": "2025-01-04",
  "preliminaryTitleReportDate": "2025-01-07",
  "loanApprovalDate": "2025-01-24",
  "recordingDate": "2025-02-20"
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "acceptanceDate": "2025-01-01",
    "emdDate": "2025-01-03",
    "homeInspectionDate": "2025-01-12",
    "appraisalDate": "2025-01-15",
    "loanContingencyDate": "2025-01-25",
    "allContingenciesRemovalDate": "2025-01-26",
    "coeDate": "2025-02-20",
    "closingDate": "2025-02-20",
    "possessionDate": "2025-02-20",
    "walkThroughDate": "2025-02-19",
    "sellerDisclosuresDueDate": "2025-01-05",
    "sellerDisclosuresReceivedDate": "2025-01-04",
    "preliminaryTitleReportDate": "2025-01-07",
    "loanApprovalDate": "2025-01-24",
    "recordingDate": "2025-02-20",
    "daysToClose": 43,
    "timelineAdjusted": true
  },
  "message": "Timeline updated successfully",
  "timestamp": "2025-01-08T21:00:00Z"
}
```

---

## PATCH Requests

### 1. PATCH /v1/escrows/:id/checklist
**Description:** Update a single checklist item  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Full Request Payload:**
```json
{
  "itemId": "loan.clearToClose",
  "checked": true,
  "notes": "Clear to close received from lender on 1/8",
  "completedBy": "David Lee"
}
```

**Full Response Example:**
```json
{
  "success": true,
  "data": {
    "itemId": "loan.clearToClose",
    "checked": true,
    "completedAt": "2025-01-08T21:30:00Z",
    "completedBy": "David Lee",
    "notes": "Clear to close received from lender on 1/8"
  },
  "message": "Checklist item updated",
  "timestamp": "2025-01-08T21:30:00Z"
}
```

---

## DELETE Requests

### 1. DELETE /v1/escrows/:id
**Description:** Delete an escrow (permanent delete)  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID or display_id

**Example Request:**
```
DELETE /v1/escrows/550e8400-e29b-41d4-a716-446655440000
```

**Full Response Example:**
```json
{
  "success": true,
  "message": "Escrow deleted successfully",
  "timestamp": "2025-01-08T22:00:00Z"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: purchase_price",
    "field": "purchase_price",
    "validation": "required"
  },
  "timestamp": "2025-01-08T22:30:00Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token",
    "details": "Token expired at 2025-01-08T20:00:00Z"
  },
  "timestamp": "2025-01-08T22:30:00Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Escrow not found",
    "resource": "escrow",
    "id": "550e8400-e29b-41d4-a716-446655440999"
  },
  "timestamp": "2025-01-08T22:30:00Z"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": [
      {
        "field": "purchase_price",
        "message": "Must be a positive number"
      },
      {
        "field": "closing_date",
        "message": "Must be after opening date"
      }
    ]
  },
  "timestamp": "2025-01-08T22:30:00Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "requestId": "req_abc123xyz",
    "support": "Please contact support with request ID if issue persists"
  },
  "timestamp": "2025-01-08T22:30:00Z"
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Database connection failed. Service temporarily unavailable.",
    "retryAfter": 30
  },
  "timestamp": "2025-01-08T22:30:00Z"
}
```

---

## Rate Limiting

All endpoints are subject to rate limiting:

### Rate Limit Headers
All responses include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704744000
X-RateLimit-Reset-After: 3600
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "limit": 100,
    "resetAt": "2025-01-08T23:00:00Z",
    "retryAfter": 3600
  },
  "timestamp": "2025-01-08T22:45:00Z"
}
```

---

## Webhooks

Configure webhooks to receive real-time updates:

### Webhook Events
- `escrow.created` - New escrow created
- `escrow.updated` - Escrow details updated
- `escrow.deleted` - Escrow deleted
- `escrow.status_changed` - Status changed
- `checklist.item_completed` - Checklist item marked complete
- `document.uploaded` - New document uploaded
- `timeline.event_added` - Timeline event added
- `people.updated` - Contact information updated
- `financial.updated` - Financial details changed

### Webhook Payload Example
```json
{
  "event": "escrow.status_changed",
  "timestamp": "2025-01-08T15:30:00Z",
  "data": {
    "escrow_id": "550e8400-e29b-41d4-a716-446655440000",
    "display_id": "ESC-2025-001",
    "previous_status": "pending",
    "new_status": "active",
    "changed_by": "user_123",
    "changed_at": "2025-01-08T15:30:00Z"
  },
  "metadata": {
    "webhook_id": "webhook_789",
    "delivery_attempt": 1,
    "signature": "sha256=abcdef123456..."
  }
}
```

---

## Authentication

All requests require authentication via Bearer token:

### Request Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Response
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "scope": "escrows:read escrows:write"
  },
  "timestamp": "2025-01-08T10:00:00Z"
}
```