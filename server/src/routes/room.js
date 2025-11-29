// server/routes/room.js
const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { 
    createRoom, 
    getRoomsByProperty,
    getAvailableRoomsForOwner
} = require('../controllers/roomcontroller'); 

const router = express.Router();
const ownerProtect = [protect, authorizeRoles('pg_owner')];

// 1. SPECIFIC ROUTE: Fetch available rooms (This uses the literal string 'available')
router.get('/available', ownerProtect, getAvailableRoomsForOwner); 

// 2. POST route for creating rooms
router.post('/', ownerProtect, createRoom);

// 3. GENERIC ROUTE: Fetch rooms by property ID (This uses a parameter)
router.get('/:propertyId', ownerProtect, getRoomsByProperty); 

module.exports = router;