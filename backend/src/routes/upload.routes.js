const express = require('express');
const router = express.Router();
const uploadService = require('../services/upload.service');
const Document = require('../models/Document');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

// All routes require authentication
router.use(authenticate);

// Create upload middleware instances
const documentUpload = uploadService.createUploadMiddleware('document').single('file');
const imageUpload = uploadService.createUploadMiddleware('image').single('file');

// Upload document endpoint
router.post('/document', requirePermission('uploads'), (req, res) => {
  documentUpload(req, res, async (err) => {
    try {
      if (err) {
        logger.error('Document upload error:', err);
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: err.message || 'Failed to upload document'
          }
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file provided'
          }
        });
      }

      // Process the uploaded document
      const fileInfo = await uploadService.handleDocumentUpload(req.file, {
        uploadedBy: req.user.id,
        category: req.body.category || 'general',
        description: req.body.description,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
      });

      // Save document metadata to database
      const document = new Document({
        filename: fileInfo.filename,
        originalName: fileInfo.originalName,
        mimeType: fileInfo.mimeType,
        size: fileInfo.size,
        path: fileInfo.path,
        url: fileInfo.url,
        storage: fileInfo.storage,
        uploadedBy: req.user.id,
        category: req.body.category || 'general',
        description: req.body.description,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
        relatedTo: {
          entityType: req.body.entityType,
          entityId: req.body.entityId
        }
      });

      await document.save();

      res.status(201).json({
        success: true,
        data: {
          id: document._id,
          filename: document.filename,
          originalName: document.originalName,
          url: document.url,
          size: document.size,
          mimeType: document.mimeType,
          uploadedAt: document.createdAt
        }
      });
    } catch (error) {
      logger.error('Failed to process document upload:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        await uploadService.deleteLocalFile(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to process uploaded document'
        }
      });
    }
  });
});

// Upload image endpoint
router.post('/image', requirePermission('uploads'), (req, res) => {
  imageUpload(req, res, async (err) => {
    try {
      if (err) {
        logger.error('Image upload error:', err);
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: err.message || 'Failed to upload image'
          }
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file provided'
          }
        });
      }

      // Process the uploaded image
      const fileInfo = await uploadService.handleImageUpload(req.file, {
        uploadedBy: req.user.id,
        category: req.body.category || 'property',
        description: req.body.description,
        altText: req.body.altText,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
      });

      // Save image metadata to database
      const document = new Document({
        filename: fileInfo.filename,
        originalName: fileInfo.originalName,
        mimeType: fileInfo.mimeType,
        size: fileInfo.size,
        path: fileInfo.path,
        url: fileInfo.url,
        variants: fileInfo.variants,
        storage: fileInfo.storage,
        uploadedBy: req.user.id,
        category: req.body.category || 'property',
        description: req.body.description,
        altText: req.body.altText,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
        metadata: fileInfo.metadata,
        relatedTo: {
          entityType: req.body.entityType,
          entityId: req.body.entityId
        }
      });

      await document.save();

      res.status(201).json({
        success: true,
        data: {
          id: document._id,
          filename: document.filename,
          originalName: document.originalName,
          url: document.url,
          variants: document.variants,
          size: document.size,
          mimeType: document.mimeType,
          dimensions: {
            width: fileInfo.metadata.width,
            height: fileInfo.metadata.height
          },
          uploadedAt: document.createdAt
        }
      });
    } catch (error) {
      logger.error('Failed to process image upload:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        await uploadService.deleteLocalFile(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to process uploaded image'
        }
      });
    }
  });
});

// Get uploaded file (for local storage)
router.get('/:filename', requirePermission('uploads'), async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Find document in database
    const document = await Document.findOne({ filename });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'File not found'
        }
      });
    }
    
    // Check if file exists locally
    const fileType = document.mimeType.startsWith('image/') ? 'image' : 'document';
    const fileInfo = await uploadService.getFileInfo(filename, fileType);
    
    if (!fileInfo.exists) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_MISSING',
          message: 'File not found on storage'
        }
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    
    // Send file
    res.sendFile(fileInfo.path);
  } catch (error) {
    logger.error('Failed to retrieve file:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RETRIEVAL_ERROR',
        message: 'Failed to retrieve file'
      }
    });
  }
});

// Get file metadata
router.get('/metadata/:id', requirePermission('uploads'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    logger.error('Failed to get file metadata:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'METADATA_ERROR',
        message: 'Failed to retrieve file metadata'
      }
    });
  }
});

// Delete uploaded file
router.delete('/:id', requirePermission('uploads'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    }
    
    // Delete physical files
    const deletionResult = await uploadService.deleteFile(document);
    
    // Delete from database
    await document.remove();
    
    logger.info('File deleted successfully:', {
      id: req.params.id,
      filename: document.filename
    });
    
    res.json({
      success: true,
      data: {
        id: req.params.id,
        deletionResult
      }
    });
  } catch (error) {
    logger.error('Failed to delete file:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETION_ERROR',
        message: 'Failed to delete file'
      }
    });
  }
});

// Get upload statistics
router.get('/stats/summary', requirePermission('uploads'), async (req, res) => {
  try {
    const [stats, documentCount] = await Promise.all([
      uploadService.getUploadStats(),
      Document.countDocuments()
    ]);
    
    res.json({
      success: true,
      data: {
        ...stats,
        databaseCount: documentCount
      }
    });
  } catch (error) {
    logger.error('Failed to get upload statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve upload statistics'
      }
    });
  }
});

// List uploaded files with pagination
router.get('/', requirePermission('uploads'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      entityType,
      entityId,
      uploadedBy,
      mimeType
    } = req.query;
    
    const query = {};
    
    if (category) query.category = category;
    if (entityType) query['relatedTo.entityType'] = entityType;
    if (entityId) query['relatedTo.entityId'] = entityId;
    if (uploadedBy) query.uploadedBy = uploadedBy;
    if (mimeType) query.mimeType = new RegExp(mimeType, 'i');
    
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-path -storage');
    
    const total = await Document.countDocuments(query);
    
    res.json({
      success: true,
      data: documents,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    logger.error('Failed to list files:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_ERROR',
        message: 'Failed to list files'
      }
    });
  }
});

module.exports = router;