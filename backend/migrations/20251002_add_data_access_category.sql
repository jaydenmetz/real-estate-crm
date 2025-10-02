-- Migration: Add data_access category to security_events
-- Date: 2025-10-02
-- Purpose: Support comprehensive data access logging

-- Drop old constraint
ALTER TABLE security_events
DROP CONSTRAINT IF EXISTS check_category;

-- Add new constraint with data_access category
ALTER TABLE security_events
ADD CONSTRAINT check_category
CHECK (event_category IN (
  'authentication',
  'authorization',
  'api_key',
  'account',
  'data_access',
  'suspicious'
));

-- Add comment
COMMENT ON CONSTRAINT check_category ON security_events IS
'Validates event_category values - updated 2025-10-02 to include data_access';
