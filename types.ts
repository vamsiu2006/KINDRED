export interface User {
  name: string;
  languageCode: string;
  email: string;
  password: string; // In a real app, this would be a secure hash, not plain text.
  voiceName: string;
  hasBeenOnboarded?: boolean;
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