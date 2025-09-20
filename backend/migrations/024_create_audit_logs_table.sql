-- Migration: Create audit logs table for security and compliance
-- Date: 2025-01-20
-- Description: Track all sensitive operations and data access for security audit trail

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- READ, CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  resource_type VARCHAR(100), -- ESCROWS, USERS, API_KEYS, etc.
  resource_id VARCHAR(255), -- ID of the resource being accessed
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10), -- GET, POST, PUT, DELETE, etc.
  request_path TEXT,
  response_status INTEGER,
  duration INTEGER, -- Request duration in milliseconds
  metadata JSONB, -- Additional contextual data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Create partial index for security events
CREATE INDEX idx_audit_logs_security ON audit_logs(action)
WHERE action LIKE 'SECURITY_%';

-- Add table partitioning by month for scalability (optional, for high-volume)
-- This is commented out but can be enabled for production
/*
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
*/

-- Add retention policy (keep logs for 90 days by default)
-- This should be run as a scheduled job
/*
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days';
*/

-- Grant appropriate permissions
GRANT SELECT ON audit_logs TO readonly_user;
GRANT INSERT ON audit_logs TO app_user;

-- Add comment for documentation
COMMENT ON TABLE audit_logs IS 'Security audit trail for all sensitive operations and data access';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (READ, CREATE, UPDATE, DELETE, LOGIN, etc.)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource being accessed (ESCROWS, USERS, etc.)';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context data in JSON format';