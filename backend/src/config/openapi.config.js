const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate CRM API',
      version: '1.0.0',
      description: `
# AI-Ready REST API for Real Estate Transaction Management

This API provides comprehensive endpoints for managing real estate transactions, including:
- **Escrows**: Complete transaction lifecycle management
- **Listings**: Property inventory and marketing
- **Clients**: Contact and relationship management
- **Appointments**: Calendar and scheduling
- **Leads**: Lead qualification and conversion pipeline

## AI Integration
This API is fully compatible with:
- OpenAI Function Calling (GPT-4, GPT-3.5)
- Anthropic Claude MCP (Model Context Protocol)
- Custom AI agents and automation

## Authentication
All endpoints require authentication via:
- JWT Bearer tokens (for user sessions)
- API Keys (for external integrations and AI agents)
      `.trim(),
      contact: {
        name: 'Jayden Metz Realty Group',
        email: 'admin@jaydenmetz.com',
        url: 'https://crm.jaydenmetz.com'
      },
      license: {
        name: 'Proprietary',
        url: 'https://crm.jaydenmetz.com/terms'
      }
    },
    servers: [
      {
        url: 'https://api.jaydenmetz.com/v1',
        description: 'Production server'
      },
      {
        url: 'http://localhost:5050/v1',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login endpoint'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for external integrations and AI agents'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      code: { type: 'string', example: 'NO_AUTH_TOKEN' },
                      message: { type: 'string', example: 'No authentication token provided' }
                    }
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      code: { type: 'string', example: 'NOT_FOUND' },
                      message: { type: 'string', example: 'Resource not found' }
                    }
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      code: { type: 'string', example: 'VALIDATION_ERROR' },
                      message: { type: 'string', example: 'Invalid request data' },
                      details: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      code: { type: 'string', example: 'SERVER_ERROR' },
                      message: { type: 'string', example: 'Internal server error' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      parameters: {
        pageParam: {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number for pagination'
        },
        limitParam: {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          description: 'Number of items per page'
        },
        idParam: {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Unique identifier (UUID)'
        }
      }
    },
    security: [
      { bearerAuth: [] },
      { apiKey: [] }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'Escrows',
        description: 'Real estate transaction management'
      },
      {
        name: 'Listings',
        description: 'Property inventory and marketing'
      },
      {
        name: 'Clients',
        description: 'Contact and relationship management'
      },
      {
        name: 'Appointments',
        description: 'Calendar and scheduling'
      },
      {
        name: 'Leads',
        description: 'Lead qualification and conversion'
      },
      {
        name: 'API Keys',
        description: 'API key management for external integrations'
      },
      {
        name: 'AI',
        description: 'AI-powered natural language query interface'
      },
      {
        name: 'Health',
        description: 'System health and monitoring endpoints'
      }
    ],
    'x-ai-integration': {
      openai: {
        enabled: true,
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
        function_calling: true,
        description: 'All read endpoints support OpenAI function calling. Use API keys for authentication.'
      },
      anthropic: {
        enabled: true,
        models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-sonnet'],
        mcp_server: {
          available: true,
          location: 'backend/src/mcp-server.js',
          description: 'Standalone MCP server for Claude Desktop integration'
        }
      },
      considerations: {
        rate_limits: 'AI endpoints have stricter rate limits (10/min production, 50/min development)',
        authentication: 'Use X-API-Key header for AI agent authentication',
        best_practices: [
          'Use operationId for function naming consistency',
          'Check x-openai-isConsequential before write operations',
          'Implement retry logic for rate limit errors',
          'Cache OpenAPI spec locally to reduce fetches'
        ]
      }
    }
  },
  apis: [
    './src/routes/*.js',
    './src/schemas/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
