-- Migration 017: Create missing agent users
-- Created: October 22, 2025
-- Purpose: Add jayden@jaydenmetz.com and cole@rangelrealty.com agents

-- Create jayden@jaydenmetz.com agent
INSERT INTO users (
  id,
  email,
  username,
  first_name,
  last_name,
  role,
  team_id,
  broker_id,
  is_active,
  created_at
) VALUES (
  gen_random_uuid(),
  'jayden@jaydenmetz.com',
  'jayden',
  'Jayden',
  'Metz',
  'agent',
  '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f', -- Jayden Metz Realty Group
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- Josh Riley's brokerage
  TRUE,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create cole@rangelrealty.com agent
INSERT INTO users (
  id,
  email,
  username,
  first_name,
  last_name,
  role,
  team_id,
  broker_id,
  is_active,
  created_at
) VALUES (
  gen_random_uuid(),
  'cole@rangelrealty.com',
  'cole',
  'Cole',
  'Rangel',
  'agent',
  '3aef0a75-f22a-44e8-8615-9e28fc429f6f', -- Rangel Realty Group
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- Josh Riley's brokerage
  TRUE,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verification query
SELECT email, first_name, last_name, role, team_id, broker_id, is_active
FROM users
WHERE email IN ('jayden@jaydenmetz.com', 'cole@rangelrealty.com')
ORDER BY email;
