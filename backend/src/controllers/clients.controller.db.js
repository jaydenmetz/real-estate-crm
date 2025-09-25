const { pool } = require('../config/database');

class ClientsController {
  /**
   * Get all clients with pagination and filtering
   */
  static async getAllClients(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        sort = 'created_at',
        order = 'desc',
        search
      } = req.query;

      const offset = (page - 1) * limit;

      // Build WHERE conditions
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (type && type !== 'all') {
        whereConditions.push(`c.client_type = $${paramIndex}`);
        queryParams.push(type);
        paramIndex++;
      }

      if (status && status !== 'all') {
        whereConditions.push(`c.status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (search) {
        whereConditions.push(`(c.name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM clients c
        ${whereClause}
      `;
      const countResult = await pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);

      // Main query
      queryParams.push(limit, offset);
      const listQuery = `
        SELECT 
          c.id,
          c.name,
          c.email,
          c.phone,
          c.client_type as type,
          c.status,
          c.avatar,
          c.address,
          c.notes,
          c.tags,
          c.created_at,
          c.updated_at,
          COALESCE(
            (SELECT COUNT(*) FROM escrows WHERE buyer_email = c.email OR seller_email = c.email),
            0
          ) as transaction_count,
          COALESCE(
            (SELECT SUM(purchase_price) FROM escrows WHERE buyer_email = c.email OR seller_email = c.email),
            0
          ) as total_volume
        FROM clients c
        ${whereClause}
        ORDER BY ${sort} ${order.toUpperCase()}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const listResult = await pool.query(listQuery, queryParams);

      res.json({
        success: true,
        data: {
          clients: listResult.rows,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch clients'
        }
      });
    }
  }

  /**
   * Get single client by ID with full details
   */
  static async getClientById(req, res) {
    try {
      const { id } = req.params;
      
      // Get client details
      const clientQuery = `
        SELECT 
          c.*,
          COALESCE(
            (SELECT COUNT(*) FROM escrows WHERE buyer_email = c.email OR seller_email = c.email),
            0
          ) as transaction_count,
          COALESCE(
            (SELECT SUM(purchase_price) FROM escrows WHERE buyer_email = c.email OR seller_email = c.email),
            0
          ) as total_volume
        FROM clients c
        WHERE c.id = $1
      `;
      
      const clientResult = await pool.query(clientQuery, [id]);

      if (clientResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found'
          }
        });
      }

      const client = clientResult.rows[0];
      
      // Get related escrows
      const escrowsQuery = `
        SELECT 
          e.numeric_id as id,
          e.display_id,
          e.property_address,
          e.escrow_status as status,
          e.purchase_price,
          e.closing_date,
          CASE 
            WHEN e.buyer_email = $1 THEN 'buyer'
            WHEN e.seller_email = $1 THEN 'seller'
            ELSE 'unknown'
          END as client_role
        FROM escrows e
        WHERE e.buyer_email = $1 OR e.seller_email = $1
        ORDER BY e.created_at DESC
        LIMIT 10
      `;
      const escrowsResult = await pool.query(escrowsQuery, [client.email]);
      
      // Get appointments
      const appointmentsQuery = `
        SELECT 
          a.id,
          a.title,
          a.start_time,
          a.end_time,
          a.location,
          a.appointment_type as type,
          a.status
        FROM appointments a
        WHERE a.client_id = $1
        ORDER BY a.start_time DESC
        LIMIT 10
      `;
      const appointmentsResult = await pool.query(appointmentsQuery, [id]);
      
      // Get notes
      const notesQuery = `
        SELECT 
          n.id,
          n.content,
          n.created_at,
          n.created_by
        FROM notes n
        WHERE n.client_id = $1
        ORDER BY n.created_at DESC
        LIMIT 10
      `;
      const notesResult = await pool.query(notesQuery, [id]);

      // Format the response
      const response = {
        ...client,
        escrows: escrowsResult.rows,
        appointments: appointmentsResult.rows,
        notes: notesResult.rows,
        // Add default values for missing fields
        leadSource: client.lead_source || 'Direct',
        preferredContactMethod: client.preferred_contact_method || 'email',
        lastContactDate: client.last_contact_date || client.updated_at,
        lifetimeValue: parseFloat(client.total_volume) || 0
      };

      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      console.error('Error fetching client:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch client details'
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
        name,
        email,
        phone,
        type = 'buyer',
        status = 'active',
        address,
        notes,
        tags = [],
        leadSource = 'Direct',
        preferredContactMethod = 'email'
      } = req.body;
      
      // Check if client with email already exists
      const existingCheck = await client.query(
        'SELECT id FROM clients WHERE email = $1',
        [email]
      );
      
      if (existingCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'Client with this email already exists'
          }
        });
      }
      
      // Insert the new client
      const insertQuery = `
        INSERT INTO clients (
          name, email, phone, client_type, status,
          address, notes, tags, lead_source, preferred_contact_method,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        name, email, phone, type, status,
        address, notes, JSON.stringify(tags), leadSource, preferredContactMethod
      ];
      
      const result = await client.query(insertQuery, values);
      const newClient = result.rows[0];
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        data: newClient,
        message: 'Client created successfully'
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating client:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create client'
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
      const { id } = req.params;
      const updates = req.body;
      
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'created_at') {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No fields to update'
          }
        });
      }
      
      values.push(id);
      const updateQuery = `
        UPDATE clients 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, values);
      
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
        data: result.rows[0],
        message: 'Client updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating client:', error);
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
      
      const result = await pool.query(
        'DELETE FROM clients WHERE id = $1 RETURNING id',
        [id]
      );
      
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
        message: 'Client deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting client:', error);
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
   * Archive a client (soft delete)
   */
  static async archiveClient(req, res) {
    try {
      const { id } = req.params;

      const updateQuery = `
        UPDATE clients
        SET status = 'archived',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [id]);

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

      // Get current notes
      const getQuery = `
        SELECT notes FROM clients WHERE id = $1
      `;
      const getResult = await pool.query(getQuery, [id]);

      if (getResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found'
          }
        });
      }

      // Append new note
      const currentNotes = getResult.rows[0].notes || '';
      const newNotes = currentNotes ? `${currentNotes}\n\n${new Date().toISOString()}: ${note}` : `${new Date().toISOString()}: ${note}`;

      const updateQuery = `
        UPDATE clients
        SET notes = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [newNotes, id]);

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

      const updateQuery = `
        UPDATE clients
        SET tags = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [JSON.stringify(tags), id]);

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