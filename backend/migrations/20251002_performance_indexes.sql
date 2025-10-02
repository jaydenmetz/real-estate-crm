-- Performance Optimization - Database Indexes
-- Date: October 2, 2025
-- Purpose: Add comprehensive indexes for query performance optimization
-- Target: All queries <100ms, endpoints <200ms

-- =============================================================================
-- USERS TABLE INDEXES
-- =============================================================================

-- Email lookup (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Active users only
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

-- Team-based queries
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team_id) WHERE team_id IS NOT NULL;

-- Locked accounts (for security monitoring)
CREATE INDEX IF NOT EXISTS idx_users_locked ON users(locked_until) WHERE locked_until IS NOT NULL;

-- =============================================================================
-- ESCROWS TABLE INDEXES
-- =============================================================================

-- Primary user queries (most common)
CREATE INDEX IF NOT EXISTS idx_escrows_user_status ON escrows(user_id, status)
WHERE deleted_at IS NULL;

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status)
WHERE deleted_at IS NULL;

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_escrows_dates ON escrows(open_date, estimated_close_date)
WHERE deleted_at IS NULL;

-- Team-based queries
CREATE INDEX IF NOT EXISTS idx_escrows_team ON escrows(team_id)
WHERE deleted_at IS NULL;

-- Search by escrow number
CREATE INDEX IF NOT EXISTS idx_escrows_number ON escrows(escrow_number);

-- Client relationship
CREATE INDEX IF NOT EXISTS idx_escrows_client ON escrows(client_id)
WHERE deleted_at IS NULL;

-- Soft delete tracking
CREATE INDEX IF NOT EXISTS idx_escrows_deleted ON escrows(deleted_at)
WHERE deleted_at IS NOT NULL;

-- Optimistic locking
CREATE INDEX IF NOT EXISTS idx_escrows_version ON escrows(version);

-- =============================================================================
-- LISTINGS TABLE INDEXES
-- =============================================================================

-- User + status (most common query)
CREATE INDEX IF NOT EXISTS idx_listings_user_status ON listings(user_id, status)
WHERE deleted_at IS NULL;

-- Status filtering (Active listings)
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)
WHERE deleted_at IS NULL;

-- Price range queries
CREATE INDEX IF NOT EXISTS idx_listings_price_range ON listings(price)
WHERE deleted_at IS NULL;

-- Property type filtering
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(property_type)
WHERE deleted_at IS NULL;

-- MLS number lookup
CREATE INDEX IF NOT EXISTS idx_listings_mls ON listings(mls_number);

-- Location-based searches
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(city, state, zip_code)
WHERE deleted_at IS NULL;

-- =============================================================================
-- CLIENTS TABLE INDEXES
-- =============================================================================

-- User queries
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id)
WHERE deleted_at IS NULL;

-- Email lookup (unique constraint already provides index)
-- CREATE INDEX idx_clients_email ON clients(email); -- Already indexed by UNIQUE constraint

-- Client type filtering
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(client_type)
WHERE deleted_at IS NULL;

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status)
WHERE deleted_at IS NULL;

-- Name searches (for autocomplete)
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(first_name, last_name)
WHERE deleted_at IS NULL;

-- =============================================================================
-- LEADS TABLE INDEXES
-- =============================================================================

-- User + status (pipeline queries)
CREATE INDEX IF NOT EXISTS idx_leads_user_status ON leads(user_id, status)
WHERE deleted_at IS NULL;

-- Status filtering (funnel stages)
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)
WHERE deleted_at IS NULL;

-- Lead source analysis
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(lead_source)
WHERE deleted_at IS NULL;

-- Date-based queries (lead age)
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC)
WHERE deleted_at IS NULL;

-- Assigned user (for lead routing)
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to)
WHERE assigned_to IS NOT NULL;

-- =============================================================================
-- APPOINTMENTS TABLE INDEXES
-- =============================================================================

-- User + date range (calendar queries)
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON appointments(user_id, appointment_date)
WHERE deleted_at IS NULL;

-- Date + time range (scheduling)
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_date, start_time)
WHERE deleted_at IS NULL;

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)
WHERE deleted_at IS NULL;

-- Client relationship
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id)
WHERE deleted_at IS NULL;

-- Property relationship
CREATE INDEX IF NOT EXISTS idx_appointments_listing ON appointments(listing_id)
WHERE deleted_at IS NULL;

-- =============================================================================
-- API KEYS TABLE INDEXES
-- =============================================================================

-- Key hash lookup (authentication)
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash)
WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW());

-- User's active keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id)
WHERE is_active = true;

-- Expiration cleanup
CREATE INDEX IF NOT EXISTS idx_api_keys_expired ON api_keys(expires_at)
WHERE expires_at IS NOT NULL;

-- Last used tracking (for cleanup)
CREATE INDEX IF NOT EXISTS idx_api_keys_last_used ON api_keys(last_used_at);

-- =============================================================================
-- REFRESH TOKENS TABLE INDEXES
-- =============================================================================

