import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  // We use useNavigate from React Router to programmatically change pages.
  const navigate = useNavigate();

  // Local state to keep track of loading progress visually.
  const [progress, setProgress] = useState(0);

  // useEffect is a hook that runs after the component renders.
  // The empty array [] means it runs ONLY ONCE when the screen first appears.
  useEffect(() => {
    // 1. We create an interval to update the progress bar visually.
    const progressInterval = setInterval(() => {
      // Increase progress by a small amount every 50ms to reach 100% in 5s.
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // 100% / 100 steps (5000ms / 50ms) = 1% per step
        return prev + 1;
      });
    }, 50);

    // 2. We use setTimeout to wait exactly 5000 milliseconds (5 seconds).
    const timer = setTimeout(() => {
      // 3. After 5 seconds, we navigate to the Dashboard (or Login if not authenticated later)
      // For now, we will just send them to the auth page as the default.
      navigate('/auth');
    }, 5000);

    // 4. Cleanup function: This runs if the user leaves the page before 5 seconds
    // or when the component is removed from the screen.
    // It prevents memory leaks and stopping the timers from running in the background.
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    // This is a full-screen white background centered layout using Tailwind CSS.
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      
      {/* 
        We wrap everything in a div that fades in. 
        animate-pulse adds a simple fading loading animation to the whole block.
      */}
      <div className="flex flex-col items-center animate-pulse">
        
        {/* Placeholder for Company Logo */}
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-lg mb-6 text-white text-3xl font-bold">
          RMS
        </div>

        {/* Company Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Rental Management
        </h1>
        <p className="text-gray-500 text-sm mb-8 tracking-widest uppercase">
          System Loading
        </p>

        {/* Progress Bar Container */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* 
            The progress bar width is controlled by our React state `progress`.
            We use inline styling for width because it changes dynamically.
            transition-all makes the width increase smoothly.
          */}
          <div 
            className="h-full bg-blue-600 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

      </div>

    </div>
  );
};

export default SplashScreen;
