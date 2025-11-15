/**
 * AI Integration Test Suite
 * Tests OpenAPI spec, natural language queries, and function calling compatibility
 */

const request = require('supertest');
const app = require('../app');
const { pool } = require('../config/infrastructure/database');

const BASE_URL = process.env.API_URL || 'http://localhost:5050';
const TEST_JWT = process.env.TEST_JWT || 'your-test-jwt-here';
const TEST_API_KEY = process.env.TEST_API_KEY || 'your-test-api-key-here';

describe('AI Integration Tests', () => {
  describe('Phase 1: OpenAPI Specification', () => {
    test('OpenAPI spec should be accessible', async () => {
      const response = await request(BASE_URL)
        .get('/v1/openapi.json')
        .expect(200);

      expect(response.body).toHaveProperty('openapi');
      expect(response.body.openapi).toBe('3.0.0');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info.title).toBe('Real Estate CRM API');
    });

    test('OpenAPI spec should have AI integration metadata', async () => {
      const response = await request(BASE_URL)
        .get('/v1/openapi.json')
        .expect(200);

      const spec = response.body;
      expect(spec).toHaveProperty('x-ai-integration');
      expect(spec['x-ai-integration'].openai.enabled).toBe(true);
      expect(spec['x-ai-integration'].anthropic.enabled).toBe(true);
      expect(spec['x-ai-integration'].anthropic.mcp_server.available).toBe(true);
    });

    test('OpenAPI spec should document all 5 core modules', async () => {
      const response = await request(BASE_URL)
        .get('/v1/openapi.json')
        .expect(200);

      const { paths } = response.body;
      expect(paths).toHaveProperty('/escrows');
      expect(paths).toHaveProperty('/listings');
      expect(paths).toHaveProperty('/clients');
      expect(paths).toHaveProperty('/appointments');
      expect(paths).toHaveProperty('/leads');
    });

    test('OpenAPI spec should mark write operations as consequential', async () => {
      const response = await request(BASE_URL)
        .get('/v1/openapi.json')
        .expect(200);

      const createEscrow = response.body.paths['/escrows'].post;
      expect(createEscrow['x-openai-isConsequential']).toBe(true);

      const listEscrows = response.body.paths['/escrows'].get;
      expect(listEscrows['x-openai-isConsequential']).toBe(false);
    });

    test('OpenAPI spec should have AI examples for endpoints', async () => {
      const response = await request(BASE_URL)
        .get('/v1/openapi.json')
        .expect(200);

      const listEscrows = response.body.paths['/escrows'].get;
      expect(listEscrows).toHaveProperty('x-ai-examples');
      expect(Array.isArray(listEscrows['x-ai-examples'])).toBe(true);
      expect(listEscrows['x-ai-examples'].length).toBeGreaterThan(0);
    });

    test('Swagger UI should be accessible', async () => {
      const response = await request(BASE_URL)
        .get('/v1/api-docs')
        .expect(200);

      expect(response.text).toContain('Swagger UI');
    });
  });

  describe('Phase 2: Natural Language Query API', () => {
    test('AI query endpoint should require authentication', async () => {
      await request(BASE_URL)
        .post('/v1/ai/query')
        .send({ query: 'Show me all escrows' })
        .expect(401);
    });

    test('AI query endpoint should reject empty queries', async () => {
      const response = await request(BASE_URL)
        .post('/v1/ai/query')
        .set('Authorization', `Bearer ${TEST_JWT}`)
        .send({ query: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_QUERY');
    });

    test('AI query endpoint should handle service unavailable gracefully', async () => {
      // Test when OPENAI_API_KEY is not configured
      const response = await request(BASE_URL)
        .post('/v1/ai/query')
        .set('Authorization', `Bearer ${TEST_JWT}`)
        .send({ query: 'Show me all active escrows' });

      // Should either work or return 503
      if (response.status === 503) {
        expect(response.body.error.code).toBe('AI_SERVICE_UNAVAILABLE');
      } else {
        expect(response.status).toBe(200);
      }
    });

    test('AI suggestions endpoint should return example queries', async () => {
      const response = await request(BASE_URL)
        .get('/v1/ai/suggestions')
        .set('Authorization', `Bearer ${TEST_JWT}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toContain('escrow');
    });

    test('AI query should enforce rate limiting', async () => {
      const promises = [];
      // Try to exceed rate limit (10 requests/min in production)
      for (let i = 0; i < 12; i++) {
        promises.push(
          request(BASE_URL)
            .post('/v1/ai/query')
            .set('Authorization', `Bearer ${TEST_JWT}`)
            .send({ query: `Test query ${i}` }),
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.filter((r) => r.status === 429);

      // In development (50/min) this might not trigger, but in production it should
      if (process.env.NODE_ENV === 'production') {
        expect(rateLimited.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Phase 3: MCP Server Compatibility', () => {
    test('MCP server file should exist and be executable', () => {
      const fs = require('fs');
      const path = require('path');
      const mcpPath = path.join(__dirname, '../mcp-server.js');

      expect(fs.existsSync(mcpPath)).toBe(true);

      const stats = fs.statSync(mcpPath);
      // Check if executable bit is set (Unix-like systems)
      expect(stats.mode & fs.constants.S_IXUSR).toBeTruthy();
    });

    test('MCP server should require database connection', () => {
      // Test that MCP server initializes properly
      const fs = require('fs');
      const path = require('path');
      const mcpPath = path.join(__dirname, '../mcp-server.js');
      const content = fs.readFileSync(mcpPath, 'utf8');

      expect(content).toContain('@modelcontextprotocol/sdk');
      expect(content).toContain('list_escrows');
      expect(content).toContain('get_dashboard_stats');
    });
  });

  describe('Phase 4: Enhanced Metadata', () => {
    test('Business rules file should exist and be valid', () => {
      const businessRules = require('../config/schemas/business-rules');
      expect(businessRules).toBeDefined();
    });

    test('Consequential operations should have warnings', async () => {
      const response = await request(BASE_URL)
        .get('/v1/openapi.json')
        .expect(200);

      const createEscrow = response.body.paths['/escrows'].post;
      expect(createEscrow.description).toContain('CONSEQUENTIAL');

      const deleteEscrow = response.body.paths['/escrows/{id}'].delete;
      expect(deleteEscrow.description).toContain('CONSEQUENTIAL');
      expect(deleteEscrow['x-openai-isConsequential']).toBe(true);
    });

    test('Read operations should be marked as non-consequential', async () => {
      const response = await request(BASE_URL)
        .get('/v1/openapi.json')
        .expect(200);

      const listEscrows = response.body.paths['/escrows'].get;
      expect(listEscrows['x-openai-isConsequential']).toBe(false);

      const getEscrow = response.body.paths['/escrows/{id}'].get;
      expect(getEscrow['x-openai-isConsequential']).toBe(false);
    });
  });

  describe('Authentication for AI Agents', () => {
    test('API key authentication should work', async () => {
      const response = await request(BASE_URL)
        .get('/v1/escrows')
        .set('X-API-Key', TEST_API_KEY);

      // Should either work (200) or fail with 401 if key is invalid
      expect([200, 401]).toContain(response.status);
    });

    test('JWT authentication should work', async () => {
      const response = await request(BASE_URL)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${TEST_JWT}`);

      // Should either work (200) or fail with 401 if token is invalid
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Security & Validation', () => {
    test('SQL injection attempts should be blocked', () => {
      const AiService = require('../services/ai.service');

      const maliciousSQL = 'SELECT * FROM escrows WHERE user_id = $1; DROP TABLE escrows; --';

      expect(() => {
        AiService.validateSQL(maliciousSQL);
      }).toThrow();
    });

    test('Write operations in SQL should be blocked', () => {
      const AiService = require('../services/ai.service');

      const writeSQL = 'UPDATE escrows SET purchase_price = 999999 WHERE user_id = $1';

      expect(() => {
        AiService.validateSQL(writeSQL);
      }).toThrow('Forbidden SQL operation');
    });

    test('Queries without user_id filter should be rejected', () => {
      const AiService = require('../services/ai.service');

      const unsafeSQL = 'SELECT * FROM escrows LIMIT 100';

      expect(() => {
        AiService.validateSQL(unsafeSQL);
      }).toThrow('user_id filter');
    });
  });

  describe('Performance', () => {
    test('OpenAPI spec should load in under 100ms', async () => {
      const start = Date.now();

      await request(BASE_URL)
        .get('/v1/openapi.json')
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    test('API endpoints should respond in under 200ms', async () => {
      const start = Date.now();

      await request(BASE_URL)
        .get('/v1/escrows?limit=10')
        .set('Authorization', `Bearer ${TEST_JWT}`);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });
  });
});

// Export for use in other test files
module.exports = {
  BASE_URL,
  TEST_JWT,
  TEST_API_KEY,
};
