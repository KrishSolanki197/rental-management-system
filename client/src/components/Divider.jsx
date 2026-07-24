import React from 'react';

const Divider = ({ text, className = '' }) => {
  return (
    <div className={`relative flex items-center py-5 ${className}`}>
      <div className="flex-grow border-t border-gray-200"></div>
      {text && (
        <span className="flex-shrink-0 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
          {text}
        </span>
      )}
      <div className="flex-grow border-t border-gray-200"></div>
    </div>
  );
};

export default Divider;
