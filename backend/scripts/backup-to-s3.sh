#!/bin/bash

# AWS S3 Backup Script - Professional Cloud Backup Solution
# Cost: ~$0.023/GB per month (very cheap for database backups)

# Database Configuration
DB_HOST="ballast.proxy.rlwy.net"
DB_PORT="20017"
DB_USER="postgres"
DB_NAME="railway"
DB_PASSWORD="ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ"

# AWS S3 Configuration
S3_BUCKET="jaydenmetz-crm-backups"  # You'll create this bucket
AWS_REGION="us-west-2"  # Closest to California

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not installed!"
    echo "📥 Install with: brew install awscli"
    echo "Then run: aws configure"
    exit 1
fi

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE_READABLE=$(date +"%B %d, %Y at %I:%M %p")
YEAR=$(date +"%Y")
MONTH=$(date +"%m")
DAY=$(date +"%d")

# Organized S3 path: year/month/day/backup_file.sql.gz
S3_PATH="${YEAR}/${MONTH}/${DAY}/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

# Local temp file
TEMP_DIR="/tmp"
BACKUP_FILE="$TEMP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo "☁️  AWS S3 Database Backup"
echo "=========================="
echo "📅 Date: $DATE_READABLE"
echo "🪣 S3 Bucket: $S3_BUCKET"
echo "📁 S3 Path: $S3_PATH"

# Create database backup
echo "🔄 Creating database backup..."
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USER \
    -d $DB_NAME \
    --no-owner \
    --no-privileges \
    --if-exists \
    --clean \
    --verbose \
    --file=$BACKUP_FILE 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Database backup failed!"
    exit 1
fi

# Compress backup
echo "🗜️  Compressing backup..."
gzip -9 $BACKUP_FILE
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get file size
SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo "📊 Backup size: $SIZE"

# Upload to S3 with encryption
echo "📤 Uploading to AWS S3..."
aws s3 cp $BACKUP_FILE "s3://${S3_BUCKET}/${S3_PATH}" \
    --region $AWS_REGION \
    --storage-class STANDARD_IA \
    --server-side-encryption AES256 \
    --metadata "timestamp=${TIMESTAMP},database=${DB_NAME}"

if [ $? -eq 0 ]; then
    echo "✅ Successfully uploaded to S3!"

    # Generate presigned URL (valid for 7 days)
    DOWNLOAD_URL=$(aws s3 presign "s3://${S3_BUCKET}/${S3_PATH}" \
        --region $AWS_REGION \
        --expires-in 604800)

    echo "🔗 Download URL (valid 7 days):"
    echo "$DOWNLOAD_URL"

    # List recent backups
    echo ""
    echo "📋 Recent backups in S3:"
    aws s3 ls "s3://${S3_BUCKET}/${YEAR}/${MONTH}/" \
        --region $AWS_REGION \
        --recursive \
        --human-readable \
        --summarize | tail -5
else
    echo "❌ S3 upload failed!"
    exit 1
fi

# Clean up temp file
rm -f $BACKUP_FILE

# Save backup info to local log
LOG_FILE="./backups/backup-log.txt"
mkdir -p ./backups
echo "$(date): Backup uploaded to s3://${S3_BUCKET}/${S3_PATH} (${SIZE})" >> $LOG_FILE

echo "
✅ Backup Complete!
===================
📅 Timestamp: $TIMESTAMP
🪣 S3 Location: s3://${S3_BUCKET}/${S3_PATH}
📊 Size: $SIZE
💰 Cost: ~\$0.01/month

📥 To restore from S3:
aws s3 cp s3://${S3_BUCKET}/${S3_PATH} restored-backup.sql.gz
gunzip restored-backup.sql.gz
./restore-database.sh restored-backup.sql
"