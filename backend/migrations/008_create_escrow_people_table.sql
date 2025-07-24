-- Migration: Create escrow_people table to replace escrow_buyers and escrow_sellers
-- This table links escrows to various people involved in the transaction

-- Create escrow_people table
CREATE TABLE IF NOT EXISTS escrow_people (
  id SERIAL PRIMARY KEY,
  escrow_display_id VARCHAR(20) NOT NULL REFERENCES escrows(display_id) ON DELETE CASCADE,
  person_type VARCHAR(50) NOT NULL, -- 'buyer', 'seller', 'buyer_agent', 'listing_agent', 'escrow_officer', 'lender', etc.
  
  -- Foreign keys to other tables (nullable - use whichever applies)
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Basic info if person is not in other tables
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  
  -- Additional metadata
  is_primary BOOLEAN DEFAULT FALSE, -- Primary contact for this role
  role_details JSONB, -- Additional role-specific information
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_escrow_people_escrow_id ON escrow_people(escrow_display_id);
CREATE INDEX IF NOT EXISTS idx_escrow_people_person_type ON escrow_people(person_type);
CREATE INDEX IF NOT EXISTS idx_escrow_people_client_id ON escrow_people(client_id);
CREATE INDEX IF NOT EXISTS idx_escrow_people_agent_id ON escrow_people(agent_id);

-- Drop old tables if they exist
DROP TABLE IF EXISTS escrow_buyers CASCADE;
DROP TABLE IF EXISTS escrow_sellers CASCADE;

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_escrow_people_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_escrow_people_updated_at ON escrow_people;
CREATE TRIGGER update_escrow_people_updated_at 
  BEFORE UPDATE ON escrow_people 
  FOR EACH ROW EXECUTE FUNCTION update_escrow_people_updated_at();

-- Add comment to explain the table
COMMENT ON TABLE escrow_people IS 'Links escrows to all people involved in the transaction with their roles';
COMMENT ON COLUMN escrow_people.person_type IS 'Role in transaction: buyer, seller, buyer_agent, listing_agent, escrow_officer, lender, inspector, etc.';