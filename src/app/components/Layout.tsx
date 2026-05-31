import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, Receipt, User } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'داشبورد' },
    { path: '/transactions', icon: Receipt, label: 'سوابق' },
    { path: '/profile', icon: User, label: 'پروفایل' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-2xl mx-auto">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                    isActive
                      ? 'text-[#3B82F6]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-[#3B82F6]' : ''}`} />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}