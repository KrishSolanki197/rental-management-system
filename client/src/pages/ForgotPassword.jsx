import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';
import AuthImageSection from '../components/AuthImageSection';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccessMsg('OTP sent successfully!');
      
      // Navigate to reset password page after a brief delay
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
      
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
            title="Reset your password" 
            description="Enter your email to receive a 6-digit OTP code" 
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

            <div className="space-y-5">
              <Input 
                id="email" 
                type="email" 
                label="Email Address" 
                placeholder="name@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mt-8">
              <Button type="submit" fullWidth isLoading={isLoading}>
                Send OTP
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

export default ForgotPassword;
