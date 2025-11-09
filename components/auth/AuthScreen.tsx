import React, { useEffect, useState } from 'react';
import { ICONS } from '../../constants';
import { config } from '../../config';
import { useAuth } from '../../hooks/useAuth';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  
  const { signup, login } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (mode === 'signup') {
        if (!formData.name.trim()) {
          setError('Please enter your name');
          setIsLoading(false);
          return;
        }
        result = await signup(formData.email, formData.password, formData.name);
      } else {
        result = await login(formData.email, formData.password);
      }

      if (result.success) {
        onAuthSuccess();
      } else {
        setError(result.error || 'Authentication failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
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
      <div className="w-full max-w-md p-8 space-y-6 glass-card border-emerald-500/30 rounded-2xl shadow-2xl">
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

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full group relative flex items-center justify-center py-3 px-6 border border-teal-500/30 rounded-xl shadow-lg bg-gradient-to-r from-teal-500/10 to-purple-600/10 text-base font-medium text-white hover:from-teal-500/20 hover:to-purple-600/20 hover:border-teal-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ICONS.google('w-6 h-6 mr-3')}
            <span>Continue with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0a0e27] text-gray-400">Or continue with email</span>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-gray-800/30 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={mode === 'signup'}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
              {mode === 'signup' && (
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="pt-4 border-t border-teal-500/20">
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

        <div className="text-xs text-center text-gray-500">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
