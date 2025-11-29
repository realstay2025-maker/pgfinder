const express = require('express');
const BookingRequest = require('../models/BookingRequest');
const Property = require('../models/Property');
const router = express.Router();

// Booking form submission
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, roomType, moveInDate, propertyId, propertyTitle } = req.body;
        
        // Get property owner
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        // Create booking request
        const bookingRequest = new BookingRequest({
            name, email, phone, roomType, moveInDate: new Date(moveInDate),
            propertyId, propertyTitle, ownerId: property.ownerId
        });
        
        await bookingRequest.save();
        res.status(200).json({ message: 'Booking request submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit booking request' });
    }
});

module.exports = router;