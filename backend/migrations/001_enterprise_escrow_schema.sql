-- Migration: Enterprise Escrow Schema
-- Version: 001
-- Description: Create enterprise-grade escrow schema with multi-tenancy support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table for multi-tenancy
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default team
INSERT INTO teams (team_id, name, subdomain) 
VALUES ('team_jm_default', 'Jayden Metz Real Estate', 'jaydenmetz')
ON CONFLICT (team_id) DO NOTHING;

-- Drop existing escrows table if exists
DROP TABLE IF EXISTS escrows CASCADE;

-- Main escrows table with enterprise features
CREATE TABLE escrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_id VARCHAR(50) UNIQUE NOT NULL,
    external_id VARCHAR(20) UNIQUE NOT NULL,
    team_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    
    -- Address stored as JSONB for flexibility
    address JSONB NOT NULL,
    
    -- Core fields
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'pending', 'closed', 'cancelled', 'archived')),
    stage VARCHAR(50) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    listing_mls VARCHAR(50),
    
    -- Financial
    purchase_price DECIMAL(12,2) NOT NULL,
    original_list_price DECIMAL(12,2),
    total_commission DECIMAL(10,2),
    commission_rate DECIMAL(4,2),
    
    -- Dates
    closing_date DATE,
    estimated_closing_date DATE,
    actual_closing_date DATE,
    acceptance_date DATE,
    
    -- Additional fields
    earnest_money_deposit DECIMAL(10,2),
    down_payment DECIMAL(10,2),
    loan_amount DECIMAL(12,2),
    escrow_company VARCHAR(255),
    escrow_officer VARCHAR(255),
    title_company VARCHAR(255),
    lender VARCHAR(255),
    
    -- Metadata
    transaction_progress INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Search optimization
    search_vector tsvector,
    
    CONSTRAINT valid_progress CHECK (transaction_progress >= 0 AND transaction_progress <= 100),
    CONSTRAINT fk_escrows_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

-- Create indexes
CREATE INDEX idx_escrows_team ON escrows(team_id);
CREATE INDEX idx_escrows_user ON escrows(user_id);
CREATE INDEX idx_escrows_search ON escrows USING GIN(search_vector);
CREATE INDEX idx_escrows_status ON escrows(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_escrows_closing_date ON escrows(closing_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_escrows_team_status_closing 
    ON escrows(team_id, status, closing_date DESC) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_escrows_user_progress 
    ON escrows(user_id, transaction_progress) 
    WHERE deleted_at IS NULL AND status = 'active';

-- Enable Row Level Security
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY escrows_team_policy ON escrows
    FOR ALL
    USING (team_id = COALESCE(current_setting('app.current_team_id', true), 'team_jm_default')::VARCHAR);

-- Parties table (buyers, sellers, agents)
CREATE TABLE escrow_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id UUID NOT NULL,
    party_type VARCHAR(20) NOT NULL CHECK (party_type IN ('buyer', 'seller', 'buyer_agent', 'seller_agent', 'other')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    license_number VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parties_escrow FOREIGN KEY (escrow_id) REFERENCES escrows(id) ON DELETE CASCADE
);

CREATE INDEX idx_parties_escrow ON escrow_parties(escrow_id);
CREATE INDEX idx_parties_type ON escrow_parties(party_type);

-- Timeline/Activities table
CREATE TABLE escrow_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_timeline_escrow FOREIGN KEY (escrow_id) REFERENCES escrows(id) ON DELETE CASCADE
);

CREATE INDEX idx_timeline_escrow ON escrow_timeline(escrow_id);
CREATE INDEX idx_timeline_date ON escrow_timeline(event_date);
CREATE INDEX idx_timeline_status ON escrow_timeline(status);

-- Documents table
CREATE TABLE escrow_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_id VARCHAR(50) UNIQUE NOT NULL,
    escrow_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documents_escrow FOREIGN KEY (escrow_id) REFERENCES escrows(id) ON DELETE CASCADE
);

CREATE INDEX idx_documents_escrow ON escrow_documents(escrow_id);
CREATE INDEX idx_documents_type ON escrow_documents(document_type);

-- Checklist table
CREATE TABLE escrow_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id UUID NOT NULL,
    item_key VARCHAR(100) NOT NULL,
    item_label VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by VARCHAR(50),
    notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_checklist_escrow FOREIGN KEY (escrow_id) REFERENCES escrows(id) ON DELETE CASCADE,
    CONSTRAINT unique_escrow_item UNIQUE (escrow_id, item_key)
);

CREATE INDEX idx_checklist_escrow ON escrow_checklist(escrow_id);
CREATE INDEX idx_checklist_category ON escrow_checklist(category);

-- Webhooks table
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_webhooks_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_webhooks_team ON webhooks(team_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);

-- Webhook logs table
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL,
    event VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    attempt_count INTEGER DEFAULT 1,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_webhook_logs FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_event ON webhook_logs(event);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_escrow_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.external_id, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.address->>'street', '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.address->>'city', '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.status, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vector
CREATE TRIGGER update_escrow_search_vector_trigger
    BEFORE INSERT OR UPDATE ON escrows
    FOR EACH ROW
    EXECUTE FUNCTION update_escrow_search_vector();

-- Function to generate next sequence number
CREATE OR REPLACE FUNCTION generate_escrow_ids(p_team_id VARCHAR) 
RETURNS TABLE(internal_id VARCHAR, external_id VARCHAR) AS $$
DECLARE
    v_year VARCHAR;
    v_sequence INTEGER;
    v_team_suffix VARCHAR;
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    v_team_suffix := SPLIT_PART(p_team_id, '_', 2);
    
    -- Get next sequence number for this year and team
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(internal_id, '_', 3) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM escrows
    WHERE internal_id LIKE 'esc_' || v_year || '_%_' || v_team_suffix;
    
    internal_id := 'esc_' || v_year || '_' || LPAD(v_sequence::TEXT, 3, '0') || '_' || v_team_suffix;
    external_id := 'ESC-' || v_year || '-' || LPAD(v_sequence::TEXT, 3, '0');
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON escrows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_updated_at BEFORE UPDATE ON escrow_checklist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();