import axios from "axios"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// API endpoints
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  signup: (data) => api.post("/auth/signup", data),
  logout: () => api.post("/auth/logout"),
}

export const modulesAPI = {
  getAll: () => api.get("/modules"),
  getById: (id) => api.get(`/modules/${id}`),
  updateProgress: (id, data) => api.put(`/modules/${id}/progress`, data),
  submitQuiz: (id, data) => api.post(`/modules/${id}/quiz`, data),
}

export const drillsAPI = {
  getAll: () => api.get("/drills"),
  getById: (id) => api.get(`/drills/${id}`),
  participate: (id) => api.post(`/drills/${id}/participate`),
}

 export const gamificationAPI = {
  getLeaderboard: () => api.get('/gamification'),
  getProgress: (id) => api.get(`/gamification/${id}/progress`),
 };

export const alertsAPI = {
  getAll: () => api.get("/alerts"),
  getContacts: () => api.get("/emergency-contacts"),
}

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getActivity: () => api.get("/admin/activity"),
  getUsers: () => api.get("/admin/users"),
}

export default api;
