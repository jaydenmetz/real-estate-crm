# Environment Configuration Guide

## Overview

This application supports multiple environments to separate local development from production data.

## Environment Files

- `.env` - Current active environment (gitignored)
- `.env.local` - Local development configuration (gitignored)
- `.env.production` - Production configuration (gitignored)
- `.env.production.example` - Example production configuration (committed)

## Quick Start

### Local Development
```bash
# Use local database and Redis
npm run env:local
npm run dev

# Or directly start with local env
npm run dev:local
```

### Production Testing
```bash
# Use Railway database and Redis (be careful!)
npm run env:prod
npm run dev:prod
```

## Environment Variables

### Key Differences

| Variable | Local | Production |
|----------|-------|------------|
| NODE_ENV | development | production |
| DATABASE_URL | postgresql://localhost:5432/real_estate_crm | Railway PostgreSQL URL |
| REDIS_URL | redis://localhost:6379 | Railway Redis URL |
| FRONTEND_URL | http://localhost:3001 | https://crm.jaydenmetz.com |

### Visual Indicators

When running in development mode:
- All escrow addresses will have " - LOCAL" suffix
- Example: "123 Main Street, Los Angeles, CA 90001 - LOCAL"

This helps you immediately identify which database you're connected to.

## Railway Configuration

In Railway, set these environment variables:

1. DATABASE_URL (automatically provided by Railway PostgreSQL)
2. REDIS_URL (if using Railway Redis)
3. NODE_ENV=production
4. All your API keys from .env.production.example

## Safety Features

1. The `switch-env.sh` script warns before switching to production
2. Escrows show " - LOCAL" suffix in development
3. Different JWT secrets for each environment
4. Environment files are gitignored

## Commands

```bash
# Switch environments
npm run env:local    # Switch to local environment
npm run env:prod     # Switch to production (with confirmation)

# Start server with specific environment
npm run dev:local    # Start with local environment
npm run dev:prod     # Start with production environment

# Normal development (uses current .env)
npm run dev
```

## Best Practices

1. Always use `.env.local` for local development
2. Never commit real credentials
3. Generate new JWT secrets for production
4. Test locally before deploying
5. Be careful when using production environment locally

## Troubleshooting

If you see data without " - LOCAL" suffix in development:
1. Check NODE_ENV: `echo $NODE_ENV`
2. Verify using local .env: `grep NODE_ENV .env`
3. Restart the server after changing environments