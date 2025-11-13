/**
 * CRUD Controller Factory
 *
 * Generates standardized CRUD controller methods based on entity configuration.
 * Eliminates code duplication across listings, clients, leads, appointments controllers.
 *
 * Based on the working escrows pattern with improvements:
 * - Consistent user object handling (array vs string roles)
 * - Standardized ownership filtering
 * - WebSocket events for real-time updates
 * - Notification support
 * - Optimistic locking
 * - Soft delete (archive/restore)
 *
 * Usage:
 * const listingsController = createCRUDController(listingsConfig);
 * exports.getListings = listingsController.getAll;
 */

const { pool } = require('../../config/database');
const { query, transaction } = require('../../config/database');
const logger = require('../logger');
const { normalizeUser, getUserContext } = require('../user.normalizer');
const { buildOwnershipWhereClauseWithAlias, validateScope, getDefaultScope } = require('../ownership.helper');
const websocketService = require('../../services/websocket.service');
const NotificationService = require('../../services/notification.service');

/**
 * Create CRUD controller from entity configuration
 * @param {Object} entityConfig - Entity configuration from config/entities/
 * @returns {Object} - Controller object with CRUD methods
 */
function createCRUDController(entityConfig) {
  const { entity, fields, operations, query: queryConfig, filters, validation, websocket, notifications, hooks } = entityConfig;

  return {
    /**
     * GET ALL - Get paginated list of entities
     */
    getAll: async (req, res) => {
      try {
        // Normalize user object (handles array roles, field naming inconsistencies)
        const user = getUserContext(req.user);
        const { id: userId, role: userRole, teamId, brokerId } = user;

        // Extract query parameters
        const {
          page = 1,
          limit = queryConfig.defaultLimit,
          status,
          sort = queryConfig.defaultSort,
          order = queryConfig.defaultOrder,
          search,
          scope = getDefaultScope(userRole)
        } = req.query;

        const offset = (page - 1) * limit;

        // Build WHERE conditions
        const conditions = [`${entity.tableAlias}.${fields.deletedAt} IS NULL`];
        const values = [];
        let paramIndex = 1;

        // Status filter
        if (status && status !== 'all') {
          conditions.push(`${entity.tableAlias}.${fields.status} = $${paramIndex}`);
          values.push(status);
          paramIndex++;
        }

        // Search filter
        if (search && queryConfig.searchFields.length > 0) {
          const searchConditions = queryConfig.searchFields.map(field => {
            return `${field} ILIKE $${paramIndex}`;
          }).join(' OR ');
          conditions.push(`(${searchConditions})`);
          values.push(`%${search}%`);
          paramIndex++;
        }

        // Custom filters
        for (const filter of filters.custom) {
          const paramName = filter.name;
          const paramValue = req.query[paramName];

          if (paramValue !== undefined && paramValue !== null && paramValue !== '') {
            const fieldName = filter.field.includes('.') ? filter.field : `${entity.tableAlias}.${filter.field}`;
            conditions.push(`${fieldName} ${filter.operator} $${paramIndex}`);

            // Type conversion
            if (filter.type === 'number') {
              values.push(parseFloat(paramValue));
            } else {
              values.push(paramValue);
            }
            paramIndex++;
          }
        }

        // Scope-based ownership filtering
        const validatedScope = validateScope(scope, userRole);
        const ownershipFilter = buildOwnershipWhereClauseWithAlias(
          user,
          validatedScope,
          entity.name,
          entity.tableAlias,
          paramIndex
        );

        if (ownershipFilter.whereClause && ownershipFilter.whereClause !== '1=1') {
          conditions.push(ownershipFilter.whereClause);
          values.push(...ownershipFilter.params);
          paramIndex = ownershipFilter.nextParamIndex;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Build JOIN clauses
        let joinClause = '';
        if (queryConfig.joins && queryConfig.joins.length > 0) {
          joinClause = queryConfig.joins.map(join => {
            return `${join.type} JOIN ${join.table} ${join.alias} ON ${join.on}`;
          }).join(' ');
        }

        // Get total count
        const countQuery = `
          SELECT COUNT(*) as total
          FROM ${entity.tableName} ${entity.tableAlias}
          ${joinClause}
          ${whereClause}
        `;
        const countResult = await pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].total);

        // Validate sort column
        const sortField = queryConfig.allowedSortFields[sort] || queryConfig.allowedSortFields[queryConfig.defaultSort];
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Get paginated data
        values.push(limit, offset);
        const dataQuery = `
          SELECT ${queryConfig.selectFields.join(', ')}
          FROM ${entity.tableName} ${entity.tableAlias}
          ${joinClause}
          ${whereClause}
          ORDER BY ${sortField} ${sortOrder}
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const result = await pool.query(dataQuery, values);

        res.json({
          success: true,
          data: {
            [entity.namePlural]: result.rows,
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: Math.ceil(total / limit),
            },
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error(`Error fetching ${entity.namePlural}:`, error);
        res.status(500).json({
          success: false,
          error: {
            code: 'FETCH_ERROR',
            message: `Failed to fetch ${entity.namePlural}`,
          },
        });
      }
    },

    /**
     * GET BY ID - Get single entity by ID
     */
    getById: async (req, res) => {
      try {
        const { id } = req.params;

        // Build query with detail fields
        const getQuery = `
          SELECT ${queryConfig.detailFields.join(', ')}
          FROM ${entity.tableName} ${entity.tableAlias}
          WHERE ${entity.tableAlias}.${fields.id} = $1
          AND ${entity.tableAlias}.${fields.deletedAt} IS NULL
        `;

        const result = await pool.query(getQuery, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `${entity.label} not found`,
            },
          });
        }

        res.json({
          success: true,
          data: result.rows[0],
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error(`Error fetching ${entity.name}:`, error);
        res.status(500).json({
          success: false,
          error: {
            code: 'FETCH_ERROR',
            message: `Failed to fetch ${entity.name}`,
          },
        });
      }
    },

    /**
     * CREATE - Create new entity
     */
    create: async (req, res) => {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        let data = { ...req.body };
        const user = getUserContext(req.user);
        const { id: userId, teamId, brokerId } = user;

        // Run validation hook
        if (validation.onCreate) {
          validation.onCreate(data);
        }

        // Run beforeCreate hook
        if (hooks.beforeCreate) {
          data = await hooks.beforeCreate(data, user);
        }

        // Build dynamic insert query
        const fieldsList = [];
        const valuesList = [];
        const placeholders = [];
        let paramIndex = 1;

        // Map camelCase to snake_case
        const mappedData = {};
        for (const [key, value] of Object.entries(data)) {
          const dbField = operations.fieldMappings[key] || key;
          mappedData[dbField] = value;
        }

        // Add required fields
        for (const requiredField of operations.requiredFields) {
          if (!mappedData[requiredField]) {
            return res.status(400).json({
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: `${requiredField} is required`,
              },
            });
          }
        }

        // Add all provided fields
        for (const [field, value] of Object.entries(mappedData)) {
          if (!operations.immutableFields.includes(field)) {
            fieldsList.push(field);
            valuesList.push(value);
            placeholders.push(`$${paramIndex}`);
            paramIndex++;
          }
        }

        // Add owner field
        if (userId) {
          fieldsList.push(fields.owner);
          valuesList.push(userId);
          placeholders.push(`$${paramIndex}`);
          paramIndex++;
        }

        // Add team field
        if (teamId) {
          fieldsList.push(fields.team);
          valuesList.push(teamId);
          placeholders.push(`$${paramIndex}`);
          paramIndex++;
        }

        // Add timestamps
        fieldsList.push(fields.createdAt, fields.updatedAt);
        placeholders.push('NOW()', 'NOW()');

        const insertQuery = `
          INSERT INTO ${entity.tableName} (${fieldsList.join(', ')})
          VALUES (${placeholders.join(', ')})
          RETURNING *
        `;

        const result = await client.query(insertQuery, valuesList);
        const newRecord = result.rows[0];

        await client.query('COMMIT');

        // Run afterCreate hook
        if (hooks.afterCreate) {
          await hooks.afterCreate(newRecord, user);
        }

        // Send notifications
        if (notifications.enabled && notifications.onCreate) {
          const agent = {
            id: userId,
            first_name: user.firstName || 'Unknown',
            last_name: user.lastName || 'Agent',
          };
          NotificationService[`notify${entity.label}Created`]?.(newRecord, agent)
            .catch(err => console.error('Notification error:', err));
        }

        // Emit WebSocket event
        if (websocket.enabled) {
          const eventData = {
            entityType: entity.name,
            entityId: newRecord[fields.id],
            action: 'created',
            data: newRecord
          };

          if (websocket.broadcastRooms.includes('broker') && brokerId) {
            websocketService.sendToBroker(brokerId, 'data:update', eventData);
          }
          if (websocket.broadcastRooms.includes('team') && teamId) {
            websocketService.sendToTeam(teamId, 'data:update', eventData);
          }
          if (websocket.broadcastRooms.includes('user') && userId) {
            websocketService.sendToUser(userId, 'data:update', eventData);
          }
        }

        res.status(201).json({
          success: true,
          data: newRecord,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Error creating ${entity.name}:`, error);
        res.status(500).json({
          success: false,
          error: {
            code: 'CREATE_ERROR',
            message: `Failed to create ${entity.name}`,
            details: error.message,
          },
        });
      } finally {
        client.release();
      }
    },

    /**
     * UPDATE - Update existing entity
     */
    update: async (req, res) => {
      const client = await pool.connect();

      try {
        const { id } = req.params;
        let updates = { ...req.body };
        const user = getUserContext(req.user);
        const { id: userId, teamId, brokerId } = user;

        // Get current record for hooks
        const currentResult = await client.query(
          `SELECT * FROM ${entity.tableName} WHERE ${fields.id} = $1`,
          [id]
        );

        if (currentResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `${entity.label} not found`,
            },
          });
        }

        const currentRecord = currentResult.rows[0];

        // Run validation hook
        if (validation.onUpdate) {
          validation.onUpdate(updates, currentRecord);
        }

        // Run beforeUpdate hook
        if (hooks.beforeUpdate) {
          updates = await hooks.beforeUpdate(updates, currentRecord, user);
        }

        // Build dynamic update query
        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        // Map camelCase to snake_case
        for (const [key, value] of Object.entries(updates)) {
          const dbField = operations.fieldMappings[key] || key;

          if (!operations.immutableFields.includes(dbField) && dbField !== fields.id) {
            updateFields.push(`${dbField} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
          }
        }

        if (updateFields.length === 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'NO_UPDATES',
              message: 'No valid fields to update',
            },
          });
        }

        // Add updated_at and version
        updateFields.push(`${fields.updatedAt} = NOW()`);
        if (fields.version) {
          updateFields.push(`${fields.version} = ${fields.version} + 1`);
        }

        // Add id parameter
        values.push(id);

        // Optimistic locking
        const { version: clientVersion } = updates;
        let versionClause = '';
        if (clientVersion !== undefined && fields.version) {
          versionClause = ` AND ${fields.version} = $${paramIndex}`;
          values.push(clientVersion);
          paramIndex++;
        }

        const updateQuery = `
          UPDATE ${entity.tableName}
          SET ${updateFields.join(', ')}
          WHERE ${fields.id} = $${paramIndex - (clientVersion !== undefined ? 1 : 0)}
          AND ${fields.deletedAt} IS NULL${versionClause}
          RETURNING *
        `;

        const result = await client.query(updateQuery, values);

        if (result.rows.length === 0) {
          if (clientVersion !== undefined) {
            return res.status(409).json({
              success: false,
              error: {
                code: 'VERSION_CONFLICT',
                message: `This ${entity.name} was modified by another user. Please refresh and try again.`,
              },
            });
          }

          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `${entity.label} not found`,
            },
          });
        }

        const updatedRecord = result.rows[0];

        // Run afterUpdate hook
        if (hooks.afterUpdate) {
          await hooks.afterUpdate(updatedRecord, currentRecord, user);
        }

        // Emit WebSocket event
        if (websocket.enabled) {
          const eventData = {
            entityType: entity.name,
            entityId: updatedRecord[fields.id],
            action: 'updated',
            data: updatedRecord
          };

          if (websocket.broadcastRooms.includes('broker') && brokerId) {
            websocketService.sendToBroker(brokerId, 'data:update', eventData);
          }
          if (websocket.broadcastRooms.includes('team') && teamId) {
            websocketService.sendToTeam(teamId, 'data:update', eventData);
          }
          if (websocket.broadcastRooms.includes('user') && userId) {
            websocketService.sendToUser(userId, 'data:update', eventData);
          }
        }

        res.json({
          success: true,
          data: updatedRecord,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error(`Error updating ${entity.name}:`, error);
        res.status(500).json({
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: `Failed to update ${entity.name}`,
          },
        });
      } finally {
        client.release();
      }
    },

    /**
     * ARCHIVE - Soft delete entity
     */
    archive: async (req, res) => {
      try {
        const { id } = req.params;
        const user = getUserContext(req.user);

        // Run beforeDelete hook
        if (hooks.beforeDelete) {
          await hooks.beforeDelete(id, user);
        }

        const archiveQuery = `
          UPDATE ${entity.tableName}
          SET ${fields.deletedAt} = CURRENT_TIMESTAMP,
              ${fields.updatedAt} = CURRENT_TIMESTAMP
          WHERE ${fields.id} = $1
          AND ${fields.deletedAt} IS NULL
          RETURNING *
        `;

        const result = await pool.query(archiveQuery, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `${entity.label} not found or already archived`,
            },
          });
        }

        // Run afterDelete hook
        if (hooks.afterDelete) {
          await hooks.afterDelete(result.rows[0], user);
        }

        res.json({
          success: true,
          data: result.rows[0],
          message: `${entity.label} archived successfully`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error(`Error archiving ${entity.name}:`, error);
        res.status(500).json({
          success: false,
          error: {
            code: 'ARCHIVE_ERROR',
            message: `Failed to archive ${entity.name}`,
          },
        });
      }
    },

    /**
     * DELETE - Permanently delete entity
     */
    delete: async (req, res) => {
      try {
        const { id } = req.params;
        const user = getUserContext(req.user);
        const { id: userId, teamId, brokerId } = user;

        // Only allow delete of archived entities
        const deleteQuery = `
          DELETE FROM ${entity.tableName}
          WHERE ${fields.id} = $1
          AND ${fields.deletedAt} IS NOT NULL
          RETURNING *
        `;

        const result = await pool.query(deleteQuery, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `${entity.label} not found in archives. Only archived ${entity.namePlural} can be permanently deleted.`,
            },
          });
        }

        // Emit WebSocket event
        if (websocket.enabled) {
          const eventData = {
            entityType: entity.name,
            entityId: id,
            action: 'deleted',
            data: { id }
          };

          if (websocket.broadcastRooms.includes('broker') && brokerId) {
            websocketService.sendToBroker(brokerId, 'data:update', eventData);
          }
          if (websocket.broadcastRooms.includes('team') && teamId) {
            websocketService.sendToTeam(teamId, 'data:update', eventData);
          }
          if (websocket.broadcastRooms.includes('user') && userId) {
            websocketService.sendToUser(userId, 'data:update', eventData);
          }
        }

        res.json({
          success: true,
          message: `${entity.label} permanently deleted`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error(`Error deleting ${entity.name}:`, error);
        res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: `Failed to delete ${entity.name}`,
          },
        });
      }
    },

    /**
     * BATCH DELETE - Permanently delete multiple entities
     */
    batchDelete: async (req, res) => {
      const client = await pool.connect();

      try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'IDs must be a non-empty array',
            },
          });
        }

        await client.query('BEGIN');

        // Verify all entities exist and are archived
        const verifyQuery = `
          SELECT ${fields.id}, ${fields.deletedAt}
          FROM ${entity.tableName}
          WHERE ${fields.id} = ANY($1)
        `;

        const verifyResult = await client.query(verifyQuery, [ids]);

        if (verifyResult.rows.length !== ids.length) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Some ${entity.namePlural} not found`,
            },
          });
        }

        // Check all are archived
        const notArchived = verifyResult.rows.filter(row => !row[fields.deletedAt]);
        if (notArchived.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: {
              code: 'NOT_ARCHIVED',
              message: `All ${entity.namePlural} must be archived before deletion`,
            },
          });
        }

        // Delete all
        const deleteQuery = `
          DELETE FROM ${entity.tableName}
          WHERE ${fields.id} = ANY($1)
          AND ${fields.deletedAt} IS NOT NULL
          RETURNING *
        `;

        const deleteResult = await client.query(deleteQuery, [ids]);

        await client.query('COMMIT');

        res.json({
          success: true,
          data: {
            deleted: deleteResult.rows.length,
            [entity.namePlural]: deleteResult.rows,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Error in batch delete ${entity.namePlural}:`, error);
        res.status(500).json({
          success: false,
          error: {
            code: 'BATCH_DELETE_ERROR',
            message: `Failed to delete ${entity.namePlural}`,
          },
        });
      } finally {
        client.release();
      }
    }
  };
}

module.exports = {
  createCRUDController
};
