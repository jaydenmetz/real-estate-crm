#!/bin/bash

echo "Testing Zillow Open Graph extraction"
echo "===================================="
echo ""

ZILLOW_URL="https://www.zillow.com/homedetails/5609-Monitor-St-Bakersfield-CA-93307/19015640_zpid/"

echo "Fetching first 50KB of Zillow page to find og:image..."
echo ""

curl -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" \
     -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" \
     -H "Accept-Language: en-US,en;q=0.5" \
     -H "Accept-Encoding: gzip, deflate, br" \
     -H "Connection: keep-alive" \
     -H "Upgrade-Insecure-Requests: 1" \
     --compressed \
     --max-time 10 \
     "$ZILLOW_URL" | head -c 50000 | grep -o '<meta property="og:image" content="[^"]*"' | sed 's/<meta property="og:image" content="//;s/"$//'

echo ""
echo ""
echo "Alternative method using opengraph.xyz:"
echo "https://www.opengraph.xyz/url/https%3A%2F%2Fwww.zillow.com%2Fhomedetails%2F5609-Monitor-St-Bakersfield-CA-93307%2F19015640_zpid%2F"