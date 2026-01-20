# Quick Publish Guide

## 🚀 Fast Track to Publishing

### Before You Start

**1. Update package.json with your info:**
```bash
# Edit these fields:
# - "author": "Your Name <email@example.com>"
# - "repository.url": "https://github.com/yourusername/safe-storage.git"
# - "bugs.url": "https://github.com/yourusername/safe-storage/issues"
# - "homepage": "https://github.com/yourusername/safe-storage#readme"
```

### Publishing Steps

**1. Login to NPM:**
```bash
npm login
# Enter: username, password, email, 2FA code
```

**2. Run Pre-Publish Checklist:**
```bash
./pre-publish-checklist.sh
```

**3. Build & Test:**
```bash
npm run build
npm test
npm run typecheck
```

**4. Dry Run (Check what will be published):**
```bash
npm pack --dry-run
```

**5. Publish! 🎉**
```bash
npm publish
```

### If Name is Taken

Use a scoped package:
```bash
# Update package.json name to:
"name": "@yourusername/safe-storage"

# Then publish:
npm publish --access public
```

---

## After Publishing

### 1. Verify
```bash
npm view safe-storage
```

### 2. Install & Test
```bash
cd /tmp
mkdir test-package
cd test-package
npm init -y
npm install safe-storage
node -e "console.log(require('safe-storage'))"
```

### 3. Add Badges to README

```markdown
[![npm version](https://img.shields.io/npm/v/safe-storage.svg)](https://www.npmjs.com/package/safe-storage)
[![npm downloads](https://img.shields.io/npm/dm/safe-storage.svg)](https://www.npmjs.com/package/safe-storage)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/safe-storage)](https://bundlephobia.com/package/safe-storage)
```

### 4. Tag on Git
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## Common Commands

```bash
# Check if logged in
npm whoami

# Logout
npm logout

# Update version (before republishing)
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# Publish update
npm publish

# View package info
npm view safe-storage
npm info safe-storage

# Unpublish (within 72 hours only)
npm unpublish safe-storage@1.0.0 --force

# Deprecate version
npm deprecate safe-storage@1.0.0 "Please use 1.0.1"
```

---

## Troubleshooting

**"Package name already taken"**
→ Use `@username/safe-storage`

**"You must verify your email"**
→ Check email and verify NPM account

**"You do not have permission"**
→ Run `npm login` again

**"Package already exists"**
→ Update version: `npm version patch`

---

## Next Steps

1. ✅ Publish to NPM
2. Share on Twitter/Reddit/Dev.to
3. Submit to Product Hunt
4. Monitor: https://www.npmjs.com/package/safe-storage
5. Respond to issues and PRs

**Need help?** See full guide: `PUBLISHING_GUIDE.md`
