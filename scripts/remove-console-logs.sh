#!/bin/bash

# Script to remove console.log statements from production code
# Keeps console.error and console.warn for important messages

echo "🔍 Scanning for console.log statements..."

# Count current console.logs
FRONTEND_LOGS=$(grep -r "console\.log" frontend/src --exclude-dir=node_modules --exclude-dir=build | wc -l | tr -d ' ')
BACKEND_LOGS=$(grep -r "console\.log" backend/src --exclude-dir=node_modules | wc -l | tr -d ' ')

echo "Found $FRONTEND_LOGS console.log statements in frontend"
echo "Found $BACKEND_LOGS console.log statements in backend"
echo ""

# Function to clean a file
clean_file() {
    local file=$1
    local temp_file="${file}.tmp"

    # Remove or comment out console.log lines
    # Keep console.error and console.warn
    sed 's/console\.log/\/\/ console.log/g' "$file" > "$temp_file"

    # Check if file was modified
    if ! diff -q "$file" "$temp_file" > /dev/null; then
        mv "$temp_file" "$file"
        echo "✅ Cleaned: $file"
        return 0
    else
        rm "$temp_file"
        return 1
    fi
}

# Clean frontend files
echo "🧹 Cleaning frontend files..."
CLEANED=0

# Priority files to clean first
PRIORITY_FILES=(
    "frontend/src/components/dashboards/EscrowsDashboard.jsx"
    "frontend/src/components/dashboards/ListingsDashboard.jsx"
    "frontend/src/components/dashboards/ClientsDashboard.jsx"
    "frontend/src/components/dashboards/AppointmentsDashboard.jsx"
    "frontend/src/components/dashboards/LeadsDashboard.jsx"
    "frontend/src/services/api.service.js"
    "frontend/src/services/websocket.service.js"
)

for file in "${PRIORITY_FILES[@]}"; do
    if [ -f "$file" ]; then
        if clean_file "$file"; then
            ((CLEANED++))
        fi
    fi
done

# Clean all other JavaScript files
find frontend/src -name "*.js" -o -name "*.jsx" | while read -r file; do
    if [[ ! " ${PRIORITY_FILES[@]} " =~ " ${file} " ]]; then
        if grep -q "console\.log" "$file"; then
            if clean_file "$file"; then
                ((CLEANED++))
            fi
        fi
    fi
done

echo ""
echo "🧹 Cleaning backend files..."

# Clean backend files
find backend/src -name "*.js" | while read -r file; do
    if grep -q "console\.log" "$file"; then
        if clean_file "$file"; then
            ((CLEANED++))
        fi
    fi
done

echo ""
echo "✨ Cleanup complete!"
echo "Cleaned $CLEANED files"

# Final count
NEW_FRONTEND_LOGS=$(grep -r "^[^/]*console\.log" frontend/src --exclude-dir=node_modules --exclude-dir=build | wc -l | tr -d ' ')
NEW_BACKEND_LOGS=$(grep -r "^[^/]*console\.log" backend/src --exclude-dir=node_modules | wc -l | tr -d ' ')

echo ""
echo "📊 Results:"
echo "Frontend: $FRONTEND_LOGS → $NEW_FRONTEND_LOGS console.log statements"
echo "Backend: $BACKEND_LOGS → $NEW_BACKEND_LOGS console.log statements"

if [ "$NEW_FRONTEND_LOGS" -eq "0" ] && [ "$NEW_BACKEND_LOGS" -eq "0" ]; then
    echo "🎉 All console.log statements removed!"
else
    echo "⚠️  Some console.log statements may remain. Review manually if needed."
fi