const { pool, query, transaction } = require('../config/database');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// Helper to generate escrow number
function generateEscrowNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900) + 100;
  return `ESC-${year}-${random}`;
}

// Get all escrows with filtering and pagination
exports.getEscrows = async (req, res) => {
  try {
    const {
      status,
      dateRangeStart,
      dateRangeEnd,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereConditions = ['e.deleted_at IS NULL'];

    // Add filters
    if (status) {
      params.push(status);
      whereConditions.push(`e.escrow_status = $${params.length}`);
    }

    if (dateRangeStart && dateRangeEnd) {
      params.push(dateRangeStart, dateRangeEnd);
      whereConditions.push(`e.closing_date BETWEEN $${params.length - 1} AND $${params.length}`);
    }

    if (minPrice) {
      params.push(minPrice);
      whereConditions.push(`e.purchase_price >= $${params.length}`);
    }

    if (maxPrice) {
      params.push(maxPrice);
      whereConditions.push(`e.purchase_price <= $${params.length}`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM escrows e
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get escrows with pagination
    params.push(limit, offset);
    const escrowsQuery = `
      SELECT 
        e.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', eb.id,
            'name', eb.name,
            'email', eb.email,
            'phone', eb.phone
          )) FILTER (WHERE eb.id IS NOT NULL), 
          '[]'
        ) as buyers,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', es.id,
            'name', es.name,
            'email', es.email,
            'phone', es.phone
          )) FILTER (WHERE es.id IS NOT NULL), 
          '[]'
        ) as sellers
      FROM escrows e
      LEFT JOIN escrow_buyers eb ON e.id = eb.escrow_id
      LEFT JOIN escrow_sellers es ON e.id = es.escrow_id
      ${whereClause}
      GROUP BY e.id
      ORDER BY e.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await query(escrowsQuery, params);

    res.json({
      success: true,
      data: {
        escrows: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching escrows:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch escrows'
      }
    });
  }
};

// Get single escrow with all related data
exports.getEscrow = async (req, res) => {
  try {
    const { id } = req.params;

    // Get escrow with buyers and sellers
    const escrowQuery = `
      SELECT 
        e.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', eb.id,
            'name', eb.name,
            'email', eb.email,
            'phone', eb.phone
          )) FILTER (WHERE eb.id IS NOT NULL), 
          '[]'
        ) as buyers,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', es.id,
            'name', es.name,
            'email', es.email,
            'phone', es.phone
          )) FILTER (WHERE es.id IS NOT NULL), 
          '[]'
        ) as sellers
      FROM escrows e
      LEFT JOIN escrow_buyers eb ON e.id = eb.escrow_id
      LEFT JOIN escrow_sellers es ON e.id = es.escrow_id
      WHERE e.id = $1 AND e.deleted_at IS NULL
      GROUP BY e.id
    `;

    const escrowResult = await query(escrowQuery, [id]);

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

    // Get documents
    const documentsQuery = `
      SELECT * FROM documents 
      WHERE entity_type = 'escrow' AND entity_id = $1 
      ORDER BY created_at DESC
    `;
    const documentsResult = await query(documentsQuery, [id]);

    // Get notes
    const notesQuery = `
      SELECT n.*, u.first_name, u.last_name
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.entity_type = 'escrow' AND n.entity_id = $1
      ORDER BY n.created_at DESC
    `;
    const notesResult = await query(notesQuery, [id]);

    escrow.documents = documentsResult.rows;
    escrow.notes = notesResult.rows;

    res.json({
      success: true,
      data: escrow,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch escrow'
      }
    });
  }
};

// Create new escrow with transaction
exports.createEscrow = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const {
      propertyAddress,
      purchasePrice,
      earnestMoneyDeposit,
      downPayment,
      commissionPercentage = 2.5,
      acceptanceDate,
      closingDate,
      propertyType = 'Single Family',
      leadSource,
      buyers = [],
      sellers = []
    } = req.body;

    const result = await transaction(async (client) => {
      // Generate unique escrow ID
      const escrowId = generateEscrowNumber();
      
      // Calculate financial details
      const loanAmount = purchasePrice - downPayment;
      const grossCommission = purchasePrice * (commissionPercentage / 100);
      const netCommission = grossCommission * 0.9; // Assuming 10% brokerage split

      // Insert escrow
      const escrowQuery = `
        INSERT INTO escrows (
          id, property_address, escrow_status, purchase_price,
          earnest_money_deposit, down_payment, loan_amount,
          commission_percentage, gross_commission, net_commission,
          acceptance_date, closing_date, property_type, lead_source,
          created_by, team_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING *
      `;

      const escrowValues = [
        escrowId,
        propertyAddress,
        'Active',
        purchasePrice,
        earnestMoneyDeposit || purchasePrice * 0.01,
        downPayment,
        loanAmount,
        commissionPercentage,
        grossCommission,
        netCommission,
        acceptanceDate,
        closingDate,
        propertyType,
        leadSource,
        req.user?.id || null,
        req.user?.team_id || null
      ];

      const escrowResult = await client.query(escrowQuery, escrowValues);
      const escrow = escrowResult.rows[0];

      // Insert buyers
      if (buyers.length > 0) {
        const buyerValues = buyers.flatMap((buyer, index) => [
          escrowId,
          buyer.name,
          buyer.email || null,
          buyer.phone || null
        ]);

        const buyerQuery = `
          INSERT INTO escrow_buyers (escrow_id, name, email, phone)
          VALUES ${buyers.map((_, i) => `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`).join(', ')}
          RETURNING *
        `;

        const buyersResult = await client.query(buyerQuery, buyerValues);
        escrow.buyers = buyersResult.rows;
      }

      // Insert sellers
      if (sellers.length > 0) {
        const sellerValues = sellers.flatMap((seller, index) => [
          escrowId,
          seller.name,
          seller.email || null,
          seller.phone || null
        ]);

        const sellerQuery = `
          INSERT INTO escrow_sellers (escrow_id, name, email, phone)
          VALUES ${sellers.map((_, i) => `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`).join(', ')}
          RETURNING *
        `;

        const sellersResult = await client.query(sellerQuery, sellerValues);
        escrow.sellers = sellersResult.rows;
      }

      return escrow;
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('escrows').emit('escrow:created', result);
    }

    logger.info('New escrow created', {
      escrowId: result.id,
      propertyAddress: result.property_address,
      purchasePrice: result.purchase_price
    });

    res.status(201).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create escrow'
      }
    });
  }
};

// Update escrow
exports.updateEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      // Map camelCase to snake_case
      const columnMap = {
        propertyAddress: 'property_address',
        escrowStatus: 'escrow_status',
        purchasePrice: 'purchase_price',
        earnestMoneyDeposit: 'earnest_money_deposit',
        downPayment: 'down_payment',
        loanAmount: 'loan_amount',
        commissionPercentage: 'commission_percentage',
        grossCommission: 'gross_commission',
        netCommission: 'net_commission',
        acceptanceDate: 'acceptance_date',
        closingDate: 'closing_date',
        propertyType: 'property_type',
        leadSource: 'lead_source'
      };

      const column = columnMap[key];
      if (column) {
        updateFields.push(`${column} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No valid fields to update'
        }
      });
    }

    // Add updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add id as last parameter
    values.push(id);

    const updateQuery = `
      UPDATE escrows 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('escrows').emit('escrow:updated', result.rows[0]);
    }

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update escrow'
      }
    });
  }
};

// Soft delete escrow
exports.deleteEscrow = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = `
      UPDATE escrows 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, property_address
    `;

    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('escrows').emit('escrow:deleted', { id });
    }

    logger.info('Escrow soft deleted', { 
      escrowId: id, 
      deletedBy: req.user?.email || 'unknown' 
    });

    res.json({
      success: true,
      data: {
        message: 'Escrow deleted successfully',
        escrow: result.rows[0]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete escrow'
      }
    });
  }
};

// Update checklist item
exports.updateChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { checklistUpdates } = req.body;

    // For now, store checklist in a JSON column or separate table
    // This is a placeholder implementation
    const updateQuery = `
      UPDATE escrows 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await query(updateQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`escrow:${id}`).emit('checklist:updated', {
        escrowId: id,
        updates: checklistUpdates
      });
    }

    res.json({
      success: true,
      data: {
        escrowId: id,
        checklistUpdates
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update checklist'
      }
    });
  }
};

