-- Initial schema migration for Real Estate CRM
-- Created: 2025-01-17

-- Note: If uuid-ossp extension is not available, we'll use gen_random_uuid() instead
-- which is built into PostgreSQL 13+

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'agent',
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Escrows table
CREATE TABLE IF NOT EXISTS escrows (
    id VARCHAR(50) PRIMARY KEY,
    property_address TEXT NOT NULL,
    escrow_status VARCHAR(50) DEFAULT 'Active',
    purchase_price DECIMAL(12,2) NOT NULL,
    earnest_money_deposit DECIMAL(10,2),
    down_payment DECIMAL(10,2),
    loan_amount DECIMAL(12,2),
    commission_percentage DECIMAL(5,2) DEFAULT 2.5,
    gross_commission DECIMAL(10,2),
    net_commission DECIMAL(10,2),
    acceptance_date DATE,
    closing_date DATE,
    property_type VARCHAR(100) DEFAULT 'Single Family',
    lead_source VARCHAR(100),
    created_by UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Escrow buyers junction table
CREATE TABLE IF NOT EXISTS escrow_buyers (
    id SERIAL PRIMARY KEY,
    escrow_id VARCHAR(50) REFERENCES escrows(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Escrow sellers junction table
CREATE TABLE IF NOT EXISTS escrow_sellers (
    id SERIAL PRIMARY KEY,
    escrow_id VARCHAR(50) REFERENCES escrows(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_address TEXT NOT NULL,
    list_price DECIMAL(12,2) NOT NULL,
    listing_status VARCHAR(50) DEFAULT 'Active',
    mls_number VARCHAR(50) UNIQUE,
    property_type VARCHAR(100) DEFAULT 'Single Family',
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_feet INTEGER,
    lot_size DECIMAL(10,2),
    year_built INTEGER,
    description TEXT,
    features JSONB DEFAULT '[]',
    photos JSONB DEFAULT '[]',
    listing_date DATE DEFAULT CURRENT_DATE,
    expiration_date DATE,
    days_on_market INTEGER,
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    listing_agent_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    client_type VARCHAR(50) DEFAULT 'Buyer', -- Buyer, Seller, Both
    status VARCHAR(50) DEFAULT 'Active',
    source VARCHAR(100),
    preferred_contact_method VARCHAR(50) DEFAULT 'Email',
    notes TEXT,
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    pre_qualified BOOLEAN DEFAULT false,
    assigned_agent_id UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    lead_source VARCHAR(100),
    lead_status VARCHAR(50) DEFAULT 'New',
    lead_score INTEGER DEFAULT 0,
    lead_temperature VARCHAR(20) DEFAULT 'Cold', -- Hot, Warm, Cold
    property_interest TEXT,
    budget_range VARCHAR(100),
    timeline VARCHAR(100),
    notes TEXT,
    last_contact_date DATE,
    next_follow_up DATE,
    assigned_agent_id UUID REFERENCES users(id),
    converted_to_client_id UUID REFERENCES clients(id),
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    appointment_type VARCHAR(50) DEFAULT 'Showing', -- Showing, Meeting, Open House, etc.
    description TEXT,
    status VARCHAR(50) DEFAULT 'Scheduled',
    client_id UUID REFERENCES clients(id),
    listing_id UUID REFERENCES listings(id),
    agent_id UUID REFERENCES users(id),
    reminder_sent BOOLEAN DEFAULT false,
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- escrow, listing, client, etc.
    entity_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- escrow, listing, client, lead, etc.
    entity_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Agents table
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    description TEXT,
    model VARCHAR(50) DEFAULT 'gpt-4',
    enabled BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    capabilities JSONB DEFAULT '[]',
    last_activity TIMESTAMP WITH TIME ZONE,
    total_tasks_completed INTEGER DEFAULT 0,
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrations tracking table
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_escrows_status ON escrows(escrow_status);
CREATE INDEX idx_escrows_closing_date ON escrows(closing_date);
CREATE INDEX idx_escrows_team_id ON escrows(team_id);

CREATE INDEX idx_listings_status ON listings(listing_status);
CREATE INDEX idx_listings_price ON listings(list_price);
CREATE INDEX idx_listings_team_id ON listings(team_id);

CREATE INDEX idx_clients_type ON clients(client_type);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_team_id ON clients(team_id);

CREATE INDEX idx_leads_status ON leads(lead_status);
CREATE INDEX idx_leads_score ON leads(lead_score);
CREATE INDEX idx_leads_temperature ON leads(lead_temperature);
CREATE INDEX idx_leads_team_id ON leads(team_id);

CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_agent ON appointments(agent_id);
CREATE INDEX idx_appointments_team_id ON appointments(team_id);

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_team_id ON documents(team_id);

CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id);
CREATE INDEX idx_notes_team_id ON notes(team_id);

CREATE INDEX idx_ai_agents_enabled ON ai_agents(enabled);
CREATE INDEX idx_ai_agents_team_id ON ai_agents(team_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON escrows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();