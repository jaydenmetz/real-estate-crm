#!/bin/bash

# Database Backup Script for Railway PostgreSQL
# Run daily via cron or manually for backups

# Configuration - Load from environment variables
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${DATABASE_USER:-postgres}"
DB_NAME="${DATABASE_NAME:-railway}"
DB_PASSWORD="${DATABASE_PASSWORD}"

# Check if password is set
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: DATABASE_PASSWORD environment variable not set!"
    echo "📝 Set it with: export DATABASE_PASSWORD='your-password'"
    exit 1
fi

# Backup directory
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo "🔄 Starting database backup..."
echo "📅 Timestamp: $TIMESTAMP"

# Create backup using pg_dump
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

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "📁 Backup saved to: $BACKUP_FILE"

    # Compress the backup
    gzip $BACKUP_FILE
    echo "🗜️ Backup compressed: ${BACKUP_FILE}.gz"

    # Keep only last 30 days of backups
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
    echo "🧹 Cleaned up old backups (kept last 30 days)"

    # Show backup size
    SIZE=$(du -h ${BACKUP_FILE}.gz | cut -f1)
    echo "📊 Backup size: $SIZE"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "
📋 To restore from this backup:
gunzip < ${BACKUP_FILE}.gz | PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
"