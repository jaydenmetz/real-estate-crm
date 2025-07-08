-- File: backend/migrations/002_add_checklist_columns.sql

-- Add checklist columns to existing tables
ALTER TABLE clients  ALTER COLUMN tags SET DEFAULT '{}';
ALTER TABLE escrows  ALTER COLUMN tags SET DEFAULT '{}';
ALTER TABLE leads    ALTER COLUMN tags SET DEFAULT '{}';
ALTER TABLE listings ALTER COLUMN tags SET DEFAULT '{}';
-- Add additional fields for clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referrals_made INTEGER DEFAULT 0;

-- Add additional fields for listings  
ALTER TABLE listings ADD COLUMN IF NOT EXISTS checklist_items JSONB DEFAULT '{}';

-- Add additional fields for appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS checklist_items JSONB DEFAULT '{}';

-- Add additional fields for leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS checklist_items JSONB DEFAULT '{}';

-- Create indexes for better performance on detail pages
CREATE INDEX IF NOT EXISTS idx_escrow_buyers_client ON escrow_buyers(client_id);
CREATE INDEX IF NOT EXISTS idx_escrow_sellers_client ON escrow_sellers(client_id);
CREATE INDEX IF NOT EXISTS idx_listing_sellers_client ON listing_sellers(client_id);
CREATE INDEX IF NOT EXISTS idx_appointment_attendees_client ON appointment_attendees(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_entity_type ON communications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notes_entity_type ON notes(entity_type, entity_id);

-- Add sample data for testing (optional)
-- Insert sample checklist data for existing records
UPDATE escrow_checklists 
SET checklist_items = '{
  "buyer": {
    "earnest_money_deposited": true,
    "loan_application_submitted": false
  },
  "seller": {
    "property_disclosures_completed": true,
    "title_report_ordered": false
  },
  "agent": {
    "purchase_agreement_executed": true,
    "contingencies_tracked": true
  }
}'::jsonb
WHERE escrow_id IN (SELECT id FROM escrows LIMIT 1);

-- Add service provider fields to escrows if not exists
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS escrow_officer JSONB;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS loan_officer JSONB;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS title_company JSONB;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS home_inspection_company JSONB;

-- Add activity tracking for leads
CREATE TABLE IF NOT EXISTS lead_activities (
  id SERIAL PRIMARY KEY,
  lead_id VARCHAR(20) REFERENCES leads(id) ON DELETE CASCADE,
  activity_type VARCHAR(50),
  description TEXT,
  engagement_points INTEGER DEFAULT 0,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for lead activities
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id);

-- Update appointments table to include more detail fields
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS preparation_checklist JSONB DEFAULT '{}';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminders JSONB DEFAULT '{}';
-- Function to calculate days on market for listings
CCREATE OR REPLACE FUNCTION calculate_days_on_market()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.listing_status IN ('Active', 'Pending') THEN
    NEW.days_on_market := (CURRENT_DATE - NEW.listing_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for days on market if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_days_on_market') THEN
    CREATE TRIGGER update_days_on_market
    BEFORE INSERT OR UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION calculate_days_on_market();
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS scheduled_touches (
  id SERIAL PRIMARY KEY,
  lead_id   VARCHAR(20)  REFERENCES leads(id)   ON DELETE CASCADE,
  client_id VARCHAR(20)  REFERENCES clients(id) ON DELETE CASCADE,
  type      VARCHAR(50)  NOT NULL,
  scheduled_date TIMESTAMP NOT NULL,
  status    VARCHAR(50)  NOT NULL,
  template  VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION calculate_days_on_market()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.listing_status IN ('Active','Pending') THEN
    -- simple subtraction yields integer days
    NEW.days_on_market := (CURRENT_DATE - NEW.listing_date);
  ELSE
    NEW.days_on_market := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;