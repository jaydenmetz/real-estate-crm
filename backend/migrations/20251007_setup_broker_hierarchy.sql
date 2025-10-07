-- Migration: Setup 3-Tier Broker Hierarchy for Associated Real Estate
-- Date: 2025-10-07
-- Purpose: Create broker, teams, and establish proper hierarchy with WebSocket room support

-- =============================================================================
-- PART 1: CREATE BROKER
-- =============================================================================

-- Insert Associated Real Estate (Berkshire Hathaway HomeServices)
INSERT INTO brokers (
  id,
  name,
  company_name,
  license_number,
  license_state,
  email,
  phone,
  address,
  city,
  state,
  zip_code,
  commission_split_default,
  transaction_fee,
  is_active,
  verified_at,
  created_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- Fixed UUID for Associated Real Estate
  'Josh Riley',
  'Associated Real Estate (Berkshire Hathaway HomeServices)',
  '01910265', -- CA Corporation License
  'CA',
  'josh@bhhsassociated.com',
  NULL,
  '122 S Green St Ste 5',
  'Tehachapi',
  'CA',
  '93561',
  70.00, -- 70% agent split default
  285.00, -- Transaction fee
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  company_name = EXCLUDED.company_name,
  license_number = EXCLUDED.license_number,
  updated_at = NOW();

-- =============================================================================
-- PART 2: CREATE TEAMS UNDER BROKER
-- =============================================================================

-- Team 1: Riley Real Estate Team (Josh Riley - Broker/Owner)
INSERT INTO teams (
  team_id,
  name,
  subdomain,
  primary_broker_id,
  settings,
  created_at
) VALUES (
  '8e7f5d3a-9b2c-4e1a-8d6f-1a2b3c4d5e6f', -- Fixed UUID for Riley Team
  'Riley Real Estate Team',
  'riley-team',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '{"default_commission": 2.5, "timezone": "America/Los_Angeles"}',
  NOW()
)
ON CONFLICT (team_id) DO UPDATE SET
  name = EXCLUDED.name,
  primary_broker_id = EXCLUDED.primary_broker_id,
  updated_at = NOW();

-- Team 2: Jayden Metz Realty Group (Jayden Metz - Agent)
INSERT INTO teams (
  team_id,
  name,
  subdomain,
  primary_broker_id,
  settings,
  created_at
) VALUES (
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', -- Fixed UUID for Jayden Team
  'Jayden Metz Realty Group',
  'jayden-metz',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '{"default_commission": 2.5, "timezone": "America/Los_Angeles"}',
  NOW()
)
ON CONFLICT (team_id) DO UPDATE SET
  name = EXCLUDED.name,
  primary_broker_id = EXCLUDED.primary_broker_id,
  updated_at = NOW();

-- =============================================================================
-- PART 3: LINK TEAMS TO BROKER
-- =============================================================================

-- Link Riley Team to Broker
INSERT INTO broker_teams (
  broker_id,
  team_id,
  commission_split,
  transaction_fee,
  status,
  joined_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '8e7f5d3a-9b2c-4e1a-8d6f-1a2b3c4d5e6f',
  70.00,
  285.00,
  'active',
  NOW()
)
ON CONFLICT (broker_id, team_id) DO UPDATE SET
  status = 'active',
  commission_split = EXCLUDED.commission_split;

-- Link Jayden Metz Team to Broker
INSERT INTO broker_teams (
  broker_id,
  team_id,
  commission_split,
  transaction_fee,
  status,
  joined_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  70.00,
  285.00,
  'active',
  NOW()
)
ON CONFLICT (broker_id, team_id) DO UPDATE SET
  status = 'active',
  commission_split = EXCLUDED.commission_split;

-- =============================================================================
-- PART 4: UPDATE USERS WITH TEAM ASSIGNMENTS
-- =============================================================================

-- Assign Jayden Metz (admin@jaydenmetz.com) to Jayden Metz Realty Group
UPDATE users
SET
  team_id = '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  updated_at = NOW()
WHERE email = 'admin@jaydenmetz.com';

-- Assign Josh Riley (josh@bhhsassociated.com) to Riley Real Estate Team (if exists)
UPDATE users
SET
  team_id = '8e7f5d3a-9b2c-4e1a-8d6f-1a2b3c4d5e6f',
  updated_at = NOW()
WHERE email = 'josh@bhhsassociated.com';

-- =============================================================================
-- PART 5: LINK USERS TO BROKER
-- =============================================================================

-- Link Jayden to broker as team_lead
INSERT INTO broker_users (
  broker_id,
  user_id,
  role,
  permissions,
  is_active,
  created_at
)
SELECT
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  id,
  'team_lead',
  '{"manage_team": true, "view_reports": true, "manage_listings": true}',
  true,
  NOW()
FROM users WHERE email = 'admin@jaydenmetz.com'
ON CONFLICT (broker_id, user_id) DO UPDATE SET
  role = 'team_lead',
  is_active = true;

-- Link Josh to broker as admin
INSERT INTO broker_users (
  broker_id,
  user_id,
  role,
  permissions,
  is_active,
  created_at
)
SELECT
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  id,
  'admin',
  '{"manage_broker": true, "manage_teams": true, "view_all_reports": true, "manage_users": true}',
  true,
  NOW()
FROM users WHERE email = 'josh@bhhsassociated.com'
ON CONFLICT (broker_id, user_id) DO UPDATE SET
  role = 'admin',
  is_active = true;

-- =============================================================================
-- PART 6: ADD broker_id TO EXISTING TABLES FOR DATA ISOLATION
-- =============================================================================

-- Add broker_id to escrows table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'escrows' AND column_name = 'broker_id') THEN
    ALTER TABLE escrows ADD COLUMN broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;
    CREATE INDEX idx_escrows_broker_id ON escrows(broker_id);
  END IF;
