-- Phase 5: Security Event Logging - Update existing table
-- Migration: Update security_events table to Phase 5 spec

-- Add missing columns
ALTER TABLE security_events
ADD COLUMN IF NOT EXISTS event_category VARCHAR(30),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS username VARCHAR(100),
ADD COLUMN IF NOT EXISTS request_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS request_method VARCHAR(10),
ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS api_key_id UUID;

-- Rename details to metadata if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'security_events' AND column_name = 'details') THEN
        ALTER TABLE security_events RENAME COLUMN details TO metadata_old;
    END IF;
END $$;

-- Update created_at to use timezone
ALTER TABLE security_events
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;

-- Update severity check constraint
ALTER TABLE security_events DROP CONSTRAINT IF EXISTS security_events_severity_check;
ALTER TABLE security_events DROP CONSTRAINT IF EXISTS check_severity;
ALTER TABLE security_events
ADD CONSTRAINT check_severity CHECK (severity IN ('info', 'warning', 'error', 'critical'));

-- Add category check constraint
ALTER TABLE security_events DROP CONSTRAINT IF EXISTS check_category;
ALTER TABLE security_events
ADD CONSTRAINT check_category CHECK (event_category IN ('authentication', 'authorization', 'api_key', 'account', 'suspicious'));

-- Add foreign key for api_key_id
ALTER TABLE security_events DROP CONSTRAINT IF EXISTS security_events_api_key_id_fkey;
ALTER TABLE security_events
ADD CONSTRAINT security_events_api_key_id_fkey
FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL;

-- Create additional indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_security_events_category ON security_events(event_category);
CREATE INDEX IF NOT EXISTS idx_security_events_success ON security_events(success);
CREATE INDEX IF NOT EXISTS idx_security_events_monitoring ON security_events(severity, event_category, created_at DESC);

-- Update table comment
COMMENT ON TABLE security_events IS 'Security event audit log for authentication, authorization, and suspicious activity tracking - Phase 5';
