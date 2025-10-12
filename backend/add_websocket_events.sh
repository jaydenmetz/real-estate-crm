#!/bin/bash

# Script to add WebSocket events to appointments.controller.js and leads.controller.js
# Phase 1: WebSocket Real-Time Updates Implementation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTROLLERS_DIR="$SCRIPT_DIR/src/controllers"

echo "🔧 Adding WebSocket events to appointments and leads controllers..."

# Function to add WebSocket import if not present
add_websocket_import() {
  local file=$1
  if ! grep -q "websocketService" "$file"; then
    sed -i.bak '2a\
const websocketService = require('\''../services/websocket.service'\'');
' "$file"
    echo "✅ Added WebSocket import to $(basename $file)"
  else
    echo "⏭️  WebSocket already imported in $(basename $file)"
  fi
}

# Add import to appointments.controller.js
add_websocket_import "$CONTROLLERS_DIR/appointments.controller.js"

# Add import to leads.controller.js
add_websocket_import "$CONTROLLERS_DIR/leads.controller.js"

echo ""
echo "✅ WebSocket imports added successfully!"
echo "⚠️  Manual step required: Add WebSocket event emissions after res.json() in:"
echo "   - createAppointment, updateAppointment, deleteAppointment"
echo "   - createLead, updateLead, deleteLead"
echo ""
echo "Use the pattern from escrows.controller.js (lines 643-670)"
