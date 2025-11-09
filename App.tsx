import React from 'react';
import AuthScreen from './components/auth/AuthScreen';
import MainApp from './components/main/MainApp';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, isLoading, logout, updateUser, refreshUser } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020413] bg-gradient-to-br from-[#020413] via-[#0b021d] to-[#190f2b] text-white font-sans flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="circuit-logo">
            <img 
              src="/kindred-logo.jpg" 
              alt="Kindred AI" 
              className="h-20 w-20 rounded-xl object-cover mx-auto animate-pulse"
            />
          </div>
          <p className="text-xl text-teal-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020413] bg-gradient-to-br from-[#020413] via-[#0b021d] to-[#190f2b] text-white font-sans">
      {user ? (
        <MainApp 
          user={user} 
          onLogout={logout} 
          onUpdateUser={updateUser}
        />
      ) : (
        <AuthScreen onAuthSuccess={refreshUser} />
      )}
    </div>
  );
};

export default App;