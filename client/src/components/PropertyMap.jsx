import React, { useState, useEffect } from 'react';
import { MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const PropertyMap = ({ properties, center, onLocationSelect }) => {
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    // Get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('Location access denied');
                }
            );
        }
    }, []);

    // Mock map component (replace with Google Maps in production)
    const MockMap = () => (
        <div className="relative w-full h-96 bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg overflow-hidden">
            {/* Map Header */}
            <div className="absolute top-4 left-4 right-4 z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <MapPinIcon className="h-5 w-5" />
                            <span className="font-medium">
                                {properties.length} properties found
                            </span>
                        </div>
                        {userLocation && (
                            <button
                                onClick={() => onLocationSelect && onLocationSelect(userLocation)}
                                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-md text-sm hover:bg-blue-500/30 transition-colors"
                            >
                                Use My Location
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mock Map Grid */}
            <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-8 grid-rows-6 h-full">
                    {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="border border-white/10"></div>
                    ))}
                </div>
            </div>

            {/* Property Markers */}
            <div className="absolute inset-0 p-8">
                {properties.slice(0, 6).map((property, index) => (
                    <div
                        key={property._id}
                        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                            selectedProperty === property._id ? 'z-20' : 'z-10'
                        }`}
                        style={{
                            left: `${20 + (index % 3) * 30}%`,
                            top: `${30 + Math.floor(index / 3) * 25}%`
                        }}
                        onClick={() => setSelectedProperty(
                            selectedProperty === property._id ? null : property._id
                        )}
                    >
                        {/* Marker */}
                        <div className={`relative ${
                            selectedProperty === property._id 
                                ? 'scale-125' 
                                : 'hover:scale-110'
                        } transition-transform`}>
                            <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                <BuildingOfficeIcon className="h-4 w-4 text-white" />
                            </div>
                            
                            {/* Price Badge */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-2 py-1 rounded text-xs font-medium shadow-lg whitespace-nowrap">
                                ₹{property.roomTypes?.[0]?.basePrice || 'N/A'}
                            </div>
                        </div>

                        {/* Property Info Popup */}
                        {selectedProperty === property._id && (
                            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-64 bg-white/95 backdrop-blur-md rounded-lg p-4 shadow-xl border border-white/20">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-800 truncate">
                                        {property.title}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {property.address.line1}, {property.address.city}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-blue-600">
                                            ₹{property.roomTypes?.[0]?.basePrice || 'N/A'}
                                        </span>
                                        <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 space-y-2">
                <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    +
                </button>
                <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    −
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Property Locations</h3>
                <div className="text-sm text-gray-300">
                    Click markers to view property details
                </div>
            </div>
            
            <MockMap />
            
            {/* Integration Note */}
            {/* <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                    <strong>Note:</strong> This is a mock map interface. In production, integrate with Google Maps API for real map functionality.
                </p>
            </div> */}
        </div>
    );
};

export default PropertyMap;