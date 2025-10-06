const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

// Real escrow data
const escrows = [
  {
    propertyAddress: '9602 Cecilia St, San Francisco, CA 94110',
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
        loanFunded: true,
      },
      house: {
        homeInspectionOrdered: true,
        emd: true,
        solarTransferInitiated: true,
        avid: true,
        homeInspectionReceived: true,
        sellerDisclosures: true,
        rr: true,
        recorded: true,
      },
      admin: {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: true,
        addContactsToPhone: false,
        addContactsToNotion: false,
      },
    },
  },
  {
    propertyAddress: '13720 Colorado Ln, San Francisco, CA 94110',
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
        loanFunded: true,
      },
      house: {
        homeInspectionOrdered: true,
        emd: true,
        solarTransferInitiated: true,
        avid: true,
        homeInspectionReceived: true,
        sellerDisclosures: true,
        rr: true,
        recorded: true,
      },
      admin: {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: true,
        addContactsToPhone: false,
        addContactsToNotion: false,
      },
    },
  },
  {
    propertyAddress: '5609 Monitor St, San Francisco, CA 94110',
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
        loanFunded: true,
      },
      house: {
        homeInspectionOrdered: true,
        emd: true,
        solarTransferInitiated: true,
        avid: true,
        homeInspectionReceived: true,
        sellerDisclosures: true,
        rr: true,
        recorded: true,
      },
      admin: {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: true,
        addContactsToPhone: true,
        addContactsToNotion: true,
      },
    },
  },
  {
    propertyAddress: '313 Darling Point Dr, San Francisco, CA 94110',
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
        loanFunded: false,
      },
      house: {
        homeInspectionOrdered: true,
        emd: true,
        solarTransferInitiated: true,
        avid: true,
        homeInspectionReceived: true,
        sellerDisclosures: true,
        rr: true,
        recorded: false,
      },
      admin: {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: true,
        addContactsToPhone: false,
        addContactsToNotion: false,
      },
    },
  },
  {
    propertyAddress: '9753 Sunglow St, San Francisco, CA 94110',
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
        loanFunded: false,
      },
      house: {
        homeInspectionOrdered: false,
        emd: false,
        solarTransferInitiated: false,
        avid: false,
        homeInspectionReceived: false,
        sellerDisclosures: false,
        rr: false,
        recorded: false,
      },
      admin: {
        mlsStatusUpdate: false,
        tcEmail: false,
        tcGlideInvite: false,
        addContactsToPhone: false,
        addContactsToNotion: false,
      },
    },
  },
  {
    propertyAddress: '5609 Monitor St #2, San Francisco, CA 94110',
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
        loanFunded: false,
      },
      house: {
        homeInspectionOrdered: true,
        emd: true,
        solarTransferInitiated: true,
        avid: true,
        homeInspectionReceived: true,
        sellerDisclosures: true,
        rr: true,
        recorded: false,
      },
      admin: {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: true,
        addContactsToPhone: false,
        addContactsToNotion: false,
      },
    },
  },
];

async function importEscrows() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Connected to database');

    // Begin transaction
    await pool.query('BEGIN');

    // Delete existing test escrows (be careful with this in production!)
    console.log('Deleting existing test escrows...');
    const deleteResult = await pool.query('DELETE FROM escrows WHERE created_at < NOW()');
    console.log(`Deleted ${deleteResult.rowCount} existing escrows`);

    // Insert new escrows
    console.log('Inserting real escrow data...');

    for (let i = 0; i < escrows.length; i++) {
      const escrow = escrows[i];

      // Build people object
      const people = {
        buyers: escrow.clients,
        buyersAgent: escrow.buyersAgent + (escrow.additionalBuyersAgent ? `, ${escrow.additionalBuyersAgent}` : ''),
        listingAgent: escrow.listingAgent + (escrow.additionalListingAgent ? `, ${escrow.additionalListingAgent}` : ''),
        loanOfficer: escrow.loanOfficer,
        escrowOfficer: escrow.escrowOfficer,
        transactionCoordinator: escrow.transactionCoordinator,
        homeInspectionCompany: escrow.homeInspectionCompany,
        termiteInspectionCompany: escrow.termiteInspectionCompany,
        homeWarrantyCompany: escrow.homeWarrantyCompany,
        nhdCompany: escrow.nhdCompany,
      };

      // Build timeline object
      const timeline = {
        acceptanceDate: escrow.acceptanceDate,
        emdDate: escrow.emdDate,
        contingenciesDate: escrow.contingenciesDate,
        scheduledCoeDate: escrow.scheduledCoeDate,
        actualCoeDate: escrow.escrowStatus === 'closed' ? escrow.coeDate : null,
      };

      // Build financials object
      const financials = {
        purchasePrice: escrow.purchasePrice,
        commissionPercent: escrow.commissionPercent,
        grossCommission: escrow.grossCommission,
        myCommission: escrow.myCommission,
        commissionAdjustments: escrow.commissionAdjustments || 0,
        expenseAdjustments: escrow.expenseAdjustments || 0,
        leadSource: escrow.leadSource,
      };

      // Build expenses array
      const expensesArray = escrow.expenses ? escrow.expenses.map((exp) => ({
        description: exp,
        amount: 0,
        paid: false,
      })) : [];

      // Insert escrow with minimal required fields
      const result = await pool.query(`
        INSERT INTO escrows (
          property_address,
          property_type,
          transaction_type,
          escrow_status,
          opening_date,
          closing_date,
          purchase_price,
          earnest_money,
          commission_percentage,
          gross_commission,
          my_commission,
          commission_adjustments,
          expense_adjustments,
          people,
          timeline,
          financials,
          checklists,
          expenses,
          lead_source,
          transaction_coordinator,
          escrow_officer_name,
          loan_officer_name,
          nhd_company,
          home_warranty_company,
          termite_inspection_company,
          home_inspection_company,
          acceptance_date,
          contingencies_date,
          emd_date,
          actual_coe_date,
          avid,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25,
          $26, $27, $28, $29, $30, $31, NOW(), NOW()
        )
        RETURNING id, display_id
      `, [
        escrow.propertyAddress,
        'Single Family Home',
        'Purchase',
        escrow.escrowStatus,
        escrow.acceptanceDate,
        escrow.scheduledCoeDate,
        escrow.purchasePrice,
        25000, // Default earnest money
        escrow.commissionPercent,
        escrow.grossCommission,
        escrow.myCommission,
        escrow.commissionAdjustments || 0,
        escrow.expenseAdjustments || 0,
        JSON.stringify(people),
        JSON.stringify(timeline),
        JSON.stringify(financials),
        JSON.stringify(escrow.checklists),
        JSON.stringify(expensesArray),
        escrow.leadSource,
        escrow.transactionCoordinator,
        escrow.escrowOfficer,
        escrow.loanOfficer,
        escrow.nhdCompany,
        escrow.homeWarrantyCompany,
        escrow.termiteInspectionCompany,
        escrow.homeInspectionCompany,
        escrow.acceptanceDate,
        escrow.contingenciesDate,
        escrow.emdDate,
        escrow.escrowStatus === 'closed' ? escrow.coeDate : null,
        escrow.checklists.house.avid || false,
      ]);

      console.log(`Created escrow ${result.rows[0].display_id} for ${escrow.propertyAddress}`);
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

// Run for production environment only (local already succeeded)
async function runImport() {
  try {
    // Import to production
    console.log('\n=== Importing to PRODUCTION database ===');
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway';
    await importEscrows();

    console.log('\n✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

runImport();
