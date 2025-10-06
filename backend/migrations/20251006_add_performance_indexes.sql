-- Migration: Add performance indexes for escrows and related tables
-- Date: 2025-10-06
-- Purpose: Optimize common query patterns identified in Phase 4 performance audit
-- Impact: Expected 50-100ms improvement on list/filter queries

-- ============================================
-- ESCROWS TABLE INDEXES
-- ============================================

-- Index for user-based queries (most common filter)
-- Used in: getAllEscrows WHERE created_by = $1
CREATE INDEX IF NOT EXISTS idx_escrows_created_by
ON escrows(created_by);

-- Index for team-based queries (multi-tenant filtering)
-- Used in: getAllEscrows WHERE team_id = $1
CREATE INDEX IF NOT EXISTS idx_escrows_team_id
ON escrows(team_id);

-- Index for status filtering (Active, Pending, Closed, etc.)
-- Used in: getAllEscrows WHERE escrow_status = $1
CREATE INDEX IF NOT EXISTS idx_escrows_status
ON escrows(escrow_status);

-- Index for date sorting (newest first - most common sort)
-- Used in: ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_escrows_created_at_desc
ON escrows(created_at DESC);

-- Index for closing date queries (urgent escrows, upcoming closings)
-- Used in: WHERE scheduled_coe_date BETWEEN $1 AND $2
CREATE INDEX IF NOT EXISTS idx_escrows_closing_date
ON escrows(scheduled_coe_date);

-- Composite index for common combined filters
-- Used in: WHERE created_by = $1 AND escrow_status = $2 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_escrows_user_status_created
ON escrows(created_by, escrow_status, created_at DESC);

-- Index for deleted_at (soft delete filtering)
-- Used in: WHERE deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_escrows_deleted_at
ON escrows(deleted_at)
WHERE deleted_at IS NULL;

-- ============================================
-- LISTINGS TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_listings_created_by
ON listings(created_by);

CREATE INDEX IF NOT EXISTS idx_listings_team_id
ON listings(team_id);

CREATE INDEX IF NOT EXISTS idx_listings_status
ON listings(status);

CREATE INDEX IF NOT EXISTS idx_listings_created_at_desc
ON listings(created_at DESC);

-- ============================================
-- CLIENTS TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clients_created_by
ON clients(created_by);

CREATE INDEX IF NOT EXISTS idx_clients_team_id
ON clients(team_id);

CREATE INDEX IF NOT EXISTS idx_clients_status
ON clients(status);

CREATE INDEX IF NOT EXISTS idx_clients_created_at_desc
ON clients(created_at DESC);

-- ============================================
-- LEADS TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leads_created_by
ON leads(created_by);

CREATE INDEX IF NOT EXISTS idx_leads_team_id
ON leads(team_id);

CREATE INDEX IF NOT EXISTS idx_leads_status
ON leads(status);

CREATE INDEX IF NOT EXISTS idx_leads_created_at_desc
ON leads(created_at DESC);

-- ============================================
-- APPOINTMENTS TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_appointments_created_by
ON appointments(created_by);

CREATE INDEX IF NOT EXISTS idx_appointments_team_id
ON appointments(team_id);

CREATE INDEX IF NOT EXISTS idx_appointments_status
ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_appointments_start_time
ON appointments(start_time);

-- Composite index for upcoming appointments
CREATE INDEX IF NOT EXISTS idx_appointments_user_upcoming
ON appointments(created_by, start_time)
WHERE status != 'cancelled';

-- ============================================
-- USERS TABLE INDEXES (Authentication Performance)
-- ============================================

-- Index for login queries (email lookup)
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- Index for active users
CREATE INDEX IF NOT EXISTS idx_users_is_active
ON users(is_active)
WHERE is_active = true;

-- ============================================
-- API_KEYS TABLE INDEXES
-- ============================================

-- Index for API key authentication (key_hash lookup)
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash
ON api_keys(key_hash);

-- Index for active API keys by user
CREATE INDEX IF NOT EXISTS idx_api_keys_user_active
ON api_keys(user_id, is_active)
WHERE is_active = true;

-- ============================================
-- ANALYSIS QUERY (Run after applying)
-- ============================================

-- To verify indexes were created:
-- SELECT tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('escrows', 'listings', 'clients', 'leads', 'appointments', 'users', 'api_keys')
-- ORDER BY tablename, indexname;

-- To check index usage after deployment:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE tablename IN ('escrows', 'listings', 'clients', 'leads', 'appointments')
-- ORDER BY idx_scan DESC;
