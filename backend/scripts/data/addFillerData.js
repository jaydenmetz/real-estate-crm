const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/real_estate_crm'
});

async function addFillerData() {
  try {
    const escrowId = 'e4596000-6e64-4573-9d5b-a69ef33a8a53';
    
    const query = `
      UPDATE escrows 
      SET 
        -- Property Details
        property_address = '789 Pacific Coast Highway, Malibu, CA 90265',
        city = 'Malibu',
        state = 'CA',
        zip_code = '90265',
        county = 'Los Angeles County',
        property_type = 'Single Family Residence',
        bedrooms = 5,
        bathrooms = 4.5,
        square_feet = 4850,
        lot_size_sqft = 12500,
        year_built = 2018,
        stories = 2,
        garage_spaces = 3,
        pool = true,
        spa = true,
        view_type = 'Ocean View',
        architectural_style = 'Modern Contemporary',
        property_condition = 'Excellent',
        
        -- Transaction Details
        purchase_price = 3500000.00,
        list_price = 3750000.00,
        escrow_status = 'Active',
        
        -- People JSONB
        people = $1::jsonb,
        
        -- Timeline JSONB
        timeline = $2::jsonb,
        
        -- Financials JSONB
        financials = $3::jsonb,
        
        -- Checklists JSONB
        checklists = $4::jsonb,
        
        -- Documents JSONB
        documents = $5::jsonb,
        
        -- Additional fields
        notes = 'Luxury oceanfront property with motivated sellers. Buyers are well-qualified with 20% down payment. Fast close expected. Pool heater needs repair - seller credit of $5,000 agreed.',
        updated_at = NOW()
        
      WHERE id = $6
    `;
    
    const peopleData = {
      buyer: {
        name: 'Jonathan Mitchell',
        email: 'jmitchell@email.com',
        phone: '(310) 555-0123',
        address: '456 Sunset Blvd, Beverly Hills, CA 90210',
        company: 'Mitchell Enterprises LLC'
      },
      buyerAgent: {
        name: 'Sarah Chen',
        email: 'sarah.chen@luxuryrealty.com',
        phone: '(310) 555-0124',
        brokerage: 'Luxury Realty Group',
        license: 'DRE# 01234567',
        address: '123 Rodeo Drive, Beverly Hills, CA 90210'
      },
      seller: {
        name: 'Robert & Linda Thompson',
        email: 'thompson.family@email.com',
        phone: '(818) 555-0125',
        address: '789 Pacific Coast Highway, Malibu, CA 90265'
      },
      listingAgent: {
        name: 'Michael Rodriguez',
        email: 'mrodriguez@coastalestates.com',
        phone: '(310) 555-0126',
        brokerage: 'Coastal Estates Realty',
        license: 'DRE# 09876543',
        address: '500 Ocean Ave, Santa Monica, CA 90401'
      },
      transactionTeam: {
        escrowOfficer: {
          name: 'Patricia Williams',
          company: 'Premier Escrow Services',
          phone: '(323) 555-0127',
          email: 'pwilliams@premierescrow.com'
        },
        titleCompany: {
          name: 'First American Title',
          contact: 'David Lee',
          phone: '(323) 555-0128',
          email: 'dlee@firstam.com'
        },
        lenderContact: {
          name: 'Jennifer Park',
          company: 'Wells Fargo Home Mortgage',
          phone: '(888) 555-0129',
          email: 'jpark@wellsfargo.com'
        },
        inspector: {
          name: 'Tom Anderson',
          company: 'Precision Home Inspections',
          phone: '(562) 555-0130',
          email: 'tanderson@precisioninspect.com'
        },
        appraiser: {
          name: 'Maria Gonzalez',
          company: 'Certified Appraisal Services',
          phone: '(714) 555-0131',
          email: 'mgonzalez@certifiedappraisal.com'
        }
      }
    };
    
    const timelineData = {
      listingDate: '2025-01-10',
      offerDate: '2025-01-18',
      acceptanceDate: '2025-01-20',
      escrowOpenedDate: '2025-01-22',
      dueDiligenceDeadline: '2025-01-30',
      inspectionDate: '2025-01-25',
      inspectionContingencyRemoval: '2025-02-03',
      appraisalDate: '2025-01-28',
      appraisalContingencyRemoval: '2025-02-05',
      loanContingencyRemoval: '2025-02-15',
      finalWalkthrough: '2025-02-26',
      signingDate: '2025-02-27',
      fundingDate: '2025-02-28',
      recordingDate: '2025-02-28',
      possessionDate: '2025-03-01'
    };
    
    const financialsData = {
      purchasePrice: 3500000,
      downPayment: 700000,
      loanAmount: 2800000,
      earnestMoney: 105000,
      myCommissionRate: 2.5,
      totalCommissionRate: 5.0,
      totalCommission: 175000,
      grossCommission: 87500,
      splitPercentage: 75,
      splitTier: 3,
      myCommissionAfterSplit: 65625,
      franchiseFee: 4101.56,
      myNetCommission: 61523.44,
      ytdGciBeforeTransaction: 285000,
      ytdGciAfterTransaction: 372500,
      transactionType: 'Standard Sale',
      isZillowFlexReferral: false,
      buyerCredits: 15000,
      sellerCredits: 0,
      closingCosts: {
        titleInsurance: 8750,
        escrowFee: 4500,
        recordingFees: 850,
        transferTax: 3850,
        homeWarranty: 650
      }
    };
    
    const checklistsData = {
      'Pre-Contract': {
        'Property Listed on MLS': true,
        'Professional Photos Taken': true,
        'Virtual Tour Created': true,
        'Marketing Materials Prepared': true,
        'Open Houses Scheduled': true,
        'Seller Disclosures Obtained': true
      },
      'Contract to Close': {
        'Purchase Agreement Signed': true,
        'Earnest Money Deposited': true,
        'Escrow Opened': true,
        'Title Search Ordered': true,
        'Home Inspection Scheduled': true,
        'Appraisal Ordered': false,
        'Loan Application Submitted': false,
        'Insurance Quote Obtained': false
      },
      'Inspections': {
        'General Home Inspection': true,
        'Termite Inspection': true,
        'Roof Inspection': false,
        'Pool/Spa Inspection': false,
        'Sewer Line Inspection': false,
        'Chimney Inspection': false
      },
      'Contingencies': {
        'Inspection Contingency': true,
        'Appraisal Contingency': false,
        'Loan Contingency': false,
        'Sale of Buyer Property': false
      },
      'Closing Preparation': {
        'Final Walkthrough Scheduled': false,
        'Closing Statement Reviewed': false,
        'Wire Instructions Confirmed': false,
        'Keys and Codes Collected': false,
        'Utilities Transfer Arranged': false
      }
    };
    
    const documentsData = [
      {
        id: 'doc_001',
        name: 'Purchase Agreement - Fully Executed.pdf',
        documentType: 'Contract',
        size: '2.4 MB',
        uploadedAt: '2025-01-20T14:30:00Z',
        uploadedBy: 'Jayden Metz',
        url: '/documents/purchase-agreement.pdf'
      },
      {
        id: 'doc_002',
        name: 'Seller Property Disclosure.pdf',
        documentType: 'Disclosure',
        size: '1.8 MB',
        uploadedAt: '2025-01-15T10:15:00Z',
        uploadedBy: 'Michael Rodriguez',
        url: '/documents/seller-disclosure.pdf'
      },
      {
        id: 'doc_003',
        name: 'Earnest Money Receipt.pdf',
        documentType: 'Financial',
        size: '156 KB',
        uploadedAt: '2025-01-22T09:00:00Z',
        uploadedBy: 'Patricia Williams',
        url: '/documents/earnest-money.pdf'
      },
      {
        id: 'doc_004',
        name: 'Home Inspection Report.pdf',
        documentType: 'Inspection',
        size: '12.3 MB',
        uploadedAt: '2025-01-25T16:45:00Z',
        uploadedBy: 'Tom Anderson',
        url: '/documents/home-inspection.pdf'
      },
      {
        id: 'doc_005',
        name: 'Termite Inspection Report.pdf',
        documentType: 'Inspection',
        size: '3.2 MB',
        uploadedAt: '2025-01-26T11:30:00Z',
        uploadedBy: 'Jayden Metz',
        url: '/documents/termite-inspection.pdf'
      },
      {
        id: 'doc_006',
        name: 'Title Preliminary Report.pdf',
        documentType: 'Title',
        size: '5.6 MB',
        uploadedAt: '2025-01-24T13:20:00Z',
        uploadedBy: 'David Lee',
        url: '/documents/prelim-title.pdf'
      },
      {
        id: 'doc_007',
        name: 'Loan Pre-Approval Letter.pdf',
        documentType: 'Financial',
        size: '245 KB',
        uploadedAt: '2025-01-18T08:00:00Z',
        uploadedBy: 'Jennifer Park',
        url: '/documents/pre-approval.pdf'
      }
    ];
    
    const result = await pool.query(query, [
      JSON.stringify(peopleData),
      JSON.stringify(timelineData),
      JSON.stringify(financialsData),
      JSON.stringify(checklistsData),
      JSON.stringify(documentsData),
      escrowId
    ]);
    
    console.log('Filler data added successfully!');
    console.log('Rows affected:', result.rowCount);
    
  } catch (error) {
    console.error('Error adding filler data:', error);
  } finally {
    await pool.end();
  }
}

addFillerData();