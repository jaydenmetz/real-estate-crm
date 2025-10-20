-- Migration: Seed Projects and Tasks from Hardcoded Roadmap
-- Created: 2025-10-19
-- Purpose: Populate projects and tasks tables with all 40 projects from ProjectManagementPanel

-- User and Team IDs
-- admin@jaydenmetz.com: 65483115-0e3e-43f3-8a4a-488a6f0df017
-- Jayden Metz Realty Group: 7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f

-- ========================================
-- CATEGORY 1: Core Data & Database
-- ========================================

-- Project: Escrows Database & CRUD
INSERT INTO projects (name, description, category, status, priority, progress_percentage, owner_id, team_id, created_by)
VALUES (
  'Escrows Database & CRUD',
  'Import all escrow data, verify schema, test CRUD operations',
  'Core Data & Database',
  'in-progress',
  'critical',
  75,
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  '65483115-0e3e-43f3-8a4a-488a6f0df017'
) RETURNING id AS escrows_db_project_id \gset

INSERT INTO tasks (name, project_id, status, priority, position, team_id, created_by) VALUES
('Import all escrow data from spreadsheets', :'escrows_db_project_id', 'not-started', 'critical', 1, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Verify database schema matches all fields', :'escrows_db_project_id', 'in-progress', 'critical', 2, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Test all CRUD operations (create, read, update, delete)', :'escrows_db_project_id', 'not-started', 'critical', 3, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Validate data integrity and relationships', :'escrows_db_project_id', 'not-started', 'high', 4, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Add missing fields discovered during import', :'escrows_db_project_id', 'not-started', 'medium', 5, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017');

-- Project: Listings Database & CRUD
INSERT INTO projects (name, description, category, status, priority, progress_percentage, owner_id, team_id, created_by)
VALUES (
  'Listings Database & CRUD',
  'Import all listing data and verify schema',
  'Core Data & Database',
  'not-started',
  'critical',
  0,
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  '65483115-0e3e-43f3-8a4a-488a6f0df017'
) RETURNING id AS listings_db_project_id \gset

INSERT INTO tasks (name, project_id, status, priority, position, team_id, created_by) VALUES
('Import all listing data', :'listings_db_project_id', 'not-started', 'critical', 1, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Verify database schema', :'listings_db_project_id', 'not-started', 'critical', 2, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Test all CRUD operations', :'listings_db_project_id', 'not-started', 'critical', 3, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Validate MLS integration fields', :'listings_db_project_id', 'not-started', 'high', 4, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017');

-- Project: Clients Database & CRUD
INSERT INTO projects (name, description, category, status, priority, progress_percentage, owner_id, team_id, created_by)
VALUES (
  'Clients Database & CRUD',
  'Import all client data and link to escrows/listings',
  'Core Data & Database',
  'not-started',
  'critical',
  0,
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  '65483115-0e3e-43f3-8a4a-488a6f0df017'
) RETURNING id AS clients_db_project_id \gset

INSERT INTO tasks (name, project_id, status, priority, position, team_id, created_by) VALUES
('Import all client data', :'clients_db_project_id', 'not-started', 'critical', 1, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Verify database schema', :'clients_db_project_id', 'not-started', 'critical', 2, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Test all CRUD operations', :'clients_db_project_id', 'not-started', 'critical', 3, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Link clients to escrows/listings', :'clients_db_project_id', 'not-started', 'high', 4, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017');

-- Project: Leads Database & CRUD
INSERT INTO projects (name, description, category, status, priority, progress_percentage, owner_id, team_id, created_by)
VALUES (
  'Leads Database & CRUD',
  'Import leads data and build qualification workflow',
  'Core Data & Database',
  'not-started',
  'high',
  0,
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  '65483115-0e3e-43f3-8a4a-488a6f0df017'
) RETURNING id AS leads_db_project_id \gset

INSERT INTO tasks (name, project_id, status, priority, position, team_id, created_by) VALUES
('Import all lead data', :'leads_db_project_id', 'not-started', 'high', 1, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Add lead_type column to schema', :'leads_db_project_id', 'not-started', 'high', 2, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Test all CRUD operations', :'leads_db_project_id', 'not-started', 'high', 3, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Build lead qualification workflow', :'leads_db_project_id', 'not-started', 'medium', 4, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017');

-- Project: Appointments Database & CRUD
INSERT INTO projects (name, description, category, status, priority, progress_percentage, owner_id, team_id, created_by)
VALUES (
  'Appointments Database & CRUD',
  'Import appointments and integrate calendar sync',
  'Core Data & Database',
  'not-started',
  'high',
  0,
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  '65483115-0e3e-43f3-8a4a-488a6f0df017'
) RETURNING id AS appointments_db_project_id \gset

INSERT INTO tasks (name, project_id, status, priority, position, team_id, created_by) VALUES
('Import all appointment data', :'appointments_db_project_id', 'not-started', 'high', 1, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Verify database schema', :'appointments_db_project_id', 'not-started', 'high', 2, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Test all CRUD operations', :'appointments_db_project_id', 'not-started', 'high', 3, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Integrate with calendar sync', :'appointments_db_project_id', 'not-started', 'medium', 4, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017');

-- Project: Contacts Database (NEW)
INSERT INTO projects (name, description, category, status, priority, progress_percentage, owner_id, team_id, created_by)
VALUES (
  'Contacts Database (NEW)',
  'Create contacts table and replace ContactSelectionModal mock data',
  'Core Data & Database',
  'not-started',
  'critical',
  0,
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  '65483115-0e3e-43f3-8a4a-488a6f0df017'
) RETURNING id AS contacts_db_project_id \gset

INSERT INTO tasks (name, project_id, status, priority, position, team_id, created_by) VALUES
('Create contacts table schema', :'contacts_db_project_id', 'not-started', 'critical', 1, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Migrate existing contact data from escrows', :'contacts_db_project_id', 'not-started', 'critical', 2, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Build contact CRUD operations', :'contacts_db_project_id', 'not-started', 'critical', 3, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017'),
('Replace ContactSelectionModal mock data', :'contacts_db_project_id', 'not-started', 'high', 4, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017');

-- Project: Commissions, Invoices & Expenses (COMPLETED)
INSERT INTO projects (name, description, category, status, priority, progress_percentage, owner_id, team_id, created_by, completed_date)
VALUES (
  'Commissions, Invoices & Expenses',
  'CRUD operations complete for financial modules',
  'Core Data & Database',
  'completed',
  'medium',
  100,
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  NOW()
) RETURNING id AS commissions_project_id \gset

INSERT INTO tasks (name, project_id, status, priority, position, team_id, created_by, completed_date) VALUES
('Commissions CRUD', :'commissions_project_id', 'completed', 'medium', 1, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Invoices CRUD', :'commissions_project_id', 'completed', 'medium', 2, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Expenses CRUD', :'commissions_project_id', 'completed', 'medium', 3, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW());

-- Project: Tasks & Projects Module (NEW - Just Created!)
INSERT INTO projects (name, description, category, status, priority, progress_percentage, owner_id, team_id, created_by)
VALUES (
  'Tasks & Projects Module (✅ NEW - Just Created!)',
  'Database schema created, now build CRUD operations',
  'Core Data & Database',
  'in-progress',
  'medium',
  30,
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  '65483115-0e3e-43f3-8a4a-488a6f0df017'
) RETURNING id AS tasks_projects_module_id \gset

INSERT INTO tasks (name, project_id, status, priority, position, team_id, created_by, completed_date) VALUES
('Design tasks table schema', :'tasks_projects_module_id', 'completed', 'medium', 1, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Design projects table schema', :'tasks_projects_module_id', 'completed', 'medium', 2, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Create database migration', :'tasks_projects_module_id', 'completed', 'medium', 3, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Build task/project CRUD operations', :'tasks_projects_module_id', 'not-started', 'medium', 4, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NULL),
('Add task assignment and tracking', :'tasks_projects_module_id', 'not-started', 'low', 5, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NULL);

-- ========================================
-- CATEGORY 2: Frontend Display & UX
-- ========================================

-- Project: Escrows Dashboard
INSERT INTO projects (name, description, category, status, priority, progress_percentage, owner_id, team_id, created_by)
VALUES (
  'Escrows Dashboard',
  'Refactor 3,914-line dashboard into 8-10 components',
  'Frontend Display & UX',
  'in-progress',
  'critical',
  80,
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  '65483115-0e3e-43f3-8a4a-488a6f0df017'
) RETURNING id AS escrows_dashboard_id \gset

INSERT INTO tasks (name, project_id, status, priority, position, team_id, created_by, completed_date) VALUES
('Display all escrows in optimal format', :'escrows_dashboard_id', 'completed', 'critical', 1, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Refactor EscrowsDashboard.jsx (3,914 lines → 8-10 components)', :'escrows_dashboard_id', 'not-started', 'critical', 2, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NULL),
('Add filtering and search', :'escrows_dashboard_id', 'completed', 'high', 3, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Add sorting by all columns', :'escrows_dashboard_id', 'completed', 'high', 4, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Optimize for performance (1000+ escrows)', :'escrows_dashboard_id', 'not-started', 'medium', 5, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NULL);

-- Project: Escrow Detail Page
INSERT INTO projects (name, description, category, status, priority, progress_percentage, owner_id, team_id, created_by)
VALUES (
  'Escrow Detail Page',
  'Polish UI with collapsible sidebars and inline editing',
  'Frontend Display & UX',
  'in-progress',
  'critical',
  90,
  '65483115-0e3e-43f3-8a4a-488a6f0df017',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f',
  '65483115-0e3e-43f3-8a4a-488a6f0df017'
) RETURNING id AS escrow_detail_id \gset

INSERT INTO tasks (name, project_id, status, priority, position, team_id, created_by, completed_date) VALUES
('Design compact hero card', :'escrow_detail_id', 'completed', 'critical', 1, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Build 4-widget layout (Timeline, Financials, People, Documents)', :'escrow_detail_id', 'completed', 'critical', 2, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Add collapsible sidebars', :'escrow_detail_id', 'completed', 'high', 3, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Implement inline editing for all fields', :'escrow_detail_id', 'completed', 'critical', 4, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Add activity feed with real-time updates', :'escrow_detail_id', 'completed', 'high', 5, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NOW()),
('Polish UI based on designer feedback', :'escrow_detail_id', 'in-progress', 'high', 6, '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', '65483115-0e3e-43f3-8a4a-488a6f0df017', NULL);

-- Continue with remaining categories (will create script file due to length)...
-- Note: This is just the first 2 categories. The full script will be ~2000+ lines.
-- I'll create a complete version now.
