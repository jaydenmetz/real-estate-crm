const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Document {
  static async create(data) {
    const id = `doc_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    
    const text = `
      INSERT INTO documents (
        id, filename, original_name, mime_type, size,
        path, url, storage, variants, metadata,
        category, description, alt_text, tags,
        uploaded_by, related_to, visibility, shared_with,
        status, downloads, views, last_accessed_at,
        uploaded_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `;
    
    const values = [
      id,
      data.filename,
      data.originalName,
      data.mimeType,
      data.size,
      data.path,
      data.url,
      JSON.stringify(data.storage || { location: 'local' }),
      JSON.stringify(data.variants || {}),
      JSON.stringify(data.metadata || {}),
      data.category || 'general',
      data.description,
      data.altText,
      data.tags || [],
      data.uploadedBy,
      JSON.stringify(data.relatedTo || {}),
      data.visibility || 'team',
      JSON.stringify(data.sharedWith || []),
      data.status || 'active',
      0, // downloads
      0, // views
      null, // last_accessed_at
      data.uploadedAt || new Date(),
      data.expiresAt
    ];
    
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findById(id) {
    const text = `
      SELECT * FROM documents
      WHERE id = $1 AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const result = await query(text, [id]);
    return result.rows[0];
  }

  static async findOne(conditions) {
    const { filename, status = 'active' } = conditions;
    const text = `
      SELECT * FROM documents
      WHERE filename = $1 AND status = $2
      AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `;
    const result = await query(text, [filename, status]);
    return result.rows[0];
  }

  static async find(filters = {}) {
    let text = `
      SELECT *,
        COUNT(*) OVER() as total_count
      FROM documents
      WHERE status = $1
      AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const values = [filters.status || 'active'];
    let paramCount = 1;

    // Add filters
    if (filters.category) {
      paramCount++;
      text += ` AND category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters['relatedTo.entityType']) {
      paramCount++;
      text += ` AND related_to->>'entityType' = $${paramCount}`;
      values.push(filters['relatedTo.entityType']);
    }

    if (filters['relatedTo.entityId']) {
      paramCount++;
      text += ` AND related_to->>'entityId' = $${paramCount}`;
      values.push(filters['relatedTo.entityId']);
    }

    if (filters.uploadedBy) {
      paramCount++;
      text += ` AND uploaded_by = $${paramCount}`;
      values.push(filters.uploadedBy);
    }

    if (filters.mimeType) {
      paramCount++;
      text += ` AND mime_type ILIKE $${paramCount}`;
      values.push(`%${filters.mimeType}%`);
    }

    // Add sorting
    text += ` ORDER BY created_at DESC`;

    // Add pagination
    if (filters.limit) {
      paramCount++;
      text += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      text += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result = await query(text, values);
    return result.rows;
  }

  static async findByEntity(entityType, entityId) {
    const text = `
      SELECT * FROM documents
      WHERE related_to->>'entityType' = $1
      AND related_to->>'entityId' = $2
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
    `;
    const result = await query(text, [entityType, entityId]);
    return result.rows;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== '_id') {
        paramCount++;
        fields.push(`${this.columnName(key)} = $${paramCount}`);
        values.push(this.formatValue(key, value));
      }
    });

    if (fields.length === 0) return null;

    paramCount++;
    values.push(id);

    const text = `
      UPDATE documents
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(text, values);
    return result.rows[0];
  }

  static async remove(id) {
    const text = `
      UPDATE documents
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(text, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const text = `
      DELETE FROM documents
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(text, [id]);
    return result.rows[0];
  }

  static async countDocuments(filters = {}) {
    let text = `
      SELECT COUNT(*) as count
      FROM documents
      WHERE status = $1
      AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const values = [filters.status || 'active'];
    let paramCount = 1;

    if (filters.category) {
      paramCount++;
      text += ` AND category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.uploadedBy) {
      paramCount++;
      text += ` AND uploaded_by = $${paramCount}`;
      values.push(filters.uploadedBy);
    }

    const result = await query(text, values);
    return parseInt(result.rows[0].count);
  }

  static async getStorageStats(userId) {
    const text = `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(size) as total_size
      FROM documents
      WHERE uploaded_by = $1
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
      GROUP BY category
    `;
    
    const result = await query(text, [userId]);
    
    const categories = result.rows;
    const totalCount = categories.reduce((sum, cat) => sum + parseInt(cat.count), 0);
    const totalSize = categories.reduce((sum, cat) => sum + parseInt(cat.total_size || 0), 0);
    
    return {
      categories: categories.map(cat => ({
        category: cat.category,
        count: parseInt(cat.count),
        totalSize: parseInt(cat.total_size || 0)
      })),
      totalCount,
      totalSize
    };
  }

  // Instance methods
  async save() {
    if (this.id) {
      return Document.update(this.id, this);
    } else {
      const saved = await Document.create(this);
      Object.assign(this, saved);
      return this;
    }
  }

  async recordView() {
    const text = `
      UPDATE documents
      SET views = views + 1, last_accessed_at = NOW()
      WHERE id = $1
      RETURNING views, last_accessed_at
    `;
    const result = await query(text, [this.id]);
    if (result.rows[0]) {
      this.views = result.rows[0].views;
      this.lastAccessedAt = result.rows[0].last_accessed_at;
    }
  }

  async recordDownload() {
    const text = `
      UPDATE documents
      SET downloads = downloads + 1, last_accessed_at = NOW()
      WHERE id = $1
      RETURNING downloads, last_accessed_at
    `;
    const result = await query(text, [this.id]);
    if (result.rows[0]) {
      this.downloads = result.rows[0].downloads;
      this.lastAccessedAt = result.rows[0].last_accessed_at;
    }
  }

  canAccess(userId) {
    // Owner always has access
    if (this.uploadedBy === userId || this.uploaded_by === userId) {
      return true;
    }
    
    // Check visibility
    if (this.visibility === 'public') {
      return true;
    }
    
    // Check shared permissions
    const sharedWith = this.sharedWith || this.shared_with || [];
    return sharedWith.some(share => share.userId === userId);
  }

  getUrl(variant = 'original') {
    const fileType = this.mimeType?.startsWith('image/') ? 'image' : 'document';
    if (fileType === 'image' && this.variants && this.variants[variant]) {
      return this.variants[variant].url;
    }
    return this.url;
  }

  // Helper methods
  static columnName(key) {
    // Convert camelCase to snake_case
    return key.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  static formatValue(key, value) {
    // JSON fields
    if (['storage', 'variants', 'metadata', 'relatedTo', 'sharedWith'].includes(key)) {
      return JSON.stringify(value);
    }
    return value;
  }

  // Virtual property for file type
  get fileType() {
    if (this.mimeType?.startsWith('image/')) return 'image';
    if (this.mimeType === 'application/pdf') return 'pdf';
    if (this.mimeType?.includes('word')) return 'word';
    if (this.mimeType?.includes('sheet') || this.mimeType?.includes('excel')) return 'excel';
    if (this.mimeType?.startsWith('text/')) return 'text';
    return 'other';
  }
}

module.exports = Document;