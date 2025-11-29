// server/controllers/room.controller.js
const Room = require('../models/Room');
const Property = require('../models/Property');

// @desc    Add a new room to a specific property
// @route   POST /api/rooms
// @access  Private (PG Owner)
exports.createRoom = async (req, res) => {
    const { propertyId, roomNumber, sharingType, basePrice, capacity } = req.body;

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
            sharingType,
            basePrice,
            capacity,
            currentOccupancy: 0, 
            status: 'available',
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
        
        // 1. Find properties owned by the user
        const ownerProperties = await Property.find({ ownerId }).select('_id');
        const propertyIds = ownerProperties.map(p => p._id);

        // 2. Find rooms in those properties that are not full
        const rooms = await Room.find({ 
            propertyId: { $in: propertyIds },
            $expr: { $lt: ["$currentOccupancy", "$capacity"] } // currentOccupancy < capacity
        })
        .select('roomNumber capacity currentOccupancy sharingType basePrice propertyId');
        
        res.json(rooms);

    } catch (err) {
        console.error("Fetch Available Rooms Error:", err);
        res.status(500).json({ error: 'Failed to fetch available rooms.' });
    }
};
// (Future routes for update/delete will go here)