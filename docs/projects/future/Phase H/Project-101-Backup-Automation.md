# Project-101: Backup Automation

**Phase**: H | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Project 97
**MILESTONE**: None

## 🎯 Goal
Implement automated database and file backup system with testing, monitoring, and disaster recovery procedures.

## 📋 Current → Target
**Now**: Manual backups, no automation, no testing
**Target**: Automated daily backups, tested restoration procedures, 30-day retention, monitoring and alerts
**Success Metric**: Daily automated backups, <1 hour RTO (Recovery Time Objective), <15 minutes RPO (Recovery Point Objective), 100% restoration success rate

## 📖 Context
Currently no automated backup system. In case of data loss, disaster, or corruption, recovery would be difficult or impossible. Need automated backup system with regular testing to ensure business continuity.

Key features: Automated PostgreSQL backups, file backup (if storing files), backup verification, restoration testing, retention policies, backup monitoring, and disaster recovery runbooks.

## ⚠️ Risk Assessment

### Technical Risks
- **Backup Failures**: Silent backup failures going unnoticed
- **Restoration Issues**: Backups that can't be restored
- **Storage Costs**: High backup storage costs
- **Performance Impact**: Backups slowing production

### Business Risks
- **Data Loss**: No backups when needed
- **Downtime**: Long recovery times
- **Compliance**: Backup requirements not met
- **Customer Trust**: Data loss damaging reputation

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-101-backup-$(date +%Y%m%d)
git push origin pre-project-101-backup-$(date +%Y%m%d)

# Create manual backup before implementing automation
pg_dump $DATABASE_URL > manual-backup-$(date +%Y%m%d).sql
```

### If Things Break
```bash
# Disable backup automation if causing issues
railway cron remove backup-job

# Rollback backup scripts
git checkout pre-project-101-backup-YYYYMMDD -- scripts/backup
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Define backup strategy (full vs incremental)
- [ ] Choose backup storage (Railway volumes/S3/Backblaze)
- [ ] Plan retention policy (30 days)
- [ ] Design restoration testing procedures
- [ ] Document disaster recovery procedures

### Implementation (5 hours)
- [ ] **Database Backup** (2.5 hours):
  - [ ] Create backup script (pg_dump)
  - [ ] Set up backup storage location
  - [ ] Configure Railway cron job (daily at 2 AM UTC)
  - [ ] Implement backup encryption
  - [ ] Add backup verification (test restore)
  - [ ] Implement retention policy (delete old backups)

- [ ] **File Backup** (1 hour - if applicable):
  - [ ] Identify files requiring backup
  - [ ] Create file backup script
  - [ ] Configure file storage backup
  - [ ] Test file restoration

- [ ] **Monitoring & Alerts** (1.5 hours):
  - [ ] Create backup success/failure monitoring
  - [ ] Set up alerts for backup failures
  - [ ] Add backup metrics to monitoring dashboard
  - [ ] Create backup status endpoint
  - [ ] Log backup operations

### Testing (1.5 hours)
- [ ] Test backup creation
- [ ] Test backup restoration (full restore test)
- [ ] Test backup encryption/decryption
- [ ] Test retention policy
- [ ] Test backup failure alerts
- [ ] Simulate disaster recovery

### Documentation (1 hour)
- [ ] Document backup procedures
- [ ] Create restoration guide
- [ ] Document disaster recovery plan
- [ ] Create backup troubleshooting guide

## 🧪 Verification Tests

### Test 1: Backup Creation
```bash
# Manually trigger backup
./scripts/backup/create-backup.sh

# Verify backup file created
ls -lh backups/
# Expected: New .sql.gz file with today's date
```

### Test 2: Backup Restoration
```bash
# Create test database
createdb test-restore

# Restore backup
gunzip -c backups/backup-latest.sql.gz | psql $TEST_DATABASE_URL

# Verify data restored
psql $TEST_DATABASE_URL -c "SELECT COUNT(*) FROM users;"
# Expected: Same count as production
```

### Test 3: Backup Failure Alert
```bash
# Simulate backup failure
export DATABASE_URL="invalid-url"
./scripts/backup/create-backup.sh

# Expected: Alert sent to Slack, backup failure logged
```

## 📝 Implementation Notes

### Backup Script
```bash
#!/bin/bash
# scripts/backup/create-backup.sh

set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting database backup at $(date)"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE
BACKUP_FILE="$BACKUP_FILE.gz"

# Verify backup file exists and has content
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $SIZE"

    # Encrypt backup (optional but recommended)
    if [ ! -z "$BACKUP_ENCRYPTION_KEY" ]; then
        openssl enc -aes-256-cbc -salt -in "$BACKUP_FILE" \
            -out "$BACKUP_FILE.enc" -k "$BACKUP_ENCRYPTION_KEY"
        rm "$BACKUP_FILE"
        BACKUP_FILE="$BACKUP_FILE.enc"
        echo "✅ Backup encrypted"
    fi

    # Test restore (to verify backup integrity)
    echo "Testing backup restoration..."
    gunzip -c "$BACKUP_FILE" | head -n 10 > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Backup verification passed"
    else
        echo "❌ Backup verification failed"
        exit 1
    fi

    # Clean up old backups (retention policy)
    echo "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
    find $BACKUP_DIR -name "backup_*.sql.gz*" -type f -mtime +$RETENTION_DAYS -delete

    # Send success notification
    curl -X POST $SLACK_WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d "{\"text\": \"✅ Database backup completed successfully ($SIZE)\"}"

    echo "Backup completed at $(date)"
else
    echo "❌ Backup failed: file is missing or empty"

    # Send failure notification
    curl -X POST $SLACK_WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d "{\"text\": \"❌ Database backup FAILED at $(date)\"}"

    exit 1
fi
```

