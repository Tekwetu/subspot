# Personal Subscription Manager

A simple web application for tracking personal subscriptions (primarily AI tools) to manage costs and avoid unwanted renewals by providing timely reminders. This application supports offline viewing and editing with data synchronization when online.

## Features

- Track all active and cancelled subscriptions
- Visualize upcoming renewal dates
- Receive timely reminders before subscriptions renew
- Get a basic overview of subscription spending
- Access key subscription details (cost, renewal date, cancellation info)
- Synchronize offline changes with the backend when connectivity is restored
- Mobile-responsive design with touch-friendly interface

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: TinyBase (for in-memory data, reactivity, and local persistence)
- **Mobile UI**: Responsive, card-based mobile interface with touch-optimized components

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: Turso (libSQL)
- **Authentication**: JWT-based authentication
- **Hosting**: Fly.io containerized deployment
- **Synchronization**: REST API with timestamp-based conflict resolution

## Development Setup

First, clone this repository.

### Frontend

1. Go to the project root directory.

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

### Backend

1. Go to the project root directory.

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env file with your Turso credentials and JWT secret
```

4. Start the backend development server:
```bash
npm run start:dev
```

## Local-First Approach

This application is built with offline-first in mind:
- All CRUD operations work offline using TinyBase
- Data is synchronized with backend when online
- Clear UI indicators show synchronization status
- Conflict resolution strategy based on timestamps

## Mobile Experience

The application features a responsive, mobile-first design:
- Card-based subscription view on mobile devices
- Touch-friendly buttons and interaction elements
- Sticky header with collapsible statistics
- Bottom-sheet modals optimized for thumb navigation
- Visual indicators for upcoming renewals

## Deployment

The application can be deployed using Docker and Fly.io:

```bash
# From the backend directory
fly deploy
```

Frontend can be built for production:

```bash
# From the frontend directory
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

See the [Implementation Plan](docs/implementation-plan.md) for details on upcoming features and development timeline.
