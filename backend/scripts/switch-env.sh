#!/bin/bash

# Script to switch between local and production environments

if [ "$1" = "local" ]; then
    echo "Switching to LOCAL environment..."
    cp .env.local .env
    echo "✅ Now using LOCAL environment"
    echo "   - Database: Local PostgreSQL"
    echo "   - Redis: Local Redis"
    echo "   - Escrows will show ' - LOCAL' suffix"
elif [ "$1" = "production" ]; then
    echo "⚠️  WARNING: Switching to PRODUCTION environment"
    echo "Make sure you have the correct production credentials in .env.production"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.production .env
        echo "✅ Now using PRODUCTION environment"
        echo "   - Database: Railway PostgreSQL"
        echo "   - Redis: Railway Redis"
        echo "   - No LOCAL suffix on escrows"
    else
        echo "❌ Cancelled"
    fi
else
    echo "Usage: ./switch-env.sh [local|production]"
    echo ""
    echo "Current environment:"
    grep "NODE_ENV\|DATABASE_URL" .env | head -2
fi