/**
 * Migration 048: Status System Refactor
 *
 * Implements universal status architecture with:
 * - 3 immutable category keys: active, won, lost
 * - Stable status keys in lowercase_snake_case
 * - Customizable labels for user-facing display
 *
 * Changes:
 * 1. Update status_categories to use only active/won/lost (remove All, Cancelled)
 * 2. Update all status_key values to lowercase_snake_case
 * 3. Add Leads statuses (10 total)
 * 4. Add Appointments statuses (6 total)
 * 5. Update existing entity statuses to new format
 */

-- ============================================================================
-- PHASE 1: Update Status Categories to Universal Keys
-- ============================================================================

-- First, let's see what categories exist and clean them up
-- We need only: active, won, lost (per entity type)
-- "All" will be computed dynamically in the API

-- Update category_key values to lowercase
UPDATE status_categories SET category_key = 'active' WHERE LOWER(category_key) = 'active';
UPDATE status_categories SET category_key = 'won' WHERE LOWER(category_key) = 'closed';
UPDATE status_categories SET category_key = 'lost' WHERE LOWER(category_key) IN ('cancelled', 'lost');

-- Remove "All" categories (will be computed dynamically)
DELETE FROM status_category_mappings
WHERE category_id IN (SELECT id FROM status_categories WHERE LOWER(category_key) = 'all');

DELETE FROM status_categories WHERE LOWER(category_key) = 'all';

-- ============================================================================
-- PHASE 2: Create Universal Categories for Each Entity
-- ============================================================================

-- System team for defaults
INSERT INTO teams (team_id, name, subdomain)
VALUES ('00000000-0000-0000-0000-000000000000', 'System Defaults', 'system-defaults')
ON CONFLICT (team_id) DO NOTHING;

-- Create categories for all 5 entity types with universal keys

-- ESCROWS Categories
INSERT INTO status_categories (team_id, entity_type, category_key, label, preferred_view_mode, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'active', 'Active', 'card', 1),
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'won', 'Closed', 'list', 2),
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'lost', 'Cancelled', 'list', 3)
ON CONFLICT (team_id, entity_type, category_key) DO UPDATE SET
  label = EXCLUDED.label,
  preferred_view_mode = EXCLUDED.preferred_view_mode,
  sort_order = EXCLUDED.sort_order;

-- LISTINGS Categories
INSERT INTO status_categories (team_id, entity_type, category_key, label, preferred_view_mode, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'listings', 'active', 'Active', 'card', 1),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'won', 'Closed', 'list', 2),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'lost', 'Inactive', 'list', 3)
ON CONFLICT (team_id, entity_type, category_key) DO UPDATE SET
  label = EXCLUDED.label,
  preferred_view_mode = EXCLUDED.preferred_view_mode,
  sort_order = EXCLUDED.sort_order;

-- CLIENTS Categories
INSERT INTO status_categories (team_id, entity_type, category_key, label, preferred_view_mode, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'clients', 'active', 'Active', 'card', 1),
  ('00000000-0000-0000-0000-000000000000', 'clients', 'won', 'Closed', 'list', 2),
  ('00000000-0000-0000-0000-000000000000', 'clients', 'lost', 'Inactive', 'list', 3)
ON CONFLICT (team_id, entity_type, category_key) DO UPDATE SET
  label = EXCLUDED.label,
  preferred_view_mode = EXCLUDED.preferred_view_mode,
  sort_order = EXCLUDED.sort_order;

-- LEADS Categories
INSERT INTO status_categories (team_id, entity_type, category_key, label, preferred_view_mode, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'leads', 'active', 'Active', 'card', 1),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'won', 'Won', 'list', 2),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'lost', 'Lost', 'list', 3)
ON CONFLICT (team_id, entity_type, category_key) DO UPDATE SET
  label = EXCLUDED.label,
  preferred_view_mode = EXCLUDED.preferred_view_mode,
  sort_order = EXCLUDED.sort_order;

-- APPOINTMENTS Categories
INSERT INTO status_categories (team_id, entity_type, category_key, label, preferred_view_mode, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'appointments', 'active', 'Upcoming', 'calendar', 1),
  ('00000000-0000-0000-0000-000000000000', 'appointments', 'won', 'Completed', 'list', 2),
  ('00000000-0000-0000-0000-000000000000', 'appointments', 'lost', 'Cancelled', 'list', 3)
ON CONFLICT (team_id, entity_type, category_key) DO UPDATE SET
  label = EXCLUDED.label,
  preferred_view_mode = EXCLUDED.preferred_view_mode,
  sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- PHASE 3: Add category_id Column to Statuses Table
