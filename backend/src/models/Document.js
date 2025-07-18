const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  // File information
  filename: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  
  // Storage information
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  storage: {
    location: {
      type: String,
      enum: ['local', 's3'],
      default: 'local'
    },
    bucket: String,
    key: String,
    variants: mongoose.Schema.Types.Mixed // For image variants
  },
  
  // Image-specific fields
  variants: {
    thumbnail: {
      path: String,
      url: String
    },
    small: {
      path: String,
      url: String
    },
    medium: {
      path: String,
      url: String
    },
    large: {
      path: String,
      url: String
    },
    original: {
      path: String,
      url: String
    }
  },
  
  // Metadata
  metadata: {
    width: Number,
    height: Number,
    format: String,
    encoding: String,
    // Additional custom metadata
    custom: mongoose.Schema.Types.Mixed
  },
  
  // Organization
  category: {
    type: String,
    enum: ['general', 'property', 'contract', 'identification', 'financial', 'marketing', 'other'],
    default: 'general',
    index: true
  },
  description: String,
  altText: String, // For images
  tags: [{
    type: String,
    trim: true
  }],
  
  // Relationships
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  relatedTo: {
    entityType: {
      type: String,
      enum: ['listing', 'escrow', 'client', 'lead', 'appointment', 'property'],
      index: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    }
  },
  
  // Access control
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'team'
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'download', 'edit', 'delete'],
      default: 'view'
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
    index: true
  },
  
  // Analytics
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  lastAccessedAt: Date,
  
  // Timestamps
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for efficient querying
documentSchema.index({ 'relatedTo.entityType': 1, 'relatedTo.entityId': 1 });
documentSchema.index({ uploadedBy: 1, category: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ status: 1, createdAt: -1 });

// Virtual for file type
documentSchema.virtual('fileType').get(function() {
  if (this.mimeType.startsWith('image/')) return 'image';
  if (this.mimeType === 'application/pdf') return 'pdf';
  if (this.mimeType.includes('word')) return 'word';
  if (this.mimeType.includes('sheet') || this.mimeType.includes('excel')) return 'excel';
  if (this.mimeType.startsWith('text/')) return 'text';
  return 'other';
});

// Method to increment view count
documentSchema.methods.recordView = async function() {
  this.views += 1;
  this.lastAccessedAt = new Date();
  await this.save();
};

// Method to increment download count
documentSchema.methods.recordDownload = async function() {
  this.downloads += 1;
  this.lastAccessedAt = new Date();
  await this.save();
};

// Method to check access permission
documentSchema.methods.canAccess = function(userId) {
  // Owner always has access
  if (this.uploadedBy.toString() === userId.toString()) {
    return true;
  }
  
  // Check visibility
  if (this.visibility === 'public') {
    return true;
  }
  
  // Check shared permissions
  const sharedEntry = this.sharedWith.find(
    share => share.userId.toString() === userId.toString()
  );
  
  return !!sharedEntry;
};

// Method to get accessible URL based on variant
documentSchema.methods.getUrl = function(variant = 'original') {
  if (this.fileType === 'image' && this.variants && this.variants[variant]) {
    return this.variants[variant].url;
  }
  return this.url;
};

// Static method to find documents by entity
documentSchema.statics.findByEntity = function(entityType, entityId) {
  return this.find({
    'relatedTo.entityType': entityType,
    'relatedTo.entityId': entityId,
    status: 'active'
  }).sort({ createdAt: -1 });
};

// Static method to get storage statistics
documentSchema.statics.getStorageStats = async function(userId) {
  const pipeline = [
    {
      $match: {
        uploadedBy: userId,
        status: 'active'
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    },
    {
      $group: {
        _id: null,
        categories: {
          $push: {
            category: '$_id',
            count: '$count',
            totalSize: '$totalSize'
          }
        },
        totalCount: { $sum: '$count' },
        totalSize: { $sum: '$totalSize' }
      }
    }
  ];
  
  const results = await this.aggregate(pipeline);
  return results[0] || { categories: [], totalCount: 0, totalSize: 0 };
};

// Pre-save middleware to ensure unique filename
documentSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Ensure filename is unique
    let filename = this.filename;
    let counter = 1;
    
    while (await this.constructor.findOne({ filename })) {
      const ext = filename.split('.').pop();
      const base = filename.slice(0, -(ext.length + 1));
      filename = `${base}-${counter}.${ext}`;
      counter++;
    }
    
    this.filename = filename;
  }
  next();
});

// Ensure expired documents are not returned in queries
documentSchema.pre(/^find/, function() {
  this.where({
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
});

module.exports = mongoose.model('Document', documentSchema);