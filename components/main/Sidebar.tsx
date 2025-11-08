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
      className={`flex items-center w-full p-3 my-1 rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-gradient-to-r from-teal-500/30 to-purple-600/30 text-white shadow-lg'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon(`w-6 h-6 mr-3 transition-colors ${isActive ? 'text-teal-300' : 'text-gray-500 group-hover:text-gray-300'}`)}
      <span className="font-medium">{label}</span>
    </button>
  );
};

const KindredLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-10 w-10">
        <defs>
            <linearGradient id="logo-aurora" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <path 
            fill="url(#logo-aurora)" 
            filter="url(#logo-glow)"
            d="M50,15 C25,20 20,40 30,60 C35,70 40,85 50,85 C60,85 65,70 70,60 C80,40 75,20 50,15 z" 
            transform="rotate(15 50 50)"
        >
            <animate 
                attributeName="d" 
                dur="8s" 
                repeatCount="indefinite"
                values="
                    M50,15 C25,20 20,40 30,60 C35,70 40,85 50,85 C60,85 65,70 70,60 C80,40 75,20 50,15 z;
                    M50,15 C30,25 25,45 35,60 C40,70 45,80 50,85 C55,80 60,70 65,60 C75,45 70,25 50,15 z;
                    M50,15 C25,20 20,40 30,60 C35,70 40,85 50,85 C60,85 65,70 70,60 C80,40 75,20 50,15 z"
            />
        </path>
    </svg>
);


const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="w-64 p-4 bg-black/20 backdrop-blur-lg border-r border-teal-500/10 flex flex-col">
      <div className="mb-8 flex items-center">
         <div className="p-1">
            <KindredLogo />
         </div>
        <h1 className="text-2xl font-bold ml-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-purple-400 to-fuchsia-400">
          KINDRED
        </h1>
      </div>
      <div className="flex-1">
        <NavItem
          view={View.Chat}
          currentView={currentView}
          setCurrentView={setCurrentView}
          icon={ICONS.chat}
          label="Kindred Chat"
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