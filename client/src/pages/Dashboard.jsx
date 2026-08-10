import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen bg-[#fcfcfc] font-sans selection:bg-purple-200 selection:text-purple-900">
      
      {/* Premium Sidebar */}
      <aside className="w-[280px] bg-[#fcfcfc] border-r border-gray-100 hidden md:flex flex-col relative z-20">
        <div className="h-[72px] flex items-center px-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gray-900 to-gray-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm tracking-tighter">R</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">RentalApp</span>
          </div>
        </div>
        
        <div className="p-4 flex-1">
          <nav className="space-y-1">
            <a href="#" className="block px-4 py-3 bg-white text-gray-900 rounded-2xl text-[14px] font-semibold shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] border border-gray-100/50 transition-all">
              Overview
            </a>
            <a href="#" className="block px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-2xl text-[14px] font-medium transition-all">
              Properties
            </a>
            <a href="#" className="block px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-2xl text-[14px] font-medium transition-all">
              Tenants
            </a>
            <a href="#" className="block px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-2xl text-[14px] font-medium transition-all">
              Settings
            </a>
          </nav>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100/80 text-center">
            <div className="w-12 h-12 bg-white rounded-full mx-auto mb-3 shadow-sm flex items-center justify-center text-xl">
              🚀
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Upgrade to Pro</h4>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">Get unlimited properties and premium support.</p>
            <button className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative min-h-screen overflow-hidden">
        
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4" />

        {/* Glass Header */}
        <header className="h-[72px] sticky top-0 z-10 flex items-center justify-between px-8 backdrop-blur-xl bg-white/60 border-b border-gray-100/50">
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Overview</h1>
          
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            <div className="h-6 w-px bg-gray-200" />
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[13px] font-semibold text-gray-900 leading-none mb-0.5">
                  {user?.username || (user?.first_name ? `${user.first_name} ${user.last_name}` : 'User')}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[11px] font-medium text-gray-500 hover:text-red-500 transition-colors leading-none"
                >
                  Sign Out
                </button>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-100 to-purple-50 border border-purple-100/50 shadow-sm flex items-center justify-center text-sm font-bold text-purple-700 cursor-pointer hover:shadow-md transition-shadow">
                {(user?.username || user?.first_name || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-auto p-8 relative z-0">
          <div className="max-w-6xl mx-auto w-full animate-fade-up" style={{ animationDelay: '0.1s' }}>
            
            <div className="mb-10">
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
                Good morning, {user?.first_name || user?.username || 'there'}.
              </h2>
              <p className="text-[15px] text-gray-500 font-medium">
                Here's what's happening with your properties today.
              </p>
            </div>
            
            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { title: 'Total Properties', value: '12', trend: '+2 this month', icon: '🏢' },
                { title: 'Active Tenants', value: '48', trend: '98% occupancy', icon: '👥' },
                { title: 'Monthly Revenue', value: '$24,500', trend: '+12.5% vs last month', icon: '📈' }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_2px_12px_0_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <h3 className="text-[14px] font-medium text-gray-500 mb-1">{stat.title}</h3>
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-semibold text-gray-900 tracking-tight">{stat.value}</p>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-[11px] font-semibold text-green-700">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    {stat.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State / Placeholder Area */}
            <div className="bg-white/50 backdrop-blur-md rounded-[32px] border border-gray-100/50 border-dashed p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
                You're all caught up. New maintenance requests, payments, and tenant messages will appear here.
              </p>
              <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:border-gray-300 hover:shadow-sm transition-all shadow-[0_2px_4px_0_rgba(0,0,0,0.02)]">
                Add New Property
              </button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
