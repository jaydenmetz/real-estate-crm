-- Migration: Onboarding System with Sample Data Support
-- Purpose: Track tutorial progress and flag sample data for new users
-- Date: 2025-10-02

-- ============================================================================
-- ONBOARDING PROGRESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Tutorial Steps Completion
  welcome_shown BOOLEAN DEFAULT false,
  escrow_tour_completed BOOLEAN DEFAULT false,
  listing_tour_completed BOOLEAN DEFAULT false,
  client_tour_completed BOOLEAN DEFAULT false,
  appointment_tour_completed BOOLEAN DEFAULT false,
  lead_tour_completed BOOLEAN DEFAULT false,
  marketplace_introduced BOOLEAN DEFAULT false,
  features_introduced BOOLEAN DEFAULT false,

  -- Completion Status
  tutorial_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  skipped BOOLEAN DEFAULT false,
  skipped_at TIMESTAMP WITH TIME ZONE,

  -- Progress Tracking
  current_step VARCHAR(50) DEFAULT 'welcome',
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 8,

  -- Sample Data Management
  sample_data_generated BOOLEAN DEFAULT false,
  sample_data_deleted BOOLEAN DEFAULT false,
  sample_data_deleted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX idx_onboarding_progress_tutorial_completed ON onboarding_progress(tutorial_completed);
CREATE INDEX idx_onboarding_progress_sample_data ON onboarding_progress(sample_data_generated, sample_data_deleted);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_progress_updated_at_trigger
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_progress_updated_at();

-- ============================================================================
-- ADD IS_SAMPLE FLAGS TO EXISTING TABLES
-- ============================================================================

-- Add is_sample to leads table
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sample_group_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_leads_is_sample ON leads(is_sample) WHERE is_sample = true;
CREATE INDEX IF NOT EXISTS idx_leads_sample_group ON leads(sample_group_id) WHERE sample_group_id IS NOT NULL;

-- Add is_sample to appointments table
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sample_group_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_appointments_is_sample ON appointments(is_sample) WHERE is_sample = true;
CREATE INDEX IF NOT EXISTS idx_appointments_sample_group ON appointments(sample_group_id) WHERE sample_group_id IS NOT NULL;

-- Add is_sample to clients table
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sample_group_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_clients_is_sample ON clients(is_sample) WHERE is_sample = true;
CREATE INDEX IF NOT EXISTS idx_clients_sample_group ON clients(sample_group_id) WHERE sample_group_id IS NOT NULL;

-- Add is_sample to listings table
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sample_group_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_listings_is_sample ON listings(is_sample) WHERE is_sample = true;
CREATE INDEX IF NOT EXISTS idx_listings_sample_group ON listings(sample_group_id) WHERE sample_group_id IS NOT NULL;

-- Add is_sample to escrows table
ALTER TABLE escrows
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sample_group_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_escrows_is_sample ON escrows(is_sample) WHERE is_sample = true;
CREATE INDEX IF NOT EXISTS idx_escrows_sample_group ON escrows(sample_group_id) WHERE sample_group_id IS NOT NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE onboarding_progress IS 'Track new user tutorial progress and sample data generation';
COMMENT ON COLUMN leads.is_sample IS 'Flag indicating this is sample/demo data for onboarding';
COMMENT ON COLUMN leads.sample_group_id IS 'Group ID for bulk sample data operations (format: onboarding-{user_id})';