-- Token lookup (authentication)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)
WHERE revoked_at IS NULL AND expires_at > NOW();

-- User's active tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)
WHERE revoked_at IS NULL;

-- Expiration cleanup
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expired ON refresh_tokens(expires_at);

-- IP-based tracking (for security)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_ip ON refresh_tokens(ip_address, created_at DESC);

-- =============================================================================
-- SECURITY EVENTS TABLE INDEXES (Already created in Phase 5 migration)
-- =============================================================================

-- User timeline (most common query)
CREATE INDEX IF NOT EXISTS idx_security_events_user_timeline ON security_events(user_id, created_at DESC);

-- Security monitoring dashboard
CREATE INDEX IF NOT EXISTS idx_security_events_monitoring ON security_events(severity, event_category, created_at DESC);

-- Event type queries
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);

-- Severity filtering
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

-- Category filtering
CREATE INDEX IF NOT EXISTS idx_security_events_category ON security_events(event_category);

-- IP address tracking
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);

-- Success/failure filtering
CREATE INDEX IF NOT EXISTS idx_security_events_success ON security_events(success);

-- API key events
CREATE INDEX IF NOT EXISTS idx_security_events_api_key ON security_events(api_key_id)
WHERE api_key_id IS NOT NULL;

-- Email tracking
CREATE INDEX IF NOT EXISTS idx_security_events_email ON security_events(email)
WHERE email IS NOT NULL;

-- Timestamp queries
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);

-- =============================================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =============================================================================

-- Active escrows by user with date sorting
CREATE INDEX IF NOT EXISTS idx_escrows_active_sorted ON escrows(user_id, status, created_at DESC)
WHERE deleted_at IS NULL AND status = 'active';

-- Active listings by price range
CREATE INDEX IF NOT EXISTS idx_listings_active_price ON listings(status, price)
WHERE deleted_at IS NULL AND status = 'Active';

-- New leads by source
CREATE INDEX IF NOT EXISTS idx_leads_new_source ON leads(status, lead_source, created_at DESC)
WHERE deleted_at IS NULL AND status = 'New';

-- Upcoming appointments
CREATE INDEX IF NOT EXISTS idx_appointments_upcoming ON appointments(user_id, appointment_date, start_time)
WHERE deleted_at IS NULL AND status = 'Scheduled' AND appointment_date >= CURRENT_DATE;

-- =============================================================================
-- TEXT SEARCH INDEXES (GIN - Generalized Inverted Index)
-- =============================================================================

-- Full-text search on client names (if needed in future)
-- CREATE INDEX idx_clients_fulltext ON clients USING GIN(to_tsvector('english', first_name || ' ' || last_name));

-- Full-text search on property addresses (if needed in future)
-- CREATE INDEX idx_listings_fulltext ON listings USING GIN(to_tsvector('english', address || ' ' || city));

-- =============================================================================
-- ANALYZE TABLES (Update statistics for query planner)
-- =============================================================================

ANALYZE users;
ANALYZE escrows;
ANALYZE listings;
ANALYZE clients;
ANALYZE leads;
ANALYZE appointments;
ANALYZE api_keys;
ANALYZE refresh_tokens;
ANALYZE security_events;

-- =============================================================================
-- VACUUM (Clean up dead rows)
-- =============================================================================

VACUUM ANALYZE users;
VACUUM ANALYZE escrows;
VACUUM ANALYZE listings;
VACUUM ANALYZE clients;
VACUUM ANALYZE leads;
VACUUM ANALYZE appointments;
VACUUM ANALYZE api_keys;
VACUUM ANALYZE refresh_tokens;
VACUUM ANALYZE security_events;

-- =============================================================================
-- PERFORMANCE VERIFICATION QUERIES
-- =============================================================================

-- Check index usage
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;

-- Check table sizes
-- SELECT schemaname, tablename,
--        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
--        n_live_tup as row_count
-- FROM pg_stat_user_tables
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries (requires pg_stat_statements extension)
-- SELECT query, calls, mean_exec_time, max_exec_time
-- FROM pg_stat_statements
-- ORDER BY mean_exec_time DESC
-- LIMIT 20;

-- =============================================================================
-- NOTES
-- =============================================================================

-- Index Strategy:
-- 1. User-scoped queries: (user_id, other_columns) for tenant isolation
-- 2. Status filtering: WHERE deleted_at IS NULL for soft deletes
-- 3. Composite indexes: Match most common WHERE clause combinations
-- 4. Partial indexes: WHERE clauses reduce index size and improve speed
-- 5. DESC ordering: For timestamp-based pagination

-- Performance Targets:
-- - All database queries: <100ms (p95)
-- - All API endpoints: <200ms (p95)
-- - Index hit ratio: >99%
-- - No table scans on production queries

-- Monitoring:
-- - Run ANALYZE weekly (or after bulk data changes)
-- - Monitor pg_stat_user_indexes for unused indexes
-- - Check pg_stat_statements for slow queries
-- - Vacuum regularly (automated in PostgreSQL 10+)
