// API Configuration
// Uses environment variable for production, falls back to localhost for development

const getApiBaseUrl = () => {
  // Production Vercel API URL
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Localhost development
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // For tunnels
    if (host.includes('run.pinggy-free.link') || host.includes('ngrok') || host.includes('tunnel')) {
      return `${window.location.protocol}//${host}/api`;
    }
  }
  
  // Default to localhost for development
  return '/api';
};

export const API_URL = getApiBaseUrl();
