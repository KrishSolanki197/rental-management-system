import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../api/auth.service';

// 1. CREATE THE CONTEXT
// Think of this as creating an empty global box where we will store User details.
export const AuthContext = createContext();

// 2. CREATE THE PROVIDER
// The Provider is a component that wraps around your entire App.
// It holds the actual state (user data) and provides it to any child component that asks for it.
export const AuthProvider = ({ children }) => {
  // State 1: Store the user's data (null if not logged in)
  const [user, setUser] = useState(null);
  
  // State 2: Store whether we are currently loading/checking authentication
  const [loading, setLoading] = useState(true);

  // This will run ONCE when the app starts, to check if the user is already logged in (e.g. from cookies)
  // We will fully implement this checking logic later, for now we just stop loading after 1 second.
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        setLoading(true);
        // Here we would normally ping the backend to say "Hey, is my cookie still valid?"
        // const currentUser = await authService.getCurrentUser();
        // setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  // Action: Register
  const register = async (userData) => {
    // 1. Call the service we created in Step 2
    const response = await authService.register(userData);
    
    // 2. The backend sends back the user object inside the "data" key
    if (response.data) {
      setUser(response.data);
    }
    return response;
  };

  // Action: Login
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    // 3. Save the logged-in user in global state
    if (response.data) {
      setUser(response.data);
    }
    return response;
  };

  // Action: Google Login
  const googleLogin = async (token) => {
    const response = await authService.googleLogin(token);
    if (response.data) {
      setUser(response.data);
    }
    return response;
  };

  // Action: Forgot Password
  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  // Action: Reset Password
  const resetPassword = async (data) => {
    return await authService.resetPassword(data);
  };

  // Action: Logout
  const logout = async () => {
    // Normally you would also call an authService.logout() to clear cookies on backend
    setUser(null);
  };

  // 3. RETURN THE PROVIDER
  // We are providing { user, loading, login, register, logout, googleLogin, forgotPassword, resetPassword } to ALL children!
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, forgotPassword, resetPassword }}>
      {/* 'children' represents all the components inside this wrapper (like <App />) */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
