# Escrows Table Column Reorganization

## Overview
This migration reorganizes the `escrows` table columns into logical groups that match the API structure, making the database much easier to read and maintain.

## New Column Organization

### 1. Primary Identifiers (Lines 1-4)
```
id                      - UUID primary key
display_id              - Human-readable ID (ESC-2025-0001)
numeric_id              - Auto-incrementing number
team_sequence_id        - Sequential ID within team
```

### 2. Property Information (Lines 5-11)
```
property_address        - Full street address
city                    - City name
state                   - Two-letter state code
property_type           - Single Family, Condo, etc.
property_image_url      - Property photo URL
zillow_url              - Link to Zillow listing
zillow_image_url        - Zillow property image
```

### 3. Financial Data (Lines 12-15)
```
purchase_price          - Sale price
earnest_money_deposit   - EMD amount
down_payment            - Buyer's down payment
loan_amount             - Mortgage amount
```

### 4. Commission Data (Lines 16-21)
```
commission_percentage   - Agent commission % (e.g., 2.5)
gross_commission        - Total commission before fees
net_commission          - Commission after fees
my_commission           - Agent's final take-home
commission_adjustments  - Manual adjustments
expense_adjustments     - Expense adjustments
```

### 5. Timeline/Dates (Lines 22-24)
```
acceptance_date         - Contract acceptance date
closing_date            - Scheduled closing date
actual_coe_date         - Actual close of escrow date
```

### 6. Status & Classification (Lines 25-27)
```
escrow_status           - Active, Pending, Closed, Cancelled
lead_source             - Where the lead came from
avid                    - AVID inspection completed (boolean)
```

### 7. Contact Information (Lines 28-37)
```
escrow_company          - Escrow company name
escrow_officer_name     - Escrow officer
escrow_officer_email    - Escrow officer email
escrow_officer_phone    - Escrow officer phone
title_company           - Title company name
lender_name             - Lender/bank name
loan_officer_name       - Loan officer
loan_officer_email      - Loan officer email
loan_officer_phone      - Loan officer phone
transaction_coordinator - TC name
nhd_company             - Natural hazard disclosure company
```

### 8. JSONB Data Structures (Lines 38-43)
```
people                  - Complex contact data (buyer, seller, agents, etc.)
timeline                - Array of timeline events
financials              - Detailed financial breakdown
checklists              - Task/checklist progress
documents               - Array of document metadata
expenses                - Array of expense items
```

### 9. Ownership & Metadata (Lines 44-48)
```
created_by              - User who created the escrow
team_id                 - Team that owns the escrow
created_at              - Creation timestamp
updated_at              - Last modification timestamp
deleted_at              - Soft delete timestamp
```

## Benefits

### Before (Original Order)
Columns were in seemingly random order, mixing identifiers, dates, contact info, and metadata throughout.

### After (Organized Order)
- **Logical grouping** - Related fields are together
- **Matches API structure** - API responses return data in this order
- **Easier debugging** - Can quickly scan groups when troubleshooting
- **Better documentation** - Column order tells a story of the data
- **Simpler queries** - SELECT * now returns data in a meaningful order

## How to Run Migration

### Option 1: Using psql (Recommended for Production)
```bash
# From project root
PGPASSWORD=your_password psql \
  -h ballast.proxy.rlwy.net \
  -p 20017 \
  -U postgres \
  -d railway \
  -f backend/migrations/reorganize_escrows_columns.sql
```

### Option 2: Using Railway CLI
```bash
railway run psql -f backend/migrations/reorganize_escrows_columns.sql
```

### Option 3: Copy-Paste into Database Tool
Copy the entire SQL content and execute in your database GUI (pgAdmin, DBeaver, etc.)

## Safety Features

This migration:
- ✅ **Uses a transaction** - All changes are atomic (all or nothing)
- ✅ **Copies all data** - No data is lost
- ✅ **Recreates indexes** - All indexes are preserved
- ✅ **Recreates constraints** - Foreign keys and triggers are preserved
- ✅ **Zero downtime possible** - Can run while app is running
- ✅ **Reversible** - Can restore from backup if needed

## What Gets Preserved

- All data (100% copied)
- All indexes (recreated)
- All foreign key constraints (recreated)
- All triggers (updated_at trigger recreated)
- All defaults (copied to new table)
- All NOT NULL constraints (copied to new table)

## Testing After Migration

```sql
-- Verify column count
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name = 'escrows';
-- Should return: 49 columns

-- Verify data count
SELECT COUNT(*) FROM escrows;
-- Should match count before migration

-- Verify new column order
\d escrows

-- Test a simple query
SELECT id, display_id, property_address, purchase_price, escrow_status
FROM escrows
LIMIT 5;
```

## Rollback Plan

If something goes wrong, restore from backup:

```sql
-- Railway auto-backups are available in dashboard
-- Or restore from your manual backup taken before migration
```

## Timeline

- **Preparation**: 1 minute (review this document)
- **Execution**: 5-30 seconds (depends on table size)
- **Verification**: 1 minute (run test queries)
- **Total**: ~3 minutes

## Notes

- This migration does NOT change any column names or types
- This migration does NOT change any data values
- This migration ONLY changes the display order of columns
- All existing queries will continue to work exactly as before
- The API will continue to work exactly as before

The only visible change is when you run `\d escrows` or `SELECT * FROM escrows`, the columns will appear in a more logical, organized order.
