-- Migration: User and Broker Profile System for Document Automation
-- Purpose: Store agent/broker license info and document template data (like Glide signing service)
-- Date: 2025-10-02

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
-- Stores complete agent/broker information for document automation
-- Each user has ONE profile with license details and document signing info

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- License Information (DRE/State License)
  license_number VARCHAR(50), -- CA DRE format: 01234567 (8 digits)
  license_state VARCHAR(2) DEFAULT 'CA', -- State code
  license_type VARCHAR(50) DEFAULT 'salesperson', -- 'salesperson', 'broker', 'broker_associate'
  license_status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended', 'expired'
  license_expiration_date DATE, -- License expiration

  -- DRE Verification
  dre_verified BOOLEAN DEFAULT false, -- Verified via public DRE lookup
  dre_verified_at TIMESTAMP WITH TIME ZONE, -- When verification occurred
  dre_verification_data JSONB, -- Store DRE lookup response

  -- Personal Information for Documents
  full_legal_name VARCHAR(255), -- Legal name on license
  preferred_name VARCHAR(255), -- Display name for documents
  business_name VARCHAR(255), -- DBA or team name
  title VARCHAR(100), -- "Realtor®", "Broker Associate", "Managing Broker"

  -- Contact Information (for document headers/footers)
  office_phone VARCHAR(20),
  mobile_phone VARCHAR(20),
  fax VARCHAR(20),
  email_signature VARCHAR(255), -- Email for document signatures
  website VARCHAR(255),

  -- Office Address (for documents)
  office_address_line1 VARCHAR(255),
  office_address_line2 VARCHAR(255),
  office_city VARCHAR(100),
  office_state VARCHAR(2) DEFAULT 'CA',
  office_zip VARCHAR(10),

  -- Mailing Address (if different)
  mailing_address_line1 VARCHAR(255),
  mailing_address_line2 VARCHAR(255),
  mailing_city VARCHAR(100),
  mailing_state VARCHAR(2),
  mailing_zip VARCHAR(10),

  -- Professional Designations
  designations TEXT[], -- ['GRI', 'ABR', 'CRS', 'SRES']
  professional_memberships TEXT[], -- ['CAR', 'NAR', 'Local MLS']

  -- Broker Association (who they hang their license with)
  supervising_broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
  broker_association_date DATE, -- When they joined this brokerage
  broker_relationship_type VARCHAR(50) DEFAULT 'agent', -- 'agent', 'broker_owner', 'independent_contractor'

  -- Document Signature Settings
  signature_image_url TEXT, -- S3/CDN URL to signature image
  initials_image_url TEXT, -- S3/CDN URL to initials image
  seal_image_url TEXT, -- Broker seal if applicable

  -- E-Signature Preferences
  esign_consent BOOLEAN DEFAULT false,
  esign_consent_date TIMESTAMP WITH TIME ZONE,
  preferred_signing_service VARCHAR(50), -- 'glide', 'docusign', 'manual'

  -- Additional Settings
  settings JSONB DEFAULT '{}'::jsonb, -- Flexible settings storage

  -- Metadata
  is_public BOOLEAN DEFAULT false, -- Show on public team page
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_license_number ON user_profiles(license_number) WHERE license_number IS NOT NULL;
CREATE INDEX idx_user_profiles_license_state ON user_profiles(license_state);
CREATE INDEX idx_user_profiles_supervising_broker ON user_profiles(supervising_broker_id) WHERE supervising_broker_id IS NOT NULL;
CREATE INDEX idx_user_profiles_dre_verified ON user_profiles(dre_verified);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- ============================================================================
-- BROKER PROFILES TABLE (for document template data)
-- ============================================================================
-- Stores broker information that auto-fills in agent documents
-- This is the "broker text fields" that fill in the same way every time

CREATE TABLE IF NOT EXISTS broker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL UNIQUE REFERENCES brokers(id) ON DELETE CASCADE,

  -- Broker License Information (for documents)
  broker_license_number VARCHAR(50), -- CA DRE broker license
  broker_license_state VARCHAR(2) DEFAULT 'CA',
  broker_license_expiration DATE,

  -- Designated Officer/Responsible Broker
  designated_officer_name VARCHAR(255), -- Josh Riley
  designated_officer_license VARCHAR(50), -- 01365477
  designated_officer_title VARCHAR(100), -- "Designated Officer"

  -- Corporation/Entity Information
  entity_type VARCHAR(50), -- 'corporation', 'llc', 'sole_proprietor', 'partnership'
  dba_name VARCHAR(255), -- Doing Business As
  corporation_number VARCHAR(50), -- CA Secretary of State corp number
  federal_tax_id VARCHAR(20), -- EIN for tax forms

  -- Main Office Address (for documents)
  main_office_address_line1 VARCHAR(255),
  main_office_address_line2 VARCHAR(255),
  main_office_city VARCHAR(100),
  main_office_state VARCHAR(2) DEFAULT 'CA',
  main_office_zip VARCHAR(10),
  main_office_phone VARCHAR(20),
  main_office_fax VARCHAR(20),

  -- Branch Offices (JSONB array)
  branch_offices JSONB DEFAULT '[]'::jsonb, -- [{name, address, phone, broker_in_charge}]

  -- Errors & Omissions Insurance
  eo_insurance_carrier VARCHAR(255),
  eo_insurance_policy_number VARCHAR(100),
  eo_insurance_expiration DATE,
  eo_insurance_coverage_amount NUMERIC(12,2),

  -- Trust Account Information (for earnest money)
  trust_account_bank VARCHAR(255),
  trust_account_name VARCHAR(255),
  trust_account_number VARCHAR(100), -- Encrypted/masked
  trust_account_routing VARCHAR(20),

  -- Document Template Fields
  template_footer_text TEXT, -- Standard footer for all documents
  template_disclosure_text TEXT, -- Standard disclosure language
  template_letterhead_url TEXT, -- URL to letterhead image
  template_logo_url TEXT, -- URL to broker logo

  -- Compliance & Legal
  required_disclosures JSONB DEFAULT '[]'::jsonb, -- Standard disclosures for all transactions
  contract_addendums JSONB DEFAULT '[]'::jsonb, -- Standard addendums

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_broker_profiles_broker_id ON broker_profiles(broker_id);
CREATE INDEX idx_broker_profiles_broker_license ON broker_profiles(broker_license_number) WHERE broker_license_number IS NOT NULL;

