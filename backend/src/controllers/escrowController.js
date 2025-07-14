const Escrow = require('../models/Escrow.enterprise');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * Enterprise Escrow Controller with multi-tenancy support
 */
class EscrowController {
  /**
   * Get all escrows with advanced filtering
   * GET /api/v1/teams/:teamId/escrows
   */
  static async getAll(req, res) {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;
      
      // Extract query parameters
      const options = {
        userId: req.query.user_id || userId,
        status: req.query.status,
        stage: req.query.stage,
        minPrice: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
        maxPrice: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
        closingDateMin: req.query.closing_date_min,
        closingDateMax: req.query.closing_date_max,
        propertyType: req.query.property_type,
        searchTerm: req.query.search,
        sort: req.query.sort || '-closing_date',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        include: req.query.include ? req.query.include.split(',') : []
      };

      const result = await Escrow.findAll(teamId, options);

      res.json({
        success: true,
        data: result.escrows,
        meta: result.pagination,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching escrows:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrows'
        }
      });
    }
  }

  /**
   * Get single escrow by ID
   * GET /api/v1/teams/:teamId/escrows/:escrowId
   */
  static async getById(req, res) {
    try {
      const { teamId, escrowId } = req.params;
      
      const escrow = await Escrow.findById(teamId, escrowId);
      
      if (!escrow) {
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
        data: escrow,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow'
        }
      });
    }
  }

  /**
   * Create new escrow
   * POST /api/v1/teams/:teamId/escrows
   */
  static async create(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array()
          }
        });
      }

      const { teamId } = req.params;
      const userId = req.user.id;
      const escrowData = req.body;

      // Create escrow
      const escrow = await Escrow.create(teamId, userId, escrowData);

      res.status(201).json({
        success: true,
        data: escrow,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error creating escrow:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create escrow'
        }
      });
    }
  }

  /**
   * Update escrow
   * PUT /api/v1/teams/:teamId/escrows/:escrowId
   */
  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array()
          }
        });
      }

      const { teamId, escrowId } = req.params;
      const updates = req.body;

      const escrow = await Escrow.update(teamId, escrowId, updates);

      res.json({
        success: true,
        data: escrow,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error updating escrow:', error);
      
      if (error.message === 'Escrow not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update escrow'
        }
      });
    }
  }

  /**
   * Delete escrow (soft delete)
   * DELETE /api/v1/teams/:teamId/escrows/:escrowId
   */
  static async delete(req, res) {
    try {
      const { teamId, escrowId } = req.params;

      await Escrow.delete(teamId, escrowId);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting escrow:', error);
      
      if (error.message === 'Escrow not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to delete escrow'
        }
      });
    }
  }

  /**
   * Batch operations
   * POST /api/v1/teams/:teamId/escrows/batch
   */
  static async batch(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array()
          }
        });
      }

      const { teamId } = req.params;
      const userId = req.user.id;
      const { operations } = req.body;

      const result = await Escrow.batch(teamId, userId, operations);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error processing batch operations:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to process batch operations'
        }
      });
    }
  }

  /**
   * Update checklist item
   * PATCH /api/v1/teams/:teamId/escrows/:escrowId/checklist/:itemKey
   */
  static async updateChecklistItem(req, res) {
    try {
      const { teamId, escrowId, itemKey } = req.params;
      const updates = {
        is_completed: req.body.is_completed,
        completed_by: req.user.id,
        notes: req.body.notes
      };

      const item = await Escrow.updateChecklistItem(teamId, escrowId, itemKey, updates);

      res.json({
        success: true,
        data: item,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error updating checklist item:', error);
      
      if (error.message === 'Checklist item not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Checklist item not found'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update checklist item'
        }
      });
    }
  }

  /**
   * Get escrow statistics
   * GET /api/v1/teams/:teamId/escrows/stats
   */
  static async getStats(req, res) {
    try {
      const { teamId } = req.params;
      
      const stats = await Escrow.getStats(teamId);

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching escrow stats:', error);
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
   * Parse RPA PDF (keeping existing functionality)
   * POST /api/v1/teams/:teamId/escrows/parse-rpa
   */
  static async parseRPA(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file uploaded'
          }
        });
      }

      // TODO: Implement PDF parsing logic
      // For now, return mock data
      const mockData = {
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105'
        },
        purchase_price: 1250000,
        parties: [
          { party_type: 'buyer', name: 'John Doe' },
          { party_type: 'seller', name: 'Jane Smith' }
        ],
        acceptance_date: new Date().toISOString(),
        closing_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      };

      res.json({
        success: true,
        data: mockData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error parsing RPA:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to parse RPA document'
        }
      });
    }
  }

  /**
   * Add timeline event
   * POST /api/v1/teams/:teamId/escrows/:escrowId/timeline
   */
  static async addTimelineEvent(req, res) {
    try {
      const { teamId, escrowId } = req.params;
      const { event_type, description, event_date } = req.body;

      // TODO: Implement timeline event creation
      
      res.json({
        success: true,
        data: {
          id: 'timeline_' + Date.now(),
          escrow_id: escrowId,
          event_type,
          description,
          event_date,
          status: 'pending'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error adding timeline event:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to add timeline event'
        }
      });
    }
  }

  /**
   * Upload document
   * POST /api/v1/teams/:teamId/escrows/:escrowId/documents
   */
  static async uploadDocument(req, res) {
    try {
      const { teamId, escrowId } = req.params;
      const { document_type, name } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file uploaded'
          }
        });
      }

      // TODO: Implement document upload to S3 or storage service
      
      res.json({
        success: true,
        data: {
          id: 'doc_' + Date.now(),
          escrow_id: escrowId,
          document_type,
          name,
          file_path: '/uploads/' + req.file.filename,
          file_size: req.file.size,
          mime_type: req.file.mimetype
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error uploading document:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to upload document'
        }
      });
    }
  }
}

module.exports = EscrowController;