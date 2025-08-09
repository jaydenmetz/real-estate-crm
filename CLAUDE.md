# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT DEVELOPER PREFERENCES

### Auto-commit and Push
- **ALWAYS commit and push to GitHub after making changes**
- Use descriptive commit messages
- Include "Co-Authored-By: Claude <noreply@anthropic.com>" in commits
- Never wait for user confirmation to commit and push

### Code Style
- NO prefixes on API keys (clean 64-character hex strings)
- Keep responses concise and direct
- Avoid unnecessary comments in code unless specifically requested

## Project Overview

### Production URLs
- **Frontend**: https://crm.jaydenmetz.com
- **API**: https://api.jaydenmetz.com/v1
- **Database**: Railway PostgreSQL (ballast.proxy.rlwy.net:20017)

### Core Stack
- **Backend**: Node.js/Express API with PostgreSQL
- **Frontend**: React SPA with Material-UI
- **Hosting**: Railway (auto-deploys from GitHub)
- **Database**: PostgreSQL on Railway
- **Authentication**: Dual system - JWT tokens and API keys

## Database Credentials (Railway Production)
```bash
PGPASSWORD=ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ
Host: ballast.proxy.rlwy.net
Port: 20017
User: postgres
Database: railway
```

## Key Business Entities

### Brokerage Structure
- **Broker**: Associated Real Estate (Berkshire Hathaway HomeServices)
  - License: 01910265 (CA Corporation)
  - Designated Officer: Josh Riley (License: 01365477)
  - Main Office: 122 S Green St Ste 5, Tehachapi, CA 93561

### Teams
- **Jayden Metz Realty Group** - Jayden Metz (Agent)
- **Riley Real Estate Team** - Josh Riley (Broker/Owner)

### Core Modules
1. **Escrows**: Transaction management with full CRUD operations
2. **Listings**: Property inventory management
3. **Clients**: Contact and relationship management
4. **Leads**: Lead qualification pipeline
5. **Appointments**: Calendar and scheduling
6. **Brokers**: Multi-team brokerage management

## Authentication System

### API Key Authentication
- No prefixes - clean 64-character hex strings
- Stored with SHA-256 hashing
- Support for expiration and revocation
- User/team scoped permissions

### Endpoints Requiring Authentication
All `/v1/*` endpoints except:
- `/v1/auth/login` - Public login endpoint
- `/v1/auth/register` - Public registration
- `/v1/health` - Basic health check

### Testing Authentication
```bash
# Create API key (requires JWT)
curl -X POST https://api.jaydenmetz.com/v1/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Key", "expiresInDays": 365}'

# Use API key
curl https://api.jaydenmetz.com/v1/escrows \
  -H "X-API-Key: YOUR_API_KEY"
```

## Development Commands

### Backend
```bash
cd backend
npm run dev          # Start development server
npm start           # Start production server
npm test           # Run tests
./test-api-auth.sh  # Test API authentication
```

### Frontend
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
```

### Database Migrations
```bash
# Run migration on Railway
PGPASSWORD=ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ psql -h ballast.proxy.rlwy.net -p 20017 -U postgres -d railway -f backend/migrations/XXX_migration_name.sql
```

## API Architecture

### Response Format
```javascript
{
  success: boolean,
  data: object | array,
  error: { code: string, message: string },
  timestamp: string
}
```

### Security Features
- All escrow endpoints require authentication
- User/team data isolation
- API key permissions system
- Rate limiting enabled
- CORS configured for production domains

### Health Check Endpoints
- `/v1/escrows/health` - Full CRUD test (creates/updates/deletes test data)
- `/v1/escrows/health/auth` - Authentication verification
- `/v1/escrows/health/db` - Database connectivity

## Database Schema

### Recently Added Tables
- `api_keys` - API key management
- `api_key_logs` - Usage tracking
- `brokers` - Brokerage organizations
- `broker_teams` - Team-broker relationships
- `broker_users` - Broker-level permissions

### Removed Tables (Cleaned Up)
No longer using: ai_agents, checklist_templates, clients_old, contact_*, escrow_buyers_old, escrow_checklist*, escrow_documents, escrow_financials, escrow_participants, escrow_people, escrow_sellers_old, escrow_timeline, listing_analytics, listing_marketing_checklist, notes, profile_statistics, user_profiles, user_settings

## File Structure
```
real-estate-crm/
├── backend/
│   ├── src/
│   │   ├── app.js              # Main Express app with auth
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, rate limiting
│   │   │   ├── apiKey.middleware.js  # API key authentication
│   │   │   └── auth.middleware.js    # JWT authentication
│   │   ├── routes/            # API endpoints
│   │   │   ├── apiKeys.js     # API key management
│   │   │   ├── escrows.js     # Escrow CRUD + health
│   │   │   └── escrows-health.js  # Health check endpoints
│   │   └── services/          # Business logic
│   │       ├── apiKey.service.js   # API key operations
│   │       └── broker.service.js   # Broker management
│   ├── migrations/            # SQL migrations
│   └── test-api-auth.sh      # API testing script
└── frontend/
    └── src/
        └── components/        # React components
```

## Testing

### API Authentication Test
```bash
./backend/test-api-auth.sh
```

Tests:
- JWT login
- API key creation
- API key authentication
- Database connectivity
- Full escrow CRUD operations
- Permission enforcement
- Key revocation

## Common Tasks

### Create New User
```sql
INSERT INTO users (email, username, first_name, last_name, role, password_hash, team_id)
VALUES ('email@example.com', 'username', 'First', 'Last', 'agent', 
        '$2b$10$...', 'team-uuid');
```

### Link Team to Broker
```sql
INSERT INTO broker_teams (broker_id, team_id, commission_split)
VALUES ('broker-uuid', 'team-uuid', 70.00);
```

### Check API Key Status
```sql
SELECT id, key_prefix, is_active, user_id, expires_at 
FROM api_keys 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

## Deployment

### Railway Auto-Deploy
- Pushes to `main` branch trigger automatic deployment
- API typically deploys within 2-3 minutes
- Check deployment status at Railway dashboard

### Manual Deploy
```bash
git add -A
git commit -m "Your change description

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

## Important Notes

1. **Always use authentication** - No public API access to personal data
2. **API keys have no prefix** - Clean 64-character hex strings
3. **Auto-commit and push** - Don't wait for confirmation
4. **Railway deploys automatically** - From GitHub pushes
5. **Use existing tables** - Brokers system uses existing teams/users
6. **Test with test-api-auth.sh** - Comprehensive testing script

## Support Users

### Admin Users
- **Jayden Metz**: admin@jaydenmetz.com (system_admin role)
- **Josh Riley**: josh@bhhsassociated.com (broker/owner)

### Test Credentials
- Username: admin@jaydenmetz.com
- Password: AdminPassword123!

This system is configured for Associated Real Estate under Berkshire Hathaway HomeServices with proper California DRE licensing structure.