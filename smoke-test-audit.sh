#!/bin/bash
# Comprehensive Smoke Test Audit for Dakshin Delights
# Date: 2026-02-15
# Test Plan: Critical user flows and API endpoints

echo "=========================================="
echo "DAKSHIN DELIGHTS - SMOKE TEST AUDIT"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Environment: Local Development"
echo "=========================================="
echo ""

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Test 1: Frontend Health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 1] Frontend Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "URL: http://localhost:3000"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$response" = "200" ]; then
  echo "Status: ✓ PASS"
  echo "Result: Frontend is responding (HTTP $response)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Frontend returned HTTP $response"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 2: Frontend Content
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 2] Frontend Content Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
html_content=$(curl -s http://localhost:3000)
if echo "$html_content" | grep -q '<div id="root">'; then
  echo "Status: ✓ PASS"
  echo "Result: React root div found"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: React root div not found"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 3: Backend Health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 3] Backend API Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "URL: http://localhost:3001/api/menu"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/menu)
if [ "$response" = "200" ]; then
  echo "Status: ✓ PASS"
  echo "Result: Backend API is responding (HTTP $response)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Backend API returned HTTP $response"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 4: Menu API Response
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 4] Menu API - Data Retrieval"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
menu_response=$(curl -s http://localhost:3001/api/menu)
if [ ! -z "$menu_response" ] && echo "$menu_response" | grep -q '"id"'; then
  echo "Status: ✓ PASS"
  echo "Result: Menu API returned valid data"
  echo "Sample: $(echo "$menu_response" | head -c 150)..."
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Menu API returned no data or invalid response"
  echo "Response: $menu_response"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 5: Cart Session Creation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 5] Cart API - Session Creation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cart_response=$(curl -s -X POST http://localhost:3001/api/cart/session \
  -H "Content-Type: application/json" \
  -d '{}' 2>&1)
if echo "$cart_response" | grep -q '"sessionId"'; then
  session_id=$(echo "$cart_response" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
  echo "Status: ✓ PASS"
  echo "Result: Cart session created successfully"
  echo "Session ID: $session_id"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Cart session creation failed"
  echo "Response: $cart_response"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 6: Cart Operations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 6] Cart API - Add Item"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ ! -z "$session_id" ]; then
  add_response=$(curl -s -X POST "http://localhost:3001/api/cart/add?sessionId=$session_id" \
    -H "Content-Type: application/json" \
    -d '{"menuItemId":"1","quantity":1}' 2>&1)
  if echo "$add_response" | grep -q '"success".*true\|"cart"'; then
    echo "Status: ✓ PASS"
    echo "Result: Item added to cart successfully"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "Status: ✗ FAIL"
    echo "Result: Failed to add item to cart"
    echo "Response: $add_response"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
else
  echo "Status: ⊘ SKIP"
  echo "Result: No session ID available from previous test"
fi
echo ""

# Test 7: Orders API
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 7] Orders API - Fetch Orders"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
orders_response=$(curl -s "http://localhost:3001/api/orders?sessionId=test-session" 2>&1)
response_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/orders?sessionId=test-session")
if [ "$response_code" = "200" ]; then
  echo "Status: ✓ PASS"
  echo "Result: Orders API is responding correctly (HTTP $response_code)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Orders API failed (HTTP $response_code)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 8: AI Image Generation Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 8] AI Proxy - Image Generation Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ai_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/generate-image \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}' 2>&1)
if [ "$ai_response" = "200" ] || [ "$ai_response" = "400" ] || [ "$ai_response" = "429" ]; then
  echo "Status: ✓ PASS"
  echo "Result: AI endpoint is reachable (HTTP $ai_response)"
  PASS_COUNT=$((PASS_COUNT + 1))
elif [ "$ai_response" = "500" ]; then
  echo "Status: ⚠ WARNING"
  echo "Result: AI endpoint reachable but may need API key (HTTP $ai_response)"
  WARN_COUNT=$((WARN_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: AI endpoint not found (HTTP $ai_response)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 9: WebSocket Proxy Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 9] WebSocket Proxy - Connection Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ws_check=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/live-ws)
if [ "$ws_check" = "400" ] || [ "$ws_check" = "426" ]; then
  echo "Status: ✓ PASS"
  echo "Result: WebSocket endpoint is available (HTTP $ws_check - upgrade required)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ⚠ WARNING"
  echo "Result: WebSocket endpoint returned HTTP $ws_check"
  WARN_COUNT=$((WARN_COUNT + 1))
fi
echo ""

# Test 10: Static Assets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 10] Frontend - Static Assets Loading"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
html_content=$(curl -s http://localhost:3000)
if echo "$html_content" | grep -q 'type="module"'; then
  echo "Status: ✓ PASS"
  echo "Result: ES modules are configured"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: ES module configuration missing"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Summary Report
echo "=========================================="
echo "SMOKE TEST SUMMARY"
echo "=========================================="
echo "Total Tests: $((PASS_COUNT + FAIL_COUNT + WARN_COUNT))"
echo "✓ Passed: $PASS_COUNT"
echo "✗ Failed: $FAIL_COUNT"
echo "⚠ Warnings: $WARN_COUNT"
echo ""
echo "Test completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Overall Status
if [ $FAIL_COUNT -eq 0 ]; then
  echo "Overall Status: ✓ ALL TESTS PASSED"
  exit 0
else
  echo "Overall Status: ✗ SOME TESTS FAILED"
  exit 1
fi
