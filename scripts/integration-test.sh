#!/bin/bash

# Integration test script for Product Requirements Assistant
set -e

BASE_URL="http://localhost:8080"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🧪 Starting integration tests for Product Requirements Assistant"
echo "Base URL: $BASE_URL"

# Check if backend is running
echo "1. Testing backend connectivity..."
response=$(curl -s -w "%{http_code}" "$BASE_URL/api/health" -o /dev/null)
if [ "$response" != "200" ]; then
    echo "❌ Backend not responding. Please start it with 'make run-backend'"
    exit 1
fi
echo "✅ Backend is running"

# Test health endpoint
echo "2. Testing health endpoint..."
health_response=$(curl -s "$BASE_URL/api/health")
if echo "$health_response" | grep -q "healthy"; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed"
    exit 1
fi

# Test project creation
echo "3. Testing project creation..."
create_payload='{
    "title": "Integration Test Project",
    "problems": "Testing project creation functionality",
    "context": "Automated integration test"
}'

project_response=$(curl -s -X POST "$BASE_URL/api/projects" \
    -H "Content-Type: application/json" \
    -d "$create_payload")

if echo "$project_response" | grep -q "Integration Test Project"; then
    echo "✅ Project creation working"
    project_id=$(echo "$project_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Created project with ID: $project_id"
else
    echo "❌ Project creation failed"
    echo "Response: $project_response"
    exit 1
fi

# Test project retrieval
echo "4. Testing project retrieval..."
get_response=$(curl -s "$BASE_URL/api/projects/$project_id")
if echo "$get_response" | grep -q "Integration Test Project"; then
    echo "✅ Project retrieval working"
else
    echo "❌ Project retrieval failed"
    exit 1
fi

# Test project listing
echo "5. Testing project listing..."
list_response=$(curl -s "$BASE_URL/api/projects")
if echo "$list_response" | grep -q "$project_id"; then
    echo "✅ Project listing working"
else
    echo "❌ Project listing failed"
    exit 1
fi

# Test prompt endpoints
echo "6. Testing prompt endpoints..."
for phase in "claude_initial" "gemini_review" "claude_compare"; do
    prompt_response=$(curl -s "$BASE_URL/api/prompts/$phase")
    if echo "$prompt_response" | grep -q "content"; then
        echo "✅ Prompt endpoint for $phase working"
    else
        echo "❌ Prompt endpoint for $phase failed"
        exit 1
    fi
done

# Test phase update
echo "7. Testing phase update..."
phase_payload='{
    "content": "# Test Phase Content\n\nThis is a test phase update from integration tests."
}'

phase_response=$(curl -s -X POST "$BASE_URL/api/projects/$project_id/phase/1" \
    -H "Content-Type: application/json" \
    -d "$phase_payload")

if echo "$phase_response" | grep -q "Test Phase Content"; then
    echo "✅ Phase update working"
else
    echo "❌ Phase update failed"
    echo "Response: $phase_response"
    exit 1
fi

# Test invalid requests for proper error handling
echo "8. Testing error handling..."

# Test invalid project creation
invalid_create=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/projects" \
    -H "Content-Type: application/json" \
    -d '{"title":"","problems":""}' -o /dev/null)

if [ "${invalid_create: -3}" = "400" ]; then
    echo "✅ Input validation working"
else
    echo "❌ Input validation failed - should return 400 for invalid input"
    exit 1
fi

# Test nonexistent project (using valid UUID format that doesn't exist)
nonexistent_response=$(curl -s -w "%{http_code}" "$BASE_URL/api/projects/00000000-0000-0000-0000-000000000000" -o /dev/null)
if [ "${nonexistent_response: -3}" = "404" ]; then
    echo "✅ 404 handling working"
else
    echo "❌ 404 handling failed"
    exit 1
fi

echo ""
echo "All integration tests passed."
echo "Backend API is functioning correctly"
echo "All endpoints responding as expected"
echo "Error handling working properly"

exit 0