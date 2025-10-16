#!/bin/bash

################################################################################
# Codebase Documentation Generator
# Generates a beautifully formatted text file containing all source code
# with clear file paths, line numbers, and hierarchical structure
################################################################################

OUTPUT_FILE="CODEBASE_DOCUMENTATION.txt"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Color codes for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Real Estate CRM - Codebase Documentation Generator      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create header
cat > "$OUTPUT_FILE" << 'HEADER'
################################################################################
#                                                                              #
#                    REAL ESTATE CRM - CODEBASE DOCUMENTATION                  #
#                                                                              #
################################################################################

HEADER

echo "Generated: $TIMESTAMP" >> "$OUTPUT_FILE"
echo "Repository: real-estate-crm" >> "$OUTPUT_FILE"
echo "Branch: $(git branch --show-current)" >> "$OUTPUT_FILE"
echo "Last Commit: $(git log -1 --pretty=format:'%h - %s (%cr)')" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "================================================================================\n" >> "$OUTPUT_FILE"

# Function to add a file to the documentation
add_file_to_doc() {
    local filepath="$1"
    local relative_path="${filepath#./}"

    echo "" >> "$OUTPUT_FILE"
    echo "################################################################################" >> "$OUTPUT_FILE"
    echo "# FILE: $relative_path" >> "$OUTPUT_FILE"
    echo "################################################################################" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Add file with line numbers
    cat -n "$filepath" >> "$OUTPUT_FILE"

    echo "" >> "$OUTPUT_FILE"
    echo "────────────────────────────────────────────────────────────────────────────────" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
}

# Function to add a section header
add_section() {
    local section_name="$1"

    echo "" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗" >> "$OUTPUT_FILE"
    echo "║                                                                              ║" >> "$OUTPUT_FILE"
    printf "║%-78s║\n" "  $section_name" >> "$OUTPUT_FILE"
    echo "║                                                                              ║" >> "$OUTPUT_FILE"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
}

# Table of Contents
echo "TABLE OF CONTENTS" >> "$OUTPUT_FILE"
echo "================================================================================\n" >> "$OUTPUT_FILE"
echo "1. Backend" >> "$OUTPUT_FILE"
echo "   - Core Application (app.js, server.js)" >> "$OUTPUT_FILE"
echo "   - Controllers" >> "$OUTPUT_FILE"
echo "   - Routes" >> "$OUTPUT_FILE"
echo "   - Middleware" >> "$OUTPUT_FILE"
echo "   - Services" >> "$OUTPUT_FILE"
echo "   - Models" >> "$OUTPUT_FILE"
echo "   - Utilities" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "2. Frontend" >> "$OUTPUT_FILE"
echo "   - Core Application (App.js, index.js)" >> "$OUTPUT_FILE"
echo "   - Pages" >> "$OUTPUT_FILE"
echo "   - Components" >> "$OUTPUT_FILE"
echo "     * Dashboards" >> "$OUTPUT_FILE"
echo "     * Details" >> "$OUTPUT_FILE"
echo "     * Forms" >> "$OUTPUT_FILE"
echo "     * Health Checks" >> "$OUTPUT_FILE"
echo "     * Widgets" >> "$OUTPUT_FILE"
echo "   - Services" >> "$OUTPUT_FILE"
echo "   - Utils" >> "$OUTPUT_FILE"
echo "   - Context/Hooks" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "3. Configuration Files" >> "$OUTPUT_FILE"
echo "   - package.json files" >> "$OUTPUT_FILE"
echo "   - Environment configs" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo -e "${YELLOW}Processing files...${NC}\n"

################################################################################
# BACKEND
################################################################################

add_section "BACKEND - CORE APPLICATION"
echo -e "${GREEN}✓ Backend Core${NC}"

if [ -f "backend/src/app.js" ]; then
    add_file_to_doc "backend/src/app.js"
fi

if [ -f "backend/src/server.js" ]; then
    add_file_to_doc "backend/src/server.js"
fi

add_section "BACKEND - CONTROLLERS"
echo -e "${GREEN}✓ Controllers${NC}"

