# Disaster Management Platform

A full-stack disaster preparedness and response platform with role-based operations for students, teachers, and administrators.

## Overview

The system combines training, risk intelligence, incident reporting, and response coordination in a single product:

- learning modules and drills for preparedness
- risk assessment and geo-intelligence for planning
- community incident reporting and verification workflow
- volunteer task coordination and operational tracking
- real-time style alert preferences and offline emergency packs

## SIH Blueprint

- Advanced SIH25008 professional solution design: [SIH25008_SURAKSHAAI_BLUEPRINT.md](SIH25008_SURAKSHAAI_BLUEPRINT.md)

## Live URLs

- Frontend: https://sih2025-1-pjfk.onrender.com
- Backend: https://sih2025-ydfn.onrender.com

## Architecture

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + MongoDB + Mongoose
- Auth: JWT (cookie-based sessions), bcrypt
- ML integration: Python service endpoints consumed through backend routes

## Role-Based Access

### Student
- access personal dashboard, modules, drills, alerts, gamification
- submit incident reports
- submit disaster report case
- access resilience tools except restricted operational pages

### Teacher
- all student permissions
- verify/reject incident reports
- create and update volunteer tasks
- access forecast and drill replay operational pages

### Admin
- all teacher permissions
- admin panel and drill management
- system analytics and user management

RBAC is enforced in both frontend route guards and backend route middleware.

## Major Features

- Authentication, profile, and protected routes
- Preparedness modules and quiz progress
- Drill lifecycle and participation tracking
- Risk assessment, preparedness scoring, and regional intelligence
- Resilience Center with dedicated modules:
  - incident reporting + verification
  - alert channel preferences
  - evacuation route recommendations
  - preparedness checklist
  - drill replay
  - resource/shelter locator
  - multi-language emergency translation
  - early warning forecast
  - volunteer coordination
  - offline emergency pack

## Project Structure

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

frontend/
  src/
    components/
    context/
    lib/
    pages/
    store/
    App.jsx

ML/
  ai_assistant/
  risk_prediction.py
```

## Local Setup

1. Clone

```bash
git clone https://github.com/Nayanj041/Disaster-Management.git
cd Disaster-Management
```

2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Configure backend environment

Create backend/.env with at least:

```env
PORT=5001
MONGODB_URL=<your_mongodb_connection_string>
SECRET_PRIVATE_KEY=<your_jwt_secret>
CLIENT_URL=http://localhost:5173
```

4. Optional AI assistant setup

```bash
cd ML/ai_assistant
npm install
```

5. Seed data (recommended)

```bash
cd backend
npm run seed:mock
```

6. Run services

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Optional Terminal 3 (AI assistant):

```bash
cd ML/ai_assistant
node index.js
```

## Backend Scripts

From backend:

```bash
npm run dev        # start with nodemon
npm run start      # start with node
npm run seed:mock  # seed demo data
```

## Key API Groups

- /api/auth
- /api/modules
- /api/drills and /api/v1/drills
- /api/alerts
- /api/gamification
- /api/admin
- /api/risk
- /api/ml
- /api/resilience
- /api/v1/reports

## Notes

- Report creation now requires authenticated student or teacher role.
- Forecast, drill replay, and volunteer task mutations are role-restricted.
- For production, set secure cookie and CORS origins for deployed domains.
