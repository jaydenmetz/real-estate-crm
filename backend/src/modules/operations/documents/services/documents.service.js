/**
 * Documents Service
 * Handles file upload, storage, and retrieval
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const Document = require('../models/Document.model');
const {
  DOCUMENT_TYPES,
  TYPE_TO_CATEGORY,
  ALLOWED_MIME_TYPES,
  ENTITY_TYPES,
  VISIBILITY_LEVELS,
} = require('../constants/documentTypes');

class DocumentsService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../../../../uploads/documents');
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
  }

  /**
   * Upload a new document
   */
  async uploadDocument(fileData, metadata, user) {
    const {
      file,
      documentType,
      relatedEntityType,
      relatedEntityId,
      description,
      tags,
      visibility,
      sharedWith,
      requiresSignature,
      expiresAt,
      isTemplate,
    } = { ...fileData, ...metadata };

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Validate document type
    if (!Object.values(DOCUMENT_TYPES).includes(documentType)) {
      throw new Error('Invalid document type');
    }

    // Get category from document type
    const category = TYPE_TO_CATEGORY[documentType];

    // Validate MIME type for category
    if (!ALLOWED_MIME_TYPES[category].includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} not allowed for category ${category}`);
    }

    // Validate entity type if provided
    if (relatedEntityType && !Object.values(ENTITY_TYPES).includes(relatedEntityType)) {
      throw new Error('Invalid entity type');
    }

    // Validate visibility
    if (visibility && !Object.values(VISIBILITY_LEVELS).includes(visibility)) {
      throw new Error('Invalid visibility level');
    }

    // Generate file hash for duplicate detection
    const fileBuffer = await fs.readFile(file.path);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Check for duplicates
    const existing = await Document.findByHash(fileHash, user.team_id);
    if (existing && !isTemplate) {
      // Return existing document instead of uploading duplicate
      return {
        document: existing,
        isDuplicate: true,
        message: 'This file already exists',
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(6).toString('hex');
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}_${randomString}${extension}`;

    // Determine storage subdirectory based on entity type or category
    const subdir = relatedEntityType || category;
    const storageDir = path.join(this.uploadsDir, subdir);

    // Ensure directory exists
    await fs.mkdir(storageDir, { recursive: true });

    // Full storage path
    const storagePath = path.join(storageDir, filename);

    // Move file to permanent storage
    await fs.rename(file.path, storagePath);

    // Create document record
    const document = await Document.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      fileBuffer,
      storageType: 'railway_volume',
      storagePath: storagePath.replace(/^.*\/uploads/, '/uploads'), // Store relative path
      documentType,
      category,
      relatedEntityType,
      relatedEntityId,
      uploadedBy: user.id,
      teamId: user.team_id,
      visibility: visibility || VISIBILITY_LEVELS.PRIVATE,
      sharedWith,
      description,
      tags,
      requiresSignature: requiresSignature || false,
      expiresAt,
      isTemplate: isTemplate || false,
    });

    return {
      document,
      isDuplicate: false,
      message: 'Document uploaded successfully',
    };
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId, user) {
    const document = await Document.findById(documentId, user.id, user.team_id);
    if (!document) {
      throw new Error('Document not found');
    }
    return document;
  }

  /**
   * Download document file
   */
  async downloadDocument(documentId, user) {
    const document = await this.getDocument(documentId, user);

    // Build full file path
    const filePath = path.join(__dirname, '../../../../../', document.storage_path);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error('File not found on storage');
    }

    return {
      filePath,
      filename: document.original_name,
      mimeType: document.mime_type,
    };
  }

  /**
   * List documents with filters
   */
  async listDocuments(filters, user) {
    const documents = await Document.find(filters, user.id, user.team_id);

    const total = documents.length > 0 ? parseInt(documents[0].total_count) : 0;

    return {
      documents: documents.map((doc) => {
        delete doc.total_count;
        return doc;
      }),
      total,
      page: Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1,
      limit: filters.limit || 20,
    };
  }

  /**
   * List documents for a specific entity
   */
  async listDocumentsByEntity(entityType, entityId, user) {
    if (!Object.values(ENTITY_TYPES).includes(entityType)) {
      throw new Error('Invalid entity type');
    }

    const documents = await Document.findByEntity(entityType, entityId, user.id, user.team_id);
    return documents;
  }

  /**
   * Update document metadata
   */
  async updateDocument(documentId, updates, user) {
    const document = await Document.update(documentId, updates, user.id, user.team_id);
    return document;
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId, user) {
    const document = await Document.remove(documentId, user.id, user.team_id);

    // Optionally delete physical file
    // For now, we keep files even after soft delete for audit purposes
    // They can be hard-deleted by a cleanup job later

    return {
      message: 'Document deleted successfully',
      document,
    };
  }

  /**
   * Sign a document
   */
  async signDocument(documentId, user) {
    const document = await Document.signDocument(documentId, user.id, user.team_id);
    return document;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(user, scope = 'user') {
    if (scope === 'team') {
      // Team-wide stats (requires team_owner or broker role)
      if (!['team_owner', 'broker', 'system_admin'].includes(user.role)) {
        throw new Error('Insufficient permissions for team statistics');
      }
      return await Document.getStorageStats(user.team_id);
    } else {
      // User-specific stats
      return await Document.getStorageStats(user.team_id, user.id);
    }
  }

  /**
   * Create document template (broker only)
   */
  async createTemplate(fileData, metadata, user) {
    // Only brokers and system admins can create templates
    if (!['broker', 'system_admin'].includes(user.role)) {
      throw new Error('Insufficient permissions to create templates');
    }

    return await this.uploadDocument(fileData, { ...metadata, isTemplate: true }, user);
  }

  /**
   * List available templates
   */
  async listTemplates(documentType, user) {
    const filters = {
      isTemplate: true,
    };

    if (documentType) {
      filters.documentType = documentType;
    }

    const result = await this.listDocuments(filters, user);
    return result.documents;
  }
}

module.exports = new DocumentsService();
