-- Phase 5: Security Event Logging
-- Migration: Create security_events table

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event metadata
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(30) NOT NULL, -- 'authentication', 'authorization', 'api_key', 'account', 'suspicious'
  severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'critical'

  -- User context
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  username VARCHAR(100),

  -- Request context
  ip_address VARCHAR(45), -- IPv6 compatible
  user_agent TEXT,
  request_path VARCHAR(500),
  request_method VARCHAR(10),

  -- Event details
  success BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  metadata JSONB, -- Additional event-specific data

  -- API Key context (if applicable)
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for efficient querying
  CONSTRAINT check_severity CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  CONSTRAINT check_category CHECK (event_category IN ('authentication', 'authorization', 'api_key', 'account', 'suspicious'))
);

-- Indexes for common queries
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_category ON security_events(event_category);
CREATE INDEX idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX idx_security_events_success ON security_events(success);

-- Composite index for user activity timeline
CREATE INDEX idx_security_events_user_timeline ON security_events(user_id, created_at DESC);

-- Composite index for security monitoring
CREATE INDEX idx_security_events_monitoring ON security_events(severity, event_category, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE security_events IS 'Security event audit log for authentication, authorization, and suspicious activity tracking';
