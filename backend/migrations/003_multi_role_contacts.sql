-- ============================================================================
-- MULTI-ROLE CONTACTS SYSTEM MIGRATION
-- Created: October 23, 2025
-- Purpose: Enable contacts to have multiple roles (lead + client + vendor, etc.)
-- ============================================================================

-- ============================================================================
-- STEP 1: Create contact_roles lookup table
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Role identification
    role_name VARCHAR(50) NOT NULL UNIQUE,    -- 'lead', 'client', 'loan_officer', etc.
    display_name VARCHAR(100) NOT NULL,       -- 'Lead', 'Loan Officer', 'Home Inspector'
    description TEXT,

    -- UI metadata
    icon VARCHAR(50),                         -- Material-UI icon name
    color VARCHAR(7),                         -- Hex color for chips (#2196f3)

    -- Field validation rules (JSONB for flexibility)
    required_fields JSONB DEFAULT '[]'::jsonb,    -- Fields that MUST be filled for this role
    optional_fields JSONB DEFAULT '[]'::jsonb,    -- Fields that are nice-to-have
    hidden_fields JSONB DEFAULT '[]'::jsonb,      -- Fields to hide for this role

    -- Lead type metadata (for lead role only)
    is_lead_type BOOLEAN DEFAULT false,           -- Is this a lead type (buyer vs seller)?
    lead_category VARCHAR(50),                    -- 'buyer', 'seller', 'both', null

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_roles_active ON contact_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_roles_sort ON contact_roles(sort_order);


-- ============================================================================
-- STEP 2: Create contact_role_assignments junction table
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Links contact to role
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES contact_roles(id),

    -- Primary role tracking (first role assigned to contact)
    is_primary BOOLEAN DEFAULT false,

    -- Role-specific metadata (JSONB for flexibility per role)
    role_metadata JSONB DEFAULT '{}'::jsonb,
    -- Examples:
    --   Lead: {"source": "Zillow", "source_date": "2025-10-23", "budget": "$500k", "lead_type": "buyer"}
    --   Client: {"contract_date": "2025-10-25", "converted_from_lead": true, "lead_type": "buyer"}
    --   Loan Officer: {"company": "Wells Fargo", "specialty": "FHA loans"}
    --   Inspector: {"company": "ABC Inspections", "license_number": "CA-12345"}

    -- Lifecycle tracking
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    archived_at TIMESTAMP,

    -- Unique constraint: contact can only have each role once
    CONSTRAINT unique_contact_role UNIQUE (contact_id, role_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_cra_contact ON contact_role_assignments(contact_id);
CREATE INDEX IF NOT EXISTS idx_cra_role ON contact_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_cra_active ON contact_role_assignments(contact_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cra_primary ON contact_role_assignments(contact_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_cra_metadata ON contact_role_assignments USING gin(role_metadata);


-- ============================================================================
-- STEP 3: Create preferences table (broker > team > user hierarchy)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_validation_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Scope (who does this apply to?)
    scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('user', 'team', 'broker')),
    scope_id UUID NOT NULL,  -- References user_id, team_id, or broker_id

    -- Which role is being customized?
    role_id UUID REFERENCES contact_roles(id),

    -- Custom validation overrides (adds to base requirements, doesn't remove)
    additional_required_fields JSONB DEFAULT '[]'::jsonb,
    additional_optional_fields JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),

    -- Unique constraint: one preference per scope+role combo
    CONSTRAINT unique_scope_role_pref UNIQUE (scope_type, scope_id, role_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cvp_scope ON contact_validation_preferences(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_cvp_role ON contact_validation_preferences(role_id);


-- ============================================================================
-- STEP 4: Seed contact_roles with your required roles
-- ============================================================================

-- Helper function to insert roles (prevents duplicates on re-run)
CREATE OR REPLACE FUNCTION insert_contact_role(
    p_role_name VARCHAR(50),
    p_display_name VARCHAR(100),
    p_description TEXT,
    p_icon VARCHAR(50),
    p_color VARCHAR(7),
    p_required_fields JSONB,
    p_optional_fields JSONB,
    p_hidden_fields JSONB,
    p_sort_order INTEGER,
    p_is_lead_type BOOLEAN DEFAULT false,
    p_lead_category VARCHAR(50) DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO contact_roles (
        role_name, display_name, description, icon, color,
        required_fields, optional_fields, hidden_fields, sort_order,
        is_lead_type, lead_category
    ) VALUES (
        p_role_name, p_display_name, p_description, p_icon, p_color,
        p_required_fields, p_optional_fields, p_hidden_fields, p_sort_order,
        p_is_lead_type, p_lead_category
    )
    ON CONFLICT (role_name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        color = EXCLUDED.color,
        required_fields = EXCLUDED.required_fields,
        optional_fields = EXCLUDED.optional_fields,
        hidden_fields = EXCLUDED.hidden_fields,
        sort_order = EXCLUDED.sort_order,
        is_lead_type = EXCLUDED.is_lead_type,
        lead_category = EXCLUDED.lead_category,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;


-- Insert all roles (order matters for UI dropdowns)

-- LEAD (Buyer): Prospect who wants to BUY property
SELECT insert_contact_role(
    'lead_buyer',
    'Lead (Buyer)',
    'Potential buyer prospect, has not signed buyer agreement',
    'PersonSearch',
    '#2196f3',
    '["source", "lead_type"]'::jsonb,                   -- MUST capture source + lead type
    '["budget", "property_type", "timeline", "pre_approved"]'::jsonb,
    '[]'::jsonb,
    1,
    true,
    'buyer'
);

-- LEAD (Seller): Prospect who wants to SELL property
SELECT insert_contact_role(
    'lead_seller',
    'Lead (Seller)',
    'Potential seller prospect, has not signed listing agreement',
    'Sell',
    '#f44336',
    '["source", "lead_type"]'::jsonb,
    '["property_address", "estimated_value", "timeline"]'::jsonb,
    '[]'::jsonb,
    2,
    true,
    'seller'
);

-- CLIENT: Signed buyer or seller agreement (converted from lead)
SELECT insert_contact_role(
    'client',
    'Client',
    'Active client with signed buyer or seller agreement',
    'PersonOutline',
    '#4caf50',
    '[]'::jsonb,                                        -- Don't require source again (inherited)
    '["preferred_areas", "max_price", "contract_date"]'::jsonb,
    '["source"]'::jsonb,                                -- Hide source field (already captured as lead)
    3
);

-- LOAN OFFICER: Mortgage lender or loan officer
SELECT insert_contact_role(
    'loan_officer',
    'Loan Officer',
    'Mortgage lender or loan officer',
    'AccountBalance',
    '#9c27b0',
    '["company"]'::jsonb,                               -- MUST have company
    '["license_number", "specialty", "preferred_loan_types"]'::jsonb,
    '["source", "lead_type"]'::jsonb,                   -- Don't ask for lead fields
    4
);

-- ESCROW OFFICER: Title/escrow company contact
SELECT insert_contact_role(
    'escrow_officer',
    'Escrow Officer',
    'Title and escrow services contact',
    'Description',
    '#795548',
    '["company"]'::jsonb,
    '["license_number", "preferred_title_company"]'::jsonb,
    '["source", "lead_type"]'::jsonb,
    5
);

-- HOME INSPECTOR: General home inspector
SELECT insert_contact_role(
    'home_inspector',
    'Home Inspector',
    'General home inspection professional',
    'Search',
    '#00bcd4',
    '["company", "license_number"]'::jsonb,             -- MUST have both
    '["specialty", "coverage_area", "insurance_info"]'::jsonb,
    '["source", "lead_type"]'::jsonb,
    6
);

-- TERMITE INSPECTOR: Pest/termite inspection specialist
SELECT insert_contact_role(
    'termite_inspector',
    'Termite Inspector',
    'Pest and termite inspection specialist',
    'BugReport',
    '#8bc34a',
    '["company", "license_number"]'::jsonb,
    '["coverage_area", "insurance_info"]'::jsonb,
    '["source", "lead_type"]'::jsonb,
    7
);

-- AGENT: Other real estate agent (not you)
SELECT insert_contact_role(
    'agent',
    'Agent',
    'Real estate agent (representing other party)',
    'Badge',
    '#3f51b5',
    '["company", "license_number"]'::jsonb,             -- Agents must be licensed
    '["brokerage", "specialty"]'::jsonb,
    '["source", "lead_type"]'::jsonb,
    8
);

-- BROKER: Real estate broker (other brokerages)
SELECT insert_contact_role(
    'broker',
    'Broker',
    'Real estate broker (other brokerage)',
    'Business',
    '#673ab7',
    '["company", "license_number"]'::jsonb,
    '["brokerage", "office_address"]'::jsonb,
    '["source", "lead_type"]'::jsonb,
    9
);

-- TRANSACTION COORDINATOR: TC for other agents
SELECT insert_contact_role(
    'transaction_coordinator',
    'Transaction Coordinator',
    'Transaction coordinator for other agents',
    'Assignment',
    '#ff9800',
    '["company"]'::jsonb,
    '["preferred_agents", "coverage_area"]'::jsonb,
    '["source", "lead_type", "license_number"]'::jsonb,
    10
);

-- HANDYMAN: General handyman services
SELECT insert_contact_role(
    'handyman',
    'Handyman',
    'General handyman and minor repair services',
    'Handyman',
    '#ff5722',
    '[]'::jsonb,                                        -- No license required
    '["company", "specialty", "hourly_rate"]'::jsonb,
    '["source", "lead_type", "license_number"]'::jsonb,
    11
);

-- LICENSED CONTRACTOR: State-licensed contractor
SELECT insert_contact_role(
    'contractor',
    'Licensed Contractor',
    'State-licensed general or specialty contractor',
    'Construction',
    '#e91e63',
    '["company", "license_number"]'::jsonb,             -- MUST be licensed
    '["specialty", "insurance_info", "bond_info"]'::jsonb,
    '["source", "lead_type"]'::jsonb,
    12
);

-- PHOTOGRAPHER: Real estate photographer
SELECT insert_contact_role(
    'photographer',
    'Photographer',
    'Real estate photographer and media services',
    'CameraAlt',
    '#ffc107',
    '[]'::jsonb,
    '["company", "services_offered", "pricing"]'::jsonb, -- drone, video, 3D, etc.
    '["source", "lead_type", "license_number"]'::jsonb,
    13
);

-- APPRAISER: Licensed property appraiser
SELECT insert_contact_role(
    'appraiser',
    'Appraiser',
    'Licensed property appraiser',
    'Assessment',
    '#607d8b',
    '["company", "license_number"]'::jsonb,
    '["coverage_area", "specialty"]'::jsonb,
    '["source", "lead_type"]'::jsonb,
    14
);

-- Drop helper function (cleanup)
DROP FUNCTION IF EXISTS insert_contact_role;


-- ============================================================================
-- STEP 5: Migrate existing contacts data
-- ============================================================================

-- Migrate contacts with contact_type = 'buyer' to lead_buyer role
INSERT INTO contact_role_assignments (contact_id, role_id, is_primary, role_metadata)
SELECT
    c.id,
    cr.id,
    true,  -- Primary role
    jsonb_build_object(
        'migrated_from', 'buyer',
        'migration_date', CURRENT_TIMESTAMP,
        'lead_type', 'buyer'
    )
FROM contacts c
JOIN contact_roles cr ON cr.role_name = 'lead_buyer'
WHERE c.contact_type = 'buyer'
ON CONFLICT (contact_id, role_id) DO NOTHING;

-- Migrate contacts with contact_type = 'seller' to lead_seller role
INSERT INTO contact_role_assignments (contact_id, role_id, is_primary, role_metadata)
SELECT
    c.id,
    cr.id,
    true,
    jsonb_build_object(
        'migrated_from', 'seller',
        'migration_date', CURRENT_TIMESTAMP,
        'lead_type', 'seller'
    )
FROM contacts c
JOIN contact_roles cr ON cr.role_name = 'lead_seller'
WHERE c.contact_type = 'seller'
ON CONFLICT (contact_id, role_id) DO NOTHING;

-- Migrate contacts with contact_type = 'client' to client role
INSERT INTO contact_role_assignments (contact_id, role_id, is_primary, role_metadata)
SELECT
    c.id,
    cr.id,
    true,
    jsonb_build_object(
        'migrated_from', 'client',
        'migration_date', CURRENT_TIMESTAMP
    )
FROM contacts c
JOIN contact_roles cr ON cr.role_name = 'client'
WHERE c.contact_type = 'client'
ON CONFLICT (contact_id, role_id) DO NOTHING;


-- ============================================================================
-- STEP 6: Drop old contact_type column (after verification!)
-- ============================================================================

-- IMPORTANT: Run this AFTER you've verified the migration worked correctly!
-- Uncomment the line below when you're ready:

-- ALTER TABLE contacts DROP COLUMN IF EXISTS contact_type;


-- ============================================================================
-- STEP 7: Create helper views for common queries
-- ============================================================================

-- View: contacts with their primary role
CREATE OR REPLACE VIEW contacts_with_primary_role AS
SELECT
    c.*,
    cr.role_name AS primary_role_name,
    cr.display_name AS primary_role_display_name,
    cr.color AS primary_role_color,
    cra.role_metadata AS primary_role_metadata,
    cra.assigned_at AS role_assigned_at
FROM contacts c
LEFT JOIN contact_role_assignments cra ON c.id = cra.contact_id AND cra.is_primary = true
LEFT JOIN contact_roles cr ON cra.role_id = cr.id
WHERE c.deleted_at IS NULL;

-- View: contacts with all their roles (expanded)
CREATE OR REPLACE VIEW contacts_with_all_roles AS
SELECT
    c.id AS contact_id,
    c.first_name,
    c.last_name,
    c.full_name,
    c.email,
    c.phone,
    c.company,
    cr.role_name,
    cr.display_name AS role_display_name,
    cr.color AS role_color,
    cra.is_primary,
    cra.role_metadata,
    cra.assigned_at AS role_assigned_at,
    cra.is_active AS role_is_active
FROM contacts c
JOIN contact_role_assignments cra ON c.id = cra.contact_id
JOIN contact_roles cr ON cra.role_id = cr.role_id
WHERE c.deleted_at IS NULL
  AND cra.is_active = true
ORDER BY c.last_name, c.first_name, cra.is_primary DESC, cra.assigned_at ASC;


-- ============================================================================
-- VERIFICATION QUERIES (Run these to check migration)
-- ============================================================================

-- Check: How many contacts were migrated per role?
-- SELECT
--     cr.display_name,
--     COUNT(*) AS contact_count
-- FROM contact_role_assignments cra
-- JOIN contact_roles cr ON cra.role_id = cr.role_id
-- WHERE cra.role_metadata->>'migrated_from' IS NOT NULL
-- GROUP BY cr.display_name
-- ORDER BY contact_count DESC;

-- Check: View all contacts with their roles
-- SELECT * FROM contacts_with_all_roles LIMIT 10;

-- Check: Find contacts with multiple roles (should be 0 after fresh migration)
-- SELECT
--     contact_id,
--     full_name,
--     COUNT(*) AS role_count,
--     array_agg(role_display_name) AS roles
-- FROM contacts_with_all_roles
-- GROUP BY contact_id, full_name
-- HAVING COUNT(*) > 1;


-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary:
-- ✅ Created contact_roles table (14 roles)
-- ✅ Created contact_role_assignments junction table
-- ✅ Created contact_validation_preferences table
-- ✅ Seeded 14 contact roles (lead_buyer, lead_seller, client, loan_officer, etc.)
-- ✅ Migrated existing contacts (buyer → lead_buyer, seller → lead_seller, client → client)
-- ✅ Created helper views for queries
-- ⏳ contact_type column NOT dropped yet (uncomment Step 6 after verification)

COMMIT;
