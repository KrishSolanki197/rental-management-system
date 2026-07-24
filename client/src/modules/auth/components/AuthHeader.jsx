import React from 'react';

const AuthHeader = ({ title, description }) => {
  return (
    <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-gray-500">
        {description}
      </p>
    </div>
  );
};

export default AuthHeader;
