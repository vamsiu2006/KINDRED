import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { config } from '../config';

const API_BASE_URL = config.API_BASE_URL;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const updateUser = useCallback(async (updatedData: Partial<User>) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.error('Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  }, [user]);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Failed to log in. Please try again.' };
    }
  }, []);

  return {
    user,
    isLoading,
    logout,
    updateUser,
    refreshUser: checkSession,
    signup,
    login
  };
};
