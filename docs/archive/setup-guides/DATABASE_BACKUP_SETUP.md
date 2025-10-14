# Automated Database Backup Setup

**Phase 8: Production Hardening**
**Goal:** Daily automated backups with 30-day retention
**Service:** Railway Built-in Backups (Recommended)

---

## Option 1: Railway Built-in Backups (Recommended - 1 Hour)

### Step 1: Enable Railway Backups

1. **Login to Railway Dashboard**
   - Go to https://railway.app
   - Navigate to your project: "Real Estate CRM"

2. **Select PostgreSQL Service**
   - Click on the PostgreSQL service card
   - Go to **Settings** tab

3. **Enable Automated Backups**
   - Scroll to **Backups** section
   - Toggle **Enable Automated Backups** to ON
   - Configure schedule:
     - **Frequency:** Daily
     - **Time:** 2:00 AM PST (off-peak hours)
     - **Retention:** 30 days

4. **Save Settings**
   - Click **Save Changes**
   - Railway will create first backup within 24 hours

### Step 2: Test Backup Manually

1. **Trigger Manual Backup**
   - In PostgreSQL service settings
   - Click **Create Backup Now**
   - Wait 1-2 minutes for completion

2. **Verify Backup Exists**
   - Go to **Backups** tab
   - See list of available backups
   - Check backup size (should be 10-50 MB for current data)

### Step 3: Test Restore Process

⚠️ **DO NOT test restore on production database**

Instead, create a test scenario:

1. **Create Test Database**
   - Add new PostgreSQL service: "Test DB"
   - Deploy empty database

2. **Restore Backup to Test DB**
   - In Backups tab, select a backup
   - Click **Restore**
   - Choose destination: "Test DB"
   - Confirm restore

3. **Verify Data**
   - Connect to Test DB
   - Query a few tables to confirm data integrity
   - Delete Test DB when done

### Benefits

✅ **Zero Configuration** - Managed by Railway
✅ **Automatic Scheduling** - Set it and forget it
✅ **Point-in-Time Recovery** - Restore to any backup
✅ **No Storage Costs** - Included in Railway plan
✅ **Web UI** - Easy restore with one click

### Limitations

⚠️ **Retention:** 30 days max (Railway limitation)
⚠️ **Manual Download:** Can't auto-download to external storage
⚠️ **Railway Dependency:** Backups stored on Railway infrastructure

---

## Option 2: Custom Backup Script with S3 (3 Hours)

For longer retention or external storage:

### Step 1: Install AWS CLI in Railway

Add to `backend/package.json`:
```json
{
  "dependencies": {
    "aws-sdk": "^2.1692.0"
  }
}
```

### Step 2: Create Backup Script

**File:** `backend/scripts/backup-to-s3.sh`

```bash
#!/bin/bash

# Database Backup Script with S3 Upload
# Runs daily via Railway cron

set -e  # Exit on error

# Load environment variables
source .env

# Backup filename with timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="backup_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

echo "🔄 Starting backup at $(date)"

# Create backup using pg_dump
PGPASSWORD=$DATABASE_PASSWORD pg_dump \
  -h $DATABASE_HOST \
  -p $DATABASE_PORT \
  -U $DATABASE_USER \
  -d $DATABASE_NAME \
  -F c \
  -b \
  -v \
  -f "/tmp/${BACKUP_FILE}"

echo "✅ Database dumped to /tmp/${BACKUP_FILE}"

# Compress backup
gzip "/tmp/${BACKUP_FILE}"
echo "✅ Compressed to /tmp/${COMPRESSED_FILE}"

# Upload to S3
aws s3 cp "/tmp/${COMPRESSED_FILE}" \
  "s3://your-backup-bucket/postgres-backups/${COMPRESSED_FILE}" \
  --storage-class STANDARD_IA

echo "✅ Uploaded to S3"

# Clean up local file
rm "/tmp/${COMPRESSED_FILE}"
echo "✅ Cleaned up local files"

# Delete backups older than 30 days from S3
aws s3 ls "s3://your-backup-bucket/postgres-backups/" \
  | grep "backup_" \
  | awk '{print $4}' \
  | while read file; do
    file_date=$(echo $file | grep -oP '\d{4}-\d{2}-\d{2}')
    file_timestamp=$(date -d "$file_date" +%s)
    current_timestamp=$(date +%s)
    age_days=$(( ($current_timestamp - $file_timestamp) / 86400 ))

    if [ $age_days -gt 30 ]; then
      echo "🗑️  Deleting old backup: $file (${age_days} days old)"
      aws s3 rm "s3://your-backup-bucket/postgres-backups/$file"
    fi
  done

echo "✅ Backup completed successfully at $(date)"
```

