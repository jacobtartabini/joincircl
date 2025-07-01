#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read current version
const versionPath = path.join(__dirname, '..', 'VERSION.json');
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');

function readVersionFile() {
  try {
    const content = fs.readFileSync(versionPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading VERSION.json:', error);
    return { version: '1.0.0', lastUpdated: new Date().toISOString(), commitHash: '', buildNumber: 1 };
  }
}

function writeVersionFile(versionData) {
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
}

function getLatestCommits(count = 10) {
  try {
    const commits = execSync(`git log -${count} --pretty=format:"%H|%s|%ad" --date=iso`, { encoding: 'utf8' });
    return commits.split('\n').map(line => {
      const [hash, message, date] = line.split('|');
      return { hash, message, date };
    });
  } catch (error) {
    console.error('Error getting git commits:', error);
    return [];
  }
}

function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

function incrementVersion(version, type) {
  const { major, minor, patch } = parseVersion(version);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return version;
  }
}

function determineVersionBump(commits, lastCommitHash) {
  let bumpType = null;
  const relevantCommits = [];
  
  for (const commit of commits) {
    if (commit.hash === lastCommitHash) break;
    
    relevantCommits.push(commit);
    
    if (commit.message.startsWith('BREAKING:') || commit.message.includes('BREAKING CHANGE:')) {
      bumpType = 'major';
    } else if (commit.message.startsWith('feat:') && bumpType !== 'major') {
      bumpType = 'minor';
    } else if (commit.message.startsWith('fix:') && !bumpType) {
      bumpType = 'patch';
    }
  }
  
  return { bumpType, relevantCommits };
}

function updateChangelog(newVersion, commits) {
  const today = new Date().toISOString().split('T')[0];
  const changelogEntry = `\n## [${newVersion}] - ${today}\n\n`;
  
  const breaking = commits.filter(c => c.message.startsWith('BREAKING:') || c.message.includes('BREAKING CHANGE:'));
  const features = commits.filter(c => c.message.startsWith('feat:'));
  const fixes = commits.filter(c => c.message.startsWith('fix:'));
  const others = commits.filter(c => !c.message.startsWith('feat:') && !c.message.startsWith('fix:') && !c.message.startsWith('BREAKING:') && !c.message.includes('BREAKING CHANGE:'));
  
  let entry = changelogEntry;
  
  if (breaking.length > 0) {
    entry += '### ⚠️ BREAKING CHANGES\n\n';
    breaking.forEach(commit => {
      entry += `- ${commit.message.replace(/^BREAKING:\s*/, '')}\n`;
    });
    entry += '\n';
  }
  
  if (features.length > 0) {
    entry += '### ✨ Features\n\n';
    features.forEach(commit => {
      entry += `- ${commit.message.replace(/^feat:\s*/, '')}\n`;
    });
    entry += '\n';
  }
  
  if (fixes.length > 0) {
    entry += '### 🐛 Bug Fixes\n\n';
    fixes.forEach(commit => {
      entry += `- ${commit.message.replace(/^fix:\s*/, '')}\n`;
    });
    entry += '\n';
  }
  
  if (others.length > 0) {
    entry += '### 🔧 Other Changes\n\n';
    others.forEach(commit => {
      entry += `- ${commit.message}\n`;
    });
    entry += '\n';
  }
  
  // Read existing changelog or create new one
  let existingChangelog = '';
  try {
    existingChangelog = fs.readFileSync(changelogPath, 'utf8');
  } catch (error) {
    existingChangelog = '# Changelog\n\nAll notable changes to Circl will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n';
  }
  
  // Insert new entry after the header
  const lines = existingChangelog.split('\n');
  const headerEndIndex = lines.findIndex(line => line.includes('## [')) || lines.length;
  
  lines.splice(headerEndIndex, 0, entry);
  fs.writeFileSync(changelogPath, lines.join('\n'));
}

function main() {
  const currentVersion = readVersionFile();
  const commits = getLatestCommits();
  
  if (commits.length === 0) {
    console.log('No commits found');
    return;
  }
  
  const { bumpType, relevantCommits } = determineVersionBump(commits, currentVersion.commitHash);
  
  if (!bumpType || relevantCommits.length === 0) {
    console.log(`No version bump needed. Current version: ${currentVersion.version}`);
    return;
  }
  
  const newVersion = incrementVersion(currentVersion.version, bumpType);
  const latestCommit = commits[0];
  
  const updatedVersionData = {
    ...currentVersion,
    version: newVersion,
    lastUpdated: new Date().toISOString(),
    commitHash: latestCommit.hash,
    buildNumber: currentVersion.buildNumber + 1
  };
  
  writeVersionFile(updatedVersionData);
  updateChangelog(newVersion, relevantCommits);
  
  console.log(`🎉 Version updated: ${currentVersion.version} → ${newVersion} (${bumpType} bump)`);
  console.log(`📝 ${relevantCommits.length} commits processed`);
  console.log(`🏗️  Build: ${updatedVersionData.buildNumber}`);
}

if (require.main === module) {
  main();
}

module.exports = { main, determineVersionBump, incrementVersion, parseVersion };