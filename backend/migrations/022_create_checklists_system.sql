-- Migration: Create Checklists System
-- Created: 2025-10-19
-- Purpose: Implement checklist templates and instances for real estate workflows
--
-- ARCHITECTURE:
-- - checklist_templates: Reusable best-practice workflows (e.g., "Escrow Opening Checklist")
-- - checklists: Instances applied to specific entities (e.g., ESC-2025-0001's opening checklist)
-- - tasks: Enhanced to link to checklists (already exists, just add columns)
--
-- ENTITY TYPES:
-- - escrow: Transaction checklists
-- - listing: Listing workflow checklists
-- - client: Client onboarding/service checklists
-- - lead: Lead qualification checklists
-- - appointment: Pre/post appointment checklists
-- - custom: Marketing campaigns, personal projects, neighborhood farming, etc.

-- ========================================
-- CHECKLIST TEMPLATES TABLE
-- ========================================
-- Purpose: Reusable checklist templates (best practices)
-- Examples: "Escrow Opening Checklist", "Farm a Neighborhood", "Listing Pre-Market"

CREATE TABLE IF NOT EXISTS checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- What type of entity does this apply to?
  entity_type VARCHAR(50) NOT NULL, -- 'escrow', 'listing', 'client', 'lead', 'appointment', 'custom'
  category VARCHAR(100), -- 'opening', 'marketing', 'closing', 'onboarding', etc.

  -- Template Items (becomes tasks when checklist is created)
  items JSONB NOT NULL DEFAULT '[]',
  -- Structure: [
  --   {
  --     text: "Order title report",
  --     description: "Contact title company and order prelim report",
  --     position: 1,
  --     priority: "high",
  --     auto_due_days: 1, -- Create task due in 1 day from checklist creation
  --     estimated_hours: 0.5
  --   },
  --   ...
  -- ]

  -- Auto-apply Settings
  is_default BOOLEAN DEFAULT FALSE, -- Auto-apply to all new entities of this type?
  auto_apply_conditions JSONB, -- Conditions for when to auto-apply (e.g., {"status": "Active"})

  -- Visibility
  is_public BOOLEAN DEFAULT TRUE, -- Available to all team members?
  is_system BOOLEAN DEFAULT FALSE, -- System-provided template (can't delete)?

  -- Metadata
  icon VARCHAR(50), -- Icon name for UI
  color VARCHAR(20), -- Color code for UI
  tags TEXT[] DEFAULT '{}',

  -- Ownership
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- ========================================
-- CHECKLISTS TABLE (Instances)
-- ========================================
-- Purpose: Specific checklist instances applied to entities
-- Examples: "Escrow ESC-2025-0001's Opening Checklist", "123 Main St's Pre-Market Checklist"

CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to template (optional - can be custom)
  template_id UUID REFERENCES checklist_templates(id) ON DELETE SET NULL,

  -- What entity does this checklist belong to? (polymorphic)
  entity_type VARCHAR(50) NOT NULL, -- 'escrow', 'listing', 'client', 'lead', 'appointment', 'custom'
  entity_id VARCHAR(255) NOT NULL, -- ESC-2025-0001, listing UUID, client UUID, or custom project ID

  -- Checklist Info (can override template)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'archived', 'on-hold'
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Dates
  due_date DATE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Ownership & Assignment
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- ENHANCE TASKS TABLE
-- ========================================
-- Add columns to link tasks to checklists

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS checklist_position INTEGER; -- Order within checklist

-- Add index for checklist queries
CREATE INDEX IF NOT EXISTS idx_tasks_checklist_id ON tasks(checklist_id);
CREATE INDEX IF NOT EXISTS idx_tasks_checklist_position ON tasks(checklist_id, checklist_position);

COMMENT ON COLUMN tasks.checklist_id IS 'Links task to a checklist instance (NULL = standalone task)';
COMMENT ON COLUMN tasks.checklist_position IS 'Position of task within checklist (for ordering)';

-- ========================================
-- INDEXES
-- ========================================

-- Checklist Templates Indexes
CREATE INDEX idx_checklist_templates_entity_type ON checklist_templates(entity_type);
CREATE INDEX idx_checklist_templates_category ON checklist_templates(category);
CREATE INDEX idx_checklist_templates_team_id ON checklist_templates(team_id);
CREATE INDEX idx_checklist_templates_is_default ON checklist_templates(is_default) WHERE is_default = TRUE;
CREATE INDEX idx_checklist_templates_is_public ON checklist_templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_checklist_templates_created_at ON checklist_templates(created_at DESC);
CREATE INDEX idx_checklist_templates_deleted_at ON checklist_templates(deleted_at) WHERE deleted_at IS NOT NULL;

-- Checklists Indexes
CREATE INDEX idx_checklists_template_id ON checklists(template_id);
CREATE INDEX idx_checklists_entity ON checklists(entity_type, entity_id); -- Polymorphic lookup
CREATE INDEX idx_checklists_status ON checklists(status);
CREATE INDEX idx_checklists_assigned_to ON checklists(assigned_to);
CREATE INDEX idx_checklists_team_id ON checklists(team_id);
CREATE INDEX idx_checklists_due_date ON checklists(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_checklists_created_at ON checklists(created_at DESC);
CREATE INDEX idx_checklists_deleted_at ON checklists(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at on checklist_templates
CREATE OR REPLACE FUNCTION update_checklist_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_checklist_templates_updated_at
  BEFORE UPDATE ON checklist_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_templates_updated_at();

-- Update updated_at on checklists
CREATE OR REPLACE FUNCTION update_checklists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_checklists_updated_at
  BEFORE UPDATE ON checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_checklists_updated_at();

-- Auto-calculate checklist progress from tasks
CREATE OR REPLACE FUNCTION calculate_checklist_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress INTEGER;
  checklist_uuid UUID;
BEGIN
  -- Get checklist ID from NEW or OLD
  checklist_uuid := COALESCE(NEW.checklist_id, OLD.checklist_id);

  -- Skip if no checklist
  IF checklist_uuid IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Count total and completed tasks for this checklist
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_tasks, completed_tasks
  FROM tasks
  WHERE checklist_id = checklist_uuid
    AND deleted_at IS NULL;

  -- Calculate progress percentage
  IF total_tasks > 0 THEN
    new_progress := ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
  ELSE
    new_progress := 0;
  END IF;

  -- Update checklist progress and status
  UPDATE checklists
  SET
    progress_percentage = new_progress,
    status = CASE
      WHEN new_progress = 100 THEN 'completed'
      WHEN new_progress > 0 THEN 'active'
      ELSE status
    END,
    completed_at = CASE
      WHEN new_progress = 100 AND completed_at IS NULL THEN NOW()
      WHEN new_progress < 100 THEN NULL
      ELSE completed_at
    END
  WHERE id = checklist_uuid;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_checklist_progress_insert
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_checklist_progress();

CREATE TRIGGER trigger_calculate_checklist_progress_update
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_checklist_progress();

CREATE TRIGGER trigger_calculate_checklist_progress_delete
  AFTER DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_checklist_progress();

-- ========================================
-- SEED DEFAULT TEMPLATES
-- ========================================

-- Get system user ID (admin@jaydenmetz.com)
DO $$
DECLARE
  admin_user_id UUID;
  jayden_team_id UUID;
BEGIN
  -- Get admin user and team
  SELECT id, team_id INTO admin_user_id, jayden_team_id
  FROM users
  WHERE email = 'admin@jaydenmetz.com'
  LIMIT 1;

  -- Only seed if user exists
  IF admin_user_id IS NOT NULL THEN

    -- ========================================
    -- ESCROW TEMPLATES
    -- ========================================

    INSERT INTO checklist_templates (name, description, entity_type, category, items, is_default, is_system, icon, color, created_by, team_id)
    VALUES (
      'Escrow Opening Checklist',
      'Essential tasks for the first 3 days of escrow',
      'escrow',
      'opening',
      '[
        {"text": "Order title report", "position": 1, "priority": "critical", "auto_due_days": 1, "estimated_hours": 0.5},
        {"text": "Order home inspection", "position": 2, "priority": "high", "auto_due_days": 3, "estimated_hours": 1},
        {"text": "Send buyer welcome email", "position": 3, "priority": "high", "auto_due_days": 0, "estimated_hours": 0.25},
        {"text": "Review purchase agreement", "position": 4, "priority": "critical", "auto_due_days": 1, "estimated_hours": 1},
        {"text": "Schedule appraisal", "position": 5, "priority": "high", "auto_due_days": 2, "estimated_hours": 0.5},
        {"text": "Verify EMD deposit received", "position": 6, "priority": "critical", "auto_due_days": 3, "estimated_hours": 0.25}
      ]'::jsonb,
      TRUE,
      TRUE,
      'PlaylistAddCheck',
      '#4A90E2',
      admin_user_id,
      jayden_team_id
    );

    INSERT INTO checklist_templates (name, description, entity_type, category, items, is_default, is_system, icon, color, created_by, team_id)
    VALUES (
      'Escrow Closing Checklist',
      'Final week tasks before closing',
      'escrow',
      'closing',
      '[
        {"text": "Schedule final walkthrough", "position": 1, "priority": "critical", "auto_due_days": -3, "estimated_hours": 0.5},
        {"text": "Confirm wire instructions", "position": 2, "priority": "critical", "auto_due_days": -2, "estimated_hours": 0.25},
        {"text": "Review closing disclosure", "position": 3, "priority": "critical", "auto_due_days": -2, "estimated_hours": 1},
        {"text": "Confirm signing appointment", "position": 4, "priority": "high", "auto_due_days": -1, "estimated_hours": 0.25},
        {"text": "Arrange key pickup", "position": 5, "priority": "medium", "auto_due_days": 0, "estimated_hours": 0.5}
      ]'::jsonb,
      FALSE,
      TRUE,
      'TaskAlt',
      '#4CAF50',
      admin_user_id,
      jayden_team_id
    );

    -- ========================================
    -- LISTING TEMPLATES
    -- ========================================

    INSERT INTO checklist_templates (name, description, entity_type, category, items, is_default, is_system, icon, color, created_by, team_id)
    VALUES (
      'Listing Pre-Market Checklist',
      'Get listing ready to go live',
      'listing',
      'pre-market',
      '[
        {"text": "Complete CMA (Comparative Market Analysis)", "position": 1, "priority": "critical", "auto_due_days": 0, "estimated_hours": 2},
        {"text": "Schedule professional photos", "position": 2, "priority": "critical", "auto_due_days": 3, "estimated_hours": 1},
        {"text": "Order staging consultation", "position": 3, "priority": "high", "auto_due_days": 5, "estimated_hours": 1.5},
        {"text": "Write listing description", "position": 4, "priority": "high", "auto_due_days": 7, "estimated_hours": 1},
        {"text": "Input to MLS", "position": 5, "priority": "critical", "auto_due_days": 10, "estimated_hours": 0.5},
        {"text": "Order yard sign", "position": 6, "priority": "medium", "auto_due_days": 10, "estimated_hours": 0.25},
        {"text": "Schedule broker open", "position": 7, "priority": "medium", "auto_due_days": 12, "estimated_hours": 0.5}
      ]'::jsonb,
      TRUE,
      TRUE,
      'HomeWork',
      '#FF9800',
      admin_user_id,
      jayden_team_id
    );

    -- ========================================
    -- MARKETING TEMPLATES
    -- ========================================

    INSERT INTO checklist_templates (name, description, entity_type, category, items, is_default, is_system, icon, color, created_by, team_id)
    VALUES (
      'Farm a Neighborhood',
      'Become the neighborhood expert in 90 days',
      'custom',
      'marketing',
      '[
        {"text": "Door knock 100 homes", "position": 1, "priority": "high", "auto_due_days": 30, "estimated_hours": 20},
        {"text": "Send 500 Just Listed mailers", "position": 2, "priority": "high", "auto_due_days": 10, "estimated_hours": 3},
        {"text": "Host 3 open houses in neighborhood", "position": 3, "priority": "high", "auto_due_days": 60, "estimated_hours": 12},
        {"text": "Run Facebook ads for 30 days", "position": 4, "priority": "medium", "auto_due_days": 15, "estimated_hours": 2},
        {"text": "Create neighborhood market report", "position": 5, "priority": "medium", "auto_due_days": 45, "estimated_hours": 4},
        {"text": "Join neighborhood Facebook group", "position": 6, "priority": "low", "auto_due_days": 7, "estimated_hours": 0.5}
      ]'::jsonb,
      FALSE,
      TRUE,
      'Campaign',
      '#9C27B0',
      admin_user_id,
      jayden_team_id
    );

    INSERT INTO checklist_templates (name, description, entity_type, category, items, is_default, is_system, icon, color, created_by, team_id)
    VALUES (
      'Sphere of Influence Blitz',
      'Reconnect with past clients and sphere',
      'custom',
      'marketing',
      '[
        {"text": "Call 50 past clients", "position": 1, "priority": "high", "auto_due_days": 14, "estimated_hours": 10},
        {"text": "Send personalized cards to 100 contacts", "position": 2, "priority": "high", "auto_due_days": 7, "estimated_hours": 3},
        {"text": "Host client appreciation event", "position": 3, "priority": "medium", "auto_due_days": 30, "estimated_hours": 8},
        {"text": "Ask for 10 reviews", "position": 4, "priority": "high", "auto_due_days": 21, "estimated_hours": 2},
        {"text": "Send market update email", "position": 5, "priority": "medium", "auto_due_days": 10, "estimated_hours": 1}
      ]'::jsonb,
      FALSE,
      TRUE,
      'Groups',
      '#E91E63',
      admin_user_id,
      jayden_team_id
    );

    -- ========================================
    -- CLIENT TEMPLATES
    -- ========================================

    INSERT INTO checklist_templates (name, description, entity_type, category, items, is_default, is_system, icon, color, created_by, team_id)
    VALUES (
      'Buyer Onboarding Checklist',
      'Get new buyers set up for success',
      'client',
      'onboarding',
      '[
        {"text": "Send buyer consultation questionnaire", "position": 1, "priority": "critical", "auto_due_days": 0, "estimated_hours": 0.25},
        {"text": "Verify pre-approval status", "position": 2, "priority": "critical", "auto_due_days": 1, "estimated_hours": 0.5},
        {"text": "Set up property search alerts", "position": 3, "priority": "high", "auto_due_days": 1, "estimated_hours": 0.5},
        {"text": "Schedule buyer consultation", "position": 4, "priority": "critical", "auto_due_days": 2, "estimated_hours": 1.5},
        {"text": "Send buyer representation agreement", "position": 5, "priority": "high", "auto_due_days": 3, "estimated_hours": 0.25}
      ]'::jsonb,
      TRUE,
      TRUE,
      'PersonAdd',
      '#2196F3',
      admin_user_id,
      jayden_team_id
    );

  END IF;
END $$;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE checklist_templates IS 'Reusable checklist templates for best-practice workflows';
COMMENT ON TABLE checklists IS 'Checklist instances applied to specific entities (escrows, listings, etc.)';

COMMENT ON COLUMN checklist_templates.entity_type IS 'Type of entity this template applies to (escrow, listing, client, lead, appointment, custom)';
COMMENT ON COLUMN checklist_templates.items IS 'JSONB array of checklist items that become tasks when applied';
COMMENT ON COLUMN checklist_templates.is_default IS 'Auto-apply this template to all new entities of this type';
COMMENT ON COLUMN checklist_templates.is_system IS 'System-provided template (cannot be deleted by users)';

COMMENT ON COLUMN checklists.entity_type IS 'Type of entity this checklist belongs to (polymorphic)';
COMMENT ON COLUMN checklists.entity_id IS 'ID of the entity (escrow ID, listing UUID, client UUID, or custom project ID)';
COMMENT ON COLUMN checklists.progress_percentage IS 'Auto-calculated from task completion (0-100)';
