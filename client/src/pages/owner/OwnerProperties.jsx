// client/src/pages/owner/OwnerProperties.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
    HomeModernIcon, 
    ArrowPathIcon, 
    PencilSquareIcon,
    EyeIcon,
    TrashIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// Base URL for property operations
const API_OWNER_PROPERTIES = 'http://localhost:5000/api/properties/my';
// Base URL for serving static uploaded images
// Note: You must ensure your backend serves the 'uploads' folder statically!
const BASE_UPLOAD_URL = 'http://localhost:5000'; 

const OwnerProperties = () => {
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOwnerProperties = async () => {
        if (!user || user.role !== 'pg_owner') return;

        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_OWNER_PROPERTIES, config);
            setProperties(res.data);
            
        } catch (err) {
            console.error("Fetch Owner Properties Error:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to load properties. Check backend owner API route.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (propertyId) => {
        if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/properties/${propertyId}`, config);
            
            // Remove from local state
            setProperties(properties.filter(p => p._id !== propertyId));
            
        } catch (err) {
            console.error('Delete Property Error:', err);
            alert('Failed to delete property: ' + (err.response?.data?.error || err.message));
        }
    };

    useEffect(() => {
        fetchOwnerProperties();
    }, [user]);

    // Helper function to render status badge
    const renderStatusBadge = (status) => {
        let colorClass = 'bg-gray-200 text-gray-800';
        let Icon = ClockIcon;

        if (status === 'approved') {
            colorClass = 'bg-accent-green/20 text-accent-green border border-accent-green';
            Icon = CheckCircleIcon;
        } else if (status === 'rejected') {
            colorClass = 'bg-custom-red/20 text-custom-red border border-custom-red';
            Icon = XCircleIcon;
        } else if (status === 'pending') {
            colorClass = 'bg-yellow-200 text-yellow-800 border border-yellow-600';
            Icon = ClockIcon;
        }

        return (
            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                <Icon className="w-4 h-4 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-6 text-xl text-center flex items-center justify-center min-h-[400px]">
                <ArrowPathIcon className="w-6 h-6 mr-3 animate-spin text-primary-dark" /> Loading Your Properties...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-custom-red border-l-4 border-custom-red bg-red-100/50 rounded-md">
                <p className="font-semibold">Error Loading Data:</p>
                <p>{error}</p>
                <button onClick={fetchOwnerProperties} className="mt-3 text-sm text-primary-dark hover:underline">Try Refreshing</button>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                    <HomeModernIcon className="w-7 h-7 mr-2 text-primary-dark" /> Your Listed Properties ({properties.length})
                </h1>
                <Link 
                    to="/owner/add-property" 
                    className="flex items-center py-2 px-4 rounded-md text-white bg-primary-dark hover:bg-blue-900 transition text-sm font-medium"
                >
                    <CheckCircleIcon className="w-5 h-5 mr-1" /> Add New Property
                </Link>
            </div>

            {properties.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">No Properties Found</h2>
                    <p className="text-gray-500 mt-2">You haven't listed any PG properties yet. Click 'Add New Property' to start!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {properties.map((property) => (
                        <div key={property._id} className="bg-white p-4 md:p-6 rounded-xl shadow-lg border-l-4 border-primary-dark/50 hover:shadow-xl transition duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                
                                {/* Image Preview (Col 1) */}
                                <div className="md:col-span-1">
                                    <img 
                                        src={property.images && property.images.length > 0 
                                             ? `${BASE_UPLOAD_URL}${property.images[0]}` // Use the first uploaded image path
                                             : 'https://via.placeholder.com/150?text=No+Image'}
                                        alt={property.title}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                </div>

                                {/* Details (Col 2 & 3) */}
                                <div className="md:col-span-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-xl font-bold text-gray-900">{property.title}</h2>
                                        {renderStatusBadge(property.status)}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                                        <MapPinIcon className='w-4 h-4 mr-1' /> 
                                        {property.address?.line1}, {property.address?.city}, {property.address?.state}
                                    </p>
                                    <p className="text-md font-semibold text-primary-dark mt-2">
                                        Starting Rent: ₹{property.roomTypes && property.roomTypes.length > 0 
                                            ? Math.min(...property.roomTypes.map(r => Number(r.basePrice || Infinity))) 
                                            : 'N/A'}
                                    </p>
                                    {property.status === 'rejected' && property.rejectionReason && (
                                        <p className="text-sm text-custom-red italic mt-2">
                                            Reason: {property.rejectionReason}
                                        </p>
                                    )}
                                </div>

                                {/* Actions (Col 4) */}
                                <div className="md:col-span-1 flex flex-col space-y-2 pt-1">
                                    <Link
                                        to={`/owner/rooms/${property._id}`}
                                        className="flex items-center justify-center px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                                    >
                                        <EyeIcon className="w-5 h-5 mr-1" /> View/Manage Rooms
                                    </Link>
                                    <Link
                                        to={`/owner/edit-property/${property._id}`}
                                        className="flex items-center justify-center px-3 py-2 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition"
                                    >
                                        <PencilSquareIcon className="w-5 h-5 mr-1" /> Edit Details
                                    </Link>
                                    {/* Delete Button (Optional - requires backend DELETE route) */}
                                    <button
                                        onClick={() => handleDelete(property._id)}
                                        className="flex items-center justify-center px-3 py-2 text-sm font-medium bg-red-100 text-custom-red rounded-md hover:bg-red-200 transition"
                                    >
                                        <TrashIcon className="w-5 h-5 mr-1" /> Delete
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OwnerProperties;