-- Create contacts table for managing buyers, sellers, agents, and other contacts
-- Migration: 021_create_contacts_table.sql
-- Date: October 2025

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,

  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  phone_secondary VARCHAR(20),

  -- Professional Info
  contact_type VARCHAR(50) NOT NULL, -- buyer, seller, agent, lender, title_officer, inspector, appraiser, contractor
  company VARCHAR(255),
  license_number VARCHAR(50),

  -- Address
  street_address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),

  -- Metadata
  notes TEXT,
  tags TEXT[], -- Array of tags for categorization
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Search optimization - Full text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(company, '')
    )
  ) STORED
);

-- Create indexes for performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_team_id ON contacts(team_id);
CREATE INDEX idx_contacts_broker_id ON contacts(broker_id);
CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_archived ON contacts(is_archived);
CREATE INDEX idx_contacts_search ON contacts USING GIN(search_vector);
CREATE INDEX idx_contacts_name ON contacts(last_name, first_name);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_contacts_updated_at();

-- Add helpful comments
COMMENT ON TABLE contacts IS 'Contact information for buyers, sellers, agents, and other real estate professionals';
COMMENT ON COLUMN contacts.contact_type IS 'Type of contact: buyer, seller, agent, lender, title_officer, inspector, appraiser, contractor';
COMMENT ON COLUMN contacts.search_vector IS 'Full text search index for name, email, company';