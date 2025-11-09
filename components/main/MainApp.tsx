import React, { useState } from 'react';
import { User, View } from '../../types';
import Sidebar from './Sidebar';
import Header from './Header';
import KindredChat from '../features/KindredChat';
import Settings from '../features/Settings';
import MedicalManager from '../features/MedicalManager';
import { CreativeDashboard } from '../features/CreativeDashboard';
import Emergency from '../features/Emergency';

interface MainAppProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (updatedData: Partial<User>) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => { success: boolean, message: string };
  onUserOnboarded: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, onUpdateUser, onChangePassword, onUserOnboarded }) => {
  const [currentView, setCurrentView] = useState<View>(View.Chat);

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <CreativeDashboard />;
      case View.Medical:
        return <MedicalManager user={user} />;
      case View.Emergency:
        return <Emergency user={user} />;
      case View.Settings:
        return <Settings user={user} onUpdateUser={onUpdateUser} onChangePassword={onChangePassword} onLogout={onLogout} />;
      case View.Chat:
      default:
        return <KindredChat user={user} onUserOnboarded={onUserOnboarded} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col bg-black/20">
        <Header 
          user={user} 
          onProfileClick={() => setCurrentView(View.Settings)} 
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default MainApp;