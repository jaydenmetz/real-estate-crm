#!/bin/bash

# JWT Token from the test output
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NDgzMTE1LTBlM2UtNDNmMy04YTRhLTQ4OGE2ZjBkZjAxNyIsImVtYWlsIjoiYWRtaW5AamF5ZGVubWV0ei5jb20iLCJyb2xlIjoic3lzdGVtX2FkbWluIiwiaWF0IjoxNzU0NzU1MjY5LCJleHAiOjE3NTczNDcyNjl9.y2IkTMdqYvfMBYKmRO3yrAR8pIxfos3RaEMsu1lj8lc"

# API URL
API_URL="https://api.jaydenmetz.com/v1"

echo "Creating comprehensive escrow with all fields..."
echo ""

# Create the escrow
RESPONSE=$(curl -s -X POST "${API_URL}/escrows" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "property_address": "9876 Prestigious Manor Way",
    "city": "Beverly Hills",
    "state": "CA",
    "zip_code": "90210",
    "county": "Los Angeles",
    "purchase_price": 4750000,
    "earnest_money_deposit": 237500,
    "down_payment": 950000,
    "loan_amount": 3800000,
    "commission_percentage": 2.5,
    "gross_commission": 118750,
    "net_commission": 83125,
    "my_commission": 59375,
    "commission_adjustments": -7500,
    "expense_adjustments": -3200,
    "escrow_status": "Active",
    "acceptance_date": "2025-08-05",
    "closing_date": "2025-09-25",
    "property_type": "Luxury Estate",
    "bedrooms": 6,
    "bathrooms": 7.5,
    "square_feet": 8500,
    "lot_size_sqft": 22000,
    "year_built": 2021,
    "garage_spaces": 4,
    "stories": 3,
    "pool": true,
    "spa": true,
    "view_type": "Ocean & City Lights",
    "architectural_style": "Modern Contemporary",
    "property_condition": "Excellent",
    "zoning": "R1-Luxury",
    "apn": "4387-028-019",
    "mls_number": "BH24287654",
    "subdivision": "Beverly Hills Platinum Estates",
    "cross_streets": "Rodeo Drive & Sunset Boulevard",
    "latitude": 34.0736204,
    "longitude": -118.4003687,
    "hoa_fee": 850,
    "hoa_frequency": "monthly",
    "hoa_name": "Beverly Hills Platinum HOA",
    "gated_community": true,
    "senior_community": false,
    "list_price": 4950000,
    "list_date": "2025-07-10",
    "days_on_market": 26,
    "previous_list_price": 5150000,
    "original_list_price": 5250000,
    "escrow_company": "Luxury Escrow Services Beverly Hills",
    "escrow_officer_name": "Victoria Goldstein",
    "escrow_officer_email": "vgoldstein@luxuryescrowbh.com",
    "escrow_officer_phone": "(310) 555-9876",
    "title_company": "First American Title - Premier Division",
    "lender_name": "JP Morgan Chase Private Banking",
    "loan_officer_name": "Alexander Hartford",
    "loan_officer_email": "ahartford@chase.com",
    "loan_officer_phone": "(310) 555-4321",
    "transaction_coordinator": "Michelle Rodriguez",
    "nhd_company": "Property Disclosure Experts Inc",
    "transaction_type": "Purchase",
    "lead_source": "Luxury Real Estate Network",
    "zillow_url": "https://www.zillow.com/homedetails/9876-Prestigious-Manor-Way-Beverly-Hills-CA-90210/98765432_zpid/",
    "property_image_url": "https://photos.zillowstatic.com/fp/47c0f9a76dc2d73ccd374e1cf1-cc_ft_1536.jpg",
    "avid": true,
    "referral_agent": "Patricia Anderson - Sothebys International",
    "timeline": {
      "acceptanceDate": "2025-08-05",
      "emdDate": "2025-08-08",
      "sellerDisclosuresDueDate": "2025-08-12",
      "homeInspectionDate": "2025-08-14",
      "termiteInspectionDate": "2025-08-15",
      "appraisalOrderedDate": "2025-08-10",
      "appraisalCompletedDate": "2025-08-20",
      "inspectionContingencyDate": "2025-08-21",
      "appraisalContingencyDate": "2025-08-27",
      "loanContingencyDate": "2025-09-05",
      "allContingenciesRemovalDate": "2025-09-06",
      "coeDate": "2025-09-25"
    },
    "people": {
      "buyer": {
        "name": "Jonathan & Elizabeth Whitmore",
        "email": "whitmore.family@privateemail.com",
        "phone": "(310) 555-1111",
        "address": "789 Current Estate Lane, Bel Air, CA 90077"
      },
      "buyerAgent": {
        "name": "Christopher Sterling",
        "email": "csterling@luxuryrealtybh.com",
        "phone": "(310) 555-2222",
        "company": "Luxury Realty Beverly Hills",
        "license": "CA DRE #01234567"
      },
      "seller": {
        "name": "Richard & Margaret Blackstone",
        "email": "blackstone@privateemail.com",
        "phone": "(310) 555-3333",
        "address": "9876 Prestigious Manor Way, Beverly Hills, CA 90210"
      },
      "sellerAgent": {
        "name": "Sophia Martinez",
        "email": "smartinez@christiesrealestate.com",
        "phone": "(310) 555-4444",
        "company": "Christies International Real Estate",
        "license": "CA DRE #02345678"
      },
      "escrowOfficer": {
        "name": "Victoria Goldstein",
        "email": "vgoldstein@luxuryescrowbh.com",
        "phone": "(310) 555-9876",
        "company": "Luxury Escrow Services Beverly Hills"
      },
      "titleOfficer": {
        "name": "James Wellington",
        "email": "jwellington@firstam.com",
        "phone": "(310) 555-5555",
        "company": "First American Title - Premier Division"
      },
      "loanOfficer": {
        "name": "Alexander Hartford",
        "email": "ahartford@chase.com",
        "phone": "(310) 555-4321",
        "company": "JP Morgan Chase Private Banking",
        "license": "NMLS #987654"
      },
      "homeInspector": {
        "name": "Robert Martinez",
        "email": "rmartinez@premiuminspections.com",
        "phone": "(310) 555-6666",
        "company": "Premium Property Inspections",
        "license": "CA HI License #789456"
      },
      "appraiser": {
        "name": "Jennifer Chen",
        "email": "jchen@luxuryappraisals.com",
        "phone": "(310) 555-7777",
        "company": "Luxury Property Appraisals LLC",
        "license": "CA Certified #456789"
      },
      "transactionCoordinator": {
        "name": "Michelle Rodriguez",
        "email": "mrodriguez@transactionpros.com",
        "phone": "(310) 555-8888",
        "company": "Transaction Professionals Inc"
      }
    },
    "checklists": {
      "loan": {
        "le": true,
        "lockedRate": false,
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
        "solarTransferInitiated": true,
        "avid": true,
        "homeInspectionReceived": false,
        "sellerDisclosures": true,
        "rr": false,
        "cr": false,
        "recorded": false
      },
      "admin": {
        "mlsStatusUpdate": true,
        "tcEmail": true,
        "tcGlideInvite": false,
        "addContactsToPhone": true,
        "addContactsToNotion": false
      }
    },
    "documents": [
      {
        "id": "doc_001",
        "name": "Purchase Agreement - Fully Executed",
        "type": "contract",
        "uploadedAt": "2025-08-05T14:30:00Z",
        "url": "https://example.com/docs/BH24287654-purchase-agreement.pdf"
      },
      {
        "id": "doc_002",
        "name": "Seller Property Disclosure Statement",
        "type": "disclosure",
        "uploadedAt": "2025-08-12T10:15:00Z",
        "url": "https://example.com/docs/BH24287654-seller-disclosures.pdf"
      },
      {
        "id": "doc_003",
        "name": "Natural Hazard Disclosure Report",
        "type": "disclosure",
        "uploadedAt": "2025-08-12T10:30:00Z",
        "url": "https://example.com/docs/BH24287654-nhd-report.pdf"
      },
      {
        "id": "doc_004",
        "name": "Preliminary Title Report",
        "type": "title",
        "uploadedAt": "2025-08-07T09:00:00Z",
        "url": "https://example.com/docs/BH24287654-prelim-title.pdf"
      },
      {
        "id": "doc_005",
        "name": "Loan Pre-Approval Letter",
        "type": "financing",
        "uploadedAt": "2025-08-01T16:45:00Z",
        "url": "https://example.com/docs/BH24287654-preapproval.pdf"
      },
      {
        "id": "doc_006",
        "name": "Home Inspection Report",
        "type": "inspection",
        "uploadedAt": "2025-08-14T17:30:00Z",
        "url": "https://example.com/docs/BH24287654-inspection.pdf"
      },
      {
        "id": "doc_007",
        "name": "Termite Inspection Report",
        "type": "inspection",
        "uploadedAt": "2025-08-15T14:00:00Z",
        "url": "https://example.com/docs/BH24287654-termite.pdf"
      },
      {
        "id": "doc_008",
        "name": "HOA Documents Package",
        "type": "hoa",
        "uploadedAt": "2025-08-10T11:00:00Z",
        "url": "https://example.com/docs/BH24287654-hoa-docs.pdf"
      }
    ]
  }')

echo "$RESPONSE" | python3 -m json.tool

# Extract the escrow ID if creation was successful
ESCROW_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', 'Not found') if data.get('success') else 'Creation failed')")

if [ "$ESCROW_ID" != "Not found" ] && [ "$ESCROW_ID" != "Creation failed" ]; then
    echo ""
    echo "✅ Comprehensive escrow created successfully!"
    echo "📋 Escrow ID: $ESCROW_ID"
    echo "🔗 View at: https://crm.jaydenmetz.com/escrows/$ESCROW_ID"
    echo ""
    echo "Features included:"
    echo "  ✓ All property details (6BR/7.5BA, 8,500 sqft)"
    echo "  ✓ Complete financial breakdown (\$4.75M purchase)"
    echo "  ✓ Full timeline with 12 milestone dates"
    echo "  ✓ 10 people/contacts with full details"
    echo "  ✓ Mixed checklist values (some true, some false)"
    echo "  ✓ 8 document attachments"
    echo "  ✓ Premium property features (pool, spa, ocean view)"
    echo "  ✓ HOA information (\$850/month)"
    echo "  ✓ Complete address with coordinates"
else
    echo ""
    echo "❌ Failed to create escrow. Check the response above for errors."
fi