const isDevelopment = import.meta.env.MODE === 'development';
const replitDomain = (window as any).REPLIT_DEV_DOMAIN || import.meta.env.VITE_REPLIT_DEV_DOMAIN;

export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (replitDomain ? `https://${replitDomain}` : 'http://localhost:3000'),
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || (replitDomain ? `https://${replitDomain}` : 'http://localhost:5000'),
  isDevelopment
};
