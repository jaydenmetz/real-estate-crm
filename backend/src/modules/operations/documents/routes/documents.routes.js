/**
 * Documents Routes
 * API endpoints for document management
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../../../../middleware/auth/auth.middleware');
const documentsController = require('../controllers/documents.controller');

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../../../../../temp/uploads');

// Ensure temp uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `temp-${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimeTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// All routes require authentication
router.use(authenticate);

/**
 * POST /v1/documents/upload
 * Upload a new document
 *
 * Required form fields:
 * - file: The file to upload (multipart/form-data)
 * - documentType: Type of document (see DOCUMENT_TYPES)
 *
 * Optional fields:
 * - relatedEntityType: Type of entity (escrow, listing, client, appointment, lead)
 * - relatedEntityId: ID of the related entity
 * - description: Document description
 * - tags: JSON array of tags
 * - visibility: Access level (private, team, shared, public)
 * - sharedWith: JSON array of user IDs (when visibility is 'shared')
 * - requiresSignature: Boolean
 * - expiresAt: ISO 8601 timestamp
 * - isTemplate: Boolean (broker only)
 */
router.post('/upload', upload.single('file'), documentsController.uploadDocument);

/**
 * GET /v1/documents
 * List documents with filters
 *
 * Query params:
 * - documentType: Filter by document type
 * - category: Filter by category
 * - relatedEntityType: Filter by entity type
 * - relatedEntityId: Filter by entity ID
 * - uploadedBy: Filter by uploader user ID
 * - isTemplate: Filter templates (true/false)
 * - search: Search in filename and description
 * - limit: Results per page (default: 20)
 * - offset: Pagination offset (default: 0)
 */
router.get('/', documentsController.listDocuments);

/**
 * GET /v1/documents/types
 * Get available document types
 */
router.get('/types', documentsController.getDocumentTypes);

/**
 * GET /v1/documents/stats/storage
 * Get storage statistics
 *
 * Query params:
 * - scope: 'user' or 'team' (default: user)
 */
router.get('/stats/storage', documentsController.getStorageStats);

/**
 * GET /v1/documents/templates
 * List available templates
 *
 * Query params:
 * - documentType: Filter templates by type
 */
router.get('/templates', documentsController.listTemplates);

/**
 * POST /v1/documents/templates
 * Create a document template (broker only)
 */
router.post('/templates', upload.single('file'), documentsController.createTemplate);

/**
 * GET /v1/documents/entity/:entityType/:entityId
 * List documents for a specific entity
 *
 * Params:
 * - entityType: escrow, listing, client, appointment, lead
 * - entityId: ID of the entity
 */
router.get('/entity/:entityType/:entityId', documentsController.listDocumentsByEntity);

/**
 * GET /v1/documents/:id
 * Get document by ID
 */
router.get('/:id', documentsController.getDocument);

/**
 * GET /v1/documents/:id/download
 * Download document file
 */
router.get('/:id/download', documentsController.downloadDocument);

/**
 * PATCH /v1/documents/:id
 * Update document metadata
 *
 * Body (all fields optional):
 * - description: string
 * - tags: array of strings
 * - visibility: private/team/shared/public
 * - sharedWith: array of user IDs
 * - expiresAt: ISO 8601 timestamp
 * - requiresSignature: boolean
 */
router.patch('/:id', documentsController.updateDocument);

/**
 * DELETE /v1/documents/:id
 * Delete document (soft delete)
 */
router.delete('/:id', documentsController.deleteDocument);

/**
 * POST /v1/documents/:id/sign
 * Sign a document
 */
router.post('/:id/sign', documentsController.signDocument);

module.exports = router;
