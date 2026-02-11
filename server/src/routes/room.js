// server/routes/room.js
const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { 
    createRoom, 
    getRoomsByProperty,
    getAvailableRoomsForOwner,
    getRoomsForProperty,
    updateRoom,
    deleteRoom,
    bulkUpdateRooms
} = require('../controllers/roomcontroller'); 

const router = express.Router();
const ownerProtect = [protect, authorizeRoles('pg_owner')];

// 1. SPECIFIC ROUTE: Fetch available rooms (This uses the literal string 'available')
router.get('/available', ownerProtect, getAvailableRoomsForOwner);

// Owner rooms endpoint
router.get('/owner', ownerProtect, getAvailableRoomsForOwner); 

// 2. SPECIFIC ROUTE: Get rooms for property management page
router.get('/property/:propertyId', ownerProtect, getRoomsForProperty);

// 3. POST route for creating rooms
router.post('/', ownerProtect, createRoom);

// 3.1. PUT route for bulk updating rooms
router.put('/bulk-update', ownerProtect, bulkUpdateRooms);

// 4. Update room
router.put('/:roomId', ownerProtect, updateRoom);

// 5. Delete room
router.delete('/:roomId', ownerProtect, deleteRoom);

// 6. GENERIC ROUTE: Fetch rooms by property ID (This uses a parameter)
router.get('/:propertyId', ownerProtect, getRoomsByProperty); 

module.exports = router;