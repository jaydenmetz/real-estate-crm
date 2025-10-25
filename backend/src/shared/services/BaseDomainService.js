const { AppError } = require('../utils/errors');
const logger = require('../../utils/logger');
const db = require('../../config/database');

/**
 * BaseDomainService
 * Provides common functionality for all domain services
 * Adapted for PostgreSQL database
 */
class BaseDomainService {
  constructor(tableName, serviceName) {
    this.tableName = tableName;
    this.serviceName = serviceName;
    this.logger = typeof logger === 'function' ? logger : console;
    this.db = db;
  }

  /**
   * Find all with pagination and filters
   */
  async findAll(filters = {}, options = {}) {
    try {
      // Build query
      const query = this.buildQuery(filters);
      const { whereClause, values } = this.buildWhereClause(query);

      // Pagination
      const limit = options.limit || 20;
      const offset = options.skip || 0;

      // Sorting
      const sortBy = options.sortBy || 'created_at';
      const sortOrder = options.sortOrder || 'DESC';

      // Execute query
      const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
      const dataQuery = `
        SELECT * FROM ${this.tableName}
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;

      const [countResult, dataResult] = await Promise.all([
        this.db.query(countQuery, values),
        this.db.query(dataQuery, [...values, limit, offset])
      ]);

      const totalItems = parseInt(countResult.rows[0]?.total || 0);
      const items = dataResult.rows.map(item => this.transform(item));

      // Calculate stats
      const stats = await this.calculateStats(filters);

      return {
        items,
        stats,
        pagination: {
          page: options.page || 1,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit)
        }
      };
    } catch (error) {
      this.logger.error(`Error in findAll for ${this.serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Find by ID
   */
  async findById(id, options = {}) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        throw new AppError(`${this.serviceName} not found`, 404);
      }

      return this.transform(result.rows[0]);
    } catch (error) {
      this.logger.error(`Error in findById for ${this.serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Create new item
   */
  async create(data, user) {
    try {
      // Validate data
      await this.validateCreate(data);

      // Prepare data
      const itemData = {
        ...data,
        team_id: user.team_id,
        broker_id: user.broker_id,
        created_by: user.id,
        updated_by: user.id,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Build insert query
      const fields = Object.keys(itemData);
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
      const values = fields.map(field => itemData[field]);

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      const created = this.transform(result.rows[0]);

      // Emit event
      await this.emitEvent('created', created, user);

      return created;
    } catch (error) {
      this.logger.error(`Error in create for ${this.serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Update existing item
   */
  async update(id, data, user) {
    try {
      // Find item
      const item = await this.findById(id);

      // Check ownership
      await this.checkOwnership(item, user);

      // Validate update
      await this.validateUpdate(data, item);

      // Prepare update data
      const updateData = {
        ...data,
        updated_by: user.id,
        updated_at: new Date()
      };

      // Build update query
      const fields = Object.keys(updateData);
      const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
      const values = [...fields.map(field => updateData[field]), id];

      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE id = $${values.length}
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      const updated = this.transform(result.rows[0]);

      // Emit event
      await this.emitEvent('updated', updated, user);

      return updated;
    } catch (error) {
      this.logger.error(`Error in update for ${this.serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Delete item (soft delete if column exists)
   */
  async delete(id, user) {
    try {
      // Find item
      const item = await this.findById(id);

      // Check ownership
      await this.checkOwnership(item, user);

      // Check if table has deleted_at column for soft delete
      const query = `
        UPDATE ${this.tableName}
        SET deleted_at = $1, deleted_by = $2
        WHERE id = $3
        RETURNING *
      `;

      const result = await this.db.query(query, [new Date(), user.id, id]);

      // Emit event
      await this.emitEvent('deleted', { id }, user);

      return { success: true, id };
    } catch (error) {
      this.logger.error(`Error in delete for ${this.serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Build query from filters
   */
  buildQuery(filters) {
    const query = {};

    // User context
    if (filters.brokerId) {
      query.broker_id = filters.brokerId;
    }

    if (filters.teamId) {
      query.team_id = filters.teamId;
    }

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Date range
    if (filters.dateRange) {
      query.dateRange = filters.dateRange;
    }

    // Search
    if (filters.search) {
      query.search = filters.search;
    }

    return query;
  }

  /**
   * Build WHERE clause from query object
   */
  buildWhereClause(query) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Add deleted_at filter (soft delete)
    conditions.push('deleted_at IS NULL');

    Object.keys(query).forEach(key => {
      if (key === 'dateRange' && query[key]) {
        if (query[key].start) {
          conditions.push(`created_at >= $${paramIndex++}`);
          values.push(query[key].start);
        }
        if (query[key].end) {
          conditions.push(`created_at <= $${paramIndex++}`);
          values.push(query[key].end);
        }
      } else if (key === 'search' && query[key]) {
        // Implement search logic in subclasses
      } else if (query[key] !== undefined) {
        conditions.push(`${key} = $${paramIndex++}`);
        values.push(query[key]);
      }
    });

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    return { whereClause, values };
  }

  /**
   * Transform item for response
   */
  transform(item) {
    if (!item) return null;

    // Remove internal fields
    const { deleted_at, deleted_by, ...transformed } = item;

    return transformed;
  }

  /**
   * Calculate statistics
   */
  async calculateStats(filters) {
    try {
      const query = this.buildQuery(filters);
      const { whereClause, values } = this.buildWhereClause(query);

      const statsQuery = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
        FROM ${this.tableName}
        ${whereClause}
      `;

      const result = await this.db.query(statsQuery, values);
      const stats = result.rows[0];

      return {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        pending: parseInt(stats.pending) || 0,
        completed: parseInt(stats.completed) || 0,
        activePercentage: stats.total > 0
          ? Math.round((stats.active / stats.total) * 100)
          : 0
      };
    } catch (error) {
      this.logger.error(`Error calculating stats for ${this.serviceName}:`, error);
      return {
        total: 0,
        active: 0,
        pending: 0,
        completed: 0,
        activePercentage: 0
      };
    }
  }

  /**
   * Validate create data (override in subclasses)
   */
  async validateCreate(data) {
    return true;
  }

  /**
   * Validate update data (override in subclasses)
   */
  async validateUpdate(data, item) {
    return true;
  }

  /**
   * Check ownership
   */
  async checkOwnership(item, user) {
    // Check if user is the creator
    if (item.created_by && item.created_by.toString() !== user.id.toString()) {
      // If not creator, check team membership
      if (!item.team_id || item.team_id.toString() !== user.team_id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }
    return true;
  }

  /**
   * Emit domain event (override in subclasses)
   */
  async emitEvent(event, data, user) {
    this.logger.info(`Event: ${event}`, { service: this.serviceName, data, userId: user.id });
  }
}

module.exports = BaseDomainService;
