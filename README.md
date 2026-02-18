# Ritmio Frontend

Frontend for **Ritmio** - a habit and daily task tracking product.

This repository contains the React + TypeScript frontend with authentication flows, dashboard calendar, tasks/subtasks management, and session refresh handling.

## Current Capabilities

- User registration and login
- Email verification and verification resend flow
- JWT session usage with automatic token refresh (`/sessions/new-token`)
- Protected dashboard routing for authenticated users
- Date-based task management with calendar navigation
- Task and subtask CRUD flows
- Completed tasks filtering and progress tracking

## Tech Stack

- Node.js 20+
- TypeScript
- React 19
- Vite 7
- React Router 7
- ESLint 9
- Lucide React

## Prerequisites

- Node.js >= 20
- Yarn 1.x
- Running Ritmio API (default `http://localhost:8080`)

## Quick Start

1. Install dependencies:

```bash
yarn install
```

2. Create local env file:

```bash
cp .env.example .env
```

3. Start frontend in dev mode:

```bash
yarn dev
```

Frontend will start on `http://localhost:5173` by default.

## Environment Variables

Use `.env.example` as base.

### App

- `VITE_API_URL` - API base URL (default `http://localhost:8080/api/v1`)

## Scripts

- `yarn dev` - start development server
- `yarn build` - run TypeScript build and Vite production build
- `yarn preview` - preview production build locally
- `yarn lint` - run ESLint checks

## Main Frontend Areas

- Auth pages (`/login`, `/register`) - sign in/sign up flows
- Email verification pages (`/verify-email`, `/verify-email/pending`)
- Dashboard (`/dashboard`) - calendar and tasks workspace
- Task flows - create/edit/delete tasks and manage subtasks
- Session layer - access token storage, refresh scheduling, auth recovery

## API Endpoints Used by Frontend

- `POST /api/v1/sessions` - login
- `DELETE /api/v1/sessions` - logout
- `GET /api/v1/sessions/new-token` - refresh token
- `POST /api/v1/users` - registration
- `POST /api/v1/users/resend-verification` - resend verification email
- `GET /api/v1/users/verify-email?token=...` - verify email
- `GET /api/v1/users/me` - get profile
- `GET /api/v1/users/me/tasks` - list tasks
- `POST /api/v1/users/me/tasks` - create task
- `GET /api/v1/users/me/tasks/:taskId` - get task details
- `PATCH /api/v1/users/me/tasks/:taskId` - update task / completion
- `DELETE /api/v1/users/me/tasks/:taskId` - delete task
- `GET /api/v1/users/me/tasks/:taskId/subtasks` - list subtasks
- `POST /api/v1/users/me/tasks/:taskId/subtasks` - create subtask
- `PATCH /api/v1/users/me/tasks/:taskId/subtasks/:subtaskId` - update subtask completion

## Project Structure

```text
src/
  api/                 HTTP and API request layer
  components/          UI modules (dashboard, auth, tasks, shared ui)
  config/              API URL and auth session storage
  types/               shared API/domain types
  utils/               helper functions
```
