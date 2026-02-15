#!/bin/bash
# Smoke Test for Dakshin Delights
# Date: 2026-02-15

echo "=========================================="
echo "DAKSHIN DELIGHTS - SMOKE TEST AUDIT"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Test 1: Frontend Health
echo "[TEST 1] Frontend Health Check"
echo "Testing: http://localhost:3000"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$response" = "200" ]; then
  echo "✓ PASS - Frontend is responding (HTTP $response)"
else
  echo "✗ FAIL - Frontend returned HTTP $response"
fi
echo ""

# Test 2: Backend Health
echo "[TEST 2] Backend API Health Check"
echo "Testing: http://localhost:3001/api/menu"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/menu)
if [ "$response" = "200" ]; then
  echo "✓ PASS - Backend API is responding (HTTP $response)"
else
  echo "✗ FAIL - Backend API returned HTTP $response"
fi
echo ""

# Test 3: Menu API
echo "[TEST 3] Menu API - Fetch Menu Items"
menu_response=$(curl -s http://localhost:3001/api/menu)
menu_count=$(echo "$menu_response" | jq '. | length' 2>/dev/null)
if [ ! -z "$menu_count" ] && [ "$menu_count" -gt 0 ]; then
  echo "✓ PASS - Menu API returned $menu_count items"
  echo "Sample item: $(echo "$menu_response" | jq '.[0].name' 2>/dev/null)"
else
  echo "✗ FAIL - Menu API returned no items or invalid JSON"
fi
echo ""

# Test 4: Cart API
echo "[TEST 4] Cart API - Create Session"
cart_response=$(curl -s -X POST http://localhost:3001/api/cart/session \
  -H "Content-Type: application/json" \
  -d '{}')
session_id=$(echo "$cart_response" | jq -r '.sessionId' 2>/dev/null)
if [ ! -z "$session_id" ] && [ "$session_id" != "null" ]; then
  echo "✓ PASS - Cart session created: $session_id"
else
  echo "✗ FAIL - Cart session creation failed"
fi
echo ""

# Test 5: Orders API
echo "[TEST 5] Orders API - Fetch Orders"
orders_response=$(curl -s "http://localhost:3001/api/orders?sessionId=test-session")
if [ ! -z "$orders_response" ]; then
  echo "✓ PASS - Orders API is responding"
else
  echo "✗ FAIL - Orders API failed"
fi
echo ""

# Test 6: AI Proxy API
echo "[TEST 6] AI Proxy API - Health Check"
ai_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/generate-image \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}' 2>/dev/null || echo "000")
if [ "$ai_response" = "200" ] || [ "$ai_response" = "400" ] || [ "$ai_response" = "429" ]; then
  echo "✓ PASS - AI Proxy endpoint is reachable (HTTP $ai_response)"
else
  echo "⚠ WARNING - AI Proxy returned HTTP $ai_response (may require API key)"
fi
echo ""

echo "=========================================="
echo "SMOKE TEST SUMMARY"
echo "=========================================="
echo "Test completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
