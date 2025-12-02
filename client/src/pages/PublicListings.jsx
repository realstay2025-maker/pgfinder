// client/src/pages/PublicListings.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPinIcon, CurrencyRupeeIcon, MagnifyingGlassIcon, StarIcon, WifiIcon, HomeIcon, UserGroupIcon, PhoneIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_ENDPOINTS } from '../config/api';
import usePageTitle from '../hooks/usePageTitle';

const API_PUBLIC_PROPERTIES = API_ENDPOINTS.PROPERTIES_PUBLIC;

// --- Hero Section ---
const HeroSection = ({ searchParams, handleChange, handleSearch }) => (
    <div className="relative min-h-[80vh] bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Find Your Perfect PG
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                    Discover verified, affordable PG accommodations with modern amenities
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">✓ Verified Properties</span>
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">✓ Instant Booking</span>
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">✓ 24/7 Support</span>
                </div>
            </div>
            
            <div className="max-w-5xl mx-auto">
                <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="md:col-span-2 relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="city"
                                placeholder="Search by city, locality, or landmark"
                                value={searchParams.city}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                name="minPrice"
                                placeholder="Min Budget ₹"
                                value={searchParams.minPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-4 bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                name="maxPrice"
                                placeholder="Max Budget ₹"
                                value={searchParams.maxPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-4 bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        🔍 Search Amazing PGs
                    </button>
                </form>
            </div>
        </div>
    </div>
);

// --- Property Card Component ---
const PropertyCard = ({ property }) => {
    const [liked, setLiked] = useState(false);
    
    return (
        <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
            <div className="relative overflow-hidden">
                <div className="h-48 md:h-56 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center relative">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                        <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/10 rounded-full animate-pulse animation-delay-1000"></div>
                    </div>
                    <div className="text-center text-white z-10">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                            <HomeIcon className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm font-medium">{property.title}</p>
                        </div>
                    </div>
                </div>
                
                {/* Heart button with animation */}
                <button 
                    onClick={() => setLiked(!liked)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                >
                    {liked ? (
                        <HeartSolid className="w-5 h-5 text-red-500 animate-pulse" />
                    ) : (
                        <HeartIcon className="w-5 h-5 text-gray-600 group-hover:text-red-400" />
                    )}
                </button>
                
                {/* Room types badge */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 border border-white/50">
                    {property.roomTypes?.length || 1} Room Types
                </div>
            </div>
            
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{property.title}</h3>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                        <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold ml-1 text-yellow-600">4.2</span>
                    </div>
                </div>
                
                <p className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPinIcon className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                    <span className="truncate">{property.address?.city}, {property.address?.state}</span>
                </p>
                
                {/* Amenities with modern icons */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-full">
                        <WifiIcon className="w-3 h-3 mr-1 text-blue-500" />
                        <span>WiFi</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600 bg-green-50 px-2 py-1 rounded-full">
                        <span className="mr-1">🚗</span>
                        <span>Parking</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600 bg-purple-50 px-2 py-1 rounded-full">
                        <UserGroupIcon className="w-3 h-3 mr-1 text-purple-500" />
                        <span>Common</span>
                    </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                                <CurrencyRupeeIcon className="w-6 h-6 mr-1 text-green-600" />
                                {property.basePrice || '8,500'}
                                <span className="text-sm font-normal text-gray-500 ml-1">/month</span>
                            </p>
                            <p className="text-xs text-gray-500">Starting from</p>
                        </div>
                        <div className="flex space-x-2">
                            <button className="p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 group">
                                <PhoneIcon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                            </button>
                            <Link 
                                to={`/property/${property._id}`} 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Listings Component ---
const PublicListings = () => {
    usePageTitle('Find Your Perfect PG');
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useState({ city: '', minPrice: '', maxPrice: '' });
    const [error, setError] = useState(null);

    const fetchProperties = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(API_PUBLIC_PROPERTIES, { params });
            setProperties(res.data);
        } catch (err) {
            console.error('Failed to fetch properties:', err);
            setError('Failed to load properties. Please try again.');
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const cleanedParams = Object.fromEntries(
            Object.entries(searchParams).filter(([_, v]) => v !== '')
        );
        fetchProperties(cleanedParams);
    };

    const handleChange = (e) => {
        setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Header />
            <HeroSection searchParams={searchParams} handleChange={handleChange} handleSearch={handleSearch} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Available PGs</h2>
                    <p className="text-gray-600">{properties.length} properties found</p>
                </div>
                
                <div>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading amazing PGs for you...</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-12">
                            <HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No PGs found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {properties.map(property => (
                                <PropertyCard key={property._id} property={property} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default PublicListings;