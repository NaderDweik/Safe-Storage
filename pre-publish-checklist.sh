#!/bin/bash

# Pre-Publish Checklist Script
# Run this before publishing to NPM

echo "🔍 Pre-Publish Checklist for SafeStorage"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: NPM login
echo "1️⃣  Checking NPM authentication..."
if npm whoami &> /dev/null; then
    echo -e "${GREEN}✓${NC} Logged in as: $(npm whoami)"
else
    echo -e "${RED}✗${NC} Not logged in to NPM. Run: npm login"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 2: Package.json fields
echo "2️⃣  Checking package.json fields..."
REQUIRED_FIELDS=("name" "version" "description" "author" "license" "repository")
for field in "${REQUIRED_FIELDS[@]}"; do
    value=$(node -pe "require('./package.json').$field" 2>/dev/null)
    if [ -z "$value" ] || [ "$value" == "undefined" ] || [ "$value" == "" ]; then
        echo -e "${RED}✗${NC} Missing or empty: $field"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓${NC} $field: $value"
    fi
done
echo ""

# Check 3: Build
echo "3️⃣  Checking build..."
if [ -d "dist" ]; then
    echo -e "${GREEN}✓${NC} dist/ folder exists"
    echo "   Files:"
    ls -lh dist/ | grep -E "\.(mjs|js|d\.ts)$" | awk '{print "   - " $9 " (" $5 ")"}'
else
    echo -e "${RED}✗${NC} dist/ folder not found. Run: npm run build"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 4: Tests
echo "4️⃣  Running tests..."
if npm test &> /dev/null; then
    echo -e "${GREEN}✓${NC} All tests pass"
else
    echo -e "${YELLOW}⚠${NC}  Some tests failed (check with: npm test)"
fi
echo ""

# Check 5: TypeScript check
echo "5️⃣  Running type check..."
if npm run typecheck &> /dev/null; then
    echo -e "${GREEN}✓${NC} No type errors"
else
    echo -e "${RED}✗${NC} Type errors found. Run: npm run typecheck"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 6: README.md
echo "6️⃣  Checking README.md..."
if [ -f "README.md" ]; then
    echo -e "${GREEN}✓${NC} README.md exists"
else
    echo -e "${RED}✗${NC} README.md not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 7: CHANGELOG.md
echo "7️⃣  Checking CHANGELOG.md..."
if [ -f "CHANGELOG.md" ]; then
    echo -e "${GREEN}✓${NC} CHANGELOG.md exists"
else
    echo -e "${YELLOW}⚠${NC}  CHANGELOG.md not found (recommended)"
fi
echo ""

# Check 8: Package size
echo "8️⃣  Checking package size..."
PACKAGE_SIZE=$(npm pack --dry-run 2>&1 | grep "Unpacked size:" | awk '{print $3}')
if [ -n "$PACKAGE_SIZE" ]; then
    echo -e "${GREEN}✓${NC} Package size: $PACKAGE_SIZE"
    echo ""
    echo "   Files to be published:"
    npm pack --dry-run 2>&1 | grep -A 100 "Tarball Contents" | grep -v "Tarball Contents" | grep -v "====" | head -20
else
    echo -e "${YELLOW}⚠${NC}  Could not determine package size"
fi
echo ""

# Final summary
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to publish.${NC}"
    echo ""
    echo "To publish, run:"
    echo "  npm publish"
    echo ""
    echo "To do a dry run first:"
    echo "  npm pack --dry-run"
else
    echo -e "${RED}❌ $ERRORS error(s) found. Please fix before publishing.${NC}"
    exit 1
fi
