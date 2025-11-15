/**
 * Document Model
 * Handles secure document storage with polymorphic relationships
 */

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../../../../config/infrastructure/database');
const crypto = require('crypto');

class Document {
  /**
   * Create a new document
   */
  static async create(data) {
    const id = `doc_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

    // Generate file hash if file buffer provided
    const fileHash = data.fileBuffer
      ? crypto.createHash('sha256').update(data.fileBuffer).digest('hex')
      : null;

    const query = `
      INSERT INTO documents (
        id, filename, original_name, mime_type, file_size, file_hash,
        storage_type, storage_path, storage_url,
        document_type, category,
        related_entity_type, related_entity_id,
        uploaded_by, team_id, visibility, shared_with,
        description, tags, version, is_template,
        requires_signature, expires_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      )
      RETURNING *
    `;

    const values = [
      id,
      data.filename,
      data.originalName || data.filename,
      data.mimeType,
      data.fileSize,
      fileHash,
      data.storageType || 'railway_volume',
      data.storagePath,
      data.storageUrl || null,
      data.documentType,
      data.category,
      data.relatedEntityType || null,
      data.relatedEntityId || null,
      data.uploadedBy,
      data.teamId,
      data.visibility || 'private',
      JSON.stringify(data.sharedWith || []),
      data.description || null,
      data.tags || [],
      data.version || 1,
      data.isTemplate || false,
      data.requiresSignature || false,
      data.expiresAt || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find document by ID
   */
  static async findById(id, userId, teamId) {
    const query = `
      SELECT * FROM documents
      WHERE id = $1
      AND deleted_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const result = await pool.query(query, [id]);
    const doc = result.rows[0];

    if (!doc) return null;

    // Check access permissions
    if (!this.canAccess(doc, userId, teamId)) {
      throw new Error('Access denied');
    }

    return doc;
  }

