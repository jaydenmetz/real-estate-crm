const logger = require('../utils/logger');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const { url, events, secret } = req.body;
    
    const id = `wh_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    
    const text = `
      INSERT INTO webhooks (id, url, events, secret, active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [id, url, events, secret, true];
    const result = await query(text, values);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error registering webhook:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Failed to register webhook'
      }
    });
  }
};

exports.getWebhooks = async (req, res) => {
  try {
    const result = await query('SELECT * FROM webhooks WHERE active = true ORDER BY created_at DESC');
    
    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching webhooks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch webhooks'
      }
    });
  }
};

exports.deleteWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'UPDATE webhooks SET active = false WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Webhook not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting webhook:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete webhook'
      }
    });
  }
};

// Webhook dispatcher utility
exports.dispatchWebhook = async (event, data) => {
  try {
    const result = await query(
      'SELECT * FROM webhooks WHERE active = true AND $1 = ANY(events)',
      [event]
    );
    
    const promises = result.rows.map(async (webhook) => {
      try {
        const payload = {
          event,
          data,
          timestamp: new Date().toISOString()
        };
        
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': `sha256=${signature}`
          },
          body: JSON.stringify(payload)
        });
        
        await query(
          'UPDATE webhooks SET last_triggered = NOW() WHERE id = $1',
          [webhook.id]
        );
        
        logger.info(`Webhook dispatched: ${webhook.url} for event: ${event}`);
      } catch (error) {
        logger.error(`Webhook failed: ${webhook.url}`, error);
      }
    });
    
    await Promise.all(promises);
  } catch (error) {
    logger.error('Error dispatching webhooks:', error);
  }
};