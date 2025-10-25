const { pool } = require('../config/database');
const webhooksController = require('./webhooks.controller');
const crypto = require('crypto');

jest.mock('../config/database');

describe('WebhooksController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 'user-123', email: 'agent@example.com' },
      body: {},
      headers: {},
      params: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('registerWebhook (POST /webhooks)', () => {
    it('should register new webhook with valid URL', async () => {
      mockReq.body = {
        url: 'https://example.com/webhook',
        events: ['escrow.created', 'escrow.updated'],
        secret: 'webhook-secret-123',
      };

      const mockCreatedWebhook = {
        id: 'webhook-new',
        ...mockReq.body,
        created_at: '2025-01-01T00:00:00Z',
      };

      pool.query.mockResolvedValue({ rows: [mockCreatedWebhook] });

      await webhooksController.registerWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedWebhook,
      });
    });

    it('should validate webhook URL is HTTPS', async () => {
      mockReq.body = {
        url: 'http://insecure.com/webhook', // HTTP not allowed
        events: ['escrow.created'],
      };

      await webhooksController.registerWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_URL',
          message: expect.stringContaining('HTTPS'),
        }),
      });
    });

    it('should validate event types are supported', async () => {
      mockReq.body = {
        url: 'https://example.com/webhook',
        events: ['invalid.event'], // Unsupported event
      };

      await webhooksController.registerWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_EVENTS',
        }),
      });
    });
  });

  describe('handleIncomingWebhook (POST /webhooks/incoming/:provider)', () => {
    it('should process valid webhook with signature verification', async () => {
      mockReq.params = { provider: 'stripe' };
      mockReq.body = { event: 'payment.succeeded', data: {} };
      mockReq.headers['x-webhook-signature'] = 'valid-signature';

      pool.query.mockResolvedValue({ rows: [] });

      await webhooksController.handleIncomingWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Webhook received',
      });
    });

    it('should reject webhook with invalid signature', async () => {
      mockReq.params = { provider: 'stripe' };
      mockReq.body = { event: 'payment.succeeded' };
      mockReq.headers['x-webhook-signature'] = 'invalid-signature';

      await webhooksController.handleIncomingWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_SIGNATURE',
        }),
      });
    });

    it('should return 200 even for duplicate events (idempotency)', async () => {
      mockReq.params = { provider: 'stripe' };
      mockReq.body = { event: 'payment.succeeded', id: 'evt_123' };
      mockReq.headers['x-webhook-signature'] = 'valid-signature';

      // Simulate duplicate event already processed
      pool.query.mockResolvedValue({
        rows: [{ id: 'evt_123', processed: true }],
      });

      await webhooksController.handleIncomingWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event already processed',
      });
    });
  });

  describe('listWebhooks (GET /webhooks)', () => {
    it('should return all webhooks for user', async () => {
      const mockWebhooks = [
        {
          id: 'webhook-1',
          url: 'https://example.com/webhook',
          events: ['escrow.created'],
          is_active: true,
        },
        {
          id: 'webhook-2',
          url: 'https://other.com/webhook',
          events: ['client.updated'],
          is_active: false,
        },
      ];

      pool.query.mockResolvedValue({ rows: mockWebhooks });

      await webhooksController.listWebhooks(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockWebhooks,
      });
    });
  });

  describe('deleteWebhook (DELETE /webhooks/:id)', () => {
    it('should delete webhook', async () => {
      mockReq.params = { id: 'webhook-123' };

      pool.query.mockResolvedValue({ rows: [{ id: 'webhook-123' }] });

      await webhooksController.deleteWebhook(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        ['webhook-123', 'user-123'],
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Webhook deleted',
      });
    });

    it('should return 404 if webhook not found', async () => {
      mockReq.params = { id: 'nonexistent' };

      pool.query.mockResolvedValue({ rows: [] });

      await webhooksController.deleteWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Security Tests', () => {
    it('should not expose webhook secrets in list response', async () => {
      const mockWebhooks = [
        {
          id: 'webhook-1',
          url: 'https://example.com/webhook',
          secret: 'secret-key-123', // Should not be returned
        },
      ];

      pool.query.mockResolvedValue({ rows: mockWebhooks });

      await webhooksController.listWebhooks(mockReq, mockRes);

      const responseData = mockRes.json.mock.calls[0][0].data;
      responseData.forEach(webhook => {
        expect(webhook.secret).toBeUndefined();
      });
    });

    it('should validate signature using HMAC', async () => {
      const payload = JSON.stringify({ event: 'test' });
      const secret = 'webhook-secret';
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      mockReq.params = { provider: 'custom' };
      mockReq.body = JSON.parse(payload);
      mockReq.headers['x-webhook-signature'] = validSignature;

      // Mock finding the webhook secret
      pool.query.mockResolvedValue({
        rows: [{ secret: 'webhook-secret' }],
      });

      await webhooksController.handleIncomingWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle webhook retry logic for failed deliveries', async () => {
      mockReq.body = {
        webhookId: 'webhook-123',
        retryCount: 3,
      };

      pool.query.mockResolvedValue({ rows: [] });

      await webhooksController.retryWebhook(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: expect.stringContaining('retry'),
      });
    });

    it('should respect rate limits on webhook deliveries', async () => {
      // Simulate 100 webhook deliveries in 1 second
      const promises = Array(100).fill().map(() =>
        webhooksController.deliverWebhook(mockReq, mockRes)
      );

      await Promise.all(promises);

      // Should enforce rate limit
      expect(mockRes.status).toHaveBeenCalledWith(429);
    });
  });
});
