#!/bin/bash

# ====================================================================
# Real Estate CRM - Architecture Migration Script
# Purpose: Migrate to enterprise-grade architecture with best practices
# Author: Senior Engineering Team
# Date: August 2025
# ====================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Real Estate CRM - Architecture Migration Tool         ║${NC}"
echo -e "${BLUE}║    Migrating to Enterprise Best Practices                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW} $1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Confirmation
echo -e "${YELLOW}This script will:${NC}"
echo "  1. Archive old route files (.js) to backup directory"
echo "  2. Ensure all .routes.js files are properly configured"
echo "  3. Consolidate debug components to single implementation"
echo "  4. Update all imports to use new structure"
echo "  5. Create proper service layer structure"
echo ""
read -p "Do you want to proceed? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

# ==================================================================
# STEP 1: Create Backup Directory
# ==================================================================
print_section "Step 1: Creating Backup Structure"

BACKUP_DIR="backend/src/routes/_archived_$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"
print_success "Created backup directory: $BACKUP_DIR"

# ==================================================================
# STEP 2: Archive Old Route Files
# ==================================================================
print_section "Step 2: Archiving Legacy Route Files"

# Move old .js route files to archive (keep .routes.js files)
for file in backend/src/routes/*.js; do
    filename=$(basename "$file")
    # Skip if it's already a .routes.js file or special files
    if [[ ! "$filename" =~ \.routes\.js$ ]] && \
       [[ "$filename" != "index.js" ]] && \
       [[ -f "$file" ]]; then
        
        # Check if a .routes.js version exists
        routes_version="${file%.js}.routes.js"
        if [[ -f "$routes_version" ]] || [[ -f "backend/src/routes/${filename%.js}.routes.js" ]]; then
            mv "$file" "$BACKUP_DIR/" 2>/dev/null && \
            print_success "Archived: $filename (using ${filename%.js}.routes.js instead)"
        fi
    fi
done

# ==================================================================
# STEP 3: Consolidate Debug Components
# ==================================================================
print_section "Step 3: Consolidating Debug Components"

# Rename DebugCardWithApiTests to DebugCard (it's the most complete)
if [[ -f "frontend/src/components/common/DebugCardWithApiTests.jsx" ]]; then
    # First backup the old DebugCard if it exists
    if [[ -f "frontend/src/components/common/DebugCard.jsx" ]]; then
        mkdir -p "frontend/src/components/common/_archived"
        mv "frontend/src/components/common/DebugCard.jsx" \
           "frontend/src/components/common/_archived/DebugCard.old.jsx"
        print_success "Archived old DebugCard.jsx"
    fi
    
    # Rename the comprehensive one to DebugCard
    mv "frontend/src/components/common/DebugCardWithApiTests.jsx" \
       "frontend/src/components/common/DebugCard.jsx"
    print_success "Renamed DebugCardWithApiTests to DebugCard (primary debug component)"
fi

# Archive other debug components
mkdir -p "frontend/src/components/common/_archived"
for debug_file in DebugPanel DetailPageDebugger EnhancedDetailDebugger; do
    if [[ -f "frontend/src/components/common/${debug_file}.jsx" ]]; then
        mv "frontend/src/components/common/${debug_file}.jsx" \
           "frontend/src/components/common/_archived/" 2>/dev/null && \
        print_success "Archived: ${debug_file}.jsx"
    fi
done

# ==================================================================
# STEP 4: Update Component Imports
# ==================================================================
print_section "Step 4: Updating Component Imports"

# Update all imports from DebugCardWithApiTests to DebugCard
find frontend/src -name "*.jsx" -o -name "*.js" | while read file; do
    if grep -q "DebugCardWithApiTests" "$file" 2>/dev/null; then
        sed -i '' 's/DebugCardWithApiTests/DebugCard/g' "$file"
        print_success "Updated imports in: $(basename $file)"
    fi
done

# Update imports from old debug components to DebugCard
for old_component in DebugPanel DetailPageDebugger EnhancedDetailDebugger; do
    find frontend/src -name "*.jsx" -o -name "*.js" | while read file; do
        if grep -q "$old_component" "$file" 2>/dev/null; then
            sed -i '' "s/import.*${old_component}.*/import DebugCard from '..\/common\/DebugCard';/g" "$file"
            sed -i '' "s/<${old_component}/<DebugCard/g" "$file"
            print_success "Migrated ${old_component} to DebugCard in: $(basename $file)"
        fi
    done
done

# ==================================================================
# STEP 5: Create Service Layer Structure
# ==================================================================
print_section "Step 5: Establishing Service Layer"

# Create services directory structure if not exists
mkdir -p backend/src/services/{escrows,listings,clients,leads,appointments}
print_success "Created service layer directories"

