/**
 * Clients CRUD Controller
 *
 * Thin HTTP layer that delegates to ClientsService.
 * Handles request/response formatting and error handling.
 *
 * @module modules/clients/controllers/crud
 */

const logger = require('../../../../utils/logger');
const clientsService = require('../services/clients.service');

// GET /api/v1/clients
exports.getAllClients = async (req, res) => {
  try {
    const result = await clientsService.getAllClients(req.query, req.user);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch clients',
        details: error.message,
      },
    });
  }
};

// GET /api/v1/clients/:id
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await clientsService.getClientById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch client',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/clients
exports.createClient = async (req, res) => {
  try {
    const newClient = await clientsService.createClient(req.body, req.user);

    res.status(201).json({
      success: true,
      data: newClient,
    });
  } catch (error) {
    if (error.message === 'DUPLICATE_EMAIL') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'A contact with this email already exists',
        },
      });
    }

    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create client',
        details: error.message,
      },
    });
  }
};

// PUT /api/v1/clients/:id
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClient = await clientsService.updateClient(id, req.body, req.user);

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    res.json({
      success: true,
      data: updatedClient,
    });
  } catch (error) {
    if (error.message === 'VERSION_CONFLICT') {
      const { id } = req.params;
      const { pool } = require('../../../../config/infrastructure/database');
      const versionCheck = await pool.query('SELECT version FROM clients WHERE id = $1', [id]);

      if (versionCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'VERSION_CONFLICT',
            message: 'This client was modified by another user. Please refresh and try again.',
            currentVersion: versionCheck.rows[0].version,
            attemptedVersion: req.body.version,
          },
        });
      }
    }

    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update client',
        details: error.message,
      },
    });
  }
};

// Archive client - soft delete by setting status to 'archived'
exports.archiveClient = async (req, res) => {
  try {
    const { id } = req.params;
    const archivedClient = await clientsService.archiveClient(id);

    if (!archivedClient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    res.json({
      success: true,
      data: archivedClient,
      message: 'Client archived successfully',
    });
  } catch (error) {
    console.error('Archive client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Failed to archive client',
      },
    });
  }
};

// DELETE /api/v1/clients/:id
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await clientsService.deleteClient(id, req.user);

    if (result === null) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete client',
      },
    });
  }
};

// POST /api/v1/clients/batch-delete
exports.batchDeleteClients = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await clientsService.batchDeleteClients(ids, req.user);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.message === 'IDs must be a non-empty array') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: error.message,
        },
      });
    }

    console.error('Batch delete clients error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete clients',
        details: error.message,
      },
    });
  }
};
