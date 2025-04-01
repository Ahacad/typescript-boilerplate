# TypeScript Boilerplate

A modern TypeScript project template with built-in automation for code quality, testing, versioning, and deployment.

## Features

- 🔷 **TypeScript**: Configured with strict type checking and modern ES features
- 🧪 **Testing**: Jest configured for TypeScript
- 🔍 **Linting**: ESLint with TypeScript-specific rules
- 💅 **Formatting**: Prettier for consistent code style
- 🧹 **Pre-commit Hooks**: Husky for automatically formatting and linting code before commits
- 📝 **Commit Standards**: Commitlint to enforce conventional commit messages
- 🏷️ **Versioning**: Automated semantic versioning based on commit messages
- 🚀 **CI/CD**: GitHub Actions workflows for testing, building, and releasing
- 📚 **Documentation**: Automatically generated changelogs

## Usage

This template can be used in two ways:

### Option 1: Start a New Project (Clone Template)

1. Clone this repository:

   ```bash
   git clone https://github.com/ahacad/typescript-boilerplate.git my-project
   cd my-project
   ```

2. Reset git history:

   ```bash
   rm -rf .git
   git init
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Update package.json with your project info:

   ```bash
   # Edit package.json and update name, description, version, etc.
   ```

5. Start coding!

### Option 2: Add Automation to an Existing Project

If you already have a TypeScript project and want to add the automation features:

1. Run the setup script:

   ```bash
   npx github:ahacad/typescript-boilerplate/scripts/setup-automation.js
   ```

2. Follow the prompts to select which features to install.

## Development Workflow

### Daily Development

1. Write code in `src/` directory
2. Run tests: `npm test`
3. Build the project: `npm run build`
4. Commit changes (pre-commit hooks will format and lint your code)

### Making Commits

This project enforces the [Conventional Commits](https://www.conventionalcommits.org/) standard. Commit messages should follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Common types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or fixing tests
- `build`: Changes to the build system
- `ci`: Changes to CI configuration
- `chore`: Other changes that don't modify src or test files

### Releasing

To create a new release:

1. Run: `npm run release`

   - This will prompt you to select a release type (patch, minor, or major)
   - Update the version in package.json according to semantic versioning
   - Update CHANGELOG.md with the changes since the last release
   - Create a git tag

   You can also directly specify the release type:

   - `npm run release:patch` - for bug fixes (1.0.0 → 1.0.1)
   - `npm run release:minor` - for new features (1.0.0 → 1.1.0)
   - `npm run release:major` - for breaking changes (1.0.0 → 2.0.0)

2. Push to GitHub: `git push --follow-tags origin main`

3. Create a GitHub release: `npm run publish:github`

You can also use the GitHub Actions workflow by going to the "Actions" tab in your repository, selecting the "Release" workflow, and clicking "Run workflow".

## Project Structure

```
typescript-boilerplate/
├── .github/             # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml       # Continuous Integration workflow
│       └── release.yml  # Release workflow
├── .husky/              # Git hooks
│   └── pre-commit       # Pre-commit hook for formatting and linting
├── scripts/             # Utility scripts
│   ├── extract-latest-release.js  # Script for GitHub releases
│   ├── release.js                 # Interactive release script
│   └── setup-automation.js        # Setup script for existing projects
├── src/                 # Source code
│   ├── index.ts         # Main entry point
│   └── index.test.ts    # Tests
├── .eslintrc.js         # ESLint configuration
├── .gitignore           # Git ignore rules
├── .prettierrc          # Prettier configuration
├── .versionrc.json      # Versioning configuration
├── CHANGELOG.md         # Automatically generated changelog
├── commitlint.config.js # Commit message linting configuration
├── jest.config.js       # Jest testing configuration
├── package.json         # NPM package configuration
├── README.md            # Project documentation
└── tsconfig.json        # TypeScript configuration
```

## Scripts

- `npm run build`: Build the project
- `npm run dev`: Watch mode for development
- `npm test`: Run tests
- `npm run lint`: Check for linting issues
- `npm run lint:fix`: Fix linting issues
- `npm run format`: Format code using prettier
- `npm run release`: Create a new release with interactive type selection
- `npm run release:patch`: Create a patch release (for bug fixes)
- `npm run release:minor`: Create a minor release (for new features)
- `npm run release:major`: Create a major release (for breaking changes)
- `npm run publish:github`: Create a GitHub release

## Customization

### Linting Rules

Edit `.eslintrc.js` to customize linting rules.

### Code Formatting

Edit `.prettierrc` to customize code formatting.

### TypeScript Configuration

Edit `tsconfig.json` to customize TypeScript compiler options.

### Testing

Edit `jest.config.js` to customize testing configuration.

## License

MIT
