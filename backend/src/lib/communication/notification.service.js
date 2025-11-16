/**
 * Notification Service
 * Manages broker notifications for agent activity
 *
 * PHASE 4: Multi-Tenant Admin System - Broker Notifications
 *
 * Features:
 * - Real-time WebSocket notifications to brokers
 * - Notification preferences (broker_notification_settings table)
 * - Email/SMS integration (future: SendGrid/Twilio)
 * - Configurable minimum thresholds (e.g., only notify for escrows > $100k)
 */

const { pool } = require('../../config/infrastructure/database');
const websocketService = require('../infrastructure/websocket.service');

class NotificationService {
  /**
   * Get broker's notification settings
   * @param {string} brokerId - Broker ID
   * @returns {Promise<Object>} Notification settings
   */
  static async getBrokerSettings(brokerId) {
    try {
      const query = `
        SELECT * FROM broker_notification_settings
        WHERE broker_id = $1
      `;

      const result = await pool.query(query, [brokerId]);

      if (result.rows.length === 0) {
        // Return default settings if none exist
        return {
          broker_id: brokerId,
          notify_escrow_created: true,
          notify_client_created: true,
          notify_listing_created: true,
          notify_escrow_closed: true,
          email_notifications: true,
          in_app_notifications: true,
          sms_notifications: false,
          min_escrow_value: null,
        };
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error fetching broker settings:', error);
      throw error;
    }
  }

  /**
   * Update broker's notification settings
   * @param {string} brokerId - Broker ID
   * @param {Object} settings - New settings
   * @returns {Promise<Object>} Updated settings
   */
  static async updateBrokerSettings(brokerId, settings) {
    try {
      const query = `
        INSERT INTO broker_notification_settings (
          broker_id,
          notify_escrow_created,
          notify_client_created,
          notify_listing_created,
          notify_escrow_closed,
          email_notifications,
          in_app_notifications,
          sms_notifications,
          min_escrow_value
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (broker_id)
        DO UPDATE SET
          notify_escrow_created = EXCLUDED.notify_escrow_created,
          notify_client_created = EXCLUDED.notify_client_created,
          notify_listing_created = EXCLUDED.notify_listing_created,
          notify_escrow_closed = EXCLUDED.notify_escrow_closed,
          email_notifications = EXCLUDED.email_notifications,
          in_app_notifications = EXCLUDED.in_app_notifications,
          sms_notifications = EXCLUDED.sms_notifications,
          min_escrow_value = EXCLUDED.min_escrow_value,
          updated_at = NOW()
        RETURNING *
      `;

      const result = await pool.query(query, [
        brokerId,
        settings.notify_escrow_created ?? true,
        settings.notify_client_created ?? true,
        settings.notify_listing_created ?? true,
        settings.notify_escrow_closed ?? true,
        settings.email_notifications ?? true,
        settings.in_app_notifications ?? true,
        settings.sms_notifications ?? false,
        settings.min_escrow_value ?? null,
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating broker settings:', error);
      throw error;
    }
  }

  /**
   * Send notification to broker (WebSocket + Email/SMS)
   * @param {string} brokerId - Broker ID
   * @param {Object} notification - Notification data
   */
  static async notifyBroker(brokerId, notification) {
    try {
      // Get broker settings
      const settings = await this.getBrokerSettings(brokerId);

      // Check if this type of notification is enabled
      const notificationTypeEnabled = {
        escrow_created: settings.notify_escrow_created,
        client_created: settings.notify_client_created,
        listing_created: settings.notify_listing_created,
        escrow_closed: settings.notify_escrow_closed,
      }[notification.type];

      if (!notificationTypeEnabled) {
        return; // Don't send if this type is disabled
      }

      // Check minimum escrow value threshold
      if (notification.type === 'escrow_created' && settings.min_escrow_value) {
        if (notification.data.purchase_price < settings.min_escrow_value) {
          return; // Don't notify for escrows below threshold
        }
      }

      // Send in-app notification (WebSocket)
      if (settings.in_app_notifications && websocketService.io) {
        websocketService.io.to(`broker-${brokerId}`).emit('broker:notification', {
          id: `notif_${Date.now()}`,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }

      // TODO: Send email notification (SendGrid integration)
      if (settings.email_notifications) {
        // await this.sendEmailNotification(brokerId, notification);
      }

      // TODO: Send SMS notification (Twilio integration)
      if (settings.sms_notifications) {
        // await this.sendSMSNotification(brokerId, notification);
      }
    } catch (error) {
      console.error('Error sending broker notification:', error);
      // Don't throw - notifications are fire-and-forget
    }
  }

  /**
   * Notify broker when agent creates an escrow
   * @param {Object} escrow - Escrow data
   * @param {Object} agent - Agent who created the escrow
   */
  static async notifyEscrowCreated(escrow, agent) {
    try {
      if (!agent.broker_id) return;

      await this.notifyBroker(agent.broker_id, {
        type: 'escrow_created',
        title: 'New Escrow Created',
        message: `${agent.first_name} ${agent.last_name} created a new escrow for ${escrow.property_address}`,
        data: {
          escrow_id: escrow.id,
          property_address: escrow.property_address,
          purchase_price: escrow.purchase_price,
          agent_name: `${agent.first_name} ${agent.last_name}`,
          agent_id: agent.id,
        },
      });
    } catch (error) {
      console.error('Error notifying escrow created:', error);
    }
  }

  /**
   * Notify broker when agent creates a client
   * @param {Object} client - Client data
   * @param {Object} agent - Agent who created the client
   */
  static async notifyClientCreated(client, agent) {
    try {
      if (!agent.broker_id) return;

      await this.notifyBroker(agent.broker_id, {
        type: 'client_created',
        title: 'New Client Added',
        message: `${agent.first_name} ${agent.last_name} added a new client: ${client.first_name} ${client.last_name}`,
        data: {
          client_id: client.id,
          client_name: `${client.first_name} ${client.last_name}`,
          client_type: client.client_type,
          agent_name: `${agent.first_name} ${agent.last_name}`,
          agent_id: agent.id,
        },
      });
    } catch (error) {
      console.error('Error notifying client created:', error);
    }
  }

  /**
   * Notify broker when agent creates a listing
   * @param {Object} listing - Listing data
   * @param {Object} agent - Agent who created the listing
   */
  static async notifyListingCreated(listing, agent) {
    try {
      if (!agent.broker_id) return;

      await this.notifyBroker(agent.broker_id, {
        type: 'listing_created',
        title: 'New Listing Added',
        message: `${agent.first_name} ${agent.last_name} added a new listing at ${listing.property_address}`,
        data: {
          listing_id: listing.id,
          property_address: listing.property_address,
          list_price: listing.list_price,
          agent_name: `${agent.first_name} ${agent.last_name}`,
          agent_id: agent.id,
        },
      });
    } catch (error) {
      console.error('Error notifying listing created:', error);
    }
  }

  /**
   * Notify broker when agent closes an escrow
   * @param {Object} escrow - Escrow data
   * @param {Object} agent - Agent who closed the escrow
   */
  static async notifyEscrowClosed(escrow, agent) {
    try {
      if (!agent.broker_id) return;

      await this.notifyBroker(agent.broker_id, {
        type: 'escrow_closed',
        title: 'Escrow Closed',
        message: `${agent.first_name} ${agent.last_name} closed escrow for ${escrow.property_address}`,
        data: {
          escrow_id: escrow.id,
          property_address: escrow.property_address,
          purchase_price: escrow.purchase_price,
          closing_date: escrow.closing_date,
          agent_name: `${agent.first_name} ${agent.last_name}`,
          agent_id: agent.id,
        },
      });
    } catch (error) {
      console.error('Error notifying escrow closed:', error);
    }
  }
}

module.exports = NotificationService;
