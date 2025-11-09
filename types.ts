export interface User {
  name: string;
  languageCode: string;
  email: string;
  password: string; // In a real app, this would be a secure hash, not plain text.
  voiceName: string;
  hasBeenOnboarded?: boolean;
  profilePicture?: string; // Base64 encoded image
  phone?: string;
  bloodGroup?: string;
  weight?: string; // in kg or lbs
  height?: string; // in cm or feet/inches
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  translationEnabled?: boolean; // Enable/disable translation
  autoDetectLanguage?: boolean; // Auto-detect user's input language
  showOriginalText?: boolean; // Show original text alongside translation
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  image?: string; // Optional: for displaying uploaded images
  originalText?: string; // Original text before translation
  detectedLanguage?: string; // Detected language of the message
  translatedFrom?: string; // Language code translated from
}

export enum View {
  Chat = 'chat',
  Dashboard = 'dashboard',
  Medical = 'medical',
  Emergency = 'emergency',
  Settings = 'settings',
}

export interface Language {
  code: string;
  name: string;
}

export interface Voice {
  name: string;
  id: string;
}