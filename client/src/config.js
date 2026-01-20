// Configuration for API URL
// In development, it falls back to localhost.
// In production (Vercel), set VITE_API_URL in Environment Variables.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';
