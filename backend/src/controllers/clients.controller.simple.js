const { pool } = require('../config/database');

class ClientsController {
  /**
   * Get all clients with pagination
   */
  static async getAllClients(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'active',
        search
      } = req.query;

      const offset = (page - 1) * limit;

      // Build WHERE conditions
      let whereConditions = [`co.team_id = $1`];
      let queryParams = [req.user.teamId || req.user.team_id];
      let paramIndex = 2;

      if (status && status !== 'all') {
        whereConditions.push(`cl.status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (search) {
        whereConditions.push(`(co.first_name ILIKE $${paramIndex} OR co.last_name ILIKE $${paramIndex} OR co.email ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        ${whereClause}
      `;

      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get clients with contact info
      queryParams.push(limit, offset);
      const dataQuery = `
        SELECT
          cl.id,
          cl.client_type,
          cl.status,
          cl.created_at,
          cl.updated_at,
          co.first_name,
          co.last_name,
          co.email,
          co.phone,
          co.address_street,
          co.address_city,
          co.address_state,
          co.address_zip,
          co.notes,
          co.tags
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        ${whereClause}
        ORDER BY cl.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await pool.query(dataQuery, queryParams);

      res.json({
        success: true,
        data: {
          clients: result.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch clients',
          details: error.message
        }
      });
    }
  }

  /**
   * Get a client by ID
   */
  static async getClientById(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT
          cl.*,
          co.first_name,
          co.last_name,
          co.email,
          co.phone,
          co.address_street,
          co.address_city,
          co.address_state,
          co.address_zip,
          co.notes,
          co.tags
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        WHERE cl.id = $1 AND co.team_id = $2
      `;

      const result = await pool.query(query, [id, req.user.teamId || req.user.team_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found'
          }
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch client'
        }
      });
    }
  }

  /**
   * Create a new client
   */
  static async createClient(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        firstName,
        lastName,
        email,
        phone,
        clientType = 'buyer',
        status = 'active',
        address,
        city,
        state,
        zipCode,
        notes,
        tags = []
      } = req.body;

      // Create contact first
      const contactQuery = `
        INSERT INTO contacts (
          contact_type,
          first_name,
          last_name,
          email,
          phone,
          address_street,
          address_city,
          address_state,
          address_zip,
          notes,
          tags,
          team_id,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `;

      const contactValues = [
        'client',
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        notes,
        tags,
        req.user.teamId || req.user.team_id,
        req.user.id
      ];

      const contactResult = await client.query(contactQuery, contactValues);
      const contactId = contactResult.rows[0].id;

      // Create client record
      const clientQuery = `
        INSERT INTO clients (
          contact_id,
          client_type,
          status,
          team_id,
          assigned_agent_id
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const clientValues = [
        contactId,
        clientType.toLowerCase(),
        status,
        req.user.teamId || req.user.team_id,
        req.user.id
      ];

      const clientResult = await client.query(clientQuery, clientValues);

      await client.query('COMMIT');

      // Return combined data
      const newClient = {
        ...clientResult.rows[0],
        firstName,
        lastName,
        email,
        phone
      };

      res.status(201).json({
        success: true,
        data: newClient
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create client error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create client',
          details: error.message
        }
      });
    } finally {
      client.release();
    }
  }

  /**
   * Update a client
   */
  static async updateClient(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { id } = req.params;
      const {
        firstName,
        lastName,
        email,
        phone,
        clientType,
        status,
        notes
      } = req.body;

      // Get the client with contact info
      const getQuery = `
        SELECT cl.*, co.id as contact_id
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        WHERE cl.id = $1 AND co.team_id = $2
      `;

      const getResult = await client.query(getQuery, [id, req.user.teamId || req.user.team_id]);

      if (getResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found'
          }
        });
      }

      const contactId = getResult.rows[0].contact_id;

      // Update contact if fields provided
      if (firstName || lastName || email || phone || notes) {
        const contactUpdates = [];
        const contactValues = [];
        let valueIndex = 1;

        if (firstName) {
          contactUpdates.push(`first_name = $${valueIndex++}`);
          contactValues.push(firstName);
        }
        if (lastName) {
          contactUpdates.push(`last_name = $${valueIndex++}`);
          contactValues.push(lastName);
        }
        if (email) {
          contactUpdates.push(`email = $${valueIndex++}`);
          contactValues.push(email);
        }
        if (phone) {
          contactUpdates.push(`phone = $${valueIndex++}`);
          contactValues.push(phone);
        }
        if (notes) {
          contactUpdates.push(`notes = $${valueIndex++}`);
          contactValues.push(notes);
        }

        if (contactUpdates.length > 0) {
          contactUpdates.push(`updated_at = CURRENT_TIMESTAMP`);
          contactValues.push(contactId);

          const contactQuery = `
            UPDATE contacts
            SET ${contactUpdates.join(', ')}
            WHERE id = $${valueIndex}
          `;

          await client.query(contactQuery, contactValues);
        }
      }

      // Update client if fields provided
      if (clientType || status) {
        const clientUpdates = [];
        const clientValues = [];
        let valueIndex = 1;

        if (clientType) {
          clientUpdates.push(`client_type = $${valueIndex++}`);
          clientValues.push(clientType.toLowerCase());
        }
        if (status) {
          clientUpdates.push(`status = $${valueIndex++}`);
          clientValues.push(status);
        }

        if (clientUpdates.length > 0) {
          clientUpdates.push(`updated_at = CURRENT_TIMESTAMP`);
          clientValues.push(id);

          const clientQuery = `
            UPDATE clients
            SET ${clientUpdates.join(', ')}
            WHERE id = $${valueIndex}
            RETURNING *
          `;

          await client.query(clientQuery, clientValues);
        }
      }

      await client.query('COMMIT');

      // Get updated client data
      const updatedQuery = `
        SELECT
          cl.*,
          co.first_name,
          co.last_name,
          co.email,
          co.phone
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        WHERE cl.id = $1
      `;

      const updatedResult = await client.query(updatedQuery, [id]);

      res.json({
        success: true,
        data: updatedResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update client error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update client'
        }
      });
    } finally {
      client.release();
    }
  }

  /**
   * Delete a client
   */
  static async deleteClient(req, res) {
    try {
      const { id } = req.params;

      // Check if client is archived
      const checkQuery = `
        SELECT cl.status
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        WHERE cl.id = $1 AND co.team_id = $2
      `;

      const checkResult = await pool.query(checkQuery, [id, req.user.teamId || req.user.team_id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found'
          }
        });
      }

      if (checkResult.rows[0].status !== 'archived') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NOT_ARCHIVED',
            message: 'Client must be archived before deletion'
          }
        });
      }

      // Delete client (will cascade delete contact due to FK constraint)
      const deleteQuery = `
        DELETE FROM clients
        WHERE id = $1
        RETURNING id
      `;

      await pool.query(deleteQuery, [id]);

      res.json({
        success: true,
        message: 'Client deleted successfully'
      });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete client'
        }
      });
    }
  }

  /**
   * Archive a client
   */
  static async archiveClient(req, res) {
    try {
      const { id } = req.params;

      const updateQuery = `
        UPDATE clients cl
        SET status = 'archived',
            updated_at = CURRENT_TIMESTAMP
        FROM contacts co
        WHERE cl.contact_id = co.id
          AND cl.id = $1
          AND co.team_id = $2
        RETURNING cl.*
      `;

      const result = await pool.query(updateQuery, [id, req.user.teamId || req.user.team_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found'
          }
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Archive client error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ARCHIVE_ERROR',
          message: 'Failed to archive client'
        }
      });
    }
  }

  /**
   * Add note to client
   */
  static async addNote(req, res) {
    try {
      const { id } = req.params;
      const { note } = req.body;

      // Get contact id for the client
      const getQuery = `
        SELECT co.id as contact_id, co.notes
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        WHERE cl.id = $1 AND co.team_id = $2
      `;

      const getResult = await pool.query(getQuery, [id, req.user.teamId || req.user.team_id]);

      if (getResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found'
          }
        });
      }

      const contactId = getResult.rows[0].contact_id;
      const currentNotes = getResult.rows[0].notes || '';
      const newNotes = currentNotes ? `${currentNotes}\n\n${new Date().toISOString()}: ${note}` : `${new Date().toISOString()}: ${note}`;

      const updateQuery = `
        UPDATE contacts
        SET notes = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [newNotes, contactId]);

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Add note error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ADD_NOTE_ERROR',
          message: 'Failed to add note'
        }
      });
    }
  }

  /**
   * Bulk update tags
   */
  static async bulkUpdateTags(req, res) {
    try {
      const { id } = req.params;
      const { tags } = req.body;

      // Get contact id for the client
      const getQuery = `
        SELECT co.id as contact_id
        FROM clients cl
        JOIN contacts co ON cl.contact_id = co.id
        WHERE cl.id = $1 AND co.team_id = $2
      `;

      const getResult = await pool.query(getQuery, [id, req.user.teamId || req.user.team_id]);

      if (getResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found'
          }
        });
      }

      const contactId = getResult.rows[0].contact_id;

      const updateQuery = `
        UPDATE contacts
        SET tags = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [tags, contactId]);

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update tags error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_TAGS_ERROR',
          message: 'Failed to update tags'
        }
      });
    }
  }
}

module.exports = ClientsController;