-- Updated_at trigger
CREATE TRIGGER update_broker_profiles_updated_at_trigger
  BEFORE UPDATE ON broker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- ============================================================================
-- DOCUMENT TEMPLATES TABLE
-- ============================================================================
-- Store fillable document templates with merge fields

CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE, -- Broker-specific templates

  -- Template Information
  name VARCHAR(255) NOT NULL, -- "Purchase Agreement (CAR Form RPA-CA)"
  description TEXT,
  document_type VARCHAR(100), -- 'purchase_agreement', 'listing_agreement', 'lease', 'disclosure'
  form_number VARCHAR(50), -- "RPA-CA", "RLA-11", etc.

  -- Template File
  template_url TEXT, -- S3/CDN URL to PDF template
  file_format VARCHAR(20) DEFAULT 'pdf', -- 'pdf', 'docx', 'html'
  version VARCHAR(20), -- Form version (e.g., "Revised 2023")

  -- Merge Fields Definition
  merge_fields JSONB DEFAULT '[]'::jsonb, -- [{ field: "agent.name", label: "Agent Name", type: "text" }]

  -- Usage Tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_document_templates_broker_id ON document_templates(broker_id) WHERE broker_id IS NOT NULL;
CREATE INDEX idx_document_templates_document_type ON document_templates(document_type);
CREATE INDEX idx_document_templates_is_active ON document_templates(is_active);

-- Updated_at trigger
CREATE TRIGGER update_document_templates_updated_at_trigger
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- ============================================================================
-- GENERATED DOCUMENTS TABLE
-- ============================================================================
-- Track generated/filled documents for each transaction

CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,

  -- Associated Records
  escrow_id VARCHAR(255) REFERENCES escrows(id) ON DELETE CASCADE, -- escrows.id is VARCHAR
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  -- Document Information
  document_name VARCHAR(255) NOT NULL,
  document_url TEXT NOT NULL, -- Final document URL
  file_size_bytes INTEGER,

  -- Merge Data Used
  merge_data JSONB DEFAULT '{}'::jsonb, -- The actual data merged into template

  -- Signing Status
  signing_status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent_for_signature', 'partially_signed', 'fully_signed'
  signing_service VARCHAR(50), -- 'glide', 'docusign', 'manual'
  signing_service_envelope_id VARCHAR(255), -- External service ID

  -- Signers
  signers JSONB DEFAULT '[]'::jsonb, -- [{name, email, role, signed_at, ip_address}]

  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_generated_documents_template_id ON generated_documents(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_generated_documents_escrow_id ON generated_documents(escrow_id) WHERE escrow_id IS NOT NULL;
CREATE INDEX idx_generated_documents_listing_id ON generated_documents(listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX idx_generated_documents_client_id ON generated_documents(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_generated_documents_signing_status ON generated_documents(signing_status);
CREATE INDEX idx_generated_documents_created_by ON generated_documents(created_by);

-- Updated_at trigger
CREATE TRIGGER update_generated_documents_updated_at_trigger
  BEFORE UPDATE ON generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_profiles IS 'Complete agent/broker profile for document automation - like Glide signing service';
COMMENT ON COLUMN user_profiles.license_type IS 'salesperson: has license but not broker status, broker: has broker license, broker_associate: broker licensed but works under another broker';
COMMENT ON COLUMN user_profiles.broker_relationship_type IS 'Defines how this user relates to their supervising broker';

COMMENT ON TABLE broker_profiles IS 'Broker information that auto-fills in all agent documents - the "text fields that fill the same way every time"';
COMMENT ON COLUMN broker_profiles.designated_officer_name IS 'Required for CA corporations - the broker of record';

COMMENT ON TABLE document_templates IS 'Fillable document templates with merge field definitions';
COMMENT ON TABLE generated_documents IS 'Final documents generated from templates with signature tracking';
