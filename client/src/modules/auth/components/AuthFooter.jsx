import React from 'react';

const AuthFooter = ({ text, actionText, onAction }) => {
  return (
    <div className="mt-8 text-center text-sm text-gray-500 animate-fade-up" style={{ animationDelay: '0.4s' }}>
      {text}{' '}
      <button 
        onClick={onAction}
        className="font-semibold text-purple-600 hover:text-purple-700 transition-colors focus:outline-none focus:underline"
      >
        {actionText}
      </button>
    </div>
  );
};

export default AuthFooter;
