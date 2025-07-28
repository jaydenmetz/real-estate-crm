-- Migration: Add entity-specific prefixes to UUID ids
-- This updates existing UUIDs to have prefixes like 'escrow-', 'listing-', 'client-', etc.

-- Update escrows table
UPDATE escrows 
SET id = CONCAT('escrow-', id)
WHERE id NOT LIKE 'escrow-%' AND id NOT LIKE 'esc%';

-- Update listings table
UPDATE listings 
SET id = CONCAT('listing-', id)
WHERE id NOT LIKE 'listing-%' AND id NOT LIKE 'lst%';

-- Update clients table
UPDATE clients 
SET id = CONCAT('client-', id)
WHERE id NOT LIKE 'client-%' AND id NOT LIKE 'cli%';

-- Update leads table
UPDATE leads 
SET id = CONCAT('lead-', id)
WHERE id NOT LIKE 'lead-%' AND id NOT LIKE 'led%';

-- Update appointments table
UPDATE appointments 
SET id = CONCAT('appointment-', id)
WHERE id NOT LIKE 'appointment-%' AND id NOT LIKE 'apt%';

-- Update users table (if applicable)
UPDATE users 
SET id = CONCAT('user-', id)
WHERE id NOT LIKE 'user-%' AND id NOT LIKE 'usr%';

-- Update ai_agents table
UPDATE ai_agents 
SET id = CONCAT('agent-', id)
WHERE id NOT LIKE 'agent-%' AND id NOT LIKE 'agt%';

-- Update ai_agent_tasks table
UPDATE ai_agent_tasks 
SET id = CONCAT('task-', id)
WHERE id NOT LIKE 'task-%' AND id NOT LIKE 'tsk%';

-- Update documents table
UPDATE documents 
SET id = CONCAT('doc-', id)
WHERE id NOT LIKE 'doc-%' AND id NOT LIKE 'document-%';

-- Update escrow_timeline table
UPDATE escrow_timeline 
SET id = CONCAT('timeline-', id)
WHERE id NOT LIKE 'timeline-%' AND id NOT LIKE 'tml%';

-- Update escrow_checklist table
UPDATE escrow_checklist 
SET id = CONCAT('checklist-', id)
WHERE id NOT LIKE 'checklist-%' AND id NOT LIKE 'chk%';

-- Add comments to document the prefixes
COMMENT ON COLUMN escrows.id IS 'UUID with escrow- prefix for escrow records';
COMMENT ON COLUMN listings.id IS 'UUID with listing- prefix for listing records';
COMMENT ON COLUMN clients.id IS 'UUID with client- prefix for client records';
COMMENT ON COLUMN leads.id IS 'UUID with lead- prefix for lead records';
COMMENT ON COLUMN appointments.id IS 'UUID with appointment- prefix for appointment records';
COMMENT ON COLUMN users.id IS 'UUID with user- prefix for user records';
COMMENT ON COLUMN ai_agents.id IS 'UUID with agent- prefix for AI agent records';
COMMENT ON COLUMN ai_agent_tasks.id IS 'UUID with task- prefix for AI task records';
COMMENT ON COLUMN documents.id IS 'UUID with doc- prefix for document records';
COMMENT ON COLUMN escrow_timeline.id IS 'UUID with timeline- prefix for timeline records';
COMMENT ON COLUMN escrow_checklist.id IS 'UUID with checklist- prefix for checklist records';