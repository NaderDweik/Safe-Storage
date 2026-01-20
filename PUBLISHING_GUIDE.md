# Publishing SafeStorage to NPM

## Pre-Publishing Checklist

### 1. Create NPM Account
If you don't have one: https://www.npmjs.com/signup

### 2. Check Package Name Availability
```bash
npm search safe-storage
```

If `safe-storage` is taken, try alternatives:
- `@your-username/safe-storage`
- `typed-safe-storage`
- `schema-storage`
- `safe-store`
- `validated-storage`

---

## Step-by-Step Publishing Process

### Step 1: Update package.json

Make sure these fields are filled:

```json
{
  "name": "safe-storage",
  "version": "1.0.0",
  "description": "A high-performance, framework-agnostic type-safe wrapper for browser storage with schema validation",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/safe-storage.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/safe-storage/issues"
  },
  "homepage": "https://github.com/yourusername/safe-storage#readme",
  "keywords": [
    "storage",
    "localstorage",
    "sessionstorage",
    "indexeddb",
    "type-safe",
    "schema",
    "validation",
    "zod",
    "valibot",
    "react",
    "vue",
    "typescript"
  ]
}
```

### Step 2: Login to NPM

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

Verify you're logged in:
```bash
npm whoami
```

### Step 3: Build the Package

```bash
npm run build
```

Verify the build:
```bash
ls -lh dist/
```

### Step 4: Test Locally (IMPORTANT!)

Test your package locally before publishing:

```bash
# Create a test directory
cd ..
mkdir test-safe-storage
cd test-safe-storage
npm init -y

# Install your local package
npm install ../Shark-Atom

# Create a test file
cat > test.js << 'EOF'
const { createStore } = require('safe-storage');
console.log('✅ Package imported successfully!');
EOF

# Run the test
node test.js
```

### Step 5: Dry Run (Check What Will Be Published)

```bash
cd ../Shark-Atom
npm pack --dry-run
```

This shows:
- What files will be included
- Final package size
- Any warnings

### Step 6: Create .npmignore (if needed)

Already have this, but verify it includes:

```
# .npmignore
src/
tests/
*.test.ts
*.spec.ts
vitest.config.ts
vitest.setup.ts
vitest.preamble.ts
tsconfig.json
tsup.config.ts
.github/
examples/
*.md
!README.md
.git/
.gitignore
node_modules/
coverage/
```

### Step 7: Publish to NPM! 🚀

```bash
npm publish
```

If name is taken, publish with scope:
```bash
npm publish --access public
```

For scoped packages (@username/package):
```bash
# Update package.json name to "@username/safe-storage"
npm publish --access public
```

---

## Post-Publishing Steps

### 1. Verify Publication
```bash
# Check on NPM
npm view safe-storage

# Install and test
npm install safe-storage
```

### 2. Add NPM Badges to README

```markdown
[![npm version](https://img.shields.io/npm/v/safe-storage.svg)](https://www.npmjs.com/package/safe-storage)
[![npm downloads](https://img.shields.io/npm/dm/safe-storage.svg)](https://www.npmjs.com/package/safe-storage)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/safe-storage)](https://bundlephobia.com/package/safe-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### 3. Tag the Release on GitHub

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 4. Create GitHub Release
Go to: `https://github.com/yourusername/safe-storage/releases/new`

---

## Publishing Updates

### Patch Release (Bug fixes: 1.0.0 → 1.0.1)
```bash
npm version patch
npm publish
git push --tags
```

### Minor Release (New features: 1.0.0 → 1.1.0)
```bash
npm version minor
npm publish
git push --tags
```

### Major Release (Breaking changes: 1.0.0 → 2.0.0)
```bash
npm version major
npm publish
git push --tags
```

---

## Common Issues & Solutions

### Issue 1: Package Name Already Taken
**Solution:** Use a scoped package
```bash
# Update package.json
{
  "name": "@yourusername/safe-storage"
}

# Publish
npm publish --access public
```

### Issue 2: "You must verify your email"
**Solution:** Check your email and verify your NPM account

### Issue 3: "You do not have permission to publish"
**Solution:** Make sure you're logged in:
```bash
npm logout
npm login
```

### Issue 4: "Package already published"
**Solution:** Update version number:
```bash
npm version patch
npm publish
```

---

## Best Practices

### 1. Semantic Versioning
- **Patch (1.0.x)**: Bug fixes
- **Minor (1.x.0)**: New features (backward compatible)
- **Major (x.0.0)**: Breaking changes

### 2. Changelog
Keep `CHANGELOG.md` updated:

```markdown
# Changelog

## [1.0.0] - 2024-01-20
### Added
- Initial release
- Core storage functionality
- React/Vue/Svelte adapters
- TypeScript support
```

### 3. Test Before Publishing
```bash
# Always run tests
npm test

# Check types
npm run typecheck

# Lint code
npm run lint

# Build
npm run build

# Dry run
npm pack --dry-run
```

### 4. Use prepublishOnly Script
Already in your package.json:
```json
{
  "scripts": {
    "prepublishOnly": "npm run build"
  }
}
```

This ensures you always publish the latest build.

---

## Quick Command Reference

```bash
# First time publishing
npm login
npm run build
npm publish

# Update and republish
npm version patch  # or minor, major
npm publish
git push --tags

# Check package
npm view safe-storage
npm info safe-storage

# Unpublish (within 72 hours only!)
npm unpublish safe-storage@1.0.0

# Deprecate a version
npm deprecate safe-storage@1.0.0 "Use version 1.0.1 instead"
```

---

## Marketing After Publishing

### 1. Submit to Registries
- ✅ NPM (automatic)
- Submit to: https://www.jsdelivr.com/
- Submit to: https://unpkg.com/

### 2. Share on Social Media
```markdown
🚀 Just published SafeStorage v1.0.0!

A type-safe storage wrapper with:
✅ Schema validation (Zod/Valibot)
✅ React/Vue/Svelte support
✅ TTL, migrations, cross-tab sync
✅ Only 4.4kb gzipped!

npm install safe-storage

https://www.npmjs.com/package/safe-storage
```

### 3. Post on Reddit
- r/javascript
- r/typescript
- r/reactjs
- r/vuejs

### 4. Submit to Product Hunt
- https://www.producthunt.com/

### 5. Share on Dev.to
Write an article about your package!

---

## Monitoring

### 1. NPM Stats
- Dashboard: https://www.npmjs.com/package/safe-storage
- Downloads: https://npm-stat.com/charts.html?package=safe-storage

### 2. Bundle Size Monitoring
- https://bundlephobia.com/package/safe-storage
- https://packagephobia.com/result?p=safe-storage

### 3. Set up GitHub Actions
Create `.github/workflows/publish.yml` for automated publishing

---

## Next Steps After Publishing

1. ✅ Publish to NPM
2. ✅ Add badges to README
3. ✅ Create GitHub release
4. ✅ Share on social media
5. ✅ Submit to showcases
6. Monitor downloads and issues
7. Respond to user feedback
8. Plan v1.1.0 features

Good luck with your launch! 🚀
