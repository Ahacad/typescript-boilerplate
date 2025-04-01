#!/usr/bin/env node

/**
 * Interactive release script
 * Prompts the user to select a release type (patch, minor, major)
 * Then runs standard-version with the selected release type
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('🏷️  TypeScript Boilerplate Release Script');
console.log('----------------------------------------');
console.log('This script will create a new release using standard-version.');
console.log('The release type determines which part of the version number will be incremented:');
console.log('- 0 or p: patch: 1.0.0 → 1.0.1 (for bug fixes)');
console.log('- 1 or m: minor: 1.0.0 → 1.1.0 (for new features)');
console.log('- 2 or M: major: 1.0.0 → 2.0.0 (for breaking changes)');
console.log('----------------------------------------');

rl.question('Select release type [0/1/2 or p/m/M] (default: 0=patch): ', (answer) => {
  let releaseType;

  // Convert input to release type
  switch (answer.trim().toLowerCase()) {
    case '0':
    case 'p':
    case 'patch':
      releaseType = 'patch';
      break;
    case '1':
    case 'm':
    case 'minor':
      releaseType = 'minor';
      break;
    case '2':
    case 'major':
      releaseType = 'major';
      break;
    default:
      releaseType = 'patch'; // Default to patch
  }

  console.log(`\nCreating ${releaseType} release...`);

  try {
    // Run standard-version with the selected release type
    execSync(`npx standard-version --release-as ${releaseType}`, { stdio: 'inherit' });

    console.log('\n✅ Release created successfully!');
    console.log('\nNext steps:');
    console.log('1. Push the changes: git push --follow-tags origin main');
    console.log('2. Create a GitHub release: npm run publish:github');
  } catch (error) {
    console.error('\n❌ Error creating release:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
});
