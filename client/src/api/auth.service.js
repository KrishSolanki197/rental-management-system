import axiosInstance from './axios';
import { ENDPOINTS } from './endpoints';

// ==========================================
// AUTHENTICATION SERVICE
// ==========================================

// What is a Service Layer?
// A Service Layer is a dedicated file that handles ALL communication with the backend.
// Why do we use it?
// If we put API calls directly inside our UI Components (like the Register button),
// our components become messy, huge, and hard to read. 
// A service keeps our React components clean and focused ONLY on UI!

export const authService = {
  // 1. REGISTER FUNCTION
  register: async (userData) => {
    try {
      // We use our axiosInstance to send a POST request to the backend.
      // ENDPOINTS.AUTH.REGISTER = '/auth/register'
      // userData = { username, email, password, first_name, last_name }
      const response = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, userData);
      
      // Axios automatically stores the backend's JSON response in 'response.data'
      return response.data;
    } catch (error) {
      // If the backend sends an error (like "Email already exists" or Zod validation errors)
      const data = error.response?.data;
      
      // 1. Check if there are specific Zod validation field errors
      if (data?.errors && typeof data.errors === 'object') {
        // Extract the first error message from the first field that failed
        const firstField = Object.keys(data.errors)[0];
        const firstErrorMsg = data.errors[firstField][0];
        throw `${firstField}: ${firstErrorMsg}`;
      }
      
      // 2. Otherwise throw the general message
      throw data?.message || 'Failed to register account';
    }
  },

  // 2. LOGIN FUNCTION
  login: async (credentials) => {
    try {
      // credentials = { email, password }
      const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Invalid email or password';
    }
  },

  // 3. FORGOT PASSWORD FUNCTION
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to send reset link';
    }
  },

  // 4. GOOGLE LOGIN FUNCTION
  googleLogin: async (token) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.GOOGLE_LOGIN, { token });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to authenticate with Google';
    }
  },

  // 5. RESET PASSWORD FUNCTION
  resetPassword: async (data) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to reset password';
    }
  }
};
