#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Add version management scripts if they don't exist
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

packageJson.scripts['version:check'] = 'node scripts/version-manager.js';
packageJson.scripts['version:bump'] = 'node scripts/version-manager.js';

// Write back to package.json
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✅ Package.json updated with version management scripts');
console.log('Added scripts:');
console.log('  - npm run version:check');
console.log('  - npm run version:bump');