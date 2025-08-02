-- Migration: Add all RPA timeline dates for comprehensive transaction tracking
-- These dates are typically found in a Residential Purchase Agreement

BEGIN;

-- Add RPA timeline date fields
ALTER TABLE escrows
-- Inspection related dates
ADD COLUMN IF NOT EXISTS inspection_period_end_date DATE,
ADD COLUMN IF NOT EXISTS physical_inspection_date DATE,
ADD COLUMN IF NOT EXISTS termite_inspection_date DATE,
ADD COLUMN IF NOT EXISTS sewer_inspection_date DATE,
ADD COLUMN IF NOT EXISTS pool_spa_inspection_date DATE,
ADD COLUMN IF NOT EXISTS roof_inspection_date DATE,
ADD COLUMN IF NOT EXISTS chimney_inspection_date DATE,

-- Disclosure and report dates
ADD COLUMN IF NOT EXISTS seller_disclosures_due_date DATE,
ADD COLUMN IF NOT EXISTS seller_disclosures_received_date DATE,
ADD COLUMN IF NOT EXISTS preliminary_title_report_date DATE,
ADD COLUMN IF NOT EXISTS nhd_report_date DATE,
ADD COLUMN IF NOT EXISTS hoa_documents_due_date DATE,
ADD COLUMN IF NOT EXISTS hoa_documents_received_date DATE,

-- Loan related dates
ADD COLUMN IF NOT EXISTS loan_application_date DATE,
ADD COLUMN IF NOT EXISTS loan_contingency_removal_date DATE,
ADD COLUMN IF NOT EXISTS appraisal_contingency_removal_date DATE,
ADD COLUMN IF NOT EXISTS appraisal_ordered_date DATE,
ADD COLUMN IF NOT EXISTS appraisal_completed_date DATE,
ADD COLUMN IF NOT EXISTS loan_approval_date DATE,
ADD COLUMN IF NOT EXISTS loan_docs_ordered_date DATE,
ADD COLUMN IF NOT EXISTS loan_docs_signed_date DATE,
ADD COLUMN IF NOT EXISTS loan_funded_date DATE,

-- Contingency removal dates
ADD COLUMN IF NOT EXISTS inspection_contingency_removal_date DATE,
ADD COLUMN IF NOT EXISTS all_contingencies_removal_date DATE,

-- Other important dates
ADD COLUMN IF NOT EXISTS walk_through_date DATE,
ADD COLUMN IF NOT EXISTS recording_date DATE,
ADD COLUMN IF NOT EXISTS possession_date DATE,
ADD COLUMN IF NOT EXISTS rent_back_end_date DATE,

-- Additional timeline tracking
ADD COLUMN IF NOT EXISTS escrow_opened_date DATE,
ADD COLUMN IF NOT EXISTS title_ordered_date DATE,
ADD COLUMN IF NOT EXISTS insurance_ordered_date DATE,
ADD COLUMN IF NOT EXISTS smoke_alarm_installation_date DATE,
ADD COLUMN IF NOT EXISTS termite_completion_date DATE,
ADD COLUMN IF NOT EXISTS repairs_completion_date DATE,
ADD COLUMN IF NOT EXISTS final_verification_date DATE;

-- Add comments for clarity
COMMENT ON COLUMN escrows.inspection_period_end_date IS 'Last day of inspection contingency period (typically 17 days from acceptance)';
COMMENT ON COLUMN escrows.physical_inspection_date IS 'Date of general home inspection';
COMMENT ON COLUMN escrows.loan_contingency_removal_date IS 'Deadline to remove loan contingency (typically 21 days)';
COMMENT ON COLUMN escrows.appraisal_contingency_removal_date IS 'Deadline to remove appraisal contingency (typically 17 days)';
COMMENT ON COLUMN escrows.all_contingencies_removal_date IS 'Date when all contingencies must be removed';
COMMENT ON COLUMN escrows.possession_date IS 'Date buyer takes possession (may differ from COE)';
COMMENT ON COLUMN escrows.rent_back_end_date IS 'If seller rent-back, when it ends';

COMMIT;