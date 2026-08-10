import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';
import AuthImageSection from '../components/AuthImageSection';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from router state if they came from forgot password page
  const initialEmail = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    if (formData.otp.length !== 6) {
      setErrorMsg("OTP must be exactly 6 digits.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      setSuccessMsg('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
      
    } catch (error) {
      setErrorMsg(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AuthImageSection />

      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <Logo />
        </div>

        <div className="w-full max-w-md mx-auto">
          <AuthHeader 
            title="Create new password" 
            description="Enter the 6-digit code sent to your email and your new password." 
          />
          
          <form onSubmit={handleSubmit} className="w-full animate-fade-up mt-6" style={{ animationDelay: '0.2s' }}>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm border border-red-200">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm border border-green-200">
                {successMsg}
              </div>
            )}

            <div className="space-y-4">
              <Input 
                id="email" 
                type="email" 
                label="Email Address" 
                required 
                value={formData.email}
                onChange={handleChange}
                disabled={!!initialEmail}
              />

              <Input 
                id="otp" 
                type="text" 
                label="6-Digit OTP Code" 
                placeholder="123456" 
                required 
                value={formData.otp}
                onChange={handleChange}
                maxLength="6"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  id="newPassword" 
                  type="password" 
                  label="New Password" 
                  placeholder="••••••••" 
                  required 
                  value={formData.newPassword}
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

            <div className="mt-8">
              <Button type="submit" fullWidth isLoading={isLoading}>
                Reset Password
              </Button>
            </div>
          </form>

          <AuthFooter 
            text="Remember your password?" 
            actionText="Sign In" 
            onAction={() => navigate('/auth')} 
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
