import React, { useState, useEffect, useMemo } from 'react';
import { 
    HomeModernIcon, 
    UsersIcon, 
    ArrowPathIcon,
    BuildingOffice2Icon,
    UserIcon,
    PhoneIcon,
    ClipboardDocumentListIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    PlusIcon,
    TrashIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// API endpoint for the detailed room roster
const API_ROSTER = 'http://localhost:5000/api/properties/owner/roster';

const OwnerTenantRoster = () => {
    const { user } = useAuth();
    const [rosterData, setRosterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterOccupancy, setFilterOccupancy] = useState('all'); // 'all', 'occupied', 'vacant'
    // New state to hold the currently selected property ID for filtering
    const [selectedPropertyId, setSelectedPropertyId] = useState('all');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [tenantForm, setTenantForm] = useState({ name: '', phone: '', email: '', rent: '' });
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null); 

    const fetchRoster = async () => {
        if (!user || user.role !== 'pg_owner') {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ROSTER, config); 
            setRosterData(res.data);
            // Reset property filter if no data or if selected property disappears
            if (res.data.length === 0) {
                 setSelectedPropertyId('all');
            }
        } catch (err) {
            console.error("Fetch Roster Error:", err.response?.data?.error || err.message);
            
            let errorMessage = "Failed to load room roster. Check the /api/properties/owner/roster backend route.";
            if (err.response?.status === 404) {
                 errorMessage = "404 Error: The /api/properties/owner/roster endpoint is not found. Check your Express routing.";
            } else if (err.response?.status === 401) {
                errorMessage = "Authentication failed. Token is invalid or expired.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTenant = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const tenantData = { ...tenantForm };
            if (selectedRoomType.roomNumber) {
                tenantData.roomNumber = selectedRoomType.roomNumber;
            }
            
            await axios.post(`http://localhost:5000/api/properties/${selectedRoomType.propertyId}/assign-tenant`, {
                roomTypeIndex: selectedRoomType.index,
                tenantData
            }, config);
            
            setShowAssignModal(false);
            setTenantForm({ name: '', phone: '', email: '', rent: '' });
            fetchRoster();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to assign tenant');
        }
    };

    const handleRemoveTenant = async (propertyId, roomTypeIndex, tenantId) => {
        if (!confirm('Are you sure you want to remove this tenant?')) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/properties/${propertyId}/remove-tenant`, {
                data: { roomTypeIndex, tenantId },
                ...config
            });
            
            fetchRoster();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to remove tenant');
        }
    };

    const openAssignModal = (propertyId, roomTypeIndex, roomType, roomNumber = null) => {
        setSelectedRoomType({ propertyId, index: roomTypeIndex, roomNumber, ...roomType });
        setTenantForm({ ...tenantForm, rent: roomType.basePrice });
        setShowAssignModal(true);
    };

    const openRoomModal = (propertyId, roomTypeIndex, roomType, roomNumber) => {
        const roomTenants = roomType.tenants?.filter(t => t.roomNumber === roomNumber) || [];
        setSelectedRoom({ propertyId, roomTypeIndex, roomType, roomNumber, tenants: roomTenants });
        setShowRoomModal(true);
    };

    const handleEditRoom = (roomNumber) => {
        setEditingRoom({ originalNumber: roomNumber, newNumber: roomNumber });
    };

    const handleSaveRoomEdit = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            await axios.put(`http://localhost:5000/api/properties/${selectedRoom.propertyId}/update-room`, {
                roomTypeIndex: selectedRoom.roomTypeIndex,
                oldRoomNumber: editingRoom.originalNumber,
                newRoomNumber: editingRoom.newNumber
            }, config);
            
            setEditingRoom(null);
            setShowRoomModal(false);
            fetchRoster();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update room');
        }
    };

    const handleDeleteRoom = async () => {
        if (!confirm('Are you sure you want to delete this room? All tenants will be removed.')) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const property = rosterData.find(p => p._id === selectedRoom.propertyId);
            const updatedRoomTypes = [...property.roomTypes];
            
            // Remove all tenants from this room
            updatedRoomTypes[selectedRoom.roomTypeIndex].tenants = updatedRoomTypes[selectedRoom.roomTypeIndex].tenants.filter(
                tenant => tenant.roomNumber !== selectedRoom.roomNumber
            );
            
            // Decrease room count
            updatedRoomTypes[selectedRoom.roomTypeIndex].availableCount = Math.max(0, updatedRoomTypes[selectedRoom.roomTypeIndex].availableCount - 1);
            
            await axios.put(`http://localhost:5000/api/properties/${selectedRoom.propertyId}`, {
                roomTypes: updatedRoomTypes
            }, config);
            
            setShowRoomModal(false);
            fetchRoster();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete room');
        }
    };

    useEffect(() => {
        fetchRoster();
    }, [user]);

    // Process real property data for display
    const processedData = useMemo(() => {
        const propertiesToProcess = selectedPropertyId === 'all'
            ? rosterData
            : rosterData.filter(p => p._id === selectedPropertyId);

        return propertiesToProcess;
    }, [rosterData, selectedPropertyId]);

    // Calculate bed-based metrics
    const bedMetrics = useMemo(() => {
        const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
        let totalBeds = 0;
        let occupiedBeds = 0;
        let totalRooms = 0;

        processedData.forEach(property => {
            (property.roomTypes || []).forEach(roomType => {
                const roomCount = roomType.availableCount || 0;
                const bedsInType = roomCount * (bedsPerRoom[roomType.type] || 1);
                totalBeds += bedsInType;
                occupiedBeds += roomType.occupiedBeds || 0;
                totalRooms += roomCount;
            });
        });

        return {
            totalBeds,
            occupiedBeds,
            availableBeds: totalBeds - occupiedBeds,
            occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
            totalRooms
        };
    }, [processedData]);


    const renderStatusBadge = (status) => {
        if (status === 'occupied') {
            return (
                <span className="inline-flex items-center px-3 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    Occupied
                </span>
            );
        }
        if (status === 'vacant') {
            return (
                <span className="inline-flex items-center px-3 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                    Available
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg">
                Unknown
            </span>
        );
    };


    if (loading) {
        return (
            <div className="p-8 text-xl text-center flex items-center justify-center min-h-[400px]">
                <ArrowPathIcon className="w-8 h-8 mr-3 animate-spin text-blue-800" /> Loading Room Roster...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header Section */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                <BuildingOffice2Icon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    Room & Tenant Management
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">Manage your properties and tenant assignments</p>
                            </div>
                        </div>

                        {/* Property Selector */}
                        <div className="lg:w-80">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Filter by Property
                            </label>
                            <select
                                value={selectedPropertyId}
                                onChange={(e) => setSelectedPropertyId(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 shadow-sm"
                            >
                                <option value="all">🏢 All Properties ({rosterData.length})</option>
                                {rosterData.map(property => (
                                    <option key={property._id} value={property._id}>
                                        🏠 {property.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
            
            {error && (
                <div className="p-4 mb-4 text-red-700 border-l-4 border-red-500 bg-red-100/50 rounded-md shadow-sm">
                    <p className="font-semibold">Data Load Error:</p>
                    <p className="text-sm">{error}</p>
                    <button onClick={fetchRoster} className="mt-2 text-xs text-blue-800 hover:underline">Click to Reload</button>
                </div>
            )}

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Beds Card */}
                    <div className="group hover:scale-105 transition-all duration-300">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <HomeModernIcon className="w-8 h-8 text-blue-100" />
                                    <span className="text-xs font-medium bg-blue-400/30 px-2 py-1 rounded-full">
                                        Total
                                    </span>
                                </div>
                                <p className="text-blue-100 text-sm font-medium">Total Beds</p>
                                <p className="text-3xl font-bold mt-1">{bedMetrics.totalBeds}</p>
                            </div>
                        </div>
                    </div>

                    {/* Occupied Beds Card */}
                    <div className="group hover:scale-105 transition-all duration-300">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <UsersIcon className="w-8 h-8 text-red-100" />
                                    <span className="text-xs font-medium bg-red-400/30 px-2 py-1 rounded-full">
                                        Occupied
                                    </span>
                                </div>
                                <p className="text-red-100 text-sm font-medium">Occupied Beds</p>
                                <p className="text-3xl font-bold mt-1">{bedMetrics.occupiedBeds}</p>
                            </div>
                        </div>
                    </div>

                    {/* Available Beds Card */}
                    <div className="group hover:scale-105 transition-all duration-300">
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <ClipboardDocumentListIcon className="w-8 h-8 text-emerald-100" />
                                    <span className="text-xs font-medium bg-emerald-400/30 px-2 py-1 rounded-full">
                                        Available
                                    </span>
                                </div>
                                <p className="text-emerald-100 text-sm font-medium">Available Beds</p>
                                <p className="text-3xl font-bold mt-1">{bedMetrics.availableBeds}</p>
                            </div>
                        </div>
                    </div>

                    {/* Occupancy Rate Card */}
                    <div className="group hover:scale-105 transition-all duration-300">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-8 h-8 rounded-full bg-purple-100/20 flex items-center justify-center">
                                        <span className="text-sm font-bold">%</span>
                                    </div>
                                    <span className="text-xs font-medium bg-purple-400/30 px-2 py-1 rounded-full">
                                        Rate
                                    </span>
                                </div>
                                <p className="text-purple-100 text-sm font-medium">Occupancy Rate</p>
                                <p className="text-3xl font-bold mt-1">{bedMetrics.occupancyRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Room Overview Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <span className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></span>
                                    Room Overview
                                </h2>
                                {selectedPropertyId !== 'all' && (
                                    <p className="text-gray-600 text-sm mt-1 ml-5">
                                        Showing data for: <span className="font-semibold">{rosterData.find(p => p._id === selectedPropertyId)?.title}</span>
                                    </p>
                                )}
                            </div>
                            
                            <div className="text-sm text-gray-600">
                                Showing bed availability data from your properties
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {processedData.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Properties Found</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Add properties and configure room types to see bed availability data.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {processedData.map(property => (
                                    <div key={property._id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-gray-800">{property.title}</h3>
                                            <span className="text-sm text-gray-600">
                                                {property.address?.city}, {property.address?.state}
                                            </span>
                                        </div>
                                        
                                        {property.roomTypes && property.roomTypes.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {property.roomTypes.map((roomType, index) => {
                                                    const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
                                                    const totalBeds = (roomType.availableCount || 0) * (bedsPerRoom[roomType.type] || 1);
                                                    const occupiedBeds = roomType.tenants?.length || 0;
                                                    const availableBeds = totalBeds - occupiedBeds;
                                                    
                                                    return (
                                                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="font-semibold text-gray-800 capitalize">
                                                                    {roomType.type} Sharing
                                                                </h4>
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                                    ₹{roomType.basePrice}/bed
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="space-y-2 text-sm mb-4">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Total Beds:</span>
                                                                    <span className="font-medium">{totalBeds}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Occupied:</span>
                                                                    <span className="font-medium text-red-600">{occupiedBeds}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Available:</span>
                                                                    <span className="font-medium text-green-600">{availableBeds}</span>
                                                                </div>
                                                                
                                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                                    <div 
                                                                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                                        style={{ width: `${totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Room Numbers Grid */}
                                                            <div className="mb-4">
                                                                <h5 className="text-xs font-semibold text-gray-700 mb-2">Rooms ({roomType.availableCount || 0})</h5>
                                                                <div className="grid grid-cols-4 gap-2">
                                                                    {roomType.rooms?.map(room => (
                                                                        <button
                                                                            key={room.roomNumber}
                                                                            onClick={() => openRoomModal(property._id, index, roomType, room.roomNumber)}
                                                                            className={`p-2 rounded text-xs font-medium transition ${
                                                                                room.status === 'full' ? 'bg-red-100 text-red-800 border border-red-300' :
                                                                                room.status === 'partial' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                                                                'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                                                                            }`}
                                                                        >
                                                                            <div>{room.roomNumber}</div>
                                                                            <div className="text-xs">{room.occupiedBeds}/{room.maxBeds}</div>
                                                                            {room.tenants.length > 0 && (
                                                                                <div className="flex -space-x-1 mt-1 justify-center">
                                                                                    {room.tenants.slice(0, 2).map(tenant => (
                                                                                        <div key={tenant._id} className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border border-white">
                                                                                            {tenant.name.charAt(0)}
                                                                                        </div>
                                                                                    ))}
                                                                                    {room.tenants.length > 2 && (
                                                                                        <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs border border-white">
                                                                                            +
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    )) || (
                                                                        (() => {
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
                                                                                        onClick={() => openRoomModal(property._id, index, roomType, roomNumber)}
                                                                                        className={`p-2 rounded text-xs font-medium transition ${
                                                                                            isFull ? 'bg-red-100 text-red-800 border border-red-300' :
                                                                                            isOccupied ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                                                                            'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                                                                                        }`}
                                                                                    >
                                                                                        <div>{roomNumber}</div>
                                                                                        <div className="text-xs">{roomTenants.length}/{maxBeds}</div>
                                                                                    </button>
                                                                                );
                                                                            }
                                                                            
                                                                            return rooms;
                                                                        })()
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                No room types configured for this property.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Room Details Modal */}
            {showRoomModal && selectedRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
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
                                    setShowRoomModal(false);
                                    setEditingRoom(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-2">
                                {selectedRoom.roomType.type} Sharing • ₹{selectedRoom.roomType.basePrice}/bed
                            </div>
                            <div className="text-sm">
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
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center"
                                >
                                    <PencilSquareIcon className="w-4 h-4 mr-1" />
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
                        {selectedRoom.tenants.length > 0 && (
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
                                                    onClick={() => {
                                                        handleRemoveTenant(selectedRoom.propertyId, selectedRoom.roomTypeIndex, tenant._id);
                                                        setShowRoomModal(false);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Add Tenant Button */}
                        {(() => {
                            const bedsPerRoom = { single: 1, double: 2, triple: 3, quad: 4 };
                            const maxBeds = bedsPerRoom[selectedRoom.roomType.type] || 1;
                            const hasSpace = selectedRoom.tenants.length < maxBeds;
                            
                            return hasSpace ? (
                                <button
                                    onClick={() => {
                                        setShowRoomModal(false);
                                        openAssignModal(selectedRoom.propertyId, selectedRoom.roomTypeIndex, selectedRoom.roomType, selectedRoom.roomNumber);
                                    }}
                                    className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition flex items-center justify-center"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add Tenant to This Room
                                </button>
                            ) : (
                                <div className="text-center text-gray-500 py-2">
                                    Room is full
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
            
            {/* Assign Tenant Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold mb-4">
                            Assign Tenant to {selectedRoomType?.roomNumber ? `Room ${selectedRoomType.roomNumber}` : `${selectedRoomType?.type} Sharing`}
                        </h3>
                        <form onSubmit={handleAssignTenant} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={tenantForm.name}
                                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={tenantForm.phone}
                                    onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={tenantForm.email}
                                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹)</label>
                                <input
                                    type="number"
                                    value={tenantForm.rent}
                                    onChange={(e) => setTenantForm({ ...tenantForm, rent: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                                >
                                    Assign Tenant
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerTenantRoster;