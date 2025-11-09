import React from 'react';
import { User } from '../../types';

interface HeaderProps {
  user: User;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onProfileClick }) => {
  return (
    <header className="flex-shrink-0 glass-card border-b border-emerald-500/20 px-4 sm:px-6 lg:px-8" style={{
      borderRadius: 0,
      background: 'linear-gradient(90deg, rgba(15, 25, 35, 0.8), rgba(10, 20, 30, 0.8))'
    }}>
      <div className="flex items-center justify-between h-16">
        <div className="text-lg font-medium text-gray-300">
          Welcome back, <span className="gradient-text font-bold text-xl" style={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 50%, #ff3366 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>{user.name}</span>
        </div>
        
        <button
          onClick={onProfileClick}
          className="flex items-center gap-3 px-4 py-2 rounded-full glass-card border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 hover:scale-105 group"
          title="View Profile"
        >
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/50 group-hover:border-emerald-400"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center text-xl font-bold text-emerald-400 border-2 border-emerald-500/50 group-hover:border-emerald-400">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
              {user.name}
            </div>
            <div className="text-xs text-gray-400">View Profile</div>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;