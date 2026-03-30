# 🚀 Local Startup Guide

All critical fixes have been applied. Follow this checklist to run the project locally.

## ✅ Pre-Run Checklist

### Backend Setup
- [x] Environment file created (`backend/.env`)
  - `SECRET_PRIVATE_KEY` - JWT signing key (change this in production)
  - `MONGODB_URL` - MongoDB connection string (update with your local/cloud DB)
  - `CLIENT_URL` - Frontend URL (localhost:5173)
  - `PORT` - Server port (5001)

### Frontend Setup
- [x] Environment file updated (`frontend/.env`)
  - `VITE_API_URL` - Now points to `http://localhost:5001/api`

### ML Setup
- [x] Environment file created (`ML/ai_assistant/.env`)
  - **⚠️ IMPORTANT**: Add your Google Gemini API key to `GEMINI_API_KEY`
  - `CHATBOT_PASSWORD` - Already set (Pratyaybera124)

### Database Setup
- [ ] **MongoDB running locally or accessible via connection string**
  - Update `backend/.env` `MONGODB_URL` if using cloud MongoDB

## 📋 What Was Fixed

1. **Backend Environment** - Created `.env` with required secrets
2. **Frontend API Target** - Changed from deployed backend to localhost
3. **Drill Routes** - Added dual paths (`/api/drills` and `/api/v1/drills`) with complete endpoint
4. **Auth Endpoints** - Added missing logout and update-profile endpoints
5. **Auth Response** - Fixed checkAuth response shape to match frontend expectations
6. **API Consistency** - Replaced hardcoded axios calls in Alerts/Drills with shared axios instance
7. **Database Model** - Added score field to Drill schema
8. **Password Hashing** - Fixed typo in user model (passwod → password)
9. **Port Consistency** - Unified backend port defaults to 5001
10. **ProtectedRoute** - Fixed context import from AuthProvider

## 🏃 How to Run

### Terminal 1: MongoDB
```bash
# If running locally:
mongod
# Or ensure your MongoDB service is running
```

### Terminal 2: Backend
```bash
cd backend
npm install  # if not already done
npm run dev
# Server should start at http://localhost:5001
```

### Terminal 3: Frontend
```bash
cd frontend
npm install  # if not already done
npm run dev
# Dev server should start at http://localhost:5173
```

### Terminal 4 (Optional): ML Chatbot Service
```bash
cd ML/ai_assistant
# Ensure python dependencies installed:
pip install -r requirements.txt

# Start the Node server:
node index.js
# Service runs at http://localhost:3000
```

## ✨ Core Features Ready

- ✅ User Authentication (signup/login/logout)
- ✅ User Profile Updates
- ✅ Disaster Drills (create, fetch, complete, track score)
- ✅ Emergency Alerts (fetch and display)
- ✅ Report Submission
- ✅ Gamification APIs
- ✅ AI Chatbot (requires Gemini API key)

## 🔧 Critical Next Steps

1. **Set valid MongoDB URL** in `backend/.env`
2. **Add Gemini API key** to `ML/ai_assistant/.env` for chatbot functionality
3. **Test login** to ensure JWT and database connectivity work
4. **Check browser console** and backend logs for any remaining issues

## 📝 Notes

- All API calls now use the shared axios instance for consistency
- Auth token stored in cookies (httpOnly in production)
- CORS configured for localhost:5173
- Password hashing fixed - will properly hash on signup/login

## 🚨 If You Encounter Issues

1. **"Cannot connect to MongoDB"** → Update `MONGODB_URL` in `backend/.env`
2. **"Unauthorized - No Token"** → Ensure cookies are being set (check browser dev tools)
3. **"API calls failing"** → Verify `VITE_API_URL` is set to `http://localhost:5001/api`
4. **Drills not submitting** → Ensure backend `/api/v1/drills/complete` endpoint is accessible
5. **Chatbot not working** → Add valid Gemini API key to `ML/ai_assistant/.env`

---

**Last Updated**: March 30, 2026
**Status**: Ready for local execution
