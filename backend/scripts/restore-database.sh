#!/bin/bash

# Database Restore Script for Railway PostgreSQL
# Restores from a backup file

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

# Check if backup file provided
if [ -z "$1" ]; then
    echo "❌ Usage: ./restore-database.sh <backup-file>"
    echo "Example: ./restore-database.sh backups/backup_railway_20250120_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will REPLACE all data in the database!"
echo "📁 Restoring from: $BACKUP_FILE"
echo -n "Are you sure? (yes/no): "
read CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 1
fi

echo "🔄 Starting database restore..."

# Check if file is compressed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 Decompressing and restoring..."
    gunzip < $BACKUP_FILE | PGPASSWORD=$DB_PASSWORD psql \
        -h $DB_HOST \
        -p $DB_PORT \
        -U $DB_USER \
        -d $DB_NAME \
        --quiet
else
    echo "📥 Restoring from SQL file..."
    PGPASSWORD=$DB_PASSWORD psql \
        -h $DB_HOST \
        -p $DB_PORT \
        -U $DB_USER \
        -d $DB_NAME \
        --quiet \
        < $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"

    # Show table counts
    echo "📊 Verifying restore..."
    PGPASSWORD=$DB_PASSWORD psql \
        -h $DB_HOST \
        -p $DB_PORT \
        -U $DB_USER \
        -d $DB_NAME \
        -c "SELECT 'Users:' || COUNT(*) FROM users
            UNION ALL SELECT 'Escrows:' || COUNT(*) FROM escrows
            UNION ALL SELECT 'API Keys:' || COUNT(*) FROM api_keys;"
else
    echo "❌ Restore failed!"
    exit 1
fi