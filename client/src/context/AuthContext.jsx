// client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

import { API_ENDPOINTS } from '../config/api';

const API_BASE_URL = API_ENDPOINTS.AUTH;


export const AuthProvider = ({ children }) => {
  // Initialize state from local storage for persistence
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('userInfo');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      // console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('userInfo');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
        // Function runs once on mount
        const loadUserFromStorage = () => {
            const storedUser = localStorage.getItem('userInfo');
            
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    
                    // CRITICAL STEP: Set user immediately
                    setUser(userData);
                    
                } catch (e) {
                    // Handle potential JSON parsing errors
                    // console.error("Error parsing user from localStorage:", e);
                    localStorage.removeItem('userInfo');
                }
            }
            // CRITICAL STEP: Set loading to false ONLY after checking storage
            setLoading(false); 
        };

        loadUserFromStorage();
    }, []); // Runs only on mount

  // Function to register a user
  const register = async (name, email, password, role, pgName = '', gender = '') => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/register`, { name, email, password, role, pgName, gender });
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setError(null);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  // Function to log in a user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL.BASE}/login`, { email, password });
      // const { data } = await axios.post(`${API_BASE_URL.LOGIN}`, { email, password });

      
      // console.log('Login response:', data); // Debug log
      
      if (!data.token) {
        throw new Error('No token received from server');
      }

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setError(null);
      setLoading(false);
      return data;
    } catch (err) {
      // console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  // Function to log out a user
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};