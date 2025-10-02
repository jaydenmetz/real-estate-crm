/**
 * Real-Time Alerting Service
 * Sends immediate alerts for critical security events
 */

const EmailService = require('./email.service');

class AlertingService {
  static async sendCriticalAlert(event, user = null) {
    const alertData = {
      eventType: event.event_type,
      severity: event.severity,
      message: event.message,
      timestamp: event.created_at || new Date().toISOString(),
      email: event.email || user?.email,
      ipAddress: event.ip_address,
    };

    // Send email alert
    await this.sendEmailAlert(alertData);
    return { success: true };
  }

  static async sendEmailAlert(alertData) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jaydenmetz.com';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="color: #d32f2f;">🚨 CRITICAL SECURITY ALERT</h1>
        <p><strong>Event:</strong> ${alertData.eventType}</p>
        <p><strong>Severity:</strong> ${alertData.severity}</p>
        <p><strong>Time:</strong> ${new Date(alertData.timestamp).toLocaleString()}</p>
        <p><strong>Message:</strong> ${alertData.message}</p>
        ${alertData.ipAddress ? `<p><strong>IP Address:</strong> ${alertData.ipAddress}</p>` : ''}
        ${alertData.email ? `<p><strong>User Email:</strong> ${alertData.email}</p>` : ''}
      </div>
    `;

    await EmailService.sendCustomEmail(
      adminEmail,
      `🚨 CRITICAL: ${alertData.eventType}`,
      emailHtml
    );
  }

  static shouldAlert(event) {
    return event.severity === 'critical' || 
           ['account_locked', 'geo_anomaly'].includes(event.event_type);
  }
}

module.exports = AlertingService;
