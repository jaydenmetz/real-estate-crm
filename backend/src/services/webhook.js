const axios = require('axios');
const crypto = require('crypto');
const { query } = require('../config/database');
const logger = require('../utils/logger');
const redis = require('../config/redis');

/**
 * Webhook service for emitting events to external endpoints
 */
class WebhookService {
  /**
   * Emit webhook event to all registered endpoints
   * @param {string} teamId - Team ID
   * @param {string} event - Event name (e.g., 'escrow.created')
   * @param {object} payload - Event payload
   */
  static async emit(teamId, event, payload) {
    try {
      // Get active webhooks for this team and event
      const webhooks = await this.getActiveWebhooks(teamId, event);
      
      if (webhooks.length === 0) {
        return;
      }

      // Add metadata to payload
      const fullPayload = {
        event,
        team_id: teamId,
        timestamp: new Date().toISOString(),
        data: payload
      };

      // Send to each webhook endpoint
      const promises = webhooks.map(webhook => 
        this.sendWebhook(webhook, event, fullPayload)
      );

      // Execute all webhook calls in parallel
      await Promise.allSettled(promises);
    } catch (error) {
      logger.error('Error emitting webhook:', { error, teamId, event });
    }
  }

  /**
   * Get active webhooks for a team and event
   */
  static async getActiveWebhooks(teamId, event) {
    const result = await query(
      `
      SELECT * FROM webhooks
      WHERE team_id = $1
        AND is_active = true
        AND ($2 = ANY(events) OR 'all' = ANY(events))
      `,
      [teamId, event]
    );

    return result.rows;
  }

  /**
   * Send webhook to a specific endpoint
   */
  static async sendWebhook(webhook, event, payload) {
    const startTime = Date.now();
    let response;
    let error;

    try {
      // Generate signature if secret is configured
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Timestamp': payload.timestamp
      };

      if (webhook.secret) {
        const signature = this.generateSignature(webhook.secret, payload);
        headers['X-Webhook-Signature'] = signature;
      }

      // Send webhook request
      response = await axios.post(webhook.url, payload, {
        headers,
        timeout: 30000, // 30 second timeout
        validateStatus: () => true // Don't throw on any status
      });

      // Log successful delivery
      await this.logWebhookDelivery(webhook.id, event, payload, {
        status: response.status,
        body: response.data,
        duration: Date.now() - startTime,
        success: response.status >= 200 && response.status < 300
      });

    } catch (err) {
      error = err;
      
      // Log failed delivery
      await this.logWebhookDelivery(webhook.id, event, payload, {
        status: 0,
        error: err.message,
        duration: Date.now() - startTime,
        success: false
      });

      // Retry logic
      await this.scheduleRetry(webhook, event, payload);
    }

    return { webhook, response, error };
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  static generateSignature(secret, payload) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(secret, payload, signature) {
    const expected = this.generateSignature(secret, payload);
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  }

  /**
   * Log webhook delivery attempt
   */
  static async logWebhookDelivery(webhookId, event, payload, result) {
    try {
      await query(
        `
        INSERT INTO webhook_logs (
          webhook_id, event, payload, response_status,
          response_body, delivered_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          webhookId,
          event,
          payload,
          result.status,
          JSON.stringify(result.body || result.error),
          result.success ? new Date() : null
        ]
      );
    } catch (error) {
      logger.error('Error logging webhook delivery:', error);
    }
  }

  /**
   * Schedule webhook retry
   */
  static async scheduleRetry(webhook, event, payload, attemptCount = 1) {
    if (attemptCount >= 3) {
      logger.warn('Max webhook retry attempts reached', {
        webhookId: webhook.id,
        event
      });
      return;
    }

    // Exponential backoff: 1min, 5min, 15min
    const delays = [60000, 300000, 900000];
    const delay = delays[attemptCount - 1];

    // Store retry in Redis
    const retryKey = `webhook:retry:${webhook.id}:${Date.now()}`;
    await redis.setex(retryKey, delay / 1000, JSON.stringify({
      webhook,
      event,
      payload,
      attemptCount: attemptCount + 1
    }));

    // Schedule retry
    setTimeout(async () => {
      const retryData = await redis.get(retryKey);
      if (retryData) {
        const { webhook, event, payload, attemptCount } = JSON.parse(retryData);
        await this.sendWebhook(webhook, event, payload);
        await redis.del(retryKey);
      }
    }, delay);
  }

  /**
   * Register a new webhook
   */
  static async register(teamId, webhookData) {
    const { url, events, secret, metadata } = webhookData;

    const result = await query(
      `
      INSERT INTO webhooks (team_id, url, events, secret, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [teamId, url, events, secret, metadata || {}]
    );

    return result.rows[0];
  }

  /**
   * Update webhook
   */
  static async update(teamId, webhookId, updates) {
    const allowedFields = ['url', 'events', 'secret', 'is_active', 'metadata'];
    const updateFields = [];
    const values = [];
    let valueIndex = 1;

    for (const field of allowedFields) {
      if (updates.hasOwnProperty(field)) {
        updateFields.push(`${field} = $${valueIndex}`);
        values.push(updates[field]);
        valueIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(teamId, webhookId);
    const result = await query(
      `
      UPDATE webhooks
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE team_id = $${valueIndex} AND id = $${valueIndex + 1}
      RETURNING *
      `,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Webhook not found');
    }

    return result.rows[0];
  }

  /**
   * Delete webhook
   */
  static async delete(teamId, webhookId) {
    const result = await query(
      'DELETE FROM webhooks WHERE team_id = $1 AND id = $2 RETURNING id',
      [teamId, webhookId]
    );

    if (result.rows.length === 0) {
      throw new Error('Webhook not found');
    }

    return true;
  }

  /**
   * Get webhook logs
   */
  static async getLogs(teamId, webhookId, options = {}) {
    const { limit = 100, offset = 0 } = options;

    const result = await query(
      `
      SELECT l.*
      FROM webhook_logs l
      JOIN webhooks w ON w.id = l.webhook_id
      WHERE w.team_id = $1 AND l.webhook_id = $2
      ORDER BY l.created_at DESC
      LIMIT $3 OFFSET $4
      `,
      [teamId, webhookId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Test webhook endpoint
   */
  static async test(teamId, webhookId) {
    const result = await query(
      'SELECT * FROM webhooks WHERE team_id = $1 AND id = $2',
      [teamId, webhookId]
    );

    if (result.rows.length === 0) {
      throw new Error('Webhook not found');
    }

    const webhook = result.rows[0];
    const testPayload = {
      test: true,
      message: 'This is a test webhook from Real Estate CRM'
    };

    return await this.sendWebhook(webhook, 'webhook.test', testPayload);
  }
}

// Helper function for easy access
const emitWebhook = (teamId, event, payload) => 
  WebhookService.emit(teamId, event, payload);

module.exports = {
  WebhookService,
  emitWebhook
};