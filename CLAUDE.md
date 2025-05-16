# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See:
- @docs/prd.md for the PRD
- @docs/implementation_plan.md for the implementation plan
- @frontend/package.json for available npm commands for the frontend
- @backend/package.json for available npm commands for the frontend

## Project Overview

This project is a Personal Subscription Manager application designed to track and manage subscriptions (primarily for AI tools, but flexible for others). It helps manage costs and provides reminders for upcoming renewals. The application supports both online and offline capabilities.

## Architecture

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: TinyBase (for in-memory data, reactivity, and local persistence)

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: Turso (libSQL)
- **Hosting**: Fly.io

### Core Features
- Subscription management (CRUD operations)
- Dashboard with overview and upcoming renewals
- Reminders & notifications
- Search, sorting, & filtering
- Offline capabilities with data synchronization

## Development Commands

Once implemented, the following commands will be commonly used:

## Development Guidelines

### Local-First Approach
- Implement frontend with offline capabilities first using TinyBase
- All CRUD operations should work offline
- Synchronize data with backend when online

### Data Structure
- Subscription data includes: name, price, currency, billing cycle, renewal date, etc.
- TinyBase store structure should match backend database schema for synchronization

### Synchronization Strategy
- Implement online/offline detection
- Use timestamp-based approach for conflict resolution
- Provide clear UI indicators for synchronization status

## Testing Considerations
- Test all features in both online and offline modes
- Verify synchronization works correctly
- Test edge cases for conflict resolution

## Coding guidelines

- TypeScript: Strict mode with proper type definitions
- Components: Function components with type annotations
- Type imports: Always use `import type` syntax for importing TypeScript types to avoid runtime errors
- Type handling:
  1. Use explicit type imports from specific files rather than index files when possible
  2. Separate value imports from type imports (e.g., `import { Value } from './file'` and `import type { Type } from './file'`)
  3. Pay special attention to barrel files (index.ts) that re-export types to ensure they're properly structured

  ## Workflow

- Always run typecheck and fix all TypeScript errors before committing code.
- Always run the linter to check for linting errors before committing code.
- Make sure unit tests pass before committing code.