  /**
   * Find all documents with filters
   */
  static async find(filters = {}, userId, teamId) {
    let query = `
      SELECT *,
        COUNT(*) OVER() as total_count
      FROM documents
      WHERE deleted_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const values = [];
    let paramCount = 0;

    // Team filter (required for multi-tenancy)
    paramCount++;
    query += ` AND team_id = $${paramCount}`;
    values.push(teamId);

    // Add optional filters
    if (filters.documentType) {
      paramCount++;
      query += ` AND document_type = $${paramCount}`;
      values.push(filters.documentType);
    }

    if (filters.category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.relatedEntityType) {
      paramCount++;
      query += ` AND related_entity_type = $${paramCount}`;
      values.push(filters.relatedEntityType);
    }

    if (filters.relatedEntityId) {
      paramCount++;
      query += ` AND related_entity_id = $${paramCount}`;
      values.push(filters.relatedEntityId);
    }

    if (filters.uploadedBy) {
      paramCount++;
      query += ` AND uploaded_by = $${paramCount}`;
      values.push(filters.uploadedBy);
    }

    if (filters.isTemplate !== undefined) {
      paramCount++;
      query += ` AND is_template = $${paramCount}`;
      values.push(filters.isTemplate);
    }

    // Search by filename or description
    if (filters.search) {
      paramCount++;
      query += ` AND (
        original_name ILIKE $${paramCount} OR
        description ILIKE $${paramCount}
      )`;
      values.push(`%${filters.search}%`);
    }

    // Apply visibility filter (user can only see docs they have access to)
    query += ` AND (
      uploaded_by = $${paramCount + 1}
      OR visibility = 'public'
      OR visibility = 'team'
      OR (visibility = 'shared' AND shared_with ? $${paramCount + 1}::text)
    )`;
    paramCount++;
    values.push(userId);

    // Sorting
    query += ' ORDER BY created_at DESC';

    // Pagination
    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Find documents by entity (escrow, listing, etc.)
   */
  static async findByEntity(entityType, entityId, userId, teamId) {
    const query = `
      SELECT * FROM documents
      WHERE related_entity_type = $1
      AND related_entity_id = $2
      AND team_id = $3
      AND deleted_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (
        uploaded_by = $4
        OR visibility = 'public'
        OR visibility = 'team'
        OR (visibility = 'shared' AND shared_with ? $4::text)
      )
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [entityType, entityId, teamId, userId]);
    return result.rows;
  }

  /**
   * Update document
   */
  static async update(id, updates, userId, teamId) {
    // Verify ownership
    const doc = await this.findById(id, userId, teamId);
    if (!doc || doc.uploaded_by !== userId) {
      throw new Error('Access denied');
    }

    const fields = [];
    const values = [];
    let paramCount = 0;

    // Build dynamic update query
    const allowedFields = ['description', 'tags', 'visibility', 'shared_with', 'expires_at', 'requires_signature'];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        paramCount++;
        const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${columnName} = $${paramCount}`);

        // JSON fields
        if (['sharedWith', 'shared_with'].includes(key)) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return doc;

    paramCount++;
    values.push(id);

    const query = `
      UPDATE documents
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Soft delete document
   */
  static async remove(id, userId, teamId) {
    // Verify ownership
    const doc = await this.findById(id, userId, teamId);
    if (!doc || doc.uploaded_by !== userId) {
      throw new Error('Access denied');
    }

    const query = `
      UPDATE documents
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Hard delete document (admin only)
   */
  static async delete(id) {
    const query = `
      DELETE FROM documents
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Sign document
   */
  static async signDocument(id, userId, teamId) {
    const doc = await this.findById(id, userId, teamId);
    if (!doc) {
      throw new Error('Document not found');
    }

    if (!doc.requires_signature) {
      throw new Error('Document does not require signature');
    }

    if (doc.signed_at) {
      throw new Error('Document already signed');
    }

    const query = `
      UPDATE documents
      SET signed_at = NOW(), signed_by = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [userId, id]);
    return result.rows[0];
  }

  /**
   * Get storage stats for a user or team
   */
  static async getStorageStats(teamId, userId = null) {
    let query = `
      SELECT
        category,
        COUNT(*) as count,
        SUM(file_size) as total_size
      FROM documents
      WHERE team_id = $1
      AND deleted_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const values = [teamId];

    if (userId) {
      query += ` AND uploaded_by = $2`;
      values.push(userId);
    }

    query += ` GROUP BY category`;

    const result = await pool.query(query, values);

    const categories = result.rows;
    const totalCount = categories.reduce((sum, cat) => sum + parseInt(cat.count), 0);
    const totalSize = categories.reduce((sum, cat) => sum + parseInt(cat.total_size || 0), 0);

    return {
      categories: categories.map((cat) => ({
        category: cat.category,
        count: parseInt(cat.count),
        totalSize: parseInt(cat.total_size || 0),
      })),
      totalCount,
      totalSize,
    };
  }

  /**
   * Check if a file hash already exists (duplicate detection)
   */
  static async findByHash(fileHash, teamId) {
    const query = `
      SELECT * FROM documents
      WHERE file_hash = $1
      AND team_id = $2
      AND deleted_at IS NULL
      LIMIT 1
    `;

    const result = await pool.query(query, [fileHash, teamId]);
    return result.rows[0];
  }

  /**
   * Check if user can access document
   */
  static canAccess(doc, userId, teamId) {
    // Wrong team
    if (doc.team_id !== teamId) return false;

    // Owner always has access
    if (doc.uploaded_by === userId) return true;

    // Public documents
    if (doc.visibility === 'public') return true;

    // Team documents
    if (doc.visibility === 'team') return true;

    // Shared documents
    if (doc.visibility === 'shared') {
      const sharedWith = typeof doc.shared_with === 'string'
        ? JSON.parse(doc.shared_with)
        : doc.shared_with;
      return sharedWith && sharedWith.includes(userId);
    }

    return false;
  }

  /**
   * Get document file type category
   */
  static getFileType(mimeType) {
    if (mimeType?.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType?.includes('word')) return 'word';
    if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return 'excel';
    if (mimeType?.startsWith('text/')) return 'text';
    return 'other';
  }
}

module.exports = Document;
