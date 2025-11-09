import React, { useState, FormEvent, useEffect } from 'react';
import { User } from '../../types';
import { SUPPORTED_LANGUAGES, SUPPORTED_VOICES, ICONS } from '../../constants';
import LoadingSpinner from '../ui/LoadingSpinner';
import ChatHistory from './ChatHistory';
import { deleteChatHistory } from '../../services/chatHistory';

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

  // Translation Settings state
  const [translationEnabled, setTranslationEnabled] = useState(user.translationEnabled || false);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(user.autoDetectLanguage || false);
  const [showOriginalText, setShowOriginalText] = useState(user.showOriginalText || false);
  const [isSavingTranslation, setIsSavingTranslation] = useState(false);
  const [translationSuccess, setTranslationSuccess] = useState('');

  // Personal Information state
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bloodGroup, setBloodGroup] = useState(user.bloodGroup || '');
  const [weight, setWeight] = useState(user.weight || '');
  const [height, setHeight] = useState(user.height || '');
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
  const [address, setAddress] = useState(user.address || '');
  const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user.emergencyContactPhone || '');
  const [isSavingPersonalInfo, setIsSavingPersonalInfo] = useState(false);
  const [personalInfoError, setPersonalInfoError] = useState('');
  const [personalInfoSuccess, setPersonalInfoSuccess] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Data Management state
  const [clearSuccess, setClearSuccess] = useState('');
  
  // Chat History state
  const [showChatHistory, setShowChatHistory] = useState(false);

  useEffect(() => {
      setName(user.name);
      setLanguageCode(user.languageCode);
      setVoiceName(user.voiceName);
      setTranslationEnabled(user.translationEnabled || false);
      setAutoDetectLanguage(user.autoDetectLanguage || false);
      setShowOriginalText(user.showOriginalText || false);
      setProfilePicture(user.profilePicture || '');
      setPhone(user.phone || '');
      setBloodGroup(user.bloodGroup || '');
      setWeight(user.weight || '');
      setHeight(user.height || '');
      setDateOfBirth(user.dateOfBirth || '');
      setAddress(user.address || '');
      setEmergencyContact(user.emergencyContact || '');
      setEmergencyContactPhone(user.emergencyContactPhone || '');
  }, [user]);
  
   useEffect(() => {
    if (profileSuccess) {
      const timer = setTimeout(() => setProfileSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess]);

  useEffect(() => {
    if (personalInfoSuccess) {
      const timer = setTimeout(() => setPersonalInfoSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [personalInfoSuccess]);

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

  useEffect(() => {
    if (translationSuccess) {
      const timer = setTimeout(() => setTranslationSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [translationSuccess]);

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

  const handleTranslationSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTranslationSuccess('');
    setIsSavingTranslation(true);

    setTimeout(() => {
      onUpdateUser({ 
        translationEnabled, 
        autoDetectLanguage, 
        showOriginalText 
      });
      setIsSavingTranslation(false);
      setTranslationSuccess('Translation settings updated successfully!');
    }, 500);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPersonalInfoError('Please upload an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    // Limit to 1MB to ensure base64 encoding fits in localStorage (~1.33MB encoded)
    if (file.size > 1024 * 1024) {
      setPersonalInfoError('Image size must be less than 1MB for reliable storage');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePicture(base64String);
      setPersonalInfoError('');
    };
    reader.onerror = () => {
      setPersonalInfoError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handlePersonalInfoSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPersonalInfoError('');
    setPersonalInfoSuccess('');
    setIsSavingPersonalInfo(true);

    setTimeout(() => {
      onUpdateUser({
        profilePicture,
        phone,
        bloodGroup,
        weight,
        height,
        dateOfBirth,
        address,
        emergencyContact,
        emergencyContactPhone
      });
      setIsSavingPersonalInfo(false);
      setPersonalInfoSuccess('Your personal information has been updated successfully!');
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

  const handleClearHistory = async () => {
    setClearSuccess('');
    const isConfirmed = window.confirm(
        "Are you sure you want to permanently delete your chat history? This action cannot be undone."
    );
    if (isConfirmed) {
        try {
            const chatHistoryKey = `kindred_chat_history_${user.name}`;
            localStorage.removeItem(chatHistoryKey);
            
            await deleteChatHistory(user.name);
            
            setShowChatHistory(false);
            
            setClearSuccess("Chat history has been successfully cleared. The chat will be reset when you return to it.");
        } catch (error) {
            console.error("Failed to clear chat history:", error);
        }
    }
  };
  
  const inputClasses = "appearance-none rounded-lg relative block w-full px-4 py-3 border border-emerald-500/20 bg-black/20 placeholder-gray-500 text-white focus:outline-none focus:ring-0 transition-all duration-300";
  const buttonClasses = "w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-white font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl";


  return (
    <div className="max-w-2xl mx-auto space-y-12">
      {/* Profile Settings */}
      <div className="p-4 sm:p-6 lg:p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl shadow-black/40 border border-emerald-500/20">
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

      {/* Translation Settings */}
      <div className="p-4 sm:p-6 lg:p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl shadow-black/40 border border-purple-500/20">
        <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-400">
          🌐 Translation Settings
        </h2>
        <p className="text-center text-gray-400 mb-8">Communicate in any language with AI-powered translation.</p>

        <form onSubmit={handleTranslationSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Enable Translation Toggle */}
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-purple-500/20">
              <div className="flex-1">
                <label htmlFor="translationEnabled" className="block text-sm font-semibold text-gray-200">
                  Enable Translation
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Automatically translate messages between languages
                </p>
              </div>
              <input
                id="translationEnabled"
                type="checkbox"
                checked={translationEnabled}
                onChange={(e) => setTranslationEnabled(e.target.checked)}
                className="w-6 h-6 rounded bg-black/40 border-purple-500/30 text-purple-500 focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Auto-Detect Language Toggle */}
            <div className={`flex items-center justify-between p-4 bg-black/20 rounded-lg border border-purple-500/20 transition-opacity ${!translationEnabled ? 'opacity-50' : ''}`}>
              <div className="flex-1">
                <label htmlFor="autoDetectLanguage" className="block text-sm font-semibold text-gray-200">
                  Auto-Detect Language
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Automatically detect the language of your messages
                </p>
              </div>
              <input
                id="autoDetectLanguage"
                type="checkbox"
                checked={autoDetectLanguage}
                onChange={(e) => setAutoDetectLanguage(e.target.checked)}
                disabled={!translationEnabled}
                className="w-6 h-6 rounded bg-black/40 border-purple-500/30 text-purple-500 focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
              />
            </div>

            {/* Show Original Text Toggle */}
            <div className={`flex items-center justify-between p-4 bg-black/20 rounded-lg border border-purple-500/20 transition-opacity ${!translationEnabled ? 'opacity-50' : ''}`}>
              <div className="flex-1">
                <label htmlFor="showOriginalText" className="block text-sm font-semibold text-gray-200">
                  Show Original Text
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Display both translated and original text in messages
                </p>
              </div>
              <input
                id="showOriginalText"
                type="checkbox"
                checked={showOriginalText}
                onChange={(e) => setShowOriginalText(e.target.checked)}
                disabled={!translationEnabled}
                className="w-6 h-6 rounded bg-black/40 border-purple-500/30 text-purple-500 focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-200">
              <strong>How it works:</strong> When enabled, KINDRED will automatically detect the language you're speaking/typing and translate messages to your preferred language. Voice responses will also be in the detected language.
            </p>
            <p className="text-xs text-purple-300 mt-2">
              💡 Supports 21+ languages including English, Spanish, French, Hindi, Chinese, Arabic, and more!
            </p>
          </div>

          {translationSuccess && <p className="text-green-400 text-sm text-center">{translationSuccess}</p>}
          
          <div>
            <button type="submit" disabled={isSavingTranslation}
              className={`${buttonClasses} bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-900/40`}>
              {isSavingTranslation && <LoadingSpinner />}
              {isSavingTranslation ? 'Saving...' : 'Save Translation Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Personal Information */}
      <div className="p-4 sm:p-6 lg:p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl shadow-black/40 border border-cyan-500/20">
        <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400">
          Personal Information
        </h2>
        <p className="text-center text-gray-400 mb-8">Manage your profile picture and health details.</p>

        <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-300 mb-4">Profile Picture</label>
            <div className="flex flex-col items-center gap-4">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500/50 shadow-lg shadow-emerald-500/30"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center text-5xl font-bold text-emerald-400 border-4 border-emerald-500/50">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="cursor-pointer px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold hover:from-cyan-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30">
                📸 Upload Photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400">Max 1MB - PNG, JPG, JPEG, WEBP</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">📱 Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={`${inputClasses} focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]`}
              />
            </div>

            {/* Blood Group */}
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-300 mb-2">🩸 Blood Group</label>
              <select
                id="bloodGroup"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className={`${inputClasses} focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]`}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-2">⚖️ Weight</label>
              <input
                id="weight"
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70 kg or 154 lbs"
                className={`${inputClasses} focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]`}
              />
            </div>

            {/* Height */}
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-2">📏 Height</label>
              <input
                id="height"
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175 cm or 5'9&quot;"
                className={`${inputClasses} focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]`}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-2">🎂 Date of Birth</label>
              <input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={`${inputClasses} focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]`}
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-300 mb-2">🚨 Emergency Contact Name</label>
              <input
                id="emergencyContact"
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="John Doe"
                className={`${inputClasses} focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]`}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">🏠 Address</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State, ZIP"
              rows={3}
              className={`${inputClasses} focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)] resize-none`}
            />
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-300 mb-2">📞 Emergency Contact Phone</label>
            <input
              id="emergencyContactPhone"
              type="tel"
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
              placeholder="+1 (555) 987-6543"
              className={`${inputClasses} focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)]`}
            />
          </div>

          {personalInfoError && <p className="text-red-400 text-sm text-center">{personalInfoError}</p>}
          {personalInfoSuccess && <p className="text-green-400 text-sm text-center">{personalInfoSuccess}</p>}
          
          <div>
            <button
              type="submit"
              disabled={isSavingPersonalInfo}
              className={`${buttonClasses} bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 shadow-cyan-900/40`}
            >
              {isSavingPersonalInfo && <LoadingSpinner />}
              {isSavingPersonalInfo ? 'Saving...' : 'Save Personal Information'}
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

       {/* Chat History */}
       <div className="p-4 sm:p-6 lg:p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl shadow-black/40 border border-blue-500/20">
        <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          Chat History
        </h2>
        <p className="text-center text-gray-400 mb-8">View your past conversations with Kindred.</p>
        
        <div className="mb-6">
          <button 
            onClick={() => setShowChatHistory(!showChatHistory)}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            {showChatHistory ? '📖 Hide Chat History' : '📚 View Chat History (Past 30 Days)'}
          </button>
        </div>
        
        {showChatHistory && (
          <div className="mt-6">
            <ChatHistory userId={user.name} />
          </div>
        )}
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