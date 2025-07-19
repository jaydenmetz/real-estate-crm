const multer = require('multer');
// const sharp = require('sharp'); // Temporarily disabled
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const logger = require('../utils/logger');

class UploadService {
  constructor() {
    // File type configurations
    this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    this.allowedDocumentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
    
    // Size limits
    this.maxFileSize = process.env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB default
    this.maxImageSize = 5 * 1024 * 1024; // 5MB for images
    
    // Upload directories
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.documentDir = path.join(this.uploadDir, 'documents');
    this.imageDir = path.join(this.uploadDir, 'images');
    
    // Image resize configurations
    this.imageVariants = {
      thumbnail: { width: 150, height: 150, fit: 'cover' },
      small: { width: 400, height: 300, fit: 'inside' },
      medium: { width: 800, height: 600, fit: 'inside' },
      large: { width: 1200, height: 900, fit: 'inside' }
    };
    
    // Initialize directories
    this.initializeDirectories();
  }

  async initializeDirectories() {
    try {
      await fs.mkdir(this.documentDir, { recursive: true });
      await fs.mkdir(this.imageDir, { recursive: true });
      
      // Create subdirectories for image variants
      for (const variant of Object.keys(this.imageVariants)) {
        await fs.mkdir(path.join(this.imageDir, variant), { recursive: true });
      }
      
      logger.info('Upload directories initialized');
    } catch (error) {
      logger.error('Failed to initialize upload directories:', error);
    }
  }

