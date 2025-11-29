// client/src/pages/owner/OnboardTenantModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const API_ONBOARD_URL = 'http://localhost:5000/api/tenants/onboard';
const API_ROOMS_URL = 'http://localhost:5000/api/rooms/available'; // Assuming a generic API to fetch owner's rooms

const OnboardTenantModal = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        tenantId: '',
        roomId: '',
        checkInDate: new Date().toISOString().split('T')[0]
    });
    const [availableRooms, setAvailableRooms] = useState([]);
    const [availableTenants, setAvailableTenants] = useState([]);
    const [filteredTenants, setFilteredTenants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Fetch available rooms and tenants
    useEffect(() => {
        const fetchData = async () => {
            setRoomsLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [roomsRes, tenantsRes] = await Promise.all([
                    axios.get(API_ROOMS_URL, config),
                    axios.get('http://localhost:5000/api/owner/available-tenants', config)
                ]);
                
                // Filter rooms to only show those with capacity
                const openRooms = roomsRes.data.filter(r => r.currentOccupancy < r.capacity);
                setAvailableRooms(openRooms);
                
                // Set available tenants (those without room assignment)
                setAvailableTenants(tenantsRes.data);
                setFilteredTenants(tenantsRes.data);
                
                if (openRooms.length > 0) {
                    setFormData(prev => ({ ...prev, roomId: openRooms[0]._id }));
                }
                
                // Auto-select if only one tenant
                if (tenantsRes.data.length === 1) {
                    setFormData(prev => ({ ...prev, tenantId: tenantsRes.data[0]._id }));
                    setSearchTerm(tenantsRes.data[0].name);
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data.");
            } finally {
                setRoomsLoading(false);
            }
        };

        fetchData();
    }, [user.token]);

    // Filter tenants based on search
    useEffect(() => {
        const filtered = availableTenants.filter(tenant => 
            tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTenants(filtered);
    }, [searchTerm, availableTenants]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTenantSelect = (tenant) => {
        setFormData(prev => ({ ...prev, tenantId: tenant._id }));
        setSearchTerm(tenant.name);
        setShowDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!formData.tenantId || !formData.roomId) {
            setError("Please select both tenant and room.");
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.post('http://localhost:5000/api/owner/assign-tenant-room', formData, config);
            
            setSuccessMessage(`Tenant successfully assigned to room!`);
            
            setTimeout(() => {
                onSuccess();
            }, 2000); 

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to assign tenant to room.');
        } finally {
            setLoading(false);
        }
    };

    if (roomsLoading) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md flex items-center justify-center">
                    <ArrowPathIcon className="w-6 h-6 mr-2 animate-spin text-primary-dark" />
                    Loading available rooms...
                </div>
            </div>
        );
    }
    
    if ((availableRooms.length === 0 || availableTenants.length === 0) && !error) {
         return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4 text-custom-red">Cannot Assign Tenant</h3>
                    <p>{availableRooms.length === 0 ? 'All rooms are at full capacity.' : 'No available tenants to assign.'}</p>
                    <div className="flex justify-end mt-4">
                        <button onClick={onClose} className="py-2 px-4 rounded-md text-gray-700 bg-gray-200">Close</button>
                    </div>
                </div>
            </div>
         )
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <h3 className="text-2xl font-bold mb-4 text-primary-dark border-b pb-2">Assign Tenant to Room</h3>
                
                {successMessage && (
                    <div className="bg-green-100 text-accent-green p-4 rounded-md mb-4 text-sm">{successMessage}</div>
                )}
                {error && (
                    <div className="bg-red-100 text-custom-red p-4 rounded-md mb-4 text-sm">{error}</div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Tenant Selection */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Search tenant by name or email"
                                className="w-full px-3 py-2 border rounded-md pr-10"
                                required
                            />
                            <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        
                        {showDropdown && filteredTenants.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {filteredTenants.map(tenant => (
                                    <div
                                        key={tenant._id}
                                        onClick={() => handleTenantSelect(tenant)}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                    >
                                        <div className="font-medium">{tenant.name}</div>
                                        <div className="text-sm text-gray-600">{tenant.email}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Room Assignment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                        <select 
                            name="roomId" 
                            value={formData.roomId} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border rounded-md" 
                            required
                        >
                            <option value="">Select Room (Available: {availableRooms.length})</option>
                            {availableRooms.map(room => (
                                <option key={room._id} value={room._id}>
                                    {room.roomNumber} ({room.sharingType} Sharing) - ₹{room.basePrice}/mo
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                        <input 
                            type="date" 
                            name="checkInDate" 
                            value={formData.checkInDate} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border rounded-md" 
                            required 
                        />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">
                            Close
                        </button>
                        <button type="submit" disabled={loading || !!successMessage} className="py-2 px-4 rounded-md text-white bg-accent-green hover:bg-green-700 transition disabled:opacity-50">
                            {loading ? 'Assigning...' : 'Assign Tenant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OnboardTenantModal;