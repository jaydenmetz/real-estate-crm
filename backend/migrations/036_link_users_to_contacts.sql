-- Migration: Auto-create contacts for all CRM users
-- Date: 2025-11-03

INSERT INTO contacts (
  first_name, last_name, email, contact_type, 
  is_crm_user, linked_user_id, created_by, user_id
)
SELECT 
  u.first_name, u.last_name, u.email, 'client',
  true, u.id, u.id, u.id
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM contacts c WHERE LOWER(c.email) = LOWER(u.email)
);

COMMENT ON COLUMN contacts.is_crm_user IS 'True if contact has CRM login (blue avatar in UI)';
COMMENT ON COLUMN contacts.linked_user_id IS 'User ID if contact is CRM user (enables auto-linking)';