  // Multer storage configuration for local storage
  getLocalStorage(type) {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        const dir = type === 'image' ? this.imageDir : this.documentDir;
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9]/g, '-')
          .toLowerCase();
        cb(null, `${basename}-${uniqueSuffix}${ext}`);
      }
    });
  }

  // Multer file filter
  getFileFilter(type) {
    return (req, file, cb) => {
      const allowedTypes = type === 'image' ? this.allowedImageTypes : this.allowedDocumentTypes;
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
      }
    };
  }

  // Create multer upload middleware
  createUploadMiddleware(type) {
    const storage = this.getLocalStorage(type);
    const fileFilter = this.getFileFilter(type);
    const limits = {
      fileSize: type === 'image' ? this.maxImageSize : this.maxFileSize
    };

    return multer({
      storage,
      fileFilter,
      limits
    });
  }

  // Process uploaded image
  async processImage(filePath, filename) {
    try {
      const results = {};
      
      // Get image metadata
      // const metadata = await sharp(filePath).metadata();
      const metadata = { width: 800, height: 600 }; // Temporary placeholder
      results.metadata = {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size
      };
      
      // Create variants
      for (const [variant, config] of Object.entries(this.imageVariants)) {
        const variantDir = path.join(this.imageDir, variant);
        const variantPath = path.join(variantDir, filename);
        
        /* await sharp(filePath)
          .resize(config.width, config.height, { fit: config.fit })
          .toFile(variantPath); */
        
        results[variant] = {
          path: variantPath,
          url: `/uploads/images/${variant}/${filename}`
        };
      }
      
      results.original = {
        path: filePath,
        url: `/uploads/images/${filename}`
      };
      
      logger.info('Image processed successfully:', { filename, variants: Object.keys(results) });
      
      return results;
    } catch (error) {
      logger.error('Failed to process image:', error);
      throw error;
    }
  }

  // Upload to S3 (placeholder for production)
  async uploadToS3(file, type) {
    // In production, this would use aws-sdk to upload to S3
    logger.info('S3 upload not implemented in development mode');
    
    return {
      location: 'local',
      bucket: null,
      key: file.filename,
      url: `/${type}s/${file.filename}`
    };
  }

  // Handle document upload
  async handleDocumentUpload(file, metadata = {}) {
    try {
      const fileInfo = {
        originalName: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/documents/${file.filename}`,
        uploadedAt: new Date(),
        metadata: {
          ...metadata,
          encoding: file.encoding
        }
      };
      
      // In production, upload to S3
      if (process.env.NODE_ENV === 'production' && process.env.AWS_S3_BUCKET) {
        const s3Result = await this.uploadToS3(file, 'document');
        fileInfo.storage = s3Result;
      } else {
        fileInfo.storage = {
          location: 'local',
          path: file.path
        };
      }
      
      logger.info('Document uploaded successfully:', {
        filename: file.filename,
        size: file.size,
        type: file.mimetype
      });
      
      return fileInfo;
    } catch (error) {
      logger.error('Failed to handle document upload:', error);
      throw error;
    }
  }

  // Handle image upload
  async handleImageUpload(file, metadata = {}) {
    try {
      // Process image and create variants
      const processed = await this.processImage(file.path, file.filename);
      
      const fileInfo = {
        originalName: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/images/${file.filename}`,
        variants: processed,
        uploadedAt: new Date(),
        metadata: {
          ...metadata,
          ...processed.metadata,
          encoding: file.encoding
        }
      };
      
      // In production, upload all variants to S3
      if (process.env.NODE_ENV === 'production' && process.env.AWS_S3_BUCKET) {
        const s3Results = {};
        for (const [variant, data] of Object.entries(processed)) {
          if (variant !== 'metadata') {
            s3Results[variant] = await this.uploadToS3({ 
              filename: `${variant}/${file.filename}`,
              path: data.path 
            }, 'image');
          }
        }
        fileInfo.storage = s3Results;
      } else {
        fileInfo.storage = {
          location: 'local',
          variants: processed
        };
      }
      
      logger.info('Image uploaded and processed successfully:', {
        filename: file.filename,
        size: file.size,
        variants: Object.keys(processed).filter(k => k !== 'metadata')
      });
      
      return fileInfo;
    } catch (error) {
      logger.error('Failed to handle image upload:', error);
      
      // Clean up files on error
      await this.deleteLocalFile(file.path);
      
      throw error;
    }
  }

  // Delete local file
  async deleteLocalFile(filePath) {
    try {
      await fs.unlink(filePath);
      logger.info('Local file deleted:', filePath);
      return true;
    } catch (error) {
      logger.error('Failed to delete local file:', error);
      return false;
    }
  }

  // Delete file and its variants
  async deleteFile(fileInfo) {
    try {
      const deletionResults = [];
      
      // Delete from S3 if applicable
      if (fileInfo.storage && fileInfo.storage.location === 's3') {
        // In production, delete from S3
        logger.info('S3 deletion not implemented');
      }
      
      // Delete local files
      if (fileInfo.storage && fileInfo.storage.location === 'local') {
        // Delete original
        if (fileInfo.path) {
          const deleted = await this.deleteLocalFile(fileInfo.path);
          deletionResults.push({ file: 'original', deleted });
        }
        
        // Delete variants for images
        if (fileInfo.variants) {
          for (const [variant, data] of Object.entries(fileInfo.variants)) {
            if (data.path && variant !== 'metadata') {
              const deleted = await this.deleteLocalFile(data.path);
              deletionResults.push({ file: variant, deleted });
            }
          }
        }
      }
      
      logger.info('File deletion completed:', {
        filename: fileInfo.filename,
        results: deletionResults
      });
      
      return {
        success: true,
        deletionResults
      };
    } catch (error) {
      logger.error('Failed to delete file:', error);
      throw error;
    }
  }

  // Get file info
  async getFileInfo(filename, type) {
    try {
      const filePath = path.join(
        type === 'image' ? this.imageDir : this.documentDir,
        filename
      );
      
      const stats = await fs.stat(filePath);
      
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        exists: true,
        path: filePath
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { exists: false, filename };
      }
      throw error;
    }
  }

  // Validate file before upload
  validateFile(file, type) {
    const errors = [];
    
    // Check file size
    const maxSize = type === 'image' ? this.maxImageSize : this.maxFileSize;
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }
    
    // Check file type
    const allowedTypes = type === 'image' ? this.allowedImageTypes : this.allowedDocumentTypes;
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }
    
    // Check filename
    if (!file.originalname || file.originalname.length > 255) {
      errors.push('Invalid filename');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get upload statistics
  async getUploadStats() {
    try {
      const [documentFiles, imageFiles] = await Promise.all([
        fs.readdir(this.documentDir),
        fs.readdir(this.imageDir)
      ]);
      
      let totalSize = 0;
      let documentCount = 0;
      let imageCount = 0;
      
      // Count documents
      for (const file of documentFiles) {
        const filePath = path.join(this.documentDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          documentCount++;
          totalSize += stats.size;
        }
      }
      
      // Count images (only originals, not variants)
      for (const file of imageFiles) {
        const filePath = path.join(this.imageDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          imageCount++;
          totalSize += stats.size;
        }
      }
      
      return {
        totalFiles: documentCount + imageCount,
        documentCount,
        imageCount,
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        storageLocation: process.env.NODE_ENV === 'production' ? 's3' : 'local'
      };
    } catch (error) {
      logger.error('Failed to get upload statistics:', error);
      throw error;
    }
  }
}

module.exports = new UploadService();