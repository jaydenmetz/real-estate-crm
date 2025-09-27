#!/bin/bash

# Database Backup Script for PostgreSQL
# Run this as a cron job for automated backups

# Load environment variables
source ../.env

# Configuration
BACKUP_DIR="/tmp/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
COMPRESSED_FILE="$BACKUP_FILE.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Database connection details from Railway
DB_HOST="ballast.proxy.rlwy.net"
DB_PORT="20017"
DB_USER="postgres"
DB_NAME="railway"
DB_PASSWORD="ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ"

echo "Starting backup at $(date)"

# Perform the backup
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --verbose \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  -f $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully"

  # Compress the backup
  gzip $BACKUP_FILE
  echo "Backup compressed: $COMPRESSED_FILE"

  # Calculate file size
  SIZE=$(ls -lh $COMPRESSED_FILE | awk '{print $5}')
  echo "Backup size: $SIZE"

  # Optional: Upload to cloud storage
  # aws s3 cp $COMPRESSED_FILE s3://your-backup-bucket/daily/
  # gsutil cp $COMPRESSED_FILE gs://your-backup-bucket/daily/

  # Keep only last 7 local backups
  find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime +7 -delete
  echo "Old backups cleaned up"

  # Log success
  echo "$(date): Backup successful - $COMPRESSED_FILE ($SIZE)" >> $BACKUP_DIR/backup.log
else
  echo "Backup failed!"
  echo "$(date): Backup failed" >> $BACKUP_DIR/backup.log
  exit 1
fi

echo "Backup process completed at $(date)"