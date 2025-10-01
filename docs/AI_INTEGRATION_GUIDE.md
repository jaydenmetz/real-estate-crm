# AI Integration Guide

## Overview

The Real Estate CRM backend is now **10/10 AI-ready** with three integration methods:

1. **OpenAPI Function Calling** - For GPT-4, GPT-3.5, and compatible models
2. **Natural Language Query API** - English-to-SQL conversion via `/v1/ai/query`
3. **MCP Server** - Native Claude Desktop integration via Model Context Protocol

## Integration Methods

### 1. OpenAI Function Calling

#### Setup

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Fetch API spec
const spec = await fetch('https://api.jaydenmetz.com/v1/openapi.json').then(r => r.json());

// Convert OpenAPI to function definitions
const functions = convertOpenAPIToFunctions(spec);
```

#### Example: List Active Escrows

```javascript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: 'Show me all active escrows' }
  ],
  tools: functions,
  tool_choice: 'auto'
});

// GPT will call: listEscrows({ status: 'active' })

const functionCall = response.choices[0].message.tool_calls[0];
const args = JSON.parse(functionCall.function.arguments);

// Execute API call
const result = await fetch('https://api.jaydenmetz.com/v1/escrows?status=active', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
```

#### Available Operations

**Escrows:**
- `listEscrows` - GET /escrows
- `getEscrowById` - GET /escrows/{id}
- `createEscrow` - POST /escrows (consequential)
- `updateEscrow` - PUT /escrows/{id} (consequential)
- `deleteEscrow` - DELETE /escrows/{id} (consequential)

**Listings:**
- `listListings` - GET /listings
- `getListingById` - GET /listings/{id}
- `createListing` - POST /listings (consequential)
- `updateListing` - PUT /listings/{id} (consequential)
- `deleteListing` - DELETE /listings/{id} (consequential)

**Clients:**
- `listClients` - GET /clients
- `getClientById` - GET /clients/{id}
- `createClient` - POST /clients (consequential)
- `updateClient` - PUT /clients/{id} (consequential)
- `deleteClient` - DELETE /clients/{id} (consequential)

**Appointments:**
- `listAppointments` - GET /appointments
- `getAppointmentById` - GET /appointments/{id}
- `createAppointment` - POST /appointments (consequential)
- `updateAppointment` - PUT /appointments/{id} (consequential)
- `deleteAppointment` - DELETE /appointments/{id} (consequential)

**Leads:**
- `listLeads` - GET /leads
- `getLeadById` - GET /leads/{id}
- `createLead` - POST /leads (consequential)
- `updateLead` - PUT /leads/{id} (consequential)
- `deleteLead` - DELETE /leads/{id} (consequential)
- `convertLeadToClient` - POST /leads/{id}/convert (consequential)

### 2. Natural Language Query API

#### Endpoint

```
POST /v1/ai/query
```

#### Authentication

```bash
curl -X POST https://api.jaydenmetz.com/v1/ai/query \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me all active escrows closing this month"
  }'
```

#### Response Format

```json
{
  "success": true,
  "query": "Show me all active escrows closing this month",
  "sql": "SELECT * FROM escrows WHERE user_id = $1 AND escrow_status = 'active' AND closing_date >= DATE_TRUNC('month', CURRENT_DATE) AND closing_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' LIMIT 100",
  "rowCount": 5,
  "data": [
    {
      "id": "abc-123",
      "property_address": "123 Main St",
      "purchase_price": 500000,
      "closing_date": "2025-10-15"
    }
  ],
  "timestamp": "2025-10-01T20:30:00Z"
}
```

#### Example Queries

```javascript
const queries = [
  "Show me all active escrows",
  "Find clients with budget over $500k",
  "List upcoming appointments this week",
  "Show properties listed in the last 30 days",
  "Find hot leads that haven't been contacted",
  "Show escrows closing this month",
  "List all buyer clients in active status",
  "Find appointments scheduled for today",
  "Show listings over $1 million",
  "Find converted leads from this quarter"
];

