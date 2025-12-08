import React, { useState } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, CurrencyRupeeIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const SearchFilters = ({ onSearch, onSaveSearch }) => {
    const [filters, setFilters] = useState({
        city: '',
        area: '',
        minPrice: '',
        maxPrice: '',
        amenities: [],
        roomType: '',
        sortBy: 'createdAt'
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    const amenityOptions = [
        'wifi', 'ac', 'parking', 'laundry', 'kitchen', 
        'gym', 'security', 'power_backup', 'water_supply', 'cleaning'
    ];

    const roomTypeOptions = [
        { value: 'single', label: 'Single Sharing' },
        { value: 'double', label: 'Double Sharing' },
        { value: 'triple', label: 'Triple Sharing' },
        { value: 'quad', label: 'Quad Sharing' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenityChange = (amenity) => {
        setFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSearch = () => {
        onSearch(filters);
    };

    const handleSaveSearch = () => {
        const searchName = prompt('Enter a name for this search:');
        if (searchName) {
            onSaveSearch({ name: searchName, filters });
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MagnifyingGlassIcon className="h-6 w-6" />
                    Search Properties
                </h3>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                    Advanced
                </button>
            </div>

            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <MapPinIcon className="h-4 w-4 inline mr-1" />
                        City
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={filters.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Area</label>
                    <input
                        type="text"
                        name="area"
                        value={filters.area}
                        onChange={handleInputChange}
                        placeholder="Enter area"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Room Type</label>
                    <select
                        name="roomType"
                        value={filters.roomType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Types</option>
                        {roomTypeOptions.map(option => (
                            <option key={option.value} value={option.value} className="bg-gray-800">
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <CurrencyRupeeIcon className="h-4 w-4 inline mr-1" />
                        Min Price
                    </label>
                    <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleInputChange}
                        placeholder="Min price"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
                    <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleInputChange}
                        placeholder="Max price"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="space-y-4 mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Amenities</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {amenityOptions.map(amenity => (
                                <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.amenities.includes(amenity)}
                                        onChange={() => handleAmenityChange(amenity)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-300 capitalize">{amenity.replace('_', ' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                        <select
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="createdAt" className="bg-gray-800">Newest First</option>
                            <option value="roomTypes.basePrice" className="bg-gray-800">Price: Low to High</option>
                            <option value="-roomTypes.basePrice" className="bg-gray-800">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={handleSearch}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                    Search Properties
                </button>
                
                <button
                    onClick={handleSaveSearch}
                    className="px-6 py-3 bg-green-500/20 text-green-300 rounded-lg font-medium hover:bg-green-500/30 transition-colors"
                >
                    Save Search
                </button>
            </div>
        </div>
    );
};

export default SearchFilters;