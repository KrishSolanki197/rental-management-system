// ==========================================
// API ENDPOINTS CONFIGURATION
// ==========================================

// 1. BASE URL
// This is the root address of your backend server.
// Since your Node.js backend is running on port 5000, we set it here.
// NOTE: We use 127.0.0.1 instead of localhost to match the backend CORS exactly!
export const API_BASE_URL = 'http://127.0.0.1:5000';

// 2. ENDPOINT ROUTES
// We store all our backend paths here as a JavaScript object.
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgetpassword',
    RESET_PASSWORD: '/auth/resetpassword',
    GOOGLE_LOGIN: '/auth/google',
  },
  // Later we can add more like:
  // USERS: { GET_ALL: '/users', GET_ONE: '/users/:id' }
};
