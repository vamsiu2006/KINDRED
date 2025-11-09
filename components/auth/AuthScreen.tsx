import React, { useEffect, useState } from 'react';
import { ICONS } from '../../constants';
import { config } from '../../config';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');
    
    if (authStatus === 'success') {
      setIsLoading(true);
      window.history.replaceState({}, '', '/');
      onAuthSuccess();
    } else if (authStatus === 'error') {
      setError('Authentication failed. Please try again.');
      window.history.replaceState({}, '', '/');
      setIsLoading(false);
    }
  }, [onAuthSuccess]);

  const handleGoogleSignIn = () => {
    setError('');
    setIsLoading(true);
    window.location.href = `${config.API_BASE_URL}/auth/google`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <div className="circuit-logo">
            <img 
              src="/kindred-logo.jpg" 
              alt="Kindred AI" 
              className="h-20 w-20 rounded-xl object-cover mx-auto animate-pulse"
            />
          </div>
          <p className="text-xl text-teal-300">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
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
            Welcome to KINDRED
          </h1>
          <p className="mt-2 text-gray-400">
            Your AI companion for a kinder world.
          </p>
        </div>
        
        {error && (
          <div className="text-red-400 text-sm text-center font-semibold bg-red-900/30 p-3 rounded-md border border-red-500/30">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              Sign in with your Google account to access your personalized AI companion experience.
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <span>🔒</span>
              <span>Secure OAuth 2.0 Authentication</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full group relative flex items-center justify-center py-4 px-6 border border-teal-500/30 rounded-xl shadow-lg bg-gradient-to-r from-teal-500/10 to-purple-600/10 text-base font-medium text-white hover:from-teal-500/20 hover:to-purple-600/20 hover:border-teal-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ICONS.google('w-6 h-6 mr-3')}
            <span>Continue with Google</span>
          </button>

          <div className="text-xs text-center text-gray-500 space-y-2">
            <p>
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
            <p className="text-teal-400/70">
              Your data is encrypted and securely stored.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-teal-500/20">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">✨ What you'll get:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>🤖 AI-powered emotional support conversations</li>
              <li>📊 Track your wellness journey with insights</li>
              <li>💊 Smart medication and health management</li>
              <li>🚨 Quick access to emergency services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
