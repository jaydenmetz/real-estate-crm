/**
 * Documents Controller
 * Handles HTTP requests for document management
 */

const documentsService = require('../services/documents.service');
const { DOCUMENT_TYPES } = require('../constants/documentTypes');

/**
 * POST /v1/documents/upload
 * Upload a new document
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FILE',
          message: 'No file provided',
        },
      });
    }

    const metadata = {
      documentType: req.body.documentType,
      relatedEntityType: req.body.relatedEntityType || null,
      relatedEntityId: req.body.relatedEntityId || null,
      description: req.body.description || null,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      visibility: req.body.visibility || 'private',
      sharedWith: req.body.sharedWith ? JSON.parse(req.body.sharedWith) : [],
      requiresSignature: req.body.requiresSignature === 'true',
      expiresAt: req.body.expiresAt || null,
      isTemplate: req.body.isTemplate === 'true',
    };

    const result = await documentsService.uploadDocument(
      { file: req.file },
      metadata,
      req.user
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * GET /v1/documents
 * List documents with filters
 */
const listDocuments = async (req, res) => {
  try {
    const filters = {
      documentType: req.query.documentType,
      category: req.query.category,
      relatedEntityType: req.query.relatedEntityType,
      relatedEntityId: req.query.relatedEntityId,
      uploadedBy: req.query.uploadedBy,
      isTemplate: req.query.isTemplate === 'true' ? true : req.query.isTemplate === 'false' ? false : undefined,
      search: req.query.search,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
    };

    const result = await documentsService.listDocuments(filters, req.user);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_ERROR',
        message: 'Failed to list documents',
      },
    });
  }
};

/**
 * GET /v1/documents/:id
 * Get document by ID
 */
const getDocument = async (req, res) => {
  try {
    const document = await documentsService.getDocument(req.params.id, req.user);

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Get document error:', error);

    const statusCode = error.message === 'Document not found' || error.message === 'Access denied' ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      error: {
        code: error.message === 'Access denied' ? 'ACCESS_DENIED' : 'NOT_FOUND',
        message: error.message,
      },
    });
  }
};

/**
 * GET /v1/documents/:id/download
 * Download document file
 */
const downloadDocument = async (req, res) => {
  try {
    const { filePath, filename, mimeType } = await documentsService.downloadDocument(
      req.params.id,
      req.user
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download document error:', error);

    const statusCode = error.message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      error: {
        code: 'DOWNLOAD_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * GET /v1/documents/entity/:entityType/:entityId
 * List documents for a specific entity
 */
const listDocumentsByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const documents = await documentsService.listDocumentsByEntity(
      entityType,
      entityId,
      req.user
    );

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('List documents by entity error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'LIST_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * PATCH /v1/documents/:id
 * Update document metadata
 */
const updateDocument = async (req, res) => {
  try {
    const updates = {
      description: req.body.description,
      tags: req.body.tags,
      visibility: req.body.visibility,
      sharedWith: req.body.sharedWith,
      expiresAt: req.body.expiresAt,
      requiresSignature: req.body.requiresSignature,
    };

    // Remove undefined values
    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    const document = await documentsService.updateDocument(
      req.params.id,
      updates,
      req.user
    );

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Update document error:', error);

    const statusCode = error.message === 'Access denied' ? 403 : 400;

    res.status(statusCode).json({
      success: false,
      error: {
        code: error.message === 'Access denied' ? 'ACCESS_DENIED' : 'UPDATE_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * DELETE /v1/documents/:id
 * Delete document (soft delete)
 */
const deleteDocument = async (req, res) => {
  try {
    const result = await documentsService.deleteDocument(req.params.id, req.user);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Delete document error:', error);

    const statusCode = error.message === 'Access denied' ? 403 : 500;

    res.status(statusCode).json({
      success: false,
      error: {
        code: error.message === 'Access denied' ? 'ACCESS_DENIED' : 'DELETE_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * POST /v1/documents/:id/sign
 * Sign a document
 */
const signDocument = async (req, res) => {
  try {
    const document = await documentsService.signDocument(req.params.id, req.user);

    res.json({
      success: true,
      data: document,
      message: 'Document signed successfully',
    });
  } catch (error) {
    console.error('Sign document error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'SIGN_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * GET /v1/documents/stats/storage
 * Get storage statistics
 */
const getStorageStats = async (req, res) => {
  try {
    const scope = req.query.scope || 'user'; // 'user' or 'team'
    const stats = await documentsService.getStorageStats(req.user, scope);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get storage stats error:', error);

    const statusCode = error.message.includes('permissions') ? 403 : 500;

    res.status(statusCode).json({
      success: false,
      error: {
        code: error.message.includes('permissions') ? 'ACCESS_DENIED' : 'STATS_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * POST /v1/documents/templates
 * Create a document template (broker only)
 */
const createTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FILE',
          message: 'No file provided',
        },
      });
    }

    const metadata = {
      documentType: req.body.documentType,
      description: req.body.description || null,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      visibility: req.body.visibility || 'team',
    };

    const result = await documentsService.createTemplate(
      { file: req.file },
      metadata,
      req.user
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Create template error:', error);

    const statusCode = error.message.includes('permissions') ? 403 : 400;

    res.status(statusCode).json({
      success: false,
      error: {
        code: error.message.includes('permissions') ? 'ACCESS_DENIED' : 'TEMPLATE_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * GET /v1/documents/templates
 * List available templates
 */
const listTemplates = async (req, res) => {
  try {
    const documentType = req.query.documentType;
    const templates = await documentsService.listTemplates(documentType, req.user);

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_ERROR',
        message: 'Failed to list templates',
      },
    });
  }
};

/**
 * GET /v1/documents/types
 * Get available document types
 */
const getDocumentTypes = (req, res) => {
  res.json({
    success: true,
    data: DOCUMENT_TYPES,
  });
};

module.exports = {
  uploadDocument,
  listDocuments,
  getDocument,
  downloadDocument,
  listDocumentsByEntity,
  updateDocument,
  deleteDocument,
  signDocument,
  getStorageStats,
  createTemplate,
  listTemplates,
  getDocumentTypes,
};