END $$;

-- Add broker_id to listings table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'listings' AND column_name = 'broker_id') THEN
    ALTER TABLE listings ADD COLUMN broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;
    CREATE INDEX idx_listings_broker_id ON listings(broker_id);
  END IF;
END $$;

-- Add broker_id to clients table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'clients' AND column_name = 'broker_id') THEN
    ALTER TABLE clients ADD COLUMN broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;
    CREATE INDEX idx_clients_broker_id ON clients(broker_id);
  END IF;
END $$;

-- Add broker_id to leads table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'leads' AND column_name = 'broker_id') THEN
    ALTER TABLE leads ADD COLUMN broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;
    CREATE INDEX idx_leads_broker_id ON leads(broker_id);
  END IF;
END $$;

-- Add broker_id to appointments table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'appointments' AND column_name = 'broker_id') THEN
    ALTER TABLE appointments ADD COLUMN broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;
    CREATE INDEX idx_appointments_broker_id ON appointments(broker_id);
  END IF;
END $$;

-- =============================================================================
-- PART 7: BACKFILL broker_id FOR EXISTING DATA
-- =============================================================================

-- Backfill escrows with broker_id from Associated Real Estate
UPDATE escrows
SET broker_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE broker_id IS NULL;

-- Backfill listings
UPDATE listings
SET broker_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE broker_id IS NULL;

-- Backfill clients
UPDATE clients
SET broker_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE broker_id IS NULL;

-- Backfill leads
UPDATE leads
SET broker_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE broker_id IS NULL;

-- Backfill appointments
UPDATE appointments
SET broker_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE broker_id IS NULL;

-- =============================================================================
-- VERIFICATION QUERIES (commented out - uncomment to test)
-- =============================================================================

/*
-- Verify hierarchy
SELECT
  b.name as broker_name,
  t.name as team_name,
  u.email as user_email,
  u.role as user_role,
  bu.role as broker_role
FROM brokers b
LEFT JOIN broker_teams bt ON b.id = bt.broker_id
LEFT JOIN teams t ON bt.team_id = t.team_id
LEFT JOIN users u ON u.team_id = t.team_id
LEFT JOIN broker_users bu ON bu.broker_id = b.id AND bu.user_id = u.id
ORDER BY b.name, t.name, u.email;

-- Check data isolation
SELECT
  'escrows' as table_name, broker_id, COUNT(*) as count
FROM escrows GROUP BY broker_id
UNION ALL
SELECT
  'listings', broker_id, COUNT(*)
FROM listings GROUP BY broker_id
UNION ALL
SELECT
  'clients', broker_id, COUNT(*)
FROM clients GROUP BY broker_id;
*/
