# Disaster-Management Project: Deep Technical Documentation

## 1. Document Scope

This file is a code-derived, implementation-level documentation for the repository.

Scope covered:
- System architecture (frontend, backend, ML assistant)
- Runtime topology and startup behavior
- Complete API surface by route group
- Authentication and RBAC enforcement paths
- MongoDB/Mongoose data models and key fields
- Frontend routing and major page responsibilities
- State management and request flow
- Seed data behavior
- Cron integrations and external sources
- Analytics/reporting implementation
- Operational caveats and technical debt visible in code

This documentation reflects the repository state as of March 30, 2026.

---

## 2. Repository Layout

Top-level directories and purpose:

- `backend/`
	- Express API server, MongoDB models, controllers, routes, middleware, cron jobs, seed script
- `frontend/`
	- React + Vite SPA with role-based pages and analytics UI
- `ML/`
	- AI assistant micro-app and risk prediction placeholder
- `Images_/`
	- Static image assets
- `project_completed/`
	- Additional project artifacts

Key documentation files:
- `README.md` (root): high-level project setup and overview
- `backend/README.md`: backend-specific details
- `frontend/README.md`: frontend-specific details
- `documentation.md`: this deep technical dossier

---

## 3. Technology Stack

### 3.1 Backend

- Node.js
- Express `^5.1.0` (ESM mode)
- Mongoose `^8.18.1`
- MongoDB driver `^7.1.1`
- JWT via `jsonwebtoken`
- Password hashing via `bcryptjs`
- CORS and cookie sessions (`cors`, `cookie-parser`)
- Web scraping support via `cheerio` (IMD/NDMA fetchers)

Backend scripts (`backend/package.json`):
- `npm run dev` -> `nodemon server.js`
- `npm run start` -> `node server.js`
- `npm run seed:mock` -> seed script

### 3.2 Frontend

- React `^19.1.1`
- Vite `^7.1.5`
- React Router DOM `^7.9.1`
- Zustand `^5.0.8`
- Axios `^1.12.2`
- Tailwind CSS + PostCSS
- Recharts + Chart.js integrations
- Framer Motion and Lucide icons

Frontend scripts (`frontend/package.json`):
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### 3.3 ML and Assistant

- `ML/ai_assistant/index.js`: Node wrapper exposing `/chat`
- Executes Python chatbot script (`chatbot.py`) through `child_process.exec`
- Backend also has ML proxy endpoints in `backend/controllers/ml.controller.js`
	- Defaults to `ML_SERVICE_URL` or `http://127.0.0.1:8000`
	- Includes fallback responses when ML backend is unavailable

---

## 4. Runtime Architecture

### 4.1 Server bootstrap

Backend entrypoint: `backend/server.js`

Startup sequence:
1. Load env (`dotenv.config()`)
2. Configure CORS with allowlist + Codespaces wildcard
3. Register middleware (`cookieParser`, `express.json`)
4. Mount all route groups
5. Connect MongoDB via `connectDB()`
6. Start three interval jobs (NASA, IMD, NDMA fetchers every 30 minutes)
7. Listen on `PORT` (default `5001`)

### 4.2 CORS and cookies

Allowed origins:
- `process.env.CLIENT_URL` (default `http://localhost:5173`)
- `http://localhost:5174`
- `https://sih2025-1-pjfk.onrender.com`
- Any `https://*.app.github.dev` (Codespaces)

Cookie-based JWT is used for authenticated calls.

### 4.3 Route mount map

Mounted prefixes:
- `/api/auth`
- `/api/drills`
- `/api/v1/drills` (same handler as drills)
- `/api/alerts`
- `/api/gamification`
- `/api/modules`
- `/api/admin`
- `/api/risk`
- `/api/ml`
- `/api/resilience`
- `/api/v1/reports`

---

## 5. Environment Variables

### 5.1 Backend required/minimum

From code:
- `SECRET_PRIVATE_KEY` (required by `backend/config/env.js`)
- `MONGODB_URL` (required for DB connection and seed)
- `PORT` (optional; default `5001`)
- `CLIENT_URL` (optional; default `http://localhost:5173`)
- `ML_SERVICE_URL` (optional; default `http://127.0.0.1:8000`)

