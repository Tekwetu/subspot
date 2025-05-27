# Contributing to Subscription Manager

First off, thank you for considering contributing to Subscription Manager! It is people like you that make this project better. This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Project Overview](#project-overview)
- [Development Setup](#development-setup)
- [Local Development Workflow](#local-development-workflow)
- [Code Structure](#code-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Code of Conduct](#code-of-conduct)

## Project Overview

Subscription Manager is a personal tool for tracking subscriptions with both online and offline capabilities. The application follows a local-first approach where all data is stored locally and synchronized with a backend when online.

### Architecture

- **Frontend**: React with TypeScript, Vite, TailwindCSS, and TinyBase for state management
- **Backend**: NestJS with TypeScript, Turso (libSQL) for database, and JWT authentication
- **Mobile Support**: Responsive design with mobile-first components
- **Offline Capabilities**: Local-first approach with synchronization

## Development Setup

Please refer to the [README.md](README.md) file for detailed installation and setup instructions for both the frontend and backend components of this project.

## Local Development Workflow

1. Make your changes in a dedicated branch
2. Test locally using the following commands:
   - `npm run typecheck` - Check for TypeScript errors
   - `npm run lint` - Check for linting errors
   - `npm run format` - Format code using Prettier
   - `npm run test` - Run tests (when implemented)
3. Commit your changes with a descriptive commit message
4. Push your branch and create a pull request

## Code Structure

### Frontend Structure

- `/src/components` - React components
- `/src/hooks` - Custom React hooks
- `/src/services` - Services for API calls, authentication, synchronization
- `/src/stores` - TinyBase store setup and related utilities
- `/src/types` - TypeScript interfaces and types

### Backend Structure

- `/src/modules` - NestJS modules for different features
- `/src/dto` - Data Transfer Objects for API requests/responses
- `/src/services` - Business logic
- `/src/controllers` - API endpoints
- `/src/entities` - Database entity definitions

## Coding Standards

### TypeScript

- Use strict mode with proper type definitions
- Avoid `any` type when possible
- Use explicit type imports with the `import type` syntax
- Separate value imports from type imports

### React

- Use functional components with hooks
- Break down complex components into smaller, focused components
- Use React context for global state when appropriate
- Follow React best practices for memoization and performance

### Styling

- Use TailwindCSS for styling
- Follow the mobile-first approach for responsive design
- Use consistent naming conventions for CSS classes

### Commits

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor:` - Code changes that neither fix a bug nor add a feature
- `perf:` - Performance improvements
- `test:` - Adding or correcting tests
- `chore:` - Changes to the build process, tools, etc.

Example: `feat: add mobile-responsive card component`

## Git Workflow

1. **Branch Naming**: Use descriptive branch names with prefixes:
   - `feature/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation
   - `refactor/` for code refactoring
   - `test/` for test-related changes

   Example: `feature/add-export-functionality`

2. **Keep branches up to date** with the main branch:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

3. **Atomic commits**: Make focused commits that address a single issue or feature

## Pull Request Process

1. Create a pull request from your branch to the main branch
2. Provide a clear description of the changes and the issue they address
3. Link any relevant issues in the PR description
4. Ensure all checks pass (TypeScript, linting, tests)
5. Address review comments and make requested changes
6. Once approved, your PR will be merged

## Reporting Issues

When reporting issues, please include:

1. Clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots or screen recordings if applicable
6. Environment information (browser, OS, device)
7. Any relevant logs or error messages

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](https://github.com/Tekwetu/subspot#coc-ov-file). Please report unacceptable behavior to the project maintainers.

---

Thank you for contributing to Subscription Manager! Your efforts help make this project better for everyone.
