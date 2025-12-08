# GitHub Actions Badges

Add these badges to your README.md to display the CI/CD status:

## Status Badges

### CI Status
```markdown
![CI](https://github.com/YOUR_USERNAME/urban-explorer-frontend/actions/workflows/ci.yml/badge.svg)
```

### Build Status
```markdown
![Build Status](https://github.com/YOUR_USERNAME/urban-explorer-frontend/actions/workflows/ci.yml/badge.svg?event=push)
```

### On Specific Branch
```markdown
![CI - Main](https://github.com/YOUR_USERNAME/urban-explorer-frontend/actions/workflows/ci.yml/badge.svg?branch=main)
![CI - Develop](https://github.com/YOUR_USERNAME/urban-explorer-frontend/actions/workflows/ci.yml/badge.svg?branch=develop)
```

## Example README Section

```markdown
# Urban Explorer Frontend

![CI](https://github.com/YOUR_USERNAME/urban-explorer-frontend/actions/workflows/ci.yml/badge.svg)
![Build Status](https://github.com/YOUR_USERNAME/urban-explorer-frontend/actions/workflows/ci.yml/badge.svg?event=push)
![Node](https://img.shields.io/badge/node-20.x-brightgreen.svg)
![Angular](https://img.shields.io/badge/Angular-20.0-red.svg)
![Ionic](https://img.shields.io/badge/Ionic-8.0-blue.svg)

## Project Status

- **CI/CD**: Automated builds, lints, and tests on every push and PR
- **Coverage**: Minimum 80% code coverage required
- **Quality**: ESLint enforced on all code
```

## Additional Badges

### Technology Stack
```markdown
![Node](https://img.shields.io/badge/node-20.x-brightgreen.svg)
![Angular](https://img.shields.io/badge/Angular-20.0-red.svg)
![Ionic](https://img.shields.io/badge/Ionic-8.0-blue.svg)
![Capacitor](https://img.shields.io/badge/Capacitor-7.4-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
```

### Code Quality
```markdown
![Coverage](https://img.shields.io/badge/coverage-80%25-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
```

## Instructions

1. Replace `YOUR_USERNAME` with your actual GitHub username or organization name
2. Replace `urban-explorer-frontend` with your repository name if different
3. Add the badges at the top of your README.md file
4. Push changes to GitHub
5. The badges will automatically update based on your workflow status

## Badge Status Meanings

- **Green (Passing)**: All tests passed, build successful
- **Red (Failing)**: Tests failed or build errors
- **Yellow (Pending)**: Workflow is currently running
- **Gray (No Status)**: No workflow runs yet or workflow disabled