### 5.2 Frontend

- `VITE_API_URL` (optional; defaults to `/api` in Axios instance)

### 5.3 Assistant module

Assistant node wrapper currently embeds a hardcoded password constant in `ML/ai_assistant/index.js`.

---

## 6. Authentication and Authorization

### 6.1 Authentication flow

Core middleware: `backend/middleware/auth.middleware.js`

Behavior:
- Reads JWT from `req.cookies.jwt`
- Verifies token with `SECRET_PRIVATE_KEY`
- Loads user document (excluding password) and attaches to `req.user`
- Returns:
	- `401` when missing/invalid token
	- `404` when token user no longer exists

### 6.2 Authorization middleware

- `isAdmin` middleware (`backend/middleware/isAdmin.js`)
	- Requires `req.user.role === "admin"`
- `authorizeRoles(...roles)` (`backend/middleware/authorizeRoles.js`)
	- Generic role gate, case-insensitive

### 6.3 Effective role model

Roles in `User` model:
- `student`
- `teacher`
- `admin`

Enforcement examples:
- Admin analytics endpoints: admin only
- Incident verification: teacher/admin
- Volunteer task create/update: teacher/admin
- Forecast and drill replay under resilience: teacher/admin
- Report case creation endpoint: student/teacher

---

## 7. Backend API: Detailed Route Catalog

## 7.1 Auth routes (`/api/auth`)

- `POST /signup`
- `POST /login`
- `POST /logout`
- `GET /check` (protected)
- `PUT /update-profile` (protected)

Controller: `backend/controllers/auth.controller.js`

---

## 7.2 Drill routes (`/api/drills`, `/api/v1/drills`)

- `GET /` (public)
- `POST /` (protected)
- `PUT /:drillId` (protected)
- `DELETE /:drillId` (protected)
- `PUT /:drillId/status` (protected)
- `GET /user/:userId` (protected)
- `POST /complete` (protected)

Controller: `backend/controllers/drill.controller.js`

---

## 7.3 Module routes (`/api/modules`)

- `GET /` (protected)
- `GET /:id` (protected)
- `PUT /:id/progress` (protected)
- `POST /:id/quiz` (protected)
- `POST /` (protected + admin)

Controller: `backend/controllers/module.controller.js`

---

## 7.4 Alerts routes (`/api/alerts`)

- `GET /` with filters: `region`, `severity`, `status`
- `GET /contacts` (auto-seeds default emergency contacts if empty)

Route logic directly in `backend/routes/alerts.routes.js`

---

## 7.5 Gamification routes (`/api/gamification`)

- `GET /` (all progress; public)
- `GET /:id/progress` (protected)
- `POST /:id/progress` (protected)

Controller: `backend/controllers/gamification.controller.js`

---

## 7.6 Risk routes (`/api/risk`)

- `POST /assess` (protected)
- `GET /history` (protected)
- `GET /region-map` (protected)
- `GET /drill-analytics` (protected)

Controller: `backend/controllers/risk.controller.js`

---

## 7.7 Resilience routes (`/api/resilience`)

Incidents:
- `POST /incidents` (protected)
- `GET /incidents` (protected)
- `PATCH /incidents/:id/verification` (protected + teacher/admin)

Alert channel configuration:
- `GET /alert-preferences` (protected)
- `PUT /alert-preferences` (protected)
- `GET /notifications/preview` (protected)

Evacuation:
- `POST /evacuation/recommendations` (protected)

Preparedness checklist:
- `GET /checklist` (protected)
- `POST /checklist/:key/toggle` (protected)

Resources and language:
- `GET /resources` (protected)
- `GET /translate` (protected)

Advanced analytics pages:
- `GET /forecast` (protected + teacher/admin)
- `GET /drill-replay/:id` (protected + teacher/admin)

Volunteer coordination:
- `GET /volunteer-tasks` (protected)
- `POST /volunteer-tasks` (protected + teacher/admin)
- `PATCH /volunteer-tasks/:id` (protected + teacher/admin)

Offline pack:
- `GET /offline-pack` (protected)

Controller: `backend/controllers/resilience.controller.js`

---

