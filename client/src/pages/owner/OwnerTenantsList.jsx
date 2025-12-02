import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
    UserGroupIcon, 
    EyeIcon, 
    PhoneIcon, 
    EnvelopeIcon,
    BuildingOfficeIcon,
    XCircleIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const OwnerTenantsList = () => {
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProperty, setSelectedProperty] = useState('all');
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await axios.get(`${API_ENDPOINTS.OWNER}/roster`, config);
            setProperties(response.data);
        } catch (error) {
            console.error('Error fetching tenants:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get all tenants in table format
    const allTenants = [];
    properties.forEach(property => {
        property.rooms.forEach(room => {
            room.tenants.forEach(tenant => {
                allTenants.push({
                    ...tenant,
                    propertyId: property._id,
                    propertyName: property.title,
                    roomNumber: room.roomNumber,
                    roomType: room.roomType.type
                });
            });
        });
    });

    // Filter tenants
    const filteredTenants = allTenants.filter(tenant => {
        const matchesSearch = tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tenant.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProperty = selectedProperty === 'all' || tenant.propertyId === selectedProperty;
        return matchesSearch && matchesProperty;
    });

    const viewProfile = (tenant) => {
        setSelectedTenant(tenant);
        setShowProfile(true);
    };

    if (loading) {
        return (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading tenants...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center">
                    <UserGroupIcon className="w-10 h-10 mr-3 text-purple-600" />
                    All Tenants
                </h1>
                <p className="text-gray-600 text-lg">Manage all your tenants across properties</p>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by tenant name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">All Properties</option>
                    {properties.map(property => (
                        <option key={property._id} value={property._id}>{property.title}</option>
                    ))}
                </select>
            </div>

            {/* Tenants Table */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tenant</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Property</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Room</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTenants.map((tenant, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                                {tenant.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{tenant.name}</div>
                                                <div className="text-sm text-gray-600">{tenant.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{tenant.phone}</div>
                                        <div className="text-sm text-gray-600">{tenant.emergencyContact}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{tenant.propertyName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">Room {tenant.roomNumber}</div>
                                        <div className="text-sm text-gray-600 capitalize">{tenant.roomType} sharing</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => viewProfile(tenant)}
                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View Profile"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            {tenant.phone && (
                                                <button
                                                    onClick={() => window.open(`tel:${tenant.phone}`, '_self')}
                                                    className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Call"
                                                >
                                                    <PhoneIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => window.open(`mailto:${tenant.email}`, '_self')}
                                                className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Email"
                                            >
                                                <EnvelopeIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredTenants.length === 0 && (
                    <div className="text-center py-12">
                        <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No tenants found</h3>
                        <p className="text-gray-600">
                            {searchTerm || selectedProperty !== 'all' ? 'Try adjusting your filters' : 'No tenants have been added yet'}
                        </p>
                    </div>
                )}
            </div>

            {/* Tenant Profile Modal */}
            {showProfile && selectedTenant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Tenant Profile</h3>
                            <button
                                onClick={() => setShowProfile(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800 border-b pb-2">Basic Information</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-600">Name</label>
                                        <p className="font-medium">{selectedTenant.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Email</label>
                                        <p className="font-medium">{selectedTenant.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Phone</label>
                                        <p className="font-medium">{selectedTenant.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Emergency Contact</label>
                                        <p className="font-medium">{selectedTenant.emergencyContact}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Aadhaar Number</label>
                                        <p className="font-medium">{selectedTenant.aadhaarNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800 border-b pb-2">Address Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-600">Current Address</label>
                                        <p className="font-medium text-sm">{selectedTenant.address || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Permanent Address</label>
                                        <p className="font-medium text-sm">{selectedTenant.permanentAddress || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800 border-b pb-2">Occupation Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-600">Type</label>
                                        <p className="font-medium capitalize">{selectedTenant.occupationType || 'Not specified'}</p>
                                    </div>
                                    {selectedTenant.occupationType === 'working' && selectedTenant.companyName && (
                                        <div>
                                            <label className="text-sm text-gray-600">Company</label>
                                            <p className="font-medium">{selectedTenant.companyName}</p>
                                        </div>
                                    )}
                                    {selectedTenant.occupationType === 'student' && selectedTenant.collegeName && (
                                        <div>
                                            <label className="text-sm text-gray-600">College</label>
                                            <p className="font-medium">{selectedTenant.collegeName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800 border-b pb-2">Property Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-600">Property</label>
                                        <p className="font-medium">{selectedTenant.propertyName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Room Number</label>
                                        <p className="font-medium">{selectedTenant.roomNumber}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Room Type</label>
                                        <p className="font-medium capitalize">{selectedTenant.roomType} sharing</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-800 border-b pb-2 mb-4">Documents</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="text-sm text-gray-600">Aadhaar Card</label>
                                    {selectedTenant.documents?.aadhaarCard ? (
                                        <div className="mt-1">
                                            <a 
                                                href={`http://localhost:5000/${selectedTenant.documents.aadhaarCard}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                                            >
                                                Download Aadhaar Card
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-1">Not uploaded</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="text-sm text-gray-600">Photo</label>
                                    {selectedTenant.documents?.photo ? (
                                        <div className="mt-1">
                                            <a 
                                                href={`http://localhost:5000/${selectedTenant.documents.photo}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                                            >
                                                View Photo
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-1">Not uploaded</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerTenantsList;