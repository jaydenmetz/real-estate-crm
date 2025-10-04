# Escrows API Documentation - Organized by HTTP Method

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

**Response Example:**
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
      "purchase_price": 750000,
      "escrow_status": "active",
      "coe_date": "2025-02-15",
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
      "created_at": "2025-01-08T10:00:00Z",
      "updated_at": "2025-01-08T14:30:00Z"
    }
  ],
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 2. GET /v1/escrows/stats
**Description:** Get dashboard statistics for all escrows  
**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "data": {
    "total_escrows": 45,
    "active_escrows": 12,
    "pending_escrows": 5,
    "closed_escrows": 28,
    "total_volume": 15750000,
    "average_price": 350000,
    "average_days_to_close": 28,
    "closing_rate": 87.5,
    "monthly_stats": {
      "new_escrows": 8,
      "closed_this_month": 6,
      "revenue_this_month": 125000
    },
    "upcoming_closings": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "display_id": "ESC-2025-002",
        "property_address": "456 Oak Ave",
        "coe_date": "2025-01-15",
        "days_remaining": 7
      }
    ]
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 3. GET /v1/escrows/:id
**Description:** Get complete escrow details by ID  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Response Example:**
```json
{
  "success": true,
  "data": {
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
    "year_built": 1998,
    "lot_size": 7500,
    "apn": "1234-567-890",
    "mls_number": "LA12345",
    "zillow_url": "https://www.zillow.com/homes/123-main-st",
    "property_image_url": "https://photos.zillowstatic.com/p_e/ISynkxa123.jpg",
    "acceptance_date": "2025-01-01",
    "coe_date": "2025-02-15",
    "escrow_opened_date": "2025-01-02",
    "inspection_date": "2025-01-10",
    "appraisal_date": "2025-01-12",
    "loan_approval_date": "2025-01-25",
    "people": {
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
      "buyerAgent": {
        "name": "Mike Johnson",
        "email": "mike@realty.com",
        "phone": "(555) 345-6789",
        "license": "DRE#12345678"
      }
    },
    "financials": {
      "purchase_price": 750000,
      "down_payment": 150000,
      "loan_amount": 600000,
      "earnest_money": 7500,
      "commission": {
        "total_commission": 45000,
        "listing_side": 22500,
        "buying_side": 22500,
        "my_commission": 22500,
        "brokerage_split": 4500,
        "net_commission": 18000
      }
    },
    "checklists": {
      "loan": {
        "preApproval": true,
        "loanApplication": true,
        "appraisalOrdered": true,
        "appraisalReceived": false,
        "loanApproval": false,
        "clearToClose": false
      },
      "house": {
        "inspectionScheduled": true,
        "inspectionCompleted": true,
        "repairsNegotiated": false,
        "repairsCompleted": false,
        "finalWalkthrough": false
      },
      "admin": {
        "purchaseAgreement": true,
        "disclosuresDelivered": true,
        "disclosuresSigned": true,
        "titleOrdered": true,
        "titleReceived": false,
        "insurance": false
      }
    },
    "created_at": "2025-01-08T10:00:00Z",
    "updated_at": "2025-01-08T14:30:00Z"
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 4. GET /v1/escrows/:id/people
**Description:** Get all people associated with an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Response Example:**
```json
{
  "success": true,
  "data": {
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
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 5. GET /v1/escrows/:id/timeline
**Description:** Get escrow timeline with all key dates  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Response Example:**
```json
{
  "success": true,
  "data": {
    "key_dates": {
      "acceptance_date": "2025-01-01",
      "escrow_opened_date": "2025-01-02",
      "inspection_date": "2025-01-10",
      "inspection_completion": "2025-01-10",
      "appraisal_date": "2025-01-12",
      "loan_contingency_date": "2025-01-21",
      "all_contingencies_removal": "2025-01-25",
      "clear_to_close_date": "2025-02-10",
      "closing_date": "2025-02-15"
    },
    "events": [
      {
        "id": "evt_001",
        "date": "2025-01-01T10:00:00Z",
        "event": "Offer Accepted",
        "description": "Purchase offer accepted by seller",
        "type": "milestone",
        "completed": true
      },
      {
        "id": "evt_002",
        "date": "2025-01-02T14:00:00Z",
        "event": "Escrow Opened",
        "description": "Escrow account opened at Premier Escrow",
        "type": "milestone",
        "completed": true
      },
      {
        "id": "evt_003",
        "date": "2025-01-10T09:00:00Z",
        "event": "Home Inspection",
        "description": "Property inspection scheduled",
        "type": "inspection",
        "completed": false
      }
    ],
    "progress": {
      "percentage": 45,
      "days_elapsed": 7,
      "days_remaining": 38,
      "milestones_completed": 3,
      "milestones_total": 9
    }
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 6. GET /v1/escrows/:id/financials
**Description:** Get detailed financial information for an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Response Example:**
```json
{
  "success": true,
  "data": {
    "purchase_price": 750000,
    "down_payment": {
      "amount": 150000,
      "percentage": 20
    },
    "loan_amount": 600000,
    "earnest_money": {
      "amount": 7500,
      "deposited": true,
      "deposit_date": "2025-01-03"
    },
    "closing_costs": {
      "buyer_costs": 12500,
      "seller_costs": 8500,
      "title_insurance": 2500,
      "escrow_fees": 1500,
      "recording_fees": 350
    },
    "commission": {
      "total_commission": 45000,
      "commission_rate": 6,
      "listing_side": {
        "gross": 22500,
        "brokerage": "XYZ Realty",
        "agent": "Sarah Williams",
        "split_percentage": 80,
        "agent_net": 18000
      },
      "buying_side": {
        "gross": 22500,
        "brokerage": "ABC Realty",
        "agent": "Mike Johnson",
        "split_percentage": 75,
        "agent_net": 16875
      },
      "my_side": "buying",
      "my_gross": 22500,
      "my_split": 75,
      "brokerage_fee": 5625,
      "transaction_fee": 500,
      "my_net": 16375
    },
    "prorations": {
      "property_tax": -625,
      "hoa_fees": -150,
      "utilities": -75
    },
    "credits": {
      "seller_credit": 5000,
      "repair_credit": 2500
    },
    "buyer_funds_needed": 157350,
    "seller_proceeds": 285150
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 7. GET /v1/escrows/:id/checklists
**Description:** Get all checklists for an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Response Example:**
```json
{
  "success": true,
  "data": {
    "loan": {
      "category": "Loan & Financing",
      "items": {
        "preApproval": {
          "label": "Pre-Approval Letter",
          "completed": true,
          "completed_date": "2024-12-28",
          "completed_by": "Mike Johnson"
        },
        "loanApplication": {
          "label": "Loan Application Submitted",
          "completed": true,
          "completed_date": "2025-01-03",
          "completed_by": "David Lee"
        },
        "appraisalOrdered": {
          "label": "Appraisal Ordered",
          "completed": true,
          "completed_date": "2025-01-05"
        },
        "appraisalReceived": {
          "label": "Appraisal Received",
          "completed": false,
          "due_date": "2025-01-12"
        },
        "loanApproval": {
          "label": "Loan Approval",
          "completed": false,
          "due_date": "2025-01-21"
        },
        "clearToClose": {
          "label": "Clear to Close",
          "completed": false,
          "due_date": "2025-02-10"
        }
      },
      "progress": {
        "completed": 3,
        "total": 6,
        "percentage": 50
      }
    },
    "house": {
      "category": "Property & Inspections",
      "items": {
        "earnestMoneyDeposited": {
          "label": "Earnest Money Deposited",
          "completed": true,
          "completed_date": "2025-01-03"
        },
        "inspectionScheduled": {
          "label": "Inspection Scheduled",
          "completed": true,
          "completed_date": "2025-01-05"
        },
        "inspectionCompleted": {
          "label": "Inspection Completed",
          "completed": false,
          "due_date": "2025-01-10"
        },
        "repairsNegotiated": {
          "label": "Repairs Negotiated",
          "completed": false
        },
        "repairsCompleted": {
          "label": "Repairs Completed",
          "completed": false
        },
        "finalWalkthrough": {
          "label": "Final Walkthrough",
          "completed": false,
          "due_date": "2025-02-14"
        }
      },
      "progress": {
        "completed": 2,
        "total": 6,
        "percentage": 33
      }
    },
    "admin": {
      "category": "Documentation & Admin",
      "items": {
        "purchaseAgreement": {
          "label": "Purchase Agreement Signed",
          "completed": true,
          "completed_date": "2025-01-01"
        },
        "disclosuresDelivered": {
          "label": "Disclosures Delivered",
          "completed": true,
          "completed_date": "2025-01-02"
        },
        "disclosuresSigned": {
          "label": "Disclosures Signed",
          "completed": true,
          "completed_date": "2025-01-04"
        },
        "titleOrdered": {
          "label": "Title Report Ordered",
          "completed": true,
          "completed_date": "2025-01-02"
        },
        "titleReceived": {
          "label": "Title Report Received",
          "completed": false,
          "due_date": "2025-01-09"
        },
        "homeownersInsurance": {
          "label": "Homeowner's Insurance",
          "completed": false,
          "due_date": "2025-02-01"
        },
        "closingDocsReviewed": {
          "label": "Closing Documents Reviewed",
          "completed": false
        },
        "fundingConfirmed": {
          "label": "Funding Confirmed",
          "completed": false
        }
      },
      "progress": {
        "completed": 4,
        "total": 8,
        "percentage": 50
      }
    },
    "overall_progress": {
      "completed": 9,
      "total": 20,
      "percentage": 45
    }
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 8. GET /v1/escrows/:id/documents
**Description:** Get all documents associated with an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Response Example:**
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
      "thumbnail_url": "https://storage.example.com/thumbs/purchase-agreement.jpg"
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
      "url": "https://storage.example.com/docs/seller-disclosures.pdf"
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
      "url": "https://storage.example.com/docs/pre-approval.pdf"
    }
  ],
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 9. GET /v1/escrows/:id/property-details
**Description:** Get detailed property information  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Response Example:**
```json
{
  "success": true,
  "data": {
    "address": {
      "street": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zip_code": "90001",
      "county": "Los Angeles County"
    },
    "details": {
      "property_type": "single_family",
      "bedrooms": 4,
      "bathrooms": 3,
      "square_feet": 2500,
      "lot_size": 7500,
      "year_built": 1998,
      "stories": 2,
      "garage_spaces": 2,
      "pool": true,
      "hoa": false
    },
    "identifiers": {
      "apn": "1234-567-890",
      "mls_number": "LA12345",
      "legal_description": "Lot 15, Block 3, Sunset Heights Subdivision"
    },
    "valuation": {
      "purchase_price": 750000,
      "list_price": 775000,
      "assessed_value": 680000,
      "price_per_sqft": 300
    },
    "features": [
      "Hardwood floors",
      "Granite countertops",
      "Stainless steel appliances",
      "Master suite with walk-in closet",
      "Backyard pool and spa"
    ],
    "utilities": {
      "electricity": "Southern California Edison",
      "gas": "SoCal Gas",
      "water": "LADWP",
      "sewer": "City",
      "trash": "City"
    },
    "schools": {
      "elementary": "Sunset Elementary",
      "middle": "Valley Middle School",
      "high": "West High School",
      "district": "Los Angeles Unified"
    },
    "external_links": {
      "zillow": "https://www.zillow.com/homes/123-main-st",
      "redfin": "https://www.redfin.com/CA/Los-Angeles/123-Main-St",
      "county_assessor": "https://assessor.lacounty.gov/parcel/1234-567-890"
    },
    "images": [
      "https://photos.zillowstatic.com/p_e/ISynkxa123.jpg",
      "https://photos.zillowstatic.com/p_e/ISynkxa124.jpg"
    ]
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

### 10. GET /v1/escrows/:id/image
**Description:** Get property image URL from Zillow or other sources  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Response Example:**
```json
{
  "success": true,
  "data": {
    "primary_image": "https://photos.zillowstatic.com/p_e/ISynkxa123.jpg",
    "thumbnail": "https://photos.zillowstatic.com/p_c/ISynkxa123.jpg",
    "gallery": [
      "https://photos.zillowstatic.com/p_e/ISynkxa123.jpg",
      "https://photos.zillowstatic.com/p_e/ISynkxa124.jpg",
      "https://photos.zillowstatic.com/p_e/ISynkxa125.jpg"
    ],
    "source": "zillow",
    "updated_at": "2025-01-08T10:00:00Z"
  },
  "timestamp": "2025-01-08T15:00:00Z"
}
```

---

## POST Requests

### 1. POST /v1/escrows
**Description:** Create a new escrow  
**Authentication:** Required

**Request Payload:**
```json
{
  "property_address": "789 Oak Ave",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "purchase_price": 1200000,
  "transaction_type": "purchase",
  "property_type": "condo",
  "acceptance_date": "2025-01-15",
  "coe_date": "2025-03-01",
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

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "display_id": "ESC-2025-003",
    "property_address": "789 Oak Ave",
    "city": "San Francisco",
    "state": "CA",
    "zip_code": "94102",
    "purchase_price": 1200000,
    "escrow_status": "pending",
    "transaction_type": "purchase",
    "property_type": "condo",
    "acceptance_date": "2025-01-15",
    "coe_date": "2025-03-01",
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
    "created_at": "2025-01-08T16:00:00Z",
    "created_by": "user_123"
  },
  "message": "Escrow created successfully",
  "timestamp": "2025-01-08T16:00:00Z"
}
```

### 2. POST /v1/escrows/:id/documents
**Description:** Upload a document to an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "name": "Home Inspection Report.pdf",
  "type": "inspection",
  "category": "Inspections",
  "file_data": "base64_encoded_file_data_here..."
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "doc_004",
    "escrow_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Home Inspection Report.pdf",
    "type": "inspection",
    "category": "Inspections",
    "size": "5.2 MB",
    "uploaded_date": "2025-01-08T16:30:00Z",
    "uploaded_by": "Mike Johnson",
    "status": "uploaded",
    "url": "https://storage.example.com/docs/inspection-report.pdf"
  },
  "message": "Document uploaded successfully",
  "timestamp": "2025-01-08T16:30:00Z"
}
```

### 3. POST /v1/escrows/:id/timeline
**Description:** Add a timeline event to an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "event": "Appraisal Completed",
  "description": "Property appraised at $755,000",
  "type": "milestone",
  "icon": "trending_up"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "evt_004",
    "date": "2025-01-08T17:00:00Z",
    "event": "Appraisal Completed",
    "description": "Property appraised at $755,000",
    "type": "milestone",
    "icon": "trending_up",
    "created_by": "Mike Johnson"
  },
  "message": "Timeline event added",
  "timestamp": "2025-01-08T17:00:00Z"
}
```

### 4. POST /v1/escrows/:id/notes
**Description:** Add a note to an escrow  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "content": "Buyer requested 5-day extension for loan approval. Seller agreed.",
  "type": "important"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "note_001",
    "escrow_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Buyer requested 5-day extension for loan approval. Seller agreed.",
    "type": "important",
    "created_at": "2025-01-08T17:30:00Z",
    "created_by": "Mike Johnson"
  },
  "message": "Note added successfully",
  "timestamp": "2025-01-08T17:30:00Z"
}
```

### 5. POST /v1/escrows/:id/ai-assist
**Description:** Request AI assistance for escrow tasks  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "action": "generate_status_update",
  "context": {
    "recipients": ["buyer", "seller"],
    "include_timeline": true,
    "include_next_steps": true
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "action": "generate_status_update",
    "status": "processing",
    "message": "AI assistant is working on your request",
    "estimated_time": "30 seconds",
    "task_id": "task_789",
    "endpoint": "/v1/ai-team/exec-assistant/tasks/task_789"
  },
  "timestamp": "2025-01-08T18:00:00Z"
}
```

---

## PUT Requests

### 1. PUT /v1/escrows/:id
**Description:** Update escrow details  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "escrow_status": "active",
  "coe_date": "2025-02-20",
  "purchase_price": 745000,
  "notes": "Price reduced after inspection negotiations"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_id": "ESC-2025-001",
    "escrow_status": "active",
    "coe_date": "2025-02-20",
    "purchase_price": 745000,
    "notes": "Price reduced after inspection negotiations",
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
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "loanOfficer": {
    "name": "Jennifer Smith",
    "email": "jennifer@newbank.com",
    "phone": "(555) 999-8888",
    "nmls": "NMLS#654321",
    "company": "New Bank Corp"
  },
  "homeInspector": {
    "name": "Bob Wilson",
    "email": "bob@inspections.com",
    "phone": "(555) 777-6666",
    "license": "HI#12345"
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "loanOfficer": {
      "name": "Jennifer Smith",
      "email": "jennifer@newbank.com",
      "phone": "(555) 999-8888",
      "nmls": "NMLS#654321",
      "company": "New Bank Corp"
    },
    "homeInspector": {
      "name": "Bob Wilson",
      "email": "bob@inspections.com",
      "phone": "(555) 777-6666",
      "license": "HI#12345"
    }
  },
  "message": "People updated successfully",
  "timestamp": "2025-01-08T19:00:00Z"
}
```

### 3. PUT /v1/escrows/:id/checklists
**Description:** Update checklist items  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "loan": {
    "appraisalReceived": true,
    "loanApproval": true
  },
  "house": {
    "inspectionCompleted": true,
    "repairsNegotiated": true
  },
  "admin": {
    "titleReceived": true
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "updated_items": [
      {
        "category": "loan",
        "item": "appraisalReceived",
        "completed": true,
        "completed_date": "2025-01-08"
      },
      {
        "category": "loan",
        "item": "loanApproval",
        "completed": true,
        "completed_date": "2025-01-08"
      },
      {
        "category": "house",
        "item": "inspectionCompleted",
        "completed": true,
        "completed_date": "2025-01-08"
      },
      {
        "category": "house",
        "item": "repairsNegotiated",
        "completed": true,
        "completed_date": "2025-01-08"
      },
      {
        "category": "admin",
        "item": "titleReceived",
        "completed": true,
        "completed_date": "2025-01-08"
      }
    ],
    "overall_progress": {
      "completed": 14,
      "total": 20,
      "percentage": 70
    }
  },
  "message": "Checklists updated successfully",
  "timestamp": "2025-01-08T19:30:00Z"
}
```

### 4. PUT /v1/escrows/:id/property-details
**Description:** Update property details  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "bedrooms": 4,
  "bathrooms": 2.5,
  "square_feet": 2450,
  "year_built": 1999,
  "apn": "1234-567-891",
  "features": [
    "New roof (2023)",
    "Updated kitchen",
    "Solar panels"
  ]
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "bedrooms": 4,
    "bathrooms": 2.5,
    "square_feet": 2450,
    "year_built": 1999,
    "apn": "1234-567-891",
    "features": [
      "New roof (2023)",
      "Updated kitchen",
      "Solar panels"
    ],
    "updated_at": "2025-01-08T20:00:00Z"
  },
  "message": "Property details updated successfully",
  "timestamp": "2025-01-08T20:00:00Z"
}
```

### 5. PUT /v1/escrows/:id/financials
**Description:** Update financial details  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "purchase_price": 745000,
  "down_payment": 149000,
  "loan_amount": 596000,
  "seller_credit": 5000,
  "repair_credit": 3000,
  "commission": {
    "total_commission": 44700,
    "commission_rate": 6,
    "my_side": "buying",
    "my_split": 75
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "purchase_price": 745000,
    "down_payment": {
      "amount": 149000,
      "percentage": 20
    },
    "loan_amount": 596000,
    "seller_credit": 5000,
    "repair_credit": 3000,
    "commission": {
      "total_commission": 44700,
      "commission_rate": 6,
      "listing_side": 22350,
      "buying_side": 22350,
      "my_side": "buying",
      "my_gross": 22350,
      "my_split": 75,
      "brokerage_fee": 5587.50,
      "transaction_fee": 500,
      "my_net": 16262.50
    },
    "buyer_funds_needed": 154850,
    "seller_proceeds": 283150
  },
  "message": "Financials updated successfully",
  "timestamp": "2025-01-08T20:30:00Z"
}
```

