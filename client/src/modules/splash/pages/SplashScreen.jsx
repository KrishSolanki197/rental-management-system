import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../components/Logo';
import Loader from '../../../components/Loader';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to auth screen after 3 seconds
    const timer = setTimeout(() => {
      navigate('/auth', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white relative overflow-hidden">
      {/* Elegant background lighting effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-50 rounded-full blur-[100px] opacity-70 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with smooth scale and fade animation */}
        <div className="animate-scale-in mb-8" style={{ animationDuration: '1.2s' }}>
          <Logo className="scale-150" />
        </div>
        
        {/* Subtitle with fade up animation */}
        <p className="text-gray-500 font-medium tracking-wide animate-fade-up text-center mb-16" style={{ animationDelay: '0.4s', opacity: 0 }}>
          Enterprise Management System
        </p>
        
        {/* Loader with delayed fade in */}
        <div className="animate-fade-in" style={{ animationDelay: '0.8s', opacity: 0 }}>
          <Loader size="lg" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
