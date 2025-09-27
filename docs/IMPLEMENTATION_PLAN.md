# Implementation Plan: Multi-Tenant CRM

## Immediate Actions (Today)

### 1. ✅ User Accounts Setup
- **System Admin**: admin / AdminPassword123!
- **Personal Realtor**: jaydenmetz / Password123!

### 2. Database Structure (This Week)
```sql
-- Run migration 011_add_multi_tenant_structure.sql
-- This adds:
-- - team_id to all tables
-- - Three-tier escrow ID system
-- - Global unique IDs
```

### 3. Frontend Updates Needed

#### A. Login Page Enhancement
- After login, if user is system_admin, show team selector
- Otherwise, direct to their team's dashboard

#### B. Admin Dashboard
```jsx
// New component: TeamSelector.jsx
// Shows dropdown of all teams
// Switches context to view selected team's data
```

#### C. Escrow Display
- Show all three IDs:
  - Simple: "Escrow #1"
  - Reference: "ESC-2025-001"
  - System: Hidden UUID for URLs

## Week 1 Tasks

1. **Create Teams Table**
   ```sql
   CREATE TABLE teams (
     id UUID PRIMARY KEY,
     name VARCHAR(255),
     subdomain VARCHAR(100) UNIQUE,
     created_at TIMESTAMP
   );
   ```

2. **Add Team Context**
   - Create TeamContext in React
   - All API calls include team_id
   - Filter all queries by team_id

3. **Update Controllers**
   - Add team_id to all queries
   - System admin can bypass team filters

## Week 2 Tasks

1. **Subdomain Routing**
   - Detect subdomain from request
   - Load appropriate team context
   - Update Railway/hosting config

2. **Data Migration**
   - Assign existing data to jaydenmetz team
   - Create clean admin account

## Current Railway Setup is Fine For:
- Development and testing
- First 50-100 teams
- ~10,000 total escrows
- ~100,000 total records

## When to Consider Upgrading:
- **Supabase**: When you have 50+ paying teams
- **AWS RDS**: When you have 500+ teams or enterprise clients
- **Separate Databases**: When teams demand complete isolation

## Simple Architecture for Now:

```
Railway PostgreSQL
├── System Tables
│   ├── teams
│   └── users (with team_id)
├── Team Data (filtered by team_id)
│   ├── escrows
│   ├── listings
│   ├── clients
│   └── leads
```

## Why This Works:
1. Railway can handle millions of rows
2. Proper indexes make queries fast
3. team_id filtering ensures isolation
4. Easy to migrate later
5. Cost-effective for startup phase

## Don't Over-Engineer:
- Start simple with team_id filtering
- Railway is great for $0-100k MRR
- Focus on features, not infrastructure
- Migrate when you have real scale problems

## Next Immediate Step:
Run the migration and test with your two accounts:
1. Login as `jaydenmetz` - see your realtor data
2. Login as `admin` - see option to view all teams