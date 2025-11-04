#!/bin/bash

# Test script for webhooks
# Usage: ./scripts/test-call.sh

BASE_URL=${1:-http://localhost:3000}

echo "Testing Agronomic Chatbot Webhooks"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -X GET "$BASE_URL/webhooks/health" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 2: Simulate incoming call
echo "2. Simulating incoming call..."
curl -X POST "$BASE_URL/webhooks/at/voice" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "sessionId=test-session-123" \
  -d "phoneNumber=+254712345678" \
  -d "isActive=1"
echo -e "\n"

# Test 3: Language selection
echo "3. Simulating language selection (Swahili)..."
curl -X POST "$BASE_URL/webhooks/at/language-selected" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "sessionId=test-session-123" \
  -d "dtmfDigits=2"
echo -e "\n"

# Test 4: Menu selection
echo "4. Simulating menu selection (farming advice)..."
curl -X POST "$BASE_URL/webhooks/at/menu-selected" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "sessionId=test-session-123" \
  -d "dtmfDigits=1"
echo -e "\n"

echo "Tests completed!"
