const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorLogging');

// Cache for schema detection
let schemaInfo = null;

// Clear schema cache on startup to ensure fresh detection
if (process.env.NODE_ENV === 'production') {
  schemaInfo = null;
}

// Helper function to detect database schema
async function detectSchema() {
  if (schemaInfo) return schemaInfo;
  
  try {
    // Check what columns exist in the escrows table
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'escrows' 
      AND column_name IN ('id', 'numeric_id', 'team_sequence_id', 'net_commission', 'my_commission', 'acceptance_date', 'buyer_side_commission', 'opening_date', 'uuid')
    `);
    
    const columns = result.rows.map(row => row.column_name);
    schemaInfo = {
      hasId: columns.includes('id'),
      hasNumericId: columns.includes('numeric_id'),
      hasTeamSequenceId: columns.includes('team_sequence_id'),
      hasNetCommission: columns.includes('net_commission'),
      hasMyCommission: columns.includes('my_commission'),
      hasAcceptanceDate: columns.includes('acceptance_date'),
      hasBuyerSideCommission: columns.includes('buyer_side_commission'),
      hasOpeningDate: columns.includes('opening_date'),
      hasUuid: columns.includes('uuid')
    };
    
    console.log('Detected schema columns:', columns);
    console.log('Schema info:', schemaInfo);
    return schemaInfo;
  } catch (error) {
    console.error('Schema detection error:', error);
    // Default to production schema if detection fails
    schemaInfo = {
      hasId: true,  // Production should have id column
      hasNumericId: true,
      hasTeamSequenceId: true,
      hasNetCommission: true,
      hasAcceptanceDate: true,
      hasBuyerSideCommission: false,
      hasOpeningDate: false,
      hasUuid: false
    };
    return schemaInfo;
  }
}

class SimpleEscrowController {
  /**
   * Get all escrows with buyers and sellers for list view
   */
  static async getAllEscrows(req, res) {
    try {
      console.log('\n=== getAllEscrows called ===');
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Database URL exists:', !!process.env.DATABASE_URL);
      const {
        page = 1,
        limit = 20,
        status,
        sort = 'created_at',
        order = 'desc',
        search
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Detect schema
      const schema = await detectSchema();
      
      // Check if escrows table exists and has data
      try {
        const tableCheck = await pool.query(`
          SELECT 
            COUNT(*) as count,
            MIN(id::text) as first_id,
            MAX(id::text) as last_id
          FROM escrows
        `);
        console.log('Escrows table check:', tableCheck.rows[0]);
      } catch (checkError) {
        console.error('Error checking escrows table:', checkError.message);
      }
      
      // Debug: Check what IDs exist in the database
      try {
        const idCheckQuery = `
          SELECT 
            ${schema.hasTeamSequenceId ? 'team_sequence_id' : schema.hasNumericId ? 'numeric_id' : 'id'} as primary_id,
            ${schema.hasNumericId ? 'numeric_id' : 'NULL'} as numeric_id,
            ${schema.hasTeamSequenceId ? 'team_sequence_id' : 'NULL'} as team_sequence_id,
            display_id,
            property_address
          FROM escrows
          ORDER BY ${schema.hasTeamSequenceId ? 'team_sequence_id' : schema.hasNumericId ? 'numeric_id' : 'id'}
          LIMIT 10
        `;
        const idCheckResult = await pool.query(idCheckQuery);
        console.log('\n=== Database ID Check ===');
        console.log('First 10 escrows in database:');
        idCheckResult.rows.forEach(row => {
          console.log(`  Primary ID: ${row.primary_id}, Numeric ID: ${row.numeric_id}, Team Seq ID: ${row.team_sequence_id}, Display ID: ${row.display_id}, Address: ${row.property_address}`);
        });
        console.log('========================\n');
      } catch (err) {
        console.error('ID check query failed:', err.message);
      }

      // Build WHERE conditions
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (status && status !== 'all') {
        whereConditions.push(`e.escrow_status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (search) {
        whereConditions.push(`(e.property_address ILIKE $${paramIndex} OR e.display_id ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM escrows e
        WHERE ${whereClause}
      `;
      console.log('Count Query:', countQuery);
      console.log('Count Query Params:', queryParams);
      const countResult = await pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);
      console.log('Total escrows in database:', totalCount);

      // Build dynamic query based on schema
      queryParams.push(limit, offset);
      const envSuffix = process.env.NODE_ENV === 'development' ? ' - LOCAL' : '';
      
      // Build field selections based on available columns
      // Always use id as the UUID column
      let idField = 'id::text';
      let displayIdField = 'display_id';  // Format: ESCROW-2025-0001
      
      console.log('Using ID field:', idField);
      console.log('Schema info:', schema);
      
      let commissionField;
      if (schema.hasMyCommission && schema.hasBuyerSideCommission) {
        commissionField = 'COALESCE(my_commission, net_commission, buyer_side_commission * purchase_price / 100, buyer_side_commission, 0)';
      } else if (schema.hasMyCommission) {
        commissionField = 'COALESCE(my_commission, net_commission, 0)';
      } else if (schema.hasNetCommission && schema.hasBuyerSideCommission) {
        commissionField = 'COALESCE(net_commission, buyer_side_commission * purchase_price / 100, buyer_side_commission, 0)';
      } else if (schema.hasNetCommission) {
        commissionField = 'COALESCE(net_commission, 0)';
      } else if (schema.hasBuyerSideCommission) {
        commissionField = 'COALESCE(buyer_side_commission * purchase_price / 100, buyer_side_commission, 0)';
      } else {
        commissionField = '0';
      }
      
      let acceptanceDateField;
      if (schema.hasAcceptanceDate && schema.hasOpeningDate) {
        acceptanceDateField = 'COALESCE(TO_CHAR(acceptance_date, \'YYYY-MM-DD\'), TO_CHAR(opening_date, \'YYYY-MM-DD\'), TO_CHAR(CURRENT_DATE, \'YYYY-MM-DD\'))';
      } else if (schema.hasAcceptanceDate) {
        acceptanceDateField = 'COALESCE(TO_CHAR(acceptance_date, \'YYYY-MM-DD\'), TO_CHAR(CURRENT_DATE, \'YYYY-MM-DD\'))';
      } else if (schema.hasOpeningDate) {
        acceptanceDateField = 'COALESCE(TO_CHAR(opening_date, \'YYYY-MM-DD\'), TO_CHAR(CURRENT_DATE, \'YYYY-MM-DD\'))';
      } else {
        acceptanceDateField = 'TO_CHAR(CURRENT_DATE, \'YYYY-MM-DD\')';
      }
      
      const listQuery = `
        SELECT 
          ${idField} as id,
          ${displayIdField} as "displayId",
          ${displayIdField} as "escrowNumber",
          property_address || '${envSuffix}' as "propertyAddress",
          COALESCE(property_image_url, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800') as "propertyImage",
          zillow_url as "zillowUrl",
          escrow_status as "escrowStatus",
          purchase_price as "purchasePrice",
          ${commissionField} as "myCommission",
          '[]'::jsonb as clients,
          ${acceptanceDateField} as "acceptanceDate",
          COALESCE(TO_CHAR(closing_date, 'YYYY-MM-DD'), TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD')) as "scheduledCoeDate",
          CASE 
            WHEN closing_date IS NOT NULL 
            THEN DATE_PART('day', closing_date::timestamp - CURRENT_TIMESTAMP)::integer
            ELSE 0
          END as "daysToClose",
          64 as "checklistProgress",
          CASE 
            WHEN updated_at IS NOT NULL THEN TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
            WHEN created_at IS NOT NULL THEN TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
            ELSE TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
          END as "lastActivity",
          FLOOR(RANDOM() * 5 + 1)::integer as "upcomingDeadlines"
        FROM escrows e
        WHERE ${whereClause}
        ORDER BY ${sort} ${order.toUpperCase()}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      console.log('List Query:', listQuery);
      console.log('List Query Params:', queryParams);
      const listResult = await pool.query(listQuery, queryParams);
      console.log('Query executed, rows returned:', listResult.rows.length);
      
      // Debug: Log the actual IDs being returned
      console.log('Escrows returned from database:');
      listResult.rows.forEach((escrow, index) => {
        console.log(`  ${index + 1}. ID: ${escrow.id}, numeric_id: ${escrow.numeric_id}, team_seq_id: ${escrow.team_sequence_id}, Display ID: ${escrow.displayId}, Address: ${escrow.propertyAddress}`);
      });
      console.log(`Total escrows: ${listResult.rows.length}`);
      
      // Special check for ESC-2025-001 or ESC-2025-0001
      const escrow2025001 = listResult.rows.find(e => e.displayId === 'ESC-2025-001' || e.displayId === 'ESC-2025-0001');
      if (escrow2025001) {
        console.log('\n=== First Escrow Debug Info ===');
        console.log('Display ID:', escrow2025001.displayId);
        console.log('ID (used for navigation):', escrow2025001.id);
        console.log('Numeric ID:', escrow2025001.numeric_id);
        console.log('Team Sequence ID:', escrow2025001.team_sequence_id);
        console.log('Full record:', JSON.stringify(escrow2025001, null, 2));
        console.log('==============================\n');
      }

      res.json({
        success: true,
        data: {
          escrows: listResult.rows,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching escrows:', error);
      
      // Provide more detailed error information
      const errorResponse = {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch escrows',
        details: {
          errorMessage: error.message,
          errorCode: error.code,
          errorName: error.name
        }
      };
      
      // Add database connection info
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        errorResponse.details.hint = 'Database connection failed - check DATABASE_URL';
      }
      
      res.status(500).json({
        success: false,
        error: errorResponse
      });
    }
  }

  /**
   * Get single escrow by ID with full details including helper tables
   * Supports both numeric ID (1, 2, 3) and display ID (ESC-2025-001)
   */
  static async getEscrowById(req, res) {
    try {
      const { id } = req.params;
      
      // Detect schema
      const schema = await detectSchema();
      
      // Determine if ID is UUID (with or without prefix) or display format
      // Handle both "esc" and "escrow-" prefixes
      const isUUID = /^(esc|escrow-)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Build query to handle UUID, numeric ID, or display ID
      let whereClause;
      let queryValue = id;
      
      if (isUUID) {
        // UUID format - use id column
        // Don't cast to uuid type since we might have TEXT column with prefixes
        whereClause = 'e.id = $1';
      } else if (/^\d+$/.test(id)) {
        // Pure numeric - use numeric_id or team_sequence_id
        if (schema.hasNumericId) {
          whereClause = 'e.numeric_id = $1::integer';
        } else if (schema.hasTeamSequenceId) {
          whereClause = 'e.team_sequence_id = $1::integer';
        } else {
          whereClause = 'e.display_id = $1';
        }
      } else if (/^ESCROW-\d{4}-\d{4}$/i.test(id)) {
        // Display ID format (ESCROW-2025-0001)
        whereClause = 'e.display_id = $1';
      } else {
        // Try all three formats
        whereClause = '(e.id = $1 OR e.display_id = $1 OR (e.numeric_id IS NOT NULL AND e.numeric_id::text = $1))';
      }
      
      // Get escrow details
      const escrowQuery = `
        SELECT 
          e.*,
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' as propertyImage
        FROM escrows e
        WHERE ${whereClause}
      `;
      
      const escrowResult = await pool.query(escrowQuery, [id]);

      if (escrowResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }

      const escrow = escrowResult.rows[0];
      
      // Build people structure first to use for clients array
      const peopleData = (() => {
        const storedPeople = escrow.people || {};
        const defaultContact = {
          id: null,
          name: null,
          email: null,
          phone: null,
          company: null,
          license: null,
          address: null,
          role: null
        };
        
        return {
          buyer: storedPeople.buyer || defaultContact,
          buyerAgent: storedPeople.buyerAgent || defaultContact,
          seller: storedPeople.seller || defaultContact,
          sellerAgent: storedPeople.sellerAgent || defaultContact
        };
      })();
      
      // Build clients array for list view compatibility
      const clients = [];
      if (peopleData.buyer?.name) {
        clients.push({
          name: peopleData.buyer.name,
          type: 'Buyer',
          avatar: null
        });
      }
      if (peopleData.seller?.name) {
        clients.push({
          name: peopleData.seller.name,
          type: 'Seller',
          avatar: null
        });
      }
      
      // Calculate checklist progress
      const checklists = escrow.checklists || {};
      let totalItems = 0;
      let completedItems = 0;
      
      ['loan', 'house', 'admin'].forEach(category => {
        const categoryChecklist = checklists[category] || {};
        Object.values(categoryChecklist).forEach(value => {
          totalItems++;
          if (value === true) completedItems++;
        });
      });
      
      const checklistProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      
      // Build comprehensive response organized by category
      const response = {
        // Core identifiers matching GET /escrows list view
        id: escrow.id,
        escrowNumber: escrow.display_id,
        propertyAddress: escrow.property_address,
        propertyImage: escrow.property_image_url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        zillowUrl: escrow.zillow_url || null,
        escrowStatus: escrow.escrow_status,
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        myCommission: parseFloat(escrow.my_commission) || 0,
        clients: clients,
        scheduledCoeDate: escrow.closing_date || null,
        daysToClose: escrow.closing_date ? 
          Math.floor((new Date(escrow.closing_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0,
        checklistProgress: checklistProgress,
        lastActivity: escrow.updated_at || escrow.created_at || null,
        upcomingDeadlines: 2, // Will be calculated from timeline
        
        // Add JSONB data at the bottom
        propertyDetails: (() => {
          // Build comprehensive property details object
          const storedFeatures = escrow.property_features || {};
          const storedImages = escrow.property_images || [];
          
          return {
            // Basic property info
            address: escrow.property_address || null,
            city: escrow.city || null,
            state: escrow.state || 'CA',
            zipCode: escrow.zip_code || null,
            county: escrow.county || null,
            
            // Property characteristics
            propertyType: escrow.property_type || 'Single Family',
            bedrooms: escrow.bedrooms || null,
            bathrooms: escrow.bathrooms || null,
            squareFeet: escrow.square_feet || null,
            lotSizeSqft: escrow.lot_size_sqft || null,
            yearBuilt: escrow.year_built || null,
            stories: escrow.stories || null,
            garageSpaces: escrow.garage_spaces || null,
            
            // Property features
            pool: escrow.pool || false,
            spa: escrow.spa || false,
            viewType: escrow.view_type || null,
            architecturalStyle: escrow.architectural_style || null,
            propertyCondition: escrow.property_condition || null,
            zoning: escrow.zoning || null,
            
            // Location details
            subdivision: escrow.subdivision || null,
            crossStreets: escrow.cross_streets || null,
            latitude: escrow.latitude || null,
            longitude: escrow.longitude || null,
            
            // Identifiers
            apn: escrow.apn || null,
            mlsNumber: escrow.mls_number || null,
            
            // HOA information
            hoaFee: escrow.hoa_fee || null,
            hoaFrequency: escrow.hoa_frequency || null,
            hoaName: escrow.hoa_name || null,
            gatedCommunity: escrow.gated_community || false,
            seniorCommunity: escrow.senior_community || false,
            
            // Listing information
            listPrice: escrow.list_price || null,
            listDate: escrow.list_date || null,
            daysOnMarket: escrow.days_on_market || null,
            previousListPrice: escrow.previous_list_price || null,
            originalListPrice: escrow.original_list_price || null,
            
            // Additional features from JSONB
            features: storedFeatures,
            images: storedImages,
            
            // Pricing
            purchasePrice: parseFloat(escrow.purchase_price) || 0,
            pricePerSqft: escrow.square_feet && escrow.purchase_price ? 
              Math.round(parseFloat(escrow.purchase_price) / escrow.square_feet) : null
          };
        })(),
        people: (() => {
          // Build people object with structured contacts
          const storedPeople = escrow.people || {};
          
          // Default contact structure
          const defaultContact = {
            id: null,
            name: null,
            email: null,
            phone: null,
            company: null,
            license: null,
            address: null,
            role: null
          };
          
          return {
            // Buyer side
            buyer: storedPeople.buyer || defaultContact,
            buyerAgent: storedPeople.buyerAgent || defaultContact,
            buyerBroker: storedPeople.buyerBroker || defaultContact,
            
            // Seller side
            seller: storedPeople.seller || defaultContact,
            sellerAgent: storedPeople.sellerAgent || defaultContact,
            sellerBroker: storedPeople.sellerBroker || defaultContact,
            
            // Transaction professionals
            escrowOfficer: storedPeople.escrowOfficer || defaultContact,
            titleOfficer: storedPeople.titleOfficer || defaultContact,
            lender: storedPeople.lender || defaultContact,
            loanOfficer: storedPeople.loanOfficer || defaultContact,
            
            // Inspectors
            homeInspector: storedPeople.homeInspector || defaultContact,
            termiteInspector: storedPeople.termiteInspector || defaultContact,
            roofInspector: storedPeople.roofInspector || defaultContact,
            poolInspector: storedPeople.poolInspector || defaultContact,
            
            // Other professionals
            appraiser: storedPeople.appraiser || defaultContact,
            contractor: storedPeople.contractor || defaultContact,
            homeWarrantyRep: storedPeople.homeWarrantyRep || defaultContact,
            
            // Transaction coordinator
            transactionCoordinator: storedPeople.transactionCoordinator || {
              ...defaultContact,
              name: escrow.transaction_coordinator || null
            },
            
            // Transaction team vendors/companies
            transactionTeam: {
              transactionCoordinator: escrow.transaction_coordinator || 'Karin Munoz',
              nhdCompany: escrow.nhd_company || 'Property ID Max',
              homeWarrantyCompany: escrow.home_warranty_company || null,
              termiteInspectionCompany: escrow.termite_inspection_company || null,
              homeInspectionCompany: escrow.home_inspection_company || null
            },
            
            // Include any additional people from stored data
            ...Object.keys(storedPeople).reduce((acc, key) => {
              // Only include keys that aren't already defined above
              const predefinedKeys = [
                'buyer', 'buyerAgent', 'buyerBroker',
                'seller', 'sellerAgent', 'sellerBroker',
                'escrowOfficer', 'titleOfficer', 'lender', 'loanOfficer',
                'homeInspector', 'termiteInspector', 'roofInspector', 'poolInspector',
                'appraiser', 'contractor', 'homeWarrantyRep', 'transactionCoordinator'
              ];
              
              if (!predefinedKeys.includes(key)) {
                acc[key] = storedPeople[key];
              }
              return acc;
            }, {})
          };
        })(),
        timeline: (() => {
          // Build timeline object sorted chronologically from acceptance to post-close
          const storedTimeline = escrow.timeline || {};
          
          return {
            // 1. Transaction Start
            acceptanceDate: escrow.acceptance_date || null,
            escrowOpenedDate: escrow.escrow_opened_date || escrow.opening_date || null,
            emdDate: escrow.emd_date || null,
            
            // 2. Initial Documents & Disclosures (typically first 7-10 days)
            titleOrderedDate: escrow.title_ordered_date || null,
            preliminaryTitleReportDate: escrow.preliminary_title_report_date || null,
            sellerDisclosuresDueDate: escrow.seller_disclosures_due_date || null,
            sellerDisclosuresReceivedDate: escrow.seller_disclosures_received_date || null,
            nhdReportDate: escrow.nhd_report_date || null,
            hoaDocumentsDueDate: escrow.hoa_documents_due_date || null,
            hoaDocumentsReceivedDate: escrow.hoa_documents_received_date || null,
            
            // 3. Inspections (typically days 7-17)
            physicalInspectionDate: escrow.physical_inspection_date || null,
            termiteInspectionDate: escrow.termite_inspection_date || null,
            roofInspectionDate: escrow.roof_inspection_date || null,
            sewerInspectionDate: escrow.sewer_inspection_date || null,
            poolSpaInspectionDate: escrow.pool_spa_inspection_date || null,
            chimneyInspectionDate: escrow.chimney_inspection_date || null,
            inspectionPeriodEndDate: escrow.inspection_period_end_date || null,
            
            // 4. Loan Process (concurrent with inspections)
            loanApplicationDate: escrow.loan_application_date || null,
            appraisalOrderedDate: escrow.appraisal_ordered_date || null,
            appraisalCompletedDate: escrow.appraisal_completed_date || null,
            insuranceOrderedDate: escrow.insurance_ordered_date || null,
            
            // 5. Contingency Removals (typically days 17-21)
            inspectionContingencyRemovalDate: escrow.inspection_contingency_removal_date || null,
            appraisalContingencyRemovalDate: escrow.appraisal_contingency_removal_date || null,
            loanContingencyRemovalDate: escrow.loan_contingency_removal_date || null,
            allContingenciesRemovalDate: escrow.all_contingencies_removal_date || null,
            
            // 6. Repairs & Completion (if needed)
            repairsCompletionDate: escrow.repairs_completion_date || null,
            termiteCompletionDate: escrow.termite_completion_date || null,
            smokeAlarmInstallationDate: escrow.smoke_alarm_installation_date || null,
            
            // 7. Final Loan & Closing Prep
            loanApprovalDate: escrow.loan_approval_date || null,
            loanDocsOrderedDate: escrow.loan_docs_ordered_date || null,
            loanDocsSignedDate: escrow.loan_docs_signed_date || null,
            finalVerificationDate: escrow.final_verification_date || null,
            walkThroughDate: escrow.walk_through_date || null,
            
            // 8. Closing & Recording
            loanFundedDate: escrow.loan_funded_date || null,
            closingDate: escrow.closing_date || null,
            recordingDate: escrow.recording_date || null,
            
            // 9. Post-Close
            possessionDate: escrow.possession_date || null,
            rentBackEndDate: escrow.rent_back_end_date || null,
            
            // Key Metrics
            daysFromAcceptance: escrow.acceptance_date ? 
              Math.floor((new Date() - new Date(escrow.acceptance_date)) / (1000 * 60 * 60 * 24)) : null,
            daysToCoe: escrow.closing_date ? 
              Math.floor((new Date(escrow.closing_date) - new Date()) / (1000 * 60 * 60 * 24)) : null,
            daysToContingency: escrow.all_contingencies_removal_date ? 
              Math.floor((new Date(escrow.all_contingencies_removal_date) - new Date()) / (1000 * 60 * 60 * 24)) : null,
            
            // Merge any additional stored timeline data
            ...storedTimeline
          };
        })(),
        financials: (() => {
          // Build financials in SkySlope Books format
          const stored = escrow.financials || {};
          const purchasePrice = parseFloat(escrow.purchase_price) || 0;
          const commissionPercentage = parseFloat(escrow.commission_percentage) || 3;
          const baseCommission = parseFloat(escrow.gross_commission) || (purchasePrice * (commissionPercentage / 100));
          const myCommission = parseFloat(escrow.my_commission) || 0;
          const commissionAdjustments = parseFloat(escrow.commission_adjustments) || 0;
          const expenseAdjustments = parseFloat(escrow.expense_adjustments) || 0;
          
          // Determine if this is a Zillow referral
          const isZillowReferral = escrow.lead_source === 'Zillow' || escrow.lead_source === 'Zillow Flex';
          
          // Calculate Zillow Flex fee based on price tiers
          let zillowFlexFeePercentage = 0;
          let grossCommissionFees = 0;
          
          if (isZillowReferral) {
            if (purchasePrice >= 400000) {
              zillowFlexFeePercentage = 40;
            } else if (purchasePrice >= 300000) {
              zillowFlexFeePercentage = 35;
            } else if (purchasePrice >= 200000) {
              zillowFlexFeePercentage = 30;
            } else if (purchasePrice >= 100000) {
              zillowFlexFeePercentage = 25;
            } else {
              zillowFlexFeePercentage = 15;
            }
            grossCommissionFees = baseCommission * (zillowFlexFeePercentage / 100);
          }
          
          // Calculate adjusted gross after referral fees
          const adjustedGross = baseCommission - grossCommissionFees;
          const netCommission = adjustedGross; // Can be different if there are other adjustments
          
          // Calculate franchise fees (6.25% of net commission)
          const franchiseFees = netCommission * 0.0625;
          const dealExpense = franchiseFees; // For now, franchise fees are the only deal expense
          
          // Calculate deal net
          const dealNet = netCommission - dealExpense;
          const agentGCI = dealNet; // Agent's GCI is the deal net
          
          // Get YTD GCI and determine split percentage
          const ytdGci = parseFloat(escrow.ytd_gci) || 0;
          let splitPercentage = 70; // Default
          
          // Special rule for Zillow referrals - always 75%
          if (isZillowReferral) {
            splitPercentage = 75;
          } else {
            // Normal split rules based on YTD GCI
            if (ytdGci >= 100000) {
              splitPercentage = 100;
            } else if (ytdGci >= 50000) {
              splitPercentage = 80;
            }
          }
          
          // Calculate agent commission
          const agentCommission = agentGCI * (splitPercentage / 100);
          
          // Standard fees
          const transactionFee = 285;
          const tcFee = 250;
          
          // Calculate 1099 income
          const agent1099Income = agentCommission - transactionFee - tcFee;
          const excessPayment = agent1099Income; // Same as 1099 unless there are other payments
          const agentNet = excessPayment;
          
          return {
            // Base commission info
            baseCommission: baseCommission || 0,
            grossCommission: baseCommission || 0,
            
            // Referral fees section
            grossCommissionFees: grossCommissionFees || 0,
            zillowFlexFee: isZillowReferral ? {
              percentage: zillowFlexFeePercentage,
              amount: grossCommissionFees,
              tier: purchasePrice >= 400000 ? '$400,000+' :
                    purchasePrice >= 300000 ? '$300,000-$399,999' :
                    purchasePrice >= 200000 ? '$200,000-$299,999' :
                    purchasePrice >= 100000 ? '$100,000-$199,999' : '$0-$99,999'
            } : null,
            
            // Adjusted amounts
            adjustedGross: adjustedGross || 0,
            netCommission: netCommission || 0,
            
            // Deal expenses
            dealExpense: dealExpense || 0,
            franchiseFees: franchiseFees || 0,
            franchiseFeePercentage: 6.25,
            
            // Deal summary
            dealNet: dealNet || 0,
            agentGCI: agentGCI || 0,
            
            // Agent split section
            agentName: "Jayden Metz",
            splitPercentage: splitPercentage,
            agentCommission: agentCommission || 0,
            
            // Agent fees
            transactionFee: transactionFee || 0,
            tcFee: tcFee || 0,
            
            // Agent income
            agent1099Income: agent1099Income || 0,
            excessPayment: excessPayment || 0,
            agentNet: agentNet || 0,
            
            // Additional context
            leadSource: escrow.lead_source || '',
            isZillowReferral: isZillowReferral,
            ytdGciBeforeTransaction: ytdGci || 0,
            ytdGciAfterTransaction: (ytdGci + agentGCI) || 0,
            
            // Transaction metadata (moved from top level)
            listing: escrow.listing || null,
            avid: escrow.avid || true,
            createdAt: escrow.created_at,
            updatedAt: escrow.updated_at,
            
            // Expenses array for additional costs
            expenses: escrow.expenses || []
          };
        })(),
        checklists: (() => {
          const defaultChecklists = {
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
          };
          
          if (!escrow.checklists) return defaultChecklists;
          
          return {
            loan: { ...defaultChecklists.loan, ...(escrow.checklists.loan || {}) },
            house: { ...defaultChecklists.house, ...(escrow.checklists.house || escrow.checklists.home || {}) },
            admin: { ...defaultChecklists.admin, ...(escrow.checklists.admin || {}) }
          };
        })(),
        documents: escrow.documents || []
      };

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      console.error('Error fetching escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow details',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }

  /**
   * Get escrow statistics for dashboard
   */
  static async getEscrowStats(req, res) {
    try {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      // Detect schema
      const schema = await detectSchema();
      
      // Build commission field based on schema
      let commissionField;
      if (schema.hasNetCommission && schema.hasBuyerSideCommission) {
        commissionField = 'COALESCE(net_commission, buyer_side_commission * purchase_price / 100, 0)';
      } else if (schema.hasNetCommission) {
        commissionField = 'COALESCE(net_commission, 0)';
      } else if (schema.hasBuyerSideCommission) {
        commissionField = 'COALESCE(buyer_side_commission * purchase_price / 100, 0)';
      } else {
        commissionField = '0';
      }
      
      // Get basic counts
      const statsQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE escrow_status = 'Active') as active,
          COUNT(*) FILTER (WHERE escrow_status = 'Pending') as pending,
          COUNT(*) FILTER (WHERE escrow_status = 'Closed') as closed,
          COUNT(*) as total,
          SUM(purchase_price) as total_volume,
          SUM(${commissionField}) as total_commission
        FROM escrows
      `;
      const statsResult = await pool.query(statsQuery);
      const stats = statsResult.rows[0];
      
      // Get closed this month
      const closedThisMonthQuery = `
        SELECT COUNT(*) as count
        FROM escrows
        WHERE escrow_status = 'Closed'
        AND EXTRACT(MONTH FROM closing_date) = $1
        AND EXTRACT(YEAR FROM closing_date) = $2
      `;
      const closedThisMonthResult = await pool.query(closedThisMonthQuery, [thisMonth + 1, thisYear]);
      const closedThisMonth = parseInt(closedThisMonthResult.rows[0].count);
      
      // Calculate average days to close
      const startDateField = schema.hasAcceptanceDate ? 
        (schema.hasOpeningDate ? 'COALESCE(acceptance_date, opening_date)' : 'acceptance_date') :
        (schema.hasOpeningDate ? 'opening_date' : 'created_at');
        
      const avgDaysQuery = `
        SELECT AVG(
          DATE_PART('day', closing_date - ${startDateField})
        ) as avg_days
        FROM escrows
        WHERE escrow_status = 'Closed'
        AND closing_date IS NOT NULL
        AND ${startDateField} IS NOT NULL
      `;
      const avgDaysResult = await pool.query(avgDaysQuery);
      const avgDaysToClose = Math.round(avgDaysResult.rows[0].avg_days || 30);
      
      // Get pipeline data
      const pipelineQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE escrow_status = 'Active' AND closing_date <= CURRENT_DATE + INTERVAL '7 days') as this_week,
          COUNT(*) FILTER (WHERE escrow_status = 'Active' AND closing_date <= CURRENT_DATE + INTERVAL '30 days') as this_month,
          COUNT(*) FILTER (WHERE escrow_status = 'Active' AND closing_date > CURRENT_DATE + INTERVAL '30 days' AND closing_date <= CURRENT_DATE + INTERVAL '60 days') as next_month,
          SUM(${commissionField}) FILTER (WHERE escrow_status = 'Active') as projected_revenue
        FROM escrows
      `;
      const pipelineResult = await pool.query(pipelineQuery);
      const pipeline = pipelineResult.rows[0];
      
      // Generate monthly trends for the last 6 months
      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const trendMonth = new Date(thisYear, thisMonth - i, 1);
        const monthName = trendMonth.toLocaleString('default', { month: 'short' });
        
        const trendQuery = `
          SELECT 
            COUNT(*) as closed,
            COALESCE(SUM(purchase_price), 0) as volume
          FROM escrows
          WHERE escrow_status = 'Closed'
          AND EXTRACT(MONTH FROM closing_date) = $1
          AND EXTRACT(YEAR FROM closing_date) = $2
        `;
        
        const trendResult = await pool.query(trendQuery, [
          trendMonth.getMonth() + 1,
          trendMonth.getFullYear()
        ]);
        
        trends.push({
          month: monthName,
          closed: parseInt(trendResult.rows[0].closed),
          volume: parseFloat(trendResult.rows[0].volume)
        });
      }
      
      res.json({
        success: true,
        data: {
          overview: {
            activeEscrows: parseInt(stats.active),
            pendingEscrows: parseInt(stats.pending),
            closedThisMonth,
            totalVolume: parseFloat(stats.total_volume) || 0,
            totalCommission: parseFloat(stats.total_commission) || 0,
            avgDaysToClose
          },
          performance: {
            closingRate: stats.total > 0 ? Math.round((parseInt(stats.closed) / parseInt(stats.total)) * 100) : 0,
            avgListToSaleRatio: 98.5,
            clientSatisfaction: 4.8,
            onTimeClosingRate: 89
          },
          pipeline: {
            thisWeek: parseInt(pipeline.this_week),
            thisMonth: parseInt(pipeline.this_month),
            nextMonth: parseInt(pipeline.next_month),
            projectedRevenue: parseFloat(pipeline.projected_revenue) || 0
          },
          trends
        }
      });
      
    } catch (error) {
      console.error('Error fetching escrow stats:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow statistics'
        }
      });
    }
  }

  /**
   * Update an escrow
   */
  static async updateEscrow(req, res) {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'display_id' && key !== 'created_at') {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No fields to update'
          }
        });
      }
      
      // Determine if ID is UUID-like format (including shortened versions) or display format
      // Handle both "esc" and "escrow-" prefixes and variable length first segments
      const isUUIDFormat = /^(esc|escrow-)?[0-9a-f]+-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      values.push(id);
      
      const updateQuery = `
        UPDATE escrows 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE ${isUUIDFormat ? 'id = $' + paramIndex : 'display_id = $' + paramIndex}
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0],
        message: 'Escrow updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update escrow'
        }
      });
    } finally {
      client.release();
    }
  }

  /**
   * Delete an escrow
   */
  static async deleteEscrow(req, res) {
    try {
      const { id } = req.params;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const result = await pool.query(
        `DELETE FROM escrows WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'} RETURNING display_id`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Escrow deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete escrow'
        }
      });
    }
  }

  /**
   * Create a new escrow with auto-incrementing ID and helper tables
   */
  static async createEscrow(req, res) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const escrowData = req.body;
      
      // After migration, the database will automatically:
      // - Generate UUID for id
      // - Generate numeric_id from sequence
      // - Generate display_id via trigger (ESCROW-2025-0001 format)
      
      // Insert the new escrow
      const insertQuery = `
        INSERT INTO escrows (
          property_address, escrow_status, purchase_price,
          earnest_money, buyer_side_commission,
          opening_date, closing_date, property_type, transaction_type,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        escrowData.property_address,
        escrowData.escrow_status || 'active',
        escrowData.purchase_price,
        escrowData.earnest_money || escrowData.purchase_price * 0.01,
        escrowData.buyer_side_commission || 2.5,
        escrowData.opening_date || new Date().toISOString().split('T')[0],
        escrowData.closing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        escrowData.property_type || 'Single Family',
        escrowData.transaction_type || 'purchase'
      ];
      
      const escrowResult = await client.query(insertQuery, values);
      const newEscrow = escrowResult.rows[0];
      
      // Create default checklist items
      const defaultChecklist = [
        // Opening Phase
        { phase: 'opening', task_name: 'Open Escrow', task_description: 'Officially open escrow with title company', is_completed: false, due_days: 0, order: 1 },
        { phase: 'opening', task_name: 'Earnest Money Deposit', task_description: 'Collect and deposit earnest money', is_completed: false, due_days: 3, order: 2 },
        { phase: 'opening', task_name: 'Preliminary Title Report', task_description: 'Order and review preliminary title report', is_completed: false, due_days: 5, order: 3 },
        { phase: 'opening', task_name: 'Property Disclosures', task_description: 'Deliver all required property disclosures', is_completed: false, due_days: 7, order: 4 },
        { phase: 'opening', task_name: 'Home Inspection', task_description: 'Schedule and complete home inspection', is_completed: false, due_days: 10, order: 5 },
        
        // Processing Phase
        { phase: 'processing', task_name: 'Loan Application', task_description: 'Submit complete loan application', is_completed: false, due_days: 5, order: 6 },
        { phase: 'processing', task_name: 'Appraisal', task_description: 'Schedule and complete property appraisal', is_completed: false, due_days: 15, order: 7 },
        { phase: 'processing', task_name: 'Loan Approval', task_description: 'Obtain final loan approval', is_completed: false, due_days: 25, order: 8 },
        { phase: 'processing', task_name: 'Insurance', task_description: 'Secure homeowners insurance', is_completed: false, due_days: 20, order: 9 },
        { phase: 'processing', task_name: 'HOA Documents', task_description: 'Review HOA documents if applicable', is_completed: false, due_days: 15, order: 10 },
        
        // Closing Phase
        { phase: 'closing', task_name: 'Final Walkthrough', task_description: 'Complete final property walkthrough', is_completed: false, due_days: -2, order: 11 },
        { phase: 'closing', task_name: 'Closing Documents', task_description: 'Review and sign closing documents', is_completed: false, due_days: -1, order: 12 },
        { phase: 'closing', task_name: 'Fund Loan', task_description: 'Lender funds the loan', is_completed: false, due_days: 0, order: 13 },
        { phase: 'closing', task_name: 'Record Deed', task_description: 'Record deed with county', is_completed: false, due_days: 0, order: 14 },
        { phase: 'closing', task_name: 'Deliver Keys', task_description: 'Deliver keys to new owner', is_completed: false, due_days: 0, order: 15 }
      ];
      
      // Calculate due dates based on escrow dates
      const acceptanceDate = new Date(newEscrow.opening_date);
      const closingDate = new Date(newEscrow.closing_date);
      
      const checklistWithDates = defaultChecklist.map(item => ({
        ...item,
        due_date: item.due_days >= 0 
          ? new Date(acceptanceDate.getTime() + item.due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(closingDate.getTime() + item.due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed_date: null
      }));
      
      // Insert checklist items as JSONB
      const checklistQuery = `
        INSERT INTO escrow_checklists (escrow_display_id, checklist_items)
        VALUES ($1, $2)
      `;
      await client.query(checklistQuery, [newEscrow.display_id, JSON.stringify(checklistWithDates)]);
      
      await client.query('COMMIT');
      
      // Return success with UUID only
      res.status(201).json({
        success: true,
        data: {
          id: newEscrow.id,  // UUID
          displayId: newEscrow.display_id,  // ESCROW-2025-0001
          message: 'Escrow created successfully with checklist items'
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create escrow',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    } finally {
      client.release();
    }
  }

  /**
   * Get escrow people/participants
   */
  static async getEscrowPeople(req, res) {
    try {
      const { id } = req.params;
      
      // Detect if ID is UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT people
        FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      const storedPeople = result.rows[0].people || {};
      
      // Default contact structure
      const defaultContact = {
        id: null,
        name: null,
        email: null,
        phone: null,
        company: null,
        license: null,
        address: null,
        role: null
      };
      
      // Build structured people object
      const peopleData = {
        // Buyer side
        buyer: storedPeople.buyer || defaultContact,
        buyerAgent: storedPeople.buyerAgent || defaultContact,
        buyerBroker: storedPeople.buyerBroker || defaultContact,
        
        // Seller side
        seller: storedPeople.seller || defaultContact,
        sellerAgent: storedPeople.sellerAgent || defaultContact,
        sellerBroker: storedPeople.sellerBroker || defaultContact,
        
        // Transaction professionals
        escrowOfficer: storedPeople.escrowOfficer || defaultContact,
        titleOfficer: storedPeople.titleOfficer || defaultContact,
        lender: storedPeople.lender || defaultContact,
        loanOfficer: storedPeople.loanOfficer || defaultContact,
        
        // Inspectors
        homeInspector: storedPeople.homeInspector || defaultContact,
        termiteInspector: storedPeople.termiteInspector || defaultContact,
        roofInspector: storedPeople.roofInspector || defaultContact,
        poolInspector: storedPeople.poolInspector || defaultContact,
        
        // Other professionals
        appraiser: storedPeople.appraiser || defaultContact,
        contractor: storedPeople.contractor || defaultContact,
        homeWarrantyRep: storedPeople.homeWarrantyRep || defaultContact,
        
        // Transaction coordinator (check if we need to get from escrow table)
        transactionCoordinator: storedPeople.transactionCoordinator || defaultContact,
        
        // Include any additional people from stored data
        ...Object.keys(storedPeople).reduce((acc, key) => {
          // Only include keys that aren't already defined above
          const predefinedKeys = [
            'buyer', 'buyerAgent', 'buyerBroker',
            'seller', 'sellerAgent', 'sellerBroker',
            'escrowOfficer', 'titleOfficer', 'lender', 'loanOfficer',
            'homeInspector', 'termiteInspector', 'roofInspector', 'poolInspector',
            'appraiser', 'contractor', 'homeWarrantyRep', 'transactionCoordinator'
          ];
          
          if (!predefinedKeys.includes(key)) {
            acc[key] = storedPeople[key];
          }
          return acc;
        }, {})
      };
      
      res.json({
        success: true,
        data: peopleData
      });
      
    } catch (error) {
      console.error('Error fetching escrow people:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow people'
        }
      });
    }
  }

  /**
   * Get escrow timeline
   */
  static async getEscrowTimeline(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT 
          timeline, 
          acceptance_date,
          emd_date,
          contingencies_date,
          closing_date,
          actual_coe_date,
          opening_date,
          -- Inspection dates
          inspection_period_end_date,
          physical_inspection_date,
          termite_inspection_date,
          sewer_inspection_date,
          pool_spa_inspection_date,
          roof_inspection_date,
          chimney_inspection_date,
          -- Disclosure dates
          seller_disclosures_due_date,
          seller_disclosures_received_date,
          preliminary_title_report_date,
          nhd_report_date,
          hoa_documents_due_date,
          hoa_documents_received_date,
          -- Loan dates
          loan_application_date,
          loan_contingency_removal_date,
          appraisal_contingency_removal_date,
          appraisal_ordered_date,
          appraisal_completed_date,
          loan_approval_date,
          loan_docs_ordered_date,
          loan_docs_signed_date,
          loan_funded_date,
          -- Contingency removal dates
          inspection_contingency_removal_date,
          all_contingencies_removal_date,
          -- Other important dates
          walk_through_date,
          recording_date,
          possession_date,
          rent_back_end_date,
          escrow_opened_date,
          title_ordered_date,
          insurance_ordered_date,
          smoke_alarm_installation_date,
          termite_completion_date,
          repairs_completion_date,
          final_verification_date
        FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      const escrow = result.rows[0];
      let timeline = escrow.timeline || [];
      
      // Build comprehensive timeline from database dates
      const timelineEvents = [];
      const today = new Date();
      
      // Helper to calculate days from acceptance
      const calculateDaysFromAcceptance = (date) => {
        if (!escrow.acceptance_date || !date) return null;
        const acceptanceDate = new Date(escrow.acceptance_date);
        const eventDate = new Date(date);
        return Math.floor((eventDate - acceptanceDate) / (1000 * 60 * 60 * 24));
      };
      
      // Helper to determine status
      const getStatus = (date) => {
        if (!date) return 'pending';
        const eventDate = new Date(date);
        return eventDate <= today ? 'completed' : 'upcoming';
      };
      
      // Helper to add event if date exists
      const addTimelineEvent = (date, eventName, category, description = null) => {
        if (date) {
          timelineEvents.push({
            date: date,
            event: eventName,
            category: category,
            description: description,
            status: getStatus(date),
            daysFromAcceptance: calculateDaysFromAcceptance(date),
            type: 'deadline'
          });
        }
      };
      
      // OPENING & INITIAL DATES
      addTimelineEvent(escrow.acceptance_date, 'Acceptance Date', 'opening', 'Contract ratified by all parties');
      addTimelineEvent(escrow.escrow_opened_date, 'Escrow Opened', 'opening', 'Escrow account opened');
      addTimelineEvent(escrow.emd_date, 'EMD Due', 'financial', 'Earnest Money Deposit due');
      addTimelineEvent(escrow.title_ordered_date, 'Title Ordered', 'opening', 'Title search initiated');
      
      // DISCLOSURE DATES
      addTimelineEvent(escrow.seller_disclosures_due_date, 'Seller Disclosures Due', 'disclosure', 'Seller property disclosures deadline');
      addTimelineEvent(escrow.seller_disclosures_received_date, 'Seller Disclosures Received', 'disclosure', 'Seller disclosures delivered');
      addTimelineEvent(escrow.preliminary_title_report_date, 'Preliminary Title Report', 'disclosure', 'Title report delivered');
      addTimelineEvent(escrow.nhd_report_date, 'NHD Report Due', 'disclosure', 'Natural Hazard Disclosure');
      addTimelineEvent(escrow.hoa_documents_due_date, 'HOA Documents Due', 'disclosure', 'HOA docs deadline');
      addTimelineEvent(escrow.hoa_documents_received_date, 'HOA Documents Received', 'disclosure', 'HOA docs delivered');
      
      // INSPECTION DATES
      addTimelineEvent(escrow.physical_inspection_date, 'Home Inspection', 'inspection', 'General home inspection scheduled');
      addTimelineEvent(escrow.termite_inspection_date, 'Termite Inspection', 'inspection', 'Pest inspection scheduled');
      addTimelineEvent(escrow.inspection_period_end_date, 'Inspection Period Ends', 'contingency', 'Last day to complete inspections');
      
      // LOAN PROCESS DATES
      addTimelineEvent(escrow.loan_application_date, 'Loan Application', 'loan', 'Loan application submitted');
      addTimelineEvent(escrow.appraisal_ordered_date, 'Appraisal Ordered', 'loan', 'Property appraisal ordered');
      addTimelineEvent(escrow.appraisal_completed_date, 'Appraisal Completed', 'loan', 'Property appraisal received');
      addTimelineEvent(escrow.loan_approval_date, 'Loan Approved', 'loan', 'Final loan approval');
      addTimelineEvent(escrow.loan_docs_signed_date, 'Loan Docs Signed', 'loan', 'Buyer signs loan documents');
      addTimelineEvent(escrow.loan_funded_date, 'Loan Funded', 'loan', 'Lender releases funds');
      
      // CONTINGENCY REMOVAL DATES
      addTimelineEvent(escrow.inspection_contingency_removal_date, 'Remove Inspection Contingency', 'contingency', 'Inspection contingency removal deadline');
      addTimelineEvent(escrow.appraisal_contingency_removal_date, 'Remove Appraisal Contingency', 'contingency', 'Appraisal contingency removal deadline');
      addTimelineEvent(escrow.loan_contingency_removal_date, 'Remove Loan Contingency', 'contingency', 'Loan contingency removal deadline');
      addTimelineEvent(escrow.all_contingencies_removal_date, 'All Contingencies Removed', 'contingency', 'All contingencies must be removed');
      
      // CLOSING DATES
      addTimelineEvent(escrow.walk_through_date, 'Final Walk-Through', 'closing', 'Buyer final property inspection');
      addTimelineEvent(escrow.closing_date, 'Scheduled Close of Escrow', 'closing', 'Target closing date');
      addTimelineEvent(escrow.recording_date, 'Recording Date', 'closing', 'Deed records with county');
      addTimelineEvent(escrow.actual_coe_date, 'Actual COE', 'closing', 'Transaction closed');
      addTimelineEvent(escrow.possession_date, 'Possession Date', 'closing', 'Buyer takes possession');
      
      // Merge with any custom timeline events stored in JSONB
      if (timeline.length > 0) {
        // Add custom events that aren't already in our RPA dates
        const existingEventNames = timelineEvents.map(e => e.event);
        const customEvents = timeline.filter(event => !existingEventNames.includes(event.event));
        customEvents.forEach(event => {
          timelineEvents.push({
            ...event,
            category: event.category || 'custom',
            type: event.type || 'event',
            status: getStatus(event.date),
            daysFromAcceptance: calculateDaysFromAcceptance(event.date)
          });
        });
      }
      
      // Sort by date
      timelineEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // If no events, generate default RPA timeline based on acceptance date
      if (timelineEvents.length === 0 && escrow.acceptance_date) {
        const acceptanceDate = new Date(escrow.acceptance_date);
        
        // Generate typical RPA timeline with standard California timeframes
        addTimelineEvent(acceptanceDate.toISOString().split('T')[0], 'Acceptance Date', 'opening', 'Contract ratified');
        addTimelineEvent(new Date(acceptanceDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'Escrow Opens', 'opening', 'Open escrow');
        addTimelineEvent(new Date(acceptanceDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'EMD Due', 'financial', 'Deposit due');
        addTimelineEvent(new Date(acceptanceDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'Seller Disclosures Due', 'disclosure', 'Disclosures deadline');
        addTimelineEvent(new Date(acceptanceDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'Home Inspection', 'inspection', 'Inspection scheduled');
        addTimelineEvent(new Date(acceptanceDate.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'Remove Inspection Contingency', 'contingency', 'Inspection contingency deadline');
        addTimelineEvent(new Date(acceptanceDate.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'Remove Appraisal Contingency', 'contingency', 'Appraisal contingency deadline');
        addTimelineEvent(new Date(acceptanceDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'Remove Loan Contingency', 'contingency', 'Loan contingency deadline');
        addTimelineEvent(new Date(acceptanceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'Close of Escrow', 'closing', 'Target closing date');
      }
      
      // Build timeline object with all RPA dates (same format as main escrow response)
      const timelineData = {
        // Core transaction dates
        acceptanceDate: escrow.acceptance_date || null,
        escrowOpenedDate: escrow.escrow_opened_date || escrow.opening_date || null,
        closingDate: escrow.closing_date || null,
        recordingDate: escrow.recording_date || null,
        possessionDate: escrow.possession_date || null,
        
        // Inspection dates
        inspectionPeriodEndDate: escrow.inspection_period_end_date || null,
        physicalInspectionDate: escrow.physical_inspection_date || null,
        termiteInspectionDate: escrow.termite_inspection_date || null,
        sewerInspectionDate: escrow.sewer_inspection_date || null,
        poolSpaInspectionDate: escrow.pool_spa_inspection_date || null,
        roofInspectionDate: escrow.roof_inspection_date || null,
        chimneyInspectionDate: escrow.chimney_inspection_date || null,
        
        // Disclosure dates
        sellerDisclosuresDueDate: escrow.seller_disclosures_due_date || null,
        sellerDisclosuresReceivedDate: escrow.seller_disclosures_received_date || null,
        preliminaryTitleReportDate: escrow.preliminary_title_report_date || null,
        nhdReportDate: escrow.nhd_report_date || null,
        hoaDocumentsDueDate: escrow.hoa_documents_due_date || null,
        hoaDocumentsReceivedDate: escrow.hoa_documents_received_date || null,
        
        // Loan dates
        loanApplicationDate: escrow.loan_application_date || null,
        loanContingencyRemovalDate: escrow.loan_contingency_removal_date || null,
        appraisalContingencyRemovalDate: escrow.appraisal_contingency_removal_date || null,
        appraisalOrderedDate: escrow.appraisal_ordered_date || null,
        appraisalCompletedDate: escrow.appraisal_completed_date || null,
        loanApprovalDate: escrow.loan_approval_date || null,
        loanDocsOrderedDate: escrow.loan_docs_ordered_date || null,
        loanDocsSignedDate: escrow.loan_docs_signed_date || null,
        loanFundedDate: escrow.loan_funded_date || null,
        
        // Contingency removal dates
        inspectionContingencyRemovalDate: escrow.inspection_contingency_removal_date || null,
        allContingenciesRemovalDate: escrow.all_contingencies_removal_date || null,
        
        // Other important dates
        walkThroughDate: escrow.walk_through_date || null,
        rentBackEndDate: escrow.rent_back_end_date || null,
        titleOrderedDate: escrow.title_ordered_date || null,
        insuranceOrderedDate: escrow.insurance_ordered_date || null,
        smokeAlarmInstallationDate: escrow.smoke_alarm_installation_date || null,
        termiteCompletionDate: escrow.termite_completion_date || null,
        repairsCompletionDate: escrow.repairs_completion_date || null,
        finalVerificationDate: escrow.final_verification_date || null,
        
        // EMD dates
        emdDate: escrow.emd_date || null,
        
        // Additional dates from the system
        actualCoeDate: escrow.actual_coe_date || null,
        contingenciesDate: escrow.contingencies_date || null,
        
        // Include any additional timeline data from JSONB
        ...(escrow.timeline || {})
      };
      
      res.json({
        success: true,
        data: timelineData
      });
      
    } catch (error) {
      console.error('Error fetching escrow timeline:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow timeline'
        }
      });
    }
  }

  /**
   * Get escrow financials
   */
  static async getEscrowFinancials(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT 
          purchase_price,
          earnest_money_deposit,
          commission_percentage,
          gross_commission,
          my_commission,
          commission_adjustments,
          expense_adjustments,
          financials,
          expenses
        FROM escrows
        WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      const escrow = result.rows[0];
      const financials = escrow.financials || {};
      const expenses = escrow.expenses || [];
      
      // Calculate total expenses
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      // Build financial data response matching SkySlope Books format
      const data = {
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        earnestMoneyDeposit: parseFloat(escrow.earnest_money_deposit) || 0,
        
        // Deal Cost Breakdown
        dealCostBreakdown: {
          baseCommission: parseFloat(escrow.gross_commission) || 0,
          grossCommission: parseFloat(escrow.gross_commission) || 0,
          grossCommissionFees: parseFloat(financials.grossCommissionFees) || 0,
          referralFees: parseFloat(financials.referralFees) || 0,
          adjustedGross: (parseFloat(escrow.gross_commission) || 0) - (parseFloat(financials.grossCommissionFees) || 0),
          netCommission: parseFloat(escrow.my_commission) || 0,
          dealExpense: parseFloat(financials.franchiseFees) || 0,
          franchiseFees: parseFloat(financials.franchiseFees) || 0,
          dealNet: (parseFloat(escrow.my_commission) || 0) - (parseFloat(financials.franchiseFees) || 0)
        },
        
        // Agent Cost Breakdown
        agentCostBreakdown: {
          dealNet: (parseFloat(escrow.my_commission) || 0) - (parseFloat(financials.franchiseFees) || 0),
          agentGCI: (parseFloat(escrow.my_commission) || 0) - (parseFloat(financials.franchiseFees) || 0),
          agentSplit: parseFloat(financials.agentSplit?.grossAgentCommission) || 0,
          splitPercentage: parseFloat(financials.agentSplit?.splitPercentage) || 75,
          transactionFee: parseFloat(financials.agentSplit?.transactionFee) || 285,
          tcFee: parseFloat(financials.agentSplit?.tcFee) || 250,
          agent1099Income: parseFloat(financials.agentSplit?.agent1099Income) || 0,
          excessPayment: parseFloat(financials.agentSplit?.agent1099Income) || 0,
          agentNet: parseFloat(financials.agentSplit?.agent1099Income) || 0
        },
        
        // Commission Details
        commissionBreakdown: {
          commissionPercentage: parseFloat(escrow.commission_percentage) || 3,
          grossCommission: parseFloat(escrow.gross_commission) || 0,
          myCommission: parseFloat(escrow.my_commission) || 0,
          commissionAdjustments: parseFloat(escrow.commission_adjustments) || 0,
          expenseAdjustments: parseFloat(escrow.expense_adjustments) || 0,
          netCommission: (parseFloat(escrow.my_commission) || 0) + 
                        (parseFloat(escrow.commission_adjustments) || 0) + 
                        (parseFloat(escrow.expense_adjustments) || 0)
        },
        
        // Expenses
        expenses: expenses,
        expensesPaidThroughEscrow: expenses.filter(e => e.paidThroughEscrow === true),
        totalExpenses: totalExpenses,
        
        // Additional stored financials
        ...financials
      };
      
      res.json({
        success: true,
        data: data
      });
      
    } catch (error) {
      console.error('Error fetching escrow financials:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow financials'
        }
      });
    }
  }

  /**
   * Get escrow checklists
   */
  static async getEscrowChecklists(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT checklists
        FROM escrows
        WHERE ${isUUID ? 'id = $1::uuid' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      // Default checklist structure with all items false
      const defaultChecklists = {
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
      };
      
      // Merge stored data with defaults to ensure all keys exist
      const checklists = result.rows[0].checklists ? 
        {
          loan: { ...defaultChecklists.loan, ...(result.rows[0].checklists.loan || {}) },
          house: { ...defaultChecklists.house, ...(result.rows[0].checklists.house || result.rows[0].checklists.home || {}) },
          admin: { ...defaultChecklists.admin, ...(result.rows[0].checklists.admin || {}) }
        } : defaultChecklists;
      
      res.json({
        success: true,
        data: checklists
      });
      
    } catch (error) {
      console.error('Error fetching escrow checklists:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow checklists'
        }
      });
    }
  }

  /**
   * Get escrow documents
   */
  static async getEscrowDocuments(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT documents
        FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      const documents = result.rows[0].documents || [];
      
      res.json({
        success: true,
        data: documents
      });
      
    } catch (error) {
      console.error('Error fetching escrow documents:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow documents'
        }
      });
    }
  }

  /**
   * Get escrow property details
   */
  static async getEscrowPropertyDetails(req, res) {
    try {
      const { id } = req.params;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        SELECT 
          property_address, property_type, purchase_price,
          bedrooms, bathrooms, square_feet, lot_size_sqft, year_built, garage_spaces, stories,
          pool, spa, view_type, architectural_style, property_condition, zoning,
          apn, mls_number, county, city, state, zip_code, subdivision, cross_streets,
          latitude, longitude, hoa_fee, hoa_frequency, hoa_name, gated_community, senior_community,
          property_features, property_images, list_price, list_date, days_on_market,
          previous_list_price, original_list_price
        FROM escrows
        WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      const escrow = result.rows[0];
      const storedFeatures = escrow.property_features || {};
      const storedImages = escrow.property_images || [];
      
      const propertyDetails = {
        // Basic property info
        address: escrow.property_address || null,
        city: escrow.city || null,
        state: escrow.state || 'CA',
        zipCode: escrow.zip_code || null,
        county: escrow.county || null,
        
        // Property characteristics
        propertyType: escrow.property_type || 'Single Family',
        bedrooms: escrow.bedrooms || null,
        bathrooms: escrow.bathrooms || null,
        squareFeet: escrow.square_feet || null,
        lotSizeSqft: escrow.lot_size_sqft || null,
        yearBuilt: escrow.year_built || null,
        stories: escrow.stories || null,
        garageSpaces: escrow.garage_spaces || null,
        
        // Property features
        pool: escrow.pool || false,
        spa: escrow.spa || false,
        viewType: escrow.view_type || null,
        architecturalStyle: escrow.architectural_style || null,
        propertyCondition: escrow.property_condition || null,
        zoning: escrow.zoning || null,
        
        // Location details
        subdivision: escrow.subdivision || null,
        crossStreets: escrow.cross_streets || null,
        latitude: escrow.latitude || null,
        longitude: escrow.longitude || null,
        
        // Identifiers
        apn: escrow.apn || null,
        mlsNumber: escrow.mls_number || null,
        
        // HOA information
        hoaFee: escrow.hoa_fee || null,
        hoaFrequency: escrow.hoa_frequency || null,
        hoaName: escrow.hoa_name || null,
        gatedCommunity: escrow.gated_community || false,
        seniorCommunity: escrow.senior_community || false,
        
        // Listing information
        listPrice: escrow.list_price || null,
        listDate: escrow.list_date || null,
        daysOnMarket: escrow.days_on_market || null,
        previousListPrice: escrow.previous_list_price || null,
        originalListPrice: escrow.original_list_price || null,
        
        // Additional features from JSONB
        features: storedFeatures,
        images: storedImages,
        
        // Pricing
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        pricePerSqft: escrow.square_feet && escrow.purchase_price ? 
          Math.round(parseFloat(escrow.purchase_price) / escrow.square_feet) : null
      };
      
      res.json({
        success: true,
        data: propertyDetails
      });
      
    } catch (error) {
      console.error('Error fetching escrow property details:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow property details'
        }
      });
    }
  }
  /**
   * Update escrow people
   */
  static async updateEscrowPeople(req, res) {
    try {
      const { id } = req.params;
      const people = req.body;
      
      const isUUIDFormat = /^[0-9a-f]+-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        UPDATE escrows
        SET people = $2, updated_at = NOW()
        WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
        RETURNING id
      `;
      
      const result = await pool.query(query, [id, JSON.stringify(people)]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      res.json({
        success: true,
        data: people,
        message: 'Escrow people updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating escrow people:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update escrow people'
        }
      });
    }
  }

  /**
   * Update escrow checklists
   */
  static async updateEscrowChecklists(req, res) {
    try {
      const { id } = req.params;
      const checklists = req.body;
      
      const isUUIDFormat = /^[0-9a-f]+-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const query = `
        UPDATE escrows
        SET checklists = $2, updated_at = NOW()
        WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
        RETURNING id
      `;
      
      const result = await pool.query(query, [id, JSON.stringify(checklists)]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }
      
      res.json({
        success: true,
        data: checklists,
        message: 'Escrow checklists updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating escrow checklists:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update escrow checklists'
        }
      });
    }
  }
}

module.exports = SimpleEscrowController;