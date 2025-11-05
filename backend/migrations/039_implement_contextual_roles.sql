-- Migration: Implement context-based role system
-- Date: 2025-11-03
-- Purpose: Replace simple users.role with flexible user_roles per context

-- Create roles table (defines available roles)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  context_type VARCHAR(20) NOT NULL, -- 'platform', 'brokerage', 'transaction'
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table (many-to-many with context)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  context_type VARCHAR(20) NOT NULL, -- 'platform', 'brokerage', 'transaction'
  context_id UUID, -- NULL for platform, brokerage_id, or escrow_id
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id, context_type, context_id)
);

-- Create role history (audit trail)
CREATE TABLE IF NOT EXISTS role_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id),
  context_type VARCHAR(20) NOT NULL,
  context_id UUID,
  action VARCHAR(20) NOT NULL, -- 'assigned', 'revoked', 'expired'
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reason TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_context ON user_roles(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_role_history_user ON role_history(user_id);

-- Insert platform-level roles
INSERT INTO roles (name, display_name, context_type, description) VALUES
('platform_admin', 'System Administrator', 'platform', 'Full system access'),
('brokerage_broker', 'Brokerage Broker', 'brokerage', 'Manage brokerage and agents'),
('brokerage_agent', 'Real Estate Agent', 'brokerage', 'Standard agent access'),
('transaction_buyer', 'Buyer', 'transaction', 'Buyer in a transaction'),
('transaction_seller', 'Seller', 'transaction', 'Seller in a transaction'),
('transaction_buyer_agent', 'Buyer Agent', 'transaction', 'Representing buyer'),
('transaction_listing_agent', 'Listing Agent', 'transaction', 'Representing seller'),
('transaction_coordinator', 'Transaction Coordinator', 'transaction', 'Managing escrow process'),
('transaction_lender', 'Lender', 'transaction', 'Financing the transaction'),
('transaction_inspector', 'Inspector', 'transaction', 'Property inspection'),
('transaction_appraiser', 'Appraiser', 'transaction', 'Property appraisal')
ON CONFLICT (name) DO NOTHING;

-- Migrate existing users.role to user_roles
INSERT INTO user_roles (user_id, role_id, context_type, context_id, assigned_at)
SELECT 
  u.id,
  r.id,
  'platform',
  NULL,
  u.created_at
FROM users u
JOIN roles r ON (
  (u.role = 'system_admin' AND r.name = 'platform_admin') OR
  (u.role = 'broker' AND r.name = 'brokerage_broker') OR
  (u.role = 'agent' AND r.name = 'brokerage_agent')
)
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = u.id AND ur.context_type = 'platform'
);

COMMENT ON TABLE roles IS 'Available roles in the system (platform, brokerage, and transaction contexts)';
COMMENT ON TABLE user_roles IS 'Role assignments per user per context (enables multi-role users)';
COMMENT ON TABLE role_history IS 'Audit trail of all role assignments and revocations';
