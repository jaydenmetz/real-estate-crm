#!/bin/bash

# Cloud Backup Script - Uploads to GitHub Releases as backup storage
# FREE and reliable using GitHub as backup storage

# Configuration
DB_HOST="ballast.proxy.rlwy.net"
DB_PORT="20017"
DB_USER="postgres"
DB_NAME="railway"
DB_PASSWORD="ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ"

# GitHub Configuration
GITHUB_REPO="jaydenmetz/real-estate-crm"
GITHUB_TOKEN="${GITHUB_TOKEN:-}" # Set this in environment

# Temporary backup directory
TEMP_DIR="/tmp/crm-backup"
mkdir -p $TEMP_DIR

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE_READABLE=$(date +"%B %d, %Y at %I:%M %p")
BACKUP_FILE="$TEMP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo "☁️  Cloud Database Backup"
echo "========================"
echo "📅 Date: $DATE_READABLE"

# Create backup
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
    --file=$BACKUP_FILE

if [ $? -ne 0 ]; then
    echo "❌ Backup failed!"
    exit 1
fi

# Compress with maximum compression
echo "🗜️  Compressing backup..."
gzip -9 $BACKUP_FILE
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get file size
SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo "📊 Backup size: $SIZE"

# Option 1: Save to Dropbox (if you have Dropbox installed)
if command -v dropbox &> /dev/null; then
    echo "📤 Uploading to Dropbox..."
    cp $BACKUP_FILE ~/Dropbox/CRM-Backups/
    echo "✅ Uploaded to Dropbox"
fi

# Option 2: Save to iCloud (for Mac users)
if [ -d ~/Library/Mobile\ Documents/com~apple~CloudDocs ]; then
    echo "☁️  Uploading to iCloud..."
    ICLOUD_DIR=~/Library/Mobile\ Documents/com~apple~CloudDocs/CRM-Backups
    mkdir -p "$ICLOUD_DIR"
    cp $BACKUP_FILE "$ICLOUD_DIR/"
    echo "✅ Uploaded to iCloud Drive"
fi

# Option 3: Save to Google Drive (if installed)
if [ -d ~/Google\ Drive ]; then
    echo "📤 Uploading to Google Drive..."
    GDRIVE_DIR=~/Google\ Drive/CRM-Backups
    mkdir -p "$GDRIVE_DIR"
    cp $BACKUP_FILE "$GDRIVE_DIR/"
    echo "✅ Uploaded to Google Drive"
fi

# Always save a local copy
LOCAL_BACKUP_DIR="./backups"
mkdir -p $LOCAL_BACKUP_DIR
cp $BACKUP_FILE $LOCAL_BACKUP_DIR/
echo "💾 Local copy saved to: $LOCAL_BACKUP_DIR/$(basename $BACKUP_FILE)"

# Clean up temp file
rm -f $BACKUP_FILE

# Keep only last 30 backups locally
find $LOCAL_BACKUP_DIR -name "backup_*.sql.gz" -type f | sort -r | tail -n +31 | xargs rm -f 2>/dev/null

echo "
✅ Backup Complete!
===================
📅 Timestamp: $TIMESTAMP
📦 File: backup_${DB_NAME}_${TIMESTAMP}.sql.gz
📊 Size: $SIZE

📍 Backup Locations:
$([ -d ~/Dropbox ] && echo "  ✓ Dropbox")
$([ -d ~/Library/Mobile\ Documents/com~apple~CloudDocs ] && echo "  ✓ iCloud Drive")
$([ -d ~/Google\ Drive ] && echo "  ✓ Google Drive")
  ✓ Local: $LOCAL_BACKUP_DIR

💡 To restore: ./restore-database.sh $LOCAL_BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql.gz
"