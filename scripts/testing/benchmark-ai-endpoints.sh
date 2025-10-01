#!/bin/bash

###############################################################################
# AI Endpoint Performance Benchmark Script
# Tests response times and throughput for AI-ready endpoints
###############################################################################

API_URL="${API_URL:-https://api.jaydenmetz.com}"
API_KEY="${CRM_API_KEY:-$TEST_API_KEY}"
JWT="${TEST_JWT}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║              AI Endpoint Performance Benchmark Suite                      ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "API URL: $API_URL"
echo "Warmup: 3 requests per endpoint"
echo "Benchmark: 10 requests per endpoint"
echo ""

# Function to test endpoint performance
benchmark_endpoint() {
  local endpoint=$1
  local method=${2:-GET}
  local auth_header=$3
  local data=$4

  echo ""
  echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "${BLUE}Testing: $method $endpoint${NC}"
  echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  # Warmup (3 requests)
  echo -n "Warming up... "
  for i in {1..3}; do
    if [ "$method" = "POST" ]; then
      curl -s -o /dev/null -X POST "$API_URL$endpoint" \
        -H "$auth_header" \
        -H "Content-Type: application/json" \
        -d "$data" 2>/dev/null
    else
      curl -s -o /dev/null "$API_URL$endpoint" -H "$auth_header" 2>/dev/null
    fi
  done
  echo "done"

  # Benchmark (10 requests with timing)
  echo ""
  echo "Running benchmark (10 requests)..."

  local total_time=0
  local successful=0
  local failed=0
  local min_time=999999
  local max_time=0

  for i in {1..10}; do
    if [ "$method" = "POST" ]; then
      response_time=$(curl -s -o /dev/null -w "%{time_total}" -X POST "$API_URL$endpoint" \
        -H "$auth_header" \
        -H "Content-Type: application/json" \
        -d "$data" 2>/dev/null)
      status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL$endpoint" \
        -H "$auth_header" \
        -H "Content-Type: application/json" \
        -d "$data" 2>/dev/null)
    else
      response_time=$(curl -s -o /dev/null -w "%{time_total}" "$API_URL$endpoint" -H "$auth_header" 2>/dev/null)
      status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint" -H "$auth_header" 2>/dev/null)
    fi

    # Convert to milliseconds
    time_ms=$(echo "$response_time * 1000" | bc)

    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
      successful=$((successful + 1))
      echo "  Request $i: ${GREEN}${time_ms}ms${NC} (HTTP $status_code)"
    else
      failed=$((failed + 1))
      echo "  Request $i: ${RED}FAILED${NC} (HTTP $status_code)"
    fi

    total_time=$(echo "$total_time + $time_ms" | bc)

    # Track min/max
    if (( $(echo "$time_ms < $min_time" | bc -l) )); then
      min_time=$time_ms
    fi
    if (( $(echo "$time_ms > $max_time" | bc -l) )); then
      max_time=$time_ms
    fi
  done

  # Calculate average
  if [ $successful -gt 0 ]; then
    avg_time=$(echo "scale=2; $total_time / $successful" | bc)
  else
    avg_time=0
  fi

  echo ""
  echo "${YELLOW}Results:${NC}"
  echo "  ✅ Successful: $successful/10"
  echo "  ❌ Failed: $failed/10"
  echo "  ⚡ Average: ${avg_time}ms"
  echo "  📊 Min: ${min_time}ms"
  echo "  📊 Max: ${max_time}ms"

  # Performance rating
  if (( $(echo "$avg_time < 50" | bc -l) )); then
    echo "  ${GREEN}⭐⭐⭐⭐⭐ Excellent (<50ms)${NC}"
  elif (( $(echo "$avg_time < 100" | bc -l) )); then
    echo "  ${GREEN}⭐⭐⭐⭐ Great (<100ms)${NC}"
  elif (( $(echo "$avg_time < 200" | bc -l) )); then
    echo "  ${YELLOW}⭐⭐⭐ Good (<200ms)${NC}"
  elif (( $(echo "$avg_time < 500" | bc -l) )); then
    echo "  ${YELLOW}⭐⭐ Fair (<500ms)${NC}"
  else
    echo "  ${RED}⭐ Slow (>500ms)${NC}"
  fi
}

# Check if API key or JWT is available
if [ -z "$API_KEY" ] && [ -z "$JWT" ]; then
  echo "${RED}❌ Error: Neither CRM_API_KEY nor TEST_JWT environment variable is set${NC}"
  echo "Usage: CRM_API_KEY=your-key $0"
  exit 1
fi

# Determine auth header to use
if [ -n "$API_KEY" ]; then
  AUTH_HEADER="X-API-Key: $API_KEY"
  echo "Using API Key authentication"
elif [ -n "$JWT" ]; then
  AUTH_HEADER="Authorization: Bearer $JWT"
  echo "Using JWT authentication"
fi

echo ""
echo "${YELLOW}═══════════════════════════════════════════════════════════════════════════${NC}"
echo "${YELLOW}Phase 1: OpenAPI Specification Endpoints${NC}"
echo "${YELLOW}═══════════════════════════════════════════════════════════════════════════${NC}"

# OpenAPI spec (no auth required)
benchmark_endpoint "/v1/openapi.json" "GET" ""

# Swagger UI (no auth required)
benchmark_endpoint "/v1/api-docs" "GET" ""

echo ""
echo "${YELLOW}═══════════════════════════════════════════════════════════════════════════${NC}"
echo "${YELLOW}Phase 2: Natural Language Query Endpoints${NC}"
echo "${YELLOW}═══════════════════════════════════════════════════════════════════════════${NC}"

# AI suggestions
benchmark_endpoint "/v1/ai/suggestions" "GET" "$AUTH_HEADER"

# Note: Skipping actual AI query test to avoid OpenAI API costs
echo ""
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}Skipping: POST /v1/ai/query${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Reason: Avoided to prevent OpenAI API costs"
echo "Expected: 600-1700ms (includes OpenAI API latency)"

echo ""
echo "${YELLOW}═══════════════════════════════════════════════════════════════════════════${NC}"
echo "${YELLOW}Core CRUD Endpoints (for comparison)${NC}"
echo "${YELLOW}═══════════════════════════════════════════════════════════════════════════${NC}"

# Core REST endpoints
benchmark_endpoint "/v1/escrows?limit=10" "GET" "$AUTH_HEADER"
benchmark_endpoint "/v1/listings?limit=10" "GET" "$AUTH_HEADER"
benchmark_endpoint "/v1/clients?limit=10" "GET" "$AUTH_HEADER"
benchmark_endpoint "/v1/appointments?limit=10" "GET" "$AUTH_HEADER"
benchmark_endpoint "/v1/leads?limit=10" "GET" "$AUTH_HEADER"

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                         BENCHMARK COMPLETE                                ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "${GREEN}✅ Performance benchmarking completed successfully${NC}"
echo ""
echo "Key Findings:"
echo "  • OpenAPI spec delivery should be <50ms (cached)"
echo "  • REST endpoints should be <200ms (database query)"
echo "  • AI query endpoints will be slower due to OpenAI API (~600-1700ms)"
echo ""
echo "Next Steps:"
echo "  1. Run this benchmark before and after infrastructure changes"
echo "  2. Monitor for performance degradation over time"
echo "  3. Consider caching strategies if response times increase"
echo ""
