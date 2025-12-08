import React, { useState, useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchFilters from '../components/SearchFilters';
import PropertyMap from '../components/PropertyMap';
import { API_ENDPOINTS } from '../config/api';
import { 
    BookmarkIcon, 
    BellIcon, 
    MapIcon, 
    ListBulletIcon,
    HeartIcon,
    ShareIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const SearchPage = () => {
    usePageTitle('Search Properties');
    
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [savedSearches, setSavedSearches] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [favorites, setFavorites] = useState(new Set());

    useEffect(() => {
        fetchRecommendations();
        fetchSavedSearches();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_ENDPOINTS.SEARCH}/recommendations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setRecommendations(data);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        }
    };

    const fetchSavedSearches = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_ENDPOINTS.SEARCH}/saved`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSavedSearches(data);
            }
        } catch (error) {
            console.error('Failed to fetch saved searches:', error);
        }
    };

    const handleSearch = async (filters) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== '') {
                    if (Array.isArray(value)) {
                        queryParams.append(key, value.join(','));
                    } else {
                        queryParams.append(key, value);
                    }
                }
            });

            const response = await fetch(`${API_ENDPOINTS.SEARCH}/properties?${queryParams}`);
            const data = await response.json();
            
            setProperties(data.properties || []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSearch = async (searchData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to save searches');
                return;
            }

            const response = await fetch(`${API_ENDPOINTS.SEARCH}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(searchData)
            });

            if (response.ok) {
                alert('Search saved successfully!');
                fetchSavedSearches();
            }
        } catch (error) {
            console.error('Failed to save search:', error);
        }
    };

    const toggleFavorite = (propertyId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(propertyId)) {
                newFavorites.delete(propertyId);
            } else {
                newFavorites.add(propertyId);
            }
            return newFavorites;
        });
    };

    const PropertyCard = ({ property }) => (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 group">
            {/* Property Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                {property.images && property.images.length > 0 ? (
                    <img 
                        src={`${API_ENDPOINTS.BASE_URL}/uploads/${property.images[0]}`}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                        No Image Available
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2">
                    <button
                        onClick={() => toggleFavorite(property._id)}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
                    >
                        {favorites.has(property._id) ? (
                            <HeartSolidIcon className="h-5 w-5 text-red-400" />
                        ) : (
                            <HeartIcon className="h-5 w-5 text-white" />
                        )}
                    </button>
                    <button className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors">
                        <ShareIcon className="h-5 w-5 text-white" />
                    </button>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-3 left-3">
                    <div className="bg-green-500/90 backdrop-blur-md px-3 py-1 rounded-full">
                        <span className="text-white font-semibold">
                            ₹{property.roomTypes?.[0]?.basePrice || 'N/A'}/month
                        </span>
                    </div>
                </div>
            </div>

            {/* Property Details */}
            <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {property.title}
                </h3>
                
                <p className="text-gray-300 text-sm mb-3">
                    {property.address.line1}, {property.address.city}, {property.address.state}
                </p>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {property.amenities.slice(0, 3).map(amenity => (
                            <span 
                                key={amenity}
                                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs capitalize"
                            >
                                {amenity.replace('_', ' ')}
                            </span>
                        ))}
                        {property.amenities.length > 3 && (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-md text-xs">
                                +{property.amenities.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Room Types */}
                <div className="flex gap-2 mb-4">
                    {property.roomTypes?.map(room => (
                        <span 
                            key={room.type}
                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs capitalize"
                        >
                            {room.type} - ₹{room.basePrice}
                        </span>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                        View Details
                    </button>
                    <button className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Header />
            <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                        Find Your Perfect PG
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Search from thousands of verified PG accommodations
                    </p>
                </div>

                {/* Search Filters */}
                <SearchFilters onSearch={handleSearch} onSaveSearch={handleSaveSearch} />

                {/* Saved Searches */}
                {savedSearches.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <BookmarkIcon className="h-6 w-6" />
                            Saved Searches
                        </h3>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {savedSearches.map(search => (
                                <button
                                    key={search._id}
                                    onClick={() => handleSearch(search.filters)}
                                    className="flex-shrink-0 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                                >
                                    {search.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* View Mode Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-white font-medium">
                            {properties.length} properties found
                        </span>
                        {loading && (
                            <div className="flex items-center gap-2 text-blue-300">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
                                Searching...
                            </div>
                        )}
                    </div>
                    
                    <div className="flex bg-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                                viewMode === 'list' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            <ListBulletIcon className="h-5 w-5" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                                viewMode === 'map' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            <MapIcon className="h-5 w-5" />
                            Map
                        </button>
                    </div>
                </div>

                {/* Results */}
                {viewMode === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map(property => (
                            <PropertyCard key={property._id} property={property} />
                        ))}
                    </div>
                ) : (
                    <PropertyMap properties={properties} />
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <BellIcon className="h-6 w-6" />
                            Recommended for You
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendations.slice(0, 3).map(property => (
                                <PropertyCard key={property._id} property={property} />
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && properties.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-4">
                            No properties found matching your criteria
                        </div>
                        <button
                            onClick={() => handleSearch({})}
                            className="px-6 py-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                            View All Properties
                        </button>
                    </div>
                )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SearchPage;