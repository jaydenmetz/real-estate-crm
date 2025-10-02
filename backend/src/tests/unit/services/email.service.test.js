/**
 * Unit Tests: Email Service
 * Tests email template generation and sending functionality
 */

const emailService = require('../../../services/email.service');
const logger = require('../../../utils/logger');

// Mock logger
jest.mock('../../../utils/logger');

describe('EmailService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock timer for deterministic message IDs
    jest.spyOn(Date, 'now').mockReturnValue(1696262400000);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendEmail()', () => {
    test('should send email with valid options', async () => {
      const options = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<h1>Test Email</h1>',
        template: 'test',
      };

      const result = await emailService.sendEmail(options);

      expect(result).toMatchObject({
        success: true,
        messageId: expect.stringMatching(/^msg_\d+_/),
        timestamp: expect.any(String),
      });

      expect(logger.info).toHaveBeenCalledWith('Email sent:', {
        to: options.to,
        subject: options.subject,
        template: options.template,
        timestamp: expect.any(String),
      });
    });

    test('should generate unique message IDs', async () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.111111111)
        .mockReturnValueOnce(0.222222222);

      const result1 = await emailService.sendEmail({
        to: 'user1@example.com',
        subject: 'Test 1',
        html: '<p>Test 1</p>',
      });

      const result2 = await emailService.sendEmail({
        to: 'user2@example.com',
        subject: 'Test 2',
        html: '<p>Test 2</p>',
      });

      expect(result1.messageId).not.toBe(result2.messageId);
    });

    test('should throw error on failure', async () => {
      // Force logger.info to throw an error
      logger.info.mockImplementationOnce(() => {
        throw new Error('Email service unavailable');
      });

      await expect(emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })).rejects.toThrow('Email service unavailable');

      expect(logger.error).toHaveBeenCalledWith('Email send failed:', expect.any(Error));
    });
  });

  describe('sendWelcomeEmail()', () => {
    test('should send welcome email with correct template', async () => {
      const data = {
        to: 'newuser@example.com',
        name: 'John Doe',
        clientType: 'Buyer',
      };

      const result = await emailService.sendWelcomeEmail(data);

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Email sent:', expect.objectContaining({
        to: data.to,
        subject: 'Welcome to Our Real Estate Services',
        template: 'welcome',
      }));
    });

    test('should generate correct welcome email body', async () => {
      const data = {
        to: 'buyer@example.com',
        name: 'Jane Smith',
        clientType: 'Seller',
      };

      await emailService.sendWelcomeEmail(data);

      const callArgs = logger.info.mock.calls[0][1];
      expect(callArgs.subject).toBe('Welcome to Our Real Estate Services');
    });
  });

  describe('sendPropertyUpdateEmail()', () => {
    test('should send property update with property count', async () => {
      const data = {
        to: 'buyer@example.com',
        name: 'John Buyer',
        propertyCount: 5,
      };

      const result = await emailService.sendPropertyUpdateEmail(data);

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Email sent:', expect.objectContaining({
        to: data.to,
        subject: 'New Properties Matching Your Criteria',
        template: 'propertyUpdate',
      }));
    });
  });

  describe('sendAppointmentReminder()', () => {
    test('should send appointment reminder with all details', async () => {
      const data = {
        to: 'client@example.com',
        name: 'Sarah Client',
        date: '2025-10-05',
        time: '2:00 PM',
        location: '123 Main St, Tehachapi, CA',
        type: 'Property Showing',
      };

      const result = await emailService.sendAppointmentReminder(data);

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Email sent:', expect.objectContaining({
        to: data.to,
        subject: 'Appointment Reminder',
        template: 'appointmentReminder',
      }));
    });
  });

  describe('sendStatusUpdate()', () => {
    test('should send status update for transaction', async () => {
      const data = {
        to: 'seller@example.com',
        name: 'Mike Seller',
        transactionType: 'listing',
        status: 'Under Contract',
        message: 'Congratulations! Your property is now under contract.',
      };

      const result = await emailService.sendStatusUpdate(data);

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Email sent:', expect.objectContaining({
        to: data.to,
        subject: 'Status Update on Your Real Estate Transaction',
        template: 'statusUpdate',
      }));
    });
  });

  describe('sendAccountLockoutAlert()', () => {
    test('should send security lockout alert with details', async () => {
      const data = {
        to: 'user@example.com',
        name: 'Test User',
        failedAttempts: 5,
        ipAddress: '192.168.1.100',
        lockedUntil: '2025-10-02 2:30 PM',
        minutesLocked: 30,
      };

      const result = await emailService.sendAccountLockoutAlert(data);

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Email sent:', expect.objectContaining({
        to: data.to,
        subject: '🔒 Security Alert: Your account has been temporarily locked',
        template: 'accountLockout',
      }));
    });

    test('should handle missing IP address gracefully', async () => {
      const data = {
        to: 'user@example.com',
        name: 'Test User',
        failedAttempts: 5,
        lockedUntil: '2025-10-02 2:30 PM',
        minutesLocked: 30,
      };

      const result = await emailService.sendAccountLockoutAlert(data);
      expect(result.success).toBe(true);
    });
  });

  describe('sendBulkEmail()', () => {
    test('should send bulk emails in batches', async () => {
      const recipients = [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' },
        { email: 'user3@example.com', name: 'User 3' },
      ];

      const template = {
        name: 'newsletter',
        subject: 'Monthly Newsletter',
        getBody: (data) => `<h1>Hi ${data.name}</h1><p>${data.content}</p>`,
      };

      const data = {
        content: 'Check out our new listings!',
      };

      const result = await emailService.sendBulkEmail(recipients, template, data);

      expect(result.sent).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(3);
      expect(logger.info).toHaveBeenCalledTimes(3);
    });

    test('should process large batches correctly', async () => {
      // Create 25 recipients (should be split into 3 batches: 10, 10, 5)
      const recipients = Array.from({ length: 25 }, (_, i) => ({
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
      }));

      const template = {
        name: 'bulk',
        subject: 'Bulk Email',
        getBody: (data) => `<p>Hi ${data.name}</p>`,
      };

      const result = await emailService.sendBulkEmail(recipients, template, {});

      expect(result.sent).toBe(25);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(25);
    });

    test('should handle partial failures in bulk send', async () => {
      const recipients = [
        { email: 'success1@example.com', name: 'User 1' },
        { email: 'success2@example.com', name: 'User 2' },
      ];

      const template = {
        name: 'test',
        subject: 'Test',
        getBody: (data) => `<p>${data.name}</p>`,
      };

      // Mock one failure
      let callCount = 0;
      logger.info.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Email service error');
        }
      });

      const result = await emailService.sendBulkEmail(recipients, template, {});

      expect(result.sent).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results[1]).toMatchObject({
        success: false,
        error: 'Email service error',
        recipient: 'success2@example.com',
      });
    });
  });

  describe('sendCustomEmail()', () => {
    test('should send custom email with arbitrary content', async () => {
      const to = 'custom@example.com';
      const subject = 'Custom Subject Line';
      const body = '<div><h2>Custom Content</h2><p>With custom HTML</p></div>';

      const result = await emailService.sendCustomEmail(to, subject, body);

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Email sent:', expect.objectContaining({
        to,
        subject,
        template: 'custom',
      }));
    });
  });

  describe('Template Content', () => {
    test('welcome template should include client type', () => {
      const template = emailService.templates.welcome;
      const body = template.getBody({
        name: 'Test User',
        clientType: 'BUYER',
      });

      expect(body).toContain('Welcome Test User!');
      expect(body).toContain('buyer journey');
    });

    test('propertyUpdate template should include property count', () => {
      const template = emailService.templates.propertyUpdate;
      const body = template.getBody({
        name: 'Jane',
        propertyCount: 7,
      });

      expect(body).toContain('Hi Jane');
      expect(body).toContain('7 new properties');
    });

    test('appointmentReminder template should include all appointment details', () => {
      const template = emailService.templates.appointmentReminder;
      const body = template.getBody({
        name: 'John',
        date: '2025-10-10',
        time: '3:00 PM',
        location: '456 Oak Ave',
        type: 'Consultation',
      });

      expect(body).toContain('Hi John');
      expect(body).toContain('2025-10-10');
      expect(body).toContain('3:00 PM');
      expect(body).toContain('456 Oak Ave');
      expect(body).toContain('Consultation');
    });

    test('statusUpdate template should include transaction details', () => {
      const template = emailService.templates.statusUpdate;
      const body = template.getBody({
        name: 'Sarah',
        transactionType: 'escrow',
        status: 'Pending',
        message: 'Awaiting signatures',
      });

      expect(body).toContain('Hi Sarah');
      expect(body).toContain('escrow');
      expect(body).toContain('Pending');
      expect(body).toContain('Awaiting signatures');
    });

    test('accountLockout template should include security details', () => {
      const template = emailService.templates.accountLockout;
      const body = template.getBody({
        name: 'Admin User',
        failedAttempts: 5,
        ipAddress: '10.0.0.1',
        lockedUntil: '2:30 PM',
        minutesLocked: 30,
      });

      expect(body).toContain('Hi Admin User');
      expect(body).toContain('5');
      expect(body).toContain('10.0.0.1');
      expect(body).toContain('2:30 PM');
      expect(body).toContain('30 minutes');
      expect(body).toContain('crm.jaydenmetz.com/settings#security');
    });

    test('accountLockout template should handle missing IP address', () => {
      const template = emailService.templates.accountLockout;
      const body = template.getBody({
        name: 'User',
        failedAttempts: 5,
        ipAddress: null,
        lockedUntil: '3:00 PM',
        minutesLocked: 30,
      });

      expect(body).toContain('Unknown');
    });
  });

  describe('Email Service Resilience', () => {
    test('should handle network delays gracefully', async () => {
      jest.useFakeTimers();

      const promise = emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      // Fast-forward the 100ms delay
      jest.advanceTimersByTime(100);

      const result = await promise;
      expect(result.success).toBe(true);

      jest.useRealTimers();
    });

    test('should return proper timestamp format', async () => {
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
