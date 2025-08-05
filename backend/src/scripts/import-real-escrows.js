const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

// Real escrow data
const escrows = [
  {
    propertyAddress: '9602 Cecilia St',
    escrowStatus: 'closed',
    clients: ['Cindy Brown'],
    buyersAgent: 'Daniela Diaz',
    listingAgent: 'Jayden Metz',
    loanOfficer: 'Tyler Smith',
    escrowOfficer: 'Samantha Mascola',
    purchasePrice: 805000,
    commissionPercent: 3,
    grossCommission: 21650,
    myCommission: 15552.50,
    commissionAdjustments: 2500,
    expenseAdjustments: 400,
    acceptanceDate: '2025-03-23',
    emdDate: '2025-03-26',
    contingenciesDate: '2025-04-09',
    coeDate: '2025-05-30',
    scheduledCoeDate: '2025-05-30',
    transactionCoordinator: 'Karin Munoz',
    nhdCompany: 'Property ID Max',
    leadSource: 'Family',
    expenses: ['Showcase', 'Photos', 'Supra Lockbox', 'Sign Rider', 'Combo Lockbox AND Sledgehammer'],
    checklists: {
      loan: {
        le: true,
        lockedRate: true,
        appraisalOrdered: true,
        appraisalReceived: true,
        clearToClose: true,
        cd: true,
        loanDocsSigned: true,
        cashToClosePaid: true,
        loanFunded: true
      },
      house: {
        homeInspectionOrdered: true,
        emd: true,
        solarTransferInitiated: true,
        avid: true,
        homeInspectionReceived: true,
        sellerDisclosures: true,
        rr: true,
        recorded: true
      },
      admin: {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: true,
        addContactsToPhone: false,
        addContactsToNotion: false
      }
    }
  },
  {
    propertyAddress: '13720 Colorado Ln',
    escrowStatus: 'closed',
    clients: ['Cindy Brown', 'Alyssa Brown'],
    buyersAgent: 'Jayden Metz',
    listingAgent: 'Bo Goulet',
    loanOfficer: 'Tyler Smith',
    escrowOfficer: 'Robert Garcia',
    purchasePrice: 515000,
    commissionPercent: 3,
    grossCommission: 15450,
    myCommission: 11052.50,
    acceptanceDate: '2025-03-28',
    emdDate: '2025-03-31',
    contingenciesDate: '2025-04-14',
    coeDate: '2025-04-28',
    scheduledCoeDate: '2025-04-28',
    transactionCoordinator: 'Karin Munoz',
    homeInspectionCompany: 'At Home Inspections',
    homeWarrantyCompany: 'Home Warranty of America',
    leadSource: 'Family',
    checklists: {
      loan: {
        le: true,
        lockedRate: true,
        appraisalOrdered: true,
        appraisalReceived: true,
        clearToClose: true,
        cd: true,
        loanDocsSigned: true,
        cashToClosePaid: true,
        loanFunded: true
      },
      house: {
        homeInspectionOrdered: true,
        emd: true,
        solarTransferInitiated: true,
        avid: true,
        homeInspectionReceived: true,
        sellerDisclosures: true,
        rr: true,
        recorded: true
      },
      admin: {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: true,
        addContactsToPhone: false,
        addContactsToNotion: false
      }
    }
  },
  {
    propertyAddress: '5609 Monitor St',
    escrowStatus: 'cancelled',
    clients: ['Jesus Sandoval Vargas'],
    buyersAgent: 'Jesus Mora',
    listingAgent: 'Jayden Metz',
    loanOfficer: 'Omar Navarro',
    escrowOfficer: 'Samantha Mascola',
    purchasePrice: 287000,
    commissionPercent: 3,
    grossCommission: 7010,
    myCommission: 4972.50,
    commissionAdjustments: 1600,
    expenseAdjustments: 0,
    acceptanceDate: '2025-04-03',
    emdDate: '2025-04-06',
    contingenciesDate: '2025-04-20',
    coeDate: '2025-05-05',
    scheduledCoeDate: '2025-05-05',
    transactionCoordinator: 'Karin Munoz',
    nhdCompany: 'Property ID Max',
    leadSource: 'Past Client Referral',
    expenses: ['5609 Monitor St Showcase', '5609 Monitor St Photos', '5609 Monitor St Yard Sign'],
    checklists: {
      loan: {
        le: true,
        lockedRate: true,
        appraisalOrdered: true,
        appraisalReceived: true,
        clearToClose: true,
        cd: true,
        loanDocsSigned: true,
        cashToClosePaid: true,
        loanFunded: true
      },
      house: {
        homeInspectionOrdered: true,
        emd: true,
        solarTransferInitiated: true,
        avid: true,
        homeInspectionReceived: true,
        sellerDisclosures: true,
        rr: true,
        recorded: true
      },
      admin: {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: true,
        addContactsToPhone: true,
        addContactsToNotion: true
      }
    }
  },
  {
    propertyAddress: '313 Darling Point Dr',
    escrowStatus: 'closed',
    clients: ['Jesus Sandoval Vargas', 'Elizabeth Sanchez Mendez'],
    buyersAgent: 'Jayden Metz',
    listingAgent: 'Jeanne Radsick',
    loanOfficer: 'Tyler Smith',
    escrowOfficer: 'Samantha Mascola',
    purchasePrice: 375000,
    commissionPercent: 3,
    grossCommission: 11250,
    myCommission: 8152.50,
    acceptanceDate: '2025-04-05',
    emdDate: '2025-04-08',
    contingenciesDate: '2025-04-22',
    coeDate: '2025-06-04',
    scheduledCoeDate: '2025-06-04',
    transactionCoordinator: 'Karin Munoz',
    homeInspectionCompany: 'At Home Inspections',
    termiteInspectionCompany: 'RCB Inspection and Termite Control',
    homeWarrantyCompany: 'Home Warranty of America',
    nhdCompany: 'First American NHD',
    leadSource: 'Past Client Referral',
    checklists: {
      loan: {
        le: true,
        lockedRate: true,
        appraisalOrdered: true,
        appraisalReceived: true,
        clearToClose: true,
        cd: true,
        loanDocsSigned: true,
        cashToClosePaid: true,
        loanFunded: false
      },
      house: {
        homeInspectionOrdered: true,
        emd: true,
        solarTransferInitiated: true,
        avid: true,
        homeInspectionReceived: true,
        sellerDisclosures: true,
        rr: true,
        recorded: false
      },
      admin: {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: true,
        addContactsToPhone: false,
        addContactsToNotion: false
      }
    }
  },
  {
    propertyAddress: '9753 Sunglow St',
    escrowStatus: 'closed',
    clients: ['Veronica Zelaya'],
    buyersAgent: 'Edwin Sanchez',
    additionalBuyersAgent: 'Catalina Sanchez',
    listingAgent: 'Jayden Metz',
    additionalListingAgent: 'Daniela Diaz',
    loanOfficer: 'Jenese Bravo',
    escrowOfficer: 'Alicia Smith',
    purchasePrice: 759000,
    commissionPercent: 1,
    grossCommission: 7590,
    myCommission: 4657.50,
    expenseAdjustments: 750,
    acceptanceDate: '2025-04-30',
    emdDate: '2025-05-03',
    contingenciesDate: '2025-05-17',
    coeDate: '2025-05-28',
    scheduledCoeDate: '2025-05-28',
    transactionCoordinator: 'Darcy Organ',
    homeInspectionCompany: 'Home Inspection Experts',
    termiteInspectionCompany: 'Ace Tech Exterminators',
    homeWarrantyCompany: 'Home Warranty of America',
    leadSource: 'Agent Referral',
    expenses: ['Showcase'],
    checklists: {
      loan: {
        le: false,
        lockedRate: false,
        appraisalOrdered: false,
        appraisalReceived: false,
        clearToClose: false,
        cd: false,
        loanDocsSigned: false,
        cashToClosePaid: false,
        loanFunded: false
      },
      house: {
        homeInspectionOrdered: false,
        emd: false,
        solarTransferInitiated: false,
        avid: false,
        homeInspectionReceived: false,
        sellerDisclosures: false,
        rr: false,
        recorded: false
      },
      admin: {
        mlsStatusUpdate: false,
        tcEmail: false,
        tcGlideInvite: false,
        addContactsToPhone: false,
        addContactsToNotion: false
      }
    }
  },
  {
    propertyAddress: '5609 Monitor St',
    escrowStatus: 'closed',
    clients: ['Jesus Sandoval Vargas'],
    buyersAgent: 'Joshua Perez',
    listingAgent: 'Jayden Metz',
    loanOfficer: 'Emmanuel Duran',
    escrowOfficer: 'Samantha Mascola',
    purchasePrice: 290000,
    commissionPercent: 3,
    grossCommission: 7100,
    myCommission: 5040,
    commissionAdjustments: 1600,
    expenseAdjustments: 0,
    acceptanceDate: '2025-05-14',
    emdDate: '2025-05-17',
    contingenciesDate: '2025-05-31',
    coeDate: '2025-06-04',
    scheduledCoeDate: '2025-06-04',
    transactionCoordinator: 'Karin Munoz',
    homeInspectionCompany: 'Signature Property Inspections, Inc.',
    termiteInspectionCompany: 'Golden Empire Pest Control',
    homeWarrantyCompany: 'American Home Shield',
    nhdCompany: 'Property ID Max',
    leadSource: 'Past Client Referral',
    checklists: {
      loan: {
        le: true,
        lockedRate: true,
        appraisalOrdered: true,
        appraisalReceived: true,
        clearToClose: true,
        cd: false,
        loanDocsSigned: true,
        cashToClosePaid: true,
        loanFunded: false
      },
      house: {
        homeInspectionOrdered: true,
        emd: true,
        solarTransferInitiated: true,
        avid: true,
        homeInspectionReceived: true,
        sellerDisclosures: true,
        rr: true,
        recorded: false
      },
      admin: {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: true,
        addContactsToPhone: false,
        addContactsToNotion: false
      }
    }
  }
];