-- ============================================================================

-- Add category_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'statuses' AND column_name = 'category_id') THEN
    ALTER TABLE statuses ADD COLUMN category_id UUID REFERENCES status_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- PHASE 4: Update Existing Statuses to lowercase_snake_case
-- ============================================================================

-- ESCROWS: Update status_key values
UPDATE statuses SET status_key = 'active', label = 'Active' WHERE entity_type = 'escrows' AND LOWER(status_key) = 'active';
UPDATE statuses SET status_key = 'closed', label = 'Closed' WHERE entity_type = 'escrows' AND LOWER(status_key) = 'closed';
UPDATE statuses SET status_key = 'cancelled', label = 'Cancelled' WHERE entity_type = 'escrows' AND LOWER(status_key) = 'cancelled';

-- LISTINGS: Update status_key values
UPDATE statuses SET status_key = 'active', label = 'Active' WHERE entity_type = 'listings' AND LOWER(status_key) = 'active' AND LOWER(status_key) != 'activeundercontract';
UPDATE statuses SET status_key = 'active_under_contract', label = 'Active Under Contract' WHERE entity_type = 'listings' AND LOWER(status_key) = 'activeundercontract';
UPDATE statuses SET status_key = 'pending', label = 'Pending' WHERE entity_type = 'listings' AND LOWER(status_key) = 'pending';
UPDATE statuses SET status_key = 'closed', label = 'Closed' WHERE entity_type = 'listings' AND LOWER(status_key) = 'closed';
UPDATE statuses SET status_key = 'expired', label = 'Expired' WHERE entity_type = 'listings' AND LOWER(status_key) = 'expired';
UPDATE statuses SET status_key = 'withdrawn', label = 'Withdrawn' WHERE entity_type = 'listings' AND LOWER(status_key) = 'withdrawn';
UPDATE statuses SET status_key = 'cancelled', label = 'Cancelled' WHERE entity_type = 'listings' AND LOWER(status_key) = 'cancelled';

-- CLIENTS: Update status_key values
UPDATE statuses SET status_key = 'active', label = 'Active' WHERE entity_type = 'clients' AND LOWER(status_key) = 'active';
UPDATE statuses SET status_key = 'closed', label = 'Closed' WHERE entity_type = 'clients' AND LOWER(status_key) = 'closed';
UPDATE statuses SET status_key = 'expired', label = 'Expired' WHERE entity_type = 'clients' AND LOWER(status_key) = 'expired';
UPDATE statuses SET status_key = 'cancelled', label = 'Cancelled' WHERE entity_type = 'clients' AND LOWER(status_key) = 'cancelled';

-- ============================================================================
-- PHASE 5: Insert/Update All Statuses with Correct Category IDs
-- ============================================================================

-- Helper function to get category_id
CREATE OR REPLACE FUNCTION get_category_id(p_entity_type TEXT, p_category_key TEXT)
RETURNS UUID AS $$
DECLARE
  v_category_id UUID;
BEGIN
  SELECT id INTO v_category_id
  FROM status_categories
  WHERE entity_type = p_entity_type
    AND category_key = p_category_key
    AND team_id = '00000000-0000-0000-0000-000000000000'
  LIMIT 1;
  RETURN v_category_id;
END;
$$ LANGUAGE plpgsql;

-- ESCROWS Statuses (3 total)
INSERT INTO statuses (team_id, entity_type, status_key, label, color, is_default, is_final, sort_order, category_id)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'active', 'Active', '#10b981', true, false, 1, get_category_id('escrows', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'closed', 'Closed', '#3b82f6', false, true, 2, get_category_id('escrows', 'won')),
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'cancelled', 'Cancelled', '#ef4444', false, true, 3, get_category_id('escrows', 'lost'))
ON CONFLICT (team_id, entity_type, status_key) DO UPDATE SET
  label = EXCLUDED.label,
  color = EXCLUDED.color,
  is_default = EXCLUDED.is_default,
  is_final = EXCLUDED.is_final,
  sort_order = EXCLUDED.sort_order,
  category_id = EXCLUDED.category_id;

