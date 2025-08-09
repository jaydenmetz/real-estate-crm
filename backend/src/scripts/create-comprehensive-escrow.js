require('dotenv').config({ path: '.env.production' });

// API configuration
const API_URL = 'https://api.jaydenmetz.com/v1';
const JWT_TOKEN = process.env.TEST_JWT_TOKEN || 'YOUR_JWT_TOKEN';

// Generate random boolean for checkboxes
const randomBool = () => Math.random() > 0.5;

// Generate random selection from array
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate comprehensive test escrow data
const comprehensiveEscrowData = {
  // Required field
  property_address: '1234 Luxury Estate Drive',
  
  // Location details
  city: 'Beverly Hills',
  state: 'CA',
  zip_code: '90210',
  county: 'Los Angeles',
  
  // Financial details
  purchase_price: 3500000,
  earnest_money_deposit: 175000,
  down_payment: 700000,
  loan_amount: 2800000,
  commission_percentage: 2.5,
  gross_commission: 87500,
  net_commission: 61250,
  my_commission: 43750,
  commission_adjustments: -5000,
  expense_adjustments: -2500,
  
  // Status and dates
  escrow_status: 'Active',
  acceptance_date: '2025-08-01',
  closing_date: '2025-09-15',
  actual_coe_date: null,
  
  // Property specifications
  property_type: randomFrom(['Single Family', 'Condo', 'Townhouse', 'Multi-Family']),
  bedrooms: 5,
  bathrooms: 4.5,
  square_feet: 4800,
  lot_size_sqft: 12000,
  year_built: 2019,
  garage_spaces: 3,
  stories: 2,
  pool: randomBool(),
  spa: randomBool(),
  view_type: randomFrom(['Ocean', 'Mountain', 'City', 'Golf Course', null]),
  architectural_style: randomFrom(['Modern', 'Mediterranean', 'Colonial', 'Contemporary']),
  property_condition: randomFrom(['Excellent', 'Good', 'Fair', 'Needs Work']),
  zoning: 'R1',
  apn: '4356-024-017',
  mls_number: 'ML24195847',
  subdivision: 'Beverly Hills Estates',
  cross_streets: 'Sunset Blvd & Rodeo Dr',
  latitude: 34.0736,
  longitude: -118.4004,
  
  // HOA Information
  hoa_fee: 450,
  hoa_frequency: 'monthly',
  hoa_name: 'Beverly Hills Estates HOA',
  gated_community: randomBool(),
  senior_community: false,
  
  // Listing information
  list_price: 3650000,
  list_date: '2025-07-15',
  days_on_market: 17,
  previous_list_price: 3750000,
  original_list_price: 3800000,
  
  // Companies and officers
  escrow_company: 'Premier Escrow Services of Beverly Hills',
  escrow_officer_name: 'Elizabeth Sterling',
  escrow_officer_email: 'elizabeth@premierescrowbh.com',
  escrow_officer_phone: '(310) 555-1234',
  title_company: 'First American Title Insurance',
  lender_name: 'Wells Fargo Home Mortgage',
  loan_officer_name: 'Michael Thompson',
  loan_officer_email: 'mthompson@wellsfargo.com',
  loan_officer_phone: '(310) 555-5678',
  
  // Additional people
  transaction_coordinator: 'Sarah Martinez',
  nhd_company: 'Property ID Corporation',
  
  // Transaction details
  transaction_type: 'Purchase',
  lead_source: randomFrom(['Zillow', 'Referral', 'Open House', 'Past Client', 'MLS', 'Social Media']),
  
  // Property features as JSON
  property_features: {
    interior: ['Hardwood Floors', 'Granite Counters', 'Stainless Appliances', 'Walk-in Closet'],
    exterior: ['Pool/Spa', 'BBQ Area', 'Covered Patio', 'Mature Landscaping'],
    amenities: ['Security System', 'Smart Home', 'Solar Panels', 'EV Charger']
  },
  
  // Property images array
  property_images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200'
  ],
  
  // Zillow integration
  zillow_url: 'https://www.zillow.com/homedetails/1234-Luxury-Estate-Dr-Beverly-Hills-CA-90210/12345678_zpid/',
  property_image_url: 'https://photos.zillowstatic.com/fp/luxury-estate-beverly-hills.jpg',
  
  // Timeline dates
  timeline: {
    acceptanceDate: '2025-08-01',
    emdDate: '2025-08-04',
    sellerDisclosuresDueDate: '2025-08-08',
    homeInspectionDate: '2025-08-10',
    termiteInspectionDate: '2025-08-11',
    appraisalDate: '2025-08-15',
    inspectionContingencyDate: '2025-08-17',
    appraisalContingencyDate: '2025-08-22',
    loanContingencyDate: '2025-08-29',
    allContingenciesRemovalDate: '2025-08-30',
    coeDate: '2025-09-15'
  },
  
  // Financials breakdown
  financials: {
    purchasePrice: 3500000,
    baseCommission: 87500,
    grossCommission: 87500,
    grossCommissionFees: 8750,
    grossReferralFee: 8750,
    grossReferralFeePercentage: 10,
    adjustedGross: 78750,
    netCommission: 61250,
    dealExpense: 5468.75,
    franchiseFees: 5468.75,
    franchiseFeePercentage: 6.25,
    dealNet: 55781.25,
    agentGCI: 55781.25,
    splitPercentage: 80,
    agentSplit: 44625,
    agentReferralFee: 0,
    agentReferralFeePercentage: 0,
    transactionFee: 395,
    tcFee: 250,
    agent1099Income: 43980,
    excessPayment: 43980,
    agentNet: 43980,
    commissionPercentage: 2.5,
    commissionAdjustments: -5000,
    expenseAdjustments: -2500,
    leadSource: 'Zillow Premier Agent',
    referralAgent: 'John Peterson - Keller Williams'
  },
  
  // People with full details
  people: {
    buyer: {
      name: 'Robert & Jennifer Chen',
      email: 'rjchen@email.com',
      phone: '(310) 555-8901',
      address: '456 Current Residence St, Los Angeles, CA 90024'
    },
    buyerAgent: {
      name: 'David Richardson',
      email: 'drichardson@remax.com',
      phone: '(310) 555-3456',
      company: 'RE/MAX Beverly Hills',
      license: 'CA DRE #01987654'
    },
    seller: {
      name: 'Michael & Susan Thompson',
      email: 'thompson.family@email.com',
      phone: '(310) 555-7890',
      address: '1234 Luxury Estate Drive, Beverly Hills, CA 90210'
    },
    sellerAgent: {
      name: 'Amanda Williams',
      email: 'awilliams@compass.com',
      phone: '(310) 555-2345',
      company: 'Compass Real Estate',
      license: 'CA DRE #02134567'
    },
    escrowOfficer: {
      name: 'Elizabeth Sterling',
      email: 'elizabeth@premierescrowbh.com',
      phone: '(310) 555-1234',
      company: 'Premier Escrow Services'
    },
    titleOfficer: {
      name: 'Thomas Anderson',
      email: 'tanderson@firstam.com',
      phone: '(310) 555-4567',
      company: 'First American Title'
    },
    loanOfficer: {
      name: 'Michael Thompson',
      email: 'mthompson@wellsfargo.com',
      phone: '(310) 555-5678',
      company: 'Wells Fargo Home Mortgage',
      license: 'NMLS #789012'
    },
    homeInspector: {
      name: 'James Martinez',
      email: 'jmartinez@homeinspectionpro.com',
      phone: '(310) 555-6789',
      company: 'Home Inspection Professionals',
      license: 'CA HI License #456789'
    },
    appraiser: {
      name: 'Patricia Lee',
      email: 'plee@appraisalexperts.com',
      phone: '(310) 555-7891',
      company: 'Appraisal Experts Inc',
      license: 'CA Certified #321654'
    },
    transactionCoordinator: {
      name: 'Sarah Martinez',
      email: 'smartinez@tcservices.com',
      phone: '(310) 555-8912',
      company: 'TC Services LLC'
    }
  },
  
  // Checklists with random true/false values
  checklists: {
    loan: {
      le: randomBool(),
      lockedRate: randomBool(),
      appraisalOrdered: randomBool(),
      appraisalReceived: randomBool(),
      clearToClose: randomBool(),
      cd: randomBool(),
      loanDocsSigned: randomBool(),
      cashToClosePaid: randomBool(),
      loanFunded: randomBool()
    },
    house: {
      homeInspectionOrdered: randomBool(),
      emd: randomBool(),
      solarTransferInitiated: randomBool(),
      avid: randomBool(),
      homeInspectionReceived: randomBool(),
      sellerDisclosures: randomBool(),
      rr: randomBool(),
      cr: randomBool(),
      recorded: randomBool()
    },
    admin: {
      mlsStatusUpdate: randomBool(),
      tcEmail: randomBool(),
      tcGlideInvite: randomBool(),
      addContactsToPhone: randomBool(),
      addContactsToNotion: randomBool()
    }
  },
  
  // Documents
  documents: [
    {
      id: 'doc_001',
      name: 'Purchase Agreement - Fully Executed',
      type: 'contract',
      uploadedAt: '2025-08-01T10:30:00Z',
      url: 'https://example.com/docs/purchase-agreement.pdf'
    },
    {
      id: 'doc_002',
      name: 'Seller Disclosure Package',
      type: 'disclosure',
      uploadedAt: '2025-08-08T14:15:00Z',
      url: 'https://example.com/docs/seller-disclosures.pdf'
    },
    {
      id: 'doc_003',
      name: 'Home Inspection Report',
      type: 'inspection',
      uploadedAt: '2025-08-10T16:45:00Z',
      url: 'https://example.com/docs/home-inspection.pdf'
    },
    {
      id: 'doc_004',
      name: 'Preliminary Title Report',
      type: 'title',
      uploadedAt: '2025-08-05T09:00:00Z',
      url: 'https://example.com/docs/preliminary-title.pdf'
    },
    {
      id: 'doc_005',
      name: 'Loan Pre-Approval Letter',
      type: 'financing',
      uploadedAt: '2025-07-28T11:30:00Z',
      url: 'https://example.com/docs/pre-approval.pdf'
    }
  ],
  
  // Expenses tracking
  expenses: [
    {
      id: 'exp_001',
      description: 'Home Warranty',
      amount: 575,
      type: 'warranty',
      paidBy: 'seller'
    },
    {
      id: 'exp_002',
      description: 'Transaction Coordinator Fee',
      amount: 250,
      type: 'service',
      paidBy: 'agent'
    },
    {
      id: 'exp_003',
      description: 'Marketing Materials',
      amount: 150,
      type: 'marketing',
      paidBy: 'agent'
    }
  ]
};

async function createComprehensiveEscrow() {
  console.log('Creating comprehensive escrow with all fields...');
  console.log('Checklist values (randomized):');
  console.log('Loan:', comprehensiveEscrowData.checklists.loan);
  console.log('House:', comprehensiveEscrowData.checklists.house);
  console.log('Admin:', comprehensiveEscrowData.checklists.admin);
  
  try {
    const response = await fetch(`${API_URL}/escrows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comprehensiveEscrowData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Escrow created successfully!');
      console.log('Escrow ID:', data.data.id);
      console.log('Display ID:', data.data.displayId);
      console.log('\nView the escrow at:');
      console.log(`https://crm.jaydenmetz.com/escrows/${data.data.id}`);
      
      // Fetch and display the created escrow
      const getResponse = await fetch(`${API_URL}/escrows/${data.data.id}`, {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`
        }
      });
      
      const escrowData = await getResponse.json();
      if (escrowData.success) {
        console.log('\n📋 Created Escrow Summary:');
        console.log(JSON.stringify(escrowData.data, null, 2));
      }
    } else {
      console.error('❌ Failed to create escrow:', data.error);
    }
  } catch (error) {
    console.error('❌ Error creating escrow:', error.message);
  }
}

// Run the script
createComprehensiveEscrow();