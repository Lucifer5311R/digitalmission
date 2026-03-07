# Enterprise Attendance Management System

A full-stack web + PWA application for managing trainer attendance and hours with offline-first architecture.

## Features

- **Role-Based Access** — Trainer and Supervisor roles with distinct permissions
- **Check-in/Check-out** — Trainers start/end sessions with auto-calculated hours
- **Class Management** — Supervisors create/edit classes and assign trainers
- **Ratings & Feedback** — Supervisors rate trainers (1-5 stars) with feedback
- **Real-time Dashboard** — Live statistics and today's session overview
- **CSV Export** — Download attendance data for reporting
- **Offline-First** — Works completely offline, syncs when online
- **PWA** — Installable as a native-like app on any device

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS |
| Backend    | Node.js, Express.js, TypeScript     |
| Database   | PostgreSQL, Sequelize ORM           |
| Auth       | JWT (access + refresh tokens), bcrypt |
| Offline    | Service Workers, IndexedDB (Dexie.js) |
| Testing    | Jest, Supertest, Vitest, RTL, Playwright |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd Digital
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Setup database

```bash
# Create the database
createdb attendance_db

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

### 4. Start development

```bash
# Start both server and client
npm run dev

# Or start individually
npm run dev:server   # Backend on http://localhost:3001
npm run dev:client   # Frontend on http://localhost:5173
```

### 5. Run tests

```bash
npm test              # Run all tests
npm run test:server   # Backend tests only
npm run test:client   # Frontend tests only
```

## Project Structure

```
Digital/
├── server/           # Express.js backend
│   ├── src/
│   │   ├── config/       # Database, env, CORS config
│   │   ├── models/       # Sequelize models
│   │   ├── migrations/   # Database migrations
│   │   ├── seeders/      # Seed data
│   │   ├── middleware/    # Auth, RBAC, validation, rate limiting
│   │   ├── routes/       # API route definitions
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── validators/   # Request validation schemas
│   │   ├── utils/        # JWT, password, CSV, logger helpers
│   │   └── types/        # TypeScript type definitions
│   └── tests/            # Unit & integration tests
├── client/           # React frontend
│   ├── public/           # PWA manifest, service worker, icons
│   ├── src/
│   │   ├── contexts/     # Auth, App, Sync contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API client, IndexedDB, sync engine
│   │   ├── components/   # UI components (common, trainer, supervisor)
│   │   ├── pages/        # Route page components
│   │   ├── utils/        # Formatters, validators, constants
│   │   └── types/        # Frontend type definitions
│   └── tests/            # Component, hook, E2E tests
└── package.json      # Root workspace config
```

## Default Accounts (Seed Data)

| Role       | Email                    | Password   |
|------------|--------------------------|------------|
| Supervisor | admin@attendance.com     | admin123   |
| Supervisor | supervisor@attendance.com| super123   |
| Trainer    | trainer1@attendance.com  | trainer123 |
| Trainer    | trainer2@attendance.com  | trainer123 |
| Trainer    | trainer3@attendance.com  | trainer123 |

## API Documentation

See [server/README.md](server/README.md) for full API endpoint documentation.

## License

Private — All rights reserved.