// Add note to escrow
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isPrivate = false } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Note content is required'
        }
      });
    }

    const noteQuery = `
      INSERT INTO notes (
        entity_type, entity_id, content, is_private, 
        created_by, team_id
      ) VALUES (
        'escrow', $1, $2, $3, $4, $5
      ) RETURNING *
    `;

    const values = [
      id,
      content,
      isPrivate,
      req.user?.id || null,
      req.user?.team_id || null
    ];

    const result = await query(noteQuery, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to add note'
      }
    });
  }
};

// Upload document for escrow
exports.uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName, filePath, fileSize, mimeType, documentType } = req.body;

    if (!fileName || !filePath) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'File name and path are required'
        }
      });
    }

    const documentQuery = `
      INSERT INTO documents (
        entity_type, entity_id, document_type, file_name, 
        file_path, file_size, mime_type, uploaded_by, team_id
      ) VALUES (
        'escrow', $1, $2, $3, $4, $5, $6, $7, $8
      ) RETURNING *
    `;

    const values = [
      id,
      documentType,
      fileName,
      filePath,
      fileSize,
      mimeType,
      req.user?.id || null,
      req.user?.team_id || null
    ];

    const result = await query(documentQuery, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload document'
      }
    });
  }
};

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Get counts by status
    const statusQuery = `
      SELECT 
        escrow_status,
        COUNT(*) as count,
        SUM(purchase_price) as total_value,
        AVG(purchase_price) as avg_value
      FROM escrows
      WHERE deleted_at IS NULL
      GROUP BY escrow_status
    `;
    const statusResult = await query(statusQuery);

    // Get monthly stats
    const monthlyQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count,
        SUM(purchase_price) as total_value,
        SUM(gross_commission) as total_commission
      FROM escrows
      WHERE deleted_at IS NULL 
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;
    const monthlyResult = await query(monthlyQuery);

    // Get upcoming closings
    const upcomingQuery = `
      SELECT 
        COUNT(*) as count,
        MIN(closing_date) as next_closing
      FROM escrows
      WHERE deleted_at IS NULL 
        AND closing_date >= CURRENT_DATE
        AND escrow_status = 'Active'
    `;
    const upcomingResult = await query(upcomingQuery);

    // Get total commission stats
    const commissionQuery = `
      SELECT 
        SUM(gross_commission) as total_gross_commission,
        SUM(net_commission) as total_net_commission,
        AVG(commission_percentage) as avg_commission_rate
      FROM escrows
      WHERE deleted_at IS NULL
        AND escrow_status = 'Closed'
    `;
    const commissionResult = await query(commissionQuery);

    res.json({
      success: true,
      data: {
        byStatus: statusResult.rows,
        monthly: monthlyResult.rows,
        upcoming: upcomingResult.rows[0],
        commission: commissionResult.rows[0],
        summary: {
          totalActiveEscrows: statusResult.rows.find(s => s.escrow_status === 'Active')?.count || 0,
          totalActiveValue: statusResult.rows.find(s => s.escrow_status === 'Active')?.total_value || 0,
          totalClosedThisYear: statusResult.rows.find(s => s.escrow_status === 'Closed')?.count || 0
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch statistics'
      }
    });
  }
};

// Keep the existing parseRPA function
exports.parseRPA = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No PDF file uploaded'
        }
      });
    }

    logger.info('Processing RPA PDF upload:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // For now, return mock parsed data since pdf-parse is not installed
    const mockExtractedData = {
      propertyAddress: '123 Mock Street, Test City, CA 90210',
      purchasePrice: '500000',
      acceptanceDate: new Date(),
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      buyers: [{ name: 'John Doe', email: 'john@example.com', phone: '555-1234' }],
      sellers: [{ name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678' }],
      _confidence: {
        propertyAddress: 'high',
        purchasePrice: 'high',
        buyers: 'high',
        sellers: 'high'
      }
    };

    logger.info('RPA parsing completed (mock):', {
      extractedFields: Object.keys(mockExtractedData).filter(key => mockExtractedData[key] && key !== '_confidence')
    });

    res.json({
      success: true,
      data: {
        extractedData: mockExtractedData,
        textLength: 1000, // Mock text length
        confidence: mockExtractedData._confidence || {}
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error parsing RPA:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Failed to parse RPA document'
      }
    });
  }
};