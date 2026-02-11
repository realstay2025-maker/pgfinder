// client/src/pages/owner/RoomManagement.jsx
import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
    HomeIcon, 
    UserGroupIcon,
    CurrencyRupeeIcon,
    ArrowLeftIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    BuildingOffice2Icon,
    ClipboardDocumentListIcon,
    PhoneIcon,
    TrashIcon,
    XCircleIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import OnboardTenantModal from './OnboardTenantModal';

const RoomManagement = () => {
    const { propertyId } = useParams();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRoomDetails, setShowRoomDetails] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [bulkEditData, setBulkEditData] = useState({
        selectedRooms: [],
        roomType: 'double',
        basePrice: ''
    });
    const [newRoom, setNewRoom] = useState({
        floorNumber: 1,
        roomNumber: '',
        roomType: 'single',
        basePrice: '',
        maxBeds: 1,
        gender: ''
    });
    const [editingPrice, setEditingPrice] = useState(null);
    const [showCreateRoom, setShowCreateRoom] = useState(false);

    const fetchProperty = async () => {
        if (!user || !propertyId) return;

        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [propertyRes, roomsRes] = await Promise.all([
                axios.get(`${API_ENDPOINTS.PROPERTIES}/${propertyId}`, config),
                axios.get(`${API_ENDPOINTS.ROOMS}/property/${propertyId}`, config)
            ]);
            setProperty(propertyRes.data);
            setRooms(roomsRes.data);
        } catch (err) {
            console.error('Fetch Error:', err);
            setError(err.response?.data?.error || 'Failed to load property');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpdate = async () => {
        if (bulkEditData.selectedRooms.length === 0) {
            alert('Please select rooms to update');
            return;
        }
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
            
            await axios.put(`${API_ENDPOINTS.ROOMS}/bulk-update`, {
                roomIds: bulkEditData.selectedRooms,
                updateData: {
                    roomType: bulkEditData.roomType,
                    maxBeds: bedsPerRoom[bulkEditData.roomType],
                    basePrice: parseInt(bulkEditData.basePrice)
                }
            }, config);
            
            fetchProperty();
            setShowBulkEdit(false);
            setBulkEditData({ selectedRooms: [], roomType: 'double', basePrice: '' });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update rooms');
        }
    };

    const handleCreateRoom = async () => {
        if (!newRoom.roomNumber || !newRoom.basePrice) {
            alert('Please fill in all required fields');
            return;
        }
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            await axios.post(`${API_ENDPOINTS.ROOMS}`, {
                propertyId,
                floorNumber: parseInt(newRoom.floorNumber),
                roomNumber: newRoom.roomNumber,
                roomType: newRoom.roomType,
                basePrice: parseInt(newRoom.basePrice),
                maxBeds: parseInt(newRoom.maxBeds),
                gender: newRoom.gender
            }, config);
            
            fetchProperty();
            setShowCreateRoom(false);
            setNewRoom({ floorNumber: 1, roomNumber: '', roomType: 'single', basePrice: '', maxBeds: 1, gender: '' });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create room');
        }
    };

    const openRoomDetails = (room) => {
        setSelectedRoom(room);
        setShowRoomDetails(true);
    };

    const handleRemoveTenant = async (tenantId) => {
        if (!confirm('Are you sure you want to remove this tenant?')) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            await axios.post(`${API_ENDPOINTS.OWNER}/remove-tenant`, {
                tenantId: tenantId,
                propertyId: propertyId,
                bedId: selectedRoom.tenants.find(t => t.tenantId === tenantId || t._id === tenantId)?.bedId
            }, config);
            
            fetchProperty();
            setShowRoomDetails(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to remove tenant');
        }
    };

    const handleEditRoom = (roomNumber) => {
        setEditingRoom({ originalNumber: roomNumber, newNumber: roomNumber });
    };

    const handleEditPrice = (currentPrice) => {
        setEditingPrice({ originalPrice: currentPrice, newPrice: currentPrice });
    };

    const handleSaveRoomEdit = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            const updateData = {};
            if (editingRoom) updateData.roomNumber = editingRoom.newNumber;
            if (editingPrice) updateData.basePrice = parseInt(editingPrice.newPrice);
            
            await axios.put(`${API_ENDPOINTS.ROOMS}/${selectedRoom._id}`, updateData, config);
            
            fetchProperty();
            setEditingRoom(null);
            setEditingPrice(null);
            setShowRoomDetails(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update room');
        }
    };

    const handleDeleteRoom = async () => {
        if (!confirm('Are you sure you want to delete this room? All tenants will be removed.')) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            await axios.delete(`${API_ENDPOINTS.ROOMS}/${selectedRoom._id}`, config);
            
            fetchProperty();
            setShowRoomDetails(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete room');
        }
    };

    useEffect(() => {
        fetchProperty();
    }, [user, propertyId]);

    if (loading) {
        return (
            <div className="p-6 text-center flex items-center justify-center min-h-[400px]">
                <ArrowPathIcon className="w-6 h-6 mr-3 animate-spin text-primary-dark" /> Loading Rooms...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-600 border-l-4 border-red-500 bg-red-50 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
                <button onClick={fetchProperty} className="mt-3 text-sm text-primary-dark hover:underline">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header Section */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="p-6">
                    <div className="flex items-center space-x-4">
                        <Link to="/owner/properties" className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                        </Link>
                        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                            <BuildingOffice2Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Room Management
                            </h1>
                            {property && (
                                <p className="text-gray-500 text-sm mt-1">{property.title}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Room Overview Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <span className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></span>
                                Room Management
                            </h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBulkEdit(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center shadow-lg"
                                >
                                    <PencilSquareIcon className="w-5 h-5 mr-2" />
                                    Bulk Edit
                                </button>
                                <button
                                    onClick={() => setShowCreateRoom(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center shadow-lg"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Add Room
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {!rooms || rooms.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Rooms Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    Create rooms to start managing your property.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(() => {
                                    // Group rooms by type
                                    const roomsByType = rooms.reduce((acc, room) => {
                                        if (!acc[room.sharingType]) {
                                            acc[room.sharingType] = [];
                                        }
                                        acc[room.sharingType].push(room);
                                        return acc;
                                    }, {});
                                    
                                    return Object.entries(roomsByType).map(([roomType, roomsOfType], index) => (
                                        <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                                                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent capitalize">
                                                        {roomType} Sharing ({roomsOfType[0]?.gender || 'Mixed'})
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center text-gray-600">
                                                    <UserGroupIcon className="w-5 h-5 mr-2" />
                                                    <span>{roomsOfType.length} rooms</span>
                                                </div>
                                                
                                                <div className="flex items-center text-gray-600">
                                                    <CurrencyRupeeIcon className="w-5 h-5 mr-2" />
                                                    <span>₹{roomsOfType[0]?.basePrice || 0}/month per bed</span>
                                                </div>
                                                
                                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                                    <div className="text-sm text-gray-600 space-y-3">
                                                        <div className="flex justify-between">
                                                            <span>Total Beds:</span>
                                                            <span className="font-medium">
                                                                {roomsOfType.reduce((sum, room) => sum + room.capacity, 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Occupied Beds:</span>
                                                            <span className="font-medium text-red-600">
                                                                {roomsOfType.reduce((sum, room) => sum + room.currentOccupancy, 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Available Beds:</span>
                                                            <span className="font-medium text-green-600">
                                                                {roomsOfType.reduce((sum, room) => sum + (room.capacity - room.currentOccupancy), 0)}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
                                                            <div 
                                                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                                                                style={{ 
                                                                    width: `${(() => {
                                                                        const totalBeds = roomsOfType.reduce((sum, room) => sum + room.capacity, 0);
                                                                        const occupiedBeds = roomsOfType.reduce((sum, room) => sum + room.currentOccupancy, 0);
                                                                        return totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
                                                                    })()}%` 
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Room Grid with Details */}
                                                <div className="mt-4">
                                                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                        <HomeIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                                        Rooms ({roomsOfType.length})
                                                    </h5>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {roomsOfType.map(room => {
                                                            const isOccupied = room.currentOccupancy > 0;
                                                            const isFull = room.currentOccupancy >= room.capacity;
                                                            
                                                            return (
                                                                <button
                                                                    key={room._id}
                                                                    onClick={() => openRoomDetails(room)}
                                                                    className={`p-3 rounded-xl text-xs font-medium transition-all duration-200 border shadow-sm hover:shadow-md ${
                                                                        isFull ? 'bg-gradient-to-br from-red-50 to-red-100 text-red-800 border-red-200 hover:from-red-100 hover:to-red-200' :
                                                                        isOccupied ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200 hover:from-yellow-100 hover:to-yellow-200' :
                                                                        'bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-200 hover:from-green-100 hover:to-green-200'
                                                                    }`}
                                                                >
                                                                    <div className="font-bold">{room.roomNumber}</div>
                                                                    {room.floorNumber && <div className="text-xs">Floor {room.floorNumber}</div>}
                                                                    <div className="text-xs">{room.currentOccupancy}/{room.capacity}</div>
                                                                    {room.tenants && room.tenants.length > 0 && (
                                                                        <div className="flex -space-x-1 mt-2 justify-center">
                                                                            {room.tenants.slice(0, 2).map(tenant => (
                                                                                <div key={tenant._id} className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs border-2 border-white shadow-sm">
                                                                                    {tenant.name.charAt(0)}
                                                                                </div>
                                                                            ))}
                                                                            {room.tenants.length > 2 && (
                                                                                <div className="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white shadow-sm">
                                                                                    +
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modals */}
                {showAssignModal && (
                    <OnboardTenantModal 
                        onClose={() => setShowAssignModal(false)}
                        onSuccess={() => {
                            setShowAssignModal(false);
                            fetchProperty();
                        }}
                        selectedRoomId={selectedRoom?._id}
                    />
                )}

                {/* Bulk Edit Modal */}
                {showBulkEdit && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Bulk Edit Rooms</h3>
                                <button
                                    onClick={() => setShowBulkEdit(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <XCircleIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-3">Select Rooms to Update:</h4>
                                    <div className="max-h-96 overflow-y-auto border rounded-xl p-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            {rooms.map(room => (
                                                <label key={room._id} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={bulkEditData.selectedRooms.includes(room._id)}
                                                        onChange={(e) => {
                                                            const selected = e.target.checked
                                                                ? [...bulkEditData.selectedRooms, room._id]
                                                                : bulkEditData.selectedRooms.filter(id => id !== room._id);
                                                            setBulkEditData({ ...bulkEditData, selectedRooms: selected });
                                                        }}
                                                    />
                                                    <span className="text-sm">{room.roomNumber}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3">Update Settings:</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                                            <select
                                                value={bulkEditData.roomType}
                                                onChange={(e) => setBulkEditData({ ...bulkEditData, roomType: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="single">Single Sharing</option>
                                                <option value="double">Double Sharing</option>
                                                <option value="triple">Triple Sharing</option>
                                                <option value="quad">Quad Sharing</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (₹/month per bed)</label>
                                            <input
                                                type="number"
                                                value={bulkEditData.basePrice}
                                                onChange={(e) => setBulkEditData({ ...bulkEditData, basePrice: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Enter price"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                <p className="text-sm text-gray-600">
                                    {bulkEditData.selectedRooms.length} rooms selected
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleBulkUpdate}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                                    >
                                        Update Selected Rooms
                                    </button>
                                    <button
                                        onClick={() => setShowBulkEdit(false)}
                                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomManagement;