// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: `${API_BASE_URL}/api/auth`,
  
  // Property endpoints
  PROPERTIES_PUBLIC: `${API_BASE_URL}/api/properties/public`,
  PROPERTIES: `${API_BASE_URL}/api/properties`,
  
  // Owner endpoints
  OWNER: `${API_BASE_URL}/api/owner`,
  
  // Contact and booking endpoints
  CONTACT: `${API_BASE_URL}/api/contact`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  
  // Room endpoints
  ROOMS: `${API_BASE_URL}/api/rooms`,
  
  // Tenant endpoints
  TENANT: `${API_BASE_URL}/api/tenant`,
  
  // Admin endpoints
  ADMIN: `${API_BASE_URL}/api/admin`
};

export default API_BASE_URL;