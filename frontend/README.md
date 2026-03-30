# Frontend - Disaster Management Platform

React + Vite frontend for preparedness learning, operational resilience tools, and role-based dashboards.

## Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Zustand + context providers

## Start

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173 by default.

## Scripts

- npm run dev
- npm run build
- npm run preview
- npm run lint

## Role-Based UX

### student
- dashboard, modules, drills, alerts, gamification
- incident reporting and report case creation
- core resilience pages

### teacher
- all student screens
- incident verification workflows
- volunteer task operations
- advanced resilience pages (forecast, drill replay)

### admin
- all teacher screens
- admin panel and drill management

Route-level guards are implemented in App route protection and aligned with backend permissions.

## Core Pages

- Home, Login, Signup
- Dashboard, Profile
- Modules, Module Details
- Drills, Drill Management
- Alerts, Gamification, Leaderboard
- Risk Assessment, Geo Intelligence, Preparedness Score
- Admin Panel
- Report Case

## Resilience Center Modules

- Incident Reporting
- Alert Channels
- Evacuation Routes
- Preparedness Checklist
- Drill Replay (restricted)
- Resource Locator
- Multi-Language Assistant
- Early Warning Forecast (restricted)
- Volunteer Coordination (restricted)
- Offline Emergency Pack

## API Client

- Axios instance: src/lib/axios.js
- Base URL: VITE_API_URL or /api
- Credentials: cookie-based auth enabled

## Layout

```text
frontend/
  src/
    components/
    context/
    lib/
    pages/
      resilience/
    store/
    App.jsx
```

## Notes

- If API host changes, set VITE_API_URL in frontend environment.
- Sidebar visibility is role-aware for restricted modules.
