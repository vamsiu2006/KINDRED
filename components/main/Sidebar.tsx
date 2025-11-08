import React from 'react';
import { View } from '../../types';
import { ICONS } from '../../constants';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  view: View;
  currentView: View;
  setCurrentView: (view: View) => void;
  icon: (className: string) => React.ReactNode;
  label: string;
}> = ({ view, currentView, setCurrentView, icon, label }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center w-full p-3 my-1 rounded-xl transition-all duration-300 group ${
        isActive
          ? 'glass-card bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-red-500/10 text-white shadow-lg border-emerald-500/40'
          : 'text-gray-400 hover:bg-white/5 hover:text-emerald-300 hover:border-emerald-500/20 border border-transparent'
      }`}
    >
      <div className={isActive ? 'icon-glow' : ''}>
        {icon(`w-6 h-6 mr-3 transition-all duration-300 ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-400'}`)}
      </div>
      <span className={`font-medium transition-all duration-300 ${isActive ? 'gradient-text' : ''}`}>{label}</span>
    </button>
  );
};

const KindredLogo = () => (
    <div className="circuit-logo">
      <img 
        src="/kindred-logo.jpg" 
        alt="Kindred AI" 
        className="h-12 w-12 rounded-lg object-cover"
      />
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="w-64 p-4 glass-card border-r border-emerald-500/20 flex flex-col" style={{
      borderRadius: 0,
      background: 'linear-gradient(180deg, rgba(15, 25, 35, 0.95) 0%, rgba(10, 20, 30, 0.95) 100%)'
    }}>
      <div className="mb-8 flex items-center floating">
         <div className="p-1">
            <KindredLogo />
         </div>
        <h1 className="text-2xl font-bold ml-3 gradient-text" style={{
          background: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 50%, #ff3366 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          KINDRED
        </h1>
      </div>
      <div className="flex-1 space-y-2">
        <NavItem
          view={View.Chat}
          currentView={currentView}
          setCurrentView={setCurrentView}
          icon={ICONS.chat}
          label="Kindred Chat"
        />
        <NavItem
          view={View.Dashboard}
          currentView={currentView}
          setCurrentView={setCurrentView}
          icon={ICONS.dashboard}
          label="Dashboard"
        />
        <NavItem
          view={View.Medical}
          currentView={currentView}
          setCurrentView={setCurrentView}
          icon={ICONS.medical}
          label="Medical Manager"
        />
        <NavItem
          view={View.Emergency}
          currentView={currentView}
          setCurrentView={setCurrentView}
          icon={ICONS.emergency}
          label="Emergency"
        />
      </div>
       <div>
        <NavItem
          view={View.Settings}
          currentView={currentView}
          setCurrentView={setCurrentView}
          icon={ICONS.settings}
          label="Settings"
        />
      </div>
    </nav>
  );
};

export default Sidebar;