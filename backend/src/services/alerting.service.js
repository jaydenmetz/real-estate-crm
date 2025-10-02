/**
 * Security Alerting Service
 *
 * Sends security alerts to multiple channels based on severity:
 * - P1 (Critical): Phone, SMS, Slack, Email, PagerDuty
 * - P2 (High): Slack, Email, PagerDuty
 * - P3 (Medium): Email
 * - P4 (Low): Daily digest
 */

const logger = require('../utils/logger');

class AlertingService {
  constructor() {
    this.SLACK_WEBHOOK = process.env.SLACK_SECURITY_WEBHOOK;
    this.PAGERDUTY_KEY = process.env.PAGERDUTY_INTEGRATION_KEY;
    this.SECURITY_EMAIL = process.env.SECURITY_EMAIL || '[email protected]';
    this.SECURITY_PHONE = process.env.SECURITY_PHONE; // For SMS/calls
  }

  /**
   * Send alert to appropriate channels based on severity
   */
  async sendAlert(alert) {
    try {
      // Deduplicate alerts
      const isDuplicate = await this.checkDuplicate(alert);
      if (isDuplicate) {
        logger.info('Suppressing duplicate alert', { alert });
        return;
      }

      // Route based on severity
      switch (alert.severity) {
        case 'P1': // Critical
          await this.sendCriticalAlert(alert);
          break;
        case 'P2': // High
          await this.sendHighAlert(alert);
          break;
        case 'P3': // Medium
          await this.sendMediumAlert(alert);
          break;
        case 'P4': // Low
          await this.addToDailyDigest(alert);
          break;
        default:
          logger.warn('Unknown alert severity', { alert });
      }

      // Log alert
      await this.logAlert(alert);

    } catch (error) {
      logger.error('Error sending alert', { error, alert });
      // Don't throw - alerting failures shouldn't crash the app
    }
  }

