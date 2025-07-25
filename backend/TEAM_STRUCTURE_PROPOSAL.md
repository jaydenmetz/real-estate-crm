# Multi-Tenant Team Structure Proposal

## User Roles Hierarchy

### System Level
- **system_admin** - Can see/manage all teams (only "admin" user has this)

### Team Level
- **team_owner** - Created the team, full control, can delete team
- **team_admin** - Can manage team settings, invite/remove members
- **agent** - Regular team member, can manage their own data
- **assistant** - Limited access, can view/assist but not create
- **viewer** - Read-only access

## Database Schema Changes

### 1. Enhanced Teams Table
```sql
CREATE TABLE teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    owner_id UUID NOT NULL REFERENCES users(id),
    team_type VARCHAR(50) DEFAULT 'individual', -- 'individual' or 'brokerage'
    settings JSONB DEFAULT '{}',
    max_members INTEGER DEFAULT 1, -- 1 for individual, more for brokerages
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Team Memberships Table (many-to-many)
```sql
CREATE TABLE team_memberships (
    membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    team_id UUID NOT NULL REFERENCES teams(team_id),
    role VARCHAR(50) NOT NULL, -- 'team_owner', 'team_admin', 'agent', 'assistant', 'viewer'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, team_id)
);
```

### 3. Modified Users Table
```sql
-- Remove team_id from users table (users can belong to multiple teams)
-- Add default_team_id for which team to show by default
ALTER TABLE users 
DROP COLUMN team_id,
ADD COLUMN default_team_id UUID REFERENCES teams(team_id);
```

## User Registration Flow

1. **New User Signs Up**
   ```javascript
   // When user registers:
   1. Create user account
   2. Automatically create their individual team:
      - Name: "{firstName} {lastName} Real Estate" or custom
      - Subdomain: username or custom
      - team_type: 'individual'
      - owner_id: new user's ID
   3. Create team_membership:
      - user_id: new user
      - team_id: new team
      - role: 'team_owner'
   4. Set user's default_team_id to their new team
   ```

2. **Joining Existing Team**
   ```javascript
   // Team owner/admin invites new member:
   1. Send invitation (email/link)
   2. New user accepts
   3. Create team_membership with appropriate role
   4. User now has access to multiple teams
   ```

## Example Scenarios

### Scenario 1: Individual Agent (Jayden)
- Signs up as "jaydenmetz"
- System creates "Jayden Metz Real Estate" team
- Jayden is team_owner of this team
- Can work solo or invite an assistant

### Scenario 2: Brokerage
- Broker signs up and creates "ABC Realty" team
- Sets team_type to 'brokerage'
- Invites agents who get 'agent' role
- Each agent also has their own individual team

### Scenario 3: Agent with Assistant
- Agent has their individual team
- Invites assistant with 'assistant' role
- Assistant can help manage agent's data

## Benefits

1. **Flexibility**: Users can belong to multiple teams
2. **Scalability**: Supports individual agents and large brokerages
3. **Clear Ownership**: Each team has a clear owner
4. **Granular Permissions**: Different roles for different needs
5. **Default Experience**: Users always have their own space

## Implementation Steps

1. Create new tables (team_memberships)
2. Migrate existing data:
   - Set jaydenmetz as team_owner of "Jayden Metz Real Estate"
   - Create team_membership records
3. Update authentication to handle team context
4. Add team switcher UI for users in multiple teams
5. Update all queries to filter by current team context