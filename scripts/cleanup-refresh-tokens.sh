#!/bin/bash

################################################################################
# Refresh Token Cleanup Script
# Deletes expired refresh tokens to prevent database bloat
# Should be run daily via cron or Railway scheduled job
################################################################################

# Color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Refresh Token Cleanup - Starting...                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for required environment variables
if [ -z "$PGPASSWORD" ] || [ -z "$DATABASE_HOST" ] || [ -z "$DATABASE_PORT" ]; then
  echo -e "${RED}❌ ERROR: Missing database credentials${NC}"
  echo -e "${YELLOW}Required environment variables:${NC}"
  echo -e "  - PGPASSWORD"
  echo -e "  - DATABASE_HOST"
  echo -e "  - DATABASE_PORT"
  echo ""
  exit 1
fi

# Database connection parameters
DB_USER="${DATABASE_USER:-postgres}"
DB_NAME="${DATABASE_NAME:-railway}"

echo -e "${YELLOW}📊 Checking current token statistics...${NC}"
echo ""

# Get current stats
STATS=$(PGPASSWORD=$PGPASSWORD psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DB_USER -d $DB_NAME -t -c "
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE expires_at > NOW()) as active,
    COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired
  FROM refresh_tokens;
")

echo -e "${BLUE}Before cleanup:${NC}"
echo "$STATS"
echo ""

# Delete expired tokens
echo -e "${YELLOW}🗑️  Deleting expired tokens...${NC}"
echo ""

DELETE_RESULT=$(PGPASSWORD=$PGPASSWORD psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DB_USER -d $DB_NAME -t -c "
  WITH deleted AS (
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) FROM deleted;
")

DELETED_COUNT=$(echo $DELETE_RESULT | tr -d ' ')

if [ "$DELETED_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ Deleted $DELETED_COUNT expired tokens${NC}"
else
  echo -e "${GREEN}✅ No expired tokens to delete${NC}"
fi

echo ""

# Get final stats
echo -e "${YELLOW}📊 Final token statistics...${NC}"
echo ""

FINAL_STATS=$(PGPASSWORD=$PGPASSWORD psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DB_USER -d $DB_NAME -t -c "
  SELECT
    COUNT(*) as total,
    COUNT(DISTINCT user_id) as unique_users
  FROM refresh_tokens
  WHERE expires_at > NOW();
")

echo -e "${BLUE}After cleanup:${NC}"
echo "$FINAL_STATS"
echo ""

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Refresh Token Cleanup - Complete!                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

exit 0