## 7.8 Admin routes (`/api/admin`)

- `GET /stats` (protected + admin)
- `GET /activity` (protected + admin)
- `GET /users` (protected + admin)
- `GET /progress-trends` (protected + admin)
- `GET /reports/generate` (protected + admin)

Controller: `backend/controllers/admin.controller.js`

---

## 7.9 ML routes (`/api/ml`)

- `POST /risk-prediction` (protected)
- `POST /preparedness-score` (protected)
- `POST /gamification-score` (protected)

Controller: `backend/controllers/ml.controller.js`

---

## 7.10 Reports routes (`/api/v1/reports`)

- `POST /create` (protected + student/teacher)
- `GET /all` (protected + admin)

Controller: `backend/controllers/report.controller.js`

---

## 8. Data Models: Deep Detail

## 8.1 User (`backend/models/user.model.js`)

Fields:
- `name` (required)
- `email` (required, unique)
- `password` (required; hashed in pre-save hook)
- `role` enum: `student|teacher|admin` (default `student`)
- `region` (default `India`)
- `phone`, `bio`, `institution`
- `stats` object:
	- `xp`, `level`, `badges`, `streak`, `drillsCompleted`

Notes:
- Password hash uses bcryptjs with salt rounds `10`.

## 8.2 Drill (`backend/models/drill.model.js`)

Domain:
- Drill metadata (title/type/difficulty/duration/region)
- Instructions
- Questions array for simulation
- Status and score
- Creator/user references depending on workflow

## 8.3 Module (`backend/models/module.model.js`)

Domain:
- Learning module metadata and publication flags
- Sectioned content (text/video/reading)
- Quiz object with question bank and time limit
- Regional association and enrollment metrics

## 8.4 Alert (`backend/models/alert.model.js`)

Domain:
- `type`, `severity`, `region`, `message`, `source`, `timestamp`, `status`

## 8.5 RiskAssessment (`backend/models/riskAssessment.model.js`)

Fields:
- `userId` (ref User)
- `location`: region/city/lat/lon
- `infrastructure`: buildingQuality/hospitalAccess/roadAccess/communicationAccess/shelterAvailability
- `hazardProfile`: earthquake/flood/cyclone/fire
- `overallRisk` and `preparednessScore`
- `recommendations` array

Index:
- region + createdAt for map/trend queries

## 8.6 Progress (`backend/models/progress.model.js`)

Aggregated gamification profile:
- xp, level, completedModules, perfectQuizzes, drillsCompleted, dailyStreak, earnedBadges, lastUpdated

## 8.7 UserProgress (`backend/models/user.progress.js`)

Per-user per-module progress tracking:
- userId, moduleId, status, lastSection, score
- timestamps enabled for trend analytics

## 8.8 IncidentReport (`backend/models/incidentReport.model.js`)

Advanced operational schema:
- Reporter, title, description, type, severity
- Location with geo coordinates
- Media URLs
- Reporter contact preference and anonymity
- Impact block (affected people, injuries, infrastructure damage, outage flags)
- Workflow status (`open|triaged|investigating|resolved|closed`)
- Operational block (source reliability, priority P1-P4, assigned responder, SLA, tags)
- Verification block (status, reviewer, notes, timestamp)
- Timeline event array for audit trail

## 8.9 AlertPreference (`backend/models/alertPreference.model.js`)

Per-user alert profile:
- channel booleans (inApp/email/sms/whatsapp/voice)
- quiet hours
- preferred language
- emergency override

## 8.10 PreparednessChecklist (`backend/models/preparednessChecklist.model.js`)

Per-user checklist with item-level completion and timestamps.

## 8.11 VolunteerTask (`backend/models/volunteerTask.model.js`)

Operational task schema:
- title, description, region, zone, skillRequired
- priority and status
- requiredVolunteers, estimatedHours
- geofence (lat/lon/radius)
- assignment and creator refs
- dueDate
- completionReport summary and verification

## 8.12 ResourceCenter (`backend/models/resourceCenter.model.js`)

Resource lookup entity:
- name, type, location fields
- capacity and occupancy
- contact and activity flag

## 8.13 EmergencyContact (`backend/models/emergencyContact.model.js`)