### Railway Cron Configuration
```json
// railway.json
{
  "cron": {
    "backup": {
      "schedule": "0 2 * * *",  // Daily at 2 AM UTC
      "command": "./scripts/backup/create-backup.sh",
      "timeout": 600  // 10 minutes
    }
  }
}
```

### Restoration Script
```bash
#!/bin/bash
# scripts/backup/restore-backup.sh

set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore-backup.sh <backup-file>"
    echo "Available backups:"
    ls -lh /backups/backup_*.sql.gz*
    exit 1
fi

BACKUP_FILE=$1

echo "⚠️  WARNING: This will OVERWRITE the current database!"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure? (type 'yes' to continue): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restoration cancelled"
    exit 0
fi

echo "Starting database restoration..."

# Decrypt if encrypted
if [[ $BACKUP_FILE == *.enc ]]; then
    echo "Decrypting backup..."
    openssl enc -aes-256-cbc -d -in "$BACKUP_FILE" \
        -out "${BACKUP_FILE%.enc}" -k "$BACKUP_ENCRYPTION_KEY"
    BACKUP_FILE="${BACKUP_FILE%.enc}"
fi

# Restore database
echo "Restoring database..."
gunzip -c "$BACKUP_FILE" | psql $DATABASE_URL

echo "✅ Database restored successfully"

# Send notification
curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{\"text\": \"✅ Database restored from backup: $BACKUP_FILE\"}"
```

### Backup Monitoring Endpoint
```javascript
// backend/src/controllers/health.controller.js
async function getBackupStatus(req, res) {
  try {
    const backupDir = '/backups';
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(f => f.startsWith('backup_'));

    if (backupFiles.length === 0) {
      return res.status(200).json({
        status: 'warning',
        message: 'No backups found',
        lastBackup: null,
      });
    }

    // Get most recent backup
    const latestBackup = backupFiles.sort().reverse()[0];
    const stats = await fs.stat(path.join(backupDir, latestBackup));
    const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

    // Alert if backup is >25 hours old (should be daily)
    const status = ageHours > 25 ? 'error' : 'healthy';

    res.json({
      status,
      lastBackup: {
        file: latestBackup,
        date: stats.mtime,
        ageHours: ageHours.toFixed(1),
        size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
      },
      totalBackups: backupFiles.length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to check backup status',
      error: error.message,
    });
  }
}
```

### Disaster Recovery Procedures

**RTO (Recovery Time Objective): <1 hour**
**RPO (Recovery Point Objective): <15 minutes** (with daily backups at 2 AM, max loss is time since last backup)

**Recovery Steps**:
1. Identify issue and confirm data loss/corruption
2. Stop application to prevent further damage
3. Identify most recent valid backup
4. Create new database instance
5. Restore backup to new instance
6. Verify data integrity
7. Update DATABASE_URL to point to new instance
8. Restart application
9. Verify functionality
10. Monitor for issues

**Recovery Testing Schedule**:
- Monthly: Restore to test environment
- Quarterly: Full disaster recovery drill
- Annually: Complete business continuity test

### Backup Storage Options

**Option 1: Railway Volumes** (Simplest)
- Pros: Built-in, easy to use
- Cons: Same provider risk, limited retention

**Option 2: AWS S3** (Recommended)
- Pros: Reliable, cheap, unlimited retention
- Cons: Additional service to manage

**Option 3: Backblaze B2** (Budget option)
- Pros: Very cheap, S3-compatible
- Cons: Less well-known, potential reliability concerns

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store backup encryption keys securely
- [ ] Test restoration regularly
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-101**:
- Backup automation: Daily automated backups
- Restoration testing: Monthly verification
- Backup monitoring: Real-time status tracking
- Disaster recovery: Documented procedures tested

## 🔗 Dependencies

### Depends On
- Project-97 (Environment Management - needs environment configs)

### Blocks
- None (independent infrastructure component)

### Parallel Work
- Can work alongside Projects 98-100 (monitoring/logging/errors)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-97 complete (environment management ready)
- ✅ Database access configured
- ✅ Backup storage location decided
- ✅ Encryption keys generated

### Should Skip If:
- ❌ Railway provides automatic backups (check their offering)
- ❌ Using managed database with built-in backups

### Optimal Timing:
- Immediately (critical for data protection)
- Before production launch

## ✅ Success Criteria
- [ ] Backup script created and tested
- [ ] Daily automated backups running
- [ ] Backup encryption implemented
- [ ] Restoration tested successfully
- [ ] Retention policy enforced (30 days)
- [ ] Backup monitoring dashboard
- [ ] Alerts for backup failures
- [ ] Disaster recovery procedures documented
- [ ] Monthly restoration testing scheduled
- [ ] <1 hour RTO, <15 minutes RPO

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Test backup script locally
- [ ] Test restoration locally
- [ ] Verify encryption/decryption
- [ ] Test cron schedule
- [ ] Confirm backup storage accessible

### Post-Deployment Verification
- [ ] Wait for first automated backup
- [ ] Verify backup created successfully
- [ ] Test restoration from production backup
- [ ] Confirm alerts working
- [ ] Validate backup size reasonable

### Rollback Triggers
- Backups failing repeatedly
- Backup process impacting performance
- Restoration testing failing
- Storage costs excessive

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Backup script created
- [ ] Automated backups running
- [ ] Encryption implemented
- [ ] Restoration tested
- [ ] Retention policy working
- [ ] Monitoring configured
- [ ] Alerts functional
- [ ] Documentation complete
- [ ] DR procedures tested

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
