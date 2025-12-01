// client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

import { API_ENDPOINTS } from '../config/api';

const API_BASE_URL = API_ENDPOINTS.AUTH;

export const AuthProvider = ({ children }) => {
  // Initialize state from local storage for persistence
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userInfo')) || null);
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
                    console.error("Error parsing user from localStorage:", e);
                    localStorage.removeItem('userInfo');
                }
            }
            // CRITICAL STEP: Set loading to false ONLY after checking storage
            setLoading(false); 
        };

        loadUserFromStorage();
    }, []); // Runs only on mount

  // Function to register a user
  const register = async (name, email, password, role, pgName = '') => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/register`, { name, email, password, role, pgName });
      
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
      const { data } = await axios.post(`${API_BASE_URL}/login`, { email, password });

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setError(null);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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

export const useAuth = () => useContext(AuthContext);