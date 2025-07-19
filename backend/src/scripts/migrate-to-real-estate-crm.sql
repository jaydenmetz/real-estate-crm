-- Migration script to move data from realestate_crm to real_estate_crm
-- This handles the schema differences between the two databases

-- Connect to real_estate_crm and insert escrows data
\c real_estate_crm

-- Delete existing test data if any
DELETE FROM escrows;

-- Insert escrows from the other database
INSERT INTO escrows (
    id,
    property_address,
    escrow_status,
    purchase_price,
    earnest_money_deposit,
    down_payment,
    loan_amount,
    commission_percentage,
    gross_commission,
    net_commission,
    acceptance_date,
    closing_date,
    created_at,
    updated_at
)
SELECT 
    id,
    property_address,
    escrow_status,
    purchase_price,
    earnest_money_deposit,
    down_payment,
    loan_amount,
    commission_percentage,
    gross_commission,
    net_commission,
    acceptance_date,
    closing_date,
    created_at,
    updated_at
FROM dblink('dbname=realestate_crm host=localhost user=postgres',
    'SELECT id, property_address, escrow_status, purchase_price, earnest_money_deposit, 
     down_payment, loan_amount, commission_percentage, gross_commission, net_commission,
     acceptance_date, closing_date, created_at, updated_at FROM escrows')
AS t(
    id varchar(50),
    property_address text,
    escrow_status varchar(50),
    purchase_price numeric(12,2),
    earnest_money_deposit numeric(10,2),
    down_payment numeric(10,2),
    loan_amount numeric(12,2),
    commission_percentage numeric(5,2),
    gross_commission numeric(10,2),
    net_commission numeric(10,2),
    acceptance_date date,
    closing_date date,
    created_at timestamptz,
    updated_at timestamptz
);

-- Show the migrated data
SELECT id, property_address, escrow_status, purchase_price, net_commission 
FROM escrows 
ORDER BY created_at DESC;