const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class DeletionRequest {
  static async create(entityType, entityId, requestedBy, reason) {
    const id = `del_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    
    const text = `
      INSERT INTO deletion_requests (
        id, entity_type, entity_id, requested_by, reason, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [id, entityType, entityId, requestedBy, reason, 'pending_approval'];
    const result = await query(text, values);
    
    return result.rows[0];
  }
  
  static async findAll(filters = {}) {
    let text = `
      SELECT dr.*, 
        CASE 
          WHEN dr.entity_type = 'escrow' THEN e.property_address
          WHEN dr.entity_type = 'listing' THEN l.property_address
          WHEN dr.entity_type = 'client' THEN c.first_name || ' ' || c.last_name
          ELSE dr.entity_id
        END as entity_description
      FROM deletion_requests dr
      LEFT JOIN escrows e ON dr.entity_id = e.id AND dr.entity_type = 'escrow'
      LEFT JOIN listings l ON dr.entity_id = l.id AND dr.entity_type = 'listing'
      LEFT JOIN clients c ON dr.entity_id = c.id AND dr.entity_type = 'client'
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;
    
    if (filters.status) {
      paramCount++;
      text += ` AND dr.status = $${paramCount}`;
      values.push(filters.status);
    }
    
    if (filters.entityType) {
      paramCount++;
      text += ` AND dr.entity_type = $${paramCount}`;
      values.push(filters.entityType);
    }
    
    text += ` ORDER BY dr.created_at DESC`;
    
    const result = await query(text, values);
    return result.rows;
  }
  
  static async approve(id, approvedBy) {
    const text = `
      UPDATE deletion_requests 
      SET status = 'approved', approved_by = $2, approved_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(text, [id, approvedBy]);
    
    if (result.rows.length > 0) {
      const request = result.rows[0];
      
      // Perform actual deletion based on entity type
      await this.executeActualDeletion(request);
    }
    
    return result.rows[0];
  }
  
  static async reject(id, rejectedBy, reason) {
    const text = `
      UPDATE deletion_requests 
      SET status = 'rejected', approved_by = $2, reason = reason || ' | Rejection reason: ' || $3
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(text, [id, rejectedBy, reason]);
    return result.rows[0];
  }
  
  static async executeActualDeletion(request) {
    const { entity_type, entity_id } = request;
    
    switch (entity_type) {
      case 'escrow':
        await query('DELETE FROM escrows WHERE id = $1', [entity_id]);
        break;
      case 'listing':
        await query('DELETE FROM listings WHERE id = $1', [entity_id]);
        break;
      case 'client':
        await query('DELETE FROM clients WHERE id = $1', [entity_id]);
        break;
      case 'lead':
        await query('DELETE FROM leads WHERE id = $1', [entity_id]);
        break;
      case 'appointment':
        await query('DELETE FROM appointments WHERE id = $1', [entity_id]);
        break;
    }
  }
}

module.exports = DeletionRequest;