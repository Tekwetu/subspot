# SubSpot Deployment Guide

This guide covers how to deploy the SubSpot application to Fly.io, including setting up the Turso database.

## Prerequisites

- Fly.io account and CLI installed
- Turso account and CLI installed
- GitHub repository with your code

## Turso Database Setup

1. Create a production Turso database:
   ```bash
   turso db create subspot-prod
   ```

2. Get the database URL and create an auth token:
   ```bash
   turso db show subspot-prod --url
   turso db tokens create subspot-prod
   ```

3. Save these values for later use with Fly.io

## Fly.io Setup

### Backend Setup

1. Navigate to backend directory and create a Fly.io app:
   ```bash
   cd backend
   fly apps create subspot-backend
   ```

2. Set required secrets:
   ```bash
   fly secrets set DATABASE_URL=libsql://your-turso-db-url
   fly secrets set DATABASE_AUTH_TOKEN=your-turso-auth-token
   fly secrets set JWT_SECRET=your-secure-jwt-secret
   # Add any other environment variables needed
   ```

3. Initial deployment (done manually once):
   ```bash
   fly deploy
   ```
4. Get Fly.io API token (done manually once):
   ```bash
   fly tokens create deploy --name  "GitHub Actions Backend Deploy" --expiry 8760h
   ```

### Frontend Setup

1. Navigate to frontend directory and create a Fly.io app:
   ```bash
   cd frontend
   fly apps create subspot-frontend
   ```

2. Set required secrets:
   ```bash
   fly secrets set API_URL=https://subspot-backend.fly.dev/
   # Add any other environment variables needed
   ```

3. Initial deployment (done manually once):
   ```bash
   fly deploy
   ```
4. Get Fly.io API token (done manually once):
   ```bash
   fly tokens create deploy --name  "GitHub Actions Frontend Deploy" --expiry 8760h
   ```

## GitHub Actions CI/CD Setup

1. Add required secrets to your GitHub repository:
   - `FLY_API_TOKEN_BACKEND`: Your backend Fly.io API token
   - `FLY_API_TOKEN_FRONTEND`: Your frontend Fly.io API token
   - `VITE_API_URL`: The URL of your backend API (e.g., https://subspot-backend.fly.dev) - do NOT include a trailing slash
   - Any other secrets referenced in your workflows

2. The GitHub Actions workflows will run automatically on pushes to the main branch:
   - `ci.yml`: Runs tests, type checking, and linting
   - `deploy.yml`: Deploys to Fly.io when CI passes

## Database Initialization and Migration

The NestJS backend handles database initialization through the application code:

1. The database schema is defined in `/backend/src/database/schema.sql`
2. Database initialization logic is in `/backend/src/database/init-db.ts`
3. When the application starts, it checks and initializes the database if needed

## Monitoring and Maintenance

### Checking Deployment Status
```bash
fly status -a subspot-backend
fly status -a subspot-frontend
```

### Viewing Logs
```bash
fly logs -a subspot-backend
fly logs -a subspot-frontend
```

### Scaling
```bash
fly scale count 2 -a subspot-backend  # Increase to 2 instances
```

### Updating Secrets
```bash
fly secrets set NEW_SECRET=value -a subspot-backend
```

## Troubleshooting

- **Database Connection Issues**: Verify DATABASE_URL and DATABASE_AUTH_TOKEN are correctly set
- **Deployment Failures**: Check GitHub Actions logs or try deploying manually
- **Frontend Can't Connect to Backend**: Verify API_URL is correct and backend is running