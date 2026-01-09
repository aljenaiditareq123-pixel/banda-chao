#!/bin/bash

# Production Health Check Script
# Checks all critical services and endpoints for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (can be overridden via environment variables)
BACKEND_URL="${BACKEND_URL:-https://banda-chao-backend.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://banda-chao-frontend.onrender.com}"
TIMEOUT=10

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

info() {
    echo -e "ℹ️  INFO: $1"
}

check_http_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    info "Checking $description..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        pass "$description (HTTP $response)"
        return 0
    else
        fail "$description (HTTP $response, expected $expected_status)"
        return 1
    fi
}

check_health_endpoint() {
    local url=$1
    local service=$2
    
    info "Checking $service health endpoint..."
    
    response=$(curl -s --max-time $TIMEOUT "$url" || echo "ERROR")
    
    if [ "$response" = "OK" ] || [ "$response" = "ok" ]; then
        pass "$service health check"
        return 0
    else
        fail "$service health check (response: $response)"
        return 1
    fi
}

# Main health check function
main() {
    echo "🏥 Production Health Check"
    echo "=========================="
    echo ""
    echo "Backend URL: $BACKEND_URL"
    echo "Frontend URL: $FRONTEND_URL"
    echo "Timeout: ${TIMEOUT}s"
    echo ""
    echo "Starting checks..."
    echo ""
    
    # Backend Health Checks
    echo "🔧 Backend Service Checks"
    echo "-----------------------"
    
    check_health_endpoint "$BACKEND_URL/api/health" "Backend"
    check_http_endpoint "$BACKEND_URL/api/v1/auth/login" "405" "Backend auth endpoint" || warn "Auth endpoint should return 405 for GET (expected)"
    
    # Frontend Health Checks
    echo ""
    echo "🎨 Frontend Service Checks"
    echo "------------------------"
    
    check_health_endpoint "$FRONTEND_URL/health" "Frontend"
    check_http_endpoint "$FRONTEND_URL" "200" "Frontend homepage"
    
    # API Integration Checks
    echo ""
    echo "🔗 API Integration Checks"
    echo "----------------------"
    
    # Check if frontend can reach backend (via CORS preflight)
    info "Checking CORS configuration..."
    cors_response=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: GET" \
        --max-time $TIMEOUT \
        "$BACKEND_URL/api/v1/auth/login" || echo "000")
    
    if [ "$cors_response" = "204" ] || [ "$cors_response" = "200" ]; then
        pass "CORS preflight check"
    else
        fail "CORS preflight check (HTTP $cors_response)"
    fi
    
    # Summary
    echo ""
    echo "=========================="
    echo "📊 Health Check Summary"
    echo "=========================="
    echo ""
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
    echo -e "${RED}❌ Failed: $FAILED${NC}"
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All critical checks passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some checks failed. Please review the output above.${NC}"
        exit 1
    fi
}

# Run health check
main
