-- Migration: Create Tasks and Projects Management Tables
-- Created: 2025-10-19
-- Purpose: Support comprehensive project and task management for CRM development roadmap

-- ========================================
-- PROJECTS TABLE
-- ========================================
-- Purpose: Organize work into projects with categories, priorities, and progress tracking
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Project Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- e.g., 'Core Data & Database', 'Frontend Display & UX', 'AI Integration'

  -- Status & Progress
  status VARCHAR(50) NOT NULL DEFAULT 'not-started', -- not-started, in-progress, completed, blocked, on-hold
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- critical, high, medium, low
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Ownership & Assignment
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
  assigned_to UUID[] DEFAULT '{}', -- Array of user IDs

  -- Timeline
  start_date DATE,
  due_date DATE,
  completed_date TIMESTAMP WITH TIME ZONE,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}', -- Flexible storage for custom fields

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- ========================================
-- TASKS TABLE
-- ========================================
-- Purpose: Track individual tasks within projects with subtasks support
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task Identity
  name VARCHAR(500) NOT NULL,
  description TEXT,

  -- Hierarchy
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- For subtasks
  position INTEGER DEFAULT 0, -- Order within project/parent

  -- Related Entities (polymorphic relationships)
  related_entity_type VARCHAR(50), -- 'escrow', 'listing', 'client', 'lead', 'appointment'
  related_entity_id VARCHAR(255), -- ID of related entity

  -- Status & Progress
  status VARCHAR(50) NOT NULL DEFAULT 'not-started', -- not-started, in-progress, completed, blocked, cancelled
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- critical, high, medium, low
  is_milestone BOOLEAN DEFAULT FALSE,

  -- Assignment
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,

  -- Timeline
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2),

  -- Checklist Support
  checklist_items JSONB DEFAULT '[]', -- Array of {text, completed, position}

  -- Dependencies
  blocked_by UUID[] DEFAULT '{}', -- Array of task IDs that must complete first

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]', -- Array of {name, url, type, size}
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- ========================================
-- TASK COMMENTS TABLE
-- ========================================
-- Purpose: Discussion and notes on tasks
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Comment Content
  comment TEXT NOT NULL,

  -- Mentions
  mentioned_users UUID[] DEFAULT '{}', -- Array of user IDs mentioned with @

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- TASK ACTIVITY TABLE
-- ========================================
-- Purpose: Track all changes to tasks for audit trail
CREATE TABLE IF NOT EXISTS task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Activity Details
  activity_type VARCHAR(50) NOT NULL, -- created, updated, completed, commented, assigned, status_changed
  field_changed VARCHAR(100), -- Which field was changed
  old_value TEXT,
  new_value TEXT,

  -- Context
  description TEXT, -- Human-readable description

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Projects Indexes
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_due_date ON projects(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NOT NULL;

-- Tasks Indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_team_id ON tasks(team_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_related_entity ON tasks(related_entity_type, related_entity_id);
CREATE INDEX idx_tasks_position ON tasks(project_id, position);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at) WHERE deleted_at IS NOT NULL;

-- Task Comments Indexes
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_created_by ON task_comments(created_by);
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at DESC);

-- Task Activity Indexes
CREATE INDEX idx_task_activity_task_id ON task_activity(task_id);
CREATE INDEX idx_task_activity_created_by ON task_activity(created_by);
CREATE INDEX idx_task_activity_created_at ON task_activity(created_at DESC);
CREATE INDEX idx_task_activity_type ON task_activity(activity_type);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp on projects
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- Update updated_at timestamp on tasks
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Auto-calculate project progress based on tasks
CREATE OR REPLACE FUNCTION calculate_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress INTEGER;
BEGIN
  -- Count total and completed tasks for this project
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_tasks, completed_tasks
  FROM tasks
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    AND deleted_at IS NULL;

  -- Calculate progress percentage
  IF total_tasks > 0 THEN
    new_progress := ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
  ELSE
    new_progress := 0;
  END IF;

  -- Update project progress
  UPDATE projects
  SET progress_percentage = new_progress
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_project_progress_insert
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_project_progress();

CREATE TRIGGER trigger_calculate_project_progress_update
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_project_progress();

CREATE TRIGGER trigger_calculate_project_progress_delete
  AFTER DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_project_progress();

-- Log task activity on status change
CREATE OR REPLACE FUNCTION log_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO task_activity (
      task_id,
      activity_type,
      field_changed,
      old_value,
      new_value,
      description,
      created_by
    ) VALUES (
      NEW.id,
      'status_changed',
      'status',
      OLD.status,
      NEW.status,
      'Task status changed from ' || OLD.status || ' to ' || NEW.status,
      NEW.updated_at -- This should ideally be the current user ID
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_task_status_change
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_status_change();

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE projects IS 'Project management for organizing CRM development and client work';
COMMENT ON TABLE tasks IS 'Task tracking with support for subtasks, checklists, and dependencies';
COMMENT ON TABLE task_comments IS 'Discussion and collaboration on tasks';
COMMENT ON TABLE task_activity IS 'Audit trail for all task changes';

COMMENT ON COLUMN projects.category IS 'Project category (e.g., Core Data & Database, Frontend Display & UX)';
COMMENT ON COLUMN projects.assigned_to IS 'Array of user IDs assigned to this project';
COMMENT ON COLUMN tasks.parent_task_id IS 'Parent task ID for subtasks (supports nested hierarchy)';
COMMENT ON COLUMN tasks.related_entity_type IS 'Type of related entity (escrow, listing, client, etc.)';
COMMENT ON COLUMN tasks.blocked_by IS 'Array of task IDs that must be completed before this task';
COMMENT ON COLUMN tasks.checklist_items IS 'JSON array of checklist items: [{text, completed, position}]';
