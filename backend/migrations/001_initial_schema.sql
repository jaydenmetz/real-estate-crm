-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE clients (
  id VARCHAR(20) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  preferred_name VARCHAR(100),
  client_status VARCHAR(50) DEFAULT 'Active',
  client_type VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  alternate_phone VARCHAR(20),
  address JSONB,
  preferred_contact_method VARCHAR(20),
  best_time_to_contact VARCHAR(100),
  demographics JSONB,
  preferences JSONB,
  financial JSONB,
  lead_info JSONB,
  communication JSONB,
  lifetime_value DECIMAL(12,2) DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escrows table
CREATE TABLE escrows (
  id VARCHAR(20) PRIMARY KEY,
  property_address VARCHAR(255) NOT NULL,
  escrow_status VARCHAR(50) DEFAULT 'Active',
  escrow_number VARCHAR(50),
  purchase_price DECIMAL(12,2),
  earnest_money_deposit DECIMAL(12,2),
  down_payment DECIMAL(12,2),
  loan_amount DECIMAL(12,2),
  commission_percentage DECIMAL(5,2),
  gross_commission DECIMAL(12,2),
  net_commission DECIMAL(12,2),
  commission_adjustments DECIMAL(12,2),
  expense_adjustments DECIMAL(12,2),
  acceptance_date DATE,
  emd_due_date DATE,
  contingency_removal_date DATE,
  appraisal_deadline DATE,
  loan_contingency_deadline DATE,
  inspection_deadline DATE,
  closing_date DATE,
  possession_date DATE,
  property_type VARCHAR(50),
  lead_source VARCHAR(100),
  tags TEXT[],
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escrow relationships
CREATE TABLE escrow_buyers (
  escrow_id VARCHAR(20) REFERENCES escrows(id) ON DELETE CASCADE,
  client_id VARCHAR(20) REFERENCES clients(id),
  PRIMARY KEY (escrow_id, client_id)
);

CREATE TABLE escrow_sellers (
  escrow_id VARCHAR(20) REFERENCES escrows(id) ON DELETE CASCADE,
  client_id VARCHAR(20) REFERENCES clients(id),
  PRIMARY KEY (escrow_id, client_id)
);

-- Escrow checklist
CREATE TABLE escrow_checklists (
  escrow_id VARCHAR(20) PRIMARY KEY REFERENCES escrows(id) ON DELETE CASCADE,
  checklist_items JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listings table
CREATE TABLE listings (
  id VARCHAR(20) PRIMARY KEY,
  property_address VARCHAR(255) NOT NULL,
  mls_number VARCHAR(50),
  listing_status VARCHAR(50) DEFAULT 'Active',
  list_price DECIMAL(12,2),
  original_list_price DECIMAL(12,2),
  price_per_sqft DECIMAL(10,2),
  property_type VARCHAR(50),
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_footage INTEGER,
  lot_size INTEGER,
  year_built INTEGER,
  garage INTEGER,
  pool BOOLEAN DEFAULT FALSE,
  listing_date DATE,
  expiration_date DATE,
  days_on_market INTEGER DEFAULT 0,
  marketing_budget DECIMAL(10,2),
  marketing_spent DECIMAL(10,2),
  virtual_tour_link VARCHAR(500),
  professional_photos BOOLEAN DEFAULT FALSE,
  drone_photos BOOLEAN DEFAULT FALSE,
  video_walkthrough BOOLEAN DEFAULT FALSE,
  total_showings INTEGER DEFAULT 0,
  showings_this_week INTEGER DEFAULT 0,
  online_views INTEGER DEFAULT 0,
  saved_favorites INTEGER DEFAULT 0,
  listing_commission DECIMAL(5,2),
  buyer_agent_commission DECIMAL(5,2),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listing relationships
CREATE TABLE listing_sellers (
  listing_id VARCHAR(20) REFERENCES listings(id) ON DELETE CASCADE,
  client_id VARCHAR(20) REFERENCES clients(id),
  PRIMARY KEY (listing_id, client_id)
);

-- Price history
CREATE TABLE listing_price_history (
  id SERIAL PRIMARY KEY,
  listing_id VARCHAR(20) REFERENCES listings(id) ON DELETE CASCADE,
  price DECIMAL(12,2),
  date DATE,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
  id VARCHAR(20) PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  lead_source VARCHAR(100),
  lead_type VARCHAR(50),
  lead_status VARCHAR(50) DEFAULT 'New',
  lead_score INTEGER DEFAULT 0,
  lead_temperature VARCHAR(20),
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  first_contact_date TIMESTAMP,
  last_contact_date TIMESTAMP,
  next_follow_up_date DATE,
  number_of_contacts INTEGER DEFAULT 0,
  qualification JSONB,
  assigned_agent VARCHAR(100),
  assigned_date TIMESTAMP,
  campaign_info JSONB,
  converted_to_client BOOLEAN DEFAULT FALSE,
  conversion_date TIMESTAMP,
  reason_lost VARCHAR(255),
  property_interests JSONB,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  appointment_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Scheduled',
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  duration INTEGER,
  location JSONB,
  virtual_meeting_link VARCHAR(500),
  property_address VARCHAR(255),
  preparation_checklist JSONB,
  reminders JSONB,
  notes JSONB,
  outcome VARCHAR(100),
  follow_up_actions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointment attendees
CREATE TABLE appointment_attendees (
  appointment_id VARCHAR(20) REFERENCES appointments(id) ON DELETE CASCADE,
  client_id VARCHAR(20) REFERENCES clients(id),
  confirmed BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (appointment_id, client_id)
);

-- Documents table
CREATE TABLE documents (
  id VARCHAR(20) PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(20) NOT NULL,
  document_type VARCHAR(100),
  name VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  uploaded_by VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
  id VARCHAR(20) PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(20) NOT NULL,
  content TEXT,
  note_type VARCHAR(50),
  is_private BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Communications log
CREATE TABLE communications (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id VARCHAR(20),
  type VARCHAR(50),
  direction VARCHAR(20),
  content TEXT,
  response TEXT,
  sentiment VARCHAR(20),
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deletion requests table
CREATE TABLE deletion_requests (
  id VARCHAR(20) PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(20) NOT NULL,
  requested_by VARCHAR(100),
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending_approval',
  approved_by VARCHAR(100),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI agents table
CREATE TABLE ai_agents (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50),
  department VARCHAR(50),
  enabled BOOLEAN DEFAULT TRUE,
  last_active TIMESTAMP,
  tasks_completed INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI agent activities
CREATE TABLE ai_activities (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(50) REFERENCES ai_agents(id),
  activity_type VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id VARCHAR(20),
  description TEXT,
  tokens_used INTEGER,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks table
CREATE TABLE webhooks (
  id VARCHAR(20) PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  events TEXT[],
  secret VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_escrows_status ON escrows(escrow_status);
CREATE INDEX idx_escrows_closing_date ON escrows(closing_date);
CREATE INDEX idx_listings_status ON listings(listing_status);
CREATE INDEX idx_listings_price ON listings(list_price);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_leads_status ON leads(lead_status);
CREATE INDEX idx_leads_score ON leads(lead_score);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_communications_entity ON communications(entity_type, entity_id);
CREATE INDEX idx_ai_activities_agent ON ai_activities(agent_id);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON escrows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial AI agents
INSERT INTO ai_agents (id, name, role, department) VALUES
  ('alex_executive', 'Alex - Executive Assistant', 'executive', 'management'),
  ('buyer_manager', 'Buyer Manager', 'manager', 'buyer'),
  ('listing_manager', 'Listing Manager', 'manager', 'listing'),
  ('ops_manager', 'Operations Manager', 'manager', 'operations'),
  ('buyer_qualifier', 'Buyer Lead Qualifier', 'agent', 'buyer'),
  ('buyer_nurture', 'Buyer Nurture Specialist', 'agent', 'buyer'),
  ('showing_coord', 'Showing Coordinator', 'agent', 'buyer'),
  ('listing_launch', 'Listing Launch Specialist', 'agent', 'listing'),
  ('market_analyst', 'Market Analyst', 'agent', 'listing'),
  ('listing_marketing', 'Listing Marketing Agent', 'agent', 'listing'),
  ('transaction_coord', 'Transaction Coordinator', 'agent', 'operations'),
  ('compliance_officer', 'Compliance Officer', 'agent', 'operations'),
  ('financial_analyst', 'Financial Analyst', 'agent', 'operations'),
  ('database_specialist', 'Database Maintenance Specialist', 'agent', 'operations');