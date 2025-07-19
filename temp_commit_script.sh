#!/bin/bash
cd /Users/jaydenmetz/Desktop/real-estate-crm

# Stage all changes
git add .

# Create commit with message
git commit -m "$(cat <<'EOF'
Replace mock data with database integration for escrows and listings

- Updated escrows routes to always use database controller
- Updated listings routes to use listings controller instead of mock data
- Updated frontend API to use main endpoints instead of /database
- Created comprehensive SQL scripts to insert test data for both escrows and listings
- Removed all mock data logic from routes

This ensures dashboards display actual database data instead of in-memory mock data.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Show commit status
git status