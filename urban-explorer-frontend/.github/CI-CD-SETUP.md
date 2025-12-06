# CI/CD Setup Documentation

## Overview

This document describes the GitHub Actions CI/CD workflow setup for the Urban Explorer Frontend project.

## What Was Implemented

### 1. GitHub Actions Workflow (.github/workflows/ci.yml)

A comprehensive CI/CD pipeline with the following jobs:

#### Job 1: Build
- **Purpose**: Compile the Angular application
- **Steps**:
  - Checkout code
  - Setup Node.js 20 with npm caching
  - Install dependencies with `npm ci`
  - Build application with `npm run build`
  - Upload build artifacts (retained for 7 days)

#### Job 2: Lint
- **Purpose**: Enforce code quality standards
- **Steps**:
  - Checkout code
  - Setup Node.js 20 with npm caching
  - Install dependencies with `npm ci`
  - Run ESLint with `npm run lint`

#### Job 3: Test & Coverage
- **Purpose**: Execute unit tests and generate coverage reports
- **Steps**:
  - Checkout code
  - Setup Node.js 20 with npm caching
  - Install dependencies with `npm ci`
  - Run tests with coverage using `npm run test:ci`
  - Upload coverage reports (retained for 30 days)
  - Check coverage threshold (fails if < 80%)
  - Comment coverage report on pull requests

#### Job 4: Coverage Threshold Check
- **Purpose**: Validate minimum coverage requirements
- **Steps**:
  - Download coverage artifacts from test job
  - Verify all metrics (lines, statements, functions, branches) meet 80% threshold
  - Fail the build if any metric is below 80%

### 2. Karma Configuration Updates (karma.conf.js)

Enhanced test configuration:

```javascript
coverageReporter: {
  dir: require('path').join(__dirname, './coverage'),
  subdir: '.',
  reporters: [
    { type: 'html' },           // HTML report for local viewing
    { type: 'text-summary' },   // Console summary
    { type: 'lcovonly' },       // LCOV format for CI tools
    { type: 'json-summary' }    // JSON summary for programmatic access
  ],
  check: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}
```

### 3. Package.json Updates

Added new npm script:

```json
{
  "scripts": {
    "test:ci": "ng test --no-watch --no-progress --browsers=ChromeHeadless --code-coverage"
  }
}
```

## Workflow Triggers

The workflow runs on:
- **Push** to `main` or `develop` branches
- **Pull Requests** targeting `main` or `develop` branches

## Coverage Requirements

All code must meet the following minimum thresholds:
- **Lines**: 80%
- **Statements**: 80%
- **Functions**: 80%
- **Branches**: 80%

## Features

### Automated Testing
- All tests run automatically on every push and PR
- Tests run in headless Chrome for CI environment
- Coverage reports generated automatically

### Coverage Reporting
- HTML reports for local viewing
- LCOV format for integration with coverage tools
- JSON summary for programmatic analysis
- Automatic PR comments with coverage metrics

### Build Artifacts
- Build artifacts stored for 7 days
- Coverage reports stored for 30 days
- Accessible from the GitHub Actions UI

### Caching
- npm dependencies cached for faster builds
- Reduces build time by reusing node_modules

## Local Testing

To test the CI workflow locally:

```bash
# Run build
npm run build

# Run linter
npm run lint

# Run tests with coverage
npm run test:ci

# View coverage report
open coverage/index.html
```

## Adding Badges to README

See `.github/BADGES.md` for badge examples and instructions.

Example:
```markdown
![CI](https://github.com/YOUR_USERNAME/urban-explorer-frontend/actions/workflows/ci.yml/badge.svg)
```

## Workflow Status

Once pushed to GitHub:
1. Navigate to the "Actions" tab in your repository
2. You'll see the CI workflow listed
3. Click on any workflow run to see detailed logs
4. Green checkmark = all jobs passed
5. Red X = one or more jobs failed

## Troubleshooting

### Build Failures

**Issue**: Build job fails
- **Solution**: Run `npm run build` locally to identify the issue
- Check for TypeScript errors or missing dependencies

**Issue**: Lint job fails
- **Solution**: Run `npm run lint` locally
- Fix any ESLint errors or use `npm run lint -- --fix` for auto-fixes

**Issue**: Test job fails
- **Solution**: Run `npm run test:ci` locally
- Check test failures in the console output
- Ensure ChromeHeadless is available (may need to install Chrome in CI)

### Coverage Issues

**Issue**: Coverage below 80%
- **Solution**: Add more tests to increase coverage
- Run `npm run test:ci` locally to see coverage report
- Focus on untested lines, branches, and functions

**Issue**: Coverage report not found
- **Solution**: Ensure tests run successfully
- Check that coverage/ directory is created
- Verify karma.conf.js configuration

## Best Practices

1. **Always test locally before pushing**
   ```bash
   npm run build && npm run lint && npm run test:ci
   ```

2. **Keep coverage above 80%**
   - Write tests for new features
   - Don't remove existing tests
   - Review coverage report before pushing

3. **Fix lint errors immediately**
   - Don't commit code with lint errors
   - Use ESLint auto-fix when possible

4. **Review CI logs**
   - Check GitHub Actions after every push
   - Fix failures promptly

## GitFlow Integration

This CI/CD setup works with GitFlow:
- Feature branches: Create PR to `develop`
- Develop branch: Merge features here, CI runs
- Main branch: Production-ready code, CI must pass

## Next Steps

1. Push changes to GitHub
2. Create a pull request from `feature/ci-cd-setup` to `develop`
3. Verify that all CI jobs pass
4. Merge the PR once approved
5. Add badges to README.md

## Files Modified/Created

```
.github/
├── workflows/
│   └── ci.yml                    # Main CI/CD workflow
├── BADGES.md                     # Badge documentation
└── CI-CD-SETUP.md               # This file

karma.conf.js                     # Updated with coverage config
package.json                      # Added test:ci script
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Karma Configuration](https://karma-runner.github.io/latest/config/configuration-file.html)
- [Istanbul Coverage](https://github.com/istanbuljs/istanbuljs)

---

**Created**: 2025-12-05
**Branch**: feature/ci-cd-setup
**Commit**: 7704ba8
