#!/bin/bash

# Script to quickly update property images
# Usage: ./quick-image-update.sh "property address" "image url"

if [ $# -ne 2 ]; then
    echo "Usage: $0 \"property address\" \"image url\""
    echo "Example: $0 \"313 Darling Point Dr, Bakersfield, CA 93307\" \"https://photos.zillowstatic.com/...\""
    exit 1
fi

cd /Users/jaydenmetz/Desktop/real-estate-crm/backend
node src/scripts/update-zillow-images-final.js "$1" "$2"