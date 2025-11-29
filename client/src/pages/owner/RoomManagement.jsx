// client/src/pages/owner/RoomManagement.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
    HomeIcon, 
    UserGroupIcon,
    CurrencyRupeeIcon,
    ArrowLeftIcon,
    ArrowPathIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

const RoomManagement = () => {
    const { propertyId } = useParams();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editData, setEditData] = useState({});
    const [showRoomDetails, setShowRoomDetails] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);

    const fetchProperty = async () => {
        if (!user || !propertyId) return;

        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`http://localhost:5000/api/properties/${propertyId}`, config);
            setProperty(res.data);
        } catch (err) {
            console.error('Fetch Error:', err);
            setError(err.response?.data?.error || 'Failed to load property');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (index, roomType) => {
        setEditingIndex(index);
        setEditData({ ...roomType });
    };

    const handleSave = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const updatedRoomTypes = [...property.roomTypes];
            updatedRoomTypes[editingIndex] = editData;
            
            await axios.put(`http://localhost:5000/api/properties/${propertyId}`, {
                roomTypes: updatedRoomTypes
            }, config);
            
            setProperty({ ...property, roomTypes: updatedRoomTypes });
            setEditingIndex(-1);
            setEditData({});
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update room type');
        }
    };

    const handleCancel = () => {
        setEditingIndex(-1);
        setEditData({});
    };

    const openRoomDetails = (roomType, roomNumber) => {
        const roomTenants = roomType.tenants?.filter(t => t.roomNumber === roomNumber) || [];
        setSelectedRoom({ roomType, roomNumber, tenants: roomTenants });
        setShowRoomDetails(true);
    };

    const handleRemoveTenant = async (tenantId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const roomTypeIndex = property.roomTypes.findIndex(rt => rt.type === selectedRoom.roomType.type);
            
            await axios.delete(`http://localhost:5000/api/properties/${propertyId}/remove-tenant`, {
                data: { roomTypeIndex, tenantId },
                ...config
            });
            
            fetchProperty();
            setShowRoomDetails(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to remove tenant');
        }
    };

    const handleEditRoom = (roomNumber) => {
        setEditingRoom({ originalNumber: roomNumber, newNumber: roomNumber });
    };

    const handleSaveRoomEdit = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const updatedRoomTypes = [...property.roomTypes];
            const roomTypeIndex = updatedRoomTypes.findIndex(rt => rt.type === selectedRoom.roomType.type);
            
            // Update all tenants with the old room number to the new room number
            updatedRoomTypes[roomTypeIndex].tenants = updatedRoomTypes[roomTypeIndex].tenants.map(tenant => 
                tenant.roomNumber === editingRoom.originalNumber 
                    ? { ...tenant, roomNumber: editingRoom.newNumber }
                    : tenant
            );
            
            await axios.put(`http://localhost:5000/api/properties/${propertyId}`, {
                roomTypes: updatedRoomTypes
            }, config);
            
            setProperty({ ...property, roomTypes: updatedRoomTypes });
            setEditingRoom(null);
            setShowRoomDetails(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update room');
        }
    };

    const handleDeleteRoom = async () => {
        if (!confirm('Are you sure you want to delete this room? All tenants will be removed.')) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const updatedRoomTypes = [...property.roomTypes];
            const roomTypeIndex = updatedRoomTypes.findIndex(rt => rt.type === selectedRoom.roomType.type);
            
            // Remove all tenants from this room
            updatedRoomTypes[roomTypeIndex].tenants = updatedRoomTypes[roomTypeIndex].tenants.filter(
                tenant => tenant.roomNumber !== selectedRoom.roomNumber
            );
            
            // Decrease room count
            updatedRoomTypes[roomTypeIndex].availableCount = Math.max(0, updatedRoomTypes[roomTypeIndex].availableCount - 1);
            
            await axios.put(`http://localhost:5000/api/properties/${propertyId}`, {
                roomTypes: updatedRoomTypes
            }, config);
            
            setProperty({ ...property, roomTypes: updatedRoomTypes });
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
                <ArrowPathIcon className="w-6 h-6 mr-3 animate-spin text-primary-dark" /> Loading Room Types...
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
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Link to="/owner/properties" className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                        <HomeIcon className="w-6 h-6 md:w-8 md:h-8 mr-2 text-primary-dark" />
                        Room Types & Pricing
                    </h1>
                    {property && (
                        <p className="text-gray-600 mt-1">{property.title}</p>
                    )}
                </div>
            </div>

            {/* Room Types Grid */}
            {!property?.roomTypes || property.roomTypes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Room Types Configured</h3>
                    <p className="text-gray-500 mb-4">Edit your property to add room types and pricing.</p>
                    <Link
                        to={`/owner/edit-property/${propertyId}`}
                        className="px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-blue-900 transition"
                    >
                        Edit Property
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {property.roomTypes.map((roomType, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary-dark">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900 capitalize">
                                    {roomType.type} Sharing
                                </h3>
                                <button
                                    onClick={() => handleEdit(index, roomType)}
                                    className="p-2 text-gray-500 hover:text-primary-dark hover:bg-gray-100 rounded-lg transition"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {editingIndex === index ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹/bed)</label>
                                        <input
                                            type="number"
                                            value={editData.basePrice || ''}
                                            onChange={(e) => setEditData({ ...editData, basePrice: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Count</label>
                                        <input
                                            type="number"
                                            value={editData.availableCount || ''}
                                            onChange={(e) => setEditData({ ...editData, availableCount: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Occupied Beds</label>
                                        <input
                                            type="number"
                                            value={editData.occupiedBeds || 0}
                                            onChange={(e) => setEditData({ ...editData, occupiedBeds: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
                                            min="0"
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center text-gray-600">
                                        <UserGroupIcon className="w-5 h-5 mr-2" />
                                        <span>{roomType.availableCount || 0} rooms</span>
                                    </div>
                                    
                                    <div className="flex items-center text-gray-600">
                                        <CurrencyRupeeIcon className="w-5 h-5 mr-2" />
                                        <span>₹{roomType.basePrice || 0}/month per bed</span>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="text-sm text-gray-600 space-y-2">
                                            <div className="flex justify-between">
                                                <span>Total Beds:</span>
                                                <span className="font-medium">
                                                    {(() => {
                                                        const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
                                                        return (roomType.availableCount || 0) * (bedsPerRoom[roomType.type] || 1);
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Occupied Beds:</span>
                                                <span className="font-medium text-red-600">{roomType.tenants?.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Available Beds:</span>
                                                <span className="font-medium text-green-600">
                                                    {(() => {
                                                        const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
                                                        const totalBeds = (roomType.availableCount || 0) * (bedsPerRoom[roomType.type] || 1);
                                                        return totalBeds - (roomType.tenants?.length || 0);
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div 
                                                    className="bg-primary-dark h-2 rounded-full transition-all duration-300"
                                                    style={{ 
                                                        width: `${(() => {
                                                            const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
                                                            const totalBeds = (roomType.availableCount || 0) * (bedsPerRoom[roomType.type] || 1);
                                                            return totalBeds > 0 ? ((roomType.tenants?.length || 0) / totalBeds) * 100 : 0;
                                                        })()}%` 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Room Grid with Details */}
                                    <div className="mt-4">
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Rooms ({roomType.availableCount || 0}):</h5>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(() => {
                                                const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
                                                const roomCount = roomType.availableCount || 0;
                                                const rooms = [];
                                                
                                                for (let i = 1; i <= roomCount; i++) {
                                                    const roomNumber = `${roomType.type.charAt(0).toUpperCase()}${i.toString().padStart(2, '0')}`;
                                                    const roomTenants = roomType.tenants?.filter(t => t.roomNumber === roomNumber) || [];
                                                    const maxBeds = bedsPerRoom[roomType.type] || 1;
                                                    const isOccupied = roomTenants.length > 0;
                                                    const isFull = roomTenants.length >= maxBeds;
                                                    
                                                    rooms.push(
                                                        <button
                                                            key={roomNumber}
                                                            onClick={() => openRoomDetails(roomType, roomNumber)}
                                                            className={`p-2 rounded text-xs font-medium transition border ${
                                                                isFull ? 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200' :
                                                                isOccupied ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200' :
                                                                'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                                                            }`}
                                                        >
                                                            <div className="font-bold">{roomNumber}</div>
                                                            <div className="text-xs">{roomTenants.length}/{maxBeds}</div>
                                                            {roomTenants.length > 0 && (
                                                                <div className="flex -space-x-1 mt-1 justify-center">
                                                                    {roomTenants.slice(0, 2).map(tenant => (
                                                                        <div key={tenant._id} className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border border-white">
                                                                            {tenant.name.charAt(0)}
                                                                        </div>
                                                                    ))}
                                                                    {roomTenants.length > 2 && (
                                                                        <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs border border-white">
                                                                            +
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                }
                                                
                                                return rooms;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Room Details Modal */}
            {showRoomDetails && selectedRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">
                                {editingRoom ? (
                                    <div className="flex items-center space-x-2">
                                        <span>Room</span>
                                        <input
                                            type="text"
                                            value={editingRoom.newNumber}
                                            onChange={(e) => setEditingRoom({ ...editingRoom, newNumber: e.target.value })}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                    </div>
                                ) : (
                                    `Room ${selectedRoom.roomNumber}`
                                )}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowRoomDetails(false);
                                    setEditingRoom(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                            <div className="text-sm text-gray-600">
                                {selectedRoom.roomType.type} Sharing • ₹{selectedRoom.roomType.basePrice}/bed
                            </div>
                            <div className="text-sm mt-1">
                                Occupancy: {selectedRoom.tenants.length}/{(() => {
                                    const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
                                    return bedsPerRoom[selectedRoom.roomType.type] || 1;
                                })()} beds
                            </div>
                        </div>
                        
                        {/* Room Actions */}
                        {!editingRoom ? (
                            <div className="flex space-x-2 mb-4">
                                <button
                                    onClick={() => handleEditRoom(selectedRoom.roomNumber)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                >
                                    <PencilSquareIcon className="w-4 h-4 inline mr-1" />
                                    Edit Room
                                </button>
                                <button
                                    onClick={handleDeleteRoom}
                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                >
                                    Delete Room
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-2 mb-4">
                                <button
                                    onClick={handleSaveRoomEdit}
                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingRoom(null)}
                                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        
                        {/* Current Tenants */}
                        {selectedRoom.tenants.length > 0 ? (
                            <div className="mb-4">
                                <h4 className="font-semibold mb-2">Current Tenants:</h4>
                                <div className="space-y-2">
                                    {selectedRoom.tenants.map((tenant) => (
                                        <div key={tenant._id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {tenant.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{tenant.name}</div>
                                                    {tenant.phone && <div className="text-sm text-gray-500">{tenant.phone}</div>}
                                                    <div className="text-xs text-gray-400">Bed: {tenant.bedId}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {tenant.phone && (
                                                    <button
                                                        onClick={() => window.open(`tel:${tenant.phone}`, '_self')}
                                                        className="text-green-500 hover:text-green-700 p-1"
                                                    >
                                                        <PhoneIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveTenant(tenant._id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4 p-4 bg-gray-50 rounded text-center text-gray-500">
                                No tenants in this room
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Note:</h4>
                <p className="text-sm text-blue-800">
                    Click on room numbers to view details, manage tenants, edit room numbers, or delete rooms. 
                    You can also edit pricing at <Link to={`/owner/edit-property/${propertyId}`} className="underline hover:text-blue-900">Edit Property</Link>.
                </p>
            </div>
        </div>
    );
};

export default RoomManagement;