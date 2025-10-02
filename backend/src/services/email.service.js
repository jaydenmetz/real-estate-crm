const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.templates = {
      welcome: {
        subject: 'Welcome to Our Real Estate Services',
        getBody: (data) => `
          <h2>Welcome ${data.name}!</h2>
          <p>Thank you for choosing us as your real estate partner.</p>
          <p>We're excited to help you with your ${data.clientType.toLowerCase()} journey.</p>
          <p>Our team will be in touch shortly to discuss your needs and preferences.</p>
          <br>
          <p>Best regards,<br>Your Real Estate Team</p>
        `,
      },
      propertyUpdate: {
        subject: 'New Properties Matching Your Criteria',
        getBody: (data) => `
          <h2>Hi ${data.name},</h2>
          <p>We found ${data.propertyCount} new properties that match your search criteria!</p>
          <p>Log in to your account to view these exciting opportunities.</p>
          <br>
          <p>Best regards,<br>Your Real Estate Team</p>
        `,
      },
      appointmentReminder: {
        subject: 'Appointment Reminder',
        getBody: (data) => `
          <h2>Reminder: Upcoming Appointment</h2>
          <p>Hi ${data.name},</p>
          <p>This is a reminder about your appointment:</p>
          <ul>
            <li><strong>Date:</strong> ${data.date}</li>
            <li><strong>Time:</strong> ${data.time}</li>
            <li><strong>Location:</strong> ${data.location}</li>
            <li><strong>Type:</strong> ${data.type}</li>
          </ul>
          <p>Please let us know if you need to reschedule.</p>
          <br>
          <p>Best regards,<br>Your Real Estate Team</p>
        `,
      },
      statusUpdate: {
        subject: 'Status Update on Your Real Estate Transaction',
        getBody: (data) => `
          <h2>Transaction Status Update</h2>
          <p>Hi ${data.name},</p>
          <p>Your ${data.transactionType} status has been updated to: <strong>${data.status}</strong></p>
          <p>${data.message}</p>
          <br>
          <p>Best regards,<br>Your Real Estate Team</p>
        `,
      },
      accountLockout: {
        subject: '🔒 Security Alert: Your account has been temporarily locked',
        getBody: (data) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h1>🔒 Account Temporarily Locked</h1>
            </div>
            <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
              <p>Hi ${data.name},</p>

              <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong>⚠️ Security Alert:</strong> Your account has been temporarily locked due to multiple failed login attempts.
              </div>

              <h3>Lockout Details:</h3>
              <div style="background: white; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <strong>Failed Attempts:</strong> ${data.failedAttempts}
              </div>
              <div style="background: white; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <strong>IP Address:</strong> ${data.ipAddress || 'Unknown'}
              </div>
              <div style="background: white; padding: 10px; margin: 10px 0; border-radius: 4px;">
                <strong>Locked Until:</strong> ${data.lockedUntil} (${data.minutesLocked} minutes)
              </div>

              <h3>What This Means:</h3>
              <ul>
                <li>Your account will automatically unlock in <strong>${data.minutesLocked} minutes</strong></li>
                <li>If this was you, please wait and try again after the lockout period</li>
                <li>If this wasn't you, someone may be trying to access your account</li>
              </ul>

              <h3>Recommended Actions:</h3>
              <ol>
                <li>Review your recent security events in the Settings page</li>
                <li>Change your password if you suspect unauthorized access</li>
                <li>Enable two-factor authentication (when available)</li>
                <li>Contact support if you need immediate assistance</li>
              </ol>

              <div style="text-align: center; margin: 20px 0;">
                <a href="https://crm.jaydenmetz.com/settings#security"
                   style="display: inline-block; padding: 12px 24px; background: #1976d2; color: white;
                          text-decoration: none; border-radius: 4px;">
                  View Security Dashboard
                </a>
              </div>

              <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                <p>This is an automated security notification from Real Estate CRM</p>
                <p>If you did not attempt to log in, please contact support immediately</p>
              </div>
            </div>
          </div>
        `,
      },
    };
  }

  async sendEmail(options) {
    try {
      // In production, this would integrate with an email service like SendGrid, AWS SES, etc.
      logger.info('Email sent:', {
        to: options.to,
        subject: options.subject,
        template: options.template,
        timestamp: new Date().toISOString(),
      });

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Email send failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(data) {
    const template = this.templates.welcome;
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.getBody(data),
      template: 'welcome',
    });
  }

  async sendPropertyUpdateEmail(data) {
    const template = this.templates.propertyUpdate;
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.getBody(data),
      template: 'propertyUpdate',
    });
  }

  async sendAppointmentReminder(data) {
    const template = this.templates.appointmentReminder;
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.getBody(data),
      template: 'appointmentReminder',
    });
  }

  async sendStatusUpdate(data) {
    const template = this.templates.statusUpdate;
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.getBody(data),
      template: 'statusUpdate',
    });
  }

  async sendBulkEmail(recipients, template, data) {
    const results = [];

    // Process emails in batches to avoid overwhelming the service
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((recipient) => this.sendEmail({
          to: recipient.email,
          subject: template.subject,
          html: template.getBody({ ...data, name: recipient.name }),
          template: template.name,
        }).catch((error) => ({ success: false, error: error.message, recipient: recipient.email }))),
      );
      results.push(...batchResults);
    }

    return {
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  async sendCustomEmail(to, subject, body) {
    return this.sendEmail({
      to,
      subject,
      html: body,
      template: 'custom',
    });
  }

  async sendAccountLockoutAlert(data) {
    const template = this.templates.accountLockout;
    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.getBody(data),
      template: 'accountLockout',
    });
  }
}

module.exports = new EmailService();