-- LISTINGS Statuses (7 total)
INSERT INTO statuses (team_id, entity_type, status_key, label, color, is_default, is_final, sort_order, category_id)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'listings', 'active', 'Active', '#10b981', true, false, 1, get_category_id('listings', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'active_under_contract', 'Active Under Contract', '#f59e0b', false, false, 2, get_category_id('listings', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'pending', 'Pending', '#8b5cf6', false, false, 3, get_category_id('listings', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'closed', 'Closed', '#3b82f6', false, true, 4, get_category_id('listings', 'won')),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'expired', 'Expired', '#6b7280', false, true, 5, get_category_id('listings', 'lost')),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'withdrawn', 'Withdrawn', '#64748b', false, true, 6, get_category_id('listings', 'lost')),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'cancelled', 'Cancelled', '#ef4444', false, true, 7, get_category_id('listings', 'lost'))
ON CONFLICT (team_id, entity_type, status_key) DO UPDATE SET
  label = EXCLUDED.label,
  color = EXCLUDED.color,
  is_default = EXCLUDED.is_default,
  is_final = EXCLUDED.is_final,
  sort_order = EXCLUDED.sort_order,
  category_id = EXCLUDED.category_id;

-- CLIENTS Statuses (4 total)
INSERT INTO statuses (team_id, entity_type, status_key, label, color, is_default, is_final, sort_order, category_id)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'clients', 'active', 'Active', '#10b981', true, false, 1, get_category_id('clients', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'clients', 'closed', 'Closed', '#3b82f6', false, true, 2, get_category_id('clients', 'won')),
  ('00000000-0000-0000-0000-000000000000', 'clients', 'expired', 'Expired', '#6b7280', false, true, 3, get_category_id('clients', 'lost')),
  ('00000000-0000-0000-0000-000000000000', 'clients', 'cancelled', 'Cancelled', '#ef4444', false, true, 4, get_category_id('clients', 'lost'))
ON CONFLICT (team_id, entity_type, status_key) DO UPDATE SET
  label = EXCLUDED.label,
  color = EXCLUDED.color,
  is_default = EXCLUDED.is_default,
  is_final = EXCLUDED.is_final,
  sort_order = EXCLUDED.sort_order,
  category_id = EXCLUDED.category_id;

-- LEADS Statuses (10 total) - NEW
INSERT INTO statuses (team_id, entity_type, status_key, label, color, is_default, is_final, sort_order, category_id)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'leads', 'new', 'New', '#3b82f6', true, false, 1, get_category_id('leads', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'contacted', 'Contacted', '#8b5cf6', false, false, 2, get_category_id('leads', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'met', 'Met', '#f59e0b', false, false, 3, get_category_id('leads', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'under_contract', 'Under Contract', '#10b981', false, false, 4, get_category_id('leads', 'won')),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'closed', 'Closed', '#059669', false, true, 5, get_category_id('leads', 'won')),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'competing', 'Competing', '#ef4444', false, false, 6, get_category_id('leads', 'lost')),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'rejected', 'Rejected', '#dc2626', false, true, 7, get_category_id('leads', 'lost')),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'unresponsive', 'Unresponsive', '#6b7280', false, true, 8, get_category_id('leads', 'lost')),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'deferred', 'Deferred', '#f59e0b', false, false, 9, get_category_id('leads', 'lost')),
  ('00000000-0000-0000-0000-000000000000', 'leads', 'unqualified', 'Unqualified', '#9ca3af', false, true, 10, get_category_id('leads', 'lost'))
ON CONFLICT (team_id, entity_type, status_key) DO UPDATE SET
  label = EXCLUDED.label,
  color = EXCLUDED.color,
  is_default = EXCLUDED.is_default,
  is_final = EXCLUDED.is_final,
  sort_order = EXCLUDED.sort_order,
  category_id = EXCLUDED.category_id;

