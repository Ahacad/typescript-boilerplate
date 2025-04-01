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

// Files to copy
const FILES_TO_COPY = [
  { src: '.versionrc.json', dest: '.versionrc.json' },
  { src: 'commitlint.config.js', dest: 'commitlint.config.js' },
  { src: 'scripts/extract-latest-release.js', dest: 'scripts/extract-latest-release.js' },
  { src: '.prettierrc', dest: '.prettierrc' },
];

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
  const setupHusky = await askQuestion('Setup Husky pre-commit hooks? (Y/n): ');
  const setupVersioning = await askQuestion('Setup conventional version bumping? (Y/n): ');
  const setupGithubActions = await askQuestion('Setup GitHub Actions workflows? (Y/n): ');

  // Create directories if they don't exist
  if (!fs.existsSync('scripts')) {
    fs.mkdirSync('scripts', { recursive: true });
  }

  // Copy files
  for (const file of FILES_TO_COPY) {
    if (
      (file.src.includes('version') && setupVersioning.toLowerCase() !== 'n') ||
      (file.src.includes('commit') && setupHusky.toLowerCase() !== 'n') ||
      (file.src.includes('extract-latest-release') && setupVersioning.toLowerCase() !== 'n') ||
      (file.src.includes('prettier') && setupHusky.toLowerCase() !== 'n')
    ) {
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

  // Setup Husky
  if (setupHusky.toLowerCase() !== 'n') {
    // Add husky to devDependencies if not already present
    if (!packageJson.devDependencies?.husky) {
      console.log('Installing husky...');
      execSync(
        'npm install --save-dev husky @commitlint/cli @commitlint/config-conventional prettier',
        { stdio: 'inherit' }
      );
    }

    // Add prepare script if not present
    if (!packageJson.scripts?.prepare) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.prepare = 'husky';
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      console.log('Added prepare script to package.json');
    }

    // Add format script if not present
    if (!packageJson.scripts?.format) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.format = 'prettier --write .';
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      console.log('Added format script to package.json');
    }

    // Set up husky
    console.log('Setting up husky...');
    execSync('npx husky init', { stdio: 'inherit' });

    // Copy pre-commit hook
    fs.copyFileSync(
      path.join(HUSKY_DIR, 'pre-commit'),
      path.join(process.cwd(), '.husky', 'pre-commit')
    );
    console.log('Copied pre-commit hook');
  }

  // Setup versioning
  if (setupVersioning.toLowerCase() !== 'n') {
    // Add standard-version to devDependencies if not already present
    if (!packageJson.devDependencies?.['standard-version']) {
      console.log('Installing standard-version...');
      execSync('npm install --save-dev standard-version', { stdio: 'inherit' });
    }

    // Add release script if not present
    packageJson.scripts = packageJson.scripts || {};
    if (!packageJson.scripts.release) {
      packageJson.scripts.release = 'standard-version';
    }

    // Add publish:github script if not present
    if (!packageJson.scripts['publish:github']) {
      packageJson.scripts['publish:github'] =
        'node scripts/extract-latest-release.js && gh release create v$(node -p \"require(\\\'./package.json\\\').version\") -F LATEST_RELEASE.md';
    }

    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('Added release scripts to package.json');
  }

  // Setup GitHub Actions
  if (setupGithubActions.toLowerCase() !== 'n') {
    // Create .github/workflows directory if it doesn't exist
    const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    // Copy GitHub workflows
    fs.copyFileSync(
      path.join(GITHUB_DIR, 'workflows', 'release.yml'),
      path.join(workflowsDir, 'release.yml')
    );

    fs.copyFileSync(
      path.join(GITHUB_DIR, 'workflows', 'ci.yml'),
      path.join(workflowsDir, 'ci.yml')
    );

    console.log('Copied GitHub Actions workflows');
  }

  console.log('\nSetup complete! The following features were installed:');
  if (setupHusky.toLowerCase() !== 'n') {
    console.log('- Husky pre-commit hooks for code formatting and commit message linting');
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
