-- Migration: Create escrow_people for transaction participants
-- Date: 2025-11-03

CREATE TABLE IF NOT EXISTS escrow_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id VARCHAR(50) NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  person_role VARCHAR(50) NOT NULL, -- buyer, seller, buyer_agent, listing_agent, etc.
  is_crm_user BOOLEAN DEFAULT false,
  user_id UUID REFERENCES users(id), -- Set if contact is CRM user
  is_primary BOOLEAN DEFAULT false,
  commission_split DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(escrow_id, contact_id, person_role)
);

CREATE INDEX idx_escrow_people_escrow ON escrow_people(escrow_id);
CREATE INDEX idx_escrow_people_contact ON escrow_people(contact_id);
CREATE INDEX idx_escrow_people_user ON escrow_people(user_id) WHERE user_id IS NOT NULL;
