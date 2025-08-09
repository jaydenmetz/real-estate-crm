#!/bin/bash

# Get a JWT token first (you'll need to replace with your actual token)
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NDgzMTE1LTBlM2UtNDNmMy04YTRhLTQ4OGE2ZjBkZjAxNyIsImVtYWlsIjoiYWRtaW5AamF5ZGVubWV0ei5jb20iLCJyb2xlIjoic3lzdGVtX2FkbWluIiwiaWF0IjoxNzU0NzU1MjY5LCJleHAiOjE3NTczNDcyNjl9.y2IkTMdqYvfMBYKmRO3yrAR8pIxfos3RaEMsu1lj8lc"

# API URL
API_URL="https://api.jaydenmetz.com/v1"

# Generate random booleans
POOL=$((RANDOM % 2))
SPA=$((RANDOM % 2))
GATED=$((RANDOM % 2))
SOLAR=$((RANDOM % 2))

# Random selections
VIEWS=("Ocean" "Mountain" "City" "Golf Course" "Valley" "None")
STYLES=("Modern" "Mediterranean" "Colonial" "Contemporary" "Ranch" "Victorian")
CONDITIONS=("Excellent" "Good" "Fair" "Needs Work")
SOURCES=("Zillow" "Referral" "Open House" "Past Client" "MLS" "Social Media")

VIEW="${VIEWS[$((RANDOM % ${#VIEWS[@]}))]}"
STYLE="${STYLES[$((RANDOM % ${#STYLES[@]}))]}"
CONDITION="${CONDITIONS[$((RANDOM % ${#CONDITIONS[@]}))]}"
SOURCE="${SOURCES[$((RANDOM % ${#SOURCES[@]}))]}"

