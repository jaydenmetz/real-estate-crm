#!/bin/bash

# Setup script for backup environment variables
# This script helps you configure credentials securely

echo "🔐 Backup Script Configuration"
echo "=============================="
echo ""
echo "This script will help you set up environment variables"
echo "for the backup scripts WITHOUT exposing credentials in code."
echo ""

# Create local .env file for scripts
ENV_FILE="$(dirname "$0")/.env"

if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env file already exists. Loading existing configuration..."
    source "$ENV_FILE"
    echo "✅ Environment variables loaded from .env"
else
    echo "Creating new .env file..."

    echo "Enter your database credentials (these will be stored locally only):"

    read -p "Database Host [ballast.proxy.rlwy.net]: " DB_HOST
    DB_HOST=${DB_HOST:-ballast.proxy.rlwy.net}

    read -p "Database Port [20017]: " DB_PORT
    DB_PORT=${DB_PORT:-20017}

    read -p "Database User [postgres]: " DB_USER
    DB_USER=${DB_USER:-postgres}

    read -p "Database Name [railway]: " DB_NAME
    DB_NAME=${DB_NAME:-railway}

    read -sp "Database Password: " DB_PASSWORD
    echo ""

    # Write to .env file
    cat > "$ENV_FILE" << EOF
# Auto-generated environment file - DO NOT COMMIT TO GIT
DATABASE_HOST=$DB_HOST
DATABASE_PORT=$DB_PORT
DATABASE_USER=$DB_USER
DATABASE_NAME=$DB_NAME
DATABASE_PASSWORD=$DB_PASSWORD
EOF

    chmod 600 "$ENV_FILE"  # Restrict permissions
    echo "✅ Configuration saved to .env (git-ignored)"
fi

# Export for current session
export DATABASE_HOST DATABASE_PORT DATABASE_USER DATABASE_NAME DATABASE_PASSWORD

echo ""
echo "✅ Environment configured! You can now run:"
echo "  ./backup-database.sh     - Create local backup"
echo "  ./backup-to-cloud.sh     - Backup to cloud storage"
echo "  ./restore-database.sh    - Restore from backup"
echo ""
echo "🔒 Security Note: Your credentials are stored in .env"
echo "   This file is git-ignored and won't be committed."