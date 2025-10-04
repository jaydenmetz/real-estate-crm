#!/bin/bash

# ============================================================================
# Database Reset Script
# WARNING: This will DELETE ALL DATA and start fresh
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database connection
export PGPASSWORD=ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ
DB_HOST="ballast.proxy.rlwy.net"
DB_PORT="20017"
DB_USER="postgres"
DB_NAME="railway"

echo -e "${RED}========================================${NC}"
echo -e "${RED}⚠️  DATABASE RESET WARNING ⚠️${NC}"
echo -e "${RED}========================================${NC}"
echo -e "${YELLOW}This will:${NC}"
echo -e "${YELLOW}1. DROP ALL TABLES${NC}"
echo -e "${YELLOW}2. DELETE ALL DATA${NC}"
echo -e "${YELLOW}3. Start fresh with new schema${NC}"
echo ""
echo -e "${RED}This action CANNOT be undone!${NC}"
echo ""
read -p "Type 'RESET' to continue: " confirmation

if [ "$confirmation" != "RESET" ]; then
  echo -e "${GREEN}Reset cancelled.${NC}"
  exit 0
fi

echo ""
echo -e "${YELLOW}Step 1: Backing up current database (just in case)...${NC}"
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > "backup_before_reset_$(date +%Y%m%d_%H%M%S).sql"
echo -e "${GREEN}✅ Backup saved${NC}"

echo ""
echo -e "${YELLOW}Step 2: Dropping all tables...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
"
echo -e "${GREEN}✅ Database wiped clean${NC}"

echo ""
echo -e "${YELLOW}Step 3: Running initial CRM setup migration...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f backend/migrations/000_initial_crm_setup.sql
echo -e "${GREEN}✅ Schema created${NC}"

echo ""
echo -e "${YELLOW}Step 4: Verifying tables...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ DATABASE RESET COMPLETE${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Update admin password in database"
echo -e "2. Test login at https://crm.jaydenmetz.com"
echo -e "3. Create sample data if needed"
echo ""
