/**
 * Migration 047: Status System Tables
 *
 * Creates database tables for flexible, user-customizable status system
 * Replaces hardcoded status values with database-driven configuration
 *
 * Features:
 * - Team-specific status customization
 * - Status categories (for tab grouping)
 * - Valid state transitions
 * - Status colors and icons for UI
 * - Audit trail for status changes
 */

-- ============================================================================
-- STATUS DEFINITIONS
-- ============================================================================

/**
 * Core status definitions
 * Each team can create custom statuses for each entity type
 */
CREATE TABLE IF NOT EXISTS statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,

  -- Entity relationship
  entity_type VARCHAR(50) NOT NULL, -- escrows, listings, clients, leads, appointments

  -- Status details
  status_key VARCHAR(50) NOT NULL, -- Technical key: active, closed, etc.
  label VARCHAR(100) NOT NULL, -- Display name: "Active", "Under Contract"
  description TEXT,

  -- Visual properties
  color VARCHAR(7) DEFAULT '#gray', -- Hex color for status chip
  icon VARCHAR(50), -- MUI icon name

  -- Behavior
  is_default BOOLEAN DEFAULT false, -- Default status for new records
  is_final BOOLEAN DEFAULT false, -- Terminal state (can't transition out)
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique status keys per entity per team
  CONSTRAINT unique_status_per_team_entity UNIQUE (team_id, entity_type, status_key)
);

-- Index for fast lookups
CREATE INDEX idx_statuses_team_entity ON statuses(team_id, entity_type);
CREATE INDEX idx_statuses_entity_key ON statuses(entity_type, status_key);

-- ============================================================================
-- STATUS CATEGORIES (For Tab Grouping)
-- ============================================================================

/**
 * Categories group statuses into tabs (Active, Closed, Cancelled, All)
 */
CREATE TABLE IF NOT EXISTS status_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,

  -- Category details
  entity_type VARCHAR(50) NOT NULL,
  category_key VARCHAR(50) NOT NULL, -- active, closed, cancelled, all
  label VARCHAR(100) NOT NULL, -- "Active Escrows", "Closed Listings"
  description TEXT,

  -- Visual
  preferred_view_mode VARCHAR(20) DEFAULT 'card', -- card, list, calendar
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_category_per_team_entity UNIQUE (team_id, entity_type, category_key)
);

CREATE INDEX idx_status_categories_team_entity ON status_categories(team_id, entity_type);

-- ============================================================================
-- STATUS CATEGORY MAPPINGS
-- ============================================================================

/**
 * Maps statuses to categories (many-to-many)
 * Example: "Active" status belongs to "Active" category and "All" category
 */
CREATE TABLE IF NOT EXISTS status_category_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  status_id UUID REFERENCES statuses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES status_categories(id) ON DELETE CASCADE,

  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_status_category_mapping UNIQUE (status_id, category_id)
);

CREATE INDEX idx_status_category_mappings_status ON status_category_mappings(status_id);
CREATE INDEX idx_status_category_mappings_category ON status_category_mappings(category_id);

-- ============================================================================
-- STATUS TRANSITIONS (Workflow Validation)
-- ============================================================================

/**
 * Defines valid status transitions
 * Example: Can go from "Active" → "Closed" but NOT from "Closed" → "Active"
 */
CREATE TABLE IF NOT EXISTS status_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  from_status_id UUID REFERENCES statuses(id) ON DELETE CASCADE,
  to_status_id UUID REFERENCES statuses(id) ON DELETE CASCADE,

  -- Validation rules
  requires_reason BOOLEAN DEFAULT false, -- Must provide reason for transition
  allowed_roles TEXT[], -- Only certain roles can make this transition

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_status_transition UNIQUE (from_status_id, to_status_id)
);

CREATE INDEX idx_status_transitions_from ON status_transitions(from_status_id);
CREATE INDEX idx_status_transitions_to ON status_transitions(to_status_id);

-- ============================================================================
-- STATUS CHANGE AUDIT LOG
-- ============================================================================

/**
 * Tracks every status change for compliance and analytics
 */
