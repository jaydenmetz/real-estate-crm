# Real Estate CRM Database Data Report

Generated on: 2025-07-18

## Database Overview

- **Database Name**: realestate_crm
- **Database Type**: PostgreSQL 15
- **Connection**: postgresql://postgres:postgres@localhost:5432/realestate_crm

## Database Schema

The database has been initialized with the following migrations:

1. **001_initial_schema.sql** - Executed on 2025-07-17T19:03:21.869Z
2. **002_add_soft_delete.sql** - Executed on 2025-07-17T19:11:56.983Z  
3. **003_add_listing_tables.sql** - Executed on 2025-07-17T19:25:56.486Z

## Tables and Data Status

### Core Tables
| Table | Record Count | Status |
|-------|-------------|---------|
| teams | 0 | Empty |
| users | 0 | Empty |
| escrows | 0 | Empty |
| escrow_buyers | 0 | Empty |
| escrow_sellers | 0 | Empty |
| listings | 0 | Empty |
| clients | 0 | Empty |
| leads | 0 | Empty |
| appointments | 0 | Empty |

### Listing-Related Tables
| Table | Record Count | Status |
|-------|-------------|---------|
| listing_price_history | 0 | Empty |
| listing_showings | 0 | Empty |
| listing_marketing_checklist | 0 | Empty |
| listing_analytics | 0 | Empty |

### Support Tables
| Table | Record Count | Status |
|-------|-------------|---------|
| documents | 0 | Empty |
| notes | 0 | Empty |
| ai_agents | 0 | Empty |

### System Tables
| Table | Record Count | Status |
|-------|-------------|---------|
| migrations | 3 | Contains migration history |

## Summary

**All application tables are currently empty.** The database schema has been properly created through migrations, but no data has been seeded or added to any of the tables.

## Redis Cache

The Redis cache is also empty with no keys stored.

## Recommendations

1. **Seed Data**: Consider creating seed data scripts to populate the database with test data for development
2. **AI Agents**: The ai_agents table is empty - you may need to run the initialization script at `backend/scripts/initialize-ai-agents.js`
3. **Sample Data**: For testing and development, you could:
   - Create sample teams and users
   - Add test escrows, listings, clients, and leads
   - Initialize the AI agents

## Database Schema Details

### Key Tables Structure:

1. **Teams**: Multi-tenant support with subdomain routing
2. **Users**: Agent/user management with role-based access
3. **Escrows**: Transaction management with buyers/sellers relationships
4. **Listings**: Property inventory with comprehensive tracking
5. **Clients**: Contact management for buyers/sellers
6. **Leads**: Lead pipeline and scoring
7. **Appointments**: Calendar and showing coordination
8. **AI Agents**: 14 specialized AI agents for automation
9. **Documents**: File storage and management
10. **Notes**: Activity tracking across entities

All tables include:
- UUID primary keys (except escrows which use custom IDs)
- Timestamps (created_at, updated_at)
- Soft delete support (deleted_at)
- Team-based multi-tenancy
- Proper indexes for performance