### Step 3: Set Up AWS S3 Bucket

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-crm-backups
   ```

2. **Configure Lifecycle Policy** (90-day auto-delete)
   ```json
   {
     "Rules": [{
       "Id": "DeleteOldBackups",
       "Status": "Enabled",
       "Prefix": "postgres-backups/",
       "Expiration": {
         "Days": 90
       }
     }]
   }
   ```

3. **Set Bucket Policy** (restrict access)
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": {
         "AWS": "arn:aws:iam::YOUR_ACCOUNT:user/backup-user"
       },
       "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
       "Resource": "arn:aws:s3:::your-crm-backups/postgres-backups/*"
     }]
   }
   ```

### Step 4: Add Railway Environment Variables

In Railway dashboard → Backend service → Variables:

```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_DEFAULT_REGION=us-west-2
```

### Step 5: Create Railway Cron Job

**File:** `railway.toml`

```toml
[deploy]
  startCommand = "npm start"
  healthcheckPath = "/v1/health"
  healthcheckTimeout = 300

[[crons]]
  schedule = "0 2 * * *"  # 2 AM daily
  command = "bash backend/scripts/backup-to-s3.sh"
```

### Step 6: Test Backup Script

```bash
# SSH into Railway container
railway run bash

# Run backup script manually
bash backend/scripts/backup-to-s3.sh

# Verify S3 upload
aws s3 ls s3://your-crm-backups/postgres-backups/
```

### Benefits

✅ **Long Retention** - Keep backups for 90+ days
✅ **External Storage** - Not dependent on Railway
✅ **Automated Cleanup** - S3 lifecycle policies
✅ **Encrypted** - S3 encryption at rest
✅ **Downloadable** - Easy access to backup files

### Costs

**S3 Storage:** ~$0.0125/GB/month (Standard-IA)
- 50 MB backup = $0.0006/month
- 30 backups (1.5 GB) = $0.02/month
- **Total: < $1/year**

---

## Backup Verification Checklist

### Daily Verification (Automated)

Create monitoring script:

```javascript
// backend/scripts/verify-backup.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function verifyLatestBackup() {
  const params = {
    Bucket: 'your-crm-backups',
    Prefix: 'postgres-backups/',
    MaxKeys: 1
  };

  const data = await s3.listObjectsV2(params).promise();

  if (data.Contents.length === 0) {
    console.error('❌ No backups found!');
    // Send alert email
    return false;
  }

  const latestBackup = data.Contents[0];
  const backupAge = (Date.now() - new Date(latestBackup.LastModified)) / 1000 / 3600; // hours

  if (backupAge > 30) {
    console.error(`❌ Latest backup is ${backupAge.toFixed(1)} hours old!`);
    // Send alert email
    return false;
  }

  console.log(`✅ Latest backup: ${latestBackup.Key} (${backupAge.toFixed(1)} hours old)`);
  return true;
}

verifyLatestBackup();
```

### Weekly Manual Verification

Every Monday:
1. Check Railway backups dashboard
2. Verify last backup timestamp (should be < 24 hours ago)
3. Check backup size (should be consistent, 10-50 MB)
4. Test restore to staging database (optional)

### Monthly Deep Verification

First Monday of each month:
1. Download latest backup
2. Restore to local PostgreSQL
3. Run sample queries to verify data integrity
4. Check for corruption or errors