### 6. PUT /v1/escrows/:id/timeline
**Description:** Update timeline dates  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "inspection_date": "2025-01-12",
  "appraisal_date": "2025-01-15",
  "loan_contingency_date": "2025-01-25",
  "closing_date": "2025-02-20"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "updated_dates": {
      "inspection_date": "2025-01-12",
      "appraisal_date": "2025-01-15",
      "loan_contingency_date": "2025-01-25",
      "closing_date": "2025-02-20"
    },
    "timeline_adjusted": true,
    "days_to_close": 43
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
**Parameters:** `id` - Escrow UUID

**Request Payload:**
```json
{
  "itemId": "loan.clearToClose",
  "checked": true
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "itemId": "loan.clearToClose",
    "checked": true,
    "completedAt": "2025-01-08T21:30:00Z",
    "completedBy": "Mike Johnson"
  },
  "message": "Checklist item updated",
  "timestamp": "2025-01-08T21:30:00Z"
}
```

---

## DELETE Requests

### 1. DELETE /v1/escrows/:id
**Description:** Delete an escrow (soft delete)  
**Authentication:** Required  
**Parameters:** `id` - Escrow UUID

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_id": "ESC-2025-001",
    "deleted_at": "2025-01-08T22:00:00Z",
    "deleted_by": "user_123"
  },
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
    "message": "Missing required field: purchase_price"
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
    "message": "Invalid or expired authentication token"
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
    "message": "Escrow not found with ID: 550e8400-e29b-41d4-a716-446655440999"
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
    "message": "An unexpected error occurred. Please try again later."
  },
  "timestamp": "2025-01-08T22:30:00Z"
}
```

---

## Rate Limiting

All endpoints are subject to rate limiting:
- **Standard tier**: 100 requests per minute
- **Premium tier**: 500 requests per minute
- **Enterprise tier**: Unlimited

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Pagination

List endpoints support pagination:
- `?page=1&limit=20` - Default pagination
- `?limit=50` - Maximum 100 items per page
- Response includes pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

## Filtering & Sorting

List endpoints support filtering and sorting:
- `?status=active` - Filter by status
- `?sort=created_at:desc` - Sort by field
- `?search=main%20st` - Search in address fields
- `?date_from=2025-01-01&date_to=2025-01-31` - Date range filters

## Webhooks

Configure webhooks to receive real-time updates:
- Escrow created
- Escrow updated
- Checklist item completed
- Document uploaded
- Timeline event added
- Status changed

Webhook payload includes the full resource data plus event metadata.