# MiReporte - Frontend Web

Web administration system for managing, tracking, and analyzing citizen incident reports (potholes and public lighting) in Mexico. Built with **Next.js 16**, **React 19**, **TypeScript**, and **Bootstrap 5**.

## Key Features

- **Dashboard & Analytics**: Executive overview and economic concept analysis for street maintenance.
- **Incident Report Management**: Filter, inspect, assign supervisors, and update lifecycle statuses of citizen reports.
- **Real-Time Notifications via Socket.IO**: Live event subscription (`report:created`) for users with **Administrator** and **Service Desk** (`Mesa de servicios`) roles.
- **Interactive Notification Bell**: Accessible dropdown with `9+` unread count badge, recent notifications list, and automatic read-state synchronization.
- **Instant Alerts & Live Refresh**: Non-intrusive Bootstrap toast notifications and automatic reports table re-fetching upon new report creation.
- **Deep-linking & Row Highlighting**: Query parameter support (`?report_id=<id>`) to quickly navigate to and highlight target reports.

## Environment Variables

Create a `.env.local` file based on `.env.example` with the following variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.azurewebsites.net
NEXT_PUBLIC_SOCKET_URL=https://your-backend-api.azurewebsites.net
```

| Variable | Description | Fallback |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL for the backend REST API. | Required |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL for WebSocket connections. | `NEXT_PUBLIC_API_URL` |

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

## Build and Quality Checks

```bash
# Run ESLint validation
npm run lint

# Build for production
npm run build
```
