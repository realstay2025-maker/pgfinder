// client/src/pages/admin/AdminPropertyApprovals.jsx
import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { BuildingStorefrontIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../config/theme';
import axios from 'axios';
import usePageTitle from '../../hooks/usePageTitle';

const AdminPropertyApprovals = () => {
    usePageTitle('Property Approvals');
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchPendingProperties();
    }, []);

    const fetchPendingProperties = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ENDPOINTS.PROPERTIES}`, config);
            setProperties(res.data.filter(p => p.status === 'pending'));
        } catch (err) {
            console.error('Failed to fetch properties:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (propertyId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/status`, { status }, config);
            setProperties(properties.filter(p => p._id !== propertyId));
            setShowModal(false);
        } catch (err) {
            console.error('Failed to update property status:', err);
        }
    };

    const viewProperty = (property) => {
        setSelectedProperty(property);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="space-y-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="h-20 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <BuildingStorefrontIcon className="w-8 h-8 mr-2" style={{color: THEME.primary.base}} />
                Property Approvals
                <span className="ml-3 text-sm font-medium px-2.5 py-0.5 rounded-full" style={{backgroundColor: `${THEME.primary.base}20`, color: THEME.primary.base}}>
                    {properties.length} Pending
                </span>
            </h1>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {properties.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircleIcon className="w-16 h-16 mx-auto mb-4" style={{color: THEME.primary.base}} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-500">No properties pending approval.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {properties.map((property) => (
                                    <tr key={property._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <img className="h-12 w-12 rounded-lg object-cover" 
                                                         src={property.images?.[0] || '/api/placeholder/100/100'} 
                                                         alt={property.title} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{property.title}</div>
                                                    <div className="text-sm text-gray-500">₹{property.basePrice}/month</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {property.owner?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {property.address?.city || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(property.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => viewProperty(property)} className="text-blue-600 hover:text-blue-900">
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleApproval(property._id, 'approved')} className="text-green-600 hover:text-green-900">
                                                <CheckCircleIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleApproval(property._id, 'rejected')} className="text-red-600 hover:text-red-900">
                                                <XCircleIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Property Details Modal */}
            {showModal && selectedProperty && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">{selectedProperty.title}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <img src={selectedProperty.images?.[0] || '/api/placeholder/400/300'} 
                                     alt={selectedProperty.title} 
                                     className="w-full h-64 object-cover rounded-lg" />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Details</h4>
                                    <p className="text-gray-600">Rent: ₹{selectedProperty.basePrice}/month</p>
                                    <p className="text-gray-600">Address: {selectedProperty.address?.line1}, {selectedProperty.address?.city}</p>
                                    <p className="text-gray-600">Owner: {selectedProperty.ownerId?.name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Room Types</h4>
                                    {selectedProperty.roomTypes?.map((room, idx) => (
                                        <p key={idx} className="text-gray-600">
                                            {room.type}: {room.availableCount} rooms
                                        </p>
                                    ))}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Amenities</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProperty.amenities?.map((amenity, idx) => (
                                            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-4 mt-6">
                            <button onClick={() => handleApproval(selectedProperty._id, 'rejected')} 
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                Reject
                            </button>
                            <button onClick={() => handleApproval(selectedProperty._id, 'approved')} 
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPropertyApprovals;