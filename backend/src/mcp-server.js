#!/usr/bin/env node

/**
 * Model Context Protocol (MCP) Server for Real Estate CRM
 *
 * This server exposes CRM functionality as tools that AI agents (like Claude)
 * can discover and call. It implements the MCP specification by Anthropic.
 *
 * Usage:
 *   node mcp-server.js
 *
 * Or configure in Claude Desktop config (~/.config/claude/claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "real-estate-crm": {
 *       "command": "node",
 *       "args": ["/path/to/mcp-server.js"],
 *       "env": {
 *         "DATABASE_URL": "postgresql://...",
 *         "JWT_SECRET": "..."
 *       }
 *     }
 *   }
 * }
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { pool } = require('./config/database');

// Initialize MCP server
const server = new Server(
  {
    name: 'real-estate-crm',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_escrows',
        description: 'List real estate escrow transactions with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['active', 'pending', 'closed', 'cancelled'],
              description: 'Filter by escrow status'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default 10, max 100)',
              default: 10
            }
          }
        }
      },
      {
        name: 'get_escrow',
        description: 'Get detailed information about a specific escrow transaction',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Escrow UUID'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'list_listings',
        description: 'List property listings with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['active', 'pending', 'sold', 'withdrawn', 'expired'],
              description: 'Filter by listing status'
            },
            min_price: {
              type: 'number',
              description: 'Minimum list price'
            },
            max_price: {
              type: 'number',
              description: 'Maximum list price'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default 10, max 100)',
              default: 10
            }
          }
        }
      },
      {
        name: 'list_clients',
        description: 'List client contacts with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            client_type: {
              type: 'string',
              enum: ['buyer', 'seller', 'both'],
              description: 'Filter by client type'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'closed'],
              description: 'Filter by client status'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default 10, max 100)',
              default: 10
            }
          }
        }
      },
      {
        name: 'list_appointments',
        description: 'List appointments/showings with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            appointment_type: {
              type: 'string',
              enum: ['showing', 'inspection', 'signing', 'meeting', 'call', 'other'],
              description: 'Filter by appointment type'
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
              description: 'Filter by appointment status'
            },
            start_date: {
              type: 'string',
              format: 'date',
              description: 'Filter appointments starting from this date (YYYY-MM-DD)'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default 10, max 100)',
              default: 10
            }
          }
        }
      },
      {
        name: 'list_leads',
        description: 'List prospective client leads with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'],
              description: 'Filter by lead status'
            },
            interest_level: {
              type: 'string',
              enum: ['hot', 'warm', 'cold'],
              description: 'Filter by interest level'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default 10, max 100)',
              default: 10
            }
          }
        }
      },
      {
        name: 'search_properties',
        description: 'Search properties by address, price range, or other criteria',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Search by property address (partial match)'
            },
            min_price: {
              type: 'number',
              description: 'Minimum price'
            },
            max_price: {
              type: 'number',
              description: 'Maximum price'
            },
            bedrooms: {
              type: 'number',
              description: 'Number of bedrooms'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default 10, max 100)',
              default: 10
            }
          }
        }
      },
      {
        name: 'get_dashboard_stats',
        description: 'Get real-time dashboard statistics (active escrows, listings, hot leads, etc.)',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_escrows':
        return await listEscrows(args);

      case 'get_escrow':
        return await getEscrow(args);

      case 'list_listings':
        return await listListings(args);

      case 'list_clients':
        return await listClients(args);

      case 'list_appointments':
        return await listAppointments(args);

      case 'list_leads':
        return await listLeads(args);

      case 'search_properties':
        return await searchProperties(args);

      case 'get_dashboard_stats':
        return await getDashboardStats();

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`
            }
          ],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// ============================================
// Tool Implementation Functions
// ============================================

async function listEscrows(args) {
  const { status, limit = 10 } = args;
  const queryLimit = Math.min(limit, 100);

  let query = 'SELECT * FROM escrows WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND escrow_status = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(queryLimit);

  const result = await pool.query(query, params);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          count: result.rows.length,
          escrows: result.rows
        }, null, 2)
      }
    ]
  };
}

async function getEscrow(args) {
  const { id } = args;

  const result = await pool.query(
    'SELECT * FROM escrows WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `Escrow not found: ${id}`
        }
      ],
      isError: true
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result.rows[0], null, 2)
      }
    ]
  };
}

async function listListings(args) {
  const { status, min_price, max_price, limit = 10 } = args;
  const queryLimit = Math.min(limit, 100);

  let query = 'SELECT * FROM listings WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  if (min_price) {
    params.push(min_price);
    query += ` AND list_price >= $${params.length}`;
  }

  if (max_price) {
    params.push(max_price);
    query += ` AND list_price <= $${params.length}`;
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(queryLimit);

  const result = await pool.query(query, params);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          count: result.rows.length,
          listings: result.rows
        }, null, 2)
      }
    ]
  };
}

async function listClients(args) {
  const { client_type, status, limit = 10 } = args;
  const queryLimit = Math.min(limit, 100);

  let query = 'SELECT * FROM clients WHERE 1=1';
  const params = [];

  if (client_type) {
    params.push(client_type);
    query += ` AND client_type = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(queryLimit);

  const result = await pool.query(query, params);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          count: result.rows.length,
          clients: result.rows
        }, null, 2)
      }
    ]
  };
}

async function listAppointments(args) {
  const { appointment_type, status, start_date, limit = 10 } = args;
  const queryLimit = Math.min(limit, 100);

  let query = 'SELECT * FROM appointments WHERE 1=1';
  const params = [];

  if (appointment_type) {
    params.push(appointment_type);
    query += ` AND appointment_type = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  if (start_date) {
    params.push(start_date);
    query += ` AND start_time >= $${params.length}`;
  }

  query += ` ORDER BY start_time DESC LIMIT $${params.length + 1}`;
  params.push(queryLimit);

  const result = await pool.query(query, params);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          count: result.rows.length,
          appointments: result.rows
        }, null, 2)
      }
    ]
  };
}

async function listLeads(args) {
  const { status, interest_level, limit = 10 } = args;
  const queryLimit = Math.min(limit, 100);

  let query = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  if (interest_level) {
    params.push(interest_level);
    query += ` AND interest_level = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(queryLimit);

  const result = await pool.query(query, params);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          count: result.rows.length,
          leads: result.rows
        }, null, 2)
      }
    ]
  };
}

async function searchProperties(args) {
  const { address, min_price, max_price, bedrooms, limit = 10 } = args;
  const queryLimit = Math.min(limit, 100);

  let query = 'SELECT * FROM listings WHERE 1=1';
  const params = [];

  if (address) {
    params.push(`%${address}%`);
    query += ` AND address ILIKE $${params.length}`;
  }

  if (min_price) {
    params.push(min_price);
    query += ` AND list_price >= $${params.length}`;
  }

  if (max_price) {
    params.push(max_price);
    query += ` AND list_price <= $${params.length}`;
  }

  if (bedrooms) {
    params.push(bedrooms);
    query += ` AND bedrooms >= $${params.length}`;
  }

  query += ` ORDER BY list_price DESC LIMIT $${params.length + 1}`;
  params.push(queryLimit);

  const result = await pool.query(query, params);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          count: result.rows.length,
          properties: result.rows
        }, null, 2)
      }
    ]
  };
}

async function getDashboardStats() {
  const [escrows, listings, clients, leads, appointments] = await Promise.all([
    pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE escrow_status = 'active') as active FROM escrows"),
    pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM listings"),
    pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM clients"),
    pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE interest_level = 'hot') as hot FROM leads"),
    pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'scheduled' AND start_time > NOW()) as upcoming FROM appointments")
  ]);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          escrows: {
            total: parseInt(escrows.rows[0].total),
            active: parseInt(escrows.rows[0].active)
          },
          listings: {
            total: parseInt(listings.rows[0].total),
            active: parseInt(listings.rows[0].active)
          },
          clients: {
            total: parseInt(clients.rows[0].total),
            active: parseInt(clients.rows[0].active)
          },
          leads: {
            total: parseInt(leads.rows[0].total),
            hot: parseInt(leads.rows[0].hot)
          },
          appointments: {
            total: parseInt(appointments.rows[0].total),
            upcoming: parseInt(appointments.rows[0].upcoming)
          }
        }, null, 2)
      }
    ]
  };
}

// ============================================
// Start Server
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Real Estate CRM MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
