import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const isActive = (path) => location.pathname === path;
    
    return (
        <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center group">
                        <div className="relative">
                            <HomeIcon className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        </div>
                        <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PGFinder</span>
                    </Link>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        {[
                            { path: '/', label: 'Home' },
                            { path: '/search', label: 'Search' },
                            { path: '/about', label: 'About' },
                            { path: '/services', label: 'Services' },
                            { path: '/faq', label: 'FAQ' },
                            { path: '/contact', label: 'Contact' }
                        ].map(({ path, label }) => (
                            <Link 
                                key={path}
                                to={path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive(path) 
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                        <Link 
                            to="/login" 
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Login
                        </Link>
                        <Link 
                            to="/register" 
                            className="ml-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            Post Property
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <div className="space-y-2">
                            {[
                                { path: '/', label: 'Home' },
                                { path: '/search', label: 'Search' },
                                { path: '/about', label: 'About' },
                                { path: '/services', label: 'Services' },
                                { path: '/faq', label: 'FAQ' },
                                { path: '/contact', label: 'Contact' },
                                { path: '/login', label: 'Login' }
                            ].map(({ path, label }) => (
                                <Link 
                                    key={path}
                                    to={path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive(path) 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                            <Link 
                                to="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block mx-4 mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium text-center"
                            >
                                Post Property
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;