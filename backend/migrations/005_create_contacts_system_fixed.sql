-- Migration: Create Contacts System (Fixed)
-- Description: Restructure database to use unified contacts system for all people
-- Date: 2025-01-18

-- Note: Using gen_random_uuid() which is built into PostgreSQL 13+
-- No extension required

-- Create contacts table (central repository for all people)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN ('agent', 'client', 'buyer', 'seller', 'vendor', 'other')),
    
    -- Name fields
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200) GENERATED ALWAYS AS (
        CASE 
            WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
            WHEN first_name IS NOT NULL THEN first_name
            WHEN last_name IS NOT NULL THEN last_name
            ELSE NULL
        END
    ) STORED,
    company_name VARCHAR(200),
    
    -- Contact information
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    mobile_phone VARCHAR(20),
    work_phone VARCHAR(20),
    fax VARCHAR(20),
    
    -- Address
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip VARCHAR(10),
    address_country VARCHAR(100) DEFAULT 'USA',
    
    -- Additional info
    notes TEXT,
    tags TEXT[],
    preferred_contact_method VARCHAR(50) CHECK (preferred_contact_method IN ('email', 'phone', 'text', 'mail')),
    
    -- Social/Professional
    linkedin_url VARCHAR(500),
    website VARCHAR(500),
    
    -- Important dates
    birthday DATE,
    anniversary DATE,
    
    -- Source tracking
    source VARCHAR(100),
    source_details JSONB,
    
    -- Relationship info
    referred_by UUID REFERENCES contacts(id),
    spouse_id UUID REFERENCES contacts(id),
    
    -- System fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(team_id),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create agents table (extends contacts for real estate agents)
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    
    -- License information
    license_number VARCHAR(50),
    license_state VARCHAR(2),
    license_expiration DATE,
    
    -- Brokerage information
    brokerage_name VARCHAR(200),
    brokerage_phone VARCHAR(20),
    brokerage_address VARCHAR(500),
    office_name VARCHAR(200),
    
    -- Professional details
    designation VARCHAR(100), -- e.g., 'Realtor', 'Broker', 'Associate'
    specialties TEXT[],
    years_experience INTEGER,
    
    -- Commission splits
    default_commission_rate DECIMAL(5,2), -- percentage
    default_commission_split DECIMAL(5,2), -- agent's percentage of commission
    
    -- Performance metrics
    total_transactions INTEGER DEFAULT 0,
    total_volume DECIMAL(15,2) DEFAULT 0,
    avg_sale_price DECIMAL(15,2),
    
    -- System fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(contact_id)
);

-- Handle existing clients table
DO $$ 
BEGIN
    -- If clients_old already exists, don't try to rename again
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'clients_old') THEN
        -- Only rename if clients exists
        IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'clients') THEN
            ALTER TABLE clients RENAME TO clients_old;
        END IF;
    END IF;
END $$;

-- Create new clients table that references contacts
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    
    -- Client-specific fields
    client_type VARCHAR(50) CHECK (client_type IN ('buyer', 'seller', 'both', 'investor', 'landlord', 'tenant')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    
    -- Preferences
    price_range_min DECIMAL(15,2),
    price_range_max DECIMAL(15,2),
    preferred_locations TEXT[],
    property_types TEXT[],
    
    -- Financial
    pre_approved BOOLEAN DEFAULT false,
    pre_approval_amount DECIMAL(15,2),
    lender_contact_id UUID REFERENCES contacts(id),
    
    -- Metrics
    properties_viewed INTEGER DEFAULT 0,
    offers_made INTEGER DEFAULT 0,
    properties_purchased INTEGER DEFAULT 0,
    properties_sold INTEGER DEFAULT 0,
    
    -- Important dates
    first_contact_date DATE,
    last_activity_date DATE,
    
    -- System fields
    assigned_agent_id UUID REFERENCES agents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(contact_id)
);

-- Junction table: contacts to agents (for team members, assistants, etc.)
CREATE TABLE IF NOT EXISTS contact_agents (
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'primary', 'assistant', 'team_member', 'referral_partner'
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (contact_id, agent_id, relationship_type)
);

-- Junction table: contacts to clients
CREATE TABLE IF NOT EXISTS contact_clients (
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'primary', 'spouse', 'co-buyer', 'power_of_attorney'
    is_primary BOOLEAN DEFAULT false,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (contact_id, client_id, relationship_type)
);

-- Junction table: contacts to escrows (replaces escrow_buyers and escrow_sellers)
CREATE TABLE IF NOT EXISTS contact_escrows (
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    escrow_id VARCHAR(50) REFERENCES escrows(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller', 'listing_agent', 'buyer_agent', 'escrow_officer', 'lender', 'inspector', 'other')),
    is_primary BOOLEAN DEFAULT false,
    
    -- Agent-specific fields (only used when role is listing_agent or buyer_agent)
    commission_percentage DECIMAL(5,2),
    commission_amount DECIMAL(15,2),
    commission_notes TEXT,
    
    -- Additional details
    notes TEXT,
    added_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (contact_id, escrow_id, role)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_full_name ON contacts(full_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_team_id ON contacts(team_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(contact_type) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_agents_contact_id ON agents(contact_id);
CREATE INDEX IF NOT EXISTS idx_agents_license_number ON agents(license_number);

CREATE INDEX IF NOT EXISTS idx_clients_contact_id ON clients(contact_id);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_agent ON clients(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

CREATE INDEX IF NOT EXISTS idx_contact_escrows_escrow_id ON contact_escrows(escrow_id);
CREATE INDEX IF NOT EXISTS idx_contact_escrows_contact_id ON contact_escrows(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_escrows_role ON contact_escrows(role);

-- Drop old tables (after data migration in production)
-- For now, we'll just rename them to keep the data
ALTER TABLE IF EXISTS escrow_buyers RENAME TO escrow_buyers_old;
ALTER TABLE IF EXISTS escrow_sellers RENAME TO escrow_sellers_old;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();