---

## Disaster Recovery Plan

### Scenario 1: Production Database Corrupted

**Recovery Time:** 10-15 minutes

1. **Stop Application**
   ```bash
   railway down
   ```

2. **Restore from Railway Backup**
   - Railway Dashboard → PostgreSQL → Backups
   - Select most recent backup (< 24 hours old)
   - Click **Restore**
   - Confirm restore operation

3. **Verify Data**
   ```sql
   -- Check row counts
   SELECT COUNT(*) FROM escrows;
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM security_events;
   ```

4. **Restart Application**
   ```bash
   railway up
   ```

5. **Verify Application Works**
   - Test login
   - Check dashboards load
   - Verify latest data (may lose < 24 hours)

### Scenario 2: Railway Platform Outage

**Recovery Time:** 1-2 hours (requires migration)

1. **Download Latest S3 Backup** (if using Option 2)
   ```bash
   aws s3 cp s3://your-crm-backups/postgres-backups/backup_latest.sql.gz ./
   gunzip backup_latest.sql.gz
   ```

2. **Set Up New PostgreSQL Instance**
   - Heroku, AWS RDS, or DigitalOcean
   - Create new database

3. **Restore Backup**
   ```bash
   pg_restore -h NEW_HOST -U NEW_USER -d NEW_DB backup_latest.sql
   ```

4. **Update Environment Variables**
   - Point application to new database
   - Deploy to new platform

### Scenario 3: Accidental Data Deletion

**Recovery Time:** 5 minutes

1. **Identify Deleted Data**
   - Check security_events table for deletion timestamp
   - Find affected records (escrow_id, client_id, etc.)

2. **Restore from Point-in-Time Backup**
   - Choose backup from before deletion
   - Restore to staging database

3. **Export Deleted Records**
   ```sql
   COPY (SELECT * FROM escrows WHERE id IN ('...')) TO '/tmp/recovered.csv';
   ```

4. **Import to Production**
   ```sql
   COPY escrows FROM '/tmp/recovered.csv' WITH CSV;
   ```

---

## Success Criteria

✅ **Automated backups running daily**
✅ **Retention: 30 days minimum**
✅ **Backup size: 10-50 MB (expected range)**
✅ **Test restore successful (< 15 minutes)**
✅ **Verification script running**
✅ **Disaster recovery plan documented**

---

## Monitoring Backup Health

### Add to UptimeRobot (Optional)

Create custom HTTP monitor:

**Endpoint:** Create `/v1/health/backup` endpoint

```javascript
// backend/src/routes/health.routes.js
router.get('/health/backup', async (req, res) => {
  try {
    // Check last Railway backup timestamp
    const lastBackup = await getLastBackupTimestamp(); // Your implementation
    const hoursSinceBackup = (Date.now() - lastBackup) / 1000 / 3600;

    if (hoursSinceBackup > 30) {
      return res.status(500).json({
        success: false,
        message: 'Backup is stale',
        hoursSinceBackup
      });
    }

    res.json({
      success: true,
      lastBackup,
      hoursSinceBackup
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

Monitor this endpoint every 6 hours → alert if backup > 30 hours old.

---

## Phase 8 Impact

**Before Phase 8:**
- Manual backups only
- No disaster recovery plan
- Risk of data loss

**After Phase 8:**
- Automated daily backups
- 30-day retention minimum
- Tested restore process (<15 min)
- Disaster recovery documented

**Database & Backend Score:** 9/10 → 10/10

---

## Recommended Approach

**For Now (Quick Win):**
Use **Option 1: Railway Built-in Backups**
- Takes 5 minutes to enable
- Zero cost, zero maintenance
- Good enough for 99% of scenarios

**For Future (Enterprise Readiness):**
Implement **Option 2: Custom Backup with S3**
- When you need > 30 days retention
- When preparing for SOC 2 audit
- When Railway becomes critical bottleneck

**Current Status:** Ready to implement Railway backups immediately.
