-- Migration: Comprehensive role system for entire ecosystem
-- Date: 2025-11-03
-- Purpose: Support all user types (agents, brokers, clients, vendors, etc.)

-- Clear and rebuild roles with comprehensive list
TRUNCATE roles, user_roles, role_history CASCADE;

INSERT INTO roles (name, display_name, context_type, description, permissions) VALUES
-- Platform-level roles (CRM system access)
('system', 'System Administrator', 'platform', 'Full system access', '{"full_access": true}'),
('assistant', 'Virtual Assistant', 'platform', 'AI/human assistant', '{"read_all": true}'),

-- Brokerage hierarchy
('broker', 'Designated Broker', 'brokerage', 'DRE-licensed broker', '{"manage_agents": true}'),
('team_owner', 'Team Owner', 'brokerage', 'Team manager', '{"manage_team": true}'),
('agent', 'Real Estate Agent', 'brokerage', 'Licensed salesperson', '{"manage_clients": true}'),

-- Client/Lead pipeline
('client', 'Client', 'platform', 'Active client', '{"view_own_transactions": true}'),
('lead', 'Lead', 'platform', 'Potential client', '{"view_limited": true}'),

-- Vendors/Service Providers
('lender', 'Lender', 'platform', 'Mortgage lender', '{"view_transactions": true}'),
('title_officer', 'Title Officer', 'platform', 'Title company', '{"upload_docs": true}'),
('escrow_officer', 'Escrow Officer', 'platform', 'Escrow company', '{"manage_escrow": true}'),
('inspector', 'Home Inspector', 'platform', 'Property inspector', '{"upload_reports": true}'),
('appraiser', 'Appraiser', 'platform', 'Property appraiser', '{"upload_reports": true}'),
('contractor', 'Contractor', 'platform', 'General contractor', '{"receive_referrals": true}'),
('photographer', 'Photographer', 'platform', 'RE photographer', '{"upload_media": true}'),

-- Transaction-specific roles (per escrow)
('buyer', 'Buyer', 'transaction', 'Property buyer', '{"view_transaction": true}'),
('seller', 'Seller', 'transaction', 'Property seller', '{"view_transaction": true}'),
('buyer_agent', 'Buyer Agent', 'transaction', 'Buyer representation', '{"manage_transaction": true}'),
('listing_agent', 'Listing Agent', 'transaction', 'Seller representation', '{"manage_transaction": true}'),
('transaction_coordinator', 'TC', 'transaction', 'Escrow coordinator', '{"manage_docs": true}');

-- Migrate existing users
INSERT INTO user_roles (user_id, role_id, context_type, assigned_at)
SELECT u.id, r.id, 'platform', u.created_at
FROM users u
JOIN roles r ON (
  (u.role = 'system_admin' AND r.name = 'system') OR
  (u.role = 'broker' AND r.name = 'broker') OR
  (u.role = 'agent' AND r.name = 'agent')
);
