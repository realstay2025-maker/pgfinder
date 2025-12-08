// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    BASE: `${API_BASE_URL}/api/auth`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    PROMOTE_ADMIN: `${API_BASE_URL}/api/auth/promote-admin`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    SESSIONS: `${API_BASE_URL}/api/auth/sessions`
  },
  
  // Property endpoints
  PROPERTIES_PUBLIC: `${API_BASE_URL}/api/properties/public`,
  PROPERTIES: `${API_BASE_URL}/api/properties`,
  
  // Owner endpoints
  OWNER: `${API_BASE_URL}/api/owner`,
  
  // Contact and booking endpoints
  CONTACT: `${API_BASE_URL}/api/contact`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  
  // Notice endpoints
  NOTICES: `${API_BASE_URL}/api/notices`,
  
  // Room endpoints
  ROOMS: `${API_BASE_URL}/api/rooms`,
  
  // Tenant endpoints
  TENANT: `${API_BASE_URL}/api/tenant`,
  
  // Admin endpoints
  ADMIN: `${API_BASE_URL}/api/admin`,
  
  // Subscription endpoints
  SUBSCRIPTIONS: `${API_BASE_URL}/api/subscriptions`,
  
  // Complaint endpoints
  COMPLAINTS: `${API_BASE_URL}/api/complaints`,
  
  // Payment endpoints
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  
  // Analytics endpoints
  ANALYTICS: `${API_BASE_URL}/api/analytics`
};

export default API_BASE_URL;