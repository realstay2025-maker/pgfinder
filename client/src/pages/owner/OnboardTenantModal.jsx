// client/src/pages/owner/OnboardTenantModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { THEME } from '../../config/theme';

import { API_ENDPOINTS } from '../../config/api';
 // Assuming a generic API to fetch owner's rooms

const OnboardTenantModal = ({ onClose, onSuccess, selectedRoomId = null }) => {
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
                    axios.get(`${API_ENDPOINTS.ROOMS}/owner`, config),
                    axios.get(`${API_ENDPOINTS.OWNER}/available-tenants`, config)
                ]);
                
                // console.log('Rooms data:', roomsRes.data);
                // console.log('Tenants data:', tenantsRes.data);
                
                // Filter rooms based on selection or capacity and gender compatibility
                const openRooms = selectedRoomId 
                    ? roomsRes.data.filter(r => r._id === selectedRoomId)
                    : roomsRes.data.filter(r => {
                        const hasCapacity = (r.occupiedBeds || 0) < (r.maxBeds || r.capacity || 1);
                        // If tenant is selected, check gender compatibility
                        if (formData.tenantId && tenantsRes.data.length > 0) {
                            const selectedTenant = tenantsRes.data.find(t => t._id === formData.tenantId);
                            if (selectedTenant && r.gender && selectedTenant.gender !== r.gender) {
                                return false;
                            }
                        }
                        return hasCapacity;
                    });
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
                } else if (tenantsRes.data.length === 0) {
                    setError('No available tenants found. Tenants must complete their profile first.');
                }

            } catch (err) {
                // console.error("Error fetching data:", err);
                setError("Failed to load data.");
            } finally {
                setRoomsLoading(false);
            }
        };

        fetchData();
    }, [user.token, selectedRoomId]);

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
            // console.log('Submitting form data:', formData);
            const res = await axios.post(`${API_ENDPOINTS.OWNER}/assign-tenant-room`, formData, config);
            
            setSuccessMessage(`Tenant successfully assigned to room!`);
            
            setTimeout(() => {
                onSuccess();
            }, 2000); 

        } catch (err) {
            // console.error(err);
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
    
    if (availableRooms.length === 0 && !error) {
         return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4 text-custom-red">Cannot Assign Tenant</h3>
                    <p>All rooms are at full capacity. Please create more rooms or remove tenants from existing rooms.</p>
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
                
                {/* Debug Info 
                <div className="bg-blue-50 p-3 rounded mb-4 text-xs">
                    <div>Available Tenants: {availableTenants.length}</div>
                    <div>Available Rooms: {availableRooms.length}</div>
                    <div>Selected Tenant ID: {formData.tenantId}</div>
                    <div>Selected Room ID: {formData.roomId}</div>
                </div>*/}
                
                {successMessage && (
                    <div className="p-4 rounded-md mb-4 text-sm font-medium" style={{backgroundColor: `${THEME.primary.base}20`, color: THEME.primary.base}}>{successMessage}</div>
                )}
                {error && (
                    <div className="p-4 rounded-md mb-4 text-sm font-medium" style={{backgroundColor: '#ef444420', color: '#ef4444'}}>{error}</div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Tenant Selection */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
                        {availableTenants.length === 1 ? (
                            // Show single tenant info when only one available
                            <div className="w-full px-3 py-2 border rounded-md bg-gray-50">
                                <div className="font-medium">{availableTenants[0].name}</div>
                                <div className="text-sm text-gray-600">{availableTenants[0].email}</div>
                            </div>
                        ) : (
                            // Show dropdown when multiple tenants available
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
                        )}
                    </div>

                    {/* Room Assignment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                        {selectedRoomId ? (
                            <div className="w-full px-3 py-2 border rounded-md bg-gray-50">
                                {availableRooms.length > 0 && (
                                    <div>
                                        <div className="font-medium">Room {availableRooms[0].roomNumber}</div>
                                        <div className="text-sm text-gray-600">
                                            {availableRooms[0].sharingType} Sharing - ₹{availableRooms[0].basePrice}/mo
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <select 
                                name="roomId" 
                                value={formData.roomId} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border rounded-md" 
                                required
                            >
                                <option value="">Select Room (Available: {availableRooms.length})</option>
                                {availableRooms.map(room => {
                                    const available = (room.maxBeds || room.capacity || 1) - (room.occupiedBeds || 0);
                                    return (
                                        <option key={room._id} value={room._id}>
                                            Room {room.roomNumber} ({room.sharingType} Sharing) - {available} bed(s) available - ₹{room.basePrice}/mo
                                        </option>
                                    );
                                })}
                            </select>
                        )}
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
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg font-medium transition-all border-2" style={{borderColor: THEME.primary.base, color: THEME.primary.base, backgroundColor: `${THEME.primary.base}10`}}>
                            Close
                        </button>
                        <button type="submit" disabled={loading || !!successMessage} className="py-2 px-4 rounded-lg font-medium text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50" style={{background: `linear-gradient(135deg, ${THEME.primary.base}, ${THEME.secondary.base})`}}>
                            {loading ? 'Assigning...' : 'Assign Tenant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OnboardTenantModal;