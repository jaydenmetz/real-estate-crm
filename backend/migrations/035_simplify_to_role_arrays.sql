-- Migration: Simplify to role arrays (discard complex user_roles)
-- Date: 2025-11-03
-- Purpose: Keep it simple - users.role as TEXT[] array

-- Change users.role to array
ALTER TABLE users ALTER COLUMN role TYPE TEXT[] USING ARRAY[role];
ALTER TABLE users ALTER COLUMN role SET DEFAULT ARRAY['agent'];

-- Add contact-user linking
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_crm_user BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linked_user_id UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_contacts_crm_user ON contacts(linked_user_id) WHERE is_crm_user = true;

COMMENT ON COLUMN users.role IS 'Array of CRM access roles: system_admin, broker, team_owner, agent, etc.';
COMMENT ON COLUMN contacts.is_crm_user IS 'True if this contact has CRM login (linked_user_id set)';
COMMENT ON COLUMN contacts.linked_user_id IS 'User ID if contact is also CRM user (enables auto-linking)';

-- Examples after migration:
-- Jayden: role = ['system_admin', 'agent']
-- Josh: role = ['broker', 'agent']
-- Brad: role = ['agent']
