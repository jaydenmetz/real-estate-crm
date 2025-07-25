# Multi-Tenant Architecture for Real Estate CRM

## Overview

This document outlines the multi-tenant architecture for scaling the Real Estate CRM to support multiple teams and users, each with their own data isolation and custom subdomains.

## User Structure

### 1. System Admin Account
- **Username**: admin
- **Purpose**: System-wide administration, viewing all teams' data
- **Features**: Team selection, global analytics, system configuration
- **No personal realtor data**

### 2. Team/Personal Accounts
- **Example**: jaydenmetz (personal realtor account)
- **Purpose**: Actual real estate business operations
- **Features**: Full CRM functionality, isolated data

## Database Architecture Options

### Option 1: Shared Database with Row-Level Security (Current - Good for Start)
```
Railway PostgreSQL Instance
├── teams table
├── users table (with team_id)
├── escrows table (with team_id)
├── listings table (with team_id)
└── ... other tables (with team_id)
```

**Pros:**
- Single database to manage
- Cost-effective for small-medium scale
- Easy cross-team analytics for admin
- Railway can handle 100-1000 teams

**Cons:**
- All teams share same database
- Performance impacts affect all teams
- Backup/restore affects everyone

### Option 2: Database per Team (Recommended for 10-100 teams)
```
Railway Project
├── Shared Database (system data)
│   ├── teams table
│   └── users table (system users)
├── Team1 Database Service
│   └── All CRM tables
├── Team2 Database Service
│   └── All CRM tables
└── ... per team
```

**Pros:**
- Complete data isolation
- Independent scaling per team
- Team-specific backups
- Can use Railway's multiple services

**Cons:**
- More complex to manage
- Higher cost per team
- Need connection routing logic

### Option 3: Hybrid Multi-Database Clusters (Best for 100+ teams)
```
Production Infrastructure
├── Supabase/Neon (for smaller teams)
│   ├── Shared clusters
│   └── Row-level security
├── AWS RDS/Aurora (for enterprise teams)
│   ├── Dedicated instances
│   └── Read replicas
└── Railway (for development/staging)
```

## Recommended Architecture for Your Scale

### Phase 1: Current Setup (1-50 teams)
- Use Railway with shared database
- Implement proper team_id filtering
- Use connection pooling

### Phase 2: Growth (50-500 teams)
- Move to Supabase or Neon.tech
- Implement database sharding by team
- Use edge functions for API

### Phase 3: Enterprise (500+ teams)
- AWS RDS with read replicas
- Kubernetes for API scaling
- CDN for static assets
- Redis clusters for caching

## Escrow ID System (Three-Tier)

### 1. Team-Specific Sequential ID
- **Format**: Simple integer (1, 2, 3...)
- **Scope**: Per team
- **Purpose**: Easy reference within team
- **Example**: "This is our first escrow" = ID 1

### 2. Human-Readable Reference ID
- **Format**: ESC-YYYY-NNN (ESC-2025-001)
- **Scope**: Per team per year
- **Purpose**: Official documents, client communication
- **Reset**: Annually per team

### 3. Global Unique Identifier (UUID)
- **Format**: UUID v4 (550e8400-e29b-41d4-a716-446655440000)
- **Scope**: Globally unique across all teams
- **Purpose**: System routing, API references
- **Never repeats**: Guaranteed unique across 1000 teams × 100 escrows

## Implementation Example

```sql
-- Enhanced escrows table
CREATE TABLE escrows (
    -- Global unique identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Team isolation
    team_id UUID NOT NULL REFERENCES teams(id),
    
    -- Team-specific sequential ID
    team_sequence_id SERIAL,
    
    -- Human-readable ID (ESC-2025-001)
    display_id VARCHAR(20) NOT NULL,
    
    -- Escrow data
    property_address TEXT,
    -- ... other fields
    
    -- Composite unique constraints
    CONSTRAINT unique_team_sequence UNIQUE (team_id, team_sequence_id),
    CONSTRAINT unique_team_display UNIQUE (team_id, display_id)
);

-- Index for fast lookups
CREATE INDEX idx_escrows_team_id ON escrows(team_id);
CREATE INDEX idx_escrows_display_id ON escrows(team_id, display_id);
```

## Subdomain Routing

### Domain Structure
```
app.jaydenmetz.com          → System admin login
jaydenmetz.jaydenmetz.com   → Your personal CRM
teamname.jaydenmetz.com     → Team CRM instance
```

### Implementation
1. **Wildcard DNS**: *.jaydenmetz.com → Your app
2. **Subdomain Detection**: Extract team from request
3. **Database Routing**: Connect to appropriate database
4. **Data Filtering**: Apply team_id filters automatically

## Security Considerations

1. **Data Isolation**: Enforce team_id in all queries
2. **JWT Claims**: Include team_id in tokens
3. **API Middleware**: Validate team access
4. **Admin Override**: Special handling for system_admin role

## Cost Analysis

### Railway (Current)
- **Cost**: ~$20-50/month for small scale
- **Suitable for**: 1-50 teams
- **Limit**: 10GB database, 8GB RAM

### Supabase/Neon
- **Cost**: ~$25-250/month
- **Suitable for**: 50-500 teams
- **Benefit**: Built-in row security, edge functions

### AWS RDS
- **Cost**: ~$100-1000+/month
- **Suitable for**: 500+ teams
- **Benefit**: Enterprise features, global scale

## Migration Path

1. **Current**: Single Railway database with team_id
2. **Next**: Add team table, update all tables with team_id
3. **Then**: Implement subdomain routing
4. **Future**: Move to Supabase when >50 teams
5. **Scale**: AWS RDS for enterprise clients

## Recommendations

For your immediate needs:
1. Keep Railway for now (it's fine for development and early customers)
2. Implement team_id columns across all tables
3. Add the three-tier ID system to escrows
4. Build admin team-switching UI
5. Plan for Supabase migration at 50+ teams

Railway is perfect for development and early stage. It's not limiting until you have significant scale (hundreds of teams or millions of records).