const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
const skyslopeService = require('../services/skyslope');
const commissionService = require('../modules/core-modules/escrows/services/commission');
const { pool } = require('../config/database');

// SECURITY: All SkySlope integration routes require authentication
router.use(authenticate);

/**
 * GET /v1/skyslope/escrows/:id/documents
 * Get documents for an escrow from SkySlope
 */
router.get('/escrows/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;

    // Get escrow with SkySlope ID
    const escrowQuery = 'SELECT * FROM escrows WHERE id = $1';
    const escrowResult = await pool.query(escrowQuery, [id]);

    if (escrowResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    const escrow = escrowResult.rows[0];

    if (!escrow.skyslope_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_SKYSLOPE_ID',
          message: 'Escrow not linked to SkySlope',
        },
      });
    }

    // Get documents from SkySlope
    const documents = await skyslopeService.getEscrowDocuments(escrow);

    // Get locally tracked documents
    const localDocsQuery = `
      SELECT * FROM escrow_skyslope_documents 
      WHERE escrow_id = $1 
      ORDER BY created_at DESC
    `;
    const localDocsResult = await pool.query(localDocsQuery, [id]);

    res.json({
      success: true,
      data: {
        skyslopeId: escrow.skyslope_id,
        documents,
        localDocuments: localDocsResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching SkySlope documents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch documents from SkySlope',
      },
    });
  }
});

/**
 * GET /v1/skyslope/templates/:transactionType
 * Get document templates for a transaction type
 */
router.get('/templates/:transactionType', async (req, res) => {
  try {
    const { transactionType } = req.params;
    const { state = 'CA' } = req.query;

    const templates = await skyslopeService.getDocumentTemplates(transactionType, state);

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch document templates',
      },
    });
  }
});

/**
 * POST /v1/skyslope/escrows/:id/sync
 * Sync escrow with SkySlope
 */
router.post('/escrows/:id/sync', async (req, res) => {
  try {
    const { id } = req.params;

    // Get escrow data
    const escrowQuery = 'SELECT * FROM escrows WHERE id = $1';
    const escrowResult = await pool.query(escrowQuery, [id]);

    if (escrowResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    const escrow = escrowResult.rows[0];

    // Sync with SkySlope
    const syncResult = await skyslopeService.syncEscrowWithSkySlope(escrow);

    if (syncResult.success) {
      // Update escrow with SkySlope ID
      const updateQuery = `
        UPDATE escrows 
        SET 
          skyslope_id = $2,
          skyslope_type = $3,
          skyslope_sync_status = 'synced',
          skyslope_last_sync = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const transactionType = skyslopeService.determineTransactionType(escrow);
      const updateResult = await pool.query(updateQuery, [
        id,
        syncResult.skyslopeId,
        transactionType,
      ]);

      res.json({
        success: true,
        data: {
          escrow: updateResult.rows[0],
          skyslope: syncResult.data,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: {
          code: 'SYNC_FAILED',
          message: syncResult.error,
        },
      });
    }
  } catch (error) {
    console.error('Error syncing with SkySlope:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to sync with SkySlope',
      },
    });
  }
});

/**
 * POST /v1/skyslope/escrows/:id/documents
 * Upload document to SkySlope
 */
router.post('/escrows/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      documentName, documentCode, documentType, file,
    } = req.body;

    // Get escrow with SkySlope ID
    const escrowQuery = 'SELECT * FROM escrows WHERE id = $1';
    const escrowResult = await pool.query(escrowQuery, [id]);

    if (escrowResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    const escrow = escrowResult.rows[0];

    if (!escrow.skyslope_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_SKYSLOPE_ID',
          message: 'Escrow not linked to SkySlope',
        },
      });
    }

    // Upload to SkySlope
    const uploadResult = await skyslopeService.uploadDocument(
      escrow.skyslope_id,
      escrow.skyslope_type || 'sale',
      {
        documentName, documentCode, documentType, file,
      },
    );

    // Track in local database
    const insertQuery = `
      INSERT INTO escrow_skyslope_documents
      (escrow_id, skyslope_document_id, document_name, document_code, document_type, status, uploaded_date)
      VALUES ($1, $2, $3, $4, $5, 'uploaded', NOW())
      RETURNING *
    `;

    const insertResult = await pool.query(insertQuery, [
      id,
      uploadResult.data.id,
      documentName,
      documentCode,
      documentType,
    ]);

    res.json({
      success: true,
      data: insertResult.rows[0],
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to upload document',
      },
    });
  }
});

/**
 * GET /v1/skyslope/commission/:escrowId
 * Get commission breakdown for an escrow
 */
router.get('/commission/:escrowId', async (req, res) => {
  try {
    const { escrowId } = req.params;

    // Get escrow data
    const escrowQuery = 'SELECT * FROM escrows WHERE id = $1';
    const escrowResult = await pool.query(escrowQuery, [escrowId]);

    if (escrowResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    const escrow = escrowResult.rows[0];

    // Get YTD GCI at the time of transaction
    const ytdGci = escrow.ytd_gci || await commissionService.getYtdGciAtDate(
      escrow.closing_date || escrow.acceptance_date,
    );

    // Calculate commission breakdown
    const breakdown = await commissionService.calculateCommissionBreakdown(escrow, ytdGci);

    res.json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to calculate commission',
      },
    });
  }
});

/**
 * POST /v1/skyslope/commission/:escrowId/update
 * Update escrow with commission calculations
 */
router.post('/commission/:escrowId/update', async (req, res) => {
  try {
    const { escrowId } = req.params;

    const updatedEscrow = await commissionService.updateEscrowCommission(escrowId);

    res.json({
      success: true,
      data: updatedEscrow,
    });
  } catch (error) {
    console.error('Error updating commission:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update commission data',
      },
    });
  }
});

/**
 * GET /v1/skyslope/commission/ytd
 * Get current year-to-date GCI
 */
router.get('/commission/ytd', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const ytdGci = await commissionService.getCurrentYtdGci(parseInt(year));

    // Get breakdown by quarter
    const quarterlyQuery = `
      SELECT 
        EXTRACT(QUARTER FROM closing_date) as quarter,
        COUNT(*) as transaction_count,
        SUM(my_commission) as quarter_gci
      FROM escrows
      WHERE 
        EXTRACT(YEAR FROM closing_date) = $1
        AND escrow_status = 'Closed'
      GROUP BY EXTRACT(QUARTER FROM closing_date)
      ORDER BY quarter
    `;

    const quarterlyResult = await pool.query(quarterlyQuery, [year]);

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        ytdGci,
        quarterlyBreakdown: quarterlyResult.rows,
        currentSplitTier: ytdGci >= 100000 ? '100%' : ytdGci >= 50000 ? '80%' : '70%',
        nextTierThreshold: ytdGci >= 100000 ? null : ytdGci >= 50000 ? 100000 : 50000,
        amountToNextTier: ytdGci >= 100000 ? 0 : ytdGci >= 50000 ? 100000 - ytdGci : 50000 - ytdGci,
      },
    });
  } catch (error) {
    console.error('Error getting YTD GCI:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get YTD GCI',
      },
    });
  }
});

module.exports = router;
