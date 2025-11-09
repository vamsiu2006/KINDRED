import React from 'react';
import AuthScreen from './components/auth/AuthScreen';
import MainApp from './components/main/MainApp';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, login, signup, logout, updateUser, changePassword, signInWithGoogle, markUserAsOnboarded } = useAuth();

  return (
    <div className="min-h-screen bg-[#020413] bg-gradient-to-br from-[#020413] via-[#0b021d] to-[#190f2b] text-white font-sans">
      {user ? (
        <MainApp 
          user={user} 
          onLogout={logout} 
          onUpdateUser={updateUser} 
          onChangePassword={changePassword}
          onUserOnboarded={markUserAsOnboarded}
        />
      ) : (
        <AuthScreen onLogin={login} onSignup={signup} onSignInWithGoogle={signInWithGoogle} />
      )}
    </div>
  );
};

export default App;