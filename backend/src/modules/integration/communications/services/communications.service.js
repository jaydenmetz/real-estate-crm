/**
 * Communications Service
 *
 * Business logic for sending emails, SMS, and other communications.
 * Simple utility service for DDD compliance.
 */

const nodemailer = require('nodemailer');
const { pool } = require('../../../../config/infrastructure/database');

/**
 * Send email
 * @param {Object} emailData - Email data
 * @returns {Promise<Object>} Send result
 */
exports.sendEmail = async (emailData) => {
  const { to, subject, body, from, cc, bcc, attachments } = emailData;

  // TODO: Configure email transporter (currently placeholder)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: from || process.env.SMTP_FROM,
      to,
      cc,
      bcc,
      subject,
      html: body,
      attachments
    });

    return {
      messageId: info.messageId,
      status: 'sent',
      response: info.response
    };
  } catch (error) {
    const err = new Error('Failed to send email');
    err.code = 'EMAIL_ERROR';
    err.details = error.message;
    throw err;
  }
};

/**
 * Send SMS
 * @param {Object} smsData - SMS data
 * @returns {Promise<Object>} Send result
 */
exports.sendSMS = async (smsData) => {
  const { to, message } = smsData;

  // TODO: Implement SMS provider (Twilio, etc.)
  // Placeholder for now
  console.log(`SMS to ${to}: ${message}`);

  return {
    messageId: `sms_${Date.now()}`,
    status: 'sent',
    to,
    message
  };
};

/**
 * Log communication
 * @param {Object} commData - Communication data
 * @returns {Promise<Object>} Logged communication
 */
exports.logCommunication = async (commData) => {
  const {
    team_id,
    type,
    direction,
    status,
    subject,
    body,
    from_address,
    to_address,
    related_entity_type,
    related_entity_id,
    metadata
  } = commData;

  const query = `
    INSERT INTO communications (
      id,
      team_id,
      type,
      direction,
      status,
      subject,
      body,
      from_address,
      to_address,
      related_entity_type,
      related_entity_id,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
    ) RETURNING *
  `;

  const result = await pool.query(query, [
    team_id,
    type,
    direction,
    status,
    subject,
    body,
    from_address,
    to_address,
    related_entity_type,
    related_entity_id,
    metadata ? JSON.stringify(metadata) : null
  ]);

  return result.rows[0];
};

/**
 * Get communication history
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Communication history
 */
exports.getCommunicationHistory = async (filters) => {
  const {
    team_id,
    related_entity_type,
    related_entity_id,
    type,
    direction,
    limit = 50
  } = filters;

  let query = `
    SELECT * FROM communications
    WHERE team_id = $1
  `;
  const params = [team_id];
  let paramCount = 1;

  if (related_entity_type) {
    paramCount++;
    query += ` AND related_entity_type = $${paramCount}`;
    params.push(related_entity_type);
  }

  if (related_entity_id) {
    paramCount++;
    query += ` AND related_entity_id = $${paramCount}`;
    params.push(related_entity_id);
  }

  if (type) {
    paramCount++;
    query += ` AND type = $${paramCount}`;
    params.push(type);
  }

  if (direction) {
    paramCount++;
    query += ` AND direction = $${paramCount}`;
    params.push(direction);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1}`;
  params.push(limit);

  const result = await pool.query(query, params);
  return result.rows;
};
