import React, { useState, FormEvent } from 'react';
import { ICONS } from '../../constants';

type AuthMode = 'login' | 'signup' | 'verify';

interface AuthScreenProps {
  onLogin: (identifier: string, password: string) => boolean;
  onSignup: (name: string, email: string, password: string) => { success: boolean, message: string };
  onSignInWithGoogle: (name: string, email: string) => { success: boolean, message: string };
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignup, onSignInWithGoogle }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleError, setGoogleError] = useState('');


  const isLocked = loginAttempts >= 5;
  
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setError('Too many failed attempts. Please try again later.');
      return;
    }
    // Simple validation
    if (name.trim().length < 2) {
      setError('Please enter a valid username or email.');
      return;
    }

    const loginSuccessful = onLogin(name, password); // Use 'name' field for identifier (email or username)
    if (!loginSuccessful) {
      setLoginAttempts(prev => prev + 1);
      const attemptsLeft = 4 - loginAttempts;
      if (attemptsLeft <= 0) {
        setError('Security Alert: Too many failed login attempts. Your account is temporarily locked.');
      } else {
        setError(`Invalid credentials. You have ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left.`);
      }
    }
  };
  
  const handleSignup = (e: FormEvent) => {
    e.preventDefault();
    setError('');
     if (name.trim().length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }
    const result = onSignup(name, email, password);
    if (result.success) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setInfo(`A 6-digit verification code has been "sent" to ${email}.`);
      setMode('verify');
    } else {
      setError(result.message);
    }
  };

  const handleVerify = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (verificationCode === generatedCode) {
      // Verification successful, now log the user in
      onLogin(name, password);
    } else {
      setError('Invalid verification code. Please try again.');
    }
  };
  
  const handleGoogleSignInClick = () => {
    setError(''); // Clear main form error
    setGoogleError(''); // Clear modal error
    setGoogleName('');
    setGoogleEmail('');
    setIsGoogleModalOpen(true);
  };

  const handleGoogleModalSubmit = (e: FormEvent) => {
    e.preventDefault();
    setGoogleError('');
    if (googleName.trim().length < 2) {
        setGoogleError("A valid name is required.");
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!googleEmail || !emailRegex.test(googleEmail)) {
        setGoogleError("A valid email is required.");
        return;
    }

    const result = onSignInWithGoogle(googleName, googleEmail);
    if (result.success) {
        setIsGoogleModalOpen(false);
    } else {
        setGoogleError(result.message);
    }
  };


  const renderForm = () => {
    const inputClasses = "input-glass appearance-none rounded-lg relative block w-full px-4 py-3";
    const buttonClasses = "btn-primary group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg disabled:cursor-not-allowed";

    switch (mode) {
      case 'verify':
        return (
          <form className="mt-8 space-y-6" onSubmit={handleVerify}>
             <div className="text-center space-y-4">
                <p className="text-green-300">{info}</p>
                
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3 text-left text-sm">
                    <p className="font-mono font-bold text-yellow-300">// DEV SIMULATION</p>
                    <p className="text-yellow-400 mt-1">In a live app, this code would be in your inbox. For this demo, please use the code below:</p>
                    <p className="text-2xl font-bold text-center text-white mt-2 tracking-widest bg-black/30 rounded-md p-2">
                        {generatedCode}
                    </p>
                </div>
            </div>
            <input name="verification" type="text" required
              className={inputClasses}
              placeholder="6-digit code"
              value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
            <button type="submit" className={buttonClasses}>
              Verify & Complete Sign Up
            </button>
          </form>
        );
      case 'signup':
        return (
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="rounded-md shadow-sm space-y-4">
              <input name="name" type="text" autoComplete="username" required
                className={inputClasses}
                placeholder="Username"
                value={name} onChange={(e) => setName(e.target.value)} />
              <input name="email" type="email" autoComplete="email" required
                className={inputClasses}
                placeholder="Email address"
                value={email} onChange={(e) => setEmail(e.target.value)} />
              <input name="password" type="password" autoComplete="new-password" required
                className={inputClasses}
                placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className={buttonClasses}>
              Create My Profile
            </button>
          </form>
        );
      case 'login':
      default:
        return (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm space-y-4">
              <input name="username" type="text" autoComplete="username" required
                className={inputClasses}
                placeholder="Username or Email"
                value={name} onChange={(e) => setName(e.target.value)} />
              <input name="password" type="password" autoComplete="current-password" required
                className={inputClasses}
                placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={isLocked} className={buttonClasses}>
              {isLocked ? 'Account Locked' : 'Log In'}
            </button>
          </form>
        );
    }
  };

  const clearState = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setInfo('');
    setVerificationCode('');
    setGeneratedCode('');
    // Do not reset login attempts when switching forms
  }

  return (
    <>
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 glass-card border-emerald-500/30 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="circuit-logo">
              <img 
                src="/kindred-logo.jpg" 
                alt="Kindred AI" 
                className="h-20 w-20 rounded-xl object-cover"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text" style={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 50%, #ff3366 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {mode === 'login' && 'Welcome to KINDRED'}
            {mode === 'signup' && 'Create Your Profile'}
            {mode === 'verify' && 'Verify Your Email'}
          </h1>
          <p className="mt-2 text-gray-400">
             {mode === 'login' && 'Your AI companion for a kinder world.'}
             {mode !== 'login' && 'Let\'s get you set up.'}
          </p>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center font-semibold bg-red-900/30 p-2 rounded-md">{error}</p>}
        
        {renderForm()}

        {(mode === 'login' || mode === 'signup') && (
             <>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-teal-500/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#0c051a] text-gray-400">Or continue with</span>
                    </div>
                </div>
                <div>
                    <button
                        onClick={handleGoogleSignInClick}
                        className="w-full inline-flex justify-center items-center py-3 px-4 border border-teal-500/20 rounded-lg shadow-sm bg-black/20 text-sm font-medium text-white hover:bg-white/5 transition-all"
                    >
                        {ICONS.google('w-5 h-5 mr-3')}
                        {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                    </button>
                </div>
            </>
        )}
        
        <div className="text-sm text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              clearState();
            }}
            className="font-medium text-teal-300 hover:text-teal-200"
          >
            {mode === 'login' ? 'First time here? Sign up' : 'Already have a profile? Log in'}
          </button>
        </div>
      </div>
    </div>
    
    {isGoogleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm p-6 bg-[#100a1f] border border-teal-500/30 rounded-2xl shadow-xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-center text-white mb-2">Simulate Google Sign-In</h3>
            <p className="text-sm text-gray-400 text-center mb-6">Enter your details to continue.</p>
            <form onSubmit={handleGoogleModalSubmit} className="space-y-4">
               <input name="googlename" type="text" required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-teal-500/20 bg-black/20 placeholder-gray-500 text-white focus:outline-none focus:ring-0 focus:border-teal-400 focus:shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all duration-300"
                  placeholder="Full Name"
                  value={googleName} onChange={(e) => setGoogleName(e.target.value)} />
               <input name="googleemail" type="email" required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-teal-500/20 bg-black/20 placeholder-gray-500 text-white focus:outline-none focus:ring-0 focus:border-teal-400 focus:shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all duration-300"
                  placeholder="Email Address"
                  value={googleEmail} onChange={(e) => setGoogleEmail(e.target.value)} />
              
              {googleError && <p className="text-red-400 text-sm text-center">{googleError}</p>}
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsGoogleModalOpen(false)} className="w-full py-2 px-4 rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="w-full py-2 px-4 rounded-md text-white bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 transition-colors">
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
    )}
    </>
  );
};

export default AuthScreen;