Emergency hotline registry used by alerts contact endpoint.

## 8.14 Report (`backend/models/report.model.js`)

Case report entity:
- disasterType, location, severity, notes, reporterId, timestamp

---

## 9. Backend Business Workflows

## 9.1 Registration/login

Registration creates:
- `User`
- initial `Progress`

Login sets JWT cookie used by all subsequent protected requests.

## 9.2 Modules and quizzes

- Module list endpoint seeds defaults when DB is empty.
- Progress updates track last visited section.
- Quiz submission computes score and updates progress records.

## 9.3 Drills

- Drills can be listed and completed with score capture.
- Status transitions available via status endpoint.

## 9.4 Risk calculation

Risk engine uses region baseline + infrastructure modifiers to compute:
- hazard profile
- overall risk
- preparedness score
- recommendation set

## 9.5 Incident operations

- Incident creation stores operational metadata and starts timeline.
- Verification endpoint enforces teacher/admin roles and advances workflow.

## 9.6 Volunteer operations

- Teacher/admin can create/update tasks.
- All authenticated users can list tasks (front-end further constrains route access for certain roles).

## 9.7 Admin analytics

Includes:
- snapshot stats
- recent activity
- users list
- time-series trends
- generated report payload (JSON/CSV)

---

## 10. Frontend Architecture

## 10.1 Core shell

Root app: `frontend/src/App.jsx`

Shell components:
- `Navbar`
- `Sidebar`
- `Footer`
- `AnimatedBackground`
- `Toaster`

Layout wrappers:
- `Layout` for authenticated routes
- `AuthLayout` for login/signup pages

## 10.2 Route protection

`ProtectedRoute` supports:
- authentication gate
- `adminOnly` shortcut
- `allowedRoles` list gate

Unauthorized access redirects to `/dashboard`; unauthenticated to `/login`.

## 10.3 Page map

Public:
- `/`, `/login`, `/signup`, `/chatbot`

Authenticated core:
- `/dashboard`, `/profile`
- `/modules`, `/modules/:id`
- `/drills`, `/alerts`, `/leaderboard`, `/gamification`
- `/assess`, `/geo-intelligence`, `/preparedness-score`

Resilience pages:
- `/resilience-center`
- `/resilience/incidents`
- `/resilience/alerts`
- `/resilience/evacuation`
- `/resilience/checklist`
- `/resilience/resources`
- `/resilience/language`
- `/resilience/offline-pack`

Role-restricted pages:
- `/resilience/drill-replay` (teacher/admin)
- `/resilience/forecast` (teacher/admin)
- `/resilience/volunteers` (teacher/admin)
- `/admin` (admin)
- `/drill-management` (admin)
- `/report-case` (student/teacher)

## 10.4 State management

Main auth store: `frontend/src/store/useAuthStore.js`

Responsibilities:
- auth bootstrap (`checkAuth`)
- signup/login/logout
- profile updates
- local stat merges

Axios config: `frontend/src/lib/axios.js`
- Base URL: `VITE_API_URL` or `/api`
- `withCredentials: true`

---

## 11. Frontend Feature Modules

## 11.1 AdminPanel analytics

Admin panel includes:
- Overview/User Management/Analytics/System tabs
- Snapshot cards (users, active users, completion, average score, module completion rate, report count)
- Trend charts (user growth, reports over time, completions, XP trend, level trend)
- Regional risk and drill analytics cards
- Export actions:
	- quick CSV
	- print-to-PDF
	- generated report CSV from backend
- Range selector (7d/30d/60d/90d) drives trend queries and generated report exports

## 11.2 Resilience Center and pages

Dedicated pages handle each operational area:
- incidents and verification
- alert channels
- evacuation route output
- checklist toggles
- drill replay lookup
- resource filtering
- language translation
- forecast
- volunteer task lifecycle
- offline emergency pack preview

---

## 12. Cron and External Data Sources

Jobs started in server bootstrap with `setInterval(..., 30 * 60 * 1000)`:
- NASA EONET events fetch and India geofence filtering
- IMD site scrape for cyclone warning text
- NDMA site scrape for flood banner text

Important implementation note:
- IMD/NDMA scraping uses hypothetical selectors and may break if page structure changes.

