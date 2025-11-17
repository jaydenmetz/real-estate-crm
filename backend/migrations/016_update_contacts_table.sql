-- Update contacts table to match our API requirements
-- Migration: 022_update_contacts_table.sql
-- Date: October 2025

-- Add user_id column if it doesn't exist
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add broker_id column if it doesn't exist
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE;

-- Add phone_secondary column (rename from mobile_phone)
ALTER TABLE contacts
RENAME COLUMN mobile_phone TO phone_secondary;

-- Add license_number column if it doesn't exist
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS license_number VARCHAR(50);

-- Add street_address column (rename from address_street)
ALTER TABLE contacts
RENAME COLUMN address_street TO street_address;

-- Add city column (rename from address_city)
ALTER TABLE contacts
RENAME COLUMN address_city TO city;

-- Add state column (rename from address_state)
ALTER TABLE contacts
RENAME COLUMN address_state TO state;

-- Add zip_code column (rename from address_zip)
ALTER TABLE contacts
RENAME COLUMN address_zip TO zip_code;

-- Add is_archived column (rename from deleted_at logic)
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add archived_at column
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Rename company_name to company
ALTER TABLE contacts
RENAME COLUMN company_name TO company;

-- Update contact_type check constraint to include more types
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_contact_type_check;
ALTER TABLE contacts ADD CONSTRAINT contacts_contact_type_check
CHECK (contact_type IN ('buyer', 'seller', 'agent', 'lender', 'title_officer', 'inspector', 'appraiser', 'contractor', 'client', 'vendor', 'other'));

-- Add search_vector column for full text search
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('english',
    coalesce(first_name, '') || ' ' ||
    coalesce(last_name, '') || ' ' ||
    coalesce(email, '') || ' ' ||
    coalesce(company, '')
  )
) STORED;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_broker_id ON contacts(broker_id);
CREATE INDEX IF NOT EXISTS idx_contacts_archived ON contacts(is_archived);
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts USING GIN(search_vector);

-- Update created_by to be user_id if not set
UPDATE contacts
SET user_id = created_by
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- Set default user_id for contacts without one (use the admin user)
UPDATE contacts
SET user_id = (SELECT id FROM users WHERE email = 'admin@jaydenmetz.com' LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after populating
ALTER TABLE contacts
ALTER COLUMN user_id SET NOT NULL;

COMMENT ON COLUMN contacts.user_id IS 'Owner of this contact record';
COMMENT ON COLUMN contacts.search_vector IS 'Full text search index for name, email, company';