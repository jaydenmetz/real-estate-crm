/**
 * Unit Tests for API Service
 *
 * PHASE 7: Testing Foundation
 * Target: 80%+ coverage
 */

import ApiService from '../api.service';
import * as Sentry from '@sentry/react';

// Mock Sentry
jest.mock('@sentry/react', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn()
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiService', () => {
  let apiService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset localStorage
    localStorage.clear();

    // Create new instance
    apiService = new ApiService();

    // Default successful fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { message: 'Success' }
      })
    });
  });

  describe('Constructor', () => {
    it('should initialize with correct baseURL', () => {
      expect(apiService.baseURL).toContain('/v1');
    });

    it('should load JWT token from localStorage', () => {
      localStorage.setItem('authToken', 'test-jwt-token');

      const service = new ApiService();

      expect(service.token).toBe('test-jwt-token');
    });

    it('should load API key from localStorage', () => {
      localStorage.setItem('apiKey', 'test-api-key');

      const service = new ApiService();

      expect(service.apiKey).toBe('test-api-key');
    });
  });

  describe('GET requests', () => {
    it('should make GET request with JWT token', async () => {
      apiService.token = 'test-jwt-token';

      await apiService.get('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-jwt-token'
          })
        })
      );
    });

    it('should make GET request with API key', async () => {
      apiService.apiKey = 'test-api-key';

      await apiService.get('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-api-key'
          })
        })
      );
    });

    it('should append query parameters', async () => {
      await apiService.get('/users', { page: 1, limit: 20 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1&limit=20'),
        expect.any(Object)
      );
    });

    it('should handle empty query params', async () => {
      await apiService.get('/users', {});

      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('?'),
        expect.any(Object)
      );
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      const data = { name: 'Test User', email: 'test@example.com' };

      await apiService.post('/users', data);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle empty POST body', async () => {
      await apiService.post('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({})
        })
      );
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with body', async () => {
      const data = { name: 'Updated Name' };

      await apiService.put('/users/123', data);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data)
        })
      );
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      await apiService.delete('/users/123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/123'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should include body in DELETE if provided', async () => {
      const data = { reason: 'User requested deletion' };

      await apiService.delete('/users/123', data);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify(data)
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error on 400 Bad Request', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: { message: 'Invalid input' }
        })
      });

      await expect(apiService.get('/users')).rejects.toThrow('Invalid input');
    });

    it('should throw error on 401 Unauthorized', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: { message: 'Unauthorized' }
        })
      });

      await expect(apiService.get('/users')).rejects.toThrow();
    });

    it('should throw error on 403 Forbidden', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: { message: 'Forbidden' }
        })
      });

      await expect(apiService.get('/users')).rejects.toThrow('Forbidden');
    });

    it('should throw error on 404 Not Found', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: { message: 'Not found' }
        })
      });

      await expect(apiService.get('/users/999')).rejects.toThrow('Not found');
    });

    it('should throw error on 500 Server Error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: { message: 'Internal server error' }
        })
      });

      await expect(apiService.get('/users')).rejects.toThrow();
    });

    it('should capture errors to Sentry', async () => {
      const error = new Error('Network error');
      global.fetch.mockRejectedValue(error);

      await expect(apiService.get('/users')).rejects.toThrow();

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: expect.any(Object),
          extra: expect.any(Object)
        })
      );
    });
  });

  describe('Authentication', () => {
    it('should prefer API key over JWT token', async () => {
      apiService.token = 'jwt-token';
      apiService.apiKey = 'api-key';

      await apiService.get('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'api-key'
          })
        })
      );

      // Should NOT include Authorization header when API key is present
      const callArgs = global.fetch.mock.calls[0][1];
      expect(callArgs.headers.Authorization).toBeUndefined();
    });

    it('should use JWT token when API key not present', async () => {
      apiService.token = 'jwt-token';
      apiService.apiKey = null;

      await apiService.get('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer jwt-token'
          })
        })
      );
    });

    it('should make request without auth if neither token nor API key present', async () => {
      apiService.token = null;
      apiService.apiKey = null;

      await apiService.get('/users');

      const callArgs = global.fetch.mock.calls[0][1];
      expect(callArgs.headers.Authorization).toBeUndefined();
      expect(callArgs.headers['X-API-Key']).toBeUndefined();
    });
  });

  describe('Token Management', () => {
    it('should set token in memory only', () => {
      apiService.setToken('new-token');

      expect(apiService.token).toBe('new-token');
      // Should NOT store in localStorage (security - Phase 4)
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should set API key in localStorage', () => {
      apiService.setApiKey('new-api-key');

      expect(apiService.apiKey).toBe('new-api-key');
      expect(localStorage.getItem('apiKey')).toBe('new-api-key');
    });

    it('should clear API key from localStorage', () => {
      localStorage.setItem('apiKey', 'old-key');

      apiService.setApiKey(null);

      expect(apiService.apiKey).toBeNull();
      expect(localStorage.getItem('apiKey')).toBeNull();
    });

    it('should check if token exists', () => {
      apiService.token = null;
      expect(apiService.hasToken()).toBe(false);

      apiService.token = 'some-token';
      expect(apiService.hasToken()).toBe(true);
    });

    it('should reload token from localStorage if not in memory', async () => {
      apiService.token = null;
      localStorage.setItem('authToken', 'stored-token');

      await apiService.get('/users');

      expect(apiService.token).toBe('stored-token');
    });
  });

  describe('Sentry Integration', () => {
    it('should add breadcrumb for each API call', async () => {
      await apiService.get('/users');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'api',
        message: 'GET /users',
        level: 'info',
        data: expect.objectContaining({
          endpoint: '/users',
          method: 'GET',
          hasAuth: expect.any(Boolean)
        })
      });
    });

    it('should add breadcrumb for POST requests', async () => {
      await apiService.post('/users', { name: 'Test' });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'POST /users'
        })
      );
    });
  });

  describe('CORS and Credentials', () => {
    it('should include credentials in request', async () => {
      await apiService.get('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include'
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle response without success field', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'some data' }) // No success field
      });

      const result = await apiService.get('/users');

      expect(result).toEqual({ data: 'some data' });
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network request failed'));

      await expect(apiService.get('/users')).rejects.toThrow('Network request failed');
    });

    it('should handle malformed JSON response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await expect(apiService.get('/users')).rejects.toThrow();
    });

    it('should normalize endpoint with leading slash', async () => {
      await apiService.get('users'); // Without leading slash

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.any(Object)
      );
    });

    it('should handle empty response body', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 204, // No Content
        json: async () => null
      });

      const result = await apiService.get('/users');

      expect(result).toBeNull();
    });
  });
});
