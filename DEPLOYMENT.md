# Production Deployment Steps for Escrow Feature

## Backend Deployment

1. **Deploy the updated backend code** that includes:
   - `/backend/src/controllers/escrowController.simple.js`
   - Updated `/backend/src/routes/escrows.js`

2. **Run database migrations** on production:
   ```sql
   -- First, backup your production database!
   
   -- Then run the schema changes:
   psql -U your_prod_user -d your_prod_db < backend/src/scripts/simplify-escrows-schema.sql
   
   -- Optionally, insert mock data (if you want it in production):
   psql -U your_prod_user -d your_prod_db < backend/src/scripts/insert-mock-escrows.sql
   ```

3. **Restart the production API server** to load the new code

## Frontend Deployment

The frontend should already be using the correct API endpoints since we updated `frontend/src/services/api.js` to use `/escrows/database`.

## Quick Fix (Without Full Deployment)

If you need a quick fix without deploying all changes, you can:

1. **Update just the frontend** to use mock data by changing the API calls back to include `useDatabase: false`
2. **Or update the production database** to have the same structure as your local database

## Verification Steps

After deployment:
1. Check API response: `curl https://api.jaydenmetz.com/v1/escrows/database`
2. Verify field names are in camelCase
3. Check that the escrows list loads at crm.jaydenmetz.com/escrows

## Important Notes

- The production database needs the new columns (buyer_name, seller_name, etc.)
- The old `escrow_buyers` and `escrow_sellers` tables will be dropped
- Make sure to backup your production database before running migrations