# Model Context Protocol (MCP) Server Setup

## Overview

The Real Estate CRM MCP server exposes CRM functionality as tools that AI agents like Claude can discover and call. This enables natural language interaction with your CRM data directly through Claude Desktop or other MCP-compatible clients.

## Features

### Available Tools

1. **list_escrows** - List real estate transactions with filtering
2. **get_escrow** - Get detailed transaction information
3. **list_listings** - Browse property listings
4. **list_clients** - View client contacts
5. **list_appointments** - Check calendar/showings
6. **list_leads** - Review prospective clients
7. **search_properties** - Find properties by criteria
8. **get_dashboard_stats** - Get real-time statistics

## Installation

### Prerequisites

- Node.js 16+ installed
- PostgreSQL database running
- Environment variables configured

### 1. Install Dependencies

```bash
cd backend
npm install
```

The MCP SDK is already included in `package.json`:
- `@modelcontextprotocol/sdk` - Official Anthropic MCP SDK

### 2. Configure Claude Desktop

Edit your Claude Desktop configuration file:

**macOS/Linux:**
```bash
~/.config/claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

Add this configuration:

```json
{
  "mcpServers": {
    "real-estate-crm": {
      "command": "node",
      "args": ["/absolute/path/to/real-estate-crm/backend/src/mcp-server.js"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:password@host:port/database",
        "JWT_SECRET": "your-jwt-secret-here"
      }
    }
  }
}
```

**Important:**
- Replace `/absolute/path/to/` with the full path to your project
- Use the same `DATABASE_URL` and `JWT_SECRET` from your `.env` file
- For production, use Railway database credentials

### 3. Restart Claude Desktop

After saving the configuration:
1. Completely quit Claude Desktop
2. Relaunch the application
3. Look for the 🔌 plug icon in the bottom right corner
4. The "real-estate-crm" server should appear in the list

## Usage Examples

Once configured, you can ask Claude questions like:

### Escrow Management
```
"Show me all active escrows"
"Get details for escrow ID abc123..."
"How many escrows do I have closing this month?"
```

### Listing Management
```
"List all active property listings"
"Find listings between $500k and $1M"
"Show me properties with 4+ bedrooms"
```

### Client Management
```
"Show me all active buyer clients"
"List clients with budget over $750k"
"Find clients marked as 'both' buyer and seller"
```

### Appointments
```
"What appointments do I have coming up?"
"Show all scheduled showings"
"List appointments for today"
```

### Leads
```
"Show me hot leads"
"Find leads that haven't been contacted"
"List new leads from this week"
```

### Dashboard
```
"Give me a dashboard overview"
"How many active deals do I have?"
"Show me my pipeline stats"
```

## Development

### Testing the MCP Server

You can test the MCP server directly:

```bash
cd backend
node src/mcp-server.js
```

This starts the server in stdio mode. It will wait for MCP protocol messages on stdin.

### Debugging

Enable debug logging by checking Claude Desktop's logs:

**macOS:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Linux:**
```bash
tail -f ~/.config/Claude/logs/mcp*.log
```

**Windows:**
```
%APPDATA%\Claude\logs\mcp*.log
```

### Common Issues

#### Server doesn't appear in Claude Desktop
- Verify the absolute path in `claude_desktop_config.json`
- Check that `node` is in your PATH
- Ensure environment variables are set correctly
- Restart Claude Desktop completely

#### Database connection errors
- Verify `DATABASE_URL` is correct
- Test database connectivity: `psql $DATABASE_URL`
- Check firewall rules for Railway/production database

#### Permission denied errors
- Make sure `mcp-server.js` is executable: `chmod +x src/mcp-server.js`
- Verify Node.js has permission to run

## Architecture

### How It Works

1. **Tool Discovery**: Claude calls `list_tools` to see available functions
2. **Tool Invocation**: Claude calls specific tools with parameters
3. **Data Retrieval**: MCP server queries PostgreSQL directly
4. **Response**: Results returned as JSON text to Claude
5. **AI Interpretation**: Claude presents results in natural language

### Security

- MCP server runs locally on your machine
- Direct database access (no API authentication needed for local use)
- For production: Consider adding user authentication layer
- Results are returned to Claude Desktop only

### Performance

- Direct database queries (no REST API overhead)
- Parameterized queries for security
- Result limits to prevent overwhelming responses
- Efficient JSON serialization

## Production Deployment

### Option 1: Claude Desktop (Local)
Best for personal use - runs on your machine with direct database access.

### Option 2: MCP Server as Service
For team access:
1. Deploy MCP server to server with database access
2. Expose via WebSocket transport (not stdio)
3. Configure authentication/authorization
4. Update Claude Desktop configs with WebSocket URL

### Option 3: Hybrid Approach
- Use REST API (`/v1/ai/query`) for web/mobile access
- Use MCP server for Claude Desktop power users
- Both access same data layer

## Roadmap

Future enhancements:
- [ ] Add write operations (create escrow, update client, etc.)
- [ ] Implement user-scoped data filtering
- [ ] Add natural language query translation
- [ ] Support for document retrieval
- [ ] Calendar integration for scheduling
- [ ] Email draft generation
- [ ] Market analysis tools

## Support

For issues or questions:
1. Check Claude Desktop logs
2. Verify database connectivity
3. Test MCP server standalone
4. Review [MCP Documentation](https://modelcontextprotocol.io)

## Related Documentation

- [PHASE1_CODE_REVIEW.md](./PHASE1_CODE_REVIEW.md) - OpenAPI implementation
- [CLAUDE.md](../CLAUDE.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
