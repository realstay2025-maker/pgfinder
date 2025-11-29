import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center mb-6">
                            <div className="relative">
                                <HomeIcon className="h-8 w-8 text-blue-400" />
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-20 animate-pulse"></div>
                            </div>
                            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">PGFinder</span>
                        </div>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Your trusted partner in finding the perfect PG accommodation. 
                            Safe, verified, and affordable housing solutions.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-gray-300 hover:text-white hover:bg-blue-500 transition-all duration-200 transform hover:scale-110">
                                <span className="sr-only">Facebook</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                            <a href="#" className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-gray-300 hover:text-white hover:bg-blue-400 transition-all duration-200 transform hover:scale-110">
                                <span className="sr-only">Twitter</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                            </a>
                            <a href="#" className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-gray-300 hover:text-white hover:bg-pink-500 transition-all duration-200 transform hover:scale-110">
                                <span className="sr-only">Instagram</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.897 1.387 2.048 1.387 3.345s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.897-1.387-2.048-1.387-3.345s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.897.897 1.387 2.048 1.387 3.345s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z"/></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                            <li><Link to="/services" className="text-gray-400 hover:text-white">Services</Link></li>
                            <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                        </ul>
                    </div>

                    {/* For Users */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">For Users</h3>
                        <ul className="space-y-2">
                            <li><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
                            <li><Link to="/register" className="text-gray-400 hover:text-white">Register</Link></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <PhoneIcon className="w-5 h-5 text-blue-400 mr-3" />
                                <span className="text-gray-400">+91 8766533029</span>
                            </div>
                            <div className="flex items-center">
                                <EnvelopeIcon className="w-5 h-5 text-blue-400 mr-3" />
                                <span className="text-gray-400">support@pgfinder.com</span>
                            </div>
                            <div className="flex items-center">
                                <MapPinIcon className="w-5 h-5 text-blue-400 mr-3" />
                                <span className="text-gray-400">Pune, India</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400">
                        © 2025 PGFinder. All rights reserved. | Made with ❤️ for better accommodation
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;