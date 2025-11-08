import React, { useState, FormEvent, useEffect } from 'react';
import { User } from '../../types';
import { SUPPORTED_LANGUAGES, SUPPORTED_VOICES, ICONS } from '../../constants';
import LoadingSpinner from '../ui/LoadingSpinner';

interface SettingsProps {
  user: User;
  onUpdateUser: (updatedData: Partial<User>) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => { success: boolean, message: string };
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onChangePassword, onLogout }) => {
  // Profile state
  const [name, setName] = useState(user.name);
  const [languageCode, setLanguageCode] = useState(user.languageCode);
  const [voiceName, setVoiceName] = useState(user.voiceName);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Data Management state
  const [clearSuccess, setClearSuccess] = useState('');

  useEffect(() => {
      setName(user.name);
      setLanguageCode(user.languageCode);
      setVoiceName(user.voiceName);
  }, [user]);
  
   useEffect(() => {
    if (profileSuccess) {
      const timer = setTimeout(() => setProfileSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess]);

  useEffect(() => {
    if (passwordSuccess) {
      const timer = setTimeout(() => setPasswordSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess]);
  
   useEffect(() => {
    if (clearSuccess) {
      const timer = setTimeout(() => setClearSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [clearSuccess]);

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setProfileError('Please enter a name with at least 2 characters.');
      return;
    }
    setProfileError('');
    setProfileSuccess('');
    setIsSavingProfile(true);

    setTimeout(() => {
      onUpdateUser({ name, languageCode, voiceName });
      setIsSavingProfile(false);
      setProfileSuccess('Your profile has been updated successfully!');
    }, 500);
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      const result = onChangePassword(currentPassword, newPassword);
      if (result.success) {
        setPasswordSuccess(result.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.message);
      }
      setIsSavingPassword(false);
    }, 500);
  };

  const handleClearHistory = () => {
    setClearSuccess('');
    const isConfirmed = window.confirm(
        "Are you sure you want to permanently delete your chat history? This action cannot be undone."
    );
    if (isConfirmed) {
        try {
            const chatHistoryKey = `kindred_chat_history_${user.name}`;
            localStorage.removeItem(chatHistoryKey);
            setClearSuccess("Chat history has been successfully cleared. The chat will be reset when you return to it.");
        } catch (error) {
            console.error("Failed to clear chat history:", error);
            // In a real app, you might show an error toast here
        }
    }
  };
  
  const inputClasses = "appearance-none rounded-lg relative block w-full px-4 py-3 border border-teal-500/20 bg-black/20 placeholder-gray-500 text-white focus:outline-none focus:ring-0 transition-all duration-300";
  const buttonClasses = "w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-white font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl";


  return (
    <div className="max-w-2xl mx-auto space-y-12">
      {/* Profile Settings */}
      <div className="p-4 sm:p-6 lg:p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl shadow-black/40 border border-teal-500/20">
        <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-purple-400 to-fuchsia-400">
          Profile Settings
        </h2>
        <p className="text-center text-gray-400 mb-8">Personalize your KINDRED experience.</p>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              className={`${inputClasses} focus:border-teal-400 focus:shadow-[0_0_15px_rgba(45,212,191,0.4)]`} required />
            {profileError && <p className="text-red-400 text-sm mt-2">{profileError}</p>}
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">Preferred Language</label>
            <select id="language" value={languageCode} onChange={(e) => setLanguageCode(e.target.value)}
              className={`${inputClasses} focus:border-teal-400 focus:shadow-[0_0_15px_rgba(45,212,191,0.4)]`}>
              {SUPPORTED_LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="voice" className="block text-sm font-medium text-gray-300 mb-2">Voice Preference</label>
            <select id="voice" value={voiceName} onChange={(e) => setVoiceName(e.target.value)}
              className={`${inputClasses} focus:border-teal-400 focus:shadow-[0_0_15px_rgba(45,212,191,0.4)]`}>
              {SUPPORTED_VOICES.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
            </select>
          </div>
          {profileSuccess && <p className="text-green-400 text-sm text-center">{profileSuccess}</p>}
          <div>
            <button type="submit" disabled={isSavingProfile}
              className={`${buttonClasses} bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 shadow-teal-900/40`}>
              {isSavingProfile && <LoadingSpinner />}
              {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Settings */}
       <div className="p-4 sm:p-6 lg:p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl shadow-black/40 border border-purple-500/20">
        <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
          Security
        </h2>
        <p className="text-center text-gray-400 mb-8">Manage your account password.</p>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className={`${inputClasses} focus:border-purple-400 focus:shadow-[0_0_15px_rgba(192,132,252,0.4)]`} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className={`${inputClasses} focus:border-purple-400 focus:shadow-[0_0_15px_rgba(192,132,252,0.4)]`} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputClasses} focus:border-purple-400 focus:shadow-[0_0_15px_rgba(192,132,252,0.4)]`} required />
          </div>
          {passwordError && <p className="text-red-400 text-sm text-center">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-400 text-sm text-center">{passwordSuccess}</p>}
          <div>
            <button type="submit" disabled={isSavingPassword}
              className={`${buttonClasses} bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-purple-900/40`}>
              {isSavingPassword && <LoadingSpinner />}
              {isSavingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

       {/* Data Management */}
       <div className="p-4 sm:p-6 lg:p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl shadow-black/40 border border-red-500/20">
        <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
          Data Management
        </h2>
        <p className="text-center text-gray-400 mb-8">Manage your application data.</p>
        
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Clear Chat History</label>
                <p className="text-xs text-gray-400 mb-3">This will permanently delete all your conversations with Kindred. This action cannot be undone.</p>
                <button 
                    onClick={handleClearHistory}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-white font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all"
                >
                    Clear History
                </button>
            </div>
            {clearSuccess && <p className="text-green-400 text-sm text-center mt-4">{clearSuccess}</p>}
        </div>
      </div>
      
       {/* Account Actions */}
       <div className="p-4 sm:p-6 lg:p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl shadow-black/40 border border-gray-500/20">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-300">
            Account Actions
        </h2>
        <button
            onClick={onLogout}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-white font-semibold bg-gray-600/50 hover:bg-gray-500/50 transition-all"
        >
            {ICONS.logout('w-5 h-5 mr-2')}
            Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;