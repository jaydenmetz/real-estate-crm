# Adding Escrows to Production Database on Railway

## Prerequisites
1. Access to Railway dashboard
2. Your PostgreSQL service in Railway project

## Steps to Add Escrows

### Method 1: Using Railway Dashboard (Easiest)

1. **Go to Railway Dashboard**
   - Login to [Railway](https://railway.app)
   - Navigate to your "real estate crm" project
   - Click on the PostgreSQL service

2. **Open the Data Tab**
   - Click on the "Data" tab in your PostgreSQL service
   - This opens a query interface

3. **Run the SQL Query**
   - Copy and paste this SQL into the query editor:

```sql
-- Add your first escrow
INSERT INTO escrows (
    id,
    escrow_number,
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
    property_type,
    lead_source
)
VALUES 
    ('ESC-2025-001', 'ESC-2025-001', '123 Main Street, Los Angeles, CA 90001', 'Active', 550000, 5500, 110000, 440000, 2.5, 13750, 6875, '2025-07-01', '2025-08-15', 'Single Family', 'Zillow'),
    ('ESC-2025-002', 'ESC-2025-002', '456 Oak Avenue, Beverly Hills, CA 90210', 'Active', 1250000, 12500, 250000, 1000000, 3.0, 37500, 18750, '2025-07-05', '2025-08-20', 'Single Family', 'Referral'),
    ('ESC-2025-003', 'ESC-2025-003', '789 Pine Street, Santa Monica, CA 90405', 'Pending', 875000, 8750, 175000, 700000, 2.5, 21875, 10937.50, '2025-07-10', '2025-09-01', 'Condo', 'Website'),
    ('ESC-2025-004', 'ESC-2025-004', '321 Elm Drive, Pasadena, CA 91101', 'Active', 725000, 7250, 145000, 580000, 2.75, 19937.50, 9968.75, '2025-07-12', '2025-08-25', 'Single Family', 'Open House'),
    ('ESC-2025-005', 'ESC-2025-005', '654 Maple Court, Malibu, CA 90265', 'Active', 2500000, 25000, 500000, 2000000, 2.5, 62500, 31250, '2025-07-15', '2025-09-15', 'Single Family', 'MLS'),
    ('ESC-2025-006', 'ESC-2025-006', '987 Beach Road, Venice, CA 90291', 'Pending', 920000, 9200, 184000, 736000, 2.5, 23000, 11500, '2025-07-08', '2025-08-30', 'Townhouse', 'Realtor.com'),
    ('ESC-2025-007', 'ESC-2025-007', '111 Sunset Blvd, West Hollywood, CA 90069', 'Active', 1100000, 11000, 220000, 880000, 3.0, 33000, 16500, '2025-07-18', '2025-09-05', 'Condo', 'Referral'),
    ('ESC-2025-008', 'ESC-2025-008', '222 Valley View, Sherman Oaks, CA 91403', 'Closed', 680000, 6800, 136000, 544000, 2.5, 17000, 8500, '2025-06-01', '2025-07-15', 'Single Family', 'Zillow'),
    ('ESC-2025-009', 'ESC-2025-009', '333 Hillside Dr, Glendale, CA 91206', 'Active', 825000, 8250, 165000, 660000, 3.0, 24750, 12375, '2025-07-20', '2025-09-10', 'Single Family', 'Website'),
    ('ESC-2025-010', 'ESC-2025-010', '444 Ocean Park, Manhattan Beach, CA 90266', 'Active', 1950000, 19500, 390000, 1560000, 2.5, 48750, 24375, '2025-07-22', '2025-09-20', 'Single Family', 'MLS'),
    ('ESC-RAILWAY-001', 'ESC-RAILWAY-001', '567 Railway Test Avenue, Los Angeles, CA 90001', 'Active', 750000, 7500, 150000, 600000, 2.5, 18750, 9375, '2025-07-21', '2025-08-31', 'Single Family', 'Test Data');

-- Verify they were added
SELECT COUNT(*) as total_escrows FROM escrows;
```

4. **Execute the Query**
   - Click "Run Query" or press Ctrl+Enter
   - You should see "11 rows affected" or similar

5. **Verify the Data**
   - Run this query to see all escrows:
   ```sql
   SELECT id, property_address, escrow_status, purchase_price FROM escrows ORDER BY created_at DESC;
   ```

### Method 2: Using Railway CLI (If Method 1 doesn't work)

1. **Get your DATABASE_URL**
   - In Railway dashboard, go to PostgreSQL service
   - Go to "Connect" tab
   - Copy the Postgres Connection URL

2. **Run the command**
   ```bash
   cd /Users/jaydenmetz/Desktop/real-estate-crm/backend
   
   # Set the DATABASE_URL (replace with your actual URL)
   export DATABASE_URL="postgresql://postgres:PASSWORD@HOST.railway.app:PORT/railway"
   
   # Run the Node.js script
   node scripts/quick-add-railway-escrow.js
   ```

### Verification

After adding the escrows:

1. **Check the API**
   - Visit: https://api.jaydenmetz.com/v1/escrows
   - Should return success with 11 escrows

2. **Check the Frontend**
   - Visit: https://crm.jaydenmetz.com/escrows
   - Should display all 11 escrows

## Troubleshooting

If escrows still don't appear:

1. **Wait for deployment** - The backend fix needs to deploy (usually takes 2-3 minutes)
2. **Check API directly** - https://api.jaydenmetz.com/v1/escrows
3. **Hard refresh the frontend** - Ctrl+Shift+R or Cmd+Shift+R
4. **Check Railway logs** for any database connection errors

## Important Notes

- The backend fix has been pushed and will deploy automatically
- Once deployed, the API will use the correct database connection
- The frontend is already configured correctly and will display escrows once the API returns them