---

## 13. ML and Assistant Subsystems

## 13.1 Backend ML proxy

`backend/controllers/ml.controller.js` forwards requests to ML service and returns fallback payloads when unavailable.

Fallbacks exist for:
- risk prediction
- preparedness scoring
- gamification score

## 13.2 AI assistant mini app

`ML/ai_assistant/index.js`:
- Express app on port `3000`
- `POST /chat` executes python script using command-line args

Security caveat:
- Password is currently hardcoded in source.
- Shell-based interpolation of raw user message can create command-injection risk.

---

## 14. Seed Data and Demo Setup

Seed script: `backend/scripts/seedMockData.js`

Creates/updates:
- users across student/teacher/admin roles
- module catalog
- drills
- alerts
- resources
- volunteer tasks

Behavior:
- idempotent upsert style for many entities
- also creates base `Progress` rows for users
- commonly used demo password is printed by script output

---

## 15. Analytics and Reporting Details

## 15.1 Admin snapshot stats (`/api/admin/stats`)

Current payload includes:
- user counts and active users (7-day window)
- completed sessions and average score
- module and drill counts
- role counts
- total reports
- average XP and average level
- module completion rate
- systemUptime (static placeholder currently)

## 15.2 Progress trends (`/api/admin/progress-trends`)

Query:
- `days` in range 7..90

Returns series for:
- userGrowth
- reportTrend
- moduleCompletions
- avgXpTrend
- avgLevelTrend

## 15.3 Generated analytics report (`/api/admin/reports/generate`)

Query:
- `days` in range 7..90
- `format=json|csv`

CSV output includes summary metrics, top regions, and severity breakdown.

---

## 16. Security and Compliance Notes

Strengths:
- JWT-protected API routes
- role-based server-side access checks
- password hashing
- cookie-based session handling

Observed risks/areas to harden:
- Assistant module hardcoded secret and shell command invocation
- some routes intentionally public (`GET /api/drills`, `GET /api/gamification`) may expose data
- scraper selectors are brittle and not schema-validated
- no explicit rate limiting middleware observed
- no centralized request validation library (zod/joi/yup) observed on backend routes

---

## 17. Operational Playbook

## 17.1 Local startup

Backend:
```bash
cd backend
npm install
npm run seed:mock
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Optional assistant:
```bash
cd ML/ai_assistant
npm install
node index.js
```

## 17.2 Health checks

- Root backend ping: `GET /`
- Auth status: `GET /api/auth/check` (requires cookie)
- Admin stats: `GET /api/admin/stats` (admin cookie)

## 17.3 Troubleshooting

- 401 errors: verify JWT cookie is present and `SECRET_PRIVATE_KEY` matches token issuer
- DB issues: verify `MONGODB_URL` and network access
- Missing ML output: proxy falls back by design if ML service unreachable
- Empty alerts contacts: hitting `/api/alerts/contacts` seeds defaults automatically

---

## 18. Current Documentation Coverage Status

Project has multiple doc layers now:
- concise setup docs in root/backend/frontend READMEs
- this file provides deep implementation mapping

Gaps still worth adding in future:
- OpenAPI/Swagger spec for all endpoints
- Sequence diagrams for major workflows
- Formal data dictionary with field constraints and examples
- CI/testing strategy doc and release checklist

---

## 19. Quick RBAC Matrix

| Feature/Endpoint Group | Student | Teacher | Admin |
|---|---|---|---|
| Authenticated core pages | Yes | Yes | Yes |
| Admin panel routes | No | No | Yes |
| Incident verify endpoint | No | Yes | Yes |
| Volunteer create/update endpoints | No | Yes | Yes |
| Forecast + drill replay endpoints | No | Yes | Yes |
| Report case create endpoint | Yes | Yes | No |
| Report case list all endpoint | No | No | Yes |

---

## 20. Closing Summary

This repository implements a role-aware disaster management platform with:
- integrated preparedness training
- operational incident workflows
- risk intelligence
- volunteer coordination
- admin analytics and report generation

The system is already structured for real-world expansion, with clear separation between domain controllers, route-level RBAC, and dedicated frontend feature modules.