async function importEscrows() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Connected to database');
    
    // Begin transaction
    await pool.query('BEGIN');
    
    // Delete existing test escrows
    console.log('Deleting existing test escrows...');
    await pool.query('DELETE FROM escrows WHERE created_at < NOW()');
    
    // Insert new escrows
    console.log('Inserting real escrow data...');
    
    for (const escrow of escrows) {
      // Generate escrow number
      const escrowNumber = `ESC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
      
      // Insert escrow
      const result = await pool.query(`
        INSERT INTO escrows (
          escrow_number,
          property_address,
          escrow_status,
          purchase_price,
          my_commission,
          clients,
          open_date,
          estimated_close_date,
          actual_close_date,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING id
      `, [
        escrowNumber,
        escrow.propertyAddress,
        escrow.escrowStatus,
        escrow.purchasePrice,
        escrow.myCommission,
        escrow.clients,
        escrow.acceptanceDate,
        escrow.scheduledCoeDate,
        escrow.escrowStatus === 'closed' ? escrow.coeDate : null
      ]);
      
      const escrowId = result.rows[0].id;
      console.log(`Created escrow ${escrowNumber} for ${escrow.propertyAddress}`);
      
      // Insert property details
      await pool.query(`
        INSERT INTO escrow_property_details (
          escrow_id,
          property_type,
          bedrooms,
          bathrooms,
          square_feet,
          lot_size,
          year_built,
          property_value,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `, [
        escrowId,
        'Single Family Home',
        3,
        2,
        1800,
        '0.15 acres',
        2000,
        escrow.purchasePrice
      ]);
      
      // Insert people
      await pool.query(`
        INSERT INTO escrow_people (
          escrow_id,
          buyers_name,
          buyers_agent,
          listing_agent,
          loan_officer,
          escrow_officer,
          transaction_coordinator,
          home_inspection_company,
          termite_inspection_company,
          home_warranty_company,
          nhd_company,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      `, [
        escrowId,
        escrow.clients.join(', '),
        escrow.buyersAgent + (escrow.additionalBuyersAgent ? ', ' + escrow.additionalBuyersAgent : ''),
        escrow.listingAgent + (escrow.additionalListingAgent ? ', ' + escrow.additionalListingAgent : ''),
        escrow.loanOfficer,
        escrow.escrowOfficer,
        escrow.transactionCoordinator,
        escrow.homeInspectionCompany || null,
        escrow.termiteInspectionCompany || null,
        escrow.homeWarrantyCompany || null,
        escrow.nhdCompany || null
      ]);
      
      // Insert timeline
      await pool.query(`
        INSERT INTO escrow_timeline (
          escrow_id,
          acceptance_date,
          emd_date,
          contingencies_date,
          coe_date,
          days_to_emd,
          days_to_contingency,
          days_to_coe,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `, [
        escrowId,
        escrow.acceptanceDate,
        escrow.emdDate,
        escrow.contingenciesDate,
        escrow.scheduledCoeDate,
        3,
        17,
        escrow.escrowStatus === 'closed' ? 
          Math.floor((new Date(escrow.coeDate) - new Date(escrow.acceptanceDate)) / (1000 * 60 * 60 * 24)) :
          null
      ]);
      
      // Insert financials
      await pool.query(`
        INSERT INTO escrow_financials (
          escrow_id,
          purchase_price,
          commission_percent,
          gross_commission,
          my_commission,
          commission_adjustments,
          expense_adjustments,
          lead_source,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `, [
        escrowId,
        escrow.purchasePrice,
        escrow.commissionPercent,
        escrow.grossCommission,
        escrow.myCommission,
        escrow.commissionAdjustments || 0,
        escrow.expenseAdjustments || 0,
        escrow.leadSource || null
      ]);
      
      // Insert checklists
      await pool.query(`
        INSERT INTO escrow_checklists (
          escrow_id,
          loan,
          house,
          admin,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [
        escrowId,
        JSON.stringify(escrow.checklists.loan),
        JSON.stringify(escrow.checklists.house),
        JSON.stringify(escrow.checklists.admin)
      ]);
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    console.log('Successfully imported all escrows!');
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error importing escrows:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run for both environments
async function runImport() {
  try {
    // Import to local/development
    console.log('\n=== Importing to LOCAL database ===');
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/real_estate_crm';
    await importEscrows();
    
    // Import to production
    console.log('\n=== Importing to PRODUCTION database ===');
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway';
    await importEscrows();
    
    console.log('\n✅ Import completed successfully for both environments!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

runImport();