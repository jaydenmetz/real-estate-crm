#\!/bin/bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NDgzMTE1LTBlM2UtNDNmMy04YTRhLTQ4OGE2ZjBkZjAxNyIsImVtYWlsIjoiYWRtaW5AamF5ZGVubWV0ei5jb20iLCJyb2xlIjpbInN5c3RlbV9hZG1pbiJdLCJpYXQiOjE3NjMwNzU2MzAsImV4cCI6MTc2MzA3NjUzMH0.NIXPy_YZ_QMWGUMGTLZgwlGbgS_sy6gIFRX_q1x334c"

echo "Testing listings API..."
curl -s "https://api.jaydenmetz.com/v1/listings?limit=10" \
  -H "Authorization: Bearer $TOKEN" | head -100
