const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorLogging');

class SimpleEscrowController {
  /**
   * Get all escrows with buyers and sellers for list view
   */
  static async getAllEscrows(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        sort = 'created_at',
        order = 'desc',
        search
      } = req.query;

      const offset = (page - 1) * limit;

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
      const countResult = await pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);

      // Main query - simplified with data directly from escrows table
      queryParams.push(limit, offset);
      // Environment suffix is now added during seeding, not here
      const envSuffix = '';
      
      const listQuery = `
        SELECT 
          numeric_id as id,
          display_id as "displayId",
          display_id as "escrowNumber",
          property_address || '${envSuffix}' as "propertyAddress",
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' as "propertyImage",
          escrow_status as "escrowStatus",
          property_type as "transactionType",
          purchase_price as "purchasePrice",
          net_commission as "myCommission",
          '[]'::jsonb as clients,
          COALESCE(TO_CHAR(acceptance_date, 'YYYY-MM-DD'), TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) as "acceptanceDate",
          COALESCE(TO_CHAR(closing_date, 'YYYY-MM-DD'), TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD')) as "scheduledCoeDate",
          CASE 
            WHEN closing_date IS NOT NULL 
            THEN DATE_PART('day', closing_date::timestamp - CURRENT_TIMESTAMP)::integer
            ELSE 0
          END as "daysToClose",
          64 as "checklistProgress",
          'medium' as "priorityLevel",
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

      const listResult = await pool.query(listQuery, queryParams);

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
      
      // Determine if ID is numeric or display format
      const isNumeric = /^\d+$/.test(id);
      
      // Get escrow details
      const escrowQuery = `
        SELECT 
          e.*,
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800' as propertyImage
        FROM escrows e
        WHERE ${isNumeric ? 'e.numeric_id = $1::integer' : 'e.display_id = $1'}
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
      
      // Fetch all related data in parallel
      // Use display_id for helper table queries
      const displayId = escrow.display_id;
      
      console.log('Processing escrow:', displayId, 'Environment:', process.env.NODE_ENV);
      
      // Get checklist data - try both formats (JSONB and individual rows)
      let checklistResult = { rows: [] };
      try {
        // First try JSONB format (local schema)
        checklistResult = await pool.query(`
          SELECT checklist_items 
          FROM escrow_checklists 
          WHERE escrow_display_id = $1
        `, [displayId]);
      } catch (e) {
        // Try individual rows format (production schema)
        try {
          checklistResult = await pool.query(`
            SELECT * FROM escrow_checklists 
            WHERE escrow_display_id = $1
            ORDER BY task_order
          `, [displayId]);
        } catch (e2) {
          console.log('Checklist query failed for both formats');
        }
      }
      
      // Initialize empty arrays for helper data
      let peopleResult = { rows: [] };
      let timelineResult = { rows: [] };
      let financialsResult = { rows: [] };
      let documentsResult = { rows: [] };
      
      // Try to get people data (only exists in local schema)
      try {
        peopleResult = await pool.query(`
          SELECT * FROM escrow_people 
          WHERE escrow_display_id = $1
          ORDER BY person_type, name
        `, [displayId]);
      } catch (e) {
        console.log('escrow_people query failed:', e.message);
      }
      
      // Try local schema first (uses escrow_display_id)
      try {
        timelineResult = await pool.query(`
          SELECT * FROM escrow_timeline 
          WHERE escrow_display_id = $1
          ORDER BY order_index, scheduled_date
        `, [displayId]);
      } catch (e) {
        // Try production schema (uses display_id as escrow_id)
        try {
          timelineResult = await pool.query(`
            SELECT * FROM escrow_timeline 
            WHERE escrow_id = $1
            ORDER BY event_date
          `, [displayId]);
        } catch (e2) {
          console.log('escrow_timeline query failed for both schemas');
        }
      }
      
      // Try local schema first for financials
      try {
        financialsResult = await pool.query(`
          SELECT * FROM escrow_financials 
          WHERE escrow_display_id = $1
          ORDER BY order_index, item_category
        `, [displayId]);
      } catch (e) {
        // Try production schema
        try {
          financialsResult = await pool.query(`
            SELECT * FROM escrow_financials 
            WHERE escrow_id = $1
            ORDER BY category
          `, [displayId]);
        } catch (e2) {
          console.log('escrow_financials query failed for both schemas');
        }
      }
      
      // Try local schema first for documents
      try {
        documentsResult = await pool.query(`
          SELECT * FROM escrow_documents 
          WHERE escrow_display_id = $1
          ORDER BY order_index, document_type
        `, [displayId]);
      } catch (e) {
        // Try production schema
        try {
          documentsResult = await pool.query(`
            SELECT * FROM escrow_documents 
            WHERE escrow_id = $1
            ORDER BY document_type
          `, [displayId]);
        } catch (e2) {
          console.log('escrow_documents query failed for both schemas');
        }
      }

      // Process checklist data for progress calculation
      let checklists = [];
      
      if (checklistResult.rows.length > 0) {
        if (checklistResult.rows[0].checklist_items) {
          // JSONB format (local)
          checklists = checklistResult.rows[0].checklist_items;
        } else {
          // Individual rows format (production)
          checklists = checklistResult.rows.map(row => ({
            phase: row.phase,
            task_name: row.task_name,
            task_description: row.task_description,
            is_completed: row.is_completed,
            due_date: row.due_date,
            completed_date: row.completed_date,
            order: row.task_order
          }));
        }
      }
      const checklistByPhase = {
        opening: checklists.filter(c => c.phase === 'opening'),
        processing: checklists.filter(c => c.phase === 'processing'),
        closing: checklists.filter(c => c.phase === 'closing')
      };

      const checklistProgress = {
        phase1: {
          completed: checklistByPhase.opening.filter(c => c.is_completed).length,
          total: checklistByPhase.opening.length,
          percentage: checklistByPhase.opening.length > 0 
            ? Math.round((checklistByPhase.opening.filter(c => c.is_completed).length / checklistByPhase.opening.length) * 100)
            : 0
        },
        phase2: {
          completed: checklistByPhase.processing.filter(c => c.is_completed).length,
          total: checklistByPhase.processing.length,
          percentage: checklistByPhase.processing.length > 0
            ? Math.round((checklistByPhase.processing.filter(c => c.is_completed).length / checklistByPhase.processing.length) * 100)
            : 0
        },
        phase3: {
          completed: checklistByPhase.closing.filter(c => c.is_completed).length,
          total: checklistByPhase.closing.length,
          percentage: checklistByPhase.closing.length > 0
            ? Math.round((checklistByPhase.closing.filter(c => c.is_completed).length / checklistByPhase.closing.length) * 100)
            : 0
        }
      };

      checklistProgress.overall = {
        completed: checklistProgress.phase1.completed + checklistProgress.phase2.completed + checklistProgress.phase3.completed,
        total: checklistProgress.phase1.total + checklistProgress.phase2.total + checklistProgress.phase3.total,
        percentage: Math.round(((checklistProgress.phase1.completed + checklistProgress.phase2.completed + checklistProgress.phase3.completed) / 
                              (checklistProgress.phase1.total + checklistProgress.phase2.total + checklistProgress.phase3.total)) * 100) || 0
      };

      // Process people data
      const people = peopleResult.rows;
      const buyer = people.find(p => p.person_type === 'buyer') || null;
      const seller = people.find(p => p.person_type === 'seller') || null;
      const buyerAgent = people.find(p => p.person_type === 'buyer_agent') || null;
      const listingAgent = people.find(p => p.person_type === 'listing_agent') || null;
      
      // Environment suffix is now added during seeding, not here
      const envSuffix = '';

      // Format the response
      let response;
      try {
        response = {
        id: escrow.numeric_id,  // Numeric ID for URLs
        displayId: escrow.display_id,  // Display ID for business use
        escrowNumber: escrow.escrow_number || escrow.display_id,
        propertyAddress: escrow.property_address + envSuffix,
        propertyImage: escrow.propertyImage,
        escrowStatus: escrow.escrow_status,
        transactionType: escrow.property_type || 'Single Family',
        purchasePrice: parseFloat(escrow.purchase_price) || 0,
        earnestMoneyDeposit: parseFloat(escrow.earnest_money_deposit) || 0,
        downPayment: parseFloat(escrow.down_payment) || 0,
        loanAmount: parseFloat(escrow.loan_amount) || 0,
        commissionPercentage: parseFloat(escrow.commission_percentage) || 0,
        grossCommission: parseFloat(escrow.gross_commission) || 0,
        myCommission: parseFloat(escrow.net_commission) || 0,
        acceptanceDate: escrow.acceptance_date ? 
          (typeof escrow.acceptance_date === 'string' ? escrow.acceptance_date.split('T')[0] : new Date(escrow.acceptance_date).toISOString().split('T')[0]) 
          : new Date().toISOString().split('T')[0],
        scheduledCoeDate: escrow.closing_date ? 
          (typeof escrow.closing_date === 'string' ? escrow.closing_date.split('T')[0] : new Date(escrow.closing_date).toISOString().split('T')[0])
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        propertyType: escrow.property_type,
        leadSource: escrow.lead_source,
        
        // Participants
        buyer: buyer,
        seller: seller,
        buyerAgent: buyerAgent,
        listingAgent: listingAgent,
        participants: people, // All people associated with this escrow
        
        // Checklist
        checklist: checklists,
        checklistProgress: checklistProgress,
        
        // Timeline with all milestone data - handle both schemas
        timeline: timelineResult.rows.map(event => ({
          id: event.id,
          eventName: event.event_name || event.event_type,
          description: event.event_description || event.description,
          type: event.event_type,
          scheduledDate: event.scheduled_date || event.event_date,
          completedDate: event.completed_date,
          isCompleted: event.is_completed || false,
          isCritical: event.is_critical || false,
          responsibleParty: event.responsible_party || event.created_by,
          notes: event.notes || (event.metadata ? JSON.stringify(event.metadata) : null)
        })),
        
        // Financial calculations for every dollar amount - handle both schemas
        financials: financialsResult.rows.map(item => ({
          id: item.id,
          name: item.item_name || item.description,
          category: item.item_category || item.category,
          amount: parseFloat(item.amount),
          partyResponsible: item.party_responsible || item.payer,
          partyReceiving: item.party_receiving || item.payee,
          calculationBasis: item.calculation_basis || item.notes,
          isEstimate: item.is_estimate || false,
          dueDate: item.due_date,
          paidDate: item.paid_date,
          isPaid: item.is_paid || false,
          notes: item.notes
        })),
        
        // Documents checklist with document links - handle both schemas
        documents: documentsResult.rows.map(doc => ({
          id: doc.id,
          name: doc.document_name || doc.name,
          type: doc.document_type || doc.type,
          status: doc.document_status || doc.status || 'pending',
          isRequired: doc.is_required !== false,
          dueDate: doc.due_date,
          receivedDate: doc.received_date || doc.uploaded_at,
          documentUrl: doc.document_url || doc.file_url,
          documentId: doc.document_id,
          uploadedBy: doc.uploaded_by || doc.created_by,
          signedByBuyer: doc.signed_by_buyer || false,
          signedBySeller: doc.signed_by_seller || false,
          signedByAgents: doc.signed_by_agents || false,
          notes: doc.notes
        })),
        
        // Property details (still using defaults for now)
        propertyDetails: {
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1850,
          yearBuilt: 2005,
          lotSize: '7,500 sqft',
          propertyTax: '$8,500/year',
          hoaFees: '$350/month'
        },
        
        // Activity stats
        activityStats: {
          daysInEscrow: escrow.closing_date ? 
            Math.floor((new Date() - new Date(escrow.acceptance_date || escrow.created_at)) / (24 * 60 * 60 * 1000)) : 0,
          daysToClose: escrow.closing_date ? 
            Math.floor((new Date(escrow.closing_date) - new Date()) / (24 * 60 * 60 * 1000)) : 0,
          tasksCompletedToday: checklists.filter(c => 
            c.completed_date && new Date(c.completed_date).toDateString() === new Date().toDateString()
          ).length,
          upcomingDeadlines: checklists.filter(c => 
            !c.is_completed && c.due_date && new Date(c.due_date) > new Date()
          ).length,
          documentsUploaded: documentsResult.rows.length,
          communicationScore: 95
        },
        
        importantNotes: 'Buyer pre-approved for loan. Inspection scheduled for next week.',
        
        created_at: escrow.created_at ? 
          (typeof escrow.created_at === 'string' ? escrow.created_at : new Date(escrow.created_at).toISOString()) 
          : new Date().toISOString(),
        updated_at: escrow.updated_at ? 
          (typeof escrow.updated_at === 'string' ? escrow.updated_at : new Date(escrow.updated_at).toISOString())
          : new Date().toISOString()
      };
      } catch (buildError) {
        console.error('Error building response:', buildError);
        console.error('Error stack:', buildError.stack);
        throw buildError;
      }

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      console.error('Error fetching escrow:', error);
      console.error('Stack trace:', error.stack);
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
   * Create a new escrow with auto-incrementing ID and helper tables
   */
  static async createEscrow(req, res) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const escrowData = req.body;
      
      // Get the next display ID in the format ESC-YYYY-XXXX
      const year = new Date().getFullYear();
      const idResult = await client.query(
        `SELECT display_id FROM escrows WHERE display_id LIKE 'ESC-${year}-%'`
      );
      
      let maxNumber = 0;
      idResult.rows.forEach(row => {
        const parts = row.display_id.split('-');
        if (parts.length === 3) {
          const num = parseInt(parts[2]);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      });
      
      const nextNumber = maxNumber + 1;
      const displayId = `ESC-${year}-${nextNumber.toString().padStart(4, '0')}`;
      
      // Insert the new escrow
      const insertQuery = `
        INSERT INTO escrows (
          display_id, property_address, escrow_status, purchase_price,
          earnest_money_deposit, down_payment, loan_amount,
          commission_percentage, gross_commission, net_commission,
          acceptance_date, closing_date, property_type, lead_source,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        displayId,
        escrowData.property_address,
        escrowData.escrow_status || 'Active',
        escrowData.purchase_price,
        escrowData.earnest_money_deposit || escrowData.purchase_price * 0.01,
        escrowData.down_payment || escrowData.purchase_price * 0.2,
        escrowData.loan_amount || escrowData.purchase_price * 0.8,
        escrowData.commission_percentage || 2.5,
        escrowData.gross_commission || escrowData.purchase_price * (escrowData.commission_percentage || 2.5) / 100,
        escrowData.net_commission || escrowData.purchase_price * (escrowData.commission_percentage || 2.5) / 100 * 0.5,
        escrowData.acceptance_date || new Date().toISOString().split('T')[0],
        escrowData.closing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        escrowData.property_type || 'Single Family',
        escrowData.lead_source || 'Website'
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
      const acceptanceDate = new Date(newEscrow.acceptance_date);
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
      await client.query(checklistQuery, [displayId, JSON.stringify(checklistWithDates)]);
      
      await client.query('COMMIT');
      
      // Return success with both IDs
      res.status(201).json({
        success: true,
        data: {
          id: newEscrow.numeric_id,
          displayId: displayId,
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
}

module.exports = SimpleEscrowController;