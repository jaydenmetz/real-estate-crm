-- Migration: Create escrow helper tables
-- This creates supporting tables for escrows to track checklists, financials, people, documents, and timeline

-- 1. Escrow Checklist Table
CREATE TABLE IF NOT EXISTS escrow_checklists (
  id SERIAL PRIMARY KEY,
  escrow_id VARCHAR(50) NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  phase VARCHAR(100) NOT NULL, -- 'opening', 'processing', 'closing'
  task_name VARCHAR(255) NOT NULL,
  task_description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMP,
  completed_by VARCHAR(255),
  due_date DATE,
  priority VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
  task_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Escrow Financial Details Table
CREATE TABLE IF NOT EXISTS escrow_financials (
  id SERIAL PRIMARY KEY,
  escrow_id VARCHAR(50) NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'income', 'expense', 'commission', 'fee'
  item_name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  percentage DECIMAL(5, 2), -- For commission splits
  paid_to VARCHAR(255),
  paid_by VARCHAR(255),
  payment_date DATE,
  is_paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Escrow People/Participants Table
CREATE TABLE IF NOT EXISTS escrow_participants (
  id SERIAL PRIMARY KEY,
  escrow_id VARCHAR(50) NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL, -- 'buyer', 'seller', 'buyer_agent', 'listing_agent', 'escrow_officer', 'lender', 'inspector', etc.
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  license_number VARCHAR(100),
  address TEXT,
  is_primary BOOLEAN DEFAULT FALSE, -- Primary contact for this role
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Escrow Documents Table
CREATE TABLE IF NOT EXISTS escrow_documents (
  id SERIAL PRIMARY KEY,
  escrow_id VARCHAR(50) NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'purchase_agreement', 'disclosure', 'inspection', 'appraisal', etc.
  document_name VARCHAR(255) NOT NULL,
  file_path TEXT,
  file_size VARCHAR(50),
  uploaded_by VARCHAR(255),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_signed BOOLEAN DEFAULT FALSE,
  signed_date TIMESTAMP,
  signed_by VARCHAR(255),
  expiration_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'uploaded', 'signed', 'expired'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Escrow Timeline/Events Table
CREATE TABLE IF NOT EXISTS escrow_timeline (
  id SERIAL PRIMARY KEY,
  escrow_id VARCHAR(50) NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  event_date TIMESTAMP NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- 'milestone', 'task', 'document', 'communication', 'deadline'
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT,
  created_by VARCHAR(255),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMP,
  icon VARCHAR(50), -- Icon identifier for UI
  priority VARCHAR(20) DEFAULT 'medium',
  related_document_id INTEGER REFERENCES escrow_documents(id),
  related_checklist_id INTEGER REFERENCES escrow_checklists(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_escrow_checklists_escrow_id ON escrow_checklists(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_financials_escrow_id ON escrow_financials(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_participants_escrow_id ON escrow_participants(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_documents_escrow_id ON escrow_documents(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_timeline_escrow_id ON escrow_timeline(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_timeline_event_date ON escrow_timeline(event_date);

-- Create update trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_escrow_checklists_updated_at ON escrow_checklists;
CREATE TRIGGER update_escrow_checklists_updated_at BEFORE UPDATE ON escrow_checklists 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrow_financials_updated_at ON escrow_financials;
CREATE TRIGGER update_escrow_financials_updated_at BEFORE UPDATE ON escrow_financials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrow_participants_updated_at ON escrow_participants;
CREATE TRIGGER update_escrow_participants_updated_at BEFORE UPDATE ON escrow_participants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrow_documents_updated_at ON escrow_documents;
CREATE TRIGGER update_escrow_documents_updated_at BEFORE UPDATE ON escrow_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrow_timeline_updated_at ON escrow_timeline;
CREATE TRIGGER update_escrow_timeline_updated_at BEFORE UPDATE ON escrow_timeline 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default checklist templates
-- These will be used when creating new escrows
CREATE TABLE IF NOT EXISTS checklist_templates (
  id SERIAL PRIMARY KEY,
  phase VARCHAR(100) NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  task_description TEXT,
  task_order INTEGER DEFAULT 0,
  default_days_from_start INTEGER -- Days from escrow start date
);

-- Default checklist items
INSERT INTO checklist_templates (phase, task_name, task_description, task_order, default_days_from_start) VALUES
-- Opening Phase
('opening', 'Open Escrow', 'Officially open escrow with title company', 1, 0),
('opening', 'Earnest Money Deposit', 'Collect and deposit earnest money', 2, 3),
('opening', 'Preliminary Title Report', 'Order and review preliminary title report', 3, 5),
('opening', 'Property Disclosures', 'Deliver all required property disclosures', 4, 7),
('opening', 'Home Inspection', 'Schedule and complete home inspection', 5, 10),

-- Processing Phase
('processing', 'Loan Application', 'Submit complete loan application', 6, 5),
('processing', 'Appraisal', 'Schedule and complete property appraisal', 7, 15),
('processing', 'Loan Approval', 'Obtain final loan approval', 8, 25),
('processing', 'Insurance', 'Secure homeowners insurance', 9, 20),
('processing', 'HOA Documents', 'Review HOA documents if applicable', 10, 15),

-- Closing Phase
('closing', 'Final Walkthrough', 'Complete final property walkthrough', 11, -2),
('closing', 'Closing Documents', 'Review and sign closing documents', 12, -1),
('closing', 'Fund Loan', 'Lender funds the loan', 13, 0),
('closing', 'Record Deed', 'Record deed with county', 14, 0),
('closing', 'Deliver Keys', 'Deliver keys to new owner', 15, 0);