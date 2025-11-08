import React from 'react';
import { Language, Voice } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'bn-IN', name: 'Bengali' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)' },
  { code: 'en-US', name: 'English' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'pt-BR', name: 'Portuguese' },
  { code: 'pa-IN', name: 'Punjabi' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'vi-VN', name: 'Vietnamese' },
];

export const SUPPORTED_VOICES: Voice[] = [
    { name: 'Female Voice (US) - Warm & Natural', id: 'female-us' },
    { name: 'Female Voice (UK) - Clear & Professional', id: 'female-uk' },
    { name: 'Female Voice (Natural) - Friendly & Smooth', id: 'female-natural' },
    { name: 'Male Voice (US) - Deep & Calm', id: 'male-us' },
    { name: 'Male Voice (UK) - Refined & Clear', id: 'male-uk' },
    { name: 'Auto Select - Best Available', id: 'auto' },
];


// Fix: Converted JSX to React.createElement to be valid in a .ts file.
export const ICONS: { [key: string]: (className: string) => React.ReactNode } = {
    chat: (className: string) => React.createElement('svg', {className, xmlns:"http://www.w3.org/2000/svg", fill:"none", viewBox:"0 0 24 24", strokeWidth:1.5, stroke:"currentColor"}, React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"})),
    logout: (className: string) => React.createElement('svg', {className, xmlns:"http://www.w3.org/2000/svg", fill:"none", viewBox:"0 0 24 24", strokeWidth:1.5, stroke:"currentColor"}, React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"})),
    send: (className: string) => React.createElement('svg', {className, xmlns:"http://www.w3.org/2000/svg", fill:"none", viewBox:"0 0 24 24", strokeWidth:1.5, stroke:"currentColor"}, React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"})),
    settings: (className: string) => React.createElement('svg', {className, xmlns:"http://www.w3.org/2000/svg", fill:"none", viewBox:"0 0 24 24", strokeWidth:1.5, stroke:"currentColor"}, React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 0 1 0 1.255c-.008.378.138.75.43.99l1.004.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.333.183-.582.495-.645.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 0 1 0-1.255c.008-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"}), React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"})),
    google: (className: string) => React.createElement('svg', {className, viewBox:"0 0 48 48"}, React.createElement('path', {fill:"#FFC107", d:"M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"}), React.createElement('path', {fill:"#FF3D00", d:"M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"}), React.createElement('path', {fill:"#4CAF50", d:"M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"}), React.createElement('path', {fill:"#1976D2", d:"M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.213,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"})),
    camera: (className: string) => React.createElement('svg', {className, xmlns:"http://www.w3.org/2000/svg", fill:"none", viewBox:"0 0 24 24", strokeWidth:1.5, stroke:"currentColor"}, React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"}), React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"})),
    medical: (className: string) => React.createElement('svg', {className, xmlns:"http://www.w3.org/2000/svg", fill:"none", viewBox:"0 0 24 24", strokeWidth:1.5, stroke:"currentColor"}, React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M12 4.5v15m7.5-7.5h-15M15 10.5v3m0 0v3m0-3h3m-3 0h-3"}), React.createElement('circle', {cx:"12", cy:"12", r:"9", stroke:"currentColor", strokeWidth:"1.5", fill:"none"})),
    emergency: (className: string) => React.createElement('svg', {className, xmlns:"http://www.w3.org/2000/svg", fill:"none", viewBox:"0 0 24 24", strokeWidth:1.5, stroke:"currentColor"}, React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"})),
    dashboard: (className: string) => React.createElement('svg', {className, xmlns:"http://www.w3.org/2000/svg", fill:"none", viewBox:"0 0 24 24", strokeWidth:1.5, stroke:"currentColor"}, React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"}))
};