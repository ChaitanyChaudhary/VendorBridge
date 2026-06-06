# VendorBridge

VendorBridge is a Next.js procurement portal with a local PostgreSQL-backed backend for authentication, RFQs, quotations, approvals, purchase orders, activity logs, and reports.

## What You Need First

- Install [Node.js 18+](https://nodejs.org/)
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) or a local PostgreSQL server
- `npm` comes with Node.js

## Environment Setup

Create a local env file from the example:

```bash
cp .env.example .env.local
```

If you are on Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

## Start PostgreSQL

Use the included Docker Compose file:

```bash
docker compose up -d
```

This starts a local PostgreSQL instance on port `5432`.

## Install Dependencies

```bash
npm install
```

## Run the App

Start the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Backend Notes

- The backend uses Next.js route handlers under `app/api`.
- Database tables are created automatically on first request.
- Authentication uses email/password with a local session cookie.
- Password reset is handled locally without any paid email service.

## Useful Commands

```bash
npm run build
npm run start
npm run lint
docker compose down
```

## Project Structure

- `app/` - UI shell and API routes
- `components/` - screens and shared UI
- `context/PortalContext.tsx` - app state and backend wiring
- `lib/server/` - PostgreSQL and auth helpers
