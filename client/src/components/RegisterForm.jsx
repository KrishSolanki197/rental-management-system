import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from './Input';
import Button from './Button';
import Divider from './Divider';
import { useAuth } from '../hooks/useAuth';
import { useGoogleLogin } from '@react-oauth/google';

// Just a standard Google SVG Icon
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const RegisterForm = () => {
  // 1. Hook Initialization
  const { register, googleLogin } = useAuth(); // Reach into our global box for the register function
  const navigate = useNavigate(); // To send user to dashboard after success

  // 2. Local State for Form Data
  // This state holds exactly what our Node.js backend expects!
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 3. Local State for UI Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // To show backend errors (e.g. "Email taken")

  // 4. Handle Input Changes
  // Whenever the user types in an input, this function runs.
  const handleChange = (e) => {
    // e.target.id gives us the id of the input (e.g., 'email')
    // e.target.value gives us what the user typed
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // 5. Handle Form Submission
  const handleSubmit = async (e) => {
    // e.preventDefault() stops the page from refreshing when we click submit
    e.preventDefault(); 
    setErrorMsg(''); // Clear old errors

    // Basic Validation: Passwords must match
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return; // Stop the function here, do not call backend
    }

    setIsLoading(true);

    try {
      // Create the exact object the backend wants (we don't send confirmPassword)
      const submitData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      // Call our Context function, which calls the Service, which calls Axios!
      await register(submitData);
      
      // If we reach here, it was successful! Send them to Dashboard.
      navigate('/dashboard');

    } catch (error) {
      // If the backend threw an error (e.g. "Username taken"), we show it in the UI
      setErrorMsg(error);
    } finally {
      // Stop the spinning loader whether it succeeded or failed
      setIsLoading(false); 
    }
  };

  // 6. Handle Google Signup/Login
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setErrorMsg('');
      setIsLoading(true);
      try {
        await googleLogin(tokenResponse.access_token);
        navigate('/dashboard');
      } catch (error) {
        setErrorMsg(error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      setErrorMsg('Google login failed');
    }
  });

  return (
    <form onSubmit={handleSubmit} className="w-full animate-fade-up" style={{ animationDelay: '0.2s' }}>
      
      {/* Show Error Message if one exists */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            id="first_name" 
            type="text" 
            label="First Name" 
            placeholder="John" 
            required 
            value={formData.first_name}
            onChange={handleChange}
          />
          <Input 
            id="last_name" 
            type="text" 
            label="Last Name" 
            placeholder="Doe" 
            required 
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>

        <Input 
          id="username" 
          type="text" 
          label="Username" 
          placeholder="johndoe123" 
          required 
          value={formData.username}
          onChange={handleChange}
        />

        <Input 
          id="email" 
          type="email" 
          label="Email Address" 
          placeholder="name@company.com" 
          required 
          value={formData.email}
          onChange={handleChange}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input 
            id="password" 
            type="password" 
            label="Password" 
            placeholder="••••••••" 
            required 
            value={formData.password}
            onChange={handleChange}
          />
          <Input 
            id="confirmPassword" 
            type="password" 
            label="Confirm Password" 
            placeholder="••••••••" 
            required 
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Button type="submit" fullWidth isLoading={isLoading}>
          Create Account
        </Button>
        <Divider text="or continue with" />
        <Button variant="outline" fullWidth type="button" onClick={() => handleGoogleLogin()}>
          <GoogleIcon />
          Google
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;