for (const query of queries) {
  const response = await fetch('https://api.jaydenmetz.com/v1/ai/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const result = await response.json();
  console.log(result.data);
}
```

#### Get Query Suggestions

```bash
curl https://api.jaydenmetz.com/v1/ai/suggestions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

```json
{
  "success": true,
  "data": [
    "Show me all active escrows",
    "List clients with budget over $500k",
    "Find upcoming appointments this week",
    ...
  ]
}
```

#### Security Features

- **SQL Injection Protection**: Blocks INSERT, UPDATE, DELETE, DROP, etc.
- **User Isolation**: Automatic `user_id` filtering
- **Rate Limiting**: 10 requests/minute (production), 50/min (development)
- **Read-Only**: Only SELECT queries allowed
- **Parameterized Queries**: Safe $1, $2 parameter substitution

### 3. MCP Server (Claude Desktop)

#### Installation

See [MCP_SERVER_SETUP.md](./MCP_SERVER_SETUP.md) for complete instructions.

#### Quick Start

1. Edit `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "real-estate-crm": {
      "command": "node",
      "args": ["/absolute/path/to/backend/src/mcp-server.js"],
      "env": {
        "DATABASE_URL": "postgresql://...",
        "JWT_SECRET": "..."
      }
    }
  }
}
```

2. Restart Claude Desktop
3. Look for 🔌 icon - server should appear
4. Ask Claude: "Show me all active escrows"

#### Available Tools

- `list_escrows` - Browse transactions
- `get_escrow` - View transaction details
- `list_listings` - Browse properties
- `list_clients` - View contacts
- `list_appointments` - Check calendar
- `list_leads` - Review prospects
- `search_properties` - Find properties by criteria
- `get_dashboard_stats` - Real-time statistics

## API Key Authentication

### Creating an API Key

```bash
curl -X POST https://api.jaydenmetz.com/v1/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GPT-4 Integration",
    "expiresInDays": 365
  }'
```

```json
{
  "success": true,
  "data": {
    "id": "key-uuid-here",
    "key": "64-character-hex-string-here",
    "name": "GPT-4 Integration",
    "expires_at": "2026-10-01T00:00:00Z"
  },
  "message": "API key created successfully. Save this key securely - it will not be shown again."
}
```

### Using the API Key

```bash
curl https://api.jaydenmetz.com/v1/escrows \
  -H "X-API-Key: your-64-character-key-here"
```

### Managing Keys

```bash
# List keys
curl https://api.jaydenmetz.com/v1/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Revoke key
curl -X PUT https://api.jaydenmetz.com/v1/api-keys/{id}/revoke \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Delete key
curl -X DELETE https://api.jaydenmetz.com/v1/api-keys/{id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Rate Limits

### Standard API Endpoints
- **Production**: 500 requests/minute
- **Development**: 2000 requests/minute

### AI Query Endpoints
- **Production**: 10 requests/minute
- **Development**: 50 requests/minute

### Exemptions
- Health checks (`/health`)
- Authentication endpoints (`/auth/*`)
- WebSocket connections (`/ws/*`)
- OpenAPI spec (`/v1/openapi.json`)

## Cost Estimates

### Natural Language Query API

**Using GPT-4o-mini:**
- Input: ~1500 tokens (schema context)
- Output: ~100 tokens (SQL query)
- Cost: ~$0.00002 per query
- **1000 queries ≈ $0.02**

**Using GPT-4o:**
- Same token usage
- Cost: ~$0.0002 per query
- **1000 queries ≈ $0.20**

### OpenAI Function Calling

**Cost varies by:**
- Number of functions in context
- Conversation length
- Model used (GPT-4o vs GPT-3.5)

**Typical usage:**
- Single function call: ~2000 tokens
- GPT-4o-mini: $0.00003/query
- GPT-4o: $0.0003/query

### MCP Server
- **Cost**: Free (runs locally)
- **No API calls** to OpenAI/Anthropic for tool discovery
- Claude Desktop handles AI inference

## Best Practices

### 1. Cache OpenAPI Spec
```javascript
// Fetch once, cache for 1 hour
const specCache = {
  data: null,
  timestamp: 0,
  ttl: 3600000 // 1 hour
};

async function getSpec() {
  if (Date.now() - specCache.timestamp < specCache.ttl && specCache.data) {
    return specCache.data;
  }

  specCache.data = await fetch('https://api.jaydenmetz.com/v1/openapi.json').then(r => r.json());
  specCache.timestamp = Date.now();
  return specCache.data;
}
```

### 2. Implement Retry Logic
```javascript
async function callAPIWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        // Rate limited - exponential backoff
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }

      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 3. Use Appropriate Models

**For Simple Queries:**
- GPT-3.5-turbo or GPT-4o-mini
- Faster, cheaper, sufficient for CRUD operations

**For Complex Analysis:**
- GPT-4o or Claude-3.5-Sonnet
- Better reasoning for market analysis, recommendations

### 4. Monitor Usage
```javascript
// Track API key usage
const usage = await fetch('https://api.jaydenmetz.com/v1/api-keys', {
  headers: { 'Authorization': `Bearer ${jwt}` }
});

// Check last_used_at timestamps
usage.data.forEach(key => {
  console.log(`${key.name}: Last used ${key.last_used_at}`);
});
```

## Example Implementations

### ChatGPT Plugin (OpenAPI)

```javascript
// In your GPT configuration
{
  "schema_version": "v1",
  "name_for_human": "Real Estate CRM",
  "name_for_model": "real_estate_crm",
  "description_for_human": "Manage real estate transactions, listings, and clients",
  "description_for_model": "Access real estate CRM data including escrows, listings, clients, appointments, and leads",
  "auth": {
    "type": "service_http",
    "authorization_type": "bearer",
    "verification_tokens": {
      "openai": "your-api-key-here"
    }
  },
  "api": {
    "type": "openapi",
    "url": "https://api.jaydenmetz.com/v1/openapi.json"
  },
  "logo_url": "https://crm.jaydenmetz.com/logo.png",
  "contact_email": "admin@jaydenmetz.com",
  "legal_info_url": "https://crm.jaydenmetz.com/terms"
}
```

### Custom AI Agent

```python
import openai
import requests

openai.api_key = "your-openai-key"

# Load API spec
spec = requests.get("https://api.jaydenmetz.com/v1/openapi.json").json()

# Your CRM API key
CRM_API_KEY = "your-crm-api-key"

# Chat with AI about CRM data
messages = [
    {"role": "system", "content": "You are a real estate assistant with access to CRM data"},
    {"role": "user", "content": "What escrows are closing this week?"}
]

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=[...],  # Converted from OpenAPI spec
    tool_choice="auto"
)

# Execute tool calls
for tool_call in response.choices[0].message.tool_calls:
    function_name = tool_call.function.name
    args = json.loads(tool_call.function.arguments)

    # Map function to endpoint
    endpoint = function_to_endpoint(function_name, args)

    # Call API
    result = requests.get(
        f"https://api.jaydenmetz.com{endpoint}",
        headers={"X-API-Key": CRM_API_KEY}
    ).json()

    messages.append({
        "role": "function",
        "name": function_name,
        "content": json.dumps(result)
    })

# Get AI response with data
final_response = openai.chat.completions.create(
    model="gpt-4o",
    messages=messages
)

print(final_response.choices[0].message.content)
```

## Troubleshooting

### OpenAPI Spec Not Loading
- Check CORS settings
- Verify `/v1/openapi.json` is accessible
- Confirm spec is valid OpenAPI 3.0

### Function Calling Failures
- Verify `operationId` matches expected function name
- Check parameter types match schema
- Ensure authentication header is included

### Natural Language Query Errors
- Check rate limit (10/min production)
- Verify OpenAI API key is configured
- Review query complexity (keep simple)

### MCP Server Not Appearing
- Restart Claude Desktop completely
- Check absolute path in config
- Verify DATABASE_URL and JWT_SECRET are set
- Review logs: `~/Library/Logs/Claude/mcp*.log`

## Support

For questions or issues:
1. Check [CLAUDE.md](../CLAUDE.md) for project overview
2. Review [MCP_SERVER_SETUP.md](./MCP_SERVER_SETUP.md) for MCP details
3. Test with `/v1/api-docs` Swagger UI
4. Contact: admin@jaydenmetz.com
