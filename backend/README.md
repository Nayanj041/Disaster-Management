# Backend - Disaster Management Platform

Express + MongoDB backend for disaster preparedness, response operations, analytics, and role-based workflows.

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT cookie authentication
- Role-based authorization middleware

## Run Locally

1. Install dependencies

```bash
npm install
```

2. Configure environment in backend/.env

```env
PORT=5001
MONGODB_URL=<your_mongodb_connection_string>
SECRET_PRIVATE_KEY=<your_jwt_secret>
CLIENT_URL=http://localhost:5173
```

3. Seed demo data (recommended)

```bash
npm run seed:mock
```

4. Start server

```bash
npm run dev
```

## Scripts

- npm run dev
- npm run start
- npm run seed:mock

## API Groups

- /api/auth
- /api/modules
- /api/drills
- /api/v1/drills
- /api/alerts
- /api/gamification
- /api/admin
- /api/risk
- /api/ml
- /api/resilience
- /api/v1/reports

## RBAC Summary

### student
- Can use learning modules, drills, alerts, gamification
- Can create incidents
- Can create report cases

### teacher
- All student access
- Can verify/reject incidents
- Can create/update volunteer tasks
- Can access advanced forecast and drill replay routes

### admin
- All teacher access
- Can access admin analytics and management endpoints

## Important Protected Routes

- Incident verification: teacher/admin only
- Volunteer task create/update: teacher/admin only
- Forecast and drill replay (resilience): teacher/admin only
- Report creation: authenticated student/teacher only
- Admin stats/activity/users: admin only

## Folder Layout

```text
backend/
  config/
  controllers/
  cron/
  lib/
  middleware/
  models/
  routes/
  scripts/
  server.js
```

## Notes

- CORS is configured for local, deployed frontend, and Codespaces origins.
- Alert ingestion cron jobs are initialized when DB connection succeeds.
