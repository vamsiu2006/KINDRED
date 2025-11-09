import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

const USERS_DB_KEY = 'kindred_users_db_v2';
const SESSION_KEY = 'kindred_session_user_name_v2';

// In a real app, never do this. This is a simulation for a frontend-only environment.
// Use a secure, one-way hashing algorithm like Argon2 or bcrypt on a backend server.
const simpleHash = (password: string) => `sim_hash_${btoa(password)}`;
const verifyPassword = (password: string, hash: string) => simpleHash(password) === hash;


// Helper to get the users database from localStorage
// Fix: Added curly braces to the catch block to fix a syntax error.
const getUsersDb = (): { [key: string]: User } => {
    try {
        const db = localStorage.getItem(USERS_DB_KEY);
        return db ? JSON.parse(db) : {};
    } catch (error) {
        console.error("Failed to parse users DB from localStorage", error);
        return {};
    }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sessionUserName = localStorage.getItem(SESSION_KEY);
    if (sessionUserName) {
      const usersDb = getUsersDb();
      const loggedInUser = usersDb[sessionUserName.toLowerCase()];
      if (loggedInUser) {
        setUser(loggedInUser);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const login = useCallback((identifier: string, password: string): boolean => {
    const usersDb = getUsersDb();
    const identifierLower = identifier.trim().toLowerCase();
    
    // Find user by username or email
    const userToLogin = usersDb[identifierLower] || Object.values(usersDb).find(u => u.email.toLowerCase() === identifierLower);
    
    if (userToLogin && verifyPassword(password, userToLogin.password)) {
      localStorage.setItem(SESSION_KEY, userToLogin.name);
      setUser(userToLogin);
      return true;
    }
    return false;
  }, []);

  const signup = useCallback((name: string, email: string, password: string): { success: boolean, message: string } => {
    const usersDb = getUsersDb();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (usersDb[trimmedName.toLowerCase()]) {
        return { success: false, message: 'Username already taken.' };
    }
    if (Object.values(usersDb).some(u => u.email.toLowerCase() === trimmedEmail)) {
        return { success: false, message: 'Email already registered.' };
    }

    const newUser: User = { 
        name: trimmedName, 
        email: trimmedEmail,
        password: simpleHash(password), // Simulate hashing
        languageCode: 'en-US',
        voiceName: 'female-us', // Default voice - Warm & Natural
        hasBeenOnboarded: false,
    };
    
    const newDb = { ...usersDb, [trimmedName.toLowerCase()]: newUser };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(newDb));
    return { success: true, message: 'Signup successful! Please verify your email.' };
  }, []);

  const signInWithGoogle = useCallback((name: string, email: string): { success: boolean, message: string } => {
    const usersDb = getUsersDb();
    const trimmedEmail = email.trim().toLowerCase();
    let userToLogin = Object.values(usersDb).find(u => u.email.toLowerCase() === trimmedEmail);

    if (userToLogin) {
        // User exists, log them in
        localStorage.setItem(SESSION_KEY, userToLogin.name);
        setUser(userToLogin);
        return { success: true, message: "Logged in successfully." };
    } else {
        // New user via Google, create a profile
        let newName = name.trim();
        // Ensure the proposed username isn't already taken
        if (usersDb[newName.toLowerCase()]) {
            // If name is taken, create a unique one
            newName = `${newName}_${Math.random().toString(36).substring(2, 7)}`;
        }

        const newUser: User = {
            name: newName,
            email: trimmedEmail,
            password: simpleHash(`google_oauth_secure_placeholder_${Date.now()}`), // Secure placeholder
            languageCode: 'en-US',
            voiceName: 'female-us', // Default voice - Warm & Natural
            hasBeenOnboarded: false,
        };
        // Use immutable update pattern to prevent bugs
        const newDb = { ...usersDb, [newName.toLowerCase()]: newUser };
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(newDb));
        
        // Now log them in
        localStorage.setItem(SESSION_KEY, newUser.name);
        setUser(newUser);
        return { success: true, message: "Profile created and logged in successfully." };
    }
  }, []);

  const logout = useCallback(() => {
    if (user) {
      localStorage.removeItem(`kindred_chat_history_${user.name}`);
    }
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, [user]);

  const updateUser = useCallback((updatedData: Partial<User>) => {
      setUser(currentUser => {
          if (!currentUser) return null;
          
          const usersDb = getUsersDb();
          const oldKey = currentUser.name.toLowerCase();
          const newUser = { ...currentUser, ...updatedData };
          
          let newDb = { ...usersDb };
          // If name changed, we need to update the key in the DB
          if (updatedData.name && updatedData.name.toLowerCase() !== oldKey) {
              const newKey = updatedData.name.toLowerCase();
              if(newDb[newKey]) {
                  // This should be handled in the UI, but as a safeguard:
                  console.error("New username is already taken");
                  // In a real app, you'd return an error state.
                  return currentUser; 
              }
              delete newDb[oldKey];
              newDb[newKey] = newUser;
              localStorage.setItem(SESSION_KEY, newUser.name);
          } else {
              newDb[oldKey] = newUser;
          }

          try {
              localStorage.setItem(USERS_DB_KEY, JSON.stringify(newDb));
              return newUser;
          } catch (error) {
              // Handle localStorage quota exceeded or other storage errors
              console.error("Failed to save user data to localStorage:", error);
              
              // Try to remove profile picture if storage quota exceeded
              if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                  console.warn("Storage quota exceeded. Profile picture may be too large.");
                  
                  // Attempt to save without profile picture
                  // Use the already-mutated newDb to preserve name-change logic
                  const newUserWithoutPicture = { ...newUser, profilePicture: undefined };
                  const keyToUpdate = updatedData.name?.toLowerCase() || oldKey;
                  const dbWithoutPicture = { ...newDb }; // Use newDb, not usersDb
                  dbWithoutPicture[keyToUpdate] = newUserWithoutPicture;
                  
                  try {
                      localStorage.setItem(USERS_DB_KEY, JSON.stringify(dbWithoutPicture));
                      alert("Storage full! Profile picture is too large. Other data saved successfully. Please use a smaller image (max 1MB).");
                      return newUserWithoutPicture;
                  } catch (retryError) {
                      console.error("Failed to save even without profile picture:", retryError);
                      alert("Failed to save profile data. Storage might be full. Please free up space or use smaller images.");
                      return currentUser; // Rollback on total failure
                  }
              } else {
                  alert("Failed to save profile data. Please try again.");
                  return currentUser; // Rollback on error
              }
          }
      });
  }, []);

  const changePassword = useCallback((currentPassword: string, newPassword: string): { success: boolean, message: string } => {
    if (!user) return { success: false, message: "No user logged in." };

    const usersDb = getUsersDb();
    const userInDb = usersDb[user.name.toLowerCase()];

    if (!userInDb || !verifyPassword(currentPassword, userInDb.password)) {
      return { success: false, message: "Current password is not correct." };
    }

    const updatedUser = { ...userInDb, password: simpleHash(newPassword) };
    const newDb = { ...usersDb, [user.name.toLowerCase()]: updatedUser };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(newDb));
    setUser(updatedUser); // Update state with new user object

    return { success: true, message: "Password updated successfully." };
  }, [user]);

  const markUserAsOnboarded = useCallback(() => {
    setUser(currentUser => {
      if (!currentUser || currentUser.hasBeenOnboarded) return currentUser;

      const updatedUser = { ...currentUser, hasBeenOnboarded: true };
      const usersDb = getUsersDb();
      usersDb[currentUser.name.toLowerCase()] = updatedUser;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
      
      return updatedUser;
    });
  }, []);


  return { user, login, signup, logout, updateUser, changePassword, signInWithGoogle, markUserAsOnboarded };
};