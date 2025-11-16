/**
 * Unit Tests: Alerting Service
 * Tests critical security alert functionality
 */

const AlertingService = require('../../../lib/communication/alerting.service');
const EmailService = require('../../../lib/communication/email.service');

// Mock EmailService
jest.mock('../../../services/email.service');

describe('AlertingService Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('sendCriticalAlert()', () => {
    test('should send critical alert with all event data', async () => {
      const event = {
        event_type: 'account_locked',
        severity: 'critical',
        message: 'Account locked after 5 failed login attempts',
        created_at: '2025-10-02T10:00:00.000Z',
        email: 'user@example.com',
        ip_address: '192.168.1.100',
      };

      EmailService.sendCustomEmail.mockResolvedValue({
        success: true,
        messageId: 'msg_123',
      });

      const result = await AlertingService.sendCriticalAlert(event);

      expect(result.success).toBe(true);
      expect(EmailService.sendCustomEmail).toHaveBeenCalledWith(
        'admin@jaydenmetz.com',
        '🚨 CRITICAL: account_locked',
        expect.stringContaining('CRITICAL SECURITY ALERT')
      );
    });

    test('should use user email if event email is missing', async () => {
      const event = {
        event_type: 'geo_anomaly',
        severity: 'critical',
        message: 'Login from unusual location',
        ip_address: '10.0.0.1',
      };

      const user = {
        email: 'testuser@example.com',
      };

      EmailService.sendCustomEmail.mockResolvedValue({ success: true });

      await AlertingService.sendCriticalAlert(event, user);

      expect(EmailService.sendCustomEmail).toHaveBeenCalled();
    });

    test('should use current timestamp if created_at is missing', async () => {
      const event = {
        event_type: 'suspicious_activity',
        severity: 'critical',
        message: 'Suspicious activity detected',
      };

      EmailService.sendCustomEmail.mockResolvedValue({ success: true });

      const result = await AlertingService.sendCriticalAlert(event);

      expect(result.success).toBe(true);
      expect(EmailService.sendCustomEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringMatching(/\d{1,2}\/\d{1,2}\/\d{4}/)
      );
    });

    test('should use custom admin email from environment', async () => {
      process.env.ADMIN_EMAIL = 'security@company.com';

      const event = {
        event_type: 'data_breach',
        severity: 'critical',
        message: 'Potential data breach detected',
      };

      EmailService.sendCustomEmail.mockResolvedValue({ success: true });

      await AlertingService.sendCriticalAlert(event);

      expect(EmailService.sendCustomEmail).toHaveBeenCalledWith(
        'security@company.com',
        expect.any(String),
        expect.any(String)
      );
    });
  });

  describe('sendEmailAlert()', () => {
    test('should format email with all alert details', async () => {
      const alertData = {
        eventType: 'account_locked',
        severity: 'critical',
        message: 'Multiple failed login attempts',
        timestamp: '2025-10-02T14:30:00.000Z',
        email: 'user@example.com',
        ipAddress: '192.168.1.50',
      };

      EmailService.sendCustomEmail.mockResolvedValue({ success: true });

      await AlertingService.sendEmailAlert(alertData);

      const callArgs = EmailService.sendCustomEmail.mock.calls[0];
      const emailHtml = callArgs[2];

      expect(emailHtml).toContain('CRITICAL SECURITY ALERT');
      expect(emailHtml).toContain('account_locked');
      expect(emailHtml).toContain('critical');
      expect(emailHtml).toContain('Multiple failed login attempts');
    });

    test('should send to admin email with proper subject format', async () => {
      const alertData = {
        eventType: 'geo_anomaly',
        severity: 'warning',
        message: 'Login from new location',
        timestamp: new Date().toISOString(),
      };

      EmailService.sendCustomEmail.mockResolvedValue({ success: true });

      await AlertingService.sendEmailAlert(alertData);

      expect(EmailService.sendCustomEmail).toHaveBeenCalledWith(
        'admin@jaydenmetz.com',
        '🚨 CRITICAL: geo_anomaly',
        expect.any(String)
      );
    });

    test('should handle email sending failure gracefully', async () => {
      const alertData = {
        eventType: 'test_event',
        severity: 'critical',
        message: 'Test message',
        timestamp: new Date().toISOString(),
      };

      EmailService.sendCustomEmail.mockRejectedValue(
        new Error('Email service unavailable')
      );

      await expect(
        AlertingService.sendEmailAlert(alertData)
      ).rejects.toThrow('Email service unavailable');
    });

    test('should format timestamp as human-readable date', async () => {
      const alertData = {
        eventType: 'test',
        severity: 'critical',
        message: 'Test',
        timestamp: '2025-10-02T15:45:30.000Z',
      };

      EmailService.sendCustomEmail.mockResolvedValue({ success: true });

      await AlertingService.sendEmailAlert(alertData);

      const emailHtml = EmailService.sendCustomEmail.mock.calls[0][2];
      expect(emailHtml).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('shouldAlert()', () => {
    test('should return true for critical severity', () => {
      const event = {
        event_type: 'any_event',
        severity: 'critical',
      };

      expect(AlertingService.shouldAlert(event)).toBe(true);
    });

    test('should return true for account_locked event', () => {
      const event = {
        event_type: 'account_locked',
        severity: 'warning',
      };

      expect(AlertingService.shouldAlert(event)).toBe(true);
    });

    test('should return true for geo_anomaly event', () => {
      const event = {
        event_type: 'geo_anomaly',
        severity: 'info',
      };

      expect(AlertingService.shouldAlert(event)).toBe(true);
    });

    test('should return false for non-critical, non-alert events', () => {
      const event = {
        event_type: 'login_success',
        severity: 'info',
      };

      expect(AlertingService.shouldAlert(event)).toBe(false);
    });

    test('should return false for warning severity without special event type', () => {
      const event = {
        event_type: 'rate_limit_exceeded',
        severity: 'warning',
      };

      expect(AlertingService.shouldAlert(event)).toBe(false);
    });

    test('should return false for error severity without special event type', () => {
      const event = {
        event_type: 'api_error',
        severity: 'error',
      };

      expect(AlertingService.shouldAlert(event)).toBe(false);
    });

    test('should handle edge case: critical severity with account_locked', () => {
      const event = {
        event_type: 'account_locked',
        severity: 'critical',
      };

      expect(AlertingService.shouldAlert(event)).toBe(true);
    });

    test('should handle edge case: critical severity with geo_anomaly', () => {
      const event = {
        event_type: 'geo_anomaly',
        severity: 'critical',
      };

      expect(AlertingService.shouldAlert(event)).toBe(true);
    });
  });

  describe('Integration with EmailService', () => {
    test('should properly invoke EmailService with formatted data', async () => {
      const event = {
        event_type: 'brute_force_attack',
        severity: 'critical',
        message: 'Brute force attack detected',
        created_at: '2025-10-02T10:30:00.000Z',
        email: 'attacker@example.com',
        ip_address: '1.2.3.4',
      };

      EmailService.sendCustomEmail.mockResolvedValue({
        success: true,
        messageId: 'msg_alert_123',
        timestamp: '2025-10-02T10:30:01.000Z',
      });

      const result = await AlertingService.sendCriticalAlert(event);

      expect(result.success).toBe(true);
      expect(EmailService.sendCustomEmail).toHaveBeenCalledTimes(1);

      const [to, subject, html] = EmailService.sendCustomEmail.mock.calls[0];
      expect(to).toBe('admin@jaydenmetz.com');
      expect(subject).toContain('🚨 CRITICAL');
      expect(subject).toContain('brute_force_attack');
      expect(html).toContain('Brute force attack detected');
      // Note: IP address is in alertData but not rendered in email template
    });

    test('should handle async EmailService calls correctly', async () => {
      const event = {
        event_type: 'test',
        severity: 'critical',
        message: 'Test event',
      };

      // Simulate slow email service
      EmailService.sendCustomEmail.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const start = Date.now();
      await AlertingService.sendCriticalAlert(event);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(EmailService.sendCustomEmail).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should propagate EmailService errors', async () => {
      const event = {
        event_type: 'test',
        severity: 'critical',
        message: 'Test',
      };

      EmailService.sendCustomEmail.mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(
        AlertingService.sendCriticalAlert(event)
      ).rejects.toThrow('Network timeout');
    });

    test('should handle malformed event data gracefully', async () => {
      const event = {
        // Missing most fields
        severity: 'critical',
      };

      EmailService.sendCustomEmail.mockResolvedValue({ success: true });

      const result = await AlertingService.sendCriticalAlert(event);

      expect(result.success).toBe(true);
      expect(EmailService.sendCustomEmail).toHaveBeenCalled();
    });

    test('should handle null event email and null user', async () => {
      const event = {
        event_type: 'test',
        severity: 'critical',
        message: 'Test',
      };

      EmailService.sendCustomEmail.mockResolvedValue({ success: true });

      const result = await AlertingService.sendCriticalAlert(event, null);

      expect(result.success).toBe(true);
      expect(EmailService.sendCustomEmail).toHaveBeenCalled();
    });
  });
});
