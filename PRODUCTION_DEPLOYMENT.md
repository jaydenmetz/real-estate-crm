# Production Deployment Guide

## Pre-Deployment Checklist
- [ ] Backup production database
- [ ] Test migration script on staging/development
- [ ] Ensure backend code is committed and pushed
- [ ] Ensure frontend code is committed and pushed

## Step 1: Deploy Backend Code

Deploy these updated files to your production server:
- `backend/src/controllers/escrowController.simple.js` (new file)
- `backend/src/routes/escrows.js` (updated)

## Step 2: Run Database Migration

1. **Connect to production database:**
   ```bash
   psql -U your_prod_user -h your_prod_host -d your_prod_db
   ```

2. **Backup existing data (IMPORTANT!):**
   ```bash
   pg_dump -U your_prod_user -h your_prod_host -d your_prod_db \
     -t escrows -t escrow_buyers -t escrow_sellers > escrows_backup_$(date +%Y%m%d).sql
   ```

3. **Run the migration:**
   ```bash
   psql -U your_prod_user -h your_prod_host -d your_prod_db \
     < backend/src/scripts/production-migration.sql
   ```

4. **Verify the migration:**
   ```sql
   -- Check total escrows
   SELECT COUNT(*) as total_escrows FROM escrows;
   
   -- Check migrated data
   SELECT id, property_address, buyer_name, seller_name 
   FROM escrows 
   LIMIT 5;
   
   -- Check new columns exist
   \d escrows
   ```

5. **Only after verification, drop old tables:**
   ```sql
   DROP TABLE IF EXISTS escrow_buyers CASCADE;
   DROP TABLE IF EXISTS escrow_sellers CASCADE;
   ```

## Step 3: Insert Mock Data (Optional)

If you want the same mock data in production:
```bash
psql -U your_prod_user -h your_prod_host -d your_prod_db \
  < backend/src/scripts/insert-mock-escrows.sql
```

## Step 4: Deploy Frontend

1. Build the production frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the built files to your production server

## Step 5: Restart Services

1. Restart your API server to load the new controllers
2. Clear any caches (Redis, CDN, etc.)

## Step 6: Verify Production

1. Check API endpoint:
   ```bash
   curl https://api.jaydenmetz.com/v1/escrows/database
   ```

2. Visit https://crm.jaydenmetz.com/escrows and verify:
   - Escrows list loads
   - Individual escrow details work
   - No console errors

## Rollback Plan

If issues occur:
1. Restore database from backup:
   ```bash
   psql -U your_prod_user -h your_prod_host -d your_prod_db < escrows_backup_[date].sql
   ```

2. Revert code deployment to previous version

## Post-Deployment

1. Monitor error logs for any issues
2. Check performance metrics
3. Verify all escrow features work correctly