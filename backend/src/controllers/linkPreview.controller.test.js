const linkPreviewController = require('./linkPreview.controller');
const axios = require('axios');

jest.mock('axios');

describe('LinkPreviewController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
      body: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getPreview (GET /link-preview)', () => {
    it('should fetch OpenGraph metadata from URL', async () => {
      mockReq.query = { url: 'https://example.com' };

      const mockHTML = `
        <html>
          <head>
            <meta property="og:title" content="Example Site" />
            <meta property="og:description" content="An example website" />
            <meta property="og:image" content="https://example.com/image.jpg" />
          </head>
        </html>
      `;

      axios.get.mockResolvedValue({ data: mockHTML });

      await linkPreviewController.getPreview(mockReq, mockRes);

      expect(axios.get).toHaveBeenCalledWith('https://example.com');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          title: 'Example Site',
          description: 'An example website',
          image: 'https://example.com/image.jpg',
        }),
      });
    });

    it('should return 400 if URL not provided', async () => {
      mockReq.query = {};

      await linkPreviewController.getPreview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'MISSING_URL',
        }),
      });
    });

    it('should handle invalid URLs', async () => {
      mockReq.query = { url: 'not-a-valid-url' };

      await linkPreviewController.getPreview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_URL',
        }),
      });
    });

    it('should handle network errors gracefully', async () => {
      mockReq.query = { url: 'https://unreachable.com' };

      axios.get.mockRejectedValue(new Error('Network error'));

      await linkPreviewController.getPreview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'FETCH_ERROR',
        }),
      });
    });

    it('should handle missing OpenGraph tags', async () => {
      mockReq.query = { url: 'https://example.com' };

      const mockHTML = '<html><head></head><body>No OG tags</body></html>';

      axios.get.mockResolvedValue({ data: mockHTML });

      await linkPreviewController.getPreview(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          url: 'https://example.com',
        }),
      });
    });
  });

  describe('Security Tests', () => {
    it('should prevent SSRF attacks (local IPs)', async () => {
      mockReq.query = { url: 'http://localhost:3000/admin' };

      await linkPreviewController.getPreview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'FORBIDDEN_URL',
          message: expect.stringContaining('localhost'),
        }),
      });
    });

    it('should prevent fetching file:// URLs', async () => {
      mockReq.query = { url: 'file:///etc/passwd' };

      await linkPreviewController.getPreview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should sanitize HTML in responses', async () => {
      mockReq.query = { url: 'https://malicious.com' };

      const mockHTML = `
        <html>
          <head>
            <meta property="og:title" content="<script>alert('xss')</script>" />
          </head>
        </html>
      `;

      axios.get.mockResolvedValue({ data: mockHTML });

      await linkPreviewController.getPreview(mockReq, mockRes);

      const responseData = mockRes.json.mock.calls[0][0].data;
      expect(responseData.title).not.toContain('<script>');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large HTML documents', async () => {
      mockReq.query = { url: 'https://huge-page.com' };

      const largeHTML = '<html>'.repeat(100000) + '</html>';
      axios.get.mockResolvedValue({ data: largeHTML });

      await linkPreviewController.getPreview(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should timeout after 10 seconds', async () => {
      mockReq.query = { url: 'https://slow-server.com' };

      axios.get.mockImplementation(() => new Promise((resolve) => {
        setTimeout(resolve, 15000); // 15 second delay
      }));

      await linkPreviewController.getPreview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
