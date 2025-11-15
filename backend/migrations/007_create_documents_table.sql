/**
 * Migration: Create Documents Table
 * Date: 2025-01-14
 * Description: Secure document storage with polymorphic relationships
 */

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  -- Primary Key
  id VARCHAR(20) PRIMARY KEY,  -- doc_xxxxxxxxxxxxx

  -- File Information
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  file_hash VARCHAR(64),  -- SHA-256 for duplicate detection

  -- Storage
  storage_type VARCHAR(20) DEFAULT 'railway_volume',
  storage_path TEXT NOT NULL,
  storage_url TEXT,

  -- Document Classification
  document_type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,

  -- Polymorphic Relationship (links to escrows, listings, clients, etc.)
  related_entity_type VARCHAR(20),  -- 'escrow', 'listing', 'client', 'appointment', 'lead'
  related_entity_id VARCHAR(20),

  -- Access Control
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  visibility VARCHAR(20) DEFAULT 'private',  -- 'private', 'team', 'shared', 'public'
  shared_with JSONB,  -- Array of user_ids or team_ids with access

  -- Metadata
  description TEXT,
  tags TEXT[],
  version INTEGER DEFAULT 1,
  is_template BOOLEAN DEFAULT FALSE,

  -- Compliance & Signatures
  requires_signature BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by UUID REFERENCES users(id),

  -- Lifecycle
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_documents_team ON documents(team_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_entity ON documents(related_entity_type, related_entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_type ON documents(document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_category ON documents(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_created_at ON documents(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_hash ON documents(file_hash) WHERE file_hash IS NOT NULL;

-- Full-text search on filename and description
CREATE INDEX idx_documents_search ON documents USING gin(to_tsvector('english', original_name || ' ' || COALESCE(description, ''))) WHERE deleted_at IS NULL;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Comments for documentation
COMMENT ON TABLE documents IS 'Secure document storage with polymorphic relationships to all entities';
COMMENT ON COLUMN documents.id IS 'Unique document identifier (doc_xxxxxxxxxxxxx)';
COMMENT ON COLUMN documents.related_entity_type IS 'Type of entity this document is attached to (escrow, listing, client, appointment, lead)';
COMMENT ON COLUMN documents.related_entity_id IS 'ID of the related entity';
COMMENT ON COLUMN documents.visibility IS 'Access level: private (owner only), team (owner team), shared (specific users/teams), public (all authenticated)';
COMMENT ON COLUMN documents.shared_with IS 'JSONB array of user_ids or team_ids with access when visibility is shared';
COMMENT ON COLUMN documents.file_hash IS 'SHA-256 hash for duplicate detection and integrity verification';
COMMENT ON COLUMN documents.is_template IS 'True if this document is a reusable template for brokers';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO postgres;
