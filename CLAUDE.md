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

### Project Organization Rules
- **NEVER create duplicate or test versions of files** (no file2.jsx, fileEnhanced.jsx, etc.)
- **ALWAYS use existing files** - edit in place, don't create new versions
- **Keep root directory clean** - no test scripts or documentation in root
- **Use proper folder structure**:
  - `/docs` - All documentation and guides
  - `/scripts` - Shell scripts and utilities
    - `/scripts/testing` - Test scripts
    - `/scripts/backend` - Backend-specific scripts
  - `/backend/scripts` - Backend operational scripts (backups, etc.)
  - Component archives go in `archive/` folder within their directory

## Project Overview

### Production URLs
- **Frontend**: https://crm.jaydenmetz.com
- **API**: https://api.jaydenmetz.com/v1
- **Database**: Railway PostgreSQL (ballast.proxy.rlwy.net:20017)
- **Health Dashboard**: https://crm.jaydenmetz.com/health

### Core Stack
- **Backend**: Node.js/Express API with PostgreSQL
- **Frontend**: React SPA with Material-UI
- **Hosting**: Railway (auto-deploys from GitHub)
- **Database**: PostgreSQL on Railway
- **Authentication**: Dual system - JWT tokens and API keys
- **Monitoring**: Sentry for error tracking (when configured)

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

### Dual Authentication Support
- **JWT Tokens**: For native app usage (login sessions)
- **API Keys**: For external API access and integrations

### API Key Features
- No prefixes - clean 64-character hex strings
- Stored with SHA-256 hashing in database
- Support for expiration and revocation
- User/team scoped permissions
- Management UI in Settings page (/settings#api-keys)
- Dropdown selection in health dashboards
- Secure one-time display of new keys
- Usage tracking (created_at, last_used_at, expires_at)

### Endpoints Requiring Authentication
All `/v1/*` endpoints except:
- `/v1/auth/login` - Public login endpoint
- `/v1/auth/register` - Public registration
- `/v1/health` - Basic health check

## Development Commands

### Backend
```bash
cd backend
npm run dev          # Start development server
npm start           # Start production server
npm test           # Run tests
./scripts/backup.sh # Run database backup
```

### Frontend
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
```

### Database Operations
```bash
# Run migration on Railway
PGPASSWORD=ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ psql -h ballast.proxy.rlwy.net -p 20017 -U postgres -d railway -f backend/migrations/XXX_migration_name.sql

# Backup database
./backend/scripts/backup.sh
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
- All endpoints require authentication
- User/team data isolation
- API key permissions system
- Rate limiting enabled
- CORS configured for production domains

### Health Check System

#### Main Health Dashboard
- **URL**: `/health` - System-wide overview of all modules
- Automatically runs all tests on page load
- Green/red visual indicators for pass/fail
- Simplified, clean card design

#### Module-Specific Health Pages
- `/escrows/health` - 29 comprehensive tests
- `/listings/health` - 26 tests
- `/clients/health` - 15 tests
- `/appointments/health` - 15 tests
- `/leads/health` - 14 tests

#### Features
- Dual authentication testing (JWT and API Key)
- Automatic test execution with rate limit protection
- Copy test results for debugging
- Expandable test details

## File Structure
```
real-estate-crm/
├── backend/
│   ├── src/
│   │   ├── app.js              # Main Express app
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, rate limiting
│   │   ├── routes/            # API endpoints
│   │   └── services/          # Business logic
│   ├── scripts/               # Operational scripts
│   │   └── backup.sh         # Database backup script
│   └── migrations/            # SQL migrations
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── health/        # Health check dashboards
│       │   │   ├── HealthOverviewDashboard.jsx  # Main /health page
│       │   │   ├── EscrowsHealthDashboard.jsx
│       │   │   ├── ListingsHealthDashboard.jsx
│       │   │   ├── ClientsHealthDashboard.jsx
│       │   │   ├── AppointmentsHealthDashboard.jsx
│       │   │   ├── LeadsHealthDashboard.jsx
│       │   │   └── archive/   # Old versions (not used)
│       │   └── common/        # Shared components
│       ├── services/
│       │   ├── api.service.js # API client
│       │   └── healthCheck.service.js
│       └── pages/
│           └── Settings.jsx   # Settings with API key management
├── docs/                      # All documentation
│   ├── ARCHITECTURE.md
│   ├── SCALING_GUIDE.md
│   └── ...
├── scripts/                   # Utility scripts
│   ├── testing/              # Test scripts
│   └── backend/              # Backend scripts
└── CLAUDE.md                 # This file
```

## Testing

### Health Dashboard Testing
1. Navigate to `/health` for system-wide testing
2. All tests run automatically on page load
3. Click module cards to expand test details
4. Click module names to go to detailed health pages

### API Authentication Test
```bash
./scripts/testing/test-api-auth.sh
```

## Common Tasks

### API Key Management
```bash
# Create key via API
curl -X POST https://api.jaydenmetz.com/v1/api-keys \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Key", "expiresInDays": 365}'
```

### Database Backup
```bash
cd backend
./scripts/backup.sh
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
5. **Test with health dashboard** - Comprehensive testing at `/health`
6. **Keep project organized** - Follow folder structure guidelines
7. **No duplicate files** - Edit existing files, don't create versions
8. **Clean root directory** - Documentation in `/docs`, scripts in `/scripts`

## Support Users

### Admin Users
- **Jayden Metz**: admin@jaydenmetz.com (system_admin role)
- **Josh Riley**: josh@bhhsassociated.com (broker/owner)

### Test Credentials
- Username: admin@jaydenmetz.com
- Password: AdminPassword123!

## Database Scaling & Backup Strategy

### Backup Strategy
- Daily automated backups via `backend/scripts/backup.sh`
- Consider migrating to Supabase/Neon for automatic PITR
- Implement S3 storage for long-term backup retention

### Recommended Services for Growth
- **Monitoring**: Sentry (error tracking)
- **Caching**: Redis/Upstash
- **CDN**: Cloudflare
- **Email**: SendGrid/Postmark
- **Search**: Algolia/Typesense

### Performance Optimizations
```sql
-- Essential indexes (already in place)
CREATE INDEX idx_escrows_user_id ON escrows(user_id);
CREATE INDEX idx_escrows_status ON escrows(status);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_clients_status ON clients(status);
```

This system is configured for Associated Real Estate under Berkshire Hathaway HomeServices with proper California DRE licensing structure.