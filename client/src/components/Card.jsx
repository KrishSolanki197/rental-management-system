import React from 'react';

const Card = ({ children, className = '', padding = 'p-6' }) => {
  return (
    <div className={`rounded-2xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100 ${padding} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
