-- Create escrow timeline table
CREATE TABLE IF NOT EXISTS escrow_timeline (
  id SERIAL PRIMARY KEY,
  escrow_display_id VARCHAR(20) NOT NULL REFERENCES escrows(display_id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_type VARCHAR(50), -- 'milestone', 'task', 'deadline', 'meeting', 'inspection'
  scheduled_date DATE,
  completed_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  is_critical BOOLEAN DEFAULT FALSE,
  responsible_party VARCHAR(100),
  notes TEXT,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create escrow financials table
CREATE TABLE IF NOT EXISTS escrow_financials (
  id SERIAL PRIMARY KEY,
  escrow_display_id VARCHAR(20) NOT NULL REFERENCES escrows(display_id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  item_category VARCHAR(100), -- 'income', 'expense', 'credit', 'debit', 'commission', 'fee'
  amount DECIMAL(12, 2) NOT NULL,
  party_responsible VARCHAR(100), -- 'buyer', 'seller', 'agent', 'broker'
  party_receiving VARCHAR(100),
  calculation_basis TEXT, -- e.g., "2.5% of purchase price"
  is_estimate BOOLEAN DEFAULT FALSE,
  due_date DATE,
  paid_date DATE,
  is_paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create escrow documents table
CREATE TABLE IF NOT EXISTS escrow_documents (
  id SERIAL PRIMARY KEY,
  escrow_display_id VARCHAR(20) NOT NULL REFERENCES escrows(display_id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100), -- 'contract', 'disclosure', 'inspection', 'financial', 'legal', 'correspondence'
  document_status VARCHAR(50), -- 'pending', 'uploaded', 'signed', 'completed', 'expired'
  is_required BOOLEAN DEFAULT TRUE,
  due_date DATE,
  received_date DATE,
  document_url TEXT,
  document_id VARCHAR(100), -- Reference to documents table
  uploaded_by VARCHAR(100),
  signed_by_buyer BOOLEAN DEFAULT FALSE,
  signed_by_seller BOOLEAN DEFAULT FALSE,
  signed_by_agents BOOLEAN DEFAULT FALSE,
  notes TEXT,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_escrow_timeline_escrow_id ON escrow_timeline(escrow_display_id);
CREATE INDEX idx_escrow_timeline_scheduled_date ON escrow_timeline(scheduled_date);
CREATE INDEX idx_escrow_financials_escrow_id ON escrow_financials(escrow_display_id);
CREATE INDEX idx_escrow_financials_category ON escrow_financials(item_category);
CREATE INDEX idx_escrow_documents_escrow_id ON escrow_documents(escrow_display_id);
CREATE INDEX idx_escrow_documents_type ON escrow_documents(document_type);
CREATE INDEX idx_escrow_documents_status ON escrow_documents(document_status);