CREATE TABLE IF NOT EXISTS status_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What changed
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL, -- ID of escrow/listing/client/etc.

  -- Status change
  from_status_id UUID REFERENCES statuses(id) ON DELETE SET NULL,
  to_status_id UUID REFERENCES statuses(id) ON DELETE SET NULL,

  -- Context
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT, -- Optional reason for change

  -- Metadata
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_status_change_log_entity ON status_change_log(entity_type, entity_id);
CREATE INDEX idx_status_change_log_changed_at ON status_change_log(changed_at);
CREATE INDEX idx_status_change_log_user ON status_change_log(changed_by);

-- ============================================================================
-- SEED DEFAULT STATUSES FOR ESCROWS (Example)
-- ============================================================================

/**
 * Insert default statuses for a "system" team
 * Real teams will clone these or create their own
 */

-- First, ensure we have a system team for defaults
INSERT INTO teams (team_id, name, subdomain)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'System Defaults',
  'system-defaults'
) ON CONFLICT (team_id) DO NOTHING;

-- Escrow Statuses
INSERT INTO statuses (team_id, entity_type, status_key, label, color, is_default, is_final, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'Active', 'Active', '#10b981', true, false, 1),
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'Closed', 'Closed', '#3b82f6', false, true, 2),
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'Cancelled', 'Cancelled', '#ef4444', false, true, 3)
ON CONFLICT (team_id, entity_type, status_key) DO NOTHING;

-- Listing Statuses
INSERT INTO statuses (team_id, entity_type, status_key, label, color, is_default, is_final, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'listings', 'Active', 'Active', '#10b981', true, false, 1),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'ActiveUnderContract', 'Active Under Contract', '#f59e0b', false, false, 2),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'Pending', 'Pending', '#8b5cf6', false, false, 3),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'Closed', 'Closed', '#3b82f6', false, true, 4),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'Cancelled', 'Cancelled', '#ef4444', false, true, 5),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'Expired', 'Expired', '#6b7280', false, true, 6),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'Withdrawn', 'Withdrawn', '#6b7280', false, true, 7)
ON CONFLICT (team_id, entity_type, status_key) DO NOTHING;

-- Escrow Categories
INSERT INTO status_categories (team_id, entity_type, category_key, label, preferred_view_mode, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'Active', 'Active', 'card', 1),
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'Closed', 'Closed', 'list', 2),
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'Cancelled', 'Cancelled', 'list', 3),
  ('00000000-0000-0000-0000-000000000000', 'escrows', 'All', 'All Escrows', 'card', 4)
ON CONFLICT (team_id, entity_type, category_key) DO NOTHING;

-- Listing Categories
INSERT INTO status_categories (team_id, entity_type, category_key, label, preferred_view_mode, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'listings', 'Active', 'Active', 'card', 1),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'Closed', 'Closed', 'list', 2),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'Cancelled', 'Cancelled', 'list', 3),
  ('00000000-0000-0000-0000-000000000000', 'listings', 'All', 'All Listings', 'card', 4)
ON CONFLICT (team_id, entity_type, category_key) DO NOTHING;

-- Map Escrow Statuses to Categories
WITH
  active_status AS (SELECT id FROM statuses WHERE entity_type = 'escrows' AND status_key = 'Active'),
  closed_status AS (SELECT id FROM statuses WHERE entity_type = 'escrows' AND status_key = 'Closed'),
  cancelled_status AS (SELECT id FROM statuses WHERE entity_type = 'escrows' AND status_key = 'Cancelled'),
  active_cat AS (SELECT id FROM status_categories WHERE entity_type = 'escrows' AND category_key = 'Active'),
  closed_cat AS (SELECT id FROM status_categories WHERE entity_type = 'escrows' AND category_key = 'Closed'),
  cancelled_cat AS (SELECT id FROM status_categories WHERE entity_type = 'escrows' AND category_key = 'Cancelled'),
  all_cat AS (SELECT id FROM status_categories WHERE entity_type = 'escrows' AND category_key = 'All')
