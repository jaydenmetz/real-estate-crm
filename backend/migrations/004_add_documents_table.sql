-- Drop existing documents table if it exists (to ensure clean state)
DROP TABLE IF EXISTS documents CASCADE;

-- Create documents table for file uploads
CREATE TABLE documents (
  id VARCHAR(50) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  storage JSONB DEFAULT '{"location": "local"}',
  variants JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  category VARCHAR(50) DEFAULT 'general',
  description TEXT,
  alt_text VARCHAR(255),
  tags TEXT[],
  uploaded_by VARCHAR(50) NOT NULL,
  related_to JSONB DEFAULT '{}',
  visibility VARCHAR(20) DEFAULT 'team',
  shared_with JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active',
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint on filename
ALTER TABLE documents ADD CONSTRAINT uk_documents_filename UNIQUE (filename);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_related_to ON documents USING GIN (related_to);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN (tags);

-- Add check constraint for valid categories
ALTER TABLE documents ADD CONSTRAINT chk_documents_category 
  CHECK (category IN ('general', 'property', 'contract', 'identification', 'financial', 'marketing', 'other'));

-- Add check constraint for valid visibility
ALTER TABLE documents ADD CONSTRAINT chk_documents_visibility 
  CHECK (visibility IN ('private', 'team', 'public'));

-- Add check constraint for valid status
ALTER TABLE documents ADD CONSTRAINT chk_documents_status 
  CHECK (status IN ('active', 'archived', 'deleted'));