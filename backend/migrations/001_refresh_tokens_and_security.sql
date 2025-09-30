-- Migration: Add Refresh Tokens, API Key Scopes, and Security Features
-- Date: 2025-09-30
-- Description: Modern authentication system with refresh tokens, granular scopes, and security events

-- ============================================================================
-- 1. REFRESH TOKENS TABLE
-- ============================================================================
-- Stores long-lived refresh tokens for JWT authentication
-- Allows token revocation (logout functionality)

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_info JSONB
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

COMMENT ON TABLE refresh_tokens IS 'Stores refresh tokens for JWT authentication - enables session revocation';
COMMENT ON COLUMN refresh_tokens.token IS 'Random 80-character hex string';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'Set when user logs out or token is invalidated';

-- ============================================================================
-- 2. API KEY ENHANCEMENTS
-- ============================================================================
-- Add granular scopes and expiration to API keys

-- Add scopes column (JSON structure for permissions)
ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS scopes JSONB DEFAULT '{"all": ["read", "write", "delete"]}'::jsonb;

-- Add expiration column (90 days default)
ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days');

COMMENT ON COLUMN api_keys.scopes IS 'Granular permissions: {"clients": ["read", "write"], "leads": ["read"]}';
COMMENT ON COLUMN api_keys.expires_at IS 'API key expiration date (90 days default)';

-- ============================================================================
-- 3. SECURITY EVENTS TABLE
-- ============================================================================
-- Logs security-related events for monitoring and compliance

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_created ON security_events(created_at);
CREATE INDEX idx_security_events_severity ON security_events(severity);

COMMENT ON TABLE security_events IS 'Audit log for security events (failed logins, permission denials, etc.)';
COMMENT ON COLUMN security_events.event_type IS 'Examples: login_failed, permission_denied, suspicious_activity';

-- ============================================================================
-- 4. ACCOUNT SECURITY COLUMNS
-- ============================================================================
-- Add failed login tracking and account lockout

ALTER TABLE users
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

COMMENT ON COLUMN users.failed_login_attempts IS 'Increments on failed login, resets on success';
COMMENT ON COLUMN users.locked_until IS 'Account locked until this timestamp (after 5 failed attempts)';

-- ============================================================================
-- 5. AUDIT LOG TABLE (OPTIONAL - FOR FUTURE)
-- ============================================================================
-- Comprehensive audit trail for all data changes

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW')),
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);

COMMENT ON TABLE audit_log IS 'Complete audit trail for compliance (SOC 2, GDPR)';

-- ============================================================================
-- 6. DATA VERIFICATION
-- ============================================================================
-- Verify tables were created successfully

DO $$
BEGIN
  -- Check refresh_tokens
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'refresh_tokens') THEN
    RAISE NOTICE '✅ refresh_tokens table created successfully';
  END IF;

  -- Check security_events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_events') THEN
    RAISE NOTICE '✅ security_events table created successfully';
  END IF;

  -- Check audit_log
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    RAISE NOTICE '✅ audit_log table created successfully';
  END IF;

  -- Check api_keys columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'api_keys' AND column_name = 'scopes'
  ) THEN
    RAISE NOTICE '✅ api_keys.scopes column added successfully';
  END IF;

  -- Check users columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'failed_login_attempts'
  ) THEN
    RAISE NOTICE '✅ users.failed_login_attempts column added successfully';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration completed successfully! 🎉';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Add JWT_SECRET to Railway environment';
  RAISE NOTICE '2. Deploy backend with refresh token support';
  RAISE NOTICE '3. Update frontend to use refresh tokens';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- 7. ROLLBACK SCRIPT (IF NEEDED)
-- ============================================================================
-- Uncomment and run if you need to rollback this migration

/*
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS security_events CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;

ALTER TABLE api_keys DROP COLUMN IF EXISTS scopes;
ALTER TABLE api_keys DROP COLUMN IF EXISTS expires_at;

ALTER TABLE users DROP COLUMN IF EXISTS failed_login_attempts;
ALTER TABLE users DROP COLUMN IF EXISTS locked_until;
*/
