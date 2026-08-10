import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// ==========================================
// CUSTOM HOOK: useAuth
// ==========================================

// What is a Custom Hook?
// It's a reusable function we create that uses standard React Hooks (like useContext or useState) inside it.

export const useAuth = () => {
  // We use the built-in React hook 'useContext' to access the global box we created.
  const context = useContext(AuthContext);

  // Error Checking
  // If someone tries to use useAuth() OUTSIDE of the AuthProvider, context will be null/undefined.
  // We throw a clear error to prevent confusing bugs later!
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // We return the global state { user, loading, login, register, logout }
  return context;
};
