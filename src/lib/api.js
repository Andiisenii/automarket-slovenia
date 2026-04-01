// API Configuration
// Exports dynamic API_URL that works for both localhost and tunnels

// Get API URL based on current hostname
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // For tunnels (Pinggy, ngrok, etc.) use full URL
    if (host.includes('run.pinggy-free.link') || 
        host.includes('ngrok') ||
        host.includes('tunnel')) {
      return `${window.location.protocol}//${host}/api`;
    }
  }
  // For localhost, use relative path so Vite proxy works
  return '/api';
};

export const API_URL = getApiBaseUrl();
