import React from 'react';

interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  return (
    <header className="flex-shrink-0 glass-card border-b border-emerald-500/20 px-4 sm:px-6 lg:px-8" style={{
      borderRadius: 0,
      background: 'linear-gradient(90deg, rgba(15, 25, 35, 0.8), rgba(10, 20, 30, 0.8))'
    }}>
      <div className="flex items-center justify-start h-16">
        <div className="text-lg font-medium text-gray-300">
          Welcome back, <span className="gradient-text font-bold text-xl" style={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 50%, #ff3366 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>{userName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;