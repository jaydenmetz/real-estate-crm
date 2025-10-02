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
}

module.exports = new EmailService();
