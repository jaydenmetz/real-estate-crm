#!/usr/bin/env bash
set -e

# Change to project root (script is in scripts/ subdirectory)
cd "$(dirname "$0")/.."

OUTPUT="all-code.txt"
> "$OUTPUT"

# 1) Full project tree (excluding .git and node_modules)
echo "PROJECT FILE STRUCTURE"               >> "$OUTPUT"
echo "======================"               >> "$OUTPUT"
# Use ASCII-only characters for compatibility
find . \
  \( -path './.git' -o -path './node_modules' \) -prune \
  -o -print \
  | sed 's|^\./||' \
  | sort \
  | awk '{
      depth = gsub(/\//, "/");
      indent = "";
      for (i = 0; i < depth; i++) indent = indent "  ";
      name = $0;
      sub(/.*\//, "", name);
      print indent "- " name;
    }' \
  >> "$OUTPUT"

echo -e "\n\nCONCATENATED SOURCE FILES"       >> "$OUTPUT"
echo "=========================="             >> "$OUTPUT"
echo ""                                     >> "$OUTPUT"

# 2) Only source files under backend/src and frontend/src
#    skip any file git ignores and .gitignore itself
EXTS="js jsx ts tsx json css scss md yml yaml sh"

for ext in $EXTS; do
  find backend/src frontend/src -type f -iname "*.${ext}" \
    | sort \
    | while read -r file; do
        # skip .gitignore files
        [[ "$(basename "$file")" == ".gitignore" ]] && continue
        # skip anything .gitignore marks ignored
        if git check-ignore -q "$file"; then
          continue
        fi
        echo "// File: $file"                >> "$OUTPUT"
        cat "$file"                          >> "$OUTPUT"
        echo -e "\n"                         >> "$OUTPUT"
    done
done

echo "✅ Generated $OUTPUT with full tree + backend/src & frontend/src code"  