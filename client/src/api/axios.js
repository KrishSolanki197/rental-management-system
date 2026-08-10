import axios from 'axios';
import { API_BASE_URL } from './endpoints';

// ==========================================
// AXIOS CONFIGURATION
// ==========================================

// What is Axios? 
// It is a library that helps our React frontend talk to our Node.js backend.
// It is like a postman delivering letters (data) between two houses.

// 1. Create a custom Axios Instance
const axiosInstance = axios.create({
  // Base URL: We don't want to type 'http://localhost:5000' every time we make a request.
  baseURL: API_BASE_URL,
  
  // withCredentials: TRUE
  // WHY? Your backend uses Cookie Authentication. 
  // If this is false, the browser will block the backend from saving login cookies!
  withCredentials: true,
  
  // Headers: Tells the backend "Hey, I am sending you JSON data!"
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
