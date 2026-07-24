import React from 'react';
import Logo from '../../../components/Logo';

const AuthImageSection = () => {
  return (
    <div className="hidden lg:flex w-1/2 bg-gray-50 flex-col justify-between p-12 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-purple-300/30 blur-3xl" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-300/20 blur-3xl" />
      
      <div className="relative z-10 animate-fade-in">
        <Logo />
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-md">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Manage your properties with elegant simplicity.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Everything you need to streamline your rental business, from tenant screening to maintenance requests, all in one premium experience.
          </p>
        </div>
      </div>
      
      {/* Abstract Illustration representation using CSS */}
      <div className="absolute right-0 bottom-0 w-2/3 h-2/3 opacity-80 pointer-events-none transform translate-x-12 translate-y-12 animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <div className="w-full h-full glass-panel rounded-tl-3xl shadow-2xl relative overflow-hidden flex items-end">
          <div className="w-full h-3/4 bg-gradient-to-t from-gray-100 to-white/40 border-t border-white/60 p-8 flex gap-4 items-end">
             <div className="w-1/3 bg-purple-200/50 rounded-t-lg h-3/4" />
             <div className="w-1/3 bg-purple-300/60 rounded-t-lg h-full" />
             <div className="w-1/3 bg-purple-100/40 rounded-t-lg h-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthImageSection;