-- APPOINTMENTS Statuses (6 total) - NEW
INSERT INTO statuses (team_id, entity_type, status_key, label, color, is_default, is_final, sort_order, category_id)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'appointments', 'scheduled', 'Scheduled', '#3b82f6', true, false, 1, get_category_id('appointments', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'appointments', 'confirmed', 'Confirmed', '#10b981', false, false, 2, get_category_id('appointments', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'appointments', 'rescheduled', 'Rescheduled', '#8b5cf6', false, false, 3, get_category_id('appointments', 'active')),
  ('00000000-0000-0000-0000-000000000000', 'appointments', 'completed', 'Completed', '#6366f1', false, true, 4, get_category_id('appointments', 'won')),
  ('00000000-0000-0000-0000-000000000000', 'appointments', 'cancelled', 'Cancelled', '#ef4444', false, true, 5, get_category_id('appointments', 'lost')),
  ('00000000-0000-0000-0000-000000000000', 'appointments', 'no_show', 'No-Show', '#dc2626', false, true, 6, get_category_id('appointments', 'lost'))
ON CONFLICT (team_id, entity_type, status_key) DO UPDATE SET
  label = EXCLUDED.label,
  color = EXCLUDED.color,
  is_default = EXCLUDED.is_default,
  is_final = EXCLUDED.is_final,
  sort_order = EXCLUDED.sort_order,
  category_id = EXCLUDED.category_id;

-- ============================================================================
-- PHASE 6: Update Entity Records to Use New Status Keys
-- ============================================================================

-- Update escrows table
UPDATE escrows SET escrow_status = 'active' WHERE LOWER(escrow_status) = 'active';
UPDATE escrows SET escrow_status = 'closed' WHERE LOWER(escrow_status) = 'closed';
UPDATE escrows SET escrow_status = 'cancelled' WHERE LOWER(escrow_status) = 'cancelled';

-- Update listings table
UPDATE listings SET listing_status = 'active' WHERE LOWER(listing_status) = 'active' AND LOWER(listing_status) != 'activeundercontract';
UPDATE listings SET listing_status = 'active_under_contract' WHERE LOWER(listing_status) = 'activeundercontract';
UPDATE listings SET listing_status = 'pending' WHERE LOWER(listing_status) = 'pending';
UPDATE listings SET listing_status = 'closed' WHERE LOWER(listing_status) = 'closed';
UPDATE listings SET listing_status = 'expired' WHERE LOWER(listing_status) = 'expired';
UPDATE listings SET listing_status = 'withdrawn' WHERE LOWER(listing_status) = 'withdrawn';
UPDATE listings SET listing_status = 'cancelled' WHERE LOWER(listing_status) = 'cancelled';

-- Update clients table
UPDATE clients SET client_status = 'active' WHERE LOWER(client_status) = 'active';
UPDATE clients SET client_status = 'closed' WHERE LOWER(client_status) = 'closed';
UPDATE clients SET client_status = 'expired' WHERE LOWER(client_status) = 'expired';
UPDATE clients SET client_status = 'cancelled' WHERE LOWER(client_status) = 'cancelled';

-- Update leads table
UPDATE leads SET status = 'new' WHERE LOWER(status) = 'new';
UPDATE leads SET status = 'contacted' WHERE LOWER(status) = 'contacted';
UPDATE leads SET status = 'met' WHERE LOWER(status) = 'met';
UPDATE leads SET status = 'under_contract' WHERE LOWER(status) IN ('under_contract', 'undercontract');
UPDATE leads SET status = 'closed' WHERE LOWER(status) = 'closed';
UPDATE leads SET status = 'competing' WHERE LOWER(status) = 'competing';
UPDATE leads SET status = 'rejected' WHERE LOWER(status) = 'rejected';
UPDATE leads SET status = 'unresponsive' WHERE LOWER(status) = 'unresponsive';
UPDATE leads SET status = 'deferred' WHERE LOWER(status) = 'deferred';
UPDATE leads SET status = 'unqualified' WHERE LOWER(status) = 'unqualified';

-- Update appointments table
UPDATE appointments SET status = 'scheduled' WHERE LOWER(status) = 'scheduled';
UPDATE appointments SET status = 'confirmed' WHERE LOWER(status) = 'confirmed';
UPDATE appointments SET status = 'rescheduled' WHERE LOWER(status) = 'rescheduled';
UPDATE appointments SET status = 'completed' WHERE LOWER(status) = 'completed';
UPDATE appointments SET status = 'cancelled' WHERE LOWER(status) = 'cancelled';
UPDATE appointments SET status = 'no_show' WHERE LOWER(status) IN ('no_show', 'noshow', 'no-show');

-- ============================================================================
-- PHASE 7: Clean Up - Drop Helper Function
-- ============================================================================

DROP FUNCTION IF EXISTS get_category_id(TEXT, TEXT);

-- ============================================================================
-- VERIFICATION QUERIES (for manual testing)
-- ============================================================================

-- Verify categories exist for all entity types:
-- SELECT entity_type, category_key, label FROM status_categories ORDER BY entity_type, sort_order;

-- Verify statuses exist with category_id:
-- SELECT entity_type, status_key, label, color, category_id FROM statuses ORDER BY entity_type, sort_order;

-- Count statuses per entity:
-- SELECT entity_type, COUNT(*) FROM statuses GROUP BY entity_type;

-- Expected results:
-- escrows: 3 statuses, 3 categories
-- listings: 7 statuses, 3 categories
-- clients: 4 statuses, 3 categories
-- leads: 10 statuses, 3 categories
-- appointments: 6 statuses, 3 categories

COMMENT ON TABLE statuses IS 'Universal status system with lowercase_snake_case keys. Categories: active, won, lost.';
