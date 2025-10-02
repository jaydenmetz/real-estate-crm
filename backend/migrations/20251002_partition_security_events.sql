-- Migration: Partition security_events table by month
-- Date: 2025-10-02
-- Purpose: Prepare for 10M+ rows by partitioning by month
--
-- NOTE: This migration is OPTIONAL and should only be run when:
-- 1. Table has >1M rows (currently ~100 rows)
-- 2. Query performance degrades
-- 3. Backup/restore times become too long
--
-- DO NOT RUN THIS IN PRODUCTION YET - table is too small
--
-- To implement partitioning later:
-- 1. Create new partitioned table
-- 2. Copy data from existing table
-- 3. Rename tables
-- 4. Set up automatic partition creation

-- FUTURE IMPLEMENTATION (run when needed):
/*

-- Step 1: Rename existing table
ALTER TABLE security_events RENAME TO security_events_old;

-- Step 2: Create partitioned table
CREATE TABLE security_events (
  id UUID DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(30),
  severity VARCHAR(20),
  user_id UUID,
  email VARCHAR(255),
  username VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_path VARCHAR(500),
  request_method VARCHAR(10),
  success BOOLEAN DEFAULT false,
  message TEXT,
  metadata JSONB,
  api_key_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Step 3: Create initial partitions (last 3 months + next 3 months)
CREATE TABLE security_events_2025_07 PARTITION OF security_events
  FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE security_events_2025_08 PARTITION OF security_events
  FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE security_events_2025_09 PARTITION OF security_events
  FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE security_events_2025_10 PARTITION OF security_events
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE security_events_2025_11 PARTITION OF security_events
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE security_events_2025_12 PARTITION OF security_events
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Step 4: Copy data from old table
INSERT INTO security_events SELECT * FROM security_events_old;

-- Step 5: Recreate indexes on partitioned table
CREATE INDEX idx_security_events_user_timeline ON security_events(user_id, created_at DESC);
CREATE INDEX idx_security_events_monitoring ON security_events(severity, event_category, created_at DESC);
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_category ON security_events(event_category);
CREATE INDEX idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX idx_security_events_success ON security_events(success);

-- Step 6: Recreate foreign keys
ALTER TABLE security_events ADD CONSTRAINT security_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE security_events ADD CONSTRAINT security_events_api_key_id_fkey
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL;

-- Step 7: Recreate constraints
ALTER TABLE security_events ADD CONSTRAINT check_category
  CHECK (event_category IN ('authentication', 'authorization', 'api_key', 'account', 'data_access', 'suspicious'));

ALTER TABLE security_events ADD CONSTRAINT check_severity
  CHECK (severity IN ('info', 'warning', 'error', 'critical'));

-- Step 8: Drop old table (after verifying data)
-- DROP TABLE security_events_old;

*/

-- Automatic partition creation function (for future use)
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
  partition_date DATE;
  partition_name TEXT;
  start_date TEXT;
  end_date TEXT;
BEGIN
  -- Create partition for next month
  partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
  partition_name := 'security_events_' || TO_CHAR(partition_date, 'YYYY_MM');
  start_date := TO_CHAR(partition_date, 'YYYY-MM-DD');
  end_date := TO_CHAR(partition_date + INTERVAL '1 month', 'YYYY-MM-DD');

  -- Check if partition already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF security_events FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
    RAISE NOTICE 'Created partition: %', partition_name;
  ELSE
    RAISE NOTICE 'Partition already exists: %', partition_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Document current table size for future reference
DO $$
DECLARE
  table_size TEXT;
  row_count BIGINT;
BEGIN
  SELECT pg_size_pretty(pg_total_relation_size('security_events')) INTO table_size;
  SELECT COUNT(*) FROM security_events INTO row_count;

  RAISE NOTICE 'Current table size: %', table_size;
  RAISE NOTICE 'Current row count: %', row_count;
  RAISE NOTICE 'Partitioning recommended when row count > 1,000,000';
END $$;

-- Add comment to table
COMMENT ON TABLE security_events IS
'Security event audit log. Partition by month when table exceeds 1M rows. Use migration 20251002_partition_security_events.sql';
