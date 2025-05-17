# Subscription Manager - Frontend

This is the frontend application for the Personal Subscription Manager, a tool designed to track and manage subscriptions with offline-first capabilities.

## Features Implemented

- **Local-first data management** using TinyBase for state management
- **Offline capability** with automatic local storage persistence
- **Schema-based typing** for strong type safety
- **Reactive UI** that updates automatically when data changes
- **Basic dashboard** with summary cards and subscription listings
- **Upcoming renewals tracking** to monitor soon-to-be-billed subscriptions
- **Online/offline detection** to support both connected and disconnected use

## Tech Stack

- **React 19** with TypeScript for the UI
- **Vite** for fast builds and development
- **TailwindCSS** for styling
- **TinyBase** for state management and local persistence

## Data Structure

The application uses TinyBase with a schema-based approach to define the subscription data model:

- **Subscription Properties**:
  - name (string)
  - plan (string, optional)
  - price (number)
  - currency (string, defaults to USD)
  - billingCycle (string)
  - startDate (ISO date string)
  - renewalDate (ISO date string)
  - paymentMethod (string, optional)
  - accountEmail (string, optional)
  - category (string, optional)
  - status (string, defaults to "active")
  - cancellationInfo (string, optional)
  - notes (string, optional)
  - lastModified (timestamp)

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment:
   ```
   cp .env.example .env
   ```
   
   Edit the `.env` file to set:
   ```
   VITE_API_URL=http://localhost:3000
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types
- `npm run format` - Format code with Prettier
- `npm run preview` - Preview production build locally

## Architecture

The app follows a local-first architecture:

- **Data Layer**: TinyBase store with schema validation
- **Persistence**: Local storage for offline capabilities
- **React Integration**: Context provider and custom hooks
- **UI Components**: Dashboard, subscription list, and more
- **Synchronization**: Online/offline detection with sync status tracking

## Future Work

- Complete proper subscription form with all fields
- Add search, sorting, and filtering capabilities
- Implement client-side reminders
- Add data synchronization between devices
- Build data import/export functionality

## API Integration

The frontend connects to the backend API using the URL specified in the `.env` file:

- **Development**: API expected at `http://localhost:3000` by default
- **Production**: Set `VITE_API_URL` to your production backend URL

The app uses a local-first approach that allows it to work offline. When online:
1. Changes made while offline are synced to the server
2. The latest data is pulled from the server
3. Conflicts are resolved using a timestamp-based strategy