export interface User {
  id?: number;
  googleId?: string;
  name: string;
  email: string;
  languageCode: string;
  voiceName: string | null;
  profilePicture?: string; // Base64 encoded image or Google profile picture URL
  phone?: string;
  bloodGroup?: string;
  weight?: string; // in kg or lbs
  height?: string; // in cm or feet/inches
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  image?: string; // Optional: for displaying uploaded images
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