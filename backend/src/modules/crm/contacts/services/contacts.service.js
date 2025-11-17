/**
 * Contacts Service
 *
 * Business logic for contact management:
 * - Contact CRUD operations
 * - Multi-role assignment (contact can be client, lead, vendor, etc.)
 * - Contact search and filtering
 *
 * Extracted from contacts controllers for DDD compliance.
 */

const { pool } = require('../../../../config/infrastructure/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all contacts with filtering
 * @param {Object} filters - Query filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Array>} List of contacts
 */
exports.getAllContacts = async (filters, user) => {
  const { search, role, page = 1, limit = 50 } = filters;
  const teamId = user.team_id;
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      c.*,
      array_agg(DISTINCT cr.role_type) FILTER (WHERE cr.role_type IS NOT NULL) as roles
    FROM contacts c
    LEFT JOIN contact_roles cr ON c.id = cr.contact_id AND cr.deleted_at IS NULL
    WHERE c.team_id = $1 AND c.deleted_at IS NULL
  `;
  const params = [teamId];
  let paramCount = 1;

  // Search by name or email
  if (search) {
    paramCount++;
    query += ` AND (
      c.first_name ILIKE $${paramCount}
      OR c.last_name ILIKE $${paramCount}
      OR c.email ILIKE $${paramCount}
    )`;
    params.push(`%${search}%`);
  }

  query += ` GROUP BY c.id`;

  // Filter by role
  if (role) {
    paramCount++;
    query += ` HAVING $${paramCount} = ANY(array_agg(cr.role_type))`;
    params.push(role);
  }

  query += ` ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Get contact by ID
 * @param {string} id - Contact ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Contact details
 */
exports.getContactById = async (id, user) => {
  const teamId = user.team_id;

  const query = `
    SELECT
      c.*,
      json_agg(
        json_build_object(
          'role_type', cr.role_type,
          'entity_id', cr.entity_id,
          'entity_type', cr.entity_type,
          'created_at', cr.created_at
        )
      ) FILTER (WHERE cr.id IS NOT NULL) as roles
    FROM contacts c
    LEFT JOIN contact_roles cr ON c.id = cr.contact_id AND cr.deleted_at IS NULL
    WHERE c.id = $1 AND c.team_id = $2 AND c.deleted_at IS NULL
    GROUP BY c.id
  `;

  const result = await pool.query(query, [id, teamId]);

  if (result.rows.length === 0) {
    const error = new Error('Contact not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};

/**
 * Create contact
 * @param {Object} data - Contact data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created contact
 */
exports.createContact = async (data, user) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    company,
    notes,
    metadata
  } = data;

  const teamId = user.team_id;
  const createdBy = user.id;
  const id = uuidv4();

  const query = `
    INSERT INTO contacts (
      id,
      team_id,
      first_name,
      last_name,
      email,
      phone,
      company,
      notes,
      metadata,
      created_by,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    RETURNING *
  `;

  const result = await pool.query(query, [
    id,
    teamId,
    first_name,
    last_name,
    email,
    phone,
    company,
    notes,
    metadata ? JSON.stringify(metadata) : null,
    createdBy
  ]);

  return result.rows[0];
};

/**
 * Update contact
 * @param {string} id - Contact ID
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated contact
 */
exports.updateContact = async (id, data, user) => {
  const teamId = user.team_id;

  // Check access
  await exports.getContactById(id, user);

  const {
    first_name,
    last_name,
    email,
    phone,
    company,
    notes,
    metadata
  } = data;

  const updates = [];
  const params = [id, teamId];
  let paramCount = 2;

  if (first_name !== undefined) {
    paramCount++;
    updates.push(`first_name = $${paramCount}`);
    params.push(first_name);
  }

  if (last_name !== undefined) {
    paramCount++;
    updates.push(`last_name = $${paramCount}`);
    params.push(last_name);
  }

  if (email !== undefined) {
    paramCount++;
    updates.push(`email = $${paramCount}`);
    params.push(email);
  }

  if (phone !== undefined) {
    paramCount++;
    updates.push(`phone = $${paramCount}`);
    params.push(phone);
  }

  if (company !== undefined) {
    paramCount++;
    updates.push(`company = $${paramCount}`);
    params.push(company);
  }

  if (notes !== undefined) {
    paramCount++;
    updates.push(`notes = $${paramCount}`);
    params.push(notes);
  }

  if (metadata !== undefined) {
    paramCount++;
    updates.push(`metadata = $${paramCount}`);
    params.push(metadata ? JSON.stringify(metadata) : null);
  }

  if (updates.length === 0) {
    const error = new Error('No fields to update');
    error.code = 'NO_UPDATES';
    throw error;
  }

  updates.push('updated_at = NOW()');

  const query = `
    UPDATE contacts
    SET ${updates.join(', ')}
    WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, params);
  return result.rows[0];
};

/**
 * Delete contact (soft delete)
 * @param {string} id - Contact ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Deleted contact
 */
exports.deleteContact = async (id, user) => {
  const teamId = user.team_id;

  // Check access
  await exports.getContactById(id, user);

  const query = `
    UPDATE contacts
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND team_id = $2 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await pool.query(query, [id, teamId]);
  return result.rows[0];
};

/**
 * Assign role to contact
 * @param {string} contactId - Contact ID
 * @param {Object} roleData - Role data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created role assignment
 */
exports.assignRole = async (contactId, roleData, user) => {
  const { role_type, entity_type, entity_id } = roleData;
  const teamId = user.team_id;

  // Check contact exists
  await exports.getContactById(contactId, user);

  const query = `
    INSERT INTO contact_roles (
      id,
      contact_id,
      role_type,
      entity_type,
      entity_id,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *
  `;

  const result = await pool.query(query, [
    uuidv4(),
    contactId,
    role_type,
    entity_type,
    entity_id
  ]);

  return result.rows[0];
};

/**
 * Remove role from contact
 * @param {string} contactId - Contact ID
 * @param {string} roleId - Role ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<void>}
 */
exports.removeRole = async (contactId, roleId, user) => {
  // Check contact exists
  await exports.getContactById(contactId, user);

  const query = `
    UPDATE contact_roles
    SET deleted_at = NOW()
    WHERE id = $1 AND contact_id = $2 AND deleted_at IS NULL
  `;

  await pool.query(query, [roleId, contactId]);
};
