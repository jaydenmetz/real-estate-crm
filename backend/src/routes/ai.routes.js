const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth.middleware');
const AiService = require('../services/ai.service');

// Stricter rate limiting for AI endpoints (costs money)
const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // 10 requests per minute in prod
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'Too many AI queries. Please wait before trying again.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @openapi
 * /ai/query:
 *   post:
 *     operationId: executeNaturalLanguageQuery
 *     summary: Execute natural language query
 *     description: |
 *       Converts natural language questions into SQL queries and executes them.
 *       Uses OpenAI GPT-4o-mini to understand intent and generate safe, parameterized queries.
 *
 *       **Security Features:**
 *       - Only SELECT queries allowed
 *       - Automatic user_id filtering for data isolation
 *       - SQL injection protection
 *       - Rate limited to 10 requests/minute in production
 *
 *       **Example Queries:**
 *       - "Show me all active escrows"
 *       - "Find clients with budget over $500k"
 *       - "List upcoming appointments this week"
 *       - "Show properties listed in the last 30 days"
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query:
 *                 type: string
 *                 description: Natural language question
 *                 example: "Show me all active escrows closing this month"
 *     responses:
 *       200:
 *         description: Query executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 query:
 *                   type: string
 *                   description: Original natural language query
 *                 sql:
 *                   type: string
 *                   description: Generated SQL query
 *                 rowCount:
 *                   type: integer
 *                   description: Number of results returned
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid query or security violation
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 *       503:
 *         description: OpenAI API unavailable
 */
router.post('/query', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Query must be a non-empty string'
        }
      });
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_SERVICE_UNAVAILABLE',
          message: 'AI service is not configured. Please contact administrator.'
        }
      });
    }

    // Execute query
    const result = await AiService.executeNaturalLanguageQuery(query, req.user.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('AI query endpoint error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_QUERY_ERROR',
        message: 'Failed to process AI query'
      }
    });
  }
});

/**
 * @openapi
 * /ai/suggestions:
 *   get:
 *     operationId: getQuerySuggestions
 *     summary: Get suggested queries
 *     description: Returns a list of example natural language queries users can try
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "Show me all active escrows"
 *                     - "Find clients with budget over $500k"
 *                     - "List upcoming appointments this week"
 */
router.get('/suggestions', authenticate, (req, res) => {
  try {
    const suggestions = AiService.getSuggestedQueries();

    res.json({
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUGGESTIONS_ERROR',
        message: 'Failed to get query suggestions'
      }
    });
  }
});

module.exports = router;
