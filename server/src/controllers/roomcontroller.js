// server/controllers/room.controller.js
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Property = require('../models/Property');

// @desc    Add a new room to a specific property
// @route   POST /api/rooms
// @access  Private (PG Owner)
exports.createRoom = async (req, res) => {
    const { propertyId, roomNumber, roomType, basePrice, maxBeds, gender } = req.body;

    // 1. Validation
    if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
    }

    // 2. Authorization & Property Check
    try {
        const property = await Property.findById(propertyId);
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Ensure the authenticated user owns this property
        if (property.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add rooms to this property' });
        }

        // 3. Create Room
        const room = new Room({
            propertyId,
            roomNumber,
            roomType,
            basePrice,
            maxBeds,
            gender,
            occupiedBeds: 0, 
            status: 'empty',
        });

        await room.save();
        
        // 4. Success
        res.status(201).json(room);

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Room number already exists in this property.' });
        }
        console.error("Room Creation Error:", err);
        res.status(500).json({ error: 'Failed to create room', details: err.message });
    }
};

// @desc    Get all rooms for a specific property
// @route   GET /api/rooms/:propertyId
// @access  Private (PG Owner)
exports.getRoomsByProperty = async (req, res) => {
    const { propertyId } = req.params;

    try {
        const property = await Property.findById(propertyId);
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Ensure the authenticated user owns this property
        if (property.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view rooms for this property' });
        }

        const rooms = await Room.find({ propertyId }).sort({ roomNumber: 1 });
        res.json(rooms);

    } catch (err) {
        console.error("Room Fetch Error:", err);
        res.status(500).json({ error: 'Failed to fetch rooms', details: err.message });
    }
};

exports.getAvailableRoomsForOwner = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { propertyId } = req.params;
        
        // If propertyId is provided, get rooms for specific property
        if (propertyId) {
            const property = await Property.findById(propertyId);
            if (!property || property.ownerId.toString() !== ownerId.toString()) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            
            const rooms = await Room.find({ propertyId }).populate('tenants.tenantId', 'name email');
            
            const roomsData = rooms.map(room => ({
                _id: room._id,
                roomNumber: room.roomNumber,
                capacity: room.maxBeds,
                currentOccupancy: room.occupiedBeds,
                sharingType: room.roomType,
                basePrice: room.basePrice,
                status: room.status,
                tenants: room.tenants,
                propertyId: room.propertyId,
                propertyTitle: property.title
            }));
            
            return res.json(roomsData);
        }
        
        // Get all available rooms for owner (existing logic for backward compatibility)
        const ownerProperties = await Property.find({ ownerId }).select('_id title');
        const propertyIds = ownerProperties.map(p => p._id);
        
        const rooms = await Room.find({ 
            propertyId: { $in: propertyIds }
        }).populate('propertyId', 'title');
        
        const availableRooms = rooms.filter(room => room.occupiedBeds < room.maxBeds).map(room => ({
            _id: room._id,
            roomNumber: room.roomNumber,
            capacity: room.maxBeds,
            currentOccupancy: room.occupiedBeds,
            sharingType: room.roomType,
            basePrice: room.basePrice,
            propertyId: room.propertyId._id,
            propertyTitle: room.propertyId.title
        }));
        
        res.json(availableRooms);

    } catch (err) {
        console.error("Fetch Available Rooms Error:", err);
        res.status(500).json({ error: 'Failed to fetch available rooms.' });
    }
};
// @desc    Get rooms for specific property (for room management page)
// @route   GET /api/rooms/property/:propertyId
// @access  Private (PG Owner)
exports.getRoomsForProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const ownerId = req.user._id;
        
        // Verify property ownership
        const property = await Property.findById(propertyId);
        if (!property || property.ownerId.toString() !== ownerId.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Get all rooms for this property with populated tenant data
        const rooms = await Room.find({ propertyId }).populate('tenants.tenantId', 'name email phone').sort({ roomNumber: 1 });
        
        const roomsData = rooms.map(room => ({
            _id: room._id,
            roomNumber: room.roomNumber,
            capacity: room.maxBeds,
            currentOccupancy: room.occupiedBeds,
            sharingType: room.roomType,
            basePrice: room.basePrice,
            status: room.status,
            tenants: room.tenants.map(tenant => ({
                _id: tenant.tenantId ? tenant.tenantId._id : tenant._id,
                name: tenant.name,
                phone: tenant.phone,
                email: tenant.email,
                bedId: tenant.bedId,
                joinDate: tenant.joinDate,
                status: tenant.status
            })) || [],
            propertyId: room.propertyId
        }));
        
        res.json(roomsData);
        
    } catch (err) {
        console.error('Get rooms for property error:', err);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

// @desc    Update room details
// @route   PUT /api/rooms/:roomId
// @access  Private (PG Owner)
exports.updateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { roomNumber, basePrice } = req.body;
        const ownerId = req.user._id;
        
        // Find the room and verify ownership
        const room = await Room.findById(roomId).populate('propertyId');
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        if (room.propertyId.ownerId.toString() !== ownerId.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Update room
        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            { roomNumber, basePrice },
            { new: true, runValidators: true }
        );
        
        res.json(updatedRoom);
        
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Room number already exists in this property' });
        }
        console.error('Update room error:', err);
        res.status(500).json({ error: 'Failed to update room' });
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:roomId
// @access  Private (PG Owner)
exports.deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const ownerId = req.user._id;
        
        // Find the room and verify ownership
        const room = await Room.findById(roomId).populate('propertyId');
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        if (room.propertyId.ownerId.toString() !== ownerId.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Check if room has tenants
        if (room.occupiedBeds > 0) {
            return res.status(400).json({ error: 'Cannot delete room with tenants. Remove all tenants first.' });
        }
        
        await Room.findByIdAndDelete(roomId);
        
        res.json({ message: 'Room deleted successfully' });
        
    } catch (err) {
        console.error('Delete room error:', err);
        res.status(500).json({ error: 'Failed to delete room' });
    }
};