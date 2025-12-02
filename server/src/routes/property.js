// server/routes/property.js
const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { createProperty, getMyProperties, getOwnerMetrics, getPublicProperties, getRoomRoster, getPropertyById, updateProperty, deleteProperty, assignTenant, removeTenant, updateRoom, getAvailableTenants, getPropertyNames, getAllProperties, updatePropertyStatus } = require('../controllers/propertycontroller');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/public', getPublicProperties);
router.get('/public/:id', (req, res, next) => {
    // Remove auth requirement for public property access
    req.user = null;
    next();
}, getPropertyById);
router.get('/names', getPropertyNames);
// Middleware group for all owner-specific routes
const ownerProtect = [protect, authorizeRoles('pg_owner')];

// POST /api/properties - Create a new property
router.post('/', ownerProtect, upload, createProperty);
router.get('/my', ownerProtect, getMyProperties);
router.get('/metrics/owner', ownerProtect, getOwnerMetrics);
router.get('/owner/roster', ownerProtect, getRoomRoster);
router.get('/owner', ownerProtect, getMyProperties);
router.get('/:id', ownerProtect, getPropertyById);
router.put('/:id', ownerProtect, updateProperty);
router.delete('/:id', ownerProtect, deleteProperty);
router.post('/:id/assign-tenant', ownerProtect, assignTenant);
router.delete('/:id/remove-tenant', ownerProtect, removeTenant);
router.put('/:id/update-room', ownerProtect, updateRoom);
router.get('/available-tenants', ownerProtect, getAvailableTenants);

// Admin routes
const adminProtect = [protect, authorizeRoles('super_admin', 'admin')];
router.get('/', adminProtect, getAllProperties);
router.put('/:id/status', adminProtect, updatePropertyStatus);


// Subscription routes
router.post('/subscribe', ownerProtect, async (req, res) => {
    try {
        const Subscription = require('../models/Subscription');
        const { plan, amount } = req.body;
        
        const planDurations = {
            free: 30,
            monthly: 30,
            sixMonths: 180,
            yearly: 365
        };
        
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + planDurations[plan]);
        
        const subscription = await Subscription.create({
            ownerId: req.user._id,
            plan,
            amount,
            endDate
        });
        
        res.status(201).json({ message: 'Subscription request submitted', subscription });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create subscription', error: error.message });
    }
});

module.exports = router;