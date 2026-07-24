import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  id, 
  error, 
  className = '', 
  icon,
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          ref={ref}
          className={`
            block w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm text-gray-900 
            transition-all duration-200 placeholder:text-gray-400
            focus:border-purple-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-600/10
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200'}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
