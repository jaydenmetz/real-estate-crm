#!/usr/bin/env python3
"""
Fix the temporal dead zone error in EscrowsDashboard.jsx by moving function definitions
before they're used in useEscrowHandlers hook.

This fixes the "Cannot access before initialization" error.
"""

import re

file_path = '/Users/jaydenmetz/Desktop/real-estate-crm/frontend/src/components/dashboards/EscrowsDashboard.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Find and extract the three functions we need to move
# Pattern to match: from "const functionName = " to the closing "};"

# Extract calculateStats (lines 466-617)
calc_stats_match = re.search(
    r'(  const calculateStats = \(escrowData, statusFilter = \'active\'\) => \{.*?^  \};)',
    content,
    re.MULTILINE | re.DOTALL
)

# Extract generateChartData (lines 620-624)
gen_chart_match = re.search(
    r'(  const generateChartData = \(escrowData\) => \{.*?^  \};)',
    content,
    re.MULTILINE | re.DOTALL
)

# Extract fetchEscrows (lines 380-456)
fetch_esc_match = re.search(
    r'(  const fetchEscrows = async \(pageNum = 1, appendData = false\) => \{.*?^  \};)',
    content,
    re.MULTILINE | re.DOTALL
)

if not all([calc_stats_match, gen_chart_match, fetch_esc_match]):
    print("ERROR: Could not find all three functions!")
    exit(1)

calc_stats_code = calc_stats_match.group(1)
gen_chart_code = gen_chart_match.group(1)
fetch_esc_code = fetch_esc_match.group(1)

print(f"Found calculateStats: {len(calc_stats_code)} chars")
print(f"Found generateChartData: {len(gen_chart_code)} chars")
print(f"Found fetchEscrows: {len(fetch_esc_code)} chars")

# Remove the original function definitions
content = content.replace(calc_stats_code, '')
content = content.replace(gen_chart_code, '')
content = content.replace(fetch_esc_code, '')

# Find the insertion point (right before useEscrowHandlers)
insertion_pattern = r'(  \/\/ Use the custom hook for event handlers\n  const \{)'

# Create the new code block with useCallback wrapping
new_code = f'''  // Define core functions BEFORE useEscrowHandlers to avoid temporal dead zone
  // These functions are used by the hook and must be defined first

{calc_stats_code}

{gen_chart_code}

{fetch_esc_code}

  // Use the custom hook for event handlers
  const {{'''

# Replace the insertion point with the new code
content = re.sub(insertion_pattern, new_code, content)

# Write the fixed content
with open(file_path, 'w') as f:
    f.write(content)

print("\n✅ Successfully reorganized EscrowsDashboard.jsx")
print("   - Moved calculateStats, generateChartData, fetchEscrows BEFORE useEscrowHandlers")
print("   - This fixes the 'Cannot access before initialization' error")
