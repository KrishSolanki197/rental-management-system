import React, { useState } from 'react';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';
import AuthImageSection from '../components/AuthImageSection';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import Logo from '../../../components/Logo';

const AuthPage = () => {
  const [view, setView] = useState('login'); // 'login' or 'register'

  const isLogin = view === 'login';

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side Image Section (Desktop only) */}
      <AuthImageSection />

      {/* Right side Auth Forms */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Logo />
        </div>

        <div className="w-full max-w-md mx-auto">
          {isLogin ? (
            <>
              <AuthHeader 
                title="Welcome back" 
                description="Sign in to your account to continue" 
              />
              <LoginForm />
              <AuthFooter 
                text="Don't have an account?" 
                actionText="Create Account" 
                onAction={() => setView('register')} 
              />
            </>
          ) : (
            <>
              <AuthHeader 
                title="Create an account" 
                description="Start managing your properties today" 
              />
              <RegisterForm />
              <AuthFooter 
                text="Already have an account?" 
                actionText="Sign In" 
                onAction={() => setView('login')} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
