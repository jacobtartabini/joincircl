# Circl Versioning System

This document explains how to use the semantic versioning system implemented for Circl.

## Overview

Circl uses [Semantic Versioning](https://semver.org/) in the format `MAJOR.MINOR.PATCH`:

- **MAJOR**: Incompatible API changes or breaking changes
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes that are backward compatible

## Automatic Version Bumping

The system automatically bumps versions based on your Git commit messages:

### Commit Message Conventions

- `feat: <description>` → **MINOR** version bump
- `fix: <description>` → **PATCH** version bump  
- `BREAKING: <description>` → **MAJOR** version bump
- `BREAKING CHANGE: <description>` → **MAJOR** version bump

### Examples

```bash
# This will trigger a MINOR bump (1.0.0 → 1.1.0)
git commit -m "feat: add AI chat functionality"

# This will trigger a PATCH bump (1.1.0 → 1.1.1)
git commit -m "fix: resolve contact import bug"

# This will trigger a MAJOR bump (1.1.1 → 2.0.0)
git commit -m "BREAKING: remove deprecated API endpoints"
```

## Files and Scripts

### Core Files

- `VERSION.json` - Stores current version, build number, and metadata
- `CHANGELOG.md` - Automatically updated release notes
- `scripts/version-manager.js` - Main versioning logic
- `.github/workflows/version-bump.yml` - GitHub Actions workflow

### Available Scripts

```bash
# Check if version should be bumped (based on commits)
npm run version:check

# Manually bump version (same as check, but clearer intent)
npm run version:bump

# Update package.json with version scripts
node scripts/update-package-json.js
```

## Setup Instructions

### 1. Initial Setup

```bash
# Make the version manager executable
chmod +x scripts/version-manager.js

# Add version scripts to package.json
node scripts/update-package-json.js
```

### 2. GitHub Actions (Automatic)

The system includes a GitHub Actions workflow that:

1. Runs on every push to main/master
2. Checks commits since last version
3. Bumps version if needed
4. Updates CHANGELOG.md
5. Creates a Git tag
6. Creates a GitHub release

### 3. Manual Usage

```bash
# Check current version
cat VERSION.json

# Manually run version check
npm run version:check

# View changelog
cat CHANGELOG.md
```

## Version Display in App

The current version is displayed in:

- **Settings > Account tab** - Shows version, build number, and last updated date
- **Accessible via code** - Import from `@/services/versionService`

### Using Version in Code

```typescript
import { getVersionInfo, getBuildInfo, getVersionString } from '@/services/versionService';

// Get full version info
const versionInfo = getVersionInfo();
console.log(versionInfo.version); // "1.2.3"
console.log(versionInfo.buildNumber); // 42

// Get formatted strings
const buildInfo = getBuildInfo(); // "v1.2.3 (Build 42)"
const version = getVersionString(); // "1.2.3"
```

## Changelog Format

The system automatically generates changelog entries with:

- **Breaking Changes** (⚠️ BREAKING CHANGES)
- **Features** (✨ Features)  
- **Bug Fixes** (🐛 Bug Fixes)
- **Other Changes** (🔧 Other Changes)

## Best Practices

1. **Use conventional commit messages** for automatic version bumping
2. **Group related changes** in single commits when possible
3. **Test changes** before pushing to main/master
4. **Review CHANGELOG.md** after version bumps to ensure accuracy
5. **Use descriptive commit messages** as they appear in the changelog

## Troubleshooting

### Version not bumping?

- Check that commit messages follow the convention
- Ensure the GitHub Actions workflow has proper permissions
- Verify `VERSION.json` is not manually edited

### Changelog not updating?

- The changelog updates automatically with version bumps
- Manual edits to `CHANGELOG.md` are preserved
- Entries are added chronologically

### Build number not incrementing?

- Build numbers increment with every version bump
- They persist across different version types
- Useful for debugging and deployment tracking

## Future Enhancements

Potential improvements to consider:

1. **Pre-release versions** (alpha, beta, rc)
2. **Branch-specific versioning** for feature branches
3. **Automated testing** before version bumps
4. **Integration with CI/CD** pipelines
5. **Version rollback** capabilities