# Create comprehensive escrow with all fields
curl -X POST "${API_URL}/escrows" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "property_address": "1234 Luxury Estate Drive",
    "city": "Beverly Hills",
    "state": "CA",
    "zip_code": "90210",
    "county": "Los Angeles",
    "purchase_price": 3500000,
    "earnest_money_deposit": 175000,
    "down_payment": 700000,
    "loan_amount": 2800000,
    "commission_percentage": 2.5,
    "gross_commission": 87500,
    "net_commission": 61250,
    "my_commission": 43750,
    "commission_adjustments": -5000,
    "expense_adjustments": -2500,
    "escrow_status": "Active",
    "acceptance_date": "2025-08-01",
    "closing_date": "2025-09-15",
    "actual_coe_date": null,
    "property_type": "Single Family",
    "bedrooms": 5,
    "bathrooms": 4.5,
    "square_feet": 4800,
    "lot_size_sqft": 12000,
    "year_built": 2019,
    "garage_spaces": 3,
    "stories": 2,
    "pool": '$POOL',
    "spa": '$SPA',
    "view_type": "'$VIEW'",
    "architectural_style": "'$STYLE'",
    "property_condition": "'$CONDITION'",
    "zoning": "R1",
    "apn": "4356-024-017",
    "mls_number": "ML24195847",
    "subdivision": "Beverly Hills Estates",
    "cross_streets": "Sunset Blvd & Rodeo Dr",
    "latitude": 34.0736,
    "longitude": -118.4004,
    "hoa_fee": 450,
    "hoa_frequency": "monthly",
    "hoa_name": "Beverly Hills Estates HOA",
    "gated_community": '$GATED',
    "senior_community": false,
    "list_price": 3650000,
    "list_date": "2025-07-15",
    "days_on_market": 17,
    "previous_list_price": 3750000,
    "original_list_price": 3800000,
    "escrow_company": "Premier Escrow Services of Beverly Hills",
    "escrow_officer_name": "Elizabeth Sterling",
    "escrow_officer_email": "elizabeth@premierescrowbh.com",
    "escrow_officer_phone": "(310) 555-1234",
    "title_company": "First American Title Insurance",
    "lender_name": "Wells Fargo Home Mortgage",
    "loan_officer_name": "Michael Thompson",
    "loan_officer_email": "mthompson@wellsfargo.com",
    "loan_officer_phone": "(310) 555-5678",
    "transaction_coordinator": "Sarah Martinez",
    "nhd_company": "Property ID Corporation",
    "transaction_type": "Purchase",
    "lead_source": "'$SOURCE'",
    "zillow_url": "https://www.zillow.com/homedetails/1234-Luxury-Estate-Dr-Beverly-Hills-CA-90210/12345678_zpid/",
    "property_image_url": "https://photos.zillowstatic.com/fp/luxury-estate-beverly-hills.jpg",
    "timeline": {
      "acceptanceDate": "2025-08-01",
      "emdDate": "2025-08-04",
      "sellerDisclosuresDueDate": "2025-08-08",
      "homeInspectionDate": "2025-08-10",
      "termiteInspectionDate": "2025-08-11",
      "appraisalDate": "2025-08-15",
      "inspectionContingencyDate": "2025-08-17",
      "appraisalContingencyDate": "2025-08-22",
      "loanContingencyDate": "2025-08-29",
      "allContingenciesRemovalDate": "2025-08-30",
      "coeDate": "2025-09-15"
    },
    "financials": {
      "purchasePrice": 3500000,
      "baseCommission": 87500,
      "grossCommission": 87500,
      "grossCommissionFees": 8750,
      "grossReferralFee": 8750,
      "grossReferralFeePercentage": 10,
      "adjustedGross": 78750,
      "netCommission": 61250,
      "dealExpense": 5468.75,
      "franchiseFees": 5468.75,
      "franchiseFeePercentage": 6.25,
      "dealNet": 55781.25,
      "agentGCI": 55781.25,
      "splitPercentage": 80,
      "agentSplit": 44625,
      "agentReferralFee": 0,
      "agentReferralFeePercentage": 0,
      "transactionFee": 395,
      "tcFee": 250,
      "agent1099Income": 43980,
      "excessPayment": 43980,
      "agentNet": 43980,
      "commissionPercentage": 2.5,
      "commissionAdjustments": -5000,
      "expenseAdjustments": -2500,
      "leadSource": "Zillow Premier Agent",
      "referralAgent": "John Peterson - Keller Williams"
    },
    "people": {
      "buyer": {
        "name": "Robert & Jennifer Chen",
        "email": "rjchen@email.com",
        "phone": "(310) 555-8901",
        "address": "456 Current Residence St, Los Angeles, CA 90024"
      },
      "buyerAgent": {
        "name": "David Richardson",
        "email": "drichardson@remax.com",
        "phone": "(310) 555-3456",
        "company": "RE/MAX Beverly Hills",
        "license": "CA DRE #01987654"
      },
      "seller": {
        "name": "Michael & Susan Thompson",
        "email": "thompson.family@email.com",
        "phone": "(310) 555-7890",
        "address": "1234 Luxury Estate Drive, Beverly Hills, CA 90210"
      },
      "sellerAgent": {
        "name": "Amanda Williams",
        "email": "awilliams@compass.com",
        "phone": "(310) 555-2345",
        "company": "Compass Real Estate",
        "license": "CA DRE #02134567"
      }
    },
    "checklists": {
      "loan": {
        "le": '$((RANDOM % 2))',
        "lockedRate": '$((RANDOM % 2))',
        "appraisalOrdered": '$((RANDOM % 2))',
        "appraisalReceived": '$((RANDOM % 2))',
        "clearToClose": '$((RANDOM % 2))',
        "cd": '$((RANDOM % 2))',
        "loanDocsSigned": '$((RANDOM % 2))',
        "cashToClosePaid": '$((RANDOM % 2))',
        "loanFunded": '$((RANDOM % 2))'
      },
      "house": {
        "homeInspectionOrdered": '$((RANDOM % 2))',
        "emd": '$((RANDOM % 2))',
        "solarTransferInitiated": '$SOLAR',
        "avid": '$((RANDOM % 2))',
        "homeInspectionReceived": '$((RANDOM % 2))',
        "sellerDisclosures": '$((RANDOM % 2))',
        "rr": '$((RANDOM % 2))',
        "cr": '$((RANDOM % 2))',
        "recorded": '$((RANDOM % 2))'
      },
      "admin": {
        "mlsStatusUpdate": '$((RANDOM % 2))',
        "tcEmail": '$((RANDOM % 2))',
        "tcGlideInvite": '$((RANDOM % 2))',
        "addContactsToPhone": '$((RANDOM % 2))',
        "addContactsToNotion": '$((RANDOM % 2))'
      }
    },
    "documents": [
      {
        "id": "doc_001",
        "name": "Purchase Agreement - Fully Executed",
        "type": "contract",
        "uploadedAt": "2025-08-01T10:30:00Z",
        "url": "https://example.com/docs/purchase-agreement.pdf"
      },
      {
        "id": "doc_002",
        "name": "Seller Disclosure Package",
        "type": "disclosure",
        "uploadedAt": "2025-08-08T14:15:00Z",
        "url": "https://example.com/docs/seller-disclosures.pdf"
      },
      {
        "id": "doc_003",
        "name": "Home Inspection Report",
        "type": "inspection",
        "uploadedAt": "2025-08-10T16:45:00Z",
        "url": "https://example.com/docs/home-inspection.pdf"
      },
      {
        "id": "doc_004",
        "name": "Preliminary Title Report",
        "type": "title",
        "uploadedAt": "2025-08-05T09:00:00Z",
        "url": "https://example.com/docs/preliminary-title.pdf"
      },
      {
        "id": "doc_005",
        "name": "Loan Pre-Approval Letter",
        "type": "financing",
        "uploadedAt": "2025-07-28T11:30:00Z",
        "url": "https://example.com/docs/pre-approval.pdf"
      }
    ]
  }' | python3 -m json.tool

echo ""
echo "✅ Comprehensive escrow created with all fields populated!"
echo "   - Random checkboxes values applied"
echo "   - Full property details"
echo "   - Complete financial breakdown"
echo "   - All people and contacts"
echo "   - Full timeline with all dates"
echo "   - Documents attached"