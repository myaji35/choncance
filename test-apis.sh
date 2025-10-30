#!/bin/bash

# ChonCance API 테스트 스크립트

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0
TOTAL=0

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "  ChonCance API 테스트"
echo "======================================"
echo ""

# 테스트 함수
test_api() {
    local name=$1
    local endpoint=$2
    local expected_code=${3:-200}

    TOTAL=$((TOTAL + 1))
    echo -n "[$TOTAL] Testing $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")

    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_code, Got: $response)"
        FAIL=$((FAIL + 1))
    fi
}

# 테스트 실행
echo "=== Public API Tests ==="
test_api "Tags API - All tags" "/api/tags" 200
test_api "Tags API - VIEW category" "/api/tags?category=VIEW" 200
test_api "Tags API - ACTIVITY category" "/api/tags?category=ACTIVITY" 200
test_api "Tags API - FACILITY category" "/api/tags?category=FACILITY" 200
test_api "Tags API - VIBE category" "/api/tags?category=VIBE" 200
echo ""

echo "=== Properties API Tests ==="
test_api "Properties API - All properties" "/api/properties" 200
test_api "Properties API - Limited results" "/api/properties?limit=5" 200
test_api "Properties API - With search (Korean)" "/api/properties?search=%EC%A0%9C%EC%A3%BC" 200
test_api "Properties API - Price filter" "/api/properties?minPrice=50000&maxPrice=150000" 200
test_api "Properties API - Sort by price" "/api/properties?sort=price_asc" 200
echo ""

echo "=== Filters API Tests ==="
test_api "Locations filter" "/api/filters/locations" 200
test_api "Price range filter" "/api/filters/price-range" 200
echo ""

echo "=== Auth-Required API Tests (Expected 404 - Security Strategy) ==="
test_api "Bookings API (no auth)" "/api/bookings" 404
test_api "Wishlist API (no auth)" "/api/wishlist" 404
test_api "Notifications API (no auth)" "/api/notifications" 404
echo ""

echo "=== Host API Tests (Expected 404 - Security Strategy) ==="
test_api "Host Properties API (no auth)" "/api/host/properties" 404
test_api "Host Bookings API (no auth)" "/api/host/bookings" 404
test_api "Host Stats API (no auth)" "/api/host/stats" 404
echo ""

echo "======================================"
echo "  테스트 결과 요약"
echo "======================================"
echo -e "Total: $TOTAL"
echo -e "${GREEN}Pass:  $PASS${NC}"
echo -e "${RED}Fail:  $FAIL${NC}"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed${NC}"
    exit 1
fi
