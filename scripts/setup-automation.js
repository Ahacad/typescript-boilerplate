#!/usr/bin/env node

/**
 * Setup script to initialize automation features in an existing project
 * Run this script in the target project to set up version control, commit linting, etc.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Source paths
const SOURCE_DIR = path.join(__dirname, '..');
const HUSKY_DIR = path.join(SOURCE_DIR, '.husky');
const GITHUB_DIR = path.join(SOURCE_DIR, '.github');
const SCRIPTS_DIR = path.join(SOURCE_DIR, 'scripts');

// Define explicit mapping between features and files
const FEATURE_FILES_MAPPING = {
  prettier: [{ src: '.prettierrc', dest: '.prettierrc' }],
  husky: [
    { src: 'commitlint.config.js', dest: 'commitlint.config.js' },
    { src: '.husky/pre-commit', dest: '.husky/pre-commit' },
  ],
  versioning: [
    { src: '.versionrc.json', dest: '.versionrc.json' },
    { src: 'scripts/extract-latest-release.js', dest: 'scripts/extract-latest-release.js' },
    { src: 'scripts/release.js', dest: 'scripts/release.js' },
  ],
  githubActions: [
    { src: '.github/workflows/ci.yml', dest: '.github/workflows/ci.yml' },
    { src: '.github/workflows/release.yml', dest: '.github/workflows/release.yml' },
  ],
};

// Ask questions
async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setup() {
  console.log('Setting up TypeScript project automation...');

  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error('Error: package.json not found. Please run this script in a Node.js project.');
    process.exit(1);
  }

  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // Ask which features to install
  const setupPrettier = await askQuestion('Setup Prettier code formatting? (Y/n): ');
  const setupHusky = await askQuestion('Setup Husky pre-commit hooks? (Y/n): ');
  const setupVersioning = await askQuestion('Setup conventional version bumping? (Y/n): ');
  const setupGithubActions = await askQuestion('Setup GitHub Actions workflows? (Y/n): ');

  // Define features and their setup status
  const features = [
    { name: 'prettier', setup: setupPrettier.toLowerCase() !== 'n' },
    { name: 'husky', setup: setupHusky.toLowerCase() !== 'n' },
    { name: 'versioning', setup: setupVersioning.toLowerCase() !== 'n' },
    { name: 'githubActions', setup: setupGithubActions.toLowerCase() !== 'n' },
  ];

  // Create directories if they don't exist
  if (!fs.existsSync('scripts')) {
    fs.mkdirSync('scripts', { recursive: true });
  }

  // Copy files based on selected features
  for (const feature of features) {
    if (feature.setup) {
      const filesToCopy = FEATURE_FILES_MAPPING[feature.name];
      for (const file of filesToCopy) {
        const srcPath = path.join(SOURCE_DIR, file.src);
        const destPath = path.join(process.cwd(), file.dest);

        // Create directory if it doesn't exist
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // Copy file
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file.src} to ${file.dest}`);
      }
    }
  }

  // Setup Prettier
  if (setupPrettier.toLowerCase() !== 'n') {
    // Add prettier to devDependencies if not already present
    if (!packageJson.devDependencies?.prettier) {
      console.log('Installing prettier...');
      execSync('npm install --save-dev prettier', { stdio: 'inherit' });
    }

    // Add format script if not present
    if (!packageJson.scripts?.format) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.format = 'prettier --write .';
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      console.log('Added format script to package.json');
    }
  }

  // Setup Husky
  if (setupHusky.toLowerCase() !== 'n') {
    // Add husky to devDependencies if not already present
    if (!packageJson.devDependencies?.husky) {
      console.log('Installing husky and commitlint...');
      execSync('npm install --save-dev husky @commitlint/cli @commitlint/config-conventional', {
        stdio: 'inherit',
      });
    }

    // Add prepare script if not present
    if (!packageJson.scripts?.prepare) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.prepare = 'husky';
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      console.log('Added prepare script to package.json');
    }

    // Set up husky
    console.log('Setting up husky...');
    execSync('npx husky init', { stdio: 'inherit' });
  }

  // Setup versioning
  if (setupVersioning.toLowerCase() !== 'n') {
    // Make release.js executable
    const destReleasePath = path.join(process.cwd(), 'scripts', 'release.js');
    fs.chmodSync(destReleasePath, '755'); // Make executable

    // Add standard-version to devDependencies if not already present
    if (!packageJson.devDependencies?.['standard-version']) {
      console.log('Installing standard-version...');
      execSync('npm install --save-dev standard-version', { stdio: 'inherit' });
    }

    // Add release scripts if not present
    packageJson.scripts = packageJson.scripts || {};
    if (!packageJson.scripts.release) {
      packageJson.scripts.release = 'node scripts/release.js';
    }

    if (!packageJson.scripts['release:patch']) {
      packageJson.scripts['release:patch'] = 'standard-version --release-as patch';
    }

    if (!packageJson.scripts['release:minor']) {
      packageJson.scripts['release:minor'] = 'standard-version --release-as minor';
    }

    if (!packageJson.scripts['release:major']) {
      packageJson.scripts['release:major'] = 'standard-version --release-as major';
    }

    // Add publish:github script if not present
    if (!packageJson.scripts['publish:github']) {
      packageJson.scripts['publish:github'] =
        'node scripts/extract-latest-release.js && gh release create v$(node -p \"require(\\\'./package.json\\\').version\") -F LATEST_RELEASE.md';
    }

    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('Added release scripts to package.json');
  }

  console.log('\nSetup complete! The following features were installed:');
  if (setupPrettier.toLowerCase() !== 'n') {
    console.log('- Prettier for code formatting');
  }
  if (setupHusky.toLowerCase() !== 'n') {
    console.log('- Husky pre-commit hooks for commit message linting');
  }
  if (setupVersioning.toLowerCase() !== 'n') {
    console.log('- Conventional version bumping with standard-version');
  }
  if (setupGithubActions.toLowerCase() !== 'n') {
    console.log('- GitHub Actions workflows for automated CI and releases');
  }

  rl.close();
}

setup().catch((error) => {
  console.error('Error during setup:', error);
  process.exit(1);
});
