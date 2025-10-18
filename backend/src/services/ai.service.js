const OpenAI = require('openai');
const { pool } = require('../config/database');

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Database schema for context
const SCHEMA_CONTEXT = `
You are a PostgreSQL query generator for a Real Estate CRM system.

Available tables and their schemas:

1. escrows (real estate transactions)
   - id (uuid), user_id (uuid)
   - property_address (text)
   - purchase_price (numeric), escrow_status (text)
   - buyers (jsonb array), sellers (jsonb array)
   - escrow_number (text), title_company (text)
   - opening_date (date), closing_date (date)
   - earnest_money_amount (numeric), contingencies (jsonb)
   - version (integer - for optimistic locking)
   - created_at, updated_at

2. listings (property listings)
   - id (uuid), user_id (uuid)
   - address (text), list_price (numeric)
   - property_type (text), status (text)
   - bedrooms (integer), bathrooms (numeric)
   - square_feet (integer), lot_size (numeric)
   - year_built (integer), mls_number (text)
   - listing_date (date), expiration_date (date)
   - version (integer)
   - created_at, updated_at

3. clients (buyer/seller contacts)
   - id (uuid), user_id (uuid)
   - first_name (text), last_name (text)
   - email (text), phone (text)
   - client_type (text: buyer, seller, both)
   - status (text: active, inactive, closed)
   - budget_min (numeric), budget_max (numeric)
   - preferred_locations (jsonb array)
   - notes (text), version (integer)
   - created_at, updated_at

4. leads (prospective clients)
   - id (uuid), user_id (uuid)
   - name (text), email (text), phone (text)
   - source (text), lead_type (text: buyer, seller, both)
   - status (text: new, contacted, qualified, unqualified, converted, lost)
   - interest_level (text: hot, warm, cold)
   - notes (text), version (integer)
   - created_at, updated_at

5. appointments (showings, meetings, calls)
   - id (uuid), user_id (uuid)
   - title (text), description (text)
   - start_time (timestamp), end_time (timestamp)
   - appointment_type (text: showing, inspection, signing, meeting, call, other)
   - status (text: scheduled, completed, cancelled, no_show)
   - location (text), attendees (jsonb array)
   - version (integer)
   - created_at, updated_at

IMPORTANT RULES:
1. ALWAYS include "WHERE user_id = $1" to isolate user data
2. Use PostgreSQL syntax (not MySQL)
3. ONLY generate SELECT queries (no INSERT, UPDATE, DELETE, DROP, etc.)
4. Use safe parameterized queries with $1, $2, etc.
5. Always use LIMIT to prevent huge result sets (max 100)
6. Use proper date/time functions: NOW(), CURRENT_DATE, INTERVAL
7. For JSONB columns, use -> and ->> operators
8. Return ONLY valid SQL - no explanations or markdown

Examples:
Q: "Show me active escrows closing this month"
A: SELECT * FROM escrows WHERE user_id = $1 AND escrow_status = 'active' AND closing_date >= DATE_TRUNC('month', CURRENT_DATE) AND closing_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' LIMIT 100

Q: "Find buyers with budget over $500k"
A: SELECT * FROM clients WHERE user_id = $1 AND client_type IN ('buyer', 'both') AND budget_max >= 500000 LIMIT 100

Q: "List upcoming appointments this week"
A: SELECT * FROM appointments WHERE user_id = $1 AND start_time >= DATE_TRUNC('week', CURRENT_DATE) AND start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week' ORDER BY start_time LIMIT 100
`;

/**
 * Convert natural language query to SQL
 */
async function naturalLanguageToSQL(userQuery, userId) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SCHEMA_CONTEXT,
        },
        {
          role: 'user',
          content: `Generate a PostgreSQL query for: ${userQuery}`,
        },
      ],
      temperature: 0.1, // Low temperature for consistent SQL generation
      max_tokens: 500,
    });

    const sqlQuery = response.choices[0].message.content.trim();

    // Security validation
    validateSQL(sqlQuery);

    return sqlQuery;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate SQL query');
  }
}

/**
 * Validate SQL query for security
 */
function validateSQL(sql) {
  const lowerSQL = sql.toLowerCase();

  // Block dangerous operations
  const dangerousKeywords = [
    'insert', 'update', 'delete', 'drop', 'create', 'alter',
    'truncate', 'grant', 'revoke', 'execute', 'exec',
    'xp_', 'sp_', 'pg_sleep', 'dblink',
  ];

  for (const keyword of dangerousKeywords) {
    if (lowerSQL.includes(keyword)) {
      throw new Error(`Forbidden SQL operation detected: ${keyword}`);
    }
  }

  // Require user_id filter for data isolation
  if (!sql.includes('user_id = $1')) {
    throw new Error('Query must include user_id filter for data security');
  }

  // Must be SELECT only
  if (!lowerSQL.trim().startsWith('select')) {
    throw new Error('Only SELECT queries are allowed');
  }

  return true;
}

/**
 * Execute natural language query
 */
async function executeNaturalLanguageQuery(userQuery, userId) {
  try {
    // Convert natural language to SQL
    const sqlQuery = await naturalLanguageToSQL(userQuery, userId);

    // console.log('Generated SQL:', sqlQuery);

    // Execute query with user_id as first parameter
    const result = await pool.query(sqlQuery, [userId]);

    return {
      success: true,
      query: userQuery,
      sql: sqlQuery,
      rowCount: result.rows.length,
      data: result.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Natural language query error:', error);

    return {
      success: false,
      query: userQuery,
      error: {
        code: 'QUERY_EXECUTION_FAILED',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get suggested queries for users
 */
function getSuggestedQueries() {
  return [
    'Show me all active escrows',
    'List clients with budget over $500k',
    'Find upcoming appointments this week',
    'Show properties listed in the last 30 days',
    "Find hot leads that haven't been contacted",
    'Show escrows closing this month',
    'List all buyer clients in active status',
    'Find appointments scheduled for today',
    'Show listings over $1 million',
    'Find converted leads from this quarter',
  ];
}

module.exports = {
  executeNaturalLanguageQuery,
  getSuggestedQueries,
  validateSQL,
};
