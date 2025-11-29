// client/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('pg_owner');
  const [pgName, setPgName] = useState('');
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, loading, error, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on role after successful registration
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'pg_owner') {
        navigate('/owner'); // PG Owner Dashboard
      } else if (user.role === 'tenant') { // NEW: Explicitly handle Tenant
        navigate('/tenant'); // Tenant Dashboard
      } else {
        navigate('/'); // Fallback
      }
    }
}, [user, navigate]);

  useEffect(() => {
    if (role === 'tenant') {
      fetchProperties();
    }
  }, [role]);

  const fetchProperties = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/properties/names');
      // console.log('Fetched properties:', res.data);
      setProperties(res.data);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role, pgName);
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-16">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg p-6 md:p-8 rounded-3xl shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Join PGFinder</h2>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {error && (
            <div className="bg-custom-red/10 border-l-4 border-custom-red text-custom-red p-3 mb-4 rounded text-sm">
                {error}
            </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-dark focus:border-primary-dark text-sm md:text-base"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-dark focus:border-primary-dark text-sm md:text-base"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-dark focus:border-primary-dark text-sm md:text-base"
              placeholder="Enter a secure password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-primary-dark focus:border-primary-dark text-sm md:text-base"
            >
              <option value="pg_owner">PG Owner (Manage Properties)</option>
              <option value="tenant">Tenant (View Dues/Complaints)</option>
              {/* Super Admin registration should be disabled for public unless a secret key is used */}
            </select>
          </div>

          {role === 'tenant' && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select PG</label>
              <input
                type="text"
                value={searchTerm || pgName}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) setPgName('');
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for a PG..."
                required
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-dark focus:border-primary-dark text-sm md:text-base"
              />
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {properties
                    .filter(property => 
                      property.title.toLowerCase().includes((searchTerm || '').toLowerCase())
                    )
                    .map((property) => (
                      <div
                        key={property._id}
                        onClick={() => {
                          setPgName(property.title);
                          setSearchTerm('');
                          setShowDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                      >
                        {property.title}
                      </div>
                    ))
                  }
                  {properties.filter(property => 
                    property.title.toLowerCase().includes((searchTerm || '').toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No PGs found
                    </div>
                  )}
                </div>
              )}
              {pgName && (
                <div className="mt-1 text-sm text-green-600">
                  Selected: {pgName}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 md:py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm md:text-base font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transform hover:scale-[1.02] transition-all duration-200"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 md:mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-dark hover:text-blue-700 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;