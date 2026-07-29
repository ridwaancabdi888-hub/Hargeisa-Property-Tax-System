# Hargeisa Municipal Tax & Property Management System

A full-stack tax and property management platform: regional overview dashboards, GIS property mapping, property listing CRUD with image uploads, tax management, analytics, role-based access control, activity auditing, data export, and database backup/restore.

**Stack:** React 19 + TypeScript + Tailwind (Vite) · Express + MySQL/MariaDB · JWT cookie auth

## Search indexing policy

The deployed Vercel URL is a private administrative demo, not a public municipal information portal. HTML metadata, HTTP response headers, and `robots.txt` therefore instruct search engines not to index sign-in, property, client, tax, GIS, report, profile, backup, activity-log, or user-management routes. A sitemap and public structured data are intentionally omitted.

Do not submit this dashboard to Google Search Console for indexing. If an authorized public municipal portal is created later, deploy it on a separate canonical domain and publish only approved contact details, legislation, service instructions, office locations, accessibility information, and privacy terms. That public portal should receive a separate SEO and legal review.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running in Development](#running-in-development)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Production Deployment](#production-deployment)
- [Folder Structure](#folder-structure)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20+
- A MySQL-compatible server (MariaDB via XAMPP works well on Windows) with `mysql`/`mysqldump` CLIs on `PATH` (needed for backup/restore)
- Docker + Docker Compose, only if you want the containerized deployment path

## Installation

```bash
# frontend deps (repo root)
npm install

# backend deps
cd server
npm install
```

## Environment Variables

Create the backend environment file from the provided template:

```bash
# macOS/Linux
cp server/.env.example server/.env

# Windows Command Prompt
copy server\.env.example server\.env

# Windows PowerShell
Copy-Item server/.env.example server/.env
```

Then fill in real values locally. Never commit `server/.env`, `server/.env.test`, or the root `.env`; these files are already excluded by `.gitignore`.

| Variable | Description |
|---|---|
| `PORT` | Backend port (default `5000`) |
| `NODE_ENV` | `development`, `production`, or `test` |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL/MariaDB connection |
| `MYSQLDUMP_BIN`, `MYSQL_BIN` | Paths to the `mysqldump`/`mysql` CLIs, used by backup/restore. On Windows/XAMPP point these at `C:\xampp\mysql\bin\mysqldump.exe` / `mysql.exe`; in Docker/Linux `mysqldump`/`mysql` on `PATH` is enough |
| `JWT_SECRET` | Long random string signing session tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `8h`) |
| `COOKIE_NAME` | Name of the httpOnly auth cookie |
| `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_FULL_NAME` | Credentials for the admin account created by the DB migration |

The frontend has no required environment variables in development — Vite proxies `/api` and `/uploads` to the backend (see `vite.config.ts`).

## Database Setup

1. Create an empty database matching `DB_NAME` (default `hargeisa_tax_db`).
2. From `server/`, run the migration, which creates all tables and seeds the admin account from your `SEED_ADMIN_*` env vars:

```bash
cd server
npm run migrate
```

Re-running `migrate` is safe — it only creates what's missing and won't duplicate the seeded admin.

## Running in Development

Start MySQL/MariaDB, then in two terminals:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` and sign in with your seeded admin credentials.

To preview the optimized frontend build locally, run `npm run build` and then `npm run preview` from the repository root.

## Testing

```bash
# Backend unit + integration tests (Jest + Supertest)
# Uses a separate database (see server/.env.test) — never touches your dev DB
cd server
npm test

# Frontend component tests (Vitest + React Testing Library)
npm test

# End-to-end tests (Playwright) — requires the backend and frontend dev servers running
npm run test:e2e

# Static checks (lint, TypeScript, and production bundle)
npm run lint
npm run build
```

Before the first `server/npm test` run, copy `server/.env.example` to `server/.env.test`, point `DB_NAME` at a dedicated test database (e.g. `hargeisa_tax_test_db`), and use a distinct `JWT_SECRET`. The Jest `pretest` script migrates that database automatically.

## API Documentation

With the backend running, interactive Swagger UI is available at:

```
http://localhost:5000/api/docs
```

The raw OpenAPI 3.0 spec is served at `http://localhost:5000/api/docs.json`.

## Production Deployment

### Docker Compose (recommended)

```bash
cp .env.docker.example .env
# edit .env with real secrets

docker compose up -d --build
```

This builds three containers:
- `db` — MariaDB with a persistent volume
- `server` — Express API (runs migrations on startup, then serves on port 5000 internally)
- `client` — the built frontend served by nginx on port 80, which reverse-proxies `/api` and `/uploads` to `server` so cookies remain same-origin

Visit `http://localhost` once the stack is up. Health check: `http://localhost/api/health` (also used as the container healthcheck, verifies DB connectivity).

> **Note:** the Docker configuration has been reviewed carefully but not build-tested in this environment (no Docker available here) — verify `docker compose up` end-to-end before relying on it in production.

### Manual deployment

1. `npm run build` at the repo root to produce `dist/` — serve it with any static file server or nginx, proxying `/api` and `/uploads` to the backend.
2. In `server/`, set `NODE_ENV=production`, run `npm run migrate`, then `npm start`.
3. Put both behind HTTPS — cookies are marked `secure` automatically when `NODE_ENV=production`.

## Folder Structure

```
src/                    Frontend (React + TypeScript)
  components/           Reusable UI components (layout, tables, forms, modals...)
  context/              React context providers (auth, etc.)
  pages/                Route-level pages
  lib/                  API client functions
  tests/                Vitest setup + component tests

server/
  src/
    routes/             Express route definitions
    controllers/        Request handlers
    services/           Business logic (exports, backups, activity log...)
    models/             Data access layer
    middleware/         Auth, RBAC, rate limiting, uploads, error handling
    db/                 Schema + migration script
    docs/               Hand-written OpenAPI spec
  tests/                Jest unit + integration tests
  scripts/              Standalone regression scripts (test-*.mjs)

e2e/                    Playwright end-to-end tests
```

## Troubleshooting

- **401s immediately after logging in / session not persisting**: confirm `CLIENT_URL` matches the frontend's actual origin and that you're accessing the frontend via the same host/port it's configured for — cookies are same-site.
- **`429 Too many requests`**: rate limits are shared through MySQL across all backend instances and reset automatically when their 15-minute window expires.
- **Backup/restore fails with a spawn error**: verify `MYSQLDUMP_BIN`/`MYSQL_BIN` point at valid executables on `PATH` or as absolute paths.
- **Jest hangs after tests finish**: expected with a long-lived MySQL pool; `npm test` in `server/` already runs with `--forceExit`.
- **Windows/XAMPP dev servers dying silently**: MariaDB, the backend, and the frontend dev server all run as separate background processes — if any URL stops responding, just restart that one process (`mysqld --defaults-file=my.ini --standalone`, `npm run dev` in `server/`, `npm run dev` at root).
