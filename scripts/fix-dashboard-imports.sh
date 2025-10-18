#!/bin/bash
# Fix import paths for dashboards moved into folders
# Changes '../' to '../../' for all service/util imports

cd /Users/jaydenmetz/Desktop/real-estate-crm/frontend/src/components/dashboards

echo "Fixing import paths for all dashboards..."

for dashboard in listings clients leads appointments; do
    echo "  Processing $dashboard/index.jsx..."

    # Fix imports that need to go up one more level
    sed -i '' "s|from '\.\./forms/|from '../../forms/|g" "$dashboard/index.jsx"
    sed -i '' "s|from '\.\./common/|from '../../common/|g" "$dashboard/index.jsx"
    sed -i '' "s|from '\.\./details/|from '../../details/|g" "$dashboard/index.jsx"
    sed -i '' "s|from '\.\./\.\./utils/|from '../../../utils/|g" "$dashboard/index.jsx"
    sed -i '' "s|from '\.\./\.\./services/|from '../../../services/|g" "$dashboard/index.jsx"
    sed -i '' "s|from '\.\./\.\./contexts/|from '../../../contexts/|g" "$dashboard/index.jsx"
    sed -i '' "s|from '\.\./\.\./hooks/|from '../../../hooks/|g" "$dashboard/index.jsx"

    # Fix require() statements for websocket
    sed -i '' "s|require('\.\./\.\./services/websocket|require('../../../services/websocket|g" "$dashboard/index.jsx"

    echo "    ✅ Fixed $dashboard"
done

echo "✅ All dashboard imports fixed!"
