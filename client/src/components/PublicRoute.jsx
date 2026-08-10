import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// We will eventually import useAuth() here to check if the user is logged in
// import { useAuth } from '../hooks/useAuth';

const PublicRoute = () => {
  // 1. Simulate authentication status (we will replace this with real Context later)
  // Let's pretend the user is NOT logged in right now.
  const isAuthenticated = false;

  // 2. Flow Explanation:
  // If the user IS logged in, they shouldn't see Public pages (like Login/Register).
  // So, we immediately Redirect (Navigate) them to the dashboard.
  if (isAuthenticated) {
    // 'replace' means they can't click the "Back" button to go back to Login
    return <Navigate to="/dashboard" replace />;
  }

  // 3. If they are NOT logged in, we let them see the public page.
  // <Outlet /> acts as a placeholder. It tells React Router:
  // "Render whatever child component is supposed to be here."
  // For example, if they went to /login, <Outlet /> becomes <LoginPage />
  return <Outlet />;
};

export default PublicRoute;
