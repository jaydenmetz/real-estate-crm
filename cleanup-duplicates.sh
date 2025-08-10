#!/bin/bash

# Code Cleanup Script - Remove Duplicates and Outdated Code
# Date: August 9, 2025
# BACKUP YOUR CODE BEFORE RUNNING THIS!

echo "🧹 Real Estate CRM - Code Cleanup Script"
echo "========================================="
echo ""
echo "⚠️  WARNING: This will delete duplicate and unused files!"
echo "Make sure you have a backup or committed your changes."
echo ""
read -p "Continue with cleanup? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 1
fi

echo ""
echo "📁 Step 1: Removing duplicate route files..."
echo "---------------------------------------------"

# Remove unused .routes.js files (we're using the .js versions)
rm -f backend/src/routes/escrows.routes.js && echo "✅ Removed escrows.routes.js"
rm -f backend/src/routes/listings.routes.js && echo "✅ Removed listings.routes.js"
rm -f backend/src/routes/clients.routes.js && echo "✅ Removed clients.routes.js"
rm -f backend/src/routes/appointments.routes.js && echo "✅ Removed appointments.routes.js"
rm -f backend/src/routes/leads.routes.js && echo "✅ Removed leads.routes.js"
rm -f backend/src/routes/analytics.routes.js && echo "✅ Removed analytics.routes.js"
rm -f backend/src/routes/communications.routes.js && echo "✅ Removed communications.routes.js"
rm -f backend/src/routes/detailRoutes.js && echo "✅ Removed detailRoutes.js"

echo ""
echo "📁 Step 2: Removing duplicate controller files..."
echo "-------------------------------------------------"

# Remove duplicate controllers
rm -f backend/src/controllers/clients.controller.db.js && echo "✅ Removed clients.controller.db.js"
rm -f backend/src/controllers/escrows.restructured.js && echo "✅ Removed escrows.restructured.js"

echo ""
echo "📁 Step 3: Removing backup and old files..."
echo "-------------------------------------------"

# Remove backup files
rm -f frontend/src/components/details/EscrowDetail.old.jsx && echo "✅ Removed EscrowDetail.old.jsx"
rm -f frontend/src/components/details/EscrowDetail.jsx.backup && echo "✅ Removed EscrowDetail.jsx.backup"

echo ""
echo "📁 Step 4: Removing unused debug components..."
echo "----------------------------------------------"
echo "⚠️  Keeping only DebugCardWithApiTests and DebugError"

# First, update imports in files that use the old components
echo "Updating imports in components..."

# Update ClientDetail.jsx to use DebugCardWithApiTests
if [ -f "frontend/src/components/details/ClientDetail.jsx" ]; then
    sed -i '' "s/import DetailPageDebugger/import DebugCardWithApiTests/g" frontend/src/components/details/ClientDetail.jsx
    sed -i '' "s/<DetailPageDebugger/<DebugCardWithApiTests pageType=\"client-detail\"/g" frontend/src/components/details/ClientDetail.jsx
    echo "✅ Updated ClientDetail.jsx"
fi

# Update AppointmentDetail.jsx to use DebugCardWithApiTests
if [ -f "frontend/src/components/details/AppointmentDetail.jsx" ]; then
    sed -i '' "s/import DetailPageDebugger/import DebugCardWithApiTests/g" frontend/src/components/details/AppointmentDetail.jsx
    sed -i '' "s/<DetailPageDebugger/<DebugCardWithApiTests pageType=\"appointment-detail\"/g" frontend/src/components/details/AppointmentDetail.jsx
    echo "✅ Updated AppointmentDetail.jsx"
fi

# Update LeadDetail.jsx to use DebugCardWithApiTests
if [ -f "frontend/src/components/details/LeadDetail.jsx" ]; then
    sed -i '' "s/import DetailPageDebugger/import DebugCardWithApiTests/g" frontend/src/components/details/LeadDetail.jsx
    sed -i '' "s/<DetailPageDebugger/<DebugCardWithApiTests pageType=\"lead-detail\"/g" frontend/src/components/details/LeadDetail.jsx
    echo "✅ Updated LeadDetail.jsx"
fi

# Update EscrowsDashboard to use DebugCardWithApiTests
if [ -f "frontend/src/components/dashboards/EscrowsDashboard.jsx" ]; then
    sed -i '' "/import DebugPanel/d" frontend/src/components/dashboards/EscrowsDashboard.jsx
    sed -i '' "s/import DebugCard/import DebugCardWithApiTests/g" frontend/src/components/dashboards/EscrowsDashboard.jsx
    sed -i '' "s/<DebugCard/<DebugCardWithApiTests/g" frontend/src/components/dashboards/EscrowsDashboard.jsx
    echo "✅ Updated EscrowsDashboard.jsx"
fi

# Update HealthCheckDashboard to use DebugCardWithApiTests
if [ -f "frontend/src/components/health/HealthCheckDashboard.jsx" ]; then
    sed -i '' "s/import DebugCard/import DebugCardWithApiTests/g" frontend/src/components/health/HealthCheckDashboard.jsx
    sed -i '' "s/<DebugCard/<DebugCardWithApiTests/g" frontend/src/components/health/HealthCheckDashboard.jsx
    echo "✅ Updated HealthCheckDashboard.jsx"
fi

# Now remove the unused debug components
rm -f frontend/src/components/common/DebugCard.jsx && echo "✅ Removed DebugCard.jsx"
rm -f frontend/src/components/common/DebugPanel.jsx && echo "✅ Removed DebugPanel.jsx"
rm -f frontend/src/components/common/DetailPageDebugger.jsx && echo "✅ Removed DetailPageDebugger.jsx"
rm -f frontend/src/components/common/EnhancedDetailDebugger.jsx && echo "✅ Removed EnhancedDetailDebugger.jsx"

echo ""
echo "📁 Step 5: Removing test route files from main routes..."
echo "--------------------------------------------------------"

# Move test files to a test directory (don't delete, might be useful)
mkdir -p backend/src/routes/__test_routes__
mv backend/src/routes/simple-test.js backend/src/routes/__test_routes__/ 2>/dev/null && echo "✅ Moved simple-test.js"
mv backend/src/routes/test-auth.js backend/src/routes/__test_routes__/ 2>/dev/null && echo "✅ Moved test-auth.js"
mv backend/src/routes/test-connection.js backend/src/routes/__test_routes__/ 2>/dev/null && echo "✅ Moved test-connection.js"

echo ""
echo "📁 Step 6: Cleaning up test files..."
echo "------------------------------------"

# Remove standalone test files
rm -f test-frontend-auth.sh && echo "✅ Removed test-frontend-auth.sh"
rm -f data.txt && echo "✅ Removed data.txt"
rm -f data.txt.save && echo "✅ Removed data.txt.save"

echo ""
echo "✨ Cleanup Complete!"
echo "===================="
echo ""
echo "📊 Summary:"
echo "- Removed duplicate route files"
echo "- Removed duplicate controllers"
echo "- Consolidated debug components to DebugCardWithApiTests"
echo "- Moved test routes to __test_routes__ directory"
echo "- Cleaned up backup files"
echo ""
echo "⚠️  Next Steps:"
echo "1. Run 'npm run build' in frontend directory"
echo "2. Test the application to ensure everything works"
echo "3. Commit these changes"
echo ""
echo "If you encounter any issues, you can restore from git:"
echo "git checkout -- ."
echo ""