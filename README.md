# Real Estate CRM - Comprehensive Documentation

> A complete real estate CRM system with AI agent integration, following Tom Ferry's best practices.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [API Documentation](#api-documentation)
5. [Database Structure](#database-structure)
6. [AI Agents System](#ai-agents-system)
7. [Environment Configuration](#environment-configuration)
8. [Deployment Guide](#deployment-guide)
9. [Development Patterns](#development-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Key Features

- **Complete CRM System**: Manage escrows, listings, clients, appointments, and leads
- **14 AI Agents**: Autonomous agents for buyer qualification, listing marketing, transaction coordination
- **Real-time Updates**: WebSocket integration for live data and AI agent activity
- **3D Virtual Office**: Visual representation of AI agents working in Three.js/Babylon.js
- **Multi-tenant**: Team-based data isolation with subdomain support
- **Mobile Responsive**: Works seamlessly on all devices
- **Tom Ferry Methodology**: Built-in best practices and workflows

### Technology Stack

- **Frontend**: React, Material-UI, Three.js, React Query
- **Backend**: Node.js, Express.js, PostgreSQL, Redis
- **AI**: Claude API (Anthropic) with Opus, Sonnet, and Haiku models
- **Real-time**: Socket.io for WebSocket connections
- **Deployment**: Railway (PostgreSQL, Redis, API), Vercel (Frontend)

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (optional for local development)
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jaydenmetz/real-estate-crm.git
cd real-estate-crm
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env.local
npm run env:local  # Sets up local environment
npm run dev:local  # Starts with local database
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
npm start
```

4. **Docker Alternative**
```bash
docker-compose up -d
```

### Default Access
- Frontend: http://localhost:3001
- Backend API: http://localhost:5050
- Default user: jaydenmetz / Password123!

---

## Architecture

### Monorepo Structure
```
real-estate-crm/
├── backend/           # Express.js API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   │   └── ai/        # AI agent implementations
│   │   ├── config/        # Database, Redis config
│   │   └── utils/         # Helpers and utilities
│   ├── migrations/    # SQL schema migrations
│   └── scripts/       # Utility scripts
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── dashboards/    # Main feature dashboards
│   │   ├── details/       # Detail views
│   │   └── ai/           # AI-specific interfaces
└── docker-compose.yml # Full stack setup
```

### Key Architectural Patterns

1. **Contact-Centric Design**: All person data flows through central contacts table
2. **Multi-tenancy**: Every table includes team_id for data isolation
3. **Soft Deletes**: deleted_at timestamp instead of hard deletes
4. **Polymorphic Associations**: Documents/Notes can attach to any entity
5. **Event-Driven**: WebSocket for real-time updates
6. **Service Layer**: Business logic separated from controllers

---

## API Documentation

### Base Configuration
- **Base URL**: `https://api.jaydenmetz.com/v1` (production)
- **Local URL**: `http://localhost:5050/v1`
- **Authentication**: Bearer token (currently optional during development)

### Standard Response Format
```json
{
  "success": true,
  "data": { /* entity data */ },
  "timestamp": "2025-01-23T12:00:00Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Core Endpoints

#### Escrows
- `GET /v1/escrows` - List all escrows (paginated)
- `GET /v1/escrows/:id` - Get escrow details
- `POST /v1/escrows` - Create new escrow
- `PUT /v1/escrows/:id` - Update escrow
- `DELETE /v1/escrows/:id` - Soft delete escrow

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `sort` (default: created_at)
- `order` (asc/desc)
- `status` (Active/Pending/Closed)
- `search` (searches address and ID)

#### Listings
- `GET /v1/listings` - List all listings
- `GET /v1/listings/:id` - Get listing details
- `POST /v1/listings` - Create new listing
- `PUT /v1/listings/:id` - Update listing
- `GET /v1/listings/:id/showings` - Get showing history
- `POST /v1/listings/:id/price-change` - Record price change

#### Clients
- `GET /v1/clients` - List all clients
- `GET /v1/clients/:id` - Get client details
- `POST /v1/clients` - Create new client
- `PUT /v1/clients/:id` - Update client
- `GET /v1/clients/:id/properties` - Get client's property interests

#### Leads
- `GET /v1/leads` - List all leads
- `GET /v1/leads/:id` - Get lead details
- `POST /v1/leads` - Create new lead
- `PUT /v1/leads/:id` - Update lead
- `POST /v1/leads/:id/convert` - Convert lead to client

#### Appointments
- `GET /v1/appointments` - List appointments
- `GET /v1/appointments/:id` - Get appointment details
- `POST /v1/appointments` - Create appointment
- `PUT /v1/appointments/:id` - Update appointment
- `POST /v1/appointments/:id/reminder` - Send reminder

#### AI Agents
- `GET /v1/ai/agents` - List all AI agents
- `GET /v1/ai/agents/:id` - Get agent details
- `PUT /v1/ai/agents/:id/toggle` - Enable/disable agent
- `GET /v1/ai/usage` - Get usage statistics
- `POST /v1/ai/tasks` - Create AI task
- `GET /v1/ai/tasks/:id/status` - Get task status

#### Documents
- `POST /v1/documents/upload` - Upload document
- `GET /v1/documents/:id` - Get document metadata
- `GET /v1/documents/:id/download` - Download document
- `DELETE /v1/documents/:id` - Delete document

---

## Database Structure

### Core Tables

#### Contacts (Central Hub)
- **Purpose**: Central repository for all people
- **Key Fields**: name, email, phones, address, type, source
- **Relationships**: Hub for agents, clients, escrows

#### Escrows
- **Purpose**: Track real estate transactions
- **Key Fields**: property_address, price, dates, commissions
- **Relationships**: Links to contacts via contact_escrows

#### Listings
- **Purpose**: Property inventory
- **Key Fields**: address, price, MLS#, features, photos
- **Related Tables**: price_history, showings, analytics

#### Teams & Users
- **Purpose**: Multi-tenant support and authentication
- **Key Fields**: team subdomain, user roles
- **Relationships**: All business tables reference team_id

### Junction Tables
- `contact_escrows` - Links contacts to escrows with roles
- `contact_agents` - Many-to-many agent relationships
- `contact_clients` - Many-to-many client relationships

### Supporting Tables
- `escrow_checklist` - Task management for transactions
- `escrow_timeline` - Event history
- `documents` - File attachments (polymorphic)
- `notes` - Comments (polymorphic)
- `ai_agents` - AI agent configuration
- `ai_tasks` - AI task queue and history

### Key Patterns
1. **Soft Deletes**: `deleted_at` timestamp
2. **Audit Fields**: `created_at`, `updated_at` (auto-triggered)
3. **JSONB Usage**: Flexible data (settings, metadata, features)
4. **UUID Primary Keys**: Better distribution and security

---

## AI Agents System

### Overview
14 specialized AI agents powered by Claude API, each handling specific real estate tasks.

### Agent Roles

#### Transaction Management
1. **Transaction Coordinator** - Manages escrow timelines and tasks
2. **Compliance Officer** - Ensures regulatory compliance
3. **Financial Analyst** - Analyzes deals and commissions

#### Client Management
4. **Buyer Qualifier** - Qualifies and nurtures buyer leads
5. **Buyer Nurture Specialist** - Long-term buyer engagement
6. **Showing Coordinator** - Schedules and manages showings
7. **Client Communication** - Handles routine client updates

#### Listing Management
8. **Listing Launch Specialist** - Prepares new listings
9. **Market Analyst** - Provides CMAs and market insights
10. **Listing Marketing** - Creates marketing content

#### Operations
11. **Database Specialist** - Data entry and maintenance
12. **Executive Assistant** - Calendar and task management
13. **Team Coordinator** - Team communication and coordination
14. **Social Media Manager** - Social media presence

### Cost Control

**IMPORTANT**: All agents are DISABLED by default to prevent unexpected charges.

#### Pricing Tiers
- **Claude Opus**: $0.015/1K input, $0.075/1K output (complex tasks)
- **Claude Sonnet**: $0.003/1K input, $0.015/1K output (standard tasks)
- **Claude Haiku**: $0.00025/1K input, $0.00125/1K output (simple tasks)

#### Safety Features
1. **Manual Enable Required**: Each agent must be explicitly enabled
2. **Token Limits**: Monthly limit of 500,000 tokens (configurable)
3. **Usage Tracking**: Real-time monitoring in dashboard
4. **Emergency Disable**: `npm run ai:disable-all`
5. **Mock Mode**: Test without API calls

### Configuration

Enable agents via dashboard or API:
```javascript
PUT /v1/ai/agents/:id/toggle
{
  "enabled": true,
  "monthlyTokenLimit": 100000
}
```

---

## Environment Configuration

### Environment Files
- `.env` - Active environment (gitignored)
- `.env.local` - Local development settings
- `.env.production` - Production settings (gitignored)
- `.env.example` - Template for new developers

### Key Variables

| Variable | Local | Production |
|----------|-------|------------|
| NODE_ENV | development | production |
| DATABASE_URL | postgresql://localhost:5432/real_estate_crm | Railway PostgreSQL URL |
| REDIS_URL | redis://localhost:6379 | Railway Redis URL |
| FRONTEND_URL | http://localhost:3001 | https://crm.jaydenmetz.com |

### Visual Environment Indicators
- **Development**: All escrows show " - LOCAL" suffix
- **Production**: Normal display without suffix

### Switching Environments
```bash
# Switch to local
npm run env:local

# Switch to production (with confirmation)
npm run env:prod

# Start with specific environment
npm run dev:local    # Uses local database
npm run dev:prod     # Uses Railway database
```

---

## Deployment Guide

### Prerequisites
- Railway account with PostgreSQL and Redis services
- Vercel account for frontend
- Environment variables configured

### Backend Deployment (Railway)

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy updates"
git push origin main
```

2. **Railway Auto-Deploy**
- Railway watches main branch
- Automatically builds and deploys on push
- Takes 2-3 minutes

3. **Set Environment Variables in Railway**
```
NODE_ENV=production
DATABASE_URL=(provided by Railway)
REDIS_URL=(provided by Railway)
JWT_SECRET=(generate new one)
ANTHROPIC_API_KEY=(your key)
```

### Frontend Deployment (Vercel)

1. **Build and Deploy**
```bash
cd frontend
npm run build
vercel --prod
```

2. **Environment Variables in Vercel**
```
REACT_APP_API_URL=https://api.jaydenmetz.com
REACT_APP_WS_URL=wss://api.jaydenmetz.com
```

### Database Migrations

1. **Test Migration Locally**
```bash
cd backend
npm run migrate
```

2. **Production Migration**
```bash
railway run npm run migrate
```

### Rollback Procedures

1. **Code Rollback**
```bash
git revert HEAD
git push origin main
```

2. **Database Rollback**
```bash
# Restore from backup
psql $DATABASE_URL < backup.sql
```

---

## Development Patterns

### Code Style
- **No Comments**: Code should be self-documenting
- **TypeScript**: Prefer interfaces over types
- **React**: Functional components with hooks
- **Testing**: Jest for backend, React Testing Library for frontend

### Git Workflow
1. Feature branches from main
2. PR with review
3. Squash and merge
4. Auto-deploy to production

### Database Patterns
```sql
-- Always use soft deletes
UPDATE escrows SET deleted_at = NOW() WHERE id = $1;

-- Always filter by team
SELECT * FROM escrows WHERE team_id = $1 AND deleted_at IS NULL;

-- Use JSONB for flexible data
UPDATE listings SET features = features || '{"pool": true}'::jsonb;
```

### API Patterns
```javascript
// Standard controller pattern
static async getAll(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await service.getAll({ page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
}
```

---

## Troubleshooting

### Common Issues

#### "Invalid time value" Error
- **Cause**: Date formatting mismatch between backend and frontend
- **Solution**: Ensure all dates are ISO strings or YYYY-MM-DD format

#### Database Connection Failed
- **Cause**: Missing DATABASE_URL or network issues
- **Solution**: Check environment variables and Railway status

#### AI Agents Not Working
- **Cause**: Agents disabled by default or missing API key
- **Solution**: Enable agents and add ANTHROPIC_API_KEY

#### WebSocket Connection Failed
- **Cause**: CORS or proxy configuration
- **Solution**: Check allowed origins in backend config

### Debug Commands

```bash
# Check API health
curl https://api.jaydenmetz.com/health

# Test database connection
npm run test:db

# View recent logs
railway logs --tail 100

# Check environment
npm run env:check
```

### Support Resources

- **GitHub Issues**: Report bugs and feature requests
- **API Status**: https://api.jaydenmetz.com/health
- **Documentation**: This README and inline code documentation

---

## License

Proprietary - All rights reserved

---

## Credits

Built following Tom Ferry's real estate best practices and methodologies.