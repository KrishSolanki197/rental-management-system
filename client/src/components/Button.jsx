import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  isLoading = false,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 active:scale-[0.98]',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98]',
    outline: 'border border-gray-200 bg-white text-gray-700 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50 active:scale-[0.98]'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      type={type}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg 
          className="absolute left-1/2 top-1/2 -ml-2.5 -mt-2.5 h-5 w-5 animate-spin text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className={isLoading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
};

export default Button;
