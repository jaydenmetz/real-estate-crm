-- Add additional tables for listings functionality
-- Created: 2025-01-17

-- Price history table for tracking price changes
CREATE TABLE IF NOT EXISTS listing_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    old_price DECIMAL(12,2) NOT NULL,
    new_price DECIMAL(12,2) NOT NULL,
    reason VARCHAR(255),
    effective_date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Showings table for tracking property showings
CREATE TABLE IF NOT EXISTS listing_showings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    showing_date DATE NOT NULL,
    showing_time TIME NOT NULL,
    agent_name VARCHAR(255),
    agent_email VARCHAR(255),
    agent_phone VARCHAR(20),
    feedback TEXT,
    interested BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Marketing checklist table
CREATE TABLE IF NOT EXISTS listing_marketing_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    checklist_item VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, checklist_item)
);

-- Listing analytics table for tracking views, favorites, etc.
CREATE TABLE IF NOT EXISTS listing_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'view', 'favorite', 'share', 'inquiry'
    event_date DATE DEFAULT CURRENT_DATE,
    event_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, event_type, event_date)
);

-- Add commission fields to listings table if not exists
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_commission DECIMAL(5,2) DEFAULT 3.0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS buyer_commission DECIMAL(5,2) DEFAULT 2.5;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS total_commission DECIMAL(5,2) GENERATED ALWAYS AS (listing_commission + buyer_commission) STORED;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_link TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS professional_photos BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS drone_photos BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS video_walkthrough BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_price_history_listing ON listing_price_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON listing_price_history(effective_date);
CREATE INDEX IF NOT EXISTS idx_showings_listing ON listing_showings(listing_id);
CREATE INDEX IF NOT EXISTS idx_showings_date ON listing_showings(showing_date);
CREATE INDEX IF NOT EXISTS idx_marketing_listing ON listing_marketing_checklist(listing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_listing ON listing_analytics(listing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON listing_analytics(event_date);

-- Add trigger for marketing checklist updated_at
CREATE TRIGGER update_marketing_checklist_updated_at 
BEFORE UPDATE ON listing_marketing_checklist 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();