  /**
   * Send P1 Critical Alert (all channels)
   */
  async sendCriticalAlert(alert) {
    const promises = [];

    // Slack with @channel mention
    if (this.SLACK_WEBHOOK) {
      promises.push(this.sendSlackAlert(alert, true));
    }

    // PagerDuty incident
    if (this.PAGERDUTY_KEY) {
      promises.push(this.createPagerDutyIncident(alert));
    }

    // Email
    promises.push(this.sendEmailAlert(alert));

    // SMS (optional - requires Twilio setup)
    if (this.SECURITY_PHONE) {
      promises.push(this.sendSMSAlert(alert));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send P2 High Alert (Slack, Email, PagerDuty)
   */
  async sendHighAlert(alert) {
    const promises = [];

    if (this.SLACK_WEBHOOK) {
      promises.push(this.sendSlackAlert(alert, false));
    }

    if (this.PAGERDUTY_KEY) {
      promises.push(this.createPagerDutyIncident(alert));
    }

    promises.push(this.sendEmailAlert(alert));

    await Promise.allSettled(promises);
  }

  /**
   * Send P3 Medium Alert (Email only)
   */
  async sendMediumAlert(alert) {
    await this.sendEmailAlert(alert);
  }

  /**
   * Send alert to Slack
   */
  async sendSlackAlert(alert, mentionChannel = false) {
    if (!this.SLACK_WEBHOOK) return;

    const color = this.getSeverityColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    const payload = {
      channel: '#security-incidents',
      username: 'Security Bot',
      icon_emoji: ':rotating_light:',
      text: mentionChannel ? '<!channel> CRITICAL SECURITY ALERT' : 'Security Alert',
      attachments: [{
        color: color,
        title: `${emoji} ${alert.type}`,
        text: alert.message,
        fields: [
          {
            title: 'Severity',
            value: alert.severity,
            short: true
          },
          {
            title: 'Time',
            value: new Date().toISOString(),
            short: true
          },
          {
            title: 'User',
            value: alert.user || 'N/A',
            short: true
          },
          {
            title: 'IP Address',
            value: alert.ip || 'N/A',
            short: true
          }
        ],
        actions: [
          {
            type: 'button',
            text: 'Acknowledge',
            url: `${process.env.FRONTEND_URL}/alerts/${alert.id}`
          },
          {
            type: 'button',
            text: 'View Details',
            url: `${process.env.FRONTEND_URL}/security-events?type=${alert.type}`
          }
        ]
      }]
    };

    const response = await fetch(this.SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack alert failed: ${response.statusText}`);
    }
  }

  /**
   * Create PagerDuty incident
   */
  async createPagerDutyIncident(alert) {
    if (!this.PAGERDUTY_KEY) return;

    const payload = {
      routing_key: this.PAGERDUTY_KEY,
      event_action: 'trigger',
      payload: {
        summary: `[${alert.severity}] ${alert.message}`,
        severity: alert.severity === 'P1' ? 'critical' : 'error',
        source: 'CRM Security System',
        component: alert.component || 'security',
        group: alert.type,
        class: alert.category || 'security_event',
        custom_details: {
          alert_id: alert.id,
          user: alert.user,
          ip_address: alert.ip,
          event_type: alert.type,
          timestamp: new Date().toISOString(),
          metadata: alert.metadata
        }
      },
      links: [
        {
          href: `${process.env.FRONTEND_URL}/alerts/${alert.id}`,
          text: 'View Alert Details'
        }
      ]
    };

    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pagerduty+json;version=2'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`PagerDuty alert failed: ${response.statusText}`);
    }
  }

  /**
   * Send email alert
   * (Requires email service like SendGrid - placeholder implementation)
   */
  async sendEmailAlert(alert) {
    // TODO: Implement email sending when email service is configured
    // For now, just log
    logger.info('Email alert would be sent', {
      to: this.SECURITY_EMAIL,
      subject: `[${alert.severity}] Security Alert: ${alert.type}`,
      alert
    });

    // Example SendGrid implementation:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: this.SECURITY_EMAIL,
      from: '[email protected]',
      subject: `[${alert.severity}] Security Alert: ${alert.type}`,
      text: alert.message,
      html: this.generateAlertEmail(alert)
    };

    await sgMail.send(msg);
    */
  }

  /**
   * Send SMS alert
   * (Requires Twilio - placeholder implementation)
   */
  async sendSMSAlert(alert) {
    // TODO: Implement SMS when Twilio is configured
    logger.info('SMS alert would be sent', {
      to: this.SECURITY_PHONE,
      message: `CRITICAL: ${alert.message}`,
      alert
    });

    // Example Twilio implementation:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

    await client.messages.create({
      body: `[P1 CRITICAL] ${alert.message}`,
      from: process.env.TWILIO_PHONE,
      to: this.SECURITY_PHONE
    });
    */
  }

  /**
   * Check for duplicate alerts (deduplication)
   */
  async checkDuplicate(alert) {
    // Check if we've seen this alert in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // TODO: Query recent alerts from database
    // For now, use in-memory cache (replace with Redis in production)

    const cacheKey = `alert:${alert.type}:${alert.user}:${alert.severity}`;
    const recentAlert = this.alertCache?.get(cacheKey);

    if (recentAlert && recentAlert.timestamp > oneHourAgo) {
      // Increment counter instead of new alert
      recentAlert.count++;
      recentAlert.last_seen = new Date();

      // Re-alert if count crosses threshold
      if (recentAlert.count === 10 || recentAlert.count === 50 || recentAlert.count === 100) {
        alert.message = `${alert.message} (${recentAlert.count} occurrences in 1 hour)`;
        return false; // Don't deduplicate, send aggregated alert
      }

      return true; // Suppress duplicate
    }

    // Store in cache
    if (!this.alertCache) {
      this.alertCache = new Map();
    }
    this.alertCache.set(cacheKey, {
      count: 1,
      timestamp: new Date(),
      last_seen: new Date()
    });

    return false; // Not a duplicate
  }

  /**
   * Add to daily digest (P4 low priority alerts)
   */
  async addToDailyDigest(alert) {
    // TODO: Store in database for daily digest email
    logger.info('Added to daily digest', { alert });
  }

  /**
   * Log alert to database
   */
  async logAlert(alert) {
    // TODO: Insert into alerts table for audit trail
    logger.info('Alert logged', { alert });
  }

  /**
   * Get severity color for Slack
   */
  getSeverityColor(severity) {
    const colors = {
      'P1': 'danger',    // Red
      'P2': 'warning',   // Orange
      'P3': 'good',      // Green
      'P4': '#808080'    // Gray
    };
    return colors[severity] || 'good';
  }

  /**
   * Get severity emoji
   */
  getSeverityEmoji(severity) {
    const emojis = {
      'P1': '🚨',
      'P2': '⚠️',
      'P3': 'ℹ️',
      'P4': '📝'
    };
    return emojis[severity] || 'ℹ️';
  }
}

module.exports = new AlertingService();