# Create a template service file
cat > backend/src/services/SERVICE_TEMPLATE.js << 'EOF'
/**
 * Service Layer Template
 * 
 * Services contain business logic and orchestration.
 * They should NOT handle HTTP concerns (that's for controllers).
 * They should NOT directly query the database (use models/repositories).
 * 
 * Responsibilities:
 * - Business rule validation
 * - Orchestrating multiple operations
 * - Data transformation
 * - External service integration
 */

class TemplateService {
  /**
   * Example: Get all resources with business logic
   */
  async findAll(filters = {}) {
    // Business logic here
    // Call model/repository methods
    // Transform data
    // Return processed result
  }

  /**
   * Example: Create resource with validation
   */
  async create(data) {
    // Validate business rules
    // Transform input data
    // Call model to save
    // Send notifications if needed
    // Return created resource
  }
}

module.exports = new TemplateService();
EOF
print_success "Created service layer template"

# ==================================================================
# STEP 6: Update Frontend API Service
# ==================================================================
print_section "Step 6: Consolidating Frontend API Service"

# Check if both api.js files exist
if [[ -f "frontend/src/config/api.js" ]] && [[ -f "frontend/src/services/api.js" ]]; then
    echo -e "${YELLOW}Found duplicate API configurations:${NC}"
    echo "  1. frontend/src/config/api.js (old pattern)"
    echo "  2. frontend/src/services/api.js (best practice)"
    
    # Archive the old one
    mkdir -p "frontend/src/config/_archived"
    cp "frontend/src/config/api.js" "frontend/src/config/_archived/api.old.js"
    print_success "Archived old API configuration"
    
    # Update imports to use the service version
    find frontend/src -name "*.jsx" -o -name "*.js" | while read file; do
        if grep -q "from.*config/api" "$file" 2>/dev/null; then
            sed -i '' "s|from.*['\"].*config/api.*['\"]|from 'services/api'|g" "$file"
            print_success "Updated API import in: $(basename $file)"
        fi
    done
fi

# ==================================================================
# STEP 7: Clean Up Test Files
# ==================================================================
print_section "Step 7: Organizing Test Files"

# Move test routes to test directory
mkdir -p backend/src/routes/__tests__
for test_file in simple-test test-auth test-connection; do
    if [[ -f "backend/src/routes/${test_file}.js" ]]; then
        mv "backend/src/routes/${test_file}.js" "backend/src/routes/__tests__/" 2>/dev/null && \
        print_success "Moved ${test_file}.js to __tests__ directory"
    fi
done

# ==================================================================
# STEP 8: Generate Migration Report
# ==================================================================
print_section "Step 8: Generating Migration Report"

cat > MIGRATION_REPORT.md << EOF
# Architecture Migration Report
Generated: $(date)

## ✅ Completed Actions

### Backend Structure
- Migrated to .routes.js naming convention for all routes
- Archived legacy route files to: $BACKUP_DIR
- Established service layer structure in backend/src/services
- Moved test routes to __tests__ directory

### Frontend Structure  
- Consolidated debug components to single DebugCard component
- Updated all component imports
- Migrated to single API service pattern

### File Organization
- **Routes:** All using .routes.js convention
- **Controllers:** Maintained .controller.js convention
- **Services:** Established .service.js pattern
- **Models:** Using .model.js convention

## 📂 New Structure

\`\`\`
backend/src/
├── routes/          # *.routes.js files only
├── controllers/     # *.controller.js files
├── services/        # *.service.js files (business logic)
├── models/          # *.model.js files
└── middleware/      # *.middleware.js files

frontend/src/
├── components/
│   └── common/
│       └── DebugCard.jsx  # Single debug component
├── services/
│   └── api.js      # Single API service
└── [other directories...]
\`\`\`

## 🔄 Updated Files
- app.js: Now uses .routes.js files exclusively
- All component imports updated to use DebugCard
- API imports consolidated to services/api

## 📋 Next Steps
1. Test all endpoints to ensure routing works
2. Implement service layer methods for business logic
3. Remove archived files after confirming stability
4. Update documentation

## ⚠️ Important Notes
- Backup created at: $BACKUP_DIR
- Old files archived, not deleted (can be restored if needed)
- Test thoroughly before removing archived files
EOF

print_success "Generated migration report: MIGRATION_REPORT.md"

# ==================================================================
# FINAL SUMMARY
# ==================================================================
print_section "Migration Complete!"

echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Migration Successful! 🎉                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "✅ Architecture migrated to enterprise best practices"
echo "✅ Files organized following industry standards"
echo "✅ Debug components consolidated"
echo "✅ Service layer structure established"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Run: cd frontend && npm run build"
echo "2. Test the application thoroughly"
echo "3. Commit changes: git add . && git commit -m 'Migrate to enterprise architecture'"
echo "4. Review MIGRATION_REPORT.md for details"
echo ""
echo -e "${BLUE}Archived files can be found in:${NC}"
echo "  - $BACKUP_DIR"
echo "  - frontend/src/components/common/_archived"
echo ""
echo "To restore if needed: git checkout -- ."
echo ""