INSERT INTO status_category_mappings (status_id, category_id, sort_order)
SELECT * FROM (
  -- Active status → Active category + All category
  SELECT (SELECT id FROM active_status), (SELECT id FROM active_cat), 1
  UNION ALL
  SELECT (SELECT id FROM active_status), (SELECT id FROM all_cat), 1
  UNION ALL
  -- Closed status → Closed category + All category
  SELECT (SELECT id FROM closed_status), (SELECT id FROM closed_cat), 1
  UNION ALL
  SELECT (SELECT id FROM closed_status), (SELECT id FROM all_cat), 2
  UNION ALL
  -- Cancelled status → Cancelled category + All category
  SELECT (SELECT id FROM cancelled_status), (SELECT id FROM cancelled_cat), 1
  UNION ALL
  SELECT (SELECT id FROM cancelled_status), (SELECT id FROM all_cat), 3
) AS mappings
ON CONFLICT (status_id, category_id) DO NOTHING;

-- Map Listing Statuses to Categories
WITH
  active_status AS (SELECT id FROM statuses WHERE entity_type = 'listings' AND status_key = 'Active'),
  auc_status AS (SELECT id FROM statuses WHERE entity_type = 'listings' AND status_key = 'ActiveUnderContract'),
  pending_status AS (SELECT id FROM statuses WHERE entity_type = 'listings' AND status_key = 'Pending'),
  closed_status AS (SELECT id FROM statuses WHERE entity_type = 'listings' AND status_key = 'Closed'),
  cancelled_status AS (SELECT id FROM statuses WHERE entity_type = 'listings' AND status_key = 'Cancelled'),
  expired_status AS (SELECT id FROM statuses WHERE entity_type = 'listings' AND status_key = 'Expired'),
  withdrawn_status AS (SELECT id FROM statuses WHERE entity_type = 'listings' AND status_key = 'Withdrawn'),
  active_cat AS (SELECT id FROM status_categories WHERE entity_type = 'listings' AND category_key = 'Active'),
  closed_cat AS (SELECT id FROM status_categories WHERE entity_type = 'listings' AND category_key = 'Closed'),
  cancelled_cat AS (SELECT id FROM status_categories WHERE entity_type = 'listings' AND category_key = 'Cancelled'),
  all_cat AS (SELECT id FROM status_categories WHERE entity_type = 'listings' AND category_key = 'All')
INSERT INTO status_category_mappings (status_id, category_id, sort_order)
SELECT * FROM (
  -- Active category: Active, ActiveUnderContract, Pending
  SELECT (SELECT id FROM active_status), (SELECT id FROM active_cat), 1
  UNION ALL
  SELECT (SELECT id FROM auc_status), (SELECT id FROM active_cat), 2
  UNION ALL
  SELECT (SELECT id FROM pending_status), (SELECT id FROM active_cat), 3
  UNION ALL
  -- Closed category: Closed
  SELECT (SELECT id FROM closed_status), (SELECT id FROM closed_cat), 1
  UNION ALL
  -- Cancelled category: Cancelled, Expired, Withdrawn
  SELECT (SELECT id FROM cancelled_status), (SELECT id FROM cancelled_cat), 1
  UNION ALL
  SELECT (SELECT id FROM expired_status), (SELECT id FROM cancelled_cat), 2
  UNION ALL
  SELECT (SELECT id FROM withdrawn_status), (SELECT id FROM cancelled_cat), 3
  UNION ALL
  -- All category: Everything
  SELECT (SELECT id FROM active_status), (SELECT id FROM all_cat), 1
  UNION ALL
  SELECT (SELECT id FROM auc_status), (SELECT id FROM all_cat), 2
  UNION ALL
  SELECT (SELECT id FROM pending_status), (SELECT id FROM all_cat), 3
  UNION ALL
  SELECT (SELECT id FROM closed_status), (SELECT id FROM all_cat), 4
  UNION ALL
  SELECT (SELECT id FROM cancelled_status), (SELECT id FROM all_cat), 5
  UNION ALL
  SELECT (SELECT id FROM expired_status), (SELECT id FROM all_cat), 6
  UNION ALL
  SELECT (SELECT id FROM withdrawn_status), (SELECT id FROM all_cat), 7
) AS mappings
ON CONFLICT (status_id, category_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE statuses IS 'User-customizable status definitions for all entity types';
COMMENT ON TABLE status_categories IS 'Categories group statuses into tabs (Active, Closed, etc.)';
COMMENT ON TABLE status_category_mappings IS 'Many-to-many mapping between statuses and categories';
COMMENT ON TABLE status_transitions IS 'Valid state transitions for workflow validation';
COMMENT ON TABLE status_change_log IS 'Audit trail of all status changes';
