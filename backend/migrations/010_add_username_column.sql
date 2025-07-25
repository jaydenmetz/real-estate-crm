-- Add username column to users table
-- Created: 2025-07-25

-- Add username column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Set default usernames for existing users
UPDATE users SET username = 'admin' WHERE email = 'admin@jaydenmetz.com' AND username IS NULL;
UPDATE users SET username = 'agent' WHERE email = 'agent@test.com' AND username IS NULL;
UPDATE users SET username = 'broker' WHERE email = 'broker@test.com' AND username IS NULL;
UPDATE users SET username = 'assistant' WHERE email = 'assistant@test.com' AND username IS NULL;

-- Add index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));