for file in backend/src/controllers/*.js; do
    if [ -f "$file" ]; then
        add_file_to_doc "$file"
    fi
done

add_section "BACKEND - ROUTES"
echo -e "${GREEN}✓ Routes${NC}"

for file in backend/src/routes/*.js; do
    if [ -f "$file" ]; then
        add_file_to_doc "$file"
    fi
done

add_section "BACKEND - MIDDLEWARE"
echo -e "${GREEN}✓ Middleware${NC}"

for file in backend/src/middleware/*.js; do
    if [ -f "$file" ]; then
        add_file_to_doc "$file"
    fi
done

add_section "BACKEND - SERVICES"
echo -e "${GREEN}✓ Services${NC}"

for file in backend/src/services/*.js; do
    if [ -f "$file" ]; then
        add_file_to_doc "$file"
    fi
done

add_section "BACKEND - MODELS"
echo -e "${GREEN}✓ Models${NC}"

if [ -d "backend/src/models" ]; then
    for file in backend/src/models/*.js; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

add_section "BACKEND - UTILITIES"
echo -e "${GREEN}✓ Utils${NC}"

if [ -d "backend/src/utils" ]; then
    for file in backend/src/utils/*.js; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

################################################################################
# FRONTEND
################################################################################

add_section "FRONTEND - CORE APPLICATION"
echo -e "${GREEN}✓ Frontend Core${NC}"

if [ -f "frontend/src/App.js" ]; then
    add_file_to_doc "frontend/src/App.js"
fi

if [ -f "frontend/src/index.js" ]; then
    add_file_to_doc "frontend/src/index.js"
fi

add_section "FRONTEND - PAGES"
echo -e "${GREEN}✓ Pages${NC}"

if [ -d "frontend/src/pages" ]; then
    for file in frontend/src/pages/*.jsx frontend/src/pages/*.js; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

add_section "FRONTEND - COMPONENTS - DASHBOARDS"
echo -e "${GREEN}✓ Dashboard Components${NC}"

if [ -d "frontend/src/components/dashboards" ]; then
    for file in frontend/src/components/dashboards/*.jsx; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

add_section "FRONTEND - COMPONENTS - DETAILS"
echo -e "${GREEN}✓ Detail Components${NC}"

if [ -d "frontend/src/components/details" ]; then
    for file in frontend/src/components/details/*.jsx; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

add_section "FRONTEND - COMPONENTS - FORMS"
echo -e "${GREEN}✓ Form Components${NC}"

if [ -d "frontend/src/components/forms" ]; then
    for file in frontend/src/components/forms/*.jsx; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

add_section "FRONTEND - COMPONENTS - HEALTH CHECKS"
echo -e "${GREEN}✓ Health Check Components${NC}"

if [ -d "frontend/src/components/health" ]; then
    for file in frontend/src/components/health/*.jsx; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

add_section "FRONTEND - COMPONENTS - COMMON/WIDGETS"
echo -e "${GREEN}✓ Common/Widget Components${NC}"

if [ -d "frontend/src/components/common" ]; then
    for file in frontend/src/components/common/*.jsx; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

if [ -d "frontend/src/components/common/widgets" ]; then
    for file in frontend/src/components/common/widgets/*.jsx; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

add_section "FRONTEND - SERVICES"
echo -e "${GREEN}✓ Services${NC}"

if [ -d "frontend/src/services" ]; then
    for file in frontend/src/services/*.js; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

add_section "FRONTEND - UTILITIES"
echo -e "${GREEN}✓ Utils${NC}"

if [ -d "frontend/src/utils" ]; then
    for file in frontend/src/utils/*.js; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

add_section "FRONTEND - CONTEXT & HOOKS"
echo -e "${GREEN}✓ Context/Hooks${NC}"

if [ -d "frontend/src/context" ]; then
    for file in frontend/src/context/*.jsx frontend/src/context/*.js; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

if [ -d "frontend/src/hooks" ]; then
    for file in frontend/src/hooks/*.js; do
        if [ -f "$file" ]; then
            add_file_to_doc "$file"
        fi
    done
fi

################################################################################
# CONFIGURATION
################################################################################

add_section "CONFIGURATION FILES"
echo -e "${GREEN}✓ Configuration${NC}"

if [ -f "backend/package.json" ]; then
    add_file_to_doc "backend/package.json"
fi

if [ -f "frontend/package.json" ]; then
    add_file_to_doc "frontend/package.json"
fi

if [ -f "package.json" ]; then
    add_file_to_doc "package.json"
fi

################################################################################
# FOOTER
################################################################################

echo "" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "################################################################################" >> "$OUTPUT_FILE"
echo "#                          END OF DOCUMENTATION                                #" >> "$OUTPUT_FILE"
echo "################################################################################" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Total Lines: $(wc -l < "$OUTPUT_FILE")" >> "$OUTPUT_FILE"
echo "Generated: $TIMESTAMP" >> "$OUTPUT_FILE"

# Calculate file size
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      GENERATION COMPLETE                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Documentation saved to: ${YELLOW}$OUTPUT_FILE${NC}"
echo -e "${GREEN}✓ File size: ${YELLOW}$FILE_SIZE${NC}"
echo -e "${GREEN}✓ Total lines: ${YELLOW}$(wc -l < "$OUTPUT_FILE")${NC}"
echo ""
echo -e "${BLUE}You can now view the complete codebase documentation:${NC}"
echo -e "${YELLOW}  cat $OUTPUT_FILE${NC}"
echo -e "${YELLOW}  less $OUTPUT_FILE${NC}"
echo ""
