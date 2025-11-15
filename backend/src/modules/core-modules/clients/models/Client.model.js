const { v4: uuidv4 } = require('uuid');
const { query } = require('../../../../config/database');

class Client {
  static async create(data) {
    const id = `client_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

    const text = `
      INSERT INTO clients (
        id, first_name, last_name, preferred_name, client_status,
        client_type, email, phone, alternate_phone, address,
        preferred_contact_method, best_time_to_contact, demographics,
        preferences, financial, lead_info, communication, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const values = [
      id,
      data.firstName,
      data.lastName,
      data.preferredName,
      data.clientStatus || 'Active',
      data.clientType,
      data.email,
      data.phone,
      data.alternatePhone,
      JSON.stringify(data.address || {}),
      data.preferredContactMethod || 'Email',
      data.bestTimeToContact,
      JSON.stringify(data.demographics || {}),
      JSON.stringify(data.preferences || {}),
      JSON.stringify(data.financial || {}),
      JSON.stringify(data.leadInfo || {}),
      JSON.stringify(data.communication || {}),
      data.tags || [],
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let text = `
      SELECT c.*,
        COUNT(*) OVER() as total_count,
        COALESCE(t.transaction_count, 0) as transaction_count,
        COALESCE(t.total_volume, 0) as total_volume
      FROM clients c
      LEFT JOIN (
        SELECT 
          UNNEST(buyers) as client_id,
          COUNT(*) as transaction_count,
          SUM(purchase_price) as total_volume
        FROM escrows 
        WHERE escrow_status = 'Closed'
        GROUP BY client_id
        
        UNION ALL
        
        SELECT 
          UNNEST(sellers) as client_id,
          COUNT(*) as transaction_count,
          SUM(purchase_price) as total_volume
        FROM escrows 
        WHERE escrow_status = 'Closed'
        GROUP BY client_id
      ) t ON c.id = t.client_id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 0;

    if (filters.type) {
      paramCount++;
      text += ` AND c.client_type = $${paramCount}`;
      values.push(filters.type);
    }

    if (filters.status) {
      paramCount++;
      text += ` AND c.client_status = $${paramCount}`;
      values.push(filters.status);
    }

    if (filters.tag) {
      paramCount++;
      text += ` AND $${paramCount} = ANY(c.tags)`;
      values.push(filters.tag);
    }

    if (filters.search) {
      paramCount++;
      text += ` AND (c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount} OR c.phone ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    text += ' GROUP BY c.id';

    // Add sorting
    const sortField = filters.sort || 'created_at';
    const sortOrder = filters.order === 'asc' ? 'ASC' : 'DESC';
    text += ` ORDER BY c.${sortField} ${sortOrder}`;

    // Add pagination
    const limit = Math.min(filters.limit || 20, 100);
    const offset = ((filters.page || 1) - 1) * limit;
    text += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await query(text, values);

    return {
      clients: result.rows,
      total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
      page: filters.page || 1,
      pages: result.rows.length > 0 ? Math.ceil(result.rows[0].total_count / limit) : 0,
    };
  }

  static async findById(id) {
    const text = `
      SELECT c.*,
        array_agg(DISTINCT n.*) FILTER (WHERE n.id IS NOT NULL) as notes,
        array_agg(DISTINCT comm.*) FILTER (WHERE comm.id IS NOT NULL) as communications,
        array_agg(DISTINCT e.*) FILTER (WHERE e.id IS NOT NULL) as escrows,
        array_agg(DISTINCT l.*) FILTER (WHERE l.id IS NOT NULL) as listings
      FROM clients c
      LEFT JOIN notes n ON n.entity_id = c.id AND n.entity_type = 'client'
      LEFT JOIN communications comm ON comm.entity_id = c.id AND comm.entity_type = 'client'
      LEFT JOIN escrow_buyers eb ON eb.client_id = c.id
      LEFT JOIN escrow_sellers es ON es.client_id = c.id
      LEFT JOIN escrows e ON e.id = eb.escrow_id OR e.id = es.escrow_id
      LEFT JOIN listing_sellers ls ON ls.client_id = c.id
      LEFT JOIN listings l ON l.id = ls.listing_id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    const result = await query(text, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async update(id, data) {
    const fields = [];
    const values = [id];
    let paramCount = 1;

    Object.keys(data).forEach((key) => {
      if (key !== 'id' && key !== 'created_at') {
        paramCount++;
        if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(data[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(data[key]);
        }
      }
    });

    fields.push('updated_at = NOW()');

    const text = `
      UPDATE clients 
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(text, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async delete(id, requestedBy, reason) {
    const DeletionRequest = require('./DeletionRequest');
    return DeletionRequest.create('client', id, requestedBy, reason);
  }

  static async addNote(id, noteData) {
    const noteId = `note_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

    const text = `
      INSERT INTO notes (
        id, entity_type, entity_id, content, note_type, is_private, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      noteId,
      'client',
      id,
      noteData.note,
      noteData.type,
      noteData.isPrivate,
      noteData.createdBy,
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  static async updateTags(id, operation, tags) {
    let text;

    if (operation === 'add') {
      text = `
        UPDATE clients 
        SET tags = array(SELECT DISTINCT unnest(tags || $2::text[]))
        WHERE id = $1
        RETURNING *
      `;
    } else if (operation === 'remove') {
      text = `
        UPDATE clients 
        SET tags = array(SELECT unnest(tags) EXCEPT SELECT unnest($2::text[]))
        WHERE id = $1
        RETURNING *
      `;
    } else {
      text = `
        UPDATE clients 
        SET tags = $2
        WHERE id = $1
        RETURNING *
      `;
    }

    const result = await query(text, [id, tags]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

module.exports = Client;
