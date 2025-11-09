-- Migration: Create waitlist table
-- Purpose: Store registration requests during closed registration period
-- Created: 2025-11-08

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Information
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),

  -- Company/Organization (optional)
  company_name VARCHAR(255),
  company_size VARCHAR(50), -- e.g., '1-10', '11-50', '51-200', '201-500', '500+'

  -- Interest Details
  interested_features TEXT[], -- Array of features they're interested in
  how_heard_about_us VARCHAR(100), -- 'Google', 'Referral', 'Social Media', etc.
  referral_source VARCHAR(255), -- If referred, who referred them

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'converted'
  priority INTEGER DEFAULT 0, -- Higher number = higher priority

  -- Notes
  notes TEXT, -- Admin notes about this waitlist entry
  message TEXT, -- User's message/reason for joining

  -- Metadata
  ip_address VARCHAR(45), -- IPv4 or IPv6
  user_agent TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  -- Conversion Tracking
  converted_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  converted_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT waitlist_email_lowercase CHECK (email = LOWER(email)),
  CONSTRAINT waitlist_username_lowercase CHECK (username = LOWER(username))
);

-- Indexes
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX idx_waitlist_priority ON waitlist(priority DESC);
CREATE INDEX idx_waitlist_email ON waitlist(email);

-- Comments
COMMENT ON TABLE waitlist IS 'Stores registration requests when public registration is closed';
COMMENT ON COLUMN waitlist.status IS 'pending: awaiting review, approved: can create account, rejected: denied, converted: account created';
COMMENT ON COLUMN waitlist.priority IS 'Higher number = higher priority in queue (0 = normal, 1 = high, 2 = urgent)';
COMMENT ON COLUMN waitlist.converted_user_id IS 'References the user account if/when created from this waitlist entry';
