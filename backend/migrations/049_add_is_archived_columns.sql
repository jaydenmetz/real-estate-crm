-- Migration 049: Add archive system (is_archived boolean + archived_at timestamp)
-- This migration adds archive columns and creates auto-archive policy table
-- Goal: Long-term storage of historical records with auto-archive functionality
-- Semantics: Archive = storage (forever), Delete = permanent removal (rare)

-- ============================================================================
-- Add is_archived boolean columns to all tables (default false)
-- ============================================================================

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE checklist_templates ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;

-- ============================================================================
-- Add archived_at timestamp columns (tracks when archived for year filtering)
-- ============================================================================

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE checklist_templates ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- Create auto_archive_policy table (broker/team-level settings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS auto_archive_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES users(id) ON DELETE CASCADE, -- For broker-level accounts
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE, -- For team-based accounts
  entity_type VARCHAR(50) NOT NULL, -- 'escrows', 'listings', 'clients', 'leads', 'appointments', etc.
  policy VARCHAR(20) NOT NULL DEFAULT 'off', -- 'off', 'monthly', 'yearly', '2-years'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_broker_or_team CHECK (
    (broker_id IS NOT NULL AND team_id IS NULL) OR
    (broker_id IS NULL AND team_id IS NOT NULL)
  ),
  UNIQUE(broker_id, entity_type),
  UNIQUE(team_id, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_auto_archive_policy_broker ON auto_archive_policy(broker_id, entity_type) WHERE broker_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_auto_archive_policy_team ON auto_archive_policy(team_id, entity_type) WHERE team_id IS NOT NULL;

COMMENT ON TABLE auto_archive_policy IS 'Broker/team-level auto-archive settings for each entity type';
COMMENT ON COLUMN auto_archive_policy.broker_id IS 'Set for broker-level accounts (mutually exclusive with team_id)';
COMMENT ON COLUMN auto_archive_policy.team_id IS 'Set for team-based accounts (mutually exclusive with broker_id)';
COMMENT ON COLUMN auto_archive_policy.policy IS 'Archive frequency: off (disabled), monthly (12mo old), yearly (Dec 31), 2-years (24mo old)';

-- ============================================================================
-- Migrate existing deleted_at data to is_archived + archived_at
-- ============================================================================

-- Set is_archived = true and archived_at = deleted_at for all soft-deleted rows
UPDATE appointments SET is_archived = true, archived_at = deleted_at WHERE deleted_at IS NOT NULL;
UPDATE checklist_templates SET is_archived = true, archived_at = deleted_at WHERE deleted_at IS NOT NULL;
UPDATE checklists SET is_archived = true, archived_at = deleted_at WHERE deleted_at IS NOT NULL;
UPDATE contacts SET is_archived = true, archived_at = deleted_at WHERE deleted_at IS NOT NULL;
UPDATE escrows SET is_archived = true, archived_at = deleted_at WHERE deleted_at IS NOT NULL;
UPDATE leads SET is_archived = true, archived_at = deleted_at WHERE deleted_at IS NOT NULL;
UPDATE listings SET is_archived = true, archived_at = deleted_at WHERE deleted_at IS NOT NULL;
UPDATE projects SET is_archived = true, archived_at = deleted_at WHERE deleted_at IS NOT NULL;
UPDATE task_comments SET is_archived = true, archived_at = deleted_at WHERE deleted_at IS NOT NULL;
UPDATE tasks SET is_archived = true, archived_at = deleted_at WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- Add indexes for efficient archive filtering
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_appointments_is_archived ON appointments(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_checklist_templates_is_archived ON checklist_templates(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_checklists_is_archived ON checklists(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_contacts_is_archived ON contacts(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_escrows_is_archived ON escrows(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_leads_is_archived ON leads(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_listings_is_archived ON listings(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_projects_is_archived ON projects(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_task_comments_is_archived ON task_comments(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_tasks_is_archived ON tasks(is_archived) WHERE is_archived = false;

-- ============================================================================
-- Archive System Semantics (IMPORTANT)
-- ============================================================================
-- Archive = Long-term storage for historical records (infinite retention)
--   - Auto-archived based on team/broker policy (yearly/monthly/2-years)
--   - Manual archive available case-by-case
--   - Accessible via Archive tab with year selector (2025, 2024, 2023, etc.)
--   - Stored forever unless manually deleted
--
-- Delete = Permanent removal (rare operation, requires explicit user action)
--   - deleted_at column kept for true permanent deletion only
--   - NOT used for archive logic anymore
--
-- Query Patterns:
--   Active items: WHERE is_archived = false
--   Archive view: WHERE is_archived = true AND EXTRACT(YEAR FROM archived_at) = 2024
--   All items: No filter (includes both active and archived)
-- ============================================================================

-- Add comments to document the new semantics
COMMENT ON COLUMN appointments.is_archived IS 'Archive status - true = long-term storage, false = active (NOT deletion)';
COMMENT ON COLUMN checklist_templates.is_archived IS 'Archive status - true = long-term storage, false = active (NOT deletion)';
COMMENT ON COLUMN checklists.is_archived IS 'Archive status - true = long-term storage, false = active (NOT deletion)';
COMMENT ON COLUMN contacts.is_archived IS 'Archive status - true = long-term storage, false = active (NOT deletion)';
COMMENT ON COLUMN escrows.is_archived IS 'Archive status - true = long-term storage, false = active (NOT deletion)';
COMMENT ON COLUMN leads.is_archived IS 'Archive status - true = long-term storage, false = active (NOT deletion)';
COMMENT ON COLUMN listings.is_archived IS 'Archive status - true = long-term storage, false = active (NOT deletion)';
COMMENT ON COLUMN projects.is_archived IS 'Archive status - true = long-term storage, false = active (NOT deletion)';
COMMENT ON COLUMN task_comments.is_archived IS 'Archive status - true = long-term storage, false = active (NOT deletion)';
COMMENT ON COLUMN tasks.is_archived IS 'Archive status - true = long-term storage, false = active (NOT deletion)';

COMMENT ON COLUMN appointments.archived_at IS 'When archived (for year-based filtering in Archive view)';
COMMENT ON COLUMN checklist_templates.archived_at IS 'When archived (for year-based filtering in Archive view)';
COMMENT ON COLUMN checklists.archived_at IS 'When archived (for year-based filtering in Archive view)';
COMMENT ON COLUMN contacts.archived_at IS 'When archived (for year-based filtering in Archive view)';
COMMENT ON COLUMN escrows.archived_at IS 'When archived (for year-based filtering in Archive view)';
COMMENT ON COLUMN leads.archived_at IS 'When archived (for year-based filtering in Archive view)';
COMMENT ON COLUMN listings.archived_at IS 'When archived (for year-based filtering in Archive view)';
COMMENT ON COLUMN projects.archived_at IS 'When archived (for year-based filtering in Archive view)';
COMMENT ON COLUMN task_comments.archived_at IS 'When archived (for year-based filtering in Archive view)';
COMMENT ON COLUMN tasks.archived_at IS 'When archived (for year-based filtering in Archive view)';

COMMENT ON COLUMN appointments.deleted_at IS 'DEPRECATED: Only for true permanent deletion (extremely rare). Use is_archived for archive logic.';
COMMENT ON COLUMN checklist_templates.deleted_at IS 'DEPRECATED: Only for true permanent deletion (extremely rare). Use is_archived for archive logic.';
COMMENT ON COLUMN checklists.deleted_at IS 'DEPRECATED: Only for true permanent deletion (extremely rare). Use is_archived for archive logic.';
COMMENT ON COLUMN contacts.deleted_at IS 'DEPRECATED: Only for true permanent deletion (extremely rare). Use is_archived for archive logic.';
COMMENT ON COLUMN escrows.deleted_at IS 'DEPRECATED: Only for true permanent deletion (extremely rare). Use is_archived for archive logic.';
COMMENT ON COLUMN leads.deleted_at IS 'DEPRECATED: Only for true permanent deletion (extremely rare). Use is_archived for archive logic.';
COMMENT ON COLUMN listings.deleted_at IS 'DEPRECATED: Only for true permanent deletion (extremely rare). Use is_archived for archive logic.';
COMMENT ON COLUMN projects.deleted_at IS 'DEPRECATED: Only for true permanent deletion (extremely rare). Use is_archived for archive logic.';
COMMENT ON COLUMN task_comments.deleted_at IS 'DEPRECATED: Only for true permanent deletion (extremely rare). Use is_archived for archive logic.';
COMMENT ON COLUMN tasks.deleted_at IS 'DEPRECATED: Only for true permanent deletion (extremely rare). Use is_archived for archive logic.';
