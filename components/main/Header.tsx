import React from 'react';

interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  return (
    <header className="flex-shrink-0 bg-black/20 backdrop-blur-sm border-b border-teal-500/10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-start h-16">
        <div className="text-lg font-medium text-gray-300">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-fuchsia-400 font-semibold">{userName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;