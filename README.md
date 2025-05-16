# Personal Subscription Manager

A simple web application for tracking personal subscriptions (primarily AI tools) to manage costs and avoid unwanted renewals by providing timely reminders. This application supports offline viewing and editing with data synchronization when online.

## Features

- Track all active and cancelled subscriptions
- Visualize upcoming renewal dates
- Receive timely reminders before subscriptions renew
- Get a basic overview of subscription spending
- Access key subscription details (cost, renewal date, cancellation info)
- Synchronize offline changes with the backend when connectivity is restored

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: TinyBase (for in-memory data, reactivity, and local persistence)

### Backend (Coming Soon)
- **Framework**: NestJS with TypeScript
- **Database**: Turso (libSQL)
- **Hosting**: Fly.io

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/tekwetu/subscription-manager.git
cd subscription-manager
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Local-First Approach

This application is built with offline-first in mind:
- All CRUD operations work offline using TinyBase
- Data is synchronized with backend when online
- Clear UI indicators show synchronization status

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

See the [Implementation Plan](docs/implementation-plan.md) for details on upcoming features and development timeline.