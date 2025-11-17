/**
 * Migration 014: Add ownership columns to clients, leads, listings, appointments
 * Date: October 22, 2025
 * Purpose: Phase 6 - Complete data ownership layer across all core entities
 *
 * Adds ownership and privacy columns to 4 remaining tables:
 * - clients: owner_id, is_private, access_level
 * - leads: owner_id, is_private, access_level
 * - listings: owner_id, is_private, access_level
 * - appointments: is_private, access_level (already has owner_id from migration 011)
 */

-- ============================================
-- CLIENTS TABLE
-- ============================================

-- Add ownership columns
ALTER TABLE clients ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'team';

-- Add CHECK constraint
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_access_level_check;
ALTER TABLE clients ADD CONSTRAINT clients_access_level_check
  CHECK (access_level IN ('personal', 'team', 'broker'));

-- Populate owner_id from created_by (or agent_id as fallback)
UPDATE clients
SET owner_id = COALESCE(created_by, agent_id)
WHERE owner_id IS NULL;

-- If still NULL, assign to admin user
UPDATE clients
SET owner_id = (SELECT id FROM users WHERE email = 'admin@jaydenmetz.com' LIMIT 1)
WHERE owner_id IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_owner_id ON clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_is_private ON clients(is_private);
CREATE INDEX IF NOT EXISTS idx_clients_access_level ON clients(access_level);
CREATE INDEX IF NOT EXISTS idx_clients_owner_private_access
  ON clients(owner_id, is_private, access_level);

-- ============================================
-- LEADS TABLE
-- ============================================

-- Add ownership columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'team';

-- Add CHECK constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_access_level_check;
ALTER TABLE leads ADD CONSTRAINT leads_access_level_check
  CHECK (access_level IN ('personal', 'team', 'broker'));

-- Populate owner_id from created_by (or agent_id as fallback)
UPDATE leads
SET owner_id = COALESCE(created_by, agent_id)
WHERE owner_id IS NULL;

-- If still NULL, assign to admin user
UPDATE leads
SET owner_id = (SELECT id FROM users WHERE email = 'admin@jaydenmetz.com' LIMIT 1)
WHERE owner_id IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_is_private ON leads(is_private);
CREATE INDEX IF NOT EXISTS idx_leads_access_level ON leads(access_level);
CREATE INDEX IF NOT EXISTS idx_leads_owner_private_access
  ON leads(owner_id, is_private, access_level);

-- ============================================
-- LISTINGS TABLE
-- ============================================

-- Add ownership columns
ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'team';

-- Add CHECK constraint
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_access_level_check;
ALTER TABLE listings ADD CONSTRAINT listings_access_level_check
  CHECK (access_level IN ('personal', 'team', 'broker'));

-- Populate owner_id from created_by (or listing_agent_id as fallback)
UPDATE listings
SET owner_id = COALESCE(created_by, listing_agent_id)
WHERE owner_id IS NULL;

-- If still NULL, assign to admin user
UPDATE listings
SET owner_id = (SELECT id FROM users WHERE email = 'admin@jaydenmetz.com' LIMIT 1)
WHERE owner_id IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_is_private ON listings(is_private);
CREATE INDEX IF NOT EXISTS idx_listings_access_level ON listings(access_level);
CREATE INDEX IF NOT EXISTS idx_listings_owner_private_access
  ON listings(owner_id, is_private, access_level);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
-- Note: owner_id already exists from migration 011
-- Only adding is_private and access_level

-- Add privacy columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'team';

-- Add CHECK constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_access_level_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_access_level_check
  CHECK (access_level IN ('personal', 'team', 'broker'));

-- Create indexes (owner_id index already exists from migration 011)
CREATE INDEX IF NOT EXISTS idx_appointments_is_private ON appointments(is_private);
CREATE INDEX IF NOT EXISTS idx_appointments_access_level ON appointments(access_level);
CREATE INDEX IF NOT EXISTS idx_appointments_owner_private_access
  ON appointments(owner_id, is_private, access_level);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Clients verification
SELECT
  COUNT(*) as total_clients,
  COUNT(owner_id) as with_owner,
  COUNT(CASE WHEN is_private THEN 1 END) as private_count,
  COUNT(CASE WHEN access_level = 'personal' THEN 1 END) as personal,
  COUNT(CASE WHEN access_level = 'team' THEN 1 END) as team,
  COUNT(CASE WHEN access_level = 'broker' THEN 1 END) as broker
FROM clients;

-- Leads verification
SELECT
  COUNT(*) as total_leads,
  COUNT(owner_id) as with_owner,
  COUNT(CASE WHEN is_private THEN 1 END) as private_count,
  COUNT(CASE WHEN access_level = 'personal' THEN 1 END) as personal,
  COUNT(CASE WHEN access_level = 'team' THEN 1 END) as team,
  COUNT(CASE WHEN access_level = 'broker' THEN 1 END) as broker
FROM leads;

-- Listings verification
SELECT
  COUNT(*) as total_listings,
  COUNT(owner_id) as with_owner,
  COUNT(CASE WHEN is_private THEN 1 END) as private_count,
  COUNT(CASE WHEN access_level = 'personal' THEN 1 END) as personal,
  COUNT(CASE WHEN access_level = 'team' THEN 1 END) as team,
  COUNT(CASE WHEN access_level = 'broker' THEN 1 END) as broker
FROM listings;

-- Appointments verification
SELECT
  COUNT(*) as total_appointments,
  COUNT(owner_id) as with_owner,
  COUNT(CASE WHEN is_private THEN 1 END) as private_count,
  COUNT(CASE WHEN access_level = 'personal' THEN 1 END) as personal,
  COUNT(CASE WHEN access_level = 'team' THEN 1 END) as team,
  COUNT(CASE WHEN access_level = 'broker' THEN 1 END) as broker
FROM appointments;

-- Expected results:
-- - with_owner should equal total count for each table
-- - All records should have access_level = 'team' by default
-- - is_private should be FALSE for all records
