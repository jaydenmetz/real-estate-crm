-- Migration: Add absolute_expires_at to refresh_tokens for sliding token implementation
-- Date: 2025-11-11
-- Purpose: Support sliding 30-day refresh tokens with absolute 90-day maximum lifetime

-- Add absolute_expires_at column
ALTER TABLE refresh_tokens
ADD COLUMN IF NOT EXISTS absolute_expires_at TIMESTAMP;

-- For existing tokens, set absolute_expires_at to 90 days from creation date
UPDATE refresh_tokens
SET absolute_expires_at = created_at + INTERVAL '90 days'
WHERE absolute_expires_at IS NULL;

-- Make column NOT NULL now that all rows have a value
ALTER TABLE refresh_tokens
ALTER COLUMN absolute_expires_at SET NOT NULL;

-- Add index for efficient expiry checks
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_absolute_expires
ON refresh_tokens(absolute_expires_at);

-- Add comment
COMMENT ON COLUMN refresh_tokens.absolute_expires_at IS 'Hard limit for token lifetime - never extended, even with sliding refresh (default: 90 days from creation)';
