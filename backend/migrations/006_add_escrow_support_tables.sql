-- Migration: Add Escrow Support Tables
-- Description: Create checklist and timeline tables for escrows
-- Date: 2025-01-18

-- Create escrow checklist table
CREATE TABLE IF NOT EXISTS escrow_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id VARCHAR(50) REFERENCES escrows(id) ON DELETE CASCADE,
    task VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_date TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id),
    notes TEXT,
    due_date DATE,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create escrow timeline table
CREATE TABLE IF NOT EXISTS escrow_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id VARCHAR(50) REFERENCES escrows(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_escrow_checklist_escrow_id ON escrow_checklist(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_checklist_completed ON escrow_checklist(completed);
CREATE INDEX IF NOT EXISTS idx_escrow_timeline_escrow_id ON escrow_timeline(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_timeline_event_date ON escrow_timeline(event_date);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_escrow_checklist_updated_at BEFORE UPDATE